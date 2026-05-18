import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import CategoryManager from "./CategoryManager";
import useUserSettings from "../hooks/useUserSettings";

const SALARY_DATE_OPTIONS = Array.from({ length: 31 }, (_, index) => index + 1);

export default function Profile() {
  const { user, logout } = useAuth();
  const { salaryDate, loading, error, saveUserSettings } =
    useUserSettings(user);
  const [selectedSalaryDate, setSelectedSalaryDate] = useState("30");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    setSelectedSalaryDate(String(salaryDate || 30));
  }, [salaryDate]);

  async function handleSaveSalaryDate(event) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setSaveMessage("");

    const ok = await saveUserSettings(Number(selectedSalaryDate || 30));

    if (ok) {
      setSaveMessage("Salary payout date saved.");
    }

    setSaving(false);
  }

  return (
    <div className="mx-auto min-h-screen max-w-3xl space-y-6 px-4 py-10">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
            Profile
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            Account details
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            View your current session information.
          </p>
        </div>

        <div className="space-y-4 rounded-2xl bg-slate-50 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Name
            </p>
            <p className="mt-1 text-base font-medium text-slate-900">
              {user?.displayName || "No name set"}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Email
            </p>
            <p className="mt-1 text-base font-medium text-slate-900">
              {user?.email || "No email available"}
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSaveSalaryDate}
          className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5"
        >
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Salary Payout Date
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Select the day of the month your salary is paid. This helps the
              dashboard calculate monthly budgets more accurately.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-700">
                Payout Day
              </span>
              <select
                value={selectedSalaryDate}
                onChange={(event) => setSelectedSalaryDate(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
              >
                {SALARY_DATE_OPTIONS.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3">
              <span className="text-sm font-medium text-slate-700">
                Current Setting
              </span>
              <span className="text-sm text-slate-500">
                Day {selectedSalaryDate} of every month
              </span>
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {error}
            </div>
          ) : null}

          {saveMessage ? (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {saveMessage}
            </div>
          ) : null}

          <div className="mt-5 flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              {loading
                ? "Loading saved payout date..."
                : "Used by dashboard components in real time."}
            </p>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Salary Payout Date"}
            </button>
          </div>
        </form>

        <button
          type="button"
          onClick={logout}
          className="mt-6 w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Logout
        </button>
      </div>

      <CategoryManager />
    </div>
  );
}
