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
  layoutFront?: string;
  layoutBack?: string;
  fontStyle?: string;
  primaryColor?: string;
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
  layoutFront,
  layoutBack,
  fontStyle,
  primaryColor,
}: WarrantyCardPreviewProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full overflow-hidden">
      {/* Responsive Wrapper Container to reserve precise layout space in Safari and all browsers */}
      <div className="relative shrink-0 flex items-center justify-center w-[250px] h-[158px] min-[350px]:w-[275px] min-[350px]:h-[173px] min-[400px]:w-[350px] min-[400px]:h-[221px] min-[480px]:w-[400px] min-[480px]:h-[252px] sm:w-[450px] sm:h-[284px] md:w-[500px] md:h-[315px]">
        {/* 3D Flipping Card Container */}
        <div 
          onClick={handleFlip}
          className="absolute cursor-pointer perspective-1000 group shrink-0 w-[500px] h-[315px] scale-[0.5] min-[350px]:scale-[0.55] min-[400px]:scale-[0.7] min-[480px]:scale-[0.8] sm:scale-[0.9] md:scale-100 origin-center flex items-center justify-center"
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
                layoutFront={layoutFront}
                fontStyle={fontStyle}
                primaryColor={primaryColor}
                toothNumber={toothNumber}
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
                layoutBack={layoutBack}
                fontStyle={fontStyle}
                primaryColor={primaryColor}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Manual flip trigger */}
      <Button
        variant="outline"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          handleFlip();
        }}
        className="flex gap-2 items-center bg-white/50 dark:bg-slate-900/50"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Flip Card View
      </Button>
    </div>
  );
}
