import { Crown, Medal, TrendingDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { getAverageFootprint } from "../lib/carbon";

const community = [
  { name: "Maya Patel", score: 8.4, checkIns: 18, initials: "MP" },
  { name: "Sam Rivera", score: 10.2, checkIns: 12, initials: "SR" },
  { name: "Noah Kim", score: 11.8, checkIns: 9, initials: "NK" },
  { name: "Priya Shah", score: 13.1, checkIns: 15, initials: "PS" },
  { name: "Liam Chen", score: 14.6, checkIns: 7, initials: "LC" }
];

export default function Leaderboard() {
  const { user } = useAuth();
  const { logs } = useData();
  const users = [
    ...community,
    { name: user?.displayName || "You", score: getAverageFootprint(logs), checkIns: logs.length, initials: "YOU", you: true }
  ].sort((a, b) => a.score - b.score);

  return (
    <div className="animate-fade-up">
      <p className="eyebrow">COMMUNITY IMPACT</p>
      <h1 className="mt-1 font-display text-3xl font-extrabold">Demo leaderboard</h1>
      <p className="mt-2 text-sm text-slate-500">Lower average footprint ranks higher. Community entries are sample data for comparison.</p>
      <div className="mt-7 grid gap-5 md:grid-cols-3">
        {users.slice(0, 3).map((person, index) => (
          <article key={person.name} className={`card p-7 text-center ${index === 0 ? "md:-translate-y-2 ring-2 ring-eco-400/50" : ""}`}>
            <span aria-hidden="true" className={`mx-auto grid h-12 w-12 place-items-center rounded-full ${index === 0 ? "bg-amber-400/20 text-amber-500" : "bg-slate-200 text-slate-500 dark:bg-white/10"}`}>{index === 0 ? <Crown/> : <Medal/>}</span>
            <div className="mx-auto mt-5 grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-eco-300 to-cyan-400 font-display font-extrabold text-ink">{person.initials}</div>
            <p className="mt-4 font-display text-xl font-bold">{person.name}</p>
            <p className="mt-1 text-sm text-slate-500">#{index + 1} | {person.checkIns} check-ins</p>
            <p className="mt-4 font-display text-3xl font-extrabold text-eco-500">{person.score}<span className="text-xs text-slate-400"> kg average</span></p>
          </article>
        ))}
      </div>
      <section className="card mt-6 overflow-hidden" aria-labelledby="ranking-title">
        <div className="flex items-center border-b p-5"><h2 id="ranking-title" className="font-display text-xl font-bold">Community ranking</h2><span className="ml-auto flex items-center gap-1 text-xs font-bold text-eco-500"><TrendingDown size={15} aria-hidden="true"/> lowest first</span></div>
        <ol>
          {users.map((person, index) => (
            <li key={`${person.name}-${index}`} className={`flex items-center gap-4 border-t px-5 py-4 first:border-0 ${person.you ? "bg-eco-400/10" : ""}`}>
              <span className="w-7 font-display font-bold text-slate-400">#{index + 1}</span>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-xs font-bold dark:bg-white/10">{person.initials}</span>
              <div><p className="font-bold">{person.name} {person.you && <span className="ml-1 text-xs text-eco-500">(You)</span>}</p><p className="text-xs text-slate-500">{person.checkIns} check-ins</p></div>
              <p className="ml-auto font-display font-bold">{person.score} kg</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
