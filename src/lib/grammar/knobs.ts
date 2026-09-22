import type { PreviewUniforms } from "./uniforms";

export type PhysicalKnob = {
  id: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  default: number;
  mapsTo: string;
};

export type MathLine = { label: string; value: string };

export type SpecimenControls = {
  knobs: PhysicalKnob[];
  timeScale: number;
  warp: number;
  equation: string;
  apply: (u: PreviewUniforms, values: Record<string, number>) => PreviewUniforms;
  live: (u: PreviewUniforms, look: { x: number; y: number }) => MathLine[];
};

function v(values: Record<string, number>, id: string, fallback: number) {
  const n = values[id];
  return typeof n === "number" && Number.isFinite(n) ? n : fallback;
}

function cosFromLook(look: { x: number; y: number }) {
  const vx = -look.x * 1.5;
  const vy = -look.y * 1.25;
  const vz = 1;
  const len = Math.hypot(vx, vy, vz) || 1;
  return Math.max(0.2, Math.min(1, vz / len));
}

function fmt(n: number, digits = 0) {
  return n.toFixed(digits);
}

const OIL: SpecimenControls = {
  equation: "2 n d cosθ = m λ",
  timeScale: 0.55,
  warp: 0.7,
  knobs: [
    { id: "d", label: "Mean thickness", unit: "nm", min: 80, max: 900, step: 5, default: 340, mapsTo: "uThick0 / uThick1 — optical path of the hydrocarbon film" },
    { id: "nFilm", label: "Film IOR", unit: "n", min: 1.4, max: 1.55, step: 0.005, default: 1.47, mapsTo: "uN1 — hydrocarbon n" },
    { id: "caustic", label: "Caustic mix", unit: "weight", min: 0, max: 0.4, step: 0.01, default: 0.16, mapsTo: "uCMix — water caustics sit under the film, not over it" },
  ],
  apply(u, values) {
    const d = v(values, "d", 340);
    const nFilm = v(values, "nFilm", 1.47);
    const caustic = v(values, "caustic", 0.16);
    return { ...u, uThick0: d * 0.35, uThick1: d * 2.1, uN1: nFilm, uCMix: caustic, uCScale: 0.7 };
  },
  live(u, look) {
    const c = cosFromLook(look);
    const d = (u.uThick0 + u.uThick1) / 2;
    const path = 2 * u.uN1 * d * c;
    return [
      { label: "Equation", value: "2 n d cosθ = m λ" },
      { label: "n, d, cosθ", value: `${fmt(u.uN1, 2)} · ${fmt(d, 0)} nm · ${fmt(c, 2)}` },
      { label: "2 n d cosθ", value: `${fmt(path, 0)} nm` },
      { label: "constructive m=1", value: `λ ≈ ${fmt(path / 1.5, 0)} nm  (2nd = 3λ/2)` },
      { label: "constructive m=2", value: `λ ≈ ${fmt(path / 2.5, 0)} nm` },
      { label: "Stack", value: `air ${fmt(u.uN0, 3)} / film ${fmt(u.uN1, 2)} / water ${fmt(u.uN2, 3)}` },
    ];
  },
};

const SOAP: SpecimenControls = {
  equation: "2 n d cosθ = m λ · black film as d → 0",
  timeScale: 0.18,
  warp: 0.12,
  knobs: [
    { id: "dMax", label: "Foot thickness", unit: "nm", min: 80, max: 1200, step: 10, default: 720, mapsTo: "uThick1 — drainage field still goes to uThick0 at the top" },
    { id: "nFilm", label: "Film IOR", unit: "n", min: 1.33, max: 1.42, step: 0.005, default: 1.35, mapsTo: "uN1 — water + surfactant" },
    { id: "dMin", label: "Black-film floor", unit: "nm", min: 4, max: 40, step: 1, default: 8, mapsTo: "uThick0 — below ~10 nm all visible λ cancel" },
  ],
  apply(u, values) {
    return {
      ...u,
      uThick0: v(values, "dMin", 8),
      uThick1: v(values, "dMax", 720),
      uN1: v(values, "nFilm", 1.35),
      uN2: 1.0003,
    };
  },
  live(u, look) {
    const c = cosFromLook(look);
    return [
      { label: "Equation", value: "2 n d cosθ = m λ" },
      { label: "n, cosθ", value: `${fmt(u.uN1, 2)} · ${fmt(c, 2)}` },
      { label: "Top (black)", value: `d = ${fmt(u.uThick0, 0)} nm` },
      { label: "Foot", value: `d = ${fmt(u.uThick1, 0)} nm` },
      { label: "Stack", value: "air / film / air — net π, black at zero" },
    ];
  },
};

