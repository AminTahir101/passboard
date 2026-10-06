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

const REGIONS: BodyRegion[] = [
  {
    id: 'FMA:7154', nameEn: 'Head', nameAr: 'الرأس', color: '#b794f4',
    path: 'M95,10 C70,10 66,26 66,50 C66,74 78,92 95,100 L130,104 L165,100 C182,92 194,74 194,50 C194,26 190,10 165,10 Z',
    labelX: 210, labelY: 52, side: 'right',
  },
  {
    id: 'FMA:7155', nameEn: 'Neck', nameAr: 'العنق', color: '#68d391',
    path: 'M108,100 L152,100 L156,120 L104,120 Z',
    labelX: 210, labelY: 112, side: 'right',
  },
  {
    id: 'FMA:9648', nameEn: 'Thorax', nameAr: 'الصدر', color: '#e53e3e',
    path: 'M72,118 C58,128 55,145 55,162 L55,240 L205,240 L205,162 C205,145 202,128 188,118 Z',
    labelX: 210, labelY: 180, side: 'right',
  },
  {
    id: 'FMA:9600', nameEn: 'Abdomen', nameAr: 'البطن', color: '#f6ad55',
    path: 'M55,240 L55,310 C55,326 70,332 80,334 L180,334 C190,332 205,326 205,310 L205,240 Z',
    labelX: 210, labelY: 290, side: 'right',
  },
  {
    id: 'FMA:9578', nameEn: 'Pelvis', nameAr: 'الحوض', color: '#fbd38d',
    path: 'M68,334 C58,340 54,352 54,364 L54,390 L206,390 L206,364 C206,352 202,340 192,334 Z',
    labelX: 210, labelY: 364, side: 'right',
  },
  {
    id: 'FMA:7182', nameEn: 'Upper Limb', nameAr: 'الطرف العلوي', color: '#90cdf4',
    // Both arms combined
    path: 'M36,118 C24,132 20,155 20,178 L20,310 L55,310 L55,118 Z M205,118 L205,310 L240,310 L240,178 C240,155 236,132 224,118 Z',
    labelX: 5, labelY: 210, side: 'left',
  },
  {
    id: 'FMA:7185', nameEn: 'Lower Limb', nameAr: 'الطرف السفلي', color: '#68d391',
    path: 'M80,390 L80,510 L130,510 L130,390 Z M130,390 L130,510 L180,510 L180,390 Z',
    labelX: 210, labelY: 455, side: 'right',
  },
  {
    id: 'FMA:14543', nameEn: 'Back & Spine', nameAr: 'الظهر والعمود الفقري', color: '#fc8181',
    path: 'M118,120 L142,120 L142,390 L118,390 Z',
    labelX: 5, labelY: 260, side: 'left',
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

  // Show all layers in the selection view so the full illustration is visible
  useEffect(() => {
    setAllLayers(true);
  }, [setAllLayers]);

  // Keep store sex in sync
  useEffect(() => {
    setSex(sex);
  }, [sex, setSex]);

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
          onNodeSelect={(nodeId) => {
            // Map a structure click to its L1 region
            const region = STRUCTURE_TO_REGION[nodeId] ?? nodeId;
            onSelect(sex, region);
          }}
        />

        {/* Invisible L1 region overlay — sits on top, same viewBox as viewer */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 260 520"
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
                strokeWidth="1"
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
                    x1={r.side === 'right' ? r.labelX - 18 : r.labelX + 18}
                    y1={r.labelY}
                    x2={r.side === 'right' ? r.labelX - 4 : r.labelX + 4}
                    y2={r.labelY}
                    stroke={r.color}
                    strokeWidth="0.8"
                    strokeOpacity="0.7"
                    style={{ pointerEvents: 'none' }}
                  />
                  <text
                    x={r.labelX}
                    y={r.labelY + 3}
                    textAnchor={r.side === 'right' ? 'start' : 'end'}
                    fontSize="7"
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
