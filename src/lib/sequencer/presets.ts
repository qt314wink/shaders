import type { Pattern, StepValue } from "./types";
import { emptyPattern } from "./types";

function p(values: number[]): StepValue[] {
  return values.map((v) => (v === 2 ? 2 : v === 1 ? 1 : 0));
}

export type PresetId = "house" | "hiphop" | "techno" | "breaks" | "dilla";

export const PRESETS: Record<
  PresetId,
  { name: string; tempo: number; swing: number; pattern: Pattern }
> = {
  house: {
    name: "House",
    tempo: 124,
    swing: 8,
    pattern: {
      kick: p([2, 0, 0, 0, 2, 0, 0, 1, 2, 0, 0, 0, 2, 0, 1, 0]),
      snare: p([0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1, 2, 0, 0, 0]),
      hats: p([1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1]),
      perc: p([0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0]),
    },
  },
  hiphop: {
    name: "Hip-Hop",
    tempo: 92,
    swing: 42,
    pattern: {
      kick: p([2, 0, 0, 1, 0, 0, 2, 0, 0, 0, 2, 0, 0, 1, 0, 0]),
      snare: p([0, 0, 0, 0, 2, 0, 0, 1, 0, 0, 0, 0, 2, 0, 0, 0]),
      hats: p([2, 0, 1, 0, 2, 0, 1, 1, 2, 0, 1, 0, 2, 1, 1, 0]),
      perc: p([0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0]),
    },
  },
  techno: {
    name: "Techno",
    tempo: 132,
    swing: 4,
    pattern: {
      kick: p([2, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0]),
      snare: p([0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 1, 0]),
      hats: p([0, 1, 2, 1, 0, 1, 2, 1, 0, 1, 2, 1, 0, 1, 2, 1]),
      perc: p([0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 2]),
    },
  },
  breaks: {
    name: "Breaks",
    tempo: 136,
    swing: 16,
    pattern: {
      kick: p([2, 0, 0, 1, 0, 0, 2, 0, 0, 2, 0, 0, 1, 0, 2, 0]),
      snare: p([0, 0, 0, 0, 2, 0, 0, 1, 0, 0, 0, 0, 2, 0, 0, 1]),
      hats: p([2, 1, 1, 1, 2, 1, 1, 2, 2, 1, 1, 1, 2, 1, 2, 1]),
      perc: p([0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1]),
    },
  },
  dilla: {
    name: "Late Night",
    tempo: 86,
    swing: 58,
    pattern: {
      kick: p([2, 0, 0, 0, 0, 1, 0, 0, 2, 0, 0, 2, 0, 0, 1, 0]),
      snare: p([0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 1, 0, 2, 0, 0, 1]),
      hats: p([1, 0, 2, 0, 1, 0, 1, 2, 1, 0, 2, 0, 1, 1, 2, 0]),
      perc: p([0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1]),
    },
  },
};

export const PRESET_LIST = Object.entries(PRESETS).map(([id, preset]) => ({
  id: id as PresetId,
  ...preset,
}));

export function randomPattern(): Pattern {
  const next = emptyPattern();

  for (let i = 0; i < 16; i += 1) {
    const onBeat = i % 4 === 0;
    const backbeat = i === 4 || i === 12;

    if (onBeat) next.kick[i] = Math.random() < 0.78 ? 2 : 1;
    else if (Math.random() < 0.18) next.kick[i] = Math.random() < 0.35 ? 2 : 1;

    if (backbeat) next.snare[i] = 2;
    else if (Math.random() < 0.12) next.snare[i] = Math.random() < 0.4 ? 2 : 1;

    if (Math.random() < (i % 2 === 0 ? 0.85 : 0.55)) {
      next.hats[i] = Math.random() < 0.28 ? 2 : 1;
    }

    if (!onBeat && Math.random() < 0.22) {
      next.perc[i] = Math.random() < 0.3 ? 2 : 1;
    }
  }

  return next;
}
