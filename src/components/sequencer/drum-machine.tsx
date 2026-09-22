import {
  ChevronDown,
  Dices,
  Eraser,
  Play,
  Square,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { engine } from "@/lib/sequencer/engine";
import { PRESET_LIST, type PresetId } from "@/lib/sequencer/presets";
import { useSequencer } from "@/lib/sequencer/store";
import {
  isBeatStep,
  TRACKS,
  type StepValue,
  type TrackId,
} from "@/lib/sequencer/types";
import { cn } from "@/lib/utils";

const BEAT_GROUPS = [0, 1, 2, 3] as const;

type Gesture =
  | { kind: "pending"; track: TrackId; step: number; pointerId: number }
  | { kind: "paint"; track: TrackId; value: StepValue; pointerId: number };

export function DrumMachine() {
  const hydrate = useSequencer((s) => s.hydrate);
  const togglePlay = useSequencer((s) => s.togglePlay);
  const setTempo = useSequencer((s) => s.setTempo);

  useEffect(() => {
    hydrate();
    const unlock = () => engine.unlock();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [hydrate]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "SELECT" ||
        target?.tagName === "TEXTAREA";
      if (typing) return;

      if (event.code === "Space") {
        if (target?.closest(".pad")) return;
        event.preventDefault();
        togglePlay();
      } else if (event.code === "ArrowUp") {
        event.preventDefault();
        setTempo(useSequencer.getState().tempo + 1);
      } else if (event.code === "ArrowDown") {
        event.preventDefault();
        setTempo(useSequencer.getState().tempo - 1);
      } else if (event.key === "c" || event.key === "C") {
        useSequencer.getState().clear();
      } else if (event.key === "r" || event.key === "R") {
        useSequencer.getState().randomize();
      } else if (event.key >= "1" && event.key <= "4") {
        const id = TRACKS[Number(event.key) - 1]?.id;
        if (id) useSequencer.getState().toggleMute(id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setTempo, togglePlay]);

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4 py-6 pb-16 sm:px-6 sm:py-10">
      <Header />
      <section className="chassis mt-6 rounded-xl p-5 sm:p-6">
        <Transport />
        <StepGrid />
        <Mixer />
      </section>
      <p className="mt-6 hidden text-center text-xs text-subtle sm:block">
        Space plays. Drag pads to paint. Click again for accent. C clears. R
        randomizes. 1–4 mute.
      </p>
      <p className="mt-5 text-center text-xs text-subtle sm:hidden">
        Drag to paint. Tap a pad twice for accent. Tap a track name to mute.
      </p>
    </main>
  );
}

function Header() {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="font-mono text-xs tracking-caps text-muted uppercase">
          Drum computer
        </p>
        <h1 className="mt-1 font-sans text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
          PULSE
        </h1>
      </div>
      <Lcd />
    </header>
  );
}

function Lcd() {
  const playing = useSequencer((s) => s.playing);
  const currentStep = useSequencer((s) => s.currentStep);
  const tempo = useSequencer((s) => s.tempo);
  const swing = useSequencer((s) => s.swing);
  const beat = Math.floor(currentStep / 4) + 1;
  const tick = (currentStep % 4) + 1;

  return (
    <div className="lcd w-full sm:w-auto sm:min-w-64">
      <div className="flex items-baseline justify-between gap-4">
        <span className="font-mono text-2xs tracking-caps uppercase text-accent/80">
          {playing ? "Run" : "Stop"}
        </span>
        <span className="font-mono text-sm tabular-nums text-accent">
          {String(currentStep + 1).padStart(2, "0")}
          <span className="mx-1 text-accent/50">·</span>
          {beat}.{tick}
        </span>
      </div>
      <div className="mt-2 flex items-baseline justify-between gap-4">
        <span className="font-mono text-lg tabular-nums leading-none text-accent">
          {tempo}
          <span className="ml-1 text-2xs tracking-caps uppercase text-accent/70">
            bpm
          </span>
        </span>
        <span className="font-mono text-sm tabular-nums text-accent/90">
          {Math.round(swing * 100)}
          <span className="ml-1 text-2xs tracking-caps uppercase text-accent/70">
            sw
          </span>
        </span>
      </div>
      <div className="lcd-ticks mt-3">
        {Array.from({ length: 16 }, (_, step) => (
          <span
            key={step}
            className={cn(
              "h-1 rounded-full bg-accent/20",
              playing && currentStep === step && "bg-accent",
              isBeatStep(step) && "bg-accent/35",
              playing && currentStep === step && isBeatStep(step) && "bg-accent",
            )}
          />
        ))}
      </div>
    </div>
  );
}

function Transport() {
  const playing = useSequencer((s) => s.playing);
  const tempo = useSequencer((s) => s.tempo);
  const swing = useSequencer((s) => s.swing);
  const presetId = useSequencer((s) => s.presetId);
  const togglePlay = useSequencer((s) => s.togglePlay);
  const setTempo = useSequencer((s) => s.setTempo);
  const setSwing = useSequencer((s) => s.setSwing);
  const clear = useSequencer((s) => s.clear);
  const randomize = useSequencer((s) => s.randomize);
  const loadPreset = useSequencer((s) => s.loadPreset);
  const taps = useRef<number[]>([]);

  const tapTempo = () => {
    const now = performance.now();
    const recent = taps.current.filter((t) => now - t < 2400);
    recent.push(now);
    taps.current = recent;
    if (recent.length < 2) return;
    const intervals: number[] = [];
    for (let i = 1; i < recent.length; i += 1) {
      intervals.push(recent[i]! - recent[i - 1]!);
    }
    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    setTempo(Math.round(60000 / avg));
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="lg"
          variant={playing ? "solid" : "default"}
          onClick={togglePlay}
          aria-pressed={playing}
          aria-label={playing ? "Stop" : "Play"}
          className="min-w-28"
        >
          <PlayStopIcon playing={playing} />
          {playing ? "Stop" : "Play"}
        </Button>
        <Button variant="outline" onClick={clear}>
          <Eraser className="size-4" strokeWidth={2} />
          Clear
        </Button>
        <Button variant="outline" onClick={randomize}>
          <Dices className="size-4" strokeWidth={2} />
          Random
        </Button>
        <label className="relative ml-auto flex min-w-36 items-center gap-2">
          <span className="font-mono text-2xs tracking-caps text-muted uppercase">
            Pattern
          </span>
          <span className="relative min-w-32 grow">
            <select
              value={presetId}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "custom") return;
                loadPreset(value as PresetId);
              }}
              className="h-11 w-full appearance-none rounded-md border border-border bg-elevated py-0 pr-9 pl-3 font-sans text-sm text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {PRESET_LIST.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name}
                </option>
              ))}
              <option value="custom">Custom</option>
            </select>
            <ChevronDown
              className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted"
              strokeWidth={2}
              aria-hidden
            />
          </span>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <button
              type="button"
              onClick={tapTempo}
              className="font-mono text-2xs tracking-caps text-muted uppercase hover:text-fg"
            >
              Tempo · tap
            </button>
            <span className="font-mono text-lg tabular-nums text-fg">
              {tempo}
              <span className="ml-1 text-xs text-muted">BPM</span>
            </span>
          </div>
          <Slider
            min={60}
            max={200}
            step={1}
            value={[tempo]}
            onValueChange={(v) => setTempo(v[0] ?? tempo)}
            aria-label="Tempo"
          />
        </div>
        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <span className="font-mono text-2xs tracking-caps text-muted uppercase">
              Swing
            </span>
            <span className="font-mono text-lg tabular-nums text-fg">
              {Math.round(swing * 100)}
              <span className="ml-1 text-xs text-muted">%</span>
            </span>
          </div>
          <Slider
            min={0}
            max={100}
            step={1}
            value={[Math.round(swing * 100)]}
            onValueChange={(v) => setSwing((v[0] ?? 0) / 100)}
            aria-label="Swing"
          />
        </div>
      </div>
    </div>
  );
}

