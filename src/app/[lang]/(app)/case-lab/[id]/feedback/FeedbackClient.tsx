"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, MinusCircle, XCircle, Loader2 } from "lucide-react";
import { localePath } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n";

type Verdict = "correct" | "partial" | "wrong";

export default function FeedbackClient({
  caseId,
  dict,
  lang,
}: {
  caseId: string;
  dict: Dictionary["caseLab"];
  lang: string;
}) {
  const router = useRouter();
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [finalDiagnosis, setFinalDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const options: { key: Verdict; label: string; icon: React.ReactNode; color: string }[] = [
    { key: "correct", label: dict.verdictCorrect, icon: <CheckCircle2 size={18} />, color: "var(--success, #22c55e)" },
    { key: "partial", label: dict.verdictPartial, icon: <MinusCircle size={18} />, color: "#f97316" },
    { key: "wrong", label: dict.verdictWrong, icon: <XCircle size={18} />, color: "var(--destructive)" },
  ];

  async function submit() {
    if (!verdict) return;
    setLoading(true);
    await fetch(`/api/case-lab/cases/${caseId}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verdict, finalDiagnosis, notes }),
    });
    setLoading(false);
    router.push(localePath(lang, "/case-lab"));
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="rounded-xl border p-6 space-y-6" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
        <h1 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>
          {dict.feedbackTitle}
        </h1>

        <div className="grid grid-cols-3 gap-3">
          {options.map(({ key, label, icon, color }) => (
            <button
              key={key}
              onClick={() => setVerdict(key)}
              className="flex flex-col items-center gap-2 rounded-xl border py-4 text-xs font-medium transition-colors"
              style={{
                borderColor: verdict === key ? color : "var(--border)",
                background: verdict === key ? color + "15" : "transparent",
                color: verdict === key ? color : "var(--muted-foreground)",
              }}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>
            {dict.finalDiagnosis}
          </label>
          <input
            type="text"
            value={finalDiagnosis}
            onChange={(e) => setFinalDiagnosis(e.target.value)}
            className="w-full rounded-lg border text-sm px-3 py-2"
            style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--foreground)" }}
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: "var(--muted-foreground)" }}>Notes</label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border text-sm px-3 py-2 resize-none"
            style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--foreground)" }}
          />
        </div>

        <button
          onClick={submit}
          disabled={!verdict || loading}
          className="w-full py-2.5 rounded-lg text-sm font-medium"
          style={{
            background: "var(--accent)",
            color: "var(--accent-foreground)",
            opacity: verdict && !loading ? 1 : 0.4,
          }}
        >
          {loading ? <Loader2 size={14} className="animate-spin inline mr-1" /> : null}
          {dict.submitFeedback}
        </button>
      </div>
    </div>
  );
}
