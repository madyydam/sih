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
  Flame,
  Shield,
  Gauge as GaugeIcon,
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

export type RocketHotspot = {
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

export const ROCKET_HOTSPOTS: RocketHotspot[] = [
  {
    id: "core-engine",
    name: "Main Cryogenic Engine",
    subsystem: "Stage-1 Vulcain Propulsion",
    position: [0, -2.85, 0.42],
    status: "warning",
    severityLabel: "Thermal Spike",
    metric: "Chamber Temp",
    value: "782 °C",
    details: "Combustion chamber wall temperature elevated +4.2% above baseline. Secondary regenerative turbopump cooling increased by 6% to maintain safety envelope.",
  },
  {
    id: "booster-right",
    name: "Booster-A Pressure Joint",
    subsystem: "Strap-on Solid Motor (Port)",
    position: [0.88, -0.65, 0.38],
    status: "observation",
    severityLabel: "Pressure Delta",
    metric: "Internal Pressure",
    value: "6.82 MPa",
    details: "Minor +0.3 MPa internal pressure differential detected across segment-2 field joint. Within allowable structural tolerances.",
  },
  {
    id: "interstage-lattice",
    name: "Open Lattice Interstage",
    subsystem: "Stage-1 / Stage-2 Separation",
    position: [0, 1.45, 0.45],
    status: "nominal",
    severityLabel: "Armed & Synchronized",
    metric: "Pyro Release",
    value: "Armed",
    details: "12 pneumatic separation latches armed. Hot-staging exhaust ventilation vents verified clear of debris.",
  },
  {
    id: "upper-avionics",
    name: "Avionics & Guidance Ring",
    subsystem: "Inertial Navigation Unit",
    position: [0, 2.35, 0.40],
    status: "nominal",
    severityLabel: "Nominal",
    metric: "Telemetry Drift",
    value: "< 0.02°",
    details: "Triple-redundant ring laser gyroscopes active with zero attitude drift.",
  },
  {
    id: "payload-fairing",
    name: "Payload Aerodynamic Fairing",
    subsystem: "Acoustic Attenuation Shroud",
    position: [0, 3.5, 0.32],
    status: "nominal",
    severityLabel: "Optimal",
    metric: "Vibration Load",
    value: "0.18 g",
    details: "Dynamic acoustic damping tiles secure. Astra-1 orbital spacecraft safely cocooned inside clean room environment.",
  },
  {
    id: "booster-fin",
    name: "Aero Stabilizer Fin",
    subsystem: "Atmospheric Trajectory Control",
    position: [-1.22, -2.5, 0.15],
    status: "nominal",
    severityLabel: "Active",
    metric: "Dynamic Pressure",
    value: "38.2 kPa",
    details: "Hydraulic actuator servo response within 8ms nominal bounds during transonic flight regime.",
  },
];

// ─── Pulsing Heartbeat Diagnostic Hotspot Beacon ─────────────────────────────
function HotspotMarker({
  hotspot,
  isSelected,
  onSelect,
}: {
  hotspot: RocketHotspot;
  isSelected: boolean;
  onSelect: (h: RocketHotspot) => void;
}) {
  const pulseRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const colors = {
    warning: { core: "#ef4444", glow: "#f87171", ring: "#dc2626" },
    observation: { core: "#f59e0b", glow: "#fbbf24", ring: "#d97706" },
    nominal: { core: "#00f0ff", glow: "#38bdf8", ring: "#0284c7" },
  }[hotspot.status];

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 4.0;
    // Rhythmic dual-beat heartbeat pulse
    const beat = (Math.sin(t) * 0.5 + 0.5);

    if (pulseRef.current) {
      const s = 1.0 + beat * 1.6;
      pulseRef.current.scale.set(s, s, s);
      const mat = pulseRef.current.material as THREE.MeshBasicMaterial;
      if (mat) mat.opacity = 0.65 - beat * 0.55;
    }
    if (ringRef.current) {
      const s = 1.2 + beat * 2.2;
      ringRef.current.scale.set(s, s, s);
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      if (mat) mat.opacity = 0.5 - beat * 0.45;
    }
    if (coreRef.current) {
      const s = isSelected || hovered ? 1.4 : 1.0 + beat * 0.25;
      coreRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group position={hotspot.position}>
      {/* Expanding ripple ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.08, 0.11, 24]} />
        <meshBasicMaterial
          color={colors.ring}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Pulsing sphere wave */}
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.075, 16, 16]} />
        <meshBasicMaterial
          color={colors.glow}
          transparent
          opacity={0.5}
          depthWrite={false}
        />
      </mesh>

      {/* Solid glowing center dot */}
      <mesh
        ref={coreRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(hotspot);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial
          color={colors.core}
          emissive={colors.core}
          emissiveIntensity={isSelected || hovered ? 3.0 : 1.8}
        />
      </mesh>

      {/* Sleek compact label shown only when selected or hovered */}
      {(isSelected || hovered) && (
        <Html distanceFactor={8} position={[0.12, 0.08, 0]}>
          <div
            onClick={(e) => {
              e.stopPropagation();
              onSelect(hotspot);
            }}
            className={`pointer-events-auto cursor-pointer rounded px-2 py-0.5 text-[10px] font-bold tracking-wider shadow-lg backdrop-blur ${
              hotspot.status === "warning"
                ? "border border-destructive bg-destructive/90 text-destructive-foreground"
                : hotspot.status === "observation"
                  ? "border border-warning bg-warning/90 text-black"
                  : "border border-primary bg-panel-elevated text-primary"
            }`}
          >
            {hotspot.name}
          </div>
        </Html>
      )}
    </group>
  );
}

