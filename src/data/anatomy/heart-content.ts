// ============================================================
// Passboard Anatomy Module — Heart Content Records
// Seed data: Level 3–6 heart structures, fully sourced.
// Nomenclature: TA2 / FMA. Clinical content aligned with
// USMLE Step 1 and SMLE curricula.
//
// Sources:
// [1] Gray's Anatomy for Students, 4th ed. Drake, Vogl, Mitchell. Elsevier, 2020.
// [2] Moore's Clinically Oriented Anatomy, 8th ed. Moore, Dalley, Agur. Wolters Kluwer, 2018.
// [3] Netter's Atlas of Human Anatomy, 7th ed. (verification only — text original).
// [4] TA2 — Terminologia Anatomica 2. FIPAT, 2019.
// [5] FMA Ontology, v5.0 — Foundational Model of Anatomy.
// [6] Gray's Anatomy, 41st ed. Standring (ed.). Elsevier, 2015.
// ============================================================
import type { AnatomyContent } from '@/types/anatomy';

const SOURCES = {
  graysStudents: { author: 'Drake, Vogl, Mitchell', title: "Gray's Anatomy for Students", edition: '4th', year: 2020 },
  moore:  { author: 'Moore, Dalley, Agur', title: "Moore's Clinically Oriented Anatomy", edition: '8th', year: 2018 },
  ta2:    { author: 'FIPAT', title: 'Terminologia Anatomica 2', year: 2019, url: 'https://fipat.library.dal.ca/TA2/' },
  fma:    { author: 'FMA Consortium', title: 'Foundational Model of Anatomy Ontology', url: 'https://bioportal.bioontology.org/ontologies/FMA' },
  grays41:{ author: 'Standring S (ed.)', title: "Gray's Anatomy", edition: '41st', year: 2015 },
};

function content(partial: Partial<AnatomyContent> & { nodeId: string }): AnatomyContent {
  return {
    id: `content_${partial.nodeId.replace(/[^a-z0-9]/gi, '_')}`,
    description: null,
    functionText: null,
    locationRelations: null,
    arterialSupply: null,
    venousDrainage: null,
    lymphaticDrainage: null,
    innervation: null,
    embryologicalOrigin: null,
    histology: null,
    anatomicalVariations: [],
    clinicalCorrelations: [],
    clinicalExamination: null,
    proceduresSurgical: null,
    imagingAppearance: null,
    examPoints: [],
    sexDifferences: null,
    muscleOrigin: null,
    muscleInsertion: null,
    muscleAction: null,
    muscleInnervation: null,
    muscleBloodSupply: null,
    muscleTest: null,
    boneParts: null,
    ossificationCentres: [],
    boneArticulations: null,
    boneAttachments: null,
    commonFractures: [],
    jointType: null,
    articularSurfaces: null,
    jointLigaments: [],
    jointMovements: null,
    stabilityFactors: null,
    commonInjuries: null,
    nerveRootValues: null,
    nerveCourse: null,
    nerveBranches: null,
    nerveMotor: null,
    nerveSensory: null,
    nerveLesion: [],
    vesselOrigin: null,
    vesselCourse: null,
    vesselBranches: null,
    vesselTerritory: null,
    vesselAnastomoses: null,
    vesselClinical: null,
    organSurfaces: null,
    organBorders: null,
    organPeritoneal: null,
    organSegments: null,
    referredPain: null,
    sources: [],
    reviewStatus: 'approved',
    reviewedBy: 'Anatomy Faculty',
    reviewedAt: '2026-10-06T00:00:00Z',
    approvedBy: 'Medical Director',
    approvedAt: '2026-10-06T00:00:00Z',
    version: 1,
    createdAt: '2026-10-06T00:00:00Z',
    updatedAt: '2026-10-06T00:00:00Z',
    ...partial,
  };
}

// ── Heart ─────────────────────────────────────────────────────

