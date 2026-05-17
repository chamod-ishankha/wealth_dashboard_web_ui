import { useAuth } from "../context/AuthContext";
import CategoryManager from "./CategoryManager";

export default function Profile() {
  const { user, logout } = useAuth();

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
