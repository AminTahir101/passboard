"use client";

import { useRef } from "react";
import { FileText, X, Plus } from "lucide-react";
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

      <div className="flex justify-between pt-2">
        <button onClick={back} className="px-4 py-2 text-sm rounded-lg" style={{ color: "var(--muted-foreground)" }}>
          ← {dict.step3Title}
        </button>
        <button
          onClick={next}
          className="px-4 py-2 text-sm font-medium rounded-lg"
          style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}
        >
          {dict.step5Title} →
        </button>
      </div>
    </div>
  );
}
