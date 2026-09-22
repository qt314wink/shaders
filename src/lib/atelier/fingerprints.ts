import type { Recipe } from "@/lib/grammar/types";

export type Fingerprint = {
  composition: string;
  form: string;
  material: string;
  optics: string;
  color: string;
  surface: string;
  invariants: string[];
  flexible: string[];
  thesis: string;
};

export const FINGERPRINTS: Record<string, Fingerprint> = {
  "oil-slick": {
    thesis: "A hydrocarbon film on water. Color is optical path, not pigment.",
    composition: "Plan view of a spreading film over a disturbed dielectric.",
    form: "Organic, fluid, no hard edge.",
    material: "Hydrocarbon film, air above, water below.",
    optics: "Two-interface interference, dielectric Fresnel, caustic transport.",
    color: "Spectral bands that cycle with thickness. No hue slider.",
    surface: "Viscous, wind-streaked. Optical path 80–900 nm.",
    invariants: ["Airy two-interface", "view-dependent color", "caustics under film"],
    flexible: ["thickness range", "wind frequency"],
  },
  "soap-film": {
    thesis: "The same two-interface operator as oil, with air on both sides.",
    composition: "A hanging membrane. Drainage toward a black film at the top.",
    form: "Thin, tensile, slightly curved.",
    material: "Surfactant film in air.",
    optics: "Thin-film interference plus dielectric Fresnel. No caustics.",
    color: "Newton orders collapsing as thickness drains toward zero.",
    surface: "Drainage field. Black film where path is a few nanometers.",
    invariants: ["air / film / air stack", "drainage toward black"],
    flexible: ["drainage rate", "starting thickness"],
  },
  nacre: {
    thesis: "Pearl luster is a Bragg stack, not a pearl shader.",
    composition: "Curved tablet surface, glancing light.",
    form: "Lamellar, slightly brick-like, organic.",
    material: "Aragonite tablets and protein sheets.",
    optics: "Multilayer interference plus dielectric Fresnel envelope.",
    color: "Warm orient that walks with angle. Compressed spectrum.",
    surface: "Polished, low roughness, tablet-scale orientation field.",
    invariants: ["bilayer optical thickness", "angular flash"],
    flexible: ["layer count", "protein fraction"],
  },
  labradorite: {
    thesis: "Labradorescence is nacre’s operator at lower contrast and tighter tilt.",
    composition: "A cleaved feldspar face. Schiller in a narrow lobe.",
    form: "Crystalline, planar, fractured.",
    material: "Exsolution lamellae in plagioclase.",
    optics: "Multilayer interference, microfacet scatter, view weight.",
    color: "Blue-green flash against a dark body. Not a pigment.",
    surface: "Cleavage polish. Tight orientation field.",
    invariants: ["low IOR contrast", "narrow angular lobe"],
    flexible: ["lamella period", "polish"],
  },
  "butterfly-structural-color": {
    thesis: "Morpho blue is a multilayer plus a ridge grating. No blue pigment.",
    composition: "Scale field, raked light, high angular selectivity.",
    form: "Periodic ridges over a lamellar stack.",
    material: "Chitin architecture.",
    optics: "Bragg peak from the stack, spectral orders from the grating.",
    color: "Saturated blue that collapses off-axis.",
    surface: "Ridge period in the micrometer band.",
    invariants: ["stack + grating composition", "view-dependent collapse"],
    flexible: ["ridge period", "layer count"],
  },
  "holographic-foil": {
    thesis: "No holographic flag. Grating orders on conductor Fresnel, lacquer film on top.",
    composition: "Embossed sheet, grazing specular.",
    form: "Mechanical, periodic, planar.",
    material: "PET lacquer over aluminum.",
    optics: "Diffraction grating, thin-film interference, conductor Fresnel.",
    color: "Spectral orders walking with angle. Metal underneath.",
    surface: "Embossed grooves. High specularity.",
    invariants: ["grating equation", "metal exit medium"],
    flexible: ["period", "lacquer thickness"],
  },
  "bismuth-oxide": {
    thesis: "Hopper-crystal tarnish is a film on a conductor, not a rainbow texture.",
    composition: "Stepped hopper geometry, oxide over metal.",
    form: "Crystalline stairs, iridescent.",
    material: "Bismuth metal with oxide film.",
    optics: "Thin-film interference against conductor Fresnel.",
    color: "Orders set by oxide thickness. Metal tint from (n, k).",
    surface: "Hopper roughness. Microfacet scatter.",
    invariants: ["film on conductor", "thickness as color"],
    flexible: ["oxide range", "hopper scale"],
  },
  "molten-chrome": {
    thesis: "Heat is volume emission. The metal is complex-IOR Fresnel.",
    composition: "Convecting liquid body, hot core.",
    form: "Fluid metal, anisotropic streaks.",
    material: "Liquid chromium.",
    optics: "Conductor Fresnel, microfacet scatter, blackbody emission.",
    color: "Cool metal with thermal incandescence in the troughs.",
    surface: "Convection-driven roughness. Anisotropic shear.",
    invariants: ["complex IOR", "emission independent of Fresnel"],
    flexible: ["temperature", "shear"],
  },
  "caustic-water": {
    thesis: "Caustics are Snell plus a displacement field. Not a caustic texture.",
    composition: "Looking through a dielectric surface onto focused light.",
    form: "Liquid plane, refractive.",
    material: "Water.",
    optics: "Refraction, caustic transport, dielectric Fresnel, absorption.",
    color: "White caustic network, red-preferring beer-law depth.",
    surface: "Surface waves. No pigment.",
    invariants: ["Snell + geometry", "wavelength-dependent absorption"],
    flexible: ["wave frequency", "focus scale"],
  },
  cloud: {
    thesis: "White is high albedo and a forward phase function, not a cloud shader.",
    composition: "Participating medium against void.",
    form: "Soft, billowing density field.",
    material: "Water droplets in air.",
    optics: "Mie volume scattering plus absorption.",
    color: "Near-white. Silver lining from forward scatter.",
    surface: "No surface. Density is the form.",
    invariants: ["Mie / HG phase", "density field"],
    flexible: ["density", "asymmetry g"],
  },
  nebula: {
    thesis: "Same volume operators as cloud. Emission and dust make the difference.",
    composition: "Low-density medium, embedded emission.",
    form: "Filamentary, open, astronomical.",
    material: "Dust and ionized gas.",
    optics: "Volume scattering, absorption, spectral emission.",
    color: "Line emission against dust-reddened scatter. Not a nebula LUT.",
    surface: "None. Density and emission fields.",
    invariants: ["shared volume operators with cloud", "emission as a separate node"],
    flexible: ["emission mix", "dust density"],
  },
  "opalescent-glass": {
    thesis: "Opalescence is Rayleigh scatter in a dielectric bulk, plus a glass boundary.",
    composition: "Transmitted slab, cool scatter, warm transmission.",
    form: "Solid dielectric, rounded.",
    material: "Glass with nano-inclusions.",
    optics: "Volume scattering, absorption, dielectric Fresnel, Snell.",
    color: "Blue scatter / amber transmit. No opal preset.",
    surface: "Polished glass Fresnel.",
    invariants: ["Rayleigh λ⁻⁴ tint", "boundary vs bulk"],
    flexible: ["inclusion density", "slab thickness"],
  },
};

