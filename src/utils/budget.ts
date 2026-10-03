import { Transaction } from '../types';

export interface BudgetSummary {
  upiBalance: number;
  cashBalance: number;
  totalBalance: number;
  dailyTarget: number;
  spentToday: number;
  remainingToday: number;
  isOverBudget: boolean;
  overAmount: number;
  // Dynamic recalculation
  monthlyTarget: number;
  spentThisMonth: number;
  remainingMonthBudget: number;
  daysRemainingInMonth: number;
  recommendedDailyBudget: number;
  showRecommendationWarning: boolean;
}

export function calculateBudgetSummary(
  transactions: Transaction[],
  upiOpening: number,
  cashOpening: number,
  dailyTarget: number,
  monthlyTarget: number,
  currentDateStr: string // YYYY-MM-DD
): BudgetSummary {
  let upiIncome = 0;
  let upiExpense = 0;
  let cashIncome = 0;
  let cashExpense = 0;

  let spentToday = 0;
  let spentThisMonth = 0;

  const currentYearMonth = currentDateStr.substring(0, 7); // "YYYY-MM"
  const todayParts = currentDateStr.split('-');
  const nowYear = parseInt(todayParts[0], 10);
  const nowMonth = parseInt(todayParts[1], 10); // 1-12
  const nowDay = parseInt(todayParts[2], 10);

  // Total days in current month
  const totalDaysInMonth = new Date(nowYear, nowMonth, 0).getDate();
  const daysRemainingInMonth = Math.max(1, totalDaysInMonth - nowDay);

  for (const tx of transactions) {
    if (tx.type === 'INCOME') {
      if (tx.paymentMethod === 'UPI') upiIncome += tx.amount;
      else cashIncome += tx.amount;
    } else {
      if (tx.paymentMethod === 'UPI') upiExpense += tx.amount;
      else cashExpense += tx.amount;

      if (tx.date === currentDateStr) {
        spentToday += tx.amount;
      }
      if (tx.date.startsWith(currentYearMonth)) {
        spentThisMonth += tx.amount;
      }
    }
  }

  const upiBalance = upiOpening + upiIncome - upiExpense;
  const cashBalance = cashOpening + cashIncome - cashExpense;
  const totalBalance = upiBalance + cashBalance;

  const remainingToday = dailyTarget - spentToday;
  const isOverBudget = spentToday > dailyTarget;
  const overAmount = isOverBudget ? spentToday - dailyTarget : 0;

  // Remaining budget for current month cycle
  const remainingMonthBudget = Math.max(0, monthlyTarget - spentThisMonth);
  // Deterministic recommended daily calculation
  const recommendedDailyBudget = daysRemainingInMonth > 0
    ? Math.round((remainingMonthBudget / daysRemainingInMonth) * 100) / 100
    : 0;

  const showRecommendationWarning = isOverBudget && remainingMonthBudget > 0;

  return {
    upiBalance,
    cashBalance,
    totalBalance,
    dailyTarget,
    spentToday,
    remainingToday,
    isOverBudget,
    overAmount,
    monthlyTarget,
    spentThisMonth,
    remainingMonthBudget,
    daysRemainingInMonth,
    recommendedDailyBudget,
    showRecommendationWarning
  };
}
