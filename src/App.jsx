import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import DashboardSummary from "./components/DashboardSummary";
import StatCard from "./components/StatCard";
import TransactionsEntryForm from "./components/TransactionsEntryForm";
import useMonthlySalaries from "./hooks/useMonthlySalaries";
import useTransactions from "./hooks/useTransactions";
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

const categories = [
  "Fuel",
  "Bills",
  "Loan",
  "Koko",
  "Personal",
  "Withdraw",
  "Reload",
];
const personalBudgetLimit = 20000;

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function App() {
  const [activeTab, setActiveTab] = useState("entry");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [salaryByPeriod, setSalaryByPeriod] = useState({});
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formData, setFormData] = useState({
    date: "",
    category: "Fuel",
    amount: "",
    description: "",
  });

  const { transactions, loading, error } = useTransactions();
  const {
    salaryByPeriod: remoteSalaryByPeriod,
    loading: salaryLoading,
    error: salaryError,
  } = useMonthlySalaries();

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

  const activePeriodKey =
    selectedYear && selectedMonth
      ? getPeriodKey(selectedYear, selectedMonth)
      : "";
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

    const numericValue = Number(value || 0);

    setSalaryByPeriod((current) => ({
      ...current,
      [activePeriodKey]: numericValue,
    }));

    if (!db) {
      return;
    }

    const [yearPart, monthPart] = activePeriodKey.split("-");

    setDoc(doc(db, "monthlyBudgets", activePeriodKey), {
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

    if (!db || !formData.date || !formData.amount) {
      return;
    }

    const selectedDate = new Date(formData.date);
    if (Number.isNaN(selectedDate.getTime())) {
      return;
    }

    const year = selectedDate.getFullYear();
    const monthName = selectedDate.toLocaleString("en-US", { month: "long" });
    const dayOfWeek = selectedDate.toLocaleString("en-US", { weekday: "long" });
    const transactionType = getTransactionType(formData.category);
    const amount = Number(formData.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return;
    }

    addDoc(collection(db, "transactions"), {
      date: formData.date,
      year,
      month: monthName,
      monthIndex: selectedDate.getMonth(),
      dayOfWeek,
      category: formData.category,
      transactionType,
      amount,
      description: formData.description.trim(),
      createdAt: serverTimestamp(),
    })
      .then(() => {
        setFormData({
          date: "",
          category: "Fuel",
          amount: "",
          description: "",
        });

        setActiveTab("dashboard");
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

  function handleOpenEditTransaction(transaction) {
    if (!transaction) {
      return;
    }

    setEditingTransaction({
      id: transaction.id,
      date: transaction.date || "",
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

    if (!db || !editingTransaction?.id || !editingTransaction.date) {
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
    const monthName = selectedDate.toLocaleString("en-US", { month: "long" });
    const dayOfWeek = selectedDate.toLocaleString("en-US", { weekday: "long" });

    updateDoc(doc(db, "transactions", editingTransaction.id), {
      date: editingTransaction.date,
      year,
      month: monthName,
      monthIndex: selectedDate.getMonth(),
      dayOfWeek,
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
    <main className="min-h-screen bg-minimal-grid bg-[length:24px_24px]">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-3xl border border-white/60 bg-white/70 p-6 shadow-soft backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Personal Finance Tracker
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Minimal money management UI
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Track transactions, review monthly summary metrics, and monitor
                your personal budget limit in a sleek React + Tailwind layout.
              </p>
            </div>

            <div className="flex rounded-2xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setActiveTab("entry")}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  activeTab === "entry"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Transactions Entry Form
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("dashboard")}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  activeTab === "dashboard"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Dashboard Summary
              </button>
            </div>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-5">
          <div className="xl:col-span-3">
            {activeTab === "entry" ? (
              <TransactionsEntryForm
                categories={categories}
                formData={formData}
                onChange={handleChange}
                onSubmit={handleSubmit}
              />
            ) : (
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
            )}
          </div>

          <aside className="xl:col-span-2">
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-soft backdrop-blur">
              <h3 className="text-lg font-semibold text-slate-900">
                Quick Snapshot
              </h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <StatCard
                  label="Entries"
                  value={transactions.length}
                  accent="slate"
                />
                <StatCard
                  label="Current Budget Remaining"
                  value={formatCurrency(remainingBudget)}
                  accent="blue"
                />
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-500">
                  Latest entry
                </p>
                {transactions.length > 0 ? (
                  <div className="mt-3 space-y-1">
                    <p className="font-semibold text-slate-900">
                      {transactions[0].category}
                    </p>
                    <p className="text-sm text-slate-500">
                      {transactions[0].description || "No description added"}
                    </p>
                    <p className="text-sm font-medium text-slate-700">
                      {transactions[0].date} •{" "}
                      {formatCurrency(transactions[0].amount)}
                    </p>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">
                    No transactions logged yet.
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {editingTransaction ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">
                  Edit Transaction
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Update the selected transaction and save changes to Firestore.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingTransaction(null)}
                className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                Close
              </button>
            </div>

            <form
              className="grid gap-4 md:grid-cols-2"
              onSubmit={handleSaveEdit}
            >
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">Date</span>
                <input
                  type="date"
                  name="date"
                  value={editingTransaction.date}
                  onChange={handleEditChange}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Category
                </span>
                <select
                  name="category"
                  value={editingTransaction.category}
                  onChange={handleEditChange}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Amount
                </span>
                <input
                  type="number"
                  name="amount"
                  min="0"
                  step="0.01"
                  value={editingTransaction.amount}
                  onChange={handleEditChange}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Description
                </span>
                <input
                  type="text"
                  name="description"
                  value={editingTransaction.description}
                  onChange={handleEditChange}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                />
              </label>

              <div className="md:col-span-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingTransaction(null)}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}
