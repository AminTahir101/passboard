"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import type { Dictionary } from "@/lib/i18n";
import { localePath } from "@/lib/i18n";

const REQUIRED_COLUMNS = ["question_text", "option_a", "option_b", "option_c", "option_d", "correct_answer"];
const ALL_COLUMNS = [
  "question_text", "option_a", "option_b", "option_c", "option_d",
  "correct_answer", "justification", "explanation_a", "explanation_b",
  "explanation_c", "explanation_d", "exam", "category", "topic",
  "subtopic", "difficulty", "year", "source",
];

type ParsedRow = Record<string, string>;

interface ValidationResult {
  valid: ParsedRow[];
  invalid: { row: number; data: ParsedRow; errors: string[] }[];
}

function validateRows(rows: ParsedRow[]): ValidationResult {
  const valid: ParsedRow[] = [];
  const invalid: ValidationResult["invalid"] = [];

  rows.forEach((row, idx) => {
    const errors: string[] = [];

    for (const col of REQUIRED_COLUMNS) {
      if (!row[col]?.trim()) errors.push(`Missing required field: ${col}`);
    }

    const ca = row.correct_answer?.trim().toUpperCase();
    if (ca && !["A", "B", "C", "D"].includes(ca)) {
      errors.push(`correct_answer must be A, B, C, or D (got: ${row.correct_answer})`);
    }

    const diff = row.difficulty?.trim().toLowerCase();
    if (diff && !["easy", "medium", "hard", ""].includes(diff)) {
      errors.push(`difficulty must be easy, medium, or hard (got: ${row.difficulty})`);
    }

    if (row.year && isNaN(parseInt(row.year))) {
      errors.push(`year must be a number (got: ${row.year})`);
    }

    if (errors.length === 0) {
      valid.push(row);
    } else {
      invalid.push({ row: idx + 2, data: row, errors });
    }
  });

  return { valid, invalid };
}

interface ImportClientProps {
  dict: Dictionary["admin"]["import"];
  lang: string;
}

