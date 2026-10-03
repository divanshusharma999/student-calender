import React from 'react';
import { useApp } from '../context/AppContext';
import { X } from 'lucide-react';

export const NotificationBanner: React.FC = () => {
  const { notifications, dismissNotification, toggleTaskComplete, snoozeTask, setActiveTab } = useApp();

  if (notifications.length === 0) return null;

  const current = notifications[0];

  return (
    <div className="bg-[#F7F7F8] dark:bg-[#303030] border-b border-[#E5E5E5] dark:border-[#3A3A3A] px-4 py-2.5">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[14px] font-medium text-[#171717] dark:text-[#F5F5F5] truncate">
            {current.title}
          </p>
          <p className="text-[12px] text-[#6B6B6B] dark:text-[#B4B4B4] truncate">
            {current.message}
          </p>
        </div>

        {/* Restrained Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {current.actionable && current.actionType === 'complete_task' && current.relatedId && (
            <>
              <button
                onClick={() => {
                  toggleTaskComplete(current.relatedId!);
                  dismissNotification(current.id);
                }}
                className="h-8 px-2.5 rounded-[8px] bg-[#10A37F] hover:bg-[#0E8F70] text-white text-[12px] font-medium transition-colors cursor-pointer"
              >
                Complete
              </button>
              <button
                onClick={() => {
                  snoozeTask(current.relatedId!, 30);
                  dismissNotification(current.id);
                }}
                className="h-8 px-2.5 rounded-[8px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] text-[#171717] dark:text-[#F5F5F5] text-[12px] font-medium hover:bg-[#F7F7F8] transition-colors cursor-pointer"
              >
                Snooze
              </button>
            </>
          )}

          {current.actionType === 'view_budget' && (
            <button
              onClick={() => {
                setActiveTab('finance');
                dismissNotification(current.id);
              }}
              className="h-8 px-2.5 rounded-[8px] bg-[#10A37F] hover:bg-[#0E8F70] text-white text-[12px] font-medium transition-colors cursor-pointer"
            >
              View Budget
            </button>
          )}

          <button
            onClick={() => dismissNotification(current.id)}
            className="p-1 text-[#8E8E8E] hover:text-[#171717] dark:hover:text-[#F5F5F5] rounded-[4px] cursor-pointer"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
