"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { localePath } from "@/lib/i18n";
import {
  Shuffle,
  Tag,
  BookMarked,
  AlertCircle,
  BookOpen,
  ChevronRight,
} from "lucide-react";

const QUESTION_COUNTS = [10, 20, 50, 100];

export default function PracticePage() {
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) ?? "ar";

  const PRACTICE_MODES = [
    {
      id: "random",
      label: "Random Practice",
      description: "Questions from across all topics and categories",
      icon: Shuffle,
      color: "var(--brand)",
    },
    {
      id: "category",
      label: "Practice by Category",
      description: "Focus on a specific subject category",
      icon: Tag,
      color: "var(--warning)",
    },
    {
      id: "topic",
      label: "Practice by Topic",
      description: "Drill down into a specific topic",
      icon: BookMarked,
      color: "var(--success)",
    },
    {
      id: "incorrect",
      label: "Practice Incorrect Questions",
      description: "Revisit questions you got wrong",
      icon: AlertCircle,
      color: "var(--destructive)",
    },
    {
      id: "unanswered",
      label: "Practice Unanswered Questions",
      description: "Fresh questions you haven't seen yet",
      icon: BookOpen,
      color: "var(--foreground)",
    },
  ];

  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [selectedCount, setSelectedCount] = useState(20);

  function handleStart() {
    if (!selectedMode) return;
    router.push(localePath(lang, `/practice/session?mode=${selectedMode}&count=${selectedCount}`));
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
          Start Practice
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          Choose a practice mode and question count to begin
        </p>
      </div>

      {/* Mode selection */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
          Practice Mode
        </h2>
        <div className="space-y-2">
          {PRACTICE_MODES.map(({ id, label, description, icon: Icon, color }) => {
            const active = selectedMode === id;
            return (
              <button
                key={id}
                onClick={() => setSelectedMode(id)}
                className="w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all"
                style={{
                  borderColor: active ? "var(--brand)" : "var(--border)",
                  background: active ? "rgba(37,99,235,0.05)" : "var(--card)",
                  outline: active ? "2px solid var(--brand)" : "none",
                  outlineOffset: "-1px",
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: color + "15" }}
                >
                  <Icon size={20} style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm" style={{ color: "var(--foreground)" }}>
                    {label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                    {description}
                  </p>
                </div>
                <div
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                  style={{
                    borderColor: active ? "var(--brand)" : "var(--border)",
                    background: active ? "var(--brand)" : "transparent",
                  }}
                >
                  {active && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Question count */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
          Number of Questions
        </h2>
        <div className="flex gap-2 flex-wrap">
          {QUESTION_COUNTS.map((count) => (
            <button
              key={count}
              onClick={() => setSelectedCount(count)}
              className="px-5 py-2.5 rounded-lg border text-sm font-medium transition-all"
              style={{
                borderColor: selectedCount === count ? "var(--brand)" : "var(--border)",
                background: selectedCount === count ? "var(--brand)" : "var(--card)",
                color: selectedCount === count ? "var(--brand-foreground)" : "var(--foreground)",
              }}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      {/* Start button */}
      <button
        onClick={handleStart}
        disabled={!selectedMode}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-40"
        style={{
          background: "var(--brand)",
          color: "var(--brand-foreground)",
        }}
      >
        Start Practice
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
