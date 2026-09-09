import { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Maximize2, RotateCcw, Zap } from "lucide-react";

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

// ─── Procedural Solar Panel Wing ─────────────────────────────────────────────
function SolarWing({ side }: { side: "left" | "right" }) {
  const dir = side === "left" ? -1 : 1;

  // Grid texture for solar cells
  const solarCellTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#0c1b33";
      ctx.fillRect(0, 0, 256, 128);
      ctx.strokeStyle = "#1e498a";
      ctx.lineWidth = 1.5;
      for (let x = 0; x <= 256; x += 16) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 128);
        ctx.stroke();
      }
      for (let y = 0; y <= 128; y += 16) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(256, y);
        ctx.stroke();
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 1);
    return tex;
  }, []);

  return (
    <group position={[dir * 1.05, 0.1, 0]}>
      {/* Structural mounting arm */}
      <mesh position={[dir * 0.35, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.045, 0.045, 0.7, 12]} />
        <meshStandardMaterial color="#4a5568" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Main Solar Array (3 segments) */}
      {[0, 1, 2].map((idx) => (
        <group key={idx} position={[dir * (0.85 + idx * 0.82), 0, 0]}>
          {/* Front photovoltaic cells */}
          <mesh>
            <boxGeometry args={[0.76, 1.25, 0.035]} />
            <meshStandardMaterial
              map={solarCellTexture}
              color="#1a365d"
              emissive="#0a1931"
              emissiveIntensity={0.2}
              roughness={0.25}
              metalness={0.8}
            />
          </mesh>
          {/* Gold thermal insulation backing */}
          <mesh position={[0, 0, -0.02]}>
            <boxGeometry args={[0.74, 1.23, 0.005]} />
            <meshStandardMaterial
              color="#d4af37"
              roughness={0.3}
              metalness={0.9}
            />
          </mesh>
          {/* Panel frame border */}
          <mesh>
            <boxGeometry args={[0.78, 1.27, 0.038]} />
            <meshStandardMaterial
              color="#2d3748"
              metalness={0.7}
              roughness={0.4}
              wireframe
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ─── RCS Thruster Block ───────────────────────────────────────────────────────
function RcsQuad({ position, rotation }: { position: [number, number, number]; rotation: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <boxGeometry args={[0.12, 0.12, 0.12]} />
        <meshStandardMaterial color="#718096" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* 4 micro thruster nozzles */}
      {(
        [
          [0.08, 0, 0, 0, 0, -Math.PI / 2],
          [-0.08, 0, 0, 0, 0, Math.PI / 2],
          [0, 0.08, 0, 0, 0, 0],
          [0, 0, 0.08, Math.PI / 2, 0, 0],
        ] as [number, number, number, number, number, number][]
      ).map(([x, y, z, rx, ry, rz], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[rx, ry, rz]}>
          <coneGeometry args={[0.025, 0.06, 8, 1, true]} />
          <meshStandardMaterial color="#2d3748" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Detailed Astra-1 Spacecraft Mesh ─────────────────────────────────────────
function Astra1Model() {
  const modelRef = useRef<THREE.Group>(null);
  const scanRingRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    // Gentle floating roll & pitch
    if (modelRef.current) {
      modelRef.current.rotation.y += delta * 0.25;
    }
    // Animated telemetry scan beam
    if (scanRingRef.current) {
      scanRingRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.8) * 1.6;
    }
  });

  return (
    <group ref={modelRef}>
      {/* ─── Command Module (Nose Capsule) ─── */}
      <group position={[0, 0.95, 0]}>
        {/* Forward Docking Adapter */}
        <mesh position={[0, 0.85, 0]}>
          <cylinderGeometry args={[0.26, 0.32, 0.22, 32]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.85} roughness={0.25} />
        </mesh>
        {/* Docking Target Hatch */}
        <mesh position={[0, 0.965, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.03, 32]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Capsule Main Hull (Truncated Cone) */}
        <mesh position={[0, 0.32, 0]}>
          <cylinderGeometry args={[0.32, 0.74, 0.95, 32]} />
          <meshStandardMaterial
            color="#e2e8f0"
            metalness={0.4}
            roughness={0.35}
          />
        </mesh>

        {/* Crew Cabin Windows / Visor */}
        <mesh position={[0, 0.45, 0.44]} rotation={[-0.4, 0, 0]}>
          <boxGeometry args={[0.28, 0.12, 0.04]} />
          <meshStandardMaterial
            color="#0ea5e9"
            emissive="#0284c7"
            emissiveIntensity={0.6}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Capsule Heat Shield Base */}
        <mesh position={[0, -0.16, 0]}>
          <cylinderGeometry args={[0.74, 0.76, 0.08, 32]} />
          <meshStandardMaterial
            color="#b45309"
            metalness={0.8}
            roughness={0.45}
          />
        </mesh>
      </group>

      {/* ─── Service Module (Main Hull) ─── */}
      <group position={[0, -0.25, 0]}>
        {/* Upper Avionics Interstage Ring */}
        <mesh position={[0, 0.85, 0]}>
          <cylinderGeometry args={[0.75, 0.75, 0.18, 32]} />
          <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Main Cylindrical Fuselage */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.74, 0.74, 1.55, 32]} />
          <meshStandardMaterial
            color="#f8fafc"
            metalness={0.3}
            roughness={0.4}
          />
        </mesh>

        {/* Outer Radiator Ribs / Panel Seams */}
        {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, idx) => (
          <mesh
            key={idx}
            position={[Math.sin(angle) * 0.75, 0, Math.cos(angle) * 0.75]}
            rotation={[0, angle, 0]}
          >
            <boxGeometry args={[0.04, 1.4, 0.03]} />
            <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={0.3} />
          </mesh>
        ))}

        {/* RCS Thruster Clusters */}
        <RcsQuad position={[0.78, 0.45, 0]} rotation={[0, 0, 0]} />
        <RcsQuad position={[-0.78, 0.45, 0]} rotation={[0, Math.PI, 0]} />
        <RcsQuad position={[0, 0.45, 0.78]} rotation={[0, -Math.PI / 2, 0]} />
        <RcsQuad position={[0, 0.45, -0.78]} rotation={[0, Math.PI / 2, 0]} />

        {/* High-Gain Parabolic Communications Antenna */}
        <group position={[0.62, -0.35, 0.55]} rotation={[0.4, 0.6, -0.3]}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.35, 12]} />
            <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.22, 0]} rotation={[0, 0, Math.PI]}>
            <coneGeometry args={[0.26, 0.1, 24, 1, true]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.25} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0.15, 0]}>
            <sphereGeometry args={[0.035, 12, 12]} />
            <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.8} />
          </mesh>
        </group>

        {/* Lower Engine Mount Bulkhead */}
        <mesh position={[0, -0.82, 0]}>
          <cylinderGeometry args={[0.74, 0.62, 0.12, 32]} />
          <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Primary Vacuum Rocket Engine Bell */}
        <group position={[0, -1.2, 0]}>
          <mesh rotation={[Math.PI, 0, 0]}>
            <cylinderGeometry args={[0.44, 0.16, 0.65, 32, 1, true]} />
            <meshStandardMaterial
              color="#1e293b"
              metalness={0.95}
              roughness={0.2}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Glowing Engine Throat Interior */}
          <mesh position={[0, 0.2, 0]}>
            <sphereGeometry args={[0.14, 16, 16]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#0284c7"
              emissiveIntensity={1.5}
            />
          </mesh>
          {/* Nozzle Gimbal Ring */}
          <mesh position={[0, 0.32, 0]}>
            <torusGeometry args={[0.18, 0.03, 12, 24]} />
            <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.3} />
          </mesh>
        </group>
      </group>

      {/* ─── Deployable Solar Panels ─── */}
      <SolarWing side="left" />
      <SolarWing side="right" />

      {/* ─── Digital Twin Holographic Scan Ring ─── */}
      <mesh ref={scanRingRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.5, 1.56, 48]} />
        <meshBasicMaterial
          color="#00f0ff"
          transparent
          opacity={0.65}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// ─── Telemetry Callout Badges ───
