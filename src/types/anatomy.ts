// ============================================================
// Passboard Anatomy Module — TypeScript Types
// Mirrors the DB schema exactly. Keep in sync with migration.
// ============================================================

export type AnatomySex = 'male' | 'female' | 'both';

export type AnatomyStructureType =
  | 'bone' | 'muscle' | 'joint' | 'nerve'
  | 'artery' | 'vein' | 'lymphatic' | 'organ'
  | 'ligament' | 'fascia' | 'tendon' | 'bursa'
  | 'gland' | 'region' | 'cavity' | 'other';

export type AnatomyReviewStatus = 'draft' | 'reviewed' | 'approved';

export type AnatomyLayer =
  | 'skin' | 'superficial_fascia'
  | 'muscle_superficial' | 'muscle_deep'
  | 'skeleton' | 'organ' | 'nerve'
  | 'artery' | 'vein' | 'lymphatic';

export type AnatomyLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type QuizType = 'identification' | 'naming' | 'clinical_vignette';
export type TutorMode = 'explain' | 'exam' | 'clinical' | 'socratic';

// ── Hierarchy node ────────────────────────────────────────────

export interface AnatomyNode {
  id: string;                    // "FMA:7088"
  fmaId: number | null;
  fmaUri: string | null;
  ta2Id: number | null;
  nameEn: string;
  nameLatin: string | null;
  nameAr: string | null;
  nameFma: string | null;
  nameClinical: string | null;
  synonyms: string[];
  abbreviations: string[];
  parentId: string | null;
  level: AnatomyLevel;
  regionTags: string[];
  systemTags: string[];
  structureType: AnatomyStructureType;
  sex: AnatomySex;
  layer: AnatomyLayer | null;
  meshIds: string[];
  contentId: string | null;
  modelPending: boolean;
  highlightColor: string | null;  // hex e.g. "#e53e3e"
  sortOrder: number;
  // Populated on demand
  children?: AnatomyNode[];
  content?: AnatomyContent;
}

// ── Source citation ───────────────────────────────────────────

export interface AnatomySource {
  author: string;
  title: string;
  edition?: string;
  page?: string;
  url?: string;
  year?: number;
}

// ── Structured content sub-types ──────────────────────────────

export interface LocationRelations {
  anterior?: string;
  posterior?: string;
  superior?: string;
  inferior?: string;
  medial?: string;
  lateral?: string;
  deep?: string;
  superficial?: string;
}

export interface AnatomicalVariation {
  description: string;
  prevalencePercent?: number;
  prevalenceNote?: string;  // for ranges or qualitative data
  source?: string;
}

export interface ClinicalCorrelation {
  pathology: string;
  signs?: string;
  symptoms?: string;
  anatomyExplanation: string;
  examTag?: ('USMLE' | 'SMLE')[];
}

export interface ImagingAppearance {
  xray?: string;
  ct?: string;
  mri?: string;
  ultrasound?: string;
  nuclear?: string;
}

export interface ExamPoint {
  point: string;
  examTag: ('USMLE' | 'SMLE')[];
  importance: 1 | 2 | 3;   // 3 = highest yield
}

export interface OssificationCentre {
  name: string;
  timingWeeksOrYears: string;
  type: 'primary' | 'secondary';
  source?: string;
}

export interface CommonFracture {
  name: string;
  mechanism: string;
  eponym?: string;
  complication?: string;
}

export interface JointLigament {
  name: string;
  attachmentFrom: string;
  attachmentTo: string;
  function: string;
}

export interface NerveLesion {
  site: string;
  presentation: string;
  eponym?: string;
}

// ── Full content record ───────────────────────────────────────

export interface AnatomyContent {
  id: string;
  nodeId: string;

  // Universal
  description: string | null;
  functionText: string | null;
  locationRelations: LocationRelations | null;
  arterialSupply: string | null;
  venousDrainage: string | null;
  lymphaticDrainage: string | null;
  innervation: string | null;
  embryologicalOrigin: string | null;
  histology: string | null;
  anatomicalVariations: AnatomicalVariation[];
  clinicalCorrelations: ClinicalCorrelation[];
  clinicalExamination: string | null;
  proceduresSurgical: string | null;
  imagingAppearance: ImagingAppearance | null;
  examPoints: ExamPoint[];
  sexDifferences: string | null;

  // Muscle
  muscleOrigin: string | null;
  muscleInsertion: string | null;
  muscleAction: string | null;
  muscleInnervation: string | null;
  muscleBloodSupply: string | null;
  muscleTest: string | null;

