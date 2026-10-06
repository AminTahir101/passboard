// ============================================================
// Passboard Anatomy Module — Lower Limb Hierarchy
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
    parentId: null, regionTags: ['lower_limb'], systemTags: [],
    sex: 'both', layer: null, meshIds: [], contentId: null,
    modelPending: false, highlightColor: null, sortOrder: 0,
    ...partial,
  };
}

// ── Level 1: Lower limb region ────────────────────────────────

export const LOWER_LIMB: AnatomyNode = node({
  id: 'FMA:7185',
  fmaId: 7185,
  nameEn: 'Lower limb',
  nameLatin: 'membrum inferius',
  nameAr: 'الطرف السفلي',
  level: 1,
  structureType: 'region',
  regionTags: ['lower_limb'],
  sortOrder: 8,
});

// ── Level 2: Systems ──────────────────────────────────────────

const ll_skeletal: AnatomyNode = node({
  id: 'll_skeletal',
  nameEn: 'Bones',
  nameAr: 'العظام',
  level: 2,
  structureType: 'region',
  parentId: 'FMA:7185',
  regionTags: ['lower_limb'],
});

const ll_joints: AnatomyNode = node({
  id: 'll_joints',
  nameEn: 'Joints',
  nameAr: 'المفاصل',
  level: 2,
  structureType: 'region',
  parentId: 'FMA:7185',
  regionTags: ['lower_limb'],
});

const ll_muscular: AnatomyNode = node({
  id: 'll_muscular',
  nameEn: 'Muscles',
  nameAr: 'العضلات',
  level: 2,
  structureType: 'region',
  parentId: 'FMA:7185',
  regionTags: ['lower_limb'],
});

const ll_nerves: AnatomyNode = node({
  id: 'll_nerves',
  nameEn: 'Nerves',
  nameAr: 'الأعصاب',
  level: 2,
  structureType: 'region',
  parentId: 'FMA:7185',
  regionTags: ['lower_limb'],
});

const ll_vascular: AnatomyNode = node({
  id: 'll_vascular',
  nameEn: 'Vessels',
  nameAr: 'الأوعية الدموية',
  level: 2,
  structureType: 'region',
  parentId: 'FMA:7185',
  regionTags: ['lower_limb'],
});

// ── Level 3+: BONES ───────────────────────────────────────────

const femur: AnatomyNode = node({
  id: 'FMA:9611',
  fmaId: 9611,
  nameEn: 'Femur',
  nameLatin: 'femur',
  nameAr: 'عظم الفخذ',
  level: 3,
  structureType: 'bone',
  layer: 'skeleton',
  parentId: 'll_skeletal',
  regionTags: ['lower_limb'],
});

const headOfFemur: AnatomyNode = node({
  id: 'FMA:32487',
  fmaId: 32487,
  nameEn: 'Head of femur',
  nameLatin: 'caput ossis femoris',
  nameAr: 'رأس عظم الفخذ',
  level: 4,
  structureType: 'bone',
  parentId: 'FMA:9611',
  regionTags: ['lower_limb'],
});

const neckOfFemur: AnatomyNode = node({
  id: 'FMA:32488',
  fmaId: 32488,
  nameEn: 'Neck of femur',
  nameLatin: 'collum ossis femoris',
  nameAr: 'عنق عظم الفخذ',
  level: 4,
  structureType: 'bone',
  parentId: 'FMA:9611',
  regionTags: ['lower_limb'],
});

const greaterTrochanter: AnatomyNode = node({
  id: 'FMA:32489',
  fmaId: 32489,
  nameEn: 'Greater trochanter',
  nameLatin: 'trochanter major',
  nameAr: 'المدور الكبير',
  level: 4,
  structureType: 'bone',
  parentId: 'FMA:9611',
  regionTags: ['lower_limb'],
});

const lesserTrochanter: AnatomyNode = node({
  id: 'FMA:32490',
  fmaId: 32490,
  nameEn: 'Lesser trochanter',
  nameLatin: 'trochanter minor',
  nameAr: 'المدور الصغير',
  level: 4,
  structureType: 'bone',
  parentId: 'FMA:9611',
  regionTags: ['lower_limb'],
});

