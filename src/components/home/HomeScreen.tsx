import React from 'react';
import { useApp } from '../../context/AppContext';
import { getClassOccurrencesForDate, formatDateToYYYYMMDD } from '../../utils/recurrence';
import { Check, Plus } from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const {
    t,
    profile,
    settings,
    classSeries,
    classOverrides,
    tasks,
    toggleTaskComplete,
    events,
    budgetSummary,
    setActiveTab,
    setCurrentDate,
    openAddModal,
    openImportModal
  } = useApp();

  const todayStr = formatDateToYYYYMMDD(new Date());

  // Classes for today generated via recurrence engine
  const todayClasses = getClassOccurrencesForDate(todayStr, classSeries, classOverrides);

  // Tasks for today
  const todayTasks = tasks.filter(t => t.dueDate <= todayStr && (!t.completed || settings.showCompletedTasks));

  // Determine greeting based on hour
  const hour = new Date().getHours();
  const greeting = hour < 12 
    ? t.greetingMorning 
    : hour < 17 
      ? t.greetingAfternoon 
      : t.greetingEvening;

  const todayObj = new Date();
  const dateFormatted = todayObj.toLocaleDateString(settings.language === 'hi' ? 'hi-IN' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  // Tomorrow events
  const tomorrow = new Date(todayObj);
  tomorrow.setDate(todayObj.getDate() + 1);
  const tomorrowStr = formatDateToYYYYMMDD(tomorrow);

  const tomorrowClasses = getClassOccurrencesForDate(tomorrowStr, classSeries, classOverrides);
  const tomorrowEvents = events.filter(e => e.date === tomorrowStr);

  // Next upcoming events (day 2 to 7)
  const nextDaysEvents: Array<{ dayLabel: string; title: string; time: string }> = [];
  for (let i = 2; i <= 7; i++) {
    const d = new Date(todayObj);
    d.setDate(todayObj.getDate() + i);
    const dStr = formatDateToYYYYMMDD(d);
    const dayName = d.toLocaleDateString(settings.language === 'hi' ? 'hi-IN' : 'en-US', { weekday: 'long' });

    for (const ev of events.filter(e => e.date === dStr)) {
      nextDaysEvents.push({ dayLabel: dayName, title: ev.title, time: ev.startTime });
    }
    for (const cl of getClassOccurrencesForDate(dStr, classSeries, classOverrides)) {
      nextDaysEvents.push({ dayLabel: dayName, title: `${cl.courseName} class`, time: cl.startTime });
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-6">
      {/* 1. Header (24sp medium) */}
      <div>
        <h1 className="text-[24px] font-medium leading-[32px] text-[#171717] dark:text-[#F5F5F5]">
          {greeting}, {profile.name}
        </h1>
        <p className="text-[14px] leading-[20px] text-[#6B6B6B] dark:text-[#B4B4B4] mt-1">
          {dateFormatted}
        </p>
      </div>

      {/* 2. Today's Classes */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-medium leading-[24px] text-[#171717] dark:text-[#F5F5F5]">
            {t.today}
          </h2>
          <button
            onClick={() => openAddModal('class')}
            className="text-[14px] font-medium text-[#10A37F] hover:text-[#0E8F70] cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addClass}</span>
          </button>
        </div>

        {todayClasses.length === 0 ? (
          <div className="p-4 rounded-[10px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] text-center">
            <p className="text-[14px] text-[#6B6B6B] dark:text-[#B4B4B4]">
              {t.noClassesToday}
            </p>
            <button
              onClick={() => openImportModal('timetable')}
              className="mt-2 text-[14px] font-medium text-[#10A37F] hover:underline cursor-pointer"
            >
              {t.importTimetable}
            </button>
          </div>
        ) : (
          <div className="border border-[#E5E5E5] dark:border-[#3A3A3A] rounded-[10px] bg-[#FFFFFF] dark:bg-[#2A2A2A] divide-y divide-[#EEEEEE] dark:divide-[#353535] overflow-hidden">
            {todayClasses.map((item) => (
              <div
                key={item.occurrenceId}
                onClick={() => {
                  setCurrentDate(todayStr);
                  setActiveTab('calendar');
                }}
                className="p-3.5 flex items-center justify-between hover:bg-[#F7F7F8] dark:hover:bg-[#303030] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[14px] font-medium text-[#171717] dark:text-[#F5F5F5] min-w-[90px]">
                    {item.startTime}–{item.endTime}
                  </span>
                  <div>
                    <h3 className="text-[15px] font-medium text-[#171717] dark:text-[#F5F5F5]">
                      {item.courseName}
                    </h3>
                    {item.room && (
                      <p className="text-[12px] text-[#6B6B6B] dark:text-[#B4B4B4]">
                        {item.room}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. Tasks */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-medium leading-[24px] text-[#171717] dark:text-[#F5F5F5]">
            {t.tasks}
          </h2>
          <button
            onClick={() => openAddModal('task')}
            className="text-[14px] font-medium text-[#10A37F] hover:text-[#0E8F70] cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addTask}</span>
          </button>
        </div>

        {todayTasks.length === 0 ? (
          <div className="p-4 rounded-[10px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] text-center">
            <p className="text-[14px] text-[#6B6B6B] dark:text-[#B4B4B4]">
              {t.noTasksToday}
            </p>
          </div>
        ) : (
          <div className="border border-[#E5E5E5] dark:border-[#3A3A3A] rounded-[10px] bg-[#FFFFFF] dark:bg-[#2A2A2A] divide-y divide-[#EEEEEE] dark:divide-[#353535] overflow-hidden">
            {todayTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTaskComplete(task.id)}
                className="p-3.5 flex items-start gap-3 hover:bg-[#F7F7F8] dark:hover:bg-[#303030] transition-colors cursor-pointer select-none"
              >
                {/* Native Checkbox */}
                <div className={`w-5 h-5 rounded-[4px] border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                  task.completed
                    ? 'bg-[#10A37F] border-[#10A37F] text-white'
                    : 'border-[#B4B4B4] dark:border-[#6B6B6B] bg-transparent'
                }`}>
                  {task.completed && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                </div>

                <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                  <span className={`text-[15px] leading-[22px] ${
                    task.completed
                      ? 'line-through text-[#8E8E8E]'
                      : 'text-[#171717] dark:text-[#F5F5F5]'
                  }`}>
                    {task.title}
                  </span>
                  {task.dueTime && (
                    <span className="text-[12px] text-[#8E8E8E] shrink-0">
                      {task.dueTime}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Budget */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-medium leading-[24px] text-[#171717] dark:text-[#F5F5F5]">
            {t.budget}
          </h2>
          <button
            onClick={() => setActiveTab('finance')}
            className="text-[14px] font-medium text-[#10A37F] hover:text-[#0E8F70] cursor-pointer"
          >
            {t.finance}
          </button>
        </div>

        <div className="p-4 rounded-[10px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] space-y-4">
          {/* Target, Spent, Remaining */}
          <div className="grid grid-cols-3 gap-2 text-center pb-3 border-b border-[#EEEEEE] dark:border-[#353535]">
            <div>
              <span className="text-[12px] text-[#6B6B6B] dark:text-[#B4B4B4] block">{t.target}</span>
              <span className="text-[16px] font-medium text-[#171717] dark:text-[#F5F5F5] mt-0.5 block">
                ₹{budgetSummary.dailyTarget}
              </span>
            </div>
            <div>
              <span className="text-[12px] text-[#6B6B6B] dark:text-[#B4B4B4] block">{t.spent}</span>
              <span className="text-[16px] font-medium text-[#171717] dark:text-[#F5F5F5] mt-0.5 block">
                ₹{budgetSummary.spentToday}
              </span>
            </div>
            <div>
              <span className="text-[12px] text-[#6B6B6B] dark:text-[#B4B4B4] block">{t.remaining}</span>
              <span className={`text-[16px] font-medium mt-0.5 block ${
                budgetSummary.isOverBudget
                  ? 'text-[#D32F2F]'
                  : 'text-[#10A37F]'
              }`}>
                ₹{budgetSummary.remainingToday}
              </span>
            </div>
          </div>

          {/* Over budget explanation if applicable */}
          {budgetSummary.isOverBudget && settings.autoRecalculateBudget && (
            <p className="text-[13px] text-[#D32F2F] leading-[18px]">
              {t.overBudget} ₹{budgetSummary.overAmount}. {t.recommendedExplanation} ₹{budgetSummary.recommendedDailyBudget}/day.
            </p>
          )}

          {/* Balances */}
          {!settings.hideFinancialInfo && (
            <div className="space-y-1.5 text-[14px]">
              <div className="flex justify-between items-center text-[#6B6B6B] dark:text-[#B4B4B4]">
                <span>{t.upi}</span>
                <span className="text-[#171717] dark:text-[#F5F5F5]">₹{budgetSummary.upiBalance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-[#6B6B6B] dark:text-[#B4B4B4]">
                <span>{t.cash}</span>
                <span className="text-[#171717] dark:text-[#F5F5F5]">₹{budgetSummary.cashBalance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[#EEEEEE] dark:border-[#353535] font-medium">
                <span className="text-[#171717] dark:text-[#F5F5F5]">{t.total}</span>
                <span className="text-[#171717] dark:text-[#F5F5F5]">₹{budgetSummary.totalBalance.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. Upcoming */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-medium leading-[24px] text-[#171717] dark:text-[#F5F5F5]">
            {t.upcoming}
          </h2>
          <button
            onClick={() => setActiveTab('calendar')}
            className="text-[14px] font-medium text-[#10A37F] hover:text-[#0E8F70] cursor-pointer"
          >
            {t.navCalendar}
          </button>
        </div>

        <div className="border border-[#E5E5E5] dark:border-[#3A3A3A] rounded-[10px] bg-[#FFFFFF] dark:bg-[#2A2A2A] divide-y divide-[#EEEEEE] dark:divide-[#353535] overflow-hidden">
          {tomorrowClasses.length === 0 && tomorrowEvents.length === 0 && nextDaysEvents.length === 0 ? (
            <p className="p-4 text-center text-[14px] text-[#6B6B6B] dark:text-[#B4B4B4]">
              {t.noUpcoming}
            </p>
          ) : (
            <>
              {tomorrowClasses.map((c) => (
                <div key={c.occurrenceId} className="p-3.5 flex justify-between items-center text-[14px]">
                  <div>
                    <span className="text-[12px] text-[#8E8E8E] block">{t.tomorrow}</span>
                    <span className="font-medium text-[#171717] dark:text-[#F5F5F5]">{c.courseName} class</span>
                  </div>
                  <span className="text-[#6B6B6B] dark:text-[#B4B4B4]">{c.startTime}</span>
                </div>
              ))}
              {tomorrowEvents.map((e) => (
                <div key={e.id} className="p-3.5 flex justify-between items-center text-[14px]">
                  <div>
                    <span className="text-[12px] text-[#8E8E8E] block">{t.tomorrow}</span>
                    <span className="font-medium text-[#171717] dark:text-[#F5F5F5]">{e.title}</span>
                  </div>
                  <span className="text-[#6B6B6B] dark:text-[#B4B4B4]">{e.startTime}</span>
                </div>
              ))}
              {nextDaysEvents.slice(0, 3).map((item, idx) => (
                <div key={idx} className="p-3.5 flex justify-between items-center text-[14px]">
                  <div>
                    <span className="text-[12px] text-[#8E8E8E] block">{item.dayLabel}</span>
                    <span className="font-medium text-[#171717] dark:text-[#F5F5F5]">{item.title}</span>
                  </div>
                  <span className="text-[#6B6B6B] dark:text-[#B4B4B4]">{item.time}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </section>
    </div>
  );
};
