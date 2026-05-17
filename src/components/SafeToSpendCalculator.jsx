import React, { useMemo } from "react";
import { calculateSafeToSpend } from "../utils/transactionStats";

/**
 * SafeToSpendCalculator
 * Shows the maximum daily spending to stay within personal budget
 *
 * Props expected:
 * - budgetLimit: total personal budget for the month
 * - personalExpensesSpent: amount already spent from personal budget
 * - year: numeric year
 * - monthIndex: 0-11 month index
 * - formatCurrency: function to format numbers as currency
 */
export default function SafeToSpendCalculator({
  budgetLimit = 0,
  personalExpensesSpent = 0,
  year = new Date().getFullYear(),
  monthIndex = new Date().getMonth(),
  formatCurrency = (val) => `$${Number(val).toLocaleString()}`,
}) {
  const safeToSpend = useMemo(
    () =>
      calculateSafeToSpend(
        Number(budgetLimit || 0),
        Number(personalExpensesSpent || 0),
        Number(year || new Date().getFullYear()),
        Number(monthIndex || new Date().getMonth()),
      ),
    [budgetLimit, personalExpensesSpent, year, monthIndex],
  );

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
      className={`rounded-2xl border ${colors.border} ${colors.bg} p-5 shadow-soft transition-all duration-300`}
    >
      {/* Header with Status */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className={`text-lg font-semibold ${colors.text}`}>
            Safe-to-Spend
          </h3>
          <span
            className={`rounded-full ${colors.badge} px-2 py-0.5 text-xs font-semibold`}
          >
            {statusIcon} {statusMessage}
          </span>
        </div>
      </div>

      {/* Main Safe-to-Spend Amount */}
      <div className="mb-6">
        <p className={`text-sm font-medium opacity-75 ${colors.text}`}>
          Daily Budget Available
        </p>
        <div className="mt-2 flex items-baseline gap-2">
          <p className={`text-4xl font-bold ${colors.text}`}>
            {formatCurrency(Math.max(0, safeToSpend.dailySafeSpend))}
          </p>
          <span className={`text-sm opacity-75 ${colors.text}`}>per day</span>
        </div>
      </div>

      {/* Calculation Breakdown */}
      <div className="mb-5 grid grid-cols-3 gap-3 rounded-xl bg-white/50 p-3">
        <div>
          <p className="text-xs font-medium text-slate-500">Remaining</p>
          <p className="mt-1 font-semibold text-slate-900">
            {formatCurrency(Math.max(0, safeToSpend.remainingBudget))}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">Days Left</p>
          <p className="mt-1 font-semibold text-slate-900">
            {safeToSpend.remainingDays}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">Budget Limit</p>
          <p className="mt-1 font-semibold text-slate-900">
            {formatCurrency(budgetLimit)}
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
        <div className="h-2 overflow-hidden rounded-full bg-white/60">
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
          💡 Tip: Divide your remaining budget by remaining days in the month to
          stay on track.
        </p>
      </div>
    </div>
  );
}
