import * as htmlToImage from "html-to-image";
import { jsPDF } from "jspdf";
import JSZip from "jszip";

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

export async function downloadAllAsZip(
  cards: any[],
  renderCardFn: (card: any, side: "front" | "back") => HTMLElement
) {
  const zip = new JSZip();
  const folder = zip.folder("dental_warranty_cards");

  if (!folder) throw new Error("Could not create ZIP folder");

  // Show a notification or log since capturing many cards takes time
  console.log(`Starting ZIP compilation for ${cards.length} cards...`);

  for (const card of cards) {
    const frontEl = renderCardFn(card, "front");
    const backEl = renderCardFn(card, "back");

    // Temporarily mount to offscreen DOM
    frontEl.style.position = "fixed";
    frontEl.style.top = "-9999px";
    backEl.style.position = "fixed";
    backEl.style.top = "-9999px";

    document.body.appendChild(frontEl);
    document.body.appendChild(backEl);

    // Wait a brief tick to let elements render completely
    await new Promise((resolve) => setTimeout(resolve, 50));

    try {
      const frontData = await htmlToImage.toPng(frontEl, { quality: 0.9, pixelRatio: 1.5 });
      const backData = await htmlToImage.toPng(backEl, { quality: 0.9, pixelRatio: 1.5 });

      const frontBase64 = frontData.split(",")[1];
      const backBase64 = backData.split(",")[1];

      folder.file(`${card.jobId}_front.png`, frontBase64, { base64: true });
      folder.file(`${card.jobId}_back.png`, backBase64, { base64: true });
    } catch (e) {
      console.error("ZIP card capture failed for ID:", card.jobId, e);
    } finally {
      document.body.removeChild(frontEl);
      document.body.removeChild(backEl);
    }
  }

  const content = await zip.generateAsync({ type: "blob" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(content);
  link.download = `dental_warranty_cards_${new Date().toISOString().split("T")[0]}.zip`;
  link.click();
}
