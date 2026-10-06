import type { AnatomyNode } from '@/types/anatomy';

function node(partial: Partial<AnatomyNode> & {
  id: string; nameEn: string; level: AnatomyNode['level'];
  structureType: AnatomyNode['structureType'];
}): AnatomyNode {
  return {
    fmaId: null, fmaUri: null, ta2Id: null, nameLatin: null, nameAr: null,
    nameFma: null, nameClinical: null, synonyms: [], abbreviations: [],
    parentId: null, regionTags: ['head', 'neck'], systemTags: [],
    sex: 'both', layer: null, meshIds: [], contentId: null,
    modelPending: false, highlightColor: null, sortOrder: 0,
    ...partial,
  };
}

// ── Level 1 roots ─────────────────────────────────────────────

const HEAD = node({
  id: 'FMA:7154', fmaId: 7154, fmaUri: 'http://purl.org/sig/ont/fma/fma7154',
  nameEn: 'Head', nameAr: 'الرأس', level: 1, structureType: 'region',
  regionTags: ['head'], sortOrder: 1,
});

const NECK = node({
  id: 'FMA:7155', fmaId: 7155, fmaUri: 'http://purl.org/sig/ont/fma/fma7155',
  nameEn: 'Neck', nameAr: 'العنق', level: 1, structureType: 'region',
  regionTags: ['neck'], sortOrder: 2,
});

// ── Level 2 — Head systems ────────────────────────────────────

const HEAD_NERVOUS = node({
  id: 'head_nervous', nameEn: 'Brain & Nerves', nameAr: 'الدماغ والأعصاب',
  level: 2, structureType: 'other', parentId: 'FMA:7154',
  regionTags: ['head'], systemTags: ['nervous'],
});

const HEAD_SKELETAL = node({
  id: 'head_skeletal', nameEn: 'Skull & Facial Bones', nameAr: 'الهيكل العظمي',
  level: 2, structureType: 'other', parentId: 'FMA:7154',
  regionTags: ['head'], systemTags: ['skeletal'],
});

const HEAD_SENSORY = node({
  id: 'head_sensory', nameEn: 'Sense Organs', nameAr: 'أعضاء الحواس',
  level: 2, structureType: 'other', parentId: 'FMA:7154',
  regionTags: ['head'], systemTags: [],
});

const HEAD_MUSCULAR = node({
  id: 'head_muscular', nameEn: 'Muscles of Facial Expression & Mastication', nameAr: 'العضلات',
  level: 2, structureType: 'other', parentId: 'FMA:7154',
  regionTags: ['head'], systemTags: ['muscular'],
});

const HEAD_VASCULAR = node({
  id: 'head_vascular', nameEn: 'Vessels', nameAr: 'الأوعية الدموية',
  level: 2, structureType: 'other', parentId: 'FMA:7154',
  regionTags: ['head'], systemTags: ['cardiovascular'],
});

const HEAD_GLANDULAR = node({
  id: 'head_glandular', nameEn: 'Glands & Lymphatics', nameAr: 'الغدد والجهاز اللمفاوي',
  level: 2, structureType: 'other', parentId: 'FMA:7154',
  regionTags: ['head'], systemTags: ['lymphatic'],
});

// ── Level 2 — Neck systems ────────────────────────────────────

const NECK_ANTERIOR = node({
  id: 'neck_anterior', nameEn: 'Anterior Triangle Structures', nameAr: 'المثلث الأمامي',
  level: 2, structureType: 'region', parentId: 'FMA:7155',
  regionTags: ['neck'], systemTags: [],
});

const NECK_POSTERIOR = node({
  id: 'neck_posterior', nameEn: 'Posterior Triangle Structures', nameAr: 'المثلث الخلفي',
  level: 2, structureType: 'region', parentId: 'FMA:7155',
  regionTags: ['neck'], systemTags: [],
});

const NECK_VISCERA = node({
  id: 'neck_viscera', nameEn: 'Neck Viscera', nameAr: 'أحشاء العنق',
  level: 2, structureType: 'other', parentId: 'FMA:7155',
  regionTags: ['neck'], systemTags: [],
});

const NECK_VASCULAR = node({
  id: 'neck_vascular', nameEn: 'Carotid System', nameAr: 'الأوعية الدموية',
  level: 2, structureType: 'other', parentId: 'FMA:7155',
  regionTags: ['neck'], systemTags: ['cardiovascular'],
});

