// Study plan generation algorithm.
// Pure functions — no I/O, no side effects.

export interface PlanConfig {
  examDate: string;           // YYYY-MM-DD
  studyDays: number[];        // 0=Sun 1=Mon … 6=Sat
  questionsPerDay: number;
  mockDay: number | null;     // day-of-week for weekly mock, null = none
  mockSize: number | null;    // 50 or 100
  focusSpecialties: string[]; // empty = use all
  weakSpecialties: string[];  // bottom-third by accuracy, derived at creation time
  allSpecialties: string[];   // all published categories
}

export interface TaskRow {
  scheduled_date: string;  // YYYY-MM-DD
  task_type: "practice" | "mock_exam" | "review";
  phase: "foundation" | "reinforcement" | "final_review";
  specialty: string | null;
  question_count: number;
  position: number;
}

function toDateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

function getStudyDates(from: Date, examDate: Date, studyDays: number[]): Date[] {
  const dates: Date[] = [];
  const cursor = new Date(from);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(examDate);
  end.setHours(0, 0, 0, 0);
  while (cursor < end) {
    if (studyDays.includes(cursor.getDay())) {
      dates.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

/**
 * Generate the full day-by-day task list for a plan.
 * fromDate defaults to today; pass a different date for "rebuild from today".
 */
export function generateTasks(config: PlanConfig, fromDate?: Date): TaskRow[] {
  const from = fromDate ? new Date(fromDate) : new Date();
  from.setHours(0, 0, 0, 0);
  const examDate = new Date(config.examDate + "T00:00:00");

  const studyDates = getStudyDates(from, examDate, config.studyDays);
  if (studyDates.length === 0) return [];

  const n = studyDates.length;
  const foundationEnd = Math.round(n * 0.4);
  const reinforcementEnd = Math.round(n * 0.8);

  // Specialties pool
  const specialties =
    config.focusSpecialties.length > 0
      ? config.focusSpecialties
      : config.allSpecialties;
  const weakSpecialties =
    config.weakSpecialties.length > 0
      ? config.weakSpecialties
      : specialties;

  const tasks: TaskRow[] = [];

  for (let i = 0; i < studyDates.length; i++) {
    const date = studyDates[i];
    const dateStr = toDateStr(date);
    const dayOfWeek = date.getDay();
    const isLastDay = i === studyDates.length - 1;

    const phase: "foundation" | "reinforcement" | "final_review" =
      i < foundationEnd
        ? "foundation"
        : i < reinforcementEnd
        ? "reinforcement"
        : "final_review";

    // Weekly mock exam — skip in final_review phase
    if (
      config.mockDay !== null &&
      dayOfWeek === config.mockDay &&
      phase !== "final_review"
    ) {
      tasks.push({
        scheduled_date: dateStr,
        task_type: "mock_exam",
        phase,
        specialty: null,
        question_count: config.mockSize ?? 50,
        position: 0,
      });
      continue;
    }

    // Last study day before exam: light review only
    if (isLastDay) {
      tasks.push({
        scheduled_date: dateStr,
        task_type: "review",
        phase: "final_review",
        specialty: null,
        question_count: Math.min(10, config.questionsPerDay),
        position: 0,
      });
      continue;
    }

    // Final review phase: practice + occasional mistake review
    if (phase === "final_review") {
      tasks.push({
        scheduled_date: dateStr,
        task_type: "practice",
        phase,
        specialty: null,
        question_count: config.questionsPerDay,
        position: 0,
      });
      // Mistake review every other day
      if (i % 2 === 0) {
        tasks.push({
          scheduled_date: dateStr,
          task_type: "review",
          phase,
          specialty: null,
          question_count: Math.min(10, config.questionsPerDay),
          position: 1,
        });
      }
      continue;
    }

    // Foundation: rotate evenly through specialties
    if (phase === "foundation") {
      const specialty =
        specialties.length > 0 ? specialties[i % specialties.length] : null;
      tasks.push({
        scheduled_date: dateStr,
        task_type: "practice",
        phase,
        specialty,
        question_count: config.questionsPerDay,
        position: 0,
      });
      continue;
    }

    // Reinforcement: 60% on weak specialties, 40% on all, mistake review every 5 days
    if (phase === "reinforcement") {
      const rIdx = i - foundationEnd;
      let specialty: string | null;
      if (rIdx % 5 < 3 && weakSpecialties.length > 0) {
        specialty = weakSpecialties[rIdx % weakSpecialties.length];
      } else if (specialties.length > 0) {
        specialty = specialties[rIdx % specialties.length];
      } else {
        specialty = null;
      }

      tasks.push({
        scheduled_date: dateStr,
        task_type: "practice",
        phase,
        specialty,
        question_count: config.questionsPerDay,
        position: 0,
      });

      if (rIdx % 5 === 4) {
        tasks.push({
          scheduled_date: dateStr,
          task_type: "review",
          phase,
          specialty: null,
          question_count: Math.min(10, config.questionsPerDay),
          position: 1,
        });
      }
    }
  }

  return tasks;
}

/** Client-side summary preview — pure computation, no DB needed. */
export function computePlanSummary(config: {
  examDate: string;
  studyDays: number[];
  questionsPerDay: number;
  mockDay: number | null;
  mockSize: number | null;
}): {
  totalStudyDays: number;
  totalWeeks: number;
  practiceSessions: number;
  totalPracticeQuestions: number;
  mockExams: number;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const examDate = new Date(config.examDate + "T00:00:00");

  if (examDate <= today) {
    return {
      totalStudyDays: 0,
      totalWeeks: 0,
      practiceSessions: 0,
      totalPracticeQuestions: 0,
      mockExams: 0,
    };
  }

  let totalStudyDays = 0;
  let mockExams = 0;
  const cursor = new Date(today);

  while (cursor < examDate) {
    if (config.studyDays.includes(cursor.getDay())) {
      totalStudyDays++;
      if (
        config.mockDay !== null &&
        cursor.getDay() === config.mockDay
      ) {
        mockExams++;
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  const practiceSessions = totalStudyDays - mockExams;
  const totalWeeks = Math.ceil(totalStudyDays / 7);
  const totalPracticeQuestions = practiceSessions * config.questionsPerDay;

  return {
    totalStudyDays,
    totalWeeks,
    practiceSessions,
    totalPracticeQuestions,
    mockExams,
  };
}
