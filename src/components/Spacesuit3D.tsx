import { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  RotateCcw,
  Activity,
  Heart,
  Wind,
  Shield,
  Thermometer,
  Zap,
} from "lucide-react";

// ─── Patch R3F reconciler to safely handle Vite/Tanstack devtools "data-tsd-source"
if (typeof window !== "undefined") {
  [
    THREE.Object3D.prototype,
    THREE.Material.prototype,
    THREE.BufferGeometry.prototype,
    THREE.BufferAttribute.prototype,
  ].forEach((proto) => {
    try {
      (proto as unknown as Record<string, unknown>)["data-tsd-source"] = "";
    } catch {
      // ignore
    }
  });
}

export type SpacesuitHotspot = {
  id: string;
  name: string;
  subsystem: string;
  position: [number, number, number];
  status: "warning" | "observation" | "nominal";
  severityLabel: string;
  metric: string;
  value: string;
  details: string;
};

export const SPACESUIT_HOTSPOTS: SpacesuitHotspot[] = [
  {
    id: "lcvg-cooling",
    name: "Liquid Cooling & Ventilation (LCVG)",
    subsystem: "Thermal Regulation & Metabolic Sublimator",
    position: [0, 0.35, 0.46],
    status: "warning",
    severityLabel: "Cooling Loop Delta",
    metric: "Inlet Coolant Temp",
    value: "14.8 °C",
    details:
      "Coolant return loop thermal delta elevated by +2.1 °C during recent EVA spacewalk task. Sublimator ice layer regeneration active to maintain astronaut core temperature within nominal 36.6 °C envelope.",
  },
  {
    id: "helmet-visor",
    name: "Helmet Visor Defogger & Seal",
    subsystem: "Extravehicular Helmet Assembly",
    position: [0, 1.48, 0.38],
    status: "observation",
    severityLabel: "Heater Active",
    metric: "Visor Micro-Fog",
    value: "0.12 %",
    details:
      "Capacitive humidity sensor triggered low-power defogging heating element on gold-reflective outer visor. Neck ring lock collar pressure seal intact at 29.6 kPa delta.",
  },
  {
    id: "plss-oxygen",
    name: "PLSS Primary O2 Loop",
    subsystem: "Portable Life Support System (Backpack)",
    position: [0, 0.45, -0.62],
    status: "nominal",
    severityLabel: "Nominal Flow",
    metric: "O2 Partial Pressure",
    value: "22.4 kPa",
    details:
      "Dual primary oxygen tanks discharging at optimal 0.88 L/min metabolic demand. Emergency secondary 30-minute reserve cylinder fully pressurized at 100% capacity.",
  },
  {
    id: "eva-glove-r",
    name: "Right EVA Glove Articulation",
    subsystem: "Phase-VI Extravehicular Glove",
    position: [1.22, 0.12, 0.22],
    status: "observation",
    severityLabel: "Joint Resistance",
    metric: "Wrist Torque",
    value: "4.1 N·m",
    details:
      "Rotational wrist bearing friction increased 8% following external airlock ingress. Silicone-coated active heating elements operating at 21 °C to ensure maximum crew finger dexterity.",
  },
  {
    id: "bio-telemetry",
    name: "Biometric Telemetry Hub",
    subsystem: "Crew Biomedical Sensor Interface",
    position: [-0.36, 0.05, 0.45],
    status: "nominal",
    severityLabel: "Signal Locked",
    metric: "Heart Rate & SpO2",
    value: "72 bpm · 98%",
    details:
      "Integrated 12-lead bio-impedance ECG and pulse oximeter synced with mission control telemetry ground station with zero packet loss.",
  },
];

