"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Profile } from "@/types/database";

export function StudentActions({ student }: { student: Profile }) {
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
            style={{ background: "#f0fdf4", color: "#16a34a" }}
          >
            Activate
          </button>
        )}
        {student.access_status === "active" && (
          <button
            disabled={loading}
            onClick={() => patch({ access_status: "suspended" })}
            className="text-sm px-3 py-2 rounded-lg font-medium transition-colors hover:opacity-90 disabled:opacity-50"
            style={{ background: "#fef2f2", color: "#dc2626" }}
          >
            Suspend
          </button>
        )}
        {student.access_status === "suspended" && (
          <button
            disabled={loading}
            onClick={() => patch({ access_status: "active" })}
            className="text-sm px-3 py-2 rounded-lg font-medium transition-colors hover:opacity-90 disabled:opacity-50"
            style={{ background: "#eff6ff", color: "#2563eb" }}
          >
            Reactivate
          </button>
        )}
      </div>

      {/* Expiry date */}
      <div>
        <label className="block text-sm font-medium mb-1.5">Set Expiry Date</label>
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
            Save
          </button>
        </div>
      </div>

      {/* Extend */}
      <div>
        <label className="block text-sm font-medium mb-1.5">Extend Access</label>
        <div className="flex gap-2">
          {[30, 60, 90].map((days) => (
            <button
              key={days}
              disabled={loading}
              onClick={() => extendAccess(days)}
              className="text-sm px-3 py-2 rounded-lg font-medium transition-colors hover:opacity-80 disabled:opacity-50"
              style={{ background: "var(--secondary)", color: "var(--foreground)" }}
            >
              +{days} days
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
