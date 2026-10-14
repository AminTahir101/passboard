"use client";

import type { Dictionary } from "@/lib/i18n";
import type { WizardState } from "../NewCaseWizard";
import ReportView from "../../[id]/ReportView";

type Props = {
  dict: Dictionary["caseLab"];
  lang: string;
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
  next: () => void;
  back: () => void;
  onDone: () => void;
};

export default function ReportStep({ dict, lang, state, onDone }: Props) {
  if (!state.analysisResult) {
    return (
      <div className="text-center py-12" style={{ color: "var(--muted-foreground)" }}>
        No analysis result yet.
      </div>
    );
  }

  return (
    <ReportView
      analysis={state.analysisResult}
      caseId={state.caseId!}
      dict={dict}
      lang={lang}
      onFeedback={onDone}
    />
  );
}
