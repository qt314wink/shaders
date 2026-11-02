# abalone-shim (incubate)
Adapter-only (option B): wraps MelodicBloom camera-basis `abalone.glsl` pinned at `8866c0ba40340b6dbe86d2a6f8b5f4a15d3c2a55`. MB raw WebGL stack untouched; QT and MB stay separate apps.

TODO before ready: add route, visual parity check vs MB Pages, confirm MB shader consumes basis (currently derives from `cameraOrbit`; `u_camRight/Up/Forward` are the forward contract — unused uniforms are harmless). Hazard (untested): three default world lights reintroduce dark backside if basis uniforms are omitted.

## Revert
Delete `src/lib/abalone-shim/` (and the route once added). MB unchanged.
