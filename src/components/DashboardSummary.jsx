import { useMemo } from "react";
import StatCard from "./StatCard";
import {
  calculateMonthlySummary,
  getPeriodKey,
} from "../utils/transactionStats";

export default function DashboardSummary({
  month,
  budgetLimit,
  selectedYear,
  selectedMonth,
  availableYears = [],
  monthsForSelectedYear = [],
  monthlySalary,
  onMonthlySalaryChange,
  totalExpenses,
  netSavings,
  remainingBudget,
  formatCurrency,
  transactions = [],
  groupedTransactions = [],
  salaryByPeriod = {},
  loading = false,
  error = "",
  onYearChange,
  onMonthChange,
  onDeleteTransaction,
}) {
  const selectedPeriodLabel =
    selectedYear && selectedMonth ? `${selectedMonth} ${selectedYear}` : month;
  const selectedMonthSummary = useMemo(
    () =>
      calculateMonthlySummary(
        transactions,
        selectedYear,
        selectedMonth,
        budgetLimit,
        monthlySalary,
      ),
    [transactions, selectedYear, selectedMonth, budgetLimit, monthlySalary],
  );

  const remainingTone =
    selectedMonthSummary.remainingBudget > 0
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : selectedMonthSummary.remainingBudget === 0
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-rose-200 bg-rose-50 text-rose-700";

  const remainingLabel =
    selectedMonthSummary.remainingBudget > 0
      ? "Under budget"
      : selectedMonthSummary.remainingBudget === 0
        ? "Budget exhausted"
        : "Overspent";

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-soft backdrop-blur">
      {loading ? (
        <p className="text-sm text-slate-500">
          Loading Firestore transactions...
        </p>
      ) : null}

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
          {selectedMonthSummary.monthlyTransactions.length > 0
            ? `${selectedMonthSummary.monthlyTransactions.length} in ${selectedPeriodLabel}`
            : selectedPeriodLabel}
        </span>
      </div>

      {error ? (
        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>
      ) : null}

      <div className="mb-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">Year</span>
            <select
              value={selectedYear}
              onChange={(event) => onYearChange?.(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            >
              {availableYears.length > 0 ? (
                availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))
              ) : (
                <option value="">No years available</option>
              )}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">Month</span>
            <select
              value={selectedMonth}
              onChange={(event) => onMonthChange?.(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            >
              {monthsForSelectedYear.length > 0 ? (
                monthsForSelectedYear.map((monthName) => (
                  <option key={monthName} value={monthName}>
                    {monthName}
                  </option>
                ))
              ) : (
                <option value="">No months available</option>
              )}
            </select>
          </label>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Month" value={selectedPeriodLabel} accent="slate" />
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
          value={formatCurrency(selectedMonthSummary.totalExpenses)}
          accent="amber"
        />
        <StatCard
          label="Net Savings"
          value={formatCurrency(selectedMonthSummary.netSavings)}
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
            {formatCurrency(selectedMonthSummary.remainingBudget)}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Transactions for {selectedPeriodLabel}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Only records from the selected year and month are shown here.
            </p>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
            {selectedMonthSummary.monthlyTransactions.length} records
          </span>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {selectedMonthSummary.monthlyTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Day</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium text-right">Amount</th>
                    <th className="px-4 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {selectedMonthSummary.monthlyTransactions.map(
                    (transaction) => {
                      const isIncome = transaction.transactionType === "income";

                      return (
                        <tr
                          key={
                            transaction.id ||
                            `${transaction.date}-${transaction.category}-${transaction.amount}`
                          }
                        >
                          <td className="px-4 py-3 text-slate-700">
                            {transaction.date || "—"}
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            {transaction.dayOfWeek || "—"}
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-900">
                            {transaction.category || "—"}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                isIncome
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-rose-50 text-rose-700"
                              }`}
                            >
                              {transaction.transactionType || "transfer"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-slate-900">
                            {formatCurrency(Number(transaction.amount || 0))}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                onDeleteTransaction?.(transaction.id)
                              }
                              className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-4 py-10 text-center text-sm text-slate-500">
              No transactions found for this month.
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <h3 className="text-lg font-semibold text-slate-900">
          Grouped by Year and Month
        </h3>
        <div className="mt-4 space-y-4">
          {groupedTransactions.length > 0 ? (
            groupedTransactions.map((group) => {
              const periodKey = getPeriodKey(group.year, group.month);
              const summary = calculateMonthlySummary(
                transactions,
                group.year,
                group.month,
                budgetLimit,
                Number(salaryByPeriod[periodKey] ?? 0),
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
