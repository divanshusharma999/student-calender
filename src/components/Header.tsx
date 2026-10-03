import React from 'react';
import { useApp } from '../context/AppContext';
import { Settings as SettingsIcon, Plus, Mail } from 'lucide-react';

export const Header: React.FC = () => {
  const { language, setLanguage, t, activeTab, setActiveTab, openAddModal, openGmailModal } = useApp();

  return (
    <header className="sticky top-0 z-30 bg-[#FFFFFF] dark:bg-[#2A2A2A] border-b border-[#E5E5E5] dark:border-[#3A3A3A] px-4 h-14 flex items-center">
      <div className="max-w-2xl mx-auto w-full flex items-center justify-between">
        {/* App Title */}
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <span className="text-[18px] font-medium tracking-tight text-[#171717] dark:text-[#F5F5F5]">
            Student OS
          </span>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Add Button */}
          <button
            onClick={() => openAddModal('task')}
            title="Add item"
            className="h-9 px-3 rounded-[8px] bg-[#10A37F] hover:bg-[#0E8F70] text-white text-[13px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t.add}</span>
          </button>

          {/* Gmail Timetable Sync */}
          <button
            onClick={openGmailModal}
            title="Gmail Timetable Sync"
            className="h-9 w-9 rounded-[8px] border border-[#E5E5E5] dark:border-[#3A3A3A] flex items-center justify-center text-[#6B6B6B] dark:text-[#B4B4B4] hover:bg-[#F7F7F8] dark:hover:bg-[#303030] transition-colors cursor-pointer"
          >
            <Mail className="w-4 h-4" />
          </button>

          {/* Language Switch */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="h-9 px-2.5 rounded-[8px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] hover:bg-[#F7F7F8] dark:hover:bg-[#303030] text-[#171717] dark:text-[#F5F5F5] text-[13px] font-medium transition-colors cursor-pointer"
          >
            {language === 'en' ? 'हिंदी' : 'English'}
          </button>

          {/* Settings */}
          <button
            onClick={() => setActiveTab('settings')}
            title={t.navSettings}
            className={`h-9 w-9 rounded-[8px] border border-[#E5E5E5] dark:border-[#3A3A3A] flex items-center justify-center text-[#6B6B6B] dark:text-[#B4B4B4] hover:bg-[#F7F7F8] dark:hover:bg-[#303030] transition-colors cursor-pointer ${
              activeTab === 'settings' ? 'bg-[#F7F7F8] dark:bg-[#303030] text-[#171717] dark:text-[#F5F5F5]' : ''
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
