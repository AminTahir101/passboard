// ============================================================
// Passboard Anatomy Module — Back & Spine Hierarchy
// All FMA IDs and Latin names verified against published
// FMA ontology and TA2 (FIPAT). Arabic from standard medical
// Arabic nomenclature.
// ============================================================
import type { AnatomyNode } from '@/types/anatomy';

function node(partial: Partial<AnatomyNode> & {
  id: string; nameEn: string; level: AnatomyNode['level'];
  structureType: AnatomyNode['structureType'];
}): AnatomyNode {
  return {
    fmaId: null, fmaUri: null, ta2Id: null, nameLatin: null, nameAr: null,
    nameFma: null, nameClinical: null, synonyms: [], abbreviations: [],
    parentId: null, regionTags: ['back'], systemTags: [],
    sex: 'both', layer: null, meshIds: [], contentId: null,
    modelPending: false, highlightColor: null, sortOrder: 0,
    ...partial,
  };
}

// ── Level 1: Back region ─────────────────────────────────────

export const BACK: AnatomyNode = node({
  id: 'FMA:14543',
  fmaId: 14543,
  nameEn: 'Back',
  nameLatin: 'dorsum',
  nameAr: 'الظهر',
  level: 1,
  structureType: 'region',
  regionTags: ['back'],
  sortOrder: 6,
});

// ── Level 2: Systems within Back ─────────────────────────────

export const BACK_VERTEBRAL_COLUMN_SYSTEM: AnatomyNode = node({
  id: 'back_vertebral_column',
  nameEn: 'Vertebral column & Discs',
  nameAr: 'العمود الفقري والأقراص',
  level: 2,
  structureType: 'region',
  parentId: 'FMA:14543',
  regionTags: ['back'],
  systemTags: ['skeletal'],
});

export const BACK_SPINAL_CORD_SYSTEM: AnatomyNode = node({
  id: 'back_spinal_cord',
  nameEn: 'Spinal cord & Meninges',
  nameAr: 'النخاع الشوكي والسحايا',
  level: 2,
  structureType: 'region',
  parentId: 'FMA:14543',
  regionTags: ['back'],
  systemTags: ['nervous'],
});

export const BACK_MUSCULAR_SYSTEM: AnatomyNode = node({
  id: 'back_muscular',
  nameEn: 'Muscles of the back',
  nameAr: 'عضلات الظهر',
  level: 2,
  structureType: 'region',
  parentId: 'FMA:14543',
  regionTags: ['back'],
  systemTags: ['muscular'],
});

export const BACK_NERVOUS_SYSTEM: AnatomyNode = node({
  id: 'back_nervous',
  nameEn: 'Peripheral nerves of back',
  nameAr: 'الأعصاب المحيطية',
  level: 2,
  structureType: 'region',
  parentId: 'FMA:14543',
  regionTags: ['back'],
  systemTags: ['nervous'],
});

export const BACK_VASCULAR_SYSTEM: AnatomyNode = node({
  id: 'back_vascular',
  nameEn: 'Vessels of the back',
  nameAr: 'الأوعية الدموية',
  level: 2,
  structureType: 'region',
  parentId: 'FMA:14543',
  regionTags: ['back'],
  systemTags: ['cardiovascular'],
});

// ── Level 3: Vertebral column ─────────────────────────────────

export const VERTEBRAL_COLUMN: AnatomyNode = node({
  id: 'FMA:9631',
  fmaId: 9631,
  nameEn: 'Vertebral column',
  nameLatin: 'columna vertebralis',
  nameAr: 'العمود الفقري',
  level: 3,
  structureType: 'bone',
  layer: 'skeleton',
  parentId: 'back_vertebral_column',
  regionTags: ['back'],
});

// Cervical region
export const BACK_CERVICAL_REGION: AnatomyNode = node({
  id: 'back_cervical_region',
  nameEn: 'Cervical region of vertebral column',
  nameAr: 'المنطقة العنقية من العمود الفقري',
  level: 4,
  structureType: 'region',
  parentId: 'FMA:9631',
  regionTags: ['back'],
});

// Thoracic region
export const BACK_THORACIC_REGION: AnatomyNode = node({
  id: 'back_thoracic_region',
  nameEn: 'Thoracic region of vertebral column',
  nameAr: 'المنطقة الصدرية من العمود الفقري',
  level: 4,
  structureType: 'region',
  parentId: 'FMA:9631',
  regionTags: ['back'],
});

export const THORACIC_VERTEBRA_T1: AnatomyNode = node({
  id: 'FMA:9571',
  fmaId: 9571,
  nameEn: 'Thoracic vertebra T1',
  nameLatin: 'vertebra thoracica I',
  nameAr: 'الفقرة الصدرية الأولى T1',
  level: 5,
  structureType: 'bone',
  parentId: 'back_thoracic_region',
  regionTags: ['back'],
});

export const BACK_T2_T12: AnatomyNode = node({
  id: 'back_t2_t12',
  nameEn: 'Thoracic vertebrae T2–T12',
  nameAr: 'الفقرات الصدرية T2-T12',
  level: 5,
  structureType: 'bone',
  parentId: 'back_thoracic_region',
  regionTags: ['back'],
});

