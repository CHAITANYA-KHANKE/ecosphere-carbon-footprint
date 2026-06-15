import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => localStorage.getItem("ecotrack-theme") !== "light");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("ecotrack-theme", dark ? "dark" : "light");
  }, [dark]);

  return <ThemeContext.Provider value={{ dark, toggleTheme: () => setDark((value) => !value) }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
