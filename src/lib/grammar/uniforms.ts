import { complexK, generatorIndex, scalar } from "./resolve";
import type { Recipe } from "./types";

export type PreviewUniforms = {
  uThinFilm: number;
  uThick0: number;
  uThick1: number;
  uN0: number;
  uN1: number;
  uN2: number;
  uFilmGen: number;
  uFilmFreq: number;
  uMulti: number;
  uLayers: number;
  uTa: number;
  uTb: number;
  uNA: number;
  uNB: number;
  uOriGen: number;
  uGrating: number;
  uPeriod: number;
  uGroove: number;
  uOrders: number;
  uFDiel: number;
  uIorD: number;
  uFCond: number;
  uN: number;
  uK: number;
  uMicro: number;
  uRough: number;
  uAniso: number;
  uRefr: number;
  uEta: number;
  uCaustic: number;
  uCScale: number;
  uCGen: number;
  uCMix: number;
  uScatter: number;
  uDensity: number;
  uG: number;
  uPhase: number;
  uSigmaS: number;
  uSigmaA: number;
  uAbsorb: number;
  uDensGen: number;
  uEmit: number;
  uTemp: number;
  uEmitAmt: number;
  uViewExp: number;
  uViewLobe: number;
  uStage: number;
};

export const UNIFORM_KEYS = [
  "uThinFilm",
  "uThick0",
  "uThick1",
  "uN0",
  "uN1",
  "uN2",
  "uFilmGen",
  "uFilmFreq",
  "uMulti",
  "uLayers",
  "uTa",
  "uTb",
  "uNA",
  "uNB",
  "uOriGen",
  "uGrating",
  "uPeriod",
  "uGroove",
  "uOrders",
  "uFDiel",
  "uIorD",
  "uFCond",
  "uN",
  "uK",
  "uMicro",
  "uRough",
  "uAniso",
  "uRefr",
  "uEta",
  "uCaustic",
  "uCScale",
  "uCGen",
  "uCMix",
  "uScatter",
  "uDensity",
  "uG",
  "uPhase",
  "uSigmaS",
  "uSigmaA",
  "uAbsorb",
  "uDensGen",
  "uEmit",
  "uTemp",
  "uEmitAmt",
  "uViewExp",
  "uViewLobe",
  "uStage",
] as const;

function node(recipe: Recipe, op: string) {
  return recipe.nodes.find((n) => n.operator === op);
}

/**
 * Stage is derived from bound operators, never from specimen id.
 * 1 sphere · 2 volume · 3 water plane · 4 membrane · 5 film-on-water
 */
export function stageFromRecipe(recipe: Recipe): number {
  const ops = new Set(recipe.nodes.map((n) => n.operator));
  const vol = ops.has("volume-scattering");
  const film = ops.has("thin-film-interference");
  const multi = ops.has("multilayer-interference");
  const cau = ops.has("caustic-transport");
  const refr = ops.has("refraction-snell");
  const cond = ops.has("fresnel-conductor");
  const grat = ops.has("diffraction-grating");
  const fd = ops.has("fresnel-dielectric");
  if (vol && (fd || refr) && !film && !multi && !grat && !cond) return 1;
  if (vol && !film && !multi && !grat && !cond && !fd) return 2;
  if (cau && refr && !film) return 3;
  if (film && cau) return 5;
  if (film && !cond && !grat && !multi) return 4;
  return 1;
}

