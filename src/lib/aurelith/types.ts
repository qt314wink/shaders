export const MACRO_IDS = [
  "intensity",
  "depth",
  "atmosphere",
  "focus",
  "material",
  "axis",
  "optical",
  "narrative",
] as const;

export type MacroId = (typeof MACRO_IDS)[number];

export const STAGE_MACROS: MacroId[] = ["intensity", "depth", "atmosphere", "focus"];

export const PATTERN_IDS = ["bloom", "lattice", "coil", "gate", "vesica"] as const;
export type PatternId = (typeof PATTERN_IDS)[number];

export const QUALITY_TIERS = ["HIGH", "MEDIUM", "SAFE"] as const;
export type QualityTier = (typeof QUALITY_TIERS)[number];

export type Mode = "studio" | "stage" | "diagnostics";

export type ControlSource = "pointer" | "keyboard" | "midi" | "system" | "trial" | "patch";

export type LabelKind = "target" | "applied" | "measured" | "simulation" | "future";

export type MacroMap = Record<MacroId, number>;

export type MacroDef = {
  id: MacroId;
  name: string;
  meaning: string;
  stageAccess: boolean;
  locked: boolean;
  audioTarget: string;
  visualTarget: string;
  mappingRule: string;
  fallback: string;
  smoothingSec: number;
  quantized: boolean;
};

export type MidiPortInfo = {
  id: string;
  name: string;
  manufacturer: string;
  state: string;
  type: string;
};

export type LedgerKind =
  | "intent"
  | "target"
  | "audio"
  | "midi"
  | "quality"
  | "trial"
  | "recovery"
  | "export"
  | "warning"
  | "fork";

export type LedgerEvent = {
  id: string;
  t: number;
  kind: LedgerKind;
  source: ControlSource;
  message: string;
  data?: Record<string, string | number | boolean | null>;
};

export type TrialVerdict = "supported" | "contradicted" | "mixed" | "in-progress" | "aborted";

export type TrialRecord = {
  id: string;
  at: number;
  hypothesisId: string;
  verdict: TrialVerdict;
  windowSec: number;
  notes: string;
  samples: Record<string, number>;
  method: string;
};

export type EvidenceMaturity =
  | "captured"
  | "candidate"
  | "source-backed"
  | "reviewed"
  | "measured"
  | "superseded"
  | "rejected"
  | "locked-simulation";

export type HypothesisStatus =
  | "untested"
  | "running"
  | "supported"
  | "contradicted"
  | "mixed"
  | "locked-simulation"
  | "rejected";

export type ChoreographyStep =
  | { action: "set-macro"; macro: MacroId; value: number }
  | { action: "soak"; seconds: number }
  | { action: "set-quality"; quality: QualityTier }
  | { action: "stabilize" }
  | { action: "compare"; metric: string; op: "lt" | "gt" | "hold"; threshold: number };

export type Hypothesis = {
  id: string;
  claim: string;
  prediction: string;
  curiosity: string;
  method: string;
  choreography: ChoreographyStep[];
  windowSec: number;
  units: string;
  status: HypothesisStatus;
  confidence: number;
  evidenceMaturity: EvidenceMaturity;
  knownLimitations: string[];
  sourceRefs: string[];
  trials: TrialRecord[];
  sideOf: "approved" | "side";
};

export type SideResearch = {
  id: string;
  title: string;
  origin: string;
  claim: string;
  contributes: string;
  limitation: string;
  maturity: EvidenceMaturity;
  confidence: number;
};

export type Observation = {
  id: string;
  capturedAt: number;
  claim: string;
  verifiedFacts: string[];
  inference: string[];
  significance: string;
  confidence: number;
  evidenceMaturity: EvidenceMaturity;
  knownLimitations: string[];
  sourceRefs: string[];
};

export type MetricsSnapshot = {
  fps: number;
  frameMs: number;
  p95: number;
  rms: number;
  low: number;
  mid: number;
  high: number;
  onset: number;
  tAudio: number;
  tVisual: number;
  particles: number;
  vertices: number;
  playhead: number;
  patternIndex: number;
  materialIndex: number;
  sampleWindowMs: number;
  source: string;
};

export type SceneAssignment = {
  propertyIndex: number;
  propertyId: string;
  value: number;
  unit: string;
  from: string;
  fieldIndex: number;
  fieldId: string;
  attr: string;
};

export type SceneManifest = {
  schema: "aurelith.scene.v1";
  scene: string;
  revision: number;
  exportedAt: string;
  pattern: PatternId;
  quality: QualityTier;
  macros: MacroMap;
  indices: {
    pattern: number;
    material: number;
    quality: number;
  };
  assignments: SceneAssignment[];
  bounds: {
    vertexCount: number;
    vertexMax: number;
    particleBudget: number;
    layerBudget: number;
  };
  midiMap: Record<string, MacroId>;
  warnings: string[];
  fallback: string;
  optical: "simulation-only";
  notes: string;
};

export type ForkState = {
  id: string;
  label: string;
  researchId: string;
  target: MacroMap;
  pattern: PatternId;
};
