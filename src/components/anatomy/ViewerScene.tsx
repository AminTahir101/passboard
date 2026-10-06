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

// ── Idle camera orbit ──────────────────────────────────────────

function IdleOrbit({ active }: { active: boolean }) {
  const { camera } = useThree();
  const angle = useRef(0);

  useFrame((_, delta) => {
    if (!active) return;
    angle.current += delta * 0.12;
    camera.position.x = Math.sin(angle.current) * 5.5;
    camera.position.z = Math.cos(angle.current) * 5.5;
    camera.position.y = 0.3;
    camera.lookAt(0, 0.2, 0);
  });

  return null;
}

// ── Body segment helper ───────────────────────────────────────

const BODY_MAT_COLOR = '#2a8db8';
const BODY_OPACITY = 0.15;

function BodySeg({
  position,
  rotation,
  children,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  children: React.ReactNode;
}) {
  return (
    <mesh position={position} rotation={rotation ?? [0, 0, 0]} castShadow>
      {children}
      <meshStandardMaterial
        color={BODY_MAT_COLOR}
        transparent
        opacity={BODY_OPACITY}
        roughness={0.55}
        metalness={0.04}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

// ── Full body silhouette ──────────────────────────────────────
// y=0 at navel. Total height ~3.6 units.
// Torso uses LatheGeometry (smooth profile revolution) scaled
// 0.68 on Z so it's elliptical (human torsos are flatter front-to-back).

function BodyFigure({ sex }: { sex: 'male' | 'female' }) {
  const isFemale = sex === 'female';

  // Profile points [radius, height] for surface-of-revolution.
  // Male: wider shoulders & chest, narrower hips.
  // Female: wider hips, narrower waist, slightly narrower shoulders.
  const torsoProfile = useMemo<THREE.Vector2[]>(() => {
    const pts = isFemale
      ? [
          [0.20, -0.26], // groin
          [0.35, -0.05], // hip widest
          [0.33, 0.08],  // upper hip
          [0.24, 0.30],  // waist narrowest
          [0.27, 0.52],  // sub-costal
          [0.32, 0.74],  // lower ribcage
          [0.33, 0.93],  // chest
          [0.30, 1.12],  // upper chest
          [0.28, 1.30],  // clavicle
          [0.23, 1.44],  // neck base
        ]
      : [
          [0.20, -0.26], // groin
          [0.32, -0.05], // hip
          [0.30, 0.08],  // upper hip
          [0.27, 0.30],  // waist
          [0.30, 0.52],  // sub-costal
          [0.36, 0.74],  // lower ribcage
          [0.37, 0.93],  // mid chest
          [0.35, 1.12],  // upper chest
          [0.31, 1.30],  // clavicle
          [0.26, 1.44],  // neck base
        ];
    return pts.map(([x, y]) => new THREE.Vector2(x, y));
  }, [isFemale]);

  return (
    <group>
      {/* ── Torso: smooth revolution, squashed front-to-back ── */}
      <mesh scale={[1, 1, 0.68]} castShadow>
        <latheGeometry args={[torsoProfile, 30]} />
        <meshStandardMaterial
          color={BODY_MAT_COLOR}
          transparent
          opacity={BODY_OPACITY}
          roughness={0.55}
          metalness={0.04}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* ── Head (slightly prolate ellipsoid) ── */}
      <mesh position={[0, 1.76, 0]} scale={[1, 1.12, 0.93]} castShadow>
        <sphereGeometry args={[0.175, 24, 18]} />
        <meshStandardMaterial
          color={BODY_MAT_COLOR}
          transparent
          opacity={BODY_OPACITY}
          roughness={0.55}
          metalness={0.04}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* ── Neck ── */}
      <BodySeg position={[0, 1.58, 0]}>
        <cylinderGeometry args={[0.069, 0.088, 0.22, 16]} />
      </BodySeg>

      {/* ── Shoulder spheres ── */}
      <BodySeg position={[-0.41, 1.37, 0]}><sphereGeometry args={[0.115, 14, 10]} /></BodySeg>
      <BodySeg position={[ 0.41, 1.37, 0]}><sphereGeometry args={[0.115, 14, 10]} /></BodySeg>

      {/* ── Upper arms (gentle outward angle) ── */}
      <BodySeg position={[-0.54, 1.03, 0]} rotation={[0, 0,  0.24]}>
        <cylinderGeometry args={[0.084, 0.074, 0.58, 14]} />
      </BodySeg>
      <BodySeg position={[ 0.54, 1.03, 0]} rotation={[0, 0, -0.24]}>
        <cylinderGeometry args={[0.084, 0.074, 0.58, 14]} />
      </BodySeg>

      {/* ── Elbows ── */}
      <BodySeg position={[-0.67, 0.73, 0]}><sphereGeometry args={[0.075, 12, 8]} /></BodySeg>
      <BodySeg position={[ 0.67, 0.73, 0]}><sphereGeometry args={[0.075, 12, 8]} /></BodySeg>

      {/* ── Forearms ── */}
      <BodySeg position={[-0.69, 0.38, 0]} rotation={[0, 0,  0.09]}>
        <cylinderGeometry args={[0.064, 0.054, 0.58, 14]} />
      </BodySeg>
      <BodySeg position={[ 0.69, 0.38, 0]} rotation={[0, 0, -0.09]}>
        <cylinderGeometry args={[0.064, 0.054, 0.58, 14]} />
      </BodySeg>

      {/* ── Wrists + Hands ── */}
      <BodySeg position={[-0.70, 0.06, 0]}><sphereGeometry args={[0.056, 10, 8]} /></BodySeg>
      <BodySeg position={[ 0.70, 0.06, 0]}><sphereGeometry args={[0.056, 10, 8]} /></BodySeg>
      <mesh position={[-0.70, -0.05, 0]} scale={[1, 1, 0.62]} castShadow>
        <sphereGeometry args={[0.068, 12, 8]} />
        <meshStandardMaterial color={BODY_MAT_COLOR} transparent opacity={BODY_OPACITY}
          roughness={0.55} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[0.70, -0.05, 0]} scale={[1, 1, 0.62]} castShadow>
        <sphereGeometry args={[0.068, 12, 8]} />
        <meshStandardMaterial color={BODY_MAT_COLOR} transparent opacity={BODY_OPACITY}
          roughness={0.55} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* ── Hip joint caps ── */}
      <BodySeg position={[-0.18, -0.27, 0]}><sphereGeometry args={[0.098, 12, 8]} /></BodySeg>
      <BodySeg position={[ 0.18, -0.27, 0]}><sphereGeometry args={[0.098, 12, 8]} /></BodySeg>

      {/* ── Thighs ── */}
      <BodySeg position={[-0.19, -0.55, 0]} rotation={[0, 0,  0.04]}>
        <cylinderGeometry args={[0.122, 0.104, 0.55, 16]} />
      </BodySeg>
      <BodySeg position={[ 0.19, -0.55, 0]} rotation={[0, 0, -0.04]}>
        <cylinderGeometry args={[0.122, 0.104, 0.55, 16]} />
      </BodySeg>

      {/* ── Knees ── */}
      <BodySeg position={[-0.20, -0.89, 0]}><sphereGeometry args={[0.090, 12, 8]} /></BodySeg>
      <BodySeg position={[ 0.20, -0.89, 0]}><sphereGeometry args={[0.090, 12, 8]} /></BodySeg>

      {/* ── Shins ── */}
      <BodySeg position={[-0.20, -1.22, 0]}>
        <cylinderGeometry args={[0.080, 0.063, 0.64, 14]} />
      </BodySeg>
      <BodySeg position={[ 0.20, -1.22, 0]}>
        <cylinderGeometry args={[0.080, 0.063, 0.64, 14]} />
      </BodySeg>

      {/* ── Ankles ── */}
      <BodySeg position={[-0.20, -1.57, 0]}><sphereGeometry args={[0.060, 10, 8]} /></BodySeg>
      <BodySeg position={[ 0.20, -1.57, 0]}><sphereGeometry args={[0.060, 10, 8]} /></BodySeg>

      {/* ── Feet (tapered box) ── */}
      <mesh position={[-0.20, -1.625, 0.07]} scale={[1, 1, 1]} castShadow>
        <boxGeometry args={[0.125, 0.060, 0.25]} />
        <meshStandardMaterial color={BODY_MAT_COLOR} transparent opacity={BODY_OPACITY}
          roughness={0.55} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[0.20, -1.625, 0.07]} scale={[1, 1, 1]} castShadow>
        <boxGeometry args={[0.125, 0.060, 0.25]} />
        <meshStandardMaterial color={BODY_MAT_COLOR} transparent opacity={BODY_OPACITY}
          roughness={0.55} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

