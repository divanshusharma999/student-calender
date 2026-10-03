import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Trash2 } from 'lucide-react';

export const FinanceScreen: React.FC = () => {
  const {
    t,
    transactions,
    budgetSummary,
    settings,
    deleteTransaction,
    openAddModal
  } = useApp();

  const [filterMethod, setFilterMethod] = useState<'ALL' | 'UPI' | 'CASH'>('ALL');

  const filteredTransactions = transactions.filter(tx => {
    if (filterMethod === 'ALL') return true;
    return tx.paymentMethod === filterMethod;
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-6">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-medium leading-[32px] text-[#171717] dark:text-[#F5F5F5]">
            {t.finance}
          </h1>
          <p className="text-[14px] text-[#6B6B6B] dark:text-[#B4B4B4] mt-0.5">
            Local budget & balances
          </p>
        </div>
        <button
          onClick={() => openAddModal('transaction')}
          className="h-10 px-3.5 rounded-[8px] bg-[#10A37F] hover:bg-[#0E8F70] text-white text-[14px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addTransaction}</span>
        </button>
      </div>

      {/* Main Balances Card */}
      <div className="p-4 rounded-[10px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] space-y-4">
        <div>
          <span className="text-[12px] text-[#6B6B6B] dark:text-[#B4B4B4] block uppercase tracking-wider font-medium">
            {t.totalAvailable}
          </span>
          <div className="text-[28px] font-medium text-[#171717] dark:text-[#F5F5F5] mt-1">
            ₹{budgetSummary.totalBalance.toLocaleString()}
          </div>
        </div>

        {/* UPI and Cash Splits */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#EEEEEE] dark:border-[#353535]">
          <div>
            <span className="text-[12px] text-[#6B6B6B] dark:text-[#B4B4B4] block">{t.upi}</span>
            <span className="text-[16px] font-medium text-[#171717] dark:text-[#F5F5F5] mt-0.5 block">
              ₹{budgetSummary.upiBalance.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-[12px] text-[#6B6B6B] dark:text-[#B4B4B4] block">{t.cash}</span>
            <span className="text-[16px] font-medium text-[#171717] dark:text-[#F5F5F5] mt-0.5 block">
              ₹{budgetSummary.cashBalance.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Today's Budget Status */}
      <div className="p-4 rounded-[10px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-medium text-[#171717] dark:text-[#F5F5F5]">
            {t.todayBudget}
          </h2>
          <span className="text-[13px] text-[#6B6B6B] dark:text-[#B4B4B4]">
            Target: ₹{budgetSummary.dailyTarget}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="p-3 rounded-[8px] bg-[#F7F7F8] dark:bg-[#303030]">
            <span className="text-[12px] text-[#6B6B6B] dark:text-[#B4B4B4] block">{t.spentToday}</span>
            <span className="text-[18px] font-medium text-[#171717] dark:text-[#F5F5F5] mt-0.5 block">
              ₹{budgetSummary.spentToday}
            </span>
          </div>

          <div className="p-3 rounded-[8px] bg-[#F7F7F8] dark:bg-[#303030]">
            <span className="text-[12px] text-[#6B6B6B] dark:text-[#B4B4B4] block">{t.remainingToday}</span>
            <span className={`text-[18px] font-medium mt-0.5 block ${
              budgetSummary.isOverBudget ? 'text-[#D32F2F]' : 'text-[#10A37F]'
            }`}>
              ₹{budgetSummary.remainingToday}
            </span>
          </div>
        </div>

        {/* Dynamic Budget Alert if Overspent */}
        {budgetSummary.isOverBudget && settings.autoRecalculateBudget && (
          <div className="p-3 rounded-[8px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] space-y-1">
            <span className="text-[13px] font-medium text-[#D32F2F] block">
              Over budget by ₹{budgetSummary.overAmount}
            </span>
            <p className="text-[13px] text-[#6B6B6B] dark:text-[#B4B4B4] leading-[18px]">
              To stay within your monthly budget of ₹{budgetSummary.monthlyTarget}, your recommended average for the remaining {budgetSummary.daysRemainingInMonth} days is ₹{budgetSummary.recommendedDailyBudget}/day.
            </p>
          </div>
        )}
      </div>

      {/* Transactions Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-medium leading-[24px] text-[#171717] dark:text-[#F5F5F5]">
            {t.recentTransactions}
          </h2>

          {/* Filter */}
          <div className="flex h-8 p-0.5 rounded-[6px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#F7F7F8] dark:bg-[#303030] text-[12px] font-medium">
            {(['ALL', 'UPI', 'CASH'] as const).map(m => (
              <button
                key={m}
                onClick={() => setFilterMethod(m)}
                className={`px-2.5 rounded-[4px] transition-colors cursor-pointer ${
                  filterMethod === m
                    ? 'bg-[#FFFFFF] dark:bg-[#2A2A2A] text-[#171717] dark:text-[#F5F5F5] shadow-xs'
                    : 'text-[#6B6B6B] dark:text-[#B4B4B4]'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="p-8 rounded-[10px] border border-[#E5E5E5] dark:border-[#3A3A3A] bg-[#FFFFFF] dark:bg-[#2A2A2A] text-center">
            <p className="text-[14px] text-[#6B6B6B] dark:text-[#B4B4B4]">
              {t.noTransactions}
            </p>
          </div>
        ) : (
          <div className="border border-[#E5E5E5] dark:border-[#3A3A3A] rounded-[10px] bg-[#FFFFFF] dark:bg-[#2A2A2A] divide-y divide-[#EEEEEE] dark:divide-[#353535] overflow-hidden">
            {filteredTransactions.map((tx) => {
              const isIncome = tx.type === 'INCOME';

              return (
                <div
                  key={tx.id}
                  className="p-3.5 flex items-center justify-between hover:bg-[#F7F7F8] dark:hover:bg-[#303030] transition-colors"
                >
                  <div>
                    <div className="text-[15px] font-medium text-[#171717] dark:text-[#F5F5F5]">
                      {tx.description || tx.category}
                    </div>
                    <div className="text-[12px] text-[#8E8E8E] mt-0.5">
                      {tx.paymentMethod} • {tx.category} • {tx.time}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-[15px] font-medium ${
                      isIncome ? 'text-[#10A37F]' : 'text-[#171717] dark:text-[#F5F5F5]'
                    }`}>
                      {isIncome ? '+' : '-'} ₹{tx.amount.toLocaleString()}
                    </span>

                    <button
                      onClick={() => deleteTransaction(tx.id)}
                      className="p-1 text-[#8E8E8E] hover:text-[#D32F2F] rounded-[4px] cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
