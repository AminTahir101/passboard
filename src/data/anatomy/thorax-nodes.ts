// ============================================================
// Passboard Anatomy Module — Thorax Hierarchy
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
    fmaId: null,
    fmaUri: null,
    ta2Id: null,
    nameLatin: null,
    nameAr: null,
    nameFma: null,
    nameClinical: null,
    synonyms: [],
    abbreviations: [],
    parentId: null,
    regionTags: ['thorax'],
    systemTags: [],
    sex: 'both',
    layer: null,
    meshIds: [],
    contentId: null,
    modelPending: false,
    highlightColor: null,
    sortOrder: 0,
    ...partial,
  };
}

// ── Level 1: Thorax region ────────────────────────────────────

export const THORAX: AnatomyNode = node({
  id: 'FMA:9648',
  fmaId: 9648,
  fmaUri: 'http://purl.org/sig/ont/fma/fma9648',
  nameEn: 'Thorax',
  nameLatin: 'thorax',
  nameAr: 'الصدر',
  nameFma: 'Thorax',
  level: 1,
  structureType: 'region',
  regionTags: ['thorax'],
  systemTags: [],
  sortOrder: 3,
});

// ── Level 2: Systems within Thorax ───────────────────────────

export const THORAX_CARDIOVASCULAR: AnatomyNode = node({
  id: 'thorax_cardiovascular',
  nameEn: 'Cardiovascular',
  nameAr: 'القلب والأوعية الدموية',
  level: 2,
  structureType: 'region',
  parentId: 'FMA:9648',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  sortOrder: 1,
});

export const THORAX_RESPIRATORY: AnatomyNode = node({
  id: 'thorax_respiratory',
  nameEn: 'Respiratory',
  nameAr: 'الجهاز التنفسي',
  level: 2,
  structureType: 'region',
  parentId: 'FMA:9648',
  regionTags: ['thorax'],
  systemTags: ['respiratory'],
  sortOrder: 2,
});

export const THORAX_SKELETAL: AnatomyNode = node({
  id: 'thorax_skeletal',
  nameEn: 'Skeletal',
  nameAr: 'الجهاز الهيكلي',
  level: 2,
  structureType: 'region',
  parentId: 'FMA:9648',
  regionTags: ['thorax'],
  systemTags: ['skeletal'],
  sortOrder: 3,
});

export const THORAX_MUSCULAR: AnatomyNode = node({
  id: 'thorax_muscular',
  nameEn: 'Muscular',
  nameAr: 'الجهاز العضلي',
  level: 2,
  structureType: 'region',
  parentId: 'FMA:9648',
  regionTags: ['thorax'],
  systemTags: ['muscular'],
  sortOrder: 4,
});

export const THORAX_NERVOUS: AnatomyNode = node({
  id: 'thorax_nervous',
  nameEn: 'Nervous',
  nameAr: 'الجهاز العصبي',
  level: 2,
  structureType: 'region',
  parentId: 'FMA:9648',
  regionTags: ['thorax'],
  systemTags: ['nervous'],
  sortOrder: 5,
});

export const THORAX_DIGESTIVE: AnatomyNode = node({
  id: 'thorax_digestive',
  nameEn: 'Digestive',
  nameAr: 'الجهاز الهضمي',
  level: 2,
  structureType: 'region',
  parentId: 'FMA:9648',
  regionTags: ['thorax'],
  systemTags: ['digestive'],
  sortOrder: 6,
});

// ── Level 3: Cardiovascular structures ───────────────────────

export const HEART: AnatomyNode = node({
  id: 'FMA:7088',
  fmaId: 7088,
  fmaUri: 'http://purl.org/sig/ont/fma/fma7088',
  nameEn: 'Heart',
  nameLatin: 'cor',
  nameAr: 'القلب',
  nameFma: 'Heart',
  level: 3,
  structureType: 'organ',
  parentId: 'thorax_cardiovascular',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  layer: 'organ',
  highlightColor: '#c53030',
  sortOrder: 1,
  meshIds: ['heart_body'],
});

export const ASCENDING_AORTA: AnatomyNode = node({
  id: 'FMA:3734',
  fmaId: 3734,
  fmaUri: 'http://purl.org/sig/ont/fma/fma3734',
  nameEn: 'Ascending aorta',
  nameLatin: 'aorta ascendens',
  nameAr: 'الأبهر الصاعد',
  nameFma: 'Ascending aorta',
  level: 3,
  structureType: 'artery',
  parentId: 'thorax_cardiovascular',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  layer: 'artery',
  highlightColor: '#e53e3e',
  sortOrder: 2,
  meshIds: ['ascending_aorta'],
});

export const PULMONARY_TRUNK: AnatomyNode = node({
  id: 'FMA:8612',
  fmaId: 8612,
  fmaUri: 'http://purl.org/sig/ont/fma/fma8612',
  nameEn: 'Pulmonary trunk',
  nameLatin: 'truncus pulmonalis',
  nameAr: 'الجذع الرئوي',
  nameFma: 'Pulmonary trunk',
  synonyms: ['Main pulmonary artery'],
  level: 3,
  structureType: 'artery',
  parentId: 'thorax_cardiovascular',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  layer: 'artery',
  highlightColor: '#3182ce', // blue — deoxygenated at this point
  sortOrder: 3,
  meshIds: ['pulmonary_trunk'],
});

export const SVC: AnatomyNode = node({
  id: 'FMA:4720',
  fmaId: 4720,
  fmaUri: 'http://purl.org/sig/ont/fma/fma4720',
  nameEn: 'Superior vena cava',
  nameLatin: 'vena cava superior',
  nameAr: 'الوريد الأجوف العلوي',
  nameFma: 'Superior vena cava',
  abbreviations: ['SVC'],
  level: 3,
  structureType: 'vein',
  parentId: 'thorax_cardiovascular',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  layer: 'vein',
  highlightColor: '#3182ce',
  sortOrder: 4,
  meshIds: ['svc'],
});

export const IVC_THORACIC: AnatomyNode = node({
  id: 'FMA:10951',
  fmaId: 10951,
  fmaUri: 'http://purl.org/sig/ont/fma/fma10951',
  nameEn: 'Inferior vena cava',
  nameLatin: 'vena cava inferior',
  nameAr: 'الوريد الأجوف السفلي',
  abbreviations: ['IVC'],
  level: 3,
  structureType: 'vein',
  parentId: 'thorax_cardiovascular',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  layer: 'vein',
  highlightColor: '#3182ce',
  sortOrder: 5,
  meshIds: ['ivc_thoracic'],
});

