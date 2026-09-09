import { useRef, useEffect, Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { TextureLoader } from "three";

// ─── Local textures (served from same origin — no CORS) ──────────────────────
const DAY_URL      = "/textures/earth-day.jpg";
const NIGHT_URL    = "/textures/earth-night.jpg";
const CLOUD_URL    = "/textures/earth-clouds.jpg";
const SPECULAR_URL = "/textures/earth-water.png";
const BUMP_URL     = "/textures/earth-topology.png";

// Sun direction in world space — matches the directional light at [5, 3, 5]
const SUN_DIR = new THREE.Vector3(5, 3, 5).normalize();

// ─── Earth custom GLSL shader ─────────────────────────────────────────────────
const EARTH_VERT = /* glsl */ `
  varying vec2  vUv;
  varying vec3  vWorldNormal;
  varying vec3  vViewPos;

  void main() {
    vUv          = uv;
    // World-space normal so the fixed world-space sun direction is usable directly
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
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

  varying vec2  vUv;
  varying vec3  vWorldNormal;
  varying vec3  vViewPos;

  void main() {
    vec3 N    = normalize(vWorldNormal);
    float NdL = dot(N, sunDir);

    // Soft terminator: day/night blend
    float dayMix = smoothstep(-0.12, 0.30, NdL);

    // Day texture — slightly darkened for satellite realism
    vec3 dayCol  = texture2D(dayMap, vUv).rgb * 0.78;

    // Night texture — boost & warm city lights
    vec3 nightCol = texture2D(nightMap, vUv).rgb;
    nightCol = pow(max(nightCol, vec3(0.0)), vec3(0.62)) * 1.9;
    nightCol *= vec3(1.30, 1.10, 0.80); // warm golden tint

    vec3 earthCol = mix(nightCol, dayCol, dayMix);

    // Cloud layer
    float cloudMask = texture2D(cloudMap, vUv).r;
    vec3  cloudDay  = vec3(0.80, 0.85, 0.90);
    vec3  cloudNight = vec3(0.01, 0.01, 0.02);
    earthCol = mix(earthCol, mix(cloudNight, cloudDay, dayMix), cloudMask * 0.65);

    // Ocean specular highlight (view-space approximate)
    float waterMask = texture2D(specMap, vUv).r;
    if (waterMask > 0.05 && NdL > 0.0) {
      vec3 V    = normalize(-vViewPos);
      vec3 sunV = normalize(vec3(0.65, 0.40, 0.65)); // approx sun in view space
      vec3 R    = reflect(-sunV, normalize(mat3(viewMatrix) * N));
      float spec = pow(max(dot(V, R), 0.0), 85.0);
      earthCol  += vec3(0.12, 0.28, 0.55) * spec * waterMask * NdL * 0.50;
    }

    // Minimum brightness so the deep-night side isn't completely black
    earthCol = max(earthCol, vec3(0.010));

    gl_FragColor = vec4(earthCol, 1.0);
  }
`;

// ─── Atmospheric rim GLSL shader ─────────────────────────────────────────────
const ATMO_VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewPos;
  void main() {
    vNormal  = normalize(normalMatrix * normal);
    vViewPos = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ATMO_FRAG = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewPos;

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(-vViewPos);

    // Fresnel: strongest at grazing angles (the rim)
    float rim = 1.0 - abs(dot(N, V));
    rim = pow(rim, 2.6);

    // Brighter on the sun side
    float sunFactor = dot(N, normalize(vec3(0.65, 0.40, 0.65))) * 0.5 + 0.5;
    sunFactor = pow(sunFactor, 1.3);

    vec3 rimColor = mix(
      vec3(0.03, 0.10, 0.42),   // dim dark-blue on night edge
      vec3(0.16, 0.52, 1.00),   // electric blue on day edge
      sunFactor
    );

    gl_FragColor = vec4(rimColor, rim * 0.58);
  }
`;

// ─── Earth mesh ───────────────────────────────────────────────────────────────
function EarthMesh() {
  const meshRef = useRef<THREE.Mesh>(null);

  const [dayMap, nightMap, cloudMap, specMap] = useLoader(TextureLoader, [
    DAY_URL, NIGHT_URL, CLOUD_URL, SPECULAR_URL,
  ]);

  // Improve texture quality
  const maps = [dayMap, nightMap, cloudMap, specMap];
  maps.forEach((t) => {
    if (!t) return;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.anisotropy = 4;
  });

  const uniforms = useRef({
    dayMap:   { value: dayMap },
    nightMap: { value: nightMap },
    cloudMap: { value: cloudMap },
    specMap:  { value: specMap },
    sunDir:   { value: SUN_DIR },
  });

  useFrame(() => {
    if (meshRef.current) meshRef.current.rotation.y += 0.003;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 72, 72]} />
      <shaderMaterial
        vertexShader={EARTH_VERT}
        fragmentShader={EARTH_FRAG}
        uniforms={uniforms.current}
      />
    </mesh>
  );
}

// ─── Atmospheric inner rim (front-face additive) ──────────────────────────────
function AtmosphereRim() {
  return (
    <mesh>
      <sphereGeometry args={[1.055, 56, 56]} />
      <shaderMaterial
        vertexShader={ATMO_VERT}
        fragmentShader={ATMO_FRAG}
        uniforms={{ sunDir: { value: SUN_DIR } }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.FrontSide}
      />
    </mesh>
  );
}

// ─── Atmospheric outer halo (back-face) ───────────────────────────────────────
function AtmosphereHalo() {
  return (
    <mesh>
      <sphereGeometry args={[1.14, 56, 56]} />
      <shaderMaterial
        vertexShader={ATMO_VERT}
        fragmentShader={ATMO_FRAG}
        uniforms={{ sunDir: { value: SUN_DIR } }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

// ─── Loading placeholder (shown while textures fetch) ────────────────────────
function EarthLoadingFallback() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (meshRef.current) meshRef.current.rotation.y += 0.003;
  });
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshPhongMaterial color={new THREE.Color(0x0a1a3a)} />
    </mesh>
  );
}

// ─── Star field ───────────────────────────────────────────────────────────────
function StarField() {
  const buf = useRef<Float32Array | null>(null);
  if (!buf.current) {
    const count = 2200;
    buf.current = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r     = 5 + Math.random() * 4;
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
      <pointsMaterial color={0xffffff} size={0.013} transparent opacity={0.65} sizeAttenuation />
    </points>
  );
}

// ─── Orbital overlay (Orbital Tracking page only) ────────────────────────────
function OrbitOverlay() {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 128; i++) {
    const a = (i / 128) * Math.PI * 2;
    pts.push(new THREE.Vector3(
      Math.cos(a) * 1.38,
      Math.sin(a) * 0.42,
      Math.sin(a) * 1.31,
    ));
  }
  const geo = new THREE.BufferGeometry().setFromPoints(pts);

  const t = 0.28 * Math.PI * 2;
  const spPos = new THREE.Vector3(Math.cos(t) * 1.38, Math.sin(t) * 0.42, Math.sin(t) * 1.31);

  return (
    <group>
      <line>
        <bufferGeometry attach="geometry" {...geo} />
        <lineBasicMaterial color={0x00aaff} transparent opacity={0.35} />
      </line>
      <mesh position={spPos}>
        <sphereGeometry args={[0.028, 10, 10]} />
        <meshBasicMaterial color={0x00ffcc} />
      </mesh>
      <mesh position={spPos}>
        <sphereGeometry args={[0.056, 10, 10]} />
        <meshBasicMaterial color={0x00ffcc} transparent opacity={0.18} />
      </mesh>
    </group>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────
export function MissionGlobe({
  compact = false,
  showOrbit = false,
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
      style={{ background: "radial-gradient(ellipse at center, #06101e 0%, #010408 100%)" }}
      aria-label="Interactive 3D Earth globe — Astra-1 orbital position"
    >
      <Canvas
        camera={{ position: [0, 0, 2.55], fov: 44 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          gl.setClearColor(0x010408, 1);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 0.9;
        }}
      >
        {/* Very dim ambient — space has near-zero ambient */}
        <ambientLight intensity={0.04} />

        {/* Primary sun — strong warm directional */}
        <directionalLight
          position={[5, 3, 5]}
          intensity={1.9}
          color={new THREE.Color(0xfff4e0)}
        />

        {/* Faint blue fill from opposite side */}
        <pointLight position={[-6, -2, -6]} intensity={0.07} color={new THREE.Color(0x1a3a88)} />

        <StarField />

        <Suspense fallback={<EarthLoadingFallback />}>
          <EarthMesh />
          <AtmosphereHalo />
          <AtmosphereRim />
          {showOrbit && <OrbitOverlay />}
        </Suspense>

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

      {/* Edge vignette to blend into card background */}
      <div
        className="pointer-events-none absolute inset-0 rounded-lg"
        style={{
          background: "radial-gradient(ellipse at center, transparent 50%, #010408bb 100%)",
        }}
      />
    </div>
  );
}