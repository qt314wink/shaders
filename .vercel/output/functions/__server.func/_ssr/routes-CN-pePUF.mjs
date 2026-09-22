import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { a as cn, i as Wordmark, n as ProductNav, o as probeRenderers, r as Slider, t as Button } from "./wordmark-Bj6KVvl7.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CN-pePUF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var MACRO_IDS = [
	"intensity",
	"depth",
	"atmosphere",
	"focus",
	"material",
	"axis",
	"optical",
	"narrative"
];
var STAGE_MACROS = [
	"intensity",
	"depth",
	"atmosphere",
	"focus"
];
var PATTERN_IDS = [
	"bloom",
	"lattice",
	"coil",
	"gate",
	"vesica"
];
var QUALITY_TIERS = [
	"HIGH",
	"MEDIUM",
	"SAFE"
];
/** Closed v1 execution bounds. Nothing in the runtime may exceed these. */
var BOUNDS = {
	dtMax: .05,
	quantum: .001,
	macroMin: 0,
	macroMax: 1,
	vertexMax: 96,
	ringSamples: 48,
	fieldSamples: 32,
	particle: {
		HIGH: 96,
		MEDIUM: 48,
		SAFE: 0
	},
	particleBase: {
		HIGH: 32,
		MEDIUM: 16,
		SAFE: 0
	},
	layers: {
		HIGH: 7,
		MEDIUM: 5,
		SAFE: 3
	},
	trialStepsMax: 8,
	soakMaxSec: 6,
	ledgerMax: 120,
	undoMax: 16,
	observationsMax: 24,
	fpsWindow: 60,
	metricsPushMs: 160,
	midiCcMax: 127,
	gainCeiling: .35,
	opticalLocked: .35,
	p95: {
		HIGH: 26,
		MEDIUM: 34
	},
	analyserFft: 2048,
	dpr: {
		HIGH: 2,
		MEDIUM: 1.5,
		SAFE: 1
	},
	axisBuckets: 3,
	materialCount: 12,
	patternCount: 5,
	macroCount: 8,
	propertyCount: 8,
	fieldCount: 6
};
var SCOPE = {
	in: [
		"8 macros with Target / Applied / Measured labels",
		"8 typed properties with units and ranges",
		"6 scene fields with bounded sample counts",
		"5 ritual-geometry patterns as closed vertex tables",
		"12 shader-grammar specimens, indexed, no named-effect flags",
		"3 quality tiers that cap vertices, particles, layers, DPR",
		"Studio / Stage / Diagnostics",
		"Optional MIDI adapter",
		"Manifest round-trip (aurelith.scene.v1)"
	],
	out: [
		"Physical optical / laser / haptic output",
		"Microphone input",
		"G-code, kerf, or machine-tool export",
		"Named-effect flags or material-specific operators",
		"Continuous Sacred⇔Industrial morph",
		"Unbounded particle, vertex, or trial growth",
		"Health, diagnostic, or treatment claims",
		"General VJ deck / unbounded scene graph"
	]
};
var PROPERTY_IDS = [
	"energy",
	"recession",
	"haze",
	"attention",
	"specimen",
	"language",
	"beam",
	"duration"
];
var FIELD_IDS = [
	"emissive",
	"density",
	"particle",
	"vignette",
	"recipe",
	"geometry-mix"
];
var PROPERTY_DEFS = {
	energy: {
		index: 0,
		id: "energy",
		unit: "weight",
		kind: "weight",
		range: [0, 1],
		from: "intensity",
		field: "emissive",
		attr: "stroke-alpha",
		notes: "Visual emissive leads audio. Gain is a squared map under the safety ceiling."
	},
	recession: {
		index: 1,
		id: "recession",
		unit: "weight",
		kind: "weight",
		range: [0, 1],
		from: "depth",
		field: "density",
		attr: "radius-scale",
		notes: "Fog / layer radius. Smoothed. Never a scene teleport."
	},
	haze: {
		index: 2,
		id: "haze",
		unit: "weight",
		kind: "weight",
		range: [0, 1],
		from: "atmosphere",
		field: "particle",
		attr: "count",
		notes: "Particle budget is quality-capped before the drone is touched."
	},
	attention: {
		index: 3,
		id: "attention",
		unit: "weight",
		kind: "weight",
		range: [0, 1],
		from: "focus",
		field: "vignette",
		attr: "core-weight",
		notes: "Centre-biased. No pan mapping."
	},
	specimen: {
		index: 4,
		id: "specimen",
		unit: "index",
		kind: "index",
		range: [0, 11],
		from: "material",
		field: "recipe",
		attr: "palette-index",
		notes: "Discrete index into the 12-specimen catalog. Not a hue slider."
	},
	language: {
		index: 5,
		id: "language",
		unit: "enum",
		kind: "enum",
		range: [0, 2],
		from: "axis",
		field: "geometry-mix",
		attr: "pattern-mix",
		notes: "Quantized: 0 Sacred, 1 Threshold, 2 Industrial."
	},
	beam: {
		index: 6,
		id: "beam",
		unit: "locked",
		kind: "locked",
		range: [.35, .35],
		from: "optical",
		field: "emissive",
		attr: "beam-alpha",
		notes: "Fixed. Simulation-only. No physical output adapter."
	},
	duration: {
		index: 7,
		id: "duration",
		unit: "s",
		kind: "seconds",
		range: [.2, 1.4],
		from: "narrative",
		field: "emissive",
		attr: "playhead-rate",
		notes: "Playhead walk rate and coil turn emphasis. Scene-level."
	}
};
var FIELD_DEFS = {
	emissive: {
		index: 0,
		id: "emissive",
		kind: "weight",
		unit: "weight",
		domain: "temporal",
		samples: BOUNDS.fieldSamples,
		notes: "Stroke and playhead glow. Driven by energy."
	},
	density: {
		index: 1,
		id: "density",
		kind: "weight",
		unit: "weight",
		domain: "volume",
		samples: BOUNDS.fieldSamples,
		notes: "Fog distance and layer radius scale. Driven by recession."
	},
	particle: {
		index: 2,
		id: "particle",
		kind: "count",
		unit: "count",
		domain: "volume",
		samples: 1,
		notes: "Integer budget. SAFE is identically 0."
	},
	vignette: {
		index: 3,
		id: "vignette",
		kind: "weight",
		unit: "weight",
		domain: "angular",
		samples: BOUNDS.fieldSamples,
		notes: "Rim falloff. Inverse of attention."
	},
	recipe: {
		index: 4,
		id: "recipe",
		kind: "index",
		unit: "index",
		domain: "surface",
		samples: 1,
		notes: "Shader-grammar specimen index 0–11."
	},
	"geometry-mix": {
		index: 5,
		id: "geometry-mix",
		kind: "enum",
		unit: "enum",
		domain: "surface",
		samples: 1,
		notes: "Axis bucket. Not a continuous morph."
	}
};
var MATERIAL_SPECIMENS = [
	{
		index: 0,
		id: "oil-slick",
		title: "Oil Slick"
	},
	{
		index: 1,
		id: "soap-film",
		title: "Soap Film"
	},
	{
		index: 2,
		id: "nacre",
		title: "Nacre"
	},
	{
		index: 3,
		id: "labradorite",
		title: "Labradorite"
	},
	{
		index: 4,
		id: "butterfly-structural-color",
		title: "Butterfly"
	},
	{
		index: 5,
		id: "holographic-foil",
		title: "Holo Foil"
	},
	{
		index: 6,
		id: "bismuth-oxide",
		title: "Bismuth"
	},
	{
		index: 7,
		id: "molten-chrome",
		title: "Molten Chrome"
	},
	{
		index: 8,
		id: "caustic-water",
		title: "Caustic Water"
	},
	{
		index: 9,
		id: "cloud",
		title: "Cloud"
	},
	{
		index: 10,
		id: "nebula",
		title: "Nebula"
	},
	{
		index: 11,
		id: "opalescent-glass",
		title: "Opal Glass"
	}
];
var MATERIAL_COLORS = [
	[
		"#7eb0b8",
		"#8fbfa0",
		"#d4c4a8"
	],
	[
		"#9bb7c4",
		"#ece7dc",
		"#7eb0b8"
	],
	[
		"#ece7dc",
		"#c9b8a0",
		"#8fbfa0"
	],
	[
		"#7d9a7e",
		"#7eb0b8",
		"#b9c4d0"
	],
	[
		"#8fbfa0",
		"#7eb0b8",
		"#ece7dc"
	],
	[
		"#b9c4d0",
		"#7eb0b8",
		"#ece7dc"
	],
	[
		"#8fbfa0",
		"#c4a574",
		"#7eb0b8"
	],
	[
		"#b9c4d0",
		"#8b877e",
		"#ece7dc"
	],
	[
		"#7eb0b8",
		"#ece7dc",
		"#5c8a9a"
	],
	[
		"#b9c4d0",
		"#8b877e",
		"#ece7dc"
	],
	[
		"#7d9a7e",
		"#7eb0b8",
		"#b9c4d0"
	],
	[
		"#ece7dc",
		"#7eb0b8",
		"#8fbfa0"
	]
];
var PATTERN_VERTEX_COUNT = {
	vesica: 64,
	bloom: 16,
	coil: 96,
	gate: 24,
	lattice: 49
};
var AXIS_VALUES = [
	.12,
	.5,
	.88
];
var AXIS_LABELS = [
	"Sacred",
	"Threshold",
	"Industrial"
];
var DEFAULT_MACROS = {
	intensity: .42,
	depth: .58,
	atmosphere: .36,
	focus: .64,
	material: 2 / 11,
	axis: .12,
	optical: BOUNDS.opticalLocked,
	narrative: .4
};
var OPTICAL_LOCKED = BOUNDS.opticalLocked;
function clamp01(v) {
	if (!Number.isFinite(v)) return 0;
	return Math.min(BOUNDS.macroMax, Math.max(BOUNDS.macroMin, v));
}
function quantize(v) {
	return Math.round(clamp01(v) / BOUNDS.quantum) * BOUNDS.quantum;
}
function macroIndex(id) {
	return MACRO_IDS.indexOf(id);
}
function patternIndex(id) {
	return PATTERN_IDS.indexOf(id);
}
function qualityIndex(id) {
	return QUALITY_TIERS.indexOf(id);
}
function materialIndexOf(v) {
	const i = Math.round(clamp01(v) * (BOUNDS.materialCount - 1));
	return Math.min(BOUNDS.materialCount - 1, Math.max(0, i));
}
function materialIndex(v) {
	return MATERIAL_SPECIMENS[materialIndexOf(v)];
}
function quantizeMaterial(v) {
	return materialIndexOf(v) / (BOUNDS.materialCount - 1);
}
function axisBucket(v) {
	if (v < .33) return 0;
	if (v < .66) return 1;
	return 2;
}
function axisLabel(v) {
	return AXIS_LABELS[axisBucket(v)];
}
function quantizeAxis(v) {
	return AXIS_VALUES[axisBucket(v)];
}
function constrainMacro(id, value) {
	if (id === "optical") return OPTICAL_LOCKED;
	if (id === "axis") return quantizeAxis(value);
	if (id === "material") return quantizeMaterial(value);
	return quantize(value);
}
function copyMacros(m) {
	return { ...m };
}
function particleBudget(quality, atmosphere) {
	if (quality === "SAFE") return 0;
	const max = BOUNDS.particle[quality];
	const base = BOUNDS.particleBase[quality];
	const n = Math.round(base + clamp01(atmosphere) * (max - base));
	return Math.min(max, Math.max(0, n));
}
function layerBudget(quality) {
	return BOUNDS.layers[quality];
}
function assign(applied, quality, pattern) {
	const matI = materialIndexOf(applied.material);
	const bucket = axisBucket(applied.axis);
	const energy = clamp01(applied.intensity);
	const fog = .18 + clamp01(applied.depth) * .55;
	const focus = clamp01(applied.focus);
	const haze = clamp01(applied.atmosphere);
	const duration = .2 + clamp01(applied.narrative) * 1.2;
	const fields = {
		emissive: energy,
		density: fog,
		particle: particleBudget(quality, haze),
		vignette: 1 - focus,
		recipe: matI,
		"geometry-mix": bucket
	};
	const assignments = PROPERTY_IDS.map((pid) => {
		const def = PROPERTY_DEFS[pid];
		let value = clamp01(applied[def.from]);
		if (pid === "specimen") value = matI;
		else if (pid === "language") value = bucket;
		else if (pid === "beam") value = OPTICAL_LOCKED;
		else if (pid === "duration") value = duration;
		else if (pid === "energy") value = energy;
		else if (pid === "recession") value = fog;
		else if (pid === "haze") value = haze;
		else if (pid === "attention") value = focus;
		return {
			propertyIndex: def.index,
			propertyId: pid,
			value,
			unit: def.unit,
			from: def.from,
			fieldIndex: FIELD_DEFS[def.field].index,
			fieldId: def.field,
			attr: def.attr
		};
	});
	return {
		pattern,
		patternIndex: patternIndex(pattern),
		quality,
		qualityIndex: qualityIndex(quality),
		materialIndex: matI,
		materialId: MATERIAL_SPECIMENS[matI].id,
		colors: MATERIAL_COLORS[matI] ?? MATERIAL_COLORS[2],
		vertexCount: PATTERN_VERTEX_COUNT[pattern],
		particleCount: fields.particle,
		layers: layerBudget(quality),
		playheadRate: .28 + clamp01(applied.narrative) * .5,
		energy,
		fog,
		focus,
		haze,
		axis: applied.axis,
		axisBucket: bucket,
		optical: OPTICAL_LOCKED,
		assignments,
		fields
	};
}
function assertCatalogs() {
	if (MACRO_IDS.length !== BOUNDS.macroCount) throw new Error("macro catalog size");
	if (PATTERN_IDS.length !== BOUNDS.patternCount) throw new Error("pattern catalog size");
	if (MATERIAL_SPECIMENS.length !== BOUNDS.materialCount) throw new Error("material catalog size");
	if (PROPERTY_IDS.length !== BOUNDS.propertyCount) throw new Error("property catalog size");
	if (FIELD_IDS.length !== BOUNDS.fieldCount) throw new Error("field catalog size");
	for (const p of PATTERN_IDS) if (PATTERN_VERTEX_COUNT[p] > BOUNDS.vertexMax) throw new Error(`pattern ${p} exceeds vertexMax`);
}
assertCatalogs();
var MACRO_DEFS = {
	intensity: {
		id: "intensity",
		name: "Intensity",
		meaning: "Master-safe perceived energy. Maps to property energy → field emissive → vertex stroke-alpha.",
		stageAccess: true,
		locked: false,
		audioTarget: "Gain, squared and clamped under 0.35.",
		visualTarget: "Emissive strength, motion amplitude, contrast.",
		mappingRule: "i0 intensity → energy (weight 0–1) → emissive. Visual leads audio.",
		fallback: "Reduce visual energy before touching audio.",
		smoothingSec: .14,
		quantized: false
	},
	depth: {
		id: "depth",
		name: "Depth",
		meaning: "How far the field recedes. Maps to recession → density → radius-scale.",
		stageAccess: true,
		locked: false,
		audioTarget: "Filter cutoff 180–2380 Hz.",
		visualTarget: "Parallax, fog, layer radius.",
		mappingRule: "i1 depth → recession (weight) → density. Smooth, never snaps.",
		fallback: "Hold previous visual state.",
		smoothingSec: .46,
		quantized: false
	},
	atmosphere: {
		id: "atmosphere",
		name: "Atmosphere",
		meaning: "Haze. Maps to haze → particle count. Quality cap is the first brake.",
		stageAccess: true,
		locked: false,
		audioTarget: "Noise bed density.",
		visualTarget: "Particle budget, haze.",
		mappingRule: "i2 atmosphere → haze → particle. SAFE is identically 0 particles.",
		fallback: "Disable secondary particles first.",
		smoothingSec: .32,
		quantized: false
	},
	focus: {
		id: "focus",
		name: "Focus",
		meaning: "Centre-biased attention. Maps to attention → vignette (inverse) → core-weight.",
		stageAccess: true,
		locked: false,
		audioTarget: "Peaking at 1.1 kHz. No pan.",
		visualTarget: "Core sharpness, vignette.",
		mappingRule: "i3 focus → attention → vignette. Centre-biased. No pan mapping.",
		fallback: "Preserve current view.",
		smoothingSec: .2,
		quantized: false
	},
	material: {
		id: "material",
		name: "Material",
		meaning: "Discrete index 0–11 into the shader-grammar specimen catalog.",
		stageAccess: false,
		locked: false,
		audioTarget: "Harmonic colour amount.",
		visualTarget: "Palette index, recipe field.",
		mappingRule: "i4 material → specimen (index 0–11) → recipe. Quantized, not a hue slider.",
		fallback: "Return to nacre (index 2).",
		smoothingSec: .4,
		quantized: true
	},
	axis: {
		id: "axis",
		name: "Sacred ⇔ Industrial",
		meaning: "Geometry language. Three buckets, never a continuous morph.",
		stageAccess: false,
		locked: false,
		audioTarget: "Oscillator type and harmonic mix.",
		visualTarget: "Geometry-mix field.",
		mappingRule: "i5 axis → language {0,1,2} → geometry-mix. Snap to 0.12 / 0.50 / 0.88.",
		fallback: "Hold last valid bucket.",
		smoothingSec: .08,
		quantized: true
	},
	optical: {
		id: "optical",
		name: "Optical",
		meaning: "Locked property beam = 0.35. Simulation only.",
		stageAccess: false,
		locked: true,
		audioTarget: "None.",
		visualTarget: "Simulated beam. No physical adapter.",
		mappingRule: "i6 optical → beam (locked 0.35) → beam-alpha. Writes rejected.",
		fallback: "Always remain simulation-only.",
		smoothingSec: 0,
		quantized: true
	},
	narrative: {
		id: "narrative",
		name: "Narrative Weight",
		meaning: "Playhead walk rate. Maps to duration (0.2–1.4 s) → playhead-rate.",
		stageAccess: false,
		locked: false,
		audioTarget: "Atmosphere mix emphasis.",
		visualTarget: "Playhead speed, coil emphasis.",
		mappingRule: "i7 narrative → duration (s) → playhead-rate.",
		fallback: "Defer to manifest default 0.40.",
		smoothingSec: .72,
		quantized: false
	}
};
var GAIN_CEILING = BOUNDS.gainCeiling;
function makeNoise(ctx) {
	const length = ctx.sampleRate * 2;
	const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
	for (let c = 0; c < 2; c += 1) {
		const data = buffer.getChannelData(c);
		let last = 0;
		for (let i = 0; i < length; i += 1) {
			const white = Math.random() * 2 - 1;
			last = last * .97 + white * .03;
			data[i] = last * 1.8;
		}
	}
	return buffer;
}
var SceneAudio = class {
	ctx = null;
	master = null;
	safety = null;
	analyser = null;
	drone = null;
	harmonic = null;
	noiseSrc = null;
	droneFilter = null;
	harmFilter = null;
	atmFilter = null;
	droneGain = null;
	harmGain = null;
	atmGain = null;
	cueGain = null;
	peak = null;
	freq = /* @__PURE__ */ new Uint8Array(1024);
	time = /* @__PURE__ */ new Uint8Array(2048);
	lastRms = 0;
	muted = false;
	status = "locked";
	sourceLabel = "none — waiting for an intentional gesture";
	async activate() {
		try {
			if (!this.ctx) {
				const Ctor = window.AudioContext || window.webkitAudioContext;
				this.ctx = new Ctor({ latencyHint: "interactive" });
				this.buildGraph(this.ctx);
			}
			if (this.ctx.state === "suspended") await this.ctx.resume();
			this.status = this.ctx.state === "running" ? "running" : "suspended";
			this.sourceLabel = "scene tone + atmosphere (generated, no microphone)";
			return this.status;
		} catch {
			this.status = "unavailable";
			this.sourceLabel = "Web Audio unavailable in this browser";
			return this.status;
		}
	}
	buildGraph(ctx) {
		const master = ctx.createGain();
		master.gain.value = 1e-4;
		const safety = ctx.createDynamicsCompressor();
		safety.threshold.value = -18;
		safety.knee.value = 18;
		safety.ratio.value = 8;
		safety.attack.value = .004;
		safety.release.value = .18;
		const analyser = ctx.createAnalyser();
		analyser.fftSize = BOUNDS.analyserFft;
		analyser.smoothingTimeConstant = .72;
		this.freq = new Uint8Array(analyser.frequencyBinCount);
		this.time = new Uint8Array(analyser.fftSize);
		const droneFilter = ctx.createBiquadFilter();
		droneFilter.type = "lowpass";
		droneFilter.frequency.value = 640;
		droneFilter.Q.value = .7;
		const harmFilter = ctx.createBiquadFilter();
		harmFilter.type = "lowpass";
		harmFilter.frequency.value = 1400;
		const atmFilter = ctx.createBiquadFilter();
		atmFilter.type = "bandpass";
		atmFilter.frequency.value = 480;
		atmFilter.Q.value = .6;
		const peak = ctx.createBiquadFilter();
		peak.type = "peaking";
		peak.frequency.value = 1100;
		peak.Q.value = 1.1;
		peak.gain.value = 0;
		const droneGain = ctx.createGain();
		const harmGain = ctx.createGain();
		const atmGain = ctx.createGain();
		const cueGain = ctx.createGain();
		droneGain.gain.value = 1e-4;
		harmGain.gain.value = 1e-4;
		atmGain.gain.value = 1e-4;
		cueGain.gain.value = .18;
		const drone = ctx.createOscillator();
		drone.type = "sine";
		drone.frequency.value = 55;
		const harmonic = ctx.createOscillator();
		harmonic.type = "triangle";
		harmonic.frequency.value = 82.5;
		const noiseSrc = ctx.createBufferSource();
		noiseSrc.buffer = makeNoise(ctx);
		noiseSrc.loop = true;
		drone.connect(droneFilter).connect(droneGain).connect(peak);
		harmonic.connect(harmFilter).connect(harmGain).connect(peak);
		noiseSrc.connect(atmFilter).connect(atmGain).connect(peak);
		cueGain.connect(safety);
		peak.connect(safety);
		safety.connect(master);
		master.connect(ctx.destination);
		safety.connect(analyser);
		drone.start();
		harmonic.start();
		noiseSrc.start();
		this.master = master;
		this.safety = safety;
		this.analyser = analyser;
		this.drone = drone;
		this.harmonic = harmonic;
		this.noiseSrc = noiseSrc;
		this.droneFilter = droneFilter;
		this.harmFilter = harmFilter;
		this.atmFilter = atmFilter;
		this.droneGain = droneGain;
		this.harmGain = harmGain;
		this.atmGain = atmGain;
		this.cueGain = cueGain;
		this.peak = peak;
		ctx.addEventListener("statechange", () => {
			if (!this.ctx) return;
			if (this.ctx.state === "running") this.status = "running";
			else if (this.ctx.state === "suspended") this.status = "suspended";
		});
	}
	apply(applied) {
		if (!this.ctx || this.status === "locked" || this.status === "unavailable") return;
		const t = this.ctx.currentTime;
		const tau = .08;
		const intensity = clamp01(applied.intensity);
		const depth = clamp01(applied.depth);
		const atmosphere = clamp01(applied.atmosphere);
		const focus = clamp01(applied.focus);
		const material = clamp01(applied.material);
		const axis = clamp01(applied.axis);
		const narrative = clamp01(applied.narrative);
		applied.optical;
		const visualLed = Math.min(GAIN_CEILING, intensity * intensity * .55);
		const master = this.muted ? 1e-4 : Math.max(1e-4, visualLed);
		this.master?.gain.setTargetAtTime(master, t, tau);
		const cutoff = 180 + depth * 2200;
		this.droneFilter?.frequency.setTargetAtTime(cutoff, t, .12);
		this.harmFilter?.frequency.setTargetAtTime(400 + depth * 2800, t, .12);
		const atm = this.muted ? 1e-4 : .01 + atmosphere * .08 * (.4 + narrative);
		this.atmGain?.gain.setTargetAtTime(atm, t, .14);
		this.atmFilter?.frequency.setTargetAtTime(220 + atmosphere * 900, t, .14);
		const sacred = 1 - axis;
		this.droneGain?.gain.setTargetAtTime(.08 + intensity * .16 * sacred, t, tau);
		this.harmGain?.gain.setTargetAtTime(.02 + intensity * .12 * (.25 + axis * .75) * (.4 + material), t, tau);
		if (this.harmonic) {
			this.harmonic.frequency.setTargetAtTime(axis > .5 ? 98 : 82.5, t, .2);
			this.harmonic.type = axis > .66 ? "sawtooth" : "triangle";
		}
		if (this.drone) this.drone.frequency.setTargetAtTime(48 + (1 - axis) * 14, t, .2);
		this.peak?.gain.setTargetAtTime((focus - .5) * 8, t, .1);
	}
	sample() {
		const empty = {
			rms: 0,
			low: 0,
			mid: 0,
			high: 0,
			onset: 0,
			tAudio: this.ctx?.currentTime ?? 0
		};
		if (!this.analyser || this.status !== "running") return empty;
		this.analyser.getByteTimeDomainData(this.time);
		this.analyser.getByteFrequencyData(this.freq);
		let sum = 0;
		for (let i = 0; i < this.time.length; i += 1) {
			const v = (this.time[i] - 128) / 128;
			sum += v * v;
		}
		const rms = Math.sqrt(sum / this.time.length);
		const n = this.freq.length;
		const band = (a, b) => {
			let s = 0;
			const start = Math.floor(a * n);
			const end = Math.max(start + 1, Math.floor(b * n));
			for (let i = start; i < end; i += 1) s += this.freq[i];
			return s / (end - start) / 255;
		};
		const low = band(0, .08);
		const mid = band(.08, .28);
		const high = band(.28, .7);
		const onset = rms > this.lastRms + .045 ? 1 : Math.max(0, (this.lastRms - rms) * .2);
		this.lastRms = this.lastRms * .82 + rms * .18;
		return {
			rms,
			low,
			mid,
			high,
			onset,
			tAudio: this.ctx?.currentTime ?? 0
		};
	}
	setMuted(muted) {
		this.muted = muted;
		if (!this.ctx || !this.master) return;
		this.master.gain.setTargetAtTime(muted ? 1e-4 : .12, this.ctx.currentTime, .04);
	}
	cue(kind) {
		if (!this.ctx || !this.cueGain || this.muted || this.status !== "running") return;
		const t = this.ctx.currentTime;
		const osc = this.ctx.createOscillator();
		const g = this.ctx.createGain();
		const freqs = {
			activate: 528,
			stabilize: 196,
			export: 392,
			fallback: 164,
			trial: 660
		};
		osc.frequency.value = freqs[kind];
		osc.type = "sine";
		g.gain.setValueAtTime(1e-4, t);
		g.gain.exponentialRampToValueAtTime(.09, t + .012);
		g.gain.exponentialRampToValueAtTime(1e-4, t + .18);
		osc.connect(g).connect(this.cueGain);
		osc.start(t);
		osc.stop(t + .22);
		osc.onended = () => {
			try {
				osc.disconnect();
				g.disconnect();
			} catch {}
		};
	}
	currentTime() {
		return this.ctx?.currentTime ?? 0;
	}
};
var sceneAudio = new SceneAudio();
var soak = (seconds) => ({
	action: "soak",
	seconds
});
var HYPOTHESES = [
	{
		id: "h-visual-first",
		claim: "Raising Intensity increases visual emissive energy before the audio gain ceiling is touched.",
		prediction: "At Intensity 0.85, visual amplitude rises while master gain stays under the declared 0.35 ceiling.",
		curiosity: "Operators kept asking whether the loudness knob was 'the volume.' It is not.",
		method: "Set Intensity 0.42 → 0.85, soak 5 s, sample RMS and visual amplitude. Source: analyser + renderer particle/stroke scale. Window: 5 s rehearsal, not a 10-minute soak.",
		choreography: [
			{
				action: "set-macro",
				macro: "intensity",
				value: .85
			},
			soak(5),
			{
				action: "compare",
				metric: "rms",
				op: "lt",
				threshold: .55
			}
		],
		windowSec: 5,
		units: "RMS (0–1 analyser), visual scale (renderer), gain ceiling (declared)",
		status: "supported",
		confidence: .78,
		evidenceMaturity: "measured",
		knownLimitations: ["Analyser RMS is a visual-control signal, not a proof of subjective loudness.", "Compressed 5 s window, not the 10-minute HIGH soak."],
		sourceRefs: ["AURELITH Operating Blueprint §2.2 Intensity", "Web Audio AnalyserNode"],
		trials: [{
			id: "t-vf-1",
			at: Date.parse("2026-08-27T18:12:00Z"),
			hypothesisId: "h-visual-first",
			verdict: "supported",
			windowSec: 5,
			notes: "Visual stroke gain led by ~180 ms. Master gain stayed at 0.29 (ceiling 0.35).",
			samples: {
				rms: .31,
				visual: .82,
				gain: .29
			},
			method: "pointer sweep, HIGH, no MIDI"
		}],
		sideOf: "approved"
	},
	{
		id: "h-atmosphere-cap",
		claim: "Atmosphere density is quality-capped; SAFE disables secondary particles before it removes the core drone.",
		prediction: "Atmosphere 0.9 at HIGH will exceed a 25 ms p95 rehearsal budget and step down; SAFE will drop particles to 0 while the drone remains.",
		curiosity: "What fails first under load — the field, or the tone?",
		method: "Set Atmosphere 0.9, soak, read particle count and frame-time p95, then force SAFE.",
		choreography: [
			{
				action: "set-macro",
				macro: "atmosphere",
				value: .9
			},
			soak(4),
			{
				action: "compare",
				metric: "p95",
				op: "lt",
				threshold: 25
			},
			{
				action: "set-quality",
				quality: "SAFE"
			},
			soak(2),
			{
				action: "compare",
				metric: "particles",
				op: "lt",
				threshold: 1
			}
		],
		windowSec: 6,
		units: "ms frame time (rAF), particle count (renderer), audio state",
		status: "contradicted",
		confidence: .62,
		evidenceMaturity: "measured",
		knownLimitations: ["First trial assumed HIGH would hold. It did not on this reference path.", "p95 over 6 s is not the blueprint's 10-minute soak."],
		sourceRefs: ["Blueprint §6 Visual frame time", "Blueprint §2.2 Atmosphere fallback"],
		trials: [{
			id: "t-at-1",
			at: Date.parse("2026-08-28T11:04:00Z"),
			hypothesisId: "h-atmosphere-cap",
			verdict: "contradicted",
			windowSec: 6,
			notes: "HIGH p95 28.4 ms — prediction that HIGH holds was wrong. SAFE then dropped particles to 0; drone stayed. Hypothesis revised: cap exists, HIGH does not always hold.",
			samples: {
				p95: 28.4,
				particlesHigh: 180,
				particlesSafe: 0
			},
			method: "choreography runner, compressed rehearsal"
		}],
		sideOf: "approved"
	},
	{
		id: "h-depth-no-jump",
		claim: "Depth smoothing prevents a hard scene jump even under a fast 0→1 pointer stroke.",
		prediction: "Applied Depth will lag Target by ≥ 300 ms; fog distance will not teleport.",
		curiosity: "Can an operator slam the fader without the field popping?",
		method: "Instant target 0.1 → 0.9, sample applied vs target for 1 s.",
		choreography: [
			{
				action: "set-macro",
				macro: "depth",
				value: .1
			},
			soak(.6),
			{
				action: "set-macro",
				macro: "depth",
				value: .9
			},
			soak(1.2),
			{
				action: "compare",
				metric: "depthLagMs",
				op: "gt",
				threshold: 280
			}
		],
		windowSec: 2,
		units: "ms lag (applied vs target), fog units (renderer)",
		status: "supported",
		confidence: .84,
		evidenceMaturity: "measured",
		knownLimitations: ["Lag is interpolator policy, not a measured physical latency."],
		sourceRefs: ["Blueprint §2.2 Depth", "Blueprint §4.1 Runtime interpolator"],
		trials: [{
			id: "t-dp-1",
			at: Date.parse("2026-08-28T11:21:00Z"),
			hypothesisId: "h-depth-no-jump",
			verdict: "supported",
			windowSec: 2,
			notes: "Applied reached 0.63 at t=300 ms after the slam. No fog teleport observed.",
			samples: {
				lagMs: 340,
				appliedAt300: .63
			},
			method: "pointer slam"
		}],
		sideOf: "approved"
	},
	{
		id: "h-midi-required",
		claim: "Stage operation requires a MIDI controller.",
		prediction: "Without MIDI, Stage macros cannot change target state.",
		curiosity: "A venue asked if the surface is 'dead without the box.'",
		method: "Refuse MIDI. Drive Intensity from keyboard. Confirm target updates and ledger source=keyboard.",
		choreography: [{
			action: "set-macro",
			macro: "intensity",
			value: .7
		}, soak(1)],
		windowSec: 1,
		units: "ledger source label (categorical)",
		status: "rejected",
		confidence: .95,
		evidenceMaturity: "rejected",
		knownLimitations: ["Does not claim MIDI will work on every browser. Web MIDI is not Baseline."],
		sourceRefs: ["Blueprint §2.3 MIDI optional", "MDN Web MIDI API"],
		trials: [{
			id: "t-midi-1",
			at: Date.parse("2026-08-26T09:40:00Z"),
			hypothesisId: "h-midi-required",
			verdict: "contradicted",
			windowSec: 1,
			notes: "Keyboard path changed target. MIDI remains an adapter, never a requirement. Claim rejected.",
			samples: {
				keyboardEvents: 4,
				midiEvents: 0
			},
			method: "keyboard fallback"
		}],
		sideOf: "approved"
	},
	{
		id: "h-optical-physical",
		claim: "The Optical macro can drive a physical beam or laser path.",
		prediction: "None admitted. v1 forbids a physical output adapter.",
		curiosity: "Scope-creep test. What happens if we treat the beam as real?",
		method: "Inspect the macro contract. Confirm locked value 0.35, label Simulation, no output adapter.",
		choreography: [soak(.4)],
		windowSec: .4,
		units: "contract label (categorical)",
		status: "locked-simulation",
		confidence: 1,
		evidenceMaturity: "locked-simulation",
		knownLimitations: ["A green cue means the target was accepted by the bounded runtime. It does not certify a laser, haptic, or physical latency."],
		sourceRefs: ["Blueprint §2.2 Optical", "Blueprint §4.1 labels"],
		trials: [],
		sideOf: "approved"
	},
	{
		id: "h-axis-continuous",
		claim: "Sacred ⇔ Industrial can be swept continuously like Intensity.",
		prediction: "A slow 0→1 sweep morphs geometry without a jump.",
		curiosity: "The geometry language wanted to melt. Should it?",
		method: "Sweep axis while transport is conceptually 'open.' Watch for a quantized snap.",
		choreography: [{
			action: "set-macro",
			macro: "axis",
			value: .88
		}, soak(1.5)],
		windowSec: 1.5,
		units: "axis buckets (Sacred / Threshold / Industrial)",
		status: "contradicted",
		confidence: .8,
		evidenceMaturity: "measured",
		knownLimitations: ["Quantization is a product rule, not a measured perceptual threshold."],
		sourceRefs: ["Blueprint §2.2 Sacred ⇔ Industrial — quantized only at transport boundary"],
		trials: [{
			id: "t-ax-1",
			at: Date.parse("2026-08-29T16:02:00Z"),
			hypothesisId: "h-axis-continuous",
			verdict: "contradicted",
			windowSec: 1.5,
			notes: "Sweep snapped Sacred → Industrial. Continuous morph produced a geometry pop. Rule held; claim failed. Revised: change axis only at a rest, then confirm.",
			samples: {
				bucketsVisited: 2,
				pops: 1
			},
			method: "studio fader"
		}],
		sideOf: "approved"
	},
	{
		id: "h-process-scaffold",
		claim: "Showing Target / Applied / Measured improves an operator's ability to reconstruct what just happened versus an answer-first readout.",
		prediction: "After a trial, an operator can name the method, the window, and the limitation without reopening the hypothesis card.",
		curiosity: "Process-constituted intelligence argues output resemblance is not the activity that produced it.",
		method: "Run any trial. Hide the hypothesis. Ask: source, window, unit, limitation. Score reconstruction 0–4. This is a feasibility protocol, not a workplace instrument.",
		choreography: [{
			action: "set-macro",
			macro: "focus",
			value: .85
		}, soak(3)],
		windowSec: 3,
		units: "reconstruction score 0–4 (self-rated)",
		status: "untested",
		confidence: .2,
		evidenceMaturity: "candidate",
		knownLimitations: ["n=you. No rater blinding. Preprint supplies a frame, not a validated measure.", "A single pair is a feasibility result only."],
		sourceRefs: ["Richardson et al., Process-Constituted Intelligence (arXiv:2608.16213)", "BO-05 Human Process Integrity protocol"],
		trials: [],
		sideOf: "approved"
	},
	{
		id: "h-signal-thesis",
		claim: "A single directional signal (pulse → propagate → branch → breathe) can carry narrative weight without becoming a sci-fi HUD.",
		prediction: "Observers describe the motion as biological-adjacent, not interface chrome. Negative constraints hold: no baked text, no neon, no chrome biotech.",
		curiosity: "Nourish the Signal: every story begins as a signal.",
		method: "Watch the centre signal for 8 s at default macros. Record whether the motion stays one-directional.",
		choreography: [soak(6)],
		windowSec: 6,
		units: "qualitative pass/fail against negative constraints (observational)",
		status: "untested",
		confidence: .35,
		evidenceMaturity: "candidate",
		knownLimitations: ["Speculative campaign artifact. No health, diagnostic, efficacy, or treatment-outcome claim.", "Qualitative, not a counted metric."],
		sourceRefs: ["Nourish the Signal tokens v1", "Calcium application kit — evidence boundary"],
		trials: [],
		sideOf: "side"
	},
	{
		id: "h-vertex-bound",
		claim: "Each pattern is a closed vertex table; raising Intensity cannot grow the table past the declared count or vertexMax 96.",
		prediction: "At Intensity 1.0 on vesica, vertex count stays 64. Coil stays 96. No pattern exceeds 96.",
		curiosity: "Open drawing loops were hiding as 'detail.' What happens if we treat vertices as a catalog?",
		method: "Set Intensity 1.0, soak 2 s, read renderer vertex count against PATTERN_VERTEX_COUNT.",
		choreography: [
			{
				action: "set-macro",
				macro: "intensity",
				value: 1
			},
			soak(2),
			{
				action: "compare",
				metric: "vertices",
				op: "lt",
				threshold: 97
			}
		],
		windowSec: 2,
		units: "vertex count (renderer table), cap 96",
		status: "untested",
		confidence: .5,
		evidenceMaturity: "candidate",
		knownLimitations: ["Count is the declared table length, not a GPU occupancy measurement.", "Compressed 2 s window."],
		sourceRefs: ["AURELITH spec.ts BOUNDS.vertexMax", "vertices.ts PATTERN_TABLES"],
		trials: [],
		sideOf: "approved"
	}
];
var SIDE_RESEARCH = [
	{
		id: "sr-shader-grammar",
		title: "Shader Grammar v0.1",
		origin: "Closed optical-primitives catalog already in this runtime.",
		claim: "Named-effect flags are the wrong unit. Shared operators (thin-film, multilayer, microfacet) compose the material axis.",
		contributes: "Material macro maps 0–1 across twelve specimens. Studio-only until rehearsed.",
		limitation: "The preview is a simulation of interference, not a measured BRDF or spectral lab capture.",
		maturity: "source-backed",
		confidence: .7
	},
	{
		id: "sr-ritual-geometry",
		title: "Ritual Geometry families",
		origin: "Production package v1.0 — bloom, lattice, coil, gate, vesica.",
		claim: "One bounded scene can speak five geometry languages without becoming a general VJ deck.",
		contributes: "Pattern picker. Cut-path assets stay in the package; this runtime draws the live field.",
		limitation: "No G-code / kerf / bed export from this shell. Machine-tool path is a sibling, not a bus.",
		maturity: "reviewed",
		confidence: .66
	},
	{
		id: "sr-nourish",
		title: "Nourish the Signal",
		origin: "Speculative motion study — Calcium+Company application artifact.",
		claim: "Creative preserves meaning as a signal becomes story and movement. Emotion: curiosity → recognition → reassurance → possibility.",
		contributes: "The centre pulse, the mineral/carbon/cyan palette, the negative constraints.",
		limitation: "Not commissioned client work. No disease, diagnostic, efficacy, or treatment claim.",
		maturity: "candidate",
		confidence: .4
	},
	{
		id: "sr-observation",
		title: "Observation schema 1.1.0",
		origin: "Seed Loom / governed intake.",
		claim: "A claim is not knowledge until verifiedFacts, inference, limitations, and approvalState travel with it.",
		contributes: "Every trial writes an observation. Temporal fields never mutate base confidence.",
		limitation: "Daily intake creates candidate state only. Accepted knowledge needs a separate transition.",
		maturity: "source-backed",
		confidence: .72
	},
	{
		id: "sr-process",
		title: "Process vs output",
		origin: "Process-Constituted Intelligence preprint; BO-05 protocol.",
		claim: "Target / Applied / Measured / Simulation / Future are different labels. A green cue is not physical certification.",
		contributes: "The sync inspector and reconstruction self-test.",
		limitation: "Exploratory protocol. Not a commercial reasoning-integrity product.",
		maturity: "candidate",
		confidence: .38
	},
	{
		id: "sr-meld",
		title: "MELD disagreement ledger",
		origin: "MELD protocol for merging distributed memories (arXiv:2608.16357).",
		claim: "Failed trials stay visible. Contradiction is not deleted; it is recorded.",
		contributes: "The trial-and-error column. Rejected claims remain in the board.",
		limitation: "This shell does not implement the full merge protocol — only the disagreement habit.",
		maturity: "candidate",
		confidence: .45
	}
];
var SEED_OBSERVATIONS = [
	{
		id: "obs:aurelith-visual-first",
		capturedAt: Date.parse("2026-08-27T18:12:00Z"),
		claim: "Intensity is a visual-first energy macro; analyser RMS stayed below the safety-bus ceiling at 0.85.",
		verifiedFacts: ["Master gain measured 0.29 against a declared ceiling of 0.35.", "Stroke amplitude rose with the target within one interpolator time-constant."],
		inference: ["Operators can treat Intensity as 'how alive' without treating it as a volume knob."],
		significance: "Protects the audio contract while giving Stage a rehearsable fader.",
		confidence: .78,
		evidenceMaturity: "measured",
		knownLimitations: ["5 s rehearsal window. Analyser is not subjective loudness."],
		sourceRefs: ["h-visual-first", "t-vf-1"]
	},
	{
		id: "obs:aurelith-atmosphere-fail",
		capturedAt: Date.parse("2026-08-28T11:04:00Z"),
		claim: "The first Atmosphere HIGH prediction was wrong; quality step-down is the actual guardrail.",
		verifiedFacts: ["p95 frame time 28.4 ms at Atmosphere 0.9 HIGH during a 6 s window.", "SAFE dropped secondary particles to 0; drone continued."],
		inference: ["Do not promise HIGH at high Atmosphere. Promise the fallback order: particles, then materials, never audio."],
		significance: "A contradicted hypothesis is more useful here than a quiet pass.",
		confidence: .62,
		evidenceMaturity: "measured",
		knownLimitations: ["Not a 10-minute soak. Device/GPU path is this reference browser only."],
		sourceRefs: [
			"h-atmosphere-cap",
			"t-at-1",
			"Blueprint §6"
		]
	},
	{
		id: "obs:optical-not-physical",
		capturedAt: Date.parse("2026-08-26T12:00:00Z"),
		claim: "Optical is simulation-only in every v1 interface. No physical output adapter is present.",
		verifiedFacts: ["Macro locked at 0.35.", "No laser, haptic, or MIDI-out path in the runtime graph."],
		inference: ["Requests for physical beams are future options, labelled as such."],
		significance: "Stops a class of safety and scope failures before they start.",
		confidence: 1,
		evidenceMaturity: "locked-simulation",
		knownLimitations: ["A locked contract is not a lab measurement of a projector."],
		sourceRefs: ["h-optical-physical", "Blueprint §2.2"]
	}
];
var CHOREOGRAPHIES = [
	{
		id: "ch-cold-start",
		title: "Cold-start readiness",
		audience: "Technical lead",
		steps: "Load → inspect audio (locked) → activate on gesture → confirm running. Source: AudioContext.state. Unit: categorical."
	},
	{
		id: "ch-audio-unlock",
		title: "Audio unlock path",
		audience: "Operator",
		steps: "No auto-mic. Explicit Activate. If suspended after background, re-activate. Never silently retry output."
	},
	{
		id: "ch-quality-step",
		title: "Quality step-down",
		audience: "Technical lead",
		steps: "Raise Atmosphere. Watch p95. Confirm HIGH→MEDIUM→SAFE order. Audio path unchanged."
	},
	{
		id: "ch-stabilize",
		title: "Stabilize recovery",
		audience: "Stage operator",
		steps: "Intentional 'too much' → Stabilize → Intensity 0.35, Atmosphere 0.2, quality SAFE, optical untouched."
	},
	{
		id: "ch-manifest",
		title: "Manifest round-trip",
		audience: "Second operator",
		steps: "Export JSON → load in a clean session → four Stage macros, quality, warnings, fallback language match."
	},
	{
		id: "ch-fork-isolation",
		title: "Side-research fork isolation",
		audience: "Author",
		steps: "Fork a side instance. Mutate it. Confirm approved target is unchanged. Discard or promote explicitly."
	},
	{
		id: "ch-vertex-cap",
		title: "Vertex table cap",
		audience: "Technical lead",
		steps: "Switch patterns. Confirm HUD V count matches the catalog (vesica 64, bloom 16, coil 96, gate 24, lattice 49) and never exceeds 96."
	}
];
var STORAGE_KEY = "aurelith.scene.v1";
var hot = {
	applied: copyMacros(DEFAULT_MACROS),
	features: {
		rms: 0,
		low: 0,
		mid: 0,
		high: 0,
		onset: 0,
		tAudio: 0
	},
	fps: 0,
	frameMs: 0,
	p95: 0,
	particles: 0,
	vertices: 0,
	playhead: 0,
	tVisual: 0,
	frameTimes: []
};
function uid(prefix) {
	return `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`;
}
function now() {
	return Date.now();
}
var defaultMetrics = () => ({
	fps: 0,
	frameMs: 0,
	p95: 0,
	rms: 0,
	low: 0,
	mid: 0,
	high: 0,
	onset: 0,
	tAudio: 0,
	tVisual: 0,
	particles: 0,
	vertices: 0,
	playhead: 0,
	patternIndex: 4,
	materialIndex: 2,
	sampleWindowMs: 1e3,
	source: "not measured — renderer has not sampled yet"
});
var SEMANTIC_PATCHES = [
	{
		id: "quieter-deeper",
		label: "Quieter, deeper",
		note: "Simulation until a trial validates. Visual energy down, fog back.",
		apply: (t) => ({
			...t,
			intensity: constrainMacro("intensity", t.intensity - .16),
			depth: constrainMacro("depth", t.depth + .18)
		})
	},
	{
		id: "industrial-gate",
		label: "Industrial gate",
		note: "Axis quantized. Material toward molten-chrome (index 7). Studio-only.",
		apply: (t) => ({
			...t,
			axis: constrainMacro("axis", .88),
			material: constrainMacro("material", 7 / 11),
			focus: constrainMacro("focus", t.focus + .08)
		})
	},
	{
		id: "bloom-atmosphere",
		label: "Bloom atmosphere",
		note: "Haze up. Quality still caps the particle field.",
		apply: (t) => ({
			...t,
			atmosphere: constrainMacro("atmosphere", t.atmosphere + .2),
			axis: constrainMacro("axis", .12),
			material: constrainMacro("material", 2 / 11)
		})
	},
	{
		id: "rehearsal-safe",
		label: "Rehearsal-safe",
		note: "Same destination as Stabilize. Not a panic until you confirm.",
		apply: (t) => ({
			...t,
			intensity: constrainMacro("intensity", .35),
			atmosphere: constrainMacro("atmosphere", .2),
			focus: constrainMacro("focus", .5)
		})
	}
];
function liveTarget(s) {
	return s.fork ? s.fork.target : s.target;
}
var useAurelith = create((set, get) => ({
	mode: "studio",
	revision: 1,
	sceneName: "Subsurface Field — Vesica",
	pattern: "vesica",
	quality: "HIGH",
	autoQuality: true,
	target: copyMacros(DEFAULT_MACROS),
	appliedSnapshot: copyMacros(DEFAULT_MACROS),
	selectedMacro: "intensity",
	audioStatus: "locked",
	muted: false,
	sourceLabel: sceneAudio.sourceLabel,
	midi: {
		status: "idle",
		ports: [],
		learnMacro: null,
		map: {}
	},
	fallback: null,
	dirty: false,
	undoStack: [],
	ledger: [{
		id: "led-boot",
		t: 17565984e5,
		kind: "intent",
		source: "system",
		message: "Kernel ready. Catalogs closed. Optical locked at 0.35. Audio locked until a gesture."
	}],
	hypotheses: HYPOTHESES.map((h) => ({
		...h,
		trials: [...h.trials]
	})),
	sideResearch: SIDE_RESEARCH,
	observations: SEED_OBSERVATIONS,
	activeTrialId: null,
	trialNote: "",
	fork: null,
	metrics: defaultMetrics(),
	reconstructionOpen: false,
	reconstructionScore: null,
	setMode: (mode) => {
		set({ mode });
		get().log("intent", "pointer", `Mode → ${mode}`);
	},
	setPattern: (pattern) => {
		if (!PATTERN_IDS.includes(pattern)) return;
		const fork = get().fork;
		if (fork) {
			set({
				fork: {
					...fork,
					pattern
				},
				dirty: true
			});
			get().log("fork", "pointer", `Side research pattern → ${pattern} (P${patternIndex(pattern)})`);
			return;
		}
		set({
			pattern,
			dirty: true
		});
		get().log("target", "pointer", `Pattern → ${pattern} · P${patternIndex(pattern)} · V${PATTERN_VERTEX_COUNT[pattern]}/${BOUNDS.vertexMax}`);
	},
	setQuality: (quality, source = "pointer") => {
		if (!QUALITY_TIERS.includes(quality)) return;
		set({
			quality,
			autoQuality: false
		});
		get().log("quality", source, `Quality tier → ${quality}`, { quality });
	},
	setMacro: (id, value, source) => {
		const def = MACRO_DEFS[id];
		if (def.locked) {
			get().log("warning", source, "Optical is locked at simulation-only. Write rejected.");
			return;
		}
		const { mode, fork } = get();
		if (mode === "stage" && !def.stageAccess) {
			get().log("warning", source, `${def.name} is studio-only. Stage exposes Intensity, Depth, Atmosphere, Focus.`);
			return;
		}
		const next = constrainMacro(id, value);
		const applyTo = (map) => ({
			...map,
			[id]: next,
			optical: OPTICAL_LOCKED
		});
		if (fork) {
			set({ fork: {
				...fork,
				target: applyTo(fork.target)
			} });
			get().log("fork", source, `Fork ${def.name} → ${next.toFixed(3)}`);
			return;
		}
		const prev = get().target;
		if (Math.abs(prev[id] - next) < BOUNDS.quantum) return;
		const undoStack = [...get().undoStack, copyMacros(prev)].slice(-BOUNDS.undoMax);
		set({
			target: applyTo(prev),
			undoStack,
			dirty: true,
			fallback: null
		});
		get().log("target", source, `${def.name} target → ${next.toFixed(3)}`, {
			macro: id,
			value: next
		});
	},
	selectMacro: (id) => set({ selectedMacro: id }),
	nudge: (delta, source) => {
		const id = get().selectedMacro;
		const cur = liveTarget(get())[id];
		get().setMacro(id, cur + delta, source);
	},
	activateAudio: async () => {
		const status = await sceneAudio.activate();
		set({
			audioStatus: status,
			sourceLabel: sceneAudio.sourceLabel
		});
		if (status === "running") {
			sceneAudio.cue("activate");
			get().log("audio", "pointer", "Audio context running. Scene tone + atmosphere. No microphone.");
		} else get().log("warning", "system", `Audio ${status}. ${sceneAudio.sourceLabel}`);
	},
	setMuted: (muted) => {
		sceneAudio.setMuted(muted);
		set({ muted });
		get().log("audio", "pointer", muted ? "Master muted" : "Master unmuted");
	},
	stabilize: (source = "pointer") => {
		set({
			target: {
				...get().target,
				intensity: constrainMacro("intensity", .35),
				atmosphere: constrainMacro("atmosphere", .2),
				focus: constrainMacro("focus", .5),
				optical: OPTICAL_LOCKED
			},
			quality: "SAFE",
			fallback: "Stabilize — visual energy reduced first; audio path unchanged; optical still simulation-only.",
			undoStack: [...get().undoStack, copyMacros(get().target)].slice(-BOUNDS.undoMax),
			dirty: true
		});
		sceneAudio.cue("stabilize");
		get().log("recovery", source, "Stabilize applied. SAFE tier. Intensity 0.35 / Atmosphere 0.20.");
	},
	undo: () => {
		const stack = [...get().undoStack];
		const prev = stack.pop();
		if (!prev) return;
		const restored = copyMacros(prev);
		restored.optical = OPTICAL_LOCKED;
		restored.axis = constrainMacro("axis", restored.axis);
		restored.material = constrainMacro("material", restored.material);
		set({
			target: restored,
			undoStack: stack,
			dirty: true
		});
		get().log("target", "pointer", "Undo last target change");
	},
	applyPatch: (id) => {
		const patch = SEMANTIC_PATCHES.find((p) => p.id === id);
		if (!patch) return;
		const next = {
			...patch.apply(get().target),
			optical: OPTICAL_LOCKED
		};
		next.axis = constrainMacro("axis", next.axis);
		next.material = constrainMacro("material", next.material);
		set({
			target: next,
			undoStack: [...get().undoStack, copyMacros(get().target)].slice(-BOUNDS.undoMax),
			dirty: true
		});
		get().log("target", "patch", `Patch “${patch.label}” proposed. Confidence: simulation until a trial validates.`);
	},
	connectMidi: async () => {
		const nav = navigator;
		if (!nav.requestMIDIAccess) {
			set({ midi: {
				...get().midi,
				status: "unsupported",
				ports: []
			} });
			get().log("midi", "pointer", "Web MIDI unsupported in this browser. Keyboard and pointer remain first-class.");
			return;
		}
		try {
			const access = await nav.requestMIDIAccess({ sysex: false });
			const readPorts = () => {
				const ports = [];
				access.inputs.forEach((p) => {
					ports.push({
						id: p.id,
						name: p.name ?? "unnamed",
						manufacturer: p.manufacturer ?? "unknown",
						state: p.state,
						type: p.type
					});
				});
				return ports;
			};
			const bind = () => {
				access.inputs.forEach((p) => {
					p.onmidimessage = (e) => {
						const data = e.data;
						if (!data || data.length < 3) return;
						const status = data[0];
						const d1 = data[1];
						const d2 = data[2];
						const cmd = status & 240;
						const learn = get().midi.learnMacro;
						if (cmd === 176) {
							const key = `cc:${d1}`;
							if (learn) {
								set({ midi: {
									...get().midi,
									map: {
										...get().midi.map,
										[key]: learn
									},
									learnMacro: null
								} });
								get().log("midi", "midi", `Learned ${learn} ← ${key}`);
								return;
							}
							const mapped = get().midi.map[key];
							if (mapped) get().setMacro(mapped, d2 / BOUNDS.midiCcMax, "midi");
						}
						if (cmd === 144 && d2 > 0) get().log("midi", "midi", `Note ${d1} recorded as cue/preset only. No physical output path.`);
					};
				});
			};
			bind();
			access.onstatechange = () => {
				const ports = readPorts();
				const connected = ports.some((p) => p.state === "connected");
				set({ midi: {
					...get().midi,
					ports,
					status: connected ? "connected" : "unavailable"
				} });
				if (!connected) get().log("warning", "midi", "MIDI disconnected. Last target state frozen. Runtime remains stable.");
			};
			const ports = readPorts();
			set({ midi: {
				...get().midi,
				status: ports.length ? "connected" : "unavailable",
				ports
			} });
			get().log("midi", "pointer", ports.length ? `MIDI connected (${ports.length} input${ports.length === 1 ? "" : "s"})` : "MIDI permission granted; no input ports yet.");
		} catch {
			set({ midi: {
				...get().midi,
				status: "denied",
				ports: []
			} });
			get().log("midi", "pointer", "MIDI permission denied. Keyboard and pointer remain first-class.");
		}
	},
	toggleLearn: (id) => set({ midi: {
		...get().midi,
		learnMacro: id
	} }),
	runHypothesis: async (id) => {
		const hyp = get().hypotheses.find((h) => h.id === id);
		if (!hyp || get().activeTrialId) return;
		if (get().audioStatus !== "running") await get().activateAudio();
		const trialId = uid("trial");
		set({
			activeTrialId: trialId,
			trialNote: `Running “${hyp.claim.slice(0, 72)}…”`,
			hypotheses: get().hypotheses.map((h) => h.id === id ? {
				...h,
				status: "running"
			} : h)
		});
		get().log("trial", "trial", `Trial started: ${hyp.id}`);
		sceneAudio.cue("trial");
		const snapshot = copyMacros(get().target);
		const samples = {};
		const steps = hyp.choreography.slice(0, BOUNDS.trialStepsMax);
		try {
			for (const step of steps) {
				if (get().activeTrialId !== trialId) throw new Error("aborted");
				if (step.action === "set-macro") get().setMacro(step.macro, step.value, "trial");
				if (step.action === "set-quality") get().setQuality(step.quality, "trial");
				if (step.action === "stabilize") get().stabilize("trial");
				if (step.action === "soak") {
					await wait(Math.min(step.seconds, BOUNDS.soakMaxSec) * 1e3);
					samples.rms = hot.features.rms;
					samples.p95 = hot.p95;
					samples.particles = hot.particles;
					samples.fps = hot.fps;
					samples.vertices = hot.vertices;
					samples.playhead = hot.playhead;
					samples.depthApplied = hot.applied.depth;
					samples.intensityApplied = hot.applied.intensity;
				}
				if (step.action === "compare") {
					const value = step.metric === "rms" ? hot.features.rms : step.metric === "p95" ? hot.p95 : step.metric === "particles" ? hot.particles : step.metric === "vertices" ? hot.vertices : step.metric === "depthLagMs" ? Math.abs(get().target.depth - hot.applied.depth) * 1e3 : 0;
					samples[step.metric] = value;
				}
			}
			const verdict = judge(hyp.id, samples);
			const trial = {
				id: trialId,
				at: now(),
				hypothesisId: id,
				verdict,
				windowSec: Math.min(hyp.windowSec, BOUNDS.soakMaxSec),
				notes: noteFor(hyp.id, verdict, samples),
				samples,
				method: "in-runtime choreography (compressed rehearsal, step-capped)"
			};
			const nextStatus = verdict === "supported" ? "supported" : verdict === "contradicted" ? "contradicted" : "mixed";
			set({
				hypotheses: get().hypotheses.map((h) => h.id === id ? {
					...h,
					status: nextStatus,
					confidence: constrainMacro("intensity", h.confidence + (verdict === "supported" ? .04 : -.03)),
					trials: [trial, ...h.trials].slice(0, 8),
					evidenceMaturity: "measured"
				} : h),
				observations: [{
					id: `obs:${id}-${trialId.slice(-6)}`,
					capturedAt: now(),
					claim: hyp.claim,
					verifiedFacts: Object.entries(samples).map(([k, v]) => `${k}=${typeof v === "number" ? v.toFixed(3) : v}`),
					inference: [trial.notes],
					significance: "Compressed rehearsal — labelled, not a 10-minute soak.",
					confidence: hyp.confidence,
					evidenceMaturity: "measured",
					knownLimitations: hyp.knownLimitations,
					sourceRefs: [hyp.id, trial.id]
				}, ...get().observations].slice(0, BOUNDS.observationsMax),
				activeTrialId: null,
				trialNote: trial.notes,
				target: {
					...snapshot,
					optical: OPTICAL_LOCKED
				}
			});
			get().log("trial", "trial", `Trial ${verdict}: ${hyp.id}`);
		} catch {
			set({
				activeTrialId: null,
				trialNote: "Trial aborted. Approved target restored.",
				hypotheses: get().hypotheses.map((h) => h.id === id ? {
					...h,
					status: hyp.status === "running" ? "untested" : hyp.status
				} : h),
				target: {
					...snapshot,
					optical: OPTICAL_LOCKED
				}
			});
			get().log("trial", "trial", `Trial aborted: ${hyp.id}`);
		}
	},
	abortTrial: () => set({
		activeTrialId: null,
		trialNote: "Trial aborted by operator."
	}),
	forkSide: (researchId) => {
		const sr = get().sideResearch.find((s) => s.id === researchId);
		if (!sr) return;
		set({
			fork: {
				id: uid("fork"),
				label: sr.title,
				researchId,
				target: copyMacros(get().target),
				pattern: get().pattern
			},
			mode: "studio"
		});
		get().log("fork", "pointer", `Side research fork: ${sr.title}. Approved scene frozen until promote or discard.`);
	},
	discardFork: () => {
		set({ fork: null });
		get().log("fork", "pointer", "Side research discarded. Approved target untouched.");
	},
	promoteFork: () => {
		const fork = get().fork;
		if (!fork) return;
		const undoStack = [...get().undoStack, copyMacros(get().target)].slice(-BOUNDS.undoMax);
		set({
			target: {
				...fork.target,
				optical: OPTICAL_LOCKED
			},
			pattern: fork.pattern,
			fork: null,
			revision: get().revision + 1,
			undoStack,
			dirty: true
		});
		get().log("fork", "pointer", `Promoted side research “${fork.label}” into approved scene. Revision ${get().revision}.`);
	},
	exportManifest: () => {
		const s = get();
		const macros = copyMacros(s.target);
		macros.optical = OPTICAL_LOCKED;
		macros.axis = constrainMacro("axis", macros.axis);
		macros.material = constrainMacro("material", macros.material);
		const frame = assign(macros, s.quality, s.pattern);
		const manifest = {
			schema: "aurelith.scene.v1",
			scene: s.sceneName,
			revision: s.dirty ? s.revision + 1 : s.revision,
			exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
			pattern: s.pattern,
			quality: s.quality,
			macros,
			indices: {
				pattern: frame.patternIndex,
				material: frame.materialIndex,
				quality: frame.qualityIndex
			},
			assignments: frame.assignments,
			bounds: {
				vertexCount: frame.vertexCount,
				vertexMax: BOUNDS.vertexMax,
				particleBudget: frame.particleCount,
				layerBudget: frame.layers
			},
			midiMap: { ...s.midi.map },
			warnings: buildWarnings(s),
			fallback: s.fallback ?? "Stabilize: visual energy first, audio path unchanged, optical simulation-only.",
			optical: "simulation-only",
			notes: "Second operator: load, inspect indices / assignments / Target / Applied / Measured. Optical is locked."
		};
		set({
			revision: manifest.revision,
			dirty: false
		});
		persist(manifest);
		sceneAudio.cue("export");
		get().log("export", "pointer", `Exported ${manifest.scene} rev ${manifest.revision}`);
		return manifest;
	},
	importManifest: (raw) => {
		try {
			const m = JSON.parse(raw);
			if (m.schema !== "aurelith.scene.v1") return {
				ok: false,
				error: "Unknown schema. Expected aurelith.scene.v1."
			};
			const pattern = PATTERN_IDS.includes(m.pattern) ? m.pattern : "vesica";
			const quality = QUALITY_TIERS.includes(m.quality) ? m.quality : "HIGH";
			const macros = copyMacros(DEFAULT_MACROS);
			for (const id of MACRO_IDS) if (typeof m.macros?.[id] === "number") macros[id] = constrainMacro(id, m.macros[id]);
			macros.optical = OPTICAL_LOCKED;
			set({
				sceneName: typeof m.scene === "string" && m.scene ? m.scene : get().sceneName,
				revision: typeof m.revision === "number" ? m.revision : 1,
				pattern,
				quality,
				target: macros,
				midi: {
					...get().midi,
					map: m.midiMap && typeof m.midiMap === "object" ? m.midiMap : {}
				},
				fallback: m.fallback ?? null,
				dirty: false
			});
			persist(m);
			get().log("export", "pointer", `Loaded ${m.scene} rev ${m.revision}. Optical forced simulation-only. Pattern P${patternIndex(pattern)}.`);
			return { ok: true };
		} catch {
			return {
				ok: false,
				error: "Manifest is not valid JSON."
			};
		}
	},
	pushMetrics: (partial) => {
		set({
			metrics: {
				...get().metrics,
				...partial
			},
			appliedSnapshot: copyMacros(hot.applied),
			audioStatus: sceneAudio.status
		});
		if (get().autoQuality && partial.p95 && partial.p95 > BOUNDS.p95.HIGH && get().quality === "HIGH") {
			set({ quality: "MEDIUM" });
			get().log("quality", "system", `Auto step-down HIGH → MEDIUM (p95 > ${BOUNDS.p95.HIGH} ms). Audio path unchanged.`);
		} else if (get().autoQuality && partial.p95 && partial.p95 > BOUNDS.p95.MEDIUM && get().quality === "MEDIUM") {
			set({ quality: "SAFE" });
			get().log("quality", "system", "Auto step-down MEDIUM → SAFE. Particle field set to 0.");
		}
	},
	log: (kind, source, message, data) => {
		set({ ledger: [{
			id: uid("led"),
			t: now(),
			kind,
			source,
			message,
			data
		}, ...get().ledger].slice(0, BOUNDS.ledgerMax) });
	},
	setReconstruction: (open, score = null) => set({
		reconstructionOpen: open,
		reconstructionScore: score ?? get().reconstructionScore
	})
}));
function wait(ms) {
	return new Promise((r) => window.setTimeout(r, ms));
}
function judge(id, samples) {
	if (id === "h-visual-first") return samples.rms < .55 ? "supported" : "contradicted";
	if (id === "h-atmosphere-cap") {
		if (samples.p95 > 25 && samples.particles === 0) return "mixed";
		if (samples.p95 > 25) return "contradicted";
		return "supported";
	}
	if (id === "h-depth-no-jump") return "supported";
	if (id === "h-midi-required") return "contradicted";
	if (id === "h-optical-physical") return "contradicted";
	if (id === "h-axis-continuous") return "contradicted";
	if (id === "h-signal-thesis") return "mixed";
	if (id === "h-vertex-bound") {
		const expected = samples.expectedVertices ?? samples.vertices;
		if (samples.vertices > BOUNDS.vertexMax) return "contradicted";
		if (typeof expected === "number" && samples.vertices === expected) return "supported";
		return samples.vertices <= BOUNDS.vertexMax ? "supported" : "contradicted";
	}
	return "mixed";
}
function noteFor(id, verdict, samples) {
	const bits = Object.entries(samples).map(([k, v]) => `${k} ${v.toFixed(3)}`).join(", ");
	return `${verdict.toUpperCase()} on compressed rehearsal. ${bits || "no numeric samples"}. Window labelled; not a 10-minute soak.`;
}
function buildWarnings(s) {
	const w = ["Optical macro is simulation-only. No physical beam, laser, or haptic path.", `Vertex table is closed (max ${BOUNDS.vertexMax}). Particle field caps at ${BOUNDS.particle[s.quality]}.`];
	if (s.audioStatus !== "running") w.push("Audio is not running. Activate from an intentional gesture.");
	if (s.midi.status !== "connected") w.push(`MIDI ${s.midi.status}. Keyboard/pointer fallback is first-class.`);
	if (s.quality === "SAFE") w.push("SAFE tier: particle field is 0.");
	if (s.fork) w.push("A side-research fork is active. Approved scene is frozen.");
	return w;
}
function persist(manifest) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(manifest));
	} catch {}
}
function loadPersisted() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}
function stepRuntime(dt, target, quality) {
	const capped = Math.min(dt, BOUNDS.dtMax);
	for (const id of MACRO_IDS) {
		const def = MACRO_DEFS[id];
		if (def.locked) {
			hot.applied[id] = OPTICAL_LOCKED;
			continue;
		}
		const tau = Math.max(.05, def.smoothingSec);
		const k = 1 - Math.exp(-capped / tau);
		hot.applied[id] += (target[id] - hot.applied[id]) * k;
	}
	hot.applied.optical = OPTICAL_LOCKED;
	sceneAudio.apply(hot.applied);
	hot.features = sceneAudio.sample();
	hot.particles = particleBudget(quality, hot.applied.atmosphere);
}
function table(pattern, build) {
	const verts = [];
	const cap = PATTERN_VERTEX_COUNT[pattern];
	build((v) => {
		if (verts.length >= cap) return;
		verts.push({
			i: verts.length,
			...v
		});
	});
	if (verts.length !== cap) throw new Error(`${pattern} vertex table is ${verts.length}, declared ${cap}`);
	return verts;
}
var PATTERN_TABLES = {
	vesica: table("vesica", (push) => {
		const n = 32;
		for (let k = 0; k < n; k += 1) {
			const u = k / n;
			const ang = u * Math.PI * 2;
			push({
				role: "rim-a",
				x: -.28 + Math.cos(ang) * .58,
				y: Math.sin(ang) * .58,
				u,
				layer: 0
			});
		}
		for (let k = 0; k < n; k += 1) {
			const u = k / n;
			const ang = u * Math.PI * 2;
			push({
				role: "rim-b",
				x: .28 + Math.cos(ang) * .58,
				y: Math.sin(ang) * .58,
				u,
				layer: 0
			});
		}
	}),
	bloom: table("bloom", (push) => {
		const n = 16;
		for (let k = 0; k < n; k += 1) {
			const u = k / n;
			const ang = u * Math.PI * 2;
			push({
				role: "petal",
				x: Math.cos(ang) * .62,
				y: Math.sin(ang) * .62,
				u,
				layer: 0
			});
		}
	}),
	coil: table("coil", (push) => {
		const n = 96;
		const turns = 3.5;
		for (let k = 0; k < n; k += 1) {
			const u = k / 95;
			const ang = u * Math.PI * 2 * turns;
			const r = .08 + u * .78;
			push({
				role: "coil",
				x: Math.cos(ang) * r,
				y: Math.sin(ang) * r,
				u,
				layer: 0
			});
		}
	}),
	gate: table("gate", (push) => {
		const arch = 16;
		for (let k = 0; k < arch; k += 1) {
			const u = k / 15;
			const ang = Math.PI + u * Math.PI;
			push({
				role: "arch",
				x: Math.cos(ang) * .46,
				y: Math.sin(ang) * .46 + .08,
				u,
				layer: 0
			});
		}
		for (const [x, y, u] of [
			[
				-.46,
				.08,
				0
			],
			[
				-.46,
				.28,
				.33
			],
			[
				-.46,
				.48,
				.66
			],
			[
				-.46,
				.62,
				1
			],
			[
				.46,
				.08,
				0
			],
			[
				.46,
				.28,
				.33
			],
			[
				.46,
				.48,
				.66
			],
			[
				.46,
				.62,
				1
			]
		]) push({
			role: "post",
			x,
			y,
			u,
			layer: 0
		});
	}),
	lattice: table("lattice", (push) => {
		const n = 7;
		for (let y = 0; y < n; y += 1) for (let x = 0; x < n; x += 1) {
			const u = (y * n + x) / 48;
			push({
				role: "lattice",
				x: -.78 + x / 6 * 1.56,
				y: -.78 + y / 6 * 1.56,
				u,
				layer: 0
			});
		}
	})
};
var RING = Array.from({ length: BOUNDS.ringSamples }, (_, k) => {
	const u = k / BOUNDS.ringSamples;
	const ang = u * Math.PI * 2;
	return {
		i: k,
		role: "rim-a",
		x: Math.cos(ang),
		y: Math.sin(ang),
		u,
		layer: 0
	};
});
function verticesFor(pattern) {
	return PATTERN_TABLES[pattern];
}
(function assertVertexBounds() {
	for (const [id, verts] of Object.entries(PATTERN_TABLES)) if (verts.length > BOUNDS.vertexMax) throw new Error(`${id} exceeds vertexMax (${verts.length})`);
})();
function fmt(id, v) {
	if (id === "axis") return axisLabel(v);
	if (id === "material") return `M${materialIndex(v).index} ${materialIndex(v).title}`;
	if (id === "optical") return "SIM 0.35";
	return v.toFixed(3);
}
function MacroFader({ id, source = "pointer", large = false }) {
	const def = MACRO_DEFS[id];
	const target = useAurelith((s) => s.fork ? s.fork.target[id] : s.target[id]);
	const applied = useAurelith((s) => s.appliedSnapshot[id]);
	const rms = useAurelith((s) => s.metrics.rms);
	const selected = useAurelith((s) => s.selectedMacro === id);
	const select = useAurelith((s) => s.selectMacro);
	const setMacro = useAurelith((s) => s.setMacro);
	const lag = Math.abs(target - applied);
	const i = macroIndex(id);
	const prop = Object.values(PROPERTY_DEFS).find((p) => p.from === id);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		role: "group",
		onPointerDown: () => select(id),
		className: cn("flex w-full flex-col gap-1 rounded-md border px-3 py-2.5 text-left transition-colors duration-150", selected ? "border-signal/40 bg-elevated" : "border-border bg-surface hover:bg-elevated", def.locked && "opacity-80"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-baseline justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-sans text-sm font-medium text-fg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "mr-1.5 font-mono text-2xs text-subtle",
						children: ["i", i]
					}), def.name]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-2xs tabular-nums tracking-caps text-muted uppercase",
					children: def.locked ? "locked" : def.stageAccess ? "stage" : "studio"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-2xs leading-snug text-muted",
				children: prop ? `${prop.id} → ${prop.field} → ${prop.attr}` : def.meaning
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-1 flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
					min: 0,
					max: 1,
					step: .01,
					disabled: def.locked,
					value: [target],
					onValueChange: ([v]) => setMacro(id, v ?? 0, source),
					className: "flex-1"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "w-[4.5rem] shrink-0 text-right font-mono text-xs tabular-nums text-fg",
					children: fmt(id, target)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-2 font-mono text-2xs tabular-nums text-subtle",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-signal",
						children: "T"
					}),
					" ",
					fmt(id, target),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mx-1.5 text-border",
						children: "/"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-botanical",
						children: "A"
					}),
					" ",
					fmt(id, applied),
					id === "intensity" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mx-1.5 text-border",
							children: "/"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-warn",
							children: "M"
						}),
						" ",
						rms.toFixed(2),
						" rms"
					] })
				] }), lag > .02 && !def.locked && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-warn",
					children: ["lag ", lag.toFixed(2)]
				})]
			}),
			large && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-2xs text-subtle",
				children: [
					def.mappingRule,
					" Fallback: ",
					def.fallback
				]
			})
		]
	});
}
var STATUS_TONE = {
	untested: "text-muted",
	running: "text-signal",
	supported: "text-botanical",
	contradicted: "text-danger",
	mixed: "text-warn",
	"locked-simulation": "text-warn",
	rejected: "text-danger"
};
var MATURITY = {
	captured: "captured",
	candidate: "candidate",
	"source-backed": "source-backed",
	reviewed: "reviewed",
	measured: "measured",
	superseded: "superseded",
	rejected: "rejected",
	"locked-simulation": "simulation"
};
function ResearchLab() {
	const hypotheses = useAurelith((s) => s.hypotheses);
	const side = useAurelith((s) => s.sideResearch);
	const observations = useAurelith((s) => s.observations);
	const ledger = useAurelith((s) => s.ledger);
	const metrics = useAurelith((s) => s.metrics);
	const active = useAurelith((s) => s.activeTrialId);
	const note = useAurelith((s) => s.trialNote);
	const run = useAurelith((s) => s.runHypothesis);
	const abort = useAurelith((s) => s.abortTrial);
	const forkSide = useAurelith((s) => s.forkSide);
	const fork = useAurelith((s) => s.fork);
	const reconstructionOpen = useAurelith((s) => s.reconstructionOpen);
	const reconstructionScore = useAurelith((s) => s.reconstructionScore);
	const setReconstruction = useAurelith((s) => s.setReconstruction);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {
					kicker: "Measurement signal",
					title: "What is measured, how, and what it is not"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "FPS",
							value: metrics.fps ? metrics.fps.toFixed(0) : "—",
							unit: "rAF"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Frame p95",
							value: metrics.p95 ? metrics.p95.toFixed(1) : "—",
							unit: "ms / ~1s window"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "RMS",
							value: metrics.rms.toFixed(3),
							unit: "analyser 0–1"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Particles",
							value: String(metrics.particles),
							unit: "renderer count"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Vertices",
							value: String(metrics.vertices),
							unit: `table / max 96`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Playhead",
							value: `v[${metrics.playhead}]`,
							unit: "vertex index"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Pattern",
							value: `P${metrics.patternIndex}`,
							unit: "catalog index"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Metric, {
							label: "Material",
							value: `M${metrics.materialIndex}`,
							unit: "specimen index"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-2xs leading-relaxed text-subtle",
					children: [metrics.source, ". Labels: Target requested · Applied interpolated · Measured sampled · Simulation non-physical · Future not in v1."]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {
					kicker: "Hypothesis board",
					title: "Trial and error stays visible"
				}),
				note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 rounded-sm border border-border bg-elevated px-3 py-2 text-xs text-fg",
					children: note
				}),
				!reconstructionOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 flex flex-col gap-2",
					children: hypotheses.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-md border border-border bg-surface p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-start justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "max-w-[52ch] break-words text-sm text-fg",
									children: h.claim
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("font-mono text-2xs tracking-caps uppercase", STATUS_TONE[h.status]),
									children: h.status.replace("-", " ")
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-2xs text-muted",
								children: ["Curiosity: ", h.curiosity]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-2xs text-subtle",
								children: [
									"Method: ",
									h.method,
									" Window ",
									h.windowSec,
									"s · ",
									h.units
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-2xs text-subtle",
								children: ["Limitation: ", h.knownLimitations[0]]
							}),
							h.trials[0] && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 font-mono text-2xs text-muted",
								children: [
									"Last trial ",
									new Date(h.trials[0].at).toISOString().slice(0, 16),
									" · ",
									h.trials[0].verdict,
									" · ",
									h.trials[0].notes
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 flex flex-wrap gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "outline",
									disabled: !!active || h.status === "locked-simulation",
									onClick: () => void run(h.id),
									children: h.status === "locked-simulation" ? "Not runnable" : active ? "Trial running" : "Run choreography"
								}), h.trials.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "self-center font-mono text-2xs text-subtle",
									children: [
										h.trials.length,
										" trial",
										h.trials.length === 1 ? "" : "s",
										" · conf ",
										h.confidence.toFixed(2),
										" · ",
										MATURITY[h.evidenceMaturity]
									]
								})]
							})
						]
					}, h.id))
				}),
				active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "ghost",
					className: "mt-2",
					onClick: abort,
					children: "Abort trial"
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {
				kicker: "Side research",
				title: "Fork without touching the approved scene"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 grid gap-2 md:grid-cols-2",
				children: side.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-md border border-border bg-surface p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-baseline justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-sm font-medium text-fg",
								children: s.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-2xs tracking-caps text-subtle uppercase",
								children: MATURITY[s.maturity]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-2xs text-muted",
							children: s.origin
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-fg",
							children: s.claim
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-2xs text-subtle",
							children: ["Contributes: ", s.contributes]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-2xs text-subtle",
							children: ["Limitation: ", s.limitation]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "subtle",
							className: "mt-2",
							onClick: () => forkSide(s.id),
							disabled: !!fork,
							children: "Fork as side instance"
						})
					]
				}, s.id))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {
				kicker: "Test choreography",
				title: "Named rehearsals, not hidden automation"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 flex flex-col gap-2",
				children: CHOREOGRAPHIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "border-b border-border pb-2 last:border-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-baseline justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm text-fg",
							children: c.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-2xs tracking-caps text-subtle uppercase",
							children: c.audience
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-2xs text-muted",
						children: c.steps
					})]
				}, c.id))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {
					kicker: "Process scaffold",
					title: "Can you reconstruct the last trial?"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs text-muted",
					children: "Feasibility protocol, n=you. Hide the board and name: source, window, unit, limitation. Not a workplace instrument."
				}),
				!reconstructionOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "outline",
					className: "mt-2",
					onClick: () => setReconstruction(true, null),
					children: "Hide board and self-score"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex flex-wrap gap-2",
					children: [
						[
							0,
							1,
							2,
							3,
							4
						].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: reconstructionScore === n ? "solid" : "outline",
							onClick: () => setReconstruction(true, n),
							children: n
						}, n)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => setReconstruction(false),
							children: "Show board"
						}),
						reconstructionScore !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "self-center font-mono text-2xs text-muted",
							children: [
								"Self-score ",
								reconstructionScore,
								"/4 · recorded as candidate, not a validated measure"
							]
						})
					]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {
				kicker: "Observations",
				title: "Claim, facts, inference, limitation"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 flex flex-col gap-2",
				children: observations.slice(0, 6).map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-sm border border-border px-3 py-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-fg",
							children: o.claim
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 font-mono text-2xs text-subtle",
							children: [
								o.id,
								" · ",
								MATURITY[o.evidenceMaturity],
								" · conf ",
								o.confidence.toFixed(2)
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-1 list-disc pl-4 text-2xs text-muted",
							children: o.verifiedFacts.slice(0, 2).map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: f }, f))
						})
					]
				}, o.id))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {
				kicker: "Event ledger",
				title: "Intent is recorded. Nothing is silent."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 max-h-56 overflow-auto font-mono text-2xs",
				children: ledger.slice(0, 40).map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex gap-2 border-b border-border/80 py-1 text-muted",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "w-14 shrink-0 tabular-nums text-subtle",
							children: new Date(e.t).toISOString().slice(14, 23)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "w-16 shrink-0 text-signal",
							children: e.kind
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "min-w-0 flex-1 text-fg",
							children: e.message
						})
					]
				}, e.id))
			})] })
		]
	});
}
function Header({ kicker, title }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "font-mono text-2xs tracking-caps text-signal uppercase",
		children: kicker
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
		className: "font-display text-lg tracking-display text-fg",
		children: title
	})] });
}
function Metric({ label, value, unit }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "bg-surface px-3 py-2.5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
				className: "font-mono text-2xs tracking-caps text-subtle uppercase",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
				className: "font-mono text-lg tabular-nums text-fg",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-2xs text-subtle",
				children: unit
			})
		]
	});
}
function hexToRgb(hex) {
	const n = parseInt(hex.slice(1), 16);
	return [
		n >> 16 & 255,
		n >> 8 & 255,
		n & 255
	];
}
function rgba(hex, a) {
	const [r, g, b] = hexToRgb(hex);
	return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, a))})`;
}
function SceneCanvas() {
	const ref = (0, import_react.useRef)(null);
	const wrapRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const canvas = ref.current;
		const wrap = wrapRef.current;
		if (!canvas || !wrap) return;
		const ctx = canvas.getContext("2d", { alpha: false });
		if (!ctx) return;
		const particles = Array.from({ length: BOUNDS.particle.HIGH }, (_, i) => ({
			a: i / BOUNDS.particle.HIGH * Math.PI * 2,
			r: .18 + i % 17 * .04,
			s: .15 + i % 9 * .05,
			p: i * .37 % 1
		}));
		let raf = 0;
		let last = performance.now();
		let lastPush = 0;
		let running = true;
		const frameTimes = [];
		const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const resize = () => {
			const rect = wrap.getBoundingClientRect();
			const quality = useAurelith.getState().quality;
			const cap = BOUNDS.dpr[quality];
			const dpr = Math.min(window.devicePixelRatio || 1, cap);
			const w = Math.max(1, Math.floor(rect.width));
			const h = Math.max(1, Math.floor(rect.height));
			canvas.width = Math.floor(w * dpr);
			canvas.height = Math.floor(h * dpr);
			canvas.style.width = `${w}px`;
			canvas.style.height = `${h}px`;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		};
		resize();
		const ro = new ResizeObserver(resize);
		ro.observe(wrap);
		const draw = (now) => {
			if (!running) return;
			const dt = Math.min(BOUNDS.dtMax, (now - last) / 1e3);
			last = now;
			const state = useAurelith.getState();
			const target = state.fork ? state.fork.target : state.target;
			const pattern = state.fork ? state.fork.pattern : state.pattern;
			const quality = state.quality;
			stepRuntime(dt, target, quality);
			const w = wrap.clientWidth;
			const h = wrap.clientHeight;
			const t = reduce ? 0 : now / 1e3;
			const frame = assign(hot.applied, quality, pattern);
			const verts = verticesFor(pattern);
			const playhead = verts.length ? Math.floor(t * frame.playheadRate * verts.length % verts.length) : 0;
			drawField(ctx, w, h, t, frame, verts, playhead, particles);
			const frameMs = dt * 1e3;
			frameTimes.push(frameMs);
			if (frameTimes.length > BOUNDS.fpsWindow) frameTimes.shift();
			const sorted = [...frameTimes].sort((a, b) => a - b);
			const p95 = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * .95))] ?? frameMs;
			hot.fps = dt > 0 ? 1 / dt : 0;
			hot.frameMs = frameMs;
			hot.p95 = p95;
			hot.tVisual = now;
			hot.frameTimes = frameTimes;
			hot.particles = frame.particleCount;
			hot.vertices = verts.length;
			hot.playhead = playhead;
			if (now - lastPush > BOUNDS.metricsPushMs) {
				lastPush = now;
				useAurelith.getState().pushMetrics({
					fps: hot.fps,
					frameMs: hot.frameMs,
					p95: hot.p95,
					rms: hot.features.rms,
					low: hot.features.low,
					mid: hot.features.mid,
					high: hot.features.high,
					onset: hot.features.onset,
					tAudio: hot.features.tAudio,
					tVisual: now,
					particles: hot.particles,
					vertices: hot.vertices,
					playhead: hot.playhead,
					patternIndex: frame.patternIndex,
					materialIndex: frame.materialIndex,
					sampleWindowMs: 1e3,
					source: "rAF + AnalyserNode · vertex table bounded · visual-control signal, not subjective quality"
				});
			}
			raf = requestAnimationFrame(draw);
		};
		raf = requestAnimationFrame(draw);
		return () => {
			running = false;
			cancelAnimationFrame(raf);
			ro.disconnect();
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: wrapRef,
		className: "relative h-full min-h-[280px] w-full overflow-hidden bg-void",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
			ref,
			className: "preview-canvas absolute inset-0 h-full w-full"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CanvasHud, {})]
	});
}
function CanvasHud() {
	const vertices = useAurelith((s) => s.metrics.vertices);
	const playhead = useAurelith((s) => s.metrics.playhead);
	const patternIndex = useAurelith((s) => s.metrics.patternIndex);
	const materialIndex = useAurelith((s) => s.metrics.materialIndex);
	const particles = useAurelith((s) => s.metrics.particles);
	const pattern = useAurelith((s) => s.fork ? s.fork.pattern : s.pattern);
	const quality = useAurelith((s) => s.quality);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-none absolute top-3 left-3 rounded-sm border border-border bg-void/70 px-2 py-1 font-mono text-2xs tracking-caps text-signal uppercase",
		children: "Optical · simulation only"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("pointer-events-none absolute bottom-3 left-3 max-w-[min(100%-1.5rem,28rem)] rounded-sm border border-border bg-void/75 px-2.5 py-1.5 font-mono text-2xs tabular-nums tracking-caps text-muted uppercase"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-fg",
			children: [
				"P",
				patternIndex,
				" ",
				pattern,
				" · V ",
				vertices,
				"/",
				BOUNDS.vertexMax,
				" · v[",
				playhead,
				"]"
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-0.5",
			children: [
				"M",
				materialIndex,
				" · Q ",
				quality,
				" · particles ",
				particles,
				"/",
				BOUNDS.particle[quality],
				" · F ",
				BOUNDS.fieldCount
			]
		})]
	})] });
}
function drawField(ctx, w, h, t, frame, verts, playhead, particles) {
	const f = hot.features;
	const cx = w * .5;
	const cy = h * .5;
	const R = Math.min(w, h) * .46;
	const cols = frame.colors;
	const energy = .28 + frame.energy * (.55 + f.rms * 1.2 + f.onset * .45);
	const fog = frame.fog;
	ctx.fillStyle = "#050608";
	ctx.fillRect(0, 0, w, h);
	const g = ctx.createRadialGradient(cx, cy, R * .05, cx, cy, R * (1.35 + fog * .4));
	g.addColorStop(0, rgba(cols[0], .14 + energy * .18));
	g.addColorStop(.45, rgba(cols[1], .08));
	g.addColorStop(1, "rgba(5,6,8,0.94)");
	ctx.fillStyle = g;
	ctx.fillRect(0, 0, w, h);
	ctx.save();
	ctx.translate(cx, cy);
	ctx.rotate(t * .018 * (.4 + frame.energy));
	ctx.globalCompositeOperation = "lighter";
	drawRings(ctx, R, frame.layers, cols, energy, fog, t, f);
	drawPattern(ctx, R, frame, verts, energy, t);
	drawSignal(ctx, R, verts, playhead, energy, f, cols);
	drawOptical(ctx, R, frame.optical, energy, cols);
	const nPart = Math.min(frame.particleCount, particles.length, BOUNDS.particle[frame.quality]);
	if (nPart > 0) {
		ctx.globalAlpha = .35 + frame.haze * .4;
		for (let i = 0; i < nPart; i += 1) {
			const p = particles[i];
			const ang = p.a + t * p.s * (.15 + frame.energy * .4);
			const rad = R * (p.r + frame.fog * .12 + Math.sin(t * .7 + p.p * 6) * .03);
			const x = Math.cos(ang) * rad;
			const y = Math.sin(ang) * rad * (.92 + frame.fog * .08);
			ctx.fillStyle = rgba(cols[i % 3], .18 + f.high * .4);
			ctx.beginPath();
			ctx.arc(x, y, .8 + frame.haze * 1.6, 0, Math.PI * 2);
			ctx.fill();
		}
		ctx.globalAlpha = 1;
	}
	ctx.restore();
	const vig = ctx.createRadialGradient(cx, cy, R * (.28 + frame.focus * .2), cx, cy, R * 1.15);
	vig.addColorStop(0, "rgba(5,6,8,0)");
	vig.addColorStop(1, `rgba(5,6,8,${.18 + frame.fields.vignette * .28})`);
	ctx.fillStyle = vig;
	ctx.fillRect(0, 0, w, h);
	if (f.onset > .4) {
		ctx.fillStyle = rgba(cols[0], .04 * f.onset);
		ctx.fillRect(0, 0, w, h);
	}
}
function strokeLoop(ctx, verts, R, closed) {
	if (!verts.length) return;
	ctx.beginPath();
	verts.forEach((v, i) => {
		const x = v.x * R;
		const y = v.y * R;
		if (i === 0) ctx.moveTo(x, y);
		else ctx.lineTo(x, y);
	});
	if (closed) ctx.closePath();
	ctx.stroke();
}
function drawPattern(ctx, R, frame, verts, energy, t) {
	const cols = frame.colors;
	const a = verts.filter((v) => v.role === "rim-a");
	const b = verts.filter((v) => v.role === "rim-b");
	const petals = verts.filter((v) => v.role === "petal");
	const coil = verts.filter((v) => v.role === "coil");
	const arch = verts.filter((v) => v.role === "arch");
	const posts = verts.filter((v) => v.role === "post");
	const lattice = verts.filter((v) => v.role === "lattice");
	if (a.length) {
		ctx.strokeStyle = rgba(cols[1], .5 + energy * .32);
		ctx.lineWidth = 1.35;
		strokeLoop(ctx, a, R, true);
	}
	if (b.length) {
		ctx.strokeStyle = rgba(cols[2], .48 + energy * .3);
		ctx.lineWidth = 1.35;
		strokeLoop(ctx, b, R, true);
	}
	if (petals.length) {
		ctx.strokeStyle = rgba(cols[2], .46 + energy * .32);
		ctx.lineWidth = 1.2;
		for (const v of petals) {
			const ang = v.u * Math.PI * 2 + t * .04;
			const len = R * (.22 + energy * .16);
			ctx.beginPath();
			ctx.ellipse(v.x * R * .7, v.y * R * .7, len * .22, len * .55, ang, 0, Math.PI * 2);
			ctx.stroke();
		}
	}
	if (coil.length) {
		ctx.strokeStyle = rgba(cols[0], .55 + energy * .3);
		ctx.lineWidth = 1.6;
		strokeLoop(ctx, coil, R, false);
	}
	if (arch.length) {
		ctx.strokeStyle = rgba(cols[1], .5 + energy * .28);
		ctx.lineWidth = 1.8;
		strokeLoop(ctx, arch, R, false);
	}
	if (posts.length) {
		ctx.strokeStyle = rgba(cols[1], .48 + energy * .25);
		ctx.lineWidth = 1.6;
		const left = posts.filter((v) => v.x < 0);
		const right = posts.filter((v) => v.x >= 0);
		strokeLoop(ctx, left, R, false);
		strokeLoop(ctx, right, R, false);
	}
	if (lattice.length) {
		ctx.strokeStyle = rgba(cols[0], .3 + energy * .22);
		ctx.lineWidth = .9;
		const n = 7;
		ctx.save();
		ctx.rotate(Math.PI / 12 + t * .008);
		for (let row = 0; row < n; row += 1) strokeLoop(ctx, lattice.slice(row * n, row * n + n), R, false);
		for (let col = 0; col < n; col += 1) {
			ctx.beginPath();
			for (let row = 0; row < n; row += 1) {
				const v = lattice[row * n + col];
				if (!v) continue;
				const x = v.x * R;
				const y = v.y * R;
				if (row === 0) ctx.moveTo(x, y);
				else ctx.lineTo(x, y);
			}
			ctx.stroke();
		}
		ctx.restore();
	}
}
function drawRings(ctx, R, layers, cols, energy, fog, t, f) {
	const n = Math.min(layers, BOUNDS.layers.HIGH);
	for (let i = 1; i <= n; i += 1) {
		const r = R * i / (n + .4) * (.92 + fog * .08);
		ctx.strokeStyle = rgba(cols[i % 3], .42 + energy * .35 + f.low * .15);
		ctx.lineWidth = 1.15 + energy * 1.4;
		ctx.beginPath();
		for (let k = 0; k < RING.length; k += 1) {
			const v = RING[k];
			const x = v.x * r;
			const y = v.y * r;
			if (k === 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		}
		ctx.closePath();
		ctx.stroke();
		if (i % 2 === 0) {
			ctx.save();
			ctx.rotate(t * .04 * (i % 3 === 0 ? 1 : -1));
			ctx.beginPath();
			const span = Math.floor(RING.length * (.4 + f.mid * .4));
			for (let k = 0; k < span; k += 1) {
				const v = RING[k];
				const x = v.x * r;
				const y = v.y * r;
				if (k === 0) ctx.moveTo(x, y);
				else ctx.lineTo(x, y);
			}
			ctx.strokeStyle = rgba(cols[0], .4 + energy * .3);
			ctx.stroke();
			ctx.restore();
		}
	}
}
function drawSignal(ctx, R, verts, playhead, energy, f, cols) {
	const v = verts[playhead];
	if (!v) return;
	const x = v.x * R;
	const y = v.y * R;
	const glow = 5 + energy * 10 + f.onset * 8;
	const grd = ctx.createRadialGradient(x, y, 0, x, y, glow);
	grd.addColorStop(0, "rgba(236,231,220,0.95)");
	grd.addColorStop(.35, rgba(cols[0], .5));
	grd.addColorStop(1, "rgba(236,231,220,0)");
	ctx.fillStyle = grd;
	ctx.beginPath();
	ctx.arc(x, y, glow, 0, Math.PI * 2);
	ctx.fill();
	ctx.strokeStyle = rgba(cols[0], .35 + f.rms * .3);
	ctx.lineWidth = .8;
	ctx.beginPath();
	const trail = 12;
	for (let k = 0; k < trail; k += 1) {
		const p = verts[(playhead - k + verts.length) % verts.length];
		const px = p.x * R;
		const py = p.y * R;
		if (k === 0) ctx.moveTo(px, py);
		else ctx.lineTo(px, py);
	}
	ctx.stroke();
}
function drawOptical(ctx, R, optical, energy, cols) {
	ctx.globalAlpha = .16 + optical * .32;
	for (let i = -1; i <= 1; i += 1) {
		ctx.save();
		ctx.rotate(i * .18);
		const grd = ctx.createLinearGradient(0, 0, 0, -R);
		grd.addColorStop(0, rgba(cols[0], .35 + energy * .2));
		grd.addColorStop(1, "rgba(126,176,184,0)");
		ctx.fillStyle = grd;
		ctx.beginPath();
		ctx.moveTo(-6, 0);
		ctx.lineTo(6, 0);
		ctx.lineTo(R * .08, -R * .92);
		ctx.lineTo(-R * .08, -R * .92);
		ctx.closePath();
		ctx.fill();
		ctx.restore();
	}
	ctx.globalAlpha = 1;
}
/** SSR-safe loader. three.js and r3f stay out of the server bundle. */
function SceneR3F() {
	const [Canvas, setCanvas] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let live = true;
		import("./scene-r3f-canvas-BdVK7J_M.mjs").then((m) => {
			if (live) setCanvas(() => m.SceneR3FCanvas);
		});
		return () => {
			live = false;
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "relative h-full min-h-[280px] w-full overflow-hidden bg-void",
		children: Canvas ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Canvas, {}) : null
	});
}
function SpecPanel() {
	const target = useAurelith((s) => s.fork ? s.fork.target : s.target);
	const applied = useAurelith((s) => s.appliedSnapshot);
	const pattern = useAurelith((s) => s.fork ? s.fork.pattern : s.pattern);
	const quality = useAurelith((s) => s.quality);
	const metrics = useAurelith((s) => s.metrics);
	const frame = assign(applied, quality, pattern);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "flex flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-2xs tracking-caps text-signal uppercase",
					children: "Closed specification · v1"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-1 font-display text-lg tracking-display text-fg",
					children: "Indices, properties, fields, vertices"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm leading-relaxed text-muted",
					children: "Every value has an index, a unit, and a bound. The canvas draws a precomputed vertex table — not an open loop."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						k: "dt max",
						v: `${BOUNDS.dtMax * 1e3} ms`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						k: "vertex max",
						v: String(BOUNDS.vertexMax)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						k: "this pattern",
						v: `${frame.vertexCount}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						k: "playhead",
						v: `v[${metrics.playhead}]`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						k: "particles",
						v: `${metrics.particles}/${BOUNDS.particle[quality]}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						k: "layers",
						v: `${frame.layers}/${BOUNDS.layers[quality]}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						k: "fields",
						v: `${BOUNDS.fieldCount} × ${BOUNDS.fieldSamples}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						k: "gain ceiling",
						v: BOUNDS.gainCeiling.toFixed(2)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto rounded-md border border-border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[36rem] text-left font-mono text-2xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "bg-elevated text-subtle",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-2 py-1.5 font-medium",
								children: "i"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-2 py-1.5 font-medium",
								children: "Macro"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-2 py-1.5 font-medium",
								children: "Property"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-2 py-1.5 font-medium",
								children: "Field"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-2 py-1.5 font-medium",
								children: "Vertex attr"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-2 py-1.5 font-medium",
								children: "T"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-2 py-1.5 font-medium",
								children: "A"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-2 py-1.5 font-medium",
								children: "Unit"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: PROPERTY_IDS.map((pid) => {
						const def = PROPERTY_DEFS[pid];
						const a = frame.assignments[def.index];
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-t border-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2 py-1 text-subtle",
									children: def.index
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2 py-1 text-fg",
									children: MACRO_DEFS[def.from].name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2 py-1 text-signal",
									children: def.id
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-2 py-1 text-botanical",
									children: [
										"F",
										FIELD_DEFS[def.field].index,
										" ",
										def.field
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2 py-1 text-muted",
									children: def.attr
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2 py-1 tabular-nums text-signal",
									children: target[def.from].toFixed(3)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2 py-1 tabular-nums text-botanical",
									children: a.value.toFixed(3)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2 py-1 text-subtle",
									children: def.unit
								})
							]
						}, pid);
					}) })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-md border border-border bg-surface p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-2xs tracking-caps text-subtle uppercase",
						children: "Pattern catalog · vertices"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 font-mono text-2xs",
						children: PATTERN_IDS.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: p === pattern ? "text-fg" : "text-muted",
							children: [
								"P",
								i,
								" ",
								p,
								" · V ",
								PATTERN_VERTEX_COUNT[p],
								"/",
								BOUNDS.vertexMax,
								p === pattern ? " · live" : ""
							]
						}, p))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-md border border-border bg-surface p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-2xs tracking-caps text-subtle uppercase",
						children: "Material catalog · index"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 max-h-40 overflow-auto font-mono text-2xs",
						children: MATERIAL_SPECIMENS.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: m.index === frame.materialIndex ? "text-fg" : "text-muted",
							children: [
								"M",
								m.index,
								" ",
								m.title,
								m.index === frame.materialIndex ? " · live" : ""
							]
						}, m.id))
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-md border border-border bg-surface p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-2xs tracking-caps text-subtle uppercase",
						children: "Fields · assigned now"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 grid gap-1 font-mono text-2xs md:grid-cols-2",
						children: FIELD_IDS.map((id) => {
							const def = FIELD_DEFS[id];
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex justify-between gap-2 border-b border-border/70 py-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-muted",
									children: [
										"F",
										def.index,
										" ",
										id,
										" · ",
										def.domain
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "tabular-nums text-fg",
									children: [
										frame.fields[id].toFixed(id === "particle" || id === "recipe" || id === "geometry-mix" ? 0 : 3),
										" ",
										def.unit
									]
								})]
							}, id);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-2xs text-subtle",
						children: [
							"Axis bucket ",
							frame.axisBucket,
							" ",
							AXIS_LABELS[frame.axisBucket],
							". Optical locked ",
							BOUNDS.opticalLocked,
							". Macros",
							" ",
							MACRO_IDS.length,
							"/",
							BOUNDS.macroCount,
							"."
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-md border border-border bg-surface p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-2xs tracking-caps text-botanical uppercase",
						children: "In scope"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 list-disc pl-4 text-2xs text-muted",
						children: SCOPE.in.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: s }, s))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-md border border-border bg-surface p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-2xs tracking-caps text-warn uppercase",
						children: "Out of scope"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 list-disc pl-4 text-2xs text-muted",
						children: SCOPE.out.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: s }, s))
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopySpec, { frameJson: JSON.stringify({
				indices: {
					pattern: frame.patternIndex,
					material: frame.materialIndex,
					quality: frame.qualityIndex
				},
				assignments: frame.assignments,
				bounds: {
					vertexCount: frame.vertexCount,
					vertexMax: BOUNDS.vertexMax,
					particles: frame.particleCount,
					layers: frame.layers
				}
			}, null, 2) })
		]
	});
}
function Stat({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "bg-surface px-3 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "font-mono text-2xs tracking-caps text-subtle uppercase",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "font-mono text-sm tabular-nums text-fg",
			children: v
		})]
	});
}
function CopySpec({ frameJson }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md border border-border bg-surface p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-2xs tracking-caps text-subtle uppercase",
				children: "Live assignment syntax"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "ghost",
				onClick: () => {
					navigator.clipboard?.writeText(frameJson);
				},
				children: "Copy JSON"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
			className: "mt-2 max-h-40 overflow-auto font-mono text-2xs leading-relaxed text-muted",
			children: frameJson
		})]
	});
}
var MODES = [
	{
		id: "studio",
		label: "Studio",
		audience: "Author"
	},
	{
		id: "stage",
		label: "Stage",
		audience: "Operator"
	},
	{
		id: "diagnostics",
		label: "Diagnostics",
		audience: "Technical lead"
	}
];
var FieldCtx = (0, import_react.createContext)({
	field: "canvas2d",
	setField: () => {}
});
function useFieldRenderer() {
	return (0, import_react.useContext)(FieldCtx);
}
function AurelithShell() {
	const mode = useAurelith((s) => s.mode);
	const audioStatus = useAurelith((s) => s.audioStatus);
	const activate = useAurelith((s) => s.activateAudio);
	const [field, setField] = (0, import_react.useState)("canvas2d");
	(0, import_react.useEffect)(() => {
		const persisted = loadPersisted();
		if (persisted) useAurelith.getState().importManifest(JSON.stringify(persisted));
	}, []);
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			const t = e.target;
			if (t && [
				"INPUT",
				"TEXTAREA",
				"SELECT"
			].includes(t.tagName)) return;
			const s = useAurelith.getState();
			if (e.key === "Enter" && s.audioStatus !== "running") {
				e.preventDefault();
				s.activateAudio();
				return;
			}
			if (e.key === "m" || e.key === "M") {
				s.setMuted(!s.muted);
				return;
			}
			if (e.key === "z" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				s.undo();
				return;
			}
			if (e.key === "Escape") {
				s.stabilize("keyboard");
				return;
			}
			if (e.key === "[" || e.key === "p") s.nudge(-.04, "keyboard");
			if (e.key === "]" || e.key === "n") s.nudge(.04, "keyboard");
			if (e.key === "1") s.selectMacro("intensity");
			if (e.key === "2") s.selectMacro("depth");
			if (e.key === "3") s.selectMacro("atmosphere");
			if (e.key === "4") s.selectMacro("focus");
			if (e.key === "ArrowUp") {
				e.preventDefault();
				s.nudge(.02, "keyboard");
			}
			if (e.key === "ArrowDown") {
				e.preventDefault();
				s.nudge(-.02, "keyboard");
			}
		};
		window.addEventListener("keydown", onKey);
		const vis = () => {
			if (document.visibilityState === "visible" && useAurelith.getState().audioStatus !== "locked") useAurelith.getState().activateAudio();
		};
		document.addEventListener("visibilitychange", vis);
		return () => {
			window.removeEventListener("keydown", onKey);
			document.removeEventListener("visibilitychange", vis);
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldCtx.Provider, {
		value: {
			field,
			setField
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex h-dvh flex-col overflow-hidden bg-bg text-fg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ForkBanner, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid min-h-0 min-w-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "relative min-h-[40vh] min-w-0 overflow-hidden border-b border-border lg:min-h-0 lg:border-r lg:border-b-0",
						children: [field === "three" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SceneR3F, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SceneCanvas, {}), audioStatus !== "running" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-start p-3 md:p-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "pointer-events-auto max-w-md rounded-md border border-border bg-surface/95 px-4 py-3 shadow-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-mono text-2xs tracking-caps text-signal uppercase",
										children: "Audio is locked"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-fg",
										children: "Every scene begins as a signal. No microphone. Optical stays a simulation."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										className: "mt-2",
										size: "sm",
										onClick: () => void activate(),
										children: "Activate audio"
									})
								]
							})
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
						className: "min-h-0 min-w-0 overflow-x-hidden overflow-y-auto bg-bg",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-4 py-4 md:px-5 md:py-5",
							children: [
								mode === "studio" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudioPanel, {}),
								mode === "stage" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StagePanel, {}),
								mode === "diagnostics" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DiagnosticsPanel, {})
							]
						})
					})]
				})
			]
		})
	});
}
function TopBar() {
	const mode = useAurelith((s) => s.mode);
	const setMode = useAurelith((s) => s.setMode);
	const audioStatus = useAurelith((s) => s.audioStatus);
	const quality = useAurelith((s) => s.quality);
	const revision = useAurelith((s) => s.revision);
	const dirty = useAurelith((s) => s.dirty);
	const midi = useAurelith((s) => s.midi.status);
	const fallback = useAurelith((s) => s.fallback);
	const muted = useAurelith((s) => s.muted);
	const setMuted = useAurelith((s) => s.setMuted);
	const activate = useAurelith((s) => s.activateAudio);
	const stabilize = useAurelith((s) => s.stabilize);
	const sceneName = useAurelith((s) => s.sceneName);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "identity-bar border-b border-border bg-surface",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-3 px-4 py-3 md:px-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wordmark, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 truncate font-mono text-2xs tracking-caps text-muted uppercase",
							children: [
								"Bounded scene · rev ",
								revision,
								dirty ? " · dirty" : "",
								" · ",
								sceneName
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductNav, { active: "scene" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "flex rounded-md border border-border p-0.5",
						"aria-label": "Role",
						children: MODES.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setMode(m.id),
							className: cn("min-h-11 rounded-sm px-3 py-1.5 text-xs font-medium transition-colors duration-150", mode === m.id ? "bg-fg text-bg" : "text-muted hover:text-fg"),
							children: m.label
						}, m.id))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "border-t border-border px-4 py-2 text-xs leading-relaxed text-muted md:px-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "sm:hidden",
					children: "A bounded audiovisual instrument. Optical is a simulation."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "hidden sm:inline",
					children: "A bounded audiovisual instrument for authors, operators, and technical leads. Eight macros request a target. Lookdev is the optical grammar. Optical is a simulation — no beam, no haptic, no health claim."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2 border-t border-border px-4 py-2 font-mono text-2xs tracking-caps text-muted uppercase md:px-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Status, {
						tone: audioStatus === "running" ? "ok" : audioStatus === "locked" ? "warn" : "bad",
						label: `audio ${audioStatus}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Status, {
						tone: quality === "SAFE" ? "warn" : "ok",
						label: `quality ${quality}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Status, {
						tone: midi === "connected" ? "ok" : "idle",
						label: `midi ${midi}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Status, {
						tone: fallback ? "warn" : "idle",
						label: fallback ? "fallback on" : "fallback none"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FieldToggle, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "ml-auto flex flex-wrap gap-1",
						children: [audioStatus !== "running" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "solid",
							onClick: () => void activate(),
							children: "Activate"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							onClick: () => setMuted(!muted),
							children: muted ? "Unmute" : "Mute"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "subtle",
							onClick: () => stabilize(),
							children: "Stabilize"
						})]
					})
				]
			})
		]
	});
}
function Status({ tone, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "inline-flex items-center gap-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("size-1.5 rounded-full", tone === "ok" ? "bg-botanical" : tone === "warn" ? "bg-warn" : tone === "bad" ? "bg-danger" : "bg-subtle") }), label]
	});
}
function FieldToggle() {
	const { field, setField } = useFieldRenderer();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "inline-flex items-center gap-1",
		"aria-label": "Field renderer",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: cn("h-11 rounded-sm px-2", field === "canvas2d" ? "bg-fg text-bg" : "text-muted hover:text-fg"),
			onClick: () => setField("canvas2d"),
			children: "Canvas 2D"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: cn("h-11 rounded-sm px-2", field === "three" ? "bg-fg text-bg" : "text-muted hover:text-fg"),
			onClick: () => setField("three"),
			children: "three.js / r3f"
		})]
	});
}
function RendererContract() {
	const [caps, setCaps] = (0, import_react.useState)(null);
	const { field } = useFieldRenderer();
	(0, import_react.useEffect)(() => {
		probeRenderers().then(setCaps);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-md border border-border bg-surface p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-2xs tracking-caps text-signal uppercase",
				children: "Renderer contract"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs leading-relaxed text-muted",
				children: "Shader Grammar is the IR. These runtimes consume it. None of them is a physical beam."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 space-y-2",
				children: [
					["Lookdev", "GLSL ES 3.00 on WebGL2. The live optical sketch."],
					["WebGPU", "WGSL from Lookdev → Proof → Backends. Same operators. Not switched live until proven."],
					["HLSL / Unity", "URP shader AURELITH/Grammar/{Specimen} + AurelithGrammarBinder.cs. Optical locked."],
					["three.js / r3f", "Closed graph: camera, fog, vertex table, particles. No GLTF, no unbounded scene."],
					["This field", field === "three" ? "three.js / r3f" : "Canvas 2D (default, bounded draw)"]
				].map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-2xs tracking-caps text-subtle uppercase",
					children: k
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-fg",
					children: v
				})] }, k))
			}),
			caps ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 font-mono text-2xs text-muted",
				children: [
					"WebGL2 ",
					caps.webgl2 ? "yes" : "no",
					" · WebGPU ",
					caps.webgpu ? "yes" : "no",
					" · ",
					caps.adapter,
					" · three.js",
					" ",
					caps.three ? "yes" : "no",
					" · r3f ",
					caps.r3f ? "yes" : "no"
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 font-mono text-2xs text-subtle",
				children: "Probing this browser…"
			})
		]
	});
}
function ForkBanner() {
	const fork = useAurelith((s) => s.fork);
	const discard = useAurelith((s) => s.discardFork);
	const promote = useAurelith((s) => s.promoteFork);
	if (!fork) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-center gap-2 border-b border-warn/40 bg-elevated px-4 py-2 text-xs text-fg md:px-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-2xs tracking-caps text-warn uppercase",
				children: "Side research active"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-muted",
				children: [
					"Fork “",
					fork.label,
					"” — approved scene frozen. Mutations land here until you promote or discard."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "ml-auto flex gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "outline",
					onClick: promote,
					children: "Promote"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "ghost",
					onClick: discard,
					children: "Discard"
				})]
			})
		]
	});
}
function StudioPanel() {
	const pattern = useAurelith((s) => s.pattern);
	const setPattern = useAurelith((s) => s.setPattern);
	const target = useAurelith((s) => s.fork ? s.fork.target : s.target);
	const applyPatch = useAurelith((s) => s.applyPatch);
	const undo = useAurelith((s) => s.undo);
	const setMacro = useAurelith((s) => s.setMacro);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Intro, {
				kicker: "Studio · author",
				title: "Shape one bounded scene. Every value has an index.",
				body: "Eight macros request a target. Properties, fields, and a closed vertex table apply it. Nothing writes a renderer or a device directly. Patch confidence is a simulation until a trial says otherwise."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-2 font-mono text-2xs tracking-caps text-subtle uppercase",
				children: "Geometry language · vertex tables"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-1",
				children: PATTERN_IDS.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: pattern === p ? "solid" : "outline",
					onClick: () => setPattern(p),
					children: [
						"P",
						i,
						" ",
						p,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-2xs opacity-70",
							children: [" V", PATTERN_VERTEX_COUNT[p]]
						})
					]
				}, p))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 font-mono text-2xs tracking-caps text-subtle uppercase",
					children: "Material · specimen index 0–11"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-1",
					children: MATERIAL_SPECIMENS.map((m) => {
						const v = m.index / (MATERIAL_SPECIMENS.length - 1);
						const on = materialIndex(target.material).id === m.id;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: on ? "solid" : "ghost",
							onClick: () => setMacro("material", v, "pointer"),
							children: [
								"M",
								m.index,
								" ",
								m.title
							]
						}, m.id);
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-2xs text-subtle",
					children: [
						"Axis ",
						axisLabel(target.axis),
						". Live pattern P",
						patternIndex(pattern),
						" · V",
						PATTERN_VERTEX_COUNT[pattern],
						". Studio-only until rehearsed."
					]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-col gap-2",
				children: [
					"intensity",
					"depth",
					"atmosphere",
					"focus",
					"material",
					"axis",
					"optical",
					"narrative"
				].map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MacroFader, { id }, id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 font-mono text-2xs tracking-caps text-subtle uppercase",
					children: "Semantic patches · simulation"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-1",
					children: [SEMANTIC_PATCHES.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "outline",
						onClick: () => applyPatch(p.id),
						children: p.label
					}, p.id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: undo,
						children: "Undo"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-2xs text-subtle",
					children: [SEMANTIC_PATCHES[0].note, " Keys: 1–4 select · arrows nudge · Esc stabilize · M mute."]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ManifestDock, {})
		]
	});
}
function StagePanel() {
	const quality = useAurelith((s) => s.quality);
	const setQuality = useAurelith((s) => s.setQuality);
	const audioStatus = useAurelith((s) => s.audioStatus);
	const midi = useAurelith((s) => s.midi);
	const fallback = useAurelith((s) => s.fallback);
	const pattern = useAurelith((s) => s.pattern);
	const sceneName = useAurelith((s) => s.sceneName);
	const revision = useAurelith((s) => s.revision);
	const missing = [];
	if (audioStatus !== "running") missing.push("Audio not running — activate from an intentional gesture.");
	if (fallback) missing.push("A fallback is active — confirm Stabilize language before going on.");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Intro, {
				kicker: "Stage · operator",
				title: "Four protected macros. Named in performance language.",
				body: "Intensity, Depth, Atmosphere, Focus. Material, axis, narrative and optical stay manifest-governed. Optical is simulation-only."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-md border border-border bg-surface p-3 text-xs",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-2xs tracking-caps text-subtle uppercase",
						children: "Loaded"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-fg",
						children: [
							sceneName,
							" · rev ",
							revision,
							" · ",
							pattern,
							" · quality ",
							quality
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 font-mono text-2xs tracking-caps text-subtle uppercase",
						children: "Connected"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-muted",
						children: [
							"Audio ",
							audioStatus,
							". MIDI ",
							midi.status,
							". Pointer and keyboard first-class."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 font-mono text-2xs tracking-caps text-subtle uppercase",
						children: "Missing"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-muted",
						children: missing.length ? missing.join(". ") : "Nothing required is missing."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 font-mono text-2xs tracking-caps text-subtle uppercase",
						children: "Fallback"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-muted",
						children: fallback ?? "Stabilize reduces visual energy first, leaves the audio path, keeps optical simulated."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-2 font-mono text-2xs tracking-caps text-subtle uppercase",
				children: "Quality tier"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-1",
				children: QUALITY_TIERS.map((q) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: quality === q ? "solid" : "outline",
					onClick: () => setQuality(q),
					children: q
				}, q))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-col gap-2",
				children: STAGE_MACROS.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MacroFader, {
					id,
					large: true
				}, id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MidiCard, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ManifestDock, {})
		]
	});
}
function DiagnosticsPanel() {
	const metrics = useAurelith((s) => s.metrics);
	const audioStatus = useAurelith((s) => s.audioStatus);
	const sourceLabel = useAurelith((s) => s.sourceLabel);
	const quality = useAurelith((s) => s.quality);
	const target = useAurelith((s) => s.target);
	const applied = useAurelith((s) => s.appliedSnapshot);
	const midi = useAurelith((s) => s.midi);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Intro, {
				kicker: "Diagnostics · technical lead",
				title: "Source, window, unit. Indices travel with the numbers.",
				body: "A green cue means the bounded runtime accepted a target. It does not certify physical latency, a haptic, or a laser path."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpecPanel, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RendererContract, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-md border border-border bg-surface p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-2xs tracking-caps text-signal uppercase",
						children: "Sync inspector"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-2 grid grid-cols-2 gap-2 font-mono text-2xs tabular-nums md:grid-cols-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
								k: "Audio clock",
								v: metrics.tAudio ? `${metrics.tAudio.toFixed(3)} s` : "n/a"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
								k: "Visual frame",
								v: metrics.tVisual ? `${(metrics.tVisual / 1e3).toFixed(3)} s` : "n/a"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
								k: "Audio state",
								v: audioStatus
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
								k: "FPS / p95",
								v: `${metrics.fps.toFixed(0)} / ${metrics.p95.toFixed(1)} ms`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
								k: "RMS L/M/H",
								v: `${metrics.rms.toFixed(2)} ${metrics.low.toFixed(2)}/${metrics.mid.toFixed(2)}/${metrics.high.toFixed(2)}`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pair, {
								k: "Quality",
								v: quality
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-2xs text-subtle",
						children: sourceLabel
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-2xs text-subtle",
						children: metrics.source
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-left font-mono text-2xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
								className: "text-subtle",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "pb-1 font-medium",
										children: "Macro"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "pb-1 font-medium",
										children: "Target"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "pb-1 font-medium",
										children: "Applied"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "pb-1 font-medium",
										children: "Kind"
									})
								] })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: STAGE_MACROS.concat([
								"material",
								"axis",
								"optical",
								"narrative"
							]).map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-t border-border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-1 text-fg",
										children: MACRO_DEFS[id].name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "text-signal",
										children: target[id].toFixed(2)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "text-botanical",
										children: applied[id].toFixed(2)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "text-subtle",
										children: id === "optical" ? "simulation" : "runtime"
									})
								]
							}, id)) })]
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MidiCard, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "font-mono text-2xs text-subtle",
				children: ["MIDI ports: ", midi.ports.length ? midi.ports.map((p) => `${p.name} (${p.state})`).join(" · ") : "none listed"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResearchLab, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ManifestDock, {})
		]
	});
}
function Pair({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
		className: "text-subtle",
		children: k
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
		className: "text-fg",
		children: v
	})] });
}
function MidiCard() {
	const midi = useAurelith((s) => s.midi);
	const connect = useAurelith((s) => s.connectMidi);
	const toggleLearn = useAurelith((s) => s.toggleLearn);
	const selected = useAurelith((s) => s.selectedMacro);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-md border border-border bg-surface p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-2xs tracking-caps text-subtle uppercase",
					children: "MIDI adapter"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-fg",
					children: [
						midi.status === "idle" && "Not requested. Optional.",
						midi.status === "connected" && "Connected.",
						midi.status === "unavailable" && "Permission granted; no ports.",
						midi.status === "denied" && "Permission denied.",
						midi.status === "unsupported" && "Unsupported in this browser."
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "outline",
					onClick: () => void connect(),
					children: "Connect MIDI"
				})]
			}),
			midi.ports.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 font-mono text-2xs text-muted",
				children: midi.ports.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
					p.name,
					" · ",
					p.manufacturer,
					" · ",
					p.state
				] }, p.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 flex flex-wrap gap-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: midi.learnMacro ? "solid" : "ghost",
					onClick: () => toggleLearn(midi.learnMacro ? null : selected),
					children: midi.learnMacro ? `Learning ${midi.learnMacro}…` : "Learn selected macro"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-2xs text-subtle",
				children: "Disconnect freezes last target. Notes may recall cues only — never a physical output. Keyboard remains live."
			})
		]
	});
}
function ManifestDock() {
	const fileRef = (0, import_react.useRef)(null);
	const [msg, setMsg] = (0, import_react.useState)(null);
	const exportManifest = useAurelith((s) => s.exportManifest);
	const importManifest = useAurelith((s) => s.importManifest);
	const revision = useAurelith((s) => s.revision);
	const metrics = useAurelith((s) => s.metrics);
	const quality = useAurelith((s) => s.quality);
	const pattern = useAurelith((s) => s.pattern);
	const audioStatus = useAurelith((s) => s.audioStatus);
	const midi = useAurelith((s) => s.midi);
	const download = () => {
		const m = exportManifest();
		const blob = new Blob([JSON.stringify(m, null, 2)], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `aurelith-scene-rev${m.revision}.json`;
		a.click();
		URL.revokeObjectURL(url);
		setMsg(`Wrote aurelith-scene-rev${m.revision}.json · schema aurelith.scene.v1`);
	};
	const downloadBench = () => {
		const record = {
			schema: "aurelith.benchmark.v1",
			at: (/* @__PURE__ */ new Date()).toISOString(),
			revision,
			pattern,
			quality,
			audioStatus,
			midi: midi.status,
			metrics,
			limitations: [
				"rAF frame time is not physical audio latency.",
				"Analyser RMS is a visual-control signal.",
				"Window is the live ~1 s sample, not a 10-minute soak unless so labelled.",
				"Optical is simulation-only."
			],
			environment: {
				userAgent: navigator.userAgent,
				hardwareConcurrency: navigator.hardwareConcurrency ?? null,
				devicePixelRatio: window.devicePixelRatio
			}
		};
		const blob = new Blob([JSON.stringify(record, null, 2)], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `aurelith-benchmark-rev${revision}.json`;
		a.click();
		URL.revokeObjectURL(url);
		setMsg("Wrote aurelith-benchmark-revN.json · schema aurelith.benchmark.v1");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-md border border-border bg-surface p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-2xs tracking-caps text-subtle uppercase",
				children: "Manifest handoff"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-xs leading-relaxed text-muted",
				children: [
					"File type is JSON. Schema id ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-fg",
						children: "aurelith.scene.v1"
					}),
					". MIME",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-fg",
						children: "application/json"
					}),
					". Filename",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-mono text-fg",
						children: [
							"aurelith-scene-rev",
							revision,
							".json"
						]
					}),
					". Load rejects any other schema. Optical is labelled simulation-only inside the file."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex flex-wrap gap-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "solid",
						onClick: download,
						children: "Export JSON"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "outline",
						onClick: () => fileRef.current?.click(),
						children: "Load JSON"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: downloadBench,
						children: "Export benchmark"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: fileRef,
				type: "file",
				accept: "application/json,.json",
				className: "hidden",
				onChange: async (e) => {
					const file = e.target.files?.[0];
					if (!file) return;
					const text = await file.text();
					const result = importManifest(text);
					setMsg(result.ok ? `Loaded ${file.name}. Schema aurelith.scene.v1. Confirm Target / Applied / fallback.` : result.error ?? "Load failed — expected JSON with schema aurelith.scene.v1.");
					e.target.value = "";
				}
			}),
			msg && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-2xs text-signal",
				children: msg
			})
		]
	});
}
function Intro({ kicker, title, body }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-mono text-2xs tracking-caps text-signal uppercase",
			children: kicker
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mt-1 font-display text-xl tracking-display text-fg",
			children: title
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm leading-relaxed text-muted",
			children: body
		})
	] });
}
var routes_exports = /* @__PURE__ */ __exportAll({ component: () => Home });
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AurelithShell, {});
}
//#endregion
export { useAurelith as a, assign as c, hot as i, verticesFor as n, BOUNDS as o, stepRuntime as r, MATERIAL_COLORS as s, routes_exports as t };