function TelemetryHUD() {
  return (
    <div className="pointer-events-none absolute inset-0 p-3 flex flex-col justify-between text-[10px] font-mono">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1.5 rounded bg-panel/90 border border-border px-2.5 py-1 backdrop-blur">
          <span className="size-2 rounded-full bg-success animate-pulse" />
          <span className="text-success font-semibold">ASTRA-1 TWIN · SYNCED</span>
        </div>
        <div className="rounded bg-panel/85 border border-border px-2 py-0.5 text-muted-foreground">
          LATENCY: 14ms
        </div>
      </div>

      <div className="flex justify-between items-end">
        <div className="space-y-1 rounded bg-panel/85 border border-border p-2 backdrop-blur">
          <p className="text-muted-foreground">ATTITUDE CONTROL</p>
          <div className="flex gap-3 text-foreground font-semibold">
            <span>P: +0.4°</span>
            <span>Y: -0.1°</span>
            <span>R: 0.0°</span>
          </div>
        </div>

        <div className="text-right space-y-1 rounded bg-panel/85 border border-border p-2 backdrop-blur">
          <p className="text-muted-foreground">SOLAR ARRAY GEN</p>
          <p className="text-primary font-bold">14.2 kW · NOMINAL</p>
        </div>
      </div>
    </div>
  );
}

// ─── Public SpacecraftTwin Component ───
export function SpacecraftTwin() {
  const [controlsKey, setControlsKey] = useState(0);

  return (
    <div
      className="relative h-[440px] w-full overflow-hidden rounded-xl border border-border sm:h-[500px]"
      style={{
        background:
          "radial-gradient(circle at 50% 40%, #152238 0%, #0d1626 55%, #080d17 100%)",
      }}
    >
      {/* 3D WebGL Canvas */}
      <Canvas
        camera={{ position: [0, 1.2, 4.8], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.1;
        }}
      >
        {/* Cinematic Studio Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[6, 8, 5]} intensity={1.8} color="#ffffff" />
        <directionalLight position={[-6, -4, -5]} intensity={0.6} color="#0284c7" />
        <pointLight position={[0, -2, 2]} intensity={0.5} color="#38bdf8" />

        {/* Detailed 3D Spacecraft Model */}
        <Astra1Model />

        {/* 360 Degree Orbit Controls */}
        <OrbitControls
          key={controlsKey}
          enableZoom={true}
          minDistance={2.8}
          maxDistance={8.0}
          enablePan={false}
          rotateSpeed={0.6}
          dampingFactor={0.08}
        />
      </Canvas>

      {/* Telemetry HUD overlay */}
      <TelemetryHUD />

      {/* Control reset button */}
      <div className="absolute right-3 top-10 flex flex-col gap-1.5 z-10">
        <button
          onClick={() => setControlsKey((k) => k + 1)}
          title="Reset Camera Angle"
          className="grid size-7 place-items-center rounded bg-secondary/80 border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <RotateCcw className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
