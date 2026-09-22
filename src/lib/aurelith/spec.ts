import type { MacroId, MacroMap, PatternId, QualityTier } from "./types";
import { MACRO_IDS, PATTERN_IDS, QUALITY_TIERS } from "./types";

/** Closed v1 execution bounds. Nothing in the runtime may exceed these. */
export const BOUNDS = {
  dtMax: 0.05,
  quantum: 0.001,
  macroMin: 0,
  macroMax: 1,
  vertexMax: 96,
  ringSamples: 48,
  fieldSamples: 32,
  particle: { HIGH: 96, MEDIUM: 48, SAFE: 0 } as Record<QualityTier, number>,
  particleBase: { HIGH: 32, MEDIUM: 16, SAFE: 0 } as Record<QualityTier, number>,
  layers: { HIGH: 7, MEDIUM: 5, SAFE: 3 } as Record<QualityTier, number>,
  trialStepsMax: 8,
  soakMaxSec: 6,
  ledgerMax: 120,
  undoMax: 16,
  observationsMax: 24,
  fpsWindow: 60,
  metricsPushMs: 160,
  midiCcMax: 127,
  gainCeiling: 0.35,
  opticalLocked: 0.35,
  p95: { HIGH: 26, MEDIUM: 34 },
  analyserFft: 2048,
  dpr: { HIGH: 2, MEDIUM: 1.5, SAFE: 1 } as Record<QualityTier, number>,
  axisBuckets: 3,
  materialCount: 12,
  patternCount: 5,
  macroCount: 8,
  propertyCount: 8,
  fieldCount: 6,
} as const;

export const SCOPE = {
  in: [
    "8 macros with Target / Applied / Measured labels",
    "8 typed properties with units and ranges",
    "6 scene fields with bounded sample counts",
    "5 ritual-geometry patterns as closed vertex tables",
    "12 shader-grammar specimens, indexed, no named-effect flags",
    "3 quality tiers that cap vertices, particles, layers, DPR",
    "Studio / Stage / Diagnostics",
    "Optional MIDI adapter",
    "Manifest round-trip (aurelith.scene.v1)",
  ],
  out: [
    "Physical optical / laser / haptic output",
    "Microphone input",
    "G-code, kerf, or machine-tool export",
    "Named-effect flags or material-specific operators",
    "Continuous Sacred⇔Industrial morph",
    "Unbounded particle, vertex, or trial growth",
    "Health, diagnostic, or treatment claims",
    "General VJ deck / unbounded scene graph",
  ],
} as const;

export const PROPERTY_IDS = [
  "energy",
  "recession",
  "haze",
  "attention",
  "specimen",
  "language",
  "beam",
  "duration",
] as const;
export type PropertyId = (typeof PROPERTY_IDS)[number];

export const FIELD_IDS = [
  "emissive",
  "density",
  "particle",
  "vignette",
  "recipe",
  "geometry-mix",
] as const;
export type FieldId = (typeof FIELD_IDS)[number];

export const VERTEX_ATTRS = [
  "stroke-alpha",
  "radius-scale",
  "count",
  "core-weight",
  "palette-index",
  "pattern-mix",
  "beam-alpha",
  "playhead-rate",
] as const;
export type VertexAttr = (typeof VERTEX_ATTRS)[number];

export const VERTEX_ROLES = [
  "rim-a",
  "rim-b",
  "petal",
  "coil",
  "arch",
  "post",
  "lattice",
] as const;
export type VertexRole = (typeof VERTEX_ROLES)[number];

export type PropertyDef = {
  index: number;
  id: PropertyId;
  unit: string;
  kind: "weight" | "index" | "enum" | "locked" | "seconds";
  range: [number, number];
  from: MacroId;
  field: FieldId;
  attr: VertexAttr;
  notes: string;
};

