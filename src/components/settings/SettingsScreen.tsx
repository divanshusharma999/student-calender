import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDateToYYYYMMDD } from '../../utils/recurrence';
import { Copy, Check, Mail } from 'lucide-react';
import { CANONICAL_TIMETABLE_PROMPT, CANONICAL_EXAM_PROMPT } from '../../utils/jsonValidator';

export const SettingsScreen: React.FC = () => {
  const {
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
    resetToDefaultData,
    clearAllData,
    openGmailModal
  } = useApp();

  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPrompt(id);
      setTimeout(() => setCopiedPrompt(null), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportData = () => {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      profile,
      settings,
      courses,
      classSeries,
      classOverrides,
      events,
      tasks,
      transactions
    };
    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student_os_backup_${formatDateToYYYYMMDD(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.profile) setProfile(parsed.profile);
        if (parsed.settings) setSettings(parsed.settings);
        alert('Backup data successfully loaded.');
      } catch (err: any) {
        alert('Failed to parse backup JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-6">
      <div>
        <h1 className="text-[24px] font-medium leading-[32px] text-[#171717] dark:text-[#F5F5F5]">
          {t.navSettings}
        </h1>
        <p className="text-[14px] text-[#6B6B6B] dark:text-[#B4B4B4] mt-0.5">
          Preferences & data management
        </p>
      </div>

      <div className="space-y-4">
        {/* 1. Profile & Semester */}
        <section className="p-4 rounded-[10px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] space-y-3">
          <h2 className="text-[16px] font-medium text-[#171717] dark:text-[#F5F5F5] pb-2 border-b border-[#EEEEEE] dark:border-[#353535]">
            {t.profileSemester}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
            <div>
              <label className="text-[#6B6B6B] dark:text-[#B4B4B4] block mb-1">Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
                className="w-full h-10 px-3 rounded-[8px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] text-[#171717] dark:text-[#F5F5F5]"
              />
            </div>
            <div>
              <label className="text-[#6B6B6B] dark:text-[#B4B4B4] block mb-1">Institution</label>
              <input
                type="text"
                value={profile.institution}
                onChange={(e) => setProfile(p => ({ ...p, institution: e.target.value }))}
                className="w-full h-10 px-3 rounded-[8px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] text-[#171717] dark:text-[#F5F5F5]"
              />
            </div>
            <div>
              <label className="text-[#6B6B6B] dark:text-[#B4B4B4] block mb-1">Program / Degree</label>
              <input
                type="text"
                value={profile.program}
                onChange={(e) => setProfile(p => ({ ...p, program: e.target.value }))}
                className="w-full h-10 px-3 rounded-[8px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] text-[#171717] dark:text-[#F5F5F5]"
              />
            </div>
            <div>
              <label className="text-[#6B6B6B] dark:text-[#B4B4B4] block mb-1">Semester</label>
              <input
                type="text"
                value={profile.semester}
                onChange={(e) => setProfile(p => ({ ...p, semester: e.target.value }))}
                className="w-full h-10 px-3 rounded-[8px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] text-[#171717] dark:text-[#F5F5F5]"
              />
            </div>
          </div>
        </section>

        {/* 2. Calendar & Timetable Settings */}
        <section className="p-4 rounded-[10px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] space-y-3">
          <h2 className="text-[16px] font-medium text-[#171717] dark:text-[#F5F5F5] pb-2 border-b border-[#EEEEEE] dark:border-[#353535]">
            {t.calendarTimetable}
          </h2>

          <div className="space-y-3 text-[14px]">
            <div className="flex items-center justify-between">
              <span className="text-[#171717] dark:text-[#F5F5F5]">Default Calendar View</span>
              <select
                value={settings.defaultCalendarView}
                onChange={(e: any) => setSettings(s => ({ ...s, defaultCalendarView: e.target.value }))}
                className="h-9 px-2.5 rounded-[8px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] text-[#171717] dark:text-[#F5F5F5]"
              >
                <option value="month">Month</option>
                <option value="week">Week</option>
                <option value="day">Day</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#171717] dark:text-[#F5F5F5]">First Day of Week</span>
              <select
                value={settings.firstDayOfWeek}
                onChange={(e: any) => setSettings(s => ({ ...s, firstDayOfWeek: e.target.value }))}
                className="h-9 px-2.5 rounded-[8px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] text-[#171717] dark:text-[#F5F5F5]"
              >
                <option value="monday">Monday</option>
                <option value="sunday">Sunday</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#171717] dark:text-[#F5F5F5]">Show Room Numbers</span>
              <input
                type="checkbox"
                checked={settings.showRoomNumbers}
                onChange={(e) => setSettings(s => ({ ...s, showRoomNumbers: e.target.checked }))}
                className="w-4 h-4 accent-[#10A37F]"
              />
            </div>
          </div>
        </section>

        {/* 3. Gmail Schedule Sync */}
        <section className="p-4 rounded-[10px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#EEEEEE] dark:border-[#353535]">
            <h2 className="text-[16px] font-medium text-[#171717] dark:text-[#F5F5F5]">
              Gmail Timetable Sync
            </h2>
            <button
              onClick={openGmailModal}
              className="h-8 px-3 rounded-[6px] bg-[#10A37F] hover:bg-[#0E8F70] text-white text-[12px] font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Connect / Scan</span>
            </button>
          </div>
          <p className="text-[13px] text-[#6B6B6B] dark:text-[#B4B4B4] leading-[18px]">
            Read class schedules, cancellations, and exam notices from your student inbox with read-only access (<code className="text-[12px] font-mono">gmail.readonly</code>). You can review, edit, and confirm each suggestion before applying it.
          </p>
        </section>

        {/* 3. Finance & Budget Settings */}
        <section className="p-4 rounded-[10px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] space-y-3">
          <h2 className="text-[16px] font-medium text-[#171717] dark:text-[#F5F5F5] pb-2 border-b border-[#EEEEEE] dark:border-[#353535]">
            {t.financeBudget}
          </h2>

          <div className="space-y-3 text-[14px]">
            <div className="grid grid-cols-2 gap-3 text-[13px]">
              <div>
                <label className="text-[#6B6B6B] dark:text-[#B4B4B4] block mb-1">Daily Target (₹)</label>
                <input
                  type="number"
                  value={settings.dailyBudget}
                  onChange={(e) => setSettings(s => ({ ...s, dailyBudget: parseFloat(e.target.value) || 0 }))}
                  className="w-full h-10 px-3 rounded-[8px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] text-[#171717] dark:text-[#F5F5F5]"
                />
              </div>
              <div>
                <label className="text-[#6B6B6B] dark:text-[#B4B4B4] block mb-1">Monthly Target (₹)</label>
                <input
                  type="number"
                  value={settings.monthlyBudget}
                  onChange={(e) => setSettings(s => ({ ...s, monthlyBudget: parseFloat(e.target.value) || 0 }))}
                  className="w-full h-10 px-3 rounded-[8px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] text-[#171717] dark:text-[#F5F5F5]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-[#171717] dark:text-[#F5F5F5] block">
                  Dynamic Future Budget Recalculation
                </span>
                <span className="text-[12px] text-[#6B6B6B] dark:text-[#B4B4B4]">
                  Recalculates recommended daily spend if over budget
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.autoRecalculateBudget}
                onChange={(e) => setSettings(s => ({ ...s, autoRecalculateBudget: e.target.checked }))}
                className="w-4 h-4 accent-[#10A37F]"
              />
            </div>
          </div>
        </section>

        {/* 4. AI Import Prompts */}
        <section className="p-4 rounded-[10px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] space-y-3">
          <h2 className="text-[16px] font-medium text-[#171717] dark:text-[#F5F5F5] pb-2 border-b border-[#EEEEEE] dark:border-[#353535]">
            {t.aiImportSettings}
          </h2>

          <p className="text-[13px] text-[#6B6B6B] dark:text-[#B4B4B4] leading-[18px]">
            Copy prompts below to generate valid JSON with any external AI tool.
          </p>

          <div className="space-y-2">
            <div className="p-3 rounded-[8px] bg-[#F7F7F8] dark:bg-[#303030] flex items-center justify-between">
              <div>
                <span className="text-[14px] font-medium text-[#171717] dark:text-[#F5F5F5] block">
                  Timetable Prompt
                </span>
                <span className="text-[12px] text-[#6B6B6B] dark:text-[#B4B4B4]">
                  Format for weekly classes, course codes & rooms
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(CANONICAL_TIMETABLE_PROMPT, 'timetable')}
                className="h-8 px-2.5 rounded-[6px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] text-[13px] font-medium text-[#171717] dark:text-[#F5F5F5] flex items-center gap-1.5 hover:bg-[#F7F7F8] cursor-pointer"
              >
                {copiedPrompt === 'timetable' ? <Check className="w-3.5 h-3.5 text-[#10A37F]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPrompt === 'timetable' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="p-3 rounded-[8px] bg-[#F7F7F8] dark:bg-[#303030] flex items-center justify-between">
              <div>
                <span className="text-[14px] font-medium text-[#171717] dark:text-[#F5F5F5] block">
                  Exam Schedule Prompt
                </span>
                <span className="text-[12px] text-[#6B6B6B] dark:text-[#B4B4B4]">
                  Format for exam dates, times & rooms
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(CANONICAL_EXAM_PROMPT, 'exam')}
                className="h-8 px-2.5 rounded-[6px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] text-[13px] font-medium text-[#171717] dark:text-[#F5F5F5] flex items-center gap-1.5 hover:bg-[#F7F7F8] cursor-pointer"
              >
                {copiedPrompt === 'exam' ? <Check className="w-3.5 h-3.5 text-[#10A37F]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPrompt === 'exam' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </section>

        {/* 5. Data & Backup */}
        <section className="p-4 rounded-[10px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] space-y-3">
          <h2 className="text-[16px] font-medium text-[#171717] dark:text-[#F5F5F5] pb-2 border-b border-[#EEEEEE] dark:border-[#353535]">
            {t.dataBackup}
          </h2>

          <input
            ref={backupInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImportBackup}
            className="hidden"
          />

          <div className="grid grid-cols-2 gap-2 text-[13px]">
            <button
              onClick={handleExportData}
              className="h-10 px-3 rounded-[8px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#F7F7F8] dark:bg-[#303030] text-[#171717] dark:text-[#F5F5F5] font-medium hover:bg-[#EEEEEE] cursor-pointer"
            >
              Export JSON
            </button>
            <button
              onClick={() => backupInputRef.current?.click()}
              className="h-10 px-3 rounded-[8px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#F7F7F8] dark:bg-[#303030] text-[#171717] dark:text-[#F5F5F5] font-medium hover:bg-[#EEEEEE] cursor-pointer"
            >
              Import Backup
            </button>
            <button
              onClick={resetToDefaultData}
              className="h-10 px-3 rounded-[8px] border border-[#E5E5E5] dark:border-[#3A3A3A] text-[#D97706] font-medium hover:bg-[#F7F7F8] dark:hover:bg-[#303030] cursor-pointer"
            >
              Reset Sample
            </button>
            <button
              onClick={() => {
                if (confirm('Clear all data from this device?')) {
                  clearAllData();
                }
              }}
              className="h-10 px-3 rounded-[8px] border border-[#E5E5E5] dark:border-[#3A3A3A] text-[#D32F2F] font-medium hover:bg-[#F7F7F8] dark:hover:bg-[#303030] cursor-pointer"
            >
              Clear All Data
            </button>
          </div>
        </section>

        {/* 6. Appearance & Low-End Mode */}
        <section className="p-4 rounded-[10px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] space-y-3">
          <h2 className="text-[16px] font-medium text-[#171717] dark:text-[#F5F5F5] pb-2 border-b border-[#EEEEEE] dark:border-[#353535]">
            {t.appearance}
          </h2>

          <div className="space-y-3 text-[14px]">
            <div className="flex items-center justify-between">
              <span className="text-[#171717] dark:text-[#F5F5F5]">{t.theme}</span>
              <div className="flex h-8 p-0.5 rounded-[6px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#F7F7F8] dark:bg-[#303030] text-[12px] font-medium">
                {(['light', 'dark', 'system'] as const).map(themeOption => (
                  <button
                    key={themeOption}
                    onClick={() => setSettings(s => ({ ...s, theme: themeOption }))}
                    className={`px-2.5 rounded-[4px] capitalize cursor-pointer transition-colors ${
                      settings.theme === themeOption
                        ? 'bg-[#FFFFFF] dark:bg-[#2A2A2A] text-[#171717] dark:text-[#F5F5F5] shadow-xs'
                        : 'text-[#6B6B6B] dark:text-[#B4B4B4]'
                    }`}
                  >
                    {themeOption}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-[#171717] dark:text-[#F5F5F5] block">
                  {t.lowEndMode}
                </span>
                <span className="text-[12px] text-[#6B6B6B] dark:text-[#B4B4B4]">
                  {t.lowEndDesc}
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.lowEndMode}
                onChange={(e) => setSettings(s => ({ ...s, lowEndMode: e.target.checked }))}
                className="w-4 h-4 accent-[#10A37F]"
              />
            </div>
          </div>
        </section>

        {/* 7. Privacy & Security */}
        <section className="p-4 rounded-[10px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] space-y-3">
          <h2 className="text-[16px] font-medium text-[#171717] dark:text-[#F5F5F5] pb-2 border-b border-[#EEEEEE] dark:border-[#353535]">
            {t.privacySecurity}
          </h2>

          <div className="flex items-center justify-between text-[14px]">
            <div>
              <span className="text-[#171717] dark:text-[#F5F5F5] block">
                {t.hideFinancialInfo}
              </span>
              <span className="text-[12px] text-[#6B6B6B] dark:text-[#B4B4B4]">
                Hides balances on the home screen
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.hideFinancialInfo}
              onChange={(e) => setSettings(s => ({ ...s, hideFinancialInfo: e.target.checked }))}
              className="w-4 h-4 accent-[#10A37F]"
            />
          </div>
        </section>

        {/* 8. About (Section 37) */}
        <section className="p-4 rounded-[10px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] space-y-2 text-[14px]">
          <h2 className="text-[16px] font-medium text-[#171717] dark:text-[#F5F5F5] pb-2 border-b border-[#EEEEEE] dark:border-[#353535]">
            {t.about}
          </h2>

          <div className="pt-1">
            <span className="font-medium text-[#171717] dark:text-[#F5F5F5]">Student OS</span>
            <p className="text-[13px] text-[#6B6B6B] dark:text-[#B4B4B4] mt-0.5">{t.developedBy}</p>
          </div>

          <div className="pt-2 border-t border-[#EEEEEE] dark:border-[#353535]">
            <a
              href="mailto:ms25237@iisermohali.ac.in?subject=Student%20OS%20Feedback"
              className="inline-flex items-center gap-1.5 text-[13px] text-[#10A37F] hover:underline"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{t.reportProblem}: ms25237@iisermohali.ac.in</span>
            </a>
          </div>

          <p className="text-[12px] text-[#8E8E8E] pt-1">
            {t.version}
          </p>
        </section>
      </div>
    </div>
  );
};
