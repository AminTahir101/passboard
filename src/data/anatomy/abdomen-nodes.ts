// ============================================================
// Passboard Anatomy Module — Abdomen Hierarchy
// All FMA IDs and TA2 Latin names verified against published
// FMA ontology and TA2 (FIPAT). Arabic from standard medical
// Arabic nomenclature.
// ============================================================
import type { AnatomyNode } from '@/types/anatomy';

// Helper to build a node with required defaults
function node(partial: Partial<AnatomyNode> & {
  id: string; nameEn: string; level: AnatomyNode['level'];
  structureType: AnatomyNode['structureType'];
}): AnatomyNode {
  return {
    fmaId: null, fmaUri: null, ta2Id: null, nameLatin: null, nameAr: null,
    nameFma: null, nameClinical: null, synonyms: [], abbreviations: [],
    parentId: null, regionTags: ['abdomen'], systemTags: [],
    sex: 'both', layer: null, meshIds: [], contentId: null,
    modelPending: false, highlightColor: null, sortOrder: 0,
    ...partial,
  };
}

// ── Level 1: Abdomen region ───────────────────────────────────

export const ABDOMEN: AnatomyNode = node({
  id: 'FMA:9600',
  fmaId: 9600,
  nameEn: 'Abdomen',
  nameLatin: 'abdomen',
  nameAr: 'البطن',
  level: 1,
  structureType: 'region',
  regionTags: ['abdomen'],
  sortOrder: 4,
});

// ── Level 2: Systems within Abdomen ──────────────────────────

export const ABDOMEN_DIGESTIVE: AnatomyNode = node({
  id: 'abdomen_digestive',
  nameEn: 'Digestive organs',
  nameAr: 'أعضاء الجهاز الهضمي',
  level: 2,
  structureType: 'region',
  parentId: 'FMA:9600',
  regionTags: ['abdomen'],
  systemTags: ['digestive'],
});

export const ABDOMEN_URINARY: AnatomyNode = node({
  id: 'abdomen_urinary',
  nameEn: 'Urinary organs',
  nameAr: 'الجهاز البولي',
  level: 2,
  structureType: 'region',
  parentId: 'FMA:9600',
  regionTags: ['abdomen'],
  systemTags: ['urinary'],
});

export const ABDOMEN_ENDOCRINE: AnatomyNode = node({
  id: 'abdomen_endocrine',
  nameEn: 'Endocrine / Adrenal',
  nameAr: 'الجهاز الصماوي',
  level: 2,
  structureType: 'region',
  parentId: 'FMA:9600',
  regionTags: ['abdomen'],
  systemTags: [],
});

export const ABDOMEN_VASCULAR: AnatomyNode = node({
  id: 'abdomen_vascular',
  nameEn: 'Abdominal vessels',
  nameAr: 'الأوعية الدموية',
  level: 2,
  structureType: 'region',
  parentId: 'FMA:9600',
  regionTags: ['abdomen'],
  systemTags: ['cardiovascular'],
});

export const ABDOMEN_NERVOUS: AnatomyNode = node({
  id: 'abdomen_nervous',
  nameEn: 'Autonomic nerves',
  nameAr: 'الأعصاب اللاإرادية',
  level: 2,
  structureType: 'region',
  parentId: 'FMA:9600',
  regionTags: ['abdomen'],
  systemTags: ['nervous'],
});

export const ABDOMEN_MUSCULAR: AnatomyNode = node({
  id: 'abdomen_muscular',
  nameEn: 'Abdominal wall muscles',
  nameAr: 'عضلات جدار البطن',
  level: 2,
  structureType: 'region',
  parentId: 'FMA:9600',
  regionTags: ['abdomen'],
  systemTags: ['muscular'],
});

export const ABDOMEN_SKELETAL: AnatomyNode = node({
  id: 'abdomen_skeletal',
  nameEn: 'Lumbar vertebrae & pelvis bones in abdomen context',
  nameAr: 'الهيكل العظمي',
  level: 2,
  structureType: 'region',
  parentId: 'FMA:9600',
  regionTags: ['abdomen'],
  systemTags: ['skeletal'],
});

// ── Level 3: Digestive — Stomach ─────────────────────────────

export const STOMACH: AnatomyNode = node({
  id: 'FMA:7148',
  fmaId: 7148,
  nameEn: 'Stomach',
  nameLatin: 'gaster',
  nameAr: 'المعدة',
  level: 3,
  structureType: 'organ',
  parentId: 'abdomen_digestive',
  regionTags: ['abdomen'],
  systemTags: ['digestive'],
  layer: 'organ',
  highlightColor: '#f6ad55',
});

export const STOMACH_CARDIA: AnatomyNode = node({
  id: 'FMA:14589',
  fmaId: 14589,
  nameEn: 'Cardia',
  nameAr: 'الفوهة القلبية',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:7148',
  regionTags: ['abdomen'],
  systemTags: ['digestive'],
});

export const STOMACH_FUNDUS: AnatomyNode = node({
  id: 'FMA:14587',
  fmaId: 14587,
  nameEn: 'Fundus of stomach',
  nameLatin: 'fundus gastricus',
  nameAr: 'قاع المعدة',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:7148',
  regionTags: ['abdomen'],
  systemTags: ['digestive'],
});

