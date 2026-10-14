"use client";

import { useRef, useState } from "react";
import { ImagePlus, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import type { Dictionary } from "@/lib/i18n";
import type { WizardState, UploadedImage } from "../NewCaseWizard";

type Props = {
  dict: Dictionary["caseLab"];
  lang: string;
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
  next: () => void;
  back: () => void;
};

const BODY_SITES = [
  "scalp", "face", "neck", "chest", "back", "abdomen",
  "arm", "hand", "leg", "foot", "nail", "eye", "other",
];

/** Client-side blur detection using Laplacian variance proxy via canvas */
async function checkImageQuality(file: File): Promise<{ pass: boolean; reason: string }> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const size = 256;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;

      // Check resolution
      if (img.width < 1024 || img.height < 1024) {
        URL.revokeObjectURL(url);
        resolve({ pass: false, reason: "resolution too low (min 1024 px)" });
        return;
      }

      // Compute greyscale variance as proxy for sharpness
      let sum = 0;
      let sumSq = 0;
      const n = (size * size);
      for (let i = 0; i < data.length; i += 4) {
        const grey = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        sum += grey;
        sumSq += grey * grey;
      }
      const mean = sum / n;
      const variance = sumSq / n - mean * mean;

      URL.revokeObjectURL(url);

      if (variance < 100) {
        resolve({ pass: false, reason: "image appears blurred or too dark" });
      } else {
        resolve({ pass: true, reason: "" });
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ pass: false, reason: "could not read image" });
    };
    img.src = url;
  });
}

export default function ImageUploadStep({ dict, state, update, next, back }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [checking, setChecking] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    const remaining = 6 - state.images.length;
    const toAdd = Array.from(files).slice(0, remaining);

    for (const file of toAdd) {
      const preview = URL.createObjectURL(file);
      const placeholder: UploadedImage = {
        file, preview, bodySite: "other", view: "close-up",
        qualityOk: null, qualityError: null,
      };
      update({ images: [...state.images, placeholder] });

      setChecking(file.name);
      const result = await checkImageQuality(file);
      setChecking(null);

      update({
        images: state.images.map((img) =>
          img.preview === preview
            ? { ...img, qualityOk: result.pass, qualityError: result.reason || null }
            : img
        ),
      });
    }
  }

  function removeImage(i: number) {
    const imgs = [...state.images];
    URL.revokeObjectURL(imgs[i].preview);
    imgs.splice(i, 1);
    update({ images: imgs });
  }

  function updateImage(i: number, patch: Partial<UploadedImage>) {
    const imgs = state.images.map((img, idx) => idx === i ? { ...img, ...patch } : img);
    update({ images: imgs });
  }

  async function handleNext() {
    if (state.images.length === 0) return;
    const anyFail = state.images.some((img) => img.qualityOk === false);
    if (anyFail) return;

    setUploading(true);
    // Get signed upload URLs and upload each image
    const res = await fetch(`/api/case-lab/cases/${state.caseId}/uploads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        files: state.images.map((img) => ({
          name: img.file.name,
          type: img.file.type,
          bodySite: img.bodySite,
          view: img.view,
        })),
      }),
    });
    if (!res.ok) { setUploading(false); return; }

    const { uploads }: { uploads: { signedUrl: string; path: string }[] } = await res.json();
    await Promise.all(
      uploads.map((u, i) =>
        fetch(u.signedUrl, {
          method: "PUT",
          body: state.images[i].file,
          headers: { "Content-Type": state.images[i].file.type },
        })
      )
    );

    update({
      images: state.images.map((img, i) => ({ ...img, storageKey: uploads[i]?.path })),
    });
    setUploading(false);
    next();
  }

  const canProceed = state.images.length > 0 && state.images.every((img) => img.qualityOk === true);

  return (
    <div className="rounded-xl border p-6 space-y-4" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
      <h2 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>{dict.step2Title}</h2>
      <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{dict.maxImages}</p>

      {/* drop zone */}
      {state.images.length < 6 && (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed rounded-xl py-10 flex flex-col items-center gap-2 transition-colors"
          style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
        >
          <ImagePlus size={28} />
          <span className="text-sm">{dict.addImages}</span>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/heic,image/webp"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </button>
      )}

      {/* quality checking indicator */}
      {checking && (
        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--muted-foreground)" }}>
          <Loader2 size={13} className="animate-spin" />
          {dict.qualityChecking}
        </div>
      )}

      {/* image list */}
      {state.images.map((img, i) => (
        <div
          key={img.preview}
          className="flex gap-3 rounded-lg border p-3"
          style={{ borderColor: "var(--border)" }}
        >
          <img src={img.preview} alt="" className="w-16 h-16 object-cover rounded-md shrink-0" />
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-1.5">
              {img.qualityOk === null && <Loader2 size={13} className="animate-spin" style={{ color: "var(--muted-foreground)" }} />}
              {img.qualityOk === true && <CheckCircle2 size={13} style={{ color: "var(--success, #22c55e)" }} />}
              {img.qualityOk === false && <AlertCircle size={13} style={{ color: "var(--destructive)" }} />}
              <span className="text-xs truncate" style={{ color: img.qualityOk === false ? "var(--destructive)" : "var(--muted-foreground)" }}>
                {img.qualityOk === false
                  ? dict.qualityFail.replace("{reason}", img.qualityError ?? "")
                  : img.file.name}
              </span>
            </div>
            <div className="flex gap-2">
              <select
                value={img.bodySite}
                onChange={(e) => updateImage(i, { bodySite: e.target.value })}
                className="text-xs rounded border px-1.5 py-1 flex-1"
                style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--foreground)" }}
              >
                {BODY_SITES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select
                value={img.view}
                onChange={(e) => updateImage(i, { view: e.target.value as UploadedImage["view"] })}
                className="text-xs rounded border px-1.5 py-1"
                style={{ borderColor: "var(--border)", background: "var(--background)", color: "var(--foreground)" }}
              >
                <option value="close-up">{dict.closeUp}</option>
                <option value="overview">{dict.overview}</option>
                <option value="other">other</option>
              </select>
            </div>
          </div>
          <button onClick={() => removeImage(i)} style={{ color: "var(--muted-foreground)" }}>
            <X size={15} />
          </button>
        </div>
      ))}

      <div className="flex justify-between pt-2">
        <button onClick={back} className="px-4 py-2 text-sm rounded-lg" style={{ color: "var(--muted-foreground)" }}>
          ← {dict.step1Title}
        </button>
        <button
          onClick={handleNext}
          disabled={!canProceed || uploading}
          className="px-4 py-2 text-sm font-medium rounded-lg transition-opacity"
          style={{
            background: "var(--accent)", color: "var(--accent-foreground)",
            opacity: canProceed && !uploading ? 1 : 0.4,
          }}
        >
          {uploading ? <Loader2 size={14} className="animate-spin inline mr-1" /> : null}
          {dict.step3Title} →
        </button>
      </div>
    </div>
  );
}
