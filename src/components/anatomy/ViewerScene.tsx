'use client';

import { useRef, Suspense, useCallback } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, Text, useProgress, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useAnatomyStore } from '@/store/anatomyStore';

// ── Props ─────────────────────────────────────────────────────

interface ViewerSceneProps {
  lang: 'en' | 'ar';
  onNodeSelect: (nodeId: string) => void;
}

// ── Loading overlay ───────────────────────────────────────────

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="text-center">
        <div
          className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-3"
          style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#e53e3e' }}
        />
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {Math.round(progress)}%
        </p>
      </div>
    </Html>
  );
}

// ── Idle orbit animation ──────────────────────────────────────

function IdleOrbit({ active }: { active: boolean }) {
  const { camera } = useThree();
  const angle = useRef(0);
  const radius = useRef(3.5);

  useFrame((_, delta) => {
    if (!active) return;
    angle.current += delta * 0.15;
    camera.position.x = Math.sin(angle.current) * radius.current;
    camera.position.z = Math.cos(angle.current) * radius.current;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// ── Placeholder mesh set (until real GLBs are loaded) ────────

interface PlaceholderNode {
  id: string;
  nameEn: string;
  position: [number, number, number];
  color: string;
  scale: [number, number, number];
}

const PLACEHOLDER_NODES: PlaceholderNode[] = [
  // Heart
  { id: 'FMA:7088', nameEn: 'Heart', position: [0, 0.1, 0], color: '#e53e3e', scale: [0.55, 0.55, 0.5] },
  // Left lung
  { id: 'FMA:7310', nameEn: 'Left Lung', position: [-0.75, 0.2, 0], color: '#90cdf4', scale: [0.45, 0.7, 0.4] },
  // Right lung
  { id: 'FMA:7303', nameEn: 'Right Lung', position: [0.75, 0.2, 0], color: '#90cdf4', scale: [0.45, 0.7, 0.4] },
  // Trachea
  { id: 'FMA:7394', nameEn: 'Trachea', position: [0, 0.85, 0], color: '#fbd38d', scale: [0.12, 0.35, 0.12] },
  // Aortic arch (approx)
  { id: 'FMA:3734', nameEn: 'Aortic arch', position: [0, 0.65, 0.1], color: '#fc8181', scale: [0.18, 0.18, 0.18] },
  // Diaphragm
  { id: 'FMA:13295', nameEn: 'Diaphragm', position: [0, -0.7, 0], color: '#f6ad55', scale: [1.4, 0.06, 0.9] },
];

function PlaceholderMesh({
  node,
  selected,
  isolated,
  hidden,
  onSelect,
  showLabels,
}: {
  node: PlaceholderNode;
  selected: boolean;
  isolated: boolean;
  hidden: boolean;
  onSelect: (id: string) => void;
  showLabels: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    if (selected) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  if (hidden) return null;

  const opacity = isolated ? 0.15 : 1;
  const emissive = selected ? new THREE.Color(node.color).multiplyScalar(0.4) : new THREE.Color(0, 0, 0);

  return (
    <group position={node.position}>
      <mesh
        ref={meshRef}
        scale={node.scale}
        onClick={(e) => { e.stopPropagation(); onSelect(node.id); }}
        castShadow
      >
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial
          color={node.color}
          transparent
          opacity={opacity}
          emissive={emissive}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>
      {showLabels && (
        <Text
          position={[0, (node.scale[1] * 1.1) + 0.15, 0]}
          fontSize={0.08}
          color="white"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.005}
          outlineColor="black"
        >
          {node.nameEn}
        </Text>
      )}
      {selected && (
        <mesh scale={[node.scale[0] * 1.12, node.scale[1] * 1.12, node.scale[2] * 1.12]}>
          <sphereGeometry args={[1, 24, 16]} />
          <meshBasicMaterial color={node.color} transparent opacity={0.12} side={THREE.BackSide} />
        </mesh>
      )}
    </group>
  );
}

// ── Scene inner (access R3F context) ─────────────────────────

function SceneInner({ onNodeSelect }: { onNodeSelect: (id: string) => void }) {
  const {
    selectedNodeId, showLabels,
    isolatedNodeIds, hiddenNodeIds,
    isAnimating,
  } = useAnatomyStore();

  const hasIsolation = isolatedNodeIds.length > 0;

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
      <pointLight position={[-3, 2, -2]} intensity={0.5} color="#90cdf4" />

      {/* Environment */}
      <Environment preset="studio" />

      {/* Ground grid (subtle) */}
      <Grid
        position={[0, -1.1, 0]}
        args={[6, 6]}
        cellSize={0.4}
        cellThickness={0.4}
        cellColor="rgba(255,255,255,0.04)"
        sectionColor="rgba(255,255,255,0.06)"
        sectionSize={1.2}
        fadeDistance={5}
        infiniteGrid
      />

      {/* Placeholder meshes */}
      {PLACEHOLDER_NODES.map((pn) => (
        <PlaceholderMesh
          key={pn.id}
          node={pn}
          selected={selectedNodeId === pn.id}
          isolated={hasIsolation && !isolatedNodeIds.includes(pn.id)}
          hidden={hiddenNodeIds.includes(pn.id)}
          onSelect={onNodeSelect}
          showLabels={showLabels}
        />
      ))}

      {/* Idle orbit when not animating */}
      <IdleOrbit active={!isAnimating && !selectedNodeId} />

      {/* Controls */}
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={1.5}
        maxDistance={8}
        target={[0, 0, 0]}
      />
    </>
  );
}

// ── Main export ───────────────────────────────────────────────

export default function ViewerScene({ lang, onNodeSelect }: ViewerSceneProps) {
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      // Click on canvas background → deselect
      const target = e.target as HTMLElement;
      if (target.tagName === 'CANVAS') {
        useAnatomyStore.getState().selectNode(null);
      }
    },
    []
  );

  return (
    <div className="w-full h-full" onClick={handleClick}>
      <Canvas
        camera={{ position: [0, 0.5, 3.5], fov: 50 }}
        gl={{ antialias: true, alpha: false }}
        shadows
        style={{ background: '#0f1117' }}
      >
        <Suspense fallback={<Loader />}>
          <SceneInner onNodeSelect={onNodeSelect} />
        </Suspense>
      </Canvas>

      {/* No model notice */}
      <div
        className="absolute bottom-16 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full text-xs pointer-events-none"
        style={{ color: 'rgba(255,255,255,0.25)', background: 'rgba(0,0,0,0.4)' }}
      >
        {lang === 'ar'
          ? '⬤ نموذج تخطيطي · سيُستبدل بنموذج GLB ثلاثي الأبعاد'
          : '⬤ Schematic model · will be replaced with GLB mesh'}
      </div>
    </div>
  );
}
