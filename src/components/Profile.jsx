import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CategoryManager from "./CategoryManager";
import useUserSettings from "../hooks/useUserSettings";

const SALARY_DATE_OPTIONS = Array.from({ length: 31 }, (_, index) => index + 1);

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { salaryDate, loading, error, saveUserSettings } =
    useUserSettings(user);
  const [selectedSalaryDate, setSelectedSalaryDate] = useState("30");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const identity = useMemo(
    () => user?.displayName?.trim() || user?.email?.trim() || "User",
    [user?.displayName, user?.email],
  );

  const fullName = user?.displayName?.trim() || "No name set";
  const email = user?.email?.trim() || "No email available";
  const avatarLabel = identity.charAt(0).toUpperCase();

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

  async function handleLogout() {
    try {
      await logout();
      navigate("/login");
    } catch (logoutError) {
      console.error("Logout error:", logoutError);
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] pt-8 pb-12 px-4 relative overflow-y-auto bg-minimal-grid bg-[length:24px_24px]">
      {/* Background Glow FX */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute right-[-4rem] top-20 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-slate-500/10 blur-3xl" />
      </div>

      {/* Navigation - Exact 1220px Match */}
      <div className="max-w-[1220px] mx-auto w-full">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium text-sm mb-6 transition-colors hover:-translate-x-1"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* Main Content Layout - Exact 1220px Match with Balanced Grid */}
      <div className="max-w-[1220px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT CARD: User Profile (3 Columns) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0 border-2 border-slate-100 shadow-sm mb-4">
            {user?.photoURL ? (
              <img
                className="w-full h-full object-cover"
                src={user.photoURL}
                alt={identity}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-900 text-white text-3xl font-bold">
                {avatarLabel}
              </div>
            )}
          </div>

          <h1 className="text-xl font-semibold text-slate-900 truncate w-full px-2">
            {fullName}
          </h1>
          <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 max-w-full">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="truncate">{email}</span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-6 w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Logout
          </button>
        </div>

        {/* RIGHT CARDS: Financial Settings & Categories (9 Columns) */}
        <div className="lg:col-span-9 flex flex-col gap-6 w-full">
          <form
            onSubmit={handleSaveSalaryDate}
            className="w-full bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm"
          >
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Financial Settings
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Configure your salary cycle and dashboard timing preferences.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Salary Payout Date
                </span>
                <select
                  value={selectedSalaryDate}
                  onChange={(event) =>
                    setSelectedSalaryDate(event.target.value)
                  }
                  className="rounded-xl border border-slate-200 p-3 w-full bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-slate-900"
                >
                  {SALARY_DATE_OPTIONS.map((day) => (
                    <option key={day} value={day}>
                      Day {day}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="text-sm font-medium text-slate-700">
                  Current Setting
                </span>
                <span className="text-sm text-slate-500">
                  Day {selectedSalaryDate} of every month
                </span>
              </div>
            </div>

            {loading && (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                Loading saved payout date...
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {error}
              </div>
            )}

            {saveMessage && (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {saveMessage}
              </div>
            )}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                Used by dashboard calculations in real time.
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

          <CategoryManager />
        </div>
      </div>
    </div>
  );
}
