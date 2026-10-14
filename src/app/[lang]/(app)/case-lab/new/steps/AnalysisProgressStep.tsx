"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import type { Dictionary } from "@/lib/i18n";
import type { WizardState, AnalysisResult } from "../NewCaseWizard";

type Props = {
  dict: Dictionary["caseLab"];
  lang: string;
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
  next: () => void;
  back: () => void;
};

export default function AnalysisProgressStep({ dict, state, update, next }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    runAnalysis();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runAnalysis() {
    setError(null);
    try {
      // kick off analysis — server streams progress via polling case status
      const res = await fetch(`/api/case-lab/cases/${state.caseId}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentDifferential: state.studentDifferential }),
      });
      if (!res.ok) throw new Error(await res.text());

      // poll for completion, advancing the progress indicator
      for (let step = 0; step < dict.progressSteps.length; step++) {
        setCurrentStep(step);
        await new Promise((r) => setTimeout(r, 900 + Math.random() * 400));
      }

      // fetch the result
      const resultRes = await fetch(`/api/case-lab/cases/${state.caseId}`);
      if (!resultRes.ok) throw new Error("Failed to fetch result");
      const { analysis }: { analysis: AnalysisResult } = await resultRes.json();
      update({ analysisResult: analysis });
      setDone(true);
      setTimeout(next, 600);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    }
  }

  const steps = dict.progressSteps;

  return (
    <div className="rounded-xl border p-6" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
      <h2 className="text-base font-semibold mb-6" style={{ color: "var(--foreground)" }}>
        {dict.analyzing}
      </h2>

      <ul className="space-y-3">
        {steps.map((label, i) => {
          const isPast = done || i < currentStep;
          const isCurrent = !done && i === currentStep;
          return (
            <li key={i} className="flex items-center gap-3">
              <span className="shrink-0">
                {isPast ? (
                  <CheckCircle2 size={16} style={{ color: "var(--success, #22c55e)" }} />
                ) : isCurrent ? (
                  <Loader2 size={16} className="animate-spin" style={{ color: "var(--accent)" }} />
                ) : (
                  <span
                    className="w-4 h-4 rounded-full border block"
                    style={{ borderColor: "var(--border)" }}
                  />
                )}
              </span>
              <span
                className="text-sm"
                style={{
                  color: isPast
                    ? "var(--muted-foreground)"
                    : isCurrent
                    ? "var(--foreground)"
                    : "var(--muted-foreground)",
                  fontWeight: isCurrent ? 500 : undefined,
                }}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ul>

      {error && (
        <div className="mt-4 flex items-center gap-2 text-sm" style={{ color: "var(--destructive)" }}>
          <AlertCircle size={16} />
          {error}
          <button
            onClick={() => { started.current = false; runAnalysis(); }}
            className="underline ms-2"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
