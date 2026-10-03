import { ClassSeries, CalendarEvent, ImportPreviewResult, TimetableImportJSON, ExamImportJSON } from '../types';

export const CANONICAL_TIMETABLE_PROMPT = `Convert the timetable I provide into the exact JSON format specified below.

IMPORTANT OUTPUT RULES:
1. Return ONLY valid JSON.
2. Do NOT write any explanation before or after the JSON.
3. Do NOT use Markdown code fences such as \`\`\`json.
4. Do NOT write phrases such as "Here is the JSON", "Sure", "I found", or anything else.
5. The first character of your response must be { and the last character must be }.
6. Do not add comments inside the JSON.
7. Use exactly the field names and structure specified below.
8. Do not invent information. If a field cannot be determined from the timetable, use null.
9. Preserve the information from the timetable as accurately as possible.
10. If the timetable contains multiple classes for the same course, create separate class objects for each recurring schedule.
11. If a class repeats weekly, use "weekly" recurrence.
12. Use 24-hour time in HH:MM format.
13. Dates must use YYYY-MM-DD format.
14. If the timetable does not provide a start or end date, use null.
15. The JSON must be syntactically valid and directly importable by a mobile application.

OUTPUT FORMAT:

{
  "type": "timetable",
  "version": "1.0",
  "classes": [
    {
      "course": "Course name",
      "day": "Monday",
      "start_time": "10:00",
      "end_time": "11:00",
      "room": "Room number or null",
      "start_date": "YYYY-MM-DD or null",
      "end_date": "YYYY-MM-DD or null",
      "recurrence": "weekly"
    }
  ]
}

DAY VALUES MUST BE ONE OF:
"Monday"
"Tuesday"
"Wednesday"
"Thursday"
"Friday"
"Saturday"
"Sunday"

RECURRENCE VALUES:
"weekly" for classes that repeat every week.
"none" for a one-time class.

If the timetable contains information that does not fit into the schema, do not create additional fields. Only use the fields specified above.

Now analyze the timetable I provide and return ONLY the JSON object.`;

export const CANONICAL_EXAM_PROMPT = `Convert the exam schedule I provide into the exact JSON format specified below.

IMPORTANT OUTPUT RULES:
1. Return ONLY valid JSON.
2. Do NOT write any explanation before or after the JSON.
3. Do NOT use Markdown code fences such as \`\`\`json.
4. Do NOT write phrases such as "Here is the JSON", "Sure", "I found", or anything else.
5. The first character of your response must be { and the last character must be }.
6. Do not add comments inside the JSON.
7. Use exactly the field names and structure specified below.
8. Do not invent information. If a field cannot be determined from the exam schedule, use null.
9. Preserve the information from the exam schedule as accurately as possible.
10. Use 24-hour time in HH:MM format.
11. Dates must use YYYY-MM-DD format.
12. The JSON must be syntactically valid and directly importable by a mobile application.

OUTPUT FORMAT:

{
  "type": "exam_schedule",
  "version": "1.0",
  "exams": [
    {
      "course": "Course name",
      "date": "YYYY-MM-DD",
      "start_time": "10:00",
      "end_time": "13:00",
      "room": "Room number or null"
    }
  ]
}

If the exam schedule does not provide an end time, use null.

If the exam schedule does not provide a room, use null.

If the exam schedule contains information that does not fit into the schema, do not create additional fields. Only use the fields specified above.

Now analyze the exam schedule I provide and return ONLY the JSON object.`;

