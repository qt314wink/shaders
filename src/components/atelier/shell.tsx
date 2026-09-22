import { useEffect, useState } from "react";
import { BackendsPanel } from "@/components/atelier/backends-panel";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { PreviewCanvas } from "@/components/grammar/preview-canvas";
import { ProductNav, Wordmark } from "@/components/aurelith/wordmark";
import { FINGERPRINTS, fingerprintOf, fusionKind } from "@/lib/atelier/fingerprints";
import { applyPhysicalKnobs, controlsFor } from "@/lib/grammar/knobs";
import { sharedWith } from "@/lib/grammar/resolve";
import {
  SPECIMEN_ORDER,
  bundle,
  loadStoredSpecimen,
  recipeById,
  useGrammar,
  type StudioMode,
} from "@/lib/grammar/store";
import { uniformsFromRecipe } from "@/lib/grammar/uniforms";
import { cn } from "@/lib/utils";

const MODES: { id: StudioMode; label: string }[] = [
  { id: "look", label: "Look" },
  { id: "fuse", label: "Fuse" },
  { id: "proof", label: "Proof" },
];

function shortOp(id: string) {
  return id.replace(/-interference|-transport|-scatter|-weight|-integrate/g, "");
}

export function NacreAtelier() {
  const setSpecimen = useGrammar((s) => s.setSpecimen);
  const cycleSpecimen = useGrammar((s) => s.cycleSpecimen);
  const resetKnobs = useGrammar((s) => s.resetKnobs);
  const setMode = useGrammar((s) => s.setMode);
  const mode = useGrammar((s) => s.mode);

  useEffect(() => {
    const stored = loadStoredSpecimen();
    if (stored && stored !== useGrammar.getState().specimenId) setSpecimen(stored);
  }, [setSpecimen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) return;
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        cycleSpecimen(1);
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        cycleSpecimen(-1);
      } else if (e.key === "r") {
        resetKnobs();
      } else if (e.key === "l") {
        setMode("look");
      } else if (e.key === "f") {
        setMode("fuse");
      } else if (e.key === "p") {
        setMode("proof");
      } else if (/^[1-9]$/.test(e.key)) {
        const i = Number(e.key) - 1;
        if (SPECIMEN_ORDER[i]) setSpecimen(SPECIMEN_ORDER[i]);
      } else if (e.key === "0") {
        setSpecimen(SPECIMEN_ORDER[9]);
      } else if (e.key === "-") {
        setSpecimen(SPECIMEN_ORDER[10]);
      } else if (e.key === "=") {
        setSpecimen(SPECIMEN_ORDER[11]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cycleSpecimen, resetKnobs, setMode, setSpecimen]);

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-bg text-fg">
      <Header />
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,26rem)]">
        <section className="relative flex min-h-0 min-w-0 flex-col">
          <div className="relative min-h-[42vh] flex-1 bg-void lg:min-h-0">
            <PreviewCanvas />
            <StageCaption />
          </div>
          <SpecimenRail />
        </section>
        <aside className="min-h-0 overflow-y-auto border-t border-border bg-bg lg:border-t-0 lg:border-l">
          {mode === "look" && <LookPanel />}
          {mode === "fuse" && <FusePanel />}
          {mode === "proof" && <ProofPanel />}
        </aside>
      </div>
    </div>
  );
}

