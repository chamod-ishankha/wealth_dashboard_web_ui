/**
 * InstallmentProgressBar
 * Visual tracker for active financial goals and installments
 * Examples: Car loans, Koko schemes, Personal savings goals
 */
export default function InstallmentProgressBar({
  installment = {},
  formatCurrency = null,
  onEdit = null,
  onPause = null,
}) {
  const {
    name = "Goal",
    icon = "🎯",
    currentAmount = 0,
    targetAmount = 100000,
    totalAmount,
    monthlyContribution = 10000,
    monthlyAmount,
    totalMonths = 0,
    targetDate = null,
    status = "active",
    color = "#3B82F6",
  } = installment;

  const principalAmount = Number(totalAmount || targetAmount || 0);
  const monthlyInstallment = Number(monthlyAmount || monthlyContribution || 0);
  const installmentCount = Number(totalMonths || 0);
  const totalPayable = monthlyInstallment * installmentCount;
  const totalInterest = Math.max(0, totalPayable - principalAmount);

  const money = (value) => {
    if (typeof formatCurrency === "function") {
      return formatCurrency(Number(value || 0));
    }

    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  };

  // Calculate progress percentage
  const progressPercent = Math.min(
    100,
    Math.round(
      (Number(currentAmount || 0) / Math.max(1, principalAmount)) * 100,
    ),
  );

  // Calculate completion status
  const isCompleted = progressPercent >= 100;
  const isPaused = status === "paused";

  // Calculate months remaining if target date exists
  let monthsRemaining = null;
  if (targetDate) {
    const now = new Date();
    const target = targetDate.toDate
      ? targetDate.toDate()
      : new Date(targetDate);
    const monthsDiff = Math.ceil((target - now) / (1000 * 60 * 60 * 24 * 30));
    monthsRemaining = Math.max(0, monthsDiff);
  }

  // Determine status styling
  const statusConfig = {
    active: {
      badge: "bg-emerald-100 text-emerald-700",
      icon: "✓",
      message: "On Track",
    },
    completed: {
      badge: "bg-blue-100 text-blue-700",
      icon: "✓",
      message: "Completed",
    },
    paused: {
      badge: "bg-amber-100 text-amber-700",
      icon: "⏸",
      message: "Paused",
    },
  };

  const config = statusConfig[status] || statusConfig.active;

  return (
    <div className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-soft transition-all duration-300 hover:shadow-md sm:p-5">
      {/* Header with Name and Status */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="text-3xl">{icon}</span>
          <div className="min-w-0">
            <h4 className="truncate font-semibold text-slate-900">{name}</h4>
            <p className="truncate text-xs text-slate-500">
              {monthlyInstallment ? `${money(monthlyInstallment)}/month` : "—"}
            </p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${config.badge}`}
        >
          {config.icon} {config.message}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="relative h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: color,
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
            }}
          />
        </div>
        <p className="mt-2 text-right text-sm font-semibold text-slate-700">
          {progressPercent}% Complete
        </p>
      </div>

      {/* Amount Grid */}
      <div className="mb-4 grid grid-cols-1 gap-3 rounded-xl bg-slate-50 p-3 sm:grid-cols-2">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500">Paid</p>
          <p className="mt-1 break-words text-sm font-semibold text-slate-900 sm:text-base">
            {money(currentAmount)}
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500">Target</p>
          <p className="mt-1 break-words text-sm font-semibold text-slate-900 sm:text-base">
            {money(principalAmount)}
          </p>
        </div>
      </div>

      {/* Remaining Amount Card */}
      {!isCompleted && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
          <p className="text-xs font-medium text-blue-600">Amount Remaining</p>
          <p className="mt-1 text-2xl font-bold text-blue-700">
            {money(Math.max(0, principalAmount - Number(currentAmount || 0)))}
          </p>
        </div>
      )}

      {/* Interest Cost Analytics */}
      <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-slate-800">
            Interest Cost Analytics
          </p>
          <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-500">
            {installmentCount > 0 ? `${installmentCount} months` : "N/A"}
          </span>
        </div>

        <div className="grid items-stretch gap-2 grid-cols-1">
          <div className="flex h-full min-w-0 flex-col justify-between rounded-lg bg-white px-3 py-2">
            <p className="min-h-8 text-xs leading-snug text-slate-500">
              Principal Amount
            </p>
            <p className="mt-1 break-words text-sm font-semibold tabular-nums text-slate-900 sm:text-base">
              {money(principalAmount)}
            </p>
          </div>
          <div className="flex h-full min-w-0 flex-col justify-between rounded-lg bg-white px-3 py-2">
            <p className="min-h-8 text-xs leading-snug text-slate-500">
              Lease Premium / Interest
            </p>
            <p className="mt-1 break-words text-sm font-semibold tabular-nums text-amber-700 sm:text-base">
              {money(totalInterest)}
            </p>
          </div>
          <div className="flex h-full min-w-0 flex-col justify-between rounded-lg bg-white px-3 py-2">
            <p className="min-h-8 text-xs leading-snug text-slate-500">
              Total Forecasted Cost
            </p>
            <p className="mt-1 break-words text-sm font-semibold tabular-nums text-slate-900 sm:text-base">
              {money(totalPayable)}
            </p>
          </div>
        </div>
      </div>

      {/* Completion Message */}
      {isCompleted && (
        <div className="mb-4 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3 text-center">
          <p className="text-sm font-semibold text-emerald-700">
            🎉 Goal Completed!
          </p>
          <p className="mt-1 text-xs text-emerald-600">
            You've reached your target amount.
          </p>
        </div>
      )}

      {/* Timeline Info */}
      {monthsRemaining !== null && !isCompleted && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-100 px-3 py-2">
          <span className="text-sm font-medium text-slate-700">
            {monthsRemaining > 0
              ? `${monthsRemaining} month${monthsRemaining !== 1 ? "s" : ""} remaining`
              : "Overdue"}
          </span>
          <span
            className={`text-xs font-semibold ${
              monthsRemaining > 3 ? "text-emerald-600" : "text-amber-600"
            }`}
          >
            {monthsRemaining > 3 ? "On Schedule" : "Expedite"}
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-auto flex gap-2 opacity-100 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100">
        {onEdit && (
          <button
            onClick={() => onEdit(installment)}
            className="flex-1 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
          >
            Edit
          </button>
        )}
        {onPause && (
          <button
            onClick={() => onPause(installment.id)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
              isPaused
                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                : "bg-amber-100 text-amber-700 hover:bg-amber-200"
            }`}
          >
            {isPaused ? "Resume" : "Pause"}
          </button>
        )}
      </div>
    </div>
  );
}
