// ============================================================
// Passboard Anatomy Module — Zustand Store
// ============================================================
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type {
  AnatomySex, AnatomyNode, AnatomyContent, TutorMode,
  LayerVisibility, ClipPlane, ViewerAction, AnatomyViewerState,
} from '@/types/anatomy';

// Default anatomical position camera (slightly elevated front view)
const DEFAULT_CAMERA_POSITION: [number, number, number] = [0, 0, 3.5];
const DEFAULT_CAMERA_TARGET:   [number, number, number] = [0, 0, 0];

const DEFAULT_LAYERS: LayerVisibility = {
  skin:               true,
  superficial_fascia: false,
  muscle_superficial: false,
  muscle_deep:        false,
  skeleton:           false,
  organ:              false,
  nerve:              false,
  artery:             false,
  vein:               false,
  lymphatic:          false,
};

const DEFAULT_CLIP: ClipPlane = {
  axis: 'axial',
  position: 0,
  enabled: false,
  radiologicalView: true,
};

// ── Store interface ───────────────────────────────────────────

interface AnatomyStore extends AnatomyViewerState {
  // Cached data (not persisted)
  nodeCache: Record<string, AnatomyNode>;
  contentCache: Record<string, AnatomyContent>;
  childrenCache: Record<string, string[]>;  // nodeId -> child IDs

  // Actions — Sex / model selection
  setSex: (sex: AnatomySex) => void;

  // Actions — Navigation
  selectNode: (nodeId: string | null) => void;
  drillDown: (nodeId: string) => void;
  navigateTo: (breadcrumb: string[]) => void;
  goBack: () => void;
  resetView: () => void;

  // Actions — Layer control
  setLayerVisible: (layer: keyof LayerVisibility, visible: boolean) => void;
  setAllLayers: (visible: boolean) => void;
  peelLayer: () => void;                // dissection mode: next layer
  resetDissection: () => void;

  // Actions — Clip plane
  setClipPlane: (updates: Partial<ClipPlane>) => void;
  toggleClipPlane: () => void;

  // Actions — Visibility
  setXrayOpacity: (opacity: number) => void;
  isolateNode: (nodeId: string) => void;
  hideNode: (nodeId: string) => void;
  showAllNodes: () => void;

  // Actions — Overlays
  toggleLabels: () => void;
  toggleSurfaceAnatomy: () => void;
  toggleDermatomes: () => void;
  toggleMyotomes: () => void;

  // Actions — Camera
  setCameraTarget: (pos: [number, number, number]) => void;
  setCameraPosition: (pos: [number, number, number]) => void;

  // Actions — Animation
  playAnimation: (animationId: string) => void;
  stopAnimation: () => void;
  setAnimationSpeed: (speed: number) => void;

  // Actions — AI Tutor
  setTutorMode: (mode: TutorMode) => void;
  setTutorSessionId: (id: string | null) => void;
  applyViewerActions: (actions: ViewerAction[]) => void;

  // Actions — Quiz
  setQuizActive: (active: boolean) => void;

  // Actions — Search
  setSearchQuery: (query: string) => void;

  // Cache setters (called from API hooks)
  cacheNode: (node: AnatomyNode) => void;
  cacheContent: (nodeId: string, content: AnatomyContent) => void;
  cacheChildren: (nodeId: string, childIds: string[]) => void;
}

// ── Dissection sequence (anatomical order) ────────────────────
const DISSECTION_ORDER: (keyof LayerVisibility)[] = [
  'skin', 'superficial_fascia', 'muscle_superficial',
  'muscle_deep', 'skeleton', 'organ', 'nerve', 'artery', 'vein', 'lymphatic',
];

// ── Store ─────────────────────────────────────────────────────

