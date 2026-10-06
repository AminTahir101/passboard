'use client';

import { useState } from 'react';
import type { AnatomySex } from '@/types/anatomy';
import { Layers } from 'lucide-react';

// ── Region definitions ────────────────────────────────────────

interface BodyRegion {
  id: string;               // root FMA node id
  nameEn: string;
  nameAr: string;
  color: string;            // highlight color
  svgPaths: string;         // SVG path(s) for the hit area
  labelX: number;
  labelY: number;
}

// SVG viewBox: 0 0 100 220
const BODY_REGIONS: BodyRegion[] = [
  {
    id: 'FMA:7154',
    nameEn: 'Head',
    nameAr: 'الرأس',
    color: '#b794f4',
    svgPaths: 'M36,2 Q50,-1 64,2 Q75,6 75,20 Q75,36 64,40 Q50,44 36,40 Q25,36 25,20 Q25,6 36,2 Z',
    labelX: 80, labelY: 22,
  },
  {
    id: 'FMA:7155',
    nameEn: 'Neck',
    nameAr: 'العنق',
    color: '#68d391',
    svgPaths: 'M44,44 L56,44 L58,55 L42,55 Z',
    labelX: 60, labelY: 50,
  },
  {
    id: 'FMA:9648',
    nameEn: 'Thorax',
    nameAr: 'الصدر',
    color: '#e53e3e',
    svgPaths: 'M28,55 Q22,63 22,75 L22,100 L78,100 L78,75 Q78,63 72,55 Z',
    labelX: 80, labelY: 78,
  },
  {
    id: 'FMA:9600',
    nameEn: 'Abdomen',
    nameAr: 'البطن',
    color: '#f6ad55',
    svgPaths: 'M22,100 L22,130 Q22,138 30,140 L70,140 Q78,138 78,130 L78,100 Z',
    labelX: 80, labelY: 120,
  },
  {
    id: 'FMA:9578',
    nameEn: 'Pelvis',
    nameAr: 'الحوض',
    color: '#fbd38d',
    svgPaths: 'M28,140 Q22,145 22,152 L22,162 L78,162 L78,152 Q78,145 72,140 Z',
    labelX: 80, labelY: 152,
  },
  {
    id: 'FMA:7182',
    nameEn: 'Upper Limb',
    nameAr: 'الطرف العلوي',
    color: '#90cdf4',
    // Both arms combined
    svgPaths: 'M22,58 Q14,68 14,95 L14,105 Q12,108 13,112 L20,112 L20,105 L22,100 Z M78,58 Q86,68 86,95 L86,105 Q88,108 87,112 L80,112 L80,105 L78,100 Z',
    labelX: 2, labelY: 85,
  },
  {
    id: 'FMA:7185',
    nameEn: 'Lower Limb',
    nameAr: 'الطرف السفلي',
    color: '#68d391',
    svgPaths: 'M35,162 Q33,185 34,210 L45,210 L45,162 Z M55,162 L55,210 L66,210 Q67,185 65,162 Z',
    labelX: 80, labelY: 186,
  },
  {
    id: 'FMA:14543',
    nameEn: 'Back & Spine',
    nameAr: 'الظهر والعمود الفقري',
    color: '#fc8181',
    svgPaths: 'M44,55 L56,55 L56,162 L44,162 Z',
    labelX: -2, labelY: 108,
  },
];

interface BodySelectionProps {
  lang: 'en' | 'ar';
  onSelect: (sex: AnatomySex, regionId: string) => void;
}

