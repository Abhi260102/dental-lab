"use client";

import { useTheme } from "@/components/theme-provider";
import { useSession } from "next-auth/react";
import { Menu, Sun, Moon, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  onMenuClick: () => void;
  title: string;
  session?: any;
}

export default function Navbar({ onMenuClick, title, session: propSession }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { data: clientSession } = useSession();
  const session = propSession || clientSession;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 border-b border-slate-200/50 dark:border-slate-900/50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-lg">
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger */}
        <button
          onClick={onMenuClick}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 lg:hidden focus:outline-none"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Dynamic page title */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            {title}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Premium badge */}
        {session?.user?.role === "admin" && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            Admin Account
          </div>
        )}

        {/* Theme Toggle Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800/80"
          title="Toggle Theme"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-500" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
        </Button>

        {/* User profile dropdown anchor / display */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200/50 dark:border-slate-800/50">
          <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-500 flex items-center justify-center overflow-hidden">
            {session?.user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt={session?.user?.name || "avatar"}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            )}
          </div>
          <span className="hidden sm:inline text-xs font-semibold text-slate-600 dark:text-slate-300">
            {session?.user?.name?.split(" ")[0]}
          </span>
        </div>
      </div>
    </header>
  );
}
