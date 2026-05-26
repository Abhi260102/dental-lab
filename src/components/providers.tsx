"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/toast";
import { ProfileProvider } from "@/context/ProfileContext";
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ProfileProvider>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </ProfileProvider>
    </SessionProvider>
  );
}