function PlayStopIcon({ playing }: { playing: boolean }) {
  return (
    <span className="relative inline-flex size-4 items-center justify-center">
      <Square
        className={cn(
          "absolute size-3.5 fill-current transition-[opacity,transform,filter] duration-200 ease-in-out",
          playing
            ? "scale-100 opacity-100 blur-none"
            : "scale-[0.25] opacity-0 blur-[4px]",
        )}
        strokeWidth={2}
      />
      <Play
        className={cn(
          "ml-0.5 size-4 transition-[opacity,transform,filter] duration-200 ease-in-out",
          playing
            ? "scale-[0.25] opacity-0 blur-[4px]"
            : "scale-100 opacity-100 blur-none",
        )}
        strokeWidth={2}
      />
    </span>
  );
}

function BeatStrip({
  renderCell,
}: {
  renderCell: (step: number) => ReactNode;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
      {BEAT_GROUPS.map((group) => (
        <div key={group} className="grid grid-cols-4 gap-1.5">
          {BEAT_GROUPS.map((offset) => renderCell(group * 4 + offset))}
        </div>
      ))}
    </div>
  );
}

function hitTestPad(clientX: number, clientY: number) {
  const el = document.elementFromPoint(clientX, clientY);
  const pad = el?.closest<HTMLElement>("[data-pad]");
  if (!pad) return null;
  const track = pad.dataset.track as TrackId | undefined;
  const step = Number(pad.dataset.step);
  if (!track || Number.isNaN(step)) return null;
  return { track, step };
}

