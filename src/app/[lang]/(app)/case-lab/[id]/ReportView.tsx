"use client";

import Link from "next/link";
import { AlertTriangle, BookOpen, CheckCircle2, HelpCircle, FlaskConical, Download } from "lucide-react";
import { localePath } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n";
import type { AnalysisResult, DifferentialItem } from "../new/NewCaseWizard";

const URGENCY_COLOR: Record<string, string> = {
  emergency: "var(--destructive)",
  urgent: "#f97316",
  routine: "var(--success, #22c55e)",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border p-4 space-y-2" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
      <h3 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{title}</h3>
      {children}
    </section>
  );
}

function Pill({ text, color }: { text: string; color: string }) {
  return (
    <span className="inline-block rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: color + "20", color }}>
      {text}
    </span>
  );
}

function DiffCard({ item, dict }: { item: DifferentialItem; dict: Dictionary["caseLab"] }) {
  const pct = Math.round(item.probability * 100);
  return (
    <div className="rounded-lg border p-3 space-y-1.5" style={{ borderColor: "var(--border)" }}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="font-medium text-sm" style={{ color: "var(--foreground)" }}>{item.condition}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            {dict.agreement}: {Math.round(item.probability * 3)}/3
          </span>
          <Pill
            text={`${pct}%`}
            color={pct >= 70 ? "var(--success, #22c55e)" : pct >= 40 ? "#f97316" : "var(--muted-foreground)"}
          />
        </div>
      </div>
      {item.for.length > 0 && (
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          <span className="font-medium" style={{ color: "var(--foreground)" }}>For: </span>
          {item.for.join(" · ")}
        </p>
      )}
      {item.against.length > 0 && (
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          <span className="font-medium" style={{ color: "var(--foreground)" }}>Against: </span>
          {item.against.join(" · ")}
        </p>
      )}
      {item.fp_lookalikes.length > 0 && (
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          <span className="font-medium" style={{ color: "var(--foreground)" }}>FP risk: </span>
          {item.fp_lookalikes.join(", ")} — {item.discriminator}
        </p>
      )}
    </div>
  );
}

