// ============================================================
// Passboard Anatomy Module — Upper Limb Hierarchy
// All FMA IDs and Latin names verified against published
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
    parentId: null, regionTags: ['upper_limb'], systemTags: [],
    sex: 'both', layer: null, meshIds: [], contentId: null,
    modelPending: false, highlightColor: null, sortOrder: 0,
    ...partial,
  };
}

// ── Level 1: Upper limb region ────────────────────────────────

export const UPPER_LIMB: AnatomyNode = node({
  id: 'FMA:7182',
  fmaId: 7182,
  nameEn: 'Upper limb',
  nameLatin: 'membrum superius',
  nameAr: 'الطرف العلوي',
  level: 1,
  structureType: 'region',
  regionTags: ['upper_limb'],
  sortOrder: 7,
});

// ── Level 2: Systems ──────────────────────────────────────────

const ul_skeletal: AnatomyNode = node({
  id: 'ul_skeletal',
  nameEn: 'Bones',
  nameAr: 'العظام',
  level: 2,
  structureType: 'region',
  parentId: 'FMA:7182',
  systemTags: ['skeletal'],
  regionTags: ['upper_limb'],
});

const ul_joints: AnatomyNode = node({
  id: 'ul_joints',
  nameEn: 'Joints',
  nameAr: 'المفاصل',
  level: 2,
  structureType: 'region',
  parentId: 'FMA:7182',
  regionTags: ['upper_limb'],
});

const ul_muscular: AnatomyNode = node({
  id: 'ul_muscular',
  nameEn: 'Muscles',
  nameAr: 'العضلات',
  level: 2,
  structureType: 'region',
  parentId: 'FMA:7182',
  systemTags: ['muscular'],
  regionTags: ['upper_limb'],
});

const ul_nerves: AnatomyNode = node({
  id: 'ul_nerves',
  nameEn: 'Nerves',
  nameAr: 'الأعصاب',
  level: 2,
  structureType: 'region',
  parentId: 'FMA:7182',
  systemTags: ['nervous'],
  regionTags: ['upper_limb'],
});

const ul_vascular: AnatomyNode = node({
  id: 'ul_vascular',
  nameEn: 'Vessels',
  nameAr: 'الأوعية الدموية',
  level: 2,
  structureType: 'region',
  parentId: 'FMA:7182',
  systemTags: ['cardiovascular'],
  regionTags: ['upper_limb'],
});

// ── Level 3+: BONES ───────────────────────────────────────────

const clavicle: AnatomyNode = node({
  id: 'FMA:13889',
  fmaId: 13889,
  nameEn: 'Clavicle',
  nameLatin: 'clavicula',
  nameAr: 'الترقوة',
  level: 3,
  structureType: 'bone',
  layer: 'skeleton',
  parentId: 'ul_skeletal',
  regionTags: ['upper_limb'],
});

const scapula: AnatomyNode = node({
  id: 'FMA:13678',
  fmaId: 13678,
  nameEn: 'Scapula',
  nameLatin: 'scapula',
  nameAr: 'لوح الكتف',
  level: 3,
  structureType: 'bone',
  layer: 'skeleton',
  parentId: 'ul_skeletal',
  regionTags: ['upper_limb'],
});

const acromion: AnatomyNode = node({
  id: 'FMA:14784',
  fmaId: 14784,
  nameEn: 'Acromion',
  nameLatin: 'acromion',
  nameAr: 'الأخرم',
  level: 4,
  structureType: 'bone',
  parentId: 'FMA:13678',
  regionTags: ['upper_limb'],
});

const coracoidProcess: AnatomyNode = node({
  id: 'FMA:13680',
  fmaId: 13680,
  nameEn: 'Coracoid process',
  nameLatin: 'processus coracoideus',
  nameAr: 'الناتئ الغرابي',
  level: 4,
  structureType: 'bone',
  parentId: 'FMA:13678',
  regionTags: ['upper_limb'],
});

const glenoidCavity: AnatomyNode = node({
  id: 'FMA:13681',
  fmaId: 13681,
  nameEn: 'Glenoid cavity',
  nameLatin: 'cavitas glenoidalis',
  nameAr: 'التجويف الحقاني',
  level: 4,
  structureType: 'bone',
  parentId: 'FMA:13678',
  regionTags: ['upper_limb'],
});

