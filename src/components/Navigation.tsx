import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, Calendar, CheckSquare, IndianRupee } from 'lucide-react';

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, t } = useApp();

  const navItems = [
    { id: 'home', label: t.navHome, icon: Home },
    { id: 'calendar', label: t.navCalendar, icon: Calendar },
    { id: 'tasks', label: t.navTasks, icon: CheckSquare },
    { id: 'finance', label: t.navFinance, icon: IndianRupee },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#FFFFFF] dark:bg-[#2A2A2A] border-t border-[#E5E5E5] dark:border-[#3A3A3A]">
      <div className="max-w-2xl mx-auto h-14 flex items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 h-full flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer select-none ${
                isActive
                  ? 'text-[#10A37F]'
                  : 'text-[#6B6B6B] dark:text-[#B4B4B4] hover:text-[#171717] dark:hover:text-[#F5F5F5]'
              }`}
            >
              <Icon className="w-5 h-5 stroke-[1.8]" />
              <span className={`text-[12px] leading-none ${isActive ? 'font-medium' : 'font-normal'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
