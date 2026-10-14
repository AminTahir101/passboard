"use client";

import { useRef, useState } from "react";
import { FileText, X, Plus, Loader2 } from "lucide-react";
import type { Dictionary } from "@/lib/i18n";
import type { WizardState, UploadedDocument } from "../NewCaseWizard";

type Props = {
  dict: Dictionary["caseLab"];
  lang: string;
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
  next: () => void;
  back: () => void;
};

export default function DocumentUploadStep({ dict, state, update, next, back }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addFiles(files: FileList | null) {
    if (!files) return;
    const remaining = 20 - state.documents.length;
    const toAdd: UploadedDocument[] = Array.from(files).slice(0, remaining).map((file) => ({ file }));
    update({ documents: [...state.documents, ...toAdd] });
  }

  function removeDoc(i: number) {
    const docs = [...state.documents];
    docs.splice(i, 1);
    update({ documents: docs });
  }

  async function handleNext() {
    // No documents — skip extraction entirely
    if (state.documents.length === 0) {
      next();
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Get signed upload URLs + record documents + queue OCR jobs
      const res = await fetch(`/api/case-lab/cases/${state.caseId}/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: state.documents.map((d) => ({ name: d.file.name, type: d.file.type })),
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      const { uploads }: { uploads: { signedUrl: string; path: string; documentId: string }[] } =
        await res.json();

      // Upload each file to storage
      await Promise.all(
        uploads.map((u, i) =>
          fetch(u.signedUrl, {
            method: "PUT",
            body: state.documents[i].file,
            headers: { "Content-Type": state.documents[i].file.type },
          })
        )
      );

      // Store keys on wizard state so downstream steps can reference them
      update({
        documents: state.documents.map((d, i) => ({
          ...d,
          storageKey: uploads[i]?.path,
        })),
      });

      next();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-xl border p-6 space-y-4" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
      <div>
        <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>{dict.step4Title}</h2>
        <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>{dict.maxDocuments}</p>
      </div>

      {state.documents.length === 0 ? (
        <p className="text-sm text-center py-6" style={{ color: "var(--muted-foreground)" }}>{dict.noDocuments}</p>
      ) : (
        <ul className="space-y-2">
          {state.documents.map((doc, i) => (
            <li
              key={i}
              className="flex items-center gap-3 rounded-lg border px-3 py-2"
              style={{ borderColor: "var(--border)" }}
            >
              <FileText size={16} style={{ color: "var(--muted-foreground)" }} className="shrink-0" />
              <span className="text-sm flex-1 truncate" style={{ color: "var(--foreground)" }}>{doc.file.name}</span>
              <button onClick={() => removeDoc(i)} style={{ color: "var(--muted-foreground)" }}>
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {state.documents.length < 20 && (
        <button
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg border"
          style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
        >
          <Plus size={14} />
          {dict.addDocuments}
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,image/*"
            multiple
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />
        </button>
      )}

      {error && (
        <p className="text-xs" style={{ color: "var(--destructive)" }}>{error}</p>
      )}

      <div className="flex justify-between pt-2">
        <button onClick={back} className="px-4 py-2 text-sm rounded-lg" style={{ color: "var(--muted-foreground)" }}>
          ← {dict.step3Title}
        </button>
        <button
          onClick={handleNext}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg"
          style={{
            background: "var(--accent)",
            color: "var(--accent-foreground)",
            opacity: uploading ? 0.6 : 1,
          }}
        >
          {uploading && <Loader2 size={13} className="animate-spin" />}
          {uploading ? dict.extracting : `${dict.step5Title} →`}
        </button>
      </div>
    </div>
  );
}
