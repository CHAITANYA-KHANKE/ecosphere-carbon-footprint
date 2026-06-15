export default function StatCard({ icon: Icon, label, value, change, color = "eco" }) {
  const colors = {
    eco: "from-eco-400/20 to-eco-400/5 text-eco-500",
    blue: "from-cyan-400/20 to-cyan-400/5 text-cyan-500",
    amber: "from-amber-400/20 to-amber-400/5 text-amber-500",
    violet: "from-violet-400/20 to-violet-400/5 text-violet-500"
  };
  return (
    <div className="card p-5 transition duration-300 hover:-translate-y-1">
      <div className="mb-5 flex items-start justify-between">
        <span className={`grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br ${colors[color]}`}><Icon size={21} /></span>
        {change && <span className="rounded-full bg-eco-400/10 px-2.5 py-1 text-xs font-bold text-eco-600 dark:text-eco-300">{change}</span>}
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 font-display text-2xl font-extrabold">{value}</p>
    </div>
  );
}
