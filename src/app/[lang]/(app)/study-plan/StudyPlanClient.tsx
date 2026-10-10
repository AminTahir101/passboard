"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  Circle,
  Play,
  ClipboardList,
  RotateCcw,
  BookOpen,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Clock,
} from "lucide-react";
import { localePath } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n";
import type { StudyPlan, StudyTask } from "@/types/database";

interface Props {
  plan: StudyPlan;
  tasks: StudyTask[];
  lang: string;
  dict: Dictionary["studyPlan"];
  setupPath: string;
}

// ── Week grouping ────────────────────────────────────────────────────────────

function getISOWeekKey(d: Date): string {
  const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const week = Math.ceil(
    ((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  return `${tmp.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

type Week = {
  key: string;
  label: string;
  days: { date: string; tasks: StudyTask[] }[];
};

function groupByWeek(tasks: StudyTask[]): Week[] {
  const byDate: Record<string, StudyTask[]> = {};
  for (const t of tasks) {
    if (!byDate[t.scheduled_date]) byDate[t.scheduled_date] = [];
    byDate[t.scheduled_date].push(t);
  }

  const weekMap: Record<string, string[]> = {};
  for (const date of Object.keys(byDate)) {
    const key = getISOWeekKey(new Date(date + "T00:00:00"));
    if (!weekMap[key]) weekMap[key] = [];
    weekMap[key].push(date);
  }

  return Object.entries(weekMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, dates]) => {
      const sorted = dates.sort();
      const first = new Date(sorted[0] + "T00:00:00");
      const last = new Date(sorted[sorted.length - 1] + "T00:00:00");
      const fmt = (d: Date) =>
        d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return {
        key,
        label: `${fmt(first)} – ${fmt(last)}`,
        days: sorted.map((d) => ({ date: d, tasks: byDate[d] })),
      };
    });
}

// ── Component ────────────────────────────────────────────────────────────────

export default function StudyPlanClient({
  plan,
  tasks: initialTasks,
  lang,
  dict,
  setupPath,
}: Props) {
  const [tasks, setTasks] = useState<StudyTask[]>(initialTasks);
  const [completing, setCompleting] = useState<Set<string>>(new Set());

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];
  const todayWeekKey = getISOWeekKey(today);

  const weeks = useMemo(() => groupByWeek(tasks), [tasks]);

  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(() => {
    const ws = groupByWeek(initialTasks);
    const has = ws.some((w) => w.key === todayWeekKey);
    if (has) return new Set([todayWeekKey]);
    if (ws.length > 0) return new Set([ws[0].key]);
    return new Set();
  });

  // ── Derived stats ──────────────────────────────────────────────────────────

  const examDate = new Date(plan.exam_date + "T00:00:00");
  const daysLeft = Math.ceil(
    (examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  const totalTasks = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPct =
    totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const todayTasks = tasks.filter((t) => t.scheduled_date === todayStr);
  const missedTasks = tasks.filter(
    (t) => t.scheduled_date < todayStr && !t.completed
  );

  const futureTasks = tasks.filter((t) => t.scheduled_date >= todayStr);
  const currentPhase =
    futureTasks[0]?.phase ?? tasks[tasks.length - 1]?.phase ?? "foundation";

  // ── Actions ────────────────────────────────────────────────────────────────

  async function toggleTask(taskId: string, completed: boolean) {
    setCompleting((prev) => new Set(prev).add(taskId));
    try {
      await fetch(`/api/study-plan/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      });
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                completed,
                completed_at: completed ? new Date().toISOString() : null,
              }
            : t
        )
      );
    } finally {
      setCompleting((prev) => {
        const s = new Set(prev);
        s.delete(taskId);
        return s;
      });
    }
  }

  function toggleWeek(key: string) {
    setExpandedWeeks((prev) => {
      const s = new Set(prev);
      if (s.has(key)) s.delete(key);
      else s.add(key);
      return s;
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  function taskLink(task: StudyTask): string {
    if (task.task_type === "mock_exam") {
      return localePath(lang, `/mock-exams/new?count=${task.question_count}`);
    }
    if (task.task_type === "review") {
      return localePath(
        lang,
        `/practice/session?mode=incorrect&count=${task.question_count}&plan_task_id=${task.id}`
      );
    }
    const p = new URLSearchParams({
      mode: task.specialty ? "category" : "random",
      count: String(task.question_count),
      plan_task_id: task.id,
    });
    if (task.specialty) p.set("category", task.specialty);
    return localePath(lang, `/practice/session?${p}`);
  }

  function phaseLabel(phase: string) {
    return (
      {
        foundation: lang === "ar" ? "التأسيس" : "Foundation",
        reinforcement: lang === "ar" ? "التعزيز" : "Reinforcement",
        final_review: lang === "ar" ? "المراجعة النهائية" : "Final Review",
      }[phase] ?? phase
    );
  }

  function phaseColor(phase: string) {
    return phase === "foundation"
      ? "var(--brand)"
      : phase === "reinforcement"
      ? "var(--warning)"
      : "var(--success)";
  }

  function taskLabel(task: StudyTask) {
    if (task.task_type === "mock_exam")
      return lang === "ar" ? "اختبار تجريبي" : "Mock Exam";
    if (task.task_type === "review")
      return lang === "ar" ? "مراجعة الأخطاء" : "Mistake Review";
    if (task.specialty) return task.specialty;
    return lang === "ar" ? "أسئلة مختلطة" : "Mixed Questions";
  }

  function TaskIcon({ type }: { type: string }) {
    if (type === "mock_exam") return <ClipboardList size={15} />;
    if (type === "review") return <RotateCcw size={15} />;
    return <BookOpen size={15} />;
  }

  // ── Task row ───────────────────────────────────────────────────────────────

  function TaskRow({
    task,
    showPhase = false,
  }: {
    task: StudyTask;
    showPhase?: boolean;
  }) {
    const isCompleting = completing.has(task.id);

    return (
      <div
        className="flex items-center gap-3 p-3 rounded-xl border"
        style={{
          background: task.completed ? "var(--muted)" : "var(--card)",
          borderColor: "var(--border)",
          opacity: task.completed ? 0.65 : 1,
        }}
      >
        {/* Checkbox */}
        <button
          onClick={() => toggleTask(task.id, !task.completed)}
          disabled={isCompleting}
          className="shrink-0 transition-opacity"
          style={{ opacity: isCompleting ? 0.4 : 1 }}
          title={task.completed ? (lang === "ar" ? "إلغاء الإتمام" : "Mark incomplete") : (lang === "ar" ? "وضع علامة مكتمل" : "Mark complete")}
        >
          {task.completed ? (
            <CheckCircle2 size={20} style={{ color: "var(--success)" }} />
          ) : (
            <Circle size={20} style={{ color: "var(--muted-foreground)" }} />
          )}
        </button>

        {/* Icon */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: phaseColor(task.phase) + "18" }}
        >
          <span style={{ color: phaseColor(task.phase) }}>
            <TaskIcon type={task.task_type} />
          </span>
        </div>

        {/* Label */}
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-medium"
            style={{
              color: "var(--foreground)",
              textDecoration: task.completed ? "line-through" : "none",
            }}
          >
            {taskLabel(task)}
          </p>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            {task.question_count} {lang === "ar" ? "سؤال" : "questions"}
            {showPhase ? ` · ${phaseLabel(task.phase)}` : ""}
          </p>
        </div>

        {/* Start button */}
        {!task.completed && (
          <Link
            href={taskLink(task)}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{ background: "var(--brand)", color: "var(--brand-foreground)" }}
          >
            <Play size={11} />
            {lang === "ar" ? "ابدأ" : "Start"}
          </Link>
        )}
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const daysLeftLabel =
    daysLeft <= 0
      ? lang === "ar"
        ? "اليوم!"
        : "Today!"
      : String(daysLeft);

  const examDateFormatted = examDate.toLocaleDateString(
    lang === "ar" ? "ar-SA" : "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">{dict.title}</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            {plan.exam} · {examDateFormatted}
          </p>
        </div>
        <Link
          href={setupPath}
          className="shrink-0 px-4 py-2 rounded-lg text-sm font-medium border"
          style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
        >
          {dict.editPlan}
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: dict.daysLeft,
            value: daysLeftLabel,
            color: "var(--warning)",
          },
          {
            label: dict.phase,
            value: phaseLabel(currentPhase),
            color: phaseColor(currentPhase),
            small: true,
          },
          {
            label: dict.progress,
            value: `${progressPct}%`,
            color: "var(--brand)",
          },
          {
            label: dict.missed,
            value: String(missedTasks.length),
            color:
              missedTasks.length > 0
                ? "var(--destructive)"
                : "var(--foreground)",
          },
        ].map(({ label, value, color, small }) => (
          <div
            key={label}
            className="rounded-xl border p-4"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              {label}
            </p>
            <p
              className={`${small ? "text-sm" : "text-2xl"} font-bold mt-1`}
              style={{ color }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div
        className="w-full h-2 rounded-full overflow-hidden"
        style={{ background: "var(--border)" }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${progressPct}%`, background: "var(--brand)" }}
        />
      </div>

      {/* Missed tasks */}
      {missedTasks.length > 0 && (
        <div
          className="rounded-xl border p-5 space-y-3"
          style={{
            background: "rgba(239,68,68,0.03)",
            borderColor: "var(--destructive)",
          }}
        >
          <div className="flex items-center gap-2">
            <AlertCircle size={15} style={{ color: "var(--destructive)" }} />
            <h2 className="font-semibold text-sm" style={{ color: "var(--destructive)" }}>
              {lang === "ar"
                ? `${missedTasks.length} مهمة فائتة`
                : `${missedTasks.length} missed task${
                    missedTasks.length !== 1 ? "s" : ""
                  }`}
            </h2>
          </div>
          <div className="space-y-2">
            {missedTasks.slice(0, 3).map((t) => (
              <TaskRow key={t.id} task={t} />
            ))}
            {missedTasks.length > 3 && (
              <p className="text-xs ps-2" style={{ color: "var(--muted-foreground)" }}>
                {lang === "ar"
                  ? `+ ${missedTasks.length - 3} مهام أخرى`
                  : `+ ${missedTasks.length - 3} more`}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Today's tasks */}
      <div
        className="rounded-xl border"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <div
          className="px-5 py-4 border-b flex items-center gap-2"
          style={{ borderColor: "var(--border)" }}
        >
          <Clock size={15} style={{ color: "var(--brand)" }} />
          <h2 className="font-semibold text-sm">{dict.today}</h2>
        </div>
        {todayTasks.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <CheckCircle2
              size={28}
              className="mx-auto mb-2"
              style={{ color: "var(--success)" }}
            />
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              {lang === "ar"
                ? "لا توجد مهام مجدولة اليوم"
                : "No tasks scheduled for today"}
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {todayTasks.map((t) => (
              <TaskRow key={t.id} task={t} />
            ))}
          </div>
        )}
      </div>

      {/* Week calendar */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <div
          className="px-5 py-4 border-b flex items-center gap-2"
          style={{ borderColor: "var(--border)" }}
        >
          <Calendar size={15} style={{ color: "var(--brand)" }} />
          <h2 className="font-semibold text-sm">{dict.schedule}</h2>
        </div>

        {weeks.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              {lang === "ar" ? "لا توجد مهام مجدولة" : "No tasks scheduled"}
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {weeks.map((week) => {
              const isCurrentWeek = week.key === todayWeekKey;
              const isExpanded = expandedWeeks.has(week.key);
              const weekTasks = week.days.flatMap((d) => d.tasks);
              const weekDone = weekTasks.filter((t) => t.completed).length;
              const weekTotal = weekTasks.length;

              return (
                <div key={week.key}>
                  <button
                    onClick={() => toggleWeek(week.key)}
                    className="w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors"
                    style={{
                      background: isCurrentWeek
                        ? "rgba(37,99,235,0.04)"
                        : "transparent",
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      {isCurrentWeek && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{
                            background: "var(--brand)",
                            color: "var(--brand-foreground)",
                          }}
                        >
                          {lang === "ar" ? "هذا الأسبوع" : "This week"}
                        </span>
                      )}
                      <span
                        className="text-sm font-medium"
                        style={{ color: "var(--foreground)" }}
                      >
                        {week.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className="text-xs"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {weekDone}/{weekTotal}
                      </span>
                      {isExpanded ? (
                        <ChevronUp
                          size={15}
                          style={{ color: "var(--muted-foreground)" }}
                        />
                      ) : (
                        <ChevronDown
                          size={15}
                          style={{ color: "var(--muted-foreground)" }}
                        />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-4 space-y-4">
                      {week.days.map(({ date, tasks: dayTasks }) => {
                        const d = new Date(date + "T00:00:00");
                        const isToday = date === todayStr;
                        const isPast = date < todayStr;
                        const locale =
                          lang === "ar" ? "ar-SA" : "en-US";
                        const dayLabel = d.toLocaleDateString(locale, {
                          weekday: "long",
                          month: "short",
                          day: "numeric",
                        });

                        return (
                          <div key={date}>
                            <p
                              className="text-xs font-semibold mb-2"
                              style={{
                                color: isToday
                                  ? "var(--brand)"
                                  : isPast
                                  ? "var(--muted-foreground)"
                                  : "var(--foreground)",
                              }}
                            >
                              {dayLabel}
                              {isToday
                                ? ` · ${lang === "ar" ? "اليوم" : "Today"}`
                                : ""}
                            </p>
                            <div className="space-y-2">
                              {dayTasks.map((t) => (
                                <TaskRow key={t.id} task={t} showPhase />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
