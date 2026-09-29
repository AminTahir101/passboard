"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Play,
  BookOpen,
  ClipboardList,
  Brain,
  XCircle,
  BarChart3,
  User,
  LogOut,
  Menu,
  X,
  GraduationCap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { localePath } from "@/lib/i18n";
import LanguageToggle from "@/components/LanguageToggle";

interface AppSidebarProps {
  userName: string | null;
  userEmail: string;
  lang: string;
  nav: {
    dashboard: string; practice: string; questionBank: string;
    mockExams: string; aiTutor: string; myMistakes: string;
    performance: string; profile: string; logout: string;
  };
  langToggleLabel: string;
}

export default function AppSidebar({ userName, userEmail, lang, nav, langToggleLabel }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: nav.dashboard, icon: LayoutDashboard, href: localePath(lang, "/dashboard") },
    { label: nav.practice, icon: Play, href: localePath(lang, "/practice") },
    { label: nav.questionBank, icon: BookOpen, href: localePath(lang, "/questions") },
    { label: nav.mockExams, icon: ClipboardList, href: localePath(lang, "/mock-exams") },
    { label: nav.aiTutor, icon: Brain, href: localePath(lang, "/tutor") },
    { label: nav.myMistakes, icon: XCircle, href: localePath(lang, "/mistakes") },
    { label: nav.performance, icon: BarChart3, href: localePath(lang, "/performance") },
    { label: nav.profile, icon: User, href: localePath(lang, "/profile") },
  ];

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(localePath(lang, "/login"));
  }

  function isActive(href: string) {
    const pathWithoutLang = pathname.replace(`/${lang}`, "") || "/";
    if (href === localePath(lang, "/dashboard")) return pathWithoutLang === "/dashboard";
    return pathWithoutLang.startsWith(href.replace(`/${lang}`, ""));
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5 border-b" style={{ borderColor: "var(--border)" }}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "var(--brand)" }}
        >
          <GraduationCap size={18} style={{ color: "var(--brand-foreground)" }} />
        </div>
        <span className="font-semibold text-base" style={{ color: "var(--foreground)" }}>
          Moraje3
        </span>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-0.5">
          {navItems.map(({ label, icon: Icon, href }) => {
            const active = isActive(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    background: active ? "var(--brand)" : "transparent",
                    color: active ? "var(--brand-foreground)" : "var(--muted-foreground)",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = "var(--muted)";
                      e.currentTarget.style.color = "var(--foreground)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "var(--muted-foreground)";
                    }
                  }}
                >
                  <Icon size={17} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User info + logout */}
      <div className="px-3 py-4 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg mb-1" style={{ background: "var(--muted)" }}>
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
            style={{ background: "var(--brand)", color: "var(--brand-foreground)" }}
          >
            {(userName || userEmail).charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium truncate" style={{ color: "var(--foreground)" }}>
              {userName || "Student"}
            </p>
            <p className="text-xs truncate" style={{ color: "var(--muted-foreground)" }}>
              {userEmail}
            </p>
          </div>
        </div>
        <div className="mb-1 px-1">
          <LanguageToggle lang={lang} label={langToggleLabel} />
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
          style={{ color: "var(--muted-foreground)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--muted)";
            e.currentTarget.style.color = "var(--destructive)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--muted-foreground)";
          }}
        >
          <LogOut size={17} />
          {nav.logout}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar - fixed */}
      <aside
        className="hidden lg:flex flex-col w-60 border-r fixed inset-y-0 left-0 z-30"
        style={{ borderColor: "var(--border)", background: "var(--card)" }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile header - fixed */}
      <header
        className="lg:hidden flex items-center justify-between px-4 py-3 border-b fixed top-0 left-0 right-0 z-30"
        style={{ borderColor: "var(--border)", background: "var(--card)" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "var(--brand)" }}
          >
            <GraduationCap size={15} style={{ color: "var(--brand-foreground)" }} />
          </div>
          <span className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>
            Moraje3
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg"
          style={{ color: "var(--muted-foreground)" }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.4)" }}
            onClick={() => setMobileOpen(false)}
          />
          <div
            className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 flex flex-col"
            style={{ background: "var(--card)", borderRight: "1px solid var(--border)" }}
          >
            <SidebarContent />
          </div>
        </>
      )}
    </>
  );
}