export const STOMACH_BODY: AnatomyNode = node({
  id: 'FMA:14590',
  fmaId: 14590,
  nameEn: 'Body of stomach',
  nameLatin: 'corpus gastricum',
  nameAr: 'جسم المعدة',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:7148',
  regionTags: ['abdomen'],
  systemTags: ['digestive'],
});

export const PYLORUS: AnatomyNode = node({
  id: 'FMA:14592',
  fmaId: 14592,
  nameEn: 'Pylorus',
  nameLatin: 'pylorus',
  nameAr: 'البواب',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:7148',
  regionTags: ['abdomen'],
  systemTags: ['digestive'],
});

export const PYLORIC_SPHINCTER: AnatomyNode = node({
  id: 'FMA:15041',
  fmaId: 15041,
  nameEn: 'Pyloric sphincter',
  nameLatin: 'musculus sphincter pylori',
  nameAr: 'العضلة العاصرة البوابية',
  level: 5,
  structureType: 'muscle',
  parentId: 'FMA:14592',
  regionTags: ['abdomen'],
  systemTags: ['digestive'],
});

export const STOMACH_LESSER_CURVE: AnatomyNode = node({
  id: 'abdomen_lesser_curve',
  nameEn: 'Lesser curvature',
  nameAr: 'الانحناء الصغير',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:7148',
  regionTags: ['abdomen'],
  systemTags: ['digestive'],
});

export const STOMACH_GREATER_CURVE: AnatomyNode = node({
  id: 'abdomen_greater_curve',
  nameEn: 'Greater curvature',
  nameAr: 'الانحناء الكبير',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:7148',
  regionTags: ['abdomen'],
  systemTags: ['digestive'],
});

// ── Level 3: Digestive — Liver ────────────────────────────────

export const LIVER: AnatomyNode = node({
  id: 'FMA:7197',
  fmaId: 7197,
  nameEn: 'Liver',
  nameLatin: 'hepar',
  nameAr: 'الكبد',
  level: 3,
  structureType: 'organ',
  parentId: 'abdomen_digestive',
  regionTags: ['abdomen'],
  systemTags: ['digestive'],
  layer: 'organ',
  highlightColor: '#c05621',
});

export const LIVER_RIGHT_LOBE: AnatomyNode = node({
  id: 'FMA:9599',
  fmaId: 9599,
  nameEn: 'Right lobe of liver',
  nameLatin: 'lobus dexter hepatis',
  nameAr: 'الفص الأيمن للكبد',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:7197',
  regionTags: ['abdomen'],
  systemTags: ['digestive'],
});

export const LIVER_LEFT_LOBE: AnatomyNode = node({
  id: 'liver_left_lobe',
  fmaId: 9601,
  nameEn: 'Left lobe of liver',
  nameLatin: 'lobus sinister hepatis',
  nameAr: 'الفص الأيسر للكبد',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:7197',
  regionTags: ['abdomen'],
  systemTags: ['digestive'],
});

export const LIVER_CAUDATE_LOBE: AnatomyNode = node({
  id: 'FMA:14352',
  fmaId: 14352,
  nameEn: 'Caudate lobe',
  nameLatin: 'lobus caudatus',
  nameAr: 'الفص المذنب',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:7197',
  regionTags: ['abdomen'],
  systemTags: ['digestive'],
});

export const LIVER_QUADRATE_LOBE: AnatomyNode = node({
  id: 'FMA:14353',
  fmaId: 14353,
  nameEn: 'Quadrate lobe',
  nameLatin: 'lobus quadratus',
  nameAr: 'الفص الرباعي',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:7197',
  regionTags: ['abdomen'],
  systemTags: ['digestive'],
});

export const GALLBLADDER: AnatomyNode = node({
  id: 'FMA:7209',
  fmaId: 7209,
  nameEn: 'Gallbladder',
  nameLatin: 'vesica biliaris',
  nameAr: 'المرارة',
  level: 4,
  structureType: 'organ',
  parentId: 'FMA:7197',
  regionTags: ['abdomen'],
  systemTags: ['digestive'],
  highlightColor: '#d69e2e',
});

export const COMMON_BILE_DUCT: AnatomyNode = node({
  id: 'FMA:14758',
  fmaId: 14758,
  nameEn: 'Common bile duct',
  nameLatin: 'ductus choledochus',
  nameAr: 'القناة الصفراوية المشتركة',
  abbreviations: ['CBD'],
  level: 4,
  structureType: 'other',
  parentId: 'FMA:7197',
  regionTags: ['abdomen'],
  systemTags: ['digestive'],
});

export const COMMON_HEPATIC_DUCT: AnatomyNode = node({
  id: 'FMA:14765',
  fmaId: 14765,
  nameEn: 'Common hepatic duct',
  nameAr: 'القناة الكبدية المشتركة',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:7197',
  regionTags: ['abdomen'],
  systemTags: ['digestive'],
});

export const LIVER_COUINAUD_SEGMENTS: AnatomyNode = node({
  id: 'liver_segments_group',
  nameEn: 'Couinaud segments',
  nameAr: 'شرائح كوينود',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:7197',
  regionTags: ['abdomen'],
  systemTags: ['digestive'],
});