export default function BodySelection({ lang, onSelect }: BodySelectionProps) {
  const [sex, setSex] = useState<AnatomySex>('male');
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const isAr = lang === 'ar';

  const hovered = BODY_REGIONS.find((r) => r.id === hoveredRegion);

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-6"
      style={{ background: '#0f1117' }}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Layers size={16} style={{ color: 'rgba(255,255,255,0.3)' }} />
          <span className="text-xs tracking-widest font-mono uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {isAr ? 'علم التشريح التفاعلي' : 'Interactive Anatomy'}
          </span>
        </div>
        <h1 className="text-2xl font-semibold text-white">
          {isAr ? 'اختر منطقة لتشريحها' : 'Select a region to explore'}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.38)' }}>
          {isAr ? 'انقر على أي جزء من الجسم' : 'Click any body region to begin'}
        </p>
      </div>

      <div className="flex items-center gap-10">
        {/* Left: region quick-list */}
        <div className="hidden lg:flex flex-col gap-1.5 w-40">
          {BODY_REGIONS.filter((_, i) => i < 4).map((r) => (
            <RegionPill
              key={r.id}
              region={r}
              lang={lang}
              active={hoveredRegion === r.id}
              onHover={setHoveredRegion}
              onClick={() => onSelect(sex, r.id)}
            />
          ))}
        </div>

        {/* Center: body SVG */}
        <div className="flex flex-col items-center gap-4">
          {/* Sex toggle */}
          <div
            className="flex rounded-lg overflow-hidden border"
            style={{ borderColor: 'rgba(255,255,255,0.12)' }}
          >
            {(['male', 'female'] as AnatomySex[]).filter(s => s !== 'both').map((s) => (
              <button
                key={s}
                onClick={() => setSex(s)}
                className="px-4 py-1.5 text-xs font-medium transition-colors"
                style={{
                  background: sex === s ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.3)',
                  color: sex === s ? '#fff' : 'rgba(255,255,255,0.4)',
                }}
              >
                {s === 'male' ? (isAr ? 'ذكر' : 'Male') : (isAr ? 'أنثى' : 'Female')}
              </button>
            ))}
          </div>

          {/* Interactive SVG body */}
          <div className="relative" style={{ width: 200, height: 440 }}>
            <svg
              width="200"
              height="440"
              viewBox="0 0 100 220"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* ── Base body silhouette ── */}
              <BodySilhouette sex={sex} />

              {/* ── Region hit areas ── */}
              {BODY_REGIONS.map((r) => (
                <g key={r.id}>
                  <path
                    d={r.svgPaths}
                    fill={hoveredRegion === r.id ? r.color : 'transparent'}
                    fillOpacity={hoveredRegion === r.id ? 0.22 : 0}
                    stroke={hoveredRegion === r.id ? r.color : 'transparent'}
                    strokeWidth="0.8"
                    strokeDasharray={hoveredRegion === r.id ? 'none' : '3 2'}
                    style={{ cursor: 'pointer', transition: 'fill 0.15s, stroke 0.15s' }}
                    onMouseEnter={() => setHoveredRegion(r.id)}
                    onMouseLeave={() => setHoveredRegion(null)}
                    onClick={() => onSelect(sex, r.id)}
                  />
                </g>
              ))}

              {/* ── Region label inside SVG ── */}
              {hovered && (
                <text
                  x={50}
                  y={215}
                  textAnchor="middle"
                  fontSize="5"
                  fill={hovered.color}
                  fontWeight="600"
                >
                  {isAr ? hovered.nameAr : hovered.nameEn}
                </text>
              )}
            </svg>

            {/* Region name badge (outside SVG, centered below) */}
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center pointer-events-none"
              style={{ height: 24 }}
            >
              {hovered && (
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded"
                  style={{ color: hovered.color, background: 'rgba(0,0,0,0.6)' }}
                >
                  {isAr ? hovered.nameAr : hovered.nameEn}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: region quick-list */}
        <div className="hidden lg:flex flex-col gap-1.5 w-44">
          {BODY_REGIONS.filter((_, i) => i >= 4).map((r) => (
            <RegionPill
              key={r.id}
              region={r}
              lang={lang}
              active={hoveredRegion === r.id}
              onHover={setHoveredRegion}
              onClick={() => onSelect(sex, r.id)}
            />
          ))}
        </div>
      </div>

      {/* Mobile: all region pills */}
      <div className="flex lg:hidden flex-wrap justify-center gap-2 px-6 max-w-sm">
        {BODY_REGIONS.map((r) => (
          <RegionPill
            key={r.id}
            region={r}
            lang={lang}
            active={hoveredRegion === r.id}
            onHover={setHoveredRegion}
            onClick={() => onSelect(sex, r.id)}
          />
        ))}
      </div>

      {/* Footer */}
      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.18)' }}>
        {isAr
          ? 'مصطلحات FMA / TA2 · محتوى USMLE / SMLE'
          : 'FMA / TA2 nomenclature · USMLE / SMLE content'}
      </p>
    </div>
  );
}

