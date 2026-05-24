import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Brand from "./Brand";

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess("Password reset email sent successfully.");
    } catch (resetError) {
      setError(resetError.message || "Unable to send reset email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <Brand to="/" size="lg" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
            Reset password
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            Forgot your password?
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Enter your email to receive a reset link.
          </p>{" "}
          <p className="mt-4 text-sm text-slate-600">
            Remember your password?{" "}
            <Link
              to="/login"
              className="font-semibold text-slate-950 hover:text-slate-700"
            >
              Sign in
            </Link>
          </p>{" "}
        </div>

        {error ? (
          <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        ) : null}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Sending..." : "Send reset email"}
          </button>
        </form>
      </div>
    </div>
  );
}