  // Bone
  boneParts: string | null;
  ossificationCentres: OssificationCentre[];
  boneArticulations: string | null;
  boneAttachments: string | null;
  commonFractures: CommonFracture[];

  // Joint
  jointType: string | null;
  articularSurfaces: string | null;
  jointLigaments: JointLigament[];
  jointMovements: string | null;
  stabilityFactors: string | null;
  commonInjuries: string | null;

  // Nerve
  nerveRootValues: string | null;
  nerveCourse: string | null;
  nerveBranches: string | null;
  nerveMotor: string | null;
  nerveSensory: string | null;
  nerveLesion: NerveLesion[];

  // Vessel
  vesselOrigin: string | null;
  vesselCourse: string | null;
  vesselBranches: string | null;
  vesselTerritory: string | null;
  vesselAnastomoses: string | null;
  vesselClinical: string | null;

  // Organ
  organSurfaces: string | null;
  organBorders: string | null;
  organPeritoneal: string | null;
  organSegments: string | null;
  referredPain: string | null;

  // Governance
  sources: AnatomySource[];
  reviewStatus: AnatomyReviewStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

// ── Mesh mapping ──────────────────────────────────────────────

export interface AnatomyMeshMapping {
  id: number;
  glbFile: string;
  meshName: string;
  nodeId: string;
  sex: AnatomySex;
  lodLevel: 0 | 1 | 2;
}

// ── Quiz ──────────────────────────────────────────────────────

export interface QuizAttempt {
  id: number;
  userId: string;
  nodeId: string;
  quizType: QuizType;
  correct: boolean;
  responseMs: number | null;
  nextReview: string | null;
  intervalDays: number;
  easeFactor: number;
  createdAt: string;
}

export interface QuizQuestion {
  type: QuizType;
  targetNode: AnatomyNode;
  distractors?: AnatomyNode[];  // for naming questions
  vignette?: string;            // for clinical vignette type
}

// ── Viewer state (Zustand) ────────────────────────────────────

export interface LayerVisibility {
  skin: boolean;
  superficial_fascia: boolean;
  muscle_superficial: boolean;
  muscle_deep: boolean;
  skeleton: boolean;
  organ: boolean;
  nerve: boolean;
  artery: boolean;
  vein: boolean;
  lymphatic: boolean;
}

export interface ClipPlane {
  axis: 'axial' | 'sagittal' | 'coronal';
  position: number;   // -1 to +1
  enabled: boolean;
  radiologicalView: boolean;  // axial: viewed from feet (radiology convention)
}

export interface AnatomyViewerState {
  sex: AnatomySex;
  selectedNodeId: string | null;
  breadcrumb: string[];        // node IDs from root to current
  layerVisibility: LayerVisibility;
  clipPlane: ClipPlane;
  xrayOpacity: number;         // 0–1
  dissectionLayer: number;     // index into ordered dissection sequence
  showLabels: boolean;
  showSurfaceAnatomy: boolean;
  showDermatomes: boolean;
  showMyotomes: boolean;
  isolatedNodeIds: string[];
  hiddenNodeIds: string[];
  cameraTarget: [number, number, number];
  cameraPosition: [number, number, number];
  isAnimating: boolean;        // physiology animation playing
  animationId: string | null;
  animationSpeed: number;      // 0.25 | 0.5 | 1 | 2
  tutorMode: TutorMode;
  tutorSessionId: string | null;
  quizActive: boolean;
  searchQuery: string;
}

// ── API response shapes ───────────────────────────────────────

export interface AnatomySearchResult {
  nodeId: string;
  nameEn: string;
  nameLatin: string | null;
  nameAr: string | null;
  structureType: AnatomyStructureType;
  regionTags: string[];
  systemTags: string[];
  matchField: 'name_en' | 'name_latin' | 'synonym' | 'abbreviation';
  rank: number;
}

export interface TutorMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  structureIds?: string[];  // IDs for viewer to act on
  viewerActions?: ViewerAction[];
}

export interface ViewerAction {
  type: 'highlight' | 'fly_to' | 'isolate' | 'show_layer' | 'animate' | 'trace_path';
  nodeId?: string;
  nodeIds?: string[];
  layer?: AnatomyLayer;
  animationId?: string;
}

// ── Error report ──────────────────────────────────────────────

export interface ErrorReport {
  nodeId: string;
  fieldName?: string;
  description: string;
}

// ── Progress ──────────────────────────────────────────────────

export interface UserProgress {
  region: string;
  system: string;
  structuresAttempted: number;
  structuresCorrect: number;
  accuracyPct: number;
  lastAttempt: string;
}
