import { create } from "zustand";
import { defaultKnobs } from "./knobs";
import bundleJson from "./bundle.json";
import type { GrammarBundle, Recipe } from "./types";

export const bundle = bundleJson as unknown as GrammarBundle;

export const SPECIMEN_ORDER = [
  "oil-slick",
  "soap-film",
  "nacre",
  "labradorite",
  "butterfly-structural-color",
  "holographic-foil",
  "bismuth-oxide",
  "molten-chrome",
  "caustic-water",
  "cloud",
  "nebula",
  "opalescent-glass",
] as const;

export type SpecimenId = (typeof SPECIMEN_ORDER)[number];

export function recipeById(id: string): Recipe {
  return bundle.recipes.find((r) => r.id === id) ?? bundle.recipes[0];
}

export type StudioMode = "look" | "fuse" | "proof";

export const STORAGE_KEY = "nacre-atelier-v2";

export function loadStoredSpecimen(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem("nacre-atelier-v1");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { specimenId?: string };
    if (parsed.specimenId && SPECIMEN_ORDER.includes(parsed.specimenId as SpecimenId)) {
      return parsed.specimenId;
    }
  } catch {
    /* ignore */
  }
  return null;
}

type GrammarState = {
  specimenId: string;
  fuseId: string;
  mode: StudioMode;
  look: { x: number; y: number };
  knobs: Record<string, number>;
  blend: number;
  focusOperator: string | null;
  setSpecimen: (id: string) => void;
  setFuseId: (id: string) => void;
  setMode: (mode: StudioMode) => void;
  setLook: (x: number, y: number) => void;
  setKnob: (id: string, value: number) => void;
  setBlend: (v: number) => void;
  setFocusOperator: (id: string | null) => void;
  resetKnobs: () => void;
  cycleSpecimen: (dir: 1 | -1) => void;
};

function persist(id: string) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ specimenId: id }));
  } catch {
    /* ignore */
  }
}

export const useGrammar = create<GrammarState>((set, get) => ({
  specimenId: "nacre",
  fuseId: "soap-film",
  mode: "look",
  look: { x: 0.18, y: 0.28 },
  knobs: defaultKnobs("nacre"),
  blend: 0.5,
  focusOperator: null,
  setSpecimen: (id) => {
    persist(id);
    const fuseId = get().fuseId === id ? (id === "soap-film" ? "oil-slick" : "soap-film") : get().fuseId;
    set({
      specimenId: id,
      fuseId,
      focusOperator: null,
      look: { x: 0.18, y: 0.28 },
      knobs: defaultKnobs(id),
    });
  },
  setFuseId: (id) => set({ fuseId: id }),
  setMode: (mode) => set({ mode }),
  setLook: (x, y) => set({ look: { x, y } }),
  setKnob: (id, value) => set({ knobs: { ...get().knobs, [id]: value } }),
  setBlend: (blend) => set({ blend }),
  setFocusOperator: (focusOperator) => set({ focusOperator }),
  resetKnobs: () => set({ knobs: defaultKnobs(get().specimenId), look: { x: 0.18, y: 0.28 }, blend: 0.5 }),
  cycleSpecimen: (dir) => {
    const i = SPECIMEN_ORDER.indexOf(get().specimenId as SpecimenId);
    const next = SPECIMEN_ORDER[(i + dir + SPECIMEN_ORDER.length) % SPECIMEN_ORDER.length];
    get().setSpecimen(next);
  },
}));
