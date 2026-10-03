export type Language = 'en' | 'hi';

export type EventType = 'EXAM' | 'TEST' | 'ASSIGNMENT_DEADLINE' | 'ACADEMIC_EVENT' | 'OTHER';

export type RecurrenceType = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export type TransactionType = 'INCOME' | 'EXPENSE';

export type PaymentMethod = 'UPI' | 'CASH';

export type BudgetPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';

export interface Course {
  id: string;
  name: string;
  code?: string;
  instructor?: string;
  roomDefault?: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClassSeries {
  id: string;
  courseId: string;
  courseName: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; // HH:MM (24-hr)
  endTime: string;   // HH:MM (24-hr)
  room?: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  recurrenceType: 'weekly' | 'none';
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClassOverride {
  id: string;
  classSeriesId: string;
  originalDate: string; // YYYY-MM-DD
  newStartTime?: string;
  newEndTime?: string;
  newRoom?: string;
  cancelled?: boolean;
  note?: string;
}

export interface ClassOccurrence {
  occurrenceId: string;
  seriesId: string;
  courseId: string;
  courseName: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  room?: string;
  cancelled?: boolean;
  color: string;
  note?: string;
  isOverride?: boolean;
}

export interface CalendarEvent {
  id: string;
  type: EventType;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime?: string;  // HH:MM
  location?: string;
  courseId?: string;
  courseName?: string;
  reminderEnabled: boolean;
  reminderMinutesBefore?: number;
  source?: 'manual' | 'ai_json';
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:MM
  priority: TaskPriority;
  completed: boolean;
  seriesId?: string;
  reminderEnabled: boolean;
  reminderMinutesBefore?: number;
  courseId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskSeries {
  id: string;
  title: string;
  frequency: RecurrenceType;
  startDate: string;
  endDate?: string;
  daysOfWeek?: string[];
  dayOfMonth?: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description?: string;
  paymentMethod: PaymentMethod;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  createdAt: string;
}

export interface UserProfile {
  name: string;
  institution: string;
  program: string;
  semester: string;
  academicYear: string;
  semesterStartDate: string;
  semesterEndDate: string;
  defaultClassDuration: number; // in minutes (e.g. 60)
  defaultClassroom?: string;
}

export interface AppSettings {
  language: Language;
  theme: 'light' | 'dark' | 'system';
  accentColor: 'green' | 'blue' | 'purple';
  density: 'comfortable' | 'compact';
  lowEndMode: boolean;
  defaultCalendarView: 'month' | 'week' | 'day';
  firstDayOfWeek: 'monday' | 'sunday';
  showWeekends: boolean;
  showCompletedTasks: boolean;
  showRoomNumbers: boolean;
  showCourseCodes: boolean;
  defaultTaskPriority: TaskPriority;
  defaultReminderMinutes: number;
  autoRecalculateBudget: boolean;
  budgetWarningThreshold: number; // percentage (e.g. 80, 90, 100)
  hideFinancialInfo: boolean;
  hideNotificationContents: boolean;
  dailyBudget: number;
  monthlyBudget: number;
  upiOpeningBalance: number;
  cashOpeningBalance: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'class' | 'task' | 'exam' | 'budget';
  actionable?: boolean;
  actionType?: 'complete_task' | 'view_budget' | 'view_exam' | 'dismiss';
  relatedId?: string;
  timestamp: string;
  read: boolean;
}

export interface TimetableImportClass {
  course: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  start_time: string;
  end_time: string;
  room?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  recurrence?: 'weekly' | 'none';
}

export interface TimetableImportJSON {
  type: 'timetable';
  version: string;
  classes: TimetableImportClass[];
}

export interface ExamImportItem {
  course: string;
  date: string;
  start_time: string;
  end_time?: string | null;
  room?: string | null;
}

export interface ExamImportJSON {
  type: 'exam_schedule';
  version: string;
  exams: ExamImportItem[];
}

export interface ImportPreviewResult {
  valid: boolean;
  errors: string[];
  type: 'timetable' | 'exam_schedule';
  newCount: number;
  duplicateCount: number;
  conflictCount: number;
  items: Array<{
    id: string;
    title: string;
    subtitle: string;
    time: string;
    status: 'new' | 'duplicate' | 'conflict';
    conflictDetail?: string;
    payload: any;
  }>;
}
