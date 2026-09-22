import { useEffect, useRef } from "react";
import { BOUNDS, assign, type SceneFrame } from "@/lib/aurelith/spec";
import { stepRuntime } from "@/lib/aurelith/runtime";
import { hot, useAurelith } from "@/lib/aurelith/store";
import { RING, verticesFor, type Vertex } from "@/lib/aurelith/vertices";
import { cn } from "@/lib/utils";

type Particle = { a: number; r: number; s: number; p: number };

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgba(hex: string, a: number) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, a))})`;
}

export function SceneCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const particles: Particle[] = Array.from({ length: BOUNDS.particle.HIGH }, (_, i) => ({
      a: (i / BOUNDS.particle.HIGH) * Math.PI * 2,
      r: 0.18 + (i % 17) * 0.04,
      s: 0.15 + (i % 9) * 0.05,
      p: (i * 0.37) % 1,
    }));

    let raf = 0;
    let last = performance.now();
    let lastPush = 0;
    let running = true;
    const frameTimes: number[] = [];
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const quality = useAurelith.getState().quality;
      const cap = BOUNDS.dpr[quality];
      const dpr = Math.min(window.devicePixelRatio || 1, cap);
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const draw = (now: number) => {
      if (!running) return;
      const dt = Math.min(BOUNDS.dtMax, (now - last) / 1000);
      last = now;
      const state = useAurelith.getState();
      const target = state.fork ? state.fork.target : state.target;
      const pattern = state.fork ? state.fork.pattern : state.pattern;
      const quality = state.quality;
      stepRuntime(dt, target, quality);

      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      const t = reduce ? 0 : now / 1000;
      const frame = assign(hot.applied, quality, pattern);
      const verts = verticesFor(pattern);
      const playhead = verts.length ? Math.floor((t * frame.playheadRate * verts.length) % verts.length) : 0;
      drawField(ctx, w, h, t, frame, verts, playhead, particles);

      const frameMs = dt * 1000;
      frameTimes.push(frameMs);
      if (frameTimes.length > BOUNDS.fpsWindow) frameTimes.shift();
      const sorted = [...frameTimes].sort((a, b) => a - b);
      const p95 = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))] ?? frameMs;
      hot.fps = dt > 0 ? 1 / dt : 0;
      hot.frameMs = frameMs;
      hot.p95 = p95;
      hot.tVisual = now;
      hot.frameTimes = frameTimes;
      hot.particles = frame.particleCount;
      hot.vertices = verts.length;
      hot.playhead = playhead;

      if (now - lastPush > BOUNDS.metricsPushMs) {
        lastPush = now;
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
          source: "rAF + AnalyserNode · vertex table bounded · visual-control signal, not subjective quality",
        });
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative h-full min-h-[280px] w-full overflow-hidden bg-void">
      <canvas ref={ref} className="preview-canvas absolute inset-0 h-full w-full" />
      <CanvasHud />
    </div>
  );
}

function CanvasHud() {
  const vertices = useAurelith((s) => s.metrics.vertices);
  const playhead = useAurelith((s) => s.metrics.playhead);
  const patternIndex = useAurelith((s) => s.metrics.patternIndex);
  const materialIndex = useAurelith((s) => s.metrics.materialIndex);
  const particles = useAurelith((s) => s.metrics.particles);
  const pattern = useAurelith((s) => (s.fork ? s.fork.pattern : s.pattern));
  const quality = useAurelith((s) => s.quality);

  return (
    <>
      <div className="pointer-events-none absolute top-3 left-3 rounded-sm border border-border bg-void/70 px-2 py-1 font-mono text-2xs tracking-caps text-signal uppercase">
        Optical · simulation only
      </div>
      <div
        className={cn(
          "pointer-events-none absolute bottom-3 left-3 max-w-[min(100%-1.5rem,28rem)] rounded-sm border border-border bg-void/75 px-2.5 py-1.5 font-mono text-2xs tabular-nums tracking-caps text-muted uppercase",
        )}
      >
        <p className="text-fg">
          P{patternIndex} {pattern} · V {vertices}/{BOUNDS.vertexMax} · v[{playhead}]
        </p>
        <p className="mt-0.5">
          M{materialIndex} · Q {quality} · particles {particles}/{BOUNDS.particle[quality]} · F {BOUNDS.fieldCount}
        </p>
      </div>
    </>
  );
}

function drawField(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  frame: SceneFrame,
  verts: Vertex[],
  playhead: number,
  particles: Particle[],
) {
  const f = hot.features;
  const cx = w * 0.5;
  const cy = h * 0.5;
  const R = Math.min(w, h) * 0.46;
  const cols = frame.colors;
  const energy = 0.28 + frame.energy * (0.55 + f.rms * 1.2 + f.onset * 0.45);
  const fog = frame.fog;

  ctx.fillStyle = "#050608";
  ctx.fillRect(0, 0, w, h);

  const g = ctx.createRadialGradient(cx, cy, R * 0.05, cx, cy, R * (1.35 + fog * 0.4));
  g.addColorStop(0, rgba(cols[0], 0.14 + energy * 0.18));
  g.addColorStop(0.45, rgba(cols[1], 0.08));
  g.addColorStop(1, "rgba(5,6,8,0.94)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(t * 0.018 * (0.4 + frame.energy));
  ctx.globalCompositeOperation = "lighter";

  drawRings(ctx, R, frame.layers, cols, energy, fog, t, f);
  drawPattern(ctx, R, frame, verts, energy, t);
  drawSignal(ctx, R, verts, playhead, energy, f, cols);
  drawOptical(ctx, R, frame.optical, energy, cols);

  const nPart = Math.min(frame.particleCount, particles.length, BOUNDS.particle[frame.quality]);
  if (nPart > 0) {
    ctx.globalAlpha = 0.35 + frame.haze * 0.4;
    for (let i = 0; i < nPart; i += 1) {
      const p = particles[i];
      const ang = p.a + t * p.s * (0.15 + frame.energy * 0.4);
      const rad = R * (p.r + frame.fog * 0.12 + Math.sin(t * 0.7 + p.p * 6) * 0.03);
      const x = Math.cos(ang) * rad;
      const y = Math.sin(ang) * rad * (0.92 + frame.fog * 0.08);
      ctx.fillStyle = rgba(cols[i % 3], 0.18 + f.high * 0.4);
      ctx.beginPath();
      ctx.arc(x, y, 0.8 + frame.haze * 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  ctx.restore();

  const vig = ctx.createRadialGradient(cx, cy, R * (0.28 + frame.focus * 0.2), cx, cy, R * 1.15);
  vig.addColorStop(0, "rgba(5,6,8,0)");
  vig.addColorStop(1, `rgba(5,6,8,${0.18 + frame.fields.vignette * 0.28})`);
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);

  if (f.onset > 0.4) {
    ctx.fillStyle = rgba(cols[0], 0.04 * f.onset);
    ctx.fillRect(0, 0, w, h);
  }
}

function strokeLoop(ctx: CanvasRenderingContext2D, verts: Vertex[], R: number, closed: boolean) {
  if (!verts.length) return;
  ctx.beginPath();
  verts.forEach((v, i) => {
    const x = v.x * R;
    const y = v.y * R;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  if (closed) ctx.closePath();
  ctx.stroke();
}

function drawPattern(
  ctx: CanvasRenderingContext2D,
  R: number,
  frame: SceneFrame,
  verts: Vertex[],
  energy: number,
  t: number,
) {
  const cols = frame.colors;
  const a = verts.filter((v) => v.role === "rim-a");
  const b = verts.filter((v) => v.role === "rim-b");
  const petals = verts.filter((v) => v.role === "petal");
  const coil = verts.filter((v) => v.role === "coil");
  const arch = verts.filter((v) => v.role === "arch");
  const posts = verts.filter((v) => v.role === "post");
  const lattice = verts.filter((v) => v.role === "lattice");

  if (a.length) {
    ctx.strokeStyle = rgba(cols[1], 0.5 + energy * 0.32);
    ctx.lineWidth = 1.35;
    strokeLoop(ctx, a, R, true);
  }
  if (b.length) {
    ctx.strokeStyle = rgba(cols[2], 0.48 + energy * 0.3);
    ctx.lineWidth = 1.35;
    strokeLoop(ctx, b, R, true);
  }
  if (petals.length) {
    ctx.strokeStyle = rgba(cols[2], 0.46 + energy * 0.32);
    ctx.lineWidth = 1.2;
    for (const v of petals) {
      const ang = v.u * Math.PI * 2 + t * 0.04;
      const len = R * (0.22 + energy * 0.16);
      ctx.beginPath();
      ctx.ellipse(v.x * R * 0.7, v.y * R * 0.7, len * 0.22, len * 0.55, ang, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  if (coil.length) {
    ctx.strokeStyle = rgba(cols[0], 0.55 + energy * 0.3);
    ctx.lineWidth = 1.6;
    strokeLoop(ctx, coil, R, false);
  }
  if (arch.length) {
    ctx.strokeStyle = rgba(cols[1], 0.5 + energy * 0.28);
    ctx.lineWidth = 1.8;
    strokeLoop(ctx, arch, R, false);
  }
  if (posts.length) {
    ctx.strokeStyle = rgba(cols[1], 0.48 + energy * 0.25);
    ctx.lineWidth = 1.6;
    const left = posts.filter((v) => v.x < 0);
    const right = posts.filter((v) => v.x >= 0);
    strokeLoop(ctx, left, R, false);
    strokeLoop(ctx, right, R, false);
  }
  if (lattice.length) {
    ctx.strokeStyle = rgba(cols[0], 0.3 + energy * 0.22);
    ctx.lineWidth = 0.9;
    const n = 7;
    ctx.save();
    ctx.rotate(Math.PI / 12 + t * 0.008);
    for (let row = 0; row < n; row += 1) {
      const slice = lattice.slice(row * n, row * n + n);
      strokeLoop(ctx, slice, R, false);
    }
    for (let col = 0; col < n; col += 1) {
      ctx.beginPath();
      for (let row = 0; row < n; row += 1) {
        const v = lattice[row * n + col];
        if (!v) continue;
        const x = v.x * R;
        const y = v.y * R;
        if (row === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawRings(
  ctx: CanvasRenderingContext2D,
  R: number,
  layers: number,
  cols: [string, string, string],
  energy: number,
  fog: number,
  t: number,
  f: { low: number; mid: number },
) {
  const n = Math.min(layers, BOUNDS.layers.HIGH);
  for (let i = 1; i <= n; i += 1) {
    const r = (R * i) / (n + 0.4) * (0.92 + fog * 0.08);
    ctx.strokeStyle = rgba(cols[i % 3], 0.42 + energy * 0.35 + f.low * 0.15);
    ctx.lineWidth = 1.15 + energy * 1.4;
    ctx.beginPath();
    for (let k = 0; k < RING.length; k += 1) {
      const v = RING[k];
      const x = v.x * r;
      const y = v.y * r;
      if (k === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
    if (i % 2 === 0) {
      ctx.save();
      ctx.rotate(t * 0.04 * (i % 3 === 0 ? 1 : -1));
      ctx.beginPath();
      const span = Math.floor(RING.length * (0.4 + f.mid * 0.4));
      for (let k = 0; k < span; k += 1) {
        const v = RING[k];
        const x = v.x * r;
        const y = v.y * r;
        if (k === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = rgba(cols[0], 0.4 + energy * 0.3);
      ctx.stroke();
      ctx.restore();
    }
  }
}

function drawSignal(
  ctx: CanvasRenderingContext2D,
  R: number,
  verts: Vertex[],
  playhead: number,
  energy: number,
  f: { rms: number; onset: number },
  cols: [string, string, string],
) {
  const v = verts[playhead];
  if (!v) return;
  const x = v.x * R;
  const y = v.y * R;
  const glow = 5 + energy * 10 + f.onset * 8;
  const grd = ctx.createRadialGradient(x, y, 0, x, y, glow);
  grd.addColorStop(0, "rgba(236,231,220,0.95)");
  grd.addColorStop(0.35, rgba(cols[0], 0.5));
  grd.addColorStop(1, "rgba(236,231,220,0)");
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(x, y, glow, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = rgba(cols[0], 0.35 + f.rms * 0.3);
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  const trail = 12;
  for (let k = 0; k < trail; k += 1) {
    const idx = (playhead - k + verts.length) % verts.length;
    const p = verts[idx];
    const px = p.x * R;
    const py = p.y * R;
    if (k === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
}

function drawOptical(
  ctx: CanvasRenderingContext2D,
  R: number,
  optical: number,
  energy: number,
  cols: [string, string, string],
) {
  ctx.globalAlpha = 0.16 + optical * 0.32;
  for (let i = -1; i <= 1; i += 1) {
    ctx.save();
    ctx.rotate(i * 0.18);
    const grd = ctx.createLinearGradient(0, 0, 0, -R);
    grd.addColorStop(0, rgba(cols[0], 0.35 + energy * 0.2));
    grd.addColorStop(1, "rgba(126,176,184,0)");
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.moveTo(-6, 0);
    ctx.lineTo(6, 0);
    ctx.lineTo(R * 0.08, -R * 0.92);
    ctx.lineTo(-R * 0.08, -R * 0.92);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}