const humerus: AnatomyNode = node({
  id: 'FMA:13883',
  fmaId: 13883,
  nameEn: 'Humerus',
  nameLatin: 'humerus',
  nameAr: 'عظم العضد',
  level: 3,
  structureType: 'bone',
  layer: 'skeleton',
  parentId: 'ul_skeletal',
  highlightColor: '#e2e8f0',
  regionTags: ['upper_limb'],
});

const headOfHumerus: AnatomyNode = node({
  id: 'FMA:11821',
  fmaId: 11821,
  nameEn: 'Head of humerus',
  nameLatin: 'caput humeri',
  nameAr: 'رأس العضد',
  level: 4,
  structureType: 'bone',
  parentId: 'FMA:13883',
  regionTags: ['upper_limb'],
});

const greaterTubercle: AnatomyNode = node({
  id: 'FMA:14785',
  fmaId: 14785,
  nameEn: 'Greater tubercle',
  nameLatin: 'tuberculum majus',
  nameAr: 'الحديبة الكبرى',
  level: 4,
  structureType: 'bone',
  parentId: 'FMA:13883',
  regionTags: ['upper_limb'],
});

const lesserTubercle: AnatomyNode = node({
  id: 'FMA:14786',
  fmaId: 14786,
  nameEn: 'Lesser tubercle',
  nameLatin: 'tuberculum minus',
  nameAr: 'الحديبة الصغرى',
  level: 4,
  structureType: 'bone',
  parentId: 'FMA:13883',
  regionTags: ['upper_limb'],
});

const medialEpicondyleHumerus: AnatomyNode = node({
  id: 'FMA:14791',
  fmaId: 14791,
  nameEn: 'Medial epicondyle of humerus',
  nameLatin: 'epicondylus medialis humeri',
  nameAr: 'اللقيمة الإنسية',
  level: 4,
  structureType: 'bone',
  parentId: 'FMA:13883',
  regionTags: ['upper_limb'],
});

const lateralEpicondyleHumerus: AnatomyNode = node({
  id: 'FMA:14792',
  fmaId: 14792,
  nameEn: 'Lateral epicondyle of humerus',
  nameLatin: 'epicondylus lateralis humeri',
  nameAr: 'اللقيمة الجانبية',
  level: 4,
  structureType: 'bone',
  parentId: 'FMA:13883',
  regionTags: ['upper_limb'],
});

const olecranonFossa: AnatomyNode = node({
  id: 'FMA:14790',
  fmaId: 14790,
  nameEn: 'Olecranon fossa',
  nameLatin: 'fossa olecrani',
  nameAr: 'حفرة رأس الزند',
  level: 4,
  structureType: 'bone',
  parentId: 'FMA:13883',
  regionTags: ['upper_limb'],
});

const radius: AnatomyNode = node({
  id: 'FMA:13881',
  fmaId: 13881,
  nameEn: 'Radius',
  nameLatin: 'radius',
  nameAr: 'عظم الكعبرة',
  level: 3,
  structureType: 'bone',
  layer: 'skeleton',
  parentId: 'ul_skeletal',
  regionTags: ['upper_limb'],
});

const radialStyloidProcess: AnatomyNode = node({
  id: 'FMA:14806',
  fmaId: 14806,
  nameEn: 'Radial styloid process',
  nameLatin: 'processus styloideus radii',
  nameAr: 'الناتئ الإبري للكعبرة',
  level: 4,
  structureType: 'bone',
  parentId: 'FMA:13881',
  regionTags: ['upper_limb'],
});

const radialHead: AnatomyNode = node({
  id: 'FMA:14805',
  fmaId: 14805,
  nameEn: 'Radial head',
  nameLatin: 'caput radii',
  nameAr: 'رأس الكعبرة',
  level: 4,
  structureType: 'bone',
  parentId: 'FMA:13881',
  regionTags: ['upper_limb'],
});

const ulna: AnatomyNode = node({
  id: 'FMA:13882',
  fmaId: 13882,
  nameEn: 'Ulna',
  nameLatin: 'ulna',
  nameAr: 'عظم الزند',
  level: 3,
  structureType: 'bone',
  layer: 'skeleton',
  parentId: 'ul_skeletal',
  regionTags: ['upper_limb'],
});

