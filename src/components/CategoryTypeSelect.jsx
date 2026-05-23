import { useEffect, useMemo, useRef, useState } from "react";

const TYPE_ICONS = { expense: "💸", income: "💰", transfer: "🔁" };
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

export default function CategoryTypeSelect({
  name,
  value,
  categories = [],
  onChange,
  placeholder = "Select category",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.name === value) || null,
    [categories, value],
  );

  const selectedType = selectedCategory?.type || "expense";
  const selectedIcon = TYPE_ICONS[selectedType] || "•";

  useEffect(() => {
    function handleClickOutside(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function chooseCategory(categoryName) {
    onChange?.({ target: { name, value: categoryName } });
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-slate-900 outline-none transition hover:bg-white focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
      >
        <span className="min-w-0 flex-1 truncate">
          {selectedCategory ? selectedCategory.name : placeholder}
        </span>
        <span
          className={`ml-3 inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${TYPE_BADGES[selectedType]}`}
        >
          <span className="mr-1 text-[11px] leading-none">{selectedIcon}</span>
          <span>{TYPE_LABELS[selectedType]}</span>
        </span>
      </button>

      {open ? (
        <div className="absolute left-0 top-full z-20 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="max-h-60 overflow-auto p-1">
            {categories.length > 0 ? (
              categories.map((category) => {
                const type = category.type || "expense";
                const isSelected = category.name === value;
                return (
                  <button
                    key={category.name}
                    type="button"
                    onClick={() => chooseCategory(category.name)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition ${
                      isSelected
                        ? "bg-slate-100 text-slate-900"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span className="min-w-0 truncate font-medium">
                      {category.name}
                    </span>
                    <span
                      className={`ml-3 inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${TYPE_BADGES[type]}`}
                    >
                      <span className="mr-1 text-[11px] leading-none">
                        {TYPE_ICONS[type] || "•"}
                      </span>
                      <span>{TYPE_LABELS[type] || type}</span>
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-2 text-sm text-slate-500">
                No categories available
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