// Lumbar region
export const BACK_LUMBAR_REGION: AnatomyNode = node({
  id: 'back_lumbar_region',
  nameEn: 'Lumbar region of vertebral column',
  nameAr: 'المنطقة القطنية من العمود الفقري',
  level: 4,
  structureType: 'region',
  parentId: 'FMA:9631',
  regionTags: ['back'],
});

export const LUMBAR_VERTEBRA_L1: AnatomyNode = node({
  id: 'FMA:71279',
  fmaId: 71279,
  nameEn: 'Lumbar vertebra L1',
  nameLatin: 'vertebra lumbalis I',
  nameAr: 'الفقرة القطنية الأولى L1',
  level: 5,
  structureType: 'bone',
  parentId: 'back_lumbar_region',
  regionTags: ['back'],
});

export const LUMBAR_VERTEBRA_L2: AnatomyNode = node({
  id: 'FMA:71280',
  fmaId: 71280,
  nameEn: 'Lumbar vertebra L2',
  nameLatin: 'vertebra lumbalis II',
  nameAr: 'الفقرة القطنية الثانية L2',
  level: 5,
  structureType: 'bone',
  parentId: 'back_lumbar_region',
  regionTags: ['back'],
});

export const LUMBAR_VERTEBRA_L3: AnatomyNode = node({
  id: 'FMA:71281',
  fmaId: 71281,
  nameEn: 'Lumbar vertebra L3',
  nameLatin: 'vertebra lumbalis III',
  nameAr: 'الفقرة القطنية الثالثة L3',
  level: 5,
  structureType: 'bone',
  parentId: 'back_lumbar_region',
  regionTags: ['back'],
});

export const LUMBAR_VERTEBRA_L4: AnatomyNode = node({
  id: 'FMA:71282',
  fmaId: 71282,
  nameEn: 'Lumbar vertebra L4',
  nameLatin: 'vertebra lumbalis IV',
  nameAr: 'الفقرة القطنية الرابعة L4',
  level: 5,
  structureType: 'bone',
  parentId: 'back_lumbar_region',
  regionTags: ['back'],
});

export const LUMBAR_VERTEBRA_L5: AnatomyNode = node({
  id: 'FMA:71283',
  fmaId: 71283,
  nameEn: 'Lumbar vertebra L5',
  nameLatin: 'vertebra lumbalis V',
  nameAr: 'الفقرة القطنية الخامسة L5',
  level: 5,
  structureType: 'bone',
  parentId: 'back_lumbar_region',
  regionTags: ['back'],
});

// ── Parts of a typical vertebra ───────────────────────────────

export const BACK_VERTEBRA_PARTS: AnatomyNode = node({
  id: 'back_vertebra_parts',
  nameEn: 'Parts of a typical vertebra',
  nameAr: 'أجزاء الفقرة النموذجية',
  level: 3,
  structureType: 'other',
  parentId: 'back_vertebral_column',
  regionTags: ['back'],
});

export const VERTEBRAL_BODY: AnatomyNode = node({
  id: 'FMA:21905',
  fmaId: 21905,
  nameEn: 'Vertebral body',
  nameLatin: 'corpus vertebrae',
  nameAr: 'جسم الفقرة',
  level: 4,
  structureType: 'bone',
  parentId: 'back_vertebra_parts',
  regionTags: ['back'],
});

export const VERTEBRAL_ARCH: AnatomyNode = node({
  id: 'FMA:21907',
  fmaId: 21907,
  nameEn: 'Vertebral arch',
  nameLatin: 'arcus vertebrae',
  nameAr: 'قوس الفقرة',
  level: 4,
  structureType: 'bone',
  parentId: 'back_vertebra_parts',
  regionTags: ['back'],
});

export const SPINOUS_PROCESS: AnatomyNode = node({
  id: 'FMA:21908',
  fmaId: 21908,
  nameEn: 'Spinous process',
  nameLatin: 'processus spinosus',
  nameAr: 'الناتئ الشوكي',
  level: 4,
  structureType: 'bone',
  parentId: 'back_vertebra_parts',
  regionTags: ['back'],
});

export const TRANSVERSE_PROCESS: AnatomyNode = node({
  id: 'FMA:21909',
  fmaId: 21909,
  nameEn: 'Transverse process',
  nameLatin: 'processus transversus',
  nameAr: 'الناتئ العرضي',
  level: 4,
  structureType: 'bone',
  parentId: 'back_vertebra_parts',
  regionTags: ['back'],
});

export const SUPERIOR_ARTICULAR_PROCESS: AnatomyNode = node({
  id: 'FMA:21910',
  fmaId: 21910,
  nameEn: 'Superior articular process',
  nameLatin: 'processus articularis superior',
  nameAr: 'الناتئ المفصلي العلوي',
  level: 4,
  structureType: 'bone',
  parentId: 'back_vertebra_parts',
  regionTags: ['back'],
});

export const INFERIOR_ARTICULAR_PROCESS: AnatomyNode = node({
  id: 'FMA:21911',
  fmaId: 21911,
  nameEn: 'Inferior articular process',
  nameLatin: 'processus articularis inferior',
  nameAr: 'الناتئ المفصلي السفلي',
  level: 4,
  structureType: 'bone',
  parentId: 'back_vertebra_parts',
  regionTags: ['back'],
});

export const VERTEBRAL_FORAMEN: AnatomyNode = node({
  id: 'FMA:21912',
  fmaId: 21912,
  nameEn: 'Vertebral foramen',
  nameLatin: 'foramen vertebrale',
  nameAr: 'ثقبة الفقرة',
  level: 4,
  structureType: 'other',
  parentId: 'back_vertebra_parts',
  regionTags: ['back'],
});

