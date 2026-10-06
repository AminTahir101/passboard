'use client';

import { useState, useEffect, useRef } from 'react';
import { useAnatomyStore } from '@/store/anatomyStore';
import AnatomyLayerViewer from './AnatomyLayerViewer';
import type { AnatomySex } from '@/types/anatomy';

// ── Region definitions (L1 FMA roots) ────────────────────────
// Overlay hit areas are in viewBox "0 0 260 520" coordinates,
// matching AnatomyLayerViewer exactly.

interface BodyRegion {
  id: string;
  nameEn: string;
  nameAr: string;
  color: string;
  // SVG path for the clickable hit area (viewBox 0 0 260 520)
  path: string;
  labelX: number;
  labelY: number;
  side: 'left' | 'right';
}

// Region hit areas in viewBox "-170 0 740 920" coordinates,
// matching AnatomyLayerViewer exactly. Body centre = x:200.
const REGIONS: BodyRegion[] = [
  {
    id: 'FMA:7154', nameEn: 'Head', nameAr: 'الرأس', color: '#b794f4',
    path: 'M160,18 C158,10 172,4 200,4 C228,4 242,10 240,18 C238,42 232,64 226,80 C218,90 210,94 200,94 C190,94 182,90 174,80 C168,64 162,42 160,18 Z',
    labelX: 380, labelY: 50, side: 'right',
  },
  {
    id: 'FMA:7155', nameEn: 'Neck', nameAr: 'العنق', color: '#68d391',
    path: 'M178,88 L222,88 L226,130 L174,130 Z',
    labelX: 380, labelY: 110, side: 'right',
  },
  {
    id: 'FMA:9648', nameEn: 'Thorax', nameAr: 'الصدر', color: '#e53e3e',
    path: 'M130,126 C110,126 90,132 80,140 C70,148 68,164 68,186 L68,310 L332,310 L332,186 C332,164 330,148 320,140 C310,132 290,126 270,126 Z',
    labelX: 380, labelY: 220, side: 'right',
  },
  {
    id: 'FMA:9600', nameEn: 'Abdomen', nameAr: 'البطن', color: '#f6ad55',
    path: 'M68,310 L68,400 C68,416 90,422 110,424 L290,424 C310,422 332,416 332,400 L332,310 Z',
    labelX: 380, labelY: 366, side: 'right',
  },
  {
    id: 'FMA:9578', nameEn: 'Pelvis', nameAr: 'الحوض', color: '#fbd38d',
    path: 'M96,424 C74,432 60,450 58,468 L58,510 L342,510 L342,468 C340,450 326,432 304,424 Z',
    labelX: 380, labelY: 468, side: 'right',
  },
  {
    id: 'FMA:7182', nameEn: 'Upper Limb', nameAr: 'الطرف العلوي', color: '#90cdf4',
    // Both arms: left arm (x=57-130) and right arm (mirrored, x=270-343)
    path: 'M60,126 C40,140 30,170 30,200 L30,400 L80,400 L80,126 Z M320,126 L320,400 L370,400 L370,200 C370,170 360,140 340,126 Z',
    labelX: -20, labelY: 268, side: 'left',
  },
  {
    id: 'FMA:7185', nameEn: 'Lower Limb', nameAr: 'الطرف السفلي', color: '#68d391',
    path: 'M100,510 L100,880 L190,880 L190,510 Z M210,510 L210,880 L300,880 L300,510 Z',
    labelX: 380, labelY: 700, side: 'right',
  },
  {
    id: 'FMA:14543', nameEn: 'Back & Spine', nameAr: 'الظهر والعمود الفقري', color: '#fc8181',
    path: 'M184,130 L216,130 L216,500 L184,500 Z',
    labelX: -20, labelY: 330, side: 'left',
  },
];

interface BodySelectionProps {
  lang: 'en' | 'ar';
  onSelect: (sex: AnatomySex, regionId: string) => void;
}

