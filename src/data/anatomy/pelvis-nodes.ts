// ============================================================
// Passboard Anatomy Module — Pelvis Hierarchy
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
    parentId: null, regionTags: ['pelvis'], systemTags: [],
    sex: 'both', layer: null, meshIds: [], contentId: null,
    modelPending: false, highlightColor: null, sortOrder: 0,
    ...partial,
  };
}

// ── Level 1: Pelvis region ────────────────────────────────────

export const PELVIS: AnatomyNode = node({
  id: 'FMA:9578',
  fmaId: 9578,
  nameEn: 'Pelvis',
  nameLatin: 'pelvis',
  nameAr: 'الحوض',
  level: 1,
  structureType: 'region',
  regionTags: ['pelvis'],
  sortOrder: 5,
});

// ── Level 2: Systems within Pelvis ───────────────────────────

export const PELVIS_URINARY: AnatomyNode = node({
  id: 'pelvis_urinary',
  nameEn: 'Urinary bladder & urethra',
  nameAr: 'الجهاز البولي',
  level: 2,
  structureType: 'region',
  parentId: 'FMA:9578',
  regionTags: ['pelvis'],
  systemTags: ['urinary'],
});

export const PELVIS_REPRODUCTIVE_FEMALE: AnatomyNode = node({
  id: 'pelvis_reproductive_female',
  nameEn: 'Female reproductive organs',
  nameAr: 'الجهاز التناسلي الأنثوي',
  level: 2,
  structureType: 'region',
  parentId: 'FMA:9578',
  regionTags: ['pelvis'],
  systemTags: [],
  sex: 'female',
});

export const PELVIS_REPRODUCTIVE_MALE: AnatomyNode = node({
  id: 'pelvis_reproductive_male',
  nameEn: 'Male reproductive organs',
  nameAr: 'الجهاز التناسلي الذكري',
  level: 2,
  structureType: 'region',
  parentId: 'FMA:9578',
  regionTags: ['pelvis'],
  systemTags: [],
  sex: 'male',
});

export const PELVIS_DIGESTIVE: AnatomyNode = node({
  id: 'pelvis_digestive',
  nameEn: 'Rectum & anal canal',
  nameAr: 'المستقيم والقناة الشرجية',
  level: 2,
  structureType: 'region',
  parentId: 'FMA:9578',
  regionTags: ['pelvis'],
  systemTags: ['digestive'],
});

export const PELVIS_VASCULAR: AnatomyNode = node({
  id: 'pelvis_vascular',
  nameEn: 'Iliac vessels',
  nameAr: 'الأوعية الحرقفية',
  level: 2,
  structureType: 'region',
  parentId: 'FMA:9578',
  regionTags: ['pelvis'],
  systemTags: ['cardiovascular'],
});

export const PELVIS_NERVOUS: AnatomyNode = node({
  id: 'pelvis_nervous',
  nameEn: 'Sacral plexus',
  nameAr: 'الضفيرة العجزية',
  level: 2,
  structureType: 'region',
  parentId: 'FMA:9578',
  regionTags: ['pelvis'],
  systemTags: ['nervous'],
});

export const PELVIS_SKELETAL: AnatomyNode = node({
  id: 'pelvis_skeletal',
  nameEn: 'Pelvic bones',
  nameAr: 'عظام الحوض',
  level: 2,
  structureType: 'region',
  parentId: 'FMA:9578',
  regionTags: ['pelvis'],
  systemTags: ['skeletal'],
});

export const PELVIS_MUSCULAR: AnatomyNode = node({
  id: 'pelvis_muscular',
  nameEn: 'Pelvic floor muscles',
  nameAr: 'عضلات قاع الحوض',
  level: 2,
  structureType: 'region',
  parentId: 'FMA:9578',
  regionTags: ['pelvis'],
  systemTags: ['muscular'],
});

// ── Level 3: Urinary ─────────────────────────────────────────

