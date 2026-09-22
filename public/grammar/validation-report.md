# Shader Grammar v0.1 — validation report

Generated 2026-09-01T05:00:47.450Z

**Result: PASS**

## Criteria

| Gate | Status |
| --- | --- |
| Recipe / operator / field / parameter schemas | pass |
| No named-effect flags | pass |
| All 12 specimens present | pass |
| Every operator reused (≥2 specimens) | pass |
| Negative control rejected | pass |
| Positive control accepted | pass |

## Coverage matrix

Rows are specimens. Columns are catalog operators. A mark means the recipe binds that operator. Shared primitives, not unique flags.

| specimen | thin‑film‑interference | multilayer‑interference | diffraction‑grating | fresnel‑dielectric | fresnel‑conductor | microfacet‑scatter | refraction‑snell | caustic‑transport | volume‑scattering | volume‑absorption | volume‑emission | view‑dependent‑weight | spectral‑integrate |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| oil-slick | ● |  |  | ● |  |  |  | ● |  |  |  | ● | ● |
| soap-film | ● |  |  | ● |  |  |  |  |  |  |  | ● | ● |
| nacre |  | ● |  | ● |  |  |  |  |  |  |  | ● | ● |
| labradorite |  | ● |  |  |  | ● |  |  |  |  |  | ● | ● |
| butterfly-structural-color |  | ● | ● |  |  |  |  |  |  |  |  | ● | ● |
| holographic-foil | ● |  | ● |  | ● |  |  |  |  |  |  |  | ● |
| bismuth-oxide | ● |  |  |  | ● | ● |  |  |  |  |  |  | ● |
| molten-chrome |  |  |  |  | ● | ● |  |  |  |  | ● | ● | ● |
| caustic-water |  |  |  | ● |  |  | ● | ● |  | ● |  |  | ● |
| cloud |  |  |  |  |  |  |  |  | ● | ● |  |  | ● |
| nebula |  |  |  |  |  |  |  |  | ● | ● | ● |  | ● |
| opalescent-glass |  |  |  | ● |  |  | ● |  | ● | ● |  |  | ● |

## Reuse counts

- `thin-film-interference`: 4 specimens
- `multilayer-interference`: 3 specimens
- `diffraction-grating`: 2 specimens
- `fresnel-dielectric`: 5 specimens
- `fresnel-conductor`: 3 specimens
- `microfacet-scatter`: 3 specimens
- `refraction-snell`: 2 specimens
- `caustic-transport`: 2 specimens
- `volume-scattering`: 3 specimens
- `volume-absorption`: 4 specimens
- `volume-emission`: 2 specimens
- `view-dependent-weight`: 6 specimens
- `spectral-integrate`: 12 specimens

## Findings

- **info** `positive-control`: examples/valid/minimal-thin-film.json passed.
- **info** `negative-control`: examples/invalid/named-effect.json was rejected as required.
- **info** `reuse`: Every catalog operator is used by at least two specimens.

## What this does *not* prove

Schema + reuse proves the *description* generalizes. It does not prove a renderer implements Airy sums, Mie kernels, or a spectral observer correctly. v0.1 is an ontology with an evaluative sketch, not a path tracer.
