import type { Binding, Recipe } from "./types";

export function paramOf(recipe: Recipe, id: string) {
  return recipe.parameters.find((p) => p.id === id);
}

export function fieldOf(recipe: Recipe, id: string) {
  return recipe.fields.find((f) => f.id === id);
}

export function scalar(recipe: Recipe, bind: Binding | undefined, fallback = 0): number {
  if (!bind) return fallback;
  if (bind.param) {
    const p = paramOf(recipe, bind.param);
    if (!p) return fallback;
    if (typeof p.value === "number") return p.value;
    if (p.complex) return p.complex.n;
    if (p.spectral?.samples.length) {
      return p.spectral.samples.reduce((a, b) => a + b, 0) / p.spectral.samples.length;
    }
    if (p.enum === "mie") return 2;
    if (p.enum === "rayleigh") return 1;
    if (p.enum === "hg") return 0;
    if (p.enum === "grazing") return 1;
    if (p.enum === "retro") return 2;
    if (p.enum === "specular") return 3;
    if (p.enum === "fresnel") return 0;
    return fallback;
  }
  if (bind.field) {
    const f = fieldOf(recipe, bind.field);
    if (!f) return fallback;
    if (typeof f.source.value === "number") return f.source.value;
    if (f.range) return (f.range[0] + f.range[1]) / 2;
  }
  return fallback;
}

export function complexK(recipe: Recipe, bind: Binding | undefined): number {
  if (!bind?.param) return 0;
  return paramOf(recipe, bind.param)?.complex?.k ?? 0;
}

const GENERATORS = [
  "constant",
  "fbm",
  "worley",
  "gradient",
  "drainage",
  "lamellar-tilt",
  "surface-waves",
  "anisotropic-orientation",
  "spectral-peak",
  "radial",
] as const;

export function generatorIndex(name: string | undefined): number {
  if (!name) return 0;
  const i = GENERATORS.indexOf(name as (typeof GENERATORS)[number]);
  return i < 0 ? 1 : i;
}

export function primaryField(recipe: Recipe) {
  return recipe.fields[0];
}

export function sharedWith(
  coverage: Record<string, string[]>,
  operatorId: string,
  selfId: string,
): string[] {
  return (coverage[operatorId] ?? []).filter((id) => id !== selfId);
}