const NECK_VERTEBRAL = node({
  id: 'neck_vertebral', nameEn: 'Cervical Vertebrae', nameAr: 'الفقرات العنقية',
  level: 2, structureType: 'other', parentId: 'FMA:7155',
  regionTags: ['neck'], systemTags: ['skeletal'],
});

// ── Level 3+ — Brain family ───────────────────────────────────

const BRAIN = node({
  id: 'FMA:50801', fmaId: 50801, fmaUri: 'http://purl.org/sig/ont/fma/fma50801',
  nameEn: 'Brain', nameLatin: 'encephalon', nameAr: 'الدماغ',
  level: 3, structureType: 'organ', layer: 'organ',
  parentId: 'head_nervous', regionTags: ['head'], highlightColor: '#b794f4',
});

const CEREBRUM = node({
  id: 'FMA:61819', fmaId: 61819, fmaUri: 'http://purl.org/sig/ont/fma/fma61819',
  nameEn: 'Cerebrum', nameLatin: 'cerebrum', nameAr: 'المخ الكبير',
  level: 4, structureType: 'organ', layer: 'organ',
  parentId: 'FMA:50801', regionTags: ['head'], highlightColor: '#9f7aea',
});

const FRONTAL_LOBE = node({
  id: 'FMA:61890', fmaId: 61890, fmaUri: 'http://purl.org/sig/ont/fma/fma61890',
  nameEn: 'Frontal lobe', nameLatin: 'lobus frontalis', nameAr: 'الفص الجبهي',
  level: 5, structureType: 'organ', layer: 'organ',
  parentId: 'FMA:61819', regionTags: ['head'],
});

const PARIETAL_LOBE = node({
  id: 'FMA:61893', fmaId: 61893, fmaUri: 'http://purl.org/sig/ont/fma/fma61893',
  nameEn: 'Parietal lobe', nameLatin: 'lobus parietalis', nameAr: 'الفص الجداري',
  level: 5, structureType: 'organ', layer: 'organ',
  parentId: 'FMA:61819', regionTags: ['head'],
});

const TEMPORAL_LOBE = node({
  id: 'FMA:61891', fmaId: 61891, fmaUri: 'http://purl.org/sig/ont/fma/fma61891',
  nameEn: 'Temporal lobe', nameLatin: 'lobus temporalis', nameAr: 'الفص الصدغي',
  level: 5, structureType: 'organ', layer: 'organ',
  parentId: 'FMA:61819', regionTags: ['head'],
});

const OCCIPITAL_LOBE = node({
  id: 'FMA:61894', fmaId: 61894, fmaUri: 'http://purl.org/sig/ont/fma/fma61894',
  nameEn: 'Occipital lobe', nameLatin: 'lobus occipitalis', nameAr: 'الفص القذالي',
  level: 5, structureType: 'organ', layer: 'organ',
  parentId: 'FMA:61819', regionTags: ['head'],
});

const BASAL_GANGLIA = node({
  id: 'FMA:62415', fmaId: 62415, fmaUri: 'http://purl.org/sig/ont/fma/fma62415',
  nameEn: 'Basal ganglia', nameAr: 'العقد القاعدية',
  level: 5, structureType: 'other', layer: 'organ',
  parentId: 'FMA:61819', regionTags: ['head'],
});

const HYPOTHALAMUS = node({
  id: 'FMA:54964', fmaId: 54964, fmaUri: 'http://purl.org/sig/ont/fma/fma54964',
  nameEn: 'Hypothalamus', nameLatin: 'hypothalamus', nameAr: 'تحت المهاد',
  level: 5, structureType: 'organ', layer: 'organ',
  parentId: 'FMA:61819', regionTags: ['head'],
});

const THALAMUS = node({
  id: 'FMA:62008', fmaId: 62008, fmaUri: 'http://purl.org/sig/ont/fma/fma62008',
  nameEn: 'Thalamus', nameLatin: 'thalamus', nameAr: 'المهاد',
  level: 5, structureType: 'organ', layer: 'organ',
  parentId: 'FMA:61819', regionTags: ['head'],
});

const CORPUS_CALLOSUM = node({
  id: 'FMA:61932', fmaId: 61932, fmaUri: 'http://purl.org/sig/ont/fma/fma61932',
  nameEn: 'Corpus callosum', nameLatin: 'corpus callosum', nameAr: 'الجسم الثفني',
  level: 5, structureType: 'other', layer: 'organ',
  parentId: 'FMA:61819', regionTags: ['head'],
});

