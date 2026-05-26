import Link from "next/link";
import { ShieldCheck, CreditCard, Sparkles, Database, CheckCircle, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white relative overflow-hidden flex flex-col justify-between transition-colors duration-300">
      {/* Background glowing effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-dent-blue-500/5 dark:bg-dent-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 dark:bg-emerald-500/5 blur-[120px] pointer-events-none" />

      {/* Header / Nav */}
      <header className="sticky top-0 z-30 w-full border-b border-slate-200/50 dark:border-white/5 bg-white/60 dark:bg-slate-950/60 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-dent-blue-600 to-dent-green-500 shadow-md">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-dent-blue-600 to-emerald-500 dark:from-dent-blue-400 dark:to-emerald-400 bg-clip-text text-transparent">
              32 Dental Design
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-dent-blue-600 dark:hover:text-emerald-400 transition-colors uppercase tracking-wider"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all uppercase tracking-wider active:scale-95"
            >
              Get Started
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-20 md:py-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center flex-grow">
        <div className="flex flex-col gap-6 text-left animate-fade-in">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-200/50 dark:bg-white/5 border border-slate-300/50 dark:border-white/10 w-fit text-slate-600 dark:text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 animate-pulse" />
            <span>32 Dental Designoratory Grade</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-slate-900 dark:text-white">
            Premium Warranty{" "}
            <span className="bg-gradient-to-r from-dent-blue-600 via-emerald-500 to-dent-blue-500 dark:from-dent-blue-400 dark:via-emerald-400 dark:to-dent-blue-550 bg-clip-text text-transparent">
              Card Management
            </span>
          </h1>

          <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed max-w-lg">
            Create, manage, and verify high-fidelity dental warranty certificates. Fully responsive live 3D card previews, printable layouts, QR code instant lookup, and analytics.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Link href="/register" className="group px-6 py-3.5 rounded-xl bg-gradient-to-r from-dent-blue-600 to-dent-blue-500 hover:from-dent-blue-700 hover:to-dent-blue-600 text-white font-bold text-sm tracking-wide shadow-lg shadow-dent-blue-500/20 active:scale-98 transition-all flex items-center justify-center gap-2">
              Generate Free Cards
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/login" className="px-6 py-3.5 rounded-xl bg-slate-200/60 dark:bg-white/5 border border-slate-300/40 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-white font-bold text-sm tracking-wide active:scale-98 transition-all flex items-center justify-center">
              Dashboard Login
            </Link>
          </div>
        </div>

        {/* Hero Visual Mockup */}
        <div className="relative w-full aspect-[4/3] flex items-center justify-center select-none">
          {/* Card Mockup Front */}
          <div className="w-[380px] sm:w-[450px] aspect-[1.58] rounded-2xl bg-gradient-to-tr from-dent-blue-700 to-dent-blue-900 border border-white/10 shadow-2xl relative p-6 rotate-[-6deg] hover:rotate-0 transition-transform duration-500 z-10 flex flex-col justify-between overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/30 pointer-events-none" />
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-950" />
                </div>
                <span className="text-[10px] font-bold tracking-widest text-emerald-400">32 Dental Design LAB</span>
              </div>
              <span className="text-[8px] uppercase tracking-wider text-slate-400">Authentic Card</span>
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-bold font-mono tracking-wider text-white">WARRANTY</h2>
              <span className="text-[9px] uppercase tracking-widest text-emerald-400 font-semibold">Certificate of Authenticity</span>
            </div>
            <div className="flex justify-between items-end border-t border-white/10 pt-4">
              <div className="flex gap-4 text-left">
                <div className="flex flex-col">
                  <span className="text-[8px] text-slate-450">Material</span>
                  <span className="text-[10px] font-bold text-slate-200">Zirconia Premium</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] text-slate-450">Warranty</span>
                  <span className="text-[10px] font-bold text-emerald-400">10 Years</span>
                </div>
              </div>
              <div className="px-2.5 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-[8px] font-bold tracking-wider text-emerald-400">
                Genuine Product
              </div>
            </div>
          </div>

          {/* Card Mockup Back (peeking behind) */}
          <div className="w-[380px] sm:w-[450px] aspect-[1.58] rounded-2xl bg-white border border-slate-300 shadow-2xl absolute p-6 rotate-[6deg] hover:rotate-0 transition-transform duration-500 text-slate-800 flex flex-col justify-between">
            <div className="absolute top-3 left-0 right-0 h-4 bg-slate-900/5" />
            <div className="flex justify-between items-start mt-3">
              <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-left">
                <div className="flex flex-col">
                  <span className="text-[8px] text-slate-400 font-semibold uppercase leading-none">Job ID</span>
                  <span className="text-[11px] font-bold font-mono text-slate-900 mt-1">DS-91F2-921A</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] text-slate-400 font-semibold uppercase leading-none">Issue Date</span>
                  <span className="text-[10px] font-semibold text-slate-700 mt-1">May 26, 2026</span>
                </div>
                <div className="flex flex-col col-span-2">
                  <span className="text-[8px] text-slate-400 font-semibold uppercase leading-none">Patient</span>
                  <span className="text-[10px] font-bold text-slate-800 truncate mt-1">Jane Doe</span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-1 border-l border-slate-100 pl-4">
                <div className="w-14 h-14 bg-slate-100 border border-slate-200 rounded flex items-center justify-center">
                  <span className="text-[8px] text-slate-455">QR Code</span>
                </div>
                <span className="text-[7px] font-bold text-slate-400 uppercase">Scan to verify</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-[7.5px] text-slate-400 border-t border-slate-100 pt-2 leading-none">
              <span>* Verify online or scan barcode.</span>
              <span className="font-bold text-emerald-600">SECURE DENTAL NETWORK</span>
            </div>
          </div>
        </div>
      </main>

      {/* Features Row */}
      <section className="bg-slate-100/60 dark:bg-slate-950/40 border-t border-slate-200/50 dark:border-white/5 py-12 transition-colors">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-4 p-4">
            <div className="w-10 h-10 rounded-xl bg-dent-blue-500/10 border border-dent-blue-500/20 flex items-center justify-center text-dent-blue-600 dark:text-dent-blue-400 shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm tracking-wide text-slate-800 dark:text-slate-200">Dynamic 3D Previews</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Watch cards flip and render live in 3D while typing metadata. Toggle between front and back views with smooth animations.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm tracking-wide text-slate-800 dark:text-slate-200">Instant QR Verification</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Cards print with unique secure QR codes. Patients scan with mobile cameras to verify warranty status instantly online.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm tracking-wide text-slate-800 dark:text-slate-200">Audit & Activity Logs</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Maintain strict medical records. Tracks card issuance, updates, and deletes in real-time with comprehensive user IP tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/50 dark:border-white/5 py-6 bg-white dark:bg-slate-950/80 transition-colors">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-[11px] font-semibold">
          <span>&copy; {new Date().getFullYear()} 32 Dental Design. All rights reserved.</span>
          <span className="flex gap-4">
            <a href="#" className="hover:text-slate-700 dark:hover:text-slate-300">Privacy Policy</a>
            <a href="#" className="hover:text-slate-700 dark:hover:text-slate-300">Terms of Service</a>
          </span>
        </div>
      </footer>
    </div>
  );
}
