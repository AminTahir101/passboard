import type { Locale } from "./site";

const en = {
  meta: {
    title: "Moraje3 — AI-powered medical licensing exam preparation",
    description:
      "Practice real-world questions, understand every answer, and prepare for SMLE, SDLE, SPLE, USMLE and PLAB with an AI tutor.",
  },
  nav: {
    platform: "Platform",
    exams: "Exams",
    results: "Results",
    login: "Log in",
    request: "Request access",
    langSwitch: "عربي",
    langHref: "/ar",
    home: "Moraje3 home",
  },
  hero: {
    badge: "Private access platform",
    titleA: "Pass your licensing exam with ",
    titleEm: "AI‑guided",
    titleB: " practice.",
    sub: "Practice real-world questions, understand every answer, and prepare with an AI tutor that teaches you to think clinically.",
    cta: "Request access",
    pills: [
      { n: "4,823", t: "hand-curated questions" },
      { n: "12", t: "medical disciplines, one AI tutor" },
    ],
    examsPill: { n: "5", t: "licensing exams covered" },
    selectorLabel: "Choose your exam track",
    orbit: [
      "Smart practice",
      "Clinical reasoning",
      "Timed mock exams",
      "AI explanations",
      "Progress tracking",
      "Mistake review",
    ],
    chip: { v: "+27%", t: "accuracy in 5 weeks" },
    explore: {
      text: "See how the AI tutor explains every option — correct and incorrect.",
      cta: "Explore platform",
    },
  },
  stats: [
    { n: "4,823", t: "hand-curated questions" },
    { n: "12", t: "medical disciplines" },
    { n: "4", t: "exam types" },
    { n: "AI", t: "tutor included with every question" },
  ],
  exams: {
    eyebrow: "Exams covered",
    title: "Built for the exams that license you.",
    items: [
      { code: "SMLE", name: "Saudi Medical Licensing Exam" },
      { code: "SDLE", name: "Saudi Dental Licensing Exam" },
      { code: "SPLE", name: "Saudi Pharmacist Licensure Exam" },
      { code: "USMLE", name: "United States Medical Licensing Examination" },
      { code: "PLAB", name: "UK Professional and Linguistic Assessments Board" },
    ],
  },
  platform: {
    eyebrow: "The platform",
    titleA: "Everything you need to ",
    titleEm: "prepare",
    titleB: ", nothing else.",
    sub: "A focused, distraction-free environment built for one outcome: passing your exam.",
    features: {
      practice: {
        title: "Practice real-world questions",
        desc: "Work through curated exam-style MCQs across all major medical disciplines.",
        correct: "Correct",
      },
      understand: {
        title: "Understand every answer",
        desc: "Detailed justifications and per-option explanations show you exactly why answers are correct or incorrect.",
        caption: "questions, each with a written rationale",
      },
      ai: {
        title: "Learn with AI",
        desc: "An AI tutor that explains concepts, answers your questions, and teaches you to think clinically.",
        label: "AI tutor",
      },
      progress: {
        title: "Track your progress",
        desc: "See your accuracy by category and topic. Know exactly where to focus your study time.",
      },
      mock: {
        title: "Prepare with mock exams",
        desc: "Timed, realistic mock exams that simulate the pressure and format of the real exam.",
        questions: "questions",
        minutes: "minutes",
        pass: "to pass",
      },
      mistakes: {
        title: "Review your mistakes",
        desc: "Questions you got wrong resurface automatically, so you practise them until you master them.",
        review: "review",
        improving: "improving",
      },
    },
  },
  testimonials: {
    eyebrow: "What students say",
    title: "Real results from real students.",
    featured: {
      metric: "54 → 83%",
      quote: "“Going from 54% to 83% in six weeks. The mistake-review feature is what made the difference for me.”",
      name: "Lena Khalil",
      role: "SDLE candidate",
    },
    others: [
      {
        metric: "81%",
        label: "Accuracy after 5 weeks",
        quote: "“The AI explanations finally helped me understand the ‘why’ behind each answer — not just memorize the right choice.”",
        name: "Nora Al-Ghamdi",
        role: "SMLE candidate",
      },
      {
        metric: "78%",
        label: "Accuracy after 4 weeks",
        quote: "“Mock exams felt just like the real thing. The timing and question style gave me exactly the confidence I needed going in.”",
        name: "Faris Mansour",
        role: "USMLE Step 1 prep",
      },
    ],
  },
  cta: {
    eyebrow: "Get started",
    titleA: "Ready to start ",
    titleEm: "preparing?",
    sub: "Moraje3 is private-access. Request a place and we’ll contact you with the next steps.",
    button: "Request access",
  },
  footer: {
    login: "Log in",
    request: "Request access",
    privacy: "Privacy policy",
    terms: "Terms of service",
    disclaimer:
      "Moraje3 is an independent educational preparation platform. It is not affiliated with, endorsed by, or officially connected to any licensing authority. Content is provided for educational purposes only.",
  },
};

