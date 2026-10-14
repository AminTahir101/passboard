"use client";

import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import type { Dictionary } from "@/lib/i18n";
import type { WizardState } from "../NewCaseWizard";

type Props = {
  dict: Dictionary["caseLab"];
  lang: string;
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
  next: () => void;
  back: () => void;
};

export default function ConsentStep({ dict, update, next }: Props) {
  const [agreed, setAgreed] = useState(false);

  async function handleNext() {
    if (!agreed) return;
    const res = await fetch("/api/case-lab/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ consent_at: new Date().toISOString() }),
    });
    if (!res.ok) return;
    const { id } = await res.json();
    update({ caseId: id });
    next();
  }

  return (
    <div
      className="rounded-xl border p-6"
      style={{ borderColor: "var(--border)", background: "var(--card)" }}
    >
      <div className="flex items-start gap-3 mb-4">
        <ShieldAlert size={24} style={{ color: "var(--destructive)" }} className="shrink-0 mt-0.5" />
        <div>
          <h2 className="text-base font-semibold mb-2" style={{ color: "var(--foreground)" }}>
            {dict.consentHeading}
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            {dict.consentBody}
          </p>
        </div>
      </div>

      <label className="flex items-start gap-3 cursor-pointer mt-4">
        <input
          type="checkbox"
          className="mt-0.5"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
        />
        <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
          {dict.consentAgree}
        </span>
      </label>

      <button
        onClick={handleNext}
        disabled={!agreed}
        className="mt-6 w-full py-2.5 rounded-lg text-sm font-medium transition-opacity"
        style={{
          background: "var(--accent)",
          color: "var(--accent-foreground)",
          opacity: agreed ? 1 : 0.4,
          cursor: agreed ? "pointer" : "not-allowed",
        }}
      >
        {dict.step2Title} →
      </button>
    </div>
  );
}
