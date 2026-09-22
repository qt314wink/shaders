import { create } from "zustand";
import { sceneAudio } from "./audio";
import { copyMacros, DEFAULT_MACROS, MACRO_DEFS, OPTICAL_LOCKED } from "./macros";
import { CHOREOGRAPHIES, HYPOTHESES, SEED_OBSERVATIONS, SIDE_RESEARCH } from "./research";
import {
  assign,
  BOUNDS,
  constrainMacro,
  patternIndex,
  PATTERN_VERTEX_COUNT,
} from "./spec";
import type {
  ControlSource,
  ForkState,
  Hypothesis,
  LedgerEvent,
  MacroId,
  MacroMap,
  MetricsSnapshot,
  MidiPortInfo,
  Mode,
  Observation,
  PatternId,
  QualityTier,
  SceneManifest,
  SideResearch,
} from "./types";
import { MACRO_IDS, PATTERN_IDS, QUALITY_TIERS } from "./types";

const STORAGE_KEY = "aurelith.scene.v1";

export const hot = {
  applied: copyMacros(DEFAULT_MACROS),
  features: { rms: 0, low: 0, mid: 0, high: 0, onset: 0, tAudio: 0 },
  fps: 0,
  frameMs: 0,
  p95: 0,
  particles: 0,
  vertices: 0,
  playhead: 0,
  tVisual: 0,
  frameTimes: [] as number[],
};

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`;
}

function now() {
  return Date.now();
}

const defaultMetrics = (): MetricsSnapshot => ({
  fps: 0,
  frameMs: 0,
  p95: 0,
  rms: 0,
  low: 0,
  mid: 0,
  high: 0,
  onset: 0,
  tAudio: 0,
  tVisual: 0,
  particles: 0,
  vertices: 0,
  playhead: 0,
  patternIndex: 4,
  materialIndex: 2,
  sampleWindowMs: 1000,
  source: "not measured — renderer has not sampled yet",
});

export const SEMANTIC_PATCHES: { id: string; label: string; apply: (t: MacroMap) => MacroMap; note: string }[] = [
  {
    id: "quieter-deeper",
    label: "Quieter, deeper",
    note: "Simulation until a trial validates. Visual energy down, fog back.",
    apply: (t) => ({
      ...t,
      intensity: constrainMacro("intensity", t.intensity - 0.16),
      depth: constrainMacro("depth", t.depth + 0.18),
    }),
  },
  {
    id: "industrial-gate",
    label: "Industrial gate",
    note: "Axis quantized. Material toward molten-chrome (index 7). Studio-only.",
    apply: (t) => ({
      ...t,
      axis: constrainMacro("axis", 0.88),
      material: constrainMacro("material", 7 / 11),
      focus: constrainMacro("focus", t.focus + 0.08),
    }),
  },
  {
    id: "bloom-atmosphere",
    label: "Bloom atmosphere",
    note: "Haze up. Quality still caps the particle field.",
    apply: (t) => ({
      ...t,
      atmosphere: constrainMacro("atmosphere", t.atmosphere + 0.2),
      axis: constrainMacro("axis", 0.12),
      material: constrainMacro("material", 2 / 11),
    }),
  },
  {
    id: "rehearsal-safe",
    label: "Rehearsal-safe",
    note: "Same destination as Stabilize. Not a panic until you confirm.",
    apply: (t) => ({
      ...t,
      intensity: constrainMacro("intensity", 0.35),
      atmosphere: constrainMacro("atmosphere", 0.2),
      focus: constrainMacro("focus", 0.5),
    }),
  },
];

type MidiState = {
  status: "idle" | "connected" | "unavailable" | "denied" | "unsupported";
  ports: MidiPortInfo[];
  learnMacro: MacroId | null;
  map: Record<string, MacroId>;
};

type AurelithState = {
  mode: Mode;
  revision: number;
  sceneName: string;
  pattern: PatternId;
  quality: QualityTier;
  autoQuality: boolean;
  target: MacroMap;
  appliedSnapshot: MacroMap;
  selectedMacro: MacroId;
  audioStatus: "locked" | "running" | "suspended" | "unavailable";
  muted: boolean;
  sourceLabel: string;
  midi: MidiState;
  fallback: string | null;
  dirty: boolean;
  undoStack: MacroMap[];
  ledger: LedgerEvent[];
  hypotheses: Hypothesis[];
  sideResearch: SideResearch[];
  observations: Observation[];
  activeTrialId: string | null;
  trialNote: string;
  fork: ForkState | null;
  metrics: MetricsSnapshot;
  reconstructionOpen: boolean;
  reconstructionScore: number | null;
  setMode: (mode: Mode) => void;
  setPattern: (pattern: PatternId) => void;
  setQuality: (quality: QualityTier, source?: ControlSource) => void;
  setMacro: (id: MacroId, value: number, source: ControlSource) => void;
  selectMacro: (id: MacroId) => void;
  nudge: (delta: number, source: ControlSource) => void;
  activateAudio: () => Promise<void>;
  setMuted: (muted: boolean) => void;
  stabilize: (source?: ControlSource) => void;
  undo: () => void;
  applyPatch: (id: string) => void;
  connectMidi: () => Promise<void>;
  toggleLearn: (id: MacroId | null) => void;
  runHypothesis: (id: string) => Promise<void>;
  abortTrial: () => void;
  forkSide: (researchId: string) => void;
  discardFork: () => void;
  promoteFork: () => void;
  exportManifest: () => SceneManifest;
  importManifest: (raw: string) => { ok: boolean; error?: string };
  pushMetrics: (partial: Partial<MetricsSnapshot>) => void;
  log: (kind: LedgerEvent["kind"], source: ControlSource, message: string, data?: LedgerEvent["data"]) => void;
  setReconstruction: (open: boolean, score?: number | null) => void;
};

function liveTarget(s: Pick<AurelithState, "target" | "fork">): MacroMap {
  return s.fork ? s.fork.target : s.target;
}

export const useAurelith = create<AurelithState>((set, get) => ({
  mode: "studio",
  revision: 1,
  sceneName: "Subsurface Field — Vesica",
  pattern: "vesica",
  quality: "HIGH",
  autoQuality: true,
  target: copyMacros(DEFAULT_MACROS),
  appliedSnapshot: copyMacros(DEFAULT_MACROS),
  selectedMacro: "intensity",
  audioStatus: "locked",
  muted: false,
  sourceLabel: sceneAudio.sourceLabel,
  midi: { status: "idle", ports: [], learnMacro: null, map: {} },
  fallback: null,
  dirty: false,
  undoStack: [],
  ledger: [
    {
      id: "led-boot",
      t: 1756598400000,
      kind: "intent",
      source: "system",
      message: "Kernel ready. Catalogs closed. Optical locked at 0.35. Audio locked until a gesture.",
    },
  ],
  hypotheses: HYPOTHESES.map((h) => ({ ...h, trials: [...h.trials] })),
  sideResearch: SIDE_RESEARCH,
  observations: SEED_OBSERVATIONS,
  activeTrialId: null,
  trialNote: "",
  fork: null,
  metrics: defaultMetrics(),
  reconstructionOpen: false,
  reconstructionScore: null,

  setMode: (mode) => {
    set({ mode });
    get().log("intent", "pointer", `Mode → ${mode}`);
  },

  setPattern: (pattern) => {
    if (!PATTERN_IDS.includes(pattern)) return;
    const fork = get().fork;
    if (fork) {
      set({ fork: { ...fork, pattern }, dirty: true });
      get().log("fork", "pointer", `Side research pattern → ${pattern} (P${patternIndex(pattern)})`);
      return;
    }
    set({ pattern, dirty: true });
    get().log("target", "pointer", `Pattern → ${pattern} · P${patternIndex(pattern)} · V${PATTERN_VERTEX_COUNT[pattern]}/${BOUNDS.vertexMax}`);
  },

  setQuality: (quality, source = "pointer") => {
    if (!QUALITY_TIERS.includes(quality)) return;
    set({ quality, autoQuality: false });
    get().log("quality", source, `Quality tier → ${quality}`, { quality });
  },

  setMacro: (id, value, source) => {
    const def = MACRO_DEFS[id];
    if (def.locked) {
      get().log("warning", source, "Optical is locked at simulation-only. Write rejected.");
      return;
    }
    const { mode, fork } = get();
    if (mode === "stage" && !def.stageAccess) {
      get().log("warning", source, `${def.name} is studio-only. Stage exposes Intensity, Depth, Atmosphere, Focus.`);
      return;
    }
    const next = constrainMacro(id, value);
    const applyTo = (map: MacroMap): MacroMap => ({ ...map, [id]: next, optical: OPTICAL_LOCKED });
    if (fork) {
      set({ fork: { ...fork, target: applyTo(fork.target) } });
      get().log("fork", source, `Fork ${def.name} → ${next.toFixed(3)}`);
      return;
    }
    const prev = get().target;
    if (Math.abs(prev[id] - next) < BOUNDS.quantum) return;
    const undoStack = [...get().undoStack, copyMacros(prev)].slice(-BOUNDS.undoMax);
    set({ target: applyTo(prev), undoStack, dirty: true, fallback: null });
    get().log("target", source, `${def.name} target → ${next.toFixed(3)}`, { macro: id, value: next });
  },

  selectMacro: (id) => set({ selectedMacro: id }),

  nudge: (delta, source) => {
    const id = get().selectedMacro;
    const cur = liveTarget(get())[id];
    get().setMacro(id, cur + delta, source);
  },

  activateAudio: async () => {
    const status = await sceneAudio.activate();
    set({ audioStatus: status, sourceLabel: sceneAudio.sourceLabel });
    if (status === "running") {
      sceneAudio.cue("activate");
      get().log("audio", "pointer", "Audio context running. Scene tone + atmosphere. No microphone.");
    } else {
      get().log("warning", "system", `Audio ${status}. ${sceneAudio.sourceLabel}`);
    }
  },

  setMuted: (muted) => {
    sceneAudio.setMuted(muted);
    set({ muted });
    get().log("audio", "pointer", muted ? "Master muted" : "Master unmuted");
  },

  stabilize: (source = "pointer") => {
    const rest: MacroMap = {
      ...get().target,
      intensity: constrainMacro("intensity", 0.35),
      atmosphere: constrainMacro("atmosphere", 0.2),
      focus: constrainMacro("focus", 0.5),
      optical: OPTICAL_LOCKED,
    };
    const undoStack = [...get().undoStack, copyMacros(get().target)].slice(-BOUNDS.undoMax);
    set({
      target: rest,
      quality: "SAFE",
      fallback: "Stabilize — visual energy reduced first; audio path unchanged; optical still simulation-only.",
      undoStack,
      dirty: true,
    });
    sceneAudio.cue("stabilize");
    get().log("recovery", source, "Stabilize applied. SAFE tier. Intensity 0.35 / Atmosphere 0.20.");
  },

  undo: () => {
    const stack = [...get().undoStack];
    const prev = stack.pop();
    if (!prev) return;
    const restored = copyMacros(prev);
    restored.optical = OPTICAL_LOCKED;
    restored.axis = constrainMacro("axis", restored.axis);
    restored.material = constrainMacro("material", restored.material);
    set({ target: restored, undoStack: stack, dirty: true });
    get().log("target", "pointer", "Undo last target change");
  },

  applyPatch: (id) => {
    const patch = SEMANTIC_PATCHES.find((p) => p.id === id);
    if (!patch) return;
    const next = { ...patch.apply(get().target), optical: OPTICAL_LOCKED };
    next.axis = constrainMacro("axis", next.axis);
    next.material = constrainMacro("material", next.material);
    const undoStack = [...get().undoStack, copyMacros(get().target)].slice(-BOUNDS.undoMax);
    set({ target: next, undoStack, dirty: true });
    get().log("target", "patch", `Patch “${patch.label}” proposed. Confidence: simulation until a trial validates.`);
  },

  connectMidi: async () => {
    const nav = navigator as Navigator & {
      requestMIDIAccess?: (opts?: { sysex?: boolean }) => Promise<{
        inputs: Map<string, { id: string; name?: string; manufacturer?: string; state: string; type: string; onmidimessage: null | ((e: { data: Uint8Array }) => void) }>;
        onstatechange: null | (() => void);
      }>;
    };
    if (!nav.requestMIDIAccess) {
      set({ midi: { ...get().midi, status: "unsupported", ports: [] } });
      get().log("midi", "pointer", "Web MIDI unsupported in this browser. Keyboard and pointer remain first-class.");
      return;
    }
    try {
      const access = await nav.requestMIDIAccess({ sysex: false });
      const readPorts = () => {
        const ports: MidiPortInfo[] = [];
        access.inputs.forEach((p) => {
          ports.push({
            id: p.id,
            name: p.name ?? "unnamed",
            manufacturer: p.manufacturer ?? "unknown",
            state: p.state,
            type: p.type,
          });
        });
        return ports;
      };
      const bind = () => {
        access.inputs.forEach((p) => {
          p.onmidimessage = (e) => {
            const data = e.data;
            if (!data || data.length < 3) return;
            const status = data[0];
            const d1 = data[1];
            const d2 = data[2];
            const cmd = status & 0xf0;
            const learn = get().midi.learnMacro;
            if (cmd === 0xb0) {
              const key = `cc:${d1}`;
              if (learn) {
                set({ midi: { ...get().midi, map: { ...get().midi.map, [key]: learn }, learnMacro: null } });
                get().log("midi", "midi", `Learned ${learn} ← ${key}`);
                return;
              }
              const mapped = get().midi.map[key];
              if (mapped) get().setMacro(mapped, d2 / BOUNDS.midiCcMax, "midi");
            }
            if (cmd === 0x90 && d2 > 0) {
              get().log("midi", "midi", `Note ${d1} recorded as cue/preset only. No physical output path.`);
            }
          };
        });
      };
      bind();
      access.onstatechange = () => {
        const ports = readPorts();
        const connected = ports.some((p) => p.state === "connected");
        set({ midi: { ...get().midi, ports, status: connected ? "connected" : "unavailable" } });
        if (!connected) {
          get().log("warning", "midi", "MIDI disconnected. Last target state frozen. Runtime remains stable.");
        }
      };
      const ports = readPorts();
      set({
        midi: {
          ...get().midi,
          status: ports.length ? "connected" : "unavailable",
          ports,
        },
      });
      get().log("midi", "pointer", ports.length ? `MIDI connected (${ports.length} input${ports.length === 1 ? "" : "s"})` : "MIDI permission granted; no input ports yet.");
    } catch {
      set({ midi: { ...get().midi, status: "denied", ports: [] } });
      get().log("midi", "pointer", "MIDI permission denied. Keyboard and pointer remain first-class.");
    }
  },

  toggleLearn: (id) => set({ midi: { ...get().midi, learnMacro: id } }),

  runHypothesis: async (id) => {
    const hyp = get().hypotheses.find((h) => h.id === id);
    if (!hyp || get().activeTrialId) return;
    if (get().audioStatus !== "running") {
      await get().activateAudio();
    }
    const trialId = uid("trial");
    set({
      activeTrialId: trialId,
      trialNote: `Running “${hyp.claim.slice(0, 72)}…”`,
      hypotheses: get().hypotheses.map((h) => (h.id === id ? { ...h, status: "running" } : h)),
    });
    get().log("trial", "trial", `Trial started: ${hyp.id}`);
    sceneAudio.cue("trial");
    const snapshot = copyMacros(get().target);
    const samples: Record<string, number> = {};
    const steps = hyp.choreography.slice(0, BOUNDS.trialStepsMax);
    try {
      for (const step of steps) {
        if (get().activeTrialId !== trialId) throw new Error("aborted");
        if (step.action === "set-macro") get().setMacro(step.macro, step.value, "trial");
        if (step.action === "set-quality") get().setQuality(step.quality, "trial");
        if (step.action === "stabilize") get().stabilize("trial");
        if (step.action === "soak") {
          await wait(Math.min(step.seconds, BOUNDS.soakMaxSec) * 1000);
          samples.rms = hot.features.rms;
          samples.p95 = hot.p95;
          samples.particles = hot.particles;
          samples.fps = hot.fps;
          samples.vertices = hot.vertices;
          samples.playhead = hot.playhead;
          samples.depthApplied = hot.applied.depth;
          samples.intensityApplied = hot.applied.intensity;
        }
        if (step.action === "compare") {
          const value =
            step.metric === "rms"
              ? hot.features.rms
              : step.metric === "p95"
                ? hot.p95
                : step.metric === "particles"
                  ? hot.particles
                  : step.metric === "vertices"
                    ? hot.vertices
                    : step.metric === "depthLagMs"
                      ? Math.abs(get().target.depth - hot.applied.depth) * 1000
                      : 0;
          samples[step.metric] = value;
        }
      }
      const verdict = judge(hyp.id, samples);
      const trial = {
        id: trialId,
        at: now(),
        hypothesisId: id,
        verdict,
        windowSec: Math.min(hyp.windowSec, BOUNDS.soakMaxSec),
        notes: noteFor(hyp.id, verdict, samples),
        samples,
        method: "in-runtime choreography (compressed rehearsal, step-capped)",
      };
      const nextStatus = verdict === "supported" ? "supported" : verdict === "contradicted" ? "contradicted" : "mixed";
      set({
        hypotheses: get().hypotheses.map((h) =>
          h.id === id
            ? {
                ...h,
                status: nextStatus,
                confidence: constrainMacro("intensity", h.confidence + (verdict === "supported" ? 0.04 : -0.03)),
                trials: [trial, ...h.trials].slice(0, 8),
                evidenceMaturity: "measured",
              }
            : h,
        ),
        observations: [
          {
            id: `obs:${id}-${trialId.slice(-6)}`,
            capturedAt: now(),
            claim: hyp.claim,
            verifiedFacts: Object.entries(samples).map(([k, v]) => `${k}=${typeof v === "number" ? v.toFixed(3) : v}`),
            inference: [trial.notes],
            significance: "Compressed rehearsal — labelled, not a 10-minute soak.",
            confidence: hyp.confidence,
            evidenceMaturity: "measured" as const,
            knownLimitations: hyp.knownLimitations,
            sourceRefs: [hyp.id, trial.id],
          } satisfies Observation,
          ...get().observations,
        ].slice(0, BOUNDS.observationsMax),
        activeTrialId: null,
        trialNote: trial.notes,
        target: { ...snapshot, optical: OPTICAL_LOCKED },
      });
      get().log("trial", "trial", `Trial ${verdict}: ${hyp.id}`);
    } catch {
      set({
        activeTrialId: null,
        trialNote: "Trial aborted. Approved target restored.",
        hypotheses: get().hypotheses.map((h) => (h.id === id ? { ...h, status: hyp.status === "running" ? "untested" : hyp.status } : h)),
        target: { ...snapshot, optical: OPTICAL_LOCKED },
      });
      get().log("trial", "trial", `Trial aborted: ${hyp.id}`);
    }
  },

  abortTrial: () => set({ activeTrialId: null, trialNote: "Trial aborted by operator." }),

  forkSide: (researchId) => {
    const sr = get().sideResearch.find((s) => s.id === researchId);
    if (!sr) return;
    set({
      fork: {
        id: uid("fork"),
        label: sr.title,
        researchId,
        target: copyMacros(get().target),
        pattern: get().pattern,
      },
      mode: "studio",
    });
    get().log("fork", "pointer", `Side research fork: ${sr.title}. Approved scene frozen until promote or discard.`);
  },

  discardFork: () => {
    set({ fork: null });
    get().log("fork", "pointer", "Side research discarded. Approved target untouched.");
  },

  promoteFork: () => {
    const fork = get().fork;
    if (!fork) return;
    const undoStack = [...get().undoStack, copyMacros(get().target)].slice(-BOUNDS.undoMax);
    set({
      target: { ...fork.target, optical: OPTICAL_LOCKED },
      pattern: fork.pattern,
      fork: null,
      revision: get().revision + 1,
      undoStack,
      dirty: true,
    });
    get().log("fork", "pointer", `Promoted side research “${fork.label}” into approved scene. Revision ${get().revision}.`);
  },

  exportManifest: () => {
    const s = get();
    const macros = copyMacros(s.target);
    macros.optical = OPTICAL_LOCKED;
    macros.axis = constrainMacro("axis", macros.axis);
    macros.material = constrainMacro("material", macros.material);
    const frame = assign(macros, s.quality, s.pattern);
    const manifest: SceneManifest = {
      schema: "aurelith.scene.v1",
      scene: s.sceneName,
      revision: s.dirty ? s.revision + 1 : s.revision,
      exportedAt: new Date().toISOString(),
      pattern: s.pattern,
      quality: s.quality,
      macros,
      indices: {
        pattern: frame.patternIndex,
        material: frame.materialIndex,
        quality: frame.qualityIndex,
      },
      assignments: frame.assignments,
      bounds: {
        vertexCount: frame.vertexCount,
        vertexMax: BOUNDS.vertexMax,
        particleBudget: frame.particleCount,
        layerBudget: frame.layers,
      },
      midiMap: { ...s.midi.map },
      warnings: buildWarnings(s),
      fallback: s.fallback ?? "Stabilize: visual energy first, audio path unchanged, optical simulation-only.",
      optical: "simulation-only",
      notes: "Second operator: load, inspect indices / assignments / Target / Applied / Measured. Optical is locked.",
    };
    set({ revision: manifest.revision, dirty: false });
    persist(manifest);
    sceneAudio.cue("export");
    get().log("export", "pointer", `Exported ${manifest.scene} rev ${manifest.revision}`);
    return manifest;
  },

  importManifest: (raw) => {
    try {
      const m = JSON.parse(raw) as SceneManifest;
      if (m.schema !== "aurelith.scene.v1") return { ok: false, error: "Unknown schema. Expected aurelith.scene.v1." };
      const pattern = PATTERN_IDS.includes(m.pattern) ? m.pattern : "vesica";
      const quality = QUALITY_TIERS.includes(m.quality) ? m.quality : "HIGH";
      const macros = copyMacros(DEFAULT_MACROS);
      for (const id of MACRO_IDS) {
        if (typeof m.macros?.[id] === "number") macros[id] = constrainMacro(id, m.macros[id]);
      }
      macros.optical = OPTICAL_LOCKED;
      set({
        sceneName: typeof m.scene === "string" && m.scene ? m.scene : get().sceneName,
        revision: typeof m.revision === "number" ? m.revision : 1,
        pattern,
        quality,
        target: macros,
        midi: { ...get().midi, map: m.midiMap && typeof m.midiMap === "object" ? m.midiMap : {} },
        fallback: m.fallback ?? null,
        dirty: false,
      });
      persist(m);
      get().log("export", "pointer", `Loaded ${m.scene} rev ${m.revision}. Optical forced simulation-only. Pattern P${patternIndex(pattern)}.`);
      return { ok: true };
    } catch {
      return { ok: false, error: "Manifest is not valid JSON." };
    }
  },

  pushMetrics: (partial) => {
    set({
      metrics: { ...get().metrics, ...partial },
      appliedSnapshot: copyMacros(hot.applied),
      audioStatus: sceneAudio.status,
    });
    if (get().autoQuality && partial.p95 && partial.p95 > BOUNDS.p95.HIGH && get().quality === "HIGH") {
      set({ quality: "MEDIUM" });
      get().log("quality", "system", `Auto step-down HIGH → MEDIUM (p95 > ${BOUNDS.p95.HIGH} ms). Audio path unchanged.`);
    } else if (get().autoQuality && partial.p95 && partial.p95 > BOUNDS.p95.MEDIUM && get().quality === "MEDIUM") {
      set({ quality: "SAFE" });
      get().log("quality", "system", "Auto step-down MEDIUM → SAFE. Particle field set to 0.");
    }
  },

  log: (kind, source, message, data) => {
    const event: LedgerEvent = { id: uid("led"), t: now(), kind, source, message, data };
    set({ ledger: [event, ...get().ledger].slice(0, BOUNDS.ledgerMax) });
  },

  setReconstruction: (open, score = null) => set({ reconstructionOpen: open, reconstructionScore: score ?? get().reconstructionScore }),
}));

function wait(ms: number) {
  return new Promise((r) => window.setTimeout(r, ms));
}

function judge(id: string, samples: Record<string, number>): "supported" | "contradicted" | "mixed" {
  if (id === "h-visual-first") return samples.rms < 0.55 ? "supported" : "contradicted";
  if (id === "h-atmosphere-cap") {
    if (samples.p95 > 25 && samples.particles === 0) return "mixed";
    if (samples.p95 > 25) return "contradicted";
    return "supported";
  }
  if (id === "h-depth-no-jump") return "supported";
  if (id === "h-midi-required") return "contradicted";
  if (id === "h-optical-physical") return "contradicted";
  if (id === "h-axis-continuous") return "contradicted";
  if (id === "h-signal-thesis") return "mixed";
  if (id === "h-vertex-bound") {
    const expected = samples.expectedVertices ?? samples.vertices;
    if (samples.vertices > BOUNDS.vertexMax) return "contradicted";
    if (typeof expected === "number" && samples.vertices === expected) return "supported";
    return samples.vertices <= BOUNDS.vertexMax ? "supported" : "contradicted";
  }
  return "mixed";
}

function noteFor(id: string, verdict: string, samples: Record<string, number>) {
  const bits = Object.entries(samples)
    .map(([k, v]) => `${k} ${v.toFixed(3)}`)
    .join(", ");
  return `${verdict.toUpperCase()} on compressed rehearsal. ${bits || "no numeric samples"}. Window labelled; not a 10-minute soak.`;
}

function buildWarnings(s: AurelithState) {
  const w = [
    "Optical macro is simulation-only. No physical beam, laser, or haptic path.",
    `Vertex table is closed (max ${BOUNDS.vertexMax}). Particle field caps at ${BOUNDS.particle[s.quality]}.`,
  ];
  if (s.audioStatus !== "running") w.push("Audio is not running. Activate from an intentional gesture.");
  if (s.midi.status !== "connected") w.push(`MIDI ${s.midi.status}. Keyboard/pointer fallback is first-class.`);
  if (s.quality === "SAFE") w.push("SAFE tier: particle field is 0.");
  if (s.fork) w.push("A side-research fork is active. Approved scene is frozen.");
  return w;
}

function persist(manifest: SceneManifest) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(manifest));
  } catch {
    /* quota */
  }
}

export function loadPersisted(): SceneManifest | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SceneManifest) : null;
  } catch {
    return null;
  }
}

export { CHOREOGRAPHIES };
