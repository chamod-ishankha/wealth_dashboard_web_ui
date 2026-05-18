import React, { useMemo } from "react";

const DEFAULT_SALARY_DATE = 30;

function getDaysRemainingUntilNextSalaryPayout(
  salaryDate = DEFAULT_SALARY_DATE,
  referenceDate = new Date(),
) {
  const today = new Date(referenceDate);
  const year = today.getFullYear();
  const month = today.getMonth();
  const dayOfMonth = today.getDate();

  const payoutDay = Math.min(
    Math.max(1, Number(salaryDate || DEFAULT_SALARY_DATE)),
    31,
  );

  const currentMonthLastDay = new Date(year, month + 1, 0).getDate();
  const currentMonthPayoutDay = Math.min(payoutDay, currentMonthLastDay);

  let nextPayoutDate;

  if (dayOfMonth <= currentMonthPayoutDay) {
    // Next payout is in the current month.
    nextPayoutDate = new Date(year, month, currentMonthPayoutDay);
  } else {
    // Next payout is in the next calendar month.
    const nextMonthDate = new Date(year, month + 1, 1);
    const nextYear = nextMonthDate.getFullYear();
    const nextMonth = nextMonthDate.getMonth();
    const nextMonthLastDay = new Date(nextYear, nextMonth + 1, 0).getDate();
    const nextMonthPayoutDay = Math.min(payoutDay, nextMonthLastDay);
    nextPayoutDate = new Date(nextYear, nextMonth, nextMonthPayoutDay);
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  const startOfToday = new Date(year, month, dayOfMonth);
  const startOfPayout = new Date(
    nextPayoutDate.getFullYear(),
    nextPayoutDate.getMonth(),
    nextPayoutDate.getDate(),
  );

  const rawDays = Math.ceil((startOfPayout - startOfToday) / msPerDay);
  return Math.max(0, rawDays);
}

/**
 * SafeToSpendCalculator
 * Shows the maximum daily spending to stay within the current payroll cycle.
 *
 * Props expected:
 * - budgetLimit: total personal budget for the current cycle
 * - personalExpensesSpent: amount already spent from personal budget
 * - salaryDate: day of month salary is paid (1-31)
 * - formatCurrency: function to format numbers as currency
 */
export default function SafeToSpendCalculator({
  budgetLimit = 0,
  personalExpensesSpent = 0,
  salaryDate = DEFAULT_SALARY_DATE,
  formatCurrency = (val) => `$${Number(val).toLocaleString()}`,
}) {
  const safeToSpend = useMemo(() => {
    const remainingBudget =
      Number(budgetLimit || 0) - Number(personalExpensesSpent || 0);
    const remainingDays = getDaysRemainingUntilNextSalaryPayout(salaryDate);
    const denominator = Math.max(1, remainingDays);
    const dailySafeSpend =
      remainingBudget > 0 ? remainingBudget / denominator : 0;

    let status = "on-track";
    if (remainingBudget < 0) {
      status = "budget-exceeded";
    } else if (remainingBudget === 0) {
      status = "budget-exhausted";
    } else if (dailySafeSpend === 0 && remainingBudget > 0) {
      status = "minimal-remaining";
    }

    return {
      dailySafeSpend,
      remainingBudget,
      remainingDays,
      status,
    };
  }, [budgetLimit, personalExpensesSpent, salaryDate]);

  // Determine status color and icon
  let statusColor = "emerald"; // green = on track
  let statusIcon = "✓";
  let statusMessage = "Budget on track";
  let warningText = "";

  if (safeToSpend.status === "budget-exceeded") {
    statusColor = "rose";
    statusIcon = "⚠";
    statusMessage = "Budget exceeded";
    warningText = "You've exceeded your personal budget limit.";
  } else if (safeToSpend.status === "budget-exhausted") {
    statusColor = "amber";
    statusIcon = "!";
    statusMessage = "Budget exhausted";
    warningText = "No remaining budget for personal expenses.";
  } else if (safeToSpend.status === "minimal-remaining") {
    statusColor = "amber";
    statusIcon = "!";
    statusMessage = "Minimal remaining";
    warningText = "Very little budget left. Be cautious with spending.";
  } else if (safeToSpend.status === "month-ended") {
    statusColor = "slate";
    statusIcon = "—";
    statusMessage = "Month ended";
    warningText = "";
  }

  const colorMap = {
    emerald: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-700",
      badge: "bg-emerald-100 text-emerald-700",
      bar: "bg-gradient-to-r from-emerald-400 to-emerald-500",
    },
    amber: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-700",
      badge: "bg-amber-100 text-amber-700",
      bar: "bg-gradient-to-r from-amber-400 to-amber-500",
    },
    rose: {
      bg: "bg-rose-50",
      border: "border-rose-200",
      text: "text-rose-700",
      badge: "bg-rose-100 text-rose-700",
      bar: "bg-gradient-to-r from-rose-400 to-rose-500",
    },
    slate: {
      bg: "bg-slate-50",
      border: "border-slate-200",
      text: "text-slate-700",
      badge: "bg-slate-100 text-slate-700",
      bar: "bg-gradient-to-r from-slate-400 to-slate-500",
    },
  };

  const colors = colorMap[statusColor];

  return (
    <div
      className={`rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300`}
    >
      {/* Header with Status Badge */}
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">
          Daily Safe-to-Spend
        </h3>
        <span
          className={`rounded-full ${colors.badge} px-3 py-1 text-xs font-semibold`}
        >
          {statusIcon} {statusMessage}
        </span>
      </div>

      {/* Main Safe-to-Spend Amount - Massive Display */}
      <div className="mb-5">
        <p className="mb-3 text-xs font-medium text-slate-500">
          Available per day
        </p>
        <p className={`text-3xl font-bold ${colors.text}`}>
          {formatCurrency(Math.max(0, safeToSpend.dailySafeSpend))}
        </p>
      </div>

      {/* Calculation Breakdown - Two Column Metrics */}
      <div className="mb-5 grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3">
        <div>
          <p className="text-xs font-medium text-slate-500">Remaining Budget</p>
          <p className="mt-1.5 font-semibold text-slate-900">
            {formatCurrency(Math.max(0, safeToSpend.remainingBudget))}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">
            Days Until Salary
          </p>
          <p className="mt-1.5 font-semibold text-slate-900">
            {safeToSpend.remainingDays} days
          </p>
        </div>
      </div>

      {/* Budget Consumption Progress Bar */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium text-slate-600">Budget Used</p>
          <p className="text-xs font-semibold text-slate-700">
            {budgetLimit > 0
              ? `${Math.round((personalExpensesSpent / budgetLimit) * 100)}%`
              : "—"}
          </p>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full transition-all duration-500 ${colors.bar}`}
            style={{
              width:
                budgetLimit > 0
                  ? `${Math.min(100, (personalExpensesSpent / budgetLimit) * 100)}%`
                  : "0%",
            }}
          />
        </div>
      </div>

      {/* Status Message */}
      {warningText && (
        <div
          className={`rounded-lg bg-white/70 px-3 py-2 text-xs font-medium ${colors.text}`}
        >
          {warningText}
        </div>
      )}

      {/* Info Footer */}
      <div className="mt-3 border-t border-white/30 pt-3">
        <p className="text-xs text-slate-500">
          💡 Tip: Divide your remaining budget by the days left until your next
          salary payout to stay on track.
        </p>
      </div>
    </div>
  );
}