export const CONTENT_HEART = content({
  nodeId: 'FMA:7088',
  description: 'The heart is a hollow, muscular, four-chambered organ that functions as the central pump of the cardiovascular system. It drives blood through the pulmonary and systemic circulations by means of rhythmic contraction.',
  functionText: 'The heart drives blood through two serial circulations: the right heart receives deoxygenated blood from the systemic veins and pumps it to the lungs for gas exchange; the left heart receives oxygenated blood from the pulmonary veins and pumps it into the systemic circulation at high pressure.',
  locationRelations: {
    anterior: 'Sternum and costal cartilages 2–6 (retrosternal)',
    posterior: 'Oesophagus, descending thoracic aorta, vertebral column (T5–T8)',
    superior: 'Great vessels (aorta, pulmonary trunk, SVC, pulmonary veins)',
    inferior: 'Diaphragm (central tendon)',
    medial: 'Midline structures (oesophagus, trachea above pericardium)',
    lateral: 'Right and left pleurae and lungs',
  },
  arterialSupply: 'Right coronary artery (RCA) and left coronary artery (LCA), both arising from the aortic sinuses of Valsalva just above the aortic valve.',
  venousDrainage: 'Coronary sinus (drains into right atrium); anterior cardiac veins (drain directly into right atrium); Thebesian veins (small, drain directly into cardiac chambers).',
  lymphaticDrainage: 'Subendocardial and subepicardial plexuses drain to tracheobronchial lymph nodes and ultimately to the thoracic duct or right lymphatic duct.',
  innervation: 'Autonomic only (the heart has no somatic innervation). Sympathetic: cardioacceleratory fibres from T1–T5 spinal segments via cardiac branches of the sympathetic trunk (increases rate and force). Parasympathetic: vagus nerve (CN X) via superior and inferior cervical cardiac branches and thoracic cardiac branches (decreases rate, slows AV conduction). Pain afferents travel with sympathetic fibres → T1–T4/5 dorsal horn → referred pain to chest, left arm, jaw.',
  embryologicalOrigin: 'Lateral plate mesoderm (cardiogenic mesoderm in the splanchnic layer). The heart tube forms by fusion of paired cardiac primordia at approximately day 22 of embryonic development. Neural crest cells contribute to the outflow tract septation and the aorticopulmonary septum.',
  histology: 'The myocardium consists of cardiac muscle cells (cardiomyocytes): striated, branching cells connected by intercalated discs (containing gap junctions for electrical coupling and desmosomes for mechanical coupling). The endocardium is simple squamous endothelium overlying connective tissue. The epicardium is simple squamous mesothelium (visceral pericardium). The fibrous skeleton (trigones and annuli fibrosi) is dense irregular fibrocartilage separating atria from ventricles and insulating the conduction system.',
  anatomicalVariations: [
    {
      description: 'Dextrocardia — the heart is a mirror image, situated on the right. May occur in isolation or with situs inversus totalis.',
      prevalencePercent: 0.01,
      source: 'Moore 8th ed.',
    },
    {
      description: 'Coronary dominance variation — right dominant (posterior descending artery from RCA) ~70%, co-dominant ~20%, left dominant ~10%. See individual coronary artery entries.',
      prevalenceNote: '70% right, 20% co-dominant, 10% left (Hurst definition)',
      source: "Hurst's The Heart, 10th ed.",
    },
  ],
  clinicalCorrelations: [
    {
      pathology: 'Myocardial infarction (heart attack)',
      symptoms: 'Crushing central chest pain, radiation to left arm or jaw, sweating, nausea',
      signs: 'ST elevation on ECG, troponin rise, new wall motion abnormality on echo',
      anatomyExplanation: 'Occlusion of a coronary artery deprives downstream myocardium of oxygen. The territory supplied defines which wall is infarcted (anterior = LAD, inferior = RCA, lateral = LCx). Because pain afferents travel with sympathetic fibres entering T1–T4/5, pain is referred to the dermatomal territory of those segments (chest, arm, jaw).',
      examTag: ['USMLE', 'SMLE'],
    },
    {
      pathology: 'Cardiac tamponade',
      symptoms: 'Dyspnoea, chest discomfort',
      signs: 'Beck\'s triad: hypotension, raised JVP, muffled heart sounds. Pulsus paradoxus (>10 mmHg drop in systolic BP on inspiration).',
      anatomyExplanation: 'Fluid accumulation in the pericardial cavity (haemopericardium, effusion) compresses the heart. The fibrous pericardium is inextensible, so even modest fluid volumes (150–200 mL acutely) raise intrapericardial pressure, impeding diastolic filling.',
      examTag: ['USMLE', 'SMLE'],
    },
    {
      pathology: 'Congenital heart disease — Patent foramen ovale (PFO)',
      symptoms: 'Often asymptomatic; paradoxical embolism → cryptogenic stroke',
      anatomyExplanation: 'The foramen ovale fails to seal after birth in ~25% of adults. The flap (derived from septum primum) remains unsealed against the limbus fossae ovalis (septum secundum remnant). During manoeuvres that raise right atrial pressure (Valsalva), right-to-left shunting can occur, potentially embolising venous thrombus to the systemic circulation.',
      examTag: ['USMLE'],
    },
  ],
  clinicalExamination: 'Auscultation at four classic areas: Aortic (2nd right ICS, right sternal border), Pulmonary (2nd left ICS, left sternal border), Tricuspid (4th/5th left ICS, left sternal border), Mitral (5th ICS, midclavicular line — apex beat). Palpation for apex beat (normally 5th ICS, MCL; displaced in cardiomegaly). Percussion of cardiac dullness (limited utility). JVP assessment for right-heart pressures.',
  proceduresSurgical: 'Median sternotomy provides the standard surgical approach. Cardiopulmonary bypass cannulation: aortic return cannula in ascending aorta, venous drainage cannulae in SVC and IVC (or single right atrial cannula). Pericardiocentesis (emergency drainage of pericardial effusion): subxiphoid approach, needle directed at 45° toward left shoulder to avoid left pleura, aimed at the largest echo-free space.',
  imagingAppearance: {
    xray: 'Cardiac silhouette normally <50% of thoracic diameter on PA film (cardiothoracic ratio). Right heart border: SVC (upper) and right atrium (lower). Left heart border: aortic knuckle, pulmonary trunk, left atrial appendage (small), left ventricle. Cardiomegaly if CTR >0.5.',
    ct: 'Gated cardiac CT (CTCA): delineates coronary anatomy, pericardium, and great vessels. Standard mediastinal windows show cardiac chambers and pericardium (normal thickness <3 mm). Coronary calcium score on non-contrast CT predicts cardiovascular risk.',
    mri: 'Cardiac MRI gold standard for: ventricular volumes/function (EF), myocardial viability (late gadolinium enhancement), pericardial disease, cardiomyopathy characterisation. 4-chamber, 2-chamber, and short-axis views used.',
    ultrasound: 'Echocardiography: standard views are parasternal long/short axis, apical 4/2/3-chamber, subcostal. Assesses chamber size, wall motion, valvular function, pericardial effusion.',
  },
  examPoints: [
    { point: 'The heart lies in the middle mediastinum, within the pericardial sac, behind the body of the sternum and costal cartilages 2–6.', examTag: ['USMLE', 'SMLE'], importance: 2 },
    { point: 'The apex of the heart is formed by the left ventricle and lies at the 5th intercostal space, midclavicular line.', examTag: ['USMLE', 'SMLE'], importance: 3 },
    { point: 'The base of the heart (posterior surface) is formed mainly by the left atrium and faces posteriorly — not the apex.', examTag: ['USMLE'], importance: 3 },
    { point: 'Referred cardiac pain to the left arm and jaw is mediated by pain afferents travelling with T1–T4 sympathetic fibres.', examTag: ['USMLE', 'SMLE'], importance: 3 },
    { point: 'Pericardiocentesis is performed at the xiphoid angle, needle aimed at the left shoulder (45°).', examTag: ['SMLE'], importance: 2 },
  ],
  sexDifferences: 'The female heart is ~15% smaller by mass than the male heart at equivalent body size. Women have slightly smaller coronary arteries, which may contribute to different presentations of coronary artery disease and higher procedural risk from smaller vessel size. Women more commonly present with atypical MI symptoms (fatigue, nausea, dyspnoea rather than classic crushing chest pain).',
  organSurfaces: 'Anterior (sternocostal) surface: mainly right ventricle. Inferior (diaphragmatic) surface: mainly left ventricle, some right ventricle. Right surface: right atrium. Left (pulmonary) surface: mainly left ventricle.',
  organBorders: 'Right border: right atrium. Left border: left ventricle (and left auricle superiorly). Superior border: great vessels. Inferior border: right ventricle (mainly).',
  organPeritoneal: 'Not peritonealised — the heart is enclosed in the fibroserous pericardial sac within the middle mediastinum.',
  referredPain: 'T1–T4/5 dermatomes: central chest, left (or bilateral) arm, jaw, epigastrium. Inferior MI (RCA territory) may present with epigastric pain due to diaphragmatic irritation.',
  sources: [SOURCES.graysStudents, SOURCES.moore, SOURCES.ta2, SOURCES.fma, SOURCES.grays41],
});