const VALID_WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function timeToMinutes(timeStr: string): number {
  const parts = timeStr.split(':');
  if (parts.length < 2) return 0;
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

export function isValidTimeFormat(t: string): boolean {
  if (typeof t !== 'string') return false;
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(t.trim());
}

export function isValidDateFormat(d: string): boolean {
  if (typeof d !== 'string') return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(d.trim());
}

// Clean json string if the external AI wrapped with markdown fences or extra whitespace
export function sanitizeRawJson(rawText: string): string {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```')) {
    // Remove markdown fence
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '').trim();
  }
  // If there are leading characters before first '{'
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return cleaned;
}

export function validateAndPreviewImport(
  rawJsonString: string,
  existingClasses: ClassSeries[],
  existingEvents: CalendarEvent[]
): ImportPreviewResult {
  const cleaned = sanitizeRawJson(rawJsonString);
  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err: any) {
    return {
      valid: false,
      errors: [`Invalid JSON syntax: ${err.message}. Please verify the file formatting.`],
      type: 'timetable',
      newCount: 0,
      duplicateCount: 0,
      conflictCount: 0,
      items: []
    };
  }

  if (!parsed || typeof parsed !== 'object') {
    return {
      valid: false,
      errors: ['Root JSON must be an object with "type" and "version".'],
      type: 'timetable',
      newCount: 0,
      duplicateCount: 0,
      conflictCount: 0,
      items: []
    };
  }

  // Check type
  if (parsed.type === 'timetable') {
    return validateTimetableImport(parsed as TimetableImportJSON, existingClasses);
  } else if (parsed.type === 'exam_schedule') {
    return validateExamImport(parsed as ExamImportJSON, existingEvents);
  } else {
    return {
      valid: false,
      errors: [`Unsupported import type "${parsed.type}". Supported types are "timetable" and "exam_schedule".`],
      type: 'timetable',
      newCount: 0,
      duplicateCount: 0,
      conflictCount: 0,
      items: []
    };
  }
}

function validateTimetableImport(
  data: TimetableImportJSON,
  existingClasses: ClassSeries[]
): ImportPreviewResult {
  const errors: string[] = [];
  if (!data.version) {
    errors.push('Missing "version" field in timetable JSON.');
  }
  if (!Array.isArray(data.classes)) {
    errors.push('"classes" must be an array of class objects.');
    return {
      valid: false,
      errors,
      type: 'timetable',
      newCount: 0,
      duplicateCount: 0,
      conflictCount: 0,
      items: []
    };
  }

  const items: ImportPreviewResult['items'] = [];
  let newCount = 0;
  let duplicateCount = 0;
  let conflictCount = 0;

  data.classes.forEach((c, index) => {
    const classNum = index + 1;
    if (!c.course || typeof c.course !== 'string' || !c.course.trim()) {
      errors.push(`"course" is missing or invalid for class #${classNum}.`);
    }
    if (!c.day || !VALID_WEEKDAYS.includes(c.day)) {
      errors.push(`"day" must be one of [${VALID_WEEKDAYS.join(', ')}] for class #${classNum} ("${c.course || 'Unknown'}"). Got "${c.day}".`);
    }
    if (!c.start_time || !isValidTimeFormat(c.start_time)) {
      errors.push(`"start_time" is missing or not in HH:MM 24-hr format for class #${classNum} ("${c.course || 'Unknown'}").`);
    }
    if (!c.end_time || !isValidTimeFormat(c.end_time)) {
      errors.push(`"end_time" is missing or not in HH:MM 24-hr format for class #${classNum} ("${c.course || 'Unknown'}").`);
    }
    if (c.start_time && c.end_time && isValidTimeFormat(c.start_time) && isValidTimeFormat(c.end_time)) {
      if (timeToMinutes(c.start_time) >= timeToMinutes(c.end_time)) {
        errors.push(`"start_time" (${c.start_time}) must be earlier than "end_time" (${c.end_time}) for class #${classNum}.`);
      }
    }
    if (c.start_date && !isValidDateFormat(c.start_date)) {
      errors.push(`"start_date" must be in YYYY-MM-DD format for class #${classNum}.`);
    }
    if (c.end_date && !isValidDateFormat(c.end_date)) {
      errors.push(`"end_date" must be in YYYY-MM-DD format for class #${classNum}.`);
    }

    if (errors.length > 0) return;

    // Check duplicate: same course, day, start_time
    const isDuplicate = existingClasses.some(
      ec => ec.courseName.toLowerCase().trim() === c.course.toLowerCase().trim() &&
            ec.dayOfWeek === c.day &&
            ec.startTime === c.start_time
    );

    // Check conflict: overlaps on same day
    const cStart = timeToMinutes(c.start_time);
    const cEnd = timeToMinutes(c.end_time);
    const conflicting = existingClasses.find(ec => {
      if (ec.dayOfWeek !== c.day) return false;
      const ecStart = timeToMinutes(ec.startTime);
      const ecEnd = timeToMinutes(ec.endTime);
      // Overlap condition: max(start1, start2) < min(end1, end2)
      return Math.max(cStart, ecStart) < Math.min(cEnd, ecEnd);
    });

    let status: 'new' | 'duplicate' | 'conflict' = 'new';
    let conflictDetail: string | undefined;

    if (isDuplicate) {
      status = 'duplicate';
      duplicateCount++;
    } else if (conflicting) {
      status = 'conflict';
      conflictDetail = `Overlaps with existing class: ${conflicting.courseName} (${conflicting.startTime}–${conflicting.endTime})`;
      conflictCount++;
    } else {
      newCount++;
    }

    items.push({
      id: `preview-class-${index}`,
      title: c.course,
      subtitle: `${c.day} • Room: ${c.room || 'TBD'}`,
      time: `${c.start_time} – ${c.end_time}`,
      status,
      conflictDetail,
      payload: c
    });
  });

  return {
    valid: errors.length === 0,
    errors,
    type: 'timetable',
    newCount,
    duplicateCount,
    conflictCount,
    items
  };
}