export default function BodySelection({ lang, onSelect }: BodySelectionProps) {
  const [sex, setSexLocal] = useState<AnatomySex>('male');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { setAllLayers, setSex } = useAnatomyStore();
  const isAr = lang === 'ar';

  // Show all layers and keep store sex in sync whenever local sex changes
  useEffect(() => {
    setSex(sex);           // setSex resets layers → need setAllLayers after
    setAllLayers(true);
  }, [sex, setSex, setAllLayers]);

  const hovered = REGIONS.find(r => r.id === hoveredId) ?? null;

  return (
    <div
      className="w-full h-full flex flex-col"
      style={{ background: '#0d0e12' }}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* ── Header ── */}
      <div className="text-center pt-5 pb-2 shrink-0">
        <p className="text-xs tracking-widest uppercase font-mono mb-1.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
          {isAr ? 'علم التشريح التفاعلي' : 'Interactive Anatomy'}
        </p>
        <h1 className="text-xl font-semibold text-white">
          {isAr ? 'اختر منطقة لتشريحها' : 'Select a region to explore'}
        </h1>
        <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.32)' }}>
          {isAr ? 'انقر على أي منطقة من الجسم' : 'Click any region on the body'}
        </p>
      </div>

      {/* ── Sex toggle ── */}
      <div className="flex justify-center mt-2 mb-1 shrink-0">
        <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
          {(['male', 'female'] as AnatomySex[]).map((s) => (
            <button
              key={s}
              onClick={() => setSexLocal(s)}
              className="px-5 py-1.5 text-xs font-medium transition-colors"
              style={{
                background: sex === s ? 'rgba(255,255,255,0.14)' : 'transparent',
                color: sex === s ? '#fff' : 'rgba(255,255,255,0.38)',
              }}
            >
              {s === 'male' ? (isAr ? 'ذكر' : 'Male') : (isAr ? 'أنثى' : 'Female')}
            </button>
          ))}
        </div>
      </div>

      {/* ── Body viewer with region overlay ── */}
      <div className="flex-1 relative overflow-hidden">
        {/* The full anatomical illustration */}
        <AnatomyLayerViewer
          lang={lang}
          hideLabels
          onNodeSelect={(nodeId) => {
            // Map a structure click to its L1 region
            const region = STRUCTURE_TO_REGION[nodeId] ?? nodeId;
            onSelect(sex, region);
          }}
        />

        {/* Invisible L1 region overlay — sits on top, same viewBox as viewer */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="-170 0 740 920"
          preserveAspectRatio="xMidYMid meet"
          style={{ zIndex: 10 }}
        >
          {REGIONS.map((r) => (
            <g key={r.id}>
              {/* Hit area */}
              <path
                d={r.path}
                fill={hoveredId === r.id ? r.color : 'transparent'}
                fillOpacity={hoveredId === r.id ? 0.18 : 0}
                stroke={hoveredId === r.id ? r.color : 'transparent'}
                strokeWidth="1.5"
                strokeOpacity={hoveredId === r.id ? 0.6 : 0}
                style={{
                  cursor: 'pointer',
                  transition: 'fill-opacity 0.15s, stroke-opacity 0.15s',
                  pointerEvents: 'all',
                }}
                onMouseEnter={() => setHoveredId(r.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => onSelect(sex, r.id)}
              />

              {/* Label — only on hover */}
              {hoveredId === r.id && (
                <>
                  {/* Leader line */}
                  <line
                    x1={r.side === 'right' ? r.labelX - 28 : r.labelX + 28}
                    y1={r.labelY}
                    x2={r.side === 'right' ? r.labelX - 6 : r.labelX + 6}
                    y2={r.labelY}
                    stroke={r.color}
                    strokeWidth="1"
                    strokeOpacity="0.7"
                    style={{ pointerEvents: 'none' }}
                  />
                  <text
                    x={r.labelX}
                    y={r.labelY + 4}
                    textAnchor={r.side === 'right' ? 'start' : 'end'}
                    fontSize="11"
                    fontWeight="600"
                    fill={r.color}
                    style={{ pointerEvents: 'none' }}
                  >
                    {isAr ? r.nameAr : r.nameEn}
                  </text>
                </>
              )}
            </g>
          ))}
        </svg>

        {/* Hovered region badge */}
        {hovered && (
          <div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full text-xs font-semibold pointer-events-none whitespace-nowrap"
            style={{
              background: `${hovered.color}22`,
              border: `1px solid ${hovered.color}55`,
              color: hovered.color,
            }}
          >
            {isAr ? hovered.nameAr : hovered.nameEn}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="text-center py-2 shrink-0">
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.14)' }}>
          {isAr
            ? 'مصطلحات FMA / TA2 · محتوى USMLE / SMLE'
            : 'FMA / TA2 nomenclature · USMLE / SMLE content'}
        </p>
      </div>
    </div>
  );
}

// ── Structure → L1 region mapping ────────────────────────────
// When a specific structure is clicked in the viewer, map it to its L1 region

const STRUCTURE_TO_REGION: Record<string, string> = {
  'FMA:50801': 'FMA:7154',  // brain → head
  'FMA:7088':  'FMA:9648',  // heart → thorax
  'FMA:7311':  'FMA:9648',  // left lung → thorax
  'FMA:7310':  'FMA:9648',  // right lung → thorax
  'FMA:7197':  'FMA:9600',  // liver → abdomen
  'FMA:7148':  'FMA:9600',  // stomach → abdomen
  'FMA:7203':  'FMA:9600',  // right kidney → abdomen
  'FMA:7204':  'FMA:9600',  // left kidney → abdomen
  'FMA:15900': 'FMA:9578',  // bladder → pelvis
  'FMA:9631':  'FMA:14543', // vertebral column → back & spine
};
