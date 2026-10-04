"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

function validateRows(rows: ParsedRow[], lang: string): ValidationResult {
  const valid: ParsedRow[] = [];
  const invalid: ValidationResult["invalid"] = [];

  rows.forEach((row, idx) => {
    const errors: string[] = [];

    for (const col of REQUIRED_COLUMNS) {
      if (!row[col]?.trim()) errors.push(lang === "ar" ? `حقل مطلوب مفقود: ${col}` : `Missing required field: ${col}`);
    }

    const ca = row.correct_answer?.trim().toUpperCase();
    if (ca && !["A", "B", "C", "D"].includes(ca)) {
      errors.push(lang === "ar" ? `correct_answer يجب أن يكون A أو B أو C أو D (القيمة: ${row.correct_answer})` : `correct_answer must be A, B, C, or D (got: ${row.correct_answer})`);
    }

    const diff = row.difficulty?.trim().toLowerCase();
    if (diff && !["easy", "medium", "hard", ""].includes(diff)) {
      errors.push(lang === "ar" ? `difficulty يجب أن يكون easy أو medium أو hard (القيمة: ${row.difficulty})` : `difficulty must be easy, medium, or hard (got: ${row.difficulty})`);
    }

    if (row.year && isNaN(parseInt(row.year))) {
      errors.push(lang === "ar" ? `year يجب أن يكون رقماً (القيمة: ${row.year})` : `year must be a number (got: ${row.year})`);
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
          setParseError(lang === "ar" ? "فشل تحليل ملف CSV. يرجى التحقق من تنسيق الملف." : "Failed to parse CSV file. Please check the file format.");
          return;
        }
        const result = validateRows(results.data, lang);
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

  function downloadTemplate() {
    const headers = ALL_COLUMNS.join(",");
    const example = [
      '"What is the normal fasting blood glucose range?"',
      '"70–99 mg/dL"',
      '"100–125 mg/dL"',
      '"126–140 mg/dL"',
      '"60–80 mg/dL"',
      '"A"',
      '"Normal fasting glucose is 70–99 mg/dL per ADA guidelines."',
      '""', '""', '""', '""', // explanation_a–d
      '"USMLE Step 1"',
      '"Endocrinology"',
      '"Diabetes"',
      '"Diagnosis"',
      '"easy"',
      '"2023"',
      '"ADA Standards of Care"',
    ].join(",");
    const csv = `${headers}\n${example}\n`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "passboard_questions_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-2">
        <Link href={questionsHref} className="text-sm hover:underline" style={{ color: "var(--muted-foreground)" }}>
          {dict.title}
        </Link>
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
                    <th className="text-left py-1.5 pr-4 font-medium" style={{ color: "var(--muted-foreground)" }}>{lang === "ar" ? "العمود" : "Column"}</th>
                    <th className="text-left py-1.5 font-medium" style={{ color: "var(--muted-foreground)" }}>{lang === "ar" ? "ملاحظات" : "Notes"}</th>
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
                        {col === "correct_answer" && (lang === "ar" ? "A أو B أو C أو D" : "A, B, C, or D")}
                        {col === "difficulty" && (lang === "ar" ? "easy أو medium أو hard" : "easy, medium, or hard")}
                        {col === "year" && (lang === "ar" ? "رقم" : "numeric")}
                        {col === "status" && (lang === "ar" ? "draft أو published أو archived" : "draft, published, or archived")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Download template */}
          <div className="flex items-center justify-between rounded-xl border p-4" style={{ background: "var(--secondary)", borderColor: "var(--border)" }}>
            <div>
              <p className="text-sm font-medium">{lang === "ar" ? "تحميل قالب CSV" : "Download CSV Template"}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                {lang === "ar" ? "قالب جاهز مع صف مثال" : "Ready-to-fill template with one example row"}
              </p>
            </div>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              {lang === "ar" ? "تحميل القالب" : "Download Template"}
            </button>
          </div>

          {/* Upload */}
          {parseError && (
            <div className="p-3 rounded-lg text-sm" style={{ background: "var(--destructive-muted)", color: "var(--destructive)", border: "1px solid var(--destructive-muted-border)" }}>
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
            <div className="rounded-xl border p-4 text-center" style={{ background: "var(--success-muted)", borderColor: "var(--success-muted-border)" }}>
              <p className="text-2xl font-bold" style={{ color: "var(--success)" }}>{validation.valid.length}</p>
              <p className="text-xs mt-1" style={{ color: "var(--success)" }}>{dict.validRows}</p>
            </div>
            <div className="rounded-xl border p-4 text-center" style={{ background: validation.invalid.length ? "var(--destructive-muted)" : "var(--card)", borderColor: validation.invalid.length ? "var(--destructive-muted-border)" : "var(--border)" }}>
              <p className="text-2xl font-bold" style={{ color: validation.invalid.length ? "var(--destructive)" : "var(--muted-foreground)" }}>
                {validation.invalid.length}
              </p>
              <p className="text-xs mt-1" style={{ color: validation.invalid.length ? "var(--destructive)" : "var(--muted-foreground)" }}>{dict.invalidRows}</p>
            </div>
          </div>

          {/* Errors */}
          {validation.invalid.length > 0 && (
            <div className="rounded-xl border" style={{ borderColor: "var(--destructive-muted-border)" }}>
              <div className="px-4 py-3 border-b" style={{ background: "var(--destructive-muted)", borderColor: "var(--destructive-muted-border)" }}>
                <p className="text-sm font-medium" style={{ color: "var(--destructive)" }}>{dict.errors}</p>
              </div>
              <div className="divide-y" style={{ borderColor: "var(--destructive-muted-border)", maxHeight: "200px", overflowY: "auto" }}>
                {validation.invalid.slice(0, 10).map((inv) => (
                  <div key={inv.row} className="px-4 py-2 text-xs" style={{ background: "var(--card)" }}>
                    <p className="font-medium mb-0.5" style={{ color: "var(--destructive)" }}>{lang === "ar" ? `صف ${inv.row}` : `Row ${inv.row}`}</p>
                    {inv.errors.map((err) => <p key={err} style={{ color: "var(--muted-foreground)" }}>• {err}</p>)}
                  </div>
                ))}
                {validation.invalid.length > 10 && (
                  <p className="px-4 py-2 text-xs" style={{ color: "var(--muted-foreground)", background: "var(--card)" }}>
                    {lang === "ar" ? `…و${validation.invalid.length - 10} أخطاء أخرى` : `…and ${validation.invalid.length - 10} more errors`}
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
                      {lang === "ar" ? `صحيح: ${row.correct_answer}` : `Correct: ${row.correct_answer}`} · {row.category || "—"} · {row.difficulty || "medium"}
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
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "var(--success-muted)" }}>
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