export const PERICARDIUM: AnatomyNode = node({
  id: 'FMA:9869',
  fmaId: 9869,
  fmaUri: 'http://purl.org/sig/ont/fma/fma9869',
  ta2Id: 3341,
  nameEn: 'Pericardium',
  nameLatin: 'pericardium',
  nameAr: 'التامور',
  nameFma: 'Pericardium',
  level: 3,
  structureType: 'organ',
  parentId: 'thorax_cardiovascular',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  sortOrder: 6,
  meshIds: ['pericardium'],
});

// ── Level 4: Heart subdivisions ───────────────────────────────

export const RIGHT_ATRIUM: AnatomyNode = node({
  id: 'FMA:7096',
  fmaId: 7096,
  fmaUri: 'http://purl.org/sig/ont/fma/fma7096',
  nameEn: 'Right atrium',
  nameLatin: 'atrium dextrum',
  nameAr: 'الأذين الأيمن',
  nameFma: 'Right atrium',
  level: 4,
  structureType: 'organ',
  parentId: 'FMA:7088',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  layer: 'organ',
  highlightColor: '#3182ce',
  sortOrder: 1,
  meshIds: ['right_atrium'],
});

export const LEFT_ATRIUM: AnatomyNode = node({
  id: 'FMA:7097',
  fmaId: 7097,
  fmaUri: 'http://purl.org/sig/ont/fma/fma7097',
  nameEn: 'Left atrium',
  nameLatin: 'atrium sinistrum',
  nameAr: 'الأذين الأيسر',
  nameFma: 'Left atrium',
  level: 4,
  structureType: 'organ',
  parentId: 'FMA:7088',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  layer: 'organ',
  highlightColor: '#e53e3e',
  sortOrder: 2,
  meshIds: ['left_atrium'],
});

export const RIGHT_VENTRICLE: AnatomyNode = node({
  id: 'FMA:7098',
  fmaId: 7098,
  fmaUri: 'http://purl.org/sig/ont/fma/fma7098',
  nameEn: 'Right ventricle',
  nameLatin: 'ventriculus dexter',
  nameAr: 'البطين الأيمن',
  nameFma: 'Right ventricle',
  level: 4,
  structureType: 'organ',
  parentId: 'FMA:7088',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  layer: 'organ',
  highlightColor: '#3182ce',
  sortOrder: 3,
  meshIds: ['right_ventricle'],
});

export const LEFT_VENTRICLE: AnatomyNode = node({
  id: 'FMA:7101',
  fmaId: 7101,
  fmaUri: 'http://purl.org/sig/ont/fma/fma7101',
  nameEn: 'Left ventricle',
  nameLatin: 'ventriculus sinister',
  nameAr: 'البطين الأيسر',
  nameFma: 'Left ventricle',
  level: 4,
  structureType: 'organ',
  parentId: 'FMA:7088',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  layer: 'organ',
  highlightColor: '#e53e3e',
  sortOrder: 4,
  meshIds: ['left_ventricle'],
});

export const CARDIAC_CONDUCTION_SYSTEM: AnatomyNode = node({
  id: 'FMA:9476',
  fmaId: 9476,
  fmaUri: 'http://purl.org/sig/ont/fma/fma9476',
  nameEn: 'Cardiac conduction system',
  nameLatin: 'systema conducens cordis',
  nameAr: 'جهاز التوصيل القلبي',
  nameFma: 'Conducting system of heart',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:7088',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  highlightColor: '#d69e2e',
  sortOrder: 5,
  meshIds: ['conduction_system'],
});

export const CORONARY_ARTERIES_GROUP: AnatomyNode = node({
  id: 'heart_coronary_arteries',
  nameEn: 'Coronary arteries',
  nameAr: 'الشرايين الإكليلية',
  level: 4,
  structureType: 'artery',
  parentId: 'FMA:7088',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  layer: 'artery',
  highlightColor: '#e53e3e',
  sortOrder: 6,
  meshIds: ['coronary_arteries'],
});

export const CARDIAC_VEINS_GROUP: AnatomyNode = node({
  id: 'heart_cardiac_veins',
  nameEn: 'Cardiac veins',
  nameAr: 'الأوردة القلبية',
  level: 4,
  structureType: 'vein',
  parentId: 'FMA:7088',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  layer: 'vein',
  highlightColor: '#3182ce',
  sortOrder: 7,
  meshIds: ['cardiac_veins'],
});

export const HEART_WALL_LAYERS: AnatomyNode = node({
  id: 'heart_wall_layers',
  nameEn: 'Heart wall layers',
  nameAr: 'طبقات جدار القلب',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:7088',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  sortOrder: 8,
});

export const HEART_EXTERNAL: AnatomyNode = node({
  id: 'heart_external',
  nameEn: 'External features',
  nameAr: 'المعالم الخارجية',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:7088',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  sortOrder: 9,
});

// ── Level 5: Right Atrium structures ─────────────────────────

export const CRISTA_TERMINALIS: AnatomyNode = node({
  id: 'FMA:7232',
  fmaId: 7232,
  fmaUri: 'http://purl.org/sig/ont/fma/fma7232',
  nameEn: 'Crista terminalis',
  nameLatin: 'crista terminalis',
  nameAr: 'العرف الطرفي',
  nameFma: 'Crista terminalis',
  synonyms: ['Terminal crest'],
  level: 5,
  structureType: 'other',
  parentId: 'FMA:7096',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  sortOrder: 1,
  meshIds: ['crista_terminalis'],
});

export const PECTINATE_MUSCLES_RA: AnatomyNode = node({
  id: 'FMA:7231',
  fmaId: 7231,
  nameEn: 'Pectinate muscles',
  nameLatin: 'musculi pectinati',
  nameAr: 'العضلات المشطية',
  nameFma: 'Pectinate muscles',
  level: 5,
  structureType: 'muscle',
  parentId: 'FMA:7096',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  sortOrder: 2,
  meshIds: ['pectinate_muscles_ra'],
});

export const FOSSA_OVALIS: AnatomyNode = node({
  id: 'FMA:9246',
  fmaId: 9246,
  fmaUri: 'http://purl.org/sig/ont/fma/fma9246',
  ta2Id: 3965,
  nameEn: 'Fossa ovalis',
  nameLatin: 'fossa ovalis cordis',
  nameAr: 'الحفرة البيضاوية',
  nameFma: 'Fossa ovalis',
  level: 5,
  structureType: 'other',
  parentId: 'FMA:7096',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  sortOrder: 3,
  meshIds: ['fossa_ovalis'],
});