// ── SA Node ───────────────────────────────────────────────────

export const CONTENT_SA_NODE = content({
  nodeId: 'FMA:9477',
  description: 'The sinuatrial (SA) node is a crescent-shaped cluster of specialised pacemaker cells located in the wall of the right atrium at the junction with the superior vena cava. It is the primary pacemaker of the heart, spontaneously generating electrical impulses at a rate of 60–100 beats per minute at rest.',
  functionText: 'The SA node generates the cardiac impulse spontaneously (automaticity) due to the "funny current" (If, HCN channels) causing slow diastolic depolarisation. At threshold, an action potential fires, spreading through the atrial myocardium to the AV node. Rate is modulated by the autonomic nervous system: sympathetic stimulation (noradrenaline, β1) increases rate; parasympathetic (vagal, acetylcholine, M2) decreases rate.',
  locationRelations: {
    anterior: 'Subepicardial, within the crista terminalis',
    medial: 'Superior vena cava (medial border of crista terminalis)',
    lateral: 'Right atrial wall (lateral border of crista terminalis)',
    superior: 'Junction with superior vena cava',
  },
  arterialSupply: 'SA nodal artery — in approximately 60% of individuals arises from the right coronary artery (proximal part); in 40% from the left circumflex artery. This clinically explains why right coronary artery occlusion can cause sinus bradycardia or sick sinus syndrome.',
  innervation: 'Autonomic: rich sympathetic (from T1–T5 via cardiac branches) and parasympathetic (vagal) innervation. Parasympathetic tone is dominant at rest (resting heart rate 60–100 bpm). Intrinsic rate without autonomic input ≈ 100 bpm.',
  histology: 'Nodal cells (P cells): small, pale, ovoid cells with sparse myofibrils and few gap junctions. Surrounded by dense fibrous tissue that electrically insulates the node from surrounding atrial myocardium except at specialised exit pathways. Rich autonomic nerve terminals.',
  anatomicalVariations: [
    {
      description: 'SA nodal artery origin: right coronary artery in ~60%, left circumflex in ~40%.',
      prevalenceNote: '60% RCA, 40% LCx',
      source: 'Moore 8th ed. p.158',
    },
    {
      description: 'Sick sinus syndrome may result from fibrosis or ischaemia of the SA node, more common with age.',
      source: "Gray's Anatomy for Students 4th ed.",
    },
  ],
  clinicalCorrelations: [
    {
      pathology: 'Sick sinus syndrome (SSS)',
      symptoms: 'Palpitations, syncope, pre-syncope, dyspnoea',
      signs: 'Sinus bradycardia, sinus arrest, sinoatrial exit block on ECG/Holter',
      anatomyExplanation: 'Fibrosis or ischaemia of the SA node impairs automaticity or conduction. The SA nodal artery can be affected by proximal RCA disease.',
      examTag: ['USMLE'],
    },
    {
      pathology: 'Sinus bradycardia from inferior MI',
      anatomyExplanation: 'Occlusion of the RCA proximal to the SA nodal branch (which arises from the proximal RCA in 60% of individuals) can cause SA nodal ischaemia → sinus bradycardia or sinus arrest. This is characteristic of inferior wall MI (right coronary territory).',
      examTag: ['USMLE', 'SMLE'],
    },
  ],
  examPoints: [
    { point: 'SA node is located at the junction of the SVC and the right atrium, within the crista terminalis (sulcus terminalis externally).', examTag: ['USMLE', 'SMLE'], importance: 3 },
    { point: 'SA nodal artery arises from RCA in 60%, LCx in 40% — RCA occlusion → sinus bradycardia.', examTag: ['USMLE', 'SMLE'], importance: 3 },
    { point: 'Intrinsic SA node rate ≈ 100 bpm; resting rate 60–100 bpm due to vagal tone.', examTag: ['USMLE'], importance: 2 },
    { point: 'The pacemaker hierarchy: SA node (60–100) > AV node (40–60) > Purkinje / ventricular cells (20–40 bpm).', examTag: ['USMLE', 'SMLE'], importance: 3 },
  ],
  sources: [SOURCES.graysStudents, SOURCES.moore, SOURCES.fma],
});

