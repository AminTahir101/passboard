"use client";

import type { Dictionary } from "@/lib/i18n";
import type { WizardState, HistoryForm } from "../NewCaseWizard";

type Props = {
  dict: Dictionary["caseLab"];
  lang: string;
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
  next: () => void;
  back: () => void;
};

function Field({
  label,
  value,
  onChange,
  placeholder,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
}) {
  const base = {
    borderColor: "var(--border)",
    background: "var(--background)",
    color: "var(--foreground)",
  };
  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </label>
      {textarea ? (
        <textarea
          rows={2}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border text-sm px-3 py-2 resize-none"
          style={base}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border text-sm px-3 py-2"
          style={base}
        />
      )}
    </div>
  );
}

const SEX_OPTIONS = ["male", "female", "other", "unknown"];
const AGE_RANGES = ["<2", "2–12", "13–17", "18–30", "31–45", "46–60", "61–75", "76+"];
const FITZPATRICK = ["1", "2", "3", "4", "5", "6"];

export default function HistoryFormStep({ dict, state, update, next, back }: Props) {
  function set(key: keyof HistoryForm, value: string) {
    update({ history: { ...state.history, [key]: value } });
  }

  async function handleNext() {
    // Persist history to case
    await fetch(`/api/case-lab/cases/${state.caseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chief_complaint: state.history.chiefComplaint,
        history_json: state.history,
        status: "images_uploaded",
      }),
    });
    next();
  }

  const h = state.history;

  return (
    <div className="rounded-xl border p-6 space-y-4" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
      <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>{dict.step3Title}</h2>

      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
          {dict.demographics}
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>{dict.ageRange}</label>
            <select
              value={h.ageRange}
              onChange={(e) => set("ageRange", e.target.value)}
              className="w-full rounded-lg border text-sm px-3 py-2"
              style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--foreground)" }}
            >
              <option value="">—</option>
              {AGE_RANGES.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>{dict.sex}</label>
            <select
              value={h.sex}
              onChange={(e) => set("sex", e.target.value)}
              className="w-full rounded-lg border text-sm px-3 py-2"
              style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--foreground)" }}
            >
              <option value="">—</option>
              {SEX_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>{dict.fitzpatrick}</label>
            <select
              value={h.fitzpatrick}
              onChange={(e) => set("fitzpatrick", e.target.value)}
              className="w-full rounded-lg border text-sm px-3 py-2"
              style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--foreground)" }}
            >
              <option value="">—</option>
              {FITZPATRICK.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
          {dict.chiefComplaint}
        </p>
        <Field label={dict.chiefComplaint} value={h.chiefComplaint} onChange={(v) => set("chiefComplaint", v)} />
        <div className="grid grid-cols-2 gap-3">
          <Field label={dict.onset} value={h.onset} onChange={(v) => set("onset", v)} />
          <Field label={dict.duration} value={h.duration} onChange={(v) => set("duration", v)} />
        </div>
        <Field label={dict.progression} value={h.progression} onChange={(v) => set("progression", v)} textarea />
        <Field label={dict.symptoms} value={h.symptoms} onChange={(v) => set("symptoms", v)} textarea />
        <Field label={dict.triggers} value={h.triggers} onChange={(v) => set("triggers", v)} />
      </section>

      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
          {dict.systemicSymptoms}
        </p>
        <Field label={dict.systemicSymptoms} value={h.systemicSymptoms} onChange={(v) => set("systemicSymptoms", v)} textarea />
      </section>

      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
          Background
        </p>
        <Field label={dict.medications} value={h.medications} onChange={(v) => set("medications", v)} textarea />
        <Field label={dict.allergies} value={h.allergies} onChange={(v) => set("allergies", v)} />
        <Field label={dict.pastHistory} value={h.pastHistory} onChange={(v) => set("pastHistory", v)} textarea />
        <Field label={dict.priorInvestigations} value={h.priorInvestigations} onChange={(v) => set("priorInvestigations", v)} textarea />
      </section>

      <div className="flex justify-between pt-2">
        <button onClick={back} className="px-4 py-2 text-sm rounded-lg" style={{ color: "var(--muted-foreground)" }}>
          ← {dict.step2Title}
        </button>
        <button
          onClick={handleNext}
          disabled={!h.chiefComplaint}
          className="px-4 py-2 text-sm font-medium rounded-lg"
          style={{
            background: "var(--accent)", color: "var(--accent-foreground)",
            opacity: h.chiefComplaint ? 1 : 0.4,
          }}
        >
          {dict.step4Title} →
        </button>
      </div>
    </div>
  );
}
