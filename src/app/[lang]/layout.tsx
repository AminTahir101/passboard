import type { Metadata } from "next";
import { Inter, Cairo } from "next/font/google";
import "@/app/globals.css";
import { getDictionary } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Moraje3 — AI-Powered Medical Exam Preparation",
  description: "Moraje3 is an independent AI-powered platform for professional medical licensing exam preparation.",
};

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const cairo = Cairo({ subsets: ["arabic", "latin"], variable: "--font-cairo", display: "swap" });

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
      className={`h-full ${inter.variable} ${cairo.variable}`}
    >
      <body
        className="min-h-full"
        style={{ fontFamily: isRtl ? "var(--font-cairo), sans-serif" : "var(--font-inter), sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