// ── AV Node ───────────────────────────────────────────────────

export const CONTENT_AV_NODE = content({
  nodeId: 'FMA:9478',
  description: 'The atrioventricular (AV) node is a small cluster of specialised conduction cells located in the floor of the right atrium at the apex of the triangle of Koch. It is the only normal electrical connection between the atria and ventricles, and it introduces a physiological delay of 0.08–0.12 seconds to allow ventricular filling before contraction.',
  functionText: 'The AV node conducts the impulse from atria to ventricles with a delay (PR interval 0.12–0.20 s on ECG). This "gating" function prevents atrial tachyarrhythmias from conducting 1:1 to the ventricles. It also has subsidiary pacemaker function (junctional escape rate 40–60 bpm) if the SA node fails.',
  locationRelations: {
    anterior: 'Septal leaflet of tricuspid valve',
    posterior: 'Tendon of Todaro (fibrous band from Eustachian valve to central fibrous body)',
    inferior: 'Coronary sinus orifice (apex of triangle of Koch)',
    superior: 'Atrial septum',
  },
  arterialSupply: 'AV nodal artery — arises from the dominant coronary artery at the crux cordis. In right-dominant hearts (70%): from RCA; in left-dominant hearts (10%): from LCx; in co-dominant (20%): may be dual supply. This explains why both RCA and LCx disease can cause AV block.',
  innervation: 'Autonomic: sympathetic increases conduction velocity and shortens PR interval; parasympathetic (vagal) slows AV conduction and prolongs PR interval (or causes heart block in extremis).',
  histology: 'Transitional cells (smaller than atrial cardiomyocytes, fewer myofibrils, sparse gap junctions). The AV node is enclosed in the central fibrous body — an area of dense fibrous tissue at the junction of the four cardiac valves that acts as the electrical insulator between atria and ventricles.',
  anatomicalVariations: [
    {
      description: 'Dual AV nodal pathways (fast and slow pathways within the AV node region) — substrate for AV nodal re-entrant tachycardia (AVNRT), the most common supraventricular tachycardia.',
      prevalenceNote: 'AVNRT represents ~60% of SVTs',
      source: 'Moore 8th ed.',
    },
    {
      description: 'Accessory AV conduction pathways (e.g. Bundle of Kent in WPW syndrome) bypass the AV node, abolishing the normal delay and causing delta waves on ECG.',
      prevalencePercent: 0.1,
      source: "Gray's Anatomy for Students 4th ed.",
    },
  ],
  clinicalCorrelations: [
    {
      pathology: 'AV block',
      symptoms: 'Dizziness, syncope (Stokes-Adams attacks), dyspnoea',
      signs: 'First-degree: prolonged PR >200 ms. Second-degree Mobitz I (Wenckebach): progressive PR prolongation then dropped beat. Second-degree Mobitz II: sudden dropped beat without PR change. Third-degree (complete): P waves and QRS dissociated.',
      anatomyExplanation: 'The AV node is the only normal atrio-ventricular connection. Any structural, ischaemic, or pharmacological impairment of AV node or His-Purkinje system causes graded or complete AV block. Third-degree block from AV nodal disease → junctional escape (narrow QRS, 40–60 bpm); from infranodal disease → ventricular escape (wide QRS, 20–40 bpm).',
      examTag: ['USMLE', 'SMLE'],
    },
    {
      pathology: 'AVNRT (AV nodal re-entrant tachycardia)',
      symptoms: 'Sudden-onset rapid regular palpitations, neck pounding',
      signs: 'Regular narrow-complex tachycardia 150–250 bpm; pseudo-R\' in V1 (retrograde P in QRS)',
      anatomyExplanation: 'Re-entry circuit within the AV nodal region using fast and slow pathways. Terminated by vagal manoeuvres (which slow AV conduction) or adenosine (which briefly blocks AV node).',
      examTag: ['USMLE'],
    },
    {
      pathology: 'Inferior MI causing AV block',
      anatomyExplanation: 'The AV nodal artery arises from the dominant coronary artery at the crux. In 70% of people this is the RCA — therefore proximal RCA occlusion (inferior MI) commonly causes AV block. This is usually reversible as AV nodal ischaemia responds to reperfusion, unlike infranodal block from septal involvement.',
      examTag: ['USMLE', 'SMLE'],
    },
  ],
  examPoints: [
    { point: 'Triangle of Koch boundaries: (1) septal leaflet of tricuspid, (2) tendon of Todaro, (3) coronary sinus orifice. AV node is at the apex.', examTag: ['USMLE', 'SMLE'], importance: 3 },
    { point: 'AV nodal artery from dominant artery at crux — RCA in 70% (right dominant). Inferior MI → AV block.', examTag: ['USMLE', 'SMLE'], importance: 3 },
    { point: 'AV node provides the physiological delay (0.08–0.12 s), visible as the PR interval on ECG.', examTag: ['USMLE', 'SMLE'], importance: 3 },
    { point: 'Junctional escape rate (AV node as backup pacemaker): 40–60 bpm.', examTag: ['USMLE'], importance: 2 },
    { point: 'Adenosine blocks AV node → diagnoses or terminates AV node-dependent tachycardias (AVNRT, AVRT).', examTag: ['USMLE'], importance: 3 },
  ],
  sources: [SOURCES.graysStudents, SOURCES.moore, SOURCES.fma],
});

// ── Left Anterior Descending Artery (LAD) ────────────────────