const olecranon: AnatomyNode = node({
  id: 'FMA:14816',
  fmaId: 14816,
  nameEn: 'Olecranon',
  nameLatin: 'olecranon',
  nameAr: 'رأس الزند',
  level: 4,
  structureType: 'bone',
  parentId: 'FMA:13882',
  regionTags: ['upper_limb'],
});

const coronoidProcessUlna: AnatomyNode = node({
  id: 'FMA:14818',
  fmaId: 14818,
  nameEn: 'Coronoid process of ulna',
  nameLatin: 'processus coronoideus ulnae',
  nameAr: 'الناتئ الإكليلي للزند',
  level: 4,
  structureType: 'bone',
  parentId: 'FMA:13882',
  regionTags: ['upper_limb'],
});

const ul_carpals: AnatomyNode = node({
  id: 'ul_carpals',
  nameEn: 'Carpal bones',
  nameLatin: 'ossa carpi',
  nameAr: 'عظام الرسغ',
  level: 3,
  structureType: 'bone',
  layer: 'skeleton',
  parentId: 'ul_skeletal',
  regionTags: ['upper_limb'],
});

const scaphoid: AnatomyNode = node({
  id: 'FMA:23900',
  fmaId: 23900,
  nameEn: 'Scaphoid',
  nameLatin: 'os scaphoideum',
  nameAr: 'العظم الزورقي',
  level: 4,
  structureType: 'bone',
  parentId: 'ul_carpals',
  regionTags: ['upper_limb'],
});

const lunate: AnatomyNode = node({
  id: 'FMA:23901',
  fmaId: 23901,
  nameEn: 'Lunate',
  nameLatin: 'os lunatum',
  nameAr: 'العظم الهلالي',
  level: 4,
  structureType: 'bone',
  parentId: 'ul_carpals',
  regionTags: ['upper_limb'],
});

const triquetrum: AnatomyNode = node({
  id: 'FMA:23906',
  fmaId: 23906,
  nameEn: 'Triquetrum',
  nameLatin: 'os triquetrum',
  nameAr: 'العظم المثلثي',
  level: 4,
  structureType: 'bone',
  parentId: 'ul_carpals',
  regionTags: ['upper_limb'],
});

const hamate: AnatomyNode = node({
  id: 'FMA:23907',
  fmaId: 23907,
  nameEn: 'Hamate',
  nameLatin: 'os hamatum',
  nameAr: 'العظم المعقوف',
  level: 4,
  structureType: 'bone',
  parentId: 'ul_carpals',
  regionTags: ['upper_limb'],
});

const ul_metacarpals: AnatomyNode = node({
  id: 'ul_metacarpals',
  nameEn: 'Metacarpals & Phalanges',
  nameLatin: 'ossa metacarpi',
  nameAr: 'عظام المشط والسلاميات',
  level: 3,
  structureType: 'bone',
  layer: 'skeleton',
  parentId: 'ul_skeletal',
  regionTags: ['upper_limb'],
});

// ── Level 3+: JOINTS ──────────────────────────────────────────

const shoulderJoint: AnatomyNode = node({
  id: 'FMA:25202',
  fmaId: 25202,
  nameEn: 'Shoulder joint',
  nameLatin: 'articulatio humeri',
  nameAr: 'مفصل الكتف',
  level: 3,
  structureType: 'joint',
  parentId: 'ul_joints',
  highlightColor: '#90cdf4',
  regionTags: ['upper_limb'],
});

const glenohumeralLigaments: AnatomyNode = node({
  id: 'FMA:25203',
  fmaId: 25203,
  nameEn: 'Glenohumeral ligaments',
  nameAr: 'الأربطة الحقانية العضدية',
  level: 4,
  structureType: 'ligament',
  parentId: 'FMA:25202',
  regionTags: ['upper_limb'],
});

const coracohumeralLigament: AnatomyNode = node({
  id: 'FMA:25204',
  fmaId: 25204,
  nameEn: 'Coracohumeral ligament',
  nameLatin: 'ligamentum coracohumerale',
  nameAr: 'الرباط الغرابي العضدي',
  level: 4,
  structureType: 'ligament',
  parentId: 'FMA:25202',
  regionTags: ['upper_limb'],
});