function braggLive(u: PreviewUniforms, look: { x: number; y: number }): MathLine[] {
  const c = cosFromLook(look);
  const Lambda = u.uNA * u.uTa + u.uNB * u.uTb;
  const lines: MathLine[] = [
    { label: "Equation", value: "λ_m = 2 Λ cosθ / m" },
    { label: "Λ = nA tA + nB tB", value: `${fmt(u.uNA, 2)}×${fmt(u.uTa, 0)} + ${fmt(u.uNB, 2)}×${fmt(u.uTb, 0)} = ${fmt(Lambda, 0)} nm` },
    { label: "cosθ", value: fmt(c, 2) },
  ];
  for (let m = 1; m <= 4; m++) {
    const lam = (2 * Lambda * c) / m;
    const vis = lam >= 380 && lam <= 780 ? "visible" : lam < 380 ? "UV" : "IR";
    lines.push({ label: `m = ${m}`, value: `λ = ${fmt(lam, 0)} nm (${vis})` });
  }
  lines.push({ label: "Δn, N", value: `${fmt(Math.abs(u.uNA - u.uNB), 3)} · ${fmt(u.uLayers, 0)} bilayers` });
  return lines;
}

const NACRE: SpecimenControls = {
  equation: "λ_m = 2 (nA tA + nB tB) cosθ / m",
  timeScale: 0.06,
  warp: 0.08,
  knobs: [
    { id: "tA", label: "Aragonite tablet", unit: "nm", min: 220, max: 700, step: 5, default: 450, mapsTo: "uTa — nA = 1.65. Pearl orient is m = 2, 3 of Λ ≈ 770 nm" },
    { id: "tB", label: "Protein sheet", unit: "nm", min: 8, max: 40, step: 1, default: 20, mapsTo: "uTb — nB = 1.40" },
    { id: "layers", label: "Bilayers", unit: "N", min: 40, max: 400, step: 2, default: 180, mapsTo: "uLayers — peak narrows as N grows" },
  ],
  apply(u, values) {
    return { ...u, uTa: v(values, "tA", 450), uTb: v(values, "tB", 20), uLayers: v(values, "layers", 180) };
  },
  live: braggLive,
};

const LAB: SpecimenControls = {
  equation: "λ_m = 2 Λ cosθ / m · Δn ≈ 0.03",
  timeScale: 0.04,
  warp: 0.05,
  knobs: [
    { id: "period", label: "Lamella period", unit: "nm", min: 180, max: 420, step: 4, default: 260, mapsTo: "Scales tA + tB. m = 2 of Λ ≈ 400 nm is the blue-green flash" },
    { id: "dn", label: "IOR contrast Δn", unit: "Δn", min: 0.012, max: 0.08, step: 0.001, default: 0.03, mapsTo: "uNA − uNB. Low contrast is labradorescence, not a pigment" },
    { id: "view", label: "Angular lobe", unit: "exp", min: 2, max: 12, step: 0.1, default: 8.5, mapsTo: "uViewExp — flash collapses off the cleavage" },
  ],
  apply(u, values) {
    const period = v(values, "period", 260);
    const dn = v(values, "dn", 0.03);
    const scale = period / 260;
    return {
      ...u,
      uTa: 140 * scale,
      uTb: 120 * scale,
      uNA: 1.545 + dn / 2,
      uNB: 1.545 - dn / 2,
      uViewExp: v(values, "view", 8.5),
    };
  },
  live: braggLive,
};

