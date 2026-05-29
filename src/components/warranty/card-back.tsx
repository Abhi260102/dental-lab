"use client";

import { QRCodeImage } from "./qr-code";
import { Phone, Mail, Globe, MapPin, Check, Heart, ShieldAlert } from "lucide-react";

interface CardBackProps {
  jobId: string;
  signature?: string;
  labPhone?: string;
  labEmail?: string;
  labWebsite?: string;
  labAddress?: string;
  cardBgImage?: string;
  layoutBack?: string;
  fontStyle?: string;
  primaryColor?: string;
}

export default function CardBack({
  jobId,
  signature,
  labPhone = "+91 12345 67890",
  labEmail = "info@yourlab.com",
  labWebsite = "www.yourlab.com",
  labAddress = "",
  cardBgImage,
  layoutBack = "default",
  fontStyle = "inter",
  primaryColor = "#0f52ba",
}: CardBackProps) {
  // Construct verification URL
  const verifyUrl = typeof window !== "undefined"
    ? `${window.location.origin}/verify/${jobId || "TEMP"}`
    : `https://32 Dental Design.com/verify/${jobId || "TEMP"}`;

  const fontClass = `font-style-${fontStyle || "inter"}`;

  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Determine container styling based on layout
  const isLightBack = layoutBack === "minimal";
  const containerClasses = `w-[500px] h-[315px] rounded-2xl border shadow-2xl relative flex justify-between p-5 select-none shrink-0 overflow-hidden ${fontClass} ${isLightBack ? "bg-white text-slate-800 border-slate-200/80" : "bg-slate-950 text-white border-white/5"
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
            opacity: isLightBack ? 0.08 : 0.1
          }}
        />
      );
    }
    if (isLightBack) {
      return (
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-50/50 via-white to-slate-100/30 pointer-events-none z-0" />
      );
    }
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950/20 to-slate-900 pointer-events-none z-0" />
    );
  };

  // 1. DEFAULT DARK LAYOUT
  const renderDefaultLayout = () => {
    return (
      <>
        {/* Gold aesthetic accents on the card back */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-500/10 via-amber-400/5 to-transparent rounded-bl-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-amber-500/5 via-slate-900 to-transparent rounded-tr-full pointer-events-none" />

        <div className="flex w-full gap-4 z-10 relative">
          {/* Left Column (65% width): Terms, Divider, Contacts, Footer */}
          <div className="flex-[1.8] flex flex-col justify-between h-full pr-1">
            <div className="space-y-0.5">
              <h4 className="text-[8.5px] font-black uppercase tracking-widest leading-none" style={{ color: primaryColor }}>
                TERMS & CONDITIONS
              </h4>
              <ul className="list-disc pl-2.5 text-[8.5px] text-slate-350 space-y-0.5 leading-tight font-medium mt-2">
                <li>Covers structural breakage, fractures & ceramic chipping.</li>
                <li>Free repair or replacement within first 3 years.</li>
                <li>50-50% remake cost-sharing after 3 years within warranty.</li>
                <li>Original Warranty Card is mandatory for claims.</li>
                <li>Old/damaged prosthesis must be returned to the lab.</li>
                <li>New impressions or tooth preps are charged separately.</li>
                <li>Valid strictly on original master model & prep design.</li>
                <li>Excludes accidental damage, trauma, or standard wear.</li>
                <li>Excludes clinical failures or unauthorized alterations.</li>
              </ul>
            </div>

            {/* Accent Divider Line */}
            <div className="h-[1.5px] w-full my-1.5" style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, ${hexToRgba(primaryColor, 0.4)}, transparent)` }} />

            {/* Contact Details with Icons */}
            <div className="grid grid-cols-1 gap-1">
              <div className="flex items-center gap-2 text-[9px] font-semibold text-slate-300">
                <Phone className="w-3.5 h-3.5 shrink-0" style={{ color: primaryColor }} />
                <span>{labPhone}</span>
              </div>
              <div className="flex items-center gap-2 text-[9px] font-semibold text-slate-300 min-w-0">
                <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: primaryColor }} />
                <span className="truncate">{labEmail}</span>
              </div>
              <div className="flex items-center gap-2 text-[9px] font-semibold text-slate-300">
                <Globe className="w-3.5 h-3.5 shrink-0" style={{ color: primaryColor }} />
                <span className="truncate">{labWebsite}</span>
              </div>
              {labAddress && (
                <div className="flex items-start gap-2 text-[8px] font-semibold text-slate-350 leading-tight min-w-0">
                  <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: primaryColor }} />
                  <span className="line-clamp-2 max-w-[240px]">{labAddress}</span>
                </div>
              )}
            </div>

            <p className="text-[9px] font-extrabold tracking-wider leading-none mt-1" style={{ color: primaryColor }}>
              THANK YOU FOR TRUSTING US
            </p>
          </div>

          {/* Right Column (35% width): QR Verification and Signature */}
          <div className="flex-[1] flex flex-col items-center justify-between h-full border-l border-slate-800/80 pl-4 w-[130px]">
            <div className="flex flex-col items-center gap-1.5 mt-1 bg-white p-1.5 rounded-xl shadow-md shrink-0">
              <QRCodeImage value={verifyUrl} size={70} />
              <span className="text-[7px] uppercase font-black text-slate-700 tracking-wider mt-0.5 leading-none">
                Scan to Verify
              </span>
            </div>

            <div className="w-full flex flex-col items-stretch mt-2">
              <span className="text-[7.5px] uppercase font-bold text-slate-400 text-center tracking-widest mb-1.5">
                Authorized Signature
              </span>
              <div className="h-[36px] border border-dashed border-slate-700 rounded-xl flex items-center justify-center bg-slate-900/60 relative overflow-hidden">
                {signature ? (
                  <img
                    src={signature}
                    alt="Auth Signature"
                    className="max-h-[70%] max-w-[85%] object-contain invert dark:invert-0 filter brightness-125"
                  />
                ) : (
                  <div className="flex items-center gap-1 text-[8.5px] text-slate-500 font-bold uppercase tracking-wider">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Authorized</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  // 2. MINIMAL LIGHT LAYOUT
  const renderMinimalLayout = () => {
    return (
      <>
        {/* Accent border framing */}
        <div className="absolute inset-3.5 border border-dashed rounded-xl pointer-events-none z-0" style={{ borderColor: hexToRgba(primaryColor, 0.35) }} />

        <div className="flex w-full gap-4 z-10 relative">
          {/* Left Column: Rules & Contacts */}
          <div className="flex-[1.8] flex flex-col justify-between h-full pr-1 p-1">
            <div>
              <h4 className="text-[8.5px] font-black uppercase tracking-widest leading-none mb-1" style={{ color: primaryColor }}>
                Warranty Validation Guide
              </h4>
              <ul className="text-[6.5px] text-slate-500 space-y-0.5 leading-tight font-semibold">
                <li className="flex items-start gap-1"><Check className="w-2 h-2 text-emerald-500 shrink-0 mt-0.5" /> Covers structural breakage, fractures & ceramic chipping.</li>
                <li className="flex items-start gap-1"><Check className="w-2 h-2 text-emerald-500 shrink-0 mt-0.5" /> Free repair/replacement for defects within first 3 years.</li>
                <li className="flex items-start gap-1"><Check className="w-2 h-2 text-emerald-500 shrink-0 mt-0.5" /> 50-50% remake cost-sharing after 3 years within warranty.</li>
                <li className="flex items-start gap-1"><Check className="w-2 h-2 text-emerald-500 shrink-0 mt-0.5" /> Original Warranty Card is mandatory for claims.</li>
                <li className="flex items-start gap-1"><Check className="w-2 h-2 text-emerald-500 shrink-0 mt-0.5" /> Old/damaged prosthesis must be returned to the lab.</li>
                <li className="flex items-start gap-1"><Check className="w-2 h-2 text-emerald-500 shrink-0 mt-0.5" /> New impressions or tooth preps are charged separately.</li>
                <li className="flex items-start gap-1"><Check className="w-2 h-2 text-emerald-500 shrink-0 mt-0.5" /> Valid strictly on original master model & prep design.</li>
                <li className="flex items-start gap-1"><Check className="w-2 h-2 text-emerald-500 shrink-0 mt-0.5" /> Excludes accidental damage, trauma, or standard wear.</li>
                <li className="flex items-start gap-1"><Check className="w-2 h-2 text-emerald-500 shrink-0 mt-0.5" /> Excludes clinical failures or unauthorized alterations.</li>
              </ul>
            </div>

            {/* Clean Contacts List */}
            <div className="space-y-1 border-t border-slate-100 pt-2 text-[8px] font-bold text-slate-600">
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{labPhone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3 h-3 text-slate-400" />
                <span>{labEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-3 h-3 text-slate-400" />
                <span>{labWebsite}</span>
              </div>
            </div>
          </div>

          {/* Right Column: QR and Signature */}
          <div className="flex-[1] flex flex-col items-center justify-between h-full border-l border-slate-100 pl-4 w-[130px]">
            <div className="flex flex-col items-center gap-1 bg-slate-50 p-1.5 rounded-lg border border-slate-100 shrink-0">
              <QRCodeImage value={verifyUrl} size={65} />
              <span className="text-[6.5px] uppercase font-bold text-slate-500 tracking-wider mt-0.5 leading-none">
                Scan Code
              </span>
            </div>

            <div className="w-full flex flex-col items-stretch mt-1">
              <span className="text-[7px] uppercase font-bold text-slate-400 text-center tracking-widest mb-1">
                Approved Presets
              </span>
              <div className="h-[42px] border border-dashed border-slate-200 rounded-lg flex items-center justify-center bg-slate-50/50 relative overflow-hidden">
                {signature ? (
                  <img
                    src={signature}
                    alt="Signature"
                    className="max-h-[70%] max-w-[85%] object-contain"
                  />
                ) : (
                  <Heart className="w-4 h-4 text-emerald-500/80 animate-pulse" />
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  // 3. CLASSIC LAYOUT
  const renderClassicLayout = () => {
    return (
      <>
        {/* Frame borders */}
        <div className="absolute inset-2.5 border border-double rounded-lg pointer-events-none z-0" style={{ borderColor: primaryColor }} />

        <div className="flex w-full gap-4 z-10 relative">
          {/* Left Column */}
          <div className="flex-[1.8] flex flex-col justify-between h-full pr-1 font-serif text-slate-200">
            <div>
              <h4 className="text-[8.5px] font-black uppercase tracking-widest font-sans mb-1" style={{ color: primaryColor }}>
                Prosthetic Certification Details
              </h4>
              <p className="text-[6.5px] text-slate-400 italic leading-relaxed">
                Certified genuine. Covers structural breakage, fractures & ceramic chipping with free remake for 3 years, and 50-50% cost sharing thereafter. Claims require original card & prosthesis. New preps/impressions are charged separately. Valid strictly on original model/prep. Excludes accidental wear, clinical failure, or unauthorized alterations.
              </p>
            </div>

            <div className="border-t border-slate-800/80 pt-2 space-y-1 text-[8.5px] font-sans">
              <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-amber-500" style={{ color: primaryColor }} /> <span className="truncate max-w-[200px]">{labAddress || "Dental Lab Address Preserved"}</span></div>
              <div className="flex items-center gap-1.5"><Globe className="w-3 h-3 text-amber-500" style={{ color: primaryColor }} /> <span>{labWebsite}</span></div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex-[1] flex flex-col items-center justify-between h-full border-l border-slate-800 pl-4 w-[130px]">
            <div className="bg-white p-1 rounded border shrink-0">
              <QRCodeImage value={verifyUrl} size={65} />
            </div>

            <div className="w-full flex flex-col mt-2 font-sans">
              <span className="text-[6.5px] uppercase text-slate-400 text-center tracking-widest">
                Certification Sign
              </span>
              <div className="h-[44px] border border-double rounded-lg flex items-center justify-center bg-slate-900/60 relative overflow-hidden" style={{ borderColor: hexToRgba(primaryColor, 0.4) }}>
                {signature ? (
                  <img src={signature} alt="Sign" className="max-h-[70%] max-w-[85%] object-contain invert" />
                ) : (
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Verified</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className={containerClasses}>
      {renderBackground()}
      {/* Glare overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.08] pointer-events-none z-20" />

      {layoutBack === "minimal" && renderMinimalLayout()}
      {layoutBack === "classic" && renderClassicLayout()}
      {(layoutBack === "default" || layoutBack === "modern") && renderDefaultLayout()}
    </div>
  );
}
