"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { ShieldX, Clock, Ban, Mail, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Dictionary } from "@/lib/i18n";

type ReasonKey = "suspended" | "expired" | "pending";

interface UnauthorizedClientProps {
  lang: string;
  loginPath: string;
  dashboardPath: string;
  dict: Dictionary["unauthorized"];
}

function UnauthorizedContent({ lang, loginPath, dashboardPath, dict }: UnauthorizedClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reasonParam = searchParams.get("reason") ?? "pending";
  const reason = (["suspended", "expired", "pending"].includes(reasonParam)
    ? reasonParam
    : "pending") as ReasonKey;

  const configs: Record<ReasonKey, { icon: React.ElementType; iconColor: string; iconBg: string; title: string; description: string }> = {
    suspended: {
      icon: Ban,
      iconColor: "var(--destructive)",
      iconBg: "rgba(239,68,68,0.1)",
      title: dict.suspendedTitle,
      description: dict.suspendedMessage,
    },
    expired: {
      icon: Clock,
      iconColor: "var(--warning)",
      iconBg: "rgba(217,119,6,0.1)",
      title: dict.expiredTitle,
      description: dict.expiredMessage,
    },
    pending: {
      icon: ShieldX,
      iconColor: "var(--brand)",
      iconBg: "rgba(37,99,235,0.1)",
      title: dict.pendingTitle,
      description: dict.pendingMessage,
    },
  };

  const config = configs[reason];
  const { icon: Icon, iconColor, iconBg, title, description } = config;

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(loginPath);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "var(--background)" }}
    >
      <div className="max-w-md w-full space-y-6 text-center">
        {/* Icon */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
          style={{ background: iconBg }}
        >
          <Icon size={36} style={{ color: iconColor }} />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
            {title}
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            {description}
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <a
            href="mailto:support@passboard.com"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium"
            style={{ background: "var(--brand)", color: "var(--brand-foreground)" }}
          >
            <Mail size={16} />
            {lang === "ar" ? "تواصل مع الدعم" : "Contact Support"}
          </a>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium border"
            style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
          >
            <LogOut size={16} />
            {dict.signOut}
          </button>
        </div>

        {/* Back link for pending status */}
        {reason === "pending" && (
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            <Link
              href={dashboardPath}
              className="font-medium underline"
              style={{ color: "var(--brand)" }}
            >
              {lang === "ar" ? "الذهاب إلى لوحة التحكم" : "Go to Dashboard"}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

export default function UnauthorizedClient(props: UnauthorizedClientProps) {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: "var(--background)" }}
        >
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "var(--brand)" }}
          />
        </div>
      }
    >
      <UnauthorizedContent {...props} />
    </Suspense>
  );
}