const CEREBELLUM = node({
  id: 'FMA:67944', fmaId: 67944, fmaUri: 'http://purl.org/sig/ont/fma/fma67944',
  nameEn: 'Cerebellum', nameLatin: 'cerebellum', nameAr: 'المخيخ',
  level: 4, structureType: 'organ', layer: 'organ',
  parentId: 'FMA:50801', regionTags: ['head'], highlightColor: '#805ad5',
});

const BRAINSTEM = node({
  id: 'FMA:79876', fmaId: 79876, fmaUri: 'http://purl.org/sig/ont/fma/fma79876',
  nameEn: 'Brainstem', nameLatin: 'truncus encephali', nameAr: 'جذع الدماغ',
  level: 4, structureType: 'organ', layer: 'organ',
  parentId: 'FMA:50801', regionTags: ['head'], highlightColor: '#6b46c1',
});

const MIDBRAIN = node({
  id: 'FMA:9575', fmaId: 9575, fmaUri: 'http://purl.org/sig/ont/fma/fma9575',
  nameEn: 'Midbrain', nameLatin: 'mesencephalon', nameAr: 'الدماغ المتوسط',
  level: 5, structureType: 'organ', layer: 'organ',
  parentId: 'FMA:79876', regionTags: ['head'],
});

const PONS = node({
  id: 'FMA:9580', fmaId: 9580, fmaUri: 'http://purl.org/sig/ont/fma/fma9580',
  nameEn: 'Pons', nameLatin: 'pons', nameAr: 'الجسر',
  level: 5, structureType: 'organ', layer: 'organ',
  parentId: 'FMA:79876', regionTags: ['head'],
});

const MEDULLA_OBLONGATA = node({
  id: 'FMA:62004', fmaId: 62004, fmaUri: 'http://purl.org/sig/ont/fma/fma62004',
  nameEn: 'Medulla oblongata', nameLatin: 'medulla oblongata', nameAr: 'النخاع المستطيل',
  level: 5, structureType: 'organ', layer: 'organ',
  parentId: 'FMA:79876', regionTags: ['head'],
});

const MENINGES = node({
  id: 'FMA:7187', fmaId: 7187, fmaUri: 'http://purl.org/sig/ont/fma/fma7187',
  nameEn: 'Meninges', nameLatin: 'meninges', nameAr: 'السحايا',
  level: 4, structureType: 'other', layer: 'organ',
  parentId: 'FMA:50801', regionTags: ['head'],
});

const DURA_MATER = node({
  id: 'FMA:9590', fmaId: 9590, fmaUri: 'http://purl.org/sig/ont/fma/fma9590',
  nameEn: 'Dura mater', nameLatin: 'dura mater', nameAr: 'الأم الجافية',
  level: 5, structureType: 'fascia', layer: 'organ',
  parentId: 'FMA:7187', regionTags: ['head'],
});

const ARACHNOID_MATER = node({
  id: 'FMA:9589', fmaId: 9589, fmaUri: 'http://purl.org/sig/ont/fma/fma9589',
  nameEn: 'Arachnoid mater', nameLatin: 'arachnoidea mater cranialis', nameAr: 'العنكبوتية',
  level: 5, structureType: 'other', layer: 'organ',
  parentId: 'FMA:7187', regionTags: ['head'],
});

const PIA_MATER = node({
  id: 'FMA:9591', fmaId: 9591, fmaUri: 'http://purl.org/sig/ont/fma/fma9591',
  nameEn: 'Pia mater', nameLatin: 'pia mater cranialis', nameAr: 'الأم الرقيقة',
  level: 5, structureType: 'other', layer: 'organ',
  parentId: 'FMA:7187', regionTags: ['head'],
});

// ── Level 3+ — Cranial nerves ─────────────────────────────────

const CRANIAL_NERVES = node({
  id: 'head_cranial_nerves', nameEn: 'Cranial nerves', nameAr: 'الأعصاب القحفية',
  level: 3, structureType: 'nerve', layer: 'nerve',
  parentId: 'head_nervous', regionTags: ['head'], systemTags: ['nervous'],
});