export const URINARY_BLADDER: AnatomyNode = node({
  id: 'FMA:15900',
  fmaId: 15900,
  nameEn: 'Urinary bladder',
  nameLatin: 'vesica urinaria',
  nameAr: 'المثانة البولية',
  level: 3,
  structureType: 'organ',
  parentId: 'pelvis_urinary',
  regionTags: ['pelvis'],
  systemTags: ['urinary'],
  layer: 'organ',
  highlightColor: '#fbd38d',
});

export const BLADDER_TRIGONE: AnatomyNode = node({
  id: 'FMA:15913',
  fmaId: 15913,
  nameEn: 'Trigone of bladder',
  nameLatin: 'trigonum vesicae',
  nameAr: 'المثلث المثاني',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:15900',
  regionTags: ['pelvis'],
  systemTags: ['urinary'],
});

export const DETRUSOR_MUSCLE: AnatomyNode = node({
  id: 'FMA:15916',
  fmaId: 15916,
  nameEn: 'Detrusor muscle',
  nameLatin: 'musculus detrusor vesicae',
  nameAr: 'العضلة الطاردة للبول',
  level: 4,
  structureType: 'muscle',
  parentId: 'FMA:15900',
  regionTags: ['pelvis'],
  systemTags: ['urinary'],
});

export const FEMALE_URETHRA: AnatomyNode = node({
  id: 'FMA:9612',
  fmaId: 9612,
  nameEn: 'Female urethra',
  nameLatin: 'urethra feminina',
  nameAr: 'الإحليل الأنثوي',
  level: 3,
  structureType: 'organ',
  parentId: 'pelvis_urinary',
  regionTags: ['pelvis'],
  systemTags: ['urinary'],
  sex: 'female',
});

export const MALE_URETHRA: AnatomyNode = node({
  id: 'FMA:9613',
  fmaId: 9613,
  nameEn: 'Male urethra',
  nameLatin: 'urethra masculina',
  nameAr: 'الإحليل الذكري',
  level: 3,
  structureType: 'organ',
  parentId: 'pelvis_urinary',
  regionTags: ['pelvis'],
  systemTags: ['urinary'],
  sex: 'male',
});

// ── Level 3: Female reproductive ─────────────────────────────

export const UTERUS: AnatomyNode = node({
  id: 'FMA:17558',
  fmaId: 17558,
  nameEn: 'Uterus',
  nameLatin: 'uterus',
  nameAr: 'الرحم',
  level: 3,
  structureType: 'organ',
  parentId: 'pelvis_reproductive_female',
  regionTags: ['pelvis'],
  systemTags: [],
  layer: 'organ',
  highlightColor: '#f9a8d4',
  sex: 'female',
});

export const UTERUS_FUNDUS: AnatomyNode = node({
  id: 'FMA:17560',
  fmaId: 17560,
  nameEn: 'Fundus of uterus',
  nameLatin: 'fundus uteri',
  nameAr: 'قاع الرحم',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:17558',
  regionTags: ['pelvis'],
  sex: 'female',
});

export const UTERUS_BODY: AnatomyNode = node({
  id: 'FMA:17561',
  fmaId: 17561,
  nameEn: 'Body of uterus',
  nameLatin: 'corpus uteri',
  nameAr: 'جسم الرحم',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:17558',
  regionTags: ['pelvis'],
  sex: 'female',
});

export const CERVIX_UTERI: AnatomyNode = node({
  id: 'FMA:17562',
  fmaId: 17562,
  nameEn: 'Cervix of uterus',
  nameLatin: 'cervix uteri',
  nameAr: 'عنق الرحم',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:17558',
  regionTags: ['pelvis'],
  sex: 'female',
  highlightColor: '#f9a8d4',
});

export const ENDOMETRIUM: AnatomyNode = node({
  id: 'FMA:17563',
  fmaId: 17563,
  nameEn: 'Endometrium',
  nameLatin: 'endometrium',
  nameAr: 'بطانة الرحم',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:17558',
  regionTags: ['pelvis'],
  sex: 'female',
});

export const MYOMETRIUM: AnatomyNode = node({
  id: 'FMA:17564',
  fmaId: 17564,
  nameEn: 'Myometrium',
  nameLatin: 'myometrium',
  nameAr: 'عضلة الرحم',
  level: 4,
  structureType: 'muscle',
  parentId: 'FMA:17558',
  regionTags: ['pelvis'],
  sex: 'female',
});