function Header() {
  const mode = useGrammar((s) => s.mode);
  const setMode = useGrammar((s) => s.setMode);
  return (
    <header className="identity-bar border-b border-border bg-surface">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 md:px-5">
        <div className="min-w-0 flex-1">
          <Wordmark size="sm" />
          <p className="mt-1 font-mono text-2xs tracking-caps text-muted uppercase">Lookdev · Shader Grammar v0.1</p>
        </div>
        <ProductNav active="lookdev" />
        <nav className="flex rounded-md border border-border p-0.5" aria-label="Studio mode">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={cn(
                "h-11 min-w-16 rounded-sm px-3 text-sm font-medium transition-colors duration-150 ease-out",
                mode === m.id ? "bg-fg text-bg" : "text-muted hover:text-fg",
              )}
            >
              {m.label}
            </button>
          ))}
        </nav>
        <div
          className={cn(
            "rounded-sm px-2.5 py-1 font-mono text-2xs tracking-caps uppercase",
            bundle.report.passed ? "bg-pass/15 text-pass" : "bg-danger/15 text-danger",
          )}
        >
          <span className="sm:hidden">{bundle.report.passed ? "pass" : "fail"}</span>
          <span className="hidden sm:inline">{bundle.report.passed ? "validation pass" : "validation fail"}</span>
        </div>
        <Button asChild variant="solid" size="sm">
          <a href="/shader-grammar-v0.1.zip" download>
            ZIP
          </a>
        </Button>
      </div>
      <p className="border-t border-border px-4 py-2 text-xs leading-relaxed text-muted md:px-5">
        <span className="sm:hidden">Lookdev. Twelve specimens, shared operators, physical knobs.</span>
        <span className="hidden sm:inline">
          Nacre Atelier is lookdev for twelve specimens described by shared optical operators — not named-effect flags.
          Knobs write physical quantities with units. Drag the canvas to change view.
        </span>
      </p>
    </header>
  );
}

function StageCaption() {
  const specimenId = useGrammar((s) => s.specimenId);
  const fuseId = useGrammar((s) => s.fuseId);
  const mode = useGrammar((s) => s.mode);
  const blend = useGrammar((s) => s.blend);
  const recipe = recipeById(specimenId);
  const fuse = recipeById(fuseId);
  const fp = fingerprintOf(recipe);
  const ops = recipe.nodes.map((n) => n.operator).filter((o) => o !== "spectral-integrate");

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 md:p-5">
      <div className="max-w-xl rounded-md bg-bg/75 px-3 py-2">
        <p className="font-mono text-2xs tracking-caps text-muted uppercase">
          {mode === "fuse" ? "Hybrid recipe" : "Living specimen"}
        </p>
        <h2 className="font-display text-2xl leading-tight tracking-display md:text-3xl">
          {mode === "fuse" ? `${recipe.title} × ${fuse.title}` : recipe.title}
        </h2>
        <p className="mt-1 text-sm leading-normal text-muted text-pretty">
          {mode === "fuse"
            ? `Blend ${Math.round((1 - blend) * 100)} / ${Math.round(blend * 100)}. Same shader. Operator weights only.`
            : fp.thesis}
        </p>
      </div>
      <p className="hidden rounded-sm bg-bg/70 px-2 py-1 font-mono text-2xs text-muted sm:block">
        Drag to change view · {ops.length} operators
      </p>
    </div>
  );
}

