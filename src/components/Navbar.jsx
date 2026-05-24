import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Brand from "./Brand";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const identity = user?.displayName || user?.email || "User";
  const avatarLabel = identity.trim().charAt(0).toUpperCase();

  async function handleLogout() {
    try {
      await logout();
      setIsMenuOpen(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Brand to="/dashboard" size="md" />

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsMenuOpen((current) => !current)}
            className="flex items-center justify-center rounded-full transition hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-slate-200"
            aria-expanded={isMenuOpen}
            aria-label="Open user menu"
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={identity}
                className="h-11 w-11 rounded-full border border-slate-200 object-cover shadow-sm"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white shadow-sm">
                {avatarLabel}
              </div>
            )}
          </button>

          {isMenuOpen ? (
            <div className="absolute right-0 top-full mt-2 w-48 max-w-[calc(100vw-1rem)] overflow-hidden rounded-xl border border-slate-100 bg-white shadow-lg">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {identity}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {user?.email || "Signed in user"}
                </p>
              </div>

              <Link
                to="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
              >
                View Profile
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="block w-full px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-rose-50 hover:text-rose-600"
              >
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