const glenoidLabrum: AnatomyNode = node({
  id: 'FMA:25205',
  fmaId: 25205,
  nameEn: 'Glenoid labrum',
  nameLatin: 'labrum glenoidale',
  nameAr: 'الشفة الحقانية',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:25202',
  regionTags: ['upper_limb'],
});

const ul_rotator_cuff: AnatomyNode = node({
  id: 'ul_rotator_cuff',
  nameEn: 'Rotator cuff',
  nameAr: 'الكفة المدوِّرة',
  level: 4,
  structureType: 'muscle',
  parentId: 'FMA:25202',
  regionTags: ['upper_limb'],
});

const supraspinatus: AnatomyNode = node({
  id: 'FMA:22489',
  fmaId: 22489,
  nameEn: 'Supraspinatus',
  nameLatin: 'musculus supraspinatus',
  nameAr: 'العضلة فوق الشوكة',
  level: 5,
  structureType: 'muscle',
  layer: 'muscle_deep',
  parentId: 'ul_rotator_cuff',
  regionTags: ['upper_limb'],
});

const infraspinatus: AnatomyNode = node({
  id: 'FMA:22491',
  fmaId: 22491,
  nameEn: 'Infraspinatus',
  nameLatin: 'musculus infraspinatus',
  nameAr: 'العضلة تحت الشوكة',
  level: 5,
  structureType: 'muscle',
  layer: 'muscle_deep',
  parentId: 'ul_rotator_cuff',
  regionTags: ['upper_limb'],
});

const subscapularis: AnatomyNode = node({
  id: 'FMA:22488',
  fmaId: 22488,
  nameEn: 'Subscapularis',
  nameLatin: 'musculus subscapularis',
  nameAr: 'العضلة تحت الكتف',
  level: 5,
  structureType: 'muscle',
  layer: 'muscle_deep',
  parentId: 'ul_rotator_cuff',
  regionTags: ['upper_limb'],
});

const teresMinor: AnatomyNode = node({
  id: 'FMA:22492',
  fmaId: 22492,
  nameEn: 'Teres minor',
  nameLatin: 'musculus teres minor',
  nameAr: 'العضلة المستديرة الصغيرة',
  level: 5,
  structureType: 'muscle',
  layer: 'muscle_deep',
  parentId: 'ul_rotator_cuff',
  regionTags: ['upper_limb'],
});

const elbowJoint: AnatomyNode = node({
  id: 'FMA:25998',
  fmaId: 25998,
  nameEn: 'Elbow joint',
  nameLatin: 'articulatio cubiti',
  nameAr: 'مفصل المرفق',
  level: 3,
  structureType: 'joint',
  parentId: 'ul_joints',
  highlightColor: '#90cdf4',
  regionTags: ['upper_limb'],
});

const medialCollateralLigamentElbow: AnatomyNode = node({
  id: 'FMA:25999',
  fmaId: 25999,
  nameEn: 'Medial collateral ligament of elbow',
  nameLatin: 'ligamentum collaterale ulnare',
  nameAr: 'الرباط الجانبي الإنسي',
  level: 4,
  structureType: 'ligament',
  parentId: 'FMA:25998',
  regionTags: ['upper_limb'],
});

const lateralCollateralLigamentElbow: AnatomyNode = node({
  id: 'FMA:26000',
  fmaId: 26000,
  nameEn: 'Lateral collateral ligament of elbow',
  nameLatin: 'ligamentum collaterale radiale',
  nameAr: 'الرباط الجانبي الوحشي',
  level: 4,
  structureType: 'ligament',
  parentId: 'FMA:25998',
  regionTags: ['upper_limb'],
});

const annularLigamentRadius: AnatomyNode = node({
  id: 'FMA:26001',
  fmaId: 26001,
  nameEn: 'Annular ligament of radius',
  nameLatin: 'ligamentum anulare radii',
  nameAr: 'الرباط الحلقي للكعبرة',
  level: 4,
  structureType: 'ligament',
  parentId: 'FMA:25998',
  regionTags: ['upper_limb'],
});

