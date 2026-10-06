'use client';

import { useRef, Suspense, useCallback, useMemo } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Text, useProgress, Html } from '@react-three/drei';
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

  useFrame((_, delta) => {
    if (!active) return;
    angle.current += delta * 0.12;
    const r = 5.5;
    camera.position.x = Math.sin(angle.current) * r;
    camera.position.z = Math.cos(angle.current) * r;
    camera.position.y = 0.8;
    camera.lookAt(0, 0.2, 0);
  });

  return null;
}

// ── Body segment ──────────────────────────────────────────────

function BodySegment({
  position,
  rotation,
  children,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  children: React.ReactNode;
}) {
  return (
    <mesh position={position} rotation={rotation ?? [0, 0, 0]} castShadow receiveShadow>
      {children}
      <meshStandardMaterial
        color="#3a8fbf"
        transparent
        opacity={0.13}
        roughness={0.5}
        metalness={0.1}
        side={THREE.FrontSide}
        depthWrite={false}
      />
    </mesh>
  );
}

// ── Full body silhouette built from primitives ────────────────
// Coordinate system: y=0 at navel. Body ≈ 3.6 units tall (crown y=1.95, feet y=-1.65)

function BodyFigure({ sex }: { sex: 'male' | 'female' }) {
  const isFemale = sex === 'female';

  // Female has slightly wider hips and narrower shoulders ratio
  const chestRadius = isFemale ? 0.31 : 0.35;
  const hipRadius = isFemale ? 0.36 : 0.32;
  const abdomenRadius = isFemale ? 0.29 : 0.3;

  return (
    <group>
      {/* ─ Head ─ */}
      <BodySegment position={[0, 1.78, 0]}>
        <sphereGeometry args={[0.19, 20, 14]} />
      </BodySegment>

      {/* ─ Neck ─ */}
      <BodySegment position={[0, 1.59, 0]}>
        <cylinderGeometry args={[0.075, 0.085, 0.18, 14]} />
      </BodySegment>

      {/* ─ Upper chest / thorax ─ */}
      <BodySegment position={[0, 1.06, 0]}>
        <cylinderGeometry args={[chestRadius * 0.92, chestRadius, 0.72, 18]} />
      </BodySegment>

      {/* ─ Lower chest / ribcage bottom ─ */}
      <BodySegment position={[0, 0.62, 0]}>
        <cylinderGeometry args={[abdomenRadius + 0.01, chestRadius * 0.92, 0.35, 18]} />
      </BodySegment>

      {/* ─ Abdomen ─ */}
      <BodySegment position={[0, 0.27, 0]}>
        <cylinderGeometry args={[abdomenRadius, abdomenRadius + 0.01, 0.42, 18]} />
      </BodySegment>

      {/* ─ Pelvis / hips ─ */}
      <BodySegment position={[0, 0.02, 0]}>
        <cylinderGeometry args={[hipRadius, abdomenRadius, 0.32, 18]} />
      </BodySegment>

      {/* ─ Crotch cap ─ */}
      <BodySegment position={[0, -0.16, 0]}>
        <cylinderGeometry args={[hipRadius * 0.7, hipRadius, 0.18, 18]} />
      </BodySegment>

      {/* ─ Shoulders (spheres bridging torso to arms) ─ */}
      <BodySegment position={[-0.44, 1.38, 0]}>
        <sphereGeometry args={[0.13, 12, 10]} />
      </BodySegment>
      <BodySegment position={[0.44, 1.38, 0]}>
        <sphereGeometry args={[0.13, 12, 10]} />
      </BodySegment>

      {/* ─ Upper arms (angled outward ~20°) ─ */}
      <BodySegment
        position={[-0.58, 1.05, 0]}
        rotation={[0, 0, 0.34]}
      >
        <cylinderGeometry args={[0.09, 0.08, 0.6, 12]} />
      </BodySegment>
      <BodySegment
        position={[0.58, 1.05, 0]}
        rotation={[0, 0, -0.34]}
      >
        <cylinderGeometry args={[0.09, 0.08, 0.6, 12]} />
      </BodySegment>

      {/* ─ Elbows ─ */}
      <BodySegment position={[-0.73, 0.73, 0]}>
        <sphereGeometry args={[0.085, 10, 8]} />
      </BodySegment>
      <BodySegment position={[0.73, 0.73, 0]}>
        <sphereGeometry args={[0.085, 10, 8]} />
      </BodySegment>

      {/* ─ Forearms (angled slightly inward from elbow) ─ */}
      <BodySegment
        position={[-0.75, 0.37, 0]}
        rotation={[0, 0, 0.12]}
      >
        <cylinderGeometry args={[0.072, 0.062, 0.58, 12]} />
      </BodySegment>
      <BodySegment
        position={[0.75, 0.37, 0]}
        rotation={[0, 0, -0.12]}
      >
        <cylinderGeometry args={[0.072, 0.062, 0.58, 12]} />
      </BodySegment>

      {/* ─ Hands ─ */}
      <BodySegment position={[-0.77, 0.06, 0]}>
        <sphereGeometry args={[0.068, 10, 8]} />
      </BodySegment>
      <BodySegment position={[0.77, 0.06, 0]}>
        <sphereGeometry args={[0.068, 10, 8]} />
      </BodySegment>

      {/* ─ Upper thighs ─ */}
      <BodySegment
        position={[-0.2, -0.57, 0]}
        rotation={[0, 0, 0.04]}
      >
        <cylinderGeometry args={[0.13, 0.11, 0.65, 14]} />
      </BodySegment>
      <BodySegment
        position={[0.2, -0.57, 0]}
        rotation={[0, 0, -0.04]}
      >
        <cylinderGeometry args={[0.13, 0.11, 0.65, 14]} />
      </BodySegment>

      {/* ─ Knees ─ */}
      <BodySegment position={[-0.21, -0.92, 0]}>
        <sphereGeometry args={[0.1, 10, 8]} />
      </BodySegment>
      <BodySegment position={[0.21, -0.92, 0]}>
        <sphereGeometry args={[0.1, 10, 8]} />
      </BodySegment>

      {/* ─ Lower legs ─ */}
      <BodySegment
        position={[-0.21, -1.25, 0]}
        rotation={[0.04, 0, 0]}
      >
        <cylinderGeometry args={[0.09, 0.075, 0.62, 12]} />
      </BodySegment>
      <BodySegment
        position={[0.21, -1.25, 0]}
        rotation={[0.04, 0, 0]}
      >
        <cylinderGeometry args={[0.09, 0.075, 0.62, 12]} />
      </BodySegment>

      {/* ─ Ankles ─ */}
      <BodySegment position={[-0.21, -1.58, 0.02]}>
        <sphereGeometry args={[0.072, 10, 8]} />
      </BodySegment>
      <BodySegment position={[0.21, -1.58, 0.02]}>
        <sphereGeometry args={[0.072, 10, 8]} />
      </BodySegment>

      {/* ─ Feet ─ */}
      <BodySegment position={[-0.21, -1.62, 0.09]}>
        <boxGeometry args={[0.14, 0.07, 0.28]} />
      </BodySegment>
      <BodySegment position={[0.21, -1.62, 0.09]}>
        <boxGeometry args={[0.14, 0.07, 0.28]} />
      </BodySegment>

      {/* ─ Highlighted thorax region outline (subtle) ─ */}
      <mesh position={[0, 0.88, 0]}>
        <cylinderGeometry args={[chestRadius + 0.01, chestRadius + 0.01, 1.0, 18, 1, true]} />
        <meshBasicMaterial
          color="#e53e3e"
          transparent
          opacity={0.06}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// ── Organ nodes (thorax) ──────────────────────────────────────
// Positioned correctly inside the body's thoracic cavity
// y range for thorax: ~0.52 (diaphragm) to ~1.4 (clavicles)
// x range: ±0.32 (inside the rib cage)

interface PlaceholderNode {
  id: string;
  nameEn: string;
  nameAr: string;
  position: [number, number, number];
  color: string;
  scale: [number, number, number];
  shape: 'sphere' | 'cylinder' | 'flat';
}

const PLACEHOLDER_NODES: PlaceholderNode[] = [
  {
    id: 'FMA:7088',
    nameEn: 'Heart',
    nameAr: 'القلب',
    position: [0.04, 0.9, 0.09],
    color: '#e53e3e',
    scale: [0.155, 0.155, 0.14],
    shape: 'sphere',
  },
  {
    id: 'FMA:7310',
    nameEn: 'Left Lung',
    nameAr: 'الرئة اليسرى',
    position: [-0.21, 0.95, 0.06],
    color: '#90cdf4',
    scale: [0.175, 0.31, 0.13],
    shape: 'sphere',
  },
  {
    id: 'FMA:7303',
    nameEn: 'Right Lung',
    nameAr: 'الرئة اليمنى',
    position: [0.24, 0.95, 0.06],
    color: '#90cdf4',
    scale: [0.185, 0.31, 0.13],
    shape: 'sphere',
  },
  {
    id: 'FMA:7394',
    nameEn: 'Trachea',
    nameAr: 'القصبة الهوائية',
    position: [0, 1.34, 0.09],
    color: '#fbd38d',
    scale: [0.052, 0.18, 0.052],
    shape: 'cylinder',
  },
  {
    id: 'FMA:3734',
    nameEn: 'Aortic arch',
    nameAr: 'قوس الأبهر',
    position: [0.04, 1.08, 0.13],
    color: '#fc8181',
    scale: [0.065, 0.065, 0.065],
    shape: 'sphere',
  },
  {
    id: 'FMA:13295',
    nameEn: 'Diaphragm',
    nameAr: 'الحجاب الحاجز',
    position: [0, 0.55, 0],
    color: '#f6ad55',
    scale: [0.52, 0.022, 0.3],
    shape: 'flat',
  },
];

function OrganMesh({
  node,
  selected,
  isolated,
  hidden,
  onSelect,
  showLabels,
  lang,
}: {
  node: PlaceholderNode;
  selected: boolean;
  isolated: boolean;
  hidden: boolean;
  onSelect: (id: string) => void;
  showLabels: boolean;
  lang: 'en' | 'ar';
}) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((_, delta) => {
    if (!meshRef.current || !selected) return;
    meshRef.current.rotation.y += delta * 0.5;
  });

  if (hidden) return null;

  const opacity = isolated ? 0.12 : selected ? 0.95 : 0.82;
  const emissive = selected
    ? new THREE.Color(node.color).multiplyScalar(0.45)
    : new THREE.Color(0, 0, 0);

  const displayName = lang === 'ar' ? node.nameAr : node.nameEn;
  const labelY = node.shape === 'cylinder'
    ? node.scale[1] + 0.08
    : node.shape === 'flat'
    ? node.scale[1] + 0.05
    : node.scale[1] + 0.06;

  return (
    <group position={node.position}>
      <mesh
        ref={meshRef}
        scale={node.scale}
        onClick={(e) => { e.stopPropagation(); onSelect(node.id); }}
        castShadow
      >
        {node.shape === 'cylinder' ? (
          <cylinderGeometry args={[1, 1, 1, 16]} />
        ) : (
          <sphereGeometry args={[1, 22, 16]} />
        )}
        <meshStandardMaterial
          color={node.color}
          transparent
          opacity={opacity}
          emissive={emissive}
          roughness={0.55}
          metalness={0.08}
          depthWrite={!isolated}
        />
      </mesh>

      {/* Hover glow ring when selected */}
      {selected && (
        <mesh scale={[node.scale[0] * 1.18, node.scale[1] * 1.18, node.scale[2] * 1.18]}>
          <sphereGeometry args={[1, 22, 16]} />
          <meshBasicMaterial color={node.color} transparent opacity={0.1} side={THREE.BackSide} />
        </mesh>
      )}

      {showLabels && (
        <Text
          position={[0, labelY, 0]}
          fontSize={0.055}
          color="white"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.004}
          outlineColor="black"
          renderOrder={10}
        >
          {displayName}
        </Text>
      )}
    </group>
  );
}