export const useAnatomyStore = create<AnatomyStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    sex: 'male',
    selectedNodeId: null,
    breadcrumb: [],
    layerVisibility: DEFAULT_LAYERS,
    clipPlane: DEFAULT_CLIP,
    xrayOpacity: 1,
    dissectionLayer: 0,
    showLabels: true,
    showSurfaceAnatomy: false,
    showDermatomes: false,
    showMyotomes: false,
    isolatedNodeIds: [],
    hiddenNodeIds: [],
    cameraTarget: DEFAULT_CAMERA_TARGET,
    cameraPosition: DEFAULT_CAMERA_POSITION,
    isAnimating: false,
    animationId: null,
    animationSpeed: 1,
    tutorMode: 'explain',
    tutorSessionId: null,
    quizActive: false,
    searchQuery: '',
    nodeCache: {},
    contentCache: {},
    childrenCache: {},

    // ── Sex ──────────────────────────────────────────────────
    setSex: (sex) => set({
      sex,
      selectedNodeId: null,
      breadcrumb: [],
      isolatedNodeIds: [],
      hiddenNodeIds: [],
      layerVisibility: DEFAULT_LAYERS,
    }),

    // ── Navigation ───────────────────────────────────────────
    selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

    drillDown: (nodeId) => {
      const { breadcrumb } = get();
      // Avoid duplicating if already at this node
      if (breadcrumb[breadcrumb.length - 1] === nodeId) return;
      set({ selectedNodeId: nodeId, breadcrumb: [...breadcrumb, nodeId] });
    },

    navigateTo: (breadcrumb) => set({
      breadcrumb,
      selectedNodeId: breadcrumb[breadcrumb.length - 1] ?? null,
    }),

    goBack: () => {
      const { breadcrumb } = get();
      if (breadcrumb.length === 0) return;
      const next = breadcrumb.slice(0, -1);
      set({
        breadcrumb: next,
        selectedNodeId: next[next.length - 1] ?? null,
        isolatedNodeIds: [],
      });
    },

    resetView: () => set({
      selectedNodeId: null,
      breadcrumb: [],
      isolatedNodeIds: [],
      hiddenNodeIds: [],
      layerVisibility: DEFAULT_LAYERS,
      xrayOpacity: 1,
      dissectionLayer: 0,
      cameraTarget: DEFAULT_CAMERA_TARGET,
      cameraPosition: DEFAULT_CAMERA_POSITION,
      showLabels: true,
      showSurfaceAnatomy: false,
      showDermatomes: false,
      showMyotomes: false,
    }),

    // ── Layers ───────────────────────────────────────────────
    setLayerVisible: (layer, visible) =>
      set((s) => ({ layerVisibility: { ...s.layerVisibility, [layer]: visible } })),

    setAllLayers: (visible) =>
      set({ layerVisibility: Object.fromEntries(
        Object.keys(DEFAULT_LAYERS).map((k) => [k, visible])
      ) as unknown as LayerVisibility }),

    peelLayer: () => {
      const { dissectionLayer, layerVisibility } = get();
      const nextIdx = dissectionLayer + 1;
      if (nextIdx >= DISSECTION_ORDER.length) return;
      const layerToHide = DISSECTION_ORDER[dissectionLayer];
      const layerToShow = DISSECTION_ORDER[nextIdx];
      set({
        dissectionLayer: nextIdx,
        layerVisibility: {
          ...layerVisibility,
          [layerToHide]: false,
          [layerToShow]: true,
        },
      });
    },

    resetDissection: () => set({
      dissectionLayer: 0,
      layerVisibility: DEFAULT_LAYERS,
    }),

    // ── Clip plane ───────────────────────────────────────────
    setClipPlane: (updates) =>
      set((s) => ({ clipPlane: { ...s.clipPlane, ...updates } })),

    toggleClipPlane: () =>
      set((s) => ({ clipPlane: { ...s.clipPlane, enabled: !s.clipPlane.enabled } })),

    // ── Visibility ───────────────────────────────────────────
    setXrayOpacity: (opacity) => set({ xrayOpacity: Math.max(0, Math.min(1, opacity)) }),

    isolateNode: (nodeId) =>
      set((s) => ({
        isolatedNodeIds: s.isolatedNodeIds.includes(nodeId)
          ? s.isolatedNodeIds.filter((id) => id !== nodeId)
          : [...s.isolatedNodeIds, nodeId],
      })),

    hideNode: (nodeId) =>
      set((s) => ({
        hiddenNodeIds: s.hiddenNodeIds.includes(nodeId)
          ? s.hiddenNodeIds.filter((id) => id !== nodeId)
          : [...s.hiddenNodeIds, nodeId],
      })),

    showAllNodes: () => set({ isolatedNodeIds: [], hiddenNodeIds: [] }),

    // ── Overlays ─────────────────────────────────────────────
    toggleLabels:        () => set((s) => ({ showLabels:        !s.showLabels })),
    toggleSurfaceAnatomy:() => set((s) => ({ showSurfaceAnatomy:!s.showSurfaceAnatomy })),
    toggleDermatomes:    () => set((s) => ({ showDermatomes:    !s.showDermatomes })),
    toggleMyotomes:      () => set((s) => ({ showMyotomes:      !s.showMyotomes })),

    // ── Camera ───────────────────────────────────────────────
    setCameraTarget:   (pos) => set({ cameraTarget: pos }),
    setCameraPosition: (pos) => set({ cameraPosition: pos }),

    // ── Animation ────────────────────────────────────────────
    playAnimation: (animationId) => set({ isAnimating: true, animationId }),
    stopAnimation: () => set({ isAnimating: false, animationId: null }),
    setAnimationSpeed: (speed) => set({ animationSpeed: speed }),

    // ── AI Tutor ─────────────────────────────────────────────
    setTutorMode:      (mode) => set({ tutorMode: mode }),
    setTutorSessionId: (id)   => set({ tutorSessionId: id }),

    applyViewerActions: (actions) => {
      for (const action of actions) {
        switch (action.type) {
          case 'highlight':
            if (action.nodeId) set((s) => ({ isolatedNodeIds: [action.nodeId!] }));
            break;
          case 'isolate':
            if (action.nodeIds) set({ isolatedNodeIds: action.nodeIds });
            break;
          case 'fly_to':
            if (action.nodeId) get().drillDown(action.nodeId);
            break;
          case 'show_layer':
            if (action.layer) get().setLayerVisible(action.layer as keyof LayerVisibility, true);
            break;
          case 'animate':
            if (action.animationId) get().playAnimation(action.animationId);
            break;
        }
      }
    },

    // ── Quiz ─────────────────────────────────────────────────
    setQuizActive: (active) => set({ quizActive: active }),

    // ── Search ───────────────────────────────────────────────
    setSearchQuery: (query) => set({ searchQuery: query }),

    // ── Cache ────────────────────────────────────────────────
    cacheNode: (node) =>
      set((s) => ({ nodeCache: { ...s.nodeCache, [node.id]: node } })),

    cacheContent: (nodeId, content) =>
      set((s) => ({ contentCache: { ...s.contentCache, [nodeId]: content } })),

    cacheChildren: (nodeId, childIds) =>
      set((s) => ({ childrenCache: { ...s.childrenCache, [nodeId]: childIds } })),
  }))
);

// ── Selectors ─────────────────────────────────────────────────

export const selectCurrentNode = (s: AnatomyStore): AnatomyNode | null =>
  s.selectedNodeId ? (s.nodeCache[s.selectedNodeId] ?? null) : null;

export const selectBreadcrumbNodes = (s: AnatomyStore): AnatomyNode[] =>
  s.breadcrumb.map((id) => s.nodeCache[id]).filter(Boolean) as AnatomyNode[];

export const selectIsIsolated = (nodeId: string) => (s: AnatomyStore) =>
  s.isolatedNodeIds.length > 0 && !s.isolatedNodeIds.includes(nodeId);

export const selectIsHidden = (nodeId: string) => (s: AnatomyStore) =>
  s.hiddenNodeIds.includes(nodeId);
