import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import DashboardSummary from "./components/DashboardSummary";
import StatCard from "./components/StatCard";
import TransactionsEntryForm from "./components/TransactionsEntryForm";
import Navbar from "./components/Navbar";
import { useAuth } from "./context/AuthContext";
import useMonthlySalaries from "./hooks/useMonthlySalaries";
import useTransactions from "./hooks/useTransactions";
import useCategories from "./hooks/useCategories";
import useInstallments from "./hooks/useInstallments";
import useUserSettings from "./hooks/useUserSettings";
import {
  calculateMonthlySummary,
  getAvailableMonthsForYear,
  getAvailableYears,
  getPeriodKey,
  formatCurrentMonthLabel,
  getTransactionType,
  groupTransactionsByYearMonth,
} from "./utils/transactionStats";
import { db } from "./firebase";

const personalBudgetLimit = 20000;

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

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

export default function App() {
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [salaryByPeriod, setSalaryByPeriod] = useState({});
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formData, setFormData] = useState({
    date: "",
    category: "",
    amount: "",
    description: "",
  });

  const activePeriodKey =
    selectedYear && selectedMonth
      ? getPeriodKey(selectedYear, selectedMonth)
      : "";

  const { transactions, loading, error } = useTransactions(user);
  const {
    salaryByPeriod: remoteSalaryByPeriod,
    loading: salaryLoading,
    error: salaryError,
  } = useMonthlySalaries(user, activePeriodKey);
  const { addInstallment } = useInstallments(user);
  const [installmentSubmitting, setInstallmentSubmitting] = useState(false);
  const { salaryDate } = useUserSettings(user);

  // Fetch user categories
  const { categories, loading: categoriesLoading } = useCategories(user);

  // Set default category to first available category
  useEffect(() => {
    if (!formData.category && categories.length > 0) {
      setFormData((prev) => ({
        ...prev,
        category: categories[0],
      }));
    }
  }, [categories]);

  useEffect(() => {
    setSalaryByPeriod((current) => ({
      ...remoteSalaryByPeriod,
      ...current,
    }));
  }, [remoteSalaryByPeriod]);

  const groupedTransactions = useMemo(
    () => groupTransactionsByYearMonth(transactions),
    [transactions],
  );
  const availableYears = useMemo(
    () => getAvailableYears(transactions),
    [transactions],
  );
  const monthsForSelectedYear = useMemo(
    () => getAvailableMonthsForYear(groupedTransactions, selectedYear),
    [groupedTransactions, selectedYear],
  );

  useEffect(() => {
    if (!availableYears.length) {
      setSelectedYear("");
      return;
    }

    const yearExists = availableYears.includes(Number(selectedYear));
    if (!selectedYear || !yearExists) {
      setSelectedYear(String(availableYears[0]));
    }
  }, [availableYears, selectedYear]);

  useEffect(() => {
    if (!selectedYear) {
      setSelectedMonth("");
      return;
    }

    if (!monthsForSelectedYear.length) {
      setSelectedMonth("");
      return;
    }

    if (!selectedMonth || !monthsForSelectedYear.includes(selectedMonth)) {
      setSelectedMonth(monthsForSelectedYear[0]);
    }
  }, [selectedYear, monthsForSelectedYear, selectedMonth]);

  const monthlySalary = activePeriodKey
    ? Number(salaryByPeriod[activePeriodKey] ?? 0)
    : 0;
  const currentSummary = useMemo(
    () =>
      calculateMonthlySummary(
        transactions,
        selectedYear,
        selectedMonth,
        personalBudgetLimit,
        monthlySalary,
      ),
    [transactions, selectedYear, selectedMonth, monthlySalary],
  );

  const totalExpenses = currentSummary.totalExpenses;
  const netSavings = currentSummary.netSavings;
  const remainingBudget = currentSummary.remainingBudget;
  const month = formatCurrentMonthLabel();

  function handleMonthlySalaryChange(value) {
    if (!activePeriodKey) {
      return;
    }

    if (!user?.uid) {
      return;
    }

    const numericValue = Number(value || 0);

    setSalaryByPeriod((current) => ({
      ...current,
      [activePeriodKey]: numericValue,
    }));

    if (!db) {
      return;
    }

    const [yearPart, monthPart] = activePeriodKey.split("-");
    const budgetDocId = `${user.uid}_${activePeriodKey}`;

    setDoc(doc(db, "monthlyBudgets", budgetDocId), {
      userId: user.uid,
      periodKey: activePeriodKey,
      year: Number(yearPart),
      month: monthPart,
      monthlySalary: numericValue,
      updatedAt: serverTimestamp(),
    }).catch((budgetError) => {
      console.error("Failed to save monthly salary:", budgetError);
    });
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!db || !user?.uid || !formData.date || !formData.amount) {
      return;
    }

    const selectedDate = new Date(formData.date);
    if (Number.isNaN(selectedDate.getTime())) {
      return;
    }

    const year = selectedDate.getFullYear();
    const monthIndex = selectedDate.getMonth();
    const transactionType = getTransactionType(formData.category);
    const amount = Number(formData.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return;
    }

    addDoc(collection(db, "transactions"), {
      userId: user.uid,
      date: Timestamp.fromDate(selectedDate),
      year,
      monthIndex,
      category: formData.category,
      transactionType,
      amount,
      description: formData.description.trim(),
      createdAt: serverTimestamp(),
    })
      .then(() => {
        setFormData({
          date: "",
          category: categories && categories.length > 0 ? categories[0] : "",
          amount: "",
          description: "",
        });
        setIsFormOpen(false);
      })
      .catch((submitError) => {
        console.error("Failed to save transaction:", submitError);
      });
  }

  function handleDeleteTransaction(transactionId) {
    if (!db || !transactionId) {
      return;
    }

    const confirmed = window.confirm(
      "Delete this transaction? This action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    deleteDoc(doc(db, "transactions", transactionId)).catch((deleteError) => {
      console.error("Failed to delete transaction:", deleteError);
    });
  }

  async function handleInstallmentSubmit(installmentPayload) {
    if (!addInstallment || installmentSubmitting) {
      return;
    }

    try {
      setInstallmentSubmitting(true);
      const ok = await addInstallment(installmentPayload);
      if (ok) {
        setIsFormOpen(false);
      }
    } catch (submitError) {
      console.error("Failed to save installment:", submitError);
    } finally {
      setInstallmentSubmitting(false);
    }
  }

  function handleOpenEditTransaction(transaction) {
    if (!transaction) {
      return;
    }

    // Convert Firestore Timestamp to ISO date string (YYYY-MM-DD) for the date input
    let dateStr = "";
    if (transaction.date) {
      if (transaction.date.toDate) {
        // Firestore Timestamp object
        const dateObj = transaction.date.toDate();
        dateStr = dateObj.toISOString().split("T")[0];
      } else if (typeof transaction.date === "string") {
        // Already a string
        dateStr = transaction.date;
      }
    }

    setEditingTransaction({
      id: transaction.id,
      date: dateStr,
      category: transaction.category || "Fuel",
      amount: String(transaction.amount ?? ""),
      description: transaction.description || "",
    });
  }

  function handleEditChange(event) {
    const { name, value } = event.target;

    setEditingTransaction((current) =>
      current
        ? {
            ...current,
            [name]: value,
          }
        : current,
    );
  }

  function handleSaveEdit(event) {
    event.preventDefault();

    if (
      !db ||
      !user?.uid ||
      !editingTransaction?.id ||
      !editingTransaction.date
    ) {
      return;
    }

    const selectedDate = new Date(editingTransaction.date);
    if (Number.isNaN(selectedDate.getTime())) {
      return;
    }

    const amount = Number(editingTransaction.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return;
    }

    const year = selectedDate.getFullYear();
    const monthIndex = selectedDate.getMonth();

    updateDoc(doc(db, "transactions", editingTransaction.id), {
      userId: user.uid,
      date: Timestamp.fromDate(selectedDate),
      year,
      monthIndex,
      category: editingTransaction.category,
      transactionType: getTransactionType(editingTransaction.category),
      amount,
      description: editingTransaction.description.trim(),
      updatedAt: serverTimestamp(),
    }).catch((updateError) => {
      console.error("Failed to update transaction:", updateError);
    });

    setEditingTransaction(null);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="min-h-screen bg-minimal-grid bg-[length:24px_24px]">
        <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8">
          {/* HEADER: Title + Add Transaction Button */}
          <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                Personal Finance Tracker
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Wealth Dashboard
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Monitor your budget, track expenses, and achieve your financial
                goals
              </p>
            </div>

            {/* Desktop: Add Transaction Button */}
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="hidden sm:inline-flex shrink-0 items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 active:bg-slate-950"
            >
              <span>+</span>
              <span>Add Transaction</span>
            </button>
          </header>

          {/* DASHBOARD CONTENT */}
          <div className="w-full">
            <DashboardSummary
              month={month}
              budgetLimit={personalBudgetLimit}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              availableYears={availableYears}
              monthsForSelectedYear={monthsForSelectedYear}
              monthlySalary={monthlySalary}
              onMonthlySalaryChange={handleMonthlySalaryChange}
              totalExpenses={totalExpenses}
              netSavings={netSavings}
              remainingBudget={remainingBudget}
              salaryDate={salaryDate}
              formatCurrency={formatCurrency}
              transactions={transactions}
              groupedTransactions={groupedTransactions}
              salaryByPeriod={salaryByPeriod}
              loading={loading || salaryLoading}
              error={error || salaryError}
              onYearChange={setSelectedYear}
              onMonthChange={setSelectedMonth}
              onDeleteTransaction={handleDeleteTransaction}
              onEditTransaction={handleOpenEditTransaction}
            />
          </div>
        </div>

        {/* MOBILE: Floating Action Button (FAB) */}
        <button
          type="button"
          onClick={() => setIsFormOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-2xl text-white shadow-lg transition hover:bg-slate-800 active:bg-slate-950 sm:hidden"
          title="Add transaction"
        >
          +
        </button>

        {/* FORM MODAL: Backdrop + Animation */}
        {isFormOpen ? (
          <div className="fixed inset-0 z-50 flex items-end overflow-y-auto px-4 py-4 sm:items-center sm:py-0 sm:px-0 md:p-0">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
              onClick={() => setIsFormOpen(false)}
            />

            {/* Modal Container with Animations */}
            {/* Mobile: Slide-up from bottom */}
            {/* Desktop: Fade-in to center */}
            <div className="relative w-full transform sm:mx-auto sm:w-full sm:max-w-2xl">
              {/* Mobile slide-up animation */}
              <div className="relative max-h-[calc(100vh-2rem)] overflow-y-auto rounded-t-2xl bg-white p-6 shadow-2xl transition animate-in slide-in-from-bottom-1/2 duration-300 sm:max-h-none sm:overflow-visible sm:rounded-2xl sm:p-8 sm:zoom-in-95 sm:fade-in-0 md:zoom-in-95 md:fade-in-0 sm:duration-200">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  aria-label="Close add transaction modal"
                  className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full text-slate-400 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-4 focus:ring-slate-200"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path d="M18 6 6 18" />
                    <path d="M6 6l12 12" />
                  </svg>
                </button>

                {/* Header */}
                <div className="mb-6 flex flex-col items-start justify-between gap-3 pr-12 sm:flex-row sm:items-center sm:pr-0">
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-900">
                      New Transaction
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Add income, expenses, or payment plans
                    </p>
                  </div>
                </div>

                {/* Form */}
                <TransactionsEntryForm
                  categories={categories}
                  formData={formData}
                  onChange={handleChange}
                  onSubmit={handleSubmit}
                  onInstallmentSubmit={handleInstallmentSubmit}
                  installmentSubmitting={installmentSubmitting}
                />
              </div>
            </div>
          </div>
        ) : null}

        {/* EDIT TRANSACTION MODAL */}
        {editingTransaction ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="mb-5 flex items-center justify-between gap-3 sticky top-0 bg-white pb-4 border-b border-slate-200">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Edit Transaction
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Update transaction details and save changes
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingTransaction(null)}
                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                >
                  Close
                </button>
              </div>

              <form
                className="grid gap-4 md:grid-cols-2"
                onSubmit={handleSaveEdit}
              >
                <label className="grid gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Date
                  </span>
                  <input
                    type="date"
                    name="date"
                    value={editingTransaction.date}
                    onChange={handleEditChange}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Category
                  </span>
                  <select
                    name="category"
                    value={editingTransaction.category}
                    onChange={handleEditChange}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Amount
                  </span>
                  <input
                    type="number"
                    name="amount"
                    min="0"
                    step="0.01"
                    value={editingTransaction.amount}
                    onChange={handleEditChange}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Description
                  </span>
                  <input
                    type="text"
                    name="description"
                    value={editingTransaction.description}
                    onChange={handleEditChange}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  />
                </label>

                <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingTransaction(null)}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