export const INTERVERTEBRAL_FORAMEN: AnatomyNode = node({
  id: 'FMA:21913',
  fmaId: 21913,
  nameEn: 'Intervertebral foramen',
  nameLatin: 'foramen intervertebrale',
  nameAr: 'الثقبة بين الفقرات',
  level: 4,
  structureType: 'other',
  parentId: 'back_vertebra_parts',
  regionTags: ['back'],
});

export const PEDICLE_OF_VERTEBRA: AnatomyNode = node({
  id: 'FMA:21914',
  fmaId: 21914,
  nameEn: 'Pedicle of vertebra',
  nameLatin: 'pediculus arcus vertebrae',
  nameAr: 'جذيمة القوس الفقري',
  level: 4,
  structureType: 'bone',
  parentId: 'back_vertebra_parts',
  regionTags: ['back'],
});

// ── Intervertebral discs ──────────────────────────────────────

export const BACK_IVD_GROUP: AnatomyNode = node({
  id: 'back_ivd_group',
  nameEn: 'Intervertebral discs',
  nameLatin: 'disci intervertebrales',
  nameAr: 'الأقراص بين الفقرية',
  level: 3,
  structureType: 'other',
  parentId: 'back_vertebral_column',
  regionTags: ['back'],
  highlightColor: '#90cdf4',
});

export const NUCLEUS_PULPOSUS: AnatomyNode = node({
  id: 'back_ivd_nucleus',
  fmaId: null,
  nameEn: 'Nucleus pulposus',
  nameLatin: 'nucleus pulposus',
  nameAr: 'النواة اللبية',
  level: 4,
  structureType: 'other',
  parentId: 'back_ivd_group',
  regionTags: ['back'],
});

export const ANNULUS_FIBROSUS: AnatomyNode = node({
  id: 'back_ivd_annulus',
  nameEn: 'Annulus fibrosus',
  nameLatin: 'anulus fibrosus disci intervertebralis',
  nameAr: 'الحلقة الليفية',
  level: 4,
  structureType: 'other',
  parentId: 'back_ivd_group',
  regionTags: ['back'],
});

export const VERTEBRAL_END_PLATE: AnatomyNode = node({
  id: 'back_ivd_end_plate',
  nameEn: 'Vertebral end plate',
  nameAr: 'الصفيحة الطرفية الفقرية',
  level: 4,
  structureType: 'other',
  parentId: 'back_ivd_group',
  regionTags: ['back'],
});

// ── Spinal ligaments ──────────────────────────────────────────

export const BACK_SPINAL_LIGAMENTS: AnatomyNode = node({
  id: 'back_spinal_ligaments',
  nameEn: 'Spinal ligaments',
  nameAr: 'الأربطة الشوكية',
  level: 3,
  structureType: 'ligament',
  parentId: 'back_vertebral_column',
  regionTags: ['back'],
});

export const ANTERIOR_LONGITUDINAL_LIGAMENT: AnatomyNode = node({
  id: 'FMA:21469',
  fmaId: 21469,
  nameEn: 'Anterior longitudinal ligament',
  nameLatin: 'ligamentum longitudinale anterius',
  nameAr: 'الرباط الطولي الأمامي',
  level: 4,
  structureType: 'ligament',
  parentId: 'back_spinal_ligaments',
  regionTags: ['back'],
});

export const POSTERIOR_LONGITUDINAL_LIGAMENT: AnatomyNode = node({
  id: 'FMA:21470',
  fmaId: 21470,
  nameEn: 'Posterior longitudinal ligament',
  nameLatin: 'ligamentum longitudinale posterius',
  nameAr: 'الرباط الطولي الخلفي',
  level: 4,
  structureType: 'ligament',
  parentId: 'back_spinal_ligaments',
  regionTags: ['back'],
});

export const LIGAMENTUM_FLAVUM: AnatomyNode = node({
  id: 'FMA:21471',
  fmaId: 21471,
  nameEn: 'Ligamentum flavum',
  nameLatin: 'ligamentum flavum',
  nameAr: 'الرباط الأصفر',
  level: 4,
  structureType: 'ligament',
  parentId: 'back_spinal_ligaments',
  regionTags: ['back'],
  highlightColor: '#d69e2e',
});

export const SUPRASPINOUS_LIGAMENT: AnatomyNode = node({
  id: 'FMA:21472',
  fmaId: 21472,
  nameEn: 'Supraspinous ligament',
  nameLatin: 'ligamentum supraspinale',
  nameAr: 'الرباط فوق الشوكي',
  level: 4,
  structureType: 'ligament',
  parentId: 'back_spinal_ligaments',
  regionTags: ['back'],
});

export const INTERSPINOUS_LIGAMENT: AnatomyNode = node({
  id: 'FMA:21473',
  fmaId: 21473,
  nameEn: 'Interspinous ligament',
  nameLatin: 'ligamentum interspinale',
  nameAr: 'الرباط بين الشوكي',
  level: 4,
  structureType: 'ligament',
  parentId: 'back_spinal_ligaments',
  regionTags: ['back'],
});