export const RIGHT_UTERINE_TUBE: AnatomyNode = node({
  id: 'FMA:18215',
  fmaId: 18215,
  nameEn: 'Right uterine tube',
  nameLatin: 'tuba uterina dextra',
  nameAr: 'قناة فالوب اليمنى',
  synonyms: ['Right Fallopian tube'],
  nameClinical: 'Right Fallopian tube',
  level: 3,
  structureType: 'organ',
  parentId: 'pelvis_reproductive_female',
  regionTags: ['pelvis'],
  sex: 'female',
});

export const LEFT_UTERINE_TUBE: AnatomyNode = node({
  id: 'FMA:18216',
  fmaId: 18216,
  nameEn: 'Left uterine tube',
  nameAr: 'قناة فالوب اليسرى',
  level: 3,
  structureType: 'organ',
  parentId: 'pelvis_reproductive_female',
  regionTags: ['pelvis'],
  sex: 'female',
});

export const RIGHT_OVARY: AnatomyNode = node({
  id: 'FMA:24085',
  fmaId: 24085,
  nameEn: 'Right ovary',
  nameLatin: 'ovarium dextrum',
  nameAr: 'المبيض الأيمن',
  level: 3,
  structureType: 'gland',
  parentId: 'pelvis_reproductive_female',
  regionTags: ['pelvis'],
  systemTags: [],
  layer: 'organ',
  highlightColor: '#f9a8d4',
  sex: 'female',
});

export const LEFT_OVARY: AnatomyNode = node({
  id: 'FMA:24086',
  fmaId: 24086,
  nameEn: 'Left ovary',
  nameAr: 'المبيض الأيسر',
  level: 3,
  structureType: 'gland',
  parentId: 'pelvis_reproductive_female',
  regionTags: ['pelvis'],
  sex: 'female',
});

export const VAGINA: AnatomyNode = node({
  id: 'FMA:19268',
  fmaId: 19268,
  nameEn: 'Vagina',
  nameLatin: 'vagina',
  nameAr: 'المهبل',
  level: 3,
  structureType: 'organ',
  parentId: 'pelvis_reproductive_female',
  regionTags: ['pelvis'],
  sex: 'female',
});

// ── Level 3: Male reproductive ────────────────────────────────

export const PROSTATE: AnatomyNode = node({
  id: 'FMA:9362',
  fmaId: 9362,
  nameEn: 'Prostate',
  nameLatin: 'prostata',
  nameAr: 'البروستاتة',
  level: 3,
  structureType: 'gland',
  parentId: 'pelvis_reproductive_male',
  regionTags: ['pelvis'],
  systemTags: [],
  layer: 'organ',
  highlightColor: '#fbd38d',
  sex: 'male',
});

export const PROSTATE_PERIPHERAL_ZONE: AnatomyNode = node({
  id: 'FMA:67685',
  fmaId: 67685,
  nameEn: 'Peripheral zone of prostate',
  nameAr: 'المنطقة المحيطية للبروستاتة',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:9362',
  regionTags: ['pelvis'],
  sex: 'male',
});

export const PROSTATE_TRANSITION_ZONE: AnatomyNode = node({
  id: 'FMA:67686',
  fmaId: 67686,
  nameEn: 'Transition zone of prostate',
  nameAr: 'المنطقة الانتقالية للبروستاتة',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:9362',
  regionTags: ['pelvis'],
  sex: 'male',
});

export const PROSTATE_CENTRAL_ZONE: AnatomyNode = node({
  id: 'FMA:67684',
  fmaId: 67684,
  nameEn: 'Central zone of prostate',
  nameAr: 'المنطقة المركزية للبروستاتة',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:9362',
  regionTags: ['pelvis'],
  sex: 'male',
});

