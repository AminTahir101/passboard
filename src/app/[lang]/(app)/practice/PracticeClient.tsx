"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { localePath } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n";
import {
  Shuffle,
  Tag,
  BookMarked,
  AlertCircle,
  BookOpen,
  ChevronRight,
  Loader2,
} from "lucide-react";

const QUESTION_COUNTS = [10, 20, 50, 100];

interface PracticeClientProps {
  dict: Dictionary["practice"];
  lang: string;
}

export default function PracticeClient({ dict, lang }: PracticeClientProps) {
  const router = useRouter();

  const PRACTICE_MODES = [
    { id: "random",     label: dict.random,     description: dict.randomDesc,     icon: Shuffle,      color: "var(--brand)" },
    { id: "category",   label: dict.byCategory,  description: dict.byCategoryDesc, icon: Tag,          color: "var(--warning)" },
    { id: "topic",      label: dict.byTopic,     description: dict.byTopicDesc,    icon: BookMarked,   color: "var(--success)" },
    { id: "incorrect",  label: dict.incorrect,   description: dict.incorrectDesc,  icon: AlertCircle,  color: "var(--destructive)" },
    { id: "unanswered", label: dict.unanswered,  description: dict.unansweredDesc, icon: BookOpen,     color: "var(--foreground)" },
  ];

  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [selectedCount, setSelectedCount] = useState(20);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [filtersLoading, setFiltersLoading] = useState(false);

  useEffect(() => {
    if (selectedMode === "category" || selectedMode === "topic") {
      if (categories.length === 0 && topics.length === 0) {
        setFiltersLoading(true);
        fetch("/api/practice/filters")
          .then((r) => r.json())
          .then(({ categories: c, topics: t }) => {
            setCategories(c ?? []);
            setTopics(t ?? []);
          })
          .finally(() => setFiltersLoading(false));
      }
    }
  }, [selectedMode, categories.length, topics.length]);

  function handleModeSelect(id: string) {
    setSelectedMode(id);
    setSelectedCategory(null);
    setSelectedTopic(null);
  }

  function handleStart() {
    if (!selectedMode) return;
    const params = new URLSearchParams({ mode: selectedMode, count: String(selectedCount) });
    if (selectedMode === "category" && selectedCategory) params.set("category", selectedCategory);
    if (selectedMode === "topic" && selectedTopic) params.set("topic", selectedTopic);
    router.push(localePath(lang, `/practice/session?${params}`));
  }

  const needsPicker = selectedMode === "category" || selectedMode === "topic";
  const pickerItems = selectedMode === "category" ? categories : topics;
  const pickerValue = selectedMode === "category" ? selectedCategory : selectedTopic;
  const pickerSet = selectedMode === "category" ? setSelectedCategory : setSelectedTopic;
  const canStart = selectedMode && (!needsPicker || pickerValue !== null);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>{dict.title}</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>{dict.subtitle}</p>
      </div>

      {/* Mode selection */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
          {lang === "ar" ? "طريقة التدريب" : "Practice Mode"}
        </h2>
        <div className="space-y-2">
          {PRACTICE_MODES.map(({ id, label, description, icon: Icon, color }) => {
            const active = selectedMode === id;
            return (
              <button
                key={id}
                onClick={() => handleModeSelect(id)}
                className="w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all"
                style={{
                  borderColor: active ? "var(--brand)" : "var(--border)",
                  background: active ? "rgba(37,99,235,0.05)" : "var(--card)",
                  outline: active ? "2px solid var(--brand)" : "none",
                  outlineOffset: "-1px",
                }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: color + "15" }}>
                  <Icon size={20} style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm" style={{ color: "var(--foreground)" }}>{label}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{description}</p>
                </div>
                <div
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                  style={{ borderColor: active ? "var(--brand)" : "var(--border)", background: active ? "var(--brand)" : "transparent" }}
                >
                  {active && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category / Topic picker */}
      {needsPicker && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
            {selectedMode === "category"
              ? (lang === "ar" ? "اختر التخصص" : "Select Specialty")
              : (lang === "ar" ? "اختر الموضوع" : "Select Topic")}
          </h2>
          {filtersLoading ? (
            <div className="flex items-center gap-2 py-4" style={{ color: "var(--muted-foreground)" }}>
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">{lang === "ar" ? "جارٍ التحميل…" : "Loading…"}</span>
            </div>
          ) : pickerItems.length === 0 ? (
            <p className="text-sm py-2" style={{ color: "var(--muted-foreground)" }}>
              {lang === "ar" ? "لا توجد خيارات متاحة" : "No options available"}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {pickerItems.map((item) => {
                const active = pickerValue === item;
                return (
                  <button
                    key={item}
                    onClick={() => pickerSet(active ? null : item)}
                    className="px-3 py-1.5 rounded-full text-sm font-medium border transition-all"
                    style={{
                      borderColor: active ? "var(--brand)" : "var(--border)",
                      background: active ? "var(--brand)" : "var(--card)",
                      color: active ? "var(--brand-foreground)" : "var(--foreground)",
                    }}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Question count */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{dict.questionCount}</h2>
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
        disabled={!canStart}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-40"
        style={{ background: "var(--brand)", color: "var(--brand-foreground)" }}
      >
        {dict.start}
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
