"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface QRCodeImageProps {
  value: string;
  size?: number;
}

export function QRCodeImage({ value, size = 90 }: QRCodeImageProps) {
  const [qrUrl, setQrUrl] = useState<string>("");

  useEffect(() => {
    if (!value) return;
    QRCode.toDataURL(value, {
      width: size,
      margin: 1,
      color: {
        dark: "#031430", // deep metallic blue dark bits
        light: "#ffffff",
      },
    })
      .then((url) => setQrUrl(url))
      .catch((err) => console.error("QR Code Error:", err));
  }, [value, size]);

  if (!qrUrl) {
    return (
      <div 
        style={{ width: size, height: size }} 
        className="bg-slate-100 dark:bg-slate-900 animate-pulse rounded border border-slate-200 dark:border-slate-800" 
      />
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img 
      src={qrUrl} 
      alt="Verification QR Code" 
      width={size} 
      height={size} 
      className="rounded border border-slate-200/50 dark:border-slate-850/50 shrink-0" 
    />
  );
}