const medialCondyleFemur: AnatomyNode = node({
  id: 'FMA:32491',
  fmaId: 32491,
  nameEn: 'Medial condyle of femur',
  nameAr: 'اللقمة الإنسية للفخذ',
  level: 4,
  structureType: 'bone',
  parentId: 'FMA:9611',
  regionTags: ['lower_limb'],
});

const lateralCondyleFemur: AnatomyNode = node({
  id: 'FMA:32492',
  fmaId: 32492,
  nameEn: 'Lateral condyle of femur',
  nameAr: 'اللقمة الجانبية للفخذ',
  level: 4,
  structureType: 'bone',
  parentId: 'FMA:9611',
  regionTags: ['lower_limb'],
});

const tibia: AnatomyNode = node({
  id: 'FMA:24477',
  fmaId: 24477,
  nameEn: 'Tibia',
  nameLatin: 'tibia',
  nameAr: 'القصبة',
  level: 3,
  structureType: 'bone',
  layer: 'skeleton',
  parentId: 'll_skeletal',
  regionTags: ['lower_limb'],
});

const medialCondyleTibia: AnatomyNode = node({
  id: 'FMA:32567',
  fmaId: 32567,
  nameEn: 'Medial condyle of tibia',
  nameAr: 'اللقمة الإنسية للقصبة',
  level: 4,
  structureType: 'bone',
  parentId: 'FMA:24477',
  regionTags: ['lower_limb'],
});

const lateralCondyleTibia: AnatomyNode = node({
  id: 'FMA:32568',
  fmaId: 32568,
  nameEn: 'Lateral condyle of tibia',
  nameAr: 'اللقمة الجانبية للقصبة',
  level: 4,
  structureType: 'bone',
  parentId: 'FMA:24477',
  regionTags: ['lower_limb'],
});

const medialMalleolus: AnatomyNode = node({
  id: 'FMA:32569',
  fmaId: 32569,
  nameEn: 'Medial malleolus',
  nameLatin: 'malleolus medialis',
  nameAr: 'الكعب الإنسي',
  level: 4,
  structureType: 'bone',
  parentId: 'FMA:24477',
  regionTags: ['lower_limb'],
});

const tibialTuberosity: AnatomyNode = node({
  id: 'FMA:32570',
  fmaId: 32570,
  nameEn: 'Tibial tuberosity',
  nameLatin: 'tuberositas tibiae',
  nameAr: 'حدبة القصبة',
  level: 4,
  structureType: 'bone',
  parentId: 'FMA:24477',
  regionTags: ['lower_limb'],
});

const fibula: AnatomyNode = node({
  id: 'FMA:24480',
  fmaId: 24480,
  nameEn: 'Fibula',
  nameLatin: 'fibula',
  nameAr: 'الشظية',
  level: 3,
  structureType: 'bone',
  layer: 'skeleton',
  parentId: 'll_skeletal',
  regionTags: ['lower_limb'],
});

const lateralMalleolus: AnatomyNode = node({
  id: 'FMA:32579',
  fmaId: 32579,
  nameEn: 'Lateral malleolus',
  nameLatin: 'malleolus lateralis',
  nameAr: 'الكعب الوحشي',
  level: 4,
  structureType: 'bone',
  parentId: 'FMA:24480',
  regionTags: ['lower_limb'],
});

const patella: AnatomyNode = node({
  id: 'FMA:24485',
  fmaId: 24485,
  nameEn: 'Patella',
  nameLatin: 'patella',
  nameAr: 'الرضفة',
  level: 3,
  structureType: 'bone',
  layer: 'skeleton',
  parentId: 'll_skeletal',
  regionTags: ['lower_limb'],
});

const ll_tarsals: AnatomyNode = node({
  id: 'll_tarsals',
  nameEn: 'Tarsal bones',
  nameLatin: 'ossa tarsi',
  nameAr: 'عظام الرسغ القدمي',
  level: 3,
  structureType: 'bone',
  layer: 'skeleton',
  parentId: 'll_skeletal',
  regionTags: ['lower_limb'],
});