export default function ReportView({
  analysis,
  caseId,
  dict,
  lang,
  onFeedback,
}: {
  analysis: AnalysisResult;
  caseId: string;
  dict: Dictionary["caseLab"];
  lang: string;
  onFeedback?: () => void;
}) {
  const urgencyColor = URGENCY_COLOR[analysis.urgency?.level] ?? "var(--muted-foreground)";

  return (
    <div className="space-y-4">
      {/* disclaimer */}
      <div className="rounded-lg px-4 py-2 text-xs font-medium" style={{ background: "#f97316" + "20", color: "#f97316" }}>
        ⚠ {dict.disclaimer}
      </div>

      {/* abstain */}
      {analysis.abstain && (
        <div className="rounded-xl border px-4 py-3 flex gap-3" style={{ borderColor: "var(--destructive)", background: "var(--destructive)" + "10" }}>
          <AlertTriangle size={18} style={{ color: "var(--destructive)" }} className="shrink-0 mt-0.5" />
          <p className="text-sm" style={{ color: "var(--destructive)" }}>{dict.abstained}</p>
        </div>
      )}

      {/* urgency */}
      {analysis.urgency && (
        <div
          className="rounded-xl border px-4 py-3 flex items-start gap-3"
          style={{ borderColor: urgencyColor, background: urgencyColor + "15" }}
        >
          <AlertTriangle size={18} style={{ color: urgencyColor }} className="shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold uppercase" style={{ color: urgencyColor }}>
              {analysis.urgency.level}
            </p>
            {analysis.urgency.triggers?.length > 0 && (
              <p className="text-xs mt-0.5" style={{ color: urgencyColor }}>
                {analysis.urgency.triggers.join(" · ")}
              </p>
            )}
          </div>
        </div>
      )}

      {/* image findings */}
      {analysis.findings && (
        <Section title={dict.imageFindings}>
          {Object.entries(analysis.findings).map(([k, v]) => (
            <p key={k} className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              <span className="font-medium capitalize" style={{ color: "var(--foreground)" }}>{k}: </span>
              {String(v)}
            </p>
          ))}
        </Section>
      )}

      {/* problem representation */}
      {analysis.problem_representation && (
        <Section title={dict.caseSummary}>
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            {analysis.problem_representation}
          </p>
        </Section>
      )}

      {/* differential */}
      {analysis.differential?.length > 0 && (
        <Section title={dict.differential}>
          <div className="space-y-2">
            {analysis.differential.map((item, i) => (
              <DiffCard key={i} item={item} dict={dict} />
            ))}
          </div>
        </Section>
      )}

      {/* can't miss */}
      {analysis.cant_miss?.length > 0 && (
        <Section title={dict.cantMiss}>
          {analysis.cant_miss.map((cm, i) => (
            <div key={i} className="flex gap-2 text-sm">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" style={{ color: "var(--destructive)" }} />
              <span style={{ color: "var(--foreground)" }}>
                <span className="font-medium">{cm.condition}</span>
                {cm.action && <span style={{ color: "var(--muted-foreground)" }}> — {cm.action}</span>}
              </span>
            </div>
          ))}
        </Section>
      )}

      {/* missing info */}
      {analysis.missing_information?.length > 0 && (
        <Section title={dict.missingInfo}>
          <ul className="space-y-1">
            {analysis.missing_information.map((m, i) => (
              <li key={i} className="flex gap-2 text-xs" style={{ color: "var(--muted-foreground)" }}>
                <HelpCircle size={13} className="shrink-0 mt-0.5" />
                {m}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* workup */}
      {analysis.workup?.length > 0 && (
        <Section title={dict.workup}>
          <ol className="list-decimal list-inside space-y-1">
            {analysis.workup.map((w, i) => (
              <li key={i} className="text-xs" style={{ color: "var(--muted-foreground)" }}>{w}</li>
            ))}
          </ol>
        </Section>
      )}

      {/* management */}
      {analysis.management_direction?.length > 0 && (
        <Section title={dict.management}>
          <ul className="space-y-1">
            {analysis.management_direction.map((m, i) => (
              <li key={i} className="flex gap-2 text-xs" style={{ color: "var(--muted-foreground)" }}>
                <CheckCircle2 size={13} className="shrink-0 mt-0.5" style={{ color: "var(--success, #22c55e)" }} />
                {m}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* learning */}
      {analysis.learning && (
        <Section title={dict.learning}>
          {analysis.learning.discriminating_features?.length > 0 && (
            <div className="space-y-1">
              {analysis.learning.discriminating_features.map((f, i) => (
                <p key={i} className="text-xs flex gap-2" style={{ color: "var(--muted-foreground)" }}>
                  <BookOpen size={13} className="shrink-0 mt-0.5" />
                  {f}
                </p>
              ))}
            </div>
          )}
          {analysis.learning.exam_tips?.length > 0 && (
            <div className="mt-2 space-y-1">
              {analysis.learning.exam_tips.map((t, i) => (
                <p key={i} className="text-xs italic" style={{ color: "var(--muted-foreground)" }}>💡 {t}</p>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* actions */}
      <div className="flex flex-wrap gap-3 pt-2">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm border"
          style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
        >
          <Download size={15} />
          {dict.exportPdf}
        </button>
        <Link
          href={localePath(lang, `/tutor`)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm border"
          style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
        >
          <FlaskConical size={15} />
          {dict.askTutor}
        </Link>
        {onFeedback ? (
          <button
            onClick={onFeedback}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ms-auto"
            style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}
          >
            {dict.feedbackTitle} →
          </button>
        ) : (
          <Link
            href={localePath(lang, `/case-lab/${caseId}/feedback`)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ms-auto"
            style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}
          >
            {dict.feedbackTitle} →
          </Link>
        )}
      </div>
    </div>
  );
}
