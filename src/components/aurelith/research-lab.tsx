import { Button } from "@/components/ui/button";
import { CHOREOGRAPHIES } from "@/lib/aurelith/research";
import { useAurelith } from "@/lib/aurelith/store";
import type { EvidenceMaturity, HypothesisStatus } from "@/lib/aurelith/types";
import { cn } from "@/lib/utils";

const STATUS_TONE: Record<HypothesisStatus, string> = {
  untested: "text-muted",
  running: "text-signal",
  supported: "text-botanical",
  contradicted: "text-danger",
  mixed: "text-warn",
  "locked-simulation": "text-warn",
  rejected: "text-danger",
};

const MATURITY: Record<EvidenceMaturity, string> = {
  captured: "captured",
  candidate: "candidate",
  "source-backed": "source-backed",
  reviewed: "reviewed",
  measured: "measured",
  superseded: "superseded",
  rejected: "rejected",
  "locked-simulation": "simulation",
};

export function ResearchLab() {
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

  return (
    <div className="flex flex-col gap-5">
      <section>
        <Header
          kicker="Measurement signal"
          title="What is measured, how, and what it is not"
        />
        <dl className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-4">
          <Metric label="FPS" value={metrics.fps ? metrics.fps.toFixed(0) : "—"} unit="rAF" />
          <Metric label="Frame p95" value={metrics.p95 ? metrics.p95.toFixed(1) : "—"} unit="ms / ~1s window" />
          <Metric label="RMS" value={metrics.rms.toFixed(3)} unit="analyser 0–1" />
          <Metric label="Particles" value={String(metrics.particles)} unit="renderer count" />
          <Metric label="Vertices" value={String(metrics.vertices)} unit={`table / max 96`} />
          <Metric label="Playhead" value={`v[${metrics.playhead}]`} unit="vertex index" />
          <Metric label="Pattern" value={`P${metrics.patternIndex}`} unit="catalog index" />
          <Metric label="Material" value={`M${metrics.materialIndex}`} unit="specimen index" />
        </dl>
        <p className="mt-2 text-2xs leading-relaxed text-subtle">{metrics.source}. Labels: Target requested · Applied interpolated · Measured sampled · Simulation non-physical · Future not in v1.</p>
      </section>

      <section>
        <Header kicker="Hypothesis board" title="Trial and error stays visible" />
        {note && <p className="mt-2 rounded-sm border border-border bg-elevated px-3 py-2 text-xs text-fg">{note}</p>}
        {!reconstructionOpen && (
        <ul className="mt-3 flex flex-col gap-2">
          {hypotheses.map((h) => (
            <li key={h.id} className="rounded-md border border-border bg-surface p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="max-w-[52ch] break-words text-sm text-fg">{h.claim}</p>
                <span className={cn("font-mono text-2xs tracking-caps uppercase", STATUS_TONE[h.status])}>
                  {h.status.replace("-", " ")}
                </span>
              </div>
              <p className="mt-1 text-2xs text-muted">Curiosity: {h.curiosity}</p>
              <p className="mt-1 text-2xs text-subtle">
                Method: {h.method} Window {h.windowSec}s · {h.units}
              </p>
              <p className="mt-1 text-2xs text-subtle">Limitation: {h.knownLimitations[0]}</p>
              {h.trials[0] && (
                <p className="mt-1 font-mono text-2xs text-muted">
                  Last trial {new Date(h.trials[0].at).toISOString().slice(0, 16)} · {h.trials[0].verdict} · {h.trials[0].notes}
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!!active || h.status === "locked-simulation"}
                  onClick={() => void run(h.id)}
                >
                  {h.status === "locked-simulation" ? "Not runnable" : active ? "Trial running" : "Run choreography"}
                </Button>
                {h.trials.length > 0 && (
                  <span className="self-center font-mono text-2xs text-subtle">
                    {h.trials.length} trial{h.trials.length === 1 ? "" : "s"} · conf {h.confidence.toFixed(2)} · {MATURITY[h.evidenceMaturity]}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
        )}
        {active && (
          <Button size="sm" variant="ghost" className="mt-2" onClick={abort}>
            Abort trial
          </Button>
        )}
      </section>

      <section>
        <Header kicker="Side research" title="Fork without touching the approved scene" />
        <ul className="mt-3 grid gap-2 md:grid-cols-2">
          {side.map((s) => (
            <li key={s.id} className="rounded-md border border-border bg-surface p-3">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-sm font-medium text-fg">{s.title}</h3>
                <span className="font-mono text-2xs tracking-caps text-subtle uppercase">{MATURITY[s.maturity]}</span>
              </div>
              <p className="mt-1 text-2xs text-muted">{s.origin}</p>
              <p className="mt-2 text-xs text-fg">{s.claim}</p>
              <p className="mt-1 text-2xs text-subtle">Contributes: {s.contributes}</p>
              <p className="mt-1 text-2xs text-subtle">Limitation: {s.limitation}</p>
              <Button
                size="sm"
                variant="subtle"
                className="mt-2"
                onClick={() => forkSide(s.id)}
                disabled={!!fork}
              >
                Fork as side instance
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <Header kicker="Test choreography" title="Named rehearsals, not hidden automation" />
        <ul className="mt-3 flex flex-col gap-2">
          {CHOREOGRAPHIES.map((c) => (
            <li key={c.id} className="border-b border-border pb-2 last:border-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm text-fg">{c.title}</span>
                <span className="font-mono text-2xs tracking-caps text-subtle uppercase">{c.audience}</span>
              </div>
              <p className="text-2xs text-muted">{c.steps}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <Header kicker="Process scaffold" title="Can you reconstruct the last trial?" />
        <p className="mt-2 text-xs text-muted">
          Feasibility protocol, n=you. Hide the board and name: source, window, unit, limitation. Not a workplace instrument.
        </p>
        {!reconstructionOpen ? (
          <Button size="sm" variant="outline" className="mt-2" onClick={() => setReconstruction(true, null)}>
            Hide board and self-score
          </Button>
        ) : (
          <div className="mt-2 flex flex-wrap gap-2">
            {[0, 1, 2, 3, 4].map((n) => (
              <Button
                key={n}
                size="sm"
                variant={reconstructionScore === n ? "solid" : "outline"}
                onClick={() => setReconstruction(true, n)}
              >
                {n}
              </Button>
            ))}
            <Button size="sm" variant="ghost" onClick={() => setReconstruction(false)}>
              Show board
            </Button>
            {reconstructionScore !== null && (
              <span className="self-center font-mono text-2xs text-muted">
                Self-score {reconstructionScore}/4 · recorded as candidate, not a validated measure
              </span>
            )}
          </div>
        )}
      </section>

      <section>
        <Header kicker="Observations" title="Claim, facts, inference, limitation" />
        <ul className="mt-3 flex flex-col gap-2">
          {observations.slice(0, 6).map((o) => (
            <li key={o.id} className="rounded-sm border border-border px-3 py-2">
              <p className="text-xs text-fg">{o.claim}</p>
              <p className="mt-1 font-mono text-2xs text-subtle">
                {o.id} · {MATURITY[o.evidenceMaturity]} · conf {o.confidence.toFixed(2)}
              </p>
              <ul className="mt-1 list-disc pl-4 text-2xs text-muted">
                {o.verifiedFacts.slice(0, 2).map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <Header kicker="Event ledger" title="Intent is recorded. Nothing is silent." />
        <ul className="mt-3 max-h-56 overflow-auto font-mono text-2xs">
          {ledger.slice(0, 40).map((e) => (
            <li key={e.id} className="flex gap-2 border-b border-border/80 py-1 text-muted">
              <span className="w-14 shrink-0 tabular-nums text-subtle">{new Date(e.t).toISOString().slice(14, 23)}</span>
              <span className="w-16 shrink-0 text-signal">{e.kind}</span>
              <span className="min-w-0 flex-1 text-fg">{e.message}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Header({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div>
      <p className="font-mono text-2xs tracking-caps text-signal uppercase">{kicker}</p>
      <h2 className="font-display text-lg tracking-display text-fg">{title}</h2>
    </div>
  );
}

function Metric({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="bg-surface px-3 py-2.5">
      <dt className="font-mono text-2xs tracking-caps text-subtle uppercase">{label}</dt>
      <dd className="font-mono text-lg tabular-nums text-fg">{value}</dd>
      <p className="text-2xs text-subtle">{unit}</p>
    </div>
  );
}