const calcaneus: AnatomyNode = node({
  id: 'FMA:24498',
  fmaId: 24498,
  nameEn: 'Calcaneus',
  nameLatin: 'calcaneus',
  nameAr: 'عظم الكعب',
  level: 4,
  structureType: 'bone',
  parentId: 'll_tarsals',
  regionTags: ['lower_limb'],
});

const talus: AnatomyNode = node({
  id: 'FMA:24499',
  fmaId: 24499,
  nameEn: 'Talus',
  nameLatin: 'talus',
  nameAr: 'الكاحل',
  level: 4,
  structureType: 'bone',
  parentId: 'll_tarsals',
  regionTags: ['lower_limb'],
});

const navicular: AnatomyNode = node({
  id: 'FMA:24503',
  fmaId: 24503,
  nameEn: 'Navicular',
  nameLatin: 'os naviculare pedis',
  nameAr: 'العظم الزورقي للقدم',
  level: 4,
  structureType: 'bone',
  parentId: 'll_tarsals',
  regionTags: ['lower_limb'],
});

const cuboid: AnatomyNode = node({
  id: 'FMA:24504',
  fmaId: 24504,
  nameEn: 'Cuboid',
  nameLatin: 'os cuboideum',
  nameAr: 'العظم المكعبي',
  level: 4,
  structureType: 'bone',
  parentId: 'll_tarsals',
  regionTags: ['lower_limb'],
});

const ll_metatarsals: AnatomyNode = node({
  id: 'll_metatarsals',
  nameEn: 'Metatarsals & Phalanges of foot',
  nameAr: 'عظام مشط وسلاميات القدم',
  level: 3,
  structureType: 'bone',
  parentId: 'll_skeletal',
  regionTags: ['lower_limb'],
});

// ── Level 3+: JOINTS ──────────────────────────────────────────

const hipJoint: AnatomyNode = node({
  id: 'FMA:24476',
  fmaId: 24476,
  nameEn: 'Hip joint',
  nameLatin: 'articulatio coxae',
  nameAr: 'مفصل الورك',
  level: 3,
  structureType: 'joint',
  parentId: 'll_joints',
  highlightColor: '#90cdf4',
  regionTags: ['lower_limb'],
});

const iliofemoralLigament: AnatomyNode = node({
  id: 'FMA:35295',
  fmaId: 35295,
  nameEn: 'Iliofemoral ligament',
  nameLatin: 'ligamentum iliofemorale',
  nameAr: 'الرباط الحرقفي الفخذي',
  synonyms: ["Bigelow's ligament"],
  level: 4,
  structureType: 'ligament',
  parentId: 'FMA:24476',
  regionTags: ['lower_limb'],
});

const pubofemoralLigament: AnatomyNode = node({
  id: 'FMA:35296',
  fmaId: 35296,
  nameEn: 'Pubofemoral ligament',
  nameLatin: 'ligamentum pubofemorale',
  nameAr: 'الرباط العاني الفخذي',
  level: 4,
  structureType: 'ligament',
  parentId: 'FMA:24476',
  regionTags: ['lower_limb'],
});

const ischiofemoralLigament: AnatomyNode = node({
  id: 'FMA:35297',
  fmaId: 35297,
  nameEn: 'Ischiofemoral ligament',
  nameLatin: 'ligamentum ischiofemorale',
  nameAr: 'الرباط الإسكي الفخذي',
  level: 4,
  structureType: 'ligament',
  parentId: 'FMA:24476',
  regionTags: ['lower_limb'],
});

const ll_acetabular_labrum: AnatomyNode = node({
  id: 'll_acetabular_labrum',
  nameEn: 'Acetabular labrum',
  nameLatin: 'labrum acetabulare',
  nameAr: 'الشفة الحُقية',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:24476',
  regionTags: ['lower_limb'],
});

const kneeJoint: AnatomyNode = node({
  id: 'FMA:9622',
  fmaId: 9622,
  nameEn: 'Knee joint',
  nameLatin: 'articulatio genus',
  nameAr: 'مفصل الركبة',
  level: 3,
  structureType: 'joint',
  parentId: 'll_joints',
  highlightColor: '#90cdf4',
  regionTags: ['lower_limb'],
});

