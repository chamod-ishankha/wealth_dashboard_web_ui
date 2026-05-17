import { useMemo } from "react";
import StatCard from "./StatCard";
import {
  calculateMonthlySummary,
  groupTransactionsByYearMonth,
} from "../utils/transactionStats";

export default function DashboardSummary({
  month,
  budgetLimit,
  monthlySalary,
  onMonthlySalaryChange,
  totalExpenses,
  netSavings,
  remainingBudget,
  formatCurrency,
  transactions = [],
  loading = false,
  error = "",
}) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.toLocaleString("en-US", { month: "long" });

  const groupedTransactions = useMemo(
    () => groupTransactionsByYearMonth(transactions),
    [transactions],
  );

  const currentMonthSummary = useMemo(
    () =>
      calculateMonthlySummary(
        transactions,
        currentYear,
        currentMonth,
        budgetLimit,
        monthlySalary,
      ),
    [transactions, currentYear, currentMonth, budgetLimit, monthlySalary],
  );

  const remainingTone =
    currentMonthSummary.remainingBudget > 0
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : currentMonthSummary.remainingBudget === 0
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-rose-200 bg-rose-50 text-rose-700";

  const remainingLabel =
    currentMonthSummary.remainingBudget > 0
      ? "Under budget"
      : currentMonthSummary.remainingBudget === 0
        ? "Budget exhausted"
        : "Overspent";

  if (loading) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-soft backdrop-blur">
        <p className="text-sm text-slate-500">
          Loading Firestore transactions...
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-soft backdrop-blur">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Dashboard Summary
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            A minimal snapshot of your monthly financial position.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {currentMonthSummary.monthlyTransactions.length > 0
            ? `${currentMonthSummary.monthlyTransactions.length} in ${currentMonth}`
            : month}
        </span>
      </div>

      {error ? (
        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Month" value={month} accent="slate" />
        <label className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 shadow-soft">
          <span className="text-sm font-medium text-slate-500">
            Monthly Salary
          </span>
          <input
            type="number"
            min="0"
            step="1"
            value={monthlySalary}
            onChange={(event) =>
              onMonthlySalaryChange(Number(event.target.value || 0))
            }
            className="mt-2 w-full bg-transparent text-2xl font-semibold tracking-tight text-slate-900 outline-none"
          />
        </label>
        <StatCard
          label="Total Expenses"
          value={formatCurrency(currentMonthSummary.totalExpenses)}
          accent="amber"
        />
        <StatCard
          label="Net Savings"
          value={formatCurrency(currentMonthSummary.netSavings)}
          accent="emerald"
        />
      </div>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Personal Budget Limit Status
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Limit: {formatCurrency(budgetLimit)}
            </p>
          </div>
          <span
            className={`rounded-full border px-3 py-1 text-sm font-semibold ${remainingTone}`}
          >
            {remainingLabel}
          </span>
        </div>

        <div className={`rounded-2xl border px-5 py-4 ${remainingTone}`}>
          <p className="text-sm font-medium opacity-80">Remaining Budget</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight">
            {formatCurrency(currentMonthSummary.remainingBudget)}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <h3 className="text-lg font-semibold text-slate-900">
          Grouped by Year and Month
        </h3>
        <div className="mt-4 space-y-4">
          {groupedTransactions.length > 0 ? (
            groupedTransactions.map((group) => {
              const summary = calculateMonthlySummary(
                transactions,
                group.year,
                group.month,
                budgetLimit,
                monthlySalary,
              );

              return (
                <div
                  key={`${group.year}-${group.month}`}
                  className="rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {group.month} {group.year}
                      </p>
                      <p className="text-sm text-slate-500">
                        {group.transactions.length} transactions
                      </p>
                    </div>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${summary.remainingBudget > 0 ? "border-emerald-200 bg-emerald-50 text-emerald-700" : summary.remainingBudget === 0 ? "border-amber-200 bg-amber-50 text-amber-800" : "border-rose-200 bg-rose-50 text-rose-700"}`}
                    >
                      {summary.remainingBudget > 0
                        ? "On track"
                        : summary.remainingBudget === 0
                          ? "Limit reached"
                          : "Overspent"}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Income
                      </p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">
                        {formatCurrency(summary.totalIncome)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Expenses
                      </p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">
                        {formatCurrency(summary.totalExpenses)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Remaining
                      </p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">
                        {formatCurrency(summary.remainingBudget)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-slate-500">No transactions found yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}
