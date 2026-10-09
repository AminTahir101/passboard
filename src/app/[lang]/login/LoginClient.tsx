"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Dictionary } from "@/lib/i18n";
import { localePath } from "@/lib/i18n";
import { Logo } from "@/components/landing/ui";

interface LoginClientProps {
  lang: string;
  homePath: string;
  requestAccessPath: string;
  dashboardPath: string;
  dict: Dictionary["login"];
}

export default function LoginClient({ lang, homePath, requestAccessPath, dashboardPath, dict }: LoginClientProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const body = await res.json();

      if (res.status === 429) {
        const mins = body.retryAfterSec ? Math.ceil(body.retryAfterSec / 60) : 15;
        setError(
          lang === "ar"
            ? `عدد كبير من المحاولات الفاشلة. يرجى الانتظار ${mins} دقيقة.`
            : `Too many failed attempts. Please wait ${mins} minute${mins !== 1 ? "s" : ""} before trying again.`
        );
        return;
      }

      if (res.status === 403) {
        setError(dict.error);
        return;
      }

      if (!res.ok) {
        setError(dict.error);
        return;
      }

      // Session cookies are set by the server — just navigate
      if (body.role === "admin") {
        router.push(localePath(lang, "/admin"));
      } else {
        router.push(dashboardPath);
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "var(--secondary)" }}
    >
      {/* Logo */}
      <Link href={homePath} className="mb-8 flex items-center gap-2.5 font-semibold text-xl tracking-tight">
        <Logo size={36} />
        <span style={{ fontFamily: "var(--font-newsreader), Georgia, serif" }}>Passboard</span>
      </Link>

      <div
        className="w-full max-w-sm rounded-xl border p-8 shadow-sm"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <h1 className="text-xl font-semibold mb-1">{dict.title}</h1>
        <p className="text-sm mb-6" style={{ color: "var(--muted-foreground)" }}>
          {dict.subtitle}
        </p>

        {error && (
          <div
            className="text-sm p-3 rounded-lg mb-4"
            style={{ background: "var(--destructive-muted)", color: "var(--destructive)", border: "1px solid var(--destructive-muted-border)" }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">{dict.emailLabel}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full px-3 py-2 text-sm rounded-lg border outline-none transition-colors"
              style={{
                background: "var(--background)",
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">{dict.passwordLabel}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm rounded-lg border outline-none transition-colors"
              style={{
                background: "var(--background)",
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            {loading ? dict.submit + "…" : dict.submit}
          </button>
        </form>
      </div>

      <p className="mt-6 text-sm" style={{ color: "var(--muted-foreground)" }}>
        <Link href={requestAccessPath} className="font-medium hover:underline" style={{ color: "var(--foreground)" }}>
          {lang === "ar" ? "طلب الوصول" : "Request Access"}
        </Link>
      </p>
    </div>
  );
}
