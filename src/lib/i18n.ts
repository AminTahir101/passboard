// src/lib/i18n.ts
export type Locale = "ar" | "en";
export const SUPPORTED_LOCALES: Locale[] = ["ar", "en"];
export const DEFAULT_LOCALE: Locale = "ar";

export type Dictionary = {
  common: {
    loading: string; error: string; save: string; saveChanges: string;
    cancel: string; delete: string; edit: string; back: string; next: string;
    previous: string; submit: string; confirm: string; yes: string; no: string;
    search: string; filter: string; all: string; status: string; actions: string;
    name: string; email: string; phone: string; date: string; notes: string;
    optional: string; success: string; failed: string; close: string;
    manage: string; create: string; import: string;
    easy: string; medium: string; hard: string;
    published: string; draft: string; archived: string;
    active: string; pending: string; suspended: string; expired: string;
    correct: string; incorrect: string; unanswered: string;
    total: string; accuracy: string; score: string; never: string;
    questions: string; students: string; category: string; topic: string;
    difficulty: string; noData: string; attempts: string;
  };
  nav: {
    dashboard: string; practice: string; questionBank: string;
    mockExams: string; aiTutor: string; myMistakes: string;
    performance: string; profile: string; logout: string;
    accessRequests: string; students: string; questions: string;
    importQuestions: string; adminDashboard: string; anatomy: string;
  };
  lang: { toggle: string; ar: string; en: string };
  landing: {
    badge: string; tagline: string; description: string;
    requestAccess: string; login: string;
    featuresTitle: string; featuresSubtitle: string;
    ctaTitle: string; ctaDesc: string;
    footerDisclaimer: string;
    features: { title: string; desc: string }[];
    navLinks: { platform: string; exams: string; results: string; langSwitch: string };
    hero: {
      badge: string;
      titleA: string; titleEm: string; titleB: string;
      sub: string; cta: string;
      pills: { n: string; t: string }[];
      examsPill: { n: string; t: string };
      selectorLabel: string;
      orbit: string[];
      chip?: { v: string; t: string };
      explore: { text: string; cta: string };
    };
    stats: { n: string; t: string }[];
    exams: { eyebrow: string; title: string; items: { code: string; name: string }[] };
    platform: {
      eyebrow: string; titleA: string; titleEm: string; titleB: string; sub: string;
      feats: {
        practice: { title: string; desc: string; correct: string };
        understand: { title: string; desc: string; caption: string };
        ai: { title: string; desc: string; label: string };
        progress: { title: string; desc: string };
        mock: { title: string; desc: string; questions: string; minutes: string; pass: string };
        mistakes: { title: string; desc: string; review: string; improving: string };
      };
    };
    howItWorks: {
      eyebrow: string; title: string;
      featured: { headline: string; body: string };
      pillars: { n: string; title: string; desc: string }[];
    };
    ctaSection: { eyebrow: string; titleA: string; titleEm: string; sub: string; button: string };
  };
  login: {
    title: string; subtitle: string; emailLabel: string;
    passwordLabel: string; submit: string; error: string;
  };
  requestAccess: {
    title: string; subtitle: string; fullName: string; email: string;
    phone: string; targetExam: string; examDate: string; notes: string;
    submit: string; successTitle: string; successMessage: string;
    examOptions: string[];
  };
  unauthorized: {
    suspendedTitle: string; suspendedMessage: string;
    expiredTitle: string; expiredMessage: string;
    pendingTitle: string; pendingMessage: string;
    signOut: string;
  };
  dashboard: {
    title: string; targetExam: string; daysToExam: string;
    totalAnswered: string; accuracy: string; correct: string; incorrect: string;
    strongestTopic: string; weakestTopic: string; recentActivity: string;
    quickActions: string; startPractice: string; startMockExam: string;
    askAITutor: string; reviewMistakes: string; exploreAnatomy: string;
    noActivity: string; noTopicData: string; notSet: string; na: string;
  };
  practice: {
    title: string; subtitle: string;
    random: string; randomDesc: string;
    byCategory: string; byCategoryDesc: string;
    byTopic: string; byTopicDesc: string;
    incorrect: string; incorrectDesc: string;
    unanswered: string; unansweredDesc: string;
    questionCount: string; start: string;
    selectCategory: string; selectTopic: string; noQuestions: string;
  };
  practiceSession: {
    questionOf: string; submitAnswer: string;
    correctBanner: string; incorrectBanner: string;
    correctAnswer: string; justification: string;
    whyThisIsWrong: string; askAI: string; next: string; finish: string;
    sessionComplete: string; totalQuestions: string;
    correctAnswers: string; accuracy: string;
    reviewMistakes: string; practiceAgain: string; goToDashboard: string;
  };
  questionBank: {
    title: string; allExams: string; allCategories: string;
    allTopics: string; allDifficulties: string; allStatuses: string;
    noQuestions: string; yourAnswer: string; correctAnswer: string;
    answeredOn: string; notAttempted: string;
  };
  mistakes: {
    title: string; subtitle: string;
    allCategories: string; allTopics: string;
    noMistakes: string; noMistakesDesc: string; practiceAll: string;
    yourAnswer: string; correctAnswer: string; justification: string;
  };
  performance: {
    title: string; totalAnswered: string; accuracy: string;
    thisWeek: string; weeklyAccuracy: string; accuracyByCategory: string;
    strongestTopics: string; weakestTopics: string; recentMockExams: string;
    noData: string; noExams: string; attempts: string; score: string;
    date: string; review: string;
  };
  mockExams: {
    title: string; newExam: string; inProgress: string; completed: string;
    noExams: string; noExamsDesc: string; startNew: string;
    resume: string; results: string; questions: string;
    started: string; completedAt: string; score: string;
  };
  mockExamNew: {
    title: string; subtitle: string; examType: string;
    questionCount: string; start: string;
    selectExam: string; allExams: string; q50: string; q100: string;
  };
  mockExamSession: {
    questionOf: string; flagged: string; flag: string; unflag: string;
    previous: string; next: string; submit: string;
    confirmTitle: string; confirmMessage: string;
    unansweredWarning: string; cancel: string;
    timeRemaining: string;
  };
  mockExamResults: {
    title: string; score: string; passed: string; failed: string;
    totalQuestions: string; correct: string; incorrect: string;
    unanswered: string; accuracy: string; timeTaken: string;
    accuracyByCategory: string; strongestTopics: string; weakestTopics: string;
    reviewAnswers: string; newExam: string; backToExams: string;
  };
  mockExamReview: {
    title: string; questionOf: string;
    correct: string; incorrect: string; unanswered: string;
    yourAnswer: string; correctAnswer: string; justification: string;
    flagged: string; previous: string; next: string; backToResults: string;
  };
  tutor: {
    title: string; subtitle: string; newConversation: string;
    conversations: string; noConversations: string;
    placeholder: string; send: string; thinking: string;
    questionContext: string; suggestedPrompts: string[];
  };
  profile: {
    title: string; accountInfo: string; fullName: string; email: string;
    phone: string; targetExam: string; examDate: string;
    accessStatus: string; accessExpires: string;
    editProfile: string; save: string; cancel: string;
    never: string; updateSuccess: string;
  };
  admin: {
    dashboard: {
      title: string; totalStudents: string; activeStudents: string;
      expiredStudents: string; pendingRequests: string;
      totalQuestions: string; publishedQuestions: string;
      totalAttempts: string; recentRequests: string; recentStudents: string;
      viewAll: string; noRequests: string; noStudents: string;
    };
    accessRequests: {
      title: string; approve: string; reject: string;
      pending: string; approved: string; rejected: string;
      createAccount: string; accountCreated: string;
      tempPassword: string; copyPassword: string;
      notes: string; requestedOn: string; noRequests: string;
      phone: string; targetExam: string;
    };
    students: {
      title: string; targetExam: string; examDate: string;
      status: string; expires: string; manage: string; noStudents: string;
      activate: string; suspend: string; reactivate: string;
      setExpiry: string; extend30: string; extend60: string; extend90: string;
      performanceStats: string; mockExamHistory: string;
      totalAnswered: string; accuracy: string; correct: string; incorrect: string;
    };
    questions: {
      title: string; newQuestion: string; importCsv: string;
      noQuestions: string; createFirst: string; deleteConfirm: string;
      deleteBlocked: string;
    };
    import: {
      title: string; subtitle: string; step1: string; step2: string; step3: string;
      uploadArea: string; dragDrop: string; browse: string;
      validRows: string; invalidRows: string; errors: string;
      importAsDraft: string; importAsPublished: string;
      importing: string; successMsg: string; failedMsg: string;
      requiredColumns: string;
    };
    questionForm: {
      questionText: string; optionA: string; optionB: string;
      optionC: string; optionD: string; correctAnswer: string;
      justification: string; explanationA: string; explanationB: string;
      explanationC: string; explanationD: string;
      exam: string; category: string; topic: string; subtopic: string;
      difficulty: string; year: string; source: string; status: string;
      saveAsDraft: string; publish: string; saveChanges: string;
      selectAnswer: string; selectDifficulty: string; selectStatus: string;
    };
  };
};

export async function getDictionary(lang: string): Promise<Dictionary> {
  const locale: Locale = SUPPORTED_LOCALES.includes(lang as Locale)
    ? (lang as Locale)
    : DEFAULT_LOCALE;
  if (locale === "en") {
    const { en } = await import("@/dictionaries/en");
    return en;
  }
  const { ar } = await import("@/dictionaries/ar");
  return ar;
}

export function localePath(lang: string, path: string): string {
  const normalised = path.startsWith("/") ? path : `/${path}`;
  return `/${lang}${normalised}`;
}
