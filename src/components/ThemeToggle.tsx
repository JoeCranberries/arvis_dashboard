"use client";

import { FaSun, FaMoon } from "react-icons/fa6";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className="a-chip flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium"
    >
      {isDark ? <FaSun className="text-[15px]" /> : <FaMoon className="text-[15px]" />}
      <span>{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}