export const INTERATRIAL_SEPTUM: AnatomyNode = node({
  id: 'FMA:7108',
  fmaId: 7108,
  fmaUri: 'http://purl.org/sig/ont/fma/fma7108',
  ta2Id: 3964,
  nameEn: 'Interatrial septum',
  nameLatin: 'septum interatriale',
  nameAr: 'الحاجز البيني الأذيني',
  nameFma: 'Interatrial septum',
  level: 5,
  structureType: 'other',
  parentId: 'FMA:7096',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  sortOrder: 4,
  meshIds: ['interatrial_septum'],
});

export const SINUS_VENARUM: AnatomyNode = node({
  id: 'FMA:7104',
  fmaId: 7104,
  nameEn: 'Sinus venarum',
  nameLatin: 'sinus venarum cavarum',
  nameAr: 'جيب الأوردة الأجوفة',
  nameFma: 'Sinus venosus',
  synonyms: ['Sinus venosus of right atrium', 'Smooth part of right atrium'],
  level: 5,
  structureType: 'other',
  parentId: 'FMA:7096',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  sortOrder: 5,
  meshIds: ['sinus_venarum'],
});

export const CORONARY_SINUS_ORIFICE: AnatomyNode = node({
  id: 'FMA:7119',
  fmaId: 7119,
  nameEn: 'Orifice of coronary sinus',
  nameLatin: 'ostium sinus coronarii',
  nameAr: 'فوهة الجيب الإكليلي',
  level: 5,
  structureType: 'other',
  parentId: 'FMA:7096',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  sortOrder: 6,
  meshIds: ['coronary_sinus_orifice'],
});

export const EUSTACHIAN_VALVE: AnatomyNode = node({
  id: 'FMA:7117',
  fmaId: 7117,
  nameEn: 'Valve of inferior vena cava',
  nameLatin: 'valvula venae cavae inferioris',
  nameAr: 'صمام الوريد الأجوف السفلي',
  nameFma: 'Valve of inferior vena cava',
  synonyms: ['Eustachian valve'],
  nameClinical: 'Eustachian valve',
  level: 5,
  structureType: 'other',
  parentId: 'FMA:7096',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  sortOrder: 7,
  meshIds: ['eustachian_valve'],
});

export const RIGHT_AURICLE: AnatomyNode = node({
  id: 'FMA:7218',
  fmaId: 7218,
  nameEn: 'Right auricle',
  nameLatin: 'auricula dextra',
  nameAr: 'الأذيْنة اليمنى',
  nameFma: 'Right auricle',
  synonyms: ['Right atrial appendage'],
  level: 5,
  structureType: 'other',
  parentId: 'FMA:7096',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  sortOrder: 8,
  meshIds: ['right_auricle'],
});

// ── Level 5: Left Atrium structures ──────────────────────────

export const LEFT_AURICLE: AnatomyNode = node({
  id: 'FMA:7219',
  fmaId: 7219,
  nameEn: 'Left auricle',
  nameLatin: 'auricula sinistra',
  nameAr: 'الأذيْنة اليسرى',
  nameFma: 'Left auricle',
  synonyms: ['Left atrial appendage', 'LAA'],
  abbreviations: ['LAA'],
  level: 5,
  structureType: 'other',
  parentId: 'FMA:7097',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  sortOrder: 1,
  meshIds: ['left_auricle'],
});

export const PULMONARY_VEIN_ORIFICES: AnatomyNode = node({
  id: 'heart_pv_orifices',
  nameEn: 'Pulmonary vein orifices',
  nameLatin: 'ostia venarum pulmonalium',
  nameAr: 'فوهات الأوردة الرئوية',
  level: 5,
  structureType: 'other',
  parentId: 'FMA:7097',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  sortOrder: 2,
  meshIds: ['pv_orifices'],
});

export const MITRAL_VALVE_ORIFICE: AnatomyNode = node({
  id: 'FMA:9557',
  fmaId: 9557,
  nameEn: 'Mitral valve orifice',
  nameLatin: 'ostium atrioventriculare sinistrum',
  nameAr: 'فوهة الصمام التاجي',
  level: 5,
  structureType: 'other',
  parentId: 'FMA:7097',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  sortOrder: 3,
  meshIds: ['mitral_orifice'],
});

// ── Level 5: Right Ventricle structures ──────────────────────

export const TRICUSPID_VALVE: AnatomyNode = node({
  id: 'FMA:7234',
  fmaId: 7234,
  fmaUri: 'http://purl.org/sig/ont/fma/fma7234',
  ta2Id: 3982,
  nameEn: 'Tricuspid valve',
  nameLatin: 'valva tricuspidalis',
  nameAr: 'الصمام ثلاثي الشُّرَف',
  nameFma: 'Tricuspid valve',
  synonyms: ['Right atrioventricular valve'],
  level: 5,
  structureType: 'other',
  parentId: 'FMA:7098',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  highlightColor: '#805ad5',
  sortOrder: 1,
  meshIds: ['tricuspid_valve'],
});

export const PULMONARY_VALVE: AnatomyNode = node({
  id: 'FMA:7246',
  fmaId: 7246,
  fmaUri: 'http://purl.org/sig/ont/fma/fma7246',
  nameEn: 'Pulmonary valve',
  nameLatin: 'valva trunci pulmonalis',
  nameAr: 'الصمام الرئوي',
  nameFma: 'Pulmonary valve',
  synonyms: ['Pulmonic valve', 'Right semilunar valve'],
  level: 5,
  structureType: 'other',
  parentId: 'FMA:7098',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  highlightColor: '#805ad5',
  sortOrder: 2,
  meshIds: ['pulmonary_valve'],
});

export const RV_CHORDAE: AnatomyNode = node({
  id: 'FMA:76527_rv',
  fmaId: 76527,
  nameEn: 'Chordae tendineae (right ventricle)',
  nameLatin: 'chordae tendineae cordis',
  nameAr: 'الأوتار الوترية (البطين الأيمن)',
  nameFma: 'Chordae tendineae',
  level: 5,
  structureType: 'tendon',
  parentId: 'FMA:7098',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  sortOrder: 3,
  meshIds: ['chordae_rv'],
});

export const RV_PAPILLARY_MUSCLES: AnatomyNode = node({
  id: 'heart_rv_papillary',
  nameEn: 'Papillary muscles (right ventricle)',
  nameLatin: 'musculi papillares ventriculi dextri',
  nameAr: 'العضلات الحليمية (البطين الأيمن)',
  level: 5,
  structureType: 'muscle',
  parentId: 'FMA:7098',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  highlightColor: '#c05621',
  sortOrder: 4,
  meshIds: ['papillary_muscles_rv'],
});