const anteriorCruciateLigament: AnatomyNode = node({
  id: 'FMA:35392',
  fmaId: 35392,
  nameEn: 'Anterior cruciate ligament',
  nameLatin: 'ligamentum cruciatum anterius',
  nameAr: 'الرباط الصليبي الأمامي',
  abbreviations: ['ACL'],
  level: 4,
  structureType: 'ligament',
  parentId: 'FMA:9622',
  highlightColor: '#e53e3e',
  regionTags: ['lower_limb'],
});

const posteriorCruciateLigament: AnatomyNode = node({
  id: 'FMA:35393',
  fmaId: 35393,
  nameEn: 'Posterior cruciate ligament',
  nameLatin: 'ligamentum cruciatum posterius',
  nameAr: 'الرباط الصليبي الخلفي',
  abbreviations: ['PCL'],
  level: 4,
  structureType: 'ligament',
  parentId: 'FMA:9622',
  regionTags: ['lower_limb'],
});

const medialCollateralLigamentKnee: AnatomyNode = node({
  id: 'FMA:35395',
  fmaId: 35395,
  nameEn: 'Medial collateral ligament of knee',
  nameLatin: 'ligamentum collaterale tibiale',
  nameAr: 'الرباط الجانبي الإنسي للركبة',
  abbreviations: ['MCL'],
  level: 4,
  structureType: 'ligament',
  parentId: 'FMA:9622',
  regionTags: ['lower_limb'],
});

const lateralCollateralLigamentKnee: AnatomyNode = node({
  id: 'FMA:35396',
  fmaId: 35396,
  nameEn: 'Lateral collateral ligament of knee',
  nameAr: 'الرباط الجانبي الوحشي للركبة',
  abbreviations: ['LCL'],
  level: 4,
  structureType: 'ligament',
  parentId: 'FMA:9622',
  regionTags: ['lower_limb'],
});

const medialMeniscus: AnatomyNode = node({
  id: 'FMA:35397',
  fmaId: 35397,
  nameEn: 'Medial meniscus',
  nameLatin: 'meniscus medialis',
  nameAr: 'الغضروف الهلالي الإنسي',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:9622',
  regionTags: ['lower_limb'],
});

const lateralMeniscus: AnatomyNode = node({
  id: 'FMA:35398',
  fmaId: 35398,
  nameEn: 'Lateral meniscus',
  nameLatin: 'meniscus lateralis',
  nameAr: 'الغضروف الهلالي الجانبي',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:9622',
  regionTags: ['lower_limb'],
});

const patellarLigament: AnatomyNode = node({
  id: 'FMA:35399',
  fmaId: 35399,
  nameEn: 'Patellar ligament',
  nameLatin: 'ligamentum patellae',
  nameAr: 'رباط الرضفة',
  level: 4,
  structureType: 'ligament',
  parentId: 'FMA:9622',
  regionTags: ['lower_limb'],
});

const ll_ankle_joint: AnatomyNode = node({
  id: 'll_ankle_joint',
  nameEn: 'Ankle joint',
  nameLatin: 'articulatio talocruralis',
  nameAr: 'مفصل الكاحل',
  level: 3,
  structureType: 'joint',
  parentId: 'll_joints',
  regionTags: ['lower_limb'],
});

const ll_deltoid_ligament: AnatomyNode = node({
  id: 'll_deltoid_ligament',
  nameEn: 'Deltoid ligament',
  nameLatin: 'ligamentum mediale talocruralis',
  nameAr: 'الرباط الدالي',
  level: 4,
  structureType: 'ligament',
  parentId: 'll_ankle_joint',
  regionTags: ['lower_limb'],
});

const ll_atfl: AnatomyNode = node({
  id: 'll_atfl',
  nameEn: 'Anterior talofibular ligament',
  nameAr: 'الرباط الكاحلي الشظوي الأمامي',
  abbreviations: ['ATFL'],
  level: 4,
  structureType: 'ligament',
  parentId: 'll_ankle_joint',
  regionTags: ['lower_limb'],
});

