import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { dark, toggleTheme } = useTheme();
  return (
    <button type="button" onClick={toggleTheme} aria-label={`Switch to ${dark ? "light" : "dark"} mode`} aria-pressed={dark} className="grid h-10 w-10 place-items-center rounded-full border bg-white/60 transition hover:scale-105 dark:bg-white/5">
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