export const MODERATOR_BAND: AnatomyNode = node({
  id: 'FMA:7272',
  fmaId: 7272,
  fmaUri: 'http://purl.org/sig/ont/fma/fma7272',
  ta2Id: 4050,
  nameEn: 'Moderator band',
  nameLatin: 'trabecula septomarginalis',
  nameAr: 'الحزمة المُشدِّدة',
  nameFma: 'Septomarginal trabecula',
  synonyms: ['Septomarginal trabecula'],
  nameClinical: 'Moderator band',
  level: 5,
  structureType: 'other',
  parentId: 'FMA:7098',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  highlightColor: '#d69e2e',
  sortOrder: 5,
  meshIds: ['moderator_band'],
});

export const INFUNDIBULUM: AnatomyNode = node({
  id: 'FMA:7116',
  fmaId: 7116,
  nameEn: 'Infundibulum',
  nameLatin: 'infundibulum',
  nameAr: 'القمع',
  nameFma: 'Infundibulum of right ventricle',
  synonyms: ['Conus arteriosus', 'Outflow tract of right ventricle'],
  nameClinical: 'Conus arteriosus',
  level: 5,
  structureType: 'other',
  parentId: 'FMA:7098',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  sortOrder: 6,
  meshIds: ['infundibulum'],
});

export const INTERVENTRICULAR_SEPTUM: AnatomyNode = node({
  id: 'FMA:7133',
  fmaId: 7133,
  fmaUri: 'http://purl.org/sig/ont/fma/fma7133',
  ta2Id: 3970,
  nameEn: 'Interventricular septum',
  nameLatin: 'septum interventriculare cordis',
  nameAr: 'الحاجز البيني البطيني',
  nameFma: 'Interventricular septum',
  abbreviations: ['IVS'],
  level: 5,
  structureType: 'other',
  parentId: 'FMA:7098', // also present in LV, but primary entry under RV
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  sortOrder: 7,
  meshIds: ['ivs'],
});

// ── Level 5: Left Ventricle structures ───────────────────────

export const MITRAL_VALVE: AnatomyNode = node({
  id: 'FMA:7235',
  fmaId: 7235,
  fmaUri: 'http://purl.org/sig/ont/fma/fma7235',
  ta2Id: 3987,
  nameEn: 'Mitral valve',
  nameLatin: 'valva mitralis',
  nameAr: 'الصمام التاجي',
  nameFma: 'Mitral valve',
  synonyms: ['Bicuspid valve', 'Left atrioventricular valve'],
  nameClinical: 'Mitral valve',
  level: 5,
  structureType: 'other',
  parentId: 'FMA:7101',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  highlightColor: '#805ad5',
  sortOrder: 1,
  meshIds: ['mitral_valve'],
});

export const AORTIC_VALVE: AnatomyNode = node({
  id: 'FMA:7236',
  fmaId: 7236,
  fmaUri: 'http://purl.org/sig/ont/fma/fma7236',
  ta2Id: 3993,
  nameEn: 'Aortic valve',
  nameLatin: 'valva aortae',
  nameAr: 'الصمام الأبهري',
  nameFma: 'Aortic valve',
  synonyms: ['Left semilunar valve'],
  level: 5,
  structureType: 'other',
  parentId: 'FMA:7101',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  highlightColor: '#805ad5',
  sortOrder: 2,
  meshIds: ['aortic_valve'],
});

export const LV_CHORDAE: AnatomyNode = node({
  id: 'FMA:76527_lv',
  nameEn: 'Chordae tendineae (left ventricle)',
  nameLatin: 'chordae tendineae cordis',
  nameAr: 'الأوتار الوترية (البطين الأيسر)',
  nameFma: 'Chordae tendineae',
  level: 5,
  structureType: 'tendon',
  parentId: 'FMA:7101',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  sortOrder: 3,
  meshIds: ['chordae_lv'],
});

export const ANTEROLATERAL_PAPILLARY: AnatomyNode = node({
  id: 'FMA:7264',
  fmaId: 7264,
  fmaUri: 'http://purl.org/sig/ont/fma/fma7264',
  nameEn: 'Anterolateral papillary muscle',
  nameLatin: 'musculus papillaris anterior ventriculi sinistri',
  nameAr: 'العضلة الحليمية الأمامية الجانبية',
  nameFma: 'Anterior papillary muscle of left ventricle',
  synonyms: ['Anterolateral papillary muscle of left ventricle'],
  nameClinical: 'Anterolateral papillary muscle',
  level: 5,
  structureType: 'muscle',
  parentId: 'FMA:7101',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  highlightColor: '#c05621',
  sortOrder: 4,
  meshIds: ['anterolateral_papillary'],
});

export const POSTEROMEDIAL_PAPILLARY: AnatomyNode = node({
  id: 'FMA:7266',
  fmaId: 7266,
  fmaUri: 'http://purl.org/sig/ont/fma/fma7266',
  nameEn: 'Posteromedial papillary muscle',
  nameLatin: 'musculus papillaris posterior ventriculi sinistri',
  nameAr: 'العضلة الحليمية الخلفية الإنسية',
  nameFma: 'Posterior papillary muscle of left ventricle',
  synonyms: ['Posteromedial papillary muscle of left ventricle'],
  nameClinical: 'Posteromedial papillary muscle',
  level: 5,
  structureType: 'muscle',
  parentId: 'FMA:7101',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  highlightColor: '#c05621',
  sortOrder: 5,
  meshIds: ['posteromedial_papillary'],
});

export const AORTIC_VESTIBULE: AnatomyNode = node({
  id: 'FMA:7124',
  fmaId: 7124,
  nameEn: 'Aortic vestibule',
  nameLatin: 'vestibulum aortae',
  nameAr: 'دهليز الأبهر',
  nameFma: 'Aortic vestibule',
  synonyms: ['Left ventricular outflow tract', 'LVOT'],
  abbreviations: ['LVOT'],
  level: 5,
  structureType: 'other',
  parentId: 'FMA:7101',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  sortOrder: 6,
  meshIds: ['aortic_vestibule'],
});

// ── Level 5: Conduction system ────────────────────────────────