const BUTTERFLY: SpecimenControls = {
  equation: "λ₁ = 2 Λ cosθ · ridges modulate, they do not add a rainbow",
  timeScale: 0.08,
  warp: 0.1,
  knobs: [
    { id: "tA", label: "Chitin lamella", unit: "nm", min: 60, max: 130, step: 1, default: 90, mapsTo: "uTa — nA = 1.56. Λ ≈ 210 nm → λ₁ ≈ 420 nm" },
    { id: "tB", label: "Air gap", unit: "nm", min: 40, max: 110, step: 1, default: 70, mapsTo: "uTb — nB = 1.00" },
    { id: "period", label: "Ridge period", unit: "μm", min: 0.4, max: 1.6, step: 0.02, default: 0.85, mapsTo: "uPeriod — grating modulates the Bragg lobe" },
  ],
  apply(u, values) {
    return {
      ...u,
      uTa: v(values, "tA", 90),
      uTb: v(values, "tB", 70),
      uPeriod: v(values, "period", 0.85),
      uViewExp: Math.min(u.uViewExp, 4.2),
    };
  },
  live(u, look) {
    const extra = braggLive(u, look);
    extra.push({ label: "Ridges", value: `d = ${fmt(u.uPeriod, 2)} μm · d sinθ = m λ (modulation only)` });
    return extra;
  },
};

const FOIL: SpecimenControls = {
  equation: "d sinθ = m λ",
  timeScale: 0.12,
  warp: 0.08,
  knobs: [
    { id: "period", label: "Groove period", unit: "μm", min: 0.4, max: 2, step: 0.02, default: 0.85, mapsTo: "uPeriod — grating equation" },
    { id: "lacquer", label: "Lacquer thickness", unit: "nm", min: 80, max: 520, step: 5, default: 300, mapsTo: "uThick0 / uThick1 — Airy on the metal" },
    { id: "orders", label: "Orders", unit: "m", min: 1, max: 5, step: 1, default: 4, mapsTo: "uOrders" },
  ],
  apply(u, values) {
    const lacquer = v(values, "lacquer", 300);
    return {
      ...u,
      uPeriod: v(values, "period", 0.85),
      uThick0: lacquer * 0.7,
      uThick1: lacquer * 1.3,
      uOrders: v(values, "orders", 4),
    };
  },
  live(u, look) {
    const c = cosFromLook(look);
    const s = Math.sqrt(Math.max(1 - c * c, 0.08));
    const dnm = u.uPeriod * 1000;
    return [
      { label: "Equation", value: "d sinθ = m λ" },
      { label: "d, sinθ", value: `${fmt(dnm, 0)} nm · ${fmt(s, 2)}` },
      { label: "m = 1", value: `λ = ${fmt((dnm * s) / 1, 0)} nm` },
      { label: "m = 2", value: `λ = ${fmt((dnm * s) / 2, 0)} nm` },
      { label: "Lacquer", value: `d ≈ ${fmt((u.uThick0 + u.uThick1) / 2, 0)} nm · 2 n d cosθ` },
    ];
  },
};

const BISMUTH: SpecimenControls = {
  equation: "2 n d cosθ = m λ against conductor (n, k)",
  timeScale: 0.1,
  warp: 0.06,
  knobs: [
    { id: "d", label: "Oxide thickness", unit: "nm", min: 40, max: 380, step: 4, default: 180, mapsTo: "uThick0 / uThick1 — hopper steps set the field" },
    { id: "nFilm", label: "Oxide IOR", unit: "n", min: 1.9, max: 2.5, step: 0.01, default: 2.15, mapsTo: "uN1" },
    { id: "rough", label: "Hopper roughness", unit: "α", min: 0.06, max: 0.5, step: 0.01, default: 0.22, mapsTo: "uRough" },
  ],
  apply(u, values) {
    const d = v(values, "d", 180);
    return {
      ...u,
      uThick0: d * 0.45,
      uThick1: d * 1.55,
      uN1: v(values, "nFilm", 2.15),
      uRough: v(values, "rough", 0.22),
    };
  },
  live(u, look) {
    const c = cosFromLook(look);
    const d = (u.uThick0 + u.uThick1) / 2;
    const path = 2 * u.uN1 * d * c;
    return [
      { label: "Equation", value: "2 n d cosθ = m λ" },
      { label: "n, d, cosθ", value: `${fmt(u.uN1, 2)} · ${fmt(d, 0)} nm · ${fmt(c, 2)}` },
      { label: "2 n d cosθ", value: `${fmt(path, 0)} nm` },
      { label: "Exit", value: `conductor n,k · film sits on metal, not a rainbow texture` },
    ];
  },
};

