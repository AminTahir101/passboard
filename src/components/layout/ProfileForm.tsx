"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Check, AlertCircle } from "lucide-react";
import type { Profile } from "@/types/database";

interface ProfileFormProps {
  profile: Profile;
}

export default function ProfileForm({ profile }: ProfileFormProps) {
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [targetExam, setTargetExam] = useState(profile.target_exam ?? "");
  const [examDate, setExamDate] = useState(
    profile.exam_date ? profile.exam_date.split("T")[0] : ""
  );
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus("idle");

    const supabase = createClient();

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName || null,
        phone: phone || null,
        target_exam: targetExam || null,
        exam_date: examDate || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    setSaving(false);

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
    } else {
      setStatus("success");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
            Full Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
            className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors"
            style={{
              borderColor: "var(--border)",
              background: "var(--background)",
              color: "var(--foreground)",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--brand)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
            Phone Number
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Your phone number"
            className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors"
            style={{
              borderColor: "var(--border)",
              background: "var(--background)",
              color: "var(--foreground)",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--brand)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
            Target Exam
          </label>
          <input
            type="text"
            value={targetExam}
            onChange={(e) => setTargetExam(e.target.value)}
            placeholder="e.g. USMLE Step 1, PLAB"
            className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors"
            style={{
              borderColor: "var(--border)",
              background: "var(--background)",
              color: "var(--foreground)",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--brand)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
            Exam Date
          </label>
          <input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors"
            style={{
              borderColor: "var(--border)",
              background: "var(--background)",
              color: "var(--foreground)",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--brand)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
        </div>
      </div>

      {/* Status messages */}
      {status === "success" && (
        <div
          className="flex items-center gap-2 text-sm px-3 py-2.5 rounded-lg"
          style={{ background: "rgba(22,163,74,0.1)", color: "var(--success)" }}
        >
          <Check size={15} />
          Profile updated successfully
        </div>
      )}

      {status === "error" && (
        <div
          className="flex items-center gap-2 text-sm px-3 py-2.5 rounded-lg"
          style={{ background: "rgba(239,68,68,0.1)", color: "var(--destructive)" }}
        >
          <AlertCircle size={15} />
          {errorMsg || "Failed to update profile"}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50"
          style={{ background: "var(--brand)", color: "var(--brand-foreground)" }}
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