const CN_II = node({
  id: 'FMA:50863', fmaId: 50863, fmaUri: 'http://purl.org/sig/ont/fma/fma50863',
  nameEn: 'Optic nerve (CN II)', nameLatin: 'nervus opticus', nameAr: 'العصب البصري',
  level: 4, structureType: 'nerve', layer: 'nerve',
  parentId: 'head_cranial_nerves', regionTags: ['head'],
});

const CN_III = node({
  id: 'FMA:50861', fmaId: 50861, fmaUri: 'http://purl.org/sig/ont/fma/fma50861',
  nameEn: 'Oculomotor nerve (CN III)', nameLatin: 'nervus oculomotorius', nameAr: 'العصب المحرك للعين',
  level: 4, structureType: 'nerve', layer: 'nerve',
  parentId: 'head_cranial_nerves', regionTags: ['head'],
});

const CN_V = node({
  id: 'FMA:50866', fmaId: 50866, fmaUri: 'http://purl.org/sig/ont/fma/fma50866',
  nameEn: 'Trigeminal nerve (CN V)', nameLatin: 'nervus trigeminus', nameAr: 'العصب الثلاثي التوائم',
  level: 4, structureType: 'nerve', layer: 'nerve',
  parentId: 'head_cranial_nerves', regionTags: ['head'], highlightColor: '#68d391',
});

const CN_VII = node({
  id: 'FMA:50864', fmaId: 50864, fmaUri: 'http://purl.org/sig/ont/fma/fma50864',
  nameEn: 'Facial nerve (CN VII)', nameLatin: 'nervus facialis', nameAr: 'العصب الوجهي',
  level: 4, structureType: 'nerve', layer: 'nerve',
  parentId: 'head_cranial_nerves', regionTags: ['head'], highlightColor: '#68d391',
});

const CN_VIII = node({
  id: 'FMA:50865', fmaId: 50865, fmaUri: 'http://purl.org/sig/ont/fma/fma50865',
  nameEn: 'Vestibulocochlear nerve (CN VIII)', nameLatin: 'nervus vestibulocochlearis', nameAr: 'العصب الدهليزي القوقعي',
  level: 4, structureType: 'nerve', layer: 'nerve',
  parentId: 'head_cranial_nerves', regionTags: ['head'],
});

const CN_IX = node({
  id: 'FMA:50867', fmaId: 50867, fmaUri: 'http://purl.org/sig/ont/fma/fma50867',
  nameEn: 'Glossopharyngeal nerve (CN IX)', nameLatin: 'nervus glossopharyngeus', nameAr: 'العصب اللساني البلعومي',
  level: 4, structureType: 'nerve',
  parentId: 'head_cranial_nerves', regionTags: ['head'],
});

const CN_X = node({
  id: 'FMA:50868', fmaId: 50868, fmaUri: 'http://purl.org/sig/ont/fma/fma50868',
  nameEn: 'Vagus nerve (CN X)', nameLatin: 'nervus vagus', nameAr: 'العصب المبهم',
  level: 4, structureType: 'nerve', layer: 'nerve',
  parentId: 'head_cranial_nerves', regionTags: ['head'], highlightColor: '#68d391',
});

const CN_XI = node({
  id: 'FMA:50869', fmaId: 50869, fmaUri: 'http://purl.org/sig/ont/fma/fma50869',
  nameEn: 'Accessory nerve (CN XI)', nameLatin: 'nervus accessorius', nameAr: 'العصب الإضافي',
  level: 4, structureType: 'nerve',
  parentId: 'head_cranial_nerves', regionTags: ['head'],
});

const CN_XII = node({
  id: 'FMA:50870', fmaId: 50870, fmaUri: 'http://purl.org/sig/ont/fma/fma50870',
  nameEn: 'Hypoglossal nerve (CN XII)', nameLatin: 'nervus hypoglossus', nameAr: 'العصب تحت اللسان',
  level: 4, structureType: 'nerve',
  parentId: 'head_cranial_nerves', regionTags: ['head'],
});

// ── Level 3+ — Skull & Facial bones ──────────────────────────

const SKULL = node({
  id: 'FMA:46565', fmaId: 46565, fmaUri: 'http://purl.org/sig/ont/fma/fma46565',
  nameEn: 'Skull', nameLatin: 'cranium', nameAr: 'الجمجمة',
  level: 3, structureType: 'bone', layer: 'skeleton',
  parentId: 'head_skeletal', regionTags: ['head'],
});