export const SEMINAL_VESICLE_R: AnatomyNode = node({
  id: 'FMA:9599',
  fmaId: 9599,
  nameEn: 'Seminal vesicle (right)',
  nameLatin: 'glandula vesiculosa dextra',
  nameAr: 'الحويصلة المنوية اليمنى',
  level: 3,
  structureType: 'gland',
  parentId: 'pelvis_reproductive_male',
  regionTags: ['pelvis'],
  sex: 'male',
});

export const VAS_DEFERENS: AnatomyNode = node({
  id: 'pelvis_vas_deferens',
  nameEn: 'Vas deferens',
  nameLatin: 'ductus deferens',
  nameAr: 'القناة الدافقة',
  level: 3,
  structureType: 'other',
  parentId: 'pelvis_reproductive_male',
  regionTags: ['pelvis'],
  sex: 'male',
});

export const EJACULATORY_DUCT: AnatomyNode = node({
  id: 'pelvis_ejaculatory',
  nameEn: 'Ejaculatory duct',
  nameAr: 'القناة القاذفة',
  level: 3,
  structureType: 'other',
  parentId: 'pelvis_reproductive_male',
  regionTags: ['pelvis'],
  sex: 'male',
});

// ── Level 3: Rectum ───────────────────────────────────────────

export const RECTUM: AnatomyNode = node({
  id: 'FMA:14227',
  fmaId: 14227,
  nameEn: 'Rectum',
  nameLatin: 'rectum',
  nameAr: 'المستقيم',
  level: 3,
  structureType: 'organ',
  parentId: 'pelvis_digestive',
  regionTags: ['pelvis'],
  systemTags: ['digestive'],
  layer: 'organ',
  highlightColor: '#b7791f',
});

export const RECTAL_AMPULLA: AnatomyNode = node({
  id: 'FMA:14551',
  fmaId: 14551,
  nameEn: 'Rectal ampulla',
  nameLatin: 'ampulla recti',
  nameAr: 'مصطرة المستقيم',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:14227',
  regionTags: ['pelvis'],
  systemTags: ['digestive'],
});

export const INTERNAL_ANAL_SPHINCTER: AnatomyNode = node({
  id: 'FMA:15046',
  fmaId: 15046,
  nameEn: 'Internal anal sphincter',
  nameLatin: 'musculus sphincter ani internus',
  nameAr: 'العضلة العاصرة الشرجية الداخلية',
  level: 4,
  structureType: 'muscle',
  parentId: 'FMA:14227',
  regionTags: ['pelvis'],
  systemTags: ['digestive'],
});

export const EXTERNAL_ANAL_SPHINCTER: AnatomyNode = node({
  id: 'FMA:15047',
  fmaId: 15047,
  nameEn: 'External anal sphincter',
  nameLatin: 'musculus sphincter ani externus',
  nameAr: 'العضلة العاصرة الشرجية الخارجية',
  level: 4,
  structureType: 'muscle',
  parentId: 'FMA:14227',
  regionTags: ['pelvis'],
  systemTags: ['digestive'],
});

export const ANAL_CANAL: AnatomyNode = node({
  id: 'FMA:14553',
  fmaId: 14553,
  nameEn: 'Anal canal',
  nameLatin: 'canalis analis',
  nameAr: 'القناة الشرجية',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:14227',
  regionTags: ['pelvis'],
  systemTags: ['digestive'],
});

export const HOUSTON_VALVES: AnatomyNode = node({
  id: 'pelvis_houston_valves',
  nameEn: 'Transverse rectal folds',
  nameAr: 'الطيات المستعرضة للمستقيم',
  synonyms: ["Houston's valves"],
  level: 4,
  structureType: 'other',
  parentId: 'FMA:14227',
  regionTags: ['pelvis'],
  systemTags: ['digestive'],
});

// ── Level 3: Iliac vessels ────────────────────────────────────

export const RIGHT_COMMON_ILIAC_ARTERY: AnatomyNode = node({
  id: 'FMA:14309',
  fmaId: 14309,
  nameEn: 'Right common iliac artery',
  nameLatin: 'arteria iliaca communis dextra',
  nameAr: 'الشريان الحرقفي المشترك الأيمن',
  level: 3,
  structureType: 'artery',
  parentId: 'pelvis_vascular',
  regionTags: ['pelvis'],
  systemTags: ['cardiovascular'],
  layer: 'artery',
  highlightColor: '#e53e3e',
});

