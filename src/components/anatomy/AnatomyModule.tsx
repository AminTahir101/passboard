'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAnatomyStore } from '@/store/anatomyStore';
import type { AnatomyNode, AnatomyContent, AnatomySex, LayerVisibility, TutorMode } from '@/types/anatomy';
import AnatomyLayerViewer from './AnatomyLayerViewer';
import InfoPanel from './InfoPanel';
import AiTutor from './AiTutor';

// ── Design tokens ────────────────────────────────────────────────
const T = {
  bg:          '#0B0E13',
  primary:     '#F1ECE2',
  body:        '#C4C9CE',
  muted:       '#9AA0A6',
  faint:       '#8A9096',
  disabled:    '#7F858C',
  link:        '#D8C7A3',
  border:      'rgba(233,228,218,0.14)',
  borderSub:   'rgba(233,228,218,0.07)',
  borderStat:  'rgba(233,228,218,0.12)',
  rowHover:    'rgba(241,236,226,0.07)',
  activeBg:    '#F1ECE2',
  activeFg:    '#0B0E13',
  inactiveFg:  '#C4C9CE',
  serif:       "var(--font-cormorant, 'Georgia', serif)",
  sans:        "var(--font-instrument, 'system-ui', sans-serif)",
} as const;

// ── Layer metadata ────────────────────────────────────────────────
interface LayerMeta {
  key: keyof LayerVisibility;
  n: number;
  en: string;
  ar: string;
  latin: string;
  color: string;
  desc: string;
  statVal: string;
  statCap: string;
}

const LAYERS: LayerMeta[] = [
  {
    key: 'integumentary', n: 1,
    en: 'Integumentary', ar: 'الجلد والأنسجة', latin: 'Integumentum commune',
    color: '#E7C3A6',
    desc: "The body's outermost shield — skin, hair, nails, and sebaceous glands — regulates temperature, prevents pathogen entry, and mediates sensory input across its entire surface.",
    statVal: '≈ 2 m²', statCap: 'of skin covering an adult',
  },
  {
    key: 'muscular', n: 2,
    en: 'Muscular', ar: 'الجهاز العضلي', latin: 'Systema musculare',
    color: '#C4566B',
    desc: 'Over 600 skeletal muscles convert ATP into mechanical force, enabling locomotion and posture. Cardiac and smooth muscle drive visceral and vascular function.',
    statVal: '~40 %', statCap: 'of total body mass in adults',
  },
  {
    key: 'nervous', n: 3,
    en: 'Nervous', ar: 'الجهاز العصبي', latin: 'Systema nervosum',
    color: '#F2C14E',
    desc: 'The CNS integrates signals from 86 billion neurons; the PNS extends sensory and motor control to every region of the body via 43 pairs of spinal nerves.',
    statVal: '86 B', statCap: 'neurons in the human brain',
  },
  {
    key: 'cardiovascular', n: 4,
    en: 'Cardiovascular', ar: 'الجهاز الدوري', latin: 'Systema cardiovasculare',
    color: '#E5484D',
    desc: 'The heart pumps ≈ 5 L per minute through ≈ 100,000 km of vessels, delivering oxygen and nutrients while removing metabolic waste throughout the body.',
    statVal: '≈ 100k km', statCap: 'of blood vessels in the body',
  },
  {
    key: 'lymphatic', n: 5,
    en: 'Lymphatic', ar: 'الجهاز اللمفاوي', latin: 'Systema lymphaticum',
    color: '#3FC7A8',
    desc: 'Lymphatic capillaries recover interstitial fluid and fat-soluble vitamins, while lymph nodes and lymphoid organs serve as primary sites of adaptive immune surveillance.',
    statVal: '600+', statCap: 'lymph nodes in the body',
  },
  {
    key: 'respiratory', n: 6,
    en: 'Respiratory', ar: 'الجهاز التنفسي', latin: 'Systema respiratorium',
    color: '#F39BB4',
    desc: 'The lungs contain ≈ 500 million alveoli offering a ≈ 70 m² diffusion surface for gas exchange, moving ≈ 6 L of air per minute at rest.',
    statVal: '≈ 70 m²', statCap: 'of alveolar surface area',
  },
  {
    key: 'digestive', n: 7,
    en: 'Digestive', ar: 'الجهاز الهضمي', latin: 'Systema digestorium',
    color: '#E39A6F',
    desc: 'Nine metres of specialised tract break food into absorbable molecules; the gut microbiome harbours ≈ 38 trillion bacteria that shape immunity and metabolism.',
    statVal: '≈ 9 m', statCap: 'length of the digestive tract',
  },
  {
    key: 'urinary', n: 8,
    en: 'Urinary', ar: 'الجهاز البولي', latin: 'Systema urinarium',
    color: '#A07BE0',
    desc: 'Each kidney filters ≈ 180 L of plasma per day through ≈ 1 million nephrons, regulating blood pressure, pH, and electrolyte balance.',
    statVal: '180 L', statCap: 'plasma filtered per day per kidney',
  },
  {
    key: 'skeletal', n: 9,
    en: 'Skeletal', ar: 'الجهاز الهيكلي', latin: 'Systema skeletale',
    color: '#EDE6D6',
    desc: '206 bones form the rigid scaffold protecting viscera and housing red marrow for haematopoiesis. Bone remodelling turns over ≈ 10 % of the skeleton each year.',
    statVal: '206', statCap: 'bones in the adult skeleton',
  },
];

