import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { i as useThree, r as useFrame, t as Canvas } from "../_libs/@react-three/fiber+[...].mjs";
import { a as useAurelith, c as assign, i as hot, n as verticesFor, o as BOUNDS, r as stepRuntime, s as MATERIAL_COLORS } from "./routes-CN-pePUF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/scene-r3f-canvas-BdVK7J_M.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function tokenColor(name, fallback) {
	if (typeof window === "undefined") return fallback;
	return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}
function ClosedGraph() {
	const group = (0, import_react.useRef)(null);
	const patternMat = (0, import_react.useRef)(null);
	const particleMat = (0, import_react.useRef)(null);
	const lastPush = (0, import_react.useRef)(0);
	const frameTimes = (0, import_react.useRef)([]);
	const { camera, scene } = useThree();
	const quality = useAurelith((s) => s.quality);
	const pattern = useAurelith((s) => s.fork ? s.fork.pattern : s.pattern);
	const verts = verticesFor(pattern);
	const particleN = BOUNDS.particle[quality];
	const positions = (0, import_react.useMemo)(() => {
		const arr = new Float32Array(verts.length * 3);
		verts.forEach((v, i) => {
			arr[i * 3] = v.x;
			arr[i * 3 + 1] = v.y;
			arr[i * 3 + 2] = (v.layer - 1) * .12;
		});
		return arr;
	}, [verts]);
	const particles = (0, import_react.useMemo)(() => {
		const arr = new Float32Array(Math.max(particleN, 1) * 3);
		for (let i = 0; i < particleN; i += 1) {
			const a = i / Math.max(particleN, 1) * Math.PI * 2;
			const r = .2 + i % 17 * .035;
			arr[i * 3] = Math.cos(a) * r;
			arr[i * 3 + 1] = Math.sin(a) * r;
			arr[i * 3 + 2] = (i % 5 - 2) * .05;
		}
		return arr;
	}, [particleN]);
	useFrame((st, dt) => {
		const state = useAurelith.getState();
		const target = state.fork ? state.fork.target : state.target;
		const pat = state.fork ? state.fork.pattern : state.pattern;
		const step = Math.min(BOUNDS.dtMax, dt);
		stepRuntime(step, target, state.quality);
		const frame = assign(hot.applied, state.quality, pat);
		const g = group.current;
		if (g) {
			g.rotation.y = (frame.axis - .5) * .7;
			g.rotation.x = (frame.focus - .5) * .28;
			g.position.z = (.5 - frame.fog) * .35;
		}
		camera.position.z = 2.1 + frame.fog * 1.2;
		const fog = scene.fog;
		if (fog) {
			fog.near = 2.2 + (1 - frame.haze) * 2;
			fog.far = 7 + (1 - frame.haze) * 4;
		}
		if (patternMat.current) {
			patternMat.current.color.set(frame.colors[0]);
			patternMat.current.size = .032 + frame.energy * .055;
			patternMat.current.opacity = .35 + frame.energy * .55;
		}
		if (particleMat.current) particleMat.current.opacity = .28 + frame.haze * .3;
		const frameMs = step * 1e3;
		const times = frameTimes.current;
		times.push(frameMs);
		if (times.length > BOUNDS.fpsWindow) times.shift();
		const sorted = [...times].sort((a, b) => a - b);
		const p95 = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * .95))] ?? frameMs;
		hot.fps = step > 0 ? 1 / step : 0;
		hot.frameMs = frameMs;
		hot.p95 = p95;
		hot.tVisual = st.clock.elapsedTime * 1e3;
		hot.particles = frame.particleCount;
		hot.vertices = verts.length;
		const now = performance.now();
		if (now - lastPush.current > BOUNDS.metricsPushMs) {
			lastPush.current = now;
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
				source: "r3f / three.js · closed vertex table · not a general scene graph"
			});
		}
	});
	const bg = tokenColor("--color-void", "#050608");
	const hex = MATERIAL_COLORS[2][0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("color", {
			attach: "background",
			args: [bg]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("fog", {
			attach: "fog",
			args: [
				bg,
				3.2,
				9
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
			ref: group,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("points", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("bufferGeometry", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("bufferAttribute", {
					attach: "attributes-position",
					args: [positions, 3]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointsMaterial", {
					ref: patternMat,
					color: hex,
					size: .04,
					transparent: true,
					opacity: .7,
					sizeAttenuation: true,
					depthWrite: false
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("lineLoop", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("bufferGeometry", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("bufferAttribute", {
					attach: "attributes-position",
					args: [positions, 3]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("lineBasicMaterial", {
					color: hex,
					transparent: true,
					opacity: .7
				})] }),
				particleN > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("points", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("bufferGeometry", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("bufferAttribute", {
					attach: "attributes-position",
					args: [particles, 3]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointsMaterial", {
					ref: particleMat,
					color: tokenColor("--color-fg", "#ece7dc"),
					size: .018,
					transparent: true,
					opacity: .4,
					depthWrite: false
				})] }) : null
			]
		})
	] });
}
function SceneR3FCanvas() {
	const quality = useAurelith((s) => s.quality);
	const dprCap = BOUNDS.dpr[quality];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Canvas, {
		className: "h-full w-full touch-none",
		dpr: [1, dprCap],
		gl: {
			antialias: false,
			alpha: false,
			powerPreference: "high-performance"
		},
		camera: {
			position: [
				0,
				0,
				2.6
			],
			fov: 42
		},
		frameloop: "always",
		"aria-label": "AURELITH field · three.js / r3f · closed vertex table",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClosedGraph, {})
	});
}
//#endregion
export { SceneR3FCanvas };