const CALVARIA = node({
  id: 'FMA:9607', fmaId: 9607, fmaUri: 'http://purl.org/sig/ont/fma/fma9607',
  nameEn: 'Calvaria', nameLatin: 'calvaria', nameAr: 'قبة الجمجمة',
  level: 4, structureType: 'bone', layer: 'skeleton',
  parentId: 'FMA:46565', regionTags: ['head'],
});

const FRONTAL_BONE = node({
  id: 'FMA:52730', fmaId: 52730, fmaUri: 'http://purl.org/sig/ont/fma/fma52730',
  nameEn: 'Frontal bone', nameLatin: 'os frontale', nameAr: 'العظم الجبهي',
  level: 4, structureType: 'bone', layer: 'skeleton',
  parentId: 'FMA:46565', regionTags: ['head'],
});

const PARIETAL_BONE = node({
  id: 'FMA:52735', fmaId: 52735, fmaUri: 'http://purl.org/sig/ont/fma/fma52735',
  nameEn: 'Parietal bone', nameLatin: 'os parietale', nameAr: 'العظم الجداري',
  level: 4, structureType: 'bone', layer: 'skeleton',
  parentId: 'FMA:46565', regionTags: ['head'],
});

const TEMPORAL_BONE = node({
  id: 'FMA:52738', fmaId: 52738, fmaUri: 'http://purl.org/sig/ont/fma/fma52738',
  nameEn: 'Temporal bone', nameLatin: 'os temporale', nameAr: 'العظم الصدغي',
  level: 4, structureType: 'bone', layer: 'skeleton',
  parentId: 'FMA:46565', regionTags: ['head'],
});

const OCCIPITAL_BONE = node({
  id: 'FMA:52744', fmaId: 52744, fmaUri: 'http://purl.org/sig/ont/fma/fma52744',
  nameEn: 'Occipital bone', nameLatin: 'os occipitale', nameAr: 'العظم القذالي',
  level: 4, structureType: 'bone', layer: 'skeleton',
  parentId: 'FMA:46565', regionTags: ['head'],
});

const SPHENOID_BONE = node({
  id: 'FMA:52736', fmaId: 52736, fmaUri: 'http://purl.org/sig/ont/fma/fma52736',
  nameEn: 'Sphenoid bone', nameLatin: 'os sphenoidale', nameAr: 'العظم الوتدي',
  level: 4, structureType: 'bone', layer: 'skeleton',
  parentId: 'FMA:46565', regionTags: ['head'],
});

const ETHMOID_BONE = node({
  id: 'FMA:52756', fmaId: 52756, fmaUri: 'http://purl.org/sig/ont/fma/fma52756',
  nameEn: 'Ethmoid bone', nameLatin: 'os ethmoidale', nameAr: 'العظم الغربالي',
  level: 4, structureType: 'bone', layer: 'skeleton',
  parentId: 'FMA:46565', regionTags: ['head'],
});

const MANDIBLE = node({
  id: 'FMA:9604', fmaId: 9604, fmaUri: 'http://purl.org/sig/ont/fma/fma9604',
  nameEn: 'Mandible', nameLatin: 'mandibula', nameAr: 'الفك السفلي',
  level: 3, structureType: 'bone', layer: 'skeleton',
  parentId: 'head_skeletal', regionTags: ['head'],
});

const MAXILLA = node({
  id: 'FMA:9603', fmaId: 9603, fmaUri: 'http://purl.org/sig/ont/fma/fma9603',
  nameEn: 'Maxilla', nameLatin: 'maxilla', nameAr: 'الفك العلوي',
  level: 3, structureType: 'bone', layer: 'skeleton',
  parentId: 'head_skeletal', regionTags: ['head'],
});

// ── Level 3+ — Sense organs ───────────────────────────────────

const EYE = node({
  id: 'FMA:54448', fmaId: 54448, fmaUri: 'http://purl.org/sig/ont/fma/fma54448',
  nameEn: 'Eye', nameLatin: 'oculus', nameAr: 'العين',
  level: 3, structureType: 'organ', layer: 'organ',
  parentId: 'head_sensory', regionTags: ['head'],
});

const EAR = node({
  id: 'FMA:52780', fmaId: 52780, fmaUri: 'http://purl.org/sig/ont/fma/fma52780',
  nameEn: 'Ear', nameLatin: 'auris', nameAr: 'الأذن',
  level: 3, structureType: 'organ', layer: 'organ',
  parentId: 'head_sensory', regionTags: ['head'],
});