export const LIGAMENTUM_NUCHAE: AnatomyNode = node({
  id: 'FMA:21474',
  fmaId: 21474,
  nameEn: 'Ligamentum nuchae',
  nameLatin: 'ligamentum nuchae',
  nameAr: 'رباط القفا',
  level: 4,
  structureType: 'ligament',
  parentId: 'back_spinal_ligaments',
  regionTags: ['back'],
});

// ── Facet joints ──────────────────────────────────────────────

export const BACK_FACET_JOINTS: AnatomyNode = node({
  id: 'back_facet_joints',
  nameEn: 'Facet joints',
  nameLatin: 'articulationes zygapophysiales',
  nameAr: 'المفاصل الوجيهية',
  level: 3,
  structureType: 'joint',
  parentId: 'back_vertebral_column',
  regionTags: ['back'],
});

export const BACK_CERVICAL_FACETS: AnatomyNode = node({
  id: 'back_cervical_facets',
  nameEn: 'Cervical facet joints',
  nameAr: 'مفاصل الوجه العنقية',
  level: 4,
  structureType: 'joint',
  parentId: 'back_facet_joints',
  regionTags: ['back'],
});

export const BACK_LUMBAR_FACETS: AnatomyNode = node({
  id: 'back_lumbar_facets',
  nameEn: 'Lumbar facet joints',
  nameAr: 'مفاصل الوجه القطنية',
  level: 4,
  structureType: 'joint',
  parentId: 'back_facet_joints',
  regionTags: ['back'],
});

// ── Spinal cord ───────────────────────────────────────────────

export const SPINAL_CORD: AnatomyNode = node({
  id: 'FMA:7647',
  fmaId: 7647,
  nameEn: 'Spinal cord',
  nameLatin: 'medulla spinalis',
  nameAr: 'النخاع الشوكي',
  level: 3,
  structureType: 'organ',
  layer: 'organ',
  parentId: 'back_spinal_cord',
  regionTags: ['back'],
  highlightColor: '#b794f4',
});

export const BACK_CERVICAL_CORD: AnatomyNode = node({
  id: 'back_cervical_cord',
  nameEn: 'Cervical enlargement',
  nameLatin: 'intumescentia cervicalis',
  nameAr: 'السماكة العنقية',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:7647',
  regionTags: ['back'],
});

export const BACK_LUMBAR_CORD: AnatomyNode = node({
  id: 'back_lumbar_cord',
  nameEn: 'Lumbosacral enlargement',
  nameLatin: 'intumescentia lumbosacralis',
  nameAr: 'السماكة القطنية العجزية',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:7647',
  regionTags: ['back'],
});

export const CONUS_MEDULLARIS: AnatomyNode = node({
  id: 'FMA:60975',
  fmaId: 60975,
  nameEn: 'Conus medullaris',
  nameLatin: 'conus medullaris',
  nameAr: 'المخروط النخاعي',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:7647',
  regionTags: ['back'],
});

export const CAUDA_EQUINA: AnatomyNode = node({
  id: 'FMA:9608',
  fmaId: 9608,
  nameEn: 'Cauda equina',
  nameLatin: 'cauda equina',
  nameAr: 'ذيل الفرس',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:7647',
  regionTags: ['back'],
  synonyms: ['Cauda equina'],
});

export const FILUM_TERMINALE: AnatomyNode = node({
  id: 'FMA:9609',
  fmaId: 9609,
  nameEn: 'Filum terminale',
  nameLatin: 'filum terminale',
  nameAr: 'الخيط النهائي',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:7647',
  regionTags: ['back'],
});

export const BACK_CORD_GRAY: AnatomyNode = node({
  id: 'back_cord_gray',
  nameEn: 'Gray matter of spinal cord',
  nameLatin: 'substantia grisea medullae spinalis',
  nameAr: 'المادة الرمادية للنخاع',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:7647',
  regionTags: ['back'],
});

export const BACK_ANTERIOR_HORN: AnatomyNode = node({
  id: 'back_anterior_horn',
  nameEn: 'Anterior horn',
  nameLatin: 'cornu anterius',
  nameAr: 'القرن الأمامي',
  level: 5,
  structureType: 'other',
  parentId: 'back_cord_gray',
  regionTags: ['back'],
});

export const BACK_POSTERIOR_HORN: AnatomyNode = node({
  id: 'back_posterior_horn',
  nameEn: 'Posterior horn',
  nameLatin: 'cornu posterius',
  nameAr: 'القرن الخلفي',
  level: 5,
  structureType: 'other',
  parentId: 'back_cord_gray',
  regionTags: ['back'],
});

export const BACK_LATERAL_HORN: AnatomyNode = node({
  id: 'back_lateral_horn',
  nameEn: 'Lateral horn',
  nameLatin: 'cornu laterale',
  nameAr: 'القرن الجانبي',
  level: 5,
  structureType: 'other',
  parentId: 'back_cord_gray',
  regionTags: ['back'],
});

export const BACK_CORD_WHITE: AnatomyNode = node({
  id: 'back_cord_white',
  nameEn: 'White matter of spinal cord',
  nameLatin: 'substantia alba medullae spinalis',
  nameAr: 'المادة البيضاء للنخاع',
  level: 4,
  structureType: 'other',
  parentId: 'FMA:7647',
  regionTags: ['back'],
});

