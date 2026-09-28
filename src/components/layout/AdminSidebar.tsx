"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, BookOpen, FileUp, Inbox, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Access Requests", href: "/admin/access-requests", icon: Inbox },
  { label: "Students", href: "/admin/students", icon: Users },
  { label: "Questions", href: "/admin/questions", icon: BookOpen },
  { label: "Import Questions", href: "/admin/questions/import", icon: FileUp },
];

interface AdminSidebarProps {
  adminName: string;
}

export function AdminSidebar({ adminName }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: "var(--border)" }}>
        <Link href="/admin" className="font-semibold text-base tracking-tight">
          Moraje3 <span className="text-xs font-normal ml-1" style={{ color: "var(--muted-foreground)" }}>Admin</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                background: active ? "var(--secondary)" : "transparent",
                color: active ? "var(--foreground)" : "var(--muted-foreground)",
              }}
            >
              <item.icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="px-3 py-2 mb-1">
          <p className="text-xs font-medium truncate">{adminName}</p>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Administrator</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors hover:opacity-80"
          style={{ color: "var(--muted-foreground)" }}
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col w-56 border-r flex-shrink-0"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile header */}
      <div
        className="lg:hidden flex items-center justify-between px-4 h-14 border-b"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <Link href="/admin" className="font-semibold text-sm">Moraje3 Admin</Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-1.5 rounded-lg">
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="w-56 flex flex-col border-r"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}
          >
            {sidebarContent}
          </div>
          <div
            className="flex-1"
            style={{ background: "rgba(0,0,0,0.4)" }}
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}
    </>
  );
}
