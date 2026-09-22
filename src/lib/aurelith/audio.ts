import { BOUNDS, OPTICAL_LOCKED } from "./spec";
import { clamp01 } from "./macros";
import type { MacroMap } from "./types";

const GAIN_CEILING = BOUNDS.gainCeiling;

function makeNoise(ctx: AudioContext) {
  const length = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let c = 0; c < 2; c += 1) {
    const data = buffer.getChannelData(c);
    let last = 0;
    for (let i = 0; i < length; i += 1) {
      const white = Math.random() * 2 - 1;
      last = last * 0.97 + white * 0.03;
      data[i] = last * 1.8;
    }
  }
  return buffer;
}

export type AudioStatus = "locked" | "running" | "suspended" | "unavailable";

export class SceneAudio {
  ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private safety: DynamicsCompressorNode | null = null;
  analyser: AnalyserNode | null = null;
  private drone: OscillatorNode | null = null;
  private harmonic: OscillatorNode | null = null;
  private noiseSrc: AudioBufferSourceNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;
  private harmFilter: BiquadFilterNode | null = null;
  private atmFilter: BiquadFilterNode | null = null;
  private droneGain: GainNode | null = null;
  private harmGain: GainNode | null = null;
  private atmGain: GainNode | null = null;
  private cueGain: GainNode | null = null;
  private peak: BiquadFilterNode | null = null;
  private freq = new Uint8Array(1024);
  private time = new Uint8Array(2048);
  private lastRms = 0;
  muted = false;
  status: AudioStatus = "locked";
  sourceLabel = "none — waiting for an intentional gesture";

  async activate(): Promise<AudioStatus> {
    try {
      if (!this.ctx) {
        const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new Ctor({ latencyHint: "interactive" });
        this.buildGraph(this.ctx);
      }
      if (this.ctx.state === "suspended") {
        await this.ctx.resume();
      }
      this.status = this.ctx.state === "running" ? "running" : "suspended";
      this.sourceLabel = "scene tone + atmosphere (generated, no microphone)";
      return this.status;
    } catch {
      this.status = "unavailable";
      this.sourceLabel = "Web Audio unavailable in this browser";
      return this.status;
    }
  }

  private buildGraph(ctx: AudioContext) {
    const master = ctx.createGain();
    master.gain.value = 0.0001;

    const safety = ctx.createDynamicsCompressor();
    safety.threshold.value = -18;
    safety.knee.value = 18;
    safety.ratio.value = 8;
    safety.attack.value = 0.004;
    safety.release.value = 0.18;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = BOUNDS.analyserFft;
    analyser.smoothingTimeConstant = 0.72;
    this.freq = new Uint8Array(analyser.frequencyBinCount);
    this.time = new Uint8Array(analyser.fftSize);

    const droneFilter = ctx.createBiquadFilter();
    droneFilter.type = "lowpass";
    droneFilter.frequency.value = 640;
    droneFilter.Q.value = 0.7;

    const harmFilter = ctx.createBiquadFilter();
    harmFilter.type = "lowpass";
    harmFilter.frequency.value = 1400;

    const atmFilter = ctx.createBiquadFilter();
    atmFilter.type = "bandpass";
    atmFilter.frequency.value = 480;
    atmFilter.Q.value = 0.6;

    const peak = ctx.createBiquadFilter();
    peak.type = "peaking";
    peak.frequency.value = 1100;
    peak.Q.value = 1.1;
    peak.gain.value = 0;

    const droneGain = ctx.createGain();
    const harmGain = ctx.createGain();
    const atmGain = ctx.createGain();
    const cueGain = ctx.createGain();
    droneGain.gain.value = 0.0001;
    harmGain.gain.value = 0.0001;
    atmGain.gain.value = 0.0001;
    cueGain.gain.value = 0.18;

    const drone = ctx.createOscillator();
    drone.type = "sine";
    drone.frequency.value = 55;

    const harmonic = ctx.createOscillator();
    harmonic.type = "triangle";
    harmonic.frequency.value = 82.5;

    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = makeNoise(ctx);
    noiseSrc.loop = true;

    drone.connect(droneFilter).connect(droneGain).connect(peak);
    harmonic.connect(harmFilter).connect(harmGain).connect(peak);
    noiseSrc.connect(atmFilter).connect(atmGain).connect(peak);
    cueGain.connect(safety);
    peak.connect(safety);
    safety.connect(master);
    master.connect(ctx.destination);
    safety.connect(analyser);

    drone.start();
    harmonic.start();
    noiseSrc.start();

    this.master = master;
    this.safety = safety;
    this.analyser = analyser;
    this.drone = drone;
    this.harmonic = harmonic;
    this.noiseSrc = noiseSrc;
    this.droneFilter = droneFilter;
    this.harmFilter = harmFilter;
    this.atmFilter = atmFilter;
    this.droneGain = droneGain;
    this.harmGain = harmGain;
    this.atmGain = atmGain;
    this.cueGain = cueGain;
    this.peak = peak;

    ctx.addEventListener("statechange", () => {
      if (!this.ctx) return;
      if (this.ctx.state === "running") this.status = "running";
      else if (this.ctx.state === "suspended") this.status = "suspended";
    });
  }