function StepGrid() {
  const currentStep = useSequencer((s) => s.currentStep);
  const playing = useSequencer((s) => s.playing);
  const gesture = useRef<Gesture | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const applyPaint = (track: TrackId, step: number, value: StepValue, audition: boolean) => {
    useSequencer.getState().setStep(track, step, value, audition);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const hit = hitTestPad(event.clientX, event.clientY);
    if (!hit) return;
    gesture.current = {
      kind: "pending",
      track: hit.track,
      step: hit.step,
      pointerId: event.pointerId,
    };
    gridRef.current?.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g || g.pointerId !== event.pointerId) return;
    const hit = hitTestPad(event.clientX, event.clientY);
    if (!hit) return;

    if (g.kind === "pending") {
      if (hit.track === g.track && hit.step === g.step) return;
      if (hit.track !== g.track) return;
      const startVal = useSequencer.getState().pattern[g.track][g.step] ?? 0;
      const value: StepValue = startVal === 0 ? 1 : 0;
      gesture.current = { kind: "paint", track: g.track, value, pointerId: g.pointerId };
      applyPaint(g.track, g.step, value, true);
      applyPaint(hit.track, hit.step, value, false);
      return;
    }

    if (hit.track !== g.track) return;
    applyPaint(hit.track, hit.step, g.value, false);
  };

  const endGesture = (event: ReactPointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g || g.pointerId !== event.pointerId) return;
    if (g.kind === "pending") {
      const current = useSequencer.getState().pattern[g.track][g.step] ?? 0;
      const next: StepValue = event.shiftKey ? 2 : (((current + 1) % 3) as StepValue);
      applyPaint(g.track, g.step, next, true);
    }
    gesture.current = null;
    if (gridRef.current?.hasPointerCapture(event.pointerId)) {
      gridRef.current.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div
      ref={gridRef}
      className="step-grid mt-6 select-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endGesture}
      onPointerCancel={endGesture}
    >
      <div className="mb-2 flex items-center gap-3">
        <div className="hidden w-20 shrink-0 md:block" />
        <div className="min-w-0 flex-1">
          <BeatStrip
            renderCell={(step) => (
              <div
                key={step}
                className={cn(
                  "clock-led",
                  isBeatStep(step) && "clock-led-beat",
                  playing && currentStep === step && "is-now",
                )}
                aria-hidden
              />
            )}
          />
        </div>
      </div>

      <div className="mb-1.5 hidden md:flex md:items-center md:gap-3">
        <div className="w-20 shrink-0" />
        <div className="min-w-0 flex-1">
          <BeatStrip
            renderCell={(step) => (
              <div
                key={step}
                className={cn(
                  "step-index flex h-6 items-center justify-center rounded-xs font-mono text-2xs tabular-nums text-subtle",
                  isBeatStep(step) && "text-muted",
                )}
                data-playhead={playing && currentStep === step ? "true" : undefined}
              >
                {String(step + 1).padStart(2, "0")}
              </div>
            )}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 md:gap-3">
        {TRACKS.map((track) => (
          <TrackRow key={track.id} trackId={track.id} />
        ))}
      </div>
    </div>
  );
}

