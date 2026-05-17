/**
 * InstallmentProgressBar
 * Visual tracker for active financial goals and installments
 * Examples: Car loans, Koko schemes, Personal savings goals
 */
export default function InstallmentProgressBar({
  installment = {},
  formatCurrency = (val) => `$${val.toFixed(0)}`,
  onEdit = null,
  onPause = null,
}) {
  const {
    name = "Goal",
    icon = "🎯",
    currentAmount = 0,
    targetAmount = 100000,
    monthlyContribution = 10000,
    targetDate = null,
    status = "active",
    color = "#3B82F6",
  } = installment;

  // Calculate progress percentage
  const progressPercent = Math.min(
    100,
    Math.round((currentAmount / targetAmount) * 100),
  );

  // Calculate completion status
  const isCompleted = progressPercent >= 100;
  const isPaused = status === "paused";
  const isActive = status === "active";

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
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-soft transition-all duration-300 hover:shadow-md">
      {/* Header with Name and Status */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{icon}</span>
          <div>
            <h4 className="font-semibold text-slate-900">{name}</h4>
            <p className="text-xs text-slate-500">
              {monthlyContribution
                ? `${formatCurrency(monthlyContribution)}/month`
                : "—"}
            </p>
          </div>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${config.badge}`}
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
              boxShadow: `inset 0 1px 2px rgba(0,0,0,0.1)`,
            }}
          />
        </div>
        <p className="mt-2 text-right text-sm font-semibold text-slate-700">
          {progressPercent}% Complete
        </p>
      </div>

      {/* Amount Grid */}
      <div className="mb-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
        <div>
          <p className="text-xs font-medium text-slate-500">Paid</p>
          <p className="mt-1 font-semibold text-slate-900">
            {formatCurrency(currentAmount)}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">Target</p>
          <p className="mt-1 font-semibold text-slate-900">
            {formatCurrency(targetAmount)}
          </p>
        </div>
      </div>

      {/* Remaining Amount Card */}
      {!isCompleted && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
          <p className="text-xs font-medium text-blue-600">Amount Remaining</p>
          <p className="mt-1 text-2xl font-bold text-blue-700">
            {formatCurrency(Math.max(0, targetAmount - currentAmount))}
          </p>
        </div>
      )}

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
        <div className="mb-4 flex items-center justify-between rounded-lg bg-slate-100 px-3 py-2">
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
      <div className="flex gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
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
