import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { MacroFader } from "@/components/aurelith/macro-fader";
import { ResearchLab } from "@/components/aurelith/research-lab";
import { SceneCanvas } from "@/components/aurelith/scene-canvas";
import { SceneR3F } from "@/components/aurelith/scene-r3f";
import { SpecPanel } from "@/components/aurelith/spec-panel";
import { ProductNav, Wordmark } from "@/components/aurelith/wordmark";
import { MACRO_DEFS, axisLabel, materialIndex } from "@/lib/aurelith/macros";
import { probeRenderers, type RendererCaps } from "@/lib/aurelith/capabilities";
import { MATERIAL_SPECIMENS, PATTERN_VERTEX_COUNT, patternIndex } from "@/lib/aurelith/spec";
import { SEMANTIC_PATCHES, loadPersisted, useAurelith } from "@/lib/aurelith/store";
import { PATTERN_IDS, QUALITY_TIERS, STAGE_MACROS, type MacroId, type Mode } from "@/lib/aurelith/types";
import { cn } from "@/lib/utils";

const MODES: { id: Mode; label: string; audience: string }[] = [
  { id: "studio", label: "Studio", audience: "Author" },
  { id: "stage", label: "Stage", audience: "Operator" },
  { id: "diagnostics", label: "Diagnostics", audience: "Technical lead" },
];

type FieldRenderer = "canvas2d" | "three";

const FieldCtx = createContext<{
  field: FieldRenderer;
  setField: (f: FieldRenderer) => void;
}>({ field: "canvas2d", setField: () => {} });

function useFieldRenderer() {
  return useContext(FieldCtx);
}

export function AurelithShell() {
  const mode = useAurelith((s) => s.mode);
  const audioStatus = useAurelith((s) => s.audioStatus);
  const activate = useAurelith((s) => s.activateAudio);
  const [field, setField] = useState<FieldRenderer>("canvas2d");

  useEffect(() => {
    const persisted = loadPersisted();
    if (persisted) useAurelith.getState().importManifest(JSON.stringify(persisted));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) return;
      const s = useAurelith.getState();
      if (e.key === "Enter" && s.audioStatus !== "running") {
        e.preventDefault();
        void s.activateAudio();
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
      if (e.key === "[" || e.key === "p") s.nudge(-0.04, "keyboard");
      if (e.key === "]" || e.key === "n") s.nudge(0.04, "keyboard");
      if (e.key === "1") s.selectMacro("intensity");
      if (e.key === "2") s.selectMacro("depth");
      if (e.key === "3") s.selectMacro("atmosphere");
      if (e.key === "4") s.selectMacro("focus");
      if (e.key === "ArrowUp") {
        e.preventDefault();
        s.nudge(0.02, "keyboard");
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        s.nudge(-0.02, "keyboard");
      }
    };
    window.addEventListener("keydown", onKey);
    const vis = () => {
      if (document.visibilityState === "visible" && useAurelith.getState().audioStatus !== "locked") {
        void useAurelith.getState().activateAudio();
      }
    };
    document.addEventListener("visibilitychange", vis);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", vis);
    };
  }, []);

  return (
    <FieldCtx.Provider value={{ field, setField }}>
    <div className="flex h-dvh flex-col overflow-hidden bg-bg text-fg">
      <TopBar />
      <ForkBanner />
      <div className="grid min-h-0 min-w-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        <section className="relative min-h-[40vh] min-w-0 overflow-hidden border-b border-border lg:min-h-0 lg:border-r lg:border-b-0">
          {field === "three" ? <SceneR3F /> : <SceneCanvas />}
          {audioStatus !== "running" && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-start p-3 md:p-4">
              <div className="pointer-events-auto max-w-md rounded-md border border-border bg-surface/95 px-4 py-3 shadow-sm">
                <p className="font-mono text-2xs tracking-caps text-signal uppercase">Audio is locked</p>
                <p className="mt-1 text-sm text-fg">Every scene begins as a signal. No microphone. Optical stays a simulation.</p>
                <Button className="mt-2" size="sm" onClick={() => void activate()}>
                  Activate audio
                </Button>
              </div>
            </div>
          )}
        </section>
        <aside className="min-h-0 min-w-0 overflow-x-hidden overflow-y-auto bg-bg">
          <div className="px-4 py-4 md:px-5 md:py-5">
            {mode === "studio" && <StudioPanel />}
            {mode === "stage" && <StagePanel />}
            {mode === "diagnostics" && <DiagnosticsPanel />}
          </div>
        </aside>
      </div>
    </div>
    </FieldCtx.Provider>
  );
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

  return (
    <header className="identity-bar border-b border-border bg-surface">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 md:px-5">
        <div className="min-w-0 flex-1">
          <Wordmark />
          <p className="mt-1 truncate font-mono text-2xs tracking-caps text-muted uppercase">
            Bounded scene · rev {revision}
            {dirty ? " · dirty" : ""} · {sceneName}
          </p>
        </div>
        <ProductNav active="scene" />
        <nav className="flex rounded-md border border-border p-0.5" aria-label="Role">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={cn(
                "min-h-11 rounded-sm px-3 py-1.5 text-xs font-medium transition-colors duration-150",
                mode === m.id ? "bg-fg text-bg" : "text-muted hover:text-fg",
              )}
            >
              {m.label}
            </button>
          ))}
        </nav>
      </div>
      <p className="border-t border-border px-4 py-2 text-xs leading-relaxed text-muted md:px-5">
        <span className="sm:hidden">A bounded audiovisual instrument. Optical is a simulation.</span>
        <span className="hidden sm:inline">
          A bounded audiovisual instrument for authors, operators, and technical leads. Eight macros request a target.
          Lookdev is the optical grammar. Optical is a simulation — no beam, no haptic, no health claim.
        </span>
      </p>
      <div className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-2 font-mono text-2xs tracking-caps text-muted uppercase md:px-5">
        <Status tone={audioStatus === "running" ? "ok" : audioStatus === "locked" ? "warn" : "bad"} label={`audio ${audioStatus}`} />
        <Status tone={quality === "SAFE" ? "warn" : "ok"} label={`quality ${quality}`} />
        <Status tone={midi === "connected" ? "ok" : "idle"} label={`midi ${midi}`} />
        <Status tone={fallback ? "warn" : "idle"} label={fallback ? "fallback on" : "fallback none"} />
        <FieldToggle />
        <div className="ml-auto flex flex-wrap gap-1">
          {audioStatus !== "running" ? (
            <Button size="sm" variant="solid" onClick={() => void activate()}>
              Activate
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setMuted(!muted)}>
              {muted ? "Unmute" : "Mute"}
            </Button>
          )}
          <Button size="sm" variant="subtle" onClick={() => stabilize()}>
            Stabilize
          </Button>
        </div>
      </div>
    </header>
  );
}