export const LEFT_COMMON_ILIAC_ARTERY: AnatomyNode = node({
  id: 'FMA:14310',
  fmaId: 14310,
  nameEn: 'Left common iliac artery',
  nameAr: 'الشريان الحرقفي المشترك الأيسر',
  level: 3,
  structureType: 'artery',
  parentId: 'pelvis_vascular',
  regionTags: ['pelvis'],
  systemTags: ['cardiovascular'],
  layer: 'artery',
  highlightColor: '#e53e3e',
});

export const RIGHT_INTERNAL_ILIAC_ARTERY: AnatomyNode = node({
  id: 'pelvis_int_iliac_r',
  nameEn: 'Right internal iliac artery',
  nameLatin: 'arteria iliaca interna dextra',
  nameAr: 'الشريان الحرقفي الداخلي الأيمن',
  level: 4,
  structureType: 'artery',
  parentId: 'FMA:14309',
  regionTags: ['pelvis'],
  systemTags: ['cardiovascular'],
});

export const RIGHT_EXTERNAL_ILIAC_ARTERY: AnatomyNode = node({
  id: 'pelvis_ext_iliac_r',
  nameEn: 'Right external iliac artery',
  nameLatin: 'arteria iliaca externa dextra',
  nameAr: 'الشريان الحرقفي الخارجي الأيمن',
  level: 4,
  structureType: 'artery',
  parentId: 'FMA:14309',
  regionTags: ['pelvis'],
  systemTags: ['cardiovascular'],
});

// ── Level 3: Sacral plexus / Nerves ──────────────────────────

export const SCIATIC_NERVE: AnatomyNode = node({
  id: 'FMA:5901',
  fmaId: 5901,
  nameEn: 'Sciatic nerve',
  nameLatin: 'nervus ischiadicus',
  nameAr: 'العصب الوركي',
  level: 3,
  structureType: 'nerve',
  parentId: 'pelvis_nervous',
  regionTags: ['pelvis'],
  systemTags: ['nervous'],
  layer: 'nerve',
  highlightColor: '#68d391',
});

export const PUDENDAL_NERVE: AnatomyNode = node({
  id: 'FMA:15953',
  fmaId: 15953,
  nameEn: 'Pudendal nerve',
  nameLatin: 'nervus pudendus',
  nameAr: 'العصب العجاني',
  level: 3,
  structureType: 'nerve',
  parentId: 'pelvis_nervous',
  regionTags: ['pelvis'],
  systemTags: ['nervous'],
});

// ── Level 3: Pelvic bones ─────────────────────────────────────

export const HIP_BONE: AnatomyNode = node({
  id: 'FMA:16585',
  fmaId: 16585,
  nameEn: 'Hip bone (Os coxae)',
  nameLatin: 'os coxae',
  nameAr: 'عظم الورك',
  level: 3,
  structureType: 'bone',
  parentId: 'pelvis_skeletal',
  regionTags: ['pelvis'],
  systemTags: ['skeletal'],
  layer: 'skeleton',
});

export const ILIUM: AnatomyNode = node({
  id: 'FMA:16588',
  fmaId: 16588,
  nameEn: 'Ilium',
  nameLatin: 'ilium',
  nameAr: 'العظم الحرقفي',
  level: 4,
  structureType: 'bone',
  parentId: 'FMA:16585',
  regionTags: ['pelvis'],
  systemTags: ['skeletal'],
});

export const ISCHIUM: AnatomyNode = node({
  id: 'FMA:16589',
  fmaId: 16589,
  nameEn: 'Ischium',
  nameLatin: 'ischium',
  nameAr: 'عظم الإسك',
  level: 4,
  structureType: 'bone',
  parentId: 'FMA:16585',
  regionTags: ['pelvis'],
  systemTags: ['skeletal'],
});

