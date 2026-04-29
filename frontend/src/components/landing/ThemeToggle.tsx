"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/theme/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={mounted ? `Switch to ${theme === "dark" ? "light" : "dark"} mode` : "Toggle theme"}
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition-colors hover:bg-slate-100 dark:border-white/20 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/20"
    >
      <span className="material-symbols-outlined text-[20px] leading-none">
        {mounted ? (theme === "dark" ? "light_mode" : "dark_mode") : "dark_mode"}
      </span>
    </button>
  );
}