export const SA_NODE: AnatomyNode = node({
  id: 'FMA:9477',
  fmaId: 9477,
  fmaUri: 'http://purl.org/sig/ont/fma/fma9477',
  nameEn: 'Sinuatrial node',
  nameLatin: 'nodus sinuatrialis',
  nameAr: 'العقدة الجيبية الأذينية',
  nameFma: 'Sinuatrial node',
  synonyms: ['Sinoatrial node', 'SA node', 'Keith-Flack node', 'Pacemaker of heart'],
  abbreviations: ['SA node'],
  nameClinical: 'SA node',
  level: 5,
  structureType: 'other',
  parentId: 'FMA:9476',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  highlightColor: '#d69e2e',
  sortOrder: 1,
  meshIds: ['sa_node'],
});

export const AV_NODE: AnatomyNode = node({
  id: 'FMA:9478',
  fmaId: 9478,
  fmaUri: 'http://purl.org/sig/ont/fma/fma9478',
  ta2Id: 3954,
  nameEn: 'Atrioventricular node',
  nameLatin: 'nodus atrioventricularis',
  nameAr: 'العقدة الأذينية البطينية',
  nameFma: 'Atrioventricular node',
  synonyms: ['AV node', 'Aschoff-Tawara node'],
  abbreviations: ['AV node'],
  nameClinical: 'AV node',
  level: 5,
  structureType: 'other',
  parentId: 'FMA:9476',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  highlightColor: '#d69e2e',
  sortOrder: 2,
  meshIds: ['av_node'],
});

export const BUNDLE_OF_HIS: AnatomyNode = node({
  id: 'FMA:9484',
  fmaId: 9484,
  fmaUri: 'http://purl.org/sig/ont/fma/fma9484',
  nameEn: 'Atrioventricular bundle',
  nameLatin: 'fasciculus atrioventricularis',
  nameAr: 'حزمة هيس',
  nameFma: 'Atrioventricular bundle',
  synonyms: ['Bundle of His'],
  nameClinical: 'Bundle of His',
  level: 5,
  structureType: 'other',
  parentId: 'FMA:9476',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  highlightColor: '#d69e2e',
  sortOrder: 3,
  meshIds: ['bundle_of_his'],
});

export const RIGHT_BUNDLE_BRANCH: AnatomyNode = node({
  id: 'FMA:9486',
  fmaId: 9486,
  fmaUri: 'http://purl.org/sig/ont/fma/fma9486',
  nameEn: 'Right bundle branch',
  nameLatin: 'crus dextrum fasciculi atrioventricularis',
  nameAr: 'الفرع الأيمن لحزمة هيس',
  nameFma: 'Right branch of atrioventricular bundle',
  synonyms: ['Right bundle branch', 'RBB'],
  abbreviations: ['RBB'],
  nameClinical: 'Right bundle branch',
  level: 5,
  structureType: 'other',
  parentId: 'FMA:9476',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  highlightColor: '#d69e2e',
  sortOrder: 4,
  meshIds: ['right_bundle_branch'],
});

export const LEFT_BUNDLE_BRANCH: AnatomyNode = node({
  id: 'FMA:9487',
  fmaId: 9487,
  fmaUri: 'http://purl.org/sig/ont/fma/fma9487',
  nameEn: 'Left bundle branch',
  nameLatin: 'crus sinistrum fasciculi atrioventricularis',
  nameAr: 'الفرع الأيسر لحزمة هيس',
  nameFma: 'Left branch of atrioventricular bundle',
  synonyms: ['Left bundle branch', 'LBB'],
  abbreviations: ['LBB'],
  nameClinical: 'Left bundle branch',
  level: 5,
  structureType: 'other',
  parentId: 'FMA:9476',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  highlightColor: '#d69e2e',
  sortOrder: 5,
  meshIds: ['left_bundle_branch'],
});

export const PURKINJE_FIBRES: AnatomyNode = node({
  id: 'FMA:9492',
  fmaId: 9492,
  fmaUri: 'http://purl.org/sig/ont/fma/fma9492',
  ta2Id: 3961,
  nameEn: 'Purkinje fibres',
  nameLatin: 'fibrae conducentes subendocardiales',
  nameAr: 'ألياف بركنجي',
  nameFma: 'Purkinje fiber',
  synonyms: ['Purkinje fibres', 'Purkinje fibers', 'Subendocardial conduction fibres'],
  nameClinical: 'Purkinje fibres',
  level: 5,
  structureType: 'other',
  parentId: 'FMA:9476',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  highlightColor: '#d69e2e',
  sortOrder: 6,
  meshIds: ['purkinje_fibres'],
});

// ── Level 5: Coronary arteries ────────────────────────────────

export const LEFT_CORONARY_ARTERY: AnatomyNode = node({
  id: 'FMA:50040',
  fmaId: 50040,
  fmaUri: 'http://purl.org/sig/ont/fma/fma50040',
  ta2Id: 4142,
  nameEn: 'Left coronary artery',
  nameLatin: 'arteria coronaria sinistra',
  nameAr: 'الشريان الإكليلي الأيسر',
  nameFma: 'Left coronary artery',
  abbreviations: ['LCA'],
  level: 5,
  structureType: 'artery',
  parentId: 'heart_coronary_arteries',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  layer: 'artery',
  highlightColor: '#e53e3e',
  sortOrder: 1,
  meshIds: ['left_coronary_artery'],
});

export const RIGHT_CORONARY_ARTERY: AnatomyNode = node({
  id: 'FMA:50039',
  fmaId: 50039,
  fmaUri: 'http://purl.org/sig/ont/fma/fma50039',
  ta2Id: 4131,
  nameEn: 'Right coronary artery',
  nameLatin: 'arteria coronaria dextra',
  nameAr: 'الشريان الإكليلي الأيمن',
  nameFma: 'Right coronary artery',
  abbreviations: ['RCA'],
  level: 5,
  structureType: 'artery',
  parentId: 'heart_coronary_arteries',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  layer: 'artery',
  highlightColor: '#e53e3e',
  sortOrder: 2,
  meshIds: ['right_coronary_artery'],
});

// ── Level 5: Cardiac veins ────────────────────────────────────

export const CORONARY_SINUS: AnatomyNode = node({
  id: 'FMA:4706',
  fmaId: 4706,
  fmaUri: 'http://purl.org/sig/ont/fma/fma4706',
  ta2Id: 4158,
  nameEn: 'Coronary sinus',
  nameLatin: 'sinus coronarius',
  nameAr: 'الجيب الإكليلي',
  nameFma: 'Coronary sinus',
  level: 5,
  structureType: 'vein',
  parentId: 'heart_cardiac_veins',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  layer: 'vein',
  highlightColor: '#3182ce',
  sortOrder: 1,
  meshIds: ['coronary_sinus'],
});

