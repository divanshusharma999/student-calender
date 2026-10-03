import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatDateToYYYYMMDD } from '../utils/recurrence';
import { X } from 'lucide-react';
import { TaskPriority, PaymentMethod, EventType } from '../types';

export const AddModal: React.FC = () => {
  const {
    t,
    isAddModalOpen,
    setIsAddModalOpen,
    addModalInitialType,
    addClassSeries,
    addTask,
    addEvent,
    addTransaction
  } = useApp();

  type TabType = 'task' | 'class' | 'exam' | 'transaction';
  const [tab, setTab] = useState<TabType>((addModalInitialType as any) || 'task');

  const todayStr = formatDateToYYYYMMDD(new Date());

  // Task form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDueDate, setTaskDueDate] = useState(todayStr);
  const [taskDueTime, setTaskDueTime] = useState('18:00');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('MEDIUM');

  // Class form
  const [className, setClassName] = useState('');
  const [classDay, setClassDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'>('Monday');
  const [classStart, setClassStart] = useState('10:00');
  const [classEnd, setClassEnd] = useState('11:00');
  const [classRoom, setClassRoom] = useState('LH-2');

  // Exam form
  const [examType, setExamType] = useState<EventType>('EXAM');
  const [examTitle, setExamTitle] = useState('');
  const [examDate, setExamDate] = useState(todayStr);
  const [examStart, setExamStart] = useState('10:00');
  const [examEnd, setExamEnd] = useState('13:00');
  const [examRoom, setExamRoom] = useState('Exam Hall 1');

  // Transaction form
  const [txType, setTxType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [txAmount, setTxAmount] = useState('');
  const [txCategory, setTxCategory] = useState('Food');
  const [txMethod, setTxMethod] = useState<PaymentMethod>('UPI');
  const [txDesc, setTxDesc] = useState('');

  if (!isAddModalOpen) return null;

  const handleClose = () => {
    setIsAddModalOpen(false);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    addTask({
      title: taskTitle.trim(),
      description: taskDesc.trim() || undefined,
      dueDate: taskDueDate,
      dueTime: taskDueTime || undefined,
      priority: taskPriority,
      completed: false,
      reminderEnabled: true,
      reminderMinutesBefore: 15
    });
    handleClose();
    setTaskTitle('');
  };

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return;
    addClassSeries({
      courseId: `c-${Date.now()}`,
      courseName: className.trim(),
      dayOfWeek: classDay,
      startTime: classStart,
      endTime: classEnd,
      room: classRoom.trim() || undefined,
      recurrenceType: 'weekly',
      color: '#10A37F'
    });
    handleClose();
    setClassName('');
  };

  const handleAddExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim()) return;
    addEvent({
      type: examType,
      title: examTitle.trim(),
      date: examDate,
      startTime: examStart,
      endTime: examEnd || undefined,
      location: examRoom.trim() || undefined,
      reminderEnabled: true,
      reminderMinutesBefore: 60
    });
    handleClose();
    setExamTitle('');
  };

  const handleAddTx = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(txAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    addTransaction({
      type: txType,
      amount: amountNum,
      category: txCategory,
      description: txDesc.trim() || undefined,
      paymentMethod: txMethod,
      date: todayStr,
      time: nowTime
    });
    handleClose();
    setTxAmount('');
    setTxDesc('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FFFFFF] dark:bg-[#2A2A2A] rounded-[10px] max-w-md w-full border border-[#E5E5E5] dark:border-[#3A3A3A] overflow-hidden my-6">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#EEEEEE] dark:border-[#353535] flex items-center justify-between">
          <h2 className="text-[18px] font-medium text-[#171717] dark:text-[#F5F5F5]">
            {t.add}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 text-[#8E8E8E] hover:text-[#171717] dark:hover:text-[#F5F5F5] rounded-[4px] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="px-5 pt-3 flex gap-2 border-b border-[#EEEEEE] dark:border-[#353535]">
          {[
            { id: 'task', label: 'Task' },
            { id: 'class', label: 'Class' },
            { id: 'exam', label: 'Exam' },
            { id: 'transaction', label: 'Money' }
          ].map((tabItem) => (
            <button
              key={tabItem.id}
              onClick={() => setTab(tabItem.id as any)}
              className={`pb-2.5 text-[14px] font-medium border-b-2 transition-colors cursor-pointer ${
                tab === tabItem.id
                  ? 'border-[#10A37F] text-[#10A37F]'
                  : 'border-transparent text-[#6B6B6B] dark:text-[#B4B4B4]'
              }`}
            >
              {tabItem.label}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <div className="p-5">
          {tab === 'task' && (
            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#171717] dark:text-[#F5F5F5] mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete assignment 4"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full h-11 px-3 text-[14px] rounded-[8px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] text-[#171717] dark:text-[#F5F5F5] focus:outline-hidden focus:border-[#10A37F]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#171717] dark:text-[#F5F5F5] mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Optional details"
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full h-11 px-3 text-[14px] rounded-[8px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] text-[#171717] dark:text-[#F5F5F5] focus:outline-hidden focus:border-[#10A37F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium text-[#171717] dark:text-[#F5F5F5] mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full h-11 px-3 text-[14px] rounded-[8px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] text-[#171717] dark:text-[#F5F5F5]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#171717] dark:text-[#F5F5F5] mb-1">
                    Due Time
                  </label>
                  <input
                    type="time"
                    value={taskDueTime}
                    onChange={(e) => setTaskDueTime(e.target.value)}
                    className="w-full h-11 px-3 text-[14px] rounded-[8px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] text-[#171717] dark:text-[#F5F5F5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#171717] dark:text-[#F5F5F5] mb-1">
                  Priority
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['LOW', 'MEDIUM', 'HIGH'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setTaskPriority(p)}
                      className={`h-10 text-[13px] font-medium rounded-[8px] border transition-colors cursor-pointer ${
                        taskPriority === p
                          ? 'border-[#10A37F] bg-[#E6F6F1] dark:bg-[#1A3830] text-[#10A37F]'
                          : 'border-[#E5E5E5] dark:border-[#3A3A3A] text-[#6B6B6B] dark:text-[#B4B4B4]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="h-11 px-4 text-[14px] font-medium text-[#6B6B6B] dark:text-[#B4B4B4] hover:text-[#171717] cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="h-11 px-4 rounded-[8px] bg-[#10A37F] hover:bg-[#0E8F70] text-white text-[14px] font-medium transition-colors cursor-pointer"
                >
                  Add Task
                </button>
              </div>
            </form>
          )}

          {tab === 'class' && (
            <form onSubmit={handleAddClass} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#171717] dark:text-[#F5F5F5] mb-1">
                  Course Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mathematics"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full h-11 px-3 text-[14px] rounded-[8px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] text-[#171717] dark:text-[#F5F5F5] focus:outline-hidden focus:border-[#10A37F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium text-[#171717] dark:text-[#F5F5F5] mb-1">
                    Day of Week
                  </label>
                  <select
                    value={classDay}
                    onChange={(e: any) => setClassDay(e.target.value)}
                    className="w-full h-11 px-3 text-[14px] rounded-[8px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] text-[#171717] dark:text-[#F5F5F5]"
                  >
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#171717] dark:text-[#F5F5F5] mb-1">
                    Room / Hall
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. LH-2"
                    value={classRoom}
                    onChange={(e) => setClassRoom(e.target.value)}
                    className="w-full h-11 px-3 text-[14px] rounded-[8px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] text-[#171717] dark:text-[#F5F5F5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium text-[#171717] dark:text-[#F5F5F5] mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={classStart}
                    onChange={(e) => setClassStart(e.target.value)}
                    className="w-full h-11 px-3 text-[14px] rounded-[8px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] text-[#171717] dark:text-[#F5F5F5]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#171717] dark:text-[#F5F5F5] mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={classEnd}
                    onChange={(e) => setClassEnd(e.target.value)}
                    className="w-full h-11 px-3 text-[14px] rounded-[8px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] text-[#171717] dark:text-[#F5F5F5]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="h-11 px-4 text-[14px] font-medium text-[#6B6B6B] dark:text-[#B4B4B4] hover:text-[#171717] cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="h-11 px-4 rounded-[8px] bg-[#10A37F] hover:bg-[#0E8F70] text-white text-[14px] font-medium transition-colors cursor-pointer"
                >
                  Add Class
                </button>
              </div>
            </form>
          )}

          {tab === 'exam' && (
            <form onSubmit={handleAddExam} className="space-y-4">
              <div className="flex gap-2">
                {(['EXAM', 'TEST', 'ASSIGNMENT_DEADLINE'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setExamType(type)}
                    className={`flex-1 h-10 text-[13px] font-medium rounded-[8px] border transition-colors cursor-pointer ${
                      examType === type
                        ? 'border-[#10A37F] bg-[#E6F6F1] dark:bg-[#1A3830] text-[#10A37F]'
                        : 'border-[#E5E5E5] dark:border-[#3A3A3A] text-[#6B6B6B] dark:text-[#B4B4B4]'
                    }`}
                  >
                    {type === 'ASSIGNMENT_DEADLINE' ? 'Deadline' : type}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#171717] dark:text-[#F5F5F5] mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physics Midterm"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  className="w-full h-11 px-3 text-[14px] rounded-[8px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] text-[#171717] dark:text-[#F5F5F5] focus:outline-hidden focus:border-[#10A37F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium text-[#171717] dark:text-[#F5F5F5] mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full h-11 px-3 text-[14px] rounded-[8px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] text-[#171717] dark:text-[#F5F5F5]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#171717] dark:text-[#F5F5F5] mb-1">
                    Room / Venue
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Exam Hall 1"
                    value={examRoom}
                    onChange={(e) => setExamRoom(e.target.value)}
                    className="w-full h-11 px-3 text-[14px] rounded-[8px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] text-[#171717] dark:text-[#F5F5F5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium text-[#171717] dark:text-[#F5F5F5] mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={examStart}
                    onChange={(e) => setExamStart(e.target.value)}
                    className="w-full h-11 px-3 text-[14px] rounded-[8px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] text-[#171717] dark:text-[#F5F5F5]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#171717] dark:text-[#F5F5F5] mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={examEnd}
                    onChange={(e) => setExamEnd(e.target.value)}
                    className="w-full h-11 px-3 text-[14px] rounded-[8px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] text-[#171717] dark:text-[#F5F5F5]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="h-11 px-4 text-[14px] font-medium text-[#6B6B6B] dark:text-[#B4B4B4] hover:text-[#171717] cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="h-11 px-4 rounded-[8px] bg-[#10A37F] hover:bg-[#0E8F70] text-white text-[14px] font-medium transition-colors cursor-pointer"
                >
                  Add Event
                </button>
              </div>
            </form>
          )}

          {tab === 'transaction' && (
            <form onSubmit={handleAddTx} className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTxType('EXPENSE')}
                  className={`h-10 text-[13px] font-medium rounded-[8px] border transition-colors cursor-pointer ${
                    txType === 'EXPENSE'
                      ? 'border-[#171717] dark:border-[#F5F5F5] bg-[#F7F7F8] dark:bg-[#303030] text-[#171717] dark:text-[#F5F5F5]'
                      : 'border-[#E5E5E5] dark:border-[#3A3A3A] text-[#6B6B6B] dark:text-[#B4B4B4]'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('INCOME')}
                  className={`h-10 text-[13px] font-medium rounded-[8px] border transition-colors cursor-pointer ${
                    txType === 'INCOME'
                      ? 'border-[#10A37F] bg-[#E6F6F1] dark:bg-[#1A3830] text-[#10A37F]'
                      : 'border-[#E5E5E5] dark:border-[#3A3A3A] text-[#6B6B6B] dark:text-[#B4B4B4]'
                  }`}
                >
                  Income
                </button>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#171717] dark:text-[#F5F5F5] mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 80"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  className="w-full h-11 px-3 text-[16px] font-medium rounded-[8px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] text-[#171717] dark:text-[#F5F5F5] focus:outline-hidden focus:border-[#10A37F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium text-[#171717] dark:text-[#F5F5F5] mb-1">
                    Method
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(['UPI', 'CASH'] as const).map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setTxMethod(m)}
                        className={`h-10 text-[13px] font-medium rounded-[8px] border transition-colors cursor-pointer ${
                          txMethod === m
                            ? 'border-[#10A37F] bg-[#E6F6F1] dark:bg-[#1A3830] text-[#10A37F]'
                            : 'border-[#E5E5E5] dark:border-[#3A3A3A] text-[#6B6B6B] dark:text-[#B4B4B4]'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#171717] dark:text-[#F5F5F5] mb-1">
                    Category
                  </label>
                  <select
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value)}
                    className="w-full h-10 px-2.5 text-[14px] rounded-[8px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] text-[#171717] dark:text-[#F5F5F5]"
                  >
                    <option value="Food">Food</option>
                    <option value="Transport">Transport</option>
                    <option value="Stationery">Stationery</option>
                    <option value="Hostel">Hostel</option>
                    <option value="Allowance">Allowance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#171717] dark:text-[#F5F5F5] mb-1">
                  Note
                </label>
                <input
                  type="text"
                  placeholder="Optional note"
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                  className="w-full h-11 px-3 text-[14px] rounded-[8px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] text-[#171717] dark:text-[#F5F5F5]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="h-11 px-4 text-[14px] font-medium text-[#6B6B6B] dark:text-[#B4B4B4] hover:text-[#171717] cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="h-11 px-4 rounded-[8px] bg-[#10A37F] hover:bg-[#0E8F70] text-white text-[14px] font-medium transition-colors cursor-pointer"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