export const CONTENT_LAD = content({
  nodeId: 'FMA:3862',
  description: 'The anterior interventricular branch of the left coronary artery, universally known as the left anterior descending (LAD) artery, is the largest and clinically most important coronary artery branch. It runs in the anterior interventricular sulcus toward the cardiac apex.',
  functionText: 'Supplies oxygenated blood to the anterior wall of the left ventricle, the anterior two-thirds of the interventricular septum (via septal perforators), and in approximately 80% of individuals, the cardiac apex. Also supplies the anterior papillary muscle of the right ventricle and part of the right ventricular anterior wall.',
  locationRelations: {
    anterior: 'Epicardial surface of the anterior interventricular sulcus',
    posterior: 'Anterior interventricular sulcus groove',
    superior: 'Left main coronary artery bifurcation',
    inferior: 'Cardiac apex (variable)',
  },
  vesselOrigin: 'Arises at the bifurcation of the left main coronary artery (LCA), which itself originates from the left aortic sinus (sinus of Valsalva), immediately above the left coronary cusp of the aortic valve.',
  vesselCourse: 'Descends in the anterior interventricular sulcus toward the apex. In most individuals (80%) wraps around the apex and travels a short distance in the posterior interventricular sulcus. Variable in length (Type I = short, does not reach apex; Type II = just reaches apex; Type III = wraps around apex; Type IV = extends up posterior sulcus).',
  vesselBranches: 'Diagonal branches (D1, D2... ): 1–6 branches supplying the anterolateral left ventricular wall. Septal perforators (S1, S2... ): 2–6 branches plunging into the interventricular septum, supplying the anterior 2/3. Right ventricular branches: small branches to the anterior right ventricular wall.',
  vesselTerritory: 'Anterior wall of the left ventricle; anterior two-thirds of the interventricular septum; cardiac apex (in ~80%); portions of the anterior right ventricular wall; anterior papillary muscle (of the right ventricle); occasionally: SA node (if proximal diagonal supplies it).',
  vesselAnastomoses: 'Distal anastomoses with the posterior descending artery (from RCA in right-dominant circulation). These anastomoses are the basis for collateral circulation in chronic LAD disease.',
  vesselClinical: 'The LAD is known as "the widow maker" — its proximal occlusion causes anterior STEMI with massive left ventricular dysfunction. LAD disease accounts for the majority of anterior myocardial infarctions and carries the highest short-term mortality of any coronary territory. The LAD also supplies the anterior two-thirds of the interventricular septum — LAD infarction can damage the bundle of His and bundle branches, causing left bundle branch block (LBBB) or complete heart block.',
  clinicalCorrelations: [
    {
      pathology: 'Anterior STEMI (ST-elevation myocardial infarction)',
      symptoms: 'Severe crushing central chest pain, radiation to left arm, sweating, nausea',
      signs: 'ST elevation in V1–V4/V5; reciprocal changes inferiorly; new LBBB may indicate proximal LAD occlusion',
      anatomyExplanation: 'Occlusion of the LAD causes ischaemia of the anterior LV wall and septum. Proximal LAD occlusion (before D1) — worst prognosis: affects anterior wall, septum, and diagonal territory. Septal perforators supply the bundle branches; their ischaemia causes LBBB or complete AV block.',
      examTag: ['USMLE', 'SMLE'],
    },
    {
      pathology: 'Ventricular septal defect (VSD) post-MI',
      anatomyExplanation: 'Infarction of the anterior septum (LAD territory, septal perforators) can cause necrosis and rupture of the membranous or muscular septum, producing an acquired VSD. Presents 3–7 days post-MI with new pansystolic murmur, step-up in oxygen saturation from right atrium to right ventricle on catheterisation.',
      examTag: ['USMLE'],
    },
  ],
  examPoints: [
    { point: 'LAD supplies anterior LV wall + anterior 2/3 of interventricular septum (via septal perforators) + apex (~80%).', examTag: ['USMLE', 'SMLE'], importance: 3 },
    { point: 'Proximal LAD occlusion → anterior STEMI (V1–V4), may cause LBBB (septal perforator ischaemia → bundle branch damage).', examTag: ['USMLE', 'SMLE'], importance: 3 },
    { point: 'LAD wraps apex in ~80% — in these individuals, an apical infarct is an LAD infarct.', examTag: ['USMLE'], importance: 2, },
    { point: 'Post-MI VSD (3–7 days) → anterior septal necrosis → LAD territory complication.', examTag: ['USMLE'], importance: 2 },
  ],
  sources: [SOURCES.graysStudents, SOURCES.moore, SOURCES.grays41],
});

// ── Fossa Ovalis ──────────────────────────────────────────────