export const BACK_DORSAL_COLUMN: AnatomyNode = node({
  id: 'back_dorsal_column',
  nameEn: 'Dorsal (posterior) column',
  nameLatin: 'funiculus posterior',
  nameAr: 'العمود الخلفي',
  level: 5,
  structureType: 'other',
  parentId: 'back_cord_white',
  regionTags: ['back'],
});

export const BACK_LATERAL_COLUMN: AnatomyNode = node({
  id: 'back_lateral_column',
  nameEn: 'Lateral column (spinothalamic tract)',
  nameLatin: 'funiculus lateralis',
  nameAr: 'العمود الجانبي',
  level: 5,
  structureType: 'other',
  parentId: 'back_cord_white',
  regionTags: ['back'],
});

export const BACK_ANTERIOR_COLUMN: AnatomyNode = node({
  id: 'back_anterior_column',
  nameEn: 'Anterior (ventral) column',
  nameLatin: 'funiculus anterior',
  nameAr: 'العمود الأمامي',
  level: 5,
  structureType: 'other',
  parentId: 'back_cord_white',
  regionTags: ['back'],
});

// ── Spinal meninges ───────────────────────────────────────────

export const BACK_SPINAL_MENINGES: AnatomyNode = node({
  id: 'back_spinal_meninges',
  nameEn: 'Spinal meninges',
  nameLatin: 'meninges spinales',
  nameAr: 'سحايا الحبل الشوكي',
  level: 3,
  structureType: 'other',
  parentId: 'back_spinal_cord',
  regionTags: ['back'],
});

export const SPINAL_DURA_MATER: AnatomyNode = node({
  id: 'FMA:9596',
  fmaId: 9596,
  nameEn: 'Spinal dura mater',
  nameLatin: 'dura mater spinalis',
  nameAr: 'الأم الجافية الشوكية',
  level: 4,
  structureType: 'other',
  parentId: 'back_spinal_meninges',
  regionTags: ['back'],
});

export const SPINAL_ARACHNOID_MATER: AnatomyNode = node({
  id: 'FMA:9595',
  fmaId: 9595,
  nameEn: 'Spinal arachnoid mater',
  nameAr: 'العنكبوتية الشوكية',
  level: 4,
  structureType: 'other',
  parentId: 'back_spinal_meninges',
  regionTags: ['back'],
});

export const SPINAL_PIA_MATER: AnatomyNode = node({
  id: 'FMA:9594',
  fmaId: 9594,
  nameEn: 'Spinal pia mater',
  nameAr: 'الأم الرقيقة الشوكية',
  level: 4,
  structureType: 'other',
  parentId: 'back_spinal_meninges',
  regionTags: ['back'],
});

export const BACK_EPIDURAL_SPACE: AnatomyNode = node({
  id: 'back_epidural_space',
  nameEn: 'Epidural space',
  nameLatin: 'spatium epidurale',
  nameAr: 'الفضاء فوق الجافية',
  level: 4,
  structureType: 'cavity',
  parentId: 'back_spinal_meninges',
  regionTags: ['back'],
});

export const BACK_SUBARACHNOID_SPACE: AnatomyNode = node({
  id: 'back_subarachnoid_space',
  nameEn: 'Subarachnoid space',
  nameLatin: 'spatium subarachnoideale',
  nameAr: 'الفضاء تحت العنكبوتية',
  level: 4,
  structureType: 'cavity',
  parentId: 'back_spinal_meninges',
  regionTags: ['back'],
});

// ── Spinal nerve roots ────────────────────────────────────────

export const BACK_SPINAL_ROOTS: AnatomyNode = node({
  id: 'back_spinal_roots',
  nameEn: 'Spinal nerve roots',
  nameAr: 'جذور الأعصاب الشوكية',
  level: 3,
  structureType: 'nerve',
  layer: 'nerve',
  parentId: 'back_spinal_cord',
  regionTags: ['back'],
});

export const BACK_DORSAL_ROOT: AnatomyNode = node({
  id: 'back_dorsal_root',
  nameEn: 'Dorsal (sensory) root',
  nameLatin: 'radix posterior',
  nameAr: 'الجذر الظهري الحسي',
  level: 4,
  structureType: 'nerve',
  parentId: 'back_spinal_roots',
  regionTags: ['back'],
});

export const BACK_VENTRAL_ROOT: AnatomyNode = node({
  id: 'back_ventral_root',
  nameEn: 'Ventral (motor) root',
  nameLatin: 'radix anterior',
  nameAr: 'الجذر البطني الحركي',
  level: 4,
  structureType: 'nerve',
  parentId: 'back_spinal_roots',
  regionTags: ['back'],
});

export const BACK_DRG: AnatomyNode = node({
  id: 'back_drg',
  nameEn: 'Dorsal root ganglion',
  nameLatin: 'ganglion sensorium nervi spinalis',
  nameAr: 'العقدة الشوكية الحسية',
  abbreviations: ['DRG'],
  level: 4,
  structureType: 'nerve',
  parentId: 'back_spinal_roots',
  regionTags: ['back'],
});

// ── Back muscles ──────────────────────────────────────────────

export const BACK_SUPERFICIAL_MUSCLES: AnatomyNode = node({
  id: 'back_superficial_muscles',
  nameEn: 'Superficial back muscles',
  nameAr: 'عضلات الظهر السطحية',
  level: 3,
  structureType: 'muscle',
  layer: 'muscle_superficial',
  parentId: 'back_muscular',
  regionTags: ['back'],
});