export function uniformsFromRecipe(recipe: Recipe): PreviewUniforms {
  const film = node(recipe, "thin-film-interference");
  const multi = node(recipe, "multilayer-interference");
  const grating = node(recipe, "diffraction-grating");
  const fd = node(recipe, "fresnel-dielectric");
  const fc = node(recipe, "fresnel-conductor");
  const mf = node(recipe, "microfacet-scatter");
  const refr = node(recipe, "refraction-snell");
  const cau = node(recipe, "caustic-transport");
  const sc = node(recipe, "volume-scattering");
  const ab = node(recipe, "volume-absorption");
  const em = node(recipe, "volume-emission");
  const vw = node(recipe, "view-dependent-weight");

  const filmField = film?.bind.thickness?.field
    ? recipe.fields.find((f) => f.id === film.bind.thickness.field)
    : recipe.fields[0];
  const oriField = multi?.bind.orientation?.field
    ? recipe.fields.find((f) => f.id === multi.bind.orientation.field)
    : undefined;
  const roughField = mf?.bind.roughness?.field
    ? recipe.fields.find((f) => f.id === mf.bind.roughness.field)
    : undefined;
  const cField = cau?.bind.displacement?.field
    ? recipe.fields.find((f) => f.id === cau.bind.displacement.field)
    : undefined;
  const dBind = sc?.bind.density ?? ab?.bind.density;
  const dField = dBind?.field ? recipe.fields.find((f) => f.id === dBind.field) : undefined;

  const oilLike = Boolean(film && cau);

  return {
    uThinFilm: film ? 1 : 0,
    uThick0: filmField?.range?.[0] ?? 80,
    uThick1: filmField?.range?.[1] ?? 400,
    uN0: film ? scalar(recipe, film.bind.nIncident, 1) : 1,
    uN1: film ? scalar(recipe, film.bind.nFilm, 1.4) : 1.4,
    uN2: film ? scalar(recipe, film.bind.nExit, 1) : 1,
    uFilmGen: generatorIndex(filmField?.source.generator),
    uFilmFreq: filmField?.source.frequency ?? 1,
    uMulti: multi ? 1 : 0,
    uLayers: multi ? scalar(recipe, multi.bind.layerCount, 10) : 0,
    uTa: multi ? scalar(recipe, multi.bind.thicknessA, 90) : 90,
    uTb: multi ? scalar(recipe, multi.bind.thicknessB, 70) : 70,
    uNA: multi ? scalar(recipe, multi.bind.nA, 1.5) : 1.5,
    uNB: multi ? scalar(recipe, multi.bind.nB, 1) : 1,
    uOriGen: generatorIndex(oriField?.source.generator ?? "lamellar-tilt"),
    uGrating: grating ? 1 : 0,
    uPeriod: grating ? scalar(recipe, grating.bind.period, 0.8) : 0.8,
    uGroove: grating ? scalar(recipe, grating.bind.depth, 140) : 140,
    uOrders: grating ? scalar(recipe, grating.bind.orders, 3) : 3,
    uFDiel: fd ? 1 : 0,
    uIorD: fd ? scalar(recipe, fd.bind.ior, 1.5) : 1.5,
    uFCond: fc ? 1 : 0,
    uN: fc ? scalar(recipe, fc.bind.ior, 2) : 2,
    uK: fc ? complexK(recipe, fc.bind.ior) : 0,
    uMicro: mf ? 1 : 0,
    uRough: mf
      ? roughField?.range
        ? (roughField.range[0] + roughField.range[1]) / 2
        : scalar(recipe, mf.bind.roughness, 0.2)
      : 0.2,
    uAniso: mf ? scalar(recipe, mf.bind.anisotropy, 0) : 0,
    uRefr: refr ? 1 : 0,
    uEta: refr ? scalar(recipe, refr.bind.iorInside, 1.33) : 1.33,
    uCaustic: cau ? 1 : 0,
    uCScale: cau ? scalar(recipe, cau.bind.focusScale, 1) : 1,
    uCGen: generatorIndex(cField?.source.generator ?? "surface-waves"),
    uCMix: oilLike ? 0.16 : 1,
    uScatter: sc ? 1 : 0,
    uDensity: sc ? 0.7 : ab ? 0.5 : 0.4,
    uG: sc ? scalar(recipe, sc.bind.g, 0.4) : 0.4,
    uPhase: sc ? scalar(recipe, sc.bind.phase, 0) : 0,
    uSigmaS: sc ? scalar(recipe, sc.bind.sigmaS, 1) : 1,
    uSigmaA: ab ? scalar(recipe, ab.bind.sigmaA, 0.1) : 0,
    uAbsorb: ab ? 1 : 0,
    uDensGen: generatorIndex(dField?.source.generator ?? "fbm"),
    uEmit: em ? 1 : 0,
    uTemp: em ? scalar(recipe, em.bind.temperature, 0) : 0,
    uEmitAmt: em ? 1 : 0,
    uViewExp: vw ? scalar(recipe, vw.bind.exponent, 2) : 0,
    uViewLobe: vw ? scalar(recipe, vw.bind.lobe, 0) : 0,
    uStage: stageFromRecipe(recipe),
  };
}

export function mixUniforms(a: PreviewUniforms, b: PreviewUniforms, t: number): PreviewUniforms {
  const out = { ...a };
  for (const key of UNIFORM_KEYS) {
    const av = a[key];
    const bv = b[key];
    if (key === "uFilmGen" || key === "uOriGen" || key === "uCGen" || key === "uDensGen") {
      out[key] = t < 0.5 ? av : bv;
      continue;
    }
    if (key === "uStage") {
      out[key] = t < 0.5 ? av : bv;
      continue;
    }
    out[key] = av * (1 - t) + bv * t;
  }
  return out;
}