export const GREAT_CARDIAC_VEIN: AnatomyNode = node({
  id: 'FMA:4707',
  fmaId: 4707,
  fmaUri: 'http://purl.org/sig/ont/fma/fma4707',
  ta2Id: 4159,
  nameEn: 'Great cardiac vein',
  nameLatin: 'vena cordis magna',
  nameAr: 'الوريد القلبي الكبير',
  nameFma: 'Great cardiac vein',
  level: 5,
  structureType: 'vein',
  parentId: 'heart_cardiac_veins',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  layer: 'vein',
  highlightColor: '#3182ce',
  sortOrder: 2,
  meshIds: ['great_cardiac_vein'],
});

export const MIDDLE_CARDIAC_VEIN: AnatomyNode = node({
  id: 'FMA:4713',
  fmaId: 4713,
  fmaUri: 'http://purl.org/sig/ont/fma/fma4713',
  ta2Id: 4165,
  nameEn: 'Middle cardiac vein',
  nameLatin: 'vena cordis media',
  nameAr: 'الوريد القلبي الأوسط',
  nameFma: 'Middle cardiac vein',
  level: 5,
  structureType: 'vein',
  parentId: 'heart_cardiac_veins',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  layer: 'vein',
  highlightColor: '#3182ce',
  sortOrder: 3,
  meshIds: ['middle_cardiac_vein'],
});

export const SMALL_CARDIAC_VEIN: AnatomyNode = node({
  id: 'FMA:4710',
  fmaId: 4710,
  nameEn: 'Small cardiac vein',
  nameLatin: 'vena cordis parva',
  nameAr: 'الوريد القلبي الصغير',
  nameFma: 'Small cardiac vein',
  level: 5,
  structureType: 'vein',
  parentId: 'heart_cardiac_veins',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  layer: 'vein',
  highlightColor: '#3182ce',
  sortOrder: 4,
  meshIds: ['small_cardiac_vein'],
  modelPending: true,
});

// ── Level 5: Pericardium layers ───────────────────────────────

export const FIBROUS_PERICARDIUM: AnatomyNode = node({
  id: 'FMA:9586',
  fmaId: 9586,
  nameEn: 'Fibrous pericardium',
  nameLatin: 'pericardium fibrosum',
  nameAr: 'التامور الليفي',
  nameFma: 'Fibrous pericardium',
  level: 5,
  structureType: 'other',
  parentId: 'FMA:9869',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  layer: 'organ',
  sortOrder: 1,
  meshIds: ['fibrous_pericardium'],
});

export const SEROUS_PERICARDIUM: AnatomyNode = node({
  id: 'FMA:9582',
  fmaId: 9582,
  nameEn: 'Serous pericardium',
  nameLatin: 'pericardium serosum',
  nameAr: 'التامور المصلي',
  nameFma: 'Serous pericardium',
  level: 5,
  structureType: 'other',
  parentId: 'FMA:9869',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  sortOrder: 2,
});

// ── Level 5: Heart wall layers ────────────────────────────────

export const EPICARDIUM: AnatomyNode = node({
  id: 'FMA:9566',
  fmaId: 9566,
  nameEn: 'Epicardium',
  nameLatin: 'epicardium',
  nameAr: 'الشغاف القلبي / النخاب',
  nameFma: 'Epicardium',
  synonyms: ['Visceral pericardium'],
  level: 5,
  structureType: 'other',
  parentId: 'heart_wall_layers',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  layer: 'organ',
  sortOrder: 1,
  meshIds: ['epicardium'],
});

export const MYOCARDIUM: AnatomyNode = node({
  id: 'FMA:9551',
  fmaId: 9551,
  nameEn: 'Myocardium',
  nameLatin: 'myocardium',
  nameAr: 'عضلة القلب',
  nameFma: 'Myocardium',
  level: 5,
  structureType: 'muscle',
  parentId: 'heart_wall_layers',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  layer: 'muscle_deep',
  highlightColor: '#c05621',
  sortOrder: 2,
  meshIds: ['myocardium'],
});

export const ENDOCARDIUM: AnatomyNode = node({
  id: 'FMA:9558',
  fmaId: 9558,
  nameEn: 'Endocardium',
  nameLatin: 'endocardium',
  nameAr: 'بطانة القلب / الشغاف',
  nameFma: 'Endocardium',
  level: 5,
  structureType: 'other',
  parentId: 'heart_wall_layers',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  sortOrder: 3,
  meshIds: ['endocardium'],
  modelPending: true,
});

// ── Level 6: Valve cusps — Mitral ────────────────────────────

export const MITRAL_ANTERIOR_LEAFLET: AnatomyNode = node({
  id: 'FMA:7242',
  fmaId: 7242,
  nameEn: 'Anterior leaflet of mitral valve',
  nameLatin: 'cuspis anterior valvae mitralis',
  nameAr: 'الشرفة الأمامية للصمام التاجي',
  nameFma: 'Anterior cusp of mitral valve',
  synonyms: ['Aortic leaflet of mitral valve', 'Septal leaflet of mitral valve'],
  nameClinical: 'Anterior (aortic) leaflet',
  level: 6,
  structureType: 'other',
  parentId: 'FMA:7235',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  sortOrder: 1,
  meshIds: ['mitral_anterior_leaflet'],
});

export const MITRAL_POSTERIOR_LEAFLET: AnatomyNode = node({
  id: 'FMA:7243',
  fmaId: 7243,
  nameEn: 'Posterior leaflet of mitral valve',
  nameLatin: 'cuspis posterior valvae mitralis',
  nameAr: 'الشرفة الخلفية للصمام التاجي',
  nameFma: 'Posterior cusp of mitral valve',
  synonyms: ['Mural leaflet of mitral valve'],
  level: 6,
  structureType: 'other',
  parentId: 'FMA:7235',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  sortOrder: 2,
  meshIds: ['mitral_posterior_leaflet'],
});

// ── Level 6: Valve cusps — Aortic ────────────────────────────

export const AORTIC_RIGHT_CORONARY_CUSP: AnatomyNode = node({
  id: 'FMA:7253',
  fmaId: 7253,
  nameEn: 'Right coronary cusp of aortic valve',
  nameLatin: 'cuspis dextra valvae aortae',
  nameAr: 'الشرفة الإكليلية اليمنى للصمام الأبهري',
  nameFma: 'Anterior cusp of aortic valve',
  synonyms: ['Right coronary cusp'],
  nameClinical: 'Right coronary cusp',
  level: 6,
  structureType: 'other',
  parentId: 'FMA:7236',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  sortOrder: 1,
  meshIds: ['aortic_right_cusp'],
});