export type Dictionary = typeof en;

const ar: Dictionary = {
  meta: {
    title: "Moraje3 — استعداد لاختبارات الترخيص الطبي بالذكاء الاصطناعي",
    description:
      "تدرّب على أسئلة واقعية، وافهم كل إجابة، واستعد لاختبارات SMLE وSDLE وSPLE وUSMLE وPLAB مع مدرّس ذكي.",
  },
  nav: {
    platform: "المنصة",
    exams: "الاختبارات",
    results: "النتائج",
    login: "تسجيل الدخول",
    request: "اطلب الوصول",
    langSwitch: "English",
    langHref: "/en",
    home: "الصفحة الرئيسية لـ Moraje3",
  },
  hero: {
    badge: "منصة بوصول خاص",
    titleA: "اجتز اختبار الترخيص مع تدريب ",
    titleEm: "موجّه بالذكاء الاصطناعي",
    titleB: ".",
    sub: "تدرّب على أسئلة واقعية، وافهم كل إجابة، واستعد مع مدرّس ذكي يعلّمك التفكير السريري.",
    cta: "اطلب الوصول",
    pills: [
      { n: "4,823", t: "سؤالاً منتقى بعناية" },
      { n: "12", t: "تخصصاً طبياً ومدرّس ذكي واحد" },
    ],
    examsPill: { n: "5", t: "اختبارات ترخيص مشمولة" },
    selectorLabel: "اختر مسار اختبارك",
    orbit: [
      "تدريب ذكي",
      "التفكير السريري",
      "اختبارات تجريبية مؤقتة",
      "شرح بالذكاء الاصطناعي",
      "تتبّع التقدّم",
      "مراجعة الأخطاء",
    ],
    chip: { v: "+27%", t: "دقة أعلى خلال 5 أسابيع" },
    explore: {
      text: "شاهد كيف يشرح المدرّس الذكي كل خيار — الصحيح والخاطئ.",
      cta: "استكشف المنصة",
    },
  },
  stats: [
    { n: "4,823", t: "سؤالاً منتقى يدوياً" },
    { n: "12", t: "تخصصاً طبياً" },
    { n: "4", t: "أنواع اختبارات" },
    { n: "AI", t: "مدرّس ذكي مع كل سؤال" },
  ],
  exams: {
    eyebrow: "الاختبارات المشمولة",
    title: "مصممة للاختبارات التي تمنحك الترخيص.",
    items: [
      { code: "SMLE", name: "الاختبار السعودي للترخيص الطبي" },
      { code: "SDLE", name: "الاختبار السعودي لترخيص أطباء الأسنان" },
      { code: "SPLE", name: "الاختبار السعودي لترخيص الصيادلة" },
      { code: "USMLE", name: "اختبار الترخيص الطبي الأمريكي" },
      { code: "PLAB", name: "اختبار التقييم المهني واللغوي البريطاني" },
    ],
  },
  platform: {
    eyebrow: "المنصة",
    titleA: "كل ما تحتاجه ",
    titleEm: "للاستعداد",
    titleB: "، ولا شيء غيره.",
    sub: "بيئة مركّزة وخالية من المشتتات، صُممت لهدف واحد: اجتياز اختبارك.",
    features: {
      practice: {
        title: "تدرّب على أسئلة واقعية",
        desc: "أسئلة اختيار من متعدد بأسلوب الاختبار، منتقاة عبر جميع التخصصات الطبية الرئيسية.",
        correct: "صحيح",
      },
      understand: {
        title: "افهم كل إجابة",
        desc: "تبريرات مفصّلة وشرح لكل خيار يوضح لك بالضبط لماذا تكون الإجابة صحيحة أو خاطئة.",
        caption: "سؤالاً، لكل منها شرح مكتوب",
      },
      ai: {
        title: "تعلّم مع الذكاء الاصطناعي",
        desc: "مدرّس ذكي يشرح المفاهيم، ويجيب عن أسئلتك، ويعلّمك التفكير السريري.",
        label: "المدرّس الذكي",
      },
      progress: {
        title: "تتبّع تقدّمك",
        desc: "اطّلع على دقتك حسب الفئة والموضوع، واعرف بالضبط أين تركّز وقت مذاكرتك.",
      },
      mock: {
        title: "استعد باختبارات تجريبية",
        desc: "اختبارات تجريبية مؤقتة وواقعية تحاكي ضغط الاختبار الحقيقي وشكله.",
        questions: "سؤال",
        minutes: "دقيقة",
        pass: "للنجاح",
      },
      mistakes: {
        title: "راجع أخطاءك",
        desc: "تعود الأسئلة التي أخطأت فيها تلقائياً لتتدرّب عليها حتى تتقنها.",
        review: "مراجعة",
        improving: "في تحسّن",
      },
    },
  },
  testimonials: {
    eyebrow: "آراء الطلاب",
    title: "نتائج حقيقية من طلاب حقيقيين.",
    featured: {
      metric: "54 → 83%",
      quote: "«من 54% إلى 83% في ستة أسابيع. ميزة مراجعة الأخطاء هي ما صنع الفرق بالنسبة لي.»",
      name: "لينا خليل",
      role: "مرشّحة SDLE",
    },
    others: [
      {
        metric: "81%",
        label: "الدقة بعد 5 أسابيع",
        quote: "«شروحات الذكاء الاصطناعي ساعدتني أخيراً على فهم السبب وراء كل إجابة — لا مجرد حفظ الخيار الصحيح.»",
        name: "نورة الغامدي",
        role: "مرشّحة SMLE",
      },
      {
        metric: "78%",
        label: "الدقة بعد 4 أسابيع",
        quote: "«الاختبارات التجريبية كانت تماماً مثل الاختبار الحقيقي. التوقيت وأسلوب الأسئلة منحاني الثقة التي احتجتها.»",
        name: "فارس منصور",
        role: "تحضير USMLE Step 1",
      },
    ],
  },
  cta: {
    eyebrow: "ابدأ الآن",
    titleA: "مستعد لبدء ",
    titleEm: "الاستعداد؟",
    sub: "الوصول إلى Moraje3 خاص. اطلب مكانك وسنتواصل معك بالخطوات التالية.",
    button: "اطلب الوصول",
  },
  footer: {
    login: "تسجيل الدخول",
    request: "اطلب الوصول",
    privacy: "سياسة الخصوصية",
    terms: "شروط الخدمة",
    disclaimer:
      "Moraje3 منصة تعليمية مستقلة للتحضير، وليست تابعة لأي جهة ترخيص أو معتمدة منها أو مرتبطة بها رسمياً. المحتوى مقدّم لأغراض تعليمية فقط.",
  },
};

const dictionaries: Record<Locale, Dictionary> = { en, ar };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