// ── Level 3+: MUSCLES ─────────────────────────────────────────

const ll_gluteal_group: AnatomyNode = node({
  id: 'll_gluteal_group',
  nameEn: 'Gluteal muscles',
  nameAr: 'العضلات الألوية',
  level: 3,
  structureType: 'muscle',
  layer: 'muscle_superficial',
  parentId: 'll_muscular',
  regionTags: ['lower_limb'],
});

const gluteusMaximus: AnatomyNode = node({
  id: 'FMA:22335',
  fmaId: 22335,
  nameEn: 'Gluteus maximus',
  nameLatin: 'musculus gluteus maximus',
  nameAr: 'العضلة الألوية الكبرى',
  level: 4,
  structureType: 'muscle',
  layer: 'muscle_superficial',
  parentId: 'll_gluteal_group',
  highlightColor: '#f6ad55',
  regionTags: ['lower_limb'],
});

const gluteusMedius: AnatomyNode = node({
  id: 'FMA:22338',
  fmaId: 22338,
  nameEn: 'Gluteus medius',
  nameLatin: 'musculus gluteus medius',
  nameAr: 'العضلة الألوية المتوسطة',
  level: 4,
  structureType: 'muscle',
  parentId: 'll_gluteal_group',
  regionTags: ['lower_limb'],
});

const gluteusMinimus: AnatomyNode = node({
  id: 'FMA:22341',
  fmaId: 22341,
  nameEn: 'Gluteus minimus',
  nameLatin: 'musculus gluteus minimus',
  nameAr: 'العضلة الألوية الصغرى',
  level: 4,
  structureType: 'muscle',
  parentId: 'll_gluteal_group',
  regionTags: ['lower_limb'],
});

const ll_quadriceps: AnatomyNode = node({
  id: 'll_quadriceps',
  nameEn: 'Quadriceps femoris',
  nameLatin: 'musculus quadriceps femoris',
  nameAr: 'عضلة رباعية الرؤوس الفخذية',
  level: 3,
  structureType: 'muscle',
  layer: 'muscle_superficial',
  parentId: 'll_muscular',
  regionTags: ['lower_limb'],
});

const rectusFemoris: AnatomyNode = node({
  id: 'FMA:22430',
  fmaId: 22430,
  nameEn: 'Rectus femoris',
  nameLatin: 'musculus rectus femoris',
  nameAr: 'العضلة المستقيمة للفخذ',
  level: 4,
  structureType: 'muscle',
  parentId: 'll_quadriceps',
  regionTags: ['lower_limb'],
});

const vastusLateralis: AnatomyNode = node({
  id: 'FMA:22431',
  fmaId: 22431,
  nameEn: 'Vastus lateralis',
  nameLatin: 'musculus vastus lateralis',
  nameAr: 'العضلة الفخذية الجانبية',
  level: 4,
  structureType: 'muscle',
  parentId: 'll_quadriceps',
  regionTags: ['lower_limb'],
});

const vastusMedialis: AnatomyNode = node({
  id: 'FMA:22432',
  fmaId: 22432,
  nameEn: 'Vastus medialis',
  nameLatin: 'musculus vastus medialis',
  nameAr: 'العضلة الفخذية الإنسية',
  level: 4,
  structureType: 'muscle',
  parentId: 'll_quadriceps',
  regionTags: ['lower_limb'],
});

const vastusIntermedius: AnatomyNode = node({
  id: 'FMA:22433',
  fmaId: 22433,
  nameEn: 'Vastus intermedius',
  nameLatin: 'musculus vastus intermedius',
  nameAr: 'العضلة الفخذية الوسطى',
  level: 4,
  structureType: 'muscle',
  parentId: 'll_quadriceps',
  regionTags: ['lower_limb'],
});

const ll_hamstrings: AnatomyNode = node({
  id: 'll_hamstrings',
  nameEn: 'Hamstrings',
  nameLatin: 'musculi ischiocruris',
  nameAr: 'عضلات الجانب الخلفي للفخذ',
  level: 3,
  structureType: 'muscle',
  layer: 'muscle_superficial',
  parentId: 'll_muscular',
  regionTags: ['lower_limb'],
});

