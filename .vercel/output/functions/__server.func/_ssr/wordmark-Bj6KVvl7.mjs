import "../_runtime.mjs";
import { o as require_jsx_runtime, r as Slot, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { i as SliderTrack, n as SliderRange, r as SliderThumb, t as Slider$1 } from "../_libs/@radix-ui/react-slider+[...].mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap font-sans font-medium transition-[transform,background-color,color,border-color,opacity] duration-150 ease-out select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-40 active:not-disabled:scale-[0.96] [&_svg]:pointer-events-none [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-accent text-accent-fg hover:bg-accent/90",
			solid: "bg-fg text-bg hover:bg-fg/90",
			outline: "border border-border bg-transparent text-fg hover:bg-elevated",
			ghost: "text-muted hover:bg-elevated hover:text-fg",
			subtle: "bg-elevated text-fg hover:bg-elevated/80"
		},
		size: {
			default: "h-11 rounded-md px-4 text-sm",
			sm: "h-9 rounded-sm px-3 text-xs",
			lg: "h-12 rounded-md px-5 text-sm",
			icon: "size-11 rounded-md",
			"icon-sm": "size-9 rounded-sm"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		"data-slot": "button",
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		...props
	});
}
var empty = () => ({
	webgl2: false,
	webgpu: false,
	adapter: "not probed",
	three: false,
	r3f: false,
	probedAt: 0
});
async function probeRenderers() {
	const caps = empty();
	caps.probedAt = Date.now();
	try {
		caps.webgl2 = !!document.createElement("canvas").getContext("webgl2");
	} catch {
		caps.webgl2 = false;
	}
	try {
		const gpu = navigator.gpu;
		if (gpu?.requestAdapter) {
			const adapter = await gpu.requestAdapter();
			caps.webgpu = !!adapter;
			caps.adapter = adapter?.info?.device || adapter?.info?.description || (adapter ? "adapter present" : "no adapter");
		} else caps.adapter = "navigator.gpu missing";
	} catch {
		caps.webgpu = false;
		caps.adapter = "requestAdapter failed";
	}
	try {
		await import("../_libs/@react-three/fiber+[...].mjs").then((n) => n.a);
		caps.three = true;
	} catch {
		caps.three = false;
	}
	try {
		await import("../_libs/@react-three/fiber+[...].mjs").then((n) => n.n);
		caps.r3f = true;
	} catch {
		caps.r3f = false;
	}
	return caps;
}
function Slider({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Slider$1, {
		"data-slot": "slider",
		className: cn("relative flex h-11 w-full touch-none items-center select-none", className),
		...props,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderTrack, {
			className: "relative h-1 w-full grow overflow-hidden rounded-full bg-elevated",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderRange, { className: "absolute h-full bg-fg/70" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderThumb, { className: "block size-3.5 rounded-full border border-border bg-fg shadow-sm transition-transform duration-150 ease-out hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent" })]
	});
}
function Wordmark({ href = "/", size = "md", className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: href,
		className: cn("wordmark group min-h-11 min-w-11", className),
		"aria-label": "AURELITH home",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("wordmark-text", size === "sm" ? "text-xl" : "text-2xl md:text-3xl"),
			children: "AURELITH"
		})
	});
}
function ProductNav({ active }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
		className: "flex rounded-md border border-border p-0.5",
		"aria-label": "Product",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/",
			className: cn("inline-flex h-11 min-w-11 items-center px-3 text-sm font-medium transition-colors duration-150", active === "scene" ? "rounded-sm bg-fg text-bg" : "text-muted hover:text-fg"),
			children: "Scene"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/grammar",
			className: cn("inline-flex h-11 min-w-11 items-center px-3 text-sm font-medium transition-colors duration-150", active === "lookdev" ? "rounded-sm bg-fg text-bg" : "text-muted hover:text-fg"),
			children: "Lookdev"
		})]
	});
}
//#endregion
export { cn as a, Wordmark as i, ProductNav as n, probeRenderers as o, Slider as r, Button as t };
