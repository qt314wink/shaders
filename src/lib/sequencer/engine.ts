import type { Pattern, TrackId } from "./types";
import { TRACK_IDS } from "./types";

const LOOKAHEAD_MS = 25;
const SCHEDULE_AHEAD = 0.12;

type HitCallback = (step: number, tracks: TrackId[]) => void;
type StepCallback = (step: number) => void;

type Mix = {
  master: number;
  muted: boolean;
  trackGain: Record<TrackId, number>;
  trackMute: Record<TrackId, boolean>;
};

function makeNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const length = ctx.sampleRate * 1.2;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function env(
  param: AudioParam,
  time: number,
  peak: number,
  attack: number,
  decay: number,
): void {
  param.cancelScheduledValues(time);
  param.setValueAtTime(0.0001, time);
  param.exponentialRampToValueAtTime(Math.max(peak, 0.0002), time + attack);
  param.exponentialRampToValueAtTime(0.0001, time + attack + decay);
}

function disconnectLater(nodes: AudioNode[], whenMs: number): void {
  window.setTimeout(() => {
    for (const node of nodes) {
      try {
        node.disconnect();
      } catch {
        // already disconnected
      }
    }
  }, whenMs);
}

export class PulseEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private buses: Partial<Record<TrackId, GainNode>> = {};
  private noise: AudioBuffer | null = null;

  private playing = false;
  private currentStep = 0;
  private nextNoteTime = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  private uiTimers: ReturnType<typeof setTimeout>[] = [];

  private tempo = 124;
  private swing = 0;
  private pattern: Pattern | null = null;
  private mix: Mix = {
    master: 0.85,
    muted: false,
    trackGain: { kick: 0.9, snare: 0.8, hats: 0.55, perc: 0.65 },
    trackMute: { kick: false, snare: false, hats: false, perc: false },
  };

  onStep: StepCallback | null = null;
  onHit: HitCallback | null = null;

  get isPlaying(): boolean {
    return this.playing;
  }

  get audioTime(): number {
    return this.ctx?.currentTime ?? 0;
  }

  unlock(): void {
    this.ensure();
    if (this.ctx && this.ctx.state === "suspended") {
      void this.ctx.resume();
    }
  }

  setTempo(bpm: number): void {
    this.tempo = Math.min(200, Math.max(60, bpm));
  }

  setSwing(amount: number): void {
    this.swing = Math.min(1, Math.max(0, amount));
  }

  setPattern(pattern: Pattern): void {
    this.pattern = pattern;
  }

  setMix(mix: Partial<Mix>): void {
    if (mix.master !== undefined) this.mix.master = mix.master;
    if (mix.muted !== undefined) this.mix.muted = mix.muted;
    if (mix.trackGain) this.mix.trackGain = { ...this.mix.trackGain, ...mix.trackGain };
    if (mix.trackMute) this.mix.trackMute = { ...this.mix.trackMute, ...mix.trackMute };
    this.applyMix();
  }

  start(): void {
    this.unlock();
    if (!this.ctx || this.playing) return;
    this.playing = true;
    this.currentStep = 0;
    this.nextNoteTime = this.ctx.currentTime + 0.04;
    this.scheduler();
    this.timer = setInterval(() => this.scheduler(), LOOKAHEAD_MS);
  }

  stop(): void {
    this.playing = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    for (const id of this.uiTimers) clearTimeout(id);
    this.uiTimers = [];
    this.currentStep = 0;
    this.onStep?.(0);
  }

  toggle(): void {
    if (this.playing) this.stop();
    else this.start();
  }

  audition(track: TrackId, accent: boolean): void {
    this.unlock();
    if (!this.ctx) return;
    this.voice(track, this.ctx.currentTime, accent);
  }

  dispose(): void {
    this.stop();
    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
    }
    this.master = null;
    this.compressor = null;
    this.buses = {};
    this.noise = null;
  }

  private ensure(): void {
    if (this.ctx) return;
    const AC = window.AudioContext ?? window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC({ latencyHint: "interactive" });
    this.noise = makeNoiseBuffer(this.ctx);

    this.master = this.ctx.createGain();
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -14;
    this.compressor.knee.value = 10;
    this.compressor.ratio.value = 3.2;
    this.compressor.attack.value = 0.004;
    this.compressor.release.value = 0.14;

    this.master.connect(this.compressor);
    this.compressor.connect(this.ctx.destination);

    for (const id of TRACK_IDS) {
      const bus = this.ctx.createGain();
      bus.connect(this.master);
      this.buses[id] = bus;
    }

    this.applyMix();

    const resume = () => {
      if (this.ctx && this.ctx.state === "suspended") void this.ctx.resume();
    };
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") resume();
    });
    window.addEventListener("focus", resume);
  }

  private applyMix(): void {
    if (!this.master) return;
    const masterLin = this.mix.muted ? 0 : this.mix.master * this.mix.master;
    this.master.gain.setTargetAtTime(masterLin, this.ctx?.currentTime ?? 0, 0.02);
    for (const id of TRACK_IDS) {
      const bus = this.buses[id];
      if (!bus) continue;
      const g = this.mix.trackMute[id] ? 0 : this.mix.trackGain[id] * this.mix.trackGain[id];
      bus.gain.setTargetAtTime(g, this.ctx?.currentTime ?? 0, 0.02);
    }
  }

  private scheduler(): void {
    if (!this.ctx || !this.playing || !this.pattern) return;
    const stepDur = 60 / this.tempo / 4;
    while (this.nextNoteTime < this.ctx.currentTime + SCHEDULE_AHEAD) {
      const step = this.currentStep;
      let when = this.nextNoteTime;
      if (step % 2 === 1) {
        when += this.swing * stepDur * 0.62;
      }
      this.scheduleStep(step, when);
      this.nextNoteTime += stepDur;
      this.currentStep = (this.currentStep + 1) % 16;
    }
  }

  private scheduleStep(step: number, when: number): void {
    if (!this.ctx || !this.pattern) return;
    const hits: TrackId[] = [];
    for (const id of TRACK_IDS) {
      const value = this.pattern[id][step] ?? 0;
      if (value > 0 && !this.mix.trackMute[id]) {
        this.voice(id, when, value === 2);
        hits.push(id);
      }
    }
    const delay = Math.max(0, (when - this.ctx.currentTime) * 1000);
    const ui = setTimeout(() => {
      this.onStep?.(step);
      if (hits.length) this.onHit?.(step, hits);
    }, delay);
    this.uiTimers.push(ui);
  }

  private dest(track: TrackId): AudioNode {
    return this.buses[track] ?? this.master!;
  }

  private voice(track: TrackId, time: number, accent: boolean): void {
    switch (track) {
      case "kick":
        this.kick(time, accent);
        break;
      case "snare":
        this.snare(time, accent);
        break;
      case "hats":
        this.hats(time, accent);
        break;
      case "perc":
        this.perc(time, accent);
        break;
    }
  }

  private kick(time: number, accent: boolean): void {
    if (!this.ctx) return;
    const dest = this.dest("kick");
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    const startF = accent ? 172 : 138;
    osc.frequency.setValueAtTime(startF, time);
    osc.frequency.exponentialRampToValueAtTime(48, time + 0.055);
    osc.frequency.exponentialRampToValueAtTime(28, time + 0.32);
    env(gain.gain, time, accent ? 1 : 0.82, 0.002, accent ? 0.42 : 0.34);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(time);
    osc.stop(time + 0.5);

    const click = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    click.type = "square";
    click.frequency.setValueAtTime(accent ? 96 : 72, time);
    env(clickGain.gain, time, 0.22, 0.001, 0.018);
    click.connect(clickGain);
    clickGain.connect(dest);
    click.start(time);
    click.stop(time + 0.03);
    disconnectLater([osc, gain, click, clickGain], 700);
  }

  private snare(time: number, accent: boolean): void {
    if (!this.ctx || !this.noise) return;
    const dest = this.dest("snare");

    if (accent) {
      const src = this.ctx.createBufferSource();
      src.buffer = this.noise;
      const bp = this.ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 2400;
      bp.Q.value = 2.4;
      const g = this.ctx.createGain();
      env(g.gain, time, 0.7, 0.001, 0.07);
      src.connect(bp);
      bp.connect(g);
      g.connect(dest);
      src.start(time);
      src.stop(time + 0.12);

      const tone = this.ctx.createOscillator();
      tone.type = "triangle";
      tone.frequency.setValueAtTime(420, time);
      const tg = this.ctx.createGain();
      env(tg.gain, time, 0.28, 0.001, 0.06);
      tone.connect(tg);
      tg.connect(dest);
      tone.start(time);
      tone.stop(time + 0.1);
      disconnectLater([src, bp, g, tone, tg], 400);
      return;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noise;
    const hp = this.ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 900;
    const bp = this.ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1800;
    bp.Q.value = 0.9;
    const ng = this.ctx.createGain();
    env(ng.gain, time, 0.72, 0.002, 0.16);
    noise.connect(hp);
    hp.connect(bp);
    bp.connect(ng);
    ng.connect(dest);
    noise.start(time);
    noise.stop(time + 0.22);

    const body = this.ctx.createOscillator();
    body.type = "triangle";
    body.frequency.setValueAtTime(186, time);
    body.frequency.exponentialRampToValueAtTime(140, time + 0.1);
    const bg = this.ctx.createGain();
    env(bg.gain, time, 0.45, 0.002, 0.12);
    body.connect(bg);
    bg.connect(dest);
    body.start(time);
    body.stop(time + 0.18);
    disconnectLater([noise, hp, bp, ng, body, bg], 500);
  }

  private hats(time: number, accent: boolean): void {
    if (!this.ctx || !this.noise) return;
    const dest = this.dest("hats");
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    const jitter = 1 + (Math.random() * 0.03 - 0.015);
    const hp = this.ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = (accent ? 6800 : 7800) * jitter;
    const bp = this.ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = (accent ? 7200 : 9000) * jitter;
    bp.Q.value = 0.7;
    const g = this.ctx.createGain();
    const decay = accent ? 0.28 : 0.045;
    env(g.gain, time, accent ? 0.38 : 0.32, 0.001, decay);
    src.connect(hp);
    hp.connect(bp);
    bp.connect(g);
    g.connect(dest);
    src.start(time);
    src.stop(time + decay + 0.04);

    const freqs = accent ? [320, 540, 800] : [420, 680];
    const extras: AudioNode[] = [src, hp, bp, g];
    for (const f of freqs) {
      const osc = this.ctx.createOscillator();
      osc.type = "square";
      osc.frequency.value = f * 8.2 * jitter;
      const og = this.ctx.createGain();
      env(og.gain, time, 0.04, 0.001, decay * 0.8);
      osc.connect(og);
      og.connect(dest);
      osc.start(time);
      osc.stop(time + decay + 0.02);
      extras.push(osc, og);
    }
    disconnectLater(extras, (decay + 0.08) * 1000);
  }

  private perc(time: number, accent: boolean): void {
    if (!this.ctx || !this.noise) return;
    const dest = this.dest("perc");

    if (accent) {
      const extras: AudioNode[] = [];
      for (const f of [560, 845]) {
        const osc = this.ctx.createOscillator();
        osc.type = "square";
        osc.frequency.setValueAtTime(f, time);
        const g = this.ctx.createGain();
        env(g.gain, time, 0.18, 0.001, 0.22);
        const bp = this.ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = f;
        bp.Q.value = 6;
        osc.connect(bp);
        bp.connect(g);
        g.connect(dest);
        osc.start(time);
        osc.stop(time + 0.28);
        extras.push(osc, g, bp);
      }
      disconnectLater(extras, 450);
      return;
    }

    const bursts = [0, 0.012, 0.024, 0.042];
    const extras: AudioNode[] = [];
    bursts.forEach((offset, i) => {
      if (!this.ctx || !this.noise) return;
      const src = this.ctx.createBufferSource();
      src.buffer = this.noise;
      const bp = this.ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 1100;
      bp.Q.value = 0.85;
      const hp = this.ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 700;
      const g = this.ctx.createGain();
      const peak = i === bursts.length - 1 ? 0.55 : 0.22;
      const decay = i === bursts.length - 1 ? 0.18 : 0.04;
      env(g.gain, time + offset, peak, 0.001, decay);
      src.connect(hp);
      hp.connect(bp);
      bp.connect(g);
      g.connect(dest);
      src.start(time + offset);
      src.stop(time + offset + decay + 0.05);
      extras.push(src, bp, hp, g);
    });
    disconnectLater(extras, 500);
  }
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

export const engine = new PulseEngine();
