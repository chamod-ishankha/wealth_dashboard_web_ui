import StatCard from "./StatCard";

export default function DashboardSummary({
  month,
  budgetLimit,
  monthlySalary,
  onMonthlySalaryChange,
  totalExpenses,
  netSavings,
  remainingBudget,
  formatCurrency,
}) {
  const remainingTone =
    remainingBudget > 0
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : remainingBudget === 0
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-rose-200 bg-rose-50 text-rose-700";

  const remainingLabel =
    remainingBudget > 0
      ? "Under budget"
      : remainingBudget === 0
        ? "Budget exhausted"
        : "Overspent";

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
          {month}
        </span>
      </div>

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
          value={formatCurrency(totalExpenses)}
          accent="amber"
        />
        <StatCard
          label="Net Savings"
          value={formatCurrency(netSavings)}
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
            {formatCurrency(remainingBudget)}
          </p>
        </div>
      </div>
    </section>
  );
}