export function fingerprintOf(recipe: Recipe): Fingerprint {
  return FINGERPRINTS[recipe.id] ?? {
    thesis: recipe.summary,
    composition: "Unspecified.",
    form: "Unspecified.",
    material: recipe.title,
    optics: recipe.nodes.map((n) => n.operator).join(", "),
    color: "Unspecified.",
    surface: "Unspecified.",
    invariants: recipe.phenomena ?? [],
    flexible: [],
  };
}

export type FusionKind = "conservative" | "expressive" | "speculative";

export function fusionKind(aOps: string[], bOps: string[]): FusionKind {
  const a = new Set(aOps);
  const b = new Set(bOps);
  const shared = [...a].filter((x) => b.has(x) && x !== "spectral-integrate");
  const aFam = familyOf(a);
  const bFam = familyOf(b);
  if (shared.length >= 2 && aFam === bFam) return "conservative";
  if (aFam === bFam || shared.length >= 1) return "expressive";
  return "speculative";
}

function familyOf(ops: Set<string>): string {
  if (ops.has("thin-film-interference") || ops.has("multilayer-interference")) return "interference";
  if (ops.has("diffraction-grating")) return "diffraction";
  if (ops.has("volume-scattering")) return "volume";
  if (ops.has("caustic-transport") || ops.has("refraction-snell")) return "transport";
  if (ops.has("fresnel-conductor")) return "conductor";
  return "other";
}
