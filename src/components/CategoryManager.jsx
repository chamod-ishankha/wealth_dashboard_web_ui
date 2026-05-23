import { useState } from "react";
import useCategories from "../hooks/useCategories";
import { useAuth } from "../context/AuthContext";

export default function CategoryManager() {
  const { user } = useAuth();
  const { categories, addCategory, updateCategory, removeCategory, loading } =
    useCategories(user);
  const [newCategory, setNewCategory] = useState("");
  const [newCategoryType, setNewCategoryType] = useState("expense");
  const [editingCategory, setEditingCategory] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const CATEGORY_TYPES = [
    { value: "expense", label: "Expense" },
    { value: "income", label: "Income" },
    { value: "transfer", label: "Transfer" },
  ];

  const TYPE_BADGES = {
    expense: "border-rose-200 bg-rose-50 text-rose-700",
    income: "border-emerald-200 bg-emerald-50 text-emerald-700",
    transfer: "border-amber-200 bg-amber-50 text-amber-700",
  };

  const TYPE_LABELS = {
    expense: "Expense",
    income: "Income",
    transfer: "Transfer",
  };

  async function handleAddCategory(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!newCategory.trim()) {
      setError("Category name cannot be empty.");
      return;
    }

    if (categories.some((category) => category.name === newCategory.trim())) {
      setError("This category already exists.");
      return;
    }

    try {
      await addCategory(newCategory, newCategoryType);
      setSuccess(
        `Category "${newCategory}" added successfully as ${newCategoryType}.`,
      );
      setNewCategory("");
      setNewCategoryType("expense");
    } catch (err) {
      setError(`Failed to add category: ${err.message}`);
    }
  }

  function startEditCategory(category) {
    setError("");
    setSuccess("");
    setEditingCategory(category);
    setNewCategory(category.name);
    setNewCategoryType(category.type || "expense");
  }

  function cancelEdit() {
    setEditingCategory(null);
    setNewCategory("");
    setNewCategoryType("expense");
  }

  async function handleSaveCategory(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!newCategory.trim()) {
      setError("Category name cannot be empty.");
      return;
    }

    const normalizedName = newCategory.trim();

    if (
      !editingCategory &&
      categories.some((category) => category.name === normalizedName)
    ) {
      setError("This category already exists.");
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.name, {
          name: normalizedName,
          type: newCategoryType,
        });
        setSuccess(
          `Category "${normalizedName}" updated successfully as ${newCategoryType}.`,
        );
      } else {
        await addCategory(normalizedName, newCategoryType);
        setSuccess(
          `Category "${normalizedName}" added successfully as ${newCategoryType}.`,
        );
      }

      cancelEdit();
    } catch (err) {
      setError(`Failed to save category: ${err.message}`);
    }
  }

  async function handleRemoveCategory(category) {
    if (!window.confirm(`Remove category "${category.name}"?`)) {
      return;
    }

    try {
      setError("");
      setSuccess("");
      await removeCategory(category.name);
      setSuccess(`Category "${category.name}" removed successfully.`);
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

      <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-slate-600">
        <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-rose-700">
          Expense
        </span>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
          Income
        </span>
        <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-700">
          Transfer
        </span>
      </div>

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

      <form className="mt-6 space-y-3" onSubmit={handleSaveCategory}>
        <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
          <input
            type="text"
            value={newCategory}
            onChange={(event) => setNewCategory(event.target.value)}
            placeholder="Enter new category name"
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
          />

          <select
            value={newCategoryType}
            onChange={(event) => setNewCategoryType(event.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
          >
            {CATEGORY_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-70"
          >
            {editingCategory ? "Save Changes" : "Add"}
          </button>

          {editingCategory ? (
            <button
              type="button"
              onClick={cancelEdit}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
          ) : null}
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
                key={category.name}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-900"
              >
                <span>{category.name}</span>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${TYPE_BADGES[category.type] || "border-slate-200 bg-slate-100 text-slate-600"}`}
                >
                  {TYPE_LABELS[category.type] || category.type || "Expense"}
                </span>
                <button
                  type="button"
                  onClick={() => startEditCategory(category)}
                  className="rounded-full px-1.5 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
                >
                  ✎
                </button>
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