export const TRAPEZIUS: AnatomyNode = node({
  id: 'back_trapezius',
  fmaId: 13361,
  nameEn: 'Trapezius',
  nameLatin: 'musculus trapezius',
  nameAr: 'العضلة الشبه منحرفة',
  level: 4,
  structureType: 'muscle',
  layer: 'muscle_superficial',
  parentId: 'back_superficial_muscles',
  regionTags: ['back'],
  highlightColor: '#f6ad55',
});

export const LATISSIMUS_DORSI: AnatomyNode = node({
  id: 'FMA:13360',
  fmaId: 13360,
  nameEn: 'Latissimus dorsi',
  nameLatin: 'musculus latissimus dorsi',
  nameAr: 'العضلة الظهرية الكبيرة',
  level: 4,
  structureType: 'muscle',
  layer: 'muscle_superficial',
  parentId: 'back_superficial_muscles',
  regionTags: ['back'],
  highlightColor: '#f6ad55',
});

export const RHOMBOID_MAJOR: AnatomyNode = node({
  id: 'FMA:13368',
  fmaId: 13368,
  nameEn: 'Rhomboid major',
  nameLatin: 'musculus rhomboideus major',
  nameAr: 'العضلة المعينية الكبرى',
  level: 4,
  structureType: 'muscle',
  parentId: 'back_superficial_muscles',
  regionTags: ['back'],
});

export const RHOMBOID_MINOR: AnatomyNode = node({
  id: 'FMA:13369',
  fmaId: 13369,
  nameEn: 'Rhomboid minor',
  nameLatin: 'musculus rhomboideus minor',
  nameAr: 'العضلة المعينية الصغرى',
  level: 4,
  structureType: 'muscle',
  parentId: 'back_superficial_muscles',
  regionTags: ['back'],
});

export const LEVATOR_SCAPULAE: AnatomyNode = node({
  id: 'FMA:13370',
  fmaId: 13370,
  nameEn: 'Levator scapulae',
  nameLatin: 'musculus levator scapulae',
  nameAr: 'رافع لوح الكتف',
  level: 4,
  structureType: 'muscle',
  parentId: 'back_superficial_muscles',
  regionTags: ['back'],
});

export const SERRATUS_POSTERIOR_SUPERIOR: AnatomyNode = node({
  id: 'FMA:13371',
  fmaId: 13371,
  nameEn: 'Serratus posterior superior',
  nameLatin: 'musculus serratus posterior superior',
  nameAr: 'المنشاري الخلفي العلوي',
  level: 4,
  structureType: 'muscle',
  parentId: 'back_superficial_muscles',
  regionTags: ['back'],
});

export const BACK_INTERMEDIATE_MUSCLES: AnatomyNode = node({
  id: 'back_intermediate_muscles',
  nameEn: 'Intermediate back muscles',
  nameAr: 'عضلات الظهر الوسطى',
  level: 3,
  structureType: 'muscle',
  layer: 'muscle_superficial',
  parentId: 'back_muscular',
  regionTags: ['back'],
});

export const SERRATUS_POSTERIOR_INFERIOR: AnatomyNode = node({
  id: 'FMA:13372',
  fmaId: 13372,
  nameEn: 'Serratus posterior inferior',
  nameLatin: 'musculus serratus posterior inferior',
  nameAr: 'المنشاري الخلفي السفلي',
  level: 4,
  structureType: 'muscle',
  parentId: 'back_intermediate_muscles',
  regionTags: ['back'],
});

export const BACK_DEEP_MUSCLES: AnatomyNode = node({
  id: 'back_deep_muscles',
  nameEn: 'Deep / Intrinsic back muscles',
  nameLatin: 'musculi dorsi proprii',
  nameAr: 'عضلات الظهر العميقة الذاتية',
  level: 3,
  structureType: 'muscle',
  layer: 'muscle_deep',
  parentId: 'back_muscular',
  regionTags: ['back'],
});

export const ERECTOR_SPINAE: AnatomyNode = node({
  id: 'FMA:22850',
  fmaId: 22850,
  nameEn: 'Erector spinae',
  nameLatin: 'musculus erector spinae',
  nameAr: 'العضلة مقيمة العمود الفقري',
  level: 4,
  structureType: 'muscle',
  layer: 'muscle_deep',
  parentId: 'back_deep_muscles',
  regionTags: ['back'],
  highlightColor: '#f6ad55',
});

export const ILIOCOSTALIS: AnatomyNode = node({
  id: 'FMA:22851',
  fmaId: 22851,
  nameEn: 'Iliocostalis',
  nameLatin: 'musculus iliocostalis',
  nameAr: 'العضلة الحرقفية الضلعية',
  level: 5,
  structureType: 'muscle',
  parentId: 'FMA:22850',
  regionTags: ['back'],
});

export const LONGISSIMUS: AnatomyNode = node({
  id: 'FMA:22852',
  fmaId: 22852,
  nameEn: 'Longissimus',
  nameLatin: 'musculus longissimus',
  nameAr: 'العضلة الطويلة',
  level: 5,
  structureType: 'muscle',
  parentId: 'FMA:22850',
  regionTags: ['back'],
});

export const SPINALIS: AnatomyNode = node({
  id: 'FMA:22853',
  fmaId: 22853,
  nameEn: 'Spinalis',
  nameLatin: 'musculus spinalis',
  nameAr: 'العضلة الشوكية',
  level: 5,
  structureType: 'muscle',
  parentId: 'FMA:22850',
  regionTags: ['back'],
});

