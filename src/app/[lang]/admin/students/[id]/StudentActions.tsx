"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Profile } from "@/types/database";
import type { Dictionary } from "@/lib/i18n";

interface StudentActionsProps {
  student: Profile;
  dict: Dictionary["admin"]["students"];
  lang: string;
}

export function StudentActions({ student, dict, lang }: StudentActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [expiryDate, setExpiryDate] = useState(student.access_expires_at?.split("T")[0] ?? "");

  async function patch(body: object) {
    setLoading(true);
    try {
      await fetch(`/api/admin/students/${student.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function extendAccess(days: number) {
    const base = student.access_expires_at ? new Date(student.access_expires_at) : new Date();
    if (base < new Date()) base.setTime(new Date().getTime());
    base.setDate(base.getDate() + days);
    await patch({ access_expires_at: base.toISOString() });
  }

  return (
    <div className="space-y-4">
      {/* Status buttons */}
      <div className="flex flex-wrap gap-2">
        {student.access_status !== "active" && (
          <button
            disabled={loading}
            onClick={() => patch({ access_status: "active" })}
            className="text-sm px-3 py-2 rounded-lg font-medium transition-colors hover:opacity-90 disabled:opacity-50"
            style={{ background: "var(--success-muted)", color: "var(--success)" }}
          >
            {dict.activate}
          </button>
        )}
        {student.access_status === "active" && (
          <button
            disabled={loading}
            onClick={() => patch({ access_status: "suspended" })}
            className="text-sm px-3 py-2 rounded-lg font-medium transition-colors hover:opacity-90 disabled:opacity-50"
            style={{ background: "var(--destructive-muted)", color: "var(--destructive)" }}
          >
            {dict.suspend}
          </button>
        )}
        {student.access_status === "suspended" && (
          <button
            disabled={loading}
            onClick={() => patch({ access_status: "active" })}
            className="text-sm px-3 py-2 rounded-lg font-medium transition-colors hover:opacity-90 disabled:opacity-50"
            style={{ background: "var(--brand-muted)", color: "var(--brand)" }}
          >
            {dict.reactivate}
          </button>
        )}
      </div>

      {/* Expiry date */}
      <div>
        <label className="block text-sm font-medium mb-1.5">{dict.setExpiry}</label>
        <div className="flex gap-2">
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border outline-none"
            style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
          />
          <button
            disabled={loading || !expiryDate}
            onClick={() => patch({ access_expires_at: new Date(expiryDate).toISOString() })}
            className="text-sm px-3 py-2 rounded-lg font-medium transition-colors hover:opacity-90 disabled:opacity-50"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            {loading ? "..." : lang === "ar" ? "حفظ" : "Save"}
          </button>
        </div>
      </div>

      {/* Extend */}
      <div>
        <label className="block text-sm font-medium mb-1.5">{lang === "ar" ? "تمديد الوصول" : "Extend Access"}</label>
        <div className="flex gap-2">
          {[
            { days: 30, label: dict.extend30 },
            { days: 60, label: dict.extend60 },
            { days: 90, label: dict.extend90 },
          ].map(({ days, label }) => (
            <button
              key={days}
              disabled={loading}
              onClick={() => extendAccess(days)}
              className="text-sm px-3 py-2 rounded-lg font-medium transition-colors hover:opacity-80 disabled:opacity-50"
              style={{ background: "var(--secondary)", color: "var(--foreground)" }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
