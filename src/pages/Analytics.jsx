import { useMemo, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useData } from "../context/DataContext";
import { aggregateLogs } from "../lib/carbon";

const ranges = ["Daily", "Weekly", "Monthly"];

export default function Analytics() {
  const { logs } = useData();
  const [range, setRange] = useState("Daily");
  const data = useMemo(() => aggregateLogs(logs, range), [logs, range]);
  const average = data.length ? (data.reduce((sum, item) => sum + item.total, 0) / data.length).toFixed(1) : "0.0";

  return (
    <div className="animate-fade-up">
      <p className="eyebrow">PROGRESS OVER TIME</p>
      <div className="mt-1 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Carbon analytics</h1>
          <p className="mt-2 text-sm text-slate-500">Patterns reveal where your next easy win lives.</p>
        </div>
        <div role="group" aria-label="Analytics time range" className="flex rounded-full border bg-white/60 p-1 dark:bg-white/5 sm:ml-auto">
          {ranges.map((item) => (
            <button key={item} type="button" aria-pressed={range === item} onClick={() => setRange(item)} className={`rounded-full px-4 py-2 text-sm font-semibold ${range === item ? "bg-eco-400 text-ink" : "text-slate-500"}`}>
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="card p-5 sm:p-7" aria-labelledby="footprint-chart-title">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="footprint-chart-title" className="font-display text-xl font-bold">{range} footprint</h2>
              <p className="text-sm text-slate-500">kg CO2e {range === "Daily" ? "average per check-in" : "total per period"}</p>
            </div>
            <div className="text-right"><p className="text-xs text-slate-500">Average</p><p className="font-display text-2xl font-bold">{average} kg</p></div>
          </div>
          <div className="mt-5 h-80" role="img" aria-label={`${range} footprint trend. Average ${average} kilograms CO2 equivalent.`}>
            <ResponsiveContainer>
              <AreaChart data={data}>
                <defs><linearGradient id="carbon" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2ed17e" stopOpacity={0.35}/><stop offset="95%" stopColor="#2ed17e" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15}/>
                <XAxis dataKey="date" axisLine={false} tickLine={false}/>
                <YAxis axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{ borderRadius: 16, border: 0 }}/>
                <Area type="monotone" dataKey="total" stroke="#2ed17e" strokeWidth={3} fill="url(#carbon)"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
        <aside className="card p-6"><p className="eyebrow">INSIGHT</p><p className="mt-3 font-display text-5xl font-extrabold text-eco-500">{logs.length}</p><p className="mt-1 text-sm text-slate-500">total check-ins</p><div className="my-6 h-px bg-slate-200 dark:bg-white/10"/><p className="text-sm leading-6 text-slate-500 dark:text-slate-400">Consistency matters more than perfection. Each check-in makes your personal recommendations more useful.</p></aside>
      </div>

      <section className="card mt-6 p-5 sm:p-7" aria-labelledby="sources-chart-title">
        <h2 id="sources-chart-title" className="font-display text-xl font-bold">Emission sources</h2>
        <div className="mt-5 h-80" role="img" aria-label="Stacked chart comparing transport, energy, food, and waste emissions">
          <ResponsiveContainer><BarChart data={data}><CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15}/><XAxis dataKey="date" axisLine={false} tickLine={false}/><YAxis axisLine={false} tickLine={false}/><Tooltip contentStyle={{ borderRadius: 16, border: 0 }}/><Legend/><Bar dataKey="Transport" stackId="a" fill="#2ed17e"/><Bar dataKey="Energy" stackId="a" fill="#22d3ee"/><Bar dataKey="Food" stackId="a" fill="#fbbf24"/><Bar dataKey="Waste" stackId="a" fill="#a78bfa" radius={[5, 5, 0, 0]}/></BarChart></ResponsiveContainer>
        </div>
      </section>

      <section className="card mt-6 overflow-hidden" aria-labelledby="history-title">
        <div className="border-b p-5"><h2 id="history-title" className="font-display text-xl font-bold">Carbon footprint history</h2></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-400 dark:bg-white/5"><tr><th scope="col" className="px-5 py-4">Date</th><th scope="col">Total</th><th scope="col">Score</th><th scope="col">Category</th></tr></thead><tbody>{logs.map((log) => <tr key={log.id} className="border-t"><td className="px-5 py-4">{new Date(log.createdAt).toLocaleDateString()}</td><td className="font-bold">{log.total} kg</td><td>{log.score}/100</td><td><span className="rounded-full bg-eco-400/10 px-3 py-1 text-xs font-bold text-eco-500">{log.category}</span></td></tr>)}</tbody></table></div>
      </section>
    </div>
  );
}
