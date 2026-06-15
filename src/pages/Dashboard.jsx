import { useMemo, useState } from "react";
import { Bike, Bus, Car, ChevronRight, Download, Leaf, Lightbulb, Plane, PlugZap, Recycle, Train, TreePine } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import StatCard from "../components/StatCard";
import { calculateFootprint, getEcoTips, getProgress } from "../lib/carbon";
import { useData } from "../context/DataContext";

const initial = { car: "", bus: "", train: "", flight: "", electricity: "", food: "vegetarian", waste: "" };
const activityFields = [
  { name: "car", label: "Car travel", unit: "km", icon: Car },
  { name: "bus", label: "Bus travel", unit: "km", icon: Bus },
  { name: "train", label: "Train travel", unit: "km", icon: Train },
  { name: "flight", label: "Flight travel", unit: "km", icon: Plane },
  { name: "electricity", label: "Electricity", unit: "kWh", icon: PlugZap },
  { name: "waste", label: "Waste generated", unit: "kg", icon: Recycle }
];
const chartColors = ["#2ed17e", "#22d3ee", "#fbbf24", "#a78bfa"];

export default function Dashboard() {
  const { logs, addLog } = useData();
  const [input, setInput] = useState(initial);
  const [result, setResult] = useState(logs[0] || calculateFootprint({ ...initial, car: 14, electricity: 8, waste: 1 }));
  const [saved, setSaved] = useState(false);
  const latest = logs[0] || result;
  const resultTrees = result.trees ?? Math.ceil((result.total * 365) / 21);
  const progress = getProgress(logs);
  const tips = useMemo(() => getEcoTips(input, result), [input, result]);
  const chartData = Object.entries(result.breakdown || { transport: result.transport, electricity: result.electricity, food: result.food, waste: result.waste }).map(([name, value]) => ({ name: name[0].toUpperCase() + name.slice(1), value }));

  const calculate = async (event) => {
    event.preventDefault();
    const next = calculateFootprint(input);
    setResult(next);
    await addLog(input, next);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const exportPdf = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.setFillColor(7, 20, 18); doc.rect(0, 0, 210, 42, "F");
    doc.setTextColor(46, 209, 126); doc.setFontSize(22); doc.text("EcoTrack AI", 18, 20);
    doc.setTextColor(255, 255, 255); doc.setFontSize(11); doc.text("Personal Carbon Footprint Summary", 18, 30);
    doc.setTextColor(30, 41, 59); doc.setFontSize(16); doc.text(`Total: ${result.total} kg CO2e`, 18, 58);
    doc.setFontSize(11); doc.text(`Sustainability score: ${result.score}/100`, 18, 70); doc.text(`Impact category: ${result.category}`, 18, 79); doc.text(`Trees for annual offset: ${resultTrees}`, 18, 88);
    doc.setFontSize(14); doc.text("Emission breakdown", 18, 108);
    chartData.forEach((item, index) => doc.text(`${item.name}: ${item.value} kg CO2e`, 22, 121 + index * 10));
    doc.setFontSize(9); doc.setTextColor(100); doc.text(`Generated ${new Date().toLocaleString()} | Awareness estimate, not a certified audit.`, 18, 180);
    doc.save(`ecotrack-summary-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const downloadSummary = () => {
    const rows = [["Metric", "Value"], ["Total CO2e", `${result.total} kg`], ["Score", result.score], ["Category", result.category], ["Trees for annual offset", resultTrees], ...chartData.map((item) => [item.name, `${item.value} kg`])];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = "ecotrack-carbon-summary.csv"; link.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fade-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div><p className="eyebrow">TODAY'S IMPACT</p><h1 className="mt-1 font-display text-3xl font-extrabold">Your carbon dashboard</h1><p className="mt-2 text-sm text-slate-500">Small choices add up. Log today and watch the trend change.</p></div>
        <div className="flex gap-2 sm:ml-auto"><button type="button" onClick={downloadSummary} className="btn-secondary !px-4 !py-2.5"><Download size={16} aria-hidden="true" /> CSV</button><button type="button" onClick={exportPdf} className="btn-primary !px-4 !py-2.5"><Download size={16} aria-hidden="true" /> PDF report</button></div>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Leaf} label="Total footprint" value={`${latest.total} kg`} change={progress === null ? undefined : `${progress >= 0 ? "-" : "+"}${Math.abs(progress)}%`} />
        <StatCard icon={Lightbulb} label="Sustainability score" value={`${latest.score}/100`} color="blue" />
        <StatCard icon={TreePine} label="Trees for annual offset" value={`${latest.trees ?? Math.ceil((latest.total * 365) / 21)}`} color="amber" />
        <StatCard icon={Bike} label="Impact category" value={latest.category} color="violet" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        <form onSubmit={calculate} className="card p-5 sm:p-7" aria-describedby="calculator-help">
          <div className="flex items-center justify-between"><div><h2 className="font-display text-xl font-bold">Log today's activity</h2><p id="calculator-help" className="mt-1 text-sm text-slate-500">Use today's distance and consumption. Blank fields count as zero.</p></div><span className="rounded-full bg-eco-400/10 px-3 py-1 text-xs font-bold text-eco-600 dark:text-eco-300">DAILY</span></div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {activityFields.map(({ name, label, unit, icon: Icon }) => <label key={name} className="block text-sm font-semibold"><span className="flex items-center gap-2"><Icon size={16} className="text-eco-500" aria-hidden="true" />{label}</span><div className="relative mt-2"><input min="0" step="0.1" inputMode="decimal" type="number" className="field pr-14" placeholder="0" aria-label={`${label} in ${unit}`} value={input[name]} onChange={(e) => setInput({ ...input, [name]: e.target.value })} /><span aria-hidden="true" className="absolute right-4 top-3.5 text-xs text-slate-400">{unit}</span></div></label>)}
          </div>
          <fieldset className="mt-5"><legend className="text-sm font-semibold">Food habit</legend><div className="mt-2 grid grid-cols-3 gap-2">{[["vegan", "Vegan"], ["vegetarian", "Vegetarian"], ["nonVegetarian", "Non-veg"]].map(([value, label]) => <button key={value} type="button" aria-pressed={input.food === value} onClick={() => setInput({ ...input, food: value })} className={`rounded-2xl border px-3 py-3 text-sm font-semibold transition ${input.food === value ? "border-eco-400 bg-eco-400/10 text-eco-600 dark:text-eco-300" : "bg-white/40 dark:bg-white/5"}`}>{label}</button>)}</div></fieldset>
          <button className="btn-primary mt-6 w-full">{saved ? "Footprint saved!" : "Calculate and save footprint"} <ChevronRight size={18} aria-hidden="true" /></button>
          <p className="sr-only" role="status" aria-live="polite">{saved ? `Footprint saved. Total ${result.total} kilograms CO2 equivalent.` : ""}</p>
          <details className="mt-5 rounded-2xl border bg-white/40 p-4 text-sm dark:bg-white/5">
            <summary className="cursor-pointer font-bold text-eco-600 dark:text-eco-300">How this estimate works</summary>
            <p className="mt-3 leading-6 text-slate-500 dark:text-slate-400">Activity values are multiplied by documented emission factors, then combined with a daily food estimate. The tree figure assumes this daily pattern continues for one year and uses 21 kg CO2 absorbed per mature tree per year.</p>
            <p className="mt-2 text-xs text-slate-400">Educational estimate only. Actual emissions vary by region, vehicle, occupancy, energy source, and supply chain.</p>
          </details>
        </form>

        <div className="space-y-6">
          <div className="card p-5 sm:p-7">
            <div className="flex items-start justify-between"><div><p className="text-sm text-slate-500">Calculated total</p><p className="font-display text-4xl font-extrabold">{result.total}<span className="ml-1 text-sm text-slate-400">kg CO₂e</span></p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${result.category === "Low" ? "bg-eco-400/15 text-eco-500" : result.category === "Medium" ? "bg-amber-400/15 text-amber-500" : "bg-red-400/15 text-red-500"}`}>{result.category}</span></div>
            <div className="h-52" role="img" aria-label={`Emission breakdown: ${chartData.map((item) => `${item.name} ${item.value} kilograms`).join(", ")}`}><ResponsiveContainer><PieChart><Pie data={chartData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={82} paddingAngle={4}>{chartData.map((item, index) => <Cell key={item.name} fill={chartColors[index]} />)}</Pie><Tooltip contentStyle={{ borderRadius: 16, border: 0 }} /></PieChart></ResponsiveContainer></div>
            <div className="grid grid-cols-2 gap-2">{chartData.map((item, index) => <div key={item.name} className="flex items-center gap-2 text-xs text-slate-500"><span className="h-2.5 w-2.5 rounded-full" style={{ background: chartColors[index] }} />{item.name} <b className="ml-auto text-slate-800 dark:text-white">{item.value}</b></div>)}</div>
          </div>
          <div className="card overflow-hidden p-5">
            <p className="eyebrow">SMART NUDGE</p><h3 className="mt-2 font-bold">{tips[0].title}</h3><p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{tips[0].text}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
