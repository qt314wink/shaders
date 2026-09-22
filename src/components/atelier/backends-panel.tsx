import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { emitBackends, downloadBackend, type BackendFile, type BackendId } from "@/lib/grammar/backends";
import { probeRenderers, type RendererCaps } from "@/lib/aurelith/capabilities";
import { applyPhysicalKnobs } from "@/lib/grammar/knobs";
import { recipeById, useGrammar } from "@/lib/grammar/store";
import { uniformsFromRecipe } from "@/lib/grammar/uniforms";
import { cn } from "@/lib/utils";

const TABS: { id: BackendId; label: string }[] = [
  { id: "contract", label: "Contract" },
  { id: "wgsl", label: "WGSL" },
  { id: "hlsl", label: "HLSL" },
  { id: "unity", label: "Unity" },
  { id: "glsl", label: "GLSL" },
];

export function BackendsPanel() {
  const specimenId = useGrammar((s) => s.specimenId);
  const knobs = useGrammar((s) => s.knobs);
  const [tab, setTab] = useState<BackendId>("contract");
  const [caps, setCaps] = useState<RendererCaps | null>(null);
  const [copied, setCopied] = useState(false);

  const files = useMemo(() => {
    const rec = recipeById(specimenId);
    const u = applyPhysicalKnobs(uniformsFromRecipe(rec), specimenId, knobs).uniforms;
    return emitBackends(rec, u);
  }, [specimenId, knobs]);

  const file = files.find((f) => f.id === tab) ?? files[0];

  useEffect(() => {
    void probeRenderers().then(setCaps);
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(file.body);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section>
      <p className="font-mono text-2xs tracking-caps text-signal uppercase">Backends</p>
      <p className="mt-2 text-sm leading-normal text-muted text-pretty">
        The grammar is the IR. Lookdev runs GLSL on WebGL2. WebGPU takes WGSL. Unity URP takes HLSL. three.js / r3f
        consume the same uniform block on a closed graph — camera, fog, vertex table, particles. Nothing here is a named
        nacre shader, and optical stays a simulation.
      </p>
      <CapsStrip caps={caps} />
      <nav className="mt-3 flex flex-wrap gap-1" aria-label="Backend files">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "h-11 min-w-11 rounded-md px-3 text-sm transition-colors duration-150",
              tab === t.id ? "bg-fg text-bg" : "bg-elevated text-fg hover:bg-elevated/80",
            )}
          >
            {t.label}
          </button>
        ))}
      </nav>
      <BackendCard file={file} copied={copied} onCopy={() => void copy()} onDownload={() => downloadBackend(file)} />
    </section>
  );
}

function CapsStrip({ caps }: { caps: RendererCaps | null }) {
  if (!caps) {
    return <p className="mt-3 font-mono text-2xs text-subtle">Probing this browser…</p>;
  }
  const bits: [string, boolean][] = [
    ["WebGL2", caps.webgl2],
    ["WebGPU", caps.webgpu],
    ["three.js", caps.three],
    ["r3f", caps.r3f],
  ];
  return (
    <ul className="mt-3 flex flex-wrap gap-2">
      {bits.map(([label, on]) => (
        <li
          key={label}
          className={cn(
            "rounded-sm px-2 py-1 font-mono text-2xs tracking-caps uppercase",
            on ? "bg-pass/15 text-pass" : "bg-elevated text-subtle",
          )}
        >
          {label} {on ? "yes" : "no"}
        </li>
      ))}
      <li className="rounded-sm px-2 py-1 font-mono text-2xs text-muted">{caps.adapter}</li>
    </ul>
  );
}

function BackendCard({
  file,
  copied,
  onCopy,
  onDownload,
}: {
  file: BackendFile;
  copied: boolean;
  onCopy: () => void;
  onDownload: () => void;
}) {
  return (
    <div className="mt-3 rounded-md border border-border bg-surface p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-mono text-2xs tracking-caps text-subtle uppercase">{file.runtime}</p>
          <p className="mt-1 font-mono text-xs text-fg">{file.filename}</p>
          <p className="mt-1 text-xs leading-normal text-muted">{file.note}</p>
        </div>
        <div className="flex gap-1">
          <Button size="sm" variant="outline" onClick={onCopy}>
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button size="sm" variant="solid" onClick={onDownload}>
            Download
          </Button>
        </div>
      </div>
      <pre className="mt-3 max-h-64 overflow-auto rounded-sm bg-void p-3 font-mono text-2xs leading-relaxed text-fg">
        {file.body}
      </pre>
    </div>
  );
}
