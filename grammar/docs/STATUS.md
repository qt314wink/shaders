# Status — Shader Grammar v0.1

## Where we are

This is the first closed catalog. It did not exist as a worktree, a
schema set, or a repository before this milestone. Related prior art:

- **aether** (archived) — iridescent GLSL product. Ancestor *look*, not ancestor ontology.
- **seed-loom** — signal-to-system pipeline. Its Visual Grammar Engine extracts motifs and palettes; it does not know a nanometer of optical path. Shader Grammar is a sibling, not a folder inside it.
- This sandbox previously held an unrelated drum machine. No grammar files were found to salvage.

Designated home: [qt314wink/shader-grammar](https://github.com/qt314wink/shader-grammar).

## What this is

An ontology of optical phenomena. A material is a **recipe**: typed
parameters, spatially/spectrally varying fields, and a graph of
**operators** drawn from a closed catalog. Operators are physics
(`thin-film-interference`, `volume-scattering`). They are never materials
(`oil-slick`, `nacre`) and never marketing words (`holographic: true`).

## What it is for

So a renderer, a lookdev tool, or an agent can describe oil-on-water as
a two-interface film with a thickness field and IOR stack
`(1.0003, 1.47, 1.333)` and get that look without a preset named oil.
Soap film is the same operator with air on both sides and a drainage
field. Cloud, nebula, and opalescent glass share volume scattering and
differ by phase function, density, and emission.

## Where it is strong

- **Generalization is tested.** Every catalog operator is used by at least two of the twelve specimens.
- **The trap is gated.** `examples/invalid/named-effect.json` (`oilSlick: true`) is rejected.
- **Units and kinds are first-class.** Thickness is nm; density is kg/m³; conductors are complex IOR.
- **Appearance words are aliases.** Iridescent, pearlescent, holographic, opalescent map onto mechanisms in the taxonomy. They are not operators.
- **Specimens are deliberately far apart** (film, crystal, insect, foil, metal, water, cloud, nebula, glass) so a passing reuse test means something.

## Where it is weak or unspecified

See `ontology-gaps.md`. Polarization, 3D photonic crystals, inelastic
scatter, BSSRDF, full spectral metal IOR, scatter order, and a first-class
time domain are not in v0.1. The canvas in the explorer is an evaluative
sketch driven by operator weights — not a claim that Airy or Mie are
implemented.

## System improvements

1. Polarization slots on film and multilayer.
2. Spectral `(n, k)` tables on conductors.
3. Explicit scatter-order / diffusion on volumes.
4. `time` as a field domain so drainage is f(t).
5. A recipe → GLSL compiler that still cannot name a material.
6. Seed Loom points here; it does not grow a parallel optics schema.