export const BACK_TRANSVERSOSPINALIS: AnatomyNode = node({
  id: 'back_transversospinalis',
  nameEn: 'Transversospinalis group',
  nameAr: 'مجموعة العضلات العرضية الشوكية',
  level: 4,
  structureType: 'muscle',
  parentId: 'back_deep_muscles',
  regionTags: ['back'],
});

export const SEMISPINALIS: AnatomyNode = node({
  id: 'FMA:22855',
  fmaId: 22855,
  nameEn: 'Semispinalis',
  nameLatin: 'musculus semispinalis',
  nameAr: 'العضلة نصف الشوكية',
  level: 5,
  structureType: 'muscle',
  parentId: 'back_transversospinalis',
  regionTags: ['back'],
});

export const MULTIFIDUS: AnatomyNode = node({
  id: 'FMA:22856',
  fmaId: 22856,
  nameEn: 'Multifidus',
  nameLatin: 'musculus multifidus',
  nameAr: 'العضلة متعددة الشُّعَب',
  level: 5,
  structureType: 'muscle',
  parentId: 'back_transversospinalis',
  regionTags: ['back'],
  highlightColor: '#f6ad55',
});

export const ROTATORES: AnatomyNode = node({
  id: 'FMA:22857',
  fmaId: 22857,
  nameEn: 'Rotatores',
  nameLatin: 'musculi rotatores',
  nameAr: 'العضلات المدوِّرة',
  level: 5,
  structureType: 'muscle',
  parentId: 'back_transversospinalis',
  regionTags: ['back'],
});

// ── Peripheral nerves ─────────────────────────────────────────

export const BACK_SPINAL_NERVES_GROUP: AnatomyNode = node({
  id: 'back_spinal_nerves_group',
  nameEn: 'Spinal nerves',
  nameAr: 'الأعصاب الشوكية',
  level: 3,
  structureType: 'nerve',
  layer: 'nerve',
  parentId: 'back_nervous',
  regionTags: ['back'],
});

export const BACK_CERVICAL_NERVES: AnatomyNode = node({
  id: 'back_cervical_nerves',
  nameEn: 'Cervical spinal nerves C1–C8',
  nameAr: 'الأعصاب الشوكية العنقية C1-C8',
  level: 4,
  structureType: 'nerve',
  parentId: 'back_spinal_nerves_group',
  regionTags: ['back'],
});

export const BACK_THORACIC_NERVES: AnatomyNode = node({
  id: 'back_thoracic_nerves',
  nameEn: 'Thoracic spinal nerves T1–T12',
  nameAr: 'الأعصاب الشوكية الصدرية T1-T12',
  level: 4,
  structureType: 'nerve',
  parentId: 'back_spinal_nerves_group',
  regionTags: ['back'],
});

export const BACK_LUMBAR_NERVES: AnatomyNode = node({
  id: 'back_lumbar_nerves',
  nameEn: 'Lumbar spinal nerves L1–L5',
  nameAr: 'الأعصاب الشوكية القطنية L1-L5',
  level: 4,
  structureType: 'nerve',
  parentId: 'back_spinal_nerves_group',
  regionTags: ['back'],
});

export const BACK_SACRAL_NERVES: AnatomyNode = node({
  id: 'back_sacral_nerves',
  nameEn: 'Sacral spinal nerves S1–S5',
  nameAr: 'الأعصاب الشوكية العجزية S1-S5',
  level: 4,
  structureType: 'nerve',
  parentId: 'back_spinal_nerves_group',
  regionTags: ['back'],
});

export const BACK_DERMATOMES: AnatomyNode = node({
  id: 'back_dermatomes',
  nameEn: 'Dermatomes',
  nameAr: 'المناطق الجلدية العصبية',
  level: 3,
  structureType: 'other',
  parentId: 'back_nervous',
  regionTags: ['back'],
});

// ── Back vessels ──────────────────────────────────────────────

export const BACK_DESCENDING_AORTA: AnatomyNode = node({
  id: 'back_descending_aorta',
  fmaId: 3795,
  nameEn: 'Descending thoracic aorta',
  nameLatin: 'aorta thoracica',
  nameAr: 'الأبهر الصدري النازل',
  level: 3,
  structureType: 'artery',
  layer: 'artery',
  parentId: 'back_vascular',
  regionTags: ['back'],
  highlightColor: '#e53e3e',
});

export const BACK_POSTERIOR_INTERCOSTAL: AnatomyNode = node({
  id: 'back_posterior_intercostal',
  nameEn: 'Posterior intercostal arteries',
  nameLatin: 'arteriae intercostales posteriores',
  nameAr: 'الشرايين الوربية الخلفية',
  level: 4,
  structureType: 'artery',
  parentId: 'back_descending_aorta',
  regionTags: ['back'],
});

export const BACK_LUMBAR_ARTERIES: AnatomyNode = node({
  id: 'back_lumbar_arteries',
  nameEn: 'Lumbar arteries',
  nameLatin: 'arteriae lumbales',
  nameAr: 'الشرايين القطنية',
  level: 4,
  structureType: 'artery',
  parentId: 'back_descending_aorta',
  regionTags: ['back'],
});

