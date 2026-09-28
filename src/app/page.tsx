import Link from "next/link";
import { ArrowRight, BookOpen, Brain, BarChart3, ClipboardList, CheckCircle2, Target } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      {/* Nav */}
      <header className="border-b sticky top-0 z-10" style={{ borderColor: "var(--border)", background: "var(--background)" }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-semibold text-lg tracking-tight">Moraje3</span>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium px-4 py-2 rounded-md transition-colors"
              style={{ color: "var(--muted-foreground)" }}
            >
              Login
            </Link>
            <Link
              href="/request-access"
              className="text-sm font-medium px-4 py-2 rounded-md transition-colors hover:opacity-90"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              Request Access
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-6 py-28 text-center">
        <div className="max-w-3xl mx-auto">
          <div
            className="inline-block text-xs font-medium px-3 py-1 rounded-full mb-8"
            style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}
          >
            Private Access Platform
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6" style={{ lineHeight: "1.1", letterSpacing: "-0.02em" }}>
            Moraje3
          </h1>
          <p className="text-xl sm:text-2xl mb-4" style={{ color: "var(--foreground)", fontWeight: 500 }}>
            AI-powered preparation for your professional medical licensing exam.
          </p>
          <p className="text-lg mb-10" style={{ color: "var(--muted-foreground)" }}>
            Practice real-world questions, understand every answer, and prepare with an intelligent AI tutor.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/request-access"
              className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-lg transition-all hover:opacity-90"
              style={{ background: "var(--brand)", color: "var(--brand-foreground)" }}
            >
              Request Access
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-medium px-6 py-3 rounded-lg border transition-all hover:opacity-80"
              style={{ borderColor: "var(--border)", color: "var(--foreground)", background: "var(--background)" }}
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t py-20 px-6" style={{ borderColor: "var(--border)", background: "var(--secondary)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight mb-3">Everything you need to prepare</h2>
            <p style={{ color: "var(--muted-foreground)" }}>A focused, distraction-free environment built for exam success.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-xl border"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: "#eff6ff" }}
                >
                  <f.icon size={20} style={{ color: "var(--brand)" }} />
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Ready to start preparing?</h2>
          <p className="mb-8 text-lg" style={{ color: "var(--muted-foreground)" }}>
            Request access and we will contact you with the next steps.
          </p>
          <Link
            href="/request-access"
            className="inline-flex items-center gap-2 text-sm font-semibold px-8 py-3 rounded-lg transition-all hover:opacity-90"
            style={{ background: "var(--brand)", color: "var(--brand-foreground)" }}
          >
            Request Access
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-6" style={{ borderColor: "var(--border)", background: "var(--secondary)" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-semibold">Moraje3</span>
          <p className="text-xs text-center" style={{ color: "var(--muted-foreground)", maxWidth: "520px" }}>
            Moraje3 is an independent educational preparation platform. It is not affiliated with, endorsed by, or
            officially connected to any licensing authority. Content is provided for educational purposes only.
          </p>
          <div className="flex gap-4 text-xs" style={{ color: "var(--muted-foreground)" }}>
            <Link href="/login" className="hover:underline">Login</Link>
            <Link href="/request-access" className="hover:underline">Request Access</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: BookOpen,
    title: "Practice Real-World Questions",
    desc: "Work through curated exam-style MCQs across all major medical disciplines.",
  },
  {
    icon: CheckCircle2,
    title: "Understand Every Answer",
    desc: "Detailed justifications and per-option explanations show you exactly why answers are correct or incorrect.",
  },
  {
    icon: Brain,
    title: "Learn with AI",
    desc: "An AI tutor that explains concepts, answers your questions, and teaches you to think clinically.",
  },
  {
    icon: BarChart3,
    title: "Track Your Progress",
    desc: "See your accuracy by category and topic. Know exactly where to focus your study time.",
  },
  {
    icon: ClipboardList,
    title: "Prepare with Mock Exams",
    desc: "Timed, realistic mock exams that simulate the pressure and format of the real exam.",
  },
  {
    icon: Target,
    title: "Review Your Mistakes",
    desc: "Automatically surface questions you got wrong so you can practice and master them.",
  },
];
