import { getAccessToken } from './googleAuth';

export interface EmailTimetableSuggestion {
  id: string;
  emailId: string;
  emailSubject: string;
  emailFrom: string;
  emailDate: string;
  emailSnippet: string;
  actionType: 'NEW_CLASS' | 'RESCHEDULE' | 'CANCEL' | 'EXAM';
  courseName: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  date?: string; // for one-off cancellation or exam
  startTime: string;
  endTime: string;
  room: string;
  notes: string;
}

interface GmailMessageHeader {
  name: string;
  value: string;
}

interface GmailMessagePart {
  mimeType: string;
  body: {
    data?: string;
  };
  parts?: GmailMessagePart[];
}

interface GmailMessageDetail {
  id: string;
  snippet: string;
  internalDate: string;
  payload: {
    headers: GmailMessageHeader[];
    parts?: GmailMessagePart[];
    body?: {
      data?: string;
    };
  };
}

// Decode base64url string safely
function decodeBase64(input: string): string {
  try {
    const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    return decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch {
    return '';
  }
}

function extractEmailBodyText(payload: GmailMessageDetail['payload']): string {
  if (payload.body?.data) {
    return decodeBase64(payload.body.data);
  }
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return decodeBase64(part.body.data);
      }
    }
    for (const part of payload.parts) {
      if (part.mimeType === 'text/html' && part.body?.data) {
        const decoded = decodeBase64(part.body.data);
        return decoded.replace(/<[^>]+>/g, ' ');
      }
    }
  }
  return '';
}

// Heuristic pattern extractor for academic schedule announcements
function parseTimetableSuggestion(detail: GmailMessageDetail): EmailTimetableSuggestion | null {
  const headers = detail.payload.headers;
  const subject = headers.find(h => h.name.toLowerCase() === 'subject')?.value || 'No Subject';
  const from = headers.find(h => h.name.toLowerCase() === 'from')?.value || 'Unknown Sender';
  const dateHeader = headers.find(h => h.name.toLowerCase() === 'date')?.value || '';
  
  const bodyText = extractEmailBodyText(detail.payload) || detail.snippet || '';
  const fullText = `${subject} ${bodyText}`.toLowerCase();

  // Check relevance
  const relevantKeywords = ['class', 'lecture', 'timetable', 'schedule', 'exam', 'quiz', 'rescheduled', 'cancelled', 'hall', 'room', 'lt-', 'lh-'];
  const hasKeyword = relevantKeywords.some(kw => fullText.includes(kw));
  if (!hasKeyword) return null;

  // Determine action type
  let actionType: EmailTimetableSuggestion['actionType'] = 'NEW_CLASS';
  if (fullText.includes('cancel') || fullText.includes('cancelled') || fullText.includes('no class')) {
    actionType = 'CANCEL';
  } else if (fullText.includes('reschedule') || fullText.includes('moved to') || fullText.includes('shifted to') || fullText.includes('postponed')) {
    actionType = 'RESCHEDULE';
  } else if (fullText.includes('exam') || fullText.includes('quiz') || fullText.includes('midterm') || fullText.includes('test')) {
    actionType = 'EXAM';
  }

  // Detect day of week
  const days: EmailTimetableSuggestion['dayOfWeek'][] = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];
  let detectedDay: EmailTimetableSuggestion['dayOfWeek'] = 'Monday';
  for (const day of days) {
    if (fullText.includes(day.toLowerCase())) {
      detectedDay = day;
      break;
    }
  }

  // Detect room (e.g., LH-1, LH-2, LT-1, LT-2, Hall 3, Room 102)
  const roomMatch = fullText.match(/\b(lh-?\s*\d+|lt-?\s*\d+|room\s*\d+|hall\s*\d+|lab\s*\d+)\b/i);
  const detectedRoom = roomMatch ? roomMatch[0].toUpperCase().replace(/\s+/, '-') : 'LH-1';

  // Detect time patterns like "10:00 - 11:00", "10am to 11am", "2:00 PM"
  const timeRangeMatch = fullText.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*(?:-|to)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
  let startTime = '10:00';
  let endTime = '11:00';

  if (timeRangeMatch) {
    const normalizeTime = (raw: string) => {
      const isPm = /pm/i.test(raw);
      const isAm = /am/i.test(raw);
      const digits = raw.replace(/[^\d:]/g, '');
      let [h, m] = digits.split(':');
      let hourNum = parseInt(h || '10', 10);
      if (isPm && hourNum < 12) hourNum += 12;
      if (isAm && hourNum === 12) hourNum = 0;
      return `${String(hourNum).padStart(2, '0')}:${(m || '00').padStart(2, '0')}`;
    };
    try {
      startTime = normalizeTime(timeRangeMatch[1]);
      endTime = normalizeTime(timeRangeMatch[2]);
    } catch {
      // keep defaults
    }
  }

  // Detect course name from subject or body
  let detectedCourse = subject.replace(/^(re:|fwd:|notice:|urgent:)\s*/i, '').trim();
  if (detectedCourse.length > 35) {
    const courseMatch = detectedCourse.match(/([a-zA-Z\s]{3,20}(?:biology|physics|chemistry|math|data structures|algorithms|computer science|mechanics|calculus|english))/i);
    if (courseMatch) {
      detectedCourse = courseMatch[0].trim();
    } else {
      detectedCourse = detectedCourse.substring(0, 32) + '...';
    }
  }

  // Format email date
  let formattedDate = '';
  try {
    const parsedDate = new Date(parseInt(detail.internalDate, 10) || dateHeader);
    formattedDate = parsedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    formattedDate = 'Recent';
  }

  return {
    id: `sug-${detail.id}`,
    emailId: detail.id,
    emailSubject: subject,
    emailFrom: from.replace(/<[^>]+>/g, '').trim(),
    emailDate: formattedDate,
    emailSnippet: detail.snippet,
    actionType,
    courseName: detectedCourse || 'Course Update',
    dayOfWeek: detectedDay,
    startTime,
    endTime,
    room: detectedRoom,
    notes: `Extracted from email: "${subject}"`
  };
}

