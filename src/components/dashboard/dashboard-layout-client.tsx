"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/dashboard/sidebar";
import Navbar from "@/components/dashboard/navbar";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  session: any;
}

export default function DashboardLayoutClient({ children, session }: DashboardLayoutClientProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  let title = "Dashboard";
  if (pathname === "/dashboard") {
    title = "Overview Analytics";
  } else if (pathname === "/dashboard/cards") {
    title = "Warranty Certificates";
  } else if (pathname === "/dashboard/cards/create") {
    title = "Generate Warranty Card";
  } else if (pathname.startsWith("/dashboard/cards/edit")) {
    title = "Modify Warranty Card";
  } else if (pathname === "/dashboard/logs") {
    title = "Activity & Audit Logs";
  } else if (pathname === "/dashboard/settings") {
    title = "Lab & Profile Settings";
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} session={session} />

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col lg:pl-64 min-w-0">
        {/* Navbar */}
        <Navbar onMenuClick={() => setSidebarOpen(true)} title={title} session={session} />

        {/* Render child pages */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto no-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