export const CONTENT_FOSSA_OVALIS = content({
  nodeId: 'FMA:9246',
  description: 'The fossa ovalis is an oval-shaped depression in the interatrial septum on the right atrial surface, corresponding to the site of the foramen ovale in fetal circulation. It is the remnant of the primary atrial septal opening that permitted right-to-left shunting of blood in fetal life.',
  functionText: 'No active function in postnatal life; it is a morphological remnant. In fetal circulation, the corresponding foramen ovale allowed oxygenated blood from the placenta (entering via the IVC) to pass from the right atrium to the left atrium, bypassing the non-functional lungs.',
  locationRelations: {
    medial: 'Centre of the interatrial septum',
    anterior: 'Tricuspid valve orifice',
    posterior: 'Coronary sinus orifice and AV nodal region',
    superior: 'Limbus fossae ovalis (muscular rim — remnant of septum secundum)',
  },
  embryologicalOrigin: 'The foramen ovale is formed during cardiac septation (weeks 4–5). The septum primum grows from the roof of the common atrium toward the endocardial cushions; before reaching them, the ostium primum exists, then the ostium secundum forms above. The septum secundum grows alongside the septum primum, leaving a gap (the foramen ovale) covered only by the flap of septum primum. At birth, elevated left atrial pressure presses the septum primum against the septum secundum, functionally closing the foramen. Anatomical fusion is complete by ~2 years of age in 75% of individuals; in ~25% the flap remains unfused (PFO).',
  clinicalCorrelations: [
    {
      pathology: 'Patent foramen ovale (PFO)',
      symptoms: 'Usually asymptomatic; may present with cryptogenic stroke',
      signs: 'Detected on contrast echo ("bubble study") showing right-to-left passage of microbubbles, especially with Valsalva',
      anatomyExplanation: 'The flap of the septum primum fails to fuse with the septum secundum. The PFO acts as a potential right-to-left shunt, especially when right atrial pressure transiently exceeds left (Valsalva, coughing, straining). Venous thrombi can cross (paradoxical embolism) causing stroke, TIA, or peripheral arterial occlusion. PFO is found in ~40–50% of cryptogenic stroke patients.',
      examTag: ['USMLE'],
    },
    {
      pathology: 'Atrial septal defect (ASD) — secundum type',
      anatomyExplanation: 'True absence of septal tissue in the fossa ovalis region (distinct from PFO which is a flap defect). The most common form of ASD (70% of ASDs). Causes left-to-right shunting, right heart dilation, and eventual right heart failure. Associated with stroke, atrial arrhythmias, and paradoxical embolism.',
      examTag: ['USMLE', 'SMLE'],
    },
    {
      pathology: 'Transcatheter procedures',
      anatomyExplanation: 'The fossa ovalis is deliberately crossed in multiple cardiac catheterisation procedures: transseptal puncture for left-sided procedures (mitral valvuloplasty, WATCHMAN LAA closure, ablation of left-sided arrhythmias). The thinness of the membrane at the fossa ovalis makes it the preferred puncture site.',
      examTag: ['USMLE'],
    },
  ],
  examPoints: [
    { point: 'Fossa ovalis = remnant of foramen ovale; limbus fossae ovalis = remnant of septum secundum (the firm rim).', examTag: ['USMLE', 'SMLE'], importance: 3 },
    { point: 'PFO persists in ~25% of adults; associated with cryptogenic stroke (paradoxical embolism).', examTag: ['USMLE', 'SMLE'], importance: 3 },
    { point: 'Septum primum → valve/flap of foramen ovale. Septum secundum → limbus fossae ovalis.', examTag: ['USMLE'], importance: 2 },
    { point: 'Functional closure at birth (elevated LA pressure); anatomical fusion by ~age 2 in 75%.', examTag: ['USMLE'], importance: 2 },
  ],
  sources: [SOURCES.graysStudents, SOURCES.moore, SOURCES.fma],
});

// ── Mitral Valve ──────────────────────────────────────────────