export async function fetchRecentEmailSuggestions(): Promise<EmailTimetableSuggestion[]> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Please sign in with Google to read your emails.');
  }

  // Fetch recent messages matching timetable or schedule queries
  const query = encodeURIComponent('subject:(class OR lecture OR timetable OR schedule OR exam OR quiz OR test OR cancelled OR rescheduled OR "no class" OR room)');
  const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${query}&maxResults=10`;

  const listRes = await fetch(listUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    }
  });

  if (!listRes.ok) {
    if (listRes.status === 401) {
      throw new Error('Gmail authorization expired. Please sign in again.');
    }
    const errText = await listRes.text();
    throw new Error(`Gmail API error: ${errText || listRes.statusText}`);
  }

  const listData = await listRes.json();
  const messages: Array<{ id: string }> = listData.messages || [];

  if (messages.length === 0) {
    // If specific query returns nothing, try fetching the last 8 messages in inbox to scan
    const fallbackUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=8`;
    const fallbackRes = await fetch(fallbackUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    });
    if (fallbackRes.ok) {
      const fallbackData = await fallbackRes.json();
      const fallbackList = fallbackData.messages || [];
      return await fetchDetailsAndParse(fallbackList, token);
    }
    return [];
  }

  return await fetchDetailsAndParse(messages, token);
}

async function fetchDetailsAndParse(messages: Array<{ id: string }>, token: string): Promise<EmailTimetableSuggestion[]> {
  const suggestions: EmailTimetableSuggestion[] = [];

  // Fetch details for up to 8 messages concurrently
  const fetchPromises = messages.slice(0, 8).map(async (msg) => {
    try {
      const detailUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`;
      const res = await fetch(detailUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      });
      if (res.ok) {
        const detail: GmailMessageDetail = await res.json();
        const parsed = parseTimetableSuggestion(detail);
        if (parsed) {
          suggestions.push(parsed);
        }
      }
    } catch (e) {
      console.warn('Failed to parse message', msg.id, e);
    }
  });

  await Promise.all(fetchPromises);
  return suggestions;
}
