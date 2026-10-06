'use client';

import { useAnatomyStore } from '@/store/anatomyStore';
import type { LayerVisibility } from '@/types/anatomy';

interface LayerTogglesProps {
  lang: 'en' | 'ar';
}

interface LayerMeta {
  key: keyof LayerVisibility;
  en: string;
  ar: string;
  color: string;
  icon: string;
}

// Corpus Humanum layer order — outside → inside
const LAYERS: LayerMeta[] = [
  { key: 'integumentary', en: 'Integumentary', ar: 'الجلد والأنسجة',    color: '#c8a070', icon: '◼' },
  { key: 'muscular',      en: 'Muscular',       ar: 'الجهاز العضلي',    color: '#b83049', icon: '◼' },
  { key: 'nervous',       en: 'Nervous',        ar: 'الجهاز العصبي',    color: '#d4a520', icon: '◼' },
  { key: 'cardiovascular',en: 'Cardiovascular', ar: 'الجهاز الدوري',    color: '#e53e3e', icon: '◼' },
  { key: 'lymphatic',     en: 'Lymphatic',      ar: 'الجهاز اللمفاوي',  color: '#38a169', icon: '◼' },
  { key: 'respiratory',   en: 'Respiratory',    ar: 'الجهاز التنفسي',   color: '#76e4f7', icon: '◼' },
  { key: 'digestive',     en: 'Digestive',      ar: 'الجهاز الهضمي',    color: '#dd6b20', icon: '◼' },
  { key: 'urinary',       en: 'Urinary',        ar: 'الجهاز البولي',    color: '#805ad5', icon: '◼' },
  { key: 'skeletal',      en: 'Skeletal',       ar: 'الجهاز الهيكلي',   color: '#d4c5a9', icon: '◼' },
];

export default function LayerToggles({ lang }: LayerTogglesProps) {
  const {
    layerVisibility, setLayerVisible, setAllLayers,
    peelLayer, resetDissection, dissectionLayer,
  } = useAnatomyStore();

  const isAr = lang === 'ar';
  const anyOn = Object.values(layerVisibility).some(Boolean);
  const allOn = Object.values(layerVisibility).every(Boolean);

  return (
    <div
      className="h-full overflow-y-auto"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Header controls */}
      <div className="px-4 pt-4 pb-3 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {isAr ? 'الطبقات التشريحية' : 'Anatomical Layers'}
        </span>
        <div className="flex gap-1.5">
          <button
            onClick={() => setAllLayers(true)}
            className="px-2 py-1 rounded text-xs font-medium transition-colors"
            style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
          >
            {isAr ? 'الكل' : 'All'}
          </button>
          <button
            onClick={() => setAllLayers(false)}
            className="px-2 py-1 rounded text-xs font-medium transition-colors"
            style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
          >
            {isAr ? 'لا شيء' : 'None'}
          </button>
        </div>
      </div>

      {/* Layer toggles */}
      <div className="px-4 py-3 space-y-1.5">
        {LAYERS.map((layer) => {
          const on = layerVisibility[layer.key];
          return (
            <button
              key={layer.key}
              onClick={() => setLayerVisible(layer.key, !on)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left"
              style={{
                background: on ? 'rgba(255,255,255,0.06)' : 'transparent',
                border: `1px solid ${on ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)'}`,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = on ? 'rgba(255,255,255,0.06)' : 'transparent'; }}
            >
              {/* Color swatch */}
              <div
                className="w-3 h-3 rounded-sm shrink-0"
                style={{
                  background: layer.color,
                  opacity: on ? 1 : 0.25,
                  transition: 'opacity 0.15s',
                }}
              />
              <span
                className="flex-1 text-xs font-medium"
                style={{ color: on ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)' }}
              >
                {isAr ? layer.ar : layer.en}
              </span>
              {/* Toggle indicator */}
              <div
                className="w-8 h-4 rounded-full flex items-center transition-all shrink-0"
                style={{
                  background: on ? layer.color : 'rgba(255,255,255,0.1)',
                  justifyContent: on ? 'flex-end' : 'flex-start',
                  padding: '0 2px',
                }}
              >
                <div className="w-3 h-3 rounded-full bg-white" style={{ opacity: on ? 1 : 0.5 }} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Dissection mode */}
      <div className="px-4 pb-4 border-t pt-3 mt-1" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {isAr ? 'وضع التشريح التتابعي' : 'Sequential Dissection'}
        </p>
        <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {isAr
            ? 'قشّر طبقة واحدة في كل مرة، مثل التشريح الحقيقي'
            : 'Peel one layer at a time, like cadaveric dissection'}
        </p>
        <div className="flex gap-2">
          <button
            onClick={peelLayer}
            className="flex-1 py-2 rounded-lg text-xs font-medium transition-colors"
            style={{ background: 'rgba(229,62,62,0.15)', color: '#fc8181', border: '1px solid rgba(229,62,62,0.2)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(229,62,62,0.25)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(229,62,62,0.15)'; }}
          >
            {isAr ? 'قشّر طبقة ↓' : 'Peel Layer ↓'}
          </button>
          <button
            onClick={resetDissection}
            className="px-3 py-2 rounded-lg text-xs font-medium transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
          >
            {isAr ? 'إعادة' : 'Reset'}
          </button>
        </div>
        {dissectionLayer > 0 && (
          <p className="text-xs mt-2 text-center" style={{ color: 'rgba(255,255,255,0.25)' }}>
            {isAr ? `الطبقة ${dissectionLayer + 1} من 9` : `Layer ${dissectionLayer + 1} of 9`}
          </p>
        )}
      </div>
    </div>
  );
}
