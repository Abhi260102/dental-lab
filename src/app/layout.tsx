import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import NextTopLoader from "nextjs-toploader";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "32 Dental Design | Warranty Card Management",
  description: "Enterprise-grade 32 Dental Designoratory warranty certificate generation, verification, and analytics platform. Create premium printable and downloadable smart cards.",
  keywords: ["32 Dental Design", "warranty card", "crown warranty", "dentist certificate", "dentistry logs", "dental restoration"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans selection:bg-dent-blue-500 selection:text-white">
        <NextTopLoader
          color="#0f52ba"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #0f52ba,0 0 5px #0f52ba"
        />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
