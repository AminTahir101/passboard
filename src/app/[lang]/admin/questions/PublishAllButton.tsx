"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PublishAllButton({ draftCount }: { draftCount: number }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (draftCount === 0) return null;

  async function handleClick() {
    if (!confirm(`Publish all ${draftCount} draft question${draftCount !== 1 ? "s" : ""}?`)) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/questions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "publish" }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      router.refresh();
    } catch (e) {
      alert("Failed: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-sm px-3 py-2 rounded-lg font-medium transition-colors hover:opacity-80 disabled:opacity-50"
      style={{ background: "var(--success-muted)", color: "var(--success)", border: "1px solid var(--success)" }}
    >
      {loading ? "Publishing…" : `Publish All Drafts (${draftCount})`}
    </button>
  );
}
