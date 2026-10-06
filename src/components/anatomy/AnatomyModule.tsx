'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAnatomyStore } from '@/store/anatomyStore';
import type { AnatomyNode, AnatomyContent, AnatomySex } from '@/types/anatomy';
import BodySelection from './BodySelection';
import ViewerScene from './ViewerScene';
import InfoPanel from './InfoPanel';
import AiTutor from './AiTutor';
import LayerToggles from './LayerToggles';
import AnatomyBreadcrumb from './AnatomyBreadcrumb';
import AnatomySearchBar from './AnatomySearchBar';
import { Layers, Microscope, MessageSquare, X, ChevronRight, ArrowLeft, RefreshCw } from 'lucide-react';

interface AnatomyModuleProps {
  lang: 'en' | 'ar';
  userId: string;
}

type ActivePanel = 'info' | 'tutor' | 'layers' | null;

export default function AnatomyModule({ lang, userId }: AnatomyModuleProps) {
  const {
    sex, setSex, selectedNodeId, selectNode, drillDown, goBack, resetView,
    breadcrumb, nodeCache, contentCache, cacheNode, cacheContent,
    tutorMode, setTutorMode,
  } = useAnatomyStore();

  const [phase, setPhase] = useState<'select' | 'viewer'>('select');
  const [activePanel, setActivePanel] = useState<ActivePanel>('info');
  const [loadingNode, setLoadingNode] = useState(false);

  // Fetch node + content when selectedNodeId changes
  useEffect(() => {
    if (!selectedNodeId) return;
    if (nodeCache[selectedNodeId]) return; // already cached

    setLoadingNode(true);
    fetch(`/api/anatomy/nodes/${encodeURIComponent(selectedNodeId)}`)
      .then((r) => r.json())
      .then(({ node, content }: { node: AnatomyNode; content: AnatomyContent | null }) => {
        if (node) cacheNode(node);
        if (content) cacheContent(selectedNodeId, content);
      })
      .catch(console.error)
      .finally(() => setLoadingNode(false));
  }, [selectedNodeId, nodeCache, cacheNode, cacheContent]);

  const handleSelectSex = useCallback((s: AnatomySex) => {
    setSex(s);
    setPhase('viewer');
    // Start at Thorax (L1 root)
    drillDown('FMA:9648');
  }, [setSex, drillDown]);

  const handleBack = useCallback(() => {
    if (breadcrumb.length <= 1) {
      resetView();
      setPhase('select');
    } else {
      goBack();
    }
  }, [breadcrumb.length, resetView, goBack]);

  const handleNodeSelect = useCallback((nodeId: string) => {
    drillDown(nodeId);
    setActivePanel('info');
  }, [drillDown]);

  const togglePanel = useCallback((p: ActivePanel) => {
    setActivePanel((cur) => (cur === p ? null : p));
  }, []);

  const currentNode = selectedNodeId ? nodeCache[selectedNodeId] : null;
  const currentContent = selectedNodeId ? contentCache[selectedNodeId] : null;

  if (phase === 'select') {
    return <BodySelection lang={lang} onSelect={handleSelectSex} />;
  }

  return (
    <div
      className="relative w-full h-full flex flex-col"
      style={{ background: '#0f1117' }}
    >
      {/* ── Top toolbar ── */}
      <div
        className="relative z-20 flex items-center gap-2 px-3 py-2 border-b shrink-0"
        style={{ background: 'rgba(15,17,23,0.95)', borderColor: 'rgba(255,255,255,0.08)' }}
      >
        {/* Back */}
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
          style={{ color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.05)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
        >
          <ArrowLeft size={14} />
          {lang === 'ar' ? 'رجوع' : 'Back'}
        </button>

        {/* Breadcrumb */}
        <div className="flex-1 min-w-0">
          <AnatomyBreadcrumb lang={lang} />
        </div>

        {/* Search */}
        <div className="w-48 lg:w-64 shrink-0">
          <AnatomySearchBar lang={lang} onSelect={handleNodeSelect} />
        </div>

        {/* Reset */}
        <button
          onClick={() => { resetView(); setPhase('select'); }}
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: 'rgba(255,255,255,0.4)' }}
          title={lang === 'ar' ? 'إعادة ضبط' : 'Reset view'}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* ── Main content area ── */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* 3D Viewer */}
        <div className="flex-1 relative">
          <ViewerScene
            lang={lang}
            onNodeSelect={handleNodeSelect}
          />

          {/* Floating panel toggles (bottom-left) */}
          <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-2">
            <PanelToggleButton
              active={activePanel === 'info'}
              onClick={() => togglePanel('info')}
              icon={<Microscope size={16} />}
              label={lang === 'ar' ? 'المعلومات' : 'Info'}
              disabled={!currentNode}
            />
            <PanelToggleButton
              active={activePanel === 'tutor'}
              onClick={() => togglePanel('tutor')}
              icon={<MessageSquare size={16} />}
              label={lang === 'ar' ? 'المدرب' : 'AI Tutor'}
            />
            <PanelToggleButton
              active={activePanel === 'layers'}
              onClick={() => togglePanel('layers')}
              icon={<Layers size={16} />}
              label={lang === 'ar' ? 'الطبقات' : 'Layers'}
            />
          </div>

          {/* Sex toggle (top-right corner of viewer) */}
          <div className="absolute top-3 right-3 z-10 flex rounded-lg overflow-hidden border" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
            {(['male', 'female'] as AnatomySex[]).map((s) => (
              <button
                key={s}
                onClick={() => setSex(s)}
                className="px-3 py-1.5 text-xs font-medium transition-colors"
                style={{
                  background: sex === s ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.4)',
                  color: sex === s ? '#fff' : 'rgba(255,255,255,0.4)',
                }}
              >
                {s === 'male' ? (lang === 'ar' ? 'ذكر' : 'Male') : (lang === 'ar' ? 'أنثى' : 'Female')}
              </button>
            ))}
          </div>

          {/* Loading indicator */}
          {loadingNode && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: 'rgba(0,0,0,0.7)', color: 'rgba(255,255,255,0.7)' }}>
              {lang === 'ar' ? 'جارٍ التحميل…' : 'Loading…'}
            </div>
          )}
        </div>

        {/* ── Side panel ── */}
        {activePanel && (
          <aside
            className="w-80 lg:w-96 shrink-0 flex flex-col border-s overflow-hidden"
            style={{ background: 'rgba(15,17,23,0.98)', borderColor: 'rgba(255,255,255,0.08)' }}
          >
            {/* Panel header */}
            <div
              className="flex items-center justify-between px-4 py-3 border-b shrink-0"
              style={{ borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <div className="flex gap-1">
                {(['info', 'tutor', 'layers'] as ActivePanel[]).filter(Boolean).map((p) => (
                  <button
                    key={p!}
                    onClick={() => setActivePanel(p)}
                    className="px-3 py-1 rounded-md text-xs font-medium transition-colors"
                    style={{
                      background: activePanel === p ? 'rgba(255,255,255,0.12)' : 'transparent',
                      color: activePanel === p ? '#fff' : 'rgba(255,255,255,0.4)',
                    }}
                  >
                    {p === 'info'
                      ? (lang === 'ar' ? 'معلومات' : 'Info')
                      : p === 'tutor'
                      ? (lang === 'ar' ? 'مدرب' : 'Tutor')
                      : (lang === 'ar' ? 'طبقات' : 'Layers')}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setActivePanel(null)}
                className="p-1 rounded transition-colors"
                style={{ color: 'rgba(255,255,255,0.4)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Panel content */}
            <div className="flex-1 overflow-hidden">
              {activePanel === 'info' && (
                <InfoPanel
                  lang={lang}
                  node={currentNode}
                  content={currentContent}
                  loading={loadingNode}
                  onDrillDown={handleNodeSelect}
                />
              )}
              {activePanel === 'tutor' && (
                <AiTutor
                  lang={lang}
                  userId={userId}
                  nodeId={selectedNodeId}
                  nodeName={currentNode?.nameEn}
                  tutorMode={tutorMode}
                  onModeChange={setTutorMode}
                />
              )}
              {activePanel === 'layers' && (
                <LayerToggles lang={lang} />
              )}
            </div>
          </aside>
        )}
      </div>

      {/* ── Bottom child selector (when node has children) ── */}
      <ChildSelector lang={lang} onSelect={handleNodeSelect} />
    </div>
  );
}

// ── Panel toggle button ───────────────────────────────────────

function PanelToggleButton({
  active, onClick, icon, label, disabled,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
      style={{
        background: active ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.6)',
        color: disabled ? 'rgba(255,255,255,0.2)' : active ? '#fff' : 'rgba(255,255,255,0.6)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.1)',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {icon}
      {label}
    </button>
  );
}

// ── Child selector bar ────────────────────────────────────────

function ChildSelector({ lang, onSelect }: { lang: 'en' | 'ar'; onSelect: (id: string) => void }) {
  const { selectedNodeId, childrenCache } = useAnatomyStore();
  const [children, setChildren] = useState<AnatomyNode[]>([]);

  useEffect(() => {
    if (!selectedNodeId) { setChildren([]); return; }

    // Check local cache first
    if (childrenCache[selectedNodeId]) {
      // children IDs are cached, but we need the nodes — for now just fetch
    }

    fetch(`/api/anatomy/nodes/${encodeURIComponent(selectedNodeId)}/children`)
      .then((r) => r.json())
      .then(({ children: c }: { children: AnatomyNode[] }) => {
        setChildren(c ?? []);
      })
      .catch(console.error);
  }, [selectedNodeId, childrenCache]);

  if (!children.length) return null;

  return (
    <div
      className="shrink-0 border-t px-4 py-2 flex items-center gap-2 overflow-x-auto"
      style={{ background: 'rgba(15,17,23,0.97)', borderColor: 'rgba(255,255,255,0.08)' }}
    >
      <span className="text-xs font-medium shrink-0" style={{ color: 'rgba(255,255,255,0.35)' }}>
        {lang === 'ar' ? 'البنى الفرعية:' : 'Sub-structures:'}
      </span>
      {children.map((child) => (
        <button
          key={child.id}
          onClick={() => onSelect(child.id)}
          className="shrink-0 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors border"
          style={{
            background: 'rgba(255,255,255,0.04)',
            color: 'rgba(255,255,255,0.65)',
            borderColor: 'rgba(255,255,255,0.1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.65)';
          }}
        >
          {lang === 'ar' && child.nameAr ? child.nameAr : child.nameEn}
          <ChevronRight size={11} style={{ opacity: 0.5 }} />
        </button>
      ))}
    </div>
  );
}
