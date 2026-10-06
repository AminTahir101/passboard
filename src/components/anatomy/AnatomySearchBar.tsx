'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { AnatomySearchResult } from '@/types/anatomy';
import { Search, X } from 'lucide-react';

interface AnatomySearchBarProps {
  lang: 'en' | 'ar';
  onSelect: (nodeId: string) => void;
}

export default function AnatomySearchBar({ lang, onSelect }: AnatomySearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AnatomySearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isAr = lang === 'ar';

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/anatomy/search?q=${encodeURIComponent(q)}&limit=8`);
      const { results: r } = await res.json();
      setResults(r ?? []);
      setOpen(true);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 200);
  };

  const handleSelect = (r: AnatomySearchResult) => {
    onSelect(r.nodeId);
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <div
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors"
        style={{
          background: focused ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)',
          border: `1px solid ${focused ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
        }}
      >
        <Search size={13} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => { setFocused(true); if (results.length) setOpen(true); }}
          onBlur={() => setFocused(false)}
          placeholder={isAr ? 'ابحث عن بنية…' : 'Search structures…'}
          className="flex-1 min-w-0 bg-transparent text-xs outline-none"
          style={{ color: 'rgba(255,255,255,0.8)' }}
        />
        {query && (
          <button onClick={handleClear} className="shrink-0">
            <X size={12} style={{ color: 'rgba(255,255,255,0.3)' }} />
          </button>
        )}
        {loading && (
          <div
            className="w-3 h-3 rounded-full border border-t-transparent animate-spin shrink-0"
            style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'transparent' }}
          />
        )}
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div
          className="absolute top-full mt-1 left-0 right-0 rounded-xl overflow-hidden z-50 shadow-2xl"
          style={{
            background: '#1a1d27',
            border: '1px solid rgba(255,255,255,0.1)',
            maxHeight: 280,
            overflowY: 'auto',
          }}
        >
          {results.map((r) => (
            <button
              key={r.nodeId}
              onClick={() => handleSelect(r)}
              className="w-full flex items-start gap-2.5 px-3 py-2.5 text-left transition-colors"
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <span
                className="shrink-0 w-1.5 h-1.5 rounded-full mt-1.5"
                style={{ background: TYPE_COLORS[r.structureType] ?? '#fff' }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-white truncate">{r.nameEn}</p>
                {r.nameLatin && (
                  <p className="text-xs italic truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {r.nameLatin}
                  </p>
                )}
              </div>
              <span
                className="shrink-0 text-xs px-1.5 py-0.5 rounded font-medium"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}
              >
                {r.structureType}
              </span>
            </button>
          ))}
        </div>
      )}

      {open && query.length >= 2 && !loading && results.length === 0 && (
        <div
          className="absolute top-full mt-1 left-0 right-0 rounded-xl px-3 py-3 text-xs text-center z-50"
          style={{ background: '#1a1d27', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' }}
        >
          {isAr ? 'لا نتائج' : 'No results found'}
        </div>
      )}
    </div>
  );
}

const TYPE_COLORS: Record<string, string> = {
  bone: '#e2e8f0', muscle: '#c05621', joint: '#f6ad55', nerve: '#d69e2e',
  artery: '#e53e3e', vein: '#3182ce', lymphatic: '#38a169', organ: '#805ad5',
  ligament: '#f6ad55', fascia: '#a0aec0', tendon: '#f6ad55', bursa: '#81e6d9',
  gland: '#f687b3', region: '#90cdf4', cavity: '#90cdf4', other: '#718096',
};