export const PROPERTY_DEFS: Record<PropertyId, PropertyDef> = {
  energy: {
    index: 0,
    id: "energy",
    unit: "weight",
    kind: "weight",
    range: [0, 1],
    from: "intensity",
    field: "emissive",
    attr: "stroke-alpha",
    notes: "Visual emissive leads audio. Gain is a squared map under the safety ceiling.",
  },
  recession: {
    index: 1,
    id: "recession",
    unit: "weight",
    kind: "weight",
    range: [0, 1],
    from: "depth",
    field: "density",
    attr: "radius-scale",
    notes: "Fog / layer radius. Smoothed. Never a scene teleport.",
  },
  haze: {
    index: 2,
    id: "haze",
    unit: "weight",
    kind: "weight",
    range: [0, 1],
    from: "atmosphere",
    field: "particle",
    attr: "count",
    notes: "Particle budget is quality-capped before the drone is touched.",
  },
  attention: {
    index: 3,
    id: "attention",
    unit: "weight",
    kind: "weight",
    range: [0, 1],
    from: "focus",
    field: "vignette",
    attr: "core-weight",
    notes: "Centre-biased. No pan mapping.",
  },
  specimen: {
    index: 4,
    id: "specimen",
    unit: "index",
    kind: "index",
    range: [0, 11],
    from: "material",
    field: "recipe",
    attr: "palette-index",
    notes: "Discrete index into the 12-specimen catalog. Not a hue slider.",
  },
  language: {
    index: 5,
    id: "language",
    unit: "enum",
    kind: "enum",
    range: [0, 2],
    from: "axis",
    field: "geometry-mix",
    attr: "pattern-mix",
    notes: "Quantized: 0 Sacred, 1 Threshold, 2 Industrial.",
  },
  beam: {
    index: 6,
    id: "beam",
    unit: "locked",
    kind: "locked",
    range: [0.35, 0.35],
    from: "optical",
    field: "emissive",
    attr: "beam-alpha",
    notes: "Fixed. Simulation-only. No physical output adapter.",
  },
  duration: {
    index: 7,
    id: "duration",
    unit: "s",
    kind: "seconds",
    range: [0.2, 1.4],
    from: "narrative",
    field: "emissive",
    attr: "playhead-rate",
    notes: "Playhead walk rate and coil turn emphasis. Scene-level.",
  },
};

export const FIELD_DEFS: Record<
  FieldId,
  { index: number; id: FieldId; kind: string; unit: string; domain: "surface" | "volume" | "angular" | "temporal"; samples: number; notes: string }
> = {
  emissive: {
    index: 0,
    id: "emissive",
    kind: "weight",
    unit: "weight",
    domain: "temporal",
    samples: BOUNDS.fieldSamples,
    notes: "Stroke and playhead glow. Driven by energy.",
  },
  density: {
    index: 1,
    id: "density",
    kind: "weight",
    unit: "weight",
    domain: "volume",
    samples: BOUNDS.fieldSamples,
    notes: "Fog distance and layer radius scale. Driven by recession.",
  },
  particle: {
    index: 2,
    id: "particle",
    kind: "count",
    unit: "count",
    domain: "volume",
    samples: 1,
    notes: "Integer budget. SAFE is identically 0.",
  },
  vignette: {
    index: 3,
    id: "vignette",
    kind: "weight",
    unit: "weight",
    domain: "angular",
    samples: BOUNDS.fieldSamples,
    notes: "Rim falloff. Inverse of attention.",
  },
  recipe: {
    index: 4,
    id: "recipe",
    kind: "index",
    unit: "index",
    domain: "surface",
    samples: 1,
    notes: "Shader-grammar specimen index 0–11.",
  },
  "geometry-mix": {
    index: 5,
    id: "geometry-mix",
    kind: "enum",
    unit: "enum",
    domain: "surface",
    samples: 1,
    notes: "Axis bucket. Not a continuous morph.",
  },
};