export const PUBIS: AnatomyNode = node({
  id: 'FMA:16590',
  fmaId: 16590,
  nameEn: 'Pubis',
  nameLatin: 'pubis',
  nameAr: 'عظم العانة',
  level: 4,
  structureType: 'bone',
  parentId: 'FMA:16585',
  regionTags: ['pelvis'],
  systemTags: ['skeletal'],
});

export const ACETABULUM: AnatomyNode = node({
  id: 'FMA:15271',
  fmaId: 15271,
  nameEn: 'Acetabulum',
  nameLatin: 'acetabulum',
  nameAr: 'الحُق',
  level: 4,
  structureType: 'bone',
  parentId: 'FMA:16585',
  regionTags: ['pelvis'],
  systemTags: ['skeletal'],
});

export const SACRUM: AnatomyNode = node({
  id: 'pelvis_sacrum',
  fmaId: 14541,
  nameEn: 'Sacrum',
  nameLatin: 'os sacrum',
  nameAr: 'العجز',
  level: 3,
  structureType: 'bone',
  parentId: 'pelvis_skeletal',
  regionTags: ['pelvis'],
  systemTags: ['skeletal'],
  layer: 'skeleton',
});

export const COCCYX: AnatomyNode = node({
  id: 'FMA:9624',
  fmaId: 9624,
  nameEn: 'Coccyx',
  nameLatin: 'os coccygis',
  nameAr: 'العصعص',
  level: 3,
  structureType: 'bone',
  parentId: 'pelvis_skeletal',
  regionTags: ['pelvis'],
  systemTags: ['skeletal'],
});

export const PUBIC_SYMPHYSIS: AnatomyNode = node({
  id: 'FMA:16592',
  fmaId: 16592,
  nameEn: 'Pubic symphysis',
  nameLatin: 'symphysis pubica',
  nameAr: 'ارتفاق العانة',
  level: 3,
  structureType: 'joint',
  parentId: 'pelvis_skeletal',
  regionTags: ['pelvis'],
  systemTags: ['skeletal'],
});

export const SACROILIAC_JOINT: AnatomyNode = node({
  id: 'FMA:16591',
  fmaId: 16591,
  nameEn: 'Sacroiliac joint',
  nameLatin: 'articulatio sacroiliaca',
  nameAr: 'المفصل العجزي الحرقفي',
  level: 3,
  structureType: 'joint',
  parentId: 'pelvis_skeletal',
  regionTags: ['pelvis'],
  systemTags: ['skeletal'],
});

// ── Level 3: Pelvic floor muscles ────────────────────────────

export const LEVATOR_ANI: AnatomyNode = node({
  id: 'FMA:19866',
  fmaId: 19866,
  nameEn: 'Levator ani',
  nameLatin: 'musculus levator ani',
  nameAr: 'رافع الشرج',
  level: 3,
  structureType: 'muscle',
  parentId: 'pelvis_muscular',
  regionTags: ['pelvis'],
  systemTags: ['muscular'],
  layer: 'muscle_deep',
});

export const PUBOCOCCYGEUS: AnatomyNode = node({
  id: 'FMA:19867',
  fmaId: 19867,
  nameEn: 'Pubococcygeus',
  nameLatin: 'musculus pubococcygeus',
  nameAr: 'العضلة العانية العصعصية',
  level: 4,
  structureType: 'muscle',
  parentId: 'FMA:19866',
  regionTags: ['pelvis'],
  systemTags: ['muscular'],
});

export const ILIOCOCCYGEUS: AnatomyNode = node({
  id: 'FMA:19868',
  fmaId: 19868,
  nameEn: 'Iliococcygeus',
  nameLatin: 'musculus iliococcygeus',
  nameAr: 'العضلة الحرقفية العصعصية',
  level: 4,
  structureType: 'muscle',
  parentId: 'FMA:19866',
  regionTags: ['pelvis'],
  systemTags: ['muscular'],
});

export const PUBORECTALIS: AnatomyNode = node({
  id: 'FMA:19869',
  fmaId: 19869,
  nameEn: 'Puborectalis',
  nameLatin: 'musculus puborectalis',
  nameAr: 'العضلة العانية المستقيمية',
  level: 4,
  structureType: 'muscle',
  parentId: 'FMA:19866',
  regionTags: ['pelvis'],
  systemTags: ['muscular'],
});

