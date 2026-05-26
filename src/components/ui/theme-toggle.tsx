"use client";

import { useTheme } from "@/components/theme-provider";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className={`w-9 h-9 rounded-xl text-slate-650 dark:text-slate-400 border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/80 backdrop-blur-sm transition-all ${className}`}
      title="Toggle Theme"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-600" />
      )}
    </Button>
  );
}