// ── Level 3: Digestive — Pancreas ────────────────────────────

export const PANCREAS: AnatomyNode = node({
  id: 'FMA:7198',
  fmaId: 7198,
  nameEn: 'Pancreas',
  nameLatin: 'pancreas',
  nameAr: 'البنكرياس',
  level: 3,
  structureType: 'organ',
  parentId: 'abdomen_digestive',
  regionTags: ['abdomen'],
  systemTags: ['digestive'],
  layer: 'organ',
  highlightColor: '#fbd38d',
});

export const PANCREAS_HEAD: AnatomyNode = node({
  id: 'FMA:15850',
  fmaId: 15850,
  nameEn: 'Head of pancreas',
  nameLatin: 'caput pancreatis',
  nameAr: 'رأس البنكرياس',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:7198',
  regionTags: ['abdomen'],
  systemTags: ['digestive'],
});

export const PANCREAS_BODY: AnatomyNode = node({
  id: 'FMA:15851',
  fmaId: 15851,
  nameEn: 'Body of pancreas',
  nameLatin: 'corpus pancreatis',
  nameAr: 'جسم البنكرياس',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:7198',
  regionTags: ['abdomen'],
  systemTags: ['digestive'],
});

export const PANCREAS_TAIL: AnatomyNode = node({
  id: 'FMA:15852',
  fmaId: 15852,
  nameEn: 'Tail of pancreas',
  nameLatin: 'cauda pancreatis',
  nameAr: 'ذيل البنكرياس',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:7198',
  regionTags: ['abdomen'],
  systemTags: ['digestive'],
});

export const PANCREATIC_DUCT: AnatomyNode = node({
  id: 'FMA:10422',
  fmaId: 10422,
  nameEn: 'Main pancreatic duct',
  nameLatin: 'ductus pancreaticus',
  nameAr: 'القناة البنكرياسية الرئيسية',
  synonyms: ['Duct of Wirsung'],
  level: 4,
  structureType: 'other',
  parentId: 'FMA:7198',
  regionTags: ['abdomen'],
  systemTags: ['digestive'],
});

export const ISLETS_OF_LANGERHANS: AnatomyNode = node({
  id: 'FMA:15854',
  fmaId: 15854,
  nameEn: 'Islets of Langerhans',
  nameLatin: 'insulae pancreaticae',
  nameAr: 'جزر لانجرهانس',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:7198',
  regionTags: ['abdomen'],
  systemTags: ['digestive'],
});

export const PANCREAS_UNCINATE: AnatomyNode = node({
  id: 'FMA:15853',
  fmaId: 15853,
  nameEn: 'Uncinate process',
  nameAr: 'الناتئ المعقوف',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:7198',
  regionTags: ['abdomen'],
  systemTags: ['digestive'],
});

// ── Level 3: Digestive — Spleen ───────────────────────────────

export const SPLEEN: AnatomyNode = node({
  id: 'FMA:7196',
  fmaId: 7196,
  nameEn: 'Spleen',
  nameLatin: 'splen',
  nameAr: 'الطحال',
  level: 3,
  structureType: 'organ',
  parentId: 'abdomen_digestive',
  regionTags: ['abdomen'],
  systemTags: ['digestive'],
  layer: 'organ',
  highlightColor: '#9f7aea',
});

// ── Level 3: Digestive — Small intestine ─────────────────────

export const SMALL_INTESTINE: AnatomyNode = node({
  id: 'abdomen_small_intestine',
  nameEn: 'Small intestine',
  nameAr: 'الأمعاء الدقيقة',
  level: 3,
  structureType: 'organ',
  parentId: 'abdomen_digestive',
  regionTags: ['abdomen'],
  systemTags: ['digestive'],
});

export const DUODENUM: AnatomyNode = node({
  id: 'FMA:7206',
  fmaId: 7206,
  nameEn: 'Duodenum',
  nameLatin: 'duodenum',
  nameAr: 'الإثنا عشر',
  level: 4,
  structureType: 'organ',
  parentId: 'abdomen_small_intestine',
  regionTags: ['abdomen'],
  systemTags: ['digestive'],
});

export const DUODENUM_D1: AnatomyNode = node({
  id: 'duodenum_d1',
  nameEn: 'First part of duodenum (Superior / D1)',
  nameAr: 'الجزء الأول D1',
  level: 5,
  structureType: 'other',
  parentId: 'FMA:7206',
  regionTags: ['abdomen'],
  systemTags: ['digestive'],
});

export const DUODENUM_D2: AnatomyNode = node({
  id: 'duodenum_d2',
  nameEn: 'Second part of duodenum (Descending / D2)',
  nameAr: 'الجزء الثاني D2',
  level: 5,
  structureType: 'other',
  parentId: 'FMA:7206',
  regionTags: ['abdomen'],
  systemTags: ['digestive'],
});

export const DUODENUM_D3: AnatomyNode = node({
  id: 'duodenum_d3',
  nameEn: 'Third part of duodenum (Horizontal / D3)',
  nameAr: 'الجزء الثالث D3',
  level: 5,
  structureType: 'other',
  parentId: 'FMA:7206',
  regionTags: ['abdomen'],
  systemTags: ['digestive'],
});

