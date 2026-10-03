import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CANONICAL_TIMETABLE_PROMPT, 
  CANONICAL_EXAM_PROMPT, 
  validateAndPreviewImport 
} from '../../utils/jsonValidator';
import { ImportPreviewResult } from '../../types';
import { Copy, Check, Upload, X } from 'lucide-react';

export const ImportModal: React.FC = () => {
  const {
    t,
    isImportModalOpen,
    setIsImportModalOpen,
    importModalType,
    setImportModalType,
    classSeries,
    events,
    commitImport
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [previewResult, setPreviewResult] = useState<ImportPreviewResult | null>(null);
  const [step, setStep] = useState<'input' | 'preview'>('input');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isImportModalOpen) return null;

  const promptText = importModalType === 'timetable' ? CANONICAL_TIMETABLE_PROMPT : CANONICAL_EXAM_PROMPT;

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonText(content);
      runValidation(content);
    };
    reader.readAsText(file);
  };

  const runValidation = (textToValidate: string) => {
    const res = validateAndPreviewImport(textToValidate, classSeries, events);
    setPreviewResult(res);
    setStep('preview');
  };

  const handleCommit = (mode: 'new_only' | 'replace_matching') => {
    if (!previewResult || !previewResult.valid) return;
    commitImport(previewResult, mode);
    setIsImportModalOpen(false);
    setStep('input');
    setJsonText('');
    setPreviewResult(null);
  };

  const handleClose = () => {
    setIsImportModalOpen(false);
    setStep('input');
    setPreviewResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FFFFFF] dark:bg-[#2A2A2A] rounded-[10px] max-w-lg w-full border border-[#E5E5E5] dark:border-[#3A3A3A] overflow-hidden my-6">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#EEEEEE] dark:border-[#353535] flex items-center justify-between">
          <h2 className="text-[18px] font-medium text-[#171717] dark:text-[#F5F5F5]">
            {importModalType === 'timetable' ? 'Import Timetable' : 'Import Exam Schedule'}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 text-[#8E8E8E] hover:text-[#171717] dark:hover:text-[#F5F5F5] rounded-[4px] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-5 pt-3 flex gap-2 border-b border-[#EEEEEE] dark:border-[#353535]">
          <button
            onClick={() => {
              setImportModalType('timetable');
              setStep('input');
              setPreviewResult(null);
            }}
            className={`pb-2.5 text-[14px] font-medium border-b-2 transition-colors cursor-pointer ${
              importModalType === 'timetable'
                ? 'border-[#10A37F] text-[#10A37F]'
                : 'border-transparent text-[#6B6B6B] dark:text-[#B4B4B4]'
            }`}
          >
            Timetable
          </button>
          <button
            onClick={() => {
              setImportModalType('exam_schedule');
              setStep('input');
              setPreviewResult(null);
            }}
            className={`pb-2.5 text-[14px] font-medium border-b-2 transition-colors cursor-pointer ${
              importModalType === 'exam_schedule'
                ? 'border-[#10A37F] text-[#10A37F]'
                : 'border-transparent text-[#6B6B6B] dark:text-[#B4B4B4]'
            }`}
          >
            Exam Schedule
          </button>
        </div>

        {step === 'input' && (
          <div className="p-5 space-y-4">
            {/* Step 1: Copy Prompt */}
            <div className="p-3.5 rounded-[8px] bg-[#F7F7F8] dark:bg-[#303030] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-medium text-[#171717] dark:text-[#F5F5F5]">
                  Prompt
                </span>
                <button
                  onClick={handleCopyPrompt}
                  className="h-8 px-2.5 rounded-[6px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] text-[13px] font-medium text-[#171717] dark:text-[#F5F5F5] flex items-center gap-1.5 hover:bg-[#F7F7F8] cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#10A37F]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Prompt'}</span>
                </button>
              </div>
              <p className="text-[13px] text-[#6B6B6B] dark:text-[#B4B4B4] leading-[18px]">
                Copy this prompt and provide your timetable to an external AI to generate JSON.
              </p>
            </div>

            {/* Step 2: Upload file or paste JSON */}
            <div className="space-y-2">
              <label className="text-[14px] font-medium text-[#171717] dark:text-[#F5F5F5] block">
                JSON File or Text
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json,text/plain"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-11 px-3 rounded-[8px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#F7F7F8] dark:bg-[#303030] text-[14px] font-medium text-[#171717] dark:text-[#F5F5F5] flex items-center justify-center gap-2 hover:bg-[#EEEEEE] cursor-pointer"
              >
                <Upload className="w-4 h-4 text-[#6B6B6B] dark:text-[#B4B4B4]" />
                <span>Choose JSON file</span>
              </button>

              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                rows={4}
                placeholder="Or paste JSON here..."
                className="w-full p-3 rounded-[8px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] text-[13px] font-mono text-[#171717] dark:text-[#F5F5F5] focus:outline-hidden focus:border-[#10A37F]"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EEEEEE] dark:border-[#353535]">
              <button
                type="button"
                onClick={handleClose}
                className="h-10 px-4 text-[14px] font-medium text-[#6B6B6B] dark:text-[#B4B4B4] hover:text-[#171717] cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                disabled={!jsonText.trim()}
                onClick={() => runValidation(jsonText)}
                className="h-10 px-4 rounded-[8px] bg-[#10A37F] hover:bg-[#0E8F70] disabled:opacity-40 text-white text-[14px] font-medium cursor-pointer transition-colors"
              >
                Validate & Preview
              </button>
            </div>
          </div>
        )}

        {/* Step: Preview */}
        {step === 'preview' && previewResult && (
          <div className="p-5 space-y-4">
            {!previewResult.valid ? (
              <div className="p-4 rounded-[8px] border border-[#D32F2F] bg-[#FFFFFF] dark:bg-[#2A2A2A] space-y-2">
                <span className="text-[14px] font-medium text-[#D32F2F] block">
                  Could not import schedule
                </span>
                <div className="text-[13px] text-[#6B6B6B] dark:text-[#B4B4B4] space-y-1">
                  {previewResult.errors.map((err, i) => (
                    <p key={i}>• {err}</p>
                  ))}
                </div>
                <button
                  onClick={() => setStep('input')}
                  className="mt-2 text-[13px] font-medium text-[#10A37F] hover:underline cursor-pointer block"
                >
                  ← Edit JSON
                </button>
              </div>
            ) : (
              <>
                {/* Stats */}
                <div className="flex justify-between items-center p-3 rounded-[8px] bg-[#F7F7F8] dark:bg-[#303030] text-[13px]">
                  <span>{previewResult.items.length} items detected</span>
                  <span className="text-[#10A37F] font-medium">{previewResult.newCount} new</span>
                  {previewResult.duplicateCount > 0 && <span>{previewResult.duplicateCount} existing</span>}
                  {previewResult.conflictCount > 0 && <span className="text-[#D97706] font-medium">{previewResult.conflictCount} conflicts</span>}
                </div>

                {/* Items list */}
                <div className="max-h-60 overflow-y-auto border border-[#E5E5E5] dark:border-[#3A3A3A] rounded-[8px] divide-y divide-[#EEEEEE] dark:divide-[#353535]">
                  {previewResult.items.map((item) => (
                    <div key={item.id} className="p-3 text-[13px] flex items-center justify-between">
                      <div>
                        <div className="font-medium text-[#171717] dark:text-[#F5F5F5]">{item.title}</div>
                        <div className="text-[12px] text-[#8E8E8E]">{item.subtitle} • {item.time}</div>
                        {item.conflictDetail && (
                          <div className="text-[12px] text-[#D97706] mt-0.5">{item.conflictDetail}</div>
                        )}
                      </div>
                      <span className={`text-[12px] font-medium ${
                        item.status === 'new' ? 'text-[#10A37F]' : item.status === 'conflict' ? 'text-[#D97706]' : 'text-[#8E8E8E]'
                      }`}>
                        {item.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Confirm actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EEEEEE] dark:border-[#353535]">
                  <button
                    type="button"
                    onClick={() => setStep('input')}
                    className="h-10 px-3 text-[14px] font-medium text-[#6B6B6B] dark:text-[#B4B4B4] hover:text-[#171717] cursor-pointer"
                  >
                    Back
                  </button>

                  {previewResult.duplicateCount > 0 && (
                    <button
                      type="button"
                      onClick={() => handleCommit('replace_matching')}
                      className="h-10 px-3.5 rounded-[8px] border border-[#E5E5E5] dark:border-[#3A3A3A] text-[14px] font-medium text-[#171717] dark:text-[#F5F5F5] hover:bg-[#F7F7F8] cursor-pointer"
                    >
                      {t.replaceMatching}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleCommit('new_only')}
                    className="h-10 px-4 rounded-[8px] bg-[#10A37F] hover:bg-[#0E8F70] text-white text-[14px] font-medium cursor-pointer"
                  >
                    Add to Timetable
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
