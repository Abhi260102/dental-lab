"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useProfile } from "@/context/ProfileContext";
import {
  LayoutDashboard,
  CreditCard,
  FileText,
  Settings,
  LogOut,
  ShieldCheck,
  User,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useState } from "react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  session?: any;
}

export default function Sidebar({ isOpen, setIsOpen, session: propSession }: SidebarProps) {
  const pathname = usePathname();
  const { data: clientSession } = useSession();
  const session = propSession || clientSession;
  const { profile } = useProfile();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const links = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/cards", label: "Warranty Cards", icon: CreditCard },
    { href: "/dashboard/templates", label: "Templates", icon: FileText },
    { href: "/dashboard/logs", label: "Activity Logs", icon: Activity },
    { href: "/dashboard/settings", label: "Lab Settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 border-r border-slate-200/50 dark:border-slate-900/50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-lg transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Header */}
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-5 border-b border-slate-200/40 dark:border-slate-900/40 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <img
              src={profile?.labLogo || session?.user?.labLogo || '/logo.png'}
              alt="Logo"
              className="w-9 h-9 object-cover rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-sm shrink-0"
            />

            <div className="min-w-0 flex-1">
              <h1 className="text-sm font-bold bg-gradient-to-r from-dent-blue-500 to-dent-green-500 bg-clip-text text-transparent tracking-tight leading-none truncate">
                {profile?.labName || session?.user?.labName || "32 Dental Design"}
              </h1>
              <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider leading-none mt-1">
                Lab Warranty System
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex-grow p-4 space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
                    ? "bg-dent-blue-500 text-white shadow-md shadow-dent-blue-500/20"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/80 hover:text-slate-900 dark:hover:text-slate-100"
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* User Section / Lab Info */}
          <div className="p-4 border-t border-slate-200/40 dark:border-slate-900/40 bg-slate-50/50 dark:bg-slate-950/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 overflow-hidden shrink-0">
                {(profile?.labLogo || session?.user?.labLogo) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile?.labLogo || session?.user?.labLogo}
                    alt="Lab Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {session?.user?.name || "User"}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {profile?.labName || session?.user?.labName || "32 Dental Design"}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full justify-center gap-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 py-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Logout confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={() => signOut({ callbackUrl: "/login" })}
        title="Confirm Sign Out"
        description="This will safely end your active dashboard session. You can sign back in at any time to resume managing warranty cards."
        type="warning"
        confirmText="Sign Out"
        cancelText="Keep Session"
        useSlideToConfirm={false}
        icon={<LogOut className="w-8 h-8 text-amber-500" />}
      />
    </>
  );
}