// ─── Procedural Detailed Multi-Stage Rocket Geometry ─────────────────────────
function RealisticRocketModel({
  selectedHotspot,
  onSelectHotspot,
}: {
  selectedHotspot: RocketHotspot | null;
  onSelectHotspot: (h: RocketHotspot) => void;
}) {
  const rocketGroup = useRef<THREE.Group>(null);

  // Procedural aerospace fuselage texture with panel seams and rivet rows
  const fuselageTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Off-white aerospace thermal tile base
      ctx.fillStyle = "#e9edf2";
      ctx.fillRect(0, 0, 512, 512);

      // Horizontal staging bands & panel seams
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 2;
      for (let y = 0; y <= 512; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y);
        ctx.stroke();
      }

      // Vertical panel dividers
      ctx.lineWidth = 1;
      for (let x = 0; x <= 512; x += 64) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 512);
        ctx.stroke();
      }

      // Dark carbon-composite reinforcement bands
      ctx.fillStyle = "#334155";
      ctx.fillRect(0, 80, 512, 14);
      ctx.fillRect(0, 240, 512, 18);
      ctx.fillRect(0, 420, 512, 22);

      // Fine rivets
      ctx.fillStyle = "#94a3b8";
      for (let y = 16; y < 512; y += 32) {
        for (let x = 8; x < 512; x += 16) {
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 4);
    return tex;
  }, []);

  useFrame((_, delta) => {
    if (rocketGroup.current) {
      rocketGroup.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group ref={rocketGroup}>
      {/* ═════════════════════════════════════════════════════════════════
          1. CENTRAL CORE LAUNCH VEHICLE
          ═════════════════════════════════════════════════════════════════ */}

      {/* ─── Payload Fairing / Nose Section ─── */}
      {/* Conical Radome Nose Tip (Charcoal/Grey) */}
      <mesh position={[0, 4.3, 0]}>
        <coneGeometry args={[0.18, 0.7, 32]} />
        <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Fairing Ogive Conical Body */}
      <mesh position={[0, 3.65, 0]}>
        <cylinderGeometry args={[0.18, 0.46, 0.85, 32]} />
        <meshStandardMaterial
          map={fuselageTexture}
          color="#f8fafc"
          roughness={0.25}
          metalness={0.2}
        />
      </mesh>

      {/* Fairing Cylindrical Shroud */}
      <mesh position={[0, 2.9, 0]}>
        <cylinderGeometry args={[0.46, 0.46, 0.75, 32]} />
        <meshStandardMaterial
          map={fuselageTexture}
          color="#f1f5f9"
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>

      {/* ─── Upper Stage (Stage-2) & Avionics ─── */}
      {/* Avionics Ring */}
      <mesh position={[0, 2.38, 0]}>
        <cylinderGeometry args={[0.47, 0.47, 0.22, 32]} />
        <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.25} />
      </mesh>

      {/* Upper Stage Propellant Tank */}
      <mesh position={[0, 1.9, 0]}>
        <cylinderGeometry args={[0.44, 0.44, 0.75, 32]} />
        <meshStandardMaterial
          map={fuselageTexture}
          color="#e2e8f0"
          roughness={0.35}
          metalness={0.2}
        />
      </mesh>

      {/* ─── Open Lattice Interstage Truss (Authentic Soyuz/Angara Design) ─── */}
      {/* Upper Stage Engine Nozzle (visible inside lattice cavity) */}
      <group position={[0, 1.4, 0]}>
        <mesh rotation={[Math.PI, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.08, 0.45, 24, 1, true]} />
          <meshStandardMaterial color="#1e293b" metalness={0.95} roughness={0.2} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* 12 Tubular Lattice Struts */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <group key={deg} position={[Math.sin(rad) * 0.42, 1.4, Math.cos(rad) * 0.42]} rotation={[0, -rad, 0]}>
            {/* Vertical tube */}
            <mesh>
              <cylinderGeometry args={[0.022, 0.022, 0.65, 8]} />
              <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Diagonal cross brace */}
            <mesh rotation={[0, 0, Math.PI / 5]}>
              <cylinderGeometry args={[0.015, 0.015, 0.70, 8]} />
              <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        );
      })}

      {/* Lower Interstage Flange Ring */}
      <mesh position={[0, 1.05, 0]}>
        <cylinderGeometry args={[0.46, 0.46, 0.08, 32]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* ─── Stage-1 Core Cryogenic Main Booster ─── */}
      <mesh position={[0, -0.7, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 3.4, 32]} />
        <meshStandardMaterial
          map={fuselageTexture}
          color="#f8fafc"
          roughness={0.35}
          metalness={0.15}
        />
      </mesh>

      {/* Cable Raceway & Fuel Feedline Conduits (vertical spines on core) */}
      {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, idx) => (
        <mesh
          key={idx}
          position={[Math.sin(angle) * 0.46, -0.7, Math.cos(angle) * 0.46]}
          rotation={[0, angle, 0]}
        >
          <boxGeometry args={[0.035, 3.3, 0.03]} />
          <meshStandardMaterial color="#0284c7" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}

      {/* Core Thrust Structure Aft Flare Skirt */}
      <mesh position={[0, -2.5, 0]}>
        <cylinderGeometry args={[0.45, 0.38, 0.28, 32]} />
        <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.25} />
      </mesh>

      {/* Core Main Vacuum Rocket Engine Bell */}
      <group position={[0, -2.85, 0]}>
        <mesh rotation={[Math.PI, 0, 0]}>
          <cylinderGeometry args={[0.34, 0.14, 0.58, 32, 1, true]} />
          <meshStandardMaterial
            color="#1e293b"
            metalness={0.95}
            roughness={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Glowing Throat Interior */}
        <mesh position={[0, 0.18, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#f97316" emissive="#ea580c" emissiveIntensity={2.2} />
        </mesh>
        {/* Gimbal Actuator Ring */}
        <mesh position={[0, 0.3, 0]}>
          <torusGeometry args={[0.18, 0.025, 12, 24]} />
          <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.3} />
        </mesh>
      </group>

      {/* ═════════════════════════════════════════════════════════════════
          2. STRAP-ON SOLID ROCKET BOOSTERS (With Aerodynamic Fins)
          ═════════════════════════════════════════════════════════════════ */}
      {[-0.88, 0.88].map((xOffset, bIdx) => {
        const angle = bIdx === 0 ? 0.025 : -0.025;
        const finSign = bIdx === 0 ? -1 : 1;

        return (
          <group key={bIdx} position={[xOffset, -0.65, 0]}>
            {/* Aerodynamic Conical Nose Cap (Slanted/Canted) */}
            <mesh position={[0, 2.35, 0]} rotation={[0, 0, angle]}>
              <cylinderGeometry args={[0.02, 0.32, 0.85, 32]} />
              <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.6} />
            </mesh>

            {/* Booster Cylindrical Body */}
            <mesh position={[0, 0.35, 0]}>
              <cylinderGeometry args={[0.32, 0.32, 3.2, 32]} />
              <meshStandardMaterial
                map={fuselageTexture}
                color="#f1f5f9"
                roughness={0.3}
                metalness={0.2}
              />
            </mesh>

            {/* Booster Field Joint Rings */}
            {[-1.0, -0.2, 0.6, 1.4].map((y, idx) => (
              <mesh key={idx} position={[0, y, 0]}>
                <cylinderGeometry args={[0.326, 0.326, 0.04, 32]} />
                <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
              </mesh>
            ))}

            {/* External Tunnel / Conduit Spine */}
            <mesh position={[finSign * 0.325, 0.35, 0]}>
              <boxGeometry args={[0.028, 3.1, 0.03]} />
              <meshStandardMaterial color="#0284c7" metalness={0.7} roughness={0.3} />
            </mesh>

            {/* Aerodynamic Triangular Stabilizer Delta Fin at Base (Like Reference!) */}
            <group position={[finSign * 0.32, -1.25, 0]}>
              <mesh rotation={[0, 0, finSign * (Math.PI / 2)]}>
                <coneGeometry args={[0.36, 0.65, 3]} />
                <meshStandardMaterial color="#e2e8f0" metalness={0.6} roughness={0.35} />
              </mesh>
              {/* Fin Trailing Edge Flap */}
              <mesh position={[finSign * 0.28, -0.15, 0]}>
                <boxGeometry args={[0.25, 0.45, 0.02]} />
                <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.25} />
              </mesh>
            </group>

            {/* Aft Flared Skirt */}
            <mesh position={[0, -1.4, 0]}>
              <cylinderGeometry args={[0.32, 0.36, 0.28, 32]} />
              <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
            </mesh>

            {/* High-Expansion Booster Nozzle */}
            <group position={[0, -1.75, 0]}>
              <mesh rotation={[Math.PI, 0, 0]}>
                <cylinderGeometry args={[0.30, 0.13, 0.50, 32, 1, true]} />
                <meshStandardMaterial
                  color="#1e293b"
                  metalness={0.95}
                  roughness={0.2}
                  side={THREE.DoubleSide}
                />
              </mesh>
              {/* Thermal Ring at Base */}
              <mesh position={[0, -0.24, 0]}>
                <torusGeometry args={[0.30, 0.025, 12, 24]} />
                <meshStandardMaterial color="#ef4444" emissive="#b91c1c" emissiveIntensity={1.0} />
              </mesh>
            </group>

            {/* Structural Thrust Attachment Struts connecting to Core */}
            <mesh position={[-Math.sign(xOffset) * 0.22, 1.4, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.045, 0.045, 0.44, 12]} />
              <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[-Math.sign(xOffset) * 0.22, -1.1, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.055, 0.055, 0.44, 12]} />
              <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        );
      })}

      {/* ═════════════════════════════════════════════════════════════════
          3. PULSING HEARTBEAT DIAGNOSTIC ISSUE HOTSPOTS
          ═════════════════════════════════════════════════════════════════ */}
      {ROCKET_HOTSPOTS.map((hotspot) => (
        <HotspotMarker
          key={hotspot.id}
          hotspot={hotspot}
          isSelected={selectedHotspot?.id === hotspot.id}
          onSelect={onSelectHotspot}
        />
      ))}
    </group>
  );
}

