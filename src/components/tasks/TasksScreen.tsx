import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDateToYYYYMMDD } from '../../utils/recurrence';
import { Check, Plus, Trash2, Clock } from 'lucide-react';

export const TasksScreen: React.FC = () => {
  const {
    t,
    tasks,
    toggleTaskComplete,
    deleteTask,
    snoozeTask,
    openAddModal
  } = useApp();

  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'recurring' | 'completed'>('today');
  const todayStr = formatDateToYYYYMMDD(new Date());

  const getFilteredTasks = () => {
    switch (activeTab) {
      case 'today':
        return tasks.filter(t => !t.completed && t.dueDate <= todayStr);
      case 'upcoming':
        return tasks.filter(t => !t.completed && t.dueDate > todayStr);
      case 'recurring':
        return tasks.filter(t => !!t.seriesId);
      case 'completed':
        return tasks.filter(t => t.completed);
      default:
        return [];
    }
  };

  const filteredTasks = getFilteredTasks();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-5">
      {/* Title & Add */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-medium leading-[32px] text-[#171717] dark:text-[#F5F5F5]">
            {t.tasks}
          </h1>
          <p className="text-[14px] text-[#6B6B6B] dark:text-[#B4B4B4] mt-0.5">
            {tasks.filter(t => !t.completed).length} pending
          </p>
        </div>
        <button
          onClick={() => openAddModal('task')}
          className="h-10 px-3.5 rounded-[8px] bg-[#10A37F] hover:bg-[#0E8F70] text-white text-[14px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addTask}</span>
        </button>
      </div>

      {/* Segmented Tabs */}
      <div className="flex h-10 p-0.5 rounded-[8px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#F7F7F8] dark:bg-[#303030]">
        {[
          { id: 'today', label: t.tabToday },
          { id: 'upcoming', label: t.tabUpcoming },
          { id: 'recurring', label: t.tabRecurring },
          { id: 'completed', label: t.tabCompleted }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 text-[13px] font-medium rounded-[6px] transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#FFFFFF] dark:bg-[#2A2A2A] text-[#171717] dark:text-[#F5F5F5] shadow-xs'
                : 'text-[#6B6B6B] dark:text-[#B4B4B4] hover:text-[#171717] dark:hover:text-[#F5F5F5]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tasks Checklist */}
      {filteredTasks.length === 0 ? (
        <div className="p-8 rounded-[10px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] text-center">
          <p className="text-[14px] text-[#6B6B6B] dark:text-[#B4B4B4]">
            {t.noTasksFound}
          </p>
        </div>
      ) : (
        <div className="border border-[#E5E5E5] dark:border-[#3A3A3A] rounded-[10px] bg-[#FFFFFF] dark:bg-[#2A2A2A] divide-y divide-[#EEEEEE] dark:divide-[#353535] overflow-hidden">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="p-3.5 flex items-start justify-between gap-3 hover:bg-[#F7F7F8] dark:hover:bg-[#303030] transition-colors select-none"
            >
              <div 
                onClick={() => toggleTaskComplete(task.id)}
                className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer"
              >
                {/* Native Checkbox */}
                <div className={`w-5 h-5 rounded-[4px] border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                  task.completed
                    ? 'bg-[#10A37F] border-[#10A37F] text-white'
                    : 'border-[#B4B4B4] dark:border-[#6B6B6B] bg-transparent'
                }`}>
                  {task.completed && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[15px] leading-[22px] ${
                      task.completed
                        ? 'line-through text-[#8E8E8E]'
                        : 'text-[#171717] dark:text-[#F5F5F5]'
                    }`}>
                      {task.title}
                    </span>
                    {task.priority === 'HIGH' && (
                      <span className="text-[12px] font-medium text-[#D32F2F]">
                        High
                      </span>
                    )}
                  </div>

                  {task.description && (
                    <p className="text-[13px] text-[#6B6B6B] dark:text-[#B4B4B4] mt-0.5">
                      {task.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-1 text-[12px] text-[#8E8E8E]">
                    <span>{task.dueDate}</span>
                    {task.dueTime && <span>• {task.dueTime}</span>}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {!task.completed && (
                  <button
                    onClick={() => snoozeTask(task.id, 30)}
                    title={t.snoozeReminder}
                    className="p-1.5 text-[#8E8E8E] hover:text-[#171717] dark:hover:text-[#F5F5F5] rounded-[4px] cursor-pointer"
                  >
                    <Clock className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => deleteTask(task.id)}
                  title={t.deleteTask}
                  className="p-1.5 text-[#8E8E8E] hover:text-[#D32F2F] rounded-[4px] cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