// ── Depth presets ─────────────────────────────────────────────────
interface Preset { label: string; layers: (keyof LayerVisibility)[] }
const PRESETS: Preset[] = [
  { label: 'Skin',    layers: ['integumentary'] },
  { label: 'Muscle',  layers: ['integumentary', 'muscular'] },
  { label: 'Systems', layers: ['nervous', 'cardiovascular', 'lymphatic', 'respiratory', 'digestive', 'urinary'] },
  { label: 'Organs',  layers: ['cardiovascular', 'respiratory', 'digestive', 'urinary'] },
  { label: 'Bone',    layers: ['skeletal'] },
];

type RightPanel = 'layer' | 'info' | 'tutor';

// ─────────────────────────────────────────────────────────────────
export default function AnatomyModule({ lang, userId }: { lang: 'en' | 'ar'; userId: string }) {
  const {
    sex, setSex,
    layerVisibility, setLayerVisible, setAllLayers,
    selectedNodeId, drillDown,
    nodeCache, contentCache, cacheNode, cacheContent,
    tutorMode, setTutorMode,
  } = useAnatomyStore();

  const [focusedLayer, setFocusedLayer] = useState<keyof LayerVisibility>('integumentary');
  const [rightPanel, setRightPanel] = useState<RightPanel>('layer');
  const [loadingNode, setLoadingNode] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const isAr = lang === 'ar';

  // Show all layers on mount
  useEffect(() => { setAllLayers(true); }, [setAllLayers]);

  // Fetch node data when selection changes
  useEffect(() => {
    if (!selectedNodeId || nodeCache[selectedNodeId]) return;
    setLoadingNode(true);
    fetch(`/api/anatomy/nodes/${encodeURIComponent(selectedNodeId)}`)
      .then(r => r.json())
      .then(({ node, content }: { node: AnatomyNode; content: AnatomyContent | null }) => {
        if (node) cacheNode(node);
        if (content) cacheContent(selectedNodeId, content);
      })
      .catch(console.error)
      .finally(() => setLoadingNode(false));
  }, [selectedNodeId, nodeCache, cacheNode, cacheContent]);

  const handleNodeSelect = useCallback((nodeId: string) => {
    drillDown(nodeId);
    setRightPanel('info');
  }, [drillDown]);

  const handleLayerClick = (key: keyof LayerVisibility) => {
    setFocusedLayer(key);
    setRightPanel('layer');
  };

  const handleEyeToggle = (key: keyof LayerVisibility, e: React.MouseEvent) => {
    e.stopPropagation();
    setLayerVisible(key, !layerVisibility[key]);
    setActivePreset(null);
  };

  const handlePreset = (preset: Preset) => {
    (Object.keys(layerVisibility) as (keyof LayerVisibility)[]).forEach(k => {
      setLayerVisible(k, preset.layers.includes(k));
    });
    setActivePreset(preset.label);
    if (preset.layers[0]) {
      setFocusedLayer(preset.layers[0]);
      setRightPanel('layer');
    }
  };

  const currentNode    = selectedNodeId ? (nodeCache[selectedNodeId] ?? null)    : null;
  const currentContent = selectedNodeId ? (contentCache[selectedNodeId] ?? null) : null;
  const focused        = LAYERS.find(l => l.key === focusedLayer) ?? LAYERS[0];
  const focusedIdx     = LAYERS.findIndex(l => l.key === focusedLayer);

  return (
    <div
      className="w-full h-full flex"
      dir="ltr"
      style={{ background: T.bg, fontFamily: T.sans, overflow: 'hidden' }}
    >
      {/* ── LEFT SIDEBAR ─────────────────────────────────────── */}
      <aside style={{ width: 296, flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: `1px solid ${T.border}` }}>

        {/* Header */}
        <div style={{ padding: '26px 22px 18px', borderBottom: `1px solid ${T.borderSub}`, flexShrink: 0 }}>
          <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: T.faint }}>
            Corpus Humanum
          </p>
          <h1 style={{ margin: 0, fontFamily: T.serif, fontSize: 26, fontWeight: 500, lineHeight: 1.1, color: T.primary }}>
            Anatomy<br />in Layers
          </h1>
        </div>

        {/* Layer list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 10px 8px' }}>
          <p style={{ margin: '0 0 8px', padding: '0 8px', fontSize: 11, fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: T.faint }}>
            {isAr ? 'الأجهزة التشريحية' : 'Anatomical Systems'}
          </p>

          {LAYERS.map((layer) => {
            const on  = layerVisibility[layer.key];
            const sel = focusedLayer === layer.key;
            return (
              <div
                key={layer.key}
                onClick={() => handleLayerClick(layer.key)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && handleLayerClick(layer.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 0,
                  borderRadius: 6, marginBottom: 1,
                  background: sel ? T.rowHover : 'transparent',
                  cursor: 'pointer',
                  transition: 'background 0.12s',
                }}
              >
                {/* Layer info */}
                <div style={{ flex: 1, height: 44, display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px 0 10px' }}>
                  <span style={{ width: 18, fontSize: 11, color: T.faint, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                    {String(layer.n).padStart(2, '0')}
                  </span>
                  <span style={{
                    width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
                    background: layer.color,
                    opacity: on ? 1 : 0.25,
                    boxShadow: on && sel ? `0 0 10px ${layer.color}` : 'none',
                    transition: 'opacity 0.15s, box-shadow 0.15s',
                  }} />
                  <span style={{
                    flex: 1, fontSize: 14, fontWeight: 500,
                    color: on ? T.primary : T.disabled,
                    transition: 'color 0.15s',
                  }}>
                    {isAr ? layer.ar : layer.en}
                  </span>
                </div>

                {/* Eye toggle */}
                <button
                  onClick={e => handleEyeToggle(layer.key, e)}
                  aria-label={on ? 'Hide layer' : 'Show layer'}
                  style={{ width: 42, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}
                >
                  <EyeIcon open={on} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Bottom controls */}
        <div style={{ flexShrink: 0, padding: '12px 14px 18px', borderTop: `1px solid ${T.borderSub}` }}>
          {/* Depth presets */}
          <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: T.faint }}>
            {isAr ? 'العمق' : 'Depth'}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 3, padding: 3, border: `1px solid ${T.border}`, borderRadius: 9 }}>
            {PRESETS.map(p => {
              const active = activePreset === p.label;
              return (
                <button
                  key={p.label}
                  onClick={() => handlePreset(p)}
                  style={{
                    height: 38, border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 500, cursor: 'pointer',
                    background: active ? T.activeBg : 'transparent',
                    color:      active ? T.activeFg : T.inactiveFg,
                    transition: 'background 0.15s, color 0.15s',
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Sex toggle */}
          <div style={{ display: 'flex', marginTop: 10, borderRadius: 7, overflow: 'hidden', border: `1px solid ${T.border}` }}>
            {(['male', 'female'] as AnatomySex[]).map(s => (
              <button
                key={s}
                onClick={() => setSex(s)}
                style={{
                  flex: 1, padding: '7px 0', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500,
                  background: sex === s ? 'rgba(241,236,226,0.1)' : 'transparent',
                  color: sex === s ? T.primary : T.disabled,
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                {s === 'male' ? (isAr ? 'ذكر' : 'Male') : (isAr ? 'أنثى' : 'Female')}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* ── CENTER: FIGURE ───────────────────────────────────── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <AnatomyLayerViewer lang={lang} onNodeSelect={handleNodeSelect} />
        {loadingNode && (
          <div style={{
            position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
            padding: '6px 14px', borderRadius: 20,
            background: 'rgba(0,0,0,0.7)', fontSize: 12, color: T.body,
          }}>
            {isAr ? 'جارٍ التحميل…' : 'Loading…'}
          </div>
        )}
      </div>

      {/* ── RIGHT PANEL ──────────────────────────────────────── */}
      <aside style={{ width: 296, flexShrink: 0, display: 'flex', flexDirection: 'column', borderLeft: `1px solid ${T.border}`, overflow: 'hidden' }}>

        {/* Tab strip */}
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', padding: '10px 14px', borderBottom: `1px solid ${T.borderSub}`, gap: 2 }}>
          {([
            { key: 'layer' as RightPanel, label: isAr ? 'الطبقة' : 'Layer' },
            { key: 'info'  as RightPanel, label: isAr ? 'معلومات' : 'Info' },
            { key: 'tutor' as RightPanel, label: isAr ? 'مدرب ذكي' : 'AI Tutor' },
          ]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setRightPanel(key)}
              style={{
                padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 500,
                background: rightPanel === key ? 'rgba(241,236,226,0.1)' : 'transparent',
                color: rightPanel === key ? T.primary : T.disabled,
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Panel body */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {rightPanel === 'layer' && (
            <LayerDetailPanel layer={focused} layerIdx={focusedIdx} isAr={isAr} />
          )}
          {rightPanel === 'info' && (
            <InfoPanel
              lang={lang}
              node={currentNode}
              content={currentContent}
              loading={loadingNode}
              onDrillDown={handleNodeSelect}
            />
          )}
          {rightPanel === 'tutor' && (
            <AiTutor
              lang={lang}
              userId={userId}
              nodeId={selectedNodeId}
              nodeName={currentNode?.nameEn}
              tutorMode={tutorMode}
              onModeChange={setTutorMode}
            />
          )}
        </div>
      </aside>
    </div>
  );
}

// ── Layer detail panel ─────────────────────────────────────────────
const DEPTH_H = [5, 7, 9, 12, 14, 17, 20, 23, 26];

function LayerDetailPanel({ layer, layerIdx, isAr }: { layer: LayerMeta; layerIdx: number; isAr: boolean }) {
  return (
    <div style={{ padding: '26px 22px' }}>
      {/* Color accent bar */}
      <div style={{ width: 44, height: 2, borderRadius: 1, marginBottom: 18, background: layer.color, boxShadow: `0 0 14px ${layer.color}` }} />

      {/* Name */}
      <h2 style={{ margin: '0 0 5px', fontFamily: `var(--font-cormorant, Georgia, serif)`, fontSize: 36, fontWeight: 500, lineHeight: 1, color: T.primary }}>
        {isAr ? layer.ar : layer.en}
      </h2>
      <p style={{ margin: '0 0 18px', fontFamily: `var(--font-cormorant, Georgia, serif)`, fontStyle: 'italic', fontSize: 15, color: T.link }}>
        {layer.latin}
      </p>

      {/* Description */}
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: T.body, paddingTop: 16, borderTop: `1px solid ${T.borderStat}` }}>
        {layer.desc}
      </p>

      {/* Stat */}
      <div style={{ marginTop: 16, paddingTop: 16, paddingBottom: 16, borderTop: `1px solid ${T.borderStat}` }}>
        <div style={{ fontFamily: `var(--font-cormorant, Georgia, serif)`, fontWeight: 500, fontSize: 38, lineHeight: 1.05, color: T.primary }}>
          {layer.statVal}
        </div>
        <div style={{ marginTop: 2, fontSize: 13, lineHeight: 1.45, color: T.muted }}>{layer.statCap}</div>
      </div>

      {/* Depth bar */}
      <div style={{ paddingTop: 16, borderTop: `1px solid ${T.borderStat}` }}>
        <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: T.faint }}>
          Depth
        </p>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 30 }}>
          {LAYERS.map((l, i) => (
            <div
              key={l.key}
              style={{
                flex: 1, borderRadius: 2,
                height: DEPTH_H[i],
                background: i === layerIdx ? l.color : 'rgba(233,228,218,0.16)',
                boxShadow: i === layerIdx ? `0 0 8px ${l.color}80` : 'none',
                transition: 'background 0.3s, box-shadow 0.3s',
              }}
            />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: T.faint }}>
          <span>Surface</span><span>Bone</span>
        </div>
      </div>
    </div>
  );
}

// ── Eye icon ──────────────────────────────────────────────────────
function EyeIcon({ open }: { open: boolean }) {
  const col = open ? '#C4C9CE' : '#4A5057';
  return open ? (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
