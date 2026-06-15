import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { BarChart3, Bell, ChevronRight, Gauge, Leaf, Menu, Trophy, User, Users, X } from "lucide-react";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

const nav = [
  { to: "/dashboard", label: "Overview", icon: Gauge, end: true },
  { to: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/dashboard/tips", label: "Eco tips", icon: Leaf },
  { to: "/dashboard/achievements", label: "Achievements", icon: Trophy },
  { to: "/dashboard/leaderboard", label: "Leaderboard", icon: Users },
  { to: "/dashboard/profile", label: "Profile", icon: User }
];

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(false);

  return (
    <div className="min-h-screen bg-[#f4f8f7] dark:bg-[#06110f]">
      <a href="#dashboard-content" className="sr-only z-[60] rounded-lg bg-white px-4 py-2 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to dashboard content</a>
      {open && <button type="button" className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r bg-white/95 p-5 backdrop-blur-xl transition-transform dark:bg-[#071512]/95 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between"><Logo /><button type="button" aria-label="Close navigation" className="lg:hidden" onClick={() => setOpen(false)}><X /></button></div>
        <nav aria-label="Dashboard navigation" className="mt-10 space-y-1.5">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${isActive ? "bg-eco-400/15 text-eco-600 dark:text-eco-300" : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5"}`}>
              <Icon size={19} /><span>{label}</span><ChevronRight size={15} className="ml-auto opacity-40" />
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto">
          <NavLink to="/" className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-500 hover:bg-red-500/10 hover:text-red-500">Exit dashboard</NavLink>
        </div>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-20 items-center border-b bg-white/70 px-4 backdrop-blur-xl dark:bg-[#06110f]/70 sm:px-7">
          <button type="button" aria-label="Open navigation" aria-expanded={open} onClick={() => setOpen(true)} className="mr-3 lg:hidden"><Menu /></button>
          <div>
            <p className="text-xs text-slate-500">Welcome back,</p>
            <p className="font-display font-bold">Eco Explorer</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <div className="relative">
              <button type="button" aria-label="Notifications" aria-expanded={notifications} onClick={() => setNotifications((value) => !value)} className="relative grid h-10 w-10 place-items-center rounded-full border bg-white/60 dark:bg-white/5">
                <Bell size={18} /><span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-eco-400 ring-2 ring-white dark:ring-[#06110f]" />
              </button>
              {notifications && (
                <div className="card absolute right-0 top-12 w-72 p-4">
                  <p className="font-bold">Notifications</p>
                  <div className="mt-3 space-y-3 text-sm text-slate-500 dark:text-slate-400">
                    <p className="rounded-xl bg-eco-400/10 p-3">Your weekly footprint is trending down. Keep going!</p>
                    <p className="rounded-xl bg-cyan-400/10 p-3">New eco challenge: Take public transport twice this week.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        <main id="dashboard-content" className="mx-auto max-w-[1500px] p-4 sm:p-7" tabIndex="-1"><Outlet /></main>
      </div>
    </div>
  );
}
