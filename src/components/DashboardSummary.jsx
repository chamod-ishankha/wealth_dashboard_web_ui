import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import StatCard from "./StatCard";
import {
  calculateMonthlySummary,
  getPeriodKey,
} from "../utils/transactionStats";
import SafeToSpendCalculator from "./SafeToSpendCalculator";
import { useAuth } from "../context/AuthContext";
import useInstallments from "../hooks/useInstallments";
import InstallmentProgressBar from "./InstallmentProgressBar";
import InstallmentSetupForm from "./InstallmentSetupForm";
import useUserSettings from "../hooks/useUserSettings";

function formatTimestamp(timestamp) {
  if (!timestamp) return "—";

  if (timestamp.toDate) {
    const date = timestamp.toDate();
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  if (timestamp instanceof Date) {
    return timestamp.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  if (typeof timestamp === "string") {
    return timestamp;
  }

  return "—";
}

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
  salaryDate: salaryDateProp = null,
  formatCurrency,
  transactions = [],
  tableTransactions = [],
  tableLoading = false,
  tableError = "",
  transactionsPage = 1,
  transactionsPageSize = 10,
  transactionsTotalPages = 1,
  hasNextPage = false,
  hasPrevPage = false,
  paginatedTotalCount = 0,
  onChangePageSize,
  onGoToPage,
  onNextPage,
  onPrevPage,
  groupedTransactions = [],
  salaryByPeriod = {},
  loading = false,
  error = "",
  onYearChange,
  onMonthChange,
  onDeleteTransaction,
  onEditTransaction,
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
  const selectedPeriodTxCount =
    selectedMonthSummary?.monthlyTransactions?.length ?? 0;
  const selectedPeriodSummaryLabel =
    selectedPeriodTxCount > 0
      ? `${selectedPeriodLabel} • ${selectedPeriodTxCount} transaction${selectedPeriodTxCount === 1 ? "" : "s"}`
      : `${selectedPeriodLabel} • No transactions`;

  const { user } = useAuth();
  const {
    activeInstallments = [],
    loading: installmentsLoading = false,
    toggleInstallmentStatus,
    updateInstallment,
  } = useInstallments(user);
  const { salaryDate: realtimeSalaryDate } = useUserSettings(user);
  const salaryDate = salaryDateProp || realtimeSalaryDate;
  const [editingInstallment, setEditingInstallment] = useState(null);
  const [savingInstallment, setSavingInstallment] = useState(false);
  const [pageInput, setPageInput] = useState(String(transactionsPage));
  const [goalsScrollRef, setGoalsScrollRef] = useState(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [currentGoalIndex, setCurrentGoalIndex] = useState(0);

  const TYPE_ICONS = {
    expense: "💸",
    income: "💰",
    transfer: "🔁",
  };
  const TYPE_BADGES = {
    expense: "border-rose-200 bg-rose-50 text-rose-700",
    income: "border-emerald-200 bg-emerald-50 text-emerald-700",
    transfer: "border-amber-200 bg-amber-50 text-amber-700",
  };

  const TYPE_LABELS = {
    expense: "Expense",
    income: "Income",
    transfer: "Transfer",
  };

  useEffect(() => {
    setPageInput(String(transactionsPage));
  }, [transactionsPage]);

  function checkGoalsScrollPos() {
    if (!goalsScrollRef) return;
    const el = goalsScrollRef;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    const safeWidth = Math.max(1, el.clientWidth);
    const index = Math.round(el.scrollLeft / safeWidth);
    const boundedIndex = Math.min(
      Math.max(0, index),
      Math.max(0, activeInstallments.length - 1),
    );

    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < maxScrollLeft - 4);
    setCurrentGoalIndex(boundedIndex);
  }

  function scrollGoalsLeft() {
    if (!goalsScrollRef) return;
    const containerWidth = goalsScrollRef.clientWidth;
    const currentIndex = Math.round(goalsScrollRef.scrollLeft / containerWidth);
    const targetIndex = Math.max(0, currentIndex - 1);
    goalsScrollRef.scrollTo({
      left: targetIndex * containerWidth,
      behavior: "smooth",
    });
  }

  function scrollGoalsRight() {
    if (!goalsScrollRef) return;
    const containerWidth = goalsScrollRef.clientWidth;
    const currentIndex = Math.round(goalsScrollRef.scrollLeft / containerWidth);
    const targetIndex = Math.min(
      activeInstallments.length - 1,
      currentIndex + 1,
    );
    goalsScrollRef.scrollTo({
      left: targetIndex * containerWidth,
      behavior: "smooth",
    });
  }

  useEffect(() => {
    if (activeInstallments.length === 0) {
      setCurrentGoalIndex(0);
      return;
    }

    if (currentGoalIndex > activeInstallments.length - 1) {
      setCurrentGoalIndex(activeInstallments.length - 1);
    }

    checkGoalsScrollPos();
  }, [goalsScrollRef, activeInstallments]);

  async function handleSaveInstallmentEdit(updatedInstallment) {
    if (!editingInstallment?.id || !updateInstallment || savingInstallment) {
      return;
    }

    try {
      setSavingInstallment(true);
      const ok = await updateInstallment(
        editingInstallment.id,
        updatedInstallment,
      );
      if (ok) {
        setEditingInstallment(null);
      }
    } catch (saveError) {
      console.error("Failed to save installment changes:", saveError);
    } finally {
      setSavingInstallment(false);
    }
  }

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
    <div className="space-y-6 w-full overflow-hidden">
      {loading ? (
        <p className="text-sm text-slate-500">
          Loading Firestore transactions...
        </p>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>
      ) : null}

      {/* HEADER */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Dashboard</h2>
          <p className="mt-1 text-sm text-slate-500">
            Track your budget and financial goals
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {selectedPeriodSummaryLabel}
        </span>
      </div>

      {/* PERIOD SELECTOR */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Year
            </span>
            <select
              value={selectedYear}
              onChange={(event) => onYearChange?.(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
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
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Month
            </span>
            <select
              value={selectedMonth}
              onChange={(event) => onMonthChange?.(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
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

      {/* STAT GRID */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Monthly Income"
          value={formatCurrency(monthlySalary || 0)}
          accent="blue"
        />
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

      {/* MAIN LAYOUT: Split 75% Left (Main Content) and 25% Right (Sidebar) */}
      <div className="grid gap-6 lg:grid-cols-4 w-full overflow-hidden">
        {/* LEFT SECTION (75% Width equivalent using grid span) */}
        <div className="lg:col-span-3 space-y-6 w-full overflow-hidden">
          {/* Quick Stats Row */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Personal Spent
              </h4>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {formatCurrency(selectedMonthSummary.personalExpenses)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Against {formatCurrency(budgetLimit)} limit
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Fixed Expenses
              </h4>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {formatCurrency(selectedMonthSummary.fixedExpenses)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Not counted against budget
              </p>
            </div>
          </div>

          {/* Budget Status Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Personal Budget Status
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Limit: {formatCurrency(budgetLimit)}
                </p>
              </div>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${remainingTone}`}
              >
                {remainingLabel}
              </span>
            </div>
            <div className={`rounded-xl border px-4 py-3 ${remainingTone}`}>
              <p className="text-xs font-medium opacity-75">
                Remaining Personal Budget
              </p>
              <p className="mt-1 text-3xl font-bold tracking-tight">
                {formatCurrency(selectedMonthSummary.remainingBudget)}
              </p>
            </div>
          </div>

          {/* Transactions Table CONTAINER */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-soft w-full overflow-hidden">
            <div className="border-b border-slate-200 px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Transactions
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {selectedPeriodLabel}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {paginatedTotalCount ||
                    selectedMonthSummary.monthlyTransactions.length}
                </span>
              </div>
            </div>

            {tableLoading ? (
              <div className="px-5 py-10 text-center text-sm text-slate-500">
                Loading paginated transactions...
              </div>
            ) : tableError ? (
              <div className="px-5 py-6 text-sm text-rose-600">
                {tableError}
              </div>
            ) : tableTransactions.length > 0 ? (
              <>
                {/* MOBILE VIEW */}
                <div className="block sm:hidden divide-y divide-slate-100">
                  {tableTransactions.map((transaction) => {
                    const isIncome = transaction.transactionType === "income";
                    const amountColor = isIncome
                      ? "text-emerald-600 font-semibold"
                      : "text-slate-900 font-semibold";
                    const amountPrefix = isIncome ? "+" : "−";
                    const typeIcon =
                      TYPE_ICONS[transaction.transactionType] || "•";

                    return (
                      <div
                        key={
                          transaction.id ||
                          `${transaction.date}-${transaction.category}-${transaction.amount}`
                        }
                        className="group flex items-center justify-between gap-3 px-5 py-4 hover:bg-slate-50 transition-colors cursor-pointer active:bg-slate-100"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3">
                            <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                              <span className="text-sm font-semibold text-slate-600">
                                {transaction.category?.[0]?.toUpperCase() ||
                                  "?"}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">
                                {transaction.category || "Transaction"}
                                <span
                                  className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                                    TYPE_BADGES[transaction.transactionType] ||
                                    "border-slate-200 bg-slate-100 text-slate-600"
                                  }`}
                                >
                                  <span className="mr-1">{typeIcon}</span>
                                  <span className="uppercase text-[10px]">
                                    {TYPE_LABELS[transaction.transactionType] ||
                                      transaction.transactionType ||
                                      "transfer"}
                                  </span>
                                </span>
                              </p>
                              <p className="w-[180px] max-w-[180px] truncate text-xs text-slate-500 sm:w-[220px] sm:max-w-[220px]">
                                {transaction.description || "No description"}
                              </p>
                              <p className="text-xs text-slate-500">
                                {formatTimestamp(transaction.date)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className={`text-sm font-bold ${amountColor}`}>
                            {amountPrefix}
                            {formatCurrency(Number(transaction.amount || 0))}
                          </p>
                          <div className="mt-1 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => onEditTransaction?.(transaction)}
                              className="inline-flex items-center justify-center h-6 w-6 rounded text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
                              title="Edit"
                            >
                              ✏️
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                onDeleteTransaction?.(transaction.id)
                              }
                              className="inline-flex items-center justify-center h-6 w-6 rounded text-xs font-semibold text-rose-600 hover:bg-rose-100 transition"
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* DESKTOP VIEW: Fixed width layout with table-fixed & customized column percentages */}
                <div className="hidden sm:block overflow-x-auto max-w-full">
                  <table className="w-full table-auto text-sm">
                    <colgroup>
                      <col className="w-[14%]" /> {/* Date */}
                      <col className="w-[16%]" /> {/* Category */}
                      <col className="w-[34%]" />
                      {/* Description */}
                      <col /> {/* Type - dynamic width */}
                      <col className="w-[12%]" /> {/* Amount */}
                      <col className="w-[12%]" /> {/* Actions */}
                    </colgroup>
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                      <tr>
                        <th className="px-4 py-4 text-left font-semibold text-slate-700">
                          Date
                        </th>
                        <th className="px-4 py-4 text-left font-semibold text-slate-700">
                          Category
                        </th>
                        <th className="px-4 py-4 text-left font-semibold text-slate-700">
                          Description
                        </th>
                        <th className="px-4 py-4 text-left font-semibold text-slate-700">
                          Type
                        </th>
                        <th className="px-4 py-4 text-right font-semibold text-slate-700">
                          Amount
                        </th>
                        <th className="px-4 py-4 text-right font-semibold text-slate-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tableTransactions.map((transaction) => {
                        const isIncome =
                          transaction.transactionType === "income";
                        const amountColor = isIncome
                          ? "text-emerald-600"
                          : "text-slate-900";
                        const amountPrefix = isIncome ? "+" : "−";

                        return (
                          <tr
                            key={
                              transaction.id ||
                              `${transaction.date}-${transaction.category}-${transaction.amount}`
                            }
                            className="hover:bg-slate-50 transition-colors"
                          >
                            <td className="px-4 py-4 text-slate-600 truncate">
                              {formatTimestamp(transaction.date)}
                            </td>
                            <td className="px-4 py-4 font-medium text-slate-900 truncate">
                              {transaction.category || "—"}
                            </td>
                            <td className="px-4 py-4 text-slate-600">
                              <div
                                className="block w-full min-w-0 truncate"
                                title={transaction.description}
                              >
                                {transaction.description || "No description"}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center max-w-full rounded-full px-2 py-0.5 text-xs font-semibold ${
                                  TYPE_BADGES[transaction.transactionType] ||
                                  "border-slate-200 bg-slate-100 text-slate-600"
                                }`}
                              >
                                <span className="mr-2">
                                  {TYPE_ICONS[transaction.transactionType] ||
                                    "•"}
                                </span>
                                <span>
                                  {TYPE_LABELS[transaction.transactionType] ||
                                    transaction.transactionType ||
                                    "transfer"}
                                </span>
                              </span>
                            </td>
                            <td
                              className={`px-4 py-4 text-right font-semibold ${amountColor}`}
                            >
                              {amountPrefix}
                              {formatCurrency(Number(transaction.amount || 0))}
                            </td>
                            <td className="px-4 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    onEditTransaction?.(transaction)
                                  }
                                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 hover:underline transition"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    onDeleteTransaction?.(transaction.id)
                                  }
                                  className="text-xs font-semibold text-rose-600 hover:text-rose-900 hover:underline transition"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-3">
                  <p className="text-xs text-slate-500">
                    Page {transactionsPage} of {transactionsTotalPages}
                    {paginatedTotalCount > 0
                      ? ` • ${Math.min(
                          (transactionsPage - 1) * transactionsPageSize + 1,
                          paginatedTotalCount,
                        )}-${Math.min(
                          transactionsPage * transactionsPageSize,
                          paginatedTotalCount,
                        )} of ${paginatedTotalCount}`
                      : ""}
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    <label className="flex items-center gap-2 text-xs text-slate-600">
                      <span>Rows</span>
                      <select
                        value={transactionsPageSize}
                        onChange={(event) =>
                          onChangePageSize?.(Number(event.target.value))
                        }
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                      </select>
                    </label>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max={transactionsTotalPages}
                        value={pageInput}
                        onChange={(event) => setPageInput(event.target.value)}
                        className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                      />
                      <button
                        type="button"
                        onClick={() => onGoToPage?.(Number(pageInput))}
                        disabled={tableLoading}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Go
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onPrevPage?.()}
                      disabled={!hasPrevPage || tableLoading}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => onNextPage?.()}
                      disabled={!hasNextPage || tableLoading}
                      className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="px-5 py-10 text-center text-sm text-slate-500">
                No transactions found for this month.
              </div>
            )}
          </div>

          {/* Historical Summary */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft w-full overflow-hidden">
            <h3 className="text-sm font-semibold text-slate-900">
              Historical Overview
            </h3>
            <div className="mt-4 space-y-3 max-h-96 overflow-y-auto w-full">
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
                      className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-medium text-slate-900">
                          {group.month} {group.year}
                        </div>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${summary.remainingBudget > 0 ? "border-emerald-200 bg-emerald-50 text-emerald-700" : summary.remainingBudget === 0 ? "border-amber-200 bg-amber-50 text-amber-800" : "border-rose-200 bg-rose-50 text-rose-700"}`}
                        >
                          {summary.remainingBudget > 0
                            ? "On track"
                            : summary.remainingBudget === 0
                              ? "Limit reached"
                              : "Overspent"}
                        </span>
                      </div>
                      <div className="mt-2 flex justify-between gap-3 text-slate-600">
                        <div>Income: {formatCurrency(summary.totalIncome)}</div>
                        <div>
                          Expenses: {formatCurrency(summary.totalExpenses)}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-slate-500">No transaction history.</p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SECTION / SIDEBAR (25% Width equivalent) */}
        <aside className="lg:col-span-1 space-y-6 w-full overflow-hidden">
          <label className="block rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 shadow-soft cursor-pointer hover:shadow-md transition-shadow">
            <span className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              Monthly Income
            </span>
            <input
              type="number"
              min="0"
              step="1"
              value={monthlySalary}
              onChange={(event) =>
                onMonthlySalaryChange(Number(event.target.value || 0))
              }
              className="mt-3 w-full bg-transparent text-2xl font-bold text-blue-900 outline-none placeholder-blue-400"
              placeholder="0"
            />
            <p className="mt-2 text-xs text-blue-600">
              Edit for current period
            </p>
          </label>

          <SafeToSpendCalculator
            budgetLimit={budgetLimit}
            personalExpensesSpent={selectedMonthSummary.personalExpenses}
            salaryDate={salaryDate}
            formatCurrency={formatCurrency}
          />

          <div className="rounded-2xl border border-slate-200 bg-white shadow-soft w-full overflow-hidden">
            <div className="border-b border-slate-200 px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-900">
                  Financial Goals
                </h3>
                <div className="flex items-center gap-2">
                  {!installmentsLoading && activeInstallments.length > 1 ? (
                    <div className="hidden sm:flex items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                        {currentGoalIndex + 1}/{activeInstallments.length}
                      </span>
                      <button
                        type="button"
                        onClick={scrollGoalsLeft}
                        disabled={!canScrollLeft}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"
                        aria-label="Previous goal"
                      >
                        <svg
                          viewBox="0 0 20 20"
                          fill="none"
                          className="h-4 w-4"
                          aria-hidden="true"
                        >
                          <path
                            d="M12.5 4.5L7 10l5.5 5.5"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={scrollGoalsRight}
                        disabled={!canScrollRight}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"
                        aria-label="Next goal"
                      >
                        <svg
                          viewBox="0 0 20 20"
                          fill="none"
                          className="h-4 w-4"
                          aria-hidden="true"
                        >
                          <path
                            d="M7.5 4.5L13 10l-5.5 5.5"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="p-5 w-full overflow-hidden">
              {activeInstallments.length > 0 ? (
                <div>
                  <p className="mb-3 text-xs text-slate-500 sm:hidden">
                    Swipe left or right to view more goals.
                  </p>
                  <div className="relative">
                    <div
                      ref={setGoalsScrollRef}
                      onScroll={checkGoalsScrollPos}
                      className="w-full overflow-x-auto pb-2 snap-x snap-mandatory overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                      <div className="flex w-full scroll-smooth">
                        {activeInstallments.map((inst) => (
                          <div
                            key={inst.id}
                            className="shrink-0 basis-full min-w-0 snap-start snap-always"
                          >
                            <InstallmentProgressBar
                              installment={inst}
                              formatCurrency={formatCurrency}
                              onEdit={(item) => setEditingInstallment(item)}
                              onPause={() =>
                                toggleInstallmentStatus &&
                                toggleInstallmentStatus(
                                  inst.id,
                                  inst.status === "paused"
                                    ? "active"
                                    : "paused",
                                )
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-sm text-slate-500">
                  No active financial goals
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>

      {editingInstallment && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
              <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
                <div className="mb-4 flex items-center justify-between gap-3 sticky top-0 bg-white pb-4 border-b border-slate-200">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Edit Goal
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Update your financial goal details
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingInstallment(null)}
                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                  >
                    Close
                  </button>
                </div>

                <InstallmentSetupForm
                  initialValues={editingInstallment}
                  loading={savingInstallment}
                  onSubmit={handleSaveInstallmentEdit}
                  onCancel={() => setEditingInstallment(null)}
                />
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
