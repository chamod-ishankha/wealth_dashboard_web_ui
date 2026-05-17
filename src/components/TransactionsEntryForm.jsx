export default function TransactionsEntryForm({
  categories,
  formData,
  onChange,
  onSubmit,
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-soft backdrop-blur">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Transactions Entry Form
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Log your daily money movements in a clean, simple workflow.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          Manual state for now
        </span>
      </div>

      <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Date</span>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={onChange}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Category</span>
          <select
            name="category"
            value={formData.category}
            onChange={onChange}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Amount</span>
          <input
            type="number"
            name="amount"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={formData.amount}
            onChange={onChange}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">
            Description
          </span>
          <input
            type="text"
            name="description"
            placeholder="Short note about the transaction"
            value={formData.description}
            onChange={onChange}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
          />
        </label>

        <div className="md:col-span-2">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.99]"
          >
            Submit
          </button>
        </div>
      </form>
    </section>
  );
}