// ── Organ placeholder definition ─────────────────────────────

interface OrganDef {
  id: string;
  nameEn: string;
  nameAr: string;
  position: [number, number, number];
  color: string;
  scale: [number, number, number];
  shape: 'sphere' | 'cylinder' | 'box';
  regionId: string;   // which L1 region this belongs to
}

// Coordinate system: y=0 = navel
// Thorax: y=0.55–1.40 | Abdomen: y=-0.20–0.55 | Pelvis: y=-0.50– -0.18
// Head: y=1.50–1.98  | Neck: y=1.40–1.58
// Arms: x=±0.55–0.77 | Legs: x=±0.21, y=-0.40– -1.62
// Spine: z=-0.10 (behind body center)

const ALL_ORGANS: OrganDef[] = [
  // ── Head (FMA:7154) ─────────────────────────────────────────
  { id: 'FMA:50801', nameEn: 'Brain', nameAr: 'الدماغ',
    position: [0, 1.82, -0.01], color: '#b794f4', scale: [0.15, 0.14, 0.13], shape: 'sphere', regionId: 'FMA:7154' },
  { id: 'FMA:9597', nameEn: 'Thyroid gland', nameAr: 'الغدة الدرقية',
    position: [0, 1.52, 0.09], color: '#ffd89b', scale: [0.1, 0.06, 0.06], shape: 'box', regionId: 'FMA:7154' },

  // ── Neck (FMA:7155) ─────────────────────────────────────────
  { id: 'FMA:9605', nameEn: 'Larynx', nameAr: 'الحنجرة',
    position: [0, 1.55, 0.08], color: '#fbd38d', scale: [0.055, 0.07, 0.055], shape: 'sphere', regionId: 'FMA:7155' },

  // ── Thorax (FMA:9648) ───────────────────────────────────────
  { id: 'FMA:7088', nameEn: 'Heart', nameAr: 'القلب',
    position: [0.04, 0.9, 0.09], color: '#e53e3e', scale: [0.155, 0.155, 0.14], shape: 'sphere', regionId: 'FMA:9648' },
  { id: 'FMA:7311', nameEn: 'Left Lung', nameAr: 'الرئة اليسرى',
    position: [-0.21, 0.95, 0.06], color: '#90cdf4', scale: [0.175, 0.31, 0.13], shape: 'sphere', regionId: 'FMA:9648' },
  { id: 'FMA:7310', nameEn: 'Right Lung', nameAr: 'الرئة اليمنى',
    position: [0.24, 0.95, 0.06], color: '#90cdf4', scale: [0.185, 0.31, 0.13], shape: 'sphere', regionId: 'FMA:9648' },
  { id: 'FMA:7394', nameEn: 'Trachea', nameAr: 'القصبة الهوائية',
    position: [0, 1.34, 0.09], color: '#fbd38d', scale: [0.052, 0.18, 0.052], shape: 'cylinder', regionId: 'FMA:9648' },
  { id: 'FMA:3734', nameEn: 'Aortic arch', nameAr: 'قوس الأبهر',
    position: [0.04, 1.08, 0.13], color: '#fc8181', scale: [0.065, 0.065, 0.065], shape: 'sphere', regionId: 'FMA:9648' },
  { id: 'FMA:13295', nameEn: 'Diaphragm', nameAr: 'الحجاب الحاجز',
    position: [0, 0.55, 0], color: '#f6ad55', scale: [0.52, 0.022, 0.3], shape: 'box', regionId: 'FMA:9648' },

  // ── Abdomen (FMA:9600) ──────────────────────────────────────
  { id: 'FMA:7197', nameEn: 'Liver', nameAr: 'الكبد',
    position: [0.18, 0.4, 0.08], color: '#c05621', scale: [0.26, 0.19, 0.15], shape: 'sphere', regionId: 'FMA:9600' },
  { id: 'FMA:7148', nameEn: 'Stomach', nameAr: 'المعدة',
    position: [-0.1, 0.22, 0.1], color: '#f6ad55', scale: [0.18, 0.17, 0.11], shape: 'sphere', regionId: 'FMA:9600' },
  { id: 'FMA:7196', nameEn: 'Spleen', nameAr: 'الطحال',
    position: [-0.27, 0.3, 0.02], color: '#9f7aea', scale: [0.09, 0.14, 0.07], shape: 'sphere', regionId: 'FMA:9600' },
  { id: 'FMA:7198', nameEn: 'Pancreas', nameAr: 'البنكرياس',
    position: [0, 0.1, 0.06], color: '#fbd38d', scale: [0.2, 0.06, 0.07], shape: 'box', regionId: 'FMA:9600' },
  { id: 'FMA:7203', nameEn: 'Right Kidney', nameAr: 'الكلية اليمنى',
    position: [0.23, -0.02, -0.05], color: '#fc8181', scale: [0.09, 0.13, 0.07], shape: 'sphere', regionId: 'FMA:9600' },
  { id: 'FMA:7204', nameEn: 'Left Kidney', nameAr: 'الكلية اليسرى',
    position: [-0.23, 0.0, -0.05], color: '#fc8181', scale: [0.09, 0.13, 0.07], shape: 'sphere', regionId: 'FMA:9600' },
  { id: 'FMA:7209', nameEn: 'Gallbladder', nameAr: 'المرارة',
    position: [0.2, 0.27, 0.12], color: '#d69e2e', scale: [0.07, 0.09, 0.065], shape: 'sphere', regionId: 'FMA:9600' },
  { id: 'abdomen_small_intestine', nameEn: 'Small Intestine', nameAr: 'الأمعاء الدقيقة',
    position: [0, -0.08, 0.07], color: '#e8c4a0', scale: [0.22, 0.17, 0.14], shape: 'sphere', regionId: 'FMA:9600' },
  { id: 'FMA:14541', nameEn: 'Cecum & Appendix', nameAr: 'الأعور والزائدة',
    position: [0.2, -0.18, 0.08], color: '#e8b4b8', scale: [0.08, 0.1, 0.07], shape: 'sphere', regionId: 'FMA:9600' },

  // ── Pelvis (FMA:9578) ───────────────────────────────────────
  { id: 'FMA:15900', nameEn: 'Urinary Bladder', nameAr: 'المثانة البولية',
    position: [0, -0.28, 0.1], color: '#fbd38d', scale: [0.13, 0.1, 0.11], shape: 'sphere', regionId: 'FMA:9578' },
  { id: 'FMA:17558', nameEn: 'Uterus', nameAr: 'الرحم',
    position: [0, -0.33, 0.05], color: '#f9a8d4', scale: [0.09, 0.09, 0.07], shape: 'sphere', regionId: 'FMA:9578' },
  { id: 'FMA:9362', nameEn: 'Prostate', nameAr: 'البروستاتة',
    position: [0, -0.35, 0.05], color: '#fbd38d', scale: [0.07, 0.055, 0.06], shape: 'sphere', regionId: 'FMA:9578' },
  { id: 'FMA:14227', nameEn: 'Rectum', nameAr: 'المستقيم',
    position: [0, -0.32, -0.07], color: '#b7791f', scale: [0.065, 0.14, 0.065], shape: 'cylinder', regionId: 'FMA:9578' },

  // ── Upper Limb (FMA:7182) ───────────────────────────────────
  { id: 'FMA:13883', nameEn: 'Humerus', nameAr: 'عظم العضد',
    position: [-0.6, 1.04, 0], color: '#e2e8f0', scale: [0.055, 0.32, 0.055], shape: 'cylinder', regionId: 'FMA:7182' },
  { id: 'FMA:25202', nameEn: 'Shoulder Joint', nameAr: 'مفصل الكتف',
    position: [-0.46, 1.36, 0], color: '#90cdf4', scale: [0.09, 0.09, 0.09], shape: 'sphere', regionId: 'FMA:7182' },
  { id: 'FMA:25998', nameEn: 'Elbow Joint', nameAr: 'مفصل المرفق',
    position: [-0.73, 0.73, 0], color: '#90cdf4', scale: [0.075, 0.075, 0.075], shape: 'sphere', regionId: 'FMA:7182' },

  // ── Lower Limb (FMA:7185) ───────────────────────────────────
  { id: 'FMA:9611', nameEn: 'Femur', nameAr: 'عظم الفخذ',
    position: [-0.2, -0.57, 0], color: '#e2e8f0', scale: [0.065, 0.33, 0.065], shape: 'cylinder', regionId: 'FMA:7185' },
  { id: 'FMA:24476', nameEn: 'Hip Joint', nameAr: 'مفصل الورك',
    position: [-0.2, -0.2, 0], color: '#90cdf4', scale: [0.09, 0.09, 0.09], shape: 'sphere', regionId: 'FMA:7185' },
  { id: 'FMA:9622', nameEn: 'Knee Joint', nameAr: 'مفصل الركبة',
    position: [-0.21, -0.92, 0], color: '#90cdf4', scale: [0.085, 0.085, 0.085], shape: 'sphere', regionId: 'FMA:7185' },
  { id: 'FMA:24477', nameEn: 'Tibia', nameAr: 'القصبة',
    position: [-0.21, -1.25, 0], color: '#e2e8f0', scale: [0.055, 0.3, 0.055], shape: 'cylinder', regionId: 'FMA:7185' },

  // ── Back & Spine (FMA:14543) ────────────────────────────────
  { id: 'FMA:9631', nameEn: 'Vertebral Column', nameAr: 'العمود الفقري',
    position: [0, 0.1, -0.13], color: '#e2e8f0', scale: [0.055, 1.8, 0.055], shape: 'cylinder', regionId: 'FMA:14543' },
  { id: 'FMA:7647', nameEn: 'Spinal Cord', nameAr: 'النخاع الشوكي',
    position: [0, 0.1, -0.11], color: '#b794f4', scale: [0.032, 1.5, 0.032], shape: 'cylinder', regionId: 'FMA:14543' },
];

