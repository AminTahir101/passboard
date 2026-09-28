import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Moraje3 — AI-Powered Medical Exam Preparation",
  description:
    "Moraje3 is an independent AI-powered platform for professional medical licensing exam preparation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