const EXTERNAL_EAR = node({
  id: 'FMA:56513', fmaId: 56513, fmaUri: 'http://purl.org/sig/ont/fma/fma56513',
  nameEn: 'External ear', nameAr: 'الأذن الخارجية',
  level: 4, structureType: 'organ', layer: 'organ',
  parentId: 'FMA:52780', regionTags: ['head'],
});

const MIDDLE_EAR = node({
  id: 'head_middle_ear', nameEn: 'Middle ear', nameAr: 'الأذن الوسطى',
  level: 4, structureType: 'organ', layer: 'organ',
  parentId: 'FMA:52780', regionTags: ['head'],
});

const INNER_EAR = node({
  id: 'head_inner_ear', fmaId: 60909, fmaUri: 'http://purl.org/sig/ont/fma/fma60909',
  nameEn: 'Inner ear', nameLatin: 'auris interna', nameAr: 'الأذن الداخلية',
  level: 4, structureType: 'organ', layer: 'organ',
  parentId: 'FMA:52780', regionTags: ['head'],
});

const NOSE = node({
  id: 'FMA:59789', fmaId: 59789, fmaUri: 'http://purl.org/sig/ont/fma/fma59789',
  nameEn: 'Nose', nameLatin: 'nasus', nameAr: 'الأنف',
  level: 3, structureType: 'organ', layer: 'organ',
  parentId: 'head_sensory', regionTags: ['head'],
});

const ORAL_CAVITY = node({
  id: 'FMA:54640', fmaId: 54640, fmaUri: 'http://purl.org/sig/ont/fma/fma54640',
  nameEn: 'Oral cavity', nameLatin: 'cavitas oris', nameAr: 'التجويف الفموي',
  level: 3, structureType: 'cavity', layer: 'organ',
  parentId: 'head_sensory', regionTags: ['head'],
});

const TONGUE = node({
  id: 'FMA:54609', fmaId: 54609, fmaUri: 'http://purl.org/sig/ont/fma/fma54609',
  nameEn: 'Tongue', nameLatin: 'lingua', nameAr: 'اللسان',
  level: 4, structureType: 'organ', layer: 'organ',
  parentId: 'FMA:54640', regionTags: ['head'],
});

// ── Level 3 — Glands ──────────────────────────────────────────

const PAROTID_GLAND = node({
  id: 'FMA:52565', fmaId: 52565, fmaUri: 'http://purl.org/sig/ont/fma/fma52565',
  nameEn: 'Parotid gland', nameLatin: 'glandula parotidea', nameAr: 'الغدة النكفية',
  level: 3, structureType: 'gland', layer: 'organ',
  parentId: 'head_glandular', regionTags: ['head'],
});

const SUBMANDIBULAR_GLAND = node({
  id: 'FMA:9909', fmaId: 9909, fmaUri: 'http://purl.org/sig/ont/fma/fma9909',
  nameEn: 'Submandibular gland', nameLatin: 'glandula submandibularis', nameAr: 'الغدة تحت الفك',
  level: 3, structureType: 'gland', layer: 'organ',
  parentId: 'head_glandular', regionTags: ['head'],
});

const SUBLINGUAL_GLAND = node({
  id: 'FMA:9910', fmaId: 9910, fmaUri: 'http://purl.org/sig/ont/fma/fma9910',
  nameEn: 'Sublingual gland', nameLatin: 'glandula sublingualis', nameAr: 'الغدة تحت اللسان',
  level: 3, structureType: 'gland', layer: 'organ',
  parentId: 'head_glandular', regionTags: ['head'],
});

// ── Level 3 — Muscles (head/neck) ────────────────────────────

const STERNOCLEIDOMASTOID = node({
  id: 'FMA:13355', fmaId: 13355, fmaUri: 'http://purl.org/sig/ont/fma/fma13355',
  nameEn: 'Sternocleidomastoid', nameLatin: 'musculus sternocleidomastoideus', nameAr: 'العضلة القصية الترقوية الخشائية',
  level: 3, structureType: 'muscle', layer: 'muscle_superficial',
  parentId: 'head_muscular', regionTags: ['head', 'neck'], highlightColor: '#f6ad55',
});

const TRAPEZIUS = node({
  id: 'FMA:9624', fmaId: 9624, fmaUri: 'http://purl.org/sig/ont/fma/fma9624',
  nameEn: 'Trapezius', nameLatin: 'musculus trapezius', nameAr: 'العضلة الشبه منحرفة',
  level: 3, structureType: 'muscle', layer: 'muscle_superficial',
  parentId: 'head_muscular', regionTags: ['head', 'neck'], highlightColor: '#f6ad55',
});