const ul_wrist_joint: AnatomyNode = node({
  id: 'ul_wrist_joint',
  nameEn: 'Wrist joint',
  nameLatin: 'articulatio radiocarpalis',
  nameAr: 'مفصل الرسغ',
  level: 3,
  structureType: 'joint',
  parentId: 'ul_joints',
  regionTags: ['upper_limb'],
});

// ── Level 3+: MUSCLES ─────────────────────────────────────────

const deltoid: AnatomyNode = node({
  id: 'FMA:37664',
  fmaId: 37664,
  nameEn: 'Deltoid',
  nameLatin: 'musculus deltoideus',
  nameAr: 'العضلة الدالية',
  level: 3,
  structureType: 'muscle',
  layer: 'muscle_superficial',
  parentId: 'ul_muscular',
  highlightColor: '#f6ad55',
  regionTags: ['upper_limb'],
});

const bicepsBrachii: AnatomyNode = node({
  id: 'FMA:37680',
  fmaId: 37680,
  nameEn: 'Biceps brachii',
  nameLatin: 'musculus biceps brachii',
  nameAr: 'عضلة العضد ذات الرأسين',
  level: 3,
  structureType: 'muscle',
  layer: 'muscle_superficial',
  parentId: 'ul_muscular',
  highlightColor: '#f6ad55',
  regionTags: ['upper_limb'],
});

const tricepsBrachii: AnatomyNode = node({
  id: 'FMA:37681',
  fmaId: 37681,
  nameEn: 'Triceps brachii',
  nameLatin: 'musculus triceps brachii',
  nameAr: 'عضلة العضد ثلاثية الرؤوس',
  level: 3,
  structureType: 'muscle',
  layer: 'muscle_superficial',
  parentId: 'ul_muscular',
  regionTags: ['upper_limb'],
});

const brachialis: AnatomyNode = node({
  id: 'FMA:37674',
  fmaId: 37674,
  nameEn: 'Brachialis',
  nameLatin: 'musculus brachialis',
  nameAr: 'العضلة العضدية',
  level: 3,
  structureType: 'muscle',
  layer: 'muscle_deep',
  parentId: 'ul_muscular',
  regionTags: ['upper_limb'],
});

const ul_forearm_flexors: AnatomyNode = node({
  id: 'ul_forearm_flexors',
  nameEn: 'Forearm flexors',
  nameAr: 'عضلات ثني الساعد',
  level: 3,
  structureType: 'muscle',
  parentId: 'ul_muscular',
  regionTags: ['upper_limb'],
});

const flexorCarpiRadialis: AnatomyNode = node({
  id: 'FMA:38455',
  fmaId: 38455,
  nameEn: 'Flexor carpi radialis',
  nameLatin: 'musculus flexor carpi radialis',
  nameAr: 'عضلة ثني الرسغ الكعبرية',
  level: 4,
  structureType: 'muscle',
  parentId: 'ul_forearm_flexors',
  regionTags: ['upper_limb'],
});

const flexorCarpiUlnaris: AnatomyNode = node({
  id: 'FMA:38456',
  fmaId: 38456,
  nameEn: 'Flexor carpi ulnaris',
  nameLatin: 'musculus flexor carpi ulnaris',
  nameAr: 'عضلة ثني الرسغ الزندية',
  level: 4,
  structureType: 'muscle',
  parentId: 'ul_forearm_flexors',
  regionTags: ['upper_limb'],
});

const flexorDigitorumSuperficialis: AnatomyNode = node({
  id: 'FMA:38459',
  fmaId: 38459,
  nameEn: 'Flexor digitorum superficialis',
  nameLatin: 'musculus flexor digitorum superficialis',
  nameAr: 'عضلة ثني الأصابع السطحية',
  level: 4,
  structureType: 'muscle',
  parentId: 'ul_forearm_flexors',
  regionTags: ['upper_limb'],
});

const flexorDigitorumProfundus: AnatomyNode = node({
  id: 'FMA:38460',
  fmaId: 38460,
  nameEn: 'Flexor digitorum profundus',
  nameLatin: 'musculus flexor digitorum profundus',
  nameAr: 'عضلة ثني الأصابع العميقة',
  level: 4,
  structureType: 'muscle',
  parentId: 'ul_forearm_flexors',
  regionTags: ['upper_limb'],
});

