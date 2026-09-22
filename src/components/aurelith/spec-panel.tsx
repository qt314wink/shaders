import { Button } from "@/components/ui/button";
import { MACRO_DEFS } from "@/lib/aurelith/macros";
import {
  AXIS_LABELS,
  BOUNDS,
  FIELD_DEFS,
  FIELD_IDS,
  MATERIAL_SPECIMENS,
  PATTERN_VERTEX_COUNT,
  PROPERTY_DEFS,
  PROPERTY_IDS,
  SCOPE,
  assign,
} from "@/lib/aurelith/spec";
import { useAurelith } from "@/lib/aurelith/store";
import { MACRO_IDS, PATTERN_IDS } from "@/lib/aurelith/types";

export function SpecPanel() {
  const target = useAurelith((s) => (s.fork ? s.fork.target : s.target));
  const applied = useAurelith((s) => s.appliedSnapshot);
  const pattern = useAurelith((s) => (s.fork ? s.fork.pattern : s.pattern));
  const quality = useAurelith((s) => s.quality);
  const metrics = useAurelith((s) => s.metrics);
  const frame = assign(applied, quality, pattern);

  return (
    <section className="flex flex-col gap-4">
      <div>
        <p className="font-mono text-2xs tracking-caps text-signal uppercase">Closed specification · v1</p>
        <h2 className="mt-1 font-display text-lg tracking-display text-fg">Indices, properties, fields, vertices</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Every value has an index, a unit, and a bound. The canvas draws a precomputed vertex table — not an open loop.
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-4">
        <Stat k="dt max" v={`${BOUNDS.dtMax * 1000} ms`} />
        <Stat k="vertex max" v={String(BOUNDS.vertexMax)} />
        <Stat k="this pattern" v={`${frame.vertexCount}`} />
        <Stat k="playhead" v={`v[${metrics.playhead}]`} />
        <Stat k="particles" v={`${metrics.particles}/${BOUNDS.particle[quality]}`} />
        <Stat k="layers" v={`${frame.layers}/${BOUNDS.layers[quality]}`} />
        <Stat k="fields" v={`${BOUNDS.fieldCount} × ${BOUNDS.fieldSamples}`} />
        <Stat k="gain ceiling" v={BOUNDS.gainCeiling.toFixed(2)} />
      </dl>

      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full min-w-[36rem] text-left font-mono text-2xs">
          <thead className="bg-elevated text-subtle">
            <tr>
              <th className="px-2 py-1.5 font-medium">i</th>
              <th className="px-2 py-1.5 font-medium">Macro</th>
              <th className="px-2 py-1.5 font-medium">Property</th>
              <th className="px-2 py-1.5 font-medium">Field</th>
              <th className="px-2 py-1.5 font-medium">Vertex attr</th>
              <th className="px-2 py-1.5 font-medium">T</th>
              <th className="px-2 py-1.5 font-medium">A</th>
              <th className="px-2 py-1.5 font-medium">Unit</th>
            </tr>
          </thead>
          <tbody>
            {PROPERTY_IDS.map((pid) => {
              const def = PROPERTY_DEFS[pid];
              const a = frame.assignments[def.index];
              return (
                <tr key={pid} className="border-t border-border">
                  <td className="px-2 py-1 text-subtle">{def.index}</td>
                  <td className="px-2 py-1 text-fg">{MACRO_DEFS[def.from].name}</td>
                  <td className="px-2 py-1 text-signal">{def.id}</td>
                  <td className="px-2 py-1 text-botanical">
                    F{FIELD_DEFS[def.field].index} {def.field}
                  </td>
                  <td className="px-2 py-1 text-muted">{def.attr}</td>
                  <td className="px-2 py-1 tabular-nums text-signal">{target[def.from].toFixed(3)}</td>
                  <td className="px-2 py-1 tabular-nums text-botanical">{a.value.toFixed(3)}</td>
                  <td className="px-2 py-1 text-subtle">{def.unit}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-md border border-border bg-surface p-3">
          <p className="font-mono text-2xs tracking-caps text-subtle uppercase">Pattern catalog · vertices</p>
          <ul className="mt-2 font-mono text-2xs">
            {PATTERN_IDS.map((p, i) => (
              <li key={p} className={p === pattern ? "text-fg" : "text-muted"}>
                P{i} {p} · V {PATTERN_VERTEX_COUNT[p]}/{BOUNDS.vertexMax}
                {p === pattern ? " · live" : ""}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-md border border-border bg-surface p-3">
          <p className="font-mono text-2xs tracking-caps text-subtle uppercase">Material catalog · index</p>
          <ul className="mt-2 max-h-40 overflow-auto font-mono text-2xs">
            {MATERIAL_SPECIMENS.map((m) => (
              <li key={m.id} className={m.index === frame.materialIndex ? "text-fg" : "text-muted"}>
                M{m.index} {m.title}
                {m.index === frame.materialIndex ? " · live" : ""}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-md border border-border bg-surface p-3">
        <p className="font-mono text-2xs tracking-caps text-subtle uppercase">Fields · assigned now</p>
        <ul className="mt-2 grid gap-1 font-mono text-2xs md:grid-cols-2">
          {FIELD_IDS.map((id) => {
            const def = FIELD_DEFS[id];
            return (
              <li key={id} className="flex justify-between gap-2 border-b border-border/70 py-1">
                <span className="text-muted">
                  F{def.index} {id} · {def.domain}
                </span>
                <span className="tabular-nums text-fg">
                  {frame.fields[id].toFixed(id === "particle" || id === "recipe" || id === "geometry-mix" ? 0 : 3)} {def.unit}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-2xs text-subtle">
          Axis bucket {frame.axisBucket} {AXIS_LABELS[frame.axisBucket]}. Optical locked {BOUNDS.opticalLocked}. Macros{" "}
          {MACRO_IDS.length}/{BOUNDS.macroCount}.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-md border border-border bg-surface p-3">
          <p className="font-mono text-2xs tracking-caps text-botanical uppercase">In scope</p>
          <ul className="mt-2 list-disc pl-4 text-2xs text-muted">
            {SCOPE.in.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-md border border-border bg-surface p-3">
          <p className="font-mono text-2xs tracking-caps text-warn uppercase">Out of scope</p>
          <ul className="mt-2 list-disc pl-4 text-2xs text-muted">
            {SCOPE.out.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      </div>

      <CopySpec frameJson={JSON.stringify({ indices: { pattern: frame.patternIndex, material: frame.materialIndex, quality: frame.qualityIndex }, assignments: frame.assignments, bounds: { vertexCount: frame.vertexCount, vertexMax: BOUNDS.vertexMax, particles: frame.particleCount, layers: frame.layers } }, null, 2)} />
    </section>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="bg-surface px-3 py-2">
      <dt className="font-mono text-2xs tracking-caps text-subtle uppercase">{k}</dt>
      <dd className="font-mono text-sm tabular-nums text-fg">{v}</dd>
    </div>
  );
}

function CopySpec({ frameJson }: { frameJson: string }) {
  return (
    <div className="rounded-md border border-border bg-surface p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-2xs tracking-caps text-subtle uppercase">Live assignment syntax</p>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            void navigator.clipboard?.writeText(frameJson);
          }}
        >
          Copy JSON
        </Button>
      </div>
      <pre className="mt-2 max-h-40 overflow-auto font-mono text-2xs leading-relaxed text-muted">{frameJson}</pre>
    </div>
  );
}
