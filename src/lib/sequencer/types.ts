export type TrackId = "kick" | "snare" | "hats" | "perc";
export type StepValue = 0 | 1 | 2;
export type Pattern = Record<TrackId, StepValue[]>;

export const STEP_COUNT = 16;
export const TRACK_IDS: TrackId[] = ["kick", "snare", "hats", "perc"];

export const TRACKS: {
  id: TrackId;
  label: string;
  short: string;
  hint: string;
}[] = [
  { id: "kick", label: "Kick", short: "BD", hint: "Accent adds punch" },
  { id: "snare", label: "Snare", short: "SD", hint: "Accent is a rim" },
  { id: "hats", label: "Hats", short: "HH", hint: "Accent opens the hat" },
  { id: "perc", label: "Perc", short: "PC", hint: "Accent is a bell" },
];

export const MIN_TEMPO = 60;
export const MAX_TEMPO = 200;
export const DEFAULT_TEMPO = 124;

export function emptyPattern(): Pattern {
  return {
    kick: Array.from({ length: STEP_COUNT }, () => 0 as StepValue),
    snare: Array.from({ length: STEP_COUNT }, () => 0 as StepValue),
    hats: Array.from({ length: STEP_COUNT }, () => 0 as StepValue),
    perc: Array.from({ length: STEP_COUNT }, () => 0 as StepValue),
  };
}

export function clonePattern(pattern: Pattern): Pattern {
  return {
    kick: [...pattern.kick],
    snare: [...pattern.snare],
    hats: [...pattern.hats],
    perc: [...pattern.perc],
  };
}

export function isBeatStep(step: number): boolean {
  return step % 4 === 0;
}