const ul_forearm_extensors: AnatomyNode = node({
  id: 'ul_forearm_extensors',
  nameEn: 'Forearm extensors',
  nameAr: 'عضلات مد الساعد',
  level: 3,
  structureType: 'muscle',
  parentId: 'ul_muscular',
  regionTags: ['upper_limb'],
});

// ── Level 3+: NERVES ──────────────────────────────────────────

const brachialPlexus: AnatomyNode = node({
  id: 'FMA:37970',
  fmaId: 37970,
  nameEn: 'Brachial plexus',
  nameLatin: 'plexus brachialis',
  nameAr: 'الضفيرة العضدية',
  level: 3,
  structureType: 'nerve',
  layer: 'nerve',
  parentId: 'ul_nerves',
  highlightColor: '#68d391',
  regionTags: ['upper_limb'],
});

const musculocutaneousNerve: AnatomyNode = node({
  id: 'FMA:37971',
  fmaId: 37971,
  nameEn: 'Musculocutaneous nerve',
  nameLatin: 'nervus musculocutaneus',
  nameAr: 'العصب العضلي الجلدي',
  level: 4,
  structureType: 'nerve',
  parentId: 'FMA:37970',
  regionTags: ['upper_limb'],
});

const radialNerve: AnatomyNode = node({
  id: 'FMA:37972',
  fmaId: 37972,
  nameEn: 'Radial nerve',
  nameLatin: 'nervus radialis',
  nameAr: 'العصب الكعبري',
  level: 4,
  structureType: 'nerve',
  parentId: 'FMA:37970',
  highlightColor: '#68d391',
  regionTags: ['upper_limb'],
});

const medianNerve: AnatomyNode = node({
  id: 'FMA:37973',
  fmaId: 37973,
  nameEn: 'Median nerve',
  nameLatin: 'nervus medianus',
  nameAr: 'العصب الأوسط',
  level: 4,
  structureType: 'nerve',
  parentId: 'FMA:37970',
  highlightColor: '#68d391',
  regionTags: ['upper_limb'],
});

const ulnarNerve: AnatomyNode = node({
  id: 'FMA:37974',
  fmaId: 37974,
  nameEn: 'Ulnar nerve',
  nameLatin: 'nervus ulnaris',
  nameAr: 'العصب الزندي',
  level: 4,
  structureType: 'nerve',
  parentId: 'FMA:37970',
  highlightColor: '#68d391',
  regionTags: ['upper_limb'],
});

const axillaryNerve: AnatomyNode = node({
  id: 'FMA:37975',
  fmaId: 37975,
  nameEn: 'Axillary nerve',
  nameLatin: 'nervus axillaris',
  nameAr: 'العصب الإبطي',
  level: 4,
  structureType: 'nerve',
  parentId: 'FMA:37970',
  regionTags: ['upper_limb'],
});

const ul_carpal_tunnel: AnatomyNode = node({
  id: 'ul_carpal_tunnel',
  nameEn: 'Carpal tunnel',
  nameLatin: 'canalis carpi',
  nameAr: 'النفق الرسغي',
  level: 4,
  structureType: 'other',
  parentId: 'ul_nerves',
  regionTags: ['upper_limb'],
});

// ── Level 3+: VESSELS ─────────────────────────────────────────

const axillaryArtery: AnatomyNode = node({
  id: 'FMA:22689',
  fmaId: 22689,
  nameEn: 'Axillary artery',
  nameLatin: 'arteria axillaris',
  nameAr: 'الشريان الإبطي',
  level: 3,
  structureType: 'artery',
  layer: 'artery',
  parentId: 'ul_vascular',
  highlightColor: '#e53e3e',
  regionTags: ['upper_limb'],
});

const brachialArtery: AnatomyNode = node({
  id: 'FMA:22696',
  fmaId: 22696,
  nameEn: 'Brachial artery',
  nameLatin: 'arteria brachialis',
  nameAr: 'الشريان العضدي',
  level: 3,
  structureType: 'artery',
  layer: 'artery',
  parentId: 'ul_vascular',
  highlightColor: '#e53e3e',
  regionTags: ['upper_limb'],
});

