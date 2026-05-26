"use client";

import React, { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Mail, Lock, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState("/logo.png");
  const [labName, setLabName] = useState("DentShield");
  const router = useRouter();
  const { status } = useSession();
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/auth/logo")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (data.labLogo) {
            setLogoUrl(data.labLogo);
          }
          if (data.labName) {
            setLabName(data.labName);
          }
        }
      })
      .catch((err) => console.error("Error fetching branding logo:", err));
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Missing Fields",
        description: "Please enter your email and password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: email.toLowerCase(),
        password,
      });

      if (res?.error) {
        toast({
          title: "Sign In Failed",
          description: res.error || "Incorrect email or password.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "Authorizing dashboard workspace...",
          variant: "success",
        });
        router.push("/dashboard");
      }
    } catch (err: any) {
      toast({
        title: "Error occurred",
        description: err.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white flex flex-col justify-center items-center relative p-6 overflow-hidden transition-colors duration-300">
      {/* Theme switch wrapper */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-dent-blue-500/5 blur-[120px] pointer-events-none" />

      {/* Auth Card */}
      <div className="w-full max-w-[420px] rounded-2xl border border-slate-200 dark:border-white/5 bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl shadow-2xl p-8 z-10 flex flex-col gap-6 transition-all">

        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center animate-fade-in">
          <div className="flex flex-col items-center gap-2 justify-center">
            {/* Logo image with dynamic shadow, gradient border, and hover scale */}
            <div className="relative group cursor-pointer transition-all duration-300">
              <div className="absolute -inset-1 bg-gradient-to-r from-dent-blue-500 to-emerald-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300" />
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-slate-200/50 dark:border-white/10 shadow-lg flex items-center justify-center bg-slate-900 transition-all duration-300 group-hover:scale-105">
                <img
                  src={logoUrl}
                  alt={`${labName} Logo`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-dent-blue-600 to-emerald-500 dark:from-dent-blue-400 dark:to-emerald-400 bg-clip-text text-transparent select-none mt-1">
              {labName}
            </span>
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Welcome Back</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">
              {labName} Warranty Card Dashboard
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. lab@32 Dental Design.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
            />
            <Mail className="absolute left-3.5 bottom-3.5 w-4 h-4 text-slate-400" />
          </div>

          <div className="relative">
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
              required
            />
            <Lock className="absolute left-3.5 bottom-3.5 w-4 h-4 text-slate-400" />
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full font-bold tracking-wide py-3 bg-gradient-to-r from-dent-blue-600 to-dent-blue-500 shadow-lg shadow-dent-blue-500/10 hover:from-dent-blue-700 hover:to-dent-blue-600 active:scale-[0.99] transition-transform flex items-center justify-center gap-2"
          >
            Authenticate Credentials
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        {/* Navigation redirection */}
        {/* <div className="text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
          Need a workspace account?{" "}
          <Link href="/register" className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
            Register Laboratory
          </Link>
        </div> */}
      </div>
    </div>
  );
}
