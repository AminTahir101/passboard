'use client';

import { useState } from 'react';
import type { AnatomyNode, AnatomyContent } from '@/types/anatomy';
import {
  ChevronDown, ChevronRight, AlertCircle, Layers,
  Zap, FlaskConical, BookOpen, Stethoscope, Microscope, Image,
} from 'lucide-react';

interface InfoPanelProps {
  lang: 'en' | 'ar';
  node: AnatomyNode | null;
  content: AnatomyContent | null;
  loading: boolean;
  onDrillDown: (id: string) => void;
}

export default function InfoPanel({ lang, node, content, loading }: InfoPanelProps) {
  const isAr = lang === 'ar';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'rgba(255,255,255,0.2)', borderTopColor: '#e53e3e' }}
        />
      </div>
    );
  }

  if (!node) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center">
        <Microscope size={32} style={{ color: 'rgba(255,255,255,0.15)' }} />
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {isAr
            ? 'انقر على بنية تشريحية لعرض معلوماتها'
            : 'Select a structure to view its information'}
        </p>
      </div>
    );
  }

  const displayName = isAr && node.nameAr ? node.nameAr : node.nameEn;
  const structureTypeLabel = STRUCTURE_TYPE_LABELS[node.structureType]?.[isAr ? 'ar' : 'en'] ?? node.structureType;

  return (
    <div
      className="h-full overflow-y-auto"
      style={{ color: 'rgba(255,255,255,0.85)' }}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Node header */}
      <div className="px-4 pt-4 pb-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-start gap-2 mb-1">
          <span
            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium shrink-0 mt-0.5"
            style={{ background: TYPE_COLORS[node.structureType] + '25', color: TYPE_COLORS[node.structureType] }}
          >
            {structureTypeLabel}
          </span>
          <h2 className="text-base font-semibold leading-snug">{displayName}</h2>
        </div>
        {node.nameLatin && (
          <p className="text-xs italic" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-serif, serif)' }}>
            {node.nameLatin}
          </p>
        )}
        {node.fmaId && (
          <p className="text-xs mt-1 font-mono" style={{ color: 'rgba(255,255,255,0.2)' }}>
            FMA:{node.fmaId}{node.ta2Id ? ` · TA2:${node.ta2Id}` : ''}
          </p>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {node.systemTags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 rounded-full text-xs" style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      {!content ? (
        <div className="px-4 py-6 flex items-start gap-2">
          <AlertCircle size={14} style={{ color: 'rgba(255,255,255,0.25)', marginTop: 2 }} />
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {isAr ? 'لا توجد محتوى معلومات لهذه البنية بعد.' : 'No content available for this structure yet.'}
          </p>
        </div>
      ) : (
        <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
          {/* Description */}
          {content.description && (
            <Section icon={<BookOpen size={13} />} title={isAr ? 'الوصف' : 'Description'}>
              <p className="text-sm leading-relaxed">{content.description}</p>
            </Section>
          )}

          {/* Function */}
          {content.functionText && (
            <Section icon={<Zap size={13} />} title={isAr ? 'الوظيفة' : 'Function'}>
              <p className="text-sm leading-relaxed">{content.functionText}</p>
            </Section>
          )}

          {/* Structure-specific */}
          <StructureSpecificSection content={content} isAr={isAr} structureType={node.structureType} />

          {/* Vascular + Innervation */}
          {(content.arterialSupply || content.venousDrainage || content.innervation || content.lymphaticDrainage) && (
            <Section icon={<Layers size={13} />} title={isAr ? 'التروية والتعصيب' : 'Vasculature & Innervation'} defaultOpen={false}>
              {content.arterialSupply && <Field label={isAr ? 'الشريان التغذوي' : 'Arterial supply'} value={content.arterialSupply} />}
              {content.venousDrainage && <Field label={isAr ? 'الصرف الوريدي' : 'Venous drainage'} value={content.venousDrainage} />}
              {content.lymphaticDrainage && <Field label={isAr ? 'الصرف اللمفاوي' : 'Lymphatic drainage'} value={content.lymphaticDrainage} />}
              {content.innervation && <Field label={isAr ? 'التعصيب' : 'Innervation'} value={content.innervation} />}
            </Section>
          )}

          {/* Embryology + Histology */}
          {(content.embryologicalOrigin || content.histology) && (
            <Section icon={<FlaskConical size={13} />} title={isAr ? 'الأجنة والنسيج' : 'Embryology & Histology'} defaultOpen={false}>
              {content.embryologicalOrigin && <Field label={isAr ? 'المنشأ الجنيني' : 'Embryological origin'} value={content.embryologicalOrigin} />}
              {content.histology && <Field label={isAr ? 'علم الأنسجة' : 'Histology'} value={content.histology} />}
            </Section>
          )}

          {/* Clinical correlations */}
          {content.clinicalCorrelations?.length > 0 && (
            <Section icon={<Stethoscope size={13} />} title={isAr ? 'الترابطات السريرية' : 'Clinical Correlations'} defaultOpen={false}>
              <div className="space-y-3">
                {content.clinicalCorrelations.map((cc, i) => (
                  <div key={i} className="rounded-lg p-3" style={{ background: 'rgba(229,62,62,0.07)', border: '1px solid rgba(229,62,62,0.15)' }}>
                    <p className="text-xs font-semibold mb-1" style={{ color: '#fc8181' }}>{cc.pathology}</p>
                    <p className="text-xs leading-relaxed">{cc.anatomyExplanation}</p>
                    {cc.examTag && cc.examTag.length > 0 && (
                      <div className="flex gap-1 mt-1.5">
                        {cc.examTag.map((t) => (
                          <span key={t} className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Imaging */}
          {content.imagingAppearance && Object.values(content.imagingAppearance).some(Boolean) && (
            <Section icon={<Image size={13} />} title={isAr ? 'مظهر التصوير' : 'Imaging Appearance'} defaultOpen={false}>
              {content.imagingAppearance.xray && <Field label="X-ray" value={content.imagingAppearance.xray} />}
              {content.imagingAppearance.ct && <Field label="CT" value={content.imagingAppearance.ct} />}
              {content.imagingAppearance.mri && <Field label="MRI" value={content.imagingAppearance.mri} />}
              {content.imagingAppearance.ultrasound && <Field label={isAr ? 'الموجات فوق الصوتية' : 'Ultrasound'} value={content.imagingAppearance.ultrasound} />}
            </Section>
          )}

          {/* High-yield exam points */}
          {content.examPoints?.length > 0 && (
            <Section icon={<BookOpen size={13} />} title={isAr ? 'نقاط الامتحان عالية الأهمية' : 'High-Yield Exam Points'} accent>
              <div className="space-y-2">
                {content.examPoints
                  .sort((a, b) => b.importance - a.importance)
                  .map((ep, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <ImportanceDot importance={ep.importance} />
                      <div className="flex-1">
                        <p className="text-xs leading-relaxed">{ep.point}</p>
                        <div className="flex gap-1 mt-1">
                          {ep.examTag.map((t) => (
                            <span key={t} className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ background: 'rgba(251,211,141,0.12)', color: '#fbd38d' }}>
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </Section>
          )}

          {/* Sources */}
          {content.sources?.length > 0 && (
            <div className="px-4 py-3">
              <p className="text-xs font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {isAr ? 'المصادر' : 'Sources'}
              </p>
              <div className="space-y-0.5">
                {content.sources.map((src, i) => (
                  <p key={i} className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    {src.author}. <em>{src.title}</em>
                    {src.edition ? `, ${src.edition}` : ''}
                    {src.page ? `, p.${src.page}` : ''}
                    {src.year ? ` (${src.year})` : ''}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Structure-specific section ────────────────────────────────

function StructureSpecificSection({
  content, isAr, structureType,
}: {
  content: AnatomyContent;
  isAr: boolean;
  structureType: string;
}) {
  if (structureType === 'muscle' && (content.muscleOrigin || content.muscleInsertion || content.muscleAction)) {
    return (
      <Section icon={<Zap size={13} />} title={isAr ? 'بيانات العضلة' : 'Muscle Data'}>
        {content.muscleOrigin && <Field label={isAr ? 'المنشأ' : 'Origin'} value={content.muscleOrigin} />}
        {content.muscleInsertion && <Field label={isAr ? 'الاندغام' : 'Insertion'} value={content.muscleInsertion} />}
        {content.muscleAction && <Field label={isAr ? 'الحركة' : 'Action'} value={content.muscleAction} />}
        {content.muscleInnervation && <Field label={isAr ? 'التعصيب' : 'Nerve supply'} value={content.muscleInnervation} />}
        {content.muscleTest && <Field label={isAr ? 'اختبار العضلة' : 'Clinical test'} value={content.muscleTest} />}
      </Section>
    );
  }

  if (structureType === 'nerve' && (content.nerveCourse || content.nerveRootValues)) {
    return (
      <Section icon={<Zap size={13} />} title={isAr ? 'بيانات العصب' : 'Nerve Data'}>
        {content.nerveRootValues && <Field label={isAr ? 'جذور العصب' : 'Root values'} value={content.nerveRootValues} />}
        {content.nerveCourse && <Field label={isAr ? 'مسار العصب' : 'Course'} value={content.nerveCourse} />}
        {content.nerveBranches && <Field label={isAr ? 'الفروع' : 'Branches'} value={content.nerveBranches} />}
        {content.nerveMotor && <Field label={isAr ? 'التعصيب الحركي' : 'Motor'} value={content.nerveMotor} />}
        {content.nerveSensory && <Field label={isAr ? 'التعصيب الحسي' : 'Sensory'} value={content.nerveSensory} />}
      </Section>
    );
  }

  if ((structureType === 'artery' || structureType === 'vein') && content.vesselCourse) {
    return (
      <Section icon={<Zap size={13} />} title={isAr ? 'بيانات الوعاء' : 'Vessel Data'}>
        {content.vesselOrigin && <Field label={isAr ? 'المنشأ' : 'Origin'} value={content.vesselOrigin} />}
        {content.vesselCourse && <Field label={isAr ? 'المسار' : 'Course'} value={content.vesselCourse} />}
        {content.vesselBranches && <Field label={isAr ? 'الفروع' : 'Branches'} value={content.vesselBranches} />}
        {content.vesselTerritory && <Field label={isAr ? 'منطقة التوزيع' : 'Territory'} value={content.vesselTerritory} />}
      </Section>
    );
  }

  if (structureType === 'organ' && (content.organSurfaces || content.organBorders)) {
    return (
      <Section icon={<Zap size={13} />} title={isAr ? 'بيانات العضو' : 'Organ Data'}>
        {content.organSurfaces && <Field label={isAr ? 'الأسطح' : 'Surfaces'} value={content.organSurfaces} />}
        {content.organBorders && <Field label={isAr ? 'الحدود' : 'Borders'} value={content.organBorders} />}
        {content.organPeritoneal && <Field label={isAr ? 'علاقة البريتون' : 'Peritoneal relations'} value={content.organPeritoneal} />}
        {content.referredPain && <Field label={isAr ? 'الألم المحال' : 'Referred pain'} value={content.referredPain} />}
      </Section>
    );
  }

  return null;
}

// ── Sub-components ────────────────────────────────────────────

function Section({
  icon, title, children, defaultOpen = true, accent = false,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  accent?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-left transition-colors"
        style={{
          background: open && accent ? 'rgba(251,211,141,0.04)' : undefined,
          color: accent ? '#fbd38d' : 'rgba(255,255,255,0.6)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = open && accent ? 'rgba(251,211,141,0.04)' : 'transparent'; }}
      >
        <span style={{ opacity: 0.7 }}>{icon}</span>
        <span className="flex-1 text-xs font-semibold uppercase tracking-wide">{title}</span>
        {open ? <ChevronDown size={12} style={{ opacity: 0.4 }} /> : <ChevronRight size={12} style={{ opacity: 0.4 }} />}
      </button>
      {open && (
        <div className="px-4 pb-3">
          {children}
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-2">
      <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}: </span>
      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.75)' }}>{value}</span>
    </div>
  );
}

function ImportanceDot({ importance }: { importance: 1 | 2 | 3 }) {
  const color = importance === 3 ? '#fc8181' : importance === 2 ? '#fbd38d' : 'rgba(255,255,255,0.3)';
  return <div className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ background: color }} />;
}

// ── Constants ─────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  bone: '#e2e8f0', muscle: '#c05621', joint: '#f6ad55', nerve: '#d69e2e',
  artery: '#e53e3e', vein: '#3182ce', lymphatic: '#38a169', organ: '#805ad5',
  ligament: '#f6ad55', fascia: '#a0aec0', tendon: '#f6ad55', bursa: '#81e6d9',
  gland: '#f687b3', region: '#90cdf4', cavity: '#90cdf4', other: '#718096',
};

const STRUCTURE_TYPE_LABELS: Record<string, { en: string; ar: string }> = {
  bone: { en: 'Bone', ar: 'عظمة' },
  muscle: { en: 'Muscle', ar: 'عضلة' },
  joint: { en: 'Joint', ar: 'مفصل' },
  nerve: { en: 'Nerve', ar: 'عصب' },
  artery: { en: 'Artery', ar: 'شريان' },
  vein: { en: 'Vein', ar: 'وريد' },
  lymphatic: { en: 'Lymphatic', ar: 'لمفاوي' },
  organ: { en: 'Organ', ar: 'عضو' },
  ligament: { en: 'Ligament', ar: 'رباط' },
  fascia: { en: 'Fascia', ar: 'لفافة' },
  tendon: { en: 'Tendon', ar: 'وتر' },
  bursa: { en: 'Bursa', ar: 'جراب' },
  gland: { en: 'Gland', ar: 'غدة' },
  region: { en: 'Region', ar: 'منطقة' },
  cavity: { en: 'Cavity', ar: 'تجويف' },
  other: { en: 'Other', ar: 'أخرى' },
};