const CHROME: SpecimenControls = {
  equation: "Fresnel (n, k) + B(T) emission",
  timeScale: 0.42,
  warp: 0.55,
  knobs: [
    { id: "temp", label: "Temperature", unit: "K", min: 1400, max: 2200, step: 10, default: 1900, mapsTo: "uTemp — blackbody in the troughs, independent of Fresnel" },
    { id: "rough", label: "Convection roughness", unit: "α", min: 0.02, max: 0.4, step: 0.01, default: 0.12, mapsTo: "uRough" },
    { id: "aniso", label: "Shear", unit: "aniso", min: 0, max: 1, step: 0.01, default: 0.45, mapsTo: "uAniso" },
  ],
  apply(u, values) {
    return {
      ...u,
      uTemp: v(values, "temp", 1900),
      uRough: v(values, "rough", 0.12),
      uAniso: v(values, "aniso", 0.45),
      uEmitAmt: 0.85,
    };
  },
  live(u) {
    return [
      { label: "Metal", value: `n = ${fmt(u.uN, 2)}, k = ${fmt(u.uK, 2)}` },
      { label: "Blackbody", value: `T = ${fmt(u.uTemp, 0)} K` },
      { label: "Roughness", value: `α = ${fmt(u.uRough, 2)} · aniso ${fmt(u.uAniso, 2)}` },
      { label: "Note", value: "Heat is volume emission. The metal is complex-IOR Fresnel." },
    ];
  },
};

const WATER: SpecimenControls = {
  equation: "Snell + focus of ∇h · Beer’s law",
  timeScale: 0.7,
  warp: 0.35,
  knobs: [
    { id: "focus", label: "Focus scale", unit: "weight", min: 0.4, max: 2.2, step: 0.02, default: 1.4, mapsTo: "uCScale — caustic tightness" },
    { id: "eta", label: "Water IOR", unit: "n", min: 1.31, max: 1.36, step: 0.001, default: 1.333, mapsTo: "uEta" },
    { id: "absorb", label: "Absorption", unit: "1/m", min: 0.02, max: 0.8, step: 0.01, default: 0.14, mapsTo: "uSigmaA — red-preferring" },
  ],
  apply(u, values) {
    return {
      ...u,
      uCScale: v(values, "focus", 1.4),
      uEta: v(values, "eta", 1.333),
      uIorD: v(values, "eta", 1.333),
      uSigmaA: v(values, "absorb", 0.14),
      uCMix: 1,
    };
  },
  live(u) {
    return [
      { label: "Snell", value: `n_air sinθ_i = ${fmt(u.uEta, 3)} sinθ_t` },
      { label: "Focus", value: `scale ${fmt(u.uCScale, 2)}` },
      { label: "Beer", value: `σ_a = ${fmt(u.uSigmaA, 2)} /m · water takes red first` },
    ];
  },
};

const CLOUD: SpecimenControls = {
  equation: "p(θ) = HG(g) · high albedo",
  timeScale: 0.28,
  warp: 0.2,
  knobs: [
    { id: "density", label: "Droplet density", unit: "rel", min: 0.25, max: 1.4, step: 0.02, default: 0.85, mapsTo: "uDensity" },
    { id: "g", label: "Asymmetry g", unit: "g", min: 0.4, max: 0.95, step: 0.01, default: 0.85, mapsTo: "uG — Mie droplets are forward-peaked. Silver lining." },
    { id: "sigmaS", label: "σ_s", unit: "1/m", min: 4, max: 22, step: 0.2, default: 12, mapsTo: "uSigmaS" },
  ],
  apply(u, values) {
    return {
      ...u,
      uDensity: v(values, "density", 0.85),
      uG: v(values, "g", 0.85),
      uSigmaS: v(values, "sigmaS", 12),
      uPhase: 2,
    };
  },
  live(u) {
    return [
      { label: "Phase", value: "Henyey–Greenstein / Mie" },
      { label: "p(θ)", value: `(1 − g²) / (1 + g² − 2 g μ)^{3/2}` },
      { label: "g, σ_s, ρ", value: `${fmt(u.uG, 2)} · ${fmt(u.uSigmaS, 1)} /m · ${fmt(u.uDensity, 2)}` },
      { label: "Albedo", value: "σ_s / (σ_s + σ_a) ≈ 1 — white is not a cloud shader" },
    ];
  },
};

