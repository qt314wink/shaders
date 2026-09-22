# Ontology gaps — Shader Grammar v0.1

v0.1 is a closed catalog that describes twelve deliberately different
specimens without named-effect flags. That is the milestone. These are
the known holes, written down so v0.2 does not pretend they are solved.

## Polarization

Thin-film and multilayer operators take a scalar optical path. They do
not split s and p. Soap films and Morpho scales are polarization-sensitive;
the grammar currently folds that into `view-dependent-weight`.

## Photonic crystals

Butterfly scales are approximated as multilayer + 1D grating. A 3D
lattice (inverse opal, gyroid) has no operator. Adding one is justified
only if two specimens need it (e.g. weevil exoskeleton + opal gem).

## Spectral complex IOR

`fresnel-conductor` accepts a single (n, k) pair. Real metals are
spectral. The parameter schema already allows a `spectral` form; none of
the twelve specimens ship a full n(λ), k(λ) table yet.

## Multiple scattering

`volume-scattering` names a phase function. It does not describe bounce
count, diffusion approximation, or delta-Eddington. Cloud silver lining
and opalescent transmission would need an explicit *order* of scatter.

## Fluorescence / Raman / phosphorescence

No inelastic operator. Uranium glass, highlighter ink, and chlorophyll
would currently be faked as `volume-emission`, which is the wrong physics.

## Thin film on rough conductors

Belcour & Barla (2017) is referenced on `thin-film-interference` but
there is no slot coupling film thickness to a microfacet distribution.
Bismuth hopper crystals approximate this by running film and microfacet
in parallel.

## Total internal reflection

Folded into `refraction-snell`. A dedicated TIR operator would only be
added if a specimen (diamond fire, optical fiber) cannot be expressed
with Snell + Fresnel.

## Subsurface diffusion (BSSRDF)

Opalescent glass uses Rayleigh volume scattering, which is the right
mechanism for nano-inclusions. Skin, marble, and milk need a diffusion
profile the catalog does not have.

## Dispersion as a first-class field

Caustic water uses a constant IOR. Rainbows and diamond fire need
n(λ). The spectral parameter form can carry it; no specimen binds it.

## Time

`drainage` and `surface-waves` are analytic field generators with a
frequency, but there is no first-class `time` domain on recipes. The
preview may animate; the grammar does not yet say that drainage is a
function of t.

## What v0.1 *did* close

- Oil slick and soap film share `thin-film-interference`.
- Nacre, labradorite, and butterfly share `multilayer-interference`.
- Butterfly and holographic foil share `diffraction-grating`.
- Cloud, nebula, and opalescent glass share `volume-scattering` and differ by phase function + emission.
- Molten chrome and nebula share `volume-emission` (blackbody vs line list).
- Oil slick and caustic water share `caustic-transport`.
- The anti-example `oilSlick: true` is rejected.
