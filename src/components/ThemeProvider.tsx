"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "dark" | "light";
type Ctx = { theme: Theme; toggle: () => void };

const ThemeContext = createContext<Ctx>({ theme: "dark", toggle: () => {} });

export const useTheme = () => useContext(ThemeContext);

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const saved = localStorage.getItem("dash-theme");
    if (saved === "light" || saved === "dark") setTheme(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("dash-theme", theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      <div className={`dash ${theme}`} suppressHydrationWarning>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
