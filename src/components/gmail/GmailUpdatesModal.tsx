import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  googleSignIn, 
  logout, 
  initAuth 
} from '../../services/googleAuth';
import { 
  fetchRecentEmailSuggestions, 
  EmailTimetableSuggestion 
} from '../../services/gmailService';
import { User } from 'firebase/auth';
import { 
  Mail, 
  X, 
  RefreshCw, 
  Check, 
  Edit2, 
  Trash2, 
  AlertCircle 
} from 'lucide-react';
import { formatDateToYYYYMMDD } from '../../utils/recurrence';

interface GmailUpdatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GmailUpdatesModal: React.FC<GmailUpdatesModalProps> = ({ isOpen, onClose }) => {
  const { 
    addClassSeries, 
    addClassOverride, 
    addEvent, 
    classSeries 
  } = useApp();

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<EmailTimetableSuggestion[]>([]);
  const [editingSuggestion, setEditingSuggestion] = useState<EmailTimetableSuggestion | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Monitor auth status
  useEffect(() => {
    const unsubscribe = initAuth(
      (authUser, authToken) => {
        setUser(authUser);
        setToken(authToken);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    setErrorMsg(null);
    setIsSigningIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        // Automatically start scanning after successful sign-in
        handleScanEmails();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign in with Google');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setToken(null);
    setSuggestions([]);
    setEditingSuggestion(null);
  };

  const handleScanEmails = async () => {
    setErrorMsg(null);
    setIsScanning(true);
    try {
      const results = await fetchRecentEmailSuggestions();
      setSuggestions(results);
      if (results.length === 0) {
        setSuccessNotice('Inbox scanned: No new schedule or timetable updates detected.');
      } else {
        setSuccessNotice(`Scan complete: ${results.length} timetable update(s) detected.`);
      }
      setTimeout(() => setSuccessNotice(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to scan emails');
    } finally {
      setIsScanning(false);
    }
  };

  // Implement suggestion into timetable with user confirmation
  const handleImplement = (sug: EmailTimetableSuggestion) => {
    const todayStr = formatDateToYYYYMMDD(new Date());

    if (sug.actionType === 'CANCEL') {
      // Find matching class series to add a cancellation override
      const match = classSeries.find(
        cs => cs.courseName.toLowerCase().includes(sug.courseName.toLowerCase()) ||
              sug.courseName.toLowerCase().includes(cs.courseName.toLowerCase())
      );
      if (match) {
        addClassOverride({
          classSeriesId: match.id,
          originalDate: sug.date || todayStr,
          cancelled: true
        });
        setSuccessNotice(`Cancelled class "${match.courseName}" for ${sug.dayOfWeek}.`);
      } else {
        setSuccessNotice(`Recorded note: ${sug.courseName} class cancelled.`);
      }
    } else if (sug.actionType === 'EXAM') {
      addEvent({
        type: 'EXAM',
        title: `${sug.courseName} Exam`,
        date: sug.date || todayStr,
        startTime: sug.startTime,
        endTime: sug.endTime,
        location: sug.room,
        courseName: sug.courseName,
        reminderEnabled: true,
        reminderMinutesBefore: 60
      });
      setSuccessNotice(`Added exam for "${sug.courseName}" on ${sug.dayOfWeek} at ${sug.startTime}.`);
    } else {
      // NEW_CLASS or RESCHEDULE
      addClassSeries({
        courseId: `c-${Date.now()}`,
        courseName: sug.courseName,
        dayOfWeek: sug.dayOfWeek,
        startTime: sug.startTime,
        endTime: sug.endTime,
        room: sug.room,
        recurrenceType: 'weekly',
        color: '#10A37F'
      });
      setSuccessNotice(`Added "${sug.courseName}" to your weekly timetable (${sug.dayOfWeek} ${sug.startTime}–${sug.endTime}).`);
    }

    // Remove from active list
    setSuggestions(prev => prev.filter(item => item.id !== sug.id));
    setEditingSuggestion(null);
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  const handleDismiss = (id: string) => {
    setSuggestions(prev => prev.filter(item => item.id !== id));
    if (editingSuggestion?.id === id) {
      setEditingSuggestion(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FFFFFF] dark:bg-[#2A2A2A] rounded-[10px] max-w-xl w-full border border-[#E5E5E5] dark:border-[#3A3A3A] overflow-hidden my-6">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#EEEEEE] dark:border-[#353535] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Mail className="w-5 h-5 text-[#10A37F]" />
            <h2 className="text-[18px] font-medium text-[#171717] dark:text-[#F5F5F5]">
              Gmail Timetable Updates
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#8E8E8E] hover:text-[#171717] dark:hover:text-[#F5F5F5] rounded-[4px] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Notifications */}
          {errorMsg && (
            <div className="p-3 rounded-[8px] bg-[#FFF2F2] dark:bg-[#3D1A1A] border border-[#D32F2F] text-[#D32F2F] text-[13px] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successNotice && (
            <div className="p-3 rounded-[8px] bg-[#E6F6F1] dark:bg-[#1A3830] border border-[#10A37F] text-[#10A37F] text-[13px] flex items-start gap-2">
              <Check className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Authentication State */}
          {!user || !token ? (
            <div className="p-6 rounded-[8px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#F7F7F8] dark:bg-[#303030] text-center space-y-4">
              <div>
                <h3 className="text-[16px] font-medium text-[#171717] dark:text-[#F5F5F5]">
                  Connect Your Student Email
                </h3>
                <p className="text-[13px] text-[#6B6B6B] dark:text-[#B4B4B4] mt-1 max-w-md mx-auto">
                  Student OS will read emails (read-only) to detect class schedules, cancellations, and exam notices. No changes are made without your explicit confirmation.
                </p>
              </div>

              {/* Official Google Sign-In Button */}
              <div className="flex justify-center pt-1">
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  className="inline-flex items-center gap-3 px-4 py-2.5 bg-[#FFFFFF] dark:bg-[#2A2A2A] border border-[#747775] dark:border-[#5E5E5E] rounded-[4px] text-[14px] font-medium text-[#1F1F1F] dark:text-[#E3E3E3] hover:bg-[#F8F9FA] dark:hover:bg-[#353535] shadow-xs cursor-pointer transition-colors disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  <span>{isSigningIn ? 'Signing in...' : 'Sign in with Google'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Account Bar */}
              <div className="p-3.5 rounded-[8px] bg-[#F7F7F8] dark:bg-[#303030] flex items-center justify-between">
                <div>
                  <div className="text-[14px] font-medium text-[#171717] dark:text-[#F5F5F5]">
                    {user.displayName || user.email}
                  </div>
                  <div className="text-[12px] text-[#6B6B6B] dark:text-[#B4B4B4]">
                    {user.email} • Gmail Read-Only Access
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleScanEmails}
                    disabled={isScanning}
                    className="h-9 px-3 rounded-[6px] bg-[#10A37F] hover:bg-[#0E8F70] text-white text-[13px] font-medium flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                    <span>{isScanning ? 'Scanning...' : 'Scan Emails'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="h-9 px-2.5 rounded-[6px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] text-[13px] text-[#6B6B6B] dark:text-[#B4B4B4] hover:text-[#D32F2F] cursor-pointer"
                  >
                    Disconnect
                  </button>
                </div>
              </div>

              {/* Suggestions List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-medium text-[#171717] dark:text-[#F5F5F5]">
                    Detected Updates ({suggestions.length})
                  </span>
                  <span className="text-[12px] text-[#8E8E8E]">
                    Review and confirm before applying
                  </span>
                </div>

                {suggestions.length === 0 ? (
                  <div className="p-8 rounded-[8px] border border-[#E5E5E5] dark:border-[#3A3A3A] text-center">
                    <p className="text-[14px] text-[#6B6B6B] dark:text-[#B4B4B4]">
                      {isScanning ? 'Scanning your recent messages for class and timetable notices...' : 'No timetable updates currently detected in your emails. Tap "Scan Emails" to check again.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {suggestions.map((sug) => {
                      const isEditing = editingSuggestion?.id === sug.id;
                      const activeItem = isEditing ? editingSuggestion : sug;

                      return (
                        <div
                          key={sug.id}
                          className="p-4 rounded-[8px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] space-y-3"
                        >
                          {/* Email source header */}
                          <div className="flex items-start justify-between gap-2 pb-2 border-b border-[#EEEEEE] dark:border-[#353535]">
                            <div>
                              <span className="text-[11px] font-medium text-[#8E8E8E] block uppercase tracking-wider">
                                Email: {sug.emailSubject}
                              </span>
                              <span className="text-[12px] text-[#6B6B6B] dark:text-[#B4B4B4]">
                                From: {sug.emailFrom} ({sug.emailDate})
                              </span>
                            </div>
                            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-[4px] ${
                              sug.actionType === 'CANCEL'
                                ? 'bg-[#FFF2F2] text-[#D32F2F]'
                                : sug.actionType === 'EXAM'
                                  ? 'bg-[#FEF3C7] text-[#D97706]'
                                  : 'bg-[#E6F6F1] text-[#10A37F]'
                            }`}>
                              {sug.actionType}
                            </span>
                          </div>

                          {/* Editable fields */}
                          {isEditing ? (
                            <div className="space-y-3 pt-1">
                              <div className="grid grid-cols-2 gap-2 text-[13px]">
                                <div>
                                  <label className="text-[12px] text-[#6B6B6B] dark:text-[#B4B4B4] block mb-1">
                                    Course Name
                                  </label>
                                  <input
                                    type="text"
                                    value={activeItem.courseName}
                                    onChange={(e) => setEditingSuggestion({ ...activeItem, courseName: e.target.value })}
                                    className="w-full h-9 px-2.5 rounded-[6px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] text-[#171717] dark:text-[#F5F5F5]"
                                  />
                                </div>
                                <div>
                                  <label className="text-[12px] text-[#6B6B6B] dark:text-[#B4B4B4] block mb-1">
                                    Day of Week
                                  </label>
                                  <select
                                    value={activeItem.dayOfWeek}
                                    onChange={(e: any) => setEditingSuggestion({ ...activeItem, dayOfWeek: e.target.value })}
                                    className="w-full h-9 px-2.5 rounded-[6px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] text-[#171717] dark:text-[#F5F5F5]"
                                  >
                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                                      <option key={d} value={d}>{d}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-2 text-[13px]">
                                <div>
                                  <label className="text-[12px] text-[#6B6B6B] dark:text-[#B4B4B4] block mb-1">
                                    Start Time
                                  </label>
                                  <input
                                    type="time"
                                    value={activeItem.startTime}
                                    onChange={(e) => setEditingSuggestion({ ...activeItem, startTime: e.target.value })}
                                    className="w-full h-9 px-2 rounded-[6px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] text-[#171717] dark:text-[#F5F5F5]"
                                  />
                                </div>
                                <div>
                                  <label className="text-[12px] text-[#6B6B6B] dark:text-[#B4B4B4] block mb-1">
                                    End Time
                                  </label>
                                  <input
                                    type="time"
                                    value={activeItem.endTime}
                                    onChange={(e) => setEditingSuggestion({ ...activeItem, endTime: e.target.value })}
                                    className="w-full h-9 px-2 rounded-[6px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] text-[#171717] dark:text-[#F5F5F5]"
                                  />
                                </div>
                                <div>
                                  <label className="text-[12px] text-[#6B6B6B] dark:text-[#B4B4B4] block mb-1">
                                    Room
                                  </label>
                                  <input
                                    type="text"
                                    value={activeItem.room}
                                    onChange={(e) => setEditingSuggestion({ ...activeItem, room: e.target.value })}
                                    className="w-full h-9 px-2.5 rounded-[6px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] text-[#171717] dark:text-[#F5F5F5]"
                                  />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between text-[14px]">
                              <div>
                                <span className="font-medium text-[#171717] dark:text-[#F5F5F5]">
                                  {sug.courseName}
                                </span>
                                <span className="text-[#6B6B6B] dark:text-[#B4B4B4] block text-[13px]">
                                  {sug.dayOfWeek} • {sug.startTime}–{sug.endTime} • Room {sug.room}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EEEEEE] dark:border-[#353535]">
                            <button
                              type="button"
                              onClick={() => handleDismiss(sug.id)}
                              className="h-8 px-2.5 text-[12px] text-[#8E8E8E] hover:text-[#D32F2F] cursor-pointer flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Dismiss</span>
                            </button>

                            {isEditing ? (
                              <button
                                type="button"
                                onClick={() => setEditingSuggestion(null)}
                                className="h-8 px-2.5 text-[12px] border border-[#E5E5E5] dark:border-[#3A3A3A] rounded-[6px] text-[#6B6B6B] cursor-pointer"
                              >
                                Cancel Edit
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setEditingSuggestion(sug)}
                                className="h-8 px-2.5 text-[12px] border border-[#E5E5E5] dark:border-[#3A3A3A] rounded-[6px] text-[#171717] dark:text-[#F5F5F5] hover:bg-[#F7F7F8] dark:hover:bg-[#303030] cursor-pointer flex items-center gap-1"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                const confirmed = window.confirm(
                                  `Confirm updating your timetable with: "${activeItem.courseName}" on ${activeItem.dayOfWeek} (${activeItem.startTime}–${activeItem.endTime}, Room ${activeItem.room})?`
                                );
                                if (confirmed) {
                                  handleImplement(activeItem);
                                }
                              }}
                              className="h-8 px-3 rounded-[6px] bg-[#10A37F] hover:bg-[#0E8F70] text-white text-[12px] font-medium cursor-pointer flex items-center gap-1 transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Confirm & Implement</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
