"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ShieldCheck, CreditCard, Sparkles, Database, CheckCircle, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import WarrantyCardPreview from "@/components/warranty/warranty-card-preview";

export default function Home() {
  const { data: session, status } = useSession();
  const [logoUrl, setLogoUrl] = useState("");
  const [labName, setLabName] = useState("32 Dental Design");
  const [labPhone, setLabPhone] = useState("+91 12345 67890");
  const [labEmail, setLabEmail] = useState("info@yourlab.com");
  const [labWebsite, setLabWebsite] = useState("www.yourlab.com");
  const [labAddress, setLabAddress] = useState("");
  const [cardBgImage, setCardBgImage] = useState("");

  // Default template custom design configurations
  const [layoutFront, setLayoutFront] = useState("default");
  const [layoutBack, setLayoutBack] = useState("default");
  const [fontStyle, setFontStyle] = useState("inter");
  const [primaryColor, setPrimaryColor] = useState("#0f52ba");
  const [warrantyYears, setWarrantyYears] = useState(10);
  const [materialType, setMaterialType] = useState("Zirconia Premium");
  const [doctorName, setDoctorName] = useState("Dr. John Smith");

  useEffect(() => {
    fetch("/api/auth/logo")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (data.labLogo) setLogoUrl(data.labLogo);
          if (data.labName) setLabName(data.labName);
          if (data.labPhone) setLabPhone(data.labPhone);
          if (data.labEmail) setLabEmail(data.labEmail);
          if (data.labWebsite) setLabWebsite(data.labWebsite);
          if (data.labAddress) setLabAddress(data.labAddress);
          if (data.cardBgImage !== undefined) setCardBgImage(data.cardBgImage);
          if (data.layoutFront) setLayoutFront(data.layoutFront);
          if (data.layoutBack) setLayoutBack(data.layoutBack);
          if (data.fontStyle) setFontStyle(data.fontStyle);
          if (data.primaryColor) setPrimaryColor(data.primaryColor);
          if (data.warrantyYears) setWarrantyYears(data.warrantyYears);
          if (data.materialType) setMaterialType(data.materialType);
          if (data.doctorName) setDoctorName(data.doctorName);
        }
      })
      .catch((err) => console.error("Error fetching branding details:", err));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white relative overflow-hidden flex flex-col justify-between transition-colors duration-300">
      {/* Background glowing effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-dent-blue-500/5 dark:bg-dent-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 dark:bg-emerald-500/5 blur-[120px] pointer-events-none" />

      {/* Header / Nav */}
      <header className="sticky top-0 z-30 w-full border-b border-slate-200/50 dark:border-white/5 bg-white/60 dark:bg-slate-950/60 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={logoUrl || '/logo.png'}
              alt="Logo"
              className="w-8 h-8 object-cover rounded-lg border border-slate-200/50 shadow-sm shrink-0"
            />

            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-dent-blue-600 to-emerald-500 dark:from-dent-blue-400 dark:to-emerald-400 bg-clip-text text-transparent uppercase">
              {labName}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {status === "authenticated" ? (
              <>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">
                  Welcome, <span className="font-bold text-slate-700 dark:text-slate-200">{session?.user?.name || "User"}</span>
                </span>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all uppercase tracking-wider active:scale-95 shadow-sm"
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <>
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
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-20 md:py-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center flex-grow">
        <div className="flex flex-col gap-6 text-left animate-fade-in">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-200/50 dark:bg-white/5 border border-slate-300/50 dark:border-white/10 w-fit text-slate-600 dark:text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 animate-pulse" />
            <span>Laboratory Grade Certificate System</span>
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

          {status === "authenticated" ? (
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link href="/dashboard/cards/create" className="group px-6 py-3.5 rounded-xl bg-gradient-to-r from-dent-blue-600 to-dent-blue-500 hover:from-dent-blue-700 hover:to-dent-blue-600 text-white font-bold text-sm tracking-wide shadow-lg shadow-dent-blue-500/20 active:scale-98 transition-all flex items-center justify-center gap-2">
                Create Certificate
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/dashboard" className="px-6 py-3.5 rounded-xl bg-slate-200/60 dark:bg-white/5 border border-slate-300/40 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-white font-bold text-sm tracking-wide active:scale-98 transition-all flex items-center justify-center">
                Go to Dashboard
                {/* Arrow icon can be added if needed */}
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link href="/register" className="group px-6 py-3.5 rounded-xl bg-gradient-to-r from-dent-blue-600 to-dent-blue-500 hover:from-dent-blue-700 hover:to-dent-blue-600 text-white font-bold text-sm tracking-wide shadow-lg shadow-dent-blue-500/20 active:scale-98 transition-all flex items-center justify-center gap-2">
                Generate Free Cards
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/login" className="px-6 py-3.5 rounded-xl bg-slate-200/60 dark:bg-white/5 border border-slate-300/40 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-white font-bold text-sm tracking-wide active:scale-98 transition-all flex items-center justify-center">
                Dashboard Login
              </Link>
            </div>
          )}
        </div>

        {/* Hero Visual Mockup showing the actual custom card design */}
        <div className="relative w-full aspect-[4/3] flex items-center justify-center select-none scale-[0.6] min-[370px]:scale-[0.7] min-[440px]:scale-[0.8] sm:scale-100 origin-center py-4 overflow-hidden">
          <WarrantyCardPreview
            jobId="DS-2605-AF9X"
            doctorName={doctorName}
            patientName="Jane Doe"
            toothNumber="16"
            warrantyYears={warrantyYears}
            materialType={materialType}
            date={new Date().toISOString()}
            signature={""}
            labLogo={logoUrl}
            labName={labName}
            labPhone={labPhone}
            labEmail={labEmail}
            labWebsite={labWebsite}
            labAddress={labAddress}
            cardBgImage={cardBgImage}
            layoutFront={layoutFront}
            layoutBack={layoutBack}
            fontStyle={fontStyle}
            primaryColor={primaryColor}
          />
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
