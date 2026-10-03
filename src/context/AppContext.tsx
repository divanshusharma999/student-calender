import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Course,
  ClassSeries,
  ClassOverride,
  CalendarEvent,
  Task,
  Transaction,
  UserProfile,
  AppSettings,
  AppNotification,
  Language,
  ImportPreviewResult
} from '../types';
import { translations } from '../i18n/translations';
import { calculateBudgetSummary, BudgetSummary } from '../utils/budget';
import { formatDateToYYYYMMDD } from '../utils/recurrence';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['en'];
  
  // Data State
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  
  courses: Course[];
  classSeries: ClassSeries[];
  classOverrides: ClassOverride[];
  events: CalendarEvent[];
  tasks: Task[];
  transactions: Transaction[];
  notifications: AppNotification[];
  
  // Current Date State
  currentDate: string; // YYYY-MM-DD
  setCurrentDate: (date: string) => void;
  
  // Navigation
  activeTab: 'home' | 'calendar' | 'tasks' | 'finance' | 'settings';
  setActiveTab: (tab: 'home' | 'calendar' | 'tasks' | 'finance' | 'settings') => void;
  
  // Budget summary
  budgetSummary: BudgetSummary;
  
  // Actions
  addClassSeries: (series: Omit<ClassSeries, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateClassSeries: (id: string, updates: Partial<ClassSeries>) => void;
  deleteClassSeries: (id: string) => void;
  addClassOverride: (override: Omit<ClassOverride, 'id'>) => void;
  
  addEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  toggleTaskComplete: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  snoozeTask: (id: string, minutes: number) => void;
  
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  deleteTransaction: (id: string) => void;
  
  // Import handler
  commitImport: (preview: ImportPreviewResult, mode: 'new_only' | 'replace_matching') => void;
  
  // Notification actions
  dismissNotification: (id: string) => void;
  
  // Reset / Clear
  resetToDefaultData: () => void;
  clearAllData: () => void;
  
  // Modal states
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  addModalInitialType?: 'class' | 'task' | 'exam' | 'assignment' | 'transaction' | 'import_timetable' | 'import_exam';
  openAddModal: (type?: 'class' | 'task' | 'exam' | 'assignment' | 'transaction' | 'import_timetable' | 'import_exam') => void;
  
  // AI Import modal
  isImportModalOpen: boolean;
  setIsImportModalOpen: (open: boolean) => void;
  importModalType: 'timetable' | 'exam_schedule';
  setImportModalType: (type: 'timetable' | 'exam_schedule') => void;
  openImportModal: (type: 'timetable' | 'exam_schedule') => void;

  // Gmail timetable updates modal
  isGmailModalOpen: boolean;
  setIsGmailModalOpen: (open: boolean) => void;
  openGmailModal: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = 'STUDENT_OS_DATA_V1';

// Initial student profile
const initialProfile: UserProfile = {
  name: 'Divanshu',
  institution: 'IISER Mohali',
  program: 'BS-MS Dual Degree',
  semester: 'Fall Semester',
  academicYear: '2026-2027',
  semesterStartDate: '2026-08-01',
  semesterEndDate: '2026-12-15',
  defaultClassDuration: 60,
  defaultClassroom: 'LH-2'
};

const initialSettings: AppSettings = {
  language: 'en',
  theme: 'light',
  accentColor: 'green',
  density: 'comfortable',
  lowEndMode: false,
  defaultCalendarView: 'month',
  firstDayOfWeek: 'monday',
  showWeekends: true,
  showCompletedTasks: false,
  showRoomNumbers: true,
  showCourseCodes: false,
  defaultTaskPriority: 'MEDIUM',
  defaultReminderMinutes: 15,
  autoRecalculateBudget: true,
  budgetWarningThreshold: 80,
  hideFinancialInfo: false,
  hideNotificationContents: false,
  dailyBudget: 130,
  monthlyBudget: 3500,
  upiOpeningBalance: 2030,
  cashOpeningBalance: 660
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Use today's current date string
  const todayStr = formatDateToYYYYMMDD(new Date());

  const [currentDate, setCurrentDate] = useState<string>(todayStr);
  const [activeTab, setActiveTab] = useState<'home' | 'calendar' | 'tasks' | 'finance' | 'settings'>('home');
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [settings, setSettings] = useState<AppSettings>(initialSettings);

  const [courses, setCourses] = useState<Course[]>([]);
  const [classSeries, setClassSeries] = useState<ClassSeries[]>([]);
  const [classOverrides, setClassOverrides] = useState<ClassOverride[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalInitialType, setAddModalInitialType] = useState<'class' | 'task' | 'exam' | 'assignment' | 'transaction' | 'import_timetable' | 'import_exam'>('task');

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importModalType, setImportModalType] = useState<'timetable' | 'exam_schedule'>('timetable');

  const [isGmailModalOpen, setIsGmailModalOpen] = useState(false);

  // Load from LocalStorage or seed realistic starter data
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.profile) setProfile(parsed.profile);
        if (parsed.settings) setSettings(parsed.settings);
        if (parsed.courses) setCourses(parsed.courses);
        if (parsed.classSeries) setClassSeries(parsed.classSeries);
        if (parsed.classOverrides) setClassOverrides(parsed.classOverrides);
        if (parsed.events) setEvents(parsed.events);
        if (parsed.tasks) setTasks(parsed.tasks);
        if (parsed.transactions) setTransactions(parsed.transactions);
        if (parsed.notifications) setNotifications(parsed.notifications);
        return;
      }
    } catch (e) {
      console.error('Failed to load local storage:', e);
    }
    // If no storage found, populate initial demo data
    populateSampleData(todayStr);
  }, []);

  // Save to LocalStorage on changes
  useEffect(() => {
    try {
      const dataToSave = {
        profile,
        settings,
        courses,
        classSeries,
        classOverrides,
        events,
        tasks,
        transactions,
        notifications
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.error('Failed to save to local storage:', e);
    }
  }, [profile, settings, courses, classSeries, classOverrides, events, tasks, transactions, notifications]);

  // Apply dark mode class to html element
  useEffect(() => {
    const isDark = settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Dynamic budget calculations
  const budgetSummary = calculateBudgetSummary(
    transactions,
    settings.upiOpeningBalance,
    settings.cashOpeningBalance,
    settings.dailyBudget,
    settings.monthlyBudget,
    todayStr
  );

  const t = translations[settings.language] || translations.en;

  const setLanguage = (lang: Language) => {
    setSettings(prev => ({ ...prev, language: lang }));
  };

  const openAddModal = (type: 'class' | 'task' | 'exam' | 'assignment' | 'transaction' | 'import_timetable' | 'import_exam' = 'task') => {
    setAddModalInitialType(type);
    setIsAddModalOpen(true);
  };

  const openImportModal = (type: 'timetable' | 'exam_schedule') => {
    setImportModalType(type);
    setIsImportModalOpen(true);
  };

  const openGmailModal = () => {
    setIsGmailModalOpen(true);
  };

  // Populate realistic sample data (matching section 8 & 21 of specifications)
  const populateSampleData = (baseDateStr: string) => {
    const now = new Date();
    const today = formatDateToYYYYMMDD(now);
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowStr = formatDateToYYYYMMDD(tomorrow);
    const in3Days = new Date(now);
    in3Days.setDate(now.getDate() + 3);
    const in3DaysStr = formatDateToYYYYMMDD(in3Days);

    const initialCourses: Course[] = [
      { id: 'c1', name: 'Data Structures', code: 'CS201', instructor: 'Dr. Rao', roomDefault: 'LH-2', color: '#10A37F', createdAt: today, updatedAt: today },
      { id: 'c2', name: 'Mathematics', code: 'MA202', instructor: 'Prof. Sharma', roomDefault: 'LT-1', color: '#10A37F', createdAt: today, updatedAt: today },
      { id: 'c3', name: 'Physics', code: 'PHY101', instructor: 'Dr. Verma', roomDefault: 'LT-3', color: '#10A37F', createdAt: today, updatedAt: today }
    ];

    // Determine what day of week today is
    const todayDayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()] as any;

    const initialClassSeries: ClassSeries[] = [
      {
        id: 'cs1',
        courseId: 'c1',
        courseName: 'Data Structures',
        dayOfWeek: todayDayName === 'Sunday' ? 'Monday' : todayDayName,
        startTime: '10:00',
        endTime: '11:00',
        room: 'LH-2',
        recurrenceType: 'weekly',
        color: '#10A37F',
        startDate: '2026-08-01',
        endDate: '2026-12-15',
        createdAt: today,
        updatedAt: today
      },
      {
        id: 'cs2',
        courseId: 'c2',
        courseName: 'Mathematics',
        dayOfWeek: todayDayName === 'Sunday' ? 'Monday' : todayDayName,
        startTime: '11:00',
        endTime: '12:00',
        room: 'LT-1',
        recurrenceType: 'weekly',
        color: '#10A37F',
        startDate: '2026-08-01',
        endDate: '2026-12-15',
        createdAt: today,
        updatedAt: today
      },
      {
        id: 'cs3',
        courseId: 'c3',
        courseName: 'Physics',
        dayOfWeek: 'Friday',
        startTime: '10:00',
        endTime: '11:00',
        room: 'LT-3',
        recurrenceType: 'weekly',
        color: '#10A37F',
        startDate: '2026-08-01',
        endDate: '2026-12-15',
        createdAt: today,
        updatedAt: today
      }
    ];

    const initialTasks: Task[] = [
      {
        id: 't1',
        title: 'Complete assignment',
        description: 'Binary Search Trees problem set 4',
        dueDate: today,
        dueTime: '18:00',
        priority: 'HIGH',
        completed: false,
        reminderEnabled: true,
        reminderMinutesBefore: 30,
        courseId: 'c1',
        createdAt: today,
        updatedAt: today
      },
      {
        id: 't2',
        title: 'Read lecture 4',
        description: 'Eigenvalues and Eigenvectors notes',
        dueDate: today,
        dueTime: '21:00',
        priority: 'MEDIUM',
        completed: false,
        reminderEnabled: false,
        courseId: 'c2',
        createdAt: today,
        updatedAt: today
      },
      {
        id: 't3',
        title: 'Submit Physics Lab Report',
        description: 'Optics interference experiment writeup',
        dueDate: tomorrowStr,
        dueTime: '12:00',
        priority: 'HIGH',
        completed: false,
        reminderEnabled: true,
        reminderMinutesBefore: 60,
        courseId: 'c3',
        createdAt: today,
        updatedAt: today
      }
    ];

    const initialEvents: CalendarEvent[] = [
      {
        id: 'e1',
        type: 'TEST',
        title: 'Math Test',
        description: 'Linear Algebra Chapters 1–3',
        date: in3DaysStr,
        startTime: '14:00',
        endTime: '15:30',
        location: 'LT-1',
        courseName: 'Mathematics',
        courseId: 'c2',
        reminderEnabled: true,
        reminderMinutesBefore: 60,
        createdAt: today,
        updatedAt: today
      },
      {
        id: 'e2',
        type: 'EXAM',
        title: 'Data Structures Midterm',
        description: 'Midterm Examination Hall 2',
        date: '2026-11-20',
        startTime: '10:00',
        endTime: '13:00',
        location: 'Exam Hall 2',
        courseName: 'Data Structures',
        courseId: 'c1',
        reminderEnabled: true,
        reminderMinutesBefore: 120,
        createdAt: today,
        updatedAt: today
      }
    ];

    // Transactions to hit:
    // UPI: 2030 + 500 - 80 = 2450
    // Cash: 660 - 40 = 620
    // Total: 3070
    // Today spent: 56 + 40 = 96 (target 130, remaining 34!)
    const initialTransactions: Transaction[] = [
      {
        id: 'tx1',
        type: 'INCOME',
        amount: 500,
        category: 'Allowance',
        description: 'Money received from parents',
        paymentMethod: 'UPI',
        date: today,
        time: '09:15',
        createdAt: today
      },
      {
        id: 'tx2',
        type: 'EXPENSE',
        amount: 56,
        category: 'Food',
        description: 'Lunch at hostel canteen',
        paymentMethod: 'UPI',
        date: today,
        time: '13:10',
        createdAt: today
      },
      {
        id: 'tx3',
        type: 'EXPENSE',
        amount: 40,
        category: 'Transport',
        description: 'Auto to campus gate',
        paymentMethod: 'CASH',
        date: today,
        time: '15:20',
        createdAt: today
      }
    ];

    const initialNotifications: AppNotification[] = [
      {
        id: 'notif-1',
        title: 'Assignment due today',
        message: 'Binary Search Trees problem set 4 due at 18:00',
        type: 'task',
        actionable: true,
        actionType: 'complete_task',
        relatedId: 't1',
        timestamp: today,
        read: false
      }
    ];

    setCourses(initialCourses);
    setClassSeries(initialClassSeries);
    setClassOverrides([]);
    setEvents(initialEvents);
    setTasks(initialTasks);
    setTransactions(initialTransactions);
    setNotifications(initialNotifications);
  };

  // Class Series actions
  const addClassSeries = (series: Omit<ClassSeries, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = `cs-${Date.now()}`;
    const newSeries: ClassSeries = {
      ...series,
      id,
      createdAt: todayStr,
      updatedAt: todayStr
    };
    setClassSeries(prev => [...prev, newSeries]);
  };

  const updateClassSeries = (id: string, updates: Partial<ClassSeries>) => {
    setClassSeries(prev => prev.map(s => s.id === id ? { ...s, ...updates, updatedAt: todayStr } : s));
  };

  const deleteClassSeries = (id: string) => {
    setClassSeries(prev => prev.filter(s => s.id !== id));
    setClassOverrides(prev => prev.filter(o => o.classSeriesId !== id));
  };

  const addClassOverride = (override: Omit<ClassOverride, 'id'>) => {
    const newOverride: ClassOverride = {
      ...override,
      id: `co-${Date.now()}`
    };
    setClassOverrides(prev => [...prev, newOverride]);
  };

  // Calendar Event actions
  const addEvent = (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: `ev-${Date.now()}`,
      createdAt: todayStr,
      updatedAt: todayStr
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const updateEvent = (id: string, updates: Partial<CalendarEvent>) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates, updatedAt: todayStr } : e));
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  // Task actions
  const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...task,
      id: `tsk-${Date.now()}`,
      createdAt: todayStr,
      updatedAt: todayStr
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const toggleTaskComplete = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed, updatedAt: todayStr } : t));
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates, updatedAt: todayStr } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const snoozeTask = (id: string, minutes: number) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      // Advance due time or add notice
      return {
        ...t,
        reminderMinutesBefore: (t.reminderMinutesBefore || 15) + minutes,
        updatedAt: todayStr
      };
    }));
  };

  // Transaction actions
  const addTransaction = (tx: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      createdAt: todayStr
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Import Commit
  const commitImport = (preview: ImportPreviewResult, mode: 'new_only' | 'replace_matching') => {
    if (preview.type === 'timetable') {
      const itemsToProcess = preview.items.filter(item => {
        if (mode === 'new_only') return item.status === 'new' || item.status === 'conflict';
        return true; // replace matching also replaces duplicates
      });

      const newSeriesList: ClassSeries[] = [];
      const updatedCourses: Course[] = [...courses];

      for (const item of itemsToProcess) {
        const payload = item.payload;
        // Find or create course
        let course = updatedCourses.find(c => c.name.toLowerCase().trim() === payload.course.toLowerCase().trim());
        if (!course) {
          course = {
            id: `c-${Date.now()}-${Math.random()}`,
            name: payload.course,
            roomDefault: payload.room || undefined,
            color: '#10A37F',
            createdAt: todayStr,
            updatedAt: todayStr
          };
          updatedCourses.push(course);
        }

        const newClass: ClassSeries = {
          id: `cs-${Date.now()}-${Math.random()}`,
          courseId: course.id,
          courseName: course.name,
          dayOfWeek: payload.day,
          startTime: payload.start_time,
          endTime: payload.end_time,
          room: payload.room || undefined,
          startDate: payload.start_date || undefined,
          endDate: payload.end_date || undefined,
          recurrenceType: payload.recurrence === 'weekly' ? 'weekly' : 'none',
          color: course.color,
          createdAt: todayStr,
          updatedAt: todayStr
        };

        newSeriesList.push(newClass);
      }

      setCourses(updatedCourses);
      if (mode === 'replace_matching') {
        // remove matching series
        const namesToReplace = itemsToProcess.map(i => i.title.toLowerCase().trim());
        setClassSeries(prev => [
          ...prev.filter(s => !namesToReplace.includes(s.courseName.toLowerCase().trim())),
          ...newSeriesList
        ]);
      } else {
        setClassSeries(prev => [...prev, ...newSeriesList]);
      }
    } else if (preview.type === 'exam_schedule') {
      const itemsToProcess = preview.items.filter(item => {
        if (mode === 'new_only') return item.status === 'new';
        return true;
      });

      const newEvents: CalendarEvent[] = itemsToProcess.map((item, idx) => {
        const payload = item.payload;
        return {
          id: `ev-exam-${Date.now()}-${idx}`,
          type: 'EXAM',
          title: `${payload.course} Exam`,
          date: payload.date,
          startTime: payload.start_time,
          endTime: payload.end_time || undefined,
          location: payload.room || undefined,
          courseName: payload.course,
          reminderEnabled: true,
          reminderMinutesBefore: 60,
          source: 'ai_json',
          createdAt: todayStr,
          updatedAt: todayStr
        };
      });

      setEvents(prev => [...prev, ...newEvents]);
    }
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const resetToDefaultData = () => {
    populateSampleData(todayStr);
  };

  const clearAllData = () => {
    setClassSeries([]);
    setClassOverrides([]);
    setEvents([]);
    setTasks([]);
    setTransactions([]);
    setNotifications([]);
  };

  return (
    <AppContext.Provider
      value={{
        language: settings.language,
        setLanguage,
        t,
        profile,
        setProfile,
        settings,
        setSettings,
        courses,
        classSeries,
        classOverrides,
        events,
        tasks,
        transactions,
        notifications,
        currentDate,
        setCurrentDate,
        activeTab,
        setActiveTab,
        budgetSummary,
        addClassSeries,
        updateClassSeries,
        deleteClassSeries,
        addClassOverride,
        addEvent,
        updateEvent,
        deleteEvent,
        addTask,
        toggleTaskComplete,
        updateTask,
        deleteTask,
        snoozeTask,
        addTransaction,
        deleteTransaction,
        commitImport,
        dismissNotification,
        resetToDefaultData,
        clearAllData,
        isAddModalOpen,
        setIsAddModalOpen,
        addModalInitialType,
        openAddModal,
        isImportModalOpen,
        setIsImportModalOpen,
        importModalType,
        setImportModalType,
        openImportModal,
        isGmailModalOpen,
        setIsGmailModalOpen,
        openGmailModal
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