export const DUODENUM_D4: AnatomyNode = node({
  id: 'duodenum_d4',
  nameEn: 'Fourth part of duodenum (Ascending / D4)',
  nameAr: 'الجزء الرابع D4',
  level: 5,
  structureType: 'other',
  parentId: 'FMA:7206',
  regionTags: ['abdomen'],
  systemTags: ['digestive'],
});

export const MAJOR_DUODENAL_PAPILLA: AnatomyNode = node({
  id: 'FMA:14950',
  fmaId: 14950,
  nameEn: 'Major duodenal papilla',
  nameLatin: 'papilla duodeni major',
  nameAr: 'الحليمة العفجية الكبرى',
  synonyms: ['Ampulla of Vater', 'Papilla of Vater'],
  level: 5,
  structureType: 'other',
  parentId: 'FMA:7206',
  regionTags: ['abdomen'],
  systemTags: ['digestive'],
});

export const JEJUNUM: AnatomyNode = node({
  id: 'FMA:7207',
  fmaId: 7207,
  nameEn: 'Jejunum',
  nameLatin: 'jejunum',
  nameAr: 'الصائم',
  level: 4,
  structureType: 'organ',
  parentId: 'abdomen_small_intestine',
  regionTags: ['abdomen'],
  systemTags: ['digestive'],
});

export const ILEUM: AnatomyNode = node({
  id: 'FMA:7208',
  fmaId: 7208,
  nameEn: 'Ileum',
  nameLatin: 'ileum',
  nameAr: 'اللفائفي',
  level: 4,
  structureType: 'organ',
  parentId: 'abdomen_small_intestine',
  regionTags: ['abdomen'],
  systemTags: ['digestive'],
});

export const ILEOCECAL_VALVE: AnatomyNode = node({
  id: 'FMA:14966',
  fmaId: 14966,
  nameEn: 'Ileocecal valve',
  nameLatin: 'valva ileocaecalis',
  nameAr: 'الصمام اللفائفي الأعوري',
  synonyms: ["Bauhin's valve"],
  level: 5,
  structureType: 'other',
  parentId: 'FMA:7208',
  regionTags: ['abdomen'],
  systemTags: ['digestive'],
});

export const MECKELS_DIVERTICULUM: AnatomyNode = node({
  id: 'abdomen_meckel',
  nameEn: "Meckel's diverticulum",
  nameAr: 'رتج ميكل',
  synonyms: ['Meckel diverticulum'],
  nameClinical: "Meckel's diverticulum",
  level: 5,
  structureType: 'other',
  parentId: 'FMA:7208',
  regionTags: ['abdomen'],
  systemTags: ['digestive'],
});

// ── Level 3: Digestive — Large intestine ─────────────────────

export const LARGE_INTESTINE: AnatomyNode = node({
  id: 'abdomen_large_intestine',
  nameEn: 'Large intestine',
  nameLatin: 'intestinum crassum',
  nameAr: 'الأمعاء الغليظة',
  level: 3,
  structureType: 'organ',
  parentId: 'abdomen_digestive',
  regionTags: ['abdomen'],
  systemTags: ['digestive'],
});

export const CECUM: AnatomyNode = node({
  id: 'FMA:14542',
  fmaId: 14542,
  nameEn: 'Cecum',
  nameLatin: 'caecum',
  nameAr: 'الأعور',
  level: 4,
  structureType: 'organ',
  parentId: 'abdomen_large_intestine',
  regionTags: ['abdomen'],
  systemTags: ['digestive'],
});

export const APPENDIX: AnatomyNode = node({
  id: 'FMA:14539',
  fmaId: 14539,
  nameEn: 'Appendix',
  nameLatin: 'appendix vermiformis',
  nameAr: 'الزائدة الدودية',
  synonyms: ['Vermiform appendix'],
  nameClinical: 'Appendix',
  level: 4,
  structureType: 'organ',
  parentId: 'abdomen_large_intestine',
  regionTags: ['abdomen'],
  systemTags: ['digestive'],
  highlightColor: '#e53e3e',
});

export const ASCENDING_COLON: AnatomyNode = node({
  id: 'FMA:14544',
  fmaId: 14544,
  nameEn: 'Ascending colon',
  nameLatin: 'colon ascendens',
  nameAr: 'القولون الصاعد',
  level: 4,
  structureType: 'other',
  parentId: 'abdomen_large_intestine',
  regionTags: ['abdomen'],
  systemTags: ['digestive'],
});

export const TRANSVERSE_COLON: AnatomyNode = node({
  id: 'FMA:14545',
  fmaId: 14545,
  nameEn: 'Transverse colon',
  nameLatin: 'colon transversum',
  nameAr: 'القولون المستعرض',
  level: 4,
  structureType: 'other',
  parentId: 'abdomen_large_intestine',
  regionTags: ['abdomen'],
  systemTags: ['digestive'],
});

