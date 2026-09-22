import { sceneAudio } from "./audio";
import { MACRO_DEFS } from "./macros";
import { BOUNDS, OPTICAL_LOCKED, particleBudget } from "./spec";
import { hot } from "./store";
import { MACRO_IDS, type MacroMap, type QualityTier } from "./types";

export { layerBudget, particleBudget } from "./spec";

export function stepRuntime(dt: number, target: MacroMap, quality: QualityTier) {
  const capped = Math.min(dt, BOUNDS.dtMax);
  for (const id of MACRO_IDS) {
    const def = MACRO_DEFS[id];
    if (def.locked) {
      hot.applied[id] = OPTICAL_LOCKED;
      continue;
    }
    const tau = Math.max(0.05, def.smoothingSec);
    const k = 1 - Math.exp(-capped / tau);
    hot.applied[id] += (target[id] - hot.applied[id]) * k;
  }
  hot.applied.optical = OPTICAL_LOCKED;
  sceneAudio.apply(hot.applied);
  const feat = sceneAudio.sample();
  hot.features = feat;
  hot.particles = particleBudget(quality, hot.applied.atmosphere);
}