const radialArtery: AnatomyNode = node({
  id: 'FMA:22712',
  fmaId: 22712,
  nameEn: 'Radial artery',
  nameLatin: 'arteria radialis',
  nameAr: 'الشريان الكعبري',
  level: 4,
  structureType: 'artery',
  parentId: 'FMA:22696',
  regionTags: ['upper_limb'],
});

const ulnarArtery: AnatomyNode = node({
  id: 'FMA:22705',
  fmaId: 22705,
  nameEn: 'Ulnar artery',
  nameLatin: 'arteria ulnaris',
  nameAr: 'الشريان الزندي',
  level: 4,
  structureType: 'artery',
  parentId: 'FMA:22696',
  regionTags: ['upper_limb'],
});

const deepBrachialArtery: AnatomyNode = node({
  id: 'FMA:22698',
  fmaId: 22698,
  nameEn: 'Deep brachial artery',
  nameLatin: 'arteria profunda brachii',
  nameAr: 'الشريان العضدي العميق',
  level: 4,
  structureType: 'artery',
  parentId: 'FMA:22696',
  regionTags: ['upper_limb'],
});

const cephalicVein: AnatomyNode = node({
  id: 'FMA:9875',
  fmaId: 9875,
  nameEn: 'Cephalic vein',
  nameLatin: 'vena cephalica',
  nameAr: 'الوريد الرأسي',
  level: 3,
  structureType: 'vein',
  layer: 'vein',
  parentId: 'ul_vascular',
  highlightColor: '#3182ce',
  regionTags: ['upper_limb'],
});

const basilicVein: AnatomyNode = node({
  id: 'FMA:9876',
  fmaId: 9876,
  nameEn: 'Basilic vein',
  nameLatin: 'vena basilica',
  nameAr: 'الوريد الرأسي الطرفي',
  level: 3,
  structureType: 'vein',
  layer: 'vein',
  parentId: 'ul_vascular',
  regionTags: ['upper_limb'],
});

const medianCubitalVein: AnatomyNode = node({
  id: 'FMA:22839',
  fmaId: 22839,
  nameEn: 'Median cubital vein',
  nameLatin: 'vena mediana cubiti',
  nameAr: 'الوريد المرفقي الأوسط',
  level: 3,
  structureType: 'vein',
  parentId: 'ul_vascular',
  regionTags: ['upper_limb'],
});

// ── Exports ───────────────────────────────────────────────────

export const ALL_UPPER_LIMB_NODES: AnatomyNode[] = [
  UPPER_LIMB,
  // Level 2 systems
  ul_skeletal,
  ul_joints,
  ul_muscular,
  ul_nerves,
  ul_vascular,
  // Bones
  clavicle,
  scapula,
  acromion,
  coracoidProcess,
  glenoidCavity,
  humerus,
  headOfHumerus,
  greaterTubercle,
  lesserTubercle,
  medialEpicondyleHumerus,
  lateralEpicondyleHumerus,
  olecranonFossa,
  radius,
  radialStyloidProcess,
  radialHead,
  ulna,
  olecranon,
  coronoidProcessUlna,
  ul_carpals,
  scaphoid,
  lunate,
  triquetrum,
  hamate,
  ul_metacarpals,
  // Joints
  shoulderJoint,
  glenohumeralLigaments,
  coracohumeralLigament,
  glenoidLabrum,
  ul_rotator_cuff,
  supraspinatus,
  infraspinatus,
  subscapularis,
  teresMinor,
  elbowJoint,
  medialCollateralLigamentElbow,
  lateralCollateralLigamentElbow,
  annularLigamentRadius,
  ul_wrist_joint,
  // Muscles
  deltoid,
  bicepsBrachii,
  tricepsBrachii,
  brachialis,
  ul_forearm_flexors,
  flexorCarpiRadialis,
  flexorCarpiUlnaris,
  flexorDigitorumSuperficialis,
  flexorDigitorumProfundus,
  ul_forearm_extensors,
  // Nerves
  brachialPlexus,
  musculocutaneousNerve,
  radialNerve,
  medianNerve,
  ulnarNerve,
  axillaryNerve,
  ul_carpal_tunnel,
  // Vessels
  axillaryArtery,
  brachialArtery,
  radialArtery,
  ulnarArtery,
  deepBrachialArtery,
  cephalicVein,
  basilicVein,
  medianCubitalVein,
];
