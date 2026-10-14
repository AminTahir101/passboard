"use client";

import Link from "next/link";
import { FlaskConical, Plus, Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { localePath } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n";

type CaseRow = {
  id: string;
  status: string;
  chief_complaint: string | null;
  created_at: string;
  updated_at: string;
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  done: <CheckCircle2 size={14} style={{ color: "var(--success, #22c55e)" }} />,
  failed: <AlertCircle size={14} style={{ color: "var(--destructive)" }} />,
  analyzing: <Loader2 size={14} className="animate-spin" style={{ color: "var(--accent)" }} />,
};

function statusIcon(status: string) {
  return STATUS_ICON[status] ?? <Clock size={14} style={{ color: "var(--muted-foreground)" }} />;
}

export default function CaseLabClient({
  cases,
  dict,
  lang,
}: {
  cases: CaseRow[];
  dict: Dictionary["caseLab"];
  lang: string;
}) {
  return (
    <div className="max-w-3xl mx-auto">
      {/* header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FlaskConical size={20} style={{ color: "var(--accent)" }} />
            <h1 className="text-xl font-bold" style={{ color: "var(--foreground)" }}>
              {dict.title}
            </h1>
          </div>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            {dict.subtitle}
          </p>
        </div>
        <Link
          href={localePath(lang, "/case-lab/new")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}
        >
          <Plus size={15} />
          {dict.newCase}
        </Link>
      </div>

      {/* disclaimer */}
      <div
        className="rounded-lg px-4 py-3 mb-6 text-xs"
        style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
      >
        ⚠ {dict.disclaimer}
      </div>

      {/* case list */}
      {cases.length === 0 ? (
        <div
          className="rounded-xl border p-12 text-center"
          style={{ borderColor: "var(--border)", background: "var(--card)" }}
        >
          <FlaskConical size={40} className="mx-auto mb-3" style={{ color: "var(--muted-foreground)" }} />
          <p className="font-medium mb-1" style={{ color: "var(--foreground)" }}>{dict.noCases}</p>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>{dict.noCasesDesc}</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {cases.map((c) => (
            <li key={c.id}>
              <Link
                href={localePath(lang, `/case-lab/${c.id}`)}
                className="flex items-center justify-between rounded-xl border px-4 py-3 transition-colors"
                style={{ borderColor: "var(--border)", background: "var(--card)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--muted)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "var(--card)")}
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                    {c.chief_complaint || "Case " + c.id.slice(0, 8)}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                    {new Date(c.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted-foreground)" }}>
                  {statusIcon(c.status)}
                  {dict.status[c.status as keyof typeof dict.status] ?? c.status}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