function validateExamImport(
  data: ExamImportJSON,
  existingEvents: CalendarEvent[]
): ImportPreviewResult {
  const errors: string[] = [];
  if (!data.version) {
    errors.push('Missing "version" field in exam schedule JSON.');
  }
  if (!Array.isArray(data.exams)) {
    errors.push('"exams" must be an array of exam objects.');
    return {
      valid: false,
      errors,
      type: 'exam_schedule',
      newCount: 0,
      duplicateCount: 0,
      conflictCount: 0,
      items: []
    };
  }

  const items: ImportPreviewResult['items'] = [];
  let newCount = 0;
  let duplicateCount = 0;
  let conflictCount = 0;

  data.exams.forEach((e, index) => {
    const examNum = index + 1;
    if (!e.course || typeof e.course !== 'string' || !e.course.trim()) {
      errors.push(`"course" is missing or invalid for exam #${examNum}.`);
    }
    if (!e.date || !isValidDateFormat(e.date)) {
      errors.push(`"date" must be in YYYY-MM-DD format for exam #${examNum} ("${e.course || 'Unknown'}").`);
    }
    if (!e.start_time || !isValidTimeFormat(e.start_time)) {
      errors.push(`"start_time" is missing or not in HH:MM 24-hr format for exam #${examNum}.`);
    }
    if (e.end_time && !isValidTimeFormat(e.end_time)) {
      errors.push(`"end_time" must be in HH:MM format for exam #${examNum}.`);
    }

    if (errors.length > 0) return;

    // Check duplicate
    const isDuplicate = existingEvents.some(
      ee => ee.type === 'EXAM' &&
            ee.title.toLowerCase().includes(e.course.toLowerCase().trim()) &&
            ee.date === e.date &&
            ee.startTime === e.start_time
    );

    let status: 'new' | 'duplicate' | 'conflict' = 'new';
    if (isDuplicate) {
      status = 'duplicate';
      duplicateCount++;
    } else {
      newCount++;
    }

    items.push({
      id: `preview-exam-${index}`,
      title: `${e.course} Exam`,
      subtitle: `Date: ${e.date} • Room: ${e.room || 'TBD'}`,
      time: e.end_time ? `${e.start_time} – ${e.end_time}` : e.start_time,
      status,
      payload: e
    });
  });

  return {
    valid: errors.length === 0,
    errors,
    type: 'exam_schedule',
    newCount,
    duplicateCount,
    conflictCount,
    items
  };
}
