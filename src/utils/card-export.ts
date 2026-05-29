import * as htmlToImage from "html-to-image";
import { jsPDF } from "jspdf";

export async function capturePng(element: HTMLElement): Promise<string> {
  return await htmlToImage.toPng(element, {
    quality: 1.0,
    pixelRatio: 2, // Double pixel density for crisp high-resolution printing
    style: {
      transform: "none",
      boxShadow: "none",
    }
  });
}

export async function captureJpeg(element: HTMLElement): Promise<string> {
  return await htmlToImage.toJpeg(element, {
    quality: 0.95,
    pixelRatio: 2,
    style: {
      transform: "none",
      boxShadow: "none",
    }
  });
}

export async function downloadImage(element: HTMLElement, filename: string, type: "png" | "jpeg" = "png") {
  const dataUrl = type === "png"
    ? await capturePng(element)
    : await captureJpeg(element);

  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

export async function downloadPdf(frontElement: HTMLElement, backElement: HTMLElement, filename: string) {
  const frontData = await capturePng(frontElement);
  const backData = await capturePng(backElement);

  // Landscape A4 PDF document
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  // Header Title
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(15, 82, 186); // Sapphire blue primary
  pdf.text("32 Dental Design Warranty Certificate", 20, 25);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(120, 120, 120);
  pdf.text(`Exported: ${new Date().toLocaleDateString()} | Lab Verification Document`, 20, 31);

  // Add Front Card (x, y, width, height) - keep standard 1.58 credit card ratio
  pdf.addImage(frontData, "PNG", 20, 45, 120, 75.9);

  // Add Back Card
  pdf.addImage(backData, "PNG", 155, 45, 120, 75.9);

  // Verification instructions footer
  pdf.setFontSize(8);
  pdf.setTextColor(140, 140, 140);
  pdf.text("* This document is an official 32 Dental Designoratory warranty. Scan the QR code to verify validity online.", 20, 135);

  pdf.save(filename);
}
