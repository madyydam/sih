import { useRef, useEffect, useMemo, Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { TextureLoader } from "three";

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

// ─── Local textures (served from same origin — no CORS) ──────────────────────
const DAY_URL      = "/textures/earth-day.jpg";
const NIGHT_URL    = "/textures/earth-night.jpg";
const CLOUD_URL    = "/textures/earth-clouds.jpg";
const SPECULAR_URL = "/textures/earth-water.png";

// Sun direction placed to the right and slightly front-right
// Matches Reference Image 2:
// - Right side catches sunlit crescent & electric blue atmospheric rim
// - Left & center show night side with visible continent silhouettes, navy oceans, and golden city lights
const SUN_DIR = new THREE.Vector3(1.8, 0.6, 0.25).normalize();

// ─── Custom Photorealistic Earth GLSL Shader ──────────────────────────────────
const EARTH_VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vViewNormal;
  varying vec3 vViewPos;

  void main() {
    vUv          = uv;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vViewNormal  = normalize(normalMatrix * normal);
    vViewPos     = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position  = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const EARTH_FRAG = /* glsl */ `
  uniform sampler2D dayMap;
  uniform sampler2D nightMap;
  uniform sampler2D cloudMap;
  uniform sampler2D specMap;
  uniform vec3      sunDir;

  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vViewNormal;
  varying vec3 vViewPos;

  void main() {
    vec3 N = normalize(vWorldNormal);
    vec3 V = normalize(-vViewPos);
    float NdL = dot(N, sunDir);

    // Natural smooth terminator transition
    float dayFactor = smoothstep(-0.12, 0.25, NdL);

    // 1. Texture samples
    vec3 daySample   = texture2D(dayMap, vUv).rgb;
    vec3 nightSample = texture2D(nightMap, vUv).rgb;
    float waterMask  = texture2D(specMap, vUv).r;
    float cloudMask  = texture2D(cloudMap, vUv).r;

    // 2. Night-side Terrain: visible continent silhouettes (Europe, Africa, Arabia, India)
    // Land is dark slate/charcoal navy with subtle surface texture; ocean is deep midnight blue
    vec3 nightLand = daySample * vec3(0.18, 0.24, 0.32);
    vec3 nightOcean = vec3(0.015, 0.035, 0.075);
    vec3 nightTerrain = mix(nightLand, nightOcean, waterMask);

    // Subtle night clouds catching faint starlight
    vec3 nightClouds = vec3(0.04, 0.07, 0.12);
    nightTerrain = mix(nightTerrain, nightClouds, cloudMask * 0.35);

    // 3. Warm Golden City Lights (NASA Black Marble)
    float lightLuma = max(nightSample.r * 1.4 + nightSample.g * 1.1 - nightSample.b * 1.0, 0.0);
    float cityMask  = smoothstep(0.03, 0.25, lightLuma);
    vec3 goldenCities = vec3(1.35, 1.15, 0.68) * pow(lightLuma, 1.1) * 3.0;

    vec3 nightFinal = nightTerrain + goldenCities * cityMask;

    // 4. Sunlit Day-side
    vec3 daySide = daySample * 0.85;
    vec3 dayClouds = vec3(0.92, 0.96, 1.0);
    daySide = mix(daySide, dayClouds, cloudMask * 0.55);

    // 5. Planetary Day/Night Blend
    vec3 surface = mix(nightFinal, daySide, dayFactor);

    // 6. Ocean Specular Reflection on Sunlit Waters
    if (waterMask > 0.05 && NdL > 0.0) {
      vec3 H = normalize(sunDir + V);
      float spec = pow(max(dot(N, H), 0.0), 65.0);
      surface += vec3(0.22, 0.55, 0.95) * spec * waterMask * NdL * 0.70;
    }

    // 7. Luminous Electric Blue Atmospheric Rim
    float fresnel = 1.0 - max(dot(normalize(vViewNormal), vec3(0.0, 0.0, 1.0)), 0.0);
    fresnel = pow(fresnel, 2.7);

    float sunFacing = dot(N, sunDir);
    float rimSun = smoothstep(-0.30, 0.35, sunFacing);

    vec3 atmoElectricBlue = vec3(0.12, 0.65, 1.0);
    vec3 rimColor = mix(vec3(0.025, 0.065, 0.18), atmoElectricBlue, rimSun);
    surface += rimColor * fresnel * (rimSun * 2.8 + 0.40);

    gl_FragColor = vec4(surface, 1.0);
  }
`;

// ─── Precision Outer Atmospheric Limb (electric blue crescent) ────────────────
const ATMO_TIGHT_VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewPos;
  void main() {
    vNormal  = normalize(normalMatrix * normal);
    vViewPos = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ATMO_TIGHT_FRAG = /* glsl */ `
  uniform vec3 sunDir;
  varying vec3 vNormal;
  varying vec3 vViewPos;

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(-vViewPos);

    // Sharp exponential edge falloff hugging the planet curvature
    float rim = 1.0 - abs(dot(N, V));
    rim = pow(rim, 3.2);

    // Glows prominently along the sunlit crescent and fades smoothly around limb
    float sunFactor = smoothstep(-0.25, 0.40, dot(N, sunDir));
    vec3 atmoColor = mix(vec3(0.03, 0.12, 0.30), vec3(0.15, 0.70, 1.0), sunFactor);
    float alpha = rim * (sunFactor * 1.35 + 0.08);

    gl_FragColor = vec4(atmoColor, alpha);
  }
`;

// ─── Earth mesh ───────────────────────────────────────────────────────────────
function EarthMesh() {
  const meshRef = useRef<THREE.Mesh>(null);

  const [dayMap, nightMap, cloudMap, specMap] = useLoader(TextureLoader, [
    DAY_URL,
    NIGHT_URL,
    CLOUD_URL,
    SPECULAR_URL,
  ]);

  // Configure textures for sharp rendering
  const maps = [dayMap, nightMap, cloudMap, specMap];
  maps.forEach((t) => {
    if (!t) return;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.anisotropy = 8;
  });

  const uniforms = useRef({
    dayMap:   { value: dayMap },
    nightMap: { value: nightMap },
    cloudMap: { value: cloudMap },
    specMap:  { value: specMap },
    sunDir:   { value: SUN_DIR },
  });

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003;
    }
  });

  return (
    <group>
      {/* Primary Earth sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 72, 72]} />
        <shaderMaterial
          vertexShader={EARTH_VERT}
          fragmentShader={EARTH_FRAG}
          uniforms={uniforms.current}
        />
      </mesh>

      {/* Atmospheric limb glow: hugging curvature */}
      <mesh>
        <sphereGeometry args={[1.015, 64, 64]} />
        <shaderMaterial
          vertexShader={ATMO_TIGHT_VERT}
          fragmentShader={ATMO_TIGHT_FRAG}
          uniforms={{ sunDir: { value: SUN_DIR } }}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

// ─── Loading placeholder ──────────────────────────────────────────────────────
function EarthLoadingFallback() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (meshRef.current) meshRef.current.rotation.y += 0.003;
  });
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshPhongMaterial color={new THREE.Color(0x061122)} />
    </mesh>
  );
}

