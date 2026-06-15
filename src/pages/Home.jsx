import { ArrowRight, BarChart3, Check, Github, Leaf, ShieldCheck, Sparkles, TreePine, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import ThemeToggle from "../components/ThemeToggle";

const features = [
  { icon: Zap, title: "Instant calculation", text: "Turn everyday travel, energy, food, and waste choices into a clear carbon estimate." },
  { icon: BarChart3, title: "Meaningful analytics", text: "See trends over time and understand exactly where your emissions come from." },
  { icon: Sparkles, title: "Personal eco tips", text: "Get practical suggestions based on your own footprint, not generic advice." }
];

export default function Home() {
  return (
    <div className="mesh min-h-screen overflow-hidden">
      <a href="#main-content" className="sr-only z-50 rounded-lg bg-white px-4 py-2 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to main content</a>
      <nav aria-label="Primary navigation" className="mx-auto flex max-w-7xl items-center px-5 py-5 lg:px-8">
        <Logo />
        <div className="ml-auto hidden items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300 md:flex">
          <a href="#features">Features</a><a href="#impact">Impact</a><a href="#how">How it works</a>
        </div>
        <div className="ml-auto flex items-center gap-2 md:ml-8">
          <ThemeToggle /><Link to="/dashboard" className="btn-primary !px-4 !py-2.5">Get started</Link>
        </div>
      </nav>

      <main id="main-content" tabIndex="-1">
        <section className="grid-bg relative mx-auto grid min-h-[760px] max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-[1.05fr_.95fr] lg:px-8">
          <div className="relative z-10 animate-fade-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-white/60 px-4 py-2 text-xs font-bold text-eco-600 backdrop-blur dark:bg-white/5 dark:text-eco-300"><Sparkles size={14} /> SMALL STEPS. MEASURABLE IMPACT.</div>
            <h1 className="max-w-4xl font-display text-5xl font-extrabold leading-[1.05] tracking-[-.045em] sm:text-6xl lg:text-7xl">Track your carbon footprint. <span className="bg-gradient-to-r from-eco-400 to-cyan-400 bg-clip-text text-transparent">Build a sustainable future.</span></h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">Understand your daily impact, discover smarter choices, and turn sustainable living into a habit you can actually see.</p>
            <div className="mt-9 flex flex-wrap gap-3"><Link to="/dashboard" className="btn-primary">Calculate my footprint <ArrowRight size={18} /></Link><a href="#how" className="btn-secondary">See how it works</a></div>
            <div className="mt-8 flex flex-wrap gap-5 text-sm text-slate-500 dark:text-slate-400">{["Free to start", "No AI API required", "Private by design"].map((item) => <span key={item} className="flex items-center gap-2"><Check size={16} className="text-eco-500" />{item}</span>)}</div>
          </div>
          <div className="relative mx-auto w-full max-w-xl animate-float">
            <div className="absolute -inset-10 rounded-full bg-gradient-to-r from-eco-400/20 to-cyan-400/20 blur-3xl" />
            <div className="card relative overflow-hidden p-6 sm:p-8">
              <div className="flex items-center justify-between"><div><p className="text-sm text-slate-500">Your sustainability score</p><p className="mt-1 font-display text-3xl font-extrabold">84<span className="text-base text-slate-400">/100</span></p></div><span className="grid h-14 w-14 place-items-center rounded-full bg-eco-400/15 text-eco-500"><Leaf /></span></div>
              <div className="my-8 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10"><div className="h-full w-[84%] rounded-full bg-gradient-to-r from-eco-400 to-cyan-400" /></div>
              <div className="grid grid-cols-3 gap-3">{[["18.8", "kg CO2e"], ["327", "trees/year"], ["Medium", "impact"]].map(([value, label]) => <div key={label} className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5"><p className="font-display text-xl font-bold">{value}</p><p className="text-xs text-slate-500">{label}</p></div>)}</div>
              <div className="mt-5 rounded-2xl bg-gradient-to-r from-eco-400/10 to-cyan-400/10 p-4 text-sm"><b className="text-eco-600 dark:text-eco-300">12% better this week</b><p className="mt-1 text-slate-500 dark:text-slate-400">Your train journeys made the biggest difference.</p></div>
            </div>
          </div>
        </section>

        <section id="impact" className="border-y bg-white/50 py-8 dark:bg-white/[.025]"><div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-5 text-center md:grid-cols-4">{[["7", "activity inputs"], ["3", "impact categories"], ["3", "analytics ranges"], ["100%", "local-first privacy"]].map(([value, label]) => <div key={label}><p className="font-display text-3xl font-extrabold text-eco-500">{value}</p><p className="text-sm text-slate-500">{label}</p></div>)}</div></section>

        <section id="features" className="mx-auto max-w-7xl px-5 py-24 lg:px-8"><div className="mx-auto max-w-2xl text-center"><p className="eyebrow">YOUR IMPACT, MADE CLEAR</p><h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight">Everything you need to live lighter</h2></div><div className="mt-12 grid gap-5 md:grid-cols-3">{features.map(({ icon: Icon, title, text }) => <article key={title} className="card p-7 transition hover:-translate-y-1"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-eco-400/15 text-eco-500"><Icon /></span><h3 className="mt-6 font-display text-xl font-bold">{title}</h3><p className="mt-3 leading-7 text-slate-500 dark:text-slate-400">{text}</p></article>)}</div></section>

        <section id="how" className="mx-auto max-w-7xl px-5 pb-24 lg:px-8"><div className="overflow-hidden rounded-[2.5rem] bg-[#09201b] px-6 py-16 text-white sm:px-14"><div className="grid gap-12 lg:grid-cols-2 lg:items-center"><div><p className="eyebrow">START IN TWO MINUTES</p><h2 className="mt-4 font-display text-4xl font-extrabold">A better future starts with knowing your number.</h2><p className="mt-5 max-w-lg text-slate-300">Log daily activity, see your footprint, and get one clear action to improve. Simple enough to keep doing.</p><Link to="/dashboard" className="btn-primary mt-8">Start tracking free <ArrowRight size={18} /></Link></div><div className="grid gap-4">{[[ShieldCheck, "Your data stays on this device"], [TreePine, "Transparent emission factors"], [Users, "Friendly demo leaderboard"]].map(([Icon, text], index) => <div key={text} className="flex items-center gap-4 rounded-2xl border-white/10 bg-white/5 p-5"><span className="text-eco-300">0{index + 1}</span><Icon className="text-eco-300" /><b>{text}</b></div>)}</div></div></div></section>
      </main>
      <footer className="border-t"><div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:flex-row sm:items-center"><Logo /><p className="text-sm text-slate-500 sm:ml-5">Copyright 2026 EcoTrack AI. Built for a greener tomorrow.</p><div className="flex gap-3 sm:ml-auto"><a aria-label="View EcoTrack source code on GitHub" href="https://github.com/CHAITANYA-KHANKE/ecosphere-carbon-footprint" target="_blank" rel="noreferrer" className="btn-secondary !p-3"><Github size={18} aria-hidden="true" /></a></div></div></footer>
    </div>
  );
}