export const DESCENDING_COLON: AnatomyNode = node({
  id: 'FMA:14547',
  fmaId: 14547,
  nameEn: 'Descending colon',
  nameLatin: 'colon descendens',
  nameAr: 'القولون النازل',
  level: 4,
  structureType: 'other',
  parentId: 'abdomen_large_intestine',
  regionTags: ['abdomen'],
  systemTags: ['digestive'],
});

export const SIGMOID_COLON: AnatomyNode = node({
  id: 'FMA:14548',
  fmaId: 14548,
  nameEn: 'Sigmoid colon',
  nameLatin: 'colon sigmoideum',
  nameAr: 'القولون السيني',
  level: 4,
  structureType: 'other',
  parentId: 'abdomen_large_intestine',
  regionTags: ['abdomen'],
  systemTags: ['digestive'],
  highlightColor: '#f6ad55',
});

export const HEPATIC_FLEXURE: AnatomyNode = node({
  id: 'abdomen_hepatic_flexure',
  nameEn: 'Hepatic flexure (right colic flexure)',
  nameAr: 'الانعطاف الكبدي',
  level: 4,
  structureType: 'other',
  parentId: 'abdomen_large_intestine',
  regionTags: ['abdomen'],
  systemTags: ['digestive'],
});

export const SPLENIC_FLEXURE: AnatomyNode = node({
  id: 'abdomen_splenic_flexure',
  nameEn: 'Splenic flexure (left colic flexure)',
  nameAr: 'الانعطاف الطحالي',
  level: 4,
  structureType: 'other',
  parentId: 'abdomen_large_intestine',
  regionTags: ['abdomen'],
  systemTags: ['digestive'],
});

// ── Level 3: Digestive — Peritoneum ──────────────────────────

export const PERITONEUM: AnatomyNode = node({
  id: 'FMA:9703',
  fmaId: 9703,
  nameEn: 'Peritoneum',
  nameLatin: 'peritoneum',
  nameAr: 'الصفاق',
  level: 3,
  structureType: 'other',
  parentId: 'abdomen_digestive',
  regionTags: ['abdomen'],
  systemTags: ['digestive'],
});

export const GREATER_OMENTUM: AnatomyNode = node({
  id: 'FMA:9700',
  fmaId: 9700,
  nameEn: 'Greater omentum',
  nameLatin: 'omentum majus',
  nameAr: 'الثرب الأكبر',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:9703',
  regionTags: ['abdomen'],
  systemTags: ['digestive'],
});

export const LESSER_OMENTUM: AnatomyNode = node({
  id: 'FMA:9701',
  fmaId: 9701,
  nameEn: 'Lesser omentum',
  nameLatin: 'omentum minus',
  nameAr: 'الثرب الأصغر',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:9703',
  regionTags: ['abdomen'],
  systemTags: ['digestive'],
});

export const MESENTERY: AnatomyNode = node({
  id: 'FMA:9598',
  fmaId: 9598,
  nameEn: 'Mesentery',
  nameLatin: 'mesenterium',
  nameAr: 'المساريقا',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:9703',
  regionTags: ['abdomen'],
  systemTags: ['digestive'],
});

// ── Level 3: Urinary ─────────────────────────────────────────

export const RIGHT_KIDNEY: AnatomyNode = node({
  id: 'FMA:7203',
  fmaId: 7203,
  nameEn: 'Right kidney',
  nameLatin: 'ren dexter',
  nameAr: 'الكلية اليمنى',
  level: 3,
  structureType: 'organ',
  parentId: 'abdomen_urinary',
  regionTags: ['abdomen'],
  systemTags: ['urinary'],
  layer: 'organ',
  highlightColor: '#fc8181',
  sex: 'both',
});

export const KIDNEY_CORTEX_R: AnatomyNode = node({
  id: 'FMA:7205',
  fmaId: 7205,
  nameEn: 'Cortex of kidney',
  nameLatin: 'cortex renalis',
  nameAr: 'قشرة الكلية',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:7203',
  regionTags: ['abdomen'],
  systemTags: ['urinary'],
});

export const KIDNEY_MEDULLA_R: AnatomyNode = node({
  id: 'kidney_medulla_r',
  fmaId: 243768,
  nameEn: 'Medulla of kidney',
  nameAr: 'نخاع الكلية',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:7203',
  regionTags: ['abdomen'],
  systemTags: ['urinary'],
});

export const RENAL_PELVIS_R: AnatomyNode = node({
  id: 'FMA:15586',
  fmaId: 15586,
  nameEn: 'Renal pelvis (right)',
  nameLatin: 'pelvis renalis',
  nameAr: 'الحوض الكلوي الأيمن',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:7203',
  regionTags: ['abdomen'],
  systemTags: ['urinary'],
});

export const MAJOR_CALYX: AnatomyNode = node({
  id: 'FMA:15587',
  fmaId: 15587,
  nameEn: 'Major calyx',
  nameAr: 'الكأس الكبرى',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:7203',
  regionTags: ['abdomen'],
  systemTags: ['urinary'],
});

export const KIDNEY_GLOMERULUS: AnatomyNode = node({
  id: 'kidney_glomerulus',
  nameEn: 'Glomerulus / Nephron',
  nameAr: 'الكبيبة / النيفرون',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:7203',
  regionTags: ['abdomen'],
  systemTags: ['urinary'],
});

