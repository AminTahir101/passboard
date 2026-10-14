"use client";

import { useState } from "react";
import { PenLine } from "lucide-react";
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

export default function CommitFirstStep({ dict, state, update, next, back }: Props) {
  const [text, setText] = useState(state.studentDifferential);

  function handleNext() {
    update({ studentDifferential: text });
    next();
  }

  return (
    <div className="rounded-xl border p-6 space-y-4" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
      <div className="flex items-start gap-3">
        <PenLine size={20} style={{ color: "var(--accent)" }} className="shrink-0 mt-0.5" />
        <div>
          <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
            {dict.commitHeading}
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            {dict.commitBody}
          </p>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>
          {dict.yourDifferential}
        </label>
        <textarea
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={dict.commitPlaceholder}
          className="w-full rounded-lg border text-sm px-3 py-2 resize-none"
          style={{
            borderColor: "var(--border)",
            background: "var(--background)",
            color: "var(--foreground)",
          }}
        />
      </div>

      <div className="flex justify-between pt-2">
        <button onClick={back} className="px-4 py-2 text-sm rounded-lg" style={{ color: "var(--muted-foreground)" }}>
          ← {dict.step4Title}
        </button>
        <button
          onClick={handleNext}
          disabled={text.trim().length < 10}
          className="px-4 py-2 text-sm font-medium rounded-lg"
          style={{
            background: "var(--accent)",
            color: "var(--accent-foreground)",
            opacity: text.trim().length >= 10 ? 1 : 0.4,
          }}
        >
          {dict.revealAI}
        </button>
      </div>
    </div>
  );
}
