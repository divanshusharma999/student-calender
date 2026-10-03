import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { NotificationBanner } from './components/NotificationBanner';
import { HomeScreen } from './components/home/HomeScreen';
import { CalendarScreen } from './components/calendar/CalendarScreen';
import { TasksScreen } from './components/tasks/TasksScreen';
import { FinanceScreen } from './components/finance/FinanceScreen';
import { SettingsScreen } from './components/settings/SettingsScreen';
import { AddModal } from './components/AddModal';
import { ImportModal } from './components/import/ImportModal';
import { GmailUpdatesModal } from './components/gmail/GmailUpdatesModal';

const MainContent: React.FC = () => {
  const { activeTab, settings, isGmailModalOpen, setIsGmailModalOpen } = useApp();

  return (
    <div className={`min-h-screen bg-[#FFFFFF] dark:bg-[#212121] text-[#171717] dark:text-[#F5F5F5] antialiased ${
      settings.lowEndMode ? 'transition-none' : 'transition-colors duration-100'
    }`}>
      {/* Top Header */}
      <Header />

      {/* Actionable Notification Banner */}
      <NotificationBanner />

      {/* Main Views */}
      <main className="w-full">
        {activeTab === 'home' && <HomeScreen />}
        {activeTab === 'calendar' && <CalendarScreen />}
        {activeTab === 'tasks' && <TasksScreen />}
        {activeTab === 'finance' && <FinanceScreen />}
        {activeTab === 'settings' && <SettingsScreen />}
      </main>

      {/* Universal + Add Modal */}
      <AddModal />

      {/* AI Timetable & Exam Schedule Import Modal */}
      <ImportModal />

      {/* Gmail Timetable Updates Modal */}
      <GmailUpdatesModal 
        isOpen={isGmailModalOpen} 
        onClose={() => setIsGmailModalOpen(false)} 
      />

      {/* Bottom Sticky Navigation */}
      <Navigation />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
