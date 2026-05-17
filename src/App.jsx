import { useMemo, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import DashboardSummary from "./components/DashboardSummary";
import StatCard from "./components/StatCard";
import TransactionsEntryForm from "./components/TransactionsEntryForm";
import useTransactions from "./hooks/useTransactions";
import {
  calculateMonthlySummary,
  formatCurrentMonthLabel,
  getTransactionType,
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
  const [monthlySalary, setMonthlySalary] = useState(0);
  const [formData, setFormData] = useState({
    date: "",
    category: "Fuel",
    amount: "",
    description: "",
  });

  const { transactions, loading, error } = useTransactions();
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.toLocaleString("en-US", { month: "long" });
  const currentSummary = useMemo(
    () =>
      calculateMonthlySummary(
        transactions,
        currentYear,
        currentMonth,
        20000,
        monthlySalary,
      ),
    [transactions, currentYear, currentMonth, monthlySalary],
  );

  const totalExpenses = currentSummary.totalExpenses;
  const netSavings = currentSummary.netSavings;
  const remainingBudget = currentSummary.remainingBudget;
  const month = formatCurrentMonthLabel();

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
                monthlySalary={monthlySalary}
                onMonthlySalaryChange={setMonthlySalary}
                totalExpenses={totalExpenses}
                netSavings={netSavings}
                remainingBudget={remainingBudget}
                formatCurrency={formatCurrency}
                transactions={transactions}
                loading={loading}
                error={error}
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
    </main>
  );
}
