"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import CardFront from "./card-front";
import CardBack from "./card-back";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface WarrantyCardPreviewProps {
  jobId: string;
  doctorName: string;
  patientName: string;
  toothNumber: string;
  warrantyYears: number;
  materialType: string;
  date: string;
  signature?: string;
  labName?: string;
  labLogo?: string;
  labPhone?: string;
  labEmail?: string;
  labWebsite?: string;
  labAddress?: string;
  cardBgImage?: string;
}

export default function WarrantyCardPreview({
  jobId,
  doctorName,
  patientName,
  toothNumber,
  warrantyYears,
  materialType,
  date,
  signature,
  labName,
  labLogo,
  labPhone,
  labEmail,
  labWebsite,
  labAddress,
  cardBgImage,
}: WarrantyCardPreviewProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* 3D Flipping Card Container */}
      <div 
        onClick={handleFlip}
        className="w-[500px] h-[315px] cursor-pointer perspective-1000 group hidden md:block shrink-0"
        title="Click to flip card"
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="w-full h-full transform-style-3d relative duration-500"
        >
          {/* FRONT SIDE */}
          <div className="absolute inset-0 backface-hidden">
            <CardFront
              labName={labName}
              labLogo={labLogo}
              patientName={patientName}
              doctorName={doctorName}
              date={date}
              materialType={materialType}
              jobId={jobId}
              warrantyYears={warrantyYears}
              cardBgImage={cardBgImage}
            />
          </div>

          {/* BACK SIDE */}
          <div className="absolute inset-0 backface-hidden rotate-y-180">
            <CardBack
              jobId={jobId}
              signature={signature}
              labPhone={labPhone}
              labEmail={labEmail}
              labWebsite={labWebsite}
              labAddress={labAddress}
              cardBgImage={cardBgImage}
            />
          </div>
        </motion.div>
      </div>

      {/* Mobile Stack view (front and back visible vertically) */}
      <div className="flex flex-col gap-6 md:hidden w-full max-w-[500px] items-center scale-90 sm:scale-100 origin-top">
        <div className="flex flex-col gap-1 w-full text-center">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Card Front</span>
          <CardFront
            labName={labName}
            labLogo={labLogo}
            patientName={patientName}
            doctorName={doctorName}
            date={date}
            materialType={materialType}
            jobId={jobId}
            warrantyYears={warrantyYears}
            cardBgImage={cardBgImage}
          />
        </div>
        <div className="flex flex-col gap-1 w-full text-center">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Card Back</span>
          <CardBack
            jobId={jobId}
            signature={signature}
            labPhone={labPhone}
            labEmail={labEmail}
            labWebsite={labWebsite}
            labAddress={labAddress}
            cardBgImage={cardBgImage}
          />
        </div>
      </div>

      {/* Manual flip trigger for desktop */}
      <Button
        variant="outline"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          handleFlip();
        }}
        className="hidden md:flex gap-2 items-center bg-white/50 dark:bg-slate-900/50"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Flip Card View
      </Button>
    </div>
  );
}