export const MATERIAL_SPECIMENS = [
  { index: 0, id: "oil-slick", title: "Oil Slick" },
  { index: 1, id: "soap-film", title: "Soap Film" },
  { index: 2, id: "nacre", title: "Nacre" },
  { index: 3, id: "labradorite", title: "Labradorite" },
  { index: 4, id: "butterfly-structural-color", title: "Butterfly" },
  { index: 5, id: "holographic-foil", title: "Holo Foil" },
  { index: 6, id: "bismuth-oxide", title: "Bismuth" },
  { index: 7, id: "molten-chrome", title: "Molten Chrome" },
  { index: 8, id: "caustic-water", title: "Caustic Water" },
  { index: 9, id: "cloud", title: "Cloud" },
  { index: 10, id: "nebula", title: "Nebula" },
  { index: 11, id: "opalescent-glass", title: "Opal Glass" },
] as const;

export const MATERIAL_COLORS: [string, string, string][] = [
  ["#7eb0b8", "#8fbfa0", "#d4c4a8"],
  ["#9bb7c4", "#ece7dc", "#7eb0b8"],
  ["#ece7dc", "#c9b8a0", "#8fbfa0"],
  ["#7d9a7e", "#7eb0b8", "#b9c4d0"],
  ["#8fbfa0", "#7eb0b8", "#ece7dc"],
  ["#b9c4d0", "#7eb0b8", "#ece7dc"],
  ["#8fbfa0", "#c4a574", "#7eb0b8"],
  ["#b9c4d0", "#8b877e", "#ece7dc"],
  ["#7eb0b8", "#ece7dc", "#5c8a9a"],
  ["#b9c4d0", "#8b877e", "#ece7dc"],
  ["#7d9a7e", "#7eb0b8", "#b9c4d0"],
  ["#ece7dc", "#7eb0b8", "#8fbfa0"],
];

export const PATTERN_VERTEX_COUNT: Record<PatternId, number> = {
  vesica: 64,
  bloom: 16,
  coil: 96,
  gate: 24,
  lattice: 49,
};

export const AXIS_VALUES = [0.12, 0.5, 0.88] as const;
export const AXIS_LABELS = ["Sacred", "Threshold", "Industrial"] as const;

export const DEFAULT_MACROS: MacroMap = {
  intensity: 0.42,
  depth: 0.58,
  atmosphere: 0.36,
  focus: 0.64,
  material: 2 / 11,
  axis: 0.12,
  optical: BOUNDS.opticalLocked,
  narrative: 0.4,
};

export const OPTICAL_LOCKED = BOUNDS.opticalLocked;

export function clamp01(v: number) {
  if (!Number.isFinite(v)) return 0;
  return Math.min(BOUNDS.macroMax, Math.max(BOUNDS.macroMin, v));
}

export function quantize(v: number) {
  return Math.round(clamp01(v) / BOUNDS.quantum) * BOUNDS.quantum;
}

export function macroIndex(id: MacroId) {
  return MACRO_IDS.indexOf(id);
}

export function patternIndex(id: PatternId) {
  return PATTERN_IDS.indexOf(id);
}

export function qualityIndex(id: QualityTier) {
  return QUALITY_TIERS.indexOf(id);
}

export function materialIndexOf(v: number) {
  const i = Math.round(clamp01(v) * (BOUNDS.materialCount - 1));
  return Math.min(BOUNDS.materialCount - 1, Math.max(0, i));
}

export function materialIndex(v: number) {
  return MATERIAL_SPECIMENS[materialIndexOf(v)];
}

export function quantizeMaterial(v: number) {
  return materialIndexOf(v) / (BOUNDS.materialCount - 1);
}

export function axisBucket(v: number) {
  if (v < 0.33) return 0;
  if (v < 0.66) return 1;
  return 2;
}

export function axisLabel(v: number) {
  return AXIS_LABELS[axisBucket(v)];
}

export function quantizeAxis(v: number) {
  return AXIS_VALUES[axisBucket(v)];
}

export function constrainMacro(id: MacroId, value: number) {
  if (id === "optical") return OPTICAL_LOCKED;
  if (id === "axis") return quantizeAxis(value);
  if (id === "material") return quantizeMaterial(value);
  return quantize(value);
}

export function copyMacros(m: MacroMap): MacroMap {
  return { ...m };
}