export const AORTIC_LEFT_CORONARY_CUSP: AnatomyNode = node({
  id: 'FMA:7254',
  fmaId: 7254,
  nameEn: 'Left coronary cusp of aortic valve',
  nameLatin: 'cuspis sinistra valvae aortae',
  nameAr: 'الشرفة الإكليلية اليسرى للصمام الأبهري',
  nameFma: 'Left posterior cusp of aortic valve',
  synonyms: ['Left coronary cusp'],
  nameClinical: 'Left coronary cusp',
  level: 6,
  structureType: 'other',
  parentId: 'FMA:7236',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  sortOrder: 2,
  meshIds: ['aortic_left_cusp'],
});

export const AORTIC_NONCORONARY_CUSP: AnatomyNode = node({
  id: 'FMA:7252',
  fmaId: 7252,
  nameEn: 'Non-coronary cusp of aortic valve',
  nameLatin: 'cuspis posterior valvae aortae',
  nameAr: 'الشرفة غير الإكليلية للصمام الأبهري',
  nameFma: 'Right posterior cusp of aortic valve',
  synonyms: ['Non-coronary cusp', 'Posterior cusp', 'Non-coronary sinus'],
  nameClinical: 'Non-coronary cusp',
  level: 6,
  structureType: 'other',
  parentId: 'FMA:7236',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  sortOrder: 3,
  meshIds: ['aortic_noncoronary_cusp'],
});

// ── Level 6: Coronary artery branches ────────────────────────

export const LAD: AnatomyNode = node({
  id: 'FMA:3862',
  fmaId: 3862,
  fmaUri: 'http://purl.org/sig/ont/fma/fma3862',
  ta2Id: 4143,
  nameEn: 'Anterior interventricular branch',
  nameLatin: 'ramus interventricularis anterior arteriae coronariae sinistrae',
  nameAr: 'الفرع البيني البطيني الأمامي',
  nameFma: 'Anterior interventricular branch of left coronary artery',
  synonyms: ['Left anterior descending artery', 'LAD'],
  abbreviations: ['LAD'],
  nameClinical: 'LAD (Left anterior descending artery)',
  level: 6,
  structureType: 'artery',
  parentId: 'FMA:50040',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  layer: 'artery',
  highlightColor: '#e53e3e',
  sortOrder: 1,
  meshIds: ['lad'],
});

export const LEFT_CIRCUMFLEX: AnatomyNode = node({
  id: 'FMA:3895',
  fmaId: 3895,
  fmaUri: 'http://purl.org/sig/ont/fma/fma3895',
  nameEn: 'Circumflex branch of left coronary artery',
  nameLatin: 'ramus circumflexus arteriae coronariae sinistrae',
  nameAr: 'الفرع الملتفّ للشريان الإكليلي الأيسر',
  nameFma: 'Circumflex branch of left coronary artery',
  synonyms: ['Left circumflex artery', 'LCx'],
  abbreviations: ['LCx'],
  nameClinical: 'Left circumflex (LCx)',
  level: 6,
  structureType: 'artery',
  parentId: 'FMA:50040',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  layer: 'artery',
  highlightColor: '#e53e3e',
  sortOrder: 2,
  meshIds: ['left_circumflex'],
});

export const RCA_POSTERIOR_DESCENDING: AnatomyNode = node({
  id: 'FMA:49652',
  fmaId: 49652,
  nameEn: 'Posterior interventricular branch',
  nameLatin: 'ramus interventricularis posterior arteriae coronariae dextrae',
  nameAr: 'الفرع البيني البطيني الخلفي',
  nameFma: 'Posterior interventricular branch of right coronary artery',
  synonyms: ['Posterior descending artery', 'PDA'],
  abbreviations: ['PDA'],
  nameClinical: 'Posterior descending artery (PDA)',
  level: 6,
  structureType: 'artery',
  parentId: 'FMA:50039',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  layer: 'artery',
  highlightColor: '#e53e3e',
  sortOrder: 1,
  meshIds: ['posterior_descending'],
});

export const RCA_RIGHT_MARGINAL: AnatomyNode = node({
  id: 'FMA:3835',
  fmaId: 3835,
  nameEn: 'Right marginal branch of right coronary artery',
  nameLatin: 'ramus marginalis dexter arteriae coronariae dextrae',
  nameAr: 'الفرع الهامشي الأيمن',
  nameFma: 'Right marginal branch of right coronary artery',
  synonyms: ['Acute marginal artery'],
  level: 6,
  structureType: 'artery',
  parentId: 'FMA:50039',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  layer: 'artery',
  highlightColor: '#e53e3e',
  sortOrder: 2,
  meshIds: ['right_marginal'],
});

// ── Level 6: Bundle branch fascicles ─────────────────────────

export const LEFT_ANTERIOR_FASCICLE: AnatomyNode = node({
  id: 'FMA:9490',
  fmaId: 9490,
  nameEn: 'Left anterior fascicle',
  nameLatin: 'fasciculus anterior cruris sinistri',
  nameAr: 'الحزيمة الأمامية اليسرى',
  nameFma: 'Anterior fascicle of left branch of atrioventricular bundle',
  synonyms: ['Left anterior fascicular branch', 'Anterior division of left bundle branch'],
  level: 6,
  structureType: 'other',
  parentId: 'FMA:9487',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  highlightColor: '#d69e2e',
  sortOrder: 1,
  meshIds: ['left_anterior_fascicle'],
});

export const LEFT_POSTERIOR_FASCICLE: AnatomyNode = node({
  id: 'FMA:9491',
  fmaId: 9491,
  nameEn: 'Left posterior fascicle',
  nameLatin: 'fasciculus posterior cruris sinistri',
  nameAr: 'الحزيمة الخلفية اليسرى',
  nameFma: 'Posterior fascicle of left branch of atrioventricular bundle',
  synonyms: ['Left posterior fascicular branch', 'Posterior division of left bundle branch'],
  level: 6,
  structureType: 'other',
  parentId: 'FMA:9487',
  regionTags: ['thorax'],
  systemTags: ['cardiovascular'],
  highlightColor: '#d69e2e',
  sortOrder: 2,
  meshIds: ['left_posterior_fascicle'],
});

// ── Level 5: Respiratory system ───────────────────────────────