// ── Level 3 — Neck viscera ────────────────────────────────────

const LARYNX = node({
  id: 'FMA:9605', fmaId: 9605, fmaUri: 'http://purl.org/sig/ont/fma/fma9605',
  nameEn: 'Larynx', nameLatin: 'larynx', nameAr: 'الحنجرة',
  level: 3, structureType: 'organ', layer: 'organ',
  parentId: 'neck_viscera', regionTags: ['neck'], highlightColor: '#fbd38d',
});

const TRACHEA_CERVICAL = node({
  id: 'neck_trachea', fmaId: null,
  nameEn: 'Trachea (cervical part)', nameAr: 'القصبة الهوائية الرقبية',
  level: 3, structureType: 'organ',
  parentId: 'neck_viscera', regionTags: ['neck'],
});

const PHARYNX = node({
  id: 'FMA:46688', fmaId: 46688, fmaUri: 'http://purl.org/sig/ont/fma/fma46688',
  nameEn: 'Pharynx', nameLatin: 'pharynx', nameAr: 'البلعوم',
  level: 3, structureType: 'organ',
  parentId: 'neck_viscera', regionTags: ['neck'],
});

const ESOPHAGUS_CERVICAL = node({
  id: 'neck_esophagus', nameEn: 'Esophagus (cervical part)', nameAr: 'المريء الرقبي',
  level: 3, structureType: 'organ',
  parentId: 'neck_viscera', regionTags: ['neck'],
});

const THYROID_GLAND = node({
  id: 'FMA:9597', fmaId: 9597, fmaUri: 'http://purl.org/sig/ont/fma/fma9597',
  nameEn: 'Thyroid gland', nameLatin: 'glandula thyroidea', nameAr: 'الغدة الدرقية',
  level: 3, structureType: 'gland', layer: 'organ',
  parentId: 'neck_viscera', regionTags: ['neck'], highlightColor: '#ffd89b',
});

const PARATHYROID_GLANDS = node({
  id: 'FMA:13890', fmaId: 13890, fmaUri: 'http://purl.org/sig/ont/fma/fma13890',
  nameEn: 'Parathyroid glands', nameLatin: 'glandula parathyroidea', nameAr: 'الغدد جار درقية',
  level: 3, structureType: 'gland',
  parentId: 'neck_viscera', regionTags: ['neck'],
});

// ── Level 3 — Neck vascular ───────────────────────────────────

const COMMON_CAROTID_RIGHT = node({
  id: 'FMA:3711', fmaId: 3711, fmaUri: 'http://purl.org/sig/ont/fma/fma3711',
  nameEn: 'Common carotid artery (right)', nameLatin: 'arteria carotis communis dextra', nameAr: 'الشريان السباتي المشترك الأيمن',
  level: 3, structureType: 'artery', layer: 'artery',
  parentId: 'neck_vascular', regionTags: ['neck'], highlightColor: '#e53e3e',
});

const COMMON_CAROTID_LEFT = node({
  id: 'FMA:3713', fmaId: 3713, fmaUri: 'http://purl.org/sig/ont/fma/fma3713',
  nameEn: 'Common carotid artery (left)', nameLatin: 'arteria carotis communis sinistra', nameAr: 'الشريان السباتي المشترك الأيسر',
  level: 3, structureType: 'artery', layer: 'artery',
  parentId: 'neck_vascular', regionTags: ['neck'], highlightColor: '#e53e3e',
});

const INTERNAL_JUGULAR_VEIN = node({
  id: 'FMA:3932', fmaId: 3932, fmaUri: 'http://purl.org/sig/ont/fma/fma3932',
  nameEn: 'Internal jugular vein', nameAr: 'الوريد الوداجي الداخلي',
  level: 3, structureType: 'vein', layer: 'vein',
  parentId: 'neck_vascular', regionTags: ['neck'], highlightColor: '#3182ce',
});

const VERTEBRAL_ARTERY = node({
  id: 'FMA:10996', fmaId: 10996, fmaUri: 'http://purl.org/sig/ont/fma/fma10996',
  nameEn: 'Vertebral artery', nameAr: 'الشريان الفقري',
  level: 3, structureType: 'artery', layer: 'artery',
  parentId: 'neck_vascular', regionTags: ['neck'], highlightColor: '#e53e3e',
});