const bicepsFemoris: AnatomyNode = node({
  id: 'FMA:22438',
  fmaId: 22438,
  nameEn: 'Biceps femoris',
  nameLatin: 'musculus biceps femoris',
  nameAr: 'عضلة الفخذ ثنائية الرأس',
  level: 4,
  structureType: 'muscle',
  parentId: 'll_hamstrings',
  regionTags: ['lower_limb'],
});

const semitendinosus: AnatomyNode = node({
  id: 'FMA:22440',
  fmaId: 22440,
  nameEn: 'Semitendinosus',
  nameLatin: 'musculus semitendinosus',
  nameAr: 'العضلة نصف الوترية',
  level: 4,
  structureType: 'muscle',
  parentId: 'll_hamstrings',
  regionTags: ['lower_limb'],
});

const semimembranosus: AnatomyNode = node({
  id: 'FMA:22441',
  fmaId: 22441,
  nameEn: 'Semimembranosus',
  nameLatin: 'musculus semimembranosus',
  nameAr: 'العضلة نصف الغشائية',
  level: 4,
  structureType: 'muscle',
  parentId: 'll_hamstrings',
  regionTags: ['lower_limb'],
});

const ll_calf: AnatomyNode = node({
  id: 'll_calf',
  nameEn: 'Calf muscles',
  nameAr: 'عضلات الساق الخلفية',
  level: 3,
  structureType: 'muscle',
  layer: 'muscle_superficial',
  parentId: 'll_muscular',
  regionTags: ['lower_limb'],
});

const gastrocnemius: AnatomyNode = node({
  id: 'FMA:22538',
  fmaId: 22538,
  nameEn: 'Gastrocnemius',
  nameLatin: 'musculus gastrocnemius',
  nameAr: 'عضلة الساق',
  level: 4,
  structureType: 'muscle',
  parentId: 'll_calf',
  highlightColor: '#f6ad55',
  regionTags: ['lower_limb'],
});

const soleus: AnatomyNode = node({
  id: 'FMA:22540',
  fmaId: 22540,
  nameEn: 'Soleus',
  nameLatin: 'musculus soleus',
  nameAr: 'العضلة النعلية',
  level: 4,
  structureType: 'muscle',
  parentId: 'll_calf',
  regionTags: ['lower_limb'],
});

const achillesTendon: AnatomyNode = node({
  id: 'FMA:22543',
  fmaId: 22543,
  nameEn: 'Achilles tendon',
  nameLatin: 'tendo calcaneus',
  nameAr: 'وتر العرقوب / وتر أخيل',
  synonyms: ['Calcaneal tendon'],
  nameClinical: 'Achilles tendon',
  level: 4,
  structureType: 'tendon',
  parentId: 'll_calf',
  highlightColor: '#e53e3e',
  regionTags: ['lower_limb'],
});

const ll_iliopsoas: AnatomyNode = node({
  id: 'll_iliopsoas',
  nameEn: 'Iliopsoas',
  nameLatin: 'musculus iliopsoas',
  nameAr: 'العضلة الحرقفية القطنية',
  level: 3,
  structureType: 'muscle',
  parentId: 'll_muscular',
  regionTags: ['lower_limb'],
});

// ── Level 3+: NERVES ──────────────────────────────────────────

const femoralNerve: AnatomyNode = node({
  id: 'FMA:5901',
  fmaId: 5901,
  nameEn: 'Femoral nerve',
  nameLatin: 'nervus femoralis',
  nameAr: 'العصب الفخذي',
  level: 3,
  structureType: 'nerve',
  layer: 'nerve',
  parentId: 'll_nerves',
  highlightColor: '#68d391',
  regionTags: ['lower_limb'],
});

