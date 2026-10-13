"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/landing/ui";

export default function NavigationLoader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const prevPathname = useRef(pathname);

  // Hide as soon as the new page's pathname is reflected
  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname;
      setVisible(false);
    }
  }, [pathname]);

  // Show on any same-origin anchor click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as Element).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Only trigger for internal navigations, not external links or anchors
      const isInternal =
        href.startsWith("/") ||
        href.startsWith(window.location.origin);
      const isModified = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
      const opensNewTab = anchor.target === "_blank";

      if (isInternal && !isModified && !opensNewTab && href !== pathname) {
        setVisible(true);
      }
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      style={{ background: "var(--background)", opacity: 0.92 }}
      aria-hidden="true"
    >
      <div className="nav-loader-pulse">
        <Logo size={64} />
      </div>
      <style>{`
        @keyframes nav-logo-pulse {
          0%   { opacity: 1;    transform: scale(1); }
          50%  { opacity: 0.35; transform: scale(0.88); }
          100% { opacity: 1;    transform: scale(1); }
        }
        .nav-loader-pulse {
          animation: nav-logo-pulse 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