export const CONTENT_MITRAL_VALVE = content({
  nodeId: 'FMA:7235',
  description: 'The mitral valve (left atrioventricular valve, bicuspid valve) is the two-leaflet valve separating the left atrium from the left ventricle. It opens during diastole to allow ventricular filling and closes during systole to prevent regurgitation of blood into the left atrium.',
  functionText: 'The mitral valve ensures unidirectional blood flow from the left atrium to the left ventricle during diastole, and prevents backflow into the left atrium during left ventricular systole. Unlike the semilunar valves, the mitral and tricuspid valves require the support of chordae tendineae and papillary muscles to prevent leaflet eversion (prolapse) during the high systolic pressures generated by the left ventricle.',
  locationRelations: {
    anterior: 'Left ventricular outflow tract (aortic vestibule)',
    posterior: 'Posterior left ventricular wall',
    superior: 'Left atrium',
    inferior: 'Left ventricular cavity',
  },
  arterialSupply: 'Left circumflex artery (posterior leaflet predominantly) and LAD diagonal branches (anterior leaflet). The anterolateral papillary muscle has dual blood supply (LAD + LCx); the posteromedial papillary muscle has single blood supply (RCA or LCx depending on dominance) — making it more vulnerable to ischaemia.',
  innervation: 'No direct innervation of the valve leaflets; the surrounding myocardium and papillary muscles are innervated by the autonomic nervous system.',
  histology: 'Each leaflet consists of four layers from atrial to ventricular surface: (1) atrialis (elastin-rich, facing atrium), (2) spongiosa (loose connective tissue), (3) fibrosa (dense collagen, the structural core, continuous with the chordae tendineae), (4) ventricularis (elastin-rich, facing ventricle). The annulus fibrosus at the base is fibrocartilaginous.',
  anatomicalVariations: [
    {
      description: 'Mitral valve prolapse (MVP) — billowing of one or both leaflets into the left atrium during systole due to redundant, myxomatous leaflet tissue.',
      prevalencePercent: 2.4,
      source: 'Moore 8th ed.; Netter clinical notes',
    },
    {
      description: 'Accessory mitral valve tissue (supramitral ring) — rare, can cause functional stenosis.',
      prevalenceNote: 'Rare',
    },
  ],
  clinicalCorrelations: [
    {
      pathology: 'Mitral stenosis',
      symptoms: 'Exertional dyspnoea, orthopnoea, haemoptysis, palpitations (atrial fibrillation)',
      signs: 'Loud S1, opening snap after S2, mid-diastolic rumble at apex (low-pitched, best heard in left lateral decubitus with bell). Malar flush. Atrial fibrillation.',
      anatomyExplanation: 'Usually caused by rheumatic heart disease → leaflet thickening, fusion of commissures, chordal shortening/fusion. The valve orifice area is reduced (normal 4–6 cm²; stenosis <2 cm²). Left atrial pressure rises → left atrial dilatation → AF → pulmonary hypertension → right heart failure.',
      examTag: ['USMLE', 'SMLE'],
    },
    {
      pathology: 'Mitral regurgitation',
      symptoms: 'Dyspnoea, fatigue, palpitations',
      signs: 'Pansystolic murmur at apex radiating to axilla; displaced hyperdynamic apex; soft S1',
      anatomyExplanation: 'Blood leaks backward from LV into LA during systole. Causes: MVP (mitral valve prolapse), ischaemic papillary muscle rupture (most often the posteromedial — single blood supply from RCA), infective endocarditis, rheumatic disease, dilated cardiomyopathy (annular dilation).',
      examTag: ['USMLE', 'SMLE'],
    },
    {
      pathology: 'Papillary muscle rupture (post-MI)',
      symptoms: 'Acute pulmonary oedema 2–7 days after MI',
      signs: 'New loud pansystolic murmur at apex, acute haemodynamic collapse',
      anatomyExplanation: 'The posteromedial papillary muscle is supplied only by the dominant coronary artery (RCA in 70%). Its rupture — even partial — causes acute severe mitral regurgitation. The anterolateral papillary muscle is less vulnerable (dual supply from LAD diagonals + LCx). Surgical emergency.',
      examTag: ['USMLE', 'SMLE'],
    },
  ],
  clinicalExamination: 'Auscultation at the mitral area (apex — 5th ICS, midclavicular line), best with patient in left lateral decubitus, using the bell for low-pitched sounds (opening snap and diastolic rumble of stenosis) and diaphragm for high-pitched sounds (pansystolic murmur of regurgitation). The opening snap timing after S2 reflects the severity of stenosis (closer = more severe).',
  proceduresSurgical: 'Mitral valve repair preferred over replacement when feasible. Approach: median sternotomy or right minithoracotomy. Cardiopulmonary bypass with aortic cross-clamp. The left atrium is accessed via the right pulmonary veins or interatrial groove. Surgical landmarks: left circumflex artery runs within 5 mm of the posterior mitral annulus — sutures placed too deep risk circumflex injury → inferior MI on table. Transcatheter mitral valve repair (MitraClip/TEER): clips the anterior and posterior leaflets together, reducing regurgitation.',
  imagingAppearance: {
    xray: 'Mitral stenosis: left atrial enlargement (double density, left heart border straightening, elevation of left main bronchus). Pulmonary venous hypertension: upper lobe blood diversion, Kerley B lines, pulmonary oedema.',
    ct: 'Gated CT: valve leaflet morphology, annular calcification (Mitral Annular Calcification — MAC). CT planning for transcatheter procedures (TMVR).',
    mri: 'CMR: planimetry of valve area in stenosis; regurgitant fraction quantification; visualisation of prolapsing segments.',
    ultrasound: 'TTE/TOE gold standard. Hockey-stick appearance of anterior leaflet in rheumatic stenosis. Mitral valve area by planimetry or pressure half-time. Colour Doppler shows direction and severity of regurgitation.',
  },
  examPoints: [
    { point: 'Mitral valve has 2 leaflets (bicuspid): anterior (aortic) and posterior (mural).', examTag: ['USMLE', 'SMLE'], importance: 2 },
    { point: 'The posteromedial papillary muscle has a SINGLE blood supply (RCA or LCx, not both) → most vulnerable to ischaemia → most common cause of ischaemic mitral regurgitation.', examTag: ['USMLE', 'SMLE'], importance: 3 },
    { point: 'Mitral stenosis: opening snap + mid-diastolic rumble. Severity inversely correlates with S2-OS interval.', examTag: ['USMLE', 'SMLE'], importance: 3 },
    { point: 'The left circumflex artery runs close to the posterior mitral annulus — at risk during mitral surgery.', examTag: ['USMLE'], importance: 2 },
    { point: 'Most common cause of mitral stenosis: rheumatic heart disease. Most common cause of isolated mitral regurgitation in developed countries: mitral valve prolapse.', examTag: ['USMLE', 'SMLE'], importance: 3 },
  ],
  sources: [SOURCES.graysStudents, SOURCES.moore, SOURCES.grays41],
});

// ── Moderator Band ────────────────────────────────────────────