// ── Organ mesh ────────────────────────────────────────────────

function OrganMesh({
  organ,
  selected,
  isolated,
  hidden,
  activeRegionId,
  onSelect,
  showLabels,
  lang,
}: {
  organ: OrganDef;
  selected: boolean;
  isolated: boolean;
  hidden: boolean;
  activeRegionId: string | null;
  onSelect: (id: string) => void;
  showLabels: boolean;
  lang: 'en' | 'ar';
}) {
  const meshRef = useRef<THREE.Mesh>(null!);

  const inActiveRegion = !activeRegionId || organ.regionId === activeRegionId;
  const dimmed = !inActiveRegion;

  useFrame((_, delta) => {
    if (!meshRef.current || !selected) return;
    meshRef.current.rotation.y += delta * 0.5;
  });

  if (hidden) return null;

  const opacity = dimmed ? 0.05 : isolated ? 0.1 : selected ? 0.95 : 0.82;
  const emissive = selected
    ? new THREE.Color(organ.color).multiplyScalar(0.45)
    : new THREE.Color(0, 0, 0);

  const labelY =
    organ.shape === 'cylinder' ? organ.scale[1] + 0.07 :
    organ.shape === 'box' ? organ.scale[1] + 0.05 :
    organ.scale[1] + 0.06;

  const displayName = lang === 'ar' ? organ.nameAr : organ.nameEn;

  return (
    <group position={organ.position}>
      <mesh
        ref={meshRef}
        scale={organ.scale}
        onClick={(e) => { e.stopPropagation(); onSelect(organ.id); }}
        castShadow
      >
        {organ.shape === 'cylinder' ? (
          <cylinderGeometry args={[1, 1, 1, 16]} />
        ) : organ.shape === 'box' ? (
          <boxGeometry args={[1, 1, 1]} />
        ) : (
          <sphereGeometry args={[1, 22, 16]} />
        )}
        <meshStandardMaterial
          color={organ.color}
          transparent
          opacity={opacity}
          emissive={emissive}
          roughness={0.55}
          metalness={0.08}
          depthWrite={!dimmed && !isolated}
        />
      </mesh>

      {selected && (
        <mesh scale={[organ.scale[0] * 1.2, organ.scale[1] * 1.2, organ.scale[2] * 1.2]}>
          <sphereGeometry args={[1, 22, 16]} />
          <meshBasicMaterial color={organ.color} transparent opacity={0.1} side={THREE.BackSide} />
        </mesh>
      )}

      {showLabels && inActiveRegion && (
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

// ── Region zone triggers (invisible clickable meshes) ─────────
// Clicking a zone navigates to that region's root node

const REGION_ZONES = [
  { id: 'FMA:7154',  pos: [0, 1.78, 0],  scale: [0.42, 0.42, 0.42],  color: '#b794f4' }, // Head
  { id: 'FMA:7155',  pos: [0, 1.58, 0],  scale: [0.24, 0.2, 0.24],   color: '#68d391' }, // Neck
  { id: 'FMA:9648',  pos: [0, 0.88, 0],  scale: [0.78, 1.0, 0.7],    color: '#e53e3e' }, // Thorax
  { id: 'FMA:9600',  pos: [0, 0.27, 0],  scale: [0.68, 0.72, 0.62],  color: '#f6ad55' }, // Abdomen
  { id: 'FMA:9578',  pos: [0, -0.27, 0], scale: [0.72, 0.42, 0.65],  color: '#fbd38d' }, // Pelvis
  { id: 'FMA:7182',  pos: [0, 0.8, 0],   scale: [1.7, 1.4, 0.35],    color: '#90cdf4' }, // Upper limbs (wide)
  { id: 'FMA:7185',  pos: [0, -0.95, 0], scale: [0.56, 1.5, 0.44],   color: '#68d391' }, // Lower limbs
  { id: 'FMA:14543', pos: [0, 0.1, -0.12], scale: [0.14, 3.6, 0.16], color: '#fc8181' }, // Spine
] as const;

function RegionZone({
  id, pos, scale, color, activeRegionId, onSelect,
}: {
  id: string;
  pos: readonly [number, number, number];
  scale: readonly [number, number, number];
  color: string;
  activeRegionId: string | null;
  onSelect: (id: string) => void;
}) {
  const [hovered, setHovered] = (
    // eslint-disable-next-line react-hooks/rules-of-hooks
    [useRef(false), useRef<THREE.Mesh>(null!)]
  );
  const meshRef = useRef<THREE.Mesh>(null!);
  const isActive = activeRegionId === id;

  return (
    <mesh
      ref={meshRef}
      position={pos as [number, number, number]}
      scale={scale as [number, number, number]}
      onClick={(e) => { e.stopPropagation(); onSelect(id); }}
      onPointerEnter={() => { document.body.style.cursor = 'pointer'; }}
      onPointerLeave={() => { document.body.style.cursor = 'auto'; }}
    >
      <sphereGeometry args={[0.5, 12, 8]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={isActive ? 0.08 : 0}
        side={THREE.FrontSide}
        depthWrite={false}
      />
    </mesh>
  );
}

// ── Active region pulsing ring ────────────────────────────────

function ActiveRegionGlow({ regionId }: { regionId: string | null }) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.03 + Math.abs(Math.sin(clock.elapsedTime * 0.9)) * 0.06;
  });

  if (!regionId) return null;

  const zone = REGION_ZONES.find((z) => z.id === regionId);
  if (!zone) return null;

  return (
    <mesh
      ref={meshRef}
      position={zone.pos as [number, number, number]}
      scale={[
        zone.scale[0] * 1.06,
        zone.scale[1] * 1.06,
        zone.scale[2] * 1.06,
      ]}
    >
      <sphereGeometry args={[0.5, 16, 10]} />
      <meshBasicMaterial
        color={zone.color}
        transparent
        opacity={0.05}
        side={THREE.BackSide}
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
    sex, selectedNodeId, showLabels,
    isolatedNodeIds, hiddenNodeIds, isAnimating,
    breadcrumb, nodeCache,
  } = useAnatomyStore();

  const hasIsolation = isolatedNodeIds.length > 0;

  // Determine the active region from the current breadcrumb's L1 node
  const rootNodeId = breadcrumb[0] ?? null;
  const activeRegionId = rootNodeId;

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 8, 4]} intensity={1.1} castShadow />
      <pointLight position={[-3, 2, -2]} intensity={0.4} color="#90cdf4" />
      <pointLight position={[0, -1.5, 2]} intensity={0.2} color="#ffffff" />
      <Environment preset="studio" />

      {/* Ground */}
      <mesh position={[0, -1.72, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.2, 32]} />
        <meshStandardMaterial color="#1a1d26" transparent opacity={0.8} roughness={0.9} />
      </mesh>
      <mesh position={[0, -1.71, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.25, 1.2, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.25} depthWrite={false} />
      </mesh>

      {/* Full body */}
      <BodyFigure sex={sex === 'female' ? 'female' : 'male'} />

      {/* Active region glow */}
      <ActiveRegionGlow regionId={activeRegionId} />

      {/* Region zone triggers (invisible hit areas for navigation) */}
      {REGION_ZONES.map((z) => (
        <RegionZone
          key={z.id}
          {...z}
          activeRegionId={activeRegionId}
          onSelect={onNodeSelect}
        />
      ))}

      {/* All organ placeholders */}
      {ALL_ORGANS.map((o) => (
        <OrganMesh
          key={o.id}
          organ={o}
          lang={lang}
          selected={selectedNodeId === o.id}
          isolated={hasIsolation && !isolatedNodeIds.includes(o.id)}
          hidden={hiddenNodeIds.includes(o.id)}
          activeRegionId={activeRegionId}
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
