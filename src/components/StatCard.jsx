export default function StatCard({ label, value, accent = "slate" }) {
  const accents = {
    slate: "from-slate-50 to-slate-100 border-slate-200",
    blue: "from-blue-50 to-indigo-50 border-blue-200",
    emerald: "from-emerald-50 to-green-50 border-emerald-200",
    amber: "from-amber-50 to-yellow-50 border-amber-200",
    rose: "from-rose-50 to-pink-50 border-rose-200",
  };

  return (
    <div
      className={`rounded-2xl border bg-gradient-to-br ${accents[accent]} p-5 shadow-soft`}
    >
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
        {value}
      </p>
    </div>
  );
}