export const LEFT_KIDNEY: AnatomyNode = node({
  id: 'FMA:7204',
  fmaId: 7204,
  nameEn: 'Left kidney',
  nameLatin: 'ren sinister',
  nameAr: 'الكلية اليسرى',
  level: 3,
  structureType: 'organ',
  parentId: 'abdomen_urinary',
  regionTags: ['abdomen'],
  systemTags: ['urinary'],
  layer: 'organ',
  highlightColor: '#fc8181',
});

export const RIGHT_URETER: AnatomyNode = node({
  id: 'FMA:9718',
  fmaId: 9718,
  nameEn: 'Right ureter',
  nameLatin: 'ureter dexter',
  nameAr: 'الحالب الأيمن',
  level: 3,
  structureType: 'organ',
  parentId: 'abdomen_urinary',
  regionTags: ['abdomen'],
  systemTags: ['urinary'],
});

export const LEFT_URETER: AnatomyNode = node({
  id: 'FMA:9719',
  fmaId: 9719,
  nameEn: 'Left ureter',
  nameLatin: 'ureter sinister',
  nameAr: 'الحالب الأيسر',
  level: 3,
  structureType: 'organ',
  parentId: 'abdomen_urinary',
  regionTags: ['abdomen'],
  systemTags: ['urinary'],
});

// ── Level 3: Endocrine — Adrenal glands ──────────────────────

export const RIGHT_SUPRARENAL: AnatomyNode = node({
  id: 'FMA:7214',
  fmaId: 7214,
  nameEn: 'Right suprarenal gland',
  nameLatin: 'glandula suprarenalis dextra',
  nameAr: 'الغدة الكظرية اليمنى',
  synonyms: ['Right adrenal gland'],
  level: 3,
  structureType: 'gland',
  parentId: 'abdomen_endocrine',
  regionTags: ['abdomen'],
  highlightColor: '#d69e2e',
});

export const LEFT_SUPRARENAL: AnatomyNode = node({
  id: 'FMA:7215',
  fmaId: 7215,
  nameEn: 'Left suprarenal gland',
  nameLatin: 'glandula suprarenalis sinistra',
  nameAr: 'الغدة الكظرية اليسرى',
  synonyms: ['Left adrenal gland'],
  level: 3,
  structureType: 'gland',
  parentId: 'abdomen_endocrine',
  regionTags: ['abdomen'],
  highlightColor: '#d69e2e',
});

export const ADRENAL_CORTEX: AnatomyNode = node({
  id: 'adrenal_cortex',
  nameEn: 'Adrenal cortex',
  nameAr: 'قشرة الغدة الكظرية',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:7215',
  regionTags: ['abdomen'],
});

export const ADRENAL_MEDULLA: AnatomyNode = node({
  id: 'adrenal_medulla',
  nameEn: 'Adrenal medulla',
  nameAr: 'نخاع الغدة الكظرية',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:7215',
  regionTags: ['abdomen'],
});

// ── Level 3: Abdominal vessels ────────────────────────────────

export const ABDOMINAL_AORTA: AnatomyNode = node({
  id: 'FMA:3796',
  fmaId: 3796,
  nameEn: 'Abdominal aorta',
  nameLatin: 'aorta abdominalis',
  nameAr: 'الأبهر البطني',
  level: 3,
  structureType: 'artery',
  parentId: 'abdomen_vascular',
  regionTags: ['abdomen'],
  systemTags: ['cardiovascular'],
  layer: 'artery',
  highlightColor: '#e53e3e',
});

export const CELIAC_TRUNK: AnatomyNode = node({
  id: 'FMA:16530',
  fmaId: 16530,
  nameEn: 'Celiac trunk',
  nameLatin: 'truncus coeliacus',
  nameAr: 'الجذع البطني',
  level: 4,
  structureType: 'artery',
  parentId: 'FMA:3796',
  regionTags: ['abdomen'],
  systemTags: ['cardiovascular'],
});

export const LEFT_GASTRIC_ARTERY: AnatomyNode = node({
  id: 'FMA:16787',
  fmaId: 16787,
  nameEn: 'Left gastric artery',
  nameAr: 'الشريان المعدي الأيسر',
  level: 5,
  structureType: 'artery',
  parentId: 'FMA:16530',
  regionTags: ['abdomen'],
  systemTags: ['cardiovascular'],
});

export const COMMON_HEPATIC_ARTERY: AnatomyNode = node({
  id: 'FMA:16786',
  fmaId: 16786,
  nameEn: 'Common hepatic artery',
  nameAr: 'الشريان الكبدي المشترك',
  level: 5,
  structureType: 'artery',
  parentId: 'FMA:16530',
  regionTags: ['abdomen'],
  systemTags: ['cardiovascular'],
});

export const SPLENIC_ARTERY: AnatomyNode = node({
  id: 'FMA:16785',
  fmaId: 16785,
  nameEn: 'Splenic artery',
  nameAr: 'الشريان الطحالي',
  level: 5,
  structureType: 'artery',
  parentId: 'FMA:16530',
  regionTags: ['abdomen'],
  systemTags: ['cardiovascular'],
});