// ─── Public Component: Rocket3D ───────────────────────────────────────────────
export function Rocket3D() {
  const [selectedHotspot, setSelectedHotspot] = useState<RocketHotspot | null>(
    ROCKET_HOTSPOTS[0] ?? null,
  );
  const [controlsKey, setControlsKey] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      {/* 3D WebGL Canvas: Balanced Aerospace Radial Telemetry Studio (neither harsh black nor white) */}
      <div
        className="relative h-[420px] w-full overflow-hidden rounded-xl border border-border sm:h-[500px]"
        style={{
          background:
            "radial-gradient(circle at 50% 35%, #152238 0%, #0d1626 55%, #080d17 100%)",
        }}
      >
        <Canvas
          camera={{ position: [0, 0.3, 6.8], fov: 44 }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          onCreated={({ gl }) => {
            gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.15;
          }}
        >
          <ambientLight intensity={0.55} />
          {/* Key lights for crisp aerospace highlights */}
          <directionalLight position={[6, 9, 6]} intensity={2.2} color="#ffffff" />
          <directionalLight position={[-6, -3, -5]} intensity={0.8} color="#38bdf8" />
          <pointLight position={[0, -3.2, 2]} intensity={1.2} color="#f97316" />

          <RealisticRocketModel
            selectedHotspot={selectedHotspot}
            onSelectHotspot={setSelectedHotspot}
          />

          {/* CAD Flight Floor & Diagnostic Rings under rocket engines */}
          <group position={[0, -3.2, 0]}>
            <gridHelper args={[10, 16, "#38bdf8", "#1e293b"]} />
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[1.8, 1.84, 48]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.35} side={THREE.DoubleSide} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[2.8, 2.84, 48]} />
              <meshBasicMaterial color="#0284c7" transparent opacity={0.2} side={THREE.DoubleSide} />
            </mesh>
          </group>

          <OrbitControls
            key={controlsKey}
            enableZoom={true}
            minDistance={3.8}
            maxDistance={10.5}
            enablePan={false}
            rotateSpeed={0.65}
            dampingFactor={0.08}
          />
        </Canvas>

        {/* Top Header Tag & Reset Controls */}
        <div className="pointer-events-none absolute left-3 top-3 right-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-panel/90 px-3 py-1.5 backdrop-blur">
            <span className="size-2 rounded-full bg-destructive animate-ping" />
            <span className="font-semibold text-foreground">ASTRA-1 HEAVY LAUNCH VEHICLE</span>
            <span className="text-[10px] text-muted-foreground">· MULTI-STAGE 3D MODEL</span>
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
              Select Inspection Point:
            </span>
            {ROCKET_HOTSPOTS.map((h) => (
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