// ─── Orbital Trajectory Path with Active Satellite Beacon ─────────────────────
function OrbitalTrajectory({
  radius = 1.25,
  inclination = 0.52,
  color = "#38bdf8",
  speed = 0.45,
}: {
  radius?: number;
  inclination?: number;
  color?: string;
  speed?: number;
}) {
  const satRef = useRef<THREE.Group>(null);

  const linePoints = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const count = 96;
    for (let i = 0; i <= count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = Math.sin(inclination) * z;
      const zRot = Math.cos(inclination) * z;
      pts.push(new THREE.Vector3(x, y, zRot));
    }
    return pts;
  }, [radius, inclination]);

  const lineGeom = useMemo(
    () => new THREE.BufferGeometry().setFromPoints(linePoints),
    [linePoints],
  );

  useFrame(({ clock }) => {
    if (satRef.current) {
      const t = clock.getElapsedTime() * speed;
      const x = Math.cos(t) * radius;
      const z = Math.sin(t) * radius;
      const y = Math.sin(inclination) * z;
      const zRot = Math.cos(inclination) * z;
      satRef.current.position.set(x, y, zRot);
    }
  });

  return (
    <group>
      {/* Orbit Trajectory Line */}
      {/* @ts-expect-error line is a valid Three.js intrinsic element */}
      <line geometry={lineGeom}>
        <lineBasicMaterial color={color} transparent opacity={0.65} />
      </line>

      {/* Orbiting Satellite Pulse Beacon */}
      <group ref={satRef}>
        <mesh>
          <sphereGeometry args={[0.024, 12, 12]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshBasicMaterial color="#00f0ff" transparent opacity={0.35} />
        </mesh>
      </group>
    </group>
  );
}

