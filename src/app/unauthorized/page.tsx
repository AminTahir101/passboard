"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { ShieldX, Clock, Ban, Mail, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type ReasonKey = "suspended" | "expired" | "pending";

const REASON_CONFIG: Record<
  ReasonKey,
  {
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
    title: string;
    description: string;
    suggestion: string;
  }
> = {
  suspended: {
    icon: Ban,
    iconColor: "var(--destructive)",
    iconBg: "rgba(239,68,68,0.1)",
    title: "Account Suspended",
    description:
      "Your account has been suspended. This may be due to a violation of our terms of service or an administrative action.",
    suggestion: "Please contact support to resolve this issue and restore your access.",
  },
  expired: {
    icon: Clock,
    iconColor: "var(--warning)",
    iconBg: "rgba(217,119,6,0.1)",
    title: "Access Expired",
    description:
      "Your access period has ended. Your exam preparation data is safe and will be available once you renew.",
    suggestion: "Please contact us to renew your access and continue your preparation.",
  },
  pending: {
    icon: ShieldX,
    iconColor: "var(--brand)",
    iconBg: "rgba(37,99,235,0.1)",
    title: "Access Pending",
    description:
      "Your account is currently pending activation. We will review your access request shortly.",
    suggestion:
      "If you have recently registered or made a payment, please allow up to 24 hours for activation. Contact support if you need immediate assistance.",
  },
};

function UnauthorizedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reasonParam = searchParams.get("reason") ?? "pending";
  const reason = (["suspended", "expired", "pending"].includes(reasonParam)
    ? reasonParam
    : "pending") as ReasonKey;

  const config = REASON_CONFIG[reason];
  const { icon: Icon, iconColor, iconBg, title, description, suggestion } = config;

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
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

        {/* Suggestion card */}
        <div
          className="rounded-xl border p-4 text-left"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <p className="text-sm" style={{ color: "var(--foreground)" }}>
            {suggestion}
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <a
            href="mailto:support@moraje3.com"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium"
            style={{ background: "var(--brand)", color: "var(--brand-foreground)" }}
          >
            <Mail size={16} />
            Contact Support
          </a>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium border"
            style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>

        {/* Back link for pending status */}
        {reason === "pending" && (
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            Already activated?{" "}
            <Link
              href="/dashboard"
              className="font-medium underline"
              style={{ color: "var(--brand)" }}
            >
              Try accessing the dashboard
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

export default function UnauthorizedPage() {
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
      <UnauthorizedContent />
    </Suspense>
  );
}
