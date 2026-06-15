import { useState } from "react";
import { Bike, CheckCircle2, Leaf, Lightbulb, Recycle, Salad, Zap } from "lucide-react";
import { getEcoTips } from "../lib/carbon";
import { useData } from "../context/DataContext";

const icons = { transport: Bike, energy: Zap, food: Salad, waste: Recycle, habit: Leaf };
const evergreen = [
  { title: "Wash clothes cold", text: "Modern detergents work well in cold water and avoid energy used for heating.", type: "energy", impact: "Medium" },
  { title: "Carry a reusable kit", text: "A bottle, cup, and tote prevent hundreds of single-use items each year.", type: "waste", impact: "Easy" },
  { title: "Bundle your errands", text: "One planned route uses less fuel than several separate car journeys.", type: "transport", impact: "High" }
];

export default function EcoTips() {
  const { logs } = useData();
  const [goals, setGoals] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("ecotrack-goals") || "[]");
    } catch {
      return [];
    }
  });
  const latest = logs[0];
  const personal = getEcoTips(latest || {}, latest);
  const tips = [...personal.map((tip) => ({ ...tip, impact: "For you" })), ...evergreen];
  const toggleGoal = (title) => {
    const next = goals.includes(title) ? goals.filter((goal) => goal !== title) : [...goals, title];
    setGoals(next);
    localStorage.setItem("ecotrack-goals", JSON.stringify(next));
  };
  return (
    <div className="animate-fade-up">
      <p className="eyebrow">ACTIONABLE, NOT OVERWHELMING</p><h1 className="mt-1 font-display text-3xl font-extrabold">Your eco tips</h1><p className="mt-2 text-sm text-slate-500">Recommendations update as your footprint changes.</p>
      <div className="mt-7 rounded-[2rem] bg-gradient-to-r from-eco-500 to-cyan-500 p-7 text-ink sm:p-9"><div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center"><div><Lightbulb size={28}/><h2 className="mt-4 font-display text-3xl font-extrabold">This week's focus: commute smarter</h2><p className="mt-2 max-w-2xl font-medium text-ink/70">Replace two solo car journeys with public transport, cycling, or a shared ride.</p></div><div className="rounded-3xl bg-white/30 px-7 py-5 text-center backdrop-blur"><p className="font-display text-4xl font-extrabold">4.2 kg</p><p className="text-sm font-bold">potential saving</p></div></div></div>
      <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{tips.map((tip, index) => { const Icon = icons[tip.type] || Leaf; const selected = goals.includes(tip.title); return <article key={`${tip.title}-${index}`} className="card group p-6 transition hover:-translate-y-1"><div className="flex items-start justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-eco-400/15 text-eco-500 transition group-hover:scale-110"><Icon aria-hidden="true" /></span><span className="rounded-full border px-3 py-1 text-xs font-bold text-slate-500">{tip.impact}</span></div><h3 className="mt-5 font-display text-xl font-bold">{tip.title}</h3><p className="mt-2 min-h-12 text-sm leading-6 text-slate-500 dark:text-slate-400">{tip.text}</p><button type="button" aria-pressed={selected} onClick={() => toggleGoal(tip.title)} className="mt-5 flex items-center gap-2 text-sm font-bold text-eco-500"><CheckCircle2 size={17} aria-hidden="true"/> {selected ? "Goal selected" : "Mark as my goal"}</button></article>; })}</div>
    </div>
  );
}
