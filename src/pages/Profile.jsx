import { useState } from "react";
import { Check, Mail, MapPin, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    displayName: user?.displayName || "",
    email: user?.email || "",
    location: user?.location || "India",
    notifications: user?.notifications ?? true
  });
  const [saved, setSaved] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    await updateUser(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const initials = form.displayName.split(" ").map((part) => part[0]).join("").slice(0, 2) || "ET";

  return (
    <div className="animate-fade-up">
      <p className="eyebrow">YOUR ACCOUNT</p>
      <h1 className="mt-1 font-display text-3xl font-extrabold">Profile and preferences</h1>
      <p className="mt-2 text-sm text-slate-500">Keep your details and sustainability reminders up to date.</p>
      <div className="mt-7 grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="card h-fit p-7 text-center">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-eco-300 to-cyan-400 font-display text-2xl font-extrabold text-ink">{initials}</div>
          <h2 className="mt-5 font-display text-2xl font-bold">{form.displayName}</h2>
          <p className="mt-1 text-sm text-slate-500">{form.email}</p>
          <span className="mt-4 inline-flex rounded-full bg-eco-400/10 px-3 py-1 text-xs font-bold text-eco-500">Local profile</span>
        </aside>
        <form onSubmit={submit} className="card p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold">Personal information</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-semibold"><span className="flex items-center gap-2"><User size={16} aria-hidden="true"/> Full name</span><input className="field mt-2" autoComplete="name" required value={form.displayName} onChange={(event) => setForm({ ...form, displayName: event.target.value })}/></label>
            <label className="text-sm font-semibold"><span className="flex items-center gap-2"><Mail size={16} aria-hidden="true"/> Email</span><input className="field mt-2" type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })}/></label>
            <label className="text-sm font-semibold sm:col-span-2"><span className="flex items-center gap-2"><MapPin size={16} aria-hidden="true"/> Location</span><input className="field mt-2" autoComplete="country-name" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })}/></label>
          </div>
          <div className="my-8 h-px bg-slate-200 dark:bg-white/10"/>
          <div className="flex items-center gap-4">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-400/15 text-cyan-500"><Mail size={20} aria-hidden="true"/></span>
            <div><p className="font-bold">Eco reminders</p><p className="text-sm text-slate-500">Weekly progress and challenge notifications</p></div>
            <button type="button" role="switch" aria-label="Eco reminders" aria-checked={form.notifications} onClick={() => setForm({ ...form, notifications: !form.notifications })} className={`ml-auto h-7 w-12 rounded-full p-1 transition ${form.notifications ? "bg-eco-400" : "bg-slate-300 dark:bg-white/20"}`}>
              <span className={`block h-5 w-5 rounded-full bg-white shadow transition ${form.notifications ? "translate-x-5" : ""}`}/>
            </button>
          </div>
          <button className="btn-primary mt-8">{saved ? <><Check size={18} aria-hidden="true"/> Saved</> : "Save changes"}</button>
          <p className="sr-only" role="status" aria-live="polite">{saved ? "Profile changes saved." : ""}</p>
        </form>
      </div>
    </div>
  );
}
