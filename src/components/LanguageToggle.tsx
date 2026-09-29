"use client";

import { usePathname, useRouter } from "next/navigation";

interface LanguageToggleProps {
  lang: string;
  label: string; // dict.lang.toggle
}

export default function LanguageToggle({ lang, label }: LanguageToggleProps) {
  const pathname = usePathname();
  const router = useRouter();

  function toggle() {
    const targetLang = lang === "ar" ? "en" : "ar";
    // Replace the first path segment (the locale)
    const segments = pathname.split("/");
    segments[1] = targetLang;
    const newPath = segments.join("/") || `/${targetLang}`;
    // Save preference in cookie
    document.cookie = `NEXT_LOCALE=${targetLang};path=/;max-age=31536000`;
    router.push(newPath);
  }

  return (
    <button
      onClick={toggle}
      className="text-xs px-2.5 py-1.5 rounded-lg font-medium border transition-colors hover:opacity-80"
      style={{
        borderColor: "var(--border)",
        color: "var(--muted-foreground)",
        background: "var(--background)",
      }}
    >
      {label}
    </button>
  );
}