function Status({ tone, label }: { tone: "ok" | "warn" | "bad" | "idle"; label: string }) {
  const c =
    tone === "ok" ? "bg-botanical" : tone === "warn" ? "bg-warn" : tone === "bad" ? "bg-danger" : "bg-subtle";
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("size-1.5 rounded-full", c)} />
      {label}
    </span>
  );
}

function FieldToggle() {
  const { field, setField } = useFieldRenderer();
  return (
    <span className="inline-flex items-center gap-1" aria-label="Field renderer">
      <button
        type="button"
        className={cn("h-11 rounded-sm px-2", field === "canvas2d" ? "bg-fg text-bg" : "text-muted hover:text-fg")}
        onClick={() => setField("canvas2d")}
      >
        Canvas 2D
      </button>
      <button
        type="button"
        className={cn("h-11 rounded-sm px-2", field === "three" ? "bg-fg text-bg" : "text-muted hover:text-fg")}
        onClick={() => setField("three")}
      >
        three.js / r3f
      </button>
    </span>
  );
}

function RendererContract() {
  const [caps, setCaps] = useState<RendererCaps | null>(null);
  const { field } = useFieldRenderer();
  useEffect(() => {
    void probeRenderers().then(setCaps);
  }, []);
  const rows: [string, string][] = [
    ["Lookdev", "GLSL ES 3.00 on WebGL2. The live optical sketch."],
    ["WebGPU", "WGSL from Lookdev → Proof → Backends. Same operators. Not switched live until proven."],
    ["HLSL / Unity", "URP shader AURELITH/Grammar/{Specimen} + AurelithGrammarBinder.cs. Optical locked."],
    ["three.js / r3f", "Closed graph: camera, fog, vertex table, particles. No GLTF, no unbounded scene."],
    ["This field", field === "three" ? "three.js / r3f" : "Canvas 2D (default, bounded draw)"],
  ];
  return (
    <section className="rounded-md border border-border bg-surface p-3">
      <p className="font-mono text-2xs tracking-caps text-signal uppercase">Renderer contract</p>
      <p className="mt-2 text-xs leading-relaxed text-muted">
        Shader Grammar is the IR. These runtimes consume it. None of them is a physical beam.
      </p>
      <ul className="mt-3 space-y-2">
        {rows.map(([k, v]) => (
          <li key={k}>
            <p className="font-mono text-2xs tracking-caps text-subtle uppercase">{k}</p>
            <p className="text-xs text-fg">{v}</p>
          </li>
        ))}
      </ul>
      {caps ? (
        <p className="mt-3 font-mono text-2xs text-muted">
          WebGL2 {caps.webgl2 ? "yes" : "no"} · WebGPU {caps.webgpu ? "yes" : "no"} · {caps.adapter} · three.js{" "}
          {caps.three ? "yes" : "no"} · r3f {caps.r3f ? "yes" : "no"}
        </p>
      ) : (
        <p className="mt-3 font-mono text-2xs text-subtle">Probing this browser…</p>
      )}
    </section>
  );
}

