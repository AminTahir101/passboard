import type { Metadata } from "next";
import { Almarai, Cormorant_Garamond, IBM_Plex_Mono, IBM_Plex_Sans, IBM_Plex_Sans_Arabic, Instrument_Sans, Newsreader } from "next/font/google";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Passboard — AI-Powered Medical Exam Preparation",
  description: "Passboard is an independent AI-powered platform for professional medical licensing exam preparation.",
};

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});
const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-instrument",
  display: "swap",
});
const almarai = Almarai({
  weight: ["300", "400", "700", "800"],
  subsets: ["arabic"],
  variable: "--font-almarai",
  display: "swap",
});
const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500"],
  variable: "--font-newsreader",
  display: "swap",
});
const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans",
  display: "swap",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});
const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-arabic",
  display: "swap",
});

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const isRtl = lang === "ar";

  return (
    <html
      lang={lang}
      dir={isRtl ? "rtl" : "ltr"}
      className={`h-full ${almarai.variable} ${newsreader.variable} ${plexSans.variable} ${plexMono.variable} ${plexArabic.variable} ${cormorant.variable} ${instrumentSans.variable}`}
    >
      <body className="min-h-full font-sans">
        {children}
      </body>
    </html>
  );
}