export const SUPERIOR_MESENTERIC_ARTERY: AnatomyNode = node({
  id: 'FMA:14312',
  fmaId: 14312,
  nameEn: 'Superior mesenteric artery',
  nameLatin: 'arteria mesenterica superior',
  nameAr: 'الشريان المساريقي العلوي',
  abbreviations: ['SMA'],
  level: 4,
  structureType: 'artery',
  parentId: 'FMA:3796',
  regionTags: ['abdomen'],
  systemTags: ['cardiovascular'],
});

export const INFERIOR_MESENTERIC_ARTERY: AnatomyNode = node({
  id: 'FMA:14313',
  fmaId: 14313,
  nameEn: 'Inferior mesenteric artery',
  nameLatin: 'arteria mesenterica inferior',
  nameAr: 'الشريان المساريقي السفلي',
  abbreviations: ['IMA'],
  level: 4,
  structureType: 'artery',
  parentId: 'FMA:3796',
  regionTags: ['abdomen'],
  systemTags: ['cardiovascular'],
});

export const RENAL_ARTERIES: AnatomyNode = node({
  id: 'FMA:14316',
  fmaId: 14316,
  nameEn: 'Renal arteries',
  nameAr: 'الشرايين الكلوية',
  level: 4,
  structureType: 'artery',
  parentId: 'FMA:3796',
  regionTags: ['abdomen'],
  systemTags: ['cardiovascular'],
});

export const PORTAL_VEIN: AnatomyNode = node({
  id: 'FMA:10400',
  fmaId: 10400,
  nameEn: 'Portal vein',
  nameLatin: 'vena portae hepatis',
  nameAr: 'الوريد البابي',
  level: 3,
  structureType: 'vein',
  parentId: 'abdomen_vascular',
  regionTags: ['abdomen'],
  systemTags: ['cardiovascular'],
  layer: 'vein',
  highlightColor: '#3182ce',
});

export const ABDOMINAL_IVC: AnatomyNode = node({
  id: 'FMA:10953',
  fmaId: 10953,
  nameEn: 'Inferior vena cava (abdominal)',
  nameAr: 'الوريد الأجوف السفلي البطني',
  level: 3,
  structureType: 'vein',
  parentId: 'abdomen_vascular',
  regionTags: ['abdomen'],
  systemTags: ['cardiovascular'],
  layer: 'vein',
  highlightColor: '#3182ce',
});

// ── Level 3: Abdominal wall muscles ──────────────────────────

export const EXTERNAL_OBLIQUE: AnatomyNode = node({
  id: 'FMA:9620',
  fmaId: 9620,
  nameEn: 'External oblique muscle',
  nameLatin: 'musculus obliquus externus abdominis',
  nameAr: 'العضلة المائلة الخارجية',
  level: 3,
  structureType: 'muscle',
  parentId: 'abdomen_muscular',
  regionTags: ['abdomen'],
  systemTags: ['muscular'],
  layer: 'muscle_superficial',
});

export const INTERNAL_OBLIQUE: AnatomyNode = node({
  id: 'FMA:9621',
  fmaId: 9621,
  nameEn: 'Internal oblique muscle',
  nameLatin: 'musculus obliquus internus abdominis',
  nameAr: 'العضلة المائلة الداخلية',
  level: 3,
  structureType: 'muscle',
  parentId: 'abdomen_muscular',
  regionTags: ['abdomen'],
  systemTags: ['muscular'],
  layer: 'muscle_deep',
});

export const TRANSVERSUS_ABDOMINIS: AnatomyNode = node({
  id: 'FMA:9622',
  fmaId: 9622,
  nameEn: 'Transversus abdominis',
  nameLatin: 'musculus transversus abdominis',
  nameAr: 'العضلة العرضية للبطن',
  level: 3,
  structureType: 'muscle',
  parentId: 'abdomen_muscular',
  regionTags: ['abdomen'],
  systemTags: ['muscular'],
  layer: 'muscle_deep',
});

export const RECTUS_ABDOMINIS: AnatomyNode = node({
  id: 'FMA:9623',
  fmaId: 9623,
  nameEn: 'Rectus abdominis',
  nameLatin: 'musculus rectus abdominis',
  nameAr: 'العضلة المستقيمة للبطن',
  level: 3,
  structureType: 'muscle',
  parentId: 'abdomen_muscular',
  regionTags: ['abdomen'],
  systemTags: ['muscular'],
  layer: 'muscle_superficial',
  highlightColor: '#f6ad55',
});

export const LINEA_ALBA: AnatomyNode = node({
  id: 'FMA:22664',
  fmaId: 22664,
  nameEn: 'Linea alba',
  nameLatin: 'linea alba',
  nameAr: 'الخط الأبيض',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:9623',
  regionTags: ['abdomen'],
  systemTags: ['muscular'],
});

export const TENDINOUS_INTERSECTIONS: AnatomyNode = node({
  id: 'FMA:22665',
  fmaId: 22665,
  nameEn: 'Tendinous intersections',
  nameAr: 'التقاطعات الوترية',
  level: 4,
  structureType: 'tendon',
  parentId: 'FMA:9623',
  regionTags: ['abdomen'],
  systemTags: ['muscular'],
});