function ForkBanner() {
  const fork = useAurelith((s) => s.fork);
  const discard = useAurelith((s) => s.discardFork);
  const promote = useAurelith((s) => s.promoteFork);
  if (!fork) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-warn/40 bg-elevated px-4 py-2 text-xs text-fg md:px-5">
      <span className="font-mono text-2xs tracking-caps text-warn uppercase">Side research active</span>
      <span className="text-muted">
        Fork “{fork.label}” — approved scene frozen. Mutations land here until you promote or discard.
      </span>
      <div className="ml-auto flex gap-1">
        <Button size="sm" variant="outline" onClick={promote}>
          Promote
        </Button>
        <Button size="sm" variant="ghost" onClick={discard}>
          Discard
        </Button>
      </div>
    </div>
  );
}

function StudioPanel() {
  const pattern = useAurelith((s) => s.pattern);
  const setPattern = useAurelith((s) => s.setPattern);
  const target = useAurelith((s) => (s.fork ? s.fork.target : s.target));
  const applyPatch = useAurelith((s) => s.applyPatch);
  const undo = useAurelith((s) => s.undo);
  const setMacro = useAurelith((s) => s.setMacro);
  const studioMacros: MacroId[] = [
    "intensity",
    "depth",
    "atmosphere",
    "focus",
    "material",
    "axis",
    "optical",
    "narrative",
  ];

  return (
    <div className="flex flex-col gap-5">
      <Intro
        kicker="Studio · author"
        title="Shape one bounded scene. Every value has an index."
        body="Eight macros request a target. Properties, fields, and a closed vertex table apply it. Nothing writes a renderer or a device directly. Patch confidence is a simulation until a trial says otherwise."
      />
      <div>
        <p className="mb-2 font-mono text-2xs tracking-caps text-subtle uppercase">Geometry language · vertex tables</p>
        <div className="flex flex-wrap gap-1">
          {PATTERN_IDS.map((p, i) => (
            <Button key={p} size="sm" variant={pattern === p ? "solid" : "outline"} onClick={() => setPattern(p)}>
              P{i} {p}
              <span className="text-2xs opacity-70"> V{PATTERN_VERTEX_COUNT[p]}</span>
            </Button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 font-mono text-2xs tracking-caps text-subtle uppercase">Material · specimen index 0–11</p>
        <div className="flex flex-wrap gap-1">
          {MATERIAL_SPECIMENS.map((m) => {
            const v = m.index / (MATERIAL_SPECIMENS.length - 1);
            const on = materialIndex(target.material).id === m.id;
            return (
              <Button key={m.id} size="sm" variant={on ? "solid" : "ghost"} onClick={() => setMacro("material", v, "pointer")}>
                M{m.index} {m.title}
              </Button>
            );
          })}
        </div>
        <p className="mt-1 text-2xs text-subtle">
          Axis {axisLabel(target.axis)}. Live pattern P{patternIndex(pattern)} · V{PATTERN_VERTEX_COUNT[pattern]}. Studio-only until rehearsed.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {studioMacros.map((id) => (
          <MacroFader key={id} id={id} />
        ))}
      </div>
      <div>
        <p className="mb-2 font-mono text-2xs tracking-caps text-subtle uppercase">Semantic patches · simulation</p>
        <div className="flex flex-wrap gap-1">
          {SEMANTIC_PATCHES.map((p) => (
            <Button key={p.id} size="sm" variant="outline" onClick={() => applyPatch(p.id)}>
              {p.label}
            </Button>
          ))}
          <Button size="sm" variant="ghost" onClick={undo}>
            Undo
          </Button>
        </div>
        <p className="mt-1 text-2xs text-subtle">
          {SEMANTIC_PATCHES[0].note} Keys: 1–4 select · arrows nudge · Esc stabilize · M mute.
        </p>
      </div>
      <ManifestDock />
    </div>
  );
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

  const missing: string[] = [];
  if (audioStatus !== "running") missing.push("Audio not running — activate from an intentional gesture.");
  if (fallback) missing.push("A fallback is active — confirm Stabilize language before going on.");

  return (
    <div className="flex flex-col gap-5">
      <Intro
        kicker="Stage · operator"
        title="Four protected macros. Named in performance language."
        body="Intensity, Depth, Atmosphere, Focus. Material, axis, narrative and optical stay manifest-governed. Optical is simulation-only."
      />
      <div className="rounded-md border border-border bg-surface p-3 text-xs">
        <p className="font-mono text-2xs tracking-caps text-subtle uppercase">Loaded</p>
        <p className="mt-1 text-fg">
          {sceneName} · rev {revision} · {pattern} · quality {quality}
        </p>
        <p className="mt-2 font-mono text-2xs tracking-caps text-subtle uppercase">Connected</p>
        <p className="mt-1 text-muted">
          Audio {audioStatus}. MIDI {midi.status}. Pointer and keyboard first-class.
        </p>
        <p className="mt-2 font-mono text-2xs tracking-caps text-subtle uppercase">Missing</p>
        <p className="mt-1 text-muted">{missing.length ? missing.join(". ") : "Nothing required is missing."}</p>
        <p className="mt-2 font-mono text-2xs tracking-caps text-subtle uppercase">Fallback</p>
        <p className="mt-1 text-muted">
          {fallback ?? "Stabilize reduces visual energy first, leaves the audio path, keeps optical simulated."}
        </p>
      </div>
      <div>
        <p className="mb-2 font-mono text-2xs tracking-caps text-subtle uppercase">Quality tier</p>
        <div className="flex gap-1">
          {QUALITY_TIERS.map((q) => (
            <Button key={q} size="sm" variant={quality === q ? "solid" : "outline"} onClick={() => setQuality(q)}>
              {q}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {STAGE_MACROS.map((id) => (
          <MacroFader key={id} id={id} large />
        ))}
      </div>
      <MidiCard />
      <ManifestDock />
    </div>
  );
}

function DiagnosticsPanel() {
  const metrics = useAurelith((s) => s.metrics);
  const audioStatus = useAurelith((s) => s.audioStatus);
  const sourceLabel = useAurelith((s) => s.sourceLabel);
  const quality = useAurelith((s) => s.quality);
  const target = useAurelith((s) => s.target);
  const applied = useAurelith((s) => s.appliedSnapshot);
  const midi = useAurelith((s) => s.midi);

  return (
    <div className="flex flex-col gap-5">
      <Intro
        kicker="Diagnostics · technical lead"
        title="Source, window, unit. Indices travel with the numbers."
        body="A green cue means the bounded runtime accepted a target. It does not certify physical latency, a haptic, or a laser path."
      />
      <SpecPanel />
      <RendererContract />
      <section className="rounded-md border border-border bg-surface p-3">
        <p className="font-mono text-2xs tracking-caps text-signal uppercase">Sync inspector</p>
        <dl className="mt-2 grid grid-cols-2 gap-2 font-mono text-2xs tabular-nums md:grid-cols-3">
          <Pair k="Audio clock" v={metrics.tAudio ? `${metrics.tAudio.toFixed(3)} s` : "n/a"} />
          <Pair k="Visual frame" v={metrics.tVisual ? `${(metrics.tVisual / 1000).toFixed(3)} s` : "n/a"} />
          <Pair k="Audio state" v={audioStatus} />
          <Pair k="FPS / p95" v={`${metrics.fps.toFixed(0)} / ${metrics.p95.toFixed(1)} ms`} />
          <Pair k="RMS L/M/H" v={`${metrics.rms.toFixed(2)} ${metrics.low.toFixed(2)}/${metrics.mid.toFixed(2)}/${metrics.high.toFixed(2)}`} />
          <Pair k="Quality" v={quality} />
        </dl>
        <p className="mt-2 text-2xs text-subtle">{sourceLabel}</p>
        <p className="mt-1 text-2xs text-subtle">{metrics.source}</p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left font-mono text-2xs">
            <thead className="text-subtle">
              <tr>
                <th className="pb-1 font-medium">Macro</th>
                <th className="pb-1 font-medium">Target</th>
                <th className="pb-1 font-medium">Applied</th>
                <th className="pb-1 font-medium">Kind</th>
              </tr>
            </thead>
            <tbody>
              {STAGE_MACROS.concat(["material", "axis", "optical", "narrative"]).map((id) => (
                <tr key={id} className="border-t border-border">
                  <td className="py-1 text-fg">{MACRO_DEFS[id].name}</td>
                  <td className="text-signal">{target[id].toFixed(2)}</td>
                  <td className="text-botanical">{applied[id].toFixed(2)}</td>
                  <td className="text-subtle">{id === "optical" ? "simulation" : "runtime"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <MidiCard />
      <p className="font-mono text-2xs text-subtle">
        MIDI ports: {midi.ports.length ? midi.ports.map((p) => `${p.name} (${p.state})`).join(" · ") : "none listed"}
      </p>
      <ResearchLab />
      <ManifestDock />
    </div>
  );
}

function Pair({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-subtle">{k}</dt>
      <dd className="text-fg">{v}</dd>
    </div>
  );
}

function MidiCard() {
  const midi = useAurelith((s) => s.midi);
  const connect = useAurelith((s) => s.connectMidi);
  const toggleLearn = useAurelith((s) => s.toggleLearn);
  const selected = useAurelith((s) => s.selectedMacro);

  return (
    <section className="rounded-md border border-border bg-surface p-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="font-mono text-2xs tracking-caps text-subtle uppercase">MIDI adapter</p>
          <p className="text-xs text-fg">
            {midi.status === "idle" && "Not requested. Optional."}
            {midi.status === "connected" && "Connected."}
            {midi.status === "unavailable" && "Permission granted; no ports."}
            {midi.status === "denied" && "Permission denied."}
            {midi.status === "unsupported" && "Unsupported in this browser."}
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => void connect()}>
          Connect MIDI
        </Button>
      </div>
      {midi.ports.length > 0 && (
        <ul className="mt-2 font-mono text-2xs text-muted">
          {midi.ports.map((p) => (
            <li key={p.id}>
              {p.name} · {p.manufacturer} · {p.state}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-2 flex flex-wrap gap-1">
        <Button
          size="sm"
          variant={midi.learnMacro ? "solid" : "ghost"}
          onClick={() => toggleLearn(midi.learnMacro ? null : selected)}
        >
          {midi.learnMacro ? `Learning ${midi.learnMacro}…` : "Learn selected macro"}
        </Button>
      </div>
      <p className="mt-2 text-2xs text-subtle">
        Disconnect freezes last target. Notes may recall cues only — never a physical output. Keyboard remains live.
      </p>
    </section>
  );
}

function ManifestDock() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);
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
      at: new Date().toISOString(),
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
        "Optical is simulation-only.",
      ],
      environment: {
        userAgent: navigator.userAgent,
        hardwareConcurrency: navigator.hardwareConcurrency ?? null,
        devicePixelRatio: window.devicePixelRatio,
      },
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

  return (
    <section className="rounded-md border border-border bg-surface p-3">
      <p className="font-mono text-2xs tracking-caps text-subtle uppercase">Manifest handoff</p>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        File type is JSON. Schema id <span className="font-mono text-fg">aurelith.scene.v1</span>. MIME{" "}
        <span className="font-mono text-fg">application/json</span>. Filename{" "}
        <span className="font-mono text-fg">aurelith-scene-rev{revision}.json</span>. Load rejects any other schema.
        Optical is labelled simulation-only inside the file.
      </p>
      <div className="mt-2 flex flex-wrap gap-1">
        <Button size="sm" variant="solid" onClick={download}>
          Export JSON
        </Button>
        <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
          Load JSON
        </Button>
        <Button size="sm" variant="ghost" onClick={downloadBench}>
          Export benchmark
        </Button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const text = await file.text();
          const result = importManifest(text);
          setMsg(
            result.ok
              ? `Loaded ${file.name}. Schema aurelith.scene.v1. Confirm Target / Applied / fallback.`
              : result.error ?? "Load failed — expected JSON with schema aurelith.scene.v1.",
          );
          e.target.value = "";
        }}
      />
      {msg && <p className="mt-2 text-2xs text-signal">{msg}</p>}
    </section>
  );
}

function Intro({ kicker, title, body }: { kicker: string; title: string; body: string }) {
  return (
    <div>
      <p className="font-mono text-2xs tracking-caps text-signal uppercase">{kicker}</p>
      <h2 className="mt-1 font-display text-xl tracking-display text-fg">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}