// ─── Pulsing Heartbeat Diagnostic Hotspot Marker ──────────────────────────────
function SpacesuitHotspotMarker({
  hotspot,
  isSelected,
  onSelect,
}: {
  hotspot: SpacesuitHotspot;
  isSelected: boolean;
  onSelect: (h: SpacesuitHotspot) => void;
}) {
  const outerPulseRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const colors = useMemo(() => {
    switch (hotspot.status) {
      case "warning":
        return {
          core: "#ef4444",
          emissive: "#dc2626",
          ping: "#f87171",
          halo: "rgba(239, 68, 68, 0.35)",
        };
      case "observation":
        return {
          core: "#f59e0b",
          emissive: "#d97706",
          ping: "#fbbf24",
          halo: "rgba(245, 158, 11, 0.35)",
        };
      case "nominal":
      default:
        return {
          core: "#10b981",
          emissive: "#059669",
          ping: "#34d399",
          halo: "rgba(16, 185, 129, 0.35)",
        };
    }
  }, [hotspot.status]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    // Biometric heartbeat pulsing rhythm
    const beat = (Math.sin(t * 4.2) + 1) * 0.5;
    const pulseScale = isSelected ? 1.45 + beat * 0.5 : 1.0 + beat * 0.35;

    if (outerPulseRef.current) {
      outerPulseRef.current.scale.set(pulseScale, pulseScale, pulseScale);
      const mat = outerPulseRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.55 - beat * 0.35;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 1.5;
      ringRef.current.rotation.x = Math.sin(t * 0.8) * 0.4;
    }
  });

  return (
    <group position={hotspot.position}>
      {/* 1. Concentric pulsing heartbeat outer shell */}
      <mesh ref={outerPulseRef}>
        <sphereGeometry args={[0.075, 16, 16]} />
        <meshBasicMaterial color={colors.ping} transparent opacity={0.4} />
      </mesh>

      {/* 2. Rotating diagnostic sensor ring */}
      <mesh ref={ringRef}>
        <ringGeometry args={[0.085, 0.105, 24]} />
        <meshBasicMaterial color={colors.core} side={THREE.DoubleSide} transparent opacity={0.8} />
      </mesh>

      {/* 3. Solid core clickable trigger */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect(hotspot);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
          setHovered(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "default";
          setHovered(false);
        }}
      >
        <sphereGeometry args={[isSelected ? 0.055 : 0.042, 16, 16]} />
        <meshStandardMaterial
          color={colors.core}
          emissive={colors.emissive}
          emissiveIntensity={isSelected ? 1.8 : 1.0}
          roughness={0.2}
        />
      </mesh>

      {/* 4. Telemetry Tooltip Label */}
      <Html distanceFactor={7} position={[0.15, 0.1, 0]}>
        <div
          onClick={(e) => {
            e.stopPropagation();
            onSelect(hotspot);
          }}
          className={`pointer-events-auto flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-1 text-xs font-semibold shadow-lg backdrop-blur-md transition-all ${
            isSelected
              ? "scale-105 border-white/80 bg-slate-900/95 text-white ring-2 ring-primary"
              : hovered
                ? "scale-100 border-white/60 bg-slate-900/90 text-white"
                : "scale-95 border-white/30 bg-slate-950/80 text-slate-200"
          }`}
          style={{ whiteSpace: "nowrap" }}
        >
          <span
            className="size-2 rounded-full animate-ping"
            style={{ backgroundColor: colors.core }}
          />
          <span>{hotspot.name}</span>
          <span
            className="rounded px-1.5 py-0.2 text-[10px] font-bold"
            style={{
              backgroundColor: colors.halo,
              color: colors.ping,
            }}
          >
            {hotspot.value}
          </span>
        </div>
      </Html>
    </group>
  );
}