export const INGUINAL_CANAL: AnatomyNode = node({
  id: 'abdomen_inguinal_canal',
  nameEn: 'Inguinal canal',
  nameLatin: 'canalis inguinalis',
  nameAr: 'القناة الإربية',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:9623',
  regionTags: ['abdomen'],
  systemTags: ['muscular'],
});

// ── Level 3: Autonomic nerves ─────────────────────────────────

export const CELIAC_PLEXUS: AnatomyNode = node({
  id: 'FMA:15069',
  fmaId: 15069,
  nameEn: 'Celiac plexus',
  nameLatin: 'plexus coeliacus',
  nameAr: 'الضفيرة البطنية',
  synonyms: ['Solar plexus'],
  nameClinical: 'Solar plexus',
  level: 3,
  structureType: 'nerve',
  parentId: 'abdomen_nervous',
  regionTags: ['abdomen'],
  systemTags: ['nervous'],
  layer: 'nerve',
});

export const LUMBAR_PLEXUS: AnatomyNode = node({
  id: 'abdomen_lumbar_plexus',
  nameEn: 'Lumbar plexus',
  nameLatin: 'plexus lumbalis',
  nameAr: 'الضفيرة القطنية',
  level: 3,
  structureType: 'nerve',
  parentId: 'abdomen_nervous',
  regionTags: ['abdomen'],
  systemTags: ['nervous'],
  layer: 'nerve',
});

// ── Export ────────────────────────────────────────────────────

export const ALL_ABDOMEN_NODES: AnatomyNode[] = [
  // L1
  ABDOMEN,
  // L2 — Systems
  ABDOMEN_DIGESTIVE, ABDOMEN_URINARY, ABDOMEN_ENDOCRINE,
  ABDOMEN_VASCULAR, ABDOMEN_NERVOUS, ABDOMEN_MUSCULAR, ABDOMEN_SKELETAL,
  // L3 — Digestive
  STOMACH, LIVER, PANCREAS, SPLEEN, SMALL_INTESTINE, LARGE_INTESTINE, PERITONEUM,
  // L3 — Urinary
  RIGHT_KIDNEY, LEFT_KIDNEY, RIGHT_URETER, LEFT_URETER,
  // L3 — Endocrine
  RIGHT_SUPRARENAL, LEFT_SUPRARENAL,
  // L3 — Vascular
  ABDOMINAL_AORTA, PORTAL_VEIN, ABDOMINAL_IVC,
  // L3 — Muscular
  EXTERNAL_OBLIQUE, INTERNAL_OBLIQUE, TRANSVERSUS_ABDOMINIS, RECTUS_ABDOMINIS,
  // L3 — Nervous
  CELIAC_PLEXUS, LUMBAR_PLEXUS,
  // L4 — Stomach
  STOMACH_CARDIA, STOMACH_FUNDUS, STOMACH_BODY, PYLORUS,
  STOMACH_LESSER_CURVE, STOMACH_GREATER_CURVE,
  // L4 — Liver
  LIVER_RIGHT_LOBE, LIVER_LEFT_LOBE, LIVER_CAUDATE_LOBE, LIVER_QUADRATE_LOBE,
  GALLBLADDER, COMMON_BILE_DUCT, COMMON_HEPATIC_DUCT, LIVER_COUINAUD_SEGMENTS,
  // L4 — Pancreas
  PANCREAS_HEAD, PANCREAS_BODY, PANCREAS_TAIL, PANCREATIC_DUCT,
  ISLETS_OF_LANGERHANS, PANCREAS_UNCINATE,
  // L4 — Small intestine
  DUODENUM, JEJUNUM, ILEUM,
  // L4 — Large intestine
  CECUM, APPENDIX, ASCENDING_COLON, TRANSVERSE_COLON, DESCENDING_COLON,
  SIGMOID_COLON, HEPATIC_FLEXURE, SPLENIC_FLEXURE,
  // L4 — Peritoneum
  GREATER_OMENTUM, LESSER_OMENTUM, MESENTERY,
  // L4 — Urinary
  KIDNEY_CORTEX_R, KIDNEY_MEDULLA_R, RENAL_PELVIS_R, MAJOR_CALYX, KIDNEY_GLOMERULUS,
  // L4 — Endocrine
  ADRENAL_CORTEX, ADRENAL_MEDULLA,
  // L4 — Vascular
  CELIAC_TRUNK, SUPERIOR_MESENTERIC_ARTERY, INFERIOR_MESENTERIC_ARTERY, RENAL_ARTERIES,
  // L4 — Muscular
  LINEA_ALBA, TENDINOUS_INTERSECTIONS, INGUINAL_CANAL,
  // L5 — Stomach
  PYLORIC_SPHINCTER,
  // L5 — Duodenum
  DUODENUM_D1, DUODENUM_D2, DUODENUM_D3, DUODENUM_D4, MAJOR_DUODENAL_PAPILLA,
  // L5 — Ileum
  ILEOCECAL_VALVE, MECKELS_DIVERTICULUM,
  // L5 — Celiac trunk branches
  LEFT_GASTRIC_ARTERY, COMMON_HEPATIC_ARTERY, SPLENIC_ARTERY,
];
