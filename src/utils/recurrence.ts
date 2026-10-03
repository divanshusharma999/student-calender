import { ClassSeries, ClassOverride, ClassOccurrence, CalendarEvent, Task } from '../types';

export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

export function getDayOfWeekName(dateStr: string): 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' {
  const parts = dateStr.split('-');
  const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  return WEEKDAYS[date.getDay()];
}

export function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseYYYYMMDD(dateStr: string): Date {
  const parts = dateStr.split('-');
  return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
}

// Generate occurrences for a specific date
export function getClassOccurrencesForDate(
  dateStr: string,
  classSeriesList: ClassSeries[],
  overridesList: ClassOverride[]
): ClassOccurrence[] {
  const dayName = getDayOfWeekName(dateStr);
  const occurrences: ClassOccurrence[] = [];

  for (const series of classSeriesList) {
    // Check if matches weekday
    if (series.dayOfWeek !== dayName) continue;

    // Check date range if specified
    if (series.startDate && dateStr < series.startDate) continue;
    if (series.endDate && dateStr > series.endDate) continue;

    // Check if there is an override for this occurrence date
    const override = overridesList.find(o => o.classSeriesId === series.id && o.originalDate === dateStr);

    if (override && override.cancelled) {
      continue; // Occurrence cancelled
    }

    occurrences.push({
      occurrenceId: `${series.id}_${dateStr}`,
      seriesId: series.id,
      courseId: series.courseId,
      courseName: series.courseName,
      date: dateStr,
      startTime: override?.newStartTime || series.startTime,
      endTime: override?.newEndTime || series.endTime,
      room: override?.newRoom || series.room,
      color: series.color || '#10b981',
      note: override?.note,
      isOverride: !!override
    });
  }

  // Sort occurrences by start time
  return occurrences.sort((a, b) => a.startTime.localeCompare(b.startTime));
}

// Generate occurrences for a date range (e.g. month or week)
export function getClassOccurrencesForRange(
  startDateStr: string,
  endDateStr: string,
  classSeriesList: ClassSeries[],
  overridesList: ClassOverride[]
): Map<string, ClassOccurrence[]> {
  const map = new Map<string, ClassOccurrence[]>();
  const curr = parseYYYYMMDD(startDateStr);
  const end = parseYYYYMMDD(endDateStr);

  while (curr <= end) {
    const dStr = formatDateToYYYYMMDD(curr);
    const occs = getClassOccurrencesForDate(dStr, classSeriesList, overridesList);
    if (occs.length > 0) {
      map.set(dStr, occs);
    }
    curr.setDate(curr.getDate() + 1);
  }

  return map;
}

// Get dates in a week given any date
export function getWeekDates(anchorDateStr: string, firstDayOfWeek: 'monday' | 'sunday' = 'monday'): string[] {
  const anchor = parseYYYYMMDD(anchorDateStr);
  const day = anchor.getDay(); // 0 is Sunday, 1 is Monday
  const diff = firstDayOfWeek === 'monday' 
    ? (day === 0 ? -6 : 1 - day)
    : -day;

  const startOfWeek = new Date(anchor);
  startOfWeek.setDate(anchor.getDate() + diff);

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    dates.push(formatDateToYYYYMMDD(d));
  }
  return dates;
}

// Get all dates in a month grid (including padding for full weeks)
export function getMonthGrid(year: number, month: number, firstDayOfWeek: 'monday' | 'sunday' = 'monday'): Date[] {
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startDay = firstDayOfMonth.getDay();
  const leadingOffset = firstDayOfWeek === 'monday'
    ? (startDay === 0 ? 6 : startDay - 1)
    : startDay;

  const gridStart = new Date(firstDayOfMonth);
  gridStart.setDate(firstDayOfMonth.getDate() - leadingOffset);

  const days: Date[] = [];
  const current = new Date(gridStart);

  // We show 35 or 42 cells (5 or 6 weeks)
  while (days.length < 42) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
    if (days.length >= 35 && current.getMonth() !== month && current.getDay() === (firstDayOfWeek === 'monday' ? 1 : 0)) {
      break;
    }
  }

  return days;
}

// Check if two time ranges overlap
export function doTimesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
  return start1 < end2 && start2 < end1;
}