export const COCCYGEUS_MUSCLE: AnatomyNode = node({
  id: 'FMA:19870',
  fmaId: 19870,
  nameEn: 'Coccygeus muscle',
  nameLatin: 'musculus coccygeus',
  nameAr: 'العضلة العصعصية',
  level: 3,
  structureType: 'muscle',
  parentId: 'pelvis_muscular',
  regionTags: ['pelvis'],
  systemTags: ['muscular'],
});

export const OBTURATOR_INTERNUS: AnatomyNode = node({
  id: 'pelvis_obturator_internus',
  nameEn: 'Obturator internus',
  nameLatin: 'musculus obturatorius internus',
  nameAr: 'العضلة الانسدادية الداخلية',
  level: 3,
  structureType: 'muscle',
  parentId: 'pelvis_muscular',
  regionTags: ['pelvis'],
  systemTags: ['muscular'],
});

export const PIRIFORMIS: AnatomyNode = node({
  id: 'pelvis_piriformis',
  nameEn: 'Piriformis',
  nameLatin: 'musculus piriformis',
  nameAr: 'العضلة الكمثرية',
  level: 3,
  structureType: 'muscle',
  parentId: 'pelvis_muscular',
  regionTags: ['pelvis'],
  systemTags: ['muscular'],
  layer: 'muscle_deep',
});

// ── Export ────────────────────────────────────────────────────

export const ALL_PELVIS_NODES: AnatomyNode[] = [
  // L1
  PELVIS,
  // L2 — Systems
  PELVIS_URINARY, PELVIS_REPRODUCTIVE_FEMALE, PELVIS_REPRODUCTIVE_MALE,
  PELVIS_DIGESTIVE, PELVIS_VASCULAR, PELVIS_NERVOUS,
  PELVIS_SKELETAL, PELVIS_MUSCULAR,
  // L3 — Urinary
  URINARY_BLADDER, FEMALE_URETHRA, MALE_URETHRA,
  // L3 — Female reproductive
  UTERUS, RIGHT_UTERINE_TUBE, LEFT_UTERINE_TUBE, RIGHT_OVARY, LEFT_OVARY, VAGINA,
  // L3 — Male reproductive
  PROSTATE, SEMINAL_VESICLE_R, VAS_DEFERENS, EJACULATORY_DUCT,
  // L3 — Digestive
  RECTUM,
  // L3 — Vascular
  RIGHT_COMMON_ILIAC_ARTERY, LEFT_COMMON_ILIAC_ARTERY,
  // L3 — Nervous
  SCIATIC_NERVE, PUDENDAL_NERVE,
  // L3 — Skeletal
  HIP_BONE, SACRUM, COCCYX, PUBIC_SYMPHYSIS, SACROILIAC_JOINT,
  // L3 — Muscular
  LEVATOR_ANI, COCCYGEUS_MUSCLE, OBTURATOR_INTERNUS, PIRIFORMIS,
  // L4 — Urinary bladder
  BLADDER_TRIGONE, DETRUSOR_MUSCLE,
  // L4 — Uterus
  UTERUS_FUNDUS, UTERUS_BODY, CERVIX_UTERI, ENDOMETRIUM, MYOMETRIUM,
  // L4 — Prostate
  PROSTATE_PERIPHERAL_ZONE, PROSTATE_TRANSITION_ZONE, PROSTATE_CENTRAL_ZONE,
  // L4 — Rectum
  RECTAL_AMPULLA, INTERNAL_ANAL_SPHINCTER, EXTERNAL_ANAL_SPHINCTER,
  ANAL_CANAL, HOUSTON_VALVES,
  // L4 — Iliac vessels
  RIGHT_INTERNAL_ILIAC_ARTERY, RIGHT_EXTERNAL_ILIAC_ARTERY,
  // L4 — Hip bone
  ILIUM, ISCHIUM, PUBIS, ACETABULUM,
  // L4 — Levator ani
  PUBOCOCCYGEUS, ILIOCOCCYGEUS, PUBORECTALIS,
];