function TrackRow({ trackId }: { trackId: TrackId }) {
  const track = TRACKS.find((t) => t.id === trackId)!;
  const steps = useSequencer((s) => s.pattern[trackId]);
  const muted = useSequencer((s) => s.muted[trackId]);
  const currentStep = useSequencer((s) => s.currentStep);
  const playing = useSequencer((s) => s.playing);
  const cycleStep = useSequencer((s) => s.cycleStep);
  const toggleMute = useSequencer((s) => s.toggleMute);

  return (
    <div
      className={cn(
        "flex flex-col gap-2 md:flex-row md:items-center md:gap-3",
        muted && "track-muted",
      )}
    >
      <button
        type="button"
        onClick={() => toggleMute(trackId)}
        aria-pressed={muted}
        title={`${muted ? "Unmute" : "Mute"} ${track.label}`}
        className={cn(
          "flex min-h-11 items-baseline gap-2 rounded-sm px-1 py-1 text-left transition-[color,opacity] duration-150 hover:text-fg md:w-20 md:shrink-0",
          muted ? "text-subtle line-through" : "text-fg",
        )}
      >
        <span className="font-mono text-2xs tracking-caps text-muted">
          {track.short}
        </span>
        <span className="text-sm font-medium">{track.label}</span>
      </button>

      <div className="min-w-0 flex-1">
        <BeatStrip
          renderCell={(step) => {
            const value = steps[step] ?? 0;
            return (
              <button
                key={step}
                type="button"
                className="pad"
                data-pad=""
                data-track={trackId}
                data-step={step}
                data-on={value > 0 ? "true" : undefined}
                data-accent={value === 2 ? "true" : undefined}
                data-beat={isBeatStep(step) ? "true" : undefined}
                data-playhead={playing && currentStep === step ? "true" : undefined}
                aria-label={`${track.label} step ${step + 1}${value === 2 ? " accent" : value === 1 ? " on" : " off"}`}
                aria-pressed={value > 0}
                onClick={(event) => {
                  if (event.detail === 0) cycleStep(trackId, step);
                }}
              />
            );
          }}
        />
      </div>
    </div>
  );
}

function Mixer() {
  const master = useSequencer((s) => s.master);
  const masterMuted = useSequencer((s) => s.masterMuted);
  const setMaster = useSequencer((s) => s.setMaster);
  const toggleMasterMute = useSequencer((s) => s.toggleMasterMute);
  const volumes = useSequencer((s) => s.volumes);
  const setVolume = useSequencer((s) => s.setVolume);

  return (
    <div className="mt-6 border-t border-border pt-5">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleMasterMute}
          aria-label={masterMuted ? "Unmute" : "Mute"}
        >
          {masterMuted ? (
            <VolumeX className="size-4" />
          ) : (
            <Volume2 className="size-4" />
          )}
        </Button>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex justify-between font-mono text-2xs tracking-caps text-muted uppercase">
            <span>Master</span>
            <span className="tabular-nums">{Math.round(master * 100)}</span>
          </div>
          <Slider
            min={0}
            max={100}
            step={1}
            value={[Math.round(master * 100)]}
            onValueChange={(v) => setMaster((v[0] ?? 0) / 100)}
            aria-label="Master volume"
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
        {TRACKS.map((track) => (
          <div key={track.id} className="flex flex-col gap-1">
            <span className="font-mono text-2xs tracking-caps text-muted uppercase">
              {track.label}
            </span>
            <Slider
              min={0}
              max={100}
              step={1}
              value={[Math.round(volumes[track.id] * 100)]}
              onValueChange={(v) => setVolume(track.id, (v[0] ?? 0) / 100)}
              aria-label={`${track.label} volume`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