export default function ImportClient({ dict, lang }: ImportClientProps) {
  const router = useRouter();
  const [step, setStep] = useState<"upload" | "preview" | "done">("upload");
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [publishImported, setPublishImported] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; failed: number } | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  function handleFile(file: File) {
    setParseError(null);
    Papa.parse<ParsedRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0 && results.data.length === 0) {
          setParseError("Failed to parse CSV file. Please check the file format.");
          return;
        }
        const result = validateRows(results.data);
        setValidation(result);
        setStep("preview");
      },
      error: (err) => {
        setParseError(`Parse error: ${err.message}`);
      },
    });
  }

  async function handleImport() {
    if (!validation?.valid.length) return;
    setImporting(true);

    try {
      const res = await fetch("/api/admin/questions/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questions: validation.valid,
          publish: publishImported,
        }),
      });
      const data = await res.json();
      setImportResult(data);
      setStep("done");
    } finally {
      setImporting(false);
    }
  }

  const questionsHref = localePath(lang, "/admin/questions");

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-2">
        <a href={questionsHref} className="text-sm hover:underline" style={{ color: "var(--muted-foreground)" }}>
          {dict.title}
        </a>
        <span style={{ color: "var(--muted-foreground)" }}>/</span>
        <span className="text-sm">{lang === "ar" ? "استيراد" : "Import"}</span>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">{dict.title}</h1>

      {step === "upload" && (
        <div className="space-y-6">
          {/* Expected format */}
          <div className="rounded-xl border p-6" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <h2 className="font-semibold mb-3">{dict.requiredColumns}</h2>
            <p className="text-sm mb-3" style={{ color: "var(--muted-foreground)" }}>
              {dict.subtitle}
            </p>
            <div className="overflow-x-auto">
              <table className="text-xs w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <th className="text-left py-1.5 pr-4 font-medium" style={{ color: "var(--muted-foreground)" }}>Column</th>
                    <th className="text-left py-1.5 font-medium" style={{ color: "var(--muted-foreground)" }}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {ALL_COLUMNS.map((col) => (
                    <tr key={col} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td className="py-1.5 pr-4 font-mono">
                        {col}
                        {REQUIRED_COLUMNS.includes(col) && <span className="ml-1" style={{ color: "var(--brand)" }}>*</span>}
                      </td>
                      <td className="py-1.5" style={{ color: "var(--muted-foreground)" }}>
                        {col === "correct_answer" && "A, B, C, or D"}
                        {col === "difficulty" && "easy, medium, or hard"}
                        {col === "year" && "numeric"}
                        {col === "status" && "draft, published, or archived"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Upload */}
          {parseError && (
            <div className="p-3 rounded-lg text-sm" style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>
              {parseError}
            </div>
          )}
          <div
            className="rounded-xl border-2 border-dashed p-12 text-center cursor-pointer"
            style={{ borderColor: "var(--border)" }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) handleFile(file);
            }}
          >
            <p className="text-sm font-medium mb-2">{dict.dragDrop}</p>
            <p className="text-xs mb-4" style={{ color: "var(--muted-foreground)" }}>{dict.uploadArea}</p>
            <label
              className="inline-block text-sm font-medium px-4 py-2 rounded-lg cursor-pointer transition-colors hover:opacity-90"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              {dict.browse}
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
            </label>
          </div>
        </div>
      )}

      {step === "preview" && validation && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl border p-4 text-center" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <p className="text-2xl font-bold">{validation.valid.length + validation.invalid.length}</p>
              <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>{lang === "ar" ? "الإجمالي" : "Total Rows"}</p>
            </div>
            <div className="rounded-xl border p-4 text-center" style={{ background: "#f0fdf4", borderColor: "#bbf7d0" }}>
              <p className="text-2xl font-bold" style={{ color: "#16a34a" }}>{validation.valid.length}</p>
              <p className="text-xs mt-1" style={{ color: "#16a34a" }}>{dict.validRows}</p>
            </div>
            <div className="rounded-xl border p-4 text-center" style={{ background: validation.invalid.length ? "#fef2f2" : "var(--card)", borderColor: validation.invalid.length ? "#fecaca" : "var(--border)" }}>
              <p className="text-2xl font-bold" style={{ color: validation.invalid.length ? "#dc2626" : "var(--muted-foreground)" }}>
                {validation.invalid.length}
              </p>
              <p className="text-xs mt-1" style={{ color: validation.invalid.length ? "#dc2626" : "var(--muted-foreground)" }}>{dict.invalidRows}</p>
            </div>
          </div>

          {/* Errors */}
          {validation.invalid.length > 0 && (
            <div className="rounded-xl border" style={{ borderColor: "#fecaca" }}>
              <div className="px-4 py-3 border-b" style={{ background: "#fef2f2", borderColor: "#fecaca" }}>
                <p className="text-sm font-medium" style={{ color: "#dc2626" }}>{dict.errors}</p>
              </div>
              <div className="divide-y" style={{ borderColor: "#fecaca", maxHeight: "200px", overflowY: "auto" }}>
                {validation.invalid.slice(0, 10).map((inv) => (
                  <div key={inv.row} className="px-4 py-2 text-xs" style={{ background: "#fffafa" }}>
                    <p className="font-medium mb-0.5" style={{ color: "#dc2626" }}>Row {inv.row}</p>
                    {inv.errors.map((err) => <p key={err} style={{ color: "#6b7280" }}>• {err}</p>)}
                  </div>
                ))}
                {validation.invalid.length > 10 && (
                  <p className="px-4 py-2 text-xs" style={{ color: "#6b7280", background: "#fffafa" }}>
                    …and {validation.invalid.length - 10} more errors
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Preview */}
          {validation.valid.length > 0 && (
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
              <div className="px-4 py-3 border-b" style={{ background: "var(--secondary)", borderColor: "var(--border)" }}>
                <p className="text-sm font-medium">{dict.step2}</p>
              </div>
              <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                {validation.valid.slice(0, 5).map((row, i) => (
                  <div key={i} className="px-4 py-3" style={{ background: "var(--card)" }}>
                    <p className="text-sm font-medium truncate">{row.question_text}</p>
                    <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
                      Correct: {row.correct_answer} · {row.category || "—"} · {row.difficulty || "medium"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Import options */}
          <div className="rounded-xl border p-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={publishImported}
                onChange={(e) => setPublishImported(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <div>
                <p className="text-sm font-medium">{dict.importAsPublished}</p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  {dict.importAsDraft}
                </p>
              </div>
            </label>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleImport}
              disabled={importing || validation.valid.length === 0}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              {importing ? dict.importing : `${dict.step3} ${validation.valid.length}`}
            </button>
            <button
              onClick={() => { setStep("upload"); setValidation(null); }}
              className="px-4 py-2.5 rounded-lg text-sm font-medium"
              style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}
            >
              {lang === "ar" ? "البداية" : "Start Over"}
            </button>
          </div>
        </div>
      )}

      {step === "done" && importResult && (
        <div className="rounded-xl border p-8 text-center" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#f0fdf4" }}>
            <span style={{ fontSize: "1.5rem" }}>✓</span>
          </div>
          <h2 className="text-xl font-semibold mb-2">{dict.title}</h2>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            {dict.successMsg.replace("{count}", String(importResult.imported))}
            {importResult.failed > 0 && ` ${dict.failedMsg.replace("{count}", String(importResult.failed))}`}
          </p>
          <div className="flex justify-center gap-3 mt-6">
            <button
              onClick={() => router.push(questionsHref)}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              {lang === "ar" ? "عرض الأسئلة" : "View Questions"}
            </button>
            <button
              onClick={() => { setStep("upload"); setValidation(null); setImportResult(null); }}
              className="px-4 py-2.5 rounded-lg text-sm font-medium"
              style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}
            >
              {lang === "ar" ? "استيراد المزيد" : "Import More"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