  apply(applied: MacroMap) {
    if (!this.ctx || this.status === "locked" || this.status === "unavailable") return;
    const t = this.ctx.currentTime;
    const tau = 0.08;
    const intensity = clamp01(applied.intensity);
    const depth = clamp01(applied.depth);
    const atmosphere = clamp01(applied.atmosphere);
    const focus = clamp01(applied.focus);
    const material = clamp01(applied.material);
    const axis = clamp01(applied.axis);
    const narrative = clamp01(applied.narrative);
    void applied.optical;
    void OPTICAL_LOCKED;

    const visualLed = Math.min(GAIN_CEILING, intensity * intensity * 0.55);
    const master = this.muted ? 0.0001 : Math.max(0.0001, visualLed);
    this.master?.gain.setTargetAtTime(master, t, tau);

    const cutoff = 180 + depth * 2200;
    this.droneFilter?.frequency.setTargetAtTime(cutoff, t, 0.12);
    this.harmFilter?.frequency.setTargetAtTime(400 + depth * 2800, t, 0.12);

    const atm = this.muted ? 0.0001 : 0.01 + atmosphere * 0.08 * (0.4 + narrative);
    this.atmGain?.gain.setTargetAtTime(atm, t, 0.14);
    this.atmFilter?.frequency.setTargetAtTime(220 + atmosphere * 900, t, 0.14);

    const sacred = 1 - axis;
    this.droneGain?.gain.setTargetAtTime(0.08 + intensity * 0.16 * sacred, t, tau);
    this.harmGain?.gain.setTargetAtTime(0.02 + intensity * 0.12 * (0.25 + axis * 0.75) * (0.4 + material), t, tau);

    if (this.harmonic) {
      this.harmonic.frequency.setTargetAtTime(axis > 0.5 ? 98 : 82.5, t, 0.2);
      this.harmonic.type = axis > 0.66 ? "sawtooth" : "triangle";
    }
    if (this.drone) {
      this.drone.frequency.setTargetAtTime(48 + (1 - axis) * 14, t, 0.2);
    }

    this.peak?.gain.setTargetAtTime((focus - 0.5) * 8, t, 0.1);
  }

  sample() {
    const empty = { rms: 0, low: 0, mid: 0, high: 0, onset: 0, tAudio: this.ctx?.currentTime ?? 0 };
    if (!this.analyser || this.status !== "running") return empty;
    this.analyser.getByteTimeDomainData(this.time);
    this.analyser.getByteFrequencyData(this.freq);
    let sum = 0;
    for (let i = 0; i < this.time.length; i += 1) {
      const v = (this.time[i] - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / this.time.length);
    const n = this.freq.length;
    const band = (a: number, b: number) => {
      let s = 0;
      const start = Math.floor(a * n);
      const end = Math.max(start + 1, Math.floor(b * n));
      for (let i = start; i < end; i += 1) s += this.freq[i];
      return s / (end - start) / 255;
    };
    const low = band(0, 0.08);
    const mid = band(0.08, 0.28);
    const high = band(0.28, 0.7);
    const onset = rms > this.lastRms + 0.045 ? 1 : Math.max(0, (this.lastRms - rms) * 0.2);
    this.lastRms = this.lastRms * 0.82 + rms * 0.18;
    return { rms, low, mid, high, onset, tAudio: this.ctx?.currentTime ?? 0 };
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (!this.ctx || !this.master) return;
    this.master.gain.setTargetAtTime(muted ? 0.0001 : 0.12, this.ctx.currentTime, 0.04);
  }

  cue(kind: "activate" | "stabilize" | "export" | "fallback" | "trial") {
    if (!this.ctx || !this.cueGain || this.muted || this.status !== "running") return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const freqs = { activate: 528, stabilize: 196, export: 392, fallback: 164, trial: 660 };
    osc.frequency.value = freqs[kind];
    osc.type = "sine";
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.09, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    osc.connect(g).connect(this.cueGain);
    osc.start(t);
    osc.stop(t + 0.22);
    osc.onended = () => {
      try {
        osc.disconnect();
        g.disconnect();
      } catch {
        /* already gone */
      }
    };
  }

  currentTime() {
    return this.ctx?.currentTime ?? 0;
  }
}

export const sceneAudio = new SceneAudio();