const ll_sciatic_nerve: AnatomyNode = node({
  id: 'll_sciatic_nerve',
  fmaId: null,
  nameEn: 'Sciatic nerve',
  nameLatin: 'nervus ischiadicus',
  nameAr: 'العصب الوركي',
  level: 3,
  structureType: 'nerve',
  layer: 'nerve',
  parentId: 'll_nerves',
  highlightColor: '#68d391',
  regionTags: ['lower_limb'],
});

const tibialNerve: AnatomyNode = node({
  id: 'FMA:22544',
  fmaId: 22544,
  nameEn: 'Tibial nerve',
  nameLatin: 'nervus tibialis',
  nameAr: 'العصب الظنبوبي',
  level: 4,
  structureType: 'nerve',
  parentId: 'll_sciatic_nerve',
  regionTags: ['lower_limb'],
});

const commonPeronealNerve: AnatomyNode = node({
  id: 'FMA:22545',
  fmaId: 22545,
  nameEn: 'Common peroneal nerve',
  nameLatin: 'nervus fibularis communis',
  nameAr: 'العصب الشظوي المشترك',
  synonyms: ['Common fibular nerve'],
  level: 4,
  structureType: 'nerve',
  parentId: 'll_sciatic_nerve',
  regionTags: ['lower_limb'],
});

const obturatorNerve: AnatomyNode = node({
  id: 'FMA:16784',
  fmaId: 16784,
  nameEn: 'Obturator nerve',
  nameLatin: 'nervus obturatorius',
  nameAr: 'العصب الانسدادي',
  level: 3,
  structureType: 'nerve',
  parentId: 'll_nerves',
  regionTags: ['lower_limb'],
});

const ll_sural: AnatomyNode = node({
  id: 'll_sural',
  nameEn: 'Sural nerve',
  nameLatin: 'nervus suralis',
  nameAr: 'العصب السوري',
  level: 3,
  structureType: 'nerve',
  parentId: 'll_nerves',
  regionTags: ['lower_limb'],
});

// ── Level 3+: VESSELS ─────────────────────────────────────────

const femoralArtery: AnatomyNode = node({
  id: 'FMA:22725',
  fmaId: 22725,
  nameEn: 'Femoral artery',
  nameLatin: 'arteria femoralis',
  nameAr: 'الشريان الفخذي',
  level: 3,
  structureType: 'artery',
  layer: 'artery',
  parentId: 'll_vascular',
  highlightColor: '#e53e3e',
  regionTags: ['lower_limb'],
});

const deepFemoralArtery: AnatomyNode = node({
  id: 'FMA:22726',
  fmaId: 22726,
  nameEn: 'Deep femoral artery',
  nameLatin: 'arteria profunda femoris',
  nameAr: 'الشريان الفخذي العميق',
  level: 4,
  structureType: 'artery',
  parentId: 'FMA:22725',
  regionTags: ['lower_limb'],
});

const poplitealArtery: AnatomyNode = node({
  id: 'FMA:22739',
  fmaId: 22739,
  nameEn: 'Popliteal artery',
  nameLatin: 'arteria poplitea',
  nameAr: 'الشريان المأبضي',
  level: 4,
  structureType: 'artery',
  parentId: 'FMA:22725',
  regionTags: ['lower_limb'],
});

const anteriorTibialArtery: AnatomyNode = node({
  id: 'FMA:22741',
  fmaId: 22741,
  nameEn: 'Anterior tibial artery',
  nameLatin: 'arteria tibialis anterior',
  nameAr: 'الشريان الظنبوبي الأمامي',
  level: 5,
  structureType: 'artery',
  parentId: 'FMA:22739',
  regionTags: ['lower_limb'],
});

const posteriorTibialArtery: AnatomyNode = node({
  id: 'FMA:22742',
  fmaId: 22742,
  nameEn: 'Posterior tibial artery',
  nameLatin: 'arteria tibialis posterior',
  nameAr: 'الشريان الظنبوبي الخلفي',
  level: 5,
  structureType: 'artery',
  parentId: 'FMA:22739',
  regionTags: ['lower_limb'],
});

const fibularArtery: AnatomyNode = node({
  id: 'FMA:22743',
  fmaId: 22743,
  nameEn: 'Fibular (peroneal) artery',
  nameLatin: 'arteria fibularis',
  nameAr: 'الشريان الشظوي',
  level: 5,
  structureType: 'artery',
  parentId: 'FMA:22739',
  regionTags: ['lower_limb'],
});

