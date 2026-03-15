"use client";

import { useEffect } from "react";

const THEME_KEY = "budget_tracker_theme";

export function ThemeScript() {
  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY);
    const theme = stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
    const isDark =
      theme === "dark" ||
      (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);
  return null;
}
