"use client";

import { Shield, Sparkles, Award, Compass } from "lucide-react";

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
  layoutFront?: string;
  fontStyle?: string;
  primaryColor?: string;
  toothNumber?: string;
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
  layoutFront = "default",
  fontStyle = "inter",
  primaryColor = "#0f52ba",
  toothNumber,
}: CardFrontProps) {
  const isDarkFront = layoutFront === "modern";
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const fontClass = `font-style-${fontStyle || "inter"}`;

  // Helper to hex-to-rgba for styling overlays
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const renderToothCrosshairOnly = () => {
    return <ToothCrosshair toothNumber={toothNumber} isDark={isDarkFront} />;
  };

  const renderToothCrosshairRow = () => {
    if (!toothNumber) return null;
    return (
      <div className="flex items-center text-[11px] font-semibold">
        <span className="w-24 text-slate-400 font-bold uppercase text-[8px] tracking-wider leading-none">Teeth (FDI)</span>
        <span className="text-slate-400 mr-2.5">:</span>
        <div className="ml-5 flex items-center">
          {renderToothCrosshairOnly()}
        </div>
      </div>
    );
  };

  // Determine container styling based on layout
  const containerClasses = `w-[500px] h-[315px] rounded-2xl border shadow-2xl relative flex flex-col justify-between p-6 select-none shrink-0 overflow-hidden ${fontClass} ${isDarkFront ? "bg-slate-950 text-white border-slate-800" : "bg-white text-slate-800 border-slate-200/80"
    }`;

  // Render Background
  const renderBackground = () => {
    if (cardBgImage) {
      return (
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: `url(${cardBgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: isDarkFront ? 0.08 : 0.15
          }}
        />
      );
    }
    if (isDarkFront) {
      return (
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950 pointer-events-none z-0 animate-pulse-slow" />
      );
    }
    return (
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-50/50 via-white to-slate-100/30 pointer-events-none z-0" />
    );
  };

  // 1. DEFAULT LAYOUT: Sweep SVGs
  const renderDefaultLayout = () => {
    return (
      <>
        {/* Top-left background accent glow using primaryColor */}
        <div className="absolute top-0 left-0 w-28 h-28 rounded-br-full pointer-events-none z-0" style={{ backgroundImage: `linear-gradient(to bottom right, ${hexToRgba(primaryColor, 0.12)}, ${hexToRgba(primaryColor, 0.04)}, transparent)` }} />

        {/* Swoosh SVGs colored with primaryColor */}
        <svg className="absolute bottom-0 right-0 w-40 h-40 pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M 100 0 Q 30 30 0 100 L 100 100 Z" style={{ fill: isDarkFront ? "#020617" : "#0f172a" }} />
          <path d="M 100 -3 Q 27 27 -3 100" fill="none" style={{ stroke: primaryColor }} strokeWidth="2.5" />
        </svg>

        {/* Top Banner: Shield Crest + Lab branding */}
        <div className="flex items-start justify-between z-10">
          <div className="flex items-center gap-3">
            {labLogo ? (
              <img
                src={labLogo}
                alt="Lab Logo"
                className="w-10 h-10 object-cover rounded-xl border border-slate-200/40 shadow-sm shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md shrink-0" style={{ backgroundColor: hexToRgba(primaryColor, 0.1), border: `1px solid ${hexToRgba(primaryColor, 0.3)}` }}>
                <Shield className="w-5.5 h-5.5" style={{ color: primaryColor }} />
              </div>
            )}
            <div className="flex flex-col">
              <h1 className="text-sm font-black tracking-tight leading-none uppercase" style={{ color: isDarkFront ? "#ffffff" : "#0f172a" }}>
                {labName}
              </h1>
              <span className="text-[8px] font-bold tracking-[0.18em] uppercase mt-1" style={{ color: primaryColor }}>
                WARRANTY CERTIFICATE
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[7.5px] uppercase font-bold text-slate-400 tracking-wider">Product Class</span>
            <p className="text-[10px] font-extrabold uppercase tracking-wide leading-none mt-1" style={{ color: primaryColor }}>
              {materialType || "Restoration"}
            </p>
          </div>
        </div>

        {/* Middle Section: Details */}
        <div className="flex items-center justify-between gap-4 my-auto z-10 w-full pl-1 pr-1">
          <div className="flex flex-col gap-2 flex-grow max-w-[280px]">
            {[
              { label: "Patient Name", val: patientName },
              { label: "Doctor Name", val: doctorName },
              { label: "Delivery Date", val: formatDate(date) },
              { label: "Restoration Type", val: materialType },
              { label: "Case ID", val: jobId, color: primaryColor }
            ].map((item, i) => (
              <div key={i} className="flex items-center text-[11px] font-semibold">
                <span className="w-24 text-slate-400 font-bold uppercase text-[8px] tracking-wider leading-none">{item.label}</span>
                <span className="text-slate-400 mr-2.5">:</span>
                <span className="truncate border-b border-slate-200/40 flex-grow pb-0.5" style={{ color: item.color || (isDarkFront ? "#e2e8f0" : "#1e293b"), fontWeight: item.color ? "900" : "700" }}>{item.val || "---"}</span>
              </div>
            ))}
            {renderToothCrosshairRow()}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="flex justify-between items-end z-10">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex items-center justify-center shrink-0 rounded-full shadow-xs" style={{ backgroundColor: hexToRgba(primaryColor, 0.1), border: `1px solid ${hexToRgba(primaryColor, 0.3)}` }}>
              <div className="absolute inset-0.5 border border-dashed rounded-full" style={{ borderColor: hexToRgba(primaryColor, 0.35) }} />
              <span className="font-mono font-black text-sm leading-none mt-[-1px]" style={{ color: primaryColor }}>{warrantyYears}</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[7.5px] uppercase tracking-wider text-slate-400 font-bold">Warranty Valid For</span>
              <span className="text-xs font-black uppercase mt-1 tracking-wide" style={{ color: primaryColor }}>{warrantyYears} Years</span>
            </div>
          </div>

          <div className="flex mx-[-10px] items-center gap-1.5 z-10 shrink-0">
            {/* CE Seal */}
            <div className="lex items-center justify-center" title="CE Approved">
              <img
                src="/ce-approved.png"
                alt="CE Approved"
                className="w-8 h-8 object-contain rounded-[50%]"
                style={{
                  filter:
                    "invert(1) brightness(1.6) drop-shadow(rgba(255, 255, 255, 0.35) 0px 0px 2px)",
                }}
              />
            </div>
            {/* FDA Seal */}
            <div className="lex items-center justify-center" title="FDA Approved">
              <img
                src="/fda-approved.jpg"
                alt="FDA Approved"
                className="w-8 h-8 object-contain rounded-[50%]"
                style={{
                  filter:
                    "invert(1) brightness(1.6) drop-shadow(rgba(255, 255, 255, 0.35) 0px 0px 2px)",
                }}
              />
            </div>

            {/* ISO Seal */}
            <div className="flex items-center justify-center" title="ISO 9001:2015 Certified">
              <img
                src="/iso-9001.png"
                alt="ISO 9001:2015 Certified"
                className="w-8 h-8 object-contain rounded-[50%]"
                style={{
                  filter:
                    "invert(1) brightness(1.6) drop-shadow(rgba(255, 255, 255, 0.35) 0px 0px 2px)",
                }}
              />
            </div>
          </div>
        </div>
      </>
    );
  };

  // 2. MINIMAL LAYOUT: Centered clean double border
  const renderMinimalLayout = () => {
    return (
      <>
        {/* Accent border framing */}
        <div className="absolute inset-3.5 border-2 border-double rounded-xl pointer-events-none z-0" style={{ borderColor: hexToRgba(primaryColor, 0.4) }} />

        {/* Header */}
        <div className="flex flex-col items-center text-center mt-3 z-10">
          {labLogo ? (
            <img src={labLogo} alt="Logo" className="w-8 h-8 object-cover rounded-lg border border-slate-200/50 mb-1" />
          ) : (
            <Compass className="w-7 h-7 mb-1" style={{ color: primaryColor }} />
          )}
          <h1 className="text-xs font-black tracking-widest uppercase leading-none" style={{ color: isDarkFront ? "#ffffff" : "#0f172a" }}>
            {labName}
          </h1>
          <span className="text-[6.5px] font-bold tracking-[0.25em] uppercase text-slate-400 mt-1">
            Certificate of Authenticity
          </span>
        </div>

        {/* Center Details */}
        <div className="flex flex-col gap-2 my-auto z-10 px-8 w-full">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px] w-full">
            <div className="flex flex-col border-b border-slate-100 dark:border-slate-800/80 pb-0.5">
              <span className="text-[7px] text-slate-400 uppercase tracking-wider font-bold">Patient</span>
              <span className="font-extrabold text-slate-700 dark:text-slate-300 truncate mt-0.5">{patientName}</span>
            </div>
            <div className="flex flex-col border-b border-slate-100 dark:border-slate-800/80 pb-0.5">
              <span className="text-[7px] text-slate-400 uppercase tracking-wider font-bold">Dentist</span>
              <span className="font-extrabold text-slate-700 dark:text-slate-300 truncate mt-0.5">{doctorName}</span>
            </div>
            <div className="flex flex-col border-b border-slate-100 dark:border-slate-800/80 pb-0.5">
              <span className="text-[7px] text-slate-400 uppercase tracking-wider font-bold">Restoration Type</span>
              <span className="font-bold text-slate-700 dark:text-slate-300 truncate mt-0.5">{materialType}</span>
            </div>
            <div className="flex flex-col border-b border-slate-100 dark:border-slate-800/80 pb-0.5">
              <span className="text-[7px] text-slate-400 uppercase tracking-wider font-bold">Case ID</span>
              <span className="font-mono font-black mt-0.5" style={{ color: primaryColor }}>{jobId}</span>
            </div>
          </div>
          {toothNumber && (
            <div className="flex items-center text-[10px] font-semibold mt-1">
              <span className="text-[7px] text-slate-400 uppercase tracking-wider font-bold w-[70px]">Teeth (FDI)</span>
              <span className="text-slate-400 mr-2">:</span>
              <div className="ml-5">
                {renderToothCrosshairOnly()}
              </div>
            </div>
          )}
        </div>

        {/* Bottom */}
        <div className="flex items-center justify-between z-10 px-4 mb-2">
          <span className="text-[7.5px] uppercase tracking-widest text-slate-400 font-bold">
            Date: {formatDate(date)}
          </span>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[8.5px] font-bold" style={{ backgroundColor: hexToRgba(primaryColor, 0.1), border: `1px solid ${hexToRgba(primaryColor, 0.25)}`, color: primaryColor }}>
            <span>{warrantyYears} Years Warranty</span>
          </div>
        </div>
      </>
    );
  };

  // 3. CLASSIC LAYOUT: Ornate Frame, Traditional Serif
  const renderClassicLayout = () => {
    return (
      <>
        {/* Vintage ornate frame borders */}
        <div className="absolute inset-2.5 border-4 double rounded-lg pointer-events-none z-0" style={{ borderColor: primaryColor }} />
        <div className="absolute inset-4.5 border border-dashed rounded opacity-30 pointer-events-none z-0" style={{ borderColor: primaryColor }} />

        {/* Top Title */}
        <div className="flex flex-col items-center text-center mt-3.5 z-10">
          <h1 className="text-sm font-bold tracking-wide italic leading-none font-serif" style={{ color: primaryColor }}>
            {labName}
          </h1>
          <div className="w-12 h-[1px] my-1.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent" style={{ backgroundImage: `linear-gradient(to right, transparent, ${primaryColor}, transparent)` }} />
          <span className="text-[7px] font-bold tracking-[0.2em] uppercase text-slate-400">
            OFFICIAL CERTIFICATE OF WARRANTY
          </span>
        </div>

        {/* Traditional details blocks */}
        <div className="flex flex-col items-center gap-1.5 my-auto z-10 text-[10px] w-full px-6">
          <p className="leading-tight text-center text-slate-500 font-medium">
            This certifies that <strong className="text-slate-800 dark:text-slate-200 font-extrabold">{patientName}</strong> has received a genuine
            <br />
            <span className="font-extrabold px-1" style={{ color: primaryColor }}>{materialType}</span> prosthesis, prescribed by <strong className="text-slate-800 dark:text-slate-200 font-bold">{doctorName}</strong>.
          </p>
          <div className="flex flex-col items-center justify-center gap-1 w-full mt-1">
            <div className="flex items-center justify-center gap-4 text-[8px] uppercase tracking-wider text-slate-400 font-bold">
              <span>ID: <strong style={{ color: primaryColor }} className="font-mono font-black">{jobId}</strong></span>
              <span className="opacity-30">|</span>
              <span>Issued: <strong>{formatDate(date)}</strong></span>
            </div>
            {toothNumber && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[7px] text-slate-400 uppercase tracking-wider font-bold">Teeth (FDI)</span>
                <span className="text-slate-400">:</span>
                <div className="ml-5">
                  {renderToothCrosshairOnly()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Gold Rosette */}
        <div className="flex justify-center items-center gap-2 mb-2.5 z-10">
          <Award className="w-5 h-5 shrink-0" style={{ color: primaryColor }} />
          <span className="text-[9px] uppercase font-black tracking-widest" style={{ color: primaryColor }}>
            {warrantyYears} YEARS COVER
          </span>
        </div>
      </>
    );
  };

  return (
    <div className={containerClasses}>
      {renderBackground()}
      {/* Glare overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.08] pointer-events-none z-20" />

      {layoutFront === "minimal" && renderMinimalLayout()}
      {layoutFront === "classic" && renderClassicLayout()}
      {(layoutFront === "default" || layoutFront === "modern") && renderDefaultLayout()}
    </div>
  );
}

export function ToothCrosshair({ toothNumber, isDark }: { toothNumber?: string; isDark?: boolean }) {
  if (!toothNumber) return null;

  const teeth = toothNumber.split(",").map(t => parseInt(t.trim(), 10)).filter(t => !isNaN(t));
  const selectedSet = new Set(teeth);

  const q1 = [18, 17, 16, 15, 14, 13, 12, 11].filter(t => selectedSet.has(t));
  const q2 = [21, 22, 23, 24, 25, 26, 27, 28].filter(t => selectedSet.has(t));
  const q3 = [31, 32, 33, 34, 35, 36, 37, 38].filter(t => selectedSet.has(t));
  const q4 = [48, 47, 46, 45, 44, 43, 42, 41].filter(t => selectedSet.has(t));

  const formatQ = (arr: number[]) => arr.map(t => t % 10).join("");

  const q1Str = formatQ(q1);
  const q2Str = formatQ(q2);
  const q3Str = formatQ(q3);
  const q4Str = formatQ(q4);

  let borderClass = "";
  let textClass = "";

  if (isDark === true) {
    borderClass = "border-white/40";
    textClass = "text-white";
  } else if (isDark === false) {
    borderClass = "border-slate-800/40";
    textClass = "text-slate-800";
  } else {
    borderClass = "border-slate-800/40 dark:border-white/40";
    textClass = "text-slate-800 dark:text-white";
  }

  return (
    <div className={`grid grid-cols-2 gap-0 font-mono text-[9.5px] font-black select-none leading-none border-collapse w-fit ${textClass}`}>
      {/* Q1: Top-Left (UR) */}
      <div className={`flex items-end justify-end pr-1.5 pb-1 border-r-[1.5px] border-b-[1.5px] min-h-[14px] min-w-[24px] ${borderClass}`}>
        {q1Str}
      </div>
      {/* Q2: Top-Right (UL) */}
      <div className={`flex items-end justify-start pl-1.5 pb-1 border-b-[1.5px] min-h-[14px] min-w-[24px] ${borderClass}`}>
        {q2Str}
      </div>
      {/* Q4: Bottom-Left (LR) */}
      <div className={`flex items-start justify-end pr-1.5 pt-1 border-r-[1.5px] min-h-[14px] min-w-[24px] ${borderClass}`}>
        {q4Str}
      </div>
      {/* Q3: Bottom-Right (LL) */}
      <div className="flex items-start justify-start pl-1.5 pt-1 min-h-[14px] min-w-[24px]">
        {q3Str}
      </div>
    </div>
  );
}

