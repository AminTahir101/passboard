"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Dictionary } from "@/lib/i18n";
import { localePath } from "@/lib/i18n";
import ConsentStep from "./steps/ConsentStep";
import ImageUploadStep from "./steps/ImageUploadStep";
import HistoryFormStep from "./steps/HistoryFormStep";
import DocumentUploadStep from "./steps/DocumentUploadStep";
import CommitFirstStep from "./steps/CommitFirstStep";
import AnalysisProgressStep from "./steps/AnalysisProgressStep";
import ReportStep from "./steps/ReportStep";

export type WizardState = {
  caseId: string | null;
  images: UploadedImage[];
  history: HistoryForm;
  documents: UploadedDocument[];
  studentDifferential: string;
  analysisResult: AnalysisResult | null;
};

export type UploadedImage = {
  file: File;
  preview: string;
  bodySite: string;
  view: "close-up" | "overview" | "other";
  qualityOk: boolean | null;
  qualityError: string | null;
  storageKey?: string;
};

export type HistoryForm = {
  ageRange: string;
  sex: string;
  fitzpatrick: string;
  chiefComplaint: string;
  onset: string;
  duration: string;
  progression: string;
  symptoms: string;
  triggers: string;
  systemicSymptoms: string;
  medications: string;
  allergies: string;
  pastHistory: string;
  priorInvestigations: string;
};

export type UploadedDocument = {
  file: File;
  storageKey?: string;
  extractedValues?: ExtractedValue[];
};

export type ExtractedValue = {
  id: string;
  name: string;
  value: string;
  unit: string;
  refRange: string;
  flag: string;
  confirmed: boolean;
};

export type AnalysisResult = {
  urgency: { level: string; triggers: string[] };
  image_quality: { pass: boolean; issues: string[] };
  findings: Record<string, string>;
  problem_representation: string;
  differential: DifferentialItem[];
  cant_miss: { condition: string; action: string }[];
  missing_information: string[];
  workup: string[];
  management_direction: string[];
  referral: { specialty: string | null; timeframe: string | null };
  learning: { discriminating_features: string[]; exam_tips: string[]; linked_question_categories: string[] };
  abstain: boolean;
  agreement: number;
  prompt_version: string;
};

export type DifferentialItem = {
  condition: string;
  icd10: string;
  probability: number;
  for: string[];
  against: string[];
  fp_lookalikes: string[];
  discriminator: string;
  cant_miss: boolean;
};

const EMPTY_HISTORY: HistoryForm = {
  ageRange: "", sex: "", fitzpatrick: "",
  chiefComplaint: "", onset: "", duration: "", progression: "",
  symptoms: "", triggers: "", systemicSymptoms: "",
  medications: "", allergies: "", pastHistory: "", priorInvestigations: "",
};

const STEP_TITLES_KEYS: (keyof Dictionary["caseLab"])[] = [
  "step1Title", "step2Title", "step3Title", "step4Title",
  "step5Title", "step6Title", "step7Title",
];

export default function NewCaseWizard({
  dict,
  lang,
}: {
  dict: Dictionary["caseLab"];
  lang: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0-indexed
  const [state, setState] = useState<WizardState>({
    caseId: null,
    images: [],
    history: EMPTY_HISTORY,
    documents: [],
    studentDifferential: "",
    analysisResult: null,
  });

  function next() { setStep((s) => Math.min(s + 1, 6)); }
  function back() { setStep((s) => Math.max(s - 1, 0)); }

  function update(patch: Partial<WizardState>) {
    setState((s) => ({ ...s, ...patch }));
  }

  const stepProps = { dict, lang, state, update, next, back };

  return (
    <div className="max-w-2xl mx-auto">
      {/* step indicator */}
      <div className="flex items-center gap-1.5 mb-6 overflow-x-auto pb-1">
        {STEP_TITLES_KEYS.map((key, i) => (
          <div key={i} className="flex items-center gap-1.5 shrink-0">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
              style={{
                background: i === step ? "var(--accent)" : i < step ? "var(--muted)" : "var(--muted)",
                color: i === step ? "var(--accent-foreground)" : "var(--muted-foreground)",
              }}
            >
              {i + 1}
            </div>
            <span
              className="text-xs hidden sm:block"
              style={{ color: i === step ? "var(--foreground)" : "var(--muted-foreground)" }}
            >
              {dict[key] as string}
            </span>
            {i < 6 && <span style={{ color: "var(--border)" }}>›</span>}
          </div>
        ))}
      </div>

      {/* disclaimer banner */}
      <div
        className="rounded-lg px-3 py-2 mb-5 text-xs"
        style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
      >
        ⚠ {dict.disclaimer}
      </div>

      {/* step content */}
      {step === 0 && <ConsentStep {...stepProps} />}
      {step === 1 && <ImageUploadStep {...stepProps} />}
      {step === 2 && <HistoryFormStep {...stepProps} />}
      {step === 3 && <DocumentUploadStep {...stepProps} />}
      {step === 4 && <CommitFirstStep {...stepProps} />}
      {step === 5 && <AnalysisProgressStep {...stepProps} />}
      {step === 6 && (
        <ReportStep
          {...stepProps}
          onDone={() => router.push(localePath(lang, `/case-lab/${state.caseId}`))}
        />
      )}
    </div>
  );
}
