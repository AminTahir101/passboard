'use client';

import { useState } from 'react';
import type { AnatomySex } from '@/types/anatomy';
import { Layers, ChevronRight } from 'lucide-react';

interface BodySelectionProps {
  lang: 'en' | 'ar';
  onSelect: (sex: AnatomySex) => void;
}

export default function BodySelection({ lang, onSelect }: BodySelectionProps) {
  const [hovered, setHovered] = useState<AnatomySex | null>(null);

  const isAr = lang === 'ar';

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center"
      style={{ background: '#0f1117' }}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Layers size={20} style={{ color: 'rgba(255,255,255,0.3)' }} />
          <span className="text-xs tracking-widest font-mono uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {isAr ? 'علم التشريح التفاعلي' : 'Interactive Anatomy'}
          </span>
        </div>
        <h1 className="text-3xl font-semibold text-white mb-2">
          {isAr ? 'اختر نموذج الجسم' : 'Select a body model'}
        </h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {isAr
            ? 'ستبدأ رحلة التشريح من التجويف الصدري'
            : 'You\'ll begin the dissection journey at the thoracic cavity'}
        </p>
      </div>

      {/* Cards */}
      <div className="flex gap-6 flex-wrap justify-center px-4">
        {(['male', 'female'] as AnatomySex[]).map((s) => {
          const isHov = hovered === s;
          return (
            <button
              key={s}
              onClick={() => onSelect(s)}
              onMouseEnter={() => setHovered(s)}
              onMouseLeave={() => setHovered(null)}
              className="relative flex flex-col items-center rounded-2xl overflow-hidden transition-all duration-200"
              style={{
                width: 220,
                height: 320,
                background: isHov ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isHov ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
                transform: isHov ? 'translateY(-4px)' : 'none',
                boxShadow: isHov ? '0 20px 60px rgba(0,0,0,0.6)' : 'none',
              }}
            >
              {/* Body silhouette placeholder */}
              <div className="flex-1 w-full flex items-center justify-center">
                <BodySilhouette sex={s} hovered={isHov} />
              </div>

              {/* Label */}
              <div
                className="w-full px-5 py-4 flex items-center justify-between border-t"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <div className="text-start">
                  <p className="text-sm font-semibold text-white">
                    {s === 'male'
                      ? (isAr ? 'الجسم الذكوري' : 'Male anatomy')
                      : (isAr ? 'الجسم الأنثوي' : 'Female anatomy')}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {isAr ? 'مستوى: الصدر' : 'Start: Thorax'}
                  </p>
                </div>
                <ChevronRight
                  size={16}
                  style={{
                    color: isHov ? '#fff' : 'rgba(255,255,255,0.2)',
                    transition: 'color 0.15s',
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Footnote */}
      <p className="mt-10 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
        {isAr
          ? 'الهياكل التشريحية والأسماء اللاتينية مستمدة من FMA وTA2'
          : 'Anatomical structures & Latin nomenclature sourced from FMA & TA2'}
      </p>
    </div>
  );
}

// ── SVG body silhouette ───────────────────────────────────────

function BodySilhouette({ sex, hovered }: { sex: AnatomySex; hovered: boolean }) {
  const color = hovered ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)';
  const accent = hovered ? '#e53e3e' : 'rgba(229,62,62,0.4)';

  return (
    <svg
      width="100"
      height="200"
      viewBox="0 0 100 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transition: 'all 0.2s' }}
    >
      {/* Head */}
      <ellipse cx="50" cy="18" rx="14" ry="16" fill={color} />
      {/* Neck */}
      <rect x="44" y="32" width="12" height="10" rx="4" fill={color} />
      {/* Torso */}
      {sex === 'male' ? (
        <path d="M28 42 Q22 50 22 70 L22 110 Q22 118 30 120 L70 120 Q78 118 78 110 L78 70 Q78 50 72 42 Z" fill={color} />
      ) : (
        <path d="M30 42 Q23 52 23 72 L22 110 Q22 118 30 120 L70 120 Q78 118 78 110 L78 72 Q77 52 70 42 Z" fill={color} />
      )}
      {/* Heart highlight (red dot) */}
      <circle cx="42" cy="72" r="5" fill={accent} />
      {/* Arms */}
      <path d="M28 45 Q14 70 16 100" stroke={color} strokeWidth="10" strokeLinecap="round" />
      <path d="M72 45 Q86 70 84 100" stroke={color} strokeWidth="10" strokeLinecap="round" />
      {/* Legs */}
      <path d="M38 120 Q36 155 37 180" stroke={color} strokeWidth="12" strokeLinecap="round" />
      <path d="M62 120 Q64 155 63 180" stroke={color} strokeWidth="12" strokeLinecap="round" />
      {/* Thorax outline (dashed highlight) */}
      {hovered && (
        <rect
          x="30"
          y="44"
          width="40"
          height="50"
          rx="8"
          stroke="#e53e3e"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          fill="rgba(229,62,62,0.05)"
        />
      )}
    </svg>
  );
}
