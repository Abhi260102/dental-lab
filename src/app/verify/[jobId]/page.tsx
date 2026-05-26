import dbConnect from "@/lib/mongodb";
import WarrantyCard from "@/models/WarrantyCard";
import { ShieldCheck, AlertTriangle, ShieldAlert, Sparkles, Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";
import CardFront from "@/components/warranty/card-front";
import CardBack from "@/components/warranty/card-back";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export const revalidate = 0; // Fresh verification on every request

type VerifyPageProps = {
  params: Promise<{ jobId: string }>;
};

export default async function VerifyPage({ params }: VerifyPageProps) {
  const { jobId } = await params;

  await dbConnect();

  // Query certificate from database and join creator lab branding
  const card = await WarrantyCard.findOne({ jobId: jobId.trim() })
    .populate("createdBy", "name labName labLogo labPhone labEmail labWebsite labAddress cardBgImage")
    .lean();

  const isExist = !!card;
  let isActive = false;
  let issueDateStr = "";
  let expiryDateStr = "";
  let creatorLab = "32 DENTAL DESIGN";
  let creatorLogo = "";
  let labPhone = "+91 12345 67890";
  let labEmail = "info@yourlab.com";
  let labWebsite = "www.yourlab.com";
  let labAddress = "";
  let cardBgImage = "";

  if (card) {
    const now = new Date();
    const issueDate = new Date(card.date);
    const expiryDate = new Date(issueDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + card.warrantyYears);

    isActive = expiryDate > now;

    issueDateStr = issueDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    expiryDateStr = expiryDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    if (card.createdBy) {
      creatorLab = (card.createdBy as any).labName || creatorLab;
      creatorLogo = (card.createdBy as any).labLogo || "";
      labPhone = (card.createdBy as any).labPhone || labPhone;
      labEmail = (card.createdBy as any).labEmail || labEmail;
      labWebsite = (card.createdBy as any).labWebsite || labWebsite;
      labAddress = (card.createdBy as any).labAddress || labAddress;
      cardBgImage = (card.createdBy as any).cardBgImage || "";
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white flex flex-col justify-between p-6 relative overflow-hidden select-none transition-colors duration-300">

      {/* Background ambient glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-dent-blue-500/5 dark:bg-dent-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 dark:bg-emerald-500/5 blur-[120px] pointer-events-none" />

      {/* Brand Header */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between py-4 border-b border-slate-200/50 dark:border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-tr from-dent-blue-600 to-dent-green-500 shadow-md">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-dent-blue-600 to-emerald-500 dark:from-dent-blue-400 dark:to-emerald-400 bg-clip-text text-transparent">
            32 Dental Design
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500">
            Verification Hub
          </span>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Validation Screen */}
      <main className="max-w-5xl mx-auto w-full my-auto py-12 flex flex-col items-center justify-center gap-10">

        {isExist ? (
          /* AUTHENTIC VERIFICATION PANEL */
          <div className="flex flex-col items-center gap-8 w-full">

            {/* Status Stamp Card */}
            <div className="flex flex-col items-center text-center gap-3 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/10 relative">
                <ShieldCheck className="w-8 h-8 text-emerald-500 dark:text-emerald-400 animate-bounce" />
                <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-ping" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-500 dark:text-emerald-400">Authenticity Shield</span>
                <h2 className="text-2xl font-extrabold tracking-tight mt-1 text-slate-900 dark:text-white">
                  Warranty Verified & Active
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-xs mt-1 leading-normal">
                  Certificate Registry Match: <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{card.jobId}</span>
                </p>
              </div>
            </div>

            {/* Side-by-side Premium visual card mockup */}
            <div className="flex flex-col xl:flex-row gap-8 items-center justify-center scale-90 sm:scale-100 origin-top">
              <CardFront
                labName={creatorLab}
                labLogo={card.labLogo || creatorLogo}
                patientName={card.patientName}
                doctorName={card.doctorName}
                date={card.date as any}
                materialType={card.materialType}
                jobId={card.jobId}
                warrantyYears={card.warrantyYears}
                cardBgImage={card.cardBgImage || cardBgImage}
              />
              <CardBack
                jobId={card.jobId}
                signature={card.signature}
                labPhone={card.labPhone || labPhone}
                labEmail={card.labEmail || labEmail}
                labWebsite={card.labWebsite || labWebsite}
                labAddress={card.labAddress || labAddress}
                cardBgImage={card.cardBgImage || cardBgImage}
              />
            </div>

            {/* Validation detail credentials table */}
            <div className="w-full max-w-[500px] border border-slate-200/80 dark:border-slate-800/80 rounded-[24px] bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl p-8 flex flex-col gap-6 text-left shadow-2xl transition-all duration-300 relative overflow-hidden">

              {/* Dynamic lab background image watermark */}
              {(card.cardBgImage || cardBgImage) && (
                <div
                  className="absolute inset-0 opacity-[0.06] pointer-events-none dark:opacity-[0.04] z-0"
                  style={{
                    backgroundImage: `url(${card.cardBgImage || cardBgImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                  }}
                />
              )}

              {/* Lab Header */}
              <div className="flex items-center gap-3.5 border-b border-slate-100 dark:border-slate-800/60 pb-5 z-10 relative">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/35 flex items-center justify-center text-amber-600 dark:text-amber-500 shadow-md shadow-amber-500/5 shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-[0.2em] leading-none block">Certified Laboratory</span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white mt-1.5 uppercase tracking-wide leading-none truncate">
                    {creatorLab}
                  </h3>
                  {(card.labAddress || labAddress) && (
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block font-semibold leading-normal truncate">
                      {card.labAddress || labAddress}
                    </span>
                  )}
                </div>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-2 gap-y-5 gap-x-6 text-sm leading-normal z-10 relative">

                <div className="flex flex-col">
                  <span className="text-[8.5px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider">Patient Name</span>
                  <span className="font-extrabold text-slate-900 dark:text-white mt-1.5 text-base">
                    {card.patientName}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[8.5px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider">Issuing Doctor</span>
                  <span className="font-extrabold text-slate-900 dark:text-white mt-1.5 text-base">
                    {card.doctorName}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[8.5px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider block mb-1.5">Restoration Material</span>
                  <div className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 inline-flex items-center w-fit">
                    {card.materialType}
                  </div>
                </div>

                <div className="flex flex-col">
                  <span className="text-[8.5px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider block mb-1">Tooth Designations</span>
                  <div className="flex flex-wrap gap-1 mt-1 font-bold font-mono text-dent-blue-600 dark:text-dent-blue-400">
                    {card.toothNumber.split(",").map((t: string, idx: number) => (
                      <span key={idx} className="px-2 py-0.5 bg-dent-blue-500/10 border border-dent-blue-500/20 rounded-md text-[11px]">
                        {t.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col">
                  <span className="text-[8.5px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider">Date Issued</span>
                  <span className="font-bold text-slate-700 dark:text-slate-350 mt-1.5">
                    {issueDateStr}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[8.5px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider block mb-1">Warranty Term Expiry</span>
                  <div className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 inline-flex items-center w-fit">
                    {expiryDateStr}
                  </div>
                </div>

                {card.notes && (
                  <div className="flex flex-col col-span-2 border-t border-slate-100 dark:border-slate-800/80 pt-4">
                    <span className="text-[8.5px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider">Prosthesis Notes</span>
                    <span className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 italic bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/40">
                      &quot;{card.notes}&quot;
                    </span>
                  </div>
                )}

              </div>
            </div>

          </div>
        ) : (
          /* SECURITY WARNING: UNRECOGNIZED CERTIFICATE */
          <div className="flex flex-col items-center gap-6 text-center max-w-md p-8 border border-rose-500/20 bg-rose-500/5 rounded-2xl shadow-xl shadow-rose-950/20 animate-pulse">
            <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-rose-500">
                Authentication Failure
              </h2>
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                Certificate Registry Mismatch
              </h3>
              <p className="text-slate-650 dark:text-slate-400 text-xs leading-relaxed mt-4">
                The Job ID <span className="font-mono text-rose-600 dark:text-rose-450 font-bold">`{jobId}`</span> is not registered in our dental warranty validation database.
              </p>
              <p className="text-slate-500 text-[10px] leading-relaxed mt-3">
                Please double check the Job ID spelling or contact your prescribing dentist or 32 Dental Designoratory to verify authorization status.
              </p>
            </div>
            <Link
              href="/"
              className="mt-4 px-4 py-2 border border-slate-300 dark:border-white/10 rounded-xl text-xs font-bold hover:bg-slate-205 dark:hover:bg-white/5 transition-all text-slate-600 dark:text-slate-300"
            >
              Return to Homepage
            </Link>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto w-full text-center py-4 border-t border-slate-200/50 dark:border-white/5 text-[10px] text-slate-500 font-bold">
        <span>32 Dental Design Authenticity Verification Protocol | Secure Dental Registry</span>
      </footer>

    </div>
  );
}
