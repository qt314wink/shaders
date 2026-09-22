import { BOUNDS, PATTERN_VERTEX_COUNT, type VertexRole } from "./spec";
import type { PatternId } from "./types";

export type Vertex = {
  i: number;
  role: VertexRole;
  x: number;
  y: number;
  u: number;
  layer: number;
};

function table(pattern: PatternId, build: (push: (v: Omit<Vertex, "i">) => void) => void): Vertex[] {
  const verts: Vertex[] = [];
  const cap = PATTERN_VERTEX_COUNT[pattern];
  build((v) => {
    if (verts.length >= cap) return;
    verts.push({ i: verts.length, ...v });
  });
  if (verts.length !== cap) {
    throw new Error(`${pattern} vertex table is ${verts.length}, declared ${cap}`);
  }
  return verts;
}

const VESICA = table("vesica", (push) => {
  const n = 32;
  for (let k = 0; k < n; k += 1) {
    const u = k / n;
    const ang = u * Math.PI * 2;
    push({ role: "rim-a", x: -0.28 + Math.cos(ang) * 0.58, y: Math.sin(ang) * 0.58, u, layer: 0 });
  }
  for (let k = 0; k < n; k += 1) {
    const u = k / n;
    const ang = u * Math.PI * 2;
    push({ role: "rim-b", x: 0.28 + Math.cos(ang) * 0.58, y: Math.sin(ang) * 0.58, u, layer: 0 });
  }
});

const BLOOM = table("bloom", (push) => {
  const n = 16;
  for (let k = 0; k < n; k += 1) {
    const u = k / n;
    const ang = u * Math.PI * 2;
    push({ role: "petal", x: Math.cos(ang) * 0.62, y: Math.sin(ang) * 0.62, u, layer: 0 });
  }
});

const COIL = table("coil", (push) => {
  const n = 96;
  const turns = 3.5;
  for (let k = 0; k < n; k += 1) {
    const u = k / (n - 1);
    const ang = u * Math.PI * 2 * turns;
    const r = 0.08 + u * 0.78;
    push({ role: "coil", x: Math.cos(ang) * r, y: Math.sin(ang) * r, u, layer: 0 });
  }
});

const GATE = table("gate", (push) => {
  const arch = 16;
  for (let k = 0; k < arch; k += 1) {
    const u = k / (arch - 1);
    const ang = Math.PI + u * Math.PI;
    push({
      role: "arch",
      x: Math.cos(ang) * 0.46,
      y: Math.sin(ang) * 0.46 + 0.08,
      u,
      layer: 0,
    });
  }
  const posts: Array<[number, number, number]> = [
    [-0.46, 0.08, 0],
    [-0.46, 0.28, 0.33],
    [-0.46, 0.48, 0.66],
    [-0.46, 0.62, 1],
    [0.46, 0.08, 0],
    [0.46, 0.28, 0.33],
    [0.46, 0.48, 0.66],
    [0.46, 0.62, 1],
  ];
  for (const [x, y, u] of posts) push({ role: "post", x, y, u, layer: 0 });
});

const LATTICE = table("lattice", (push) => {
  const n = 7;
  for (let y = 0; y < n; y += 1) {
    for (let x = 0; x < n; x += 1) {
      const u = (y * n + x) / (n * n - 1);
      push({
        role: "lattice",
        x: -0.78 + (x / (n - 1)) * 1.56,
        y: -0.78 + (y / (n - 1)) * 1.56,
        u,
        layer: 0,
      });
    }
  }
});

export const PATTERN_TABLES: Record<PatternId, Vertex[]> = {
  vesica: VESICA,
  bloom: BLOOM,
  coil: COIL,
  gate: GATE,
  lattice: LATTICE,
};

export const RING: Vertex[] = Array.from({ length: BOUNDS.ringSamples }, (_, k) => {
  const u = k / BOUNDS.ringSamples;
  const ang = u * Math.PI * 2;
  return { i: k, role: "rim-a" as VertexRole, x: Math.cos(ang), y: Math.sin(ang), u, layer: 0 };
});

export function verticesFor(pattern: PatternId): Vertex[] {
  return PATTERN_TABLES[pattern];
}

(function assertVertexBounds() {
  for (const [id, verts] of Object.entries(PATTERN_TABLES)) {
    if (verts.length > BOUNDS.vertexMax) {
      throw new Error(`${id} exceeds vertexMax (${verts.length})`);
    }
  }
})();