export const RIGHT_LUNG: AnatomyNode = node({
  id: 'FMA:7310',
  fmaId: 7310,
  fmaUri: 'http://purl.org/sig/ont/fma/fma7310',
  nameEn: 'Right lung',
  nameLatin: 'pulmo dexter',
  nameAr: 'الرئة اليمنى',
  nameFma: 'Right lung',
  level: 3,
  structureType: 'organ',
  parentId: 'thorax_respiratory',
  regionTags: ['thorax'],
  systemTags: ['respiratory'],
  layer: 'organ',
  highlightColor: '#e8b4b8',
  sortOrder: 1,
  meshIds: ['right_lung'],
});

export const LEFT_LUNG: AnatomyNode = node({
  id: 'FMA:7311',
  fmaId: 7311,
  fmaUri: 'http://purl.org/sig/ont/fma/fma7311',
  nameEn: 'Left lung',
  nameLatin: 'pulmo sinister',
  nameAr: 'الرئة اليسرى',
  nameFma: 'Left lung',
  level: 3,
  structureType: 'organ',
  parentId: 'thorax_respiratory',
  regionTags: ['thorax'],
  systemTags: ['respiratory'],
  layer: 'organ',
  highlightColor: '#e8b4b8',
  sortOrder: 2,
  meshIds: ['left_lung'],
});

export const TRACHEA_THORACIC: AnatomyNode = node({
  id: 'FMA:7394',
  fmaId: 7394,
  nameEn: 'Trachea',
  nameLatin: 'trachea',
  nameAr: 'القصبة الهوائية',
  nameFma: 'Trachea',
  level: 3,
  structureType: 'organ',
  parentId: 'thorax_respiratory',
  regionTags: ['thorax'],
  systemTags: ['respiratory'],
  layer: 'organ',
  sortOrder: 3,
  meshIds: ['trachea'],
});

export const DIAPHRAGM: AnatomyNode = node({
  id: 'FMA:13295',
  fmaId: 13295,
  fmaUri: 'http://purl.org/sig/ont/fma/fma13295',
  nameEn: 'Diaphragm',
  nameLatin: 'diaphragma',
  nameAr: 'الحجاب الحاجز',
  nameFma: 'Diaphragm',
  level: 3,
  structureType: 'muscle',
  parentId: 'thorax_muscular',
  regionTags: ['thorax'],
  systemTags: ['muscular', 'respiratory'],
  layer: 'muscle_deep',
  highlightColor: '#c05621',
  sortOrder: 1,
  meshIds: ['diaphragm'],
});

// ── Collect all nodes ─────────────────────────────────────────

export const ALL_THORAX_NODES: AnatomyNode[] = [
  // L1
  THORAX,
  // L2 — Systems
  THORAX_CARDIOVASCULAR, THORAX_RESPIRATORY, THORAX_SKELETAL,
  THORAX_MUSCULAR, THORAX_NERVOUS, THORAX_DIGESTIVE,
  // L3 — Cardiovascular
  HEART, ASCENDING_AORTA, PULMONARY_TRUNK, SVC, IVC_THORACIC, PERICARDIUM,
  // L3 — Respiratory
  RIGHT_LUNG, LEFT_LUNG, TRACHEA_THORACIC,
  // L3 — Muscular
  DIAPHRAGM,
  // L4 — Heart
  RIGHT_ATRIUM, LEFT_ATRIUM, RIGHT_VENTRICLE, LEFT_VENTRICLE,
  CARDIAC_CONDUCTION_SYSTEM, CORONARY_ARTERIES_GROUP,
  CARDIAC_VEINS_GROUP, HEART_WALL_LAYERS, HEART_EXTERNAL,
  // L5 — Right Atrium
  CRISTA_TERMINALIS, PECTINATE_MUSCLES_RA, FOSSA_OVALIS,
  INTERATRIAL_SEPTUM, SINUS_VENARUM, CORONARY_SINUS_ORIFICE,
  EUSTACHIAN_VALVE, RIGHT_AURICLE,
  // L5 — Left Atrium
  LEFT_AURICLE, PULMONARY_VEIN_ORIFICES, MITRAL_VALVE_ORIFICE,
  // L5 — Right Ventricle
  TRICUSPID_VALVE, PULMONARY_VALVE, RV_CHORDAE, RV_PAPILLARY_MUSCLES,
  MODERATOR_BAND, INFUNDIBULUM, INTERVENTRICULAR_SEPTUM,
  // L5 — Left Ventricle
  MITRAL_VALVE, AORTIC_VALVE, LV_CHORDAE, ANTEROLATERAL_PAPILLARY,
  POSTEROMEDIAL_PAPILLARY, AORTIC_VESTIBULE,
  // L5 — Conduction
  SA_NODE, AV_NODE, BUNDLE_OF_HIS, RIGHT_BUNDLE_BRANCH,
  LEFT_BUNDLE_BRANCH, PURKINJE_FIBRES,
  // L5 — Coronary arteries
  LEFT_CORONARY_ARTERY, RIGHT_CORONARY_ARTERY,
  // L5 — Cardiac veins
  CORONARY_SINUS, GREAT_CARDIAC_VEIN, MIDDLE_CARDIAC_VEIN, SMALL_CARDIAC_VEIN,
  // L5 — Pericardium
  FIBROUS_PERICARDIUM, SEROUS_PERICARDIUM,
  // L5 — Wall layers
  EPICARDIUM, MYOCARDIUM, ENDOCARDIUM,
  // L6 — Mitral valve
  MITRAL_ANTERIOR_LEAFLET, MITRAL_POSTERIOR_LEAFLET,
  // L6 — Aortic valve
  AORTIC_RIGHT_CORONARY_CUSP, AORTIC_LEFT_CORONARY_CUSP, AORTIC_NONCORONARY_CUSP,
  // L6 — Coronary branches
  LAD, LEFT_CIRCUMFLEX, RCA_POSTERIOR_DESCENDING, RCA_RIGHT_MARGINAL,
  // L6 — Bundle fascicles
  LEFT_ANTERIOR_FASCICLE, LEFT_POSTERIOR_FASCICLE,
];

// Build parent → children map
export function buildChildrenMap(nodes: AnatomyNode[]): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  for (const n of nodes) {
    if (n.parentId) {
      if (!map[n.parentId]) map[n.parentId] = [];
      map[n.parentId].push(n.id);
    }
  }
  return map;
}

export const THORAX_CHILDREN_MAP = buildChildrenMap(ALL_THORAX_NODES);
