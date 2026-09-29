"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Dictionary } from "@/lib/i18n";

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
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(dict.error);
        return;
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, access_status, access_expires_at")
          .eq("id", data.user.id)
          .single();

        if (profile?.role === "admin") {
          router.push("/admin");
          return;
        }

        if (profile?.access_status === "suspended") {
          await supabase.auth.signOut();
          setError(dict.error);
          return;
        }

        if (
          profile?.access_status === "expired" ||
          (profile?.access_expires_at && new Date(profile.access_expires_at) < new Date())
        ) {
          await supabase.auth.signOut();
          setError(dict.error);
          return;
        }

        if (profile?.access_status !== "active") {
          await supabase.auth.signOut();
          setError(dict.error);
          return;
        }

        router.push(dashboardPath);
        router.refresh();
      }
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
      <Link href={homePath} className="mb-8 font-semibold text-xl tracking-tight">
        Moraje3
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
            style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}
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