// ─── CAD Flight Coordinate Grid & Distance Rings for Earth ───────────────────
function EarthCadFloor({ compact = false }: { compact?: boolean }) {
  const yPos = compact ? -1.2 : -1.35;
  return (
    <group position={[0, yPos, 0]}>
      {/* Graph-type CAD inspection grid */}
      <gridHelper args={[6, 14, "#38bdf8", "#1e293b"]} />

      {/* Concentric telemetry range rings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.25, 1.28, 48]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.9, 1.93, 48]} />
        <meshBasicMaterial color="#0284c7" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ─── Deep space star field ────────────────────────────────────────────────────
function StarField() {
  const buf = useRef<Float32Array | null>(null);
  if (!buf.current) {
    const count = 1800;
    buf.current = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r     = 6 + Math.random() * 5;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      buf.current[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      buf.current[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      buf.current[i * 3 + 2] = r * Math.cos(phi);
    }
  }
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[buf.current, 3]} />
      </bufferGeometry>
      <pointsMaterial color={0xffffff} size={0.012} transparent opacity={0.55} sizeAttenuation />
    </points>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────
export function MissionGlobe({
  compact = false,
}: {
  compact?: boolean;
  showOrbit?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          el.style.visibility = entry.isIntersecting ? "visible" : "hidden";
        }
      },
      { threshold: 0.05 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const height = compact
    ? "h-44"
    : "h-[360px] sm:h-[440px] lg:h-[500px]";

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${height} overflow-hidden rounded-lg`}
      style={{
        background:
          "radial-gradient(circle at 50% 40%, #152238 0%, #0d1626 55%, #080d17 100%)",
      }}
      aria-label="Interactive 3D Earth globe — Astra-1 orbital telemetry view"
    >
      <Canvas
        camera={{ position: [0, 0.1, 2.5], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
      >
        <ambientLight intensity={0.15} />

        <directionalLight
          position={[3.5, 1.2, 0.5]}
          intensity={2.2}
          color={new THREE.Color(0xfff6ea)}
        />

        <StarField />

        {/* 1. CAD Coordinate Grid & Range Rings like Rocket3D */}
        <EarthCadFloor compact={compact} />

        {/* 2. Interactive 3D Earth Globe with Shading */}
        <Suspense fallback={<EarthLoadingFallback />}>
          <EarthMesh />
        </Suspense>

        {/* 3. Primary Astra-1 Orbital Trajectory */}
        <OrbitalTrajectory radius={1.26} inclination={0.52} color="#38bdf8" speed={0.45} />

        {/* 4. Secondary Polar Observation Trajectory */}
        <OrbitalTrajectory radius={1.42} inclination={1.42} color="#818cf8" speed={0.3} />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate
          rotateSpeed={0.35}
          autoRotate={false}
          minPolarAngle={Math.PI * 0.15}
          maxPolarAngle={Math.PI * 0.85}
        />
      </Canvas>

      {/* Soft edge vignette to blend seamlessly into card */}
      <div
        className="pointer-events-none absolute inset-0 rounded-lg"
        style={{
          background: "radial-gradient(circle at center, transparent 70%, #080d1788 100%)",
        }}
      />
    </div>
  );
}