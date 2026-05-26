"use client";

import { QRCodeImage } from "./qr-code";
import { Phone, Mail, Globe, MapPin, Check } from "lucide-react";

interface CardBackProps {
  jobId: string;
  signature?: string;
  labPhone?: string;
  labEmail?: string;
  labWebsite?: string;
  labAddress?: string;
  cardBgImage?: string;
}

export default function CardBack({
  jobId,
  signature,
  labPhone = "+91 12345 67890",
  labEmail = "info@yourlab.com",
  labWebsite = "www.yourlab.com",
  labAddress = "",
  cardBgImage,
}: CardBackProps) {
  // Construct verification URL
  const verifyUrl = typeof window !== "undefined"
    ? `${window.location.origin}/verify/${jobId || "TEMP"}`
    : `https://32 Dental Design.com/verify/${jobId || "TEMP"}`;

  return (
    <div className="w-[500px] h-[315px] rounded-2xl bg-slate-950 text-white border border-white/5 shadow-2xl relative flex justify-between p-5 select-none shrink-0 overflow-hidden">

      {/* Background Image Watermark or default accent background */}
      {cardBgImage ? (
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: `url(${cardBgImage})`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
      ) : (
        /* Royal indigo dark mesh gradient background */
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950/40 to-slate-900 pointer-events-none" />
      )}

      {/* Premium subtle glass glare reflection overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-white/[0.08] pointer-events-none z-10" />

      {/* Gold aesthetic accents on the card back */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-500/10 via-amber-400/5 to-transparent rounded-bl-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-amber-500/5 via-slate-900 to-transparent rounded-tr-full pointer-events-none" />

      {/* Main split grid: Terms and Contact on the Left, Verification on the Right */}
      <div className="flex w-full gap-4 z-10 relative">

        {/* Left Column (65% width): Terms, Divider, Contacts, Footer */}
        <div className="flex-[1.8] flex flex-col justify-between h-full pr-1">
          {/* Terms & Conditions */}
          <div className="space-y-1">
            <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-none">
              TERMS & CONDITIONS
            </h4>
            <ul className="list-disc pl-3 text-[8px] text-slate-300 space-y-1 leading-normal font-medium mt-1">
              <li>Warranty applies only to manufacturing defects.</li>
              <li>Damage due to accident, trauma, improper handling, or patient negligence is not covered.</li>
              <li>Adjustments done outside authorized lab may void warranty.</li>
              <li>Original invoice / Case ID required.</li>
            </ul>
          </div>

          {/* Gold Divider Line */}
          <div className="h-[1.5px] bg-gradient-to-r from-amber-500 via-amber-500/60 to-transparent w-full my-1.5" />

          {/* Contact Details with Icons */}
          <div className="grid grid-cols-1 gap-1">
            <div className="flex items-center gap-2 text-[9px] font-semibold text-slate-350">
              <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{labPhone}</span>
            </div>
            <div className="flex items-center gap-2 text-[9px] font-semibold text-slate-350 min-w-0">
              <Mail className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="truncate">{labEmail}</span>
            </div>
            <div className="flex items-center gap-2 text-[9px] font-semibold text-slate-350">
              <Globe className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="truncate">{labWebsite}</span>
            </div>
            {labAddress && (
              <div className="flex items-start gap-2 text-[8px] font-semibold text-slate-350 leading-tight min-w-0">
                <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span className="line-clamp-2 max-w-[240px]">{labAddress}</span>
              </div>
            )}
          </div>

          {/* Footer note thanking customer */}
          <p className="text-[9px] font-extrabold text-amber-500 tracking-wider leading-none mt-1">
            THANK YOU FOR TRUSTING US
          </p>
        </div>

        {/* Right Column (35% width): QR Verification and Signature */}
        <div className="flex-[1] flex flex-col items-center justify-between h-full border-l border-slate-800/80 pl-4 w-[130px]">

          {/* QR Verification Container */}
          <div className="flex flex-col items-center gap-1.5 mt-1 bg-white p-1.5 rounded-xl shadow-md shrink-0">
            <QRCodeImage value={verifyUrl} size={70} />
            <span className="text-[7px] uppercase font-black text-slate-700 tracking-wider mt-0.5 leading-none">
              Scan to Verify
            </span>
          </div>

          {/* Signature Box */}
          <div className="w-full flex flex-col items-stretch mt-2">
            <span className="text-[7.5px] uppercase font-bold text-slate-400 text-center tracking-widest mb-1.5">
              Authorized Signature
            </span>
            <div className="h-[46px] border border-dashed border-slate-700 rounded-xl flex items-center justify-center bg-slate-900/60 relative overflow-hidden">
              {signature ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={signature}
                  alt="Auth Signature"
                  className="max-h-full max-w-full object-contain p-1 invert dark:invert-0 filter brightness-125"
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
    </div>
  );
}