export const BACK_AZYGOS: AnatomyNode = node({
  id: 'back_azygos',
  nameEn: 'Azygos vein',
  nameLatin: 'vena azygos',
  nameAr: 'الوريد الغجري',
  level: 3,
  structureType: 'vein',
  layer: 'vein',
  parentId: 'back_vascular',
  regionTags: ['back'],
  highlightColor: '#3182ce',
});

export const BACK_EPIDURAL_VEINS: AnatomyNode = node({
  id: 'back_epidural_veins',
  nameEn: 'Epidural venous plexus',
  nameAr: 'الضفيرة الوريدية فوق الجافية',
  level: 3,
  structureType: 'vein',
  parentId: 'back_vascular',
  regionTags: ['back'],
});

// ── Flat export ───────────────────────────────────────────────

export const ALL_BACK_SPINE_NODES: AnatomyNode[] = [
  BACK,
  // Level 2 systems
  BACK_VERTEBRAL_COLUMN_SYSTEM,
  BACK_SPINAL_CORD_SYSTEM,
  BACK_MUSCULAR_SYSTEM,
  BACK_NERVOUS_SYSTEM,
  BACK_VASCULAR_SYSTEM,
  // Vertebral column
  VERTEBRAL_COLUMN,
  BACK_CERVICAL_REGION,
  BACK_THORACIC_REGION,
  THORACIC_VERTEBRA_T1,
  BACK_T2_T12,
  BACK_LUMBAR_REGION,
  LUMBAR_VERTEBRA_L1,
  LUMBAR_VERTEBRA_L2,
  LUMBAR_VERTEBRA_L3,
  LUMBAR_VERTEBRA_L4,
  LUMBAR_VERTEBRA_L5,
  // Vertebra parts
  BACK_VERTEBRA_PARTS,
  VERTEBRAL_BODY,
  VERTEBRAL_ARCH,
  SPINOUS_PROCESS,
  TRANSVERSE_PROCESS,
  SUPERIOR_ARTICULAR_PROCESS,
  INFERIOR_ARTICULAR_PROCESS,
  VERTEBRAL_FORAMEN,
  INTERVERTEBRAL_FORAMEN,
  PEDICLE_OF_VERTEBRA,
  // Intervertebral discs
  BACK_IVD_GROUP,
  NUCLEUS_PULPOSUS,
  ANNULUS_FIBROSUS,
  VERTEBRAL_END_PLATE,
  // Spinal ligaments
  BACK_SPINAL_LIGAMENTS,
  ANTERIOR_LONGITUDINAL_LIGAMENT,
  POSTERIOR_LONGITUDINAL_LIGAMENT,
  LIGAMENTUM_FLAVUM,
  SUPRASPINOUS_LIGAMENT,
  INTERSPINOUS_LIGAMENT,
  LIGAMENTUM_NUCHAE,
  // Facet joints
  BACK_FACET_JOINTS,
  BACK_CERVICAL_FACETS,
  BACK_LUMBAR_FACETS,
  // Spinal cord
  SPINAL_CORD,
  BACK_CERVICAL_CORD,
  BACK_LUMBAR_CORD,
  CONUS_MEDULLARIS,
  CAUDA_EQUINA,
  FILUM_TERMINALE,
  BACK_CORD_GRAY,
  BACK_ANTERIOR_HORN,
  BACK_POSTERIOR_HORN,
  BACK_LATERAL_HORN,
  BACK_CORD_WHITE,
  BACK_DORSAL_COLUMN,
  BACK_LATERAL_COLUMN,
  BACK_ANTERIOR_COLUMN,
  // Spinal meninges
  BACK_SPINAL_MENINGES,
  SPINAL_DURA_MATER,
  SPINAL_ARACHNOID_MATER,
  SPINAL_PIA_MATER,
  BACK_EPIDURAL_SPACE,
  BACK_SUBARACHNOID_SPACE,
  // Spinal nerve roots
  BACK_SPINAL_ROOTS,
  BACK_DORSAL_ROOT,
  BACK_VENTRAL_ROOT,
  BACK_DRG,
  // Back muscles
  BACK_SUPERFICIAL_MUSCLES,
  TRAPEZIUS,
  LATISSIMUS_DORSI,
  RHOMBOID_MAJOR,
  RHOMBOID_MINOR,
  LEVATOR_SCAPULAE,
  SERRATUS_POSTERIOR_SUPERIOR,
  BACK_INTERMEDIATE_MUSCLES,
  SERRATUS_POSTERIOR_INFERIOR,
  BACK_DEEP_MUSCLES,
  ERECTOR_SPINAE,
  ILIOCOSTALIS,
  LONGISSIMUS,
  SPINALIS,
  BACK_TRANSVERSOSPINALIS,
  SEMISPINALIS,
  MULTIFIDUS,
  ROTATORES,
  // Peripheral nerves
  BACK_SPINAL_NERVES_GROUP,
  BACK_CERVICAL_NERVES,
  BACK_THORACIC_NERVES,
  BACK_LUMBAR_NERVES,
  BACK_SACRAL_NERVES,
  BACK_DERMATOMES,
  // Back vessels
  BACK_DESCENDING_AORTA,
  BACK_POSTERIOR_INTERCOSTAL,
  BACK_LUMBAR_ARTERIES,
  BACK_AZYGOS,
  BACK_EPIDURAL_VEINS,
];