const NEBULA: SpecimenControls = {
  equation: "Same volume operators as cloud. Emission is a separate node.",
  timeScale: 0.16,
  warp: 0.12,
  knobs: [
    { id: "density", label: "Dust density", unit: "rel", min: 0.15, max: 1.2, step: 0.02, default: 0.55, mapsTo: "uDensity" },
    { id: "emit", label: "Line emission", unit: "weight", min: 0.2, max: 1.6, step: 0.02, default: 1, mapsTo: "uEmitAmt — Hβ, [O III], Hα as data" },
    { id: "g", label: "Asymmetry g", unit: "g", min: -0.2, max: 0.7, step: 0.02, default: 0.35, mapsTo: "uG" },
  ],
  apply(u, values) {
    return {
      ...u,
      uDensity: v(values, "density", 0.55),
      uEmitAmt: v(values, "emit", 1),
      uG: v(values, "g", 0.35),
      uPhase: 0,
    };
  },
  live(u) {
    return [
      { label: "Lines", value: "Hβ 486 nm · [O III] 501 nm · Hα 656 nm" },
      { label: "g, ρ, emit", value: `${fmt(u.uG, 2)} · ${fmt(u.uDensity, 2)} · ${fmt(u.uEmitAmt, 2)}` },
      { label: "Operators", value: "volume-scattering + absorption + emission" },
    ];
  },
};

const OPAL: SpecimenControls = {
  equation: "I_s ∝ λ⁻⁴ · glass Fresnel at the boundary",
  timeScale: 0.08,
  warp: 0.06,
  knobs: [
    { id: "density", label: "Inclusion density", unit: "rel", min: 0.08, max: 0.9, step: 0.02, default: 0.42, mapsTo: "uDensity — Rayleigh scatter in the bulk" },
    { id: "ior", label: "Glass IOR", unit: "n", min: 1.45, max: 1.55, step: 0.005, default: 1.52, mapsTo: "uIorD / uEta — sphere boundary" },
    { id: "sigmaS", label: "σ_s (blue-weighted)", unit: "1/m", min: 1, max: 8, step: 0.1, default: 2.7, mapsTo: "uSigmaS" },
  ],
  apply(u, values) {
    const ior = v(values, "ior", 1.52);
    return {
      ...u,
      uDensity: v(values, "density", 0.42),
      uIorD: ior,
      uEta: ior,
      uSigmaS: v(values, "sigmaS", 2.7),
      uPhase: 1,
      uStage: 1,
    };
  },
  live(u) {
    return [
      { label: "Rayleigh", value: "I_s / I_t ∝ λ⁻⁴  →  blue scatter / amber transmit" },
      { label: "n, ρ, σ_s", value: `${fmt(u.uIorD, 2)} · ${fmt(u.uDensity, 2)} · ${fmt(u.uSigmaS, 1)} /m` },
      { label: "Boundary", value: "Dielectric Fresnel + Snell on a glass sphere. Not a volume slab." },
    ];
  },
};

export const CONTROLS: Record<string, SpecimenControls> = {
  "oil-slick": OIL,
  "soap-film": SOAP,
  nacre: NACRE,
  labradorite: LAB,
  "butterfly-structural-color": BUTTERFLY,
  "holographic-foil": FOIL,
  "bismuth-oxide": BISMUTH,
  "molten-chrome": CHROME,
  "caustic-water": WATER,
  cloud: CLOUD,
  nebula: NEBULA,
  "opalescent-glass": OPAL,
};

export function controlsFor(id: string): SpecimenControls {
  return CONTROLS[id] ?? NACRE;
}

export function defaultKnobs(id: string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const k of controlsFor(id).knobs) out[k.id] = k.default;
  return out;
}

export function applyPhysicalKnobs(
  uniforms: PreviewUniforms,
  specimenId: string,
  values: Record<string, number>,
): { uniforms: PreviewUniforms; timeScale: number; warp: number } {
  const c = controlsFor(specimenId);
  return { uniforms: c.apply(uniforms, values), timeScale: c.timeScale, warp: c.warp };
}