// ─── High-Fidelity 3D Astronaut EVA Spacesuit Geometry ────────────────────────
function RealisticSpacesuitModel({
  selectedHotspot,
  onSelectHotspot,
}: {
  selectedHotspot: SpacesuitHotspot | null;
  onSelectHotspot: (h: SpacesuitHotspot) => void;
}) {
  const modelGroup = useRef<THREE.Group>(null);

  // Subtle floating micro-drift animation for zero-g simulation
  useFrame(({ clock }) => {
    if (modelGroup.current) {
      const t = clock.getElapsedTime();
      modelGroup.current.position.y = -0.2 + Math.sin(t * 0.9) * 0.04;
      modelGroup.current.rotation.y = Math.sin(t * 0.25) * 0.08;
    }
  });

  // Reusable aerospace materials
  const suitWhiteMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#f1f5f9",
        roughness: 0.65,
        metalness: 0.15,
      }),
    [],
  );

  const suitTrimNavy = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#0284c7",
        roughness: 0.35,
        metalness: 0.5,
      }),
    [],
  );

  const goldVisorMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#d97706",
        emissive: "#b45309",
        emissiveIntensity: 0.35,
        roughness: 0.08,
        metalness: 0.96,
      }),
    [],
  );

  const hardwareMetalMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#475569",
        roughness: 0.25,
        metalness: 0.85,
      }),
    [],
  );

  const plssPackMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#e2e8f0",
        roughness: 0.45,
        metalness: 0.35,
      }),
    [],
  );

  return (
    <group ref={modelGroup} position={[0, -0.2, 0]}>
      {/* ═════════════════════════════════════════════════════════════════
          1. EXTRAVEHICULAR HELMET ASSEMBLY
          ═════════════════════════════════════════════════════════════════ */}
      <group position={[0, 1.48, 0]}>
        {/* Outer White Helmet Shell */}
        <mesh>
          <sphereGeometry args={[0.34, 32, 32]} />
          <primitive object={suitWhiteMaterial} attach="material" />
        </mesh>

        {/* Gold Reflective Bubble Visor */}
        <mesh position={[0, 0.02, 0.12]} rotation={[0.1, 0, 0]}>
          <sphereGeometry args={[0.30, 32, 24, 0, Math.PI, 0, Math.PI * 0.72]} />
          <primitive object={goldVisorMaterial} attach="material" />
        </mesh>

        {/* Neck Disconnect Collar Ring */}
        <mesh position={[0, -0.28, 0]}>
          <cylinderGeometry args={[0.31, 0.33, 0.08, 32]} />
          <primitive object={suitTrimNavy} attach="material" />
        </mesh>

        {/* Left & Right Helmet Utility Lights / Comms Muffs */}
        <mesh position={[0.33, 0.04, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.1, 16]} />
          <primitive object={hardwareMetalMaterial} attach="material" />
        </mesh>
        <mesh position={[-0.33, 0.04, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.1, 16]} />
          <primitive object={hardwareMetalMaterial} attach="material" />
        </mesh>
      </group>

      {/* ═════════════════════════════════════════════════════════════════
          2. HARD UPPER TORSO (HUT) & CHEST CONTROL MODULE (DCM)
          ═════════════════════════════════════════════════════════════════ */}
      <group position={[0, 0.65, 0]}>
        {/* Upper Chest Core */}
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.44, 0.40, 0.68, 24]} />
          <primitive object={suitWhiteMaterial} attach="material" />
        </mesh>

        {/* Chest Display and Control Module (DCM) */}
        <mesh position={[0, 0.16, 0.38]}>
          <boxGeometry args={[0.38, 0.28, 0.12]} />
          <primitive object={hardwareMetalMaterial} attach="material" />
        </mesh>

        {/* DCM Status Screen & Switches */}
        <mesh position={[0, 0.20, 0.445]}>
          <planeGeometry args={[0.22, 0.11]} />
          <meshBasicMaterial color="#0284c7" />
        </mesh>
        <mesh position={[-0.10, 0.08, 0.445]}>
          <cylinderGeometry args={[0.015, 0.015, 0.02, 12]} />
          <meshStandardMaterial color="#10b981" emissive="#10b981" />
        </mesh>
        <mesh position={[0, 0.08, 0.445]}>
          <cylinderGeometry args={[0.015, 0.015, 0.02, 12]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" />
        </mesh>
        <mesh position={[0.10, 0.08, 0.445]}>
          <cylinderGeometry args={[0.015, 0.015, 0.02, 12]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" />
        </mesh>

        {/* ASTRA-X Mission Patch on Left Breast */}
        <mesh position={[-0.24, 0.32, 0.32]} rotation={[0, -0.4, 0]}>
          <circleGeometry args={[0.055, 24]} />
          <meshBasicMaterial color="#0284c7" side={THREE.DoubleSide} />
        </mesh>

        {/* Abdominal Life Support Girth Ring */}
        <mesh position={[0, -0.24, 0]}>
          <cylinderGeometry args={[0.39, 0.38, 0.12, 24]} />
          <primitive object={suitTrimNavy} attach="material" />
        </mesh>
      </group>

      {/* ═════════════════════════════════════════════════════════════════
          3. PORTABLE LIFE SUPPORT SYSTEM (PLSS BACKPACK)
          ═════════════════════════════════════════════════════════════════ */}
      <group position={[0, 0.72, -0.42]}>
        {/* Main Life Support Housing Box */}
        <mesh>
          <boxGeometry args={[0.62, 0.88, 0.34]} />
          <primitive object={plssPackMaterial} attach="material" />
        </mesh>

        {/* Dual High-Pressure Oxygen Tanks on Top */}
        <mesh position={[-0.17, 0.22, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[0.09, 0.44, 16, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0.17, 0.22, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[0.09, 0.44, 16, 16]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Thermal Sublimator Radiator Grille */}
        <mesh position={[0, -0.22, -0.175]}>
          <planeGeometry args={[0.42, 0.24]} />
          <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Communication Antenna Mast */}
        <mesh position={[-0.24, 0.58, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.35, 12]} />
          <primitive object={hardwareMetalMaterial} attach="material" />
        </mesh>
      </group>

      {/* ═════════════════════════════════════════════════════════════════
          4. ARMS & HIGH-DEXTERITY EVA GLOVES
          ═════════════════════════════════════════════════════════════════ */}
      {/* Left Arm Assembly */}
      <group position={[-0.62, 0.64, 0]} rotation={[0, 0, 0.25]}>
        {/* Shoulder Bearing */}
        <mesh>
          <sphereGeometry args={[0.16, 16, 16]} />
          <primitive object={suitTrimNavy} attach="material" />
        </mesh>
        {/* Upper Arm Segment */}
        <mesh position={[0, -0.26, 0]}>
          <cylinderGeometry args={[0.13, 0.12, 0.38, 16]} />
          <primitive object={suitWhiteMaterial} attach="material" />
        </mesh>
        {/* Elbow Articulator Ring */}
        <mesh position={[0, -0.48, 0]}>
          <torusGeometry args={[0.12, 0.03, 12, 24]} />
          <primitive object={suitTrimNavy} attach="material" />
        </mesh>
        {/* Forearm Segment */}
        <mesh position={[0, -0.68, 0.04]} rotation={[-0.2, 0, 0]}>
          <cylinderGeometry args={[0.11, 0.095, 0.36, 16]} />
          <primitive object={suitWhiteMaterial} attach="material" />
        </mesh>
        {/* Left EVA Glove */}
        <mesh position={[0, -0.92, 0.08]} rotation={[-0.2, 0, 0]}>
          <boxGeometry args={[0.13, 0.18, 0.11]} />
          <primitive object={hardwareMetalMaterial} attach="material" />
        </mesh>
      </group>

      {/* Right Arm Assembly */}
      <group position={[0.62, 0.64, 0]} rotation={[0, 0, -0.25]}>
        {/* Shoulder Bearing */}
        <mesh>
          <sphereGeometry args={[0.16, 16, 16]} />
          <primitive object={suitTrimNavy} attach="material" />
        </mesh>
        {/* Upper Arm Segment */}
        <mesh position={[0, -0.26, 0]}>
          <cylinderGeometry args={[0.13, 0.12, 0.38, 16]} />
          <primitive object={suitWhiteMaterial} attach="material" />
        </mesh>
        {/* Elbow Articulator Ring */}
        <mesh position={[0, -0.48, 0]}>
          <torusGeometry args={[0.12, 0.03, 12, 24]} />
          <primitive object={suitTrimNavy} attach="material" />
        </mesh>
        {/* Forearm Segment */}
        <mesh position={[0, -0.68, 0.04]} rotation={[-0.2, 0, 0]}>
          <cylinderGeometry args={[0.11, 0.095, 0.36, 16]} />
          <primitive object={suitWhiteMaterial} attach="material" />
        </mesh>
        {/* Right EVA Glove */}
        <mesh position={[0, -0.92, 0.08]} rotation={[-0.2, 0, 0]}>
          <boxGeometry args={[0.13, 0.18, 0.11]} />
          <primitive object={hardwareMetalMaterial} attach="material" />
        </mesh>
      </group>

      {/* ═════════════════════════════════════════════════════════════════
          5. LOWER TORSO ASSEMBLY (LTA) & EVA LUNAR BOOTS
          ═════════════════════════════════════════════════════════════════ */}
      <group position={[0, 0.22, 0]}>
        {/* Waist Articulation Bearing Ring */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.36, 0.34, 0.16, 24]} />
          <primitive object={suitTrimNavy} attach="material" />
        </mesh>

        {/* Left Leg Assembly */}
        <group position={[-0.22, -0.16, 0]}>
          {/* Thigh */}
          <mesh position={[0, -0.32, 0]}>
            <cylinderGeometry args={[0.16, 0.14, 0.54, 16]} />
            <primitive object={suitWhiteMaterial} attach="material" />
          </mesh>
          {/* Knee Articulation Ring */}
          <mesh position={[0, -0.62, 0]}>
            <torusGeometry args={[0.14, 0.03, 12, 24]} />
            <primitive object={suitTrimNavy} attach="material" />
          </mesh>
          {/* Calf / Shin */}
          <mesh position={[0, -0.92, 0]}>
            <cylinderGeometry args={[0.14, 0.13, 0.52, 16]} />
            <primitive object={suitWhiteMaterial} attach="material" />
          </mesh>
          {/* Left Boot */}
          <mesh position={[0, -1.26, 0.08]}>
            <boxGeometry args={[0.22, 0.18, 0.38]} />
            <primitive object={hardwareMetalMaterial} attach="material" />
          </mesh>
          {/* Heavy Tread Sole */}
          <mesh position={[0, -1.37, 0.08]}>
            <boxGeometry args={[0.24, 0.04, 0.40]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
        </group>

        {/* Right Leg Assembly */}
        <group position={[0.22, -0.16, 0]}>
          {/* Thigh */}
          <mesh position={[0, -0.32, 0]}>
            <cylinderGeometry args={[0.16, 0.14, 0.54, 16]} />
            <primitive object={suitWhiteMaterial} attach="material" />
          </mesh>
          {/* Knee Articulation Ring */}
          <mesh position={[0, -0.62, 0]}>
            <torusGeometry args={[0.14, 0.03, 12, 24]} />
            <primitive object={suitTrimNavy} attach="material" />
          </mesh>
          {/* Calf / Shin */}
          <mesh position={[0, -0.92, 0]}>
            <cylinderGeometry args={[0.14, 0.13, 0.52, 16]} />
            <primitive object={suitWhiteMaterial} attach="material" />
          </mesh>
          {/* Right Boot */}
          <mesh position={[0, -1.26, 0.08]}>
            <boxGeometry args={[0.22, 0.18, 0.38]} />
            <primitive object={hardwareMetalMaterial} attach="material" />
          </mesh>
          {/* Heavy Tread Sole */}
          <mesh position={[0, -1.37, 0.08]}>
            <boxGeometry args={[0.24, 0.04, 0.40]} />
            <meshStandardMaterial color="#0f172a" roughness={0.9} />
          </mesh>
        </group>
      </group>

      {/* ═════════════════════════════════════════════════════════════════
          6. PULSING HEARTBEAT DIAGNOSTIC HOTSPOTS
          ═════════════════════════════════════════════════════════════════ */}
      {SPACESUIT_HOTSPOTS.map((hotspot) => (
        <SpacesuitHotspotMarker
          key={hotspot.id}
          hotspot={hotspot}
          isSelected={selectedHotspot?.id === hotspot.id}
          onSelect={onSelectHotspot}
        />
      ))}
    </group>
  );
}

// ─── CAD Flight Inspection Floor & Orbit Ring Base ────────────────────────────
function TelemetryInspectionChamber() {
  return (
    <group position={[0, -1.75, 0]}>
      {/* 1. Subtle CAD Coordinate Grid Floor */}
      <gridHelper args={[8, 16, "#38bdf8", "#1e293b"]} />

      {/* 2. Concentric Radial Range Ring 1 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 1.23, 48]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>

      {/* 3. Concentric Radial Range Ring 2 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.0, 2.03, 48]} />
        <meshBasicMaterial color="#0284c7" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>

      {/* 4. Cardinal Heading Ticks */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((ang, i) => (
        <mesh
          key={i}
          position={[Math.cos(ang) * 1.6, 0.01, Math.sin(ang) * 1.6]}
          rotation={[-Math.PI / 2, 0, ang]}
        >
          <planeGeometry args={[0.18, 0.02]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Public Component: Spacesuit3D ────────────────────────────────────────────
export function Spacesuit3D() {
  const [selectedHotspot, setSelectedHotspot] = useState<SpacesuitHotspot | null>(
    SPACESUIT_HOTSPOTS[0] ?? null,
  );
  const [controlsKey, setControlsKey] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      {/* 3D WebGL Canvas: Balanced Aerospace Radial Studio Backdrop (neither harsh black nor white) */}
      <div
        className="relative h-[420px] w-full overflow-hidden rounded-xl border border-border sm:h-[480px]"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, #152238 0%, #0d1626 55%, #080d17 100%)",
        }}
      >
        <Canvas
          camera={{ position: [0, 0.2, 3.8], fov: 42 }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          onCreated={({ gl }) => {
            gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.15;
          }}
        >
          <ambientLight intensity={0.55} />
          {/* 3-Point Studio Key Lights for Visor Gold Reflection & Suit Depth */}
          <directionalLight position={[4, 6, 5]} intensity={1.9} color="#ffffff" />
          <directionalLight position={[-5, -2, -4]} intensity={0.8} color="#38bdf8" />
          <pointLight position={[0, -1.8, 1.5]} intensity={0.8} color="#0284c7" />

          {/* Spacesuit 3D Model with Hotspots */}
          <RealisticSpacesuitModel
            selectedHotspot={selectedHotspot}
            onSelectHotspot={setSelectedHotspot}
          />

          {/* Floor Inspection Chamber */}
          <TelemetryInspectionChamber />

          <OrbitControls
            key={controlsKey}
            enableZoom={true}
            minDistance={2.0}
            maxDistance={6.5}
            enablePan={false}
            rotateSpeed={0.65}
            dampingFactor={0.08}
          />
        </Canvas>

        {/* Top Header Tag & Reset Controls */}
        <div className="pointer-events-none absolute left-3 right-3 top-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-panel/90 px-3 py-1.5 backdrop-blur">
            <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold text-foreground">ASTRA-1 EVA SPACESUIT</span>
            <span className="text-[10px] text-muted-foreground">· 3D SUIT DIAGNOSTICS</span>
          </div>

          <div className="pointer-events-auto flex items-center gap-1.5">
            <button
              onClick={() => setControlsKey((k) => k + 1)}
              title="Reset View"
              className="grid size-8 place-items-center rounded-lg border border-border bg-panel/85 text-muted-foreground hover:bg-panel hover:text-foreground transition-colors"
            >
              <RotateCcw className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Dedicated Diagnostic Telemetry Card Positioned Cleanly BELOW the 3D Canvas */}
      {selectedHotspot && (
        <div className="rounded-xl border border-border bg-panel p-4 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/70">
            <div className="flex items-center gap-3">
              <span
                className={`grid size-9 place-items-center rounded-lg ${
                  selectedHotspot.status === "warning"
                    ? "bg-destructive/20 text-destructive border border-destructive/30"
                    : selectedHotspot.status === "observation"
                      ? "bg-warning/20 text-warning border border-warning/30"
                      : "bg-success/20 text-success border border-success/30"
                }`}
              >
                {selectedHotspot.status === "warning" ? (
                  <AlertTriangle className="size-5" />
                ) : selectedHotspot.status === "observation" ? (
                  <Info className="size-5" />
                ) : (
                  <CheckCircle2 className="size-5" />
                )}
              </span>
              <div>
                <p className="font-display text-base font-semibold">{selectedHotspot.name}</p>
                <p className="text-xs text-muted-foreground">{selectedHotspot.subsystem}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  selectedHotspot.status === "warning"
                    ? "bg-destructive/20 text-destructive border border-destructive/40"
                    : selectedHotspot.status === "observation"
                      ? "bg-warning/20 text-warning border border-warning/40"
                      : "bg-success/20 text-success border border-success/40"
                }`}
              >
                {selectedHotspot.severityLabel}
              </span>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {selectedHotspot.metric}
                </p>
                <p className="font-display text-lg font-bold text-foreground">
                  {selectedHotspot.value}
                </p>
              </div>
            </div>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            {selectedHotspot.details}
          </p>

          <div className="mt-3 flex items-center gap-2 pt-2 border-t border-border/60 overflow-x-auto">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap">
              Inspect Component:
            </span>
            {SPACESUIT_HOTSPOTS.map((h) => (
              <button
                key={h.id}
                onClick={() => setSelectedHotspot(h)}
                className={`whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  selectedHotspot.id === h.id
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {h.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
