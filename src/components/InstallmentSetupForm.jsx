import { useEffect, useMemo, useState } from "react";

const DEFAULT_VALUES = {
  name: "",
  type: "loan",
  category: "Loan",
  totalAmount: "",
  monthlyAmount: "",
  totalMonths: "",
  currentAmount: "0",
  targetDate: "",
  description: "",
};

function toInputDate(value) {
  if (!value) return "";
  const date = value?.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export default function InstallmentSetupForm({
  initialValues = {},
  loading = false,
  onSubmit,
  onCancel,
}) {
  const seededValues = useMemo(
    () => ({
      ...DEFAULT_VALUES,
      ...initialValues,
      targetDate: toInputDate(initialValues.targetDate),
      totalAmount: String(
        initialValues.totalAmount ?? initialValues.targetAmount ?? "",
      ),
      monthlyAmount: String(
        initialValues.monthlyAmount ?? initialValues.monthlyContribution ?? "",
      ),
      totalMonths: String(initialValues.totalMonths ?? ""),
      currentAmount: String(initialValues.currentAmount ?? "0"),
    }),
    [initialValues],
  );

  const [form, setForm] = useState(seededValues);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(seededValues);
    setError("");
  }, [seededValues]);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const totalAmount = Number(form.totalAmount || 0);
    const monthlyAmount = Number(form.monthlyAmount || 0);
    const totalMonths = Number(form.totalMonths || 0);

    if (!form.name.trim()) {
      setError("Installment name is required.");
      return;
    }

    if (totalAmount <= 0 || monthlyAmount <= 0 || totalMonths <= 0) {
      setError(
        "Total amount, monthly amount, and total months must be greater than 0.",
      );
      return;
    }

    setError("");

    onSubmit?.({
      ...form,
      totalAmount,
      monthlyAmount,
      totalMonths,
      currentAmount: Number(form.currentAmount || 0),
      targetAmount: totalAmount,
      monthlyContribution: monthlyAmount,
      targetDate: form.targetDate ? new Date(form.targetDate) : null,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft"
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Installment Setup
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Define loan terms to track progress and interest cost.
        </p>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-slate-700">
            Installment Name
          </span>
          <input
            type="text"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            placeholder="Bike loan"
            required
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-slate-700">Category</span>
          <select
            value={form.category}
            onChange={(event) => updateField("category", event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
          >
            <option value="Loan">Loan</option>
            <option value="Koko">Koko</option>
            <option value="Personal">Personal</option>
          </select>
        </label>

        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-slate-700">
            Principal Amount
          </span>
          <input
            type="number"
            min="0"
            step="1"
            value={form.totalAmount}
            onChange={(event) => updateField("totalAmount", event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            placeholder="500000"
            required
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-slate-700">
            Monthly Installment
          </span>
          <input
            type="number"
            min="0"
            step="1"
            value={form.monthlyAmount}
            onChange={(event) =>
              updateField("monthlyAmount", event.target.value)
            }
            className="rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            placeholder="25000"
            required
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-slate-700">
            Total Number of Installments
          </span>
          <input
            type="number"
            min="1"
            step="1"
            value={form.totalMonths}
            onChange={(event) => updateField("totalMonths", event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            placeholder="24"
            required
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-slate-700">
            Amount Paid So Far
          </span>
          <input
            type="number"
            min="0"
            step="1"
            value={form.currentAmount}
            onChange={(event) =>
              updateField("currentAmount", event.target.value)
            }
            className="rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            placeholder="0"
          />
        </label>

        <label className="grid gap-1.5 md:col-span-2">
          <span className="text-sm font-medium text-slate-700">
            Target Date (Optional)
          </span>
          <input
            type="date"
            value={form.targetDate}
            onChange={(event) => updateField("targetDate", event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
          />
        </label>
      </div>

      <div className="mt-5 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save Installment"}
        </button>
      </div>
    </form>
  );
}
