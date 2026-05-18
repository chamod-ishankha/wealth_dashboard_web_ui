import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import useInstallments from "../hooks/useInstallments";

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
  const { user } = useAuth();
  const { payInstallment } = useInstallments(user);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDateConfirm, setShowDateConfirm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
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
    <div className="group flex h-full flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md">
      {/* Header with Name and Status */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div className="min-w-0">
            <h4 className="truncate font-semibold text-slate-900">{name}</h4>
            <p className="truncate text-xs text-slate-500">
              {monthlyInstallment ? `${money(monthlyInstallment)}/month` : "—"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${config.badge}`}
          >
            {config.icon} {config.message}
          </span>

          {/* Mark as Paid / Paid badge */}
          {installment.isPaidThisMonth ? (
            <span className="shrink-0 bg-emerald-100 text-emerald-700 font-medium px-3 py-1.5 rounded-xl text-xs flex items-center gap-1">
              Paid ✓
            </span>
          ) : (
            <button
              onClick={() => setShowDateConfirm(true)}
              disabled={isSubmitting}
              className="shrink-0 bg-slate-900 text-white hover:bg-slate-800 font-medium px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1 disabled:opacity-60"
            >
              {isSubmitting ? "Processing..." : "Mark as Paid"}
            </button>
          )}
        </div>
      </div>

      {/* Date confirmation overlay/modal */}
      {showDateConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-900">
                  Confirm Installment Payment
                </h4>
                <p className="mt-1 text-xs text-slate-500">
                  Choose the payment date for this installment.
                </p>
              </div>
              <button
                onClick={() => setShowDateConfirm(false)}
                className="ml-3 rounded-md bg-slate-100 px-2 py-1 text-sm text-slate-700"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <label className="grid gap-2">
                <span className="text-xs font-medium text-slate-600">
                  Payment date
                </span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-slate-100"
                />
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDateConfirm(false)}
                className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (isSubmitting || !payInstallment) return;
                  try {
                    setIsSubmitting(true);
                    const dateObj = new Date(`${selectedDate}T00:00:00`);
                    const ok = await payInstallment(installment, dateObj);
                    if (ok) setShowDateConfirm(false);
                  } catch (err) {
                    console.error("Confirm payment failed:", err);
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                disabled={isSubmitting}
                className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {isSubmitting ? "Processing..." : "Confirm Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar - Thin Minimalist */}
      <div className="mb-5">
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: color,
            }}
          />
        </div>
        <p className="mt-2.5 text-right text-xs font-semibold text-slate-600">
          {progressPercent}% Complete
        </p>
      </div>

      {/* Amount Metrics Grid - Two Column */}
      <div className="mb-5 grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500">Paid</p>
          <p className="mt-1.5 font-semibold text-slate-900">
            {money(currentAmount)}
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500">Target</p>
          <p className="mt-1.5 font-semibold text-slate-900">
            {money(principalAmount)}
          </p>
        </div>
      </div>

      {/* Remaining Amount Card */}
      {!isCompleted && (
        <div className="mb-5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
          <p className="text-xs font-medium text-blue-600">Remaining</p>
          <p className="mt-1.5 text-lg font-bold text-blue-700">
            {money(Math.max(0, principalAmount - Number(currentAmount || 0)))}
          </p>
        </div>
      )}

      {/* Interest Cost Analytics - Streamlined Grid */}
      <div className="mb-1 rounded-lg border border-slate-100 bg-slate-50 p-4">
        <p className="mb-3 text-xs font-semibold text-slate-700">
          Cost Breakdown
        </p>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-md bg-white px-3 py-2">
            <p className="text-xs text-slate-500">Principal</p>
            <p className="mt-1 text-sm font-bold text-slate-900">
              {money(principalAmount)}
            </p>
          </div>
          <div className="rounded-md bg-white px-3 py-2">
            <p className="text-xs text-slate-500">Interest</p>
            <p className="mt-1 text-sm font-bold text-amber-700">
              {money(totalInterest)}
            </p>
          </div>
        </div>

        <div className="mt-2 rounded-md bg-white px-3 py-2">
          <p className="text-xs text-slate-500">Total Cost</p>
          <p className="mt-1 text-base font-bold text-slate-900">
            {money(totalPayable)}
          </p>
        </div>
      </div>

      {/* Completion Message */}
      {isCompleted && (
        <div className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-center">
          <p className="text-sm font-semibold text-emerald-700">
            🎉 Goal Completed!
          </p>
          <p className="mt-1 text-xs text-emerald-600">
            Congratulations on reaching your target.
          </p>
        </div>
      )}

      {/* Timeline Info */}
      {monthsRemaining !== null && !isCompleted && (
        <div className="mt-4 mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-100 px-3 py-2">
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
