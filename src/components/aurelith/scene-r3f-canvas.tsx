import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Fog, Group, PointsMaterial } from "three";
import { BOUNDS, MATERIAL_COLORS, assign } from "@/lib/aurelith/spec";
import { stepRuntime } from "@/lib/aurelith/runtime";
import { hot, useAurelith } from "@/lib/aurelith/store";
import { verticesFor } from "@/lib/aurelith/vertices";

function tokenColor(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function ClosedGraph() {
  const group = useRef<Group>(null);
  const patternMat = useRef<PointsMaterial>(null);
  const particleMat = useRef<PointsMaterial>(null);
  const lastPush = useRef(0);
  const frameTimes = useRef<number[]>([]);
  const { camera, scene } = useThree();

  const quality = useAurelith((s) => s.quality);
  const pattern = useAurelith((s) => (s.fork ? s.fork.pattern : s.pattern));
  const verts = verticesFor(pattern);
  const particleN = BOUNDS.particle[quality];

  const positions = useMemo(() => {
    const arr = new Float32Array(verts.length * 3);
    verts.forEach((v, i) => {
      arr[i * 3] = v.x;
      arr[i * 3 + 1] = v.y;
      arr[i * 3 + 2] = (v.layer - 1) * 0.12;
    });
    return arr;
  }, [verts]);

  const particles = useMemo(() => {
    const n = Math.max(particleN, 1);
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < particleN; i += 1) {
      const a = (i / Math.max(particleN, 1)) * Math.PI * 2;
      const r = 0.2 + (i % 17) * 0.035;
      arr[i * 3] = Math.cos(a) * r;
      arr[i * 3 + 1] = Math.sin(a) * r;
      arr[i * 3 + 2] = ((i % 5) - 2) * 0.05;
    }
    return arr;
  }, [particleN]);

  useFrame((st, dt) => {
    const state = useAurelith.getState();
    const target = state.fork ? state.fork.target : state.target;
    const pat = state.fork ? state.fork.pattern : state.pattern;
    const step = Math.min(BOUNDS.dtMax, dt);
    stepRuntime(step, target, state.quality);
    const frame = assign(hot.applied, state.quality, pat);
    const g = group.current;
    if (g) {
      g.rotation.y = (frame.axis - 0.5) * 0.7;
      g.rotation.x = (frame.focus - 0.5) * 0.28;
      g.position.z = (0.5 - frame.fog) * 0.35;
    }
    camera.position.z = 2.1 + frame.fog * 1.2;
    const fog = scene.fog as Fog | null;
    if (fog) {
      fog.near = 2.2 + (1 - frame.haze) * 2;
      fog.far = 7 + (1 - frame.haze) * 4;
    }
    if (patternMat.current) {
      patternMat.current.color.set(frame.colors[0]);
      patternMat.current.size = 0.032 + frame.energy * 0.055;
      patternMat.current.opacity = 0.35 + frame.energy * 0.55;
    }
    if (particleMat.current) {
      particleMat.current.opacity = 0.28 + frame.haze * 0.3;
    }

    const frameMs = step * 1000;
    const times = frameTimes.current;
    times.push(frameMs);
    if (times.length > BOUNDS.fpsWindow) times.shift();
    const sorted = [...times].sort((a, b) => a - b);
    const p95 = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))] ?? frameMs;
    hot.fps = step > 0 ? 1 / step : 0;
    hot.frameMs = frameMs;
    hot.p95 = p95;
    hot.tVisual = st.clock.elapsedTime * 1000;
    hot.particles = frame.particleCount;
    hot.vertices = verts.length;
    const now = performance.now();
    if (now - lastPush.current > BOUNDS.metricsPushMs) {
      lastPush.current = now;
      useAurelith.getState().pushMetrics({
        fps: hot.fps,
        frameMs: hot.frameMs,
        p95: hot.p95,
        rms: hot.features.rms,
        low: hot.features.low,
        mid: hot.features.mid,
        high: hot.features.high,
        onset: hot.features.onset,
        tAudio: hot.features.tAudio,
        tVisual: now,
        particles: hot.particles,
        vertices: hot.vertices,
        playhead: hot.playhead,
        patternIndex: frame.patternIndex,
        materialIndex: frame.materialIndex,
        sampleWindowMs: 1000,
        source: "r3f / three.js · closed vertex table · not a general scene graph",
      });
    }
  });

  const bg = tokenColor("--color-void", "#050608");
  const hex = MATERIAL_COLORS[2][0];

  return (
    <>
      <color attach="background" args={[bg]} />
      <fog attach="fog" args={[bg, 3.2, 9]} />
      <group ref={group}>
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          </bufferGeometry>
          <pointsMaterial
            ref={patternMat}
            color={hex}
            size={0.04}
            transparent
            opacity={0.7}
            sizeAttenuation
            depthWrite={false}
          />
        </points>
        <lineLoop>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color={hex} transparent opacity={0.7} />
        </lineLoop>
        {particleN > 0 ? (
          <points>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[particles, 3]} />
            </bufferGeometry>
            <pointsMaterial
              ref={particleMat}
              color={tokenColor("--color-fg", "#ece7dc")}
              size={0.018}
              transparent
              opacity={0.4}
              depthWrite={false}
            />
          </points>
        ) : null}
      </group>
    </>
  );
}

export function SceneR3FCanvas() {
  const quality = useAurelith((s) => s.quality);
  const dprCap = BOUNDS.dpr[quality];
  return (
    <Canvas
      className="h-full w-full touch-none"
      dpr={[1, dprCap]}
      gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 2.6], fov: 42 }}
      frameloop="always"
      aria-label="AURELITH field · three.js / r3f · closed vertex table"
    >
      <ClosedGraph />
    </Canvas>
  );
}
