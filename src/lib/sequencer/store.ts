import { create } from "zustand";
import { engine } from "./engine";
import { PRESETS, randomPattern, type PresetId } from "./presets";
import {
  clonePattern,
  emptyPattern,
  type Pattern,
  type StepValue,
  type TrackId,
} from "./types";

const STORAGE_KEY = "pulse-sequencer-v1";

type SequencerState = {
  pattern: Pattern;
  tempo: number;
  swing: number;
  playing: boolean;
  currentStep: number;
  presetId: PresetId | "custom";
  muted: Record<TrackId, boolean>;
  volumes: Record<TrackId, number>;
  master: number;
  masterMuted: boolean;
  hydrated: boolean;

  hydrate: () => void;
  persist: () => void;
  togglePlay: () => void;
  stop: () => void;
  setTempo: (bpm: number) => void;
  setSwing: (amount: number) => void;
  setStep: (track: TrackId, step: number, value: StepValue, audition?: boolean) => void;
  cycleStep: (track: TrackId, step: number) => void;
  clear: () => void;
  randomize: () => void;
  loadPreset: (id: PresetId) => void;
  toggleMute: (track: TrackId) => void;
  setVolume: (track: TrackId, value: number) => void;
  setMaster: (value: number) => void;
  toggleMasterMute: () => void;
  setCurrentStep: (step: number) => void;
};

type Persisted = Pick<
  SequencerState,
  "pattern" | "tempo" | "swing" | "presetId" | "muted" | "volumes" | "master"
>;

const defaultHouse = PRESETS.house;

let persistTimer: ReturnType<typeof setTimeout> | null = null;

function queuePersist(persist: () => void): void {
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    persistTimer = null;
    persist();
  }, 180);
}

function syncEngine(state: {
  pattern: Pattern;
  tempo: number;
  swing: number;
  volumes: Record<TrackId, number>;
  muted: Record<TrackId, boolean>;
  master: number;
  masterMuted: boolean;
}): void {
  engine.setPattern(state.pattern);
  engine.setTempo(state.tempo);
  engine.setSwing(state.swing);
  engine.setMix({
    master: state.master,
    muted: state.masterMuted,
    trackGain: state.volumes,
    trackMute: state.muted,
  });
}

export const useSequencer = create<SequencerState>((set, get) => ({
  pattern: clonePattern(defaultHouse.pattern),
  tempo: defaultHouse.tempo,
  swing: defaultHouse.swing / 100,
  playing: false,
  currentStep: 0,
  presetId: "house",
  muted: { kick: false, snare: false, hats: false, perc: false },
  volumes: { kick: 0.9, snare: 0.8, hats: 0.55, perc: 0.65 },
  master: 0.85,
  masterMuted: false,
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return;
    let next: Partial<Persisted> = {};
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) next = JSON.parse(raw) as Persisted;
      } catch {
        next = {};
      }
    }
    set({
      pattern: next.pattern ?? get().pattern,
      tempo: next.tempo ?? get().tempo,
      swing: next.swing ?? get().swing,
      presetId: next.presetId ?? get().presetId,
      muted: next.muted ?? get().muted,
      volumes: next.volumes ?? get().volumes,
      master: next.master ?? get().master,
      hydrated: true,
    });
    syncEngine(get());
  },

  persist: () => {
    if (typeof window === "undefined") return;
    const { pattern, tempo, swing, presetId, muted, volumes, master } = get();
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ pattern, tempo, swing, presetId, muted, volumes, master }),
      );
    } catch {
      // ignore quota
    }
  },

  togglePlay: () => {
    engine.unlock();
    const playing = get().playing;
    if (playing) {
      engine.stop();
      set({ playing: false, currentStep: 0 });
    } else {
      syncEngine(get());
      engine.start();
      set({ playing: true });
    }
  },

  stop: () => {
    engine.stop();
    set({ playing: false, currentStep: 0 });
  },

  setTempo: (bpm) => {
    const tempo = Math.round(Math.min(200, Math.max(60, bpm)));
    engine.setTempo(tempo);
    set({ tempo });
    queuePersist(() => get().persist());
  },

  setSwing: (amount) => {
    const swing = Math.min(1, Math.max(0, amount));
    engine.setSwing(swing);
    set({ swing });
    queuePersist(() => get().persist());
  },

  setStep: (track, step, value, audition = false) => {
    const current = get().pattern[track][step] ?? 0;
    if (current === value) return;
    const pattern = clonePattern(get().pattern);
    pattern[track][step] = value;
    engine.setPattern(pattern);
    set({ pattern, presetId: "custom" });
    queuePersist(() => get().persist());
    if (audition && value > 0) engine.audition(track, value === 2);
  },

  cycleStep: (track, step) => {
    const current = get().pattern[track][step] ?? 0;
    const next = ((current + 1) % 3) as StepValue;
    get().setStep(track, step, next, true);
  },

  clear: () => {
    const pattern = emptyPattern();
    engine.setPattern(pattern);
    set({ pattern, presetId: "custom" });
    get().persist();
  },

  randomize: () => {
    const pattern = randomPattern();
    engine.setPattern(pattern);
    set({ pattern, presetId: "custom" });
    get().persist();
  },

  loadPreset: (id) => {
    const preset = PRESETS[id];
    const pattern = clonePattern(preset.pattern);
    const tempo = preset.tempo;
    const swing = preset.swing / 100;
    set({ pattern, tempo, swing, presetId: id });
    syncEngine(get());
    get().persist();
  },

  toggleMute: (track) => {
    const muted = { ...get().muted, [track]: !get().muted[track] };
    engine.setMix({ trackMute: muted });
    set({ muted });
    queuePersist(() => get().persist());
  },

  setVolume: (track, value) => {
    const volumes = { ...get().volumes, [track]: value };
    engine.setMix({ trackGain: volumes });
    set({ volumes });
    queuePersist(() => get().persist());
  },

  setMaster: (value) => {
    engine.setMix({ master: value });
    set({ master: value });
    queuePersist(() => get().persist());
  },

  toggleMasterMute: () => {
    const masterMuted = !get().masterMuted;
    engine.setMix({ muted: masterMuted });
    set({ masterMuted });
  },

  setCurrentStep: (step) => set({ currentStep: step }),
}));

engine.onStep = (step) => {
  useSequencer.getState().setCurrentStep(step);
};