export function particleBudget(quality: QualityTier, atmosphere: number) {
  if (quality === "SAFE") return 0;
  const max = BOUNDS.particle[quality];
  const base = BOUNDS.particleBase[quality];
  const n = Math.round(base + clamp01(atmosphere) * (max - base));
  return Math.min(max, Math.max(0, n));
}

export function layerBudget(quality: QualityTier) {
  return BOUNDS.layers[quality];
}

export type Assignment = {
  propertyIndex: number;
  propertyId: PropertyId;
  value: number;
  unit: string;
  from: MacroId;
  fieldIndex: number;
  fieldId: FieldId;
  attr: VertexAttr;
};

export type SceneFrame = {
  pattern: PatternId;
  patternIndex: number;
  quality: QualityTier;
  qualityIndex: number;
  materialIndex: number;
  materialId: string;
  colors: [string, string, string];
  vertexCount: number;
  particleCount: number;
  layers: number;
  playheadRate: number;
  energy: number;
  fog: number;
  focus: number;
  haze: number;
  axis: number;
  axisBucket: number;
  optical: number;
  assignments: Assignment[];
  fields: Record<FieldId, number>;
};

export function assign(applied: MacroMap, quality: QualityTier, pattern: PatternId): SceneFrame {
  const matI = materialIndexOf(applied.material);
  const bucket = axisBucket(applied.axis);
  const energy = clamp01(applied.intensity);
  const fog = 0.18 + clamp01(applied.depth) * 0.55;
  const focus = clamp01(applied.focus);
  const haze = clamp01(applied.atmosphere);
  const duration = 0.2 + clamp01(applied.narrative) * 1.2;
  const fields: Record<FieldId, number> = {
    emissive: energy,
    density: fog,
    particle: particleBudget(quality, haze),
    vignette: 1 - focus,
    recipe: matI,
    "geometry-mix": bucket,
  };
  const assignments: Assignment[] = PROPERTY_IDS.map((pid) => {
    const def = PROPERTY_DEFS[pid];
    let value = clamp01(applied[def.from]);
    if (pid === "specimen") value = matI;
    else if (pid === "language") value = bucket;
    else if (pid === "beam") value = OPTICAL_LOCKED;
    else if (pid === "duration") value = duration;
    else if (pid === "energy") value = energy;
    else if (pid === "recession") value = fog;
    else if (pid === "haze") value = haze;
    else if (pid === "attention") value = focus;
    return {
      propertyIndex: def.index,
      propertyId: pid,
      value,
      unit: def.unit,
      from: def.from,
      fieldIndex: FIELD_DEFS[def.field].index,
      fieldId: def.field,
      attr: def.attr,
    };
  });
  return {
    pattern,
    patternIndex: patternIndex(pattern),
    quality,
    qualityIndex: qualityIndex(quality),
    materialIndex: matI,
    materialId: MATERIAL_SPECIMENS[matI].id,
    colors: MATERIAL_COLORS[matI] ?? MATERIAL_COLORS[2],
    vertexCount: PATTERN_VERTEX_COUNT[pattern],
    particleCount: fields.particle,
    layers: layerBudget(quality),
    playheadRate: 0.28 + clamp01(applied.narrative) * 0.5,
    energy,
    fog,
    focus,
    haze,
    axis: applied.axis,
    axisBucket: bucket,
    optical: OPTICAL_LOCKED,
    assignments,
    fields,
  };
}

export function assertCatalogs() {
  if (MACRO_IDS.length !== BOUNDS.macroCount) throw new Error("macro catalog size");
  if (PATTERN_IDS.length !== BOUNDS.patternCount) throw new Error("pattern catalog size");
  if (MATERIAL_SPECIMENS.length !== BOUNDS.materialCount) throw new Error("material catalog size");
  if (PROPERTY_IDS.length !== BOUNDS.propertyCount) throw new Error("property catalog size");
  if (FIELD_IDS.length !== BOUNDS.fieldCount) throw new Error("field catalog size");
  for (const p of PATTERN_IDS) {
    if (PATTERN_VERTEX_COUNT[p] > BOUNDS.vertexMax) {
      throw new Error(`pattern ${p} exceeds vertexMax`);
    }
  }
}
assertCatalogs();