function SpecimenRail() {
  const specimenId = useGrammar((s) => s.specimenId);
  const setSpecimen = useGrammar((s) => s.setSpecimen);
  const focusOperator = useGrammar((s) => s.focusOperator);
  const coverage = bundle.coverage;

  return (
    <div className="border-t border-border bg-surface">
      <p className="sr-only">Twelve specimens</p>
      <ul className="specimen-rail">
        {SPECIMEN_ORDER.map((id, i) => {
          const r = recipeById(id);
          const active = id === specimenId;
          const lit = focusOperator ? (coverage[focusOperator] ?? []).includes(id) : true;
          return (
            <li key={id} className="shrink-0">
              <button
                type="button"
                onClick={() => setSpecimen(id)}
                className={cn(
                  "flex h-11 min-w-11 items-center gap-2 whitespace-nowrap rounded-md px-3 text-left transition-colors duration-150 ease-out",
                  active ? "bg-fg text-bg" : lit ? "text-fg hover:bg-elevated" : "text-subtle hover:text-muted",
                )}
              >
                <span className="font-mono text-2xs tabular-nums opacity-70">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-sm">{r.title}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function LookPanel() {
  const specimenId = useGrammar((s) => s.specimenId);
  const recipe = recipeById(specimenId);
  const fp = FINGERPRINTS[specimenId] ?? fingerprintOf(recipe);
  const resetKnobs = useGrammar((s) => s.resetKnobs);
  const controls = controlsFor(specimenId);

  return (
    <div className="space-y-6 px-4 py-5 md:px-5">
      <section>
        <p className="font-mono text-2xs tracking-caps text-muted uppercase">Fingerprint</p>
        <dl className="mt-3 space-y-3">
          <Fact label="Optics" value={fp.optics} />
          <Fact label="Color" value={fp.color} />
          <Fact label="Surface" value={fp.surface} />
          <Fact label="Form" value={fp.form} />
        </dl>
        <div className="mt-4">
          <p className="font-mono text-2xs tracking-caps text-muted uppercase">Must survive</p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {fp.invariants.map((item) => (
              <li key={item} className="rounded-sm bg-elevated px-2 py-1 text-xs text-fg">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <MathPanel />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <p className="font-mono text-2xs tracking-caps text-muted uppercase">Physical knobs</p>
          <button type="button" onClick={resetKnobs} className="h-11 px-2 text-xs text-muted hover:text-fg">
            Reset
          </button>
        </div>
        <p className="mb-3 text-xs leading-normal text-subtle">{controls.equation}. Each slider writes a uniform with units.</p>
        <div className="space-y-4">
          {controls.knobs.map((k) => (
            <KnobSlider key={k.id} id={k.id} label={k.label} unit={k.unit} min={k.min} max={k.max} step={k.step} mapsTo={k.mapsTo} />
          ))}
        </div>
      </section>

      <OperatorList recipeId={specimenId} />

      <p className="text-sm leading-normal text-muted text-pretty">{recipe.summary}</p>
    </div>
  );
}

function MathPanel() {
  const specimenId = useGrammar((s) => s.specimenId);
  const knobs = useGrammar((s) => s.knobs);
  const look = useGrammar((s) => s.look);
  const rec = recipeById(specimenId);
  const applied = applyPhysicalKnobs(uniformsFromRecipe(rec), specimenId, knobs).uniforms;
  const lines = controlsFor(specimenId).live(applied, look);

  return (
    <section className="rounded-md border border-border bg-surface p-3">
      <p className="font-mono text-2xs tracking-caps text-signal uppercase">Live equation</p>
      <dl className="mt-2 space-y-1.5">
        {lines.map((line) => (
          <div key={line.label} className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-2">
            <dt className="font-mono text-2xs text-subtle">{line.label}</dt>
            <dd className="font-mono text-2xs text-fg text-pretty">{line.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-2xs leading-normal text-subtle">
        Evaluative sketch. Polarization and tabulated metal IOR are not in v0.1. Drag the sphere to change cosθ.
      </p>
    </section>
  );
}

function ClientSlider(props: React.ComponentProps<typeof Slider>) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) return <div className="h-11" />;
  return <Slider {...props} />;
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-2xs tracking-caps text-subtle uppercase">{label}</dt>
      <dd className="mt-1 text-sm leading-normal text-fg text-pretty">{value}</dd>
    </div>
  );
}

function KnobSlider({
  id,
  label,
  unit,
  min,
  max,
  step,
  mapsTo,
}: {
  id: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  mapsTo: string;
}) {
  const value = useGrammar((s) => s.knobs[id] ?? min);
  const setKnob = useGrammar((s) => s.setKnob);
  const digits = step < 0.01 ? 3 : step < 0.1 ? 2 : step < 1 ? 1 : 0;
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between gap-3">
        <span className="text-sm text-fg">{label}</span>
        <span className="font-mono text-2xs tabular-nums text-muted">
          {value.toFixed(digits)} {unit}
        </span>
      </span>
      <ClientSlider min={min} max={max} step={step} value={[value]} onValueChange={(v) => setKnob(id, v[0] ?? min)} />
      <span className="mt-1 block text-xs leading-normal text-subtle">{mapsTo}</span>
    </label>
  );
}

function OperatorList({ recipeId }: { recipeId: string }) {
  const recipe = recipeById(recipeId);
  const focusOperator = useGrammar((s) => s.focusOperator);
  const setFocusOperator = useGrammar((s) => s.setFocusOperator);
  const ops = recipe.nodes.map((n) => n.operator).filter((o) => o !== "spectral-integrate");

  return (
    <section>
      <p className="font-mono text-2xs tracking-caps text-muted uppercase">Bound operators</p>
      <p className="mt-1 text-xs leading-normal text-subtle">
        Click an operator to light every specimen that shares it. That is the generalization test.
      </p>
      <ul className="mt-3 space-y-2">
        {ops.map((op) => {
          const peers = sharedWith(bundle.coverage, op, recipeId);
          const on = focusOperator === op;
          return (
            <li key={op}>
              <button
                type="button"
                onClick={() => setFocusOperator(on ? null : op)}
                className={cn(
                  "w-full rounded-md border px-3 py-3 text-left transition-colors duration-150 ease-out",
                  on ? "border-fg bg-elevated" : "border-border bg-surface hover:bg-elevated",
                )}
              >
                <span className="flex items-baseline justify-between gap-3">
                  <span className="text-sm text-fg">{shortOp(op)}</span>
                  <span className="font-mono text-2xs tabular-nums text-subtle">
                    {(bundle.report.reuse[op] ?? 0)}×
                  </span>
                </span>
                {peers.length > 0 ? (
                  <span className="mt-1 block text-xs leading-normal text-muted">
                    Shared with {peers.map((id) => recipeById(id).title).join(", ")}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function FusePanel() {
  const specimenId = useGrammar((s) => s.specimenId);
  const fuseId = useGrammar((s) => s.fuseId);
  const setFuseId = useGrammar((s) => s.setFuseId);
  const blend = useGrammar((s) => s.blend);
  const setBlend = useGrammar((s) => s.setBlend);
  const a = recipeById(specimenId);
  const b = recipeById(fuseId);
  const aOps = a.nodes.map((n) => n.operator);
  const bOps = b.nodes.map((n) => n.operator);
  const kind = fusionKind(aOps, bOps);
  const kindLabel =
    kind === "conservative"
      ? "Conservative — same family, shared operators"
      : kind === "expressive"
        ? "Expressive — overlapping mechanisms"
        : "Speculative — distant families";

  return (
    <div className="space-y-6 px-4 py-5 md:px-5">
      <section>
        <p className="font-mono text-2xs tracking-caps text-muted uppercase">Controlled fusion</p>
        <p className="mt-2 text-sm leading-normal text-muted text-pretty">
          {a.title} supplies one recipe. {b.title} supplies the other. The canvas is a single shader mixing operator weights. No named hybrid.
        </p>
        <p className="mt-3 rounded-md border border-border bg-elevated px-3 py-2 text-sm text-fg">{kindLabel}</p>
      </section>

      <label className="block">
        <span className="mb-2 flex items-center justify-between text-sm">
          <span>{a.title}</span>
          <span>{b.title}</span>
        </span>
        <ClientSlider min={0} max={1} step={0.01} value={[blend]} onValueChange={(v) => setBlend(v[0] ?? 0.5)} />
      </label>

      <section>
        <p className="font-mono text-2xs tracking-caps text-muted uppercase">Fuse with</p>
        <ul className="mt-2 grid grid-cols-2 gap-1.5">
          {SPECIMEN_ORDER.filter((id) => id !== specimenId).map((id) => {
            const active = id === fuseId;
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => setFuseId(id)}
                  className={cn(
                    "h-11 w-full rounded-md px-3 text-left text-sm transition-colors duration-150 ease-out",
                    active ? "bg-fg text-bg" : "bg-elevated text-fg hover:bg-elevated/80",
                  )}
                >
                  {recipeById(id).title}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <SupplyColumn title={a.title} ops={aOps} />
        <SupplyColumn title={b.title} ops={bOps} />
      </section>
    </div>
  );
}

function SupplyColumn({ title, ops }: { title: string; ops: string[] }) {
  return (
    <div>
      <p className="font-mono text-2xs tracking-caps text-muted uppercase">{title} supplies</p>
      <ul className="mt-2 space-y-1">
        {ops
          .filter((o) => o !== "spectral-integrate")
          .map((o) => (
            <li key={o} className="font-mono text-2xs text-fg">
              {shortOp(o)}
            </li>
          ))}
      </ul>
    </div>
  );
}

function ProofPanel() {
  const specimenId = useGrammar((s) => s.specimenId);
  const setSpecimen = useGrammar((s) => s.setSpecimen);
  const focusOperator = useGrammar((s) => s.focusOperator);
  const setFocusOperator = useGrammar((s) => s.setFocusOperator);
  const c = bundle.report.criteria;
  const rows: [string, boolean][] = [
    ["Schemas valid", c.schemaValid],
    ["No named-effect flags", c.noNamedEffectFlags],
    ["All 12 specimens", c.allSpecimensPresent],
    ["Every operator reused", c.everyOperatorReused],
    ["Negative control rejected", c.negativeControlRejected],
    ["Positive control accepted", c.positiveControlAccepted],
  ];

  return (
    <div className="space-y-6 px-4 py-5 md:px-5">
      <section>
        <p className="font-mono text-2xs tracking-caps text-muted uppercase">Why this exists</p>
        <p className="mt-2 text-sm leading-normal text-muted text-pretty">
          Shader packs accumulate named looks. This grammar refuses that. Oil slick and soap film share thin-film interference. Nacre, labradorite, and butterfly share a multilayer. Cloud, nebula, and opalescent glass share volume scattering. If those twelve can be described without a one-off per material, the ontology is beginning to generalize.
        </p>
      </section>

      <BackendsPanel />

      <section>
        <p className="font-mono text-2xs tracking-caps text-muted uppercase">Acceptance gates</p>
        <ul className="mt-3 space-y-2">
          {rows.map(([label, ok]) => (
            <li key={label} className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface px-3 py-2">
              <span className="text-sm">{label}</span>
              <span className={cn("font-mono text-2xs tracking-caps uppercase", ok ? "text-pass" : "text-danger")}>
                {ok ? "pass" : "fail"}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <p className="font-mono text-2xs tracking-caps text-muted uppercase">Coverage</p>
        <p className="mt-1 text-xs leading-normal text-subtle">Click an operator header to highlight its specimens. Click a row to load it.</p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 pr-2 font-mono text-2xs font-medium tracking-caps text-muted uppercase">Specimen</th>
                {bundle.operators
                  .filter((op) => op.id !== "spectral-integrate")
                  .map((op) => (
                    <th key={op.id} className="px-0.5 py-2 text-center">
                      <button
                        type="button"
                        title={op.id}
                        onClick={() => setFocusOperator(focusOperator === op.id ? null : op.id)}
                        className={cn(
                          "size-7 rounded-sm font-mono text-2xs",
                          focusOperator === op.id ? "bg-fg text-bg" : "text-subtle hover:text-fg",
                        )}
                      >
                        {op.id.split("-").map((w) => w[0]).join("")}
                      </button>
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {SPECIMEN_ORDER.map((id) => {
                const active = id === specimenId;
                return (
                  <tr
                    key={id}
                    className={cn("cursor-pointer border-b border-border", active ? "bg-elevated" : "hover:bg-surface")}
                    onClick={() => setSpecimen(id)}
                  >
                    <th className="py-2 pr-2 text-sm font-medium text-fg">{recipeById(id).title}</th>
                    {bundle.operators
                      .filter((op) => op.id !== "spectral-integrate")
                      .map((op) => {
                        const on = (bundle.coverage[op.id] ?? []).includes(id);
                        const focused = focusOperator === op.id;
                        return (
                          <td key={op.id} className="px-0.5 py-2 text-center">
                            <span
                              className={cn(
                                "inline-block size-2 rounded-full",
                                on ? (focused ? "bg-accent" : "bg-fg") : "bg-elevated",
                              )}
                            />
                          </td>
                        );
                      })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <p className="font-mono text-2xs tracking-caps text-muted uppercase">Where it is weak</p>
        <p className="mt-2 text-sm leading-normal text-muted text-pretty">
          This canvas is an evaluative sketch driven by operator weights. Polarization, 3D photonic crystals, inelastic scatter, BSSRDF, and full spectral metal IOR are not in v0.1.
        </p>
      </section>
    </div>
  );
}