// ── Region highlight ring for thorax ─────────────────────────

function ThoraxHighlight() {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.03 + Math.abs(Math.sin(clock.elapsedTime * 0.8)) * 0.05;
  });

  return (
    <mesh ref={meshRef} position={[0, 0.88, 0]}>
      <cylinderGeometry args={[0.38, 0.38, 1.0, 24, 1, true]} />
      <meshBasicMaterial
        color="#e53e3e"
        transparent
        opacity={0.05}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

// ── Scene inner ───────────────────────────────────────────────

function SceneInner({
  lang,
  onNodeSelect,
}: {
  lang: 'en' | 'ar';
  onNodeSelect: (id: string) => void;
}) {
  const {
    sex,
    selectedNodeId,
    showLabels,
    isolatedNodeIds,
    hiddenNodeIds,
    isAnimating,
  } = useAnatomyStore();

  const hasIsolation = isolatedNodeIds.length > 0;

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 8, 4]} intensity={1.1} castShadow />
      <pointLight position={[-3, 2, -2]} intensity={0.4} color="#90cdf4" />
      <pointLight position={[0, -1.5, 2]} intensity={0.2} color="#ffffff" />

      {/* Environment */}
      <Environment preset="studio" />

      {/* Subtle ground plane */}
      <mesh position={[0, -1.72, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.2, 32]} />
        <meshStandardMaterial
          color="#1a1d26"
          transparent
          opacity={0.8}
          roughness={0.9}
        />
      </mesh>
      {/* Ground shadow ring */}
      <mesh position={[0, -1.71, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.25, 1.2, 32]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.25}
          depthWrite={false}
        />
      </mesh>

      {/* Full body silhouette */}
      <BodyFigure sex={sex === 'female' ? 'female' : 'male'} />

      {/* Thorax region pulsing ring */}
      <ThoraxHighlight />

      {/* Organ meshes */}
      {PLACEHOLDER_NODES.map((pn) => (
        <OrganMesh
          key={pn.id}
          node={pn}
          lang={lang}
          selected={selectedNodeId === pn.id}
          isolated={hasIsolation && !isolatedNodeIds.includes(pn.id)}
          hidden={hiddenNodeIds.includes(pn.id)}
          onSelect={onNodeSelect}
          showLabels={showLabels}
        />
      ))}

      {/* Idle orbit */}
      <IdleOrbit active={!isAnimating && !selectedNodeId} />

      {/* Camera controls */}
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={2}
        maxDistance={12}
        target={[0, 0.2, 0]}
        minPolarAngle={Math.PI * 0.1}
        maxPolarAngle={Math.PI * 0.9}
      />
    </>
  );
}

// ── Main export ───────────────────────────────────────────────

export default function ViewerScene({ lang, onNodeSelect }: ViewerSceneProps) {
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
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
        camera={{ position: [0, 0.3, 5.5], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        shadows
        style={{ background: '#0f1117' }}
      >
        <Suspense fallback={<Loader />}>
          <SceneInner lang={lang} onNodeSelect={onNodeSelect} />
        </Suspense>
      </Canvas>

      {/* Schematic notice */}
      <div
        className="absolute bottom-16 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full text-xs pointer-events-none whitespace-nowrap"
        style={{ color: 'rgba(255,255,255,0.22)', background: 'rgba(0,0,0,0.45)' }}
      >
        {lang === 'ar'
          ? '⬤ نموذج تخطيطي · سيُستبدل بنموذج GLB ثلاثي الأبعاد'
          : '⬤ Schematic model · will be replaced with a GLB mesh'}
      </div>
    </div>
  );
}
