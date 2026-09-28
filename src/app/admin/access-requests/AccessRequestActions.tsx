"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AccessRequest } from "@/types/database";

const STATUS_OPTIONS = ["new", "contacted", "paid", "approved", "rejected"] as const;

export function AccessRequestActions({ request }: { request: AccessRequest }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [tempPassword, setTempPassword] = useState("");
  const [createdEmail, setCreatedEmail] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  async function updateStatus(status: string) {
    setLoading(true);
    try {
      await fetch(`/api/admin/access-requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function createAccount() {
    setCreateLoading(true);
    setCreateError("");
    try {
      const res = await fetch(`/api/admin/access-requests/${request.id}/create-account`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error ?? "Failed to create account");
        return;
      }
      setTempPassword(data.tempPassword);
      setCreatedEmail(data.email);
    } finally {
      setCreateLoading(false);
    }
  }

  if (createdEmail) {
    return (
      <div
        className="p-3 rounded-lg text-xs space-y-1"
        style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}
      >
        <p className="font-semibold" style={{ color: "#16a34a" }}>Account created!</p>
        <p>Email: <strong>{createdEmail}</strong></p>
        <p>Temp Password: <strong>{tempPassword}</strong></p>
        <p style={{ color: "#6b7280" }}>Share these credentials with the student securely.</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <select
        disabled={loading}
        defaultValue={request.status}
        onChange={(e) => updateStatus(e.target.value)}
        className="text-xs px-2 py-1.5 rounded-lg border outline-none"
        style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s} className="capitalize">{s}</option>
        ))}
      </select>

      {request.status === "approved" && (
        <div>
          {showCreate ? (
            <div className="space-y-2">
              {createError && (
                <p className="text-xs" style={{ color: "var(--destructive)" }}>{createError}</p>
              )}
              <div className="flex gap-1.5">
                <button
                  onClick={createAccount}
                  disabled={createLoading}
                  className="text-xs px-2 py-1.5 rounded-lg font-medium transition-colors hover:opacity-90"
                  style={{ background: "var(--brand)", color: "var(--brand-foreground)" }}
                >
                  {createLoading ? "Creating…" : "Confirm Create"}
                </button>
                <button
                  onClick={() => setShowCreate(false)}
                  className="text-xs px-2 py-1.5 rounded-lg font-medium"
                  style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowCreate(true)}
              className="text-xs px-2 py-1.5 rounded-lg font-medium transition-colors hover:opacity-80"
              style={{ background: "var(--secondary)", color: "var(--foreground)" }}
            >
              Create Account
            </button>
          )}
        </div>
      )}
    </div>
  );
}