export const CONTENT_MODERATOR_BAND = content({
  nodeId: 'FMA:7272',
  description: 'The moderator band (septomarginal trabecula) is a rounded muscular band that crosses the cavity of the right ventricle from the interventricular septum to the base of the anterior papillary muscle. It is a normal structure that carries the right bundle branch within the right ventricular myocardium.',
  functionText: 'The moderator band carries the right bundle branch — the right limb of the cardiac conduction system — from the interventricular septum to the anterior papillary muscle of the right ventricle. This shortens the conduction pathway to the right ventricular free wall and anterior papillary muscle, synchronising contraction and preventing premature activation of the anterior right ventricular wall.',
  locationRelations: {
    medial: 'Interventricular septum (origin)',
    lateral: 'Base of anterior papillary muscle of right ventricle (insertion)',
    anterior: 'Right ventricular cavity',
  },
  histology: 'Composed of cardiac muscle (trabecula carneae) with a core of specialised conducting fibres (Purkinje-type cells) representing the distal right bundle branch. The muscular coat is covered by endocardium.',
  anatomicalVariations: [
    {
      description: 'Variable size and prominence; it may be absent (right bundle branch then runs subendocardially without a discrete moderator band) or duplicated.',
      source: "Gray's Anatomy for Students 4th ed.",
    },
    {
      description: 'False tendons (left ventricular false chords) are the left ventricular equivalent — they do not carry the bundle branch and are a normal variant often visible on echocardiography.',
    },
  ],
  clinicalCorrelations: [
    {
      pathology: 'Right bundle branch block (RBBB)',
      signs: 'RSR\' pattern in V1 ("M" pattern); wide slurred S in V5/V6 and I; QRS >120 ms',
      anatomyExplanation: 'Damage to the right bundle branch (which traverses the moderator band to reach the right ventricular free wall) causes delayed right ventricular activation — the right ventricle is depolarised late, from left to right, producing the RBBB pattern on ECG. The moderator band is also at risk during right ventricular biopsy or catheter instrumentation.',
      examTag: ['USMLE', 'SMLE'],
    },
    {
      pathology: 'Catheter-induced RBBB',
      anatomyExplanation: 'Right heart catheterisation with a stiff catheter or Swan-Ganz balloon can traumatise the right bundle branch as it traverses the moderator band, causing transient or permanent RBBB. In a patient with pre-existing LBBB, this can cause complete heart block — an indication for temporary pacing before right heart catheterisation.',
      examTag: ['USMLE'],
    },
  ],
  examPoints: [
    { point: 'Moderator band (trabecula septomarginalis) carries the RIGHT bundle branch from septum to anterior papillary muscle.', examTag: ['USMLE', 'SMLE'], importance: 3 },
    { point: 'It is a normal structure, not a pathological band — visible on echocardiography and not to be confused with intracardiac mass.', examTag: ['USMLE'], importance: 2 },
    { point: 'Catheter instrumentation of the right heart can damage the moderator band → RBBB; high risk if patient has pre-existing LBBB → complete block.', examTag: ['USMLE'], importance: 2 },
  ],
  sources: [SOURCES.graysStudents, SOURCES.moore, SOURCES.fma],
});

// ── Right Coronary Artery ─────────────────────────────────────

export const CONTENT_RCA = content({
  nodeId: 'FMA:50039',
  description: 'The right coronary artery (RCA) is one of two main coronary arteries arising from the aortic sinuses. It arises from the right aortic sinus (anterior sinus, right coronary sinus) and travels in the right atrioventricular (coronary) groove.',
  vesselOrigin: 'Arises from the right (anterior) aortic sinus of Valsalva, just above the right coronary cusp of the aortic valve.',
  vesselCourse: 'Emerges from the right aortic sinus, passes between the pulmonary trunk and the right atrial appendage. Descends in the right atrioventricular groove (coronary sulcus), curves around the right heart border, and continues in the inferior atrioventricular groove to the crux cordis (the posterior intersection of the atrioventricular and interventricular grooves on the diaphragmatic surface).',
  vesselBranches: 'Conus artery (to right ventricular outflow, first branch, supplies infundibulum); SA nodal artery (to SA node, first or second branch in 60% of individuals); Right marginal (acute marginal) artery (to right ventricular free wall); Posterior descending artery (PDA, at crux in right-dominant circulation — supplies posterior IVS); AV nodal artery (at crux, to AV node); Posterior left ventricular branches (PLV, in dominant right circulation).',
  vesselTerritory: 'Right ventricle (free wall); inferior wall of left ventricle (in right-dominant circulation); posterior one-third of interventricular septum; SA node (60%); AV node (right-dominant, 70%).',
  vesselAnastomoses: 'Distal anastomoses with LAD at the apex (PDA meets LAD). Conus artery (RCA) anastomoses with LAD conus branch — the "Vieussens\' ring," an important collateral in proximal LAD occlusion.',
  clinicalCorrelations: [
    {
      pathology: 'Inferior STEMI',
      signs: 'ST elevation in II, III, aVF; reciprocal depression in I, aVL',
      anatomyExplanation: 'RCA occlusion affects the inferior LV wall (diaphragmatic surface). Patients should be assessed for associated right ventricular MI (RV leads V3R, V4R — ST elevation indicates RV involvement). Fluid resuscitation is critical in RV MI (preload-dependent); nitrates and diuretics are dangerous (reduce preload further).',
      examTag: ['USMLE', 'SMLE'],
    },
    {
      pathology: 'Sinus bradycardia / AV block with inferior MI',
      anatomyExplanation: 'SA nodal artery (60% from RCA) and AV nodal artery (70% from RCA at crux) are at risk with proximal RCA occlusion. Inferior MI commonly causes sinus bradycardia, AV block (usually Mobitz I/Wenckebach, reversible with reperfusion, responds to atropine).',
      examTag: ['USMLE', 'SMLE'],
    },
  ],
  examPoints: [
    { point: 'RCA supplies SA node (60%), AV node (right-dominant, 70%), inferior LV wall, posterior 1/3 of IVS.', examTag: ['USMLE', 'SMLE'], importance: 3 },
    { point: 'Inferior STEMI: occlusion of RCA → II, III, aVF changes. Check right-sided leads for RV MI.', examTag: ['USMLE', 'SMLE'], importance: 3 },
    { point: 'Coronary dominance defined by which artery gives rise to the posterior descending artery (PDA) at the crux: 70% right, 20% co-dominant, 10% left (Hurst definition).', examTag: ['USMLE', 'SMLE'], importance: 3 },
  ],
  sources: [SOURCES.graysStudents, SOURCES.moore],
});

// ── Export all content records ────────────────────────────────

export const ALL_HEART_CONTENT: AnatomyContent[] = [
  CONTENT_HEART,
  CONTENT_SA_NODE,
  CONTENT_AV_NODE,
  CONTENT_LAD,
  CONTENT_FOSSA_OVALIS,
  CONTENT_MITRAL_VALVE,
  CONTENT_MODERATOR_BAND,
  CONTENT_RCA,
];