// ── Level 3 — Cervical vertebrae ──────────────────────────────

const ATLAS = node({
  id: 'FMA:23968', fmaId: 23968, fmaUri: 'http://purl.org/sig/ont/fma/fma23968',
  nameEn: 'Atlas (C1)', nameLatin: 'atlas', nameAr: 'الأطلس / C1',
  level: 3, structureType: 'bone', layer: 'skeleton',
  parentId: 'neck_vertebral', regionTags: ['neck'],
});

const AXIS = node({
  id: 'FMA:23970', fmaId: 23970, fmaUri: 'http://purl.org/sig/ont/fma/fma23970',
  nameEn: 'Axis (C2)', nameLatin: 'axis', nameAr: 'المحور / C2',
  level: 3, structureType: 'bone', layer: 'skeleton',
  parentId: 'neck_vertebral', regionTags: ['neck'],
});

const C3_C7 = node({
  id: 'neck_c3_c7', nameEn: 'C3–C7 Vertebrae', nameAr: 'الفقرات C3-C7',
  level: 3, structureType: 'bone', layer: 'skeleton',
  parentId: 'neck_vertebral', regionTags: ['neck'],
});

// ── Export ────────────────────────────────────────────────────

export const ALL_HEAD_NECK_NODES: AnatomyNode[] = [
  // L1 roots
  HEAD,
  NECK,

  // L2 — Head systems
  HEAD_NERVOUS,
  HEAD_SKELETAL,
  HEAD_SENSORY,
  HEAD_MUSCULAR,
  HEAD_VASCULAR,
  HEAD_GLANDULAR,

  // L2 — Neck systems
  NECK_ANTERIOR,
  NECK_POSTERIOR,
  NECK_VISCERA,
  NECK_VASCULAR,
  NECK_VERTEBRAL,

  // L3 — Brain
  BRAIN,

  // L4 — Brain subdivisions
  CEREBRUM,
  CEREBELLUM,
  BRAINSTEM,
  MENINGES,

  // L5 — Cerebrum lobes & structures
  FRONTAL_LOBE,
  PARIETAL_LOBE,
  TEMPORAL_LOBE,
  OCCIPITAL_LOBE,
  BASAL_GANGLIA,
  HYPOTHALAMUS,
  THALAMUS,
  CORPUS_CALLOSUM,

  // L5 — Brainstem parts
  MIDBRAIN,
  PONS,
  MEDULLA_OBLONGATA,

  // L5 — Meninges layers
  DURA_MATER,
  ARACHNOID_MATER,
  PIA_MATER,

  // L3 — Cranial nerve group
  CRANIAL_NERVES,

  // L4 — Individual cranial nerves
  CN_II,
  CN_III,
  CN_V,
  CN_VII,
  CN_VIII,
  CN_IX,
  CN_X,
  CN_XI,
  CN_XII,

  // L3 — Skull
  SKULL,
  MANDIBLE,
  MAXILLA,

  // L4 — Skull bones
  CALVARIA,
  FRONTAL_BONE,
  PARIETAL_BONE,
  TEMPORAL_BONE,
  OCCIPITAL_BONE,
  SPHENOID_BONE,
  ETHMOID_BONE,

  // L3 — Sense organs
  EYE,
  EAR,
  NOSE,
  ORAL_CAVITY,

  // L4 — Ear subdivisions
  EXTERNAL_EAR,
  MIDDLE_EAR,
  INNER_EAR,

  // L4 — Oral cavity contents
  TONGUE,

  // L3 — Salivary glands
  PAROTID_GLAND,
  SUBMANDIBULAR_GLAND,
  SUBLINGUAL_GLAND,

  // L3 — Neck muscles
  STERNOCLEIDOMASTOID,
  TRAPEZIUS,

  // L3 — Neck viscera
  LARYNX,
  TRACHEA_CERVICAL,
  PHARYNX,
  ESOPHAGUS_CERVICAL,
  THYROID_GLAND,
  PARATHYROID_GLANDS,

  // L3 — Neck vascular
  COMMON_CAROTID_RIGHT,
  COMMON_CAROTID_LEFT,
  INTERNAL_JUGULAR_VEIN,
  VERTEBRAL_ARTERY,

  // L3 — Cervical vertebrae
  ATLAS,
  AXIS,
  C3_C7,
];
