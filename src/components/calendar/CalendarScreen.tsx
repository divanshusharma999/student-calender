import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  getClassOccurrencesForDate, 
  getMonthGrid, 
  getWeekDates, 
  formatDateToYYYYMMDD, 
  parseYYYYMMDD
} from '../../utils/recurrence';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Check,
  X,
  Mail
} from 'lucide-react';
import { CalendarEvent, Task, ClassOccurrence } from '../../types';

export const CalendarScreen: React.FC = () => {
  const {
    t,
    settings,
    currentDate,
    setCurrentDate,
    classSeries,
    classOverrides,
    addClassOverride,
    deleteClassSeries,
    events,
    tasks,
    toggleTaskComplete,
    budgetSummary,
    openAddModal,
    openGmailModal
  } = useApp();

  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>(settings.defaultCalendarView);
  const [selectedOccurrence, setSelectedOccurrence] = useState<ClassOccurrence | null>(null);

  const activeDate = parseYYYYMMDD(currentDate);
  const year = activeDate.getFullYear();
  const month = activeDate.getMonth();
  const todayStr = formatDateToYYYYMMDD(new Date());

  const handlePrev = () => {
    const d = new Date(activeDate);
    if (calendarView === 'month') {
      d.setMonth(d.getMonth() - 1);
    } else if (calendarView === 'week') {
      d.setDate(d.getDate() - 7);
    } else {
      d.setDate(d.getDate() - 1);
    }
    setCurrentDate(formatDateToYYYYMMDD(d));
  };

  const handleNext = () => {
    const d = new Date(activeDate);
    if (calendarView === 'month') {
      d.setMonth(d.getMonth() + 1);
    } else if (calendarView === 'week') {
      d.setDate(d.getDate() + 7);
    } else {
      d.setDate(d.getDate() + 1);
    }
    setCurrentDate(formatDateToYYYYMMDD(d));
  };

  const monthDays = getMonthGrid(year, month, settings.firstDayOfWeek);
  const weekDateStrings = getWeekDates(currentDate, settings.firstDayOfWeek);

  const dayClasses = getClassOccurrencesForDate(currentDate, classSeries, classOverrides);
  const dayEvents = events.filter(e => e.date === currentDate);
  const dayTasks = tasks.filter(t => t.dueDate === currentDate);

  const monthTitle = activeDate.toLocaleDateString(settings.language === 'hi' ? 'hi-IN' : 'en-US', {
    month: 'long',
    year: 'numeric'
  });

  const fullDayTitle = activeDate.toLocaleDateString(settings.language === 'hi' ? 'hi-IN' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  const hasEventsOnDate = (dStr: string) => {
    const cls = getClassOccurrencesForDate(dStr, classSeries, classOverrides);
    const evs = events.filter(e => e.date === dStr);
    const tsks = tasks.filter(t => t.dueDate === dStr && !t.completed);
    return cls.length > 0 || evs.length > 0 || tsks.length > 0;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-5">
      {/* Title & Gmail Sync Action */}
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-medium leading-[32px] text-[#171717] dark:text-[#F5F5F5]">
          {t.navCalendar}
        </h1>
        <button
          onClick={openGmailModal}
          className="h-9 px-3 rounded-[8px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] hover:bg-[#F7F7F8] dark:hover:bg-[#303030] text-[13px] font-medium text-[#171717] dark:text-[#F5F5F5] flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Mail className="w-3.5 h-3.5 text-[#10A37F]" />
          <span>Gmail Updates</span>
        </button>
      </div>

      {/* Top Controls: View Selector & Date Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Segmented Control */}
        <div className="flex h-10 p-0.5 rounded-[8px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#F7F7F8] dark:bg-[#303030]">
          {(['month', 'week', 'day'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setCalendarView(view)}
              className={`px-4 text-[13px] font-medium rounded-[6px] transition-colors cursor-pointer capitalize ${
                calendarView === view
                  ? 'bg-[#FFFFFF] dark:bg-[#2A2A2A] text-[#171717] dark:text-[#F5F5F5] shadow-xs'
                  : 'text-[#6B6B6B] dark:text-[#B4B4B4] hover:text-[#171717] dark:hover:text-[#F5F5F5]'
              }`}
            >
              {view === 'month' ? t.month : view === 'week' ? t.week : t.day}
            </button>
          ))}
        </div>

        {/* Date Navigator */}
        <div className="flex items-center justify-between sm:justify-end gap-1.5">
          <button
            onClick={() => setCurrentDate(todayStr)}
            className="h-10 px-3 rounded-[8px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] text-[13px] font-medium text-[#171717] dark:text-[#F5F5F5] hover:bg-[#F7F7F8] dark:hover:bg-[#303030] cursor-pointer"
          >
            {t.jumpToday}
          </button>
          <button
            onClick={handlePrev}
            className="h-10 w-10 rounded-[8px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] flex items-center justify-center text-[#6B6B6B] dark:text-[#B4B4B4] hover:bg-[#F7F7F8] dark:hover:bg-[#303030] cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[14px] font-medium text-[#171717] dark:text-[#F5F5F5] min-w-[120px] text-center">
            {calendarView === 'day' 
              ? activeDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
              : monthTitle
            }
          </span>
          <button
            onClick={handleNext}
            className="h-10 w-10 rounded-[8px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] flex items-center justify-center text-[#6B6B6B] dark:text-[#B4B4B4] hover:bg-[#F7F7F8] dark:hover:bg-[#303030] cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MONTH VIEW */}
      {calendarView === 'month' && (
        <div className="space-y-4">
          <div className="border border-[#E5E5E5] dark:border-[#3A3A3A] rounded-[10px] bg-[#FFFFFF] dark:bg-[#2A2A2A] p-3.5">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-2 text-center">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="text-[12px] font-medium text-[#8E8E8E] py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Date Grid */}
            <div className="grid grid-cols-7 gap-1">
              {monthDays.map((d, index) => {
                const dStr = formatDateToYYYYMMDD(d);
                const isCurrentMonth = d.getMonth() === month;
                const isSelected = dStr === currentDate;
                const isToday = dStr === todayStr;
                const hasEvents = hasEventsOnDate(dStr);

                return (
                  <button
                    key={index}
                    onClick={() => setCurrentDate(dStr)}
                    className={`h-12 rounded-[8px] flex flex-col items-center justify-center relative transition-colors cursor-pointer ${
                      isSelected
                        ? 'border border-[#171717] dark:border-[#F5F5F5] bg-[#F7F7F8] dark:bg-[#303030]'
                        : isToday
                          ? 'border border-[#10A37F] bg-transparent'
                          : 'hover:bg-[#F7F7F8] dark:hover:bg-[#303030]'
                    } ${!isCurrentMonth ? 'opacity-30' : ''}`}
                  >
                    <span className={`text-[14px] leading-none ${
                      isToday ? 'font-medium text-[#10A37F]' : isSelected ? 'font-medium' : 'font-normal'
                    }`}>
                      {d.getDate()}
                    </span>

                    {/* Tiny Event Indicator */}
                    {hasEvents && (
                      <span className="w-1 h-1 rounded-full bg-[#10A37F] mt-1.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Date Schedule */}
          <div className="space-y-2">
            <h3 className="text-[16px] font-medium text-[#171717] dark:text-[#F5F5F5]">
              {fullDayTitle}
            </h3>

            {dayClasses.length === 0 && dayEvents.length === 0 && dayTasks.length === 0 ? (
              <p className="text-[14px] text-[#8E8E8E] py-2">
                {t.noEventsOnDate}
              </p>
            ) : (
              <div className="border border-[#E5E5E5] dark:border-[#3A3A3A] rounded-[10px] bg-[#FFFFFF] dark:bg-[#2A2A2A] divide-y divide-[#EEEEEE] dark:divide-[#353535] overflow-hidden">
                {dayClasses.map((item) => (
                  <div
                    key={item.occurrenceId}
                    onClick={() => setSelectedOccurrence(item)}
                    className="p-3.5 flex items-center justify-between hover:bg-[#F7F7F8] dark:hover:bg-[#303030] cursor-pointer"
                  >
                    <div>
                      <div className="text-[15px] font-medium text-[#171717] dark:text-[#F5F5F5]">
                        {item.courseName}
                      </div>
                      {item.room && (
                        <div className="text-[12px] text-[#6B6B6B] dark:text-[#B4B4B4]">
                          {item.room}
                        </div>
                      )}
                    </div>
                    <span className="text-[14px] text-[#6B6B6B] dark:text-[#B4B4B4]">
                      {item.startTime}–{item.endTime}
                    </span>
                  </div>
                ))}

                {dayEvents.map((ev) => (
                  <div key={ev.id} className="p-3.5 flex items-center justify-between">
                    <div>
                      <div className="text-[15px] font-medium text-[#171717] dark:text-[#F5F5F5]">
                        {ev.title} ({ev.type})
                      </div>
                      {ev.location && (
                        <div className="text-[12px] text-[#6B6B6B] dark:text-[#B4B4B4]">
                          {ev.location}
                        </div>
                      )}
                    </div>
                    <span className="text-[14px] text-[#6B6B6B] dark:text-[#B4B4B4]">
                      {ev.startTime}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* WEEK VIEW (Practical rectangular timetable) */}
      {calendarView === 'week' && (
        <div className="space-y-3">
          {weekDateStrings.map((dStr) => {
            const dateObj = parseYYYYMMDD(dStr);
            const isToday = dStr === todayStr;
            const isSelected = dStr === currentDate;
            const cls = getClassOccurrencesForDate(dStr, classSeries, classOverrides);
            const evs = events.filter(e => e.date === dStr);

            const dayLabel = dateObj.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });

            return (
              <div
                key={dStr}
                onClick={() => setCurrentDate(dStr)}
                className={`p-3.5 rounded-[10px] border bg-[#FFFFFF] dark:bg-[#2A2A2A] transition-colors cursor-pointer ${
                  isSelected
                    ? 'border-[#171717] dark:border-[#F5F5F5]'
                    : isToday
                      ? 'border-[#10A37F]'
                      : 'border-[#E5E5E5] dark:border-[#3A3A3A]'
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#EEEEEE] dark:border-[#353535]">
                  <span className={`text-[14px] font-medium ${isToday ? 'text-[#10A37F]' : 'text-[#171717] dark:text-[#F5F5F5]'}`}>
                    {dayLabel} {isToday && '(Today)'}
                  </span>
                  <span className="text-[12px] text-[#8E8E8E]">
                    {cls.length + evs.length} items
                  </span>
                </div>

                <div className="mt-2.5 space-y-1.5">
                  {cls.length === 0 && evs.length === 0 ? (
                    <span className="text-[13px] text-[#8E8E8E]">No classes or events</span>
                  ) : (
                    <>
                      {cls.map(c => (
                        <div key={c.occurrenceId} className="flex justify-between items-center text-[14px]">
                          <span className="text-[#171717] dark:text-[#F5F5F5]">
                            {c.courseName} {c.room && `(${c.room})`}
                          </span>
                          <span className="text-[#6B6B6B] dark:text-[#B4B4B4]">
                            {c.startTime}–{c.endTime}
                          </span>
                        </div>
                      ))}
                      {evs.map(e => (
                        <div key={e.id} className="flex justify-between items-center text-[14px]">
                          <span className="font-medium text-[#171717] dark:text-[#F5F5F5]">
                            {e.title}
                          </span>
                          <span className="text-[#6B6B6B] dark:text-[#B4B4B4]">
                            {e.startTime}
                          </span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DAY VIEW (Chronological list) */}
      {calendarView === 'day' && (
        <div className="space-y-4">
          <div className="p-4 rounded-[10px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A]">
            <h2 className="text-[18px] font-medium text-[#171717] dark:text-[#F5F5F5]">
              {fullDayTitle}
            </h2>
            {currentDate === todayStr && (
              <div className="mt-2 text-[14px] text-[#6B6B6B] dark:text-[#B4B4B4]">
                Today's Budget: ₹{budgetSummary.spentToday} / ₹{budgetSummary.dailyTarget}
              </div>
            )}
          </div>

          <div className="space-y-3">
            {dayClasses.length === 0 && dayEvents.length === 0 && dayTasks.length === 0 ? (
              <div className="p-6 rounded-[10px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] text-center">
                <p className="text-[14px] text-[#6B6B6B] dark:text-[#B4B4B4]">
                  {t.noEventsOnDate}
                </p>
              </div>
            ) : (
              <div className="border border-[#E5E5E5] dark:border-[#3A3A3A] rounded-[10px] bg-[#FFFFFF] dark:bg-[#2A2A2A] divide-y divide-[#EEEEEE] dark:divide-[#353535] overflow-hidden">
                {/* Classes */}
                {dayClasses.map((item) => (
                  <div
                    key={item.occurrenceId}
                    onClick={() => setSelectedOccurrence(item)}
                    className="p-3.5 flex items-start justify-between hover:bg-[#F7F7F8] dark:hover:bg-[#303030] cursor-pointer"
                  >
                    <div>
                      <span className="text-[12px] text-[#8E8E8E] block">Class</span>
                      <h3 className="text-[15px] font-medium text-[#171717] dark:text-[#F5F5F5]">
                        {item.courseName}
                      </h3>
                      {item.room && (
                        <p className="text-[12px] text-[#6B6B6B] dark:text-[#B4B4B4]">
                          Room {item.room}
                        </p>
                      )}
                    </div>
                    <span className="text-[14px] text-[#6B6B6B] dark:text-[#B4B4B4]">
                      {item.startTime}–{item.endTime}
                    </span>
                  </div>
                ))}

                {/* Exams / Tests */}
                {dayEvents.map((ev) => (
                  <div key={ev.id} className="p-3.5 flex items-start justify-between">
                    <div>
                      <span className="text-[12px] text-[#8E8E8E] block">{ev.type}</span>
                      <h3 className="text-[15px] font-medium text-[#171717] dark:text-[#F5F5F5]">
                        {ev.title}
                      </h3>
                      {ev.location && (
                        <p className="text-[12px] text-[#6B6B6B] dark:text-[#B4B4B4]">
                          {ev.location}
                        </p>
                      )}
                    </div>
                    <span className="text-[14px] text-[#6B6B6B] dark:text-[#B4B4B4]">
                      {ev.startTime}
                    </span>
                  </div>
                ))}

                {/* Tasks */}
                {dayTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => toggleTaskComplete(task.id)}
                    className="p-3.5 flex items-start gap-3 hover:bg-[#F7F7F8] dark:hover:bg-[#303030] cursor-pointer"
                  >
                    <div className={`w-5 h-5 rounded-[4px] border flex items-center justify-center shrink-0 mt-0.5 ${
                      task.completed ? 'bg-[#10A37F] border-[#10A37F] text-white' : 'border-[#B4B4B4]'
                    }`}>
                      {task.completed && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0 flex items-center justify-between">
                      <span className={`text-[15px] ${task.completed ? 'line-through text-[#8E8E8E]' : 'text-[#171717] dark:text-[#F5F5F5]'}`}>
                        {task.title}
                      </span>
                      {task.dueTime && (
                        <span className="text-[12px] text-[#8E8E8E]">{task.dueTime}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recurrence Action Modal */}
      {selectedOccurrence && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] dark:bg-[#2A2A2A] rounded-[10px] max-w-sm w-full p-4 border border-[#E5E5E5] dark:border-[#3A3A3A] space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-[16px] font-medium text-[#171717] dark:text-[#F5F5F5]">
                  {selectedOccurrence.courseName}
                </h3>
                <p className="text-[13px] text-[#6B6B6B] dark:text-[#B4B4B4]">
                  {selectedOccurrence.startTime}–{selectedOccurrence.endTime} • {selectedOccurrence.date}
                </p>
              </div>
              <button
                onClick={() => setSelectedOccurrence(null)}
                className="p-1 text-[#8E8E8E] hover:text-[#171717] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 pt-2 border-t border-[#EEEEEE] dark:border-[#353535]">
              <button
                onClick={() => {
                  addClassOverride({
                    classSeriesId: selectedOccurrence.seriesId,
                    originalDate: selectedOccurrence.date,
                    cancelled: true
                  });
                  setSelectedOccurrence(null);
                }}
                className="w-full text-left h-10 px-3 rounded-[8px] text-[14px] text-[#D32F2F] hover:bg-[#F7F7F8] dark:hover:bg-[#303030] cursor-pointer"
              >
                {t.deleteThisOccurrence}
              </button>

              <button
                onClick={() => {
                  deleteClassSeries(selectedOccurrence.seriesId);
                  setSelectedOccurrence(null);
                }}
                className="w-full text-left h-10 px-3 rounded-[8px] text-[14px] text-[#D32F2F] hover:bg-[#F7F7F8] dark:hover:bg-[#303030] cursor-pointer"
              >
                {t.deleteEntireSeries}
              </button>

              <button
                onClick={() => setSelectedOccurrence(null)}
                className="w-full h-10 px-3 rounded-[8px] border border-[#E5E5E5] dark:border-[#3A3A3A] text-[14px] font-medium text-[#171717] dark:text-[#F5F5F5] hover:bg-[#F7F7F8] cursor-pointer"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
