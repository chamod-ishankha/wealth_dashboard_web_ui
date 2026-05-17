import { useState } from "react";
import useCategories from "../hooks/useCategories";
import { useAuth } from "../context/AuthContext";

export default function CategoryManager() {
  const { user } = useAuth();
  const { categories, addCategory, removeCategory, loading } =
    useCategories(user);
  const [newCategory, setNewCategory] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleAddCategory(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!newCategory.trim()) {
      setError("Category name cannot be empty.");
      return;
    }

    if (categories.includes(newCategory.trim())) {
      setError("This category already exists.");
      return;
    }

    try {
      await addCategory(newCategory);
      setSuccess(`Category "${newCategory}" added successfully.`);
      setNewCategory("");
    } catch (err) {
      setError(`Failed to add category: ${err.message}`);
    }
  }

  async function handleRemoveCategory(category) {
    if (!window.confirm(`Remove category "${category}"?`)) {
      return;
    }

    try {
      setError("");
      setSuccess("");
      await removeCategory(category);
      setSuccess(`Category "${category}" removed successfully.`);
    } catch (err) {
      setError(`Failed to remove category: ${err.message}`);
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
      <h2 className="text-xl font-semibold text-slate-900">
        Manage Categories
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Add or remove transaction categories for your profile.
      </p>

      {error && (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <form className="mt-6 space-y-3" onSubmit={handleAddCategory}>
        <div className="flex gap-2">
          <input
            type="text"
            value={newCategory}
            onChange={(event) => setNewCategory(event.target.value)}
            placeholder="Enter new category name"
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-70"
          >
            Add
          </button>
        </div>
      </form>

      <div className="mt-6">
        <div className="mb-3 text-sm font-medium text-slate-700">
          Current Categories ({categories.length})
        </div>
        <div className="flex flex-wrap gap-2">
          {loading ? (
            <p className="text-sm text-slate-500">Loading categories...</p>
          ) : categories.length > 0 ? (
            categories.map((category) => (
              <div
                key={category}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-900"
              >
                {category}
                <button
                  type="button"
                  onClick={() => handleRemoveCategory(category)}
                  className="rounded-full text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">No categories yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
