'use client';

import { useAnatomyStore } from '@/store/anatomyStore';
import { ChevronRight } from 'lucide-react';

interface AnatomyBreadcrumbProps {
  lang: 'en' | 'ar';
}

export default function AnatomyBreadcrumb({ lang }: AnatomyBreadcrumbProps) {
  const { breadcrumb, nodeCache, navigateTo } = useAnatomyStore();
  const isAr = lang === 'ar';

  if (breadcrumb.length === 0) return null;

  return (
    <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide min-w-0">
      {breadcrumb.map((id, idx) => {
        const node = nodeCache[id];
        const isLast = idx === breadcrumb.length - 1;
        const displayName = isAr && node?.nameAr ? node.nameAr : (node?.nameEn ?? id);

        return (
          <div key={id} className="flex items-center gap-1 shrink-0">
            {idx > 0 && (
              <ChevronRight size={11} style={{ color: 'rgba(255,255,255,0.2)' }} />
            )}
            <button
              onClick={() => !isLast && navigateTo(breadcrumb.slice(0, idx + 1))}
              className="text-xs font-medium px-1.5 py-0.5 rounded transition-colors"
              style={{
                color: isLast ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)',
                cursor: isLast ? 'default' : 'pointer',
              }}
              onMouseEnter={(e) => { if (!isLast) e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
              onMouseLeave={(e) => { if (!isLast) e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}
            >
              {displayName}
            </button>
          </div>
        );
      })}
    </nav>
  );
}
