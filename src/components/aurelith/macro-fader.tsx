import { Slider } from "@/components/ui/slider";
import { MACRO_DEFS, axisLabel, materialIndex } from "@/lib/aurelith/macros";
import { PROPERTY_DEFS, macroIndex } from "@/lib/aurelith/spec";
import { useAurelith } from "@/lib/aurelith/store";
import type { ControlSource, MacroId } from "@/lib/aurelith/types";
import { cn } from "@/lib/utils";

function fmt(id: MacroId, v: number) {
  if (id === "axis") return axisLabel(v);
  if (id === "material") return `M${materialIndex(v).index} ${materialIndex(v).title}`;
  if (id === "optical") return "SIM 0.35";
  return v.toFixed(3);
}

export function MacroFader({
  id,
  source = "pointer",
  large = false,
}: {
  id: MacroId;
  source?: ControlSource;
  large?: boolean;
}) {
  const def = MACRO_DEFS[id];
  const target = useAurelith((s) => (s.fork ? s.fork.target[id] : s.target[id]));
  const applied = useAurelith((s) => s.appliedSnapshot[id]);
  const rms = useAurelith((s) => s.metrics.rms);
  const selected = useAurelith((s) => s.selectedMacro === id);
  const select = useAurelith((s) => s.selectMacro);
  const setMacro = useAurelith((s) => s.setMacro);
  const lag = Math.abs(target - applied);
  const i = macroIndex(id);
  const prop = Object.values(PROPERTY_DEFS).find((p) => p.from === id);

  return (
    <div
      role="group"
      onPointerDown={() => select(id)}
      className={cn(
        "flex w-full flex-col gap-1 rounded-md border px-3 py-2.5 text-left transition-colors duration-150",
        selected ? "border-signal/40 bg-elevated" : "border-border bg-surface hover:bg-elevated",
        def.locked && "opacity-80",
      )}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-sans text-sm font-medium text-fg">
          <span className="mr-1.5 font-mono text-2xs text-subtle">i{i}</span>
          {def.name}
        </span>
        <span className="font-mono text-2xs tabular-nums tracking-caps text-muted uppercase">
          {def.locked ? "locked" : def.stageAccess ? "stage" : "studio"}
        </span>
      </div>
      <p className="text-2xs leading-snug text-muted">
        {prop ? `${prop.id} → ${prop.field} → ${prop.attr}` : def.meaning}
      </p>
      <div className="mt-1 flex items-center gap-3">
        <Slider
          min={0}
          max={1}
          step={0.01}
          disabled={def.locked}
          value={[target]}
          onValueChange={([v]) => setMacro(id, v ?? 0, source)}
          className="flex-1"
        />
        <span className="w-[4.5rem] shrink-0 text-right font-mono text-xs tabular-nums text-fg">{fmt(id, target)}</span>
      </div>
      <div className="flex items-center justify-between gap-2 font-mono text-2xs tabular-nums text-subtle">
        <span>
          <span className="text-signal">T</span> {fmt(id, target)}
          <span className="mx-1.5 text-border">/</span>
          <span className="text-botanical">A</span> {fmt(id, applied)}
          {id === "intensity" && (
            <>
              <span className="mx-1.5 text-border">/</span>
              <span className="text-warn">M</span> {rms.toFixed(2)} rms
            </>
          )}
        </span>
        {lag > 0.02 && !def.locked && <span className="text-warn">lag {lag.toFixed(2)}</span>}
      </div>
      {large && (
        <p className="mt-1 text-2xs text-subtle">
          {def.mappingRule} Fallback: {def.fallback}
        </p>
      )}
    </div>
  );
}
