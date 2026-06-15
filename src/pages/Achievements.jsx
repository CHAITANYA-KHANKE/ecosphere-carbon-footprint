import { Earth, Lock, Sprout, Trophy } from "lucide-react";
import { getAchievements } from "../lib/carbon";
import { useData } from "../context/DataContext";

const iconMap = { Sprout, Earth, Trophy };

export default function Achievements() {
  const { logs } = useData();
  const achievements = getAchievements(logs);
  return (
    <div className="animate-fade-up">
      <p className="eyebrow">CELEBRATE THE PROGRESS</p><h1 className="mt-1 font-display text-3xl font-extrabold">Achievements</h1><p className="mt-2 text-sm text-slate-500">Sustainability is a practice. These milestones show how far you've come.</p>
      <div className="mt-7 grid gap-5 md:grid-cols-3">{achievements.map((badge) => { const Icon = iconMap[badge.icon]; const percent = Math.min(100, Math.round((badge.progress / badge.target) * 100)); return <article key={badge.name} className={`card relative overflow-hidden p-7 ${!badge.unlocked ? "opacity-60 grayscale" : ""}`}><div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-eco-400/10"/><div className={`grid h-20 w-20 place-items-center rounded-3xl ${badge.unlocked ? "bg-gradient-to-br from-eco-300 to-cyan-400 text-ink shadow-glow" : "bg-slate-200 text-slate-400 dark:bg-white/10"}`}>{badge.unlocked ? <Icon size={36}/> : <Lock size={28}/>}</div><p className="mt-6 text-xs font-bold uppercase tracking-widest text-eco-500">{badge.unlocked ? "Unlocked" : "In progress"}</p><h2 className="mt-2 font-display text-2xl font-extrabold">{badge.name}</h2><p className="mt-2 text-sm text-slate-500">{badge.description}</p><div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-eco-400 to-cyan-400" style={{ width: `${percent}%` }}/></div><p className="mt-2 text-right text-xs text-slate-400">{badge.progress.toFixed?.(0) ?? badge.progress} / {badge.target}</p></article>; })}</div>
      <div className="card mt-6 p-7"><div className="flex flex-col gap-6 sm:flex-row sm:items-center"><span className="grid h-16 w-16 place-items-center rounded-3xl bg-amber-400/15 text-amber-500"><Trophy size={30}/></span><div><h2 className="font-display text-xl font-bold">Next milestone</h2><p className="mt-1 text-slate-500 dark:text-slate-400">Complete {Math.max(0, 5 - logs.length)} more check-ins to strengthen your Eco Warrior streak.</p></div><div className="sm:ml-auto"><p className="font-display text-3xl font-extrabold">{Math.min(logs.length, 5)}/5</p><p className="text-xs text-slate-400">check-ins</p></div></div></div>
    </div>
  );
}