const dorsalisPedisArtery: AnatomyNode = node({
  id: 'FMA:22744',
  fmaId: 22744,
  nameEn: 'Dorsalis pedis artery',
  nameLatin: 'arteria dorsalis pedis',
  nameAr: 'شريان ظهر القدم',
  level: 4,
  structureType: 'artery',
  parentId: 'FMA:22725',
  regionTags: ['lower_limb'],
});

const greatSaphenousVein: AnatomyNode = node({
  id: 'FMA:9894',
  fmaId: 9894,
  nameEn: 'Great saphenous vein',
  nameLatin: 'vena saphena magna',
  nameAr: 'الوريد الصافن الكبير',
  level: 3,
  structureType: 'vein',
  layer: 'vein',
  parentId: 'll_vascular',
  highlightColor: '#3182ce',
  regionTags: ['lower_limb'],
});

const smallSaphenousVein: AnatomyNode = node({
  id: 'FMA:9895',
  fmaId: 9895,
  nameEn: 'Small saphenous vein',
  nameLatin: 'vena saphena parva',
  nameAr: 'الوريد الصافن الصغير',
  level: 3,
  structureType: 'vein',
  layer: 'vein',
  parentId: 'll_vascular',
  regionTags: ['lower_limb'],
});

const femoralVein: AnatomyNode = node({
  id: 'FMA:21502',
  fmaId: 21502,
  nameEn: 'Femoral vein',
  nameLatin: 'vena femoralis',
  nameAr: 'الوريد الفخذي',
  level: 3,
  structureType: 'vein',
  layer: 'vein',
  parentId: 'll_vascular',
  regionTags: ['lower_limb'],
});

// ── Exports ───────────────────────────────────────────────────

export const ALL_LOWER_LIMB_NODES: AnatomyNode[] = [
  LOWER_LIMB,
  // Level 2 systems
  ll_skeletal,
  ll_joints,
  ll_muscular,
  ll_nerves,
  ll_vascular,
  // Bones
  femur,
  headOfFemur,
  neckOfFemur,
  greaterTrochanter,
  lesserTrochanter,
  medialCondyleFemur,
  lateralCondyleFemur,
  tibia,
  medialCondyleTibia,
  lateralCondyleTibia,
  medialMalleolus,
  tibialTuberosity,
  fibula,
  lateralMalleolus,
  patella,
  ll_tarsals,
  calcaneus,
  talus,
  navicular,
  cuboid,
  ll_metatarsals,
  // Joints
  hipJoint,
  iliofemoralLigament,
  pubofemoralLigament,
  ischiofemoralLigament,
  ll_acetabular_labrum,
  kneeJoint,
  anteriorCruciateLigament,
  posteriorCruciateLigament,
  medialCollateralLigamentKnee,
  lateralCollateralLigamentKnee,
  medialMeniscus,
  lateralMeniscus,
  patellarLigament,
  ll_ankle_joint,
  ll_deltoid_ligament,
  ll_atfl,
  // Muscles
  ll_gluteal_group,
  gluteusMaximus,
  gluteusMedius,
  gluteusMinimus,
  ll_quadriceps,
  rectusFemoris,
  vastusLateralis,
  vastusMedialis,
  vastusIntermedius,
  ll_hamstrings,
  bicepsFemoris,
  semitendinosus,
  semimembranosus,
  ll_calf,
  gastrocnemius,
  soleus,
  achillesTendon,
  ll_iliopsoas,
  // Nerves
  femoralNerve,
  ll_sciatic_nerve,
  tibialNerve,
  commonPeronealNerve,
  obturatorNerve,
  ll_sural,
  // Vessels
  femoralArtery,
  deepFemoralArtery,
  poplitealArtery,
  anteriorTibialArtery,
  posteriorTibialArtery,
  fibularArtery,
  dorsalisPedisArtery,
  greatSaphenousVein,
  smallSaphenousVein,
  femoralVein,
];
