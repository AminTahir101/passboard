// src/app/[lang]/not-found.tsx
import Link from "next/link";
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p style={{ color: "var(--muted-foreground)" }}>Page not found / الصفحة غير موجودة</p>
      <Link href="/" className="text-sm hover:underline" style={{ color: "var(--brand)" }}>Go home / العودة للرئيسية</Link>
    </div>
  );
}
