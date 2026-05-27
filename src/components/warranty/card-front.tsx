"use client";

import { Shield } from "lucide-react";

interface CardFrontProps {
  labName?: string;
  labLogo?: string;
  patientName?: string;
  doctorName?: string;
  date?: string;
  materialType?: string;
  jobId?: string;
  warrantyYears?: number;
  cardBgImage?: string;
}

export default function CardFront({
  labName = "32 DENTAL DESIGN",
  labLogo,
  patientName = "Jane Doe",
  doctorName = "Dr. John Smith",
  date,
  materialType = "Zirconia Premium",
  jobId = "DS-XXXXXX",
  warrantyYears = 5,
  cardBgImage,
}: CardFrontProps) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-[500px] h-[315px] rounded-2xl bg-white border border-slate-200/80 shadow-2xl relative flex flex-col justify-between p-6 select-none text-slate-800 shrink-0 overflow-hidden">

      {/* Dynamic Background Image Watermark or default accent background */}
      {cardBgImage ? (
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{ backgroundImage: `url(${cardBgImage})`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
      ) : (
        /* Subtle default background gradient accents */
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-50/50 via-white to-slate-100/30 pointer-events-none" />
      )}

      {/* Premium subtle glass glare reflection overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.1] pointer-events-none z-10" />

      {/* Gold & Blue Swoosh SVGs matching reference image layout */}
      <svg className="absolute bottom-0 right-0 w-40 h-40 text-slate-950 fill-current pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M 100 0 Q 30 30 0 100 L 100 100 Z" />
        <path d="M 100 -3 Q 27 27 -3 100" fill="none" stroke="#d97706" strokeWidth="2.5" />
      </svg>

      <div className="absolute top-0 left-0 w-28 h-28 bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-transparent rounded-br-full pointer-events-none z-0" />

      {/* Top Banner: Shield Crest + Lab branding details */}
      <div className="flex items-start justify-between z-10">
        <div className="flex items-center gap-3">
          {/* Logo / Shield Crest */}
          {labLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={labLogo}
              alt="Lab Logo"
              className="w-10 h-10 object-cover rounded-xl border border-slate-200 shadow-sm shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-md shadow-amber-500/5 shrink-0">
              <svg className="w-6 h-6 text-amber-600 fill-none stroke-current" strokeWidth="1.75" viewBox="0 0 24 24">
                <path d="M12 22C12 22 20 18 20 11V5L12 2L4 5V11C4 18 12 22 12 22Z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 7C10.5 7 9.5 8 9.5 10C9.5 12.5 11 14 12 15C13 14 14.5 12.5 14.5 10C14.5 8 13.5 7 12 7Z" fill="currentColor" className="text-amber-500/20" />
              </svg>
            </div>
          )}
          <div className="flex flex-col">
            <h1 className="text-sm font-black text-slate-900 tracking-tight leading-none uppercase">
              {labName}
            </h1>
            <span className="text-[8px] font-bold text-amber-650 tracking-[0.18em] uppercase mt-1">
              WARRANTY CARD
            </span>
          </div>
        </div>

        {/* restoration type shorthand tagline */}
        <div className="text-right">
          <span className="text-[8px] uppercase font-bold text-slate-400 tracking-wider">Product Class</span>
          <p className="text-[10px] font-extrabold text-amber-650 uppercase tracking-wide leading-none mt-1">
            {materialType || "Restoration"}
          </p>
        </div>
      </div>

      {/* Middle Section: Dynamic Patient Details Form List */}
      <div className="flex flex-col gap-2 my-auto z-10 max-w-[340px] pl-1">
        <div className="flex items-center text-[11px] font-semibold">
          <span className="w-24 text-slate-400 font-bold uppercase text-[8.5px] tracking-wider leading-none">Patient Name</span>
          <span className="text-slate-400 mr-2.5">:</span>
          <span className="text-slate-800 font-extrabold truncate border-b border-slate-200/60 flex-grow pb-0.5">{patientName || "---"}</span>
        </div>
        <div className="flex items-center text-[11px] font-semibold">
          <span className="w-24 text-slate-400 font-bold uppercase text-[8.5px] tracking-wider leading-none">Doctor Name</span>
          <span className="text-slate-400 mr-2.5">:</span>
          <span className="text-slate-800 font-extrabold truncate border-b border-slate-200/60 flex-grow pb-0.5">{doctorName || "---"}</span>
        </div>
        <div className="flex items-center text-[11px] font-semibold">
          <span className="w-24 text-slate-400 font-bold uppercase text-[8.5px] tracking-wider leading-none">Delivery Date</span>
          <span className="text-slate-400 mr-2.5">:</span>
          <span className="text-slate-700 font-bold border-b border-slate-200/60 flex-grow pb-0.5">{formatDate(date)}</span>
        </div>
        <div className="flex items-center text-[11px] font-semibold">
          <span className="w-24 text-slate-400 font-bold uppercase text-[8.5px] tracking-wider leading-none">Restoration Type</span>
          <span className="text-slate-400 mr-2.5">:</span>
          <span className="text-slate-800 font-extrabold border-b border-slate-200/60 flex-grow pb-0.5">{materialType || "---"}</span>
        </div>
        <div className="flex items-center text-[11px] font-semibold">
          <span className="w-24 text-slate-400 font-bold uppercase text-[8.5px] tracking-wider leading-none">Case ID</span>
          <span className="text-slate-400 mr-2.5">:</span>
          <span className="text-dent-blue-600 font-black font-mono border-b border-slate-200/60 flex-grow pb-0.5 tracking-wide">{jobId || "ID-Pending"}</span>
        </div>
      </div>

      {/* Bottom Row: Validity Ribbon Badge */}
      <div className="flex justify-between items-end z-10">
        <div className="flex items-center gap-3">
          {/* Gold Certificate Rosette */}
          <div className="relative w-10 h-10 flex items-center justify-center shrink-0 bg-amber-500/10 rounded-full border border-amber-500/30 shadow-xs">
            <div className="absolute inset-0.5 border border-dashed border-amber-500/35 rounded-full" />
            <span className="font-mono font-black text-amber-600 text-sm leading-none mt-[-1px]">{warrantyYears}</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[7.5px] uppercase tracking-wider text-slate-400 font-bold">Warranty Valid For</span>
            <span className="text-xs font-black text-amber-600 uppercase mt-1 tracking-wide">{warrantyYears} Years</span>
          </div>
        </div>

        {/* Authentic Security Emblem inside blue swoosh */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-xs shadow-inner">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[8.5px] uppercase font-extrabold tracking-widest text-emerald-400">
            Genuine
          </span>
        </div>
      </div>
    </div>
  );
}