// ── Region pill button ────────────────────────────────────────

function RegionPill({
  region, lang, active, onHover, onClick,
}: {
  region: BodyRegion;
  lang: 'en' | 'ar';
  active: boolean;
  onHover: (id: string | null) => void;
  onClick: () => void;
}) {
  const isAr = lang === 'ar';
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => onHover(region.id)}
      onMouseLeave={() => onHover(null)}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium w-full transition-all text-start"
      style={{
        background: active ? `${region.color}18` : 'rgba(255,255,255,0.04)',
        border: `1px solid ${active ? region.color + '55' : 'rgba(255,255,255,0.08)'}`,
        color: active ? '#fff' : 'rgba(255,255,255,0.55)',
        transform: active ? 'scale(1.02)' : 'none',
      }}
    >
      <span
        className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{ background: region.color, opacity: active ? 1 : 0.6 }}
      />
      {isAr ? region.nameAr : region.nameEn}
    </button>
  );
}

// ── SVG body silhouette ───────────────────────────────────────

function BodySilhouette({ sex }: { sex: AnatomySex }) {
  const fill = 'rgba(255,255,255,0.1)';
  const stroke = 'rgba(255,255,255,0.18)';
  const isFemale = sex === 'female';

  return (
    <g>
      {/* Head */}
      <ellipse cx="50" cy="21" rx="14" ry="16" fill={fill} stroke={stroke} strokeWidth="0.5" />
      {/* Neck */}
      <rect x="44" y="35" width="12" height="12" rx="4" fill={fill} stroke={stroke} strokeWidth="0.5" />
      {/* Torso */}
      {isFemale ? (
        <path
          d="M28,55 Q21,63 21,76 L21,130 Q21,138 30,140 L70,140 Q79,138 79,130 L79,76 Q79,63 72,55 Z"
          fill={fill} stroke={stroke} strokeWidth="0.5"
        />
      ) : (
        <path
          d="M28,55 Q22,62 22,74 L22,130 Q22,138 30,140 L70,140 Q78,138 78,130 L78,74 Q78,62 72,55 Z"
          fill={fill} stroke={stroke} strokeWidth="0.5"
        />
      )}
      {/* Left arm */}
      <path d="M28,60 Q14,70 14,95 L14,112" stroke={fill} strokeWidth="10" strokeLinecap="round" />
      <path d="M28,60 Q14,70 14,95 L14,112" stroke={stroke} strokeWidth="10.5" strokeLinecap="round" fill="none" />
      {/* Right arm */}
      <path d="M72,60 Q86,70 86,95 L86,112" stroke={fill} strokeWidth="10" strokeLinecap="round" />
      <path d="M72,60 Q86,70 86,95 L86,112" stroke={stroke} strokeWidth="10.5" strokeLinecap="round" fill="none" />
      {/* Left leg */}
      <path d="M38,140 Q36,170 35,210" stroke={fill} strokeWidth="13" strokeLinecap="round" />
      <path d="M38,140 Q36,170 35,210" stroke={stroke} strokeWidth="13.5" strokeLinecap="round" fill="none" />
      {/* Right leg */}
      <path d="M62,140 Q64,170 65,210" stroke={fill} strokeWidth="13" strokeLinecap="round" />
      <path d="M62,140 Q64,170 65,210" stroke={stroke} strokeWidth="13.5" strokeLinecap="round" fill="none" />
      {/* Spine line (subtle) */}
      <line x1="50" y1="47" x2="50" y2="160" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="2 3" />
    </g>
  );
}
