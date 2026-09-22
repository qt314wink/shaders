import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { a as cn, i as Wordmark, n as ProductNav, o as probeRenderers, r as Slider, t as Button } from "./wordmark-Bj6KVvl7.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/grammar-BdguR5Ua.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var VERT = `#version 300 es
precision highp float;
layout(location=0) in vec2 aPos;
out vec2 vUv;
void main(){
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;
var FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;

uniform vec2 uRes;
uniform float uTime;
uniform vec2 uLook;
uniform float uTimeScale;
uniform float uWarp;
uniform float uThickMul;
uniform float uDensMul;
uniform float uRoughMul;

uniform float uThinFilm, uThick0, uThick1, uN0, uN1, uN2, uFilmGen, uFilmFreq;
uniform float uMulti, uLayers, uTa, uTb, uNA, uNB, uOriGen;
uniform float uGrating, uPeriod, uGroove, uOrders;
uniform float uFDiel, uIorD, uFCond, uN, uK, uMicro, uRough, uAniso;
uniform float uRefr, uEta, uCaustic, uCScale, uCGen, uCMix;
uniform float uScatter, uDensity, uG, uPhase, uSigmaS, uSigmaA, uAbsorb, uDensGen;
uniform float uEmit, uTemp, uEmitAmt;
uniform float uViewExp, uViewLobe;
uniform float uStage;

float hash(vec2 p){
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(1.0, 1.0));
  float d = hash(i + vec2(0.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (d - a) * u.y * (1.0 - u.x) + (c - b) * u.x * u.y;
}
float fbm(vec2 p){
  float v = 0.0; float a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.52; }
  return v;
}
float worley(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p);
  float d = 1.0;
  for (int y = -1; y <= 1; y++)
  for (int x = -1; x <= 1; x++) {
    vec2 g = vec2(float(x), float(y));
    vec2 o = vec2(hash(i + g), hash(i + g + 19.7));
    d = min(d, length(g + o - f));
  }
  return d;
}

float field(vec2 p, float gen, float freq){
  float g = floor(gen + 0.5);
  float t = uTime * uTimeScale;
  float f = max(freq, 0.25);
  if (g < 0.5) return 0.5;
  if (g < 1.5) return fbm(p * f * 3.0 + vec2(t * 0.07, 0.0));
  if (g < 2.5) return worley(p * f * 5.5 + t * 0.04);
  if (g < 3.5) return clamp(p.x, 0.0, 1.0);
  if (g < 4.5) return clamp(1.05 - p.y * 1.15 + 0.06 * fbm(p * 3.2 + t * 0.04), 0.0, 1.0);
  if (g < 5.5) return fbm(p * f * 1.15 + vec2(t * 0.02, uLook.x * 0.18));
  if (g < 6.5) {
    float w = sin(p.x * 7.5 * f + t * 0.8) * sin(p.y * 5.8 * f + t * 0.52);
    return 0.5 + 0.5 * w;
  }
  if (g < 7.5) {
    float v = fbm(p * vec2(f * 0.7, f * 2.6) + vec2(uLook.x * 0.35, t * 0.015));
    return smoothstep(0.32, 0.68, v);
  }
  if (g < 8.5) return fbm(p * 2.0 + vec2(t * 0.03));
  return clamp(length(p - 0.5) * 1.4, 0.0, 1.0);
}

vec3 wavelengthRgb(float l){
  float t = clamp((l - 380.0) / 400.0, 0.0, 1.0);
  vec3 c = vec3(
    1.65 * max(0.0, 1.0 - abs(t - 0.78) * 3.0),
    1.45 * max(0.0, 1.0 - abs(t - 0.45) * 2.7),
    1.75 * max(0.0, 1.0 - abs(t - 0.16) * 3.15)
  );
  if (l > 500.0 && l < 580.0) c.r += 0.12;
  float fade = smoothstep(380.0, 425.0, l) * (1.0 - smoothstep(685.0, 780.0, l));
  return c * fade;
}

vec3 filmColor(float dNm, float nFilm, float nInc, float nExit, float cosT){
  if (dNm < 10.0) return vec3(0.0);
  float path = 2.0 * nFilm * dNm * cosT;
  float r01 = abs((nInc - nFilm) / (nInc + nFilm));
  float r12 = abs((nFilm - nExit) / (nFilm + nExit));
  float amp0 = mix(r01, r12, 0.5);
  float phi = nFilm > nExit ? 3.14159265 : 0.0;
  vec3 acc = vec3(0.0);
  for (int i = 0; i < 12; i++) {
    float l = 400.0 + float(i) * 30.0;
    float phase = 6.2831853 * path / l + phi;
    float amp = 0.5 + 0.5 * cos(phase);
    acc += wavelengthRgb(l) * amp0 * amp;
  }
  float thinFade = smoothstep(8.0, 28.0, dNm);
  return acc * 2.15 * thinFade;
}

vec3 bragg(float layers, float ta, float tb, float na, float nb, float cosT){
  float Lambda = max(na * ta + nb * tb, 8.0);
  float contrast = abs(na - nb);
  float Q = mix(3.5, 22.0, clamp(layers / 90.0, 0.0, 1.0));
  vec3 acc = vec3(0.0);
  for (int m = 1; m <= 6; m++) {
    float lam = 2.0 * Lambda * cosT / float(m);
    if (lam < 360.0 || lam > 820.0) continue;
    float bw = max(10.0, lam / (Q * float(m)));
    float orderW = 1.0 / (0.55 + float(m) * 0.35);
    for (int i = 0; i < 12; i++) {
      float l = 400.0 + float(i) * 30.0;
      float w = exp(-0.5 * pow((l - lam) / bw, 2.0));
      acc += wavelengthRgb(l) * w * orderW;
    }
  }
  float gain = (0.18 + contrast * 7.5) * mix(0.45, 1.15, clamp(layers / 50.0, 0.0, 1.0));
  return acc * gain;
}

vec3 gratingRgb(vec2 p, float periodUm, float orders, float cosT){
  float mMax = max(orders, 1.0);
  vec3 acc = vec3(0.0);
  float s = clamp(sqrt(max(1.0 - cosT * cosT, 0.0)), 0.08, 0.96);
  for (int m = 1; m <= 5; m++) {
    if (float(m) > mMax) break;
    float lam = periodUm * 1000.0 * s / float(m);
    acc += wavelengthRgb(lam) * (1.0 / float(m));
  }
  float grooves = 0.42 + 0.58 * pow(0.5 + 0.5 * sin((p.x + p.y * 0.12) * 165.0 / max(periodUm, 0.2)), 1.35);
  return acc * grooves * 1.05;
}

vec3 conductor(float n, float k, float cosT, float rough, float aniso, vec2 p){
  float F0 = pow((n - 1.0) / (n + 1.0), 2.0) + k * 0.08;
  F0 = clamp(F0, 0.04, 0.98);
  float fres = F0 + (1.0 - F0) * pow(1.0 - cosT, 5.0);
  vec3 tint = mix(vec3(0.72, 0.75, 0.8), vec3(0.96, 0.78, 0.44), clamp(k / 8.0, 0.0, 1.0));
  float spec = pow(cosT, mix(90.0, 8.0, rough));
  float streaks = mix(1.0, 0.62 + 0.38 * sin(p.y * 38.0 + p.x * 2.2), clamp(aniso, 0.0, 1.0));
  return tint * (fres * 0.8 + spec * (1.0 - rough) * 0.95) * streaks;
}

vec3 blackbody(float T){
  float t = clamp((T - 800.0) / 2000.0, 0.0, 1.0);
  return vec3(1.0, 0.22 + 0.62 * t, 0.04 + 0.38 * t * t) * (0.22 + t);
}

void main(){
  vec2 uv = vUv;
  vec2 p = uv * 2.0 - 1.0;
  float aspect = uRes.y > 1.0 ? uRes.x / uRes.y : 1.5;
  p.x *= aspect;
  float t = uTime * uTimeScale;
  vec2 warpUv = uv + uWarp * 0.035 * vec2(
    fbm(uv * 3.0 + t * 0.1) - 0.5,
    fbm(uv * 3.0 + 17.0 - t * 0.08) - 0.5
  );

  float stage = floor(uStage + 0.5);
  vec3 N;
  vec3 V = normalize(vec3(-uLook.x * 1.5, -uLook.y * 1.25, 1.0));
  vec3 L = normalize(vec3(0.45 + uLook.x * 1.1, 0.72 + uLook.y * 0.4, 0.78));
  float mask = 1.0;
  vec3 col = vec3(0.02, 0.022, 0.028);
  float ao = 1.0;
  float rad = 0.78;
  float dSph = length(p);
  float zSph = sqrt(max(rad * rad - dSph * dSph, 0.0));

  if (stage < 1.5) {
    N = normalize(vec3(p, zSph + 0.0001));
    mask = smoothstep(rad + 0.018, rad - 0.01, dSph);
    ao = mix(0.42, 1.0, zSph / rad);
    float contrast = abs(uNA - uNB);
    if (uMulti > 0.5 && uGrating > 0.5) {
      col = vec3(0.035, 0.04, 0.07) * ao;
    } else if (uMulti > 0.5 && contrast < 0.08) {
      col = vec3(0.055, 0.06, 0.065) * ao;
    } else if (uMulti > 0.5) {
      col = vec3(0.66, 0.6, 0.52) * ao;
    } else if (uFCond > 0.5) {
      col = vec3(0.08, 0.08, 0.09) * ao;
    } else if (uScatter > 0.5) {
      col = vec3(0.42, 0.36, 0.28) * ao;
    } else {
      col = vec3(0.12, 0.11, 0.1) * ao;
    }
  } else if (stage < 2.5) {
    N = normalize(vec3(p * 0.28, 1.0));
    mask = 1.0;
    col = vec3(0.035, 0.04, 0.055);
  } else if (stage < 3.5) {
    N = normalize(vec3(
      0.24 * (field(warpUv, uCGen > 0.5 ? uCGen : 6.0, 1.0) - 0.5),
      0.2 * (field(warpUv + 4.0, 6.0, 1.1) - 0.5),
      1.0
    ));
    mask = 1.0;
    col = vec3(0.025, 0.05, 0.07);
  } else if (stage < 4.5) {
    float radM = 0.72;
    float dM = length(p * vec2(1.0, 1.12));
    float zM = sqrt(max(radM * radM - dM * dM, 0.0));
    N = normalize(vec3(p, zM + 0.0001));
    mask = smoothstep(radM + 0.03, radM - 0.012, dM) * (0.28 + 0.72 * (zM / radM));
    col = vec3(0.012, 0.014, 0.02);
  } else {
    N = normalize(vec3(
      0.16 * (field(warpUv, uCGen > 0.5 ? uCGen : 6.0, 1.0) - 0.5),
      0.12 * (field(warpUv + 4.0, 6.0, 1.1) - 0.5),
      1.0
    ));
    mask = 1.0;
    col = vec3(0.018, 0.038, 0.05);
  }

  float cosT = clamp(dot(N, V), 0.02, 1.0);
  float nl = clamp(dot(N, L), 0.0, 1.0);

  float viewW = 1.0;
  if (uViewExp > 0.0) {
    float lobe = uViewLobe;
    float w = nl;
    if (lobe > 0.5 && lobe < 1.5) w = pow(1.0 - cosT, 1.15);
    else if (lobe > 1.5 && lobe < 2.5) w = pow(max(dot(reflect(-L, N), V), 0.0), 3.0);
    else if (lobe > 2.5) w = pow(max(cosT, 0.0), mix(0.7, 2.4, clamp(uViewExp / 10.0, 0.0, 1.0)));
    else w = pow(1.0 - cosT, 0.5) * 0.55 + 0.45;
    float floorW = uGrating > 0.5 && uMulti > 0.5 ? 0.28 : 0.16;
    viewW = mix(floorW, 1.0, clamp(pow(w, max(uViewExp * 0.18, 0.25)), 0.0, 1.0));
  }

  if (uThinFilm > 0.5) {
    float th = field(warpUv, uFilmGen, uFilmFreq);
    float dnm = mix(uThick0, uThick1, th) * max(uThickMul, 0.15);
    col += filmColor(dnm, uN1, uN0, uN2, cosT) * viewW * uThinFilm * 1.15;
  }

  if (uMulti > 0.5) {
    float ori = field(warpUv, uOriGen, 1.05);
    float ta = uTa * (0.93 + 0.14 * ori) * mix(1.0, uThickMul, 0.4);
    float tb = uTb * mix(1.0, uThickMul, 0.4);
    float contrast = abs(uNA - uNB);
    float tilt = contrast < 0.08 ? mix(0.94, 1.0, ori) : mix(0.78, 1.0, ori);
    vec3 stack = bragg(uLayers, ta, tb, uNA, uNB, clamp(cosT * tilt, 0.18, 1.0));
    if (uGrating > 0.5) {
      float ridges = 0.5 + 0.5 * sin((warpUv.x + warpUv.y * 0.08) * 155.0 / max(uPeriod, 0.25));
      ridges = mix(0.55, 1.0, pow(ridges, 1.2));
      stack *= ridges;
    }
    if (contrast < 0.08) {
      float schiller = pow(max(nl, 0.0), 5.2) * pow(cosT, 2.6);
      col += stack * schiller * 2.6 * uMulti;
    } else {
      col += stack * viewW * uMulti * 0.72;
    }
  }

  if (uGrating > 0.5 && uMulti < 0.5) {
    col += gratingRgb(warpUv, uPeriod, uOrders, cosT) * viewW * uGrating;
  }

  if (uFCond > 0.5) {
    float r = clamp(uRough * uRoughMul, 0.02, 0.92);
    col += conductor(uN, uK, cosT, r, uAniso, warpUv) * (0.5 + 0.5 * uMicro) * uFCond;
  }

  if (uFDiel > 0.5 && uThinFilm < 0.4 && uMulti < 0.4) {
    float F = 0.04 + 0.96 * pow(1.0 - cosT, 5.0);
    vec3 rim = uScatter > 0.5 ? vec3(0.82, 0.9, 0.98) : vec3(0.74, 0.84, 0.92);
    col += rim * F * 0.62 * uFDiel;
  }

  if (uFDiel > 0.5 && uMulti > 0.5) {
    float F = 0.04 + 0.96 * pow(1.0 - cosT, 5.0);
    col += vec3(0.92, 0.88, 0.8) * F * 0.4 * uFDiel;
  }

  if (uCaustic > 0.5) {
    float w = field(warpUv * vec2(1.55, 1.0), uCGen > 0.5 ? uCGen : 6.0, 1.1);
    float c = pow(abs(0.5 - w) * 2.0, 3.2);
    vec2 e = vec2(0.012, 0.0);
    float lap = abs(field(warpUv + e, 6.0, 1.1) + field(warpUv - e, 6.0, 1.1) - 2.0 * w);
    float mixC = uCMix > 0.0 ? uCMix : 1.0;
    col += vec3(0.55, 0.84, 1.0) * (c * 1.45 + lap * 8.5) * uCScale * uCaustic * mixC;
  }

  if (uRefr > 0.5) {
    vec2 offset = N.xy * (uEta - 1.0) * 0.14;
    col += vec3(0.08, 0.16, 0.22) * (0.35 + 0.65 * noise((warpUv + offset) * 9.0)) * uRefr * 0.45;
  }

  if (uScatter > 0.5) {
    float dens = field(warpUv, uDensGen, 1.25) * uDensity * max(uDensMul, 0.2);
    dens = clamp(dens, 0.0, 1.6);
    float g = clamp(uG, -0.9, 0.95);
    float mu = nl;
    float hg = (1.0 - g * g) / pow(max(1.0 + g * g - 2.0 * g * mu, 0.0001), 1.5);
    vec3 scatterCol;
    if (uPhase > 1.5) {
      scatterCol = vec3(0.95, 0.96, 0.98);
      float silver = pow(max(mu, 0.0), 8.0) * dens;
      col += scatterCol * dens * (0.75 + 0.7 * hg) * max(uSigmaS * 0.2, 1.05) * uScatter;
      col += vec3(1.0, 1.0, 0.99) * silver * 1.85 * uScatter;
    } else if (uPhase > 0.5) {
      vec3 blue = vec3(0.42, 0.68, 1.0);
      vec3 amber = vec3(0.96, 0.7, 0.32);
      float through = pow(cosT, 1.4);
      scatterCol = mix(blue, amber, through);
      col += scatterCol * dens * (0.7 + 0.5 * hg) * max(uSigmaS * 0.22, 0.55) * uScatter;
    } else {
      scatterCol = mix(vec3(0.55, 0.22, 0.48), vec3(0.25, 0.55, 0.95), uv.x);
      col += scatterCol * dens * (0.4 + 0.7 * hg) * max(uSigmaS * 0.35, 0.45) * uScatter;
    }
  }

  if (uAbsorb > 0.5) {
    float dens = field(warpUv, uDensGen, 1.25) * uDensity * max(uDensMul, 0.2);
    vec3 beer = exp(-vec3(uSigmaA * 0.28, uSigmaA * 0.7, uSigmaA * 1.35) * dens);
    col *= mix(vec3(1.0), beer, 0.42 * uAbsorb);
  }

  if (uEmit > 0.5) {
    float dens = field(warpUv, uDensGen > 0.5 ? uDensGen : 2.0, 0.85);
    vec3 em = uTemp > 100.0 ? blackbody(uTemp) : vec3(0.45, 1.0, 0.52) * dens + vec3(1.0, 0.22, 0.38) * (1.0 - dens);
    col += em * (0.28 + 0.95 * dens) * max(uEmitAmt, 0.35) * uEmit;
  }

  float rim = pow(1.0 - cosT, 3.0);
  col += vec3(0.1, 0.12, 0.14) * rim * 0.22 * mask;
  float vig = smoothstep(1.28, 0.22, length(p));
  col *= mix(0.62, 1.0, vig);
  col *= mask;
  col += vec3(0.055, 0.058, 0.065) * (1.0 - mask);
  col = col / (1.0 + col * 0.32);
  col = pow(max(col, 0.0), vec3(0.92));
  fragColor = vec4(col, 1.0);
}`;
function slug(recipe) {
	return recipe.id.replace(/[^a-z0-9-]/g, "-");
}
function shaderName(recipe) {
	return recipe.title.replace(/[^A-Za-z0-9]+/g, "");
}
function uniformBlock(u) {
	return Object.keys(u).map((k) => `  ${k}: ${Number(u[k]).toFixed(4)}`).join("\n");
}
function opsList(recipe) {
	return recipe.nodes.map((n) => n.operator).filter((o) => o !== "spectral-integrate");
}
var KERNEL_DOC = `Operator kernels — Shader Grammar v0.1
The live lookdev canvas is GLSL ES 3.00 / WebGL2. These files are the SAME
operators (Airy film, Bragg orders m=1..6, grating as modulation when stacked
with Bragg, HG phase, conductor Fresnel). They are not a bit-identical decompile
of the sketch, so they will not pixel-match. Bind the uniform block. Do not add
a named-effect flag (oilSlick, pearlescent, holographic).

Optical is simulation-only. Do not drive a laser, beam, or haptic from this.`;
var BRAGG_GLSL = `// λ_m = 2 Λ cosθ / m, Λ = nA tA + nB tB. Sample m = 1..6 in the visible.`;
function hlslKernels(u) {
	return `// ${KERNEL_DOC}

#define TAU 6.2831853

float3 WavelengthRgb(float l)
{
    float t = saturate((l - 380.0) / 400.0);
    float3 c = float3(
        1.55 * max(0.0, 1.0 - abs(t - 0.78) * 3.1),
        1.35 * max(0.0, 1.0 - abs(t - 0.45) * 2.9),
        1.60 * max(0.0, 1.0 - abs(t - 0.16) * 3.3)
    );
    float fade = smoothstep(380.0, 420.0, l) * (1.0 - smoothstep(700.0, 780.0, l));
    return c * fade;
}

// Two-interface Airy. Net π when nFilm > nExit → black as d → 0.
float3 FilmColor(float dNm, float nFilm, float nInc, float nExit, float cosT)
{
    if (dNm < 12.0) return 0;
    float path = 2.0 * nFilm * dNm * cosT;
    float3 acc = 0;
    [unroll] for (int i = 0; i < 12; i++)
    {
        float l = 390.0 + i * 32.0;
        float phase = TAU * path / l + (nFilm > nExit ? 3.14159 : 0.0);
        float r01 = abs((nInc - nFilm) / (nInc + nFilm));
        float r12 = abs((nFilm - nExit) / (nFilm + nExit));
        acc += WavelengthRgb(l) * lerp(r01, r12, 0.5) * (0.5 + 0.5 * cos(phase));
    }
    return acc * smoothstep(8.0, 40.0, dNm) * 1.6;
}

// ${BRAGG_GLSL}
float3 Bragg(float layers, float ta, float tb, float na, float nb, float cosT)
{
    float Lambda = na * ta + nb * tb;
    float3 acc = 0;
    float Q = lerp(3.5, 22.0, saturate(layers / 90.0));
    [unroll] for (int m = 1; m <= 6; m++)
    {
        float lam = 2.0 * Lambda * cosT / m;
        if (lam < 360.0 || lam > 820.0) continue;
        float bw = max(14.0, lam / (Q * m));
        [unroll] for (int i = 0; i < 12; i++)
        {
            float l = 390.0 + i * 32.0;
            float w = exp(-0.5 * pow((l - lam) / bw, 2.0));
            acc += WavelengthRgb(l) * w;
        }
    }
    float contrast = abs(na - nb);
    return acc * (0.18 + contrast * 7.5);
}

float HG(float mu, float g)
{
    float gg = g * g;
    return (1.0 - gg) / pow(max(1.0 + gg - 2.0 * g * mu, 1e-4), 1.5);
}

// Bound uniforms from the live recipe (lookdev knobs write these).
static const float uThinFilm = ${u.uThinFilm.toFixed(4)};
static const float uMulti    = ${u.uMulti.toFixed(4)};
static const float uGrating  = ${u.uGrating.toFixed(4)};
static const float uTa = ${u.uTa.toFixed(3)};
static const float uTb = ${u.uTb.toFixed(3)};
static const float uNA = ${u.uNA.toFixed(4)};
static const float uNB = ${u.uNB.toFixed(4)};
static const float uLayers = ${u.uLayers.toFixed(1)};
static const float uThick0 = ${u.uThick0.toFixed(2)};
static const float uThick1 = ${u.uThick1.toFixed(2)};
static const float uN0 = ${u.uN0.toFixed(4)};
static const float uN1 = ${u.uN1.toFixed(4)};
static const float uN2 = ${u.uN2.toFixed(4)};
static const float uPeriod = ${u.uPeriod.toFixed(4)};
static const float uG = ${u.uG.toFixed(4)};
static const float uDensity = ${u.uDensity.toFixed(4)};
static const float uStage = ${u.uStage.toFixed(1)};
`;
}
function wgslKernels(u) {
	return `// ${KERNEL_DOC}

struct Uniforms {
  look: vec2f,
  time: f32,
  ta: f32,
  tb: f32,
  nA: f32,
  nB: f32,
  layers: f32,
  thick0: f32,
  thick1: f32,
  n0: f32,
  n1: f32,
  n2: f32,
  thinFilm: f32,
  multi: f32,
  grating: f32,
  period: f32,
  g: f32,
  density: f32,
  stage: f32,
}

@group(0) @binding(0) var<uniform> u: Uniforms;

fn wavelength_rgb(l: f32) -> vec3f {
  let t = clamp((l - 380.0) / 400.0, 0.0, 1.0);
  let c = vec3f(
    1.55 * max(0.0, 1.0 - abs(t - 0.78) * 3.1),
    1.35 * max(0.0, 1.0 - abs(t - 0.45) * 2.9),
    1.60 * max(0.0, 1.0 - abs(t - 0.16) * 3.3),
  );
  let fade = smoothstep(380.0, 420.0, l) * (1.0 - smoothstep(700.0, 780.0, l));
  return c * fade;
}

fn film_color(d_nm: f32, n_film: f32, n_inc: f32, n_exit: f32, cos_t: f32) -> vec3f {
  if (d_nm < 12.0) { return vec3f(0.0); }
  let path = 2.0 * n_film * d_nm * cos_t;
  var acc = vec3f(0.0);
  for (var i = 0; i < 12; i++) {
    let l = 390.0 + f32(i) * 32.0;
    let phase = 6.2831853 * path / l + select(0.0, 3.14159, n_film > n_exit);
    let r01 = abs((n_inc - n_film) / (n_inc + n_film));
    let r12 = abs((n_film - n_exit) / (n_film + n_exit));
    acc += wavelength_rgb(l) * mix(r01, r12, 0.5) * (0.5 + 0.5 * cos(phase));
  }
  return acc * smoothstep(8.0, 40.0, d_nm) * 1.6;
}

fn bragg(layers: f32, ta: f32, tb: f32, na: f32, nb: f32, cos_t: f32) -> vec3f {
  let Lambda = na * ta + nb * tb;
  var acc = vec3f(0.0);
  let Q = mix(3.5, 22.0, clamp(layers / 90.0, 0.0, 1.0));
  for (var m = 1; m <= 6; m++) {
    let lam = 2.0 * Lambda * cos_t / f32(m);
    if (lam < 360.0 || lam > 820.0) { continue; }
    let bw = max(14.0, lam / (Q * f32(m)));
    for (var i = 0; i < 12; i++) {
      let l = 390.0 + f32(i) * 32.0;
      let w = exp(-0.5 * pow((l - lam) / bw, 2.0));
      acc += wavelength_rgb(l) * w;
    }
  }
  let contrast = abs(na - nb);
  return acc * (0.18 + contrast * 7.5);
}

fn hg(mu: f32, g: f32) -> f32 {
  let gg = g * g;
  return (1.0 - gg) / pow(max(1.0 + gg - 2.0 * g * mu, 1e-4), 1.5);
}

// Defaults captured from lookdev at export.
// ta=${u.uTa.toFixed(1)} tb=${u.uTb.toFixed(1)} nA=${u.uNA.toFixed(3)} nB=${u.uNB.toFixed(3)}
// film ${u.uThinFilm} multi ${u.uMulti} grating ${u.uGrating} stage ${u.uStage}
`;
}
function unityShader(recipe, u) {
	return `Shader "AURELITH/Grammar/${shaderName(recipe)}"
{
    Properties
    {
        [Header(Shader Grammar v0.1)]
        _Ta ("Thickness A (nm)", Float) = ${u.uTa.toFixed(1)}
        _Tb ("Thickness B (nm)", Float) = ${u.uTb.toFixed(1)}
        _NA ("nA", Float) = ${u.uNA.toFixed(3)}
        _NB ("nB", Float) = ${u.uNB.toFixed(3)}
        _Layers ("Bilayers", Float) = ${u.uLayers.toFixed(0)}
        _Thick0 ("Film min (nm)", Float) = ${u.uThick0.toFixed(1)}
        _Thick1 ("Film max (nm)", Float) = ${u.uThick1.toFixed(1)}
        _N0 ("n incident", Float) = ${u.uN0.toFixed(4)}
        _N1 ("n film", Float) = ${u.uN1.toFixed(4)}
        _N2 ("n exit", Float) = ${u.uN2.toFixed(4)}
        _Period ("Grating period (um)", Float) = ${u.uPeriod.toFixed(3)}
        _G ("HG g", Float) = ${u.uG.toFixed(3)}
        _Density ("Density", Float) = ${u.uDensity.toFixed(3)}
        _ThinFilm ("Thin film weight", Range(0,1)) = ${u.uThinFilm.toFixed(1)}
        _Multi ("Multilayer weight", Range(0,1)) = ${u.uMulti.toFixed(1)}
        _Grating ("Grating weight", Range(0,1)) = ${u.uGrating.toFixed(1)}
        _Scatter ("Scatter weight", Range(0,1)) = ${u.uScatter.toFixed(1)}
        _IorMetal ("Conductor n", Float) = ${u.uN.toFixed(3)}
        _KMetal ("Conductor k", Float) = ${u.uK.toFixed(3)}
    }
    SubShader
    {
        Tags { "RenderType"="Opaque" "RenderPipeline"="UniversalPipeline" "Queue"="Geometry" }
        Pass
        {
            Name "Grammar"
            Tags { "LightMode"="UniversalForward" }
            HLSLPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"

            ${hlslKernels(u)}

            CBUFFER_START(UnityPerMaterial)
                float _Ta, _Tb, _NA, _NB, _Layers;
                float _Thick0, _Thick1, _N0, _N1, _N2;
                float _Period, _G, _Density;
                float _ThinFilm, _Multi, _Grating, _Scatter;
                float _IorMetal, _KMetal;
            CBUFFER_END

            struct Attr { float4 pos : POSITION; float3 nrm : NORMAL; float2 uv : TEXCOORD0; };
            struct V2F { float4 pos : SV_POSITION; float3 nrm : TEXCOORD0; float2 uv : TEXCOORD1; };

            V2F vert(Attr v)
            {
                V2F o;
                o.pos = TransformObjectToHClip(v.pos.xyz);
                o.nrm = TransformObjectToWorldNormal(v.nrm);
                o.uv = v.uv;
                return o;
            }

            half4 frag(V2F i) : SV_Target
            {
                float3 N = normalize(i.nrm);
                float3 V = GetWorldSpaceNormalizeViewDir(float3(0,0,0));
                float cosT = saturate(dot(N, V));
                float3 col = 0.04;

                if (_ThinFilm > 0.5)
                {
                    float dnm = lerp(_Thick0, _Thick1, i.uv.y);
                    col += FilmColor(dnm, _N1, _N0, _N2, cosT) * _ThinFilm;
                }
                if (_Multi > 0.5)
                {
                    float3 stack = Bragg(_Layers, _Ta, _Tb, _NA, _NB, cosT);
                    if (_Grating > 0.5)
                    {
                        float ridges = 0.5 + 0.5 * sin(i.uv.x * 155.0 / max(_Period, 0.25));
                        stack *= lerp(0.55, 1.0, ridges);
                    }
                    col += stack * _Multi;
                }
                else if (_Grating > 0.5)
                {
                    float s = sqrt(max(1.0 - cosT * cosT, 0.08));
                    float3 gcol = 0;
                    [unroll] for (int m = 1; m <= 4; m++)
                    {
                        float lam = (_Period * 1000.0 * s) / m;
                        gcol += WavelengthRgb(lam) / m;
                    }
                    col += gcol * _Grating;
                }
                if (_Scatter > 0.5)
                {
                    float mu = saturate(dot(N, float3(0.3, 0.7, 0.6)));
                    col += float3(0.93, 0.95, 0.98) * _Density * HG(mu, _G) * _Scatter;
                }
                return half4(col / (1.0 + col * 0.38), 1);
            }
            ENDHLSL
        }
    }
    FallBack Off
}
`;
}
function unityBinder(recipe) {
	return `// AurelithGrammarBinder.cs
// Maps aurelith.scene.v1 macros onto AURELITH/Grammar/${shaderName(recipe)}.
// Drop on the same GameObject as the MeshRenderer. Optical is simulation-only.
// Do not bind these floats to a physical laser, DMX fixture, or haptic.

using UnityEngine;

[ExecuteAlways]
public class AurelithGrammarBinder : MonoBehaviour
{
    public Material grammar;
    [Range(0, 1)] public float intensity = 0.5f;
    [Range(0, 1)] public float depth = 0.5f;
    [Range(0, 1)] public float atmosphere = 0.3f;
    [Range(0, 1)] public float focus = 0.5f;
    [Range(0, 1)] public float material = 0.18f;
    const float OpticalLocked = 0.35f;

    void LateUpdate()
    {
        if (!grammar) return;
        grammar.SetFloat("_Density", Mathf.Lerp(0.2f, 1.2f, depth));
        grammar.SetFloat("_G", Mathf.Lerp(0.2f, 0.92f, focus));
        // intensity is scene emissive, not a pigment. Optical stays locked.
        Shader.SetGlobalFloat("_AurelithOptical", OpticalLocked);
        Shader.SetGlobalFloat("_AurelithIntensity", intensity);
        Shader.SetGlobalFloat("_AurelithAtmosphere", atmosphere);
        Shader.SetGlobalFloat("_AurelithMaterial", material);
    }
}
`;
}
function contractJson(recipe, u) {
	return JSON.stringify({
		schema: "aurelith.grammar.backend.v1",
		recipe: recipe.id,
		title: recipe.title,
		operators: opsList(recipe),
		optical: "simulation-only",
		runtimes: {
			lookdev: "GLSL ES 3.00 / WebGL2 (live canvas)",
			webgpu: "WGSL fragment, same uniform block",
			unity: `URP shader AURELITH/Grammar/${shaderName(recipe)}`,
			three: "r3f / three.js ShaderMaterial using the GLSL kernels. Closed graph only."
		},
		uniforms: u,
		equations: {
			film: "2 n d cosθ = m λ",
			bragg: "λ_m = 2 (nA tA + nB tB) cosθ / m",
			grating: "d sinθ = m λ (modulates Bragg when both bound)",
			hg: "p(μ) = (1 - g²) / (1 + g² - 2 g μ)^{3/2}"
		},
		r3fGraph: [
			"PerspectiveCamera — depth macro → z",
			"FogExp2 — atmosphere macro → density",
			"Points — closed vertex table (bloom 16 / lattice 49 / coil 96 / gate 24 / vesica 64)",
			"LineLoop — same table",
			"Points — particle budget from quality tier",
			"No GLTF, no unbounded scene graph, no physical beam"
		],
		warnings: [
			"Do not add named-effect flags.",
			"Do not drive a laser, haptic, or health device.",
			"Kernels will not pixel-match the lookdev sketch."
		]
	}, null, 2);
}
function glslFile(recipe, u) {
	return `/* Live lookdev backend — GLSL ES 3.00 / WebGL2
 * Specimen: ${recipe.title} (${recipe.id})
 * Operators: ${opsList(recipe).join(", ")}
 * ${KERNEL_DOC}
 *
 * Uniforms at export:
${uniformBlock(u)}
 */

${VERT}

${FRAG}
`;
}
function wgslFile(recipe, u) {
	return `// WebGPU backend — WGSL
// Specimen: ${recipe.title} (${recipe.id})
// Operators: ${opsList(recipe).join(", ")}
// Bind group 0, binding 0 = Uniforms. Draw a fullscreen triangle or a mesh.
// Prefer navigator.gpu when present; lookdev stays on WebGL2 until this is wired.

${wgslKernels(u)}

struct VsOut {
  @builtin(position) pos: vec4f,
  @location(0) uv: vec2f,
  @location(1) nrm: vec3f,
}

@vertex
fn vs(@location(0) pos: vec3f, @location(1) nrm: vec3f, @location(2) uv: vec2f) -> VsOut {
  var o: VsOut;
  o.pos = vec4f(pos, 1.0);
  o.uv = uv;
  o.nrm = nrm;
  return o;
}

@fragment
fn fs(i: VsOut) -> @location(0) vec4f {
  let N = normalize(i.nrm);
  let V = vec3f(0.0, 0.0, 1.0);
  let cos_t = max(dot(N, V), 0.02);
  var col = vec3f(0.04);
  if (u.thinFilm > 0.5) {
    let dnm = mix(u.thick0, u.thick1, i.uv.y);
    col += film_color(dnm, u.n1, u.n0, u.n2, cos_t) * u.thinFilm;
  }
  if (u.multi > 0.5) {
    var stack = bragg(u.layers, u.ta, u.tb, u.nA, u.nB, cos_t);
    if (u.grating > 0.5) {
      let ridges = 0.5 + 0.5 * sin(i.uv.x * 155.0 / max(u.period, 0.25));
      stack *= mix(0.55, 1.0, ridges);
    }
    col += stack * u.multi;
  }
  if (u.density > 0.0) {
    let mu = max(dot(N, vec3f(0.3, 0.7, 0.6)), 0.0);
    col += vec3f(0.93, 0.95, 0.98) * u.density * hg(mu, u.g);
  }
  col = col / (1.0 + col * 0.38);
  return vec4f(col, 1.0);
}
`;
}
function emitBackends(recipe, uniforms) {
	const id = slug(recipe);
	return [
		{
			id: "glsl",
			title: "GLSL ES 3.00",
			filename: `${id}.lookdev.glsl`,
			mime: "text/plain",
			runtime: "Lookdev canvas · WebGL2",
			note: "This is the live backend. The canvas compiles this source.",
			body: glslFile(recipe, uniforms)
		},
		{
			id: "wgsl",
			title: "WGSL",
			filename: `${id}.frag.wgsl`,
			mime: "text/plain",
			runtime: "WebGPU (navigator.gpu)",
			note: "Same operators. Wire bind group 0 when a WebGPU path is present. Lookdev does not switch until that path is proven.",
			body: wgslFile(recipe, uniforms)
		},
		{
			id: "hlsl",
			title: "HLSL kernels",
			filename: `${id}.grammar.hlsl`,
			mime: "text/plain",
			runtime: "Unity URP / DX12 / HDRP custom pass",
			note: "Operator kernels plus the captured uniform block. Not a named nacre shader.",
			body: hlslKernels(uniforms)
		},
		{
			id: "unity",
			title: "Unity URP shader",
			filename: `${shaderName(recipe)}Grammar.shader`,
			mime: "text/plain",
			runtime: "Unity 6 / URP · shader AURELITH/Grammar/" + shaderName(recipe),
			note: "Assign to a mesh. Pair with AurelithGrammarBinder.cs. Optical stays a simulation.",
			body: unityShader(recipe, uniforms) + "\n\n/* ---- binder ---- */\n\n" + unityBinder(recipe)
		},
		{
			id: "contract",
			title: "Backend contract",
			filename: `${id}.backend.json`,
			mime: "application/json",
			runtime: "three.js / r3f / Unity / WebGPU",
			note: "Uniform block, equations, and the closed r3f graph. This is the IR handoff.",
			body: contractJson(recipe, uniforms)
		}
	];
}
function downloadBackend(file) {
	const blob = new Blob([file.body], { type: file.mime });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = file.filename;
	a.click();
	URL.revokeObjectURL(url);
}
function v(values, id, fallback) {
	const n = values[id];
	return typeof n === "number" && Number.isFinite(n) ? n : fallback;
}
function cosFromLook(look) {
	const vx = -look.x * 1.5;
	const vy = -look.y * 1.25;
	const vz = 1;
	return Math.max(.2, Math.min(1, vz / (Math.hypot(vx, vy, vz) || 1)));
}
function fmt(n, digits = 0) {
	return n.toFixed(digits);
}
var OIL = {
	equation: "2 n d cosθ = m λ",
	timeScale: .55,
	warp: .7,
	knobs: [
		{
			id: "d",
			label: "Mean thickness",
			unit: "nm",
			min: 80,
			max: 900,
			step: 5,
			default: 340,
			mapsTo: "uThick0 / uThick1 — optical path of the hydrocarbon film"
		},
		{
			id: "nFilm",
			label: "Film IOR",
			unit: "n",
			min: 1.4,
			max: 1.55,
			step: .005,
			default: 1.47,
			mapsTo: "uN1 — hydrocarbon n"
		},
		{
			id: "caustic",
			label: "Caustic mix",
			unit: "weight",
			min: 0,
			max: .4,
			step: .01,
			default: .16,
			mapsTo: "uCMix — water caustics sit under the film, not over it"
		}
	],
	apply(u, values) {
		const d = v(values, "d", 340);
		const nFilm = v(values, "nFilm", 1.47);
		const caustic = v(values, "caustic", .16);
		return {
			...u,
			uThick0: d * .35,
			uThick1: d * 2.1,
			uN1: nFilm,
			uCMix: caustic,
			uCScale: .7
		};
	},
	live(u, look) {
		const c = cosFromLook(look);
		const d = (u.uThick0 + u.uThick1) / 2;
		const path = 2 * u.uN1 * d * c;
		return [
			{
				label: "Equation",
				value: "2 n d cosθ = m λ"
			},
			{
				label: "n, d, cosθ",
				value: `${fmt(u.uN1, 2)} · ${fmt(d, 0)} nm · ${fmt(c, 2)}`
			},
			{
				label: "2 n d cosθ",
				value: `${fmt(path, 0)} nm`
			},
			{
				label: "constructive m=1",
				value: `λ ≈ ${fmt(path / 1.5, 0)} nm  (2nd = 3λ/2)`
			},
			{
				label: "constructive m=2",
				value: `λ ≈ ${fmt(path / 2.5, 0)} nm`
			},
			{
				label: "Stack",
				value: `air ${fmt(u.uN0, 3)} / film ${fmt(u.uN1, 2)} / water ${fmt(u.uN2, 3)}`
			}
		];
	}
};
var SOAP = {
	equation: "2 n d cosθ = m λ · black film as d → 0",
	timeScale: .18,
	warp: .12,
	knobs: [
		{
			id: "dMax",
			label: "Foot thickness",
			unit: "nm",
			min: 80,
			max: 1200,
			step: 10,
			default: 720,
			mapsTo: "uThick1 — drainage field still goes to uThick0 at the top"
		},
		{
			id: "nFilm",
			label: "Film IOR",
			unit: "n",
			min: 1.33,
			max: 1.42,
			step: .005,
			default: 1.35,
			mapsTo: "uN1 — water + surfactant"
		},
		{
			id: "dMin",
			label: "Black-film floor",
			unit: "nm",
			min: 4,
			max: 40,
			step: 1,
			default: 8,
			mapsTo: "uThick0 — below ~10 nm all visible λ cancel"
		}
	],
	apply(u, values) {
		return {
			...u,
			uThick0: v(values, "dMin", 8),
			uThick1: v(values, "dMax", 720),
			uN1: v(values, "nFilm", 1.35),
			uN2: 1.0003
		};
	},
	live(u, look) {
		const c = cosFromLook(look);
		return [
			{
				label: "Equation",
				value: "2 n d cosθ = m λ"
			},
			{
				label: "n, cosθ",
				value: `${fmt(u.uN1, 2)} · ${fmt(c, 2)}`
			},
			{
				label: "Top (black)",
				value: `d = ${fmt(u.uThick0, 0)} nm`
			},
			{
				label: "Foot",
				value: `d = ${fmt(u.uThick1, 0)} nm`
			},
			{
				label: "Stack",
				value: "air / film / air — net π, black at zero"
			}
		];
	}
};
function braggLive(u, look) {
	const c = cosFromLook(look);
	const Lambda = u.uNA * u.uTa + u.uNB * u.uTb;
	const lines = [
		{
			label: "Equation",
			value: "λ_m = 2 Λ cosθ / m"
		},
		{
			label: "Λ = nA tA + nB tB",
			value: `${fmt(u.uNA, 2)}×${fmt(u.uTa, 0)} + ${fmt(u.uNB, 2)}×${fmt(u.uTb, 0)} = ${fmt(Lambda, 0)} nm`
		},
		{
			label: "cosθ",
			value: fmt(c, 2)
		}
	];
	for (let m = 1; m <= 4; m++) {
		const lam = 2 * Lambda * c / m;
		const vis = lam >= 380 && lam <= 780 ? "visible" : lam < 380 ? "UV" : "IR";
		lines.push({
			label: `m = ${m}`,
			value: `λ = ${fmt(lam, 0)} nm (${vis})`
		});
	}
	lines.push({
		label: "Δn, N",
		value: `${fmt(Math.abs(u.uNA - u.uNB), 3)} · ${fmt(u.uLayers, 0)} bilayers`
	});
	return lines;
}
var NACRE = {
	equation: "λ_m = 2 (nA tA + nB tB) cosθ / m",
	timeScale: .06,
	warp: .08,
	knobs: [
		{
			id: "tA",
			label: "Aragonite tablet",
			unit: "nm",
			min: 220,
			max: 700,
			step: 5,
			default: 450,
			mapsTo: "uTa — nA = 1.65. Pearl orient is m = 2, 3 of Λ ≈ 770 nm"
		},
		{
			id: "tB",
			label: "Protein sheet",
			unit: "nm",
			min: 8,
			max: 40,
			step: 1,
			default: 20,
			mapsTo: "uTb — nB = 1.40"
		},
		{
			id: "layers",
			label: "Bilayers",
			unit: "N",
			min: 40,
			max: 400,
			step: 2,
			default: 180,
			mapsTo: "uLayers — peak narrows as N grows"
		}
	],
	apply(u, values) {
		return {
			...u,
			uTa: v(values, "tA", 450),
			uTb: v(values, "tB", 20),
			uLayers: v(values, "layers", 180)
		};
	},
	live: braggLive
};
var CONTROLS = {
	"oil-slick": OIL,
	"soap-film": SOAP,
	nacre: NACRE,
	labradorite: {
		equation: "λ_m = 2 Λ cosθ / m · Δn ≈ 0.03",
		timeScale: .04,
		warp: .05,
		knobs: [
			{
				id: "period",
				label: "Lamella period",
				unit: "nm",
				min: 180,
				max: 420,
				step: 4,
				default: 260,
				mapsTo: "Scales tA + tB. m = 2 of Λ ≈ 400 nm is the blue-green flash"
			},
			{
				id: "dn",
				label: "IOR contrast Δn",
				unit: "Δn",
				min: .012,
				max: .08,
				step: .001,
				default: .03,
				mapsTo: "uNA − uNB. Low contrast is labradorescence, not a pigment"
			},
			{
				id: "view",
				label: "Angular lobe",
				unit: "exp",
				min: 2,
				max: 12,
				step: .1,
				default: 8.5,
				mapsTo: "uViewExp — flash collapses off the cleavage"
			}
		],
		apply(u, values) {
			const period = v(values, "period", 260);
			const dn = v(values, "dn", .03);
			const scale = period / 260;
			return {
				...u,
				uTa: 140 * scale,
				uTb: 120 * scale,
				uNA: 1.545 + dn / 2,
				uNB: 1.545 - dn / 2,
				uViewExp: v(values, "view", 8.5)
			};
		},
		live: braggLive
	},
	"butterfly-structural-color": {
		equation: "λ₁ = 2 Λ cosθ · ridges modulate, they do not add a rainbow",
		timeScale: .08,
		warp: .1,
		knobs: [
			{
				id: "tA",
				label: "Chitin lamella",
				unit: "nm",
				min: 60,
				max: 130,
				step: 1,
				default: 90,
				mapsTo: "uTa — nA = 1.56. Λ ≈ 210 nm → λ₁ ≈ 420 nm"
			},
			{
				id: "tB",
				label: "Air gap",
				unit: "nm",
				min: 40,
				max: 110,
				step: 1,
				default: 70,
				mapsTo: "uTb — nB = 1.00"
			},
			{
				id: "period",
				label: "Ridge period",
				unit: "μm",
				min: .4,
				max: 1.6,
				step: .02,
				default: .85,
				mapsTo: "uPeriod — grating modulates the Bragg lobe"
			}
		],
		apply(u, values) {
			return {
				...u,
				uTa: v(values, "tA", 90),
				uTb: v(values, "tB", 70),
				uPeriod: v(values, "period", .85),
				uViewExp: Math.min(u.uViewExp, 4.2)
			};
		},
		live(u, look) {
			const extra = braggLive(u, look);
			extra.push({
				label: "Ridges",
				value: `d = ${fmt(u.uPeriod, 2)} μm · d sinθ = m λ (modulation only)`
			});
			return extra;
		}
	},
	"holographic-foil": {
		equation: "d sinθ = m λ",
		timeScale: .12,
		warp: .08,
		knobs: [
			{
				id: "period",
				label: "Groove period",
				unit: "μm",
				min: .4,
				max: 2,
				step: .02,
				default: .85,
				mapsTo: "uPeriod — grating equation"
			},
			{
				id: "lacquer",
				label: "Lacquer thickness",
				unit: "nm",
				min: 80,
				max: 520,
				step: 5,
				default: 300,
				mapsTo: "uThick0 / uThick1 — Airy on the metal"
			},
			{
				id: "orders",
				label: "Orders",
				unit: "m",
				min: 1,
				max: 5,
				step: 1,
				default: 4,
				mapsTo: "uOrders"
			}
		],
		apply(u, values) {
			const lacquer = v(values, "lacquer", 300);
			return {
				...u,
				uPeriod: v(values, "period", .85),
				uThick0: lacquer * .7,
				uThick1: lacquer * 1.3,
				uOrders: v(values, "orders", 4)
			};
		},
		live(u, look) {
			const c = cosFromLook(look);
			const s = Math.sqrt(Math.max(1 - c * c, .08));
			const dnm = u.uPeriod * 1e3;
			return [
				{
					label: "Equation",
					value: "d sinθ = m λ"
				},
				{
					label: "d, sinθ",
					value: `${fmt(dnm, 0)} nm · ${fmt(s, 2)}`
				},
				{
					label: "m = 1",
					value: `λ = ${fmt(dnm * s / 1, 0)} nm`
				},
				{
					label: "m = 2",
					value: `λ = ${fmt(dnm * s / 2, 0)} nm`
				},
				{
					label: "Lacquer",
					value: `d ≈ ${fmt((u.uThick0 + u.uThick1) / 2, 0)} nm · 2 n d cosθ`
				}
			];
		}
	},
	"bismuth-oxide": {
		equation: "2 n d cosθ = m λ against conductor (n, k)",
		timeScale: .1,
		warp: .06,
		knobs: [
			{
				id: "d",
				label: "Oxide thickness",
				unit: "nm",
				min: 40,
				max: 380,
				step: 4,
				default: 180,
				mapsTo: "uThick0 / uThick1 — hopper steps set the field"
			},
			{
				id: "nFilm",
				label: "Oxide IOR",
				unit: "n",
				min: 1.9,
				max: 2.5,
				step: .01,
				default: 2.15,
				mapsTo: "uN1"
			},
			{
				id: "rough",
				label: "Hopper roughness",
				unit: "α",
				min: .06,
				max: .5,
				step: .01,
				default: .22,
				mapsTo: "uRough"
			}
		],
		apply(u, values) {
			const d = v(values, "d", 180);
			return {
				...u,
				uThick0: d * .45,
				uThick1: d * 1.55,
				uN1: v(values, "nFilm", 2.15),
				uRough: v(values, "rough", .22)
			};
		},
		live(u, look) {
			const c = cosFromLook(look);
			const d = (u.uThick0 + u.uThick1) / 2;
			const path = 2 * u.uN1 * d * c;
			return [
				{
					label: "Equation",
					value: "2 n d cosθ = m λ"
				},
				{
					label: "n, d, cosθ",
					value: `${fmt(u.uN1, 2)} · ${fmt(d, 0)} nm · ${fmt(c, 2)}`
				},
				{
					label: "2 n d cosθ",
					value: `${fmt(path, 0)} nm`
				},
				{
					label: "Exit",
					value: `conductor n,k · film sits on metal, not a rainbow texture`
				}
			];
		}
	},
	"molten-chrome": {
		equation: "Fresnel (n, k) + B(T) emission",
		timeScale: .42,
		warp: .55,
		knobs: [
			{
				id: "temp",
				label: "Temperature",
				unit: "K",
				min: 1400,
				max: 2200,
				step: 10,
				default: 1900,
				mapsTo: "uTemp — blackbody in the troughs, independent of Fresnel"
			},
			{
				id: "rough",
				label: "Convection roughness",
				unit: "α",
				min: .02,
				max: .4,
				step: .01,
				default: .12,
				mapsTo: "uRough"
			},
			{
				id: "aniso",
				label: "Shear",
				unit: "aniso",
				min: 0,
				max: 1,
				step: .01,
				default: .45,
				mapsTo: "uAniso"
			}
		],
		apply(u, values) {
			return {
				...u,
				uTemp: v(values, "temp", 1900),
				uRough: v(values, "rough", .12),
				uAniso: v(values, "aniso", .45),
				uEmitAmt: .85
			};
		},
		live(u) {
			return [
				{
					label: "Metal",
					value: `n = ${fmt(u.uN, 2)}, k = ${fmt(u.uK, 2)}`
				},
				{
					label: "Blackbody",
					value: `T = ${fmt(u.uTemp, 0)} K`
				},
				{
					label: "Roughness",
					value: `α = ${fmt(u.uRough, 2)} · aniso ${fmt(u.uAniso, 2)}`
				},
				{
					label: "Note",
					value: "Heat is volume emission. The metal is complex-IOR Fresnel."
				}
			];
		}
	},
	"caustic-water": {
		equation: "Snell + focus of ∇h · Beer’s law",
		timeScale: .7,
		warp: .35,
		knobs: [
			{
				id: "focus",
				label: "Focus scale",
				unit: "weight",
				min: .4,
				max: 2.2,
				step: .02,
				default: 1.4,
				mapsTo: "uCScale — caustic tightness"
			},
			{
				id: "eta",
				label: "Water IOR",
				unit: "n",
				min: 1.31,
				max: 1.36,
				step: .001,
				default: 1.333,
				mapsTo: "uEta"
			},
			{
				id: "absorb",
				label: "Absorption",
				unit: "1/m",
				min: .02,
				max: .8,
				step: .01,
				default: .14,
				mapsTo: "uSigmaA — red-preferring"
			}
		],
		apply(u, values) {
			return {
				...u,
				uCScale: v(values, "focus", 1.4),
				uEta: v(values, "eta", 1.333),
				uIorD: v(values, "eta", 1.333),
				uSigmaA: v(values, "absorb", .14),
				uCMix: 1
			};
		},
		live(u) {
			return [
				{
					label: "Snell",
					value: `n_air sinθ_i = ${fmt(u.uEta, 3)} sinθ_t`
				},
				{
					label: "Focus",
					value: `scale ${fmt(u.uCScale, 2)}`
				},
				{
					label: "Beer",
					value: `σ_a = ${fmt(u.uSigmaA, 2)} /m · water takes red first`
				}
			];
		}
	},
	cloud: {
		equation: "p(θ) = HG(g) · high albedo",
		timeScale: .28,
		warp: .2,
		knobs: [
			{
				id: "density",
				label: "Droplet density",
				unit: "rel",
				min: .25,
				max: 1.4,
				step: .02,
				default: .85,
				mapsTo: "uDensity"
			},
			{
				id: "g",
				label: "Asymmetry g",
				unit: "g",
				min: .4,
				max: .95,
				step: .01,
				default: .85,
				mapsTo: "uG — Mie droplets are forward-peaked. Silver lining."
			},
			{
				id: "sigmaS",
				label: "σ_s",
				unit: "1/m",
				min: 4,
				max: 22,
				step: .2,
				default: 12,
				mapsTo: "uSigmaS"
			}
		],
		apply(u, values) {
			return {
				...u,
				uDensity: v(values, "density", .85),
				uG: v(values, "g", .85),
				uSigmaS: v(values, "sigmaS", 12),
				uPhase: 2
			};
		},
		live(u) {
			return [
				{
					label: "Phase",
					value: "Henyey–Greenstein / Mie"
				},
				{
					label: "p(θ)",
					value: `(1 − g²) / (1 + g² − 2 g μ)^{3/2}`
				},
				{
					label: "g, σ_s, ρ",
					value: `${fmt(u.uG, 2)} · ${fmt(u.uSigmaS, 1)} /m · ${fmt(u.uDensity, 2)}`
				},
				{
					label: "Albedo",
					value: "σ_s / (σ_s + σ_a) ≈ 1 — white is not a cloud shader"
				}
			];
		}
	},
	nebula: {
		equation: "Same volume operators as cloud. Emission is a separate node.",
		timeScale: .16,
		warp: .12,
		knobs: [
			{
				id: "density",
				label: "Dust density",
				unit: "rel",
				min: .15,
				max: 1.2,
				step: .02,
				default: .55,
				mapsTo: "uDensity"
			},
			{
				id: "emit",
				label: "Line emission",
				unit: "weight",
				min: .2,
				max: 1.6,
				step: .02,
				default: 1,
				mapsTo: "uEmitAmt — Hβ, [O III], Hα as data"
			},
			{
				id: "g",
				label: "Asymmetry g",
				unit: "g",
				min: -.2,
				max: .7,
				step: .02,
				default: .35,
				mapsTo: "uG"
			}
		],
		apply(u, values) {
			return {
				...u,
				uDensity: v(values, "density", .55),
				uEmitAmt: v(values, "emit", 1),
				uG: v(values, "g", .35),
				uPhase: 0
			};
		},
		live(u) {
			return [
				{
					label: "Lines",
					value: "Hβ 486 nm · [O III] 501 nm · Hα 656 nm"
				},
				{
					label: "g, ρ, emit",
					value: `${fmt(u.uG, 2)} · ${fmt(u.uDensity, 2)} · ${fmt(u.uEmitAmt, 2)}`
				},
				{
					label: "Operators",
					value: "volume-scattering + absorption + emission"
				}
			];
		}
	},
	"opalescent-glass": {
		equation: "I_s ∝ λ⁻⁴ · glass Fresnel at the boundary",
		timeScale: .08,
		warp: .06,
		knobs: [
			{
				id: "density",
				label: "Inclusion density",
				unit: "rel",
				min: .08,
				max: .9,
				step: .02,
				default: .42,
				mapsTo: "uDensity — Rayleigh scatter in the bulk"
			},
			{
				id: "ior",
				label: "Glass IOR",
				unit: "n",
				min: 1.45,
				max: 1.55,
				step: .005,
				default: 1.52,
				mapsTo: "uIorD / uEta — sphere boundary"
			},
			{
				id: "sigmaS",
				label: "σ_s (blue-weighted)",
				unit: "1/m",
				min: 1,
				max: 8,
				step: .1,
				default: 2.7,
				mapsTo: "uSigmaS"
			}
		],
		apply(u, values) {
			const ior = v(values, "ior", 1.52);
			return {
				...u,
				uDensity: v(values, "density", .42),
				uIorD: ior,
				uEta: ior,
				uSigmaS: v(values, "sigmaS", 2.7),
				uPhase: 1,
				uStage: 1
			};
		},
		live(u) {
			return [
				{
					label: "Rayleigh",
					value: "I_s / I_t ∝ λ⁻⁴  →  blue scatter / amber transmit"
				},
				{
					label: "n, ρ, σ_s",
					value: `${fmt(u.uIorD, 2)} · ${fmt(u.uDensity, 2)} · ${fmt(u.uSigmaS, 1)} /m`
				},
				{
					label: "Boundary",
					value: "Dielectric Fresnel + Snell on a glass sphere. Not a volume slab."
				}
			];
		}
	}
};
function controlsFor(id) {
	return CONTROLS[id] ?? NACRE;
}
function defaultKnobs(id) {
	const out = {};
	for (const k of controlsFor(id).knobs) out[k.id] = k.default;
	return out;
}
function applyPhysicalKnobs(uniforms, specimenId, values) {
	const c = controlsFor(specimenId);
	return {
		uniforms: c.apply(uniforms, values),
		timeScale: c.timeScale,
		warp: c.warp
	};
}
var bundle = {
	version: "0.1.0",
	operators: [
		{
			"id": "thin-film-interference",
			"title": "Thin-film interference",
			"family": "interference",
			"reusable": true,
			"description": "Two-interface Airy interference. Color is a function of optical path 2 n d cos θ, not a material flag. Oil slicks, soap films, oxide tarnish, and lacquered foil all bind this operator.",
			"outputs": ["spectral-radiance"],
			"references": ["Heavens 1955", "Belcour & Barla 2017"],
			"slots": {
				"thickness": {
					"kind": "thickness",
					"unit": "nm",
					"required": true,
					"field": "required"
				},
				"nIncident": {
					"kind": "ior-real",
					"unit": "dimensionless",
					"required": true,
					"field": "forbidden"
				},
				"nFilm": {
					"kind": "ior-real",
					"unit": "dimensionless",
					"required": true,
					"field": "forbidden"
				},
				"nExit": {
					"kind": "ior-real",
					"unit": "dimensionless",
					"required": true,
					"field": "forbidden"
				}
			}
		},
		{
			"id": "multilayer-interference",
			"title": "Multilayer interference",
			"family": "interference",
			"reusable": true,
			"description": "N-period Bragg / lamellar stack. Peak wavelength is set by bilayer optical thickness and IOR contrast. Nacre, labradorite, and Morpho-type scales share this operator.",
			"outputs": ["spectral-radiance"],
			"references": ["Kinoshita 2008", "Nassau 2001"],
			"slots": {
				"layerCount": {
					"kind": "count",
					"unit": "dimensionless",
					"required": true,
					"field": "forbidden"
				},
				"thicknessA": {
					"kind": "thickness",
					"unit": "nm",
					"required": true,
					"field": "allowed"
				},
				"thicknessB": {
					"kind": "thickness",
					"unit": "nm",
					"required": true,
					"field": "allowed"
				},
				"nA": {
					"kind": "ior-real",
					"unit": "dimensionless",
					"required": true,
					"field": "forbidden"
				},
				"nB": {
					"kind": "ior-real",
					"unit": "dimensionless",
					"required": true,
					"field": "forbidden"
				},
				"orientation": {
					"kind": "angle",
					"unit": "rad",
					"required": true,
					"field": "required"
				}
			}
		},
		{
			"id": "diffraction-grating",
			"title": "Diffraction grating",
			"family": "diffraction",
			"reusable": true,
			"description": "Periodic microstructure. The grating equation m λ = p (sin θi + sin θd) produces spectral orders. Butterfly scale ridges and embossed holographic foil bind the same operator with different periods.",
			"outputs": ["spectral-radiance"],
			"references": ["Born & Wolf", "Kinoshita 2008"],
			"slots": {
				"period": {
					"kind": "period",
					"unit": "um",
					"required": true,
					"field": "allowed"
				},
				"depth": {
					"kind": "length",
					"unit": "nm",
					"required": true,
					"field": "allowed"
				},
				"orientation": {
					"kind": "angle",
					"unit": "rad",
					"required": true,
					"field": "allowed"
				},
				"orders": {
					"kind": "count",
					"unit": "dimensionless",
					"required": true,
					"field": "forbidden"
				}
			}
		},
		{
			"id": "fresnel-dielectric",
			"title": "Dielectric Fresnel",
			"family": "interface",
			"reusable": true,
			"description": "Real-IOR interface reflectance (Schlick / exact Fresnel). Used wherever a dielectric boundary is visible: films, nacre, water, glass.",
			"outputs": ["bsdf-lobe", "weight"],
			"slots": { "ior": {
				"kind": "ior-real",
				"unit": "dimensionless",
				"required": true,
				"field": "forbidden"
			} }
		},
		{
			"id": "fresnel-conductor",
			"title": "Conductor Fresnel",
			"family": "interface",
			"reusable": true,
			"description": "Complex-IOR interface for metals. n and k may be spectral. Foil aluminum, bismuth, and molten chrome share this operator.",
			"outputs": ["bsdf-lobe"],
			"slots": { "ior": {
				"kind": "ior-complex",
				"unit": "dimensionless",
				"required": true,
				"field": "forbidden"
			} }
		},
		{
			"id": "microfacet-scatter",
			"title": "Microfacet scatter",
			"family": "interface",
			"reusable": true,
			"description": "GGX/Beckmann distribution of normals. Roughness and anisotropy are geometric, independent of the Fresnel term they modulate.",
			"outputs": ["bsdf-lobe"],
			"slots": {
				"roughness": {
					"kind": "roughness",
					"unit": "dimensionless",
					"required": true,
					"field": "allowed"
				},
				"anisotropy": {
					"kind": "anisotropy",
					"unit": "dimensionless",
					"required": true,
					"field": "allowed"
				}
			}
		},
		{
			"id": "refraction-snell",
			"title": "Snell refraction",
			"family": "geometric",
			"reusable": true,
			"description": "Transmission through a dielectric interface. eta is the relative IOR. Water and bulk glass both bind this operator.",
			"outputs": ["throughput"],
			"slots": {
				"iorInside": {
					"kind": "ior-real",
					"unit": "dimensionless",
					"required": true,
					"field": "forbidden"
				},
				"iorOutside": {
					"kind": "ior-real",
					"unit": "dimensionless",
					"required": true,
					"field": "forbidden"
				}
			}
		},
		{
			"id": "caustic-transport",
			"title": "Caustic transport",
			"family": "geometric",
			"reusable": true,
			"description": "Focusing of refracted or reflected light by a displacement field. Intensity follows the inverse Jacobian of the refracted mapping. Water surfaces are the type specimen; oil on waves reuses it.",
			"outputs": ["spectral-radiance"],
			"slots": {
				"displacement": {
					"kind": "length",
					"unit": "mm",
					"required": true,
					"field": "required"
				},
				"ior": {
					"kind": "ior-real",
					"unit": "dimensionless",
					"required": true,
					"field": "forbidden"
				},
				"focusScale": {
					"kind": "weight",
					"unit": "dimensionless",
					"required": true,
					"field": "forbidden"
				}
			}
		},
		{
			"id": "volume-scattering",
			"title": "Volume scattering",
			"family": "volume",
			"reusable": true,
			"description": "In-scattering with a closed phase-function enum (Henyey-Greenstein, Rayleigh, Mie). Cloud, nebula, and opalescent glass differ by density, albedo, and phase — not by separate operators.",
			"outputs": ["spectral-radiance"],
			"slots": {
				"density": {
					"kind": "density",
					"unit": "kg/m3",
					"required": true,
					"field": "required"
				},
				"sigmaS": {
					"kind": "scattering-coeff",
					"unit": "1/m",
					"required": true,
					"field": "allowed"
				},
				"phase": {
					"kind": "phase-function",
					"unit": "enum",
					"required": true,
					"field": "forbidden",
					"enumValues": [
						"hg",
						"rayleigh",
						"mie"
					]
				},
				"g": {
					"kind": "anisotropy",
					"unit": "dimensionless",
					"required": false,
					"field": "forbidden",
					"notes": "Used when phase is hg or mie."
				}
			}
		},
		{
			"id": "volume-absorption",
			"title": "Volume absorption",
			"family": "volume",
			"reusable": true,
			"description": "Beer-Lambert extinction. sigmaA may be spectral (water red-absorb, nebular dust). Shared by participating media and tinted dielectrics.",
			"outputs": ["throughput"],
			"slots": {
				"density": {
					"kind": "density",
					"unit": "kg/m3",
					"required": true,
					"field": "required"
				},
				"sigmaA": {
					"kind": "extinction",
					"unit": "1/m",
					"required": true,
					"field": "allowed"
				}
			}
		},
		{
			"id": "volume-emission",
			"title": "Volume emission",
			"family": "volume",
			"reusable": true,
			"description": "Additive spectral emission in a medium or at a hot surface treated as a thin emitting layer. Nebular lines and molten-metal blackbody both bind this operator.",
			"outputs": ["spectral-radiance"],
			"slots": {
				"density": {
					"kind": "density",
					"unit": "kg/m3",
					"required": true,
					"field": "allowed"
				},
				"radiance": {
					"kind": "spectral-power",
					"unit": "W/m3/sr/nm",
					"required": false,
					"field": "allowed"
				},
				"temperature": {
					"kind": "temperature",
					"unit": "K",
					"required": false,
					"field": "forbidden"
				}
			}
		},
		{
			"id": "view-dependent-weight",
			"title": "View-dependent weight",
			"family": "evaluation",
			"reusable": true,
			"description": "Weights upstream radiance by a viewing/lighting lobe (fresnel, grazing, retro, specular). Structural color is directional because of this operator, not because of a material-named anisotropic flag.",
			"outputs": ["weight"],
			"slots": {
				"exponent": {
					"kind": "weight",
					"unit": "dimensionless",
					"required": true,
					"field": "forbidden"
				},
				"lobe": {
					"kind": "lobe",
					"unit": "enum",
					"required": true,
					"field": "forbidden",
					"enumValues": [
						"fresnel",
						"grazing",
						"retro",
						"specular"
					]
				}
			}
		},
		{
			"id": "spectral-integrate",
			"title": "Spectral integrate",
			"family": "evaluation",
			"reusable": true,
			"description": "Converts spectral radiance to display RGB under a standard illuminant and observer. Every colored recipe ends here so that encoding stays spectral until evaluation.",
			"outputs": ["display-rgb"],
			"slots": {
				"illuminant": {
					"kind": "illuminant",
					"unit": "enum",
					"required": true,
					"field": "forbidden",
					"enumValues": [
						"D65",
						"A",
						"E"
					]
				},
				"observer": {
					"kind": "observer",
					"unit": "enum",
					"required": true,
					"field": "forbidden",
					"enumValues": ["CIE-1931-2deg"]
				}
			}
		}
	],
	recipes: [
		{
			"id": "bismuth-oxide",
			"version": "0.1.0",
			"title": "Bismuth oxide",
			"taxonomyIds": [
				"thin-film",
				"conductor-interface",
				"microfacet"
			],
			"summary": "An oxide film on bismuth metal. Iridescent tarnish is thin-film interference against a conductor Fresnel exit medium, with hopper-crystal roughness — the same film operator as oil and soap.",
			"phenomena": ["thin-film-interference", "conductor-fresnel"],
			"fields": [{
				"id": "oxide-thickness",
				"kind": "thickness",
				"unit": "nm",
				"domain": "surface",
				"source": {
					"type": "procedural",
					"generator": "worley",
					"frequency": 4.5
				},
				"range": [40, 380],
				"notes": "Oxidation fronts follow hopper steps, so thickness is cellular rather than smoothly fbm."
			}, {
				"id": "hopper-roughness",
				"kind": "roughness",
				"unit": "dimensionless",
				"domain": "surface",
				"source": {
					"type": "procedural",
					"generator": "worley",
					"frequency": 3.2
				},
				"range": [.08, .45]
			}],
			"parameters": [
				{
					"id": "n-air",
					"kind": "ior-real",
					"unit": "dimensionless",
					"value": 1.0003
				},
				{
					"id": "n-oxide",
					"kind": "ior-real",
					"unit": "dimensionless",
					"value": 2.15,
					"range": [1.9, 2.5]
				},
				{
					"id": "n-exit-proxy",
					"kind": "ior-real",
					"unit": "dimensionless",
					"value": 1.8,
					"notes": "Real part of the metal used as film exit IOR; the conductor node carries the complex pair."
				},
				{
					"id": "ior-bismuth",
					"kind": "ior-complex",
					"unit": "dimensionless",
					"complex": {
						"n": 1.8,
						"k": 3.4
					}
				},
				{
					"id": "anisotropy",
					"kind": "anisotropy",
					"unit": "dimensionless",
					"value": .15
				},
				{
					"id": "illuminant",
					"kind": "illuminant",
					"unit": "enum",
					"enum": "D65"
				},
				{
					"id": "observer",
					"kind": "observer",
					"unit": "enum",
					"enum": "CIE-1931-2deg"
				}
			],
			"nodes": [
				{
					"id": "oxide",
					"operator": "thin-film-interference",
					"bind": {
						"thickness": { "field": "oxide-thickness" },
						"nIncident": { "param": "n-air" },
						"nFilm": { "param": "n-oxide" },
						"nExit": { "param": "n-exit-proxy" }
					}
				},
				{
					"id": "metal",
					"operator": "fresnel-conductor",
					"bind": { "ior": { "param": "ior-bismuth" } }
				},
				{
					"id": "microfacet",
					"operator": "microfacet-scatter",
					"bind": {
						"roughness": { "field": "hopper-roughness" },
						"anisotropy": { "param": "anisotropy" }
					}
				},
				{
					"id": "display",
					"operator": "spectral-integrate",
					"bind": {
						"illuminant": { "param": "illuminant" },
						"observer": { "param": "observer" }
					}
				}
			],
			"graph": {
				"output": "display",
				"edges": [
					{
						"from": "oxide",
						"to": "display"
					},
					{
						"from": "metal",
						"to": "microfacet"
					},
					{
						"from": "microfacet",
						"to": "display"
					}
				]
			},
			"evaluation": {
				"illuminant": "D65",
				"observer": "CIE-1931-2deg"
			}
		},
		{
			"id": "butterfly-structural-color",
			"version": "0.1.0",
			"title": "Butterfly structural color",
			"taxonomyIds": [
				"multilayer",
				"grating",
				"view-weight"
			],
			"summary": "Chitin scale architecture: a multilayer stack for the Bragg peak plus a ridge grating for angular selectivity. Morpho-type blue is composed, not a named morpho shader.",
			"phenomena": [
				"multilayer-interference",
				"diffraction",
				"view-dependent-color"
			],
			"fields": [{
				"id": "scale-orientation",
				"kind": "angle",
				"unit": "rad",
				"domain": "surface",
				"source": {
					"type": "procedural",
					"generator": "anisotropic-orientation",
					"frequency": 8
				},
				"range": [-.12, .12]
			}, {
				"id": "ridge-period",
				"kind": "period",
				"unit": "um",
				"domain": "surface",
				"source": {
					"type": "procedural",
					"generator": "fbm",
					"octaves": 2,
					"frequency": 12
				},
				"range": [.6, 1.1]
			}],
			"parameters": [
				{
					"id": "n-chitin",
					"kind": "ior-real",
					"unit": "dimensionless",
					"value": 1.56
				},
				{
					"id": "n-air-gap",
					"kind": "ior-real",
					"unit": "dimensionless",
					"value": 1
				},
				{
					"id": "lamella-thickness",
					"kind": "thickness",
					"unit": "nm",
					"value": 90
				},
				{
					"id": "gap-thickness",
					"kind": "thickness",
					"unit": "nm",
					"value": 70
				},
				{
					"id": "layer-count",
					"kind": "count",
					"unit": "dimensionless",
					"value": 10
				},
				{
					"id": "groove-depth",
					"kind": "length",
					"unit": "nm",
					"value": 220
				},
				{
					"id": "orders",
					"kind": "count",
					"unit": "dimensionless",
					"value": 3
				},
				{
					"id": "view-exp",
					"kind": "weight",
					"unit": "dimensionless",
					"value": 6
				},
				{
					"id": "view-lobe",
					"kind": "lobe",
					"unit": "enum",
					"enum": "specular"
				},
				{
					"id": "illuminant",
					"kind": "illuminant",
					"unit": "enum",
					"enum": "D65"
				},
				{
					"id": "observer",
					"kind": "observer",
					"unit": "enum",
					"enum": "CIE-1931-2deg"
				}
			],
			"nodes": [
				{
					"id": "stack",
					"operator": "multilayer-interference",
					"bind": {
						"layerCount": { "param": "layer-count" },
						"thicknessA": { "param": "lamella-thickness" },
						"thicknessB": { "param": "gap-thickness" },
						"nA": { "param": "n-chitin" },
						"nB": { "param": "n-air-gap" },
						"orientation": { "field": "scale-orientation" }
					}
				},
				{
					"id": "ridges",
					"operator": "diffraction-grating",
					"bind": {
						"period": { "field": "ridge-period" },
						"depth": { "param": "groove-depth" },
						"orientation": { "field": "scale-orientation" },
						"orders": { "param": "orders" }
					}
				},
				{
					"id": "view",
					"operator": "view-dependent-weight",
					"bind": {
						"exponent": { "param": "view-exp" },
						"lobe": { "param": "view-lobe" }
					}
				},
				{
					"id": "display",
					"operator": "spectral-integrate",
					"bind": {
						"illuminant": { "param": "illuminant" },
						"observer": { "param": "observer" }
					}
				}
			],
			"graph": {
				"output": "display",
				"edges": [
					{
						"from": "stack",
						"to": "view"
					},
					{
						"from": "ridges",
						"to": "view"
					},
					{
						"from": "view",
						"to": "display"
					}
				]
			},
			"evaluation": {
				"illuminant": "D65",
				"observer": "CIE-1931-2deg"
			}
		},
		{
			"id": "caustic-water",
			"version": "0.1.0",
			"title": "Caustic water",
			"taxonomyIds": [
				"refraction",
				"caustics",
				"dielectric-interface",
				"absorption"
			],
			"summary": "A dielectric water surface. Caustics are Snell refraction composed with caustic transport of a displacement field; red-preferring absorption tints the volume. No water shader type.",
			"phenomena": [
				"refraction",
				"caustics",
				"dielectric-fresnel",
				"spectral-absorption"
			],
			"fields": [{
				"id": "surface-displacement",
				"kind": "length",
				"unit": "mm",
				"domain": "surface",
				"source": {
					"type": "analytic",
					"generator": "surface-waves",
					"frequency": 1.1
				},
				"range": [-24, 24]
			}, {
				"id": "volume-density",
				"kind": "density",
				"unit": "kg/m3",
				"domain": "volume",
				"source": {
					"type": "constant",
					"generator": "constant",
					"value": 1e3
				},
				"range": [997, 1025]
			}],
			"parameters": [
				{
					"id": "n-air",
					"kind": "ior-real",
					"unit": "dimensionless",
					"value": 1.0003
				},
				{
					"id": "n-water",
					"kind": "ior-real",
					"unit": "dimensionless",
					"value": 1.333
				},
				{
					"id": "focus-scale",
					"kind": "weight",
					"unit": "dimensionless",
					"value": 1.4
				},
				{
					"id": "sigma-a",
					"kind": "extinction",
					"unit": "1/m",
					"spectral": {
						"wavelengthsNm": [
							450,
							550,
							650
						],
						"samples": [
							.02,
							.06,
							.35
						]
					},
					"notes": "Water absorbs red more than blue."
				},
				{
					"id": "illuminant",
					"kind": "illuminant",
					"unit": "enum",
					"enum": "D65"
				},
				{
					"id": "observer",
					"kind": "observer",
					"unit": "enum",
					"enum": "CIE-1931-2deg"
				}
			],
			"nodes": [
				{
					"id": "refract",
					"operator": "refraction-snell",
					"bind": {
						"iorInside": { "param": "n-water" },
						"iorOutside": { "param": "n-air" }
					}
				},
				{
					"id": "caustics",
					"operator": "caustic-transport",
					"bind": {
						"displacement": { "field": "surface-displacement" },
						"ior": { "param": "n-water" },
						"focusScale": { "param": "focus-scale" }
					}
				},
				{
					"id": "interface",
					"operator": "fresnel-dielectric",
					"bind": { "ior": { "param": "n-water" } }
				},
				{
					"id": "absorb",
					"operator": "volume-absorption",
					"bind": {
						"density": { "field": "volume-density" },
						"sigmaA": { "param": "sigma-a" }
					}
				},
				{
					"id": "display",
					"operator": "spectral-integrate",
					"bind": {
						"illuminant": { "param": "illuminant" },
						"observer": { "param": "observer" }
					}
				}
			],
			"graph": {
				"output": "display",
				"edges": [
					{
						"from": "refract",
						"to": "caustics"
					},
					{
						"from": "caustics",
						"to": "absorb"
					},
					{
						"from": "interface",
						"to": "display"
					},
					{
						"from": "absorb",
						"to": "display"
					}
				]
			},
			"evaluation": {
				"illuminant": "D65",
				"observer": "CIE-1931-2deg"
			}
		},
		{
			"id": "cloud",
			"version": "0.1.0",
			"title": "Cloud",
			"taxonomyIds": ["scattering", "absorption"],
			"summary": "Water-droplet Mie scattering in a density field. White appearance is high albedo plus forward-peaked phase, not a cloud shader. Shares volume-scattering with nebula and opalescent glass.",
			"phenomena": ["mie-scattering", "spectral-absorption"],
			"fields": [{
				"id": "droplet-density",
				"kind": "density",
				"unit": "kg/m3",
				"domain": "volume",
				"source": {
					"type": "procedural",
					"generator": "fbm",
					"octaves": 5,
					"frequency": 1.3
				},
				"range": [0, .8]
			}],
			"parameters": [
				{
					"id": "sigma-s",
					"kind": "scattering-coeff",
					"unit": "1/m",
					"value": 12
				},
				{
					"id": "sigma-a",
					"kind": "extinction",
					"unit": "1/m",
					"value": .04
				},
				{
					"id": "phase",
					"kind": "phase-function",
					"unit": "enum",
					"enum": "mie"
				},
				{
					"id": "g",
					"kind": "anisotropy",
					"unit": "dimensionless",
					"value": .85,
					"notes": "Large droplets are strongly forward-scattering."
				},
				{
					"id": "illuminant",
					"kind": "illuminant",
					"unit": "enum",
					"enum": "D65"
				},
				{
					"id": "observer",
					"kind": "observer",
					"unit": "enum",
					"enum": "CIE-1931-2deg"
				}
			],
			"nodes": [
				{
					"id": "scatter",
					"operator": "volume-scattering",
					"bind": {
						"density": { "field": "droplet-density" },
						"sigmaS": { "param": "sigma-s" },
						"phase": { "param": "phase" },
						"g": { "param": "g" }
					}
				},
				{
					"id": "absorb",
					"operator": "volume-absorption",
					"bind": {
						"density": { "field": "droplet-density" },
						"sigmaA": { "param": "sigma-a" }
					}
				},
				{
					"id": "display",
					"operator": "spectral-integrate",
					"bind": {
						"illuminant": { "param": "illuminant" },
						"observer": { "param": "observer" }
					}
				}
			],
			"graph": {
				"output": "display",
				"edges": [{
					"from": "scatter",
					"to": "display"
				}, {
					"from": "absorb",
					"to": "display"
				}]
			},
			"evaluation": {
				"illuminant": "D65",
				"observer": "CIE-1931-2deg"
			}
		},
		{
			"id": "holographic-foil",
			"version": "0.1.0",
			"title": "Holographic foil",
			"taxonomyIds": [
				"grating",
				"thin-film",
				"conductor-interface"
			],
			"summary": "Embossed PET over aluminum. Spectral orders come from the grating; a lacquer film adds Airy modulation; the metal is conductor Fresnel. No holographic boolean.",
			"phenomena": [
				"diffraction",
				"thin-film-interference",
				"conductor-fresnel"
			],
			"fields": [{
				"id": "groove-orientation",
				"kind": "angle",
				"unit": "rad",
				"domain": "surface",
				"source": {
					"type": "analytic",
					"generator": "anisotropic-orientation",
					"frequency": 1
				},
				"range": [0, 3.1416]
			}, {
				"id": "lacquer-thickness",
				"kind": "thickness",
				"unit": "nm",
				"domain": "surface",
				"source": {
					"type": "procedural",
					"generator": "fbm",
					"octaves": 2,
					"frequency": 5
				},
				"range": [180, 420]
			}],
			"parameters": [
				{
					"id": "n-air",
					"kind": "ior-real",
					"unit": "dimensionless",
					"value": 1.0003
				},
				{
					"id": "n-pet",
					"kind": "ior-real",
					"unit": "dimensionless",
					"value": 1.58
				},
				{
					"id": "n-lacquer",
					"kind": "ior-real",
					"unit": "dimensionless",
					"value": 1.5
				},
				{
					"id": "period",
					"kind": "period",
					"unit": "um",
					"value": .85,
					"range": [.5, 1.6]
				},
				{
					"id": "groove-depth",
					"kind": "length",
					"unit": "nm",
					"value": 140
				},
				{
					"id": "orders",
					"kind": "count",
					"unit": "dimensionless",
					"value": 4
				},
				{
					"id": "ior-aluminum",
					"kind": "ior-complex",
					"unit": "dimensionless",
					"complex": {
						"n": .9,
						"k": 6.5
					},
					"notes": "Visible-band aluminum, approximate."
				},
				{
					"id": "illuminant",
					"kind": "illuminant",
					"unit": "enum",
					"enum": "D65"
				},
				{
					"id": "observer",
					"kind": "observer",
					"unit": "enum",
					"enum": "CIE-1931-2deg"
				}
			],
			"nodes": [
				{
					"id": "grating",
					"operator": "diffraction-grating",
					"bind": {
						"period": { "param": "period" },
						"depth": { "param": "groove-depth" },
						"orientation": { "field": "groove-orientation" },
						"orders": { "param": "orders" }
					}
				},
				{
					"id": "lacquer",
					"operator": "thin-film-interference",
					"bind": {
						"thickness": { "field": "lacquer-thickness" },
						"nIncident": { "param": "n-air" },
						"nFilm": { "param": "n-lacquer" },
						"nExit": { "param": "n-pet" }
					}
				},
				{
					"id": "metal",
					"operator": "fresnel-conductor",
					"bind": { "ior": { "param": "ior-aluminum" } }
				},
				{
					"id": "display",
					"operator": "spectral-integrate",
					"bind": {
						"illuminant": { "param": "illuminant" },
						"observer": { "param": "observer" }
					}
				}
			],
			"graph": {
				"output": "display",
				"edges": [
					{
						"from": "grating",
						"to": "display"
					},
					{
						"from": "lacquer",
						"to": "display"
					},
					{
						"from": "metal",
						"to": "display"
					}
				]
			},
			"evaluation": {
				"illuminant": "D65",
				"observer": "CIE-1931-2deg"
			}
		},
		{
			"id": "labradorite",
			"version": "0.1.0",
			"title": "Labradorite",
			"taxonomyIds": [
				"multilayer",
				"microfacet",
				"view-weight"
			],
			"summary": "Exsolution lamellae in feldspar. Labradorescence is the same multilayer operator as nacre, with much lower IOR contrast, a tighter orientation field, and a microfacet envelope.",
			"phenomena": [
				"multilayer-interference",
				"lamellar-flash",
				"view-dependent-color"
			],
			"fields": [{
				"id": "lamellar-orientation",
				"kind": "angle",
				"unit": "rad",
				"domain": "surface",
				"source": {
					"type": "analytic",
					"generator": "anisotropic-orientation",
					"frequency": .4
				},
				"range": [-.08, .08],
				"notes": "Flash occurs only when the viewing vector aligns with the lamellar normal."
			}, {
				"id": "cleavage-roughness",
				"kind": "roughness",
				"unit": "dimensionless",
				"domain": "surface",
				"source": {
					"type": "procedural",
					"generator": "fbm",
					"octaves": 2,
					"frequency": 3
				},
				"range": [.04, .18]
			}],
			"parameters": [
				{
					"id": "n-lamella-a",
					"kind": "ior-real",
					"unit": "dimensionless",
					"value": 1.56
				},
				{
					"id": "n-lamella-b",
					"kind": "ior-real",
					"unit": "dimensionless",
					"value": 1.53,
					"notes": "Δn ≈ 0.03 — enough for coherent interference, not a pigment."
				},
				{
					"id": "thickness-a",
					"kind": "thickness",
					"unit": "nm",
					"value": 140
				},
				{
					"id": "thickness-b",
					"kind": "thickness",
					"unit": "nm",
					"value": 120
				},
				{
					"id": "layer-count",
					"kind": "count",
					"unit": "dimensionless",
					"value": 64
				},
				{
					"id": "anisotropy",
					"kind": "anisotropy",
					"unit": "dimensionless",
					"value": .72
				},
				{
					"id": "view-exp",
					"kind": "weight",
					"unit": "dimensionless",
					"value": 8.5
				},
				{
					"id": "view-lobe",
					"kind": "lobe",
					"unit": "enum",
					"enum": "specular"
				},
				{
					"id": "illuminant",
					"kind": "illuminant",
					"unit": "enum",
					"enum": "D65"
				},
				{
					"id": "observer",
					"kind": "observer",
					"unit": "enum",
					"enum": "CIE-1931-2deg"
				}
			],
			"nodes": [
				{
					"id": "stack",
					"operator": "multilayer-interference",
					"bind": {
						"layerCount": { "param": "layer-count" },
						"thicknessA": { "param": "thickness-a" },
						"thicknessB": { "param": "thickness-b" },
						"nA": { "param": "n-lamella-a" },
						"nB": { "param": "n-lamella-b" },
						"orientation": { "field": "lamellar-orientation" }
					}
				},
				{
					"id": "microfacet",
					"operator": "microfacet-scatter",
					"bind": {
						"roughness": { "field": "cleavage-roughness" },
						"anisotropy": { "param": "anisotropy" }
					}
				},
				{
					"id": "view",
					"operator": "view-dependent-weight",
					"bind": {
						"exponent": { "param": "view-exp" },
						"lobe": { "param": "view-lobe" }
					}
				},
				{
					"id": "display",
					"operator": "spectral-integrate",
					"bind": {
						"illuminant": { "param": "illuminant" },
						"observer": { "param": "observer" }
					}
				}
			],
			"graph": {
				"output": "display",
				"edges": [
					{
						"from": "stack",
						"to": "view"
					},
					{
						"from": "microfacet",
						"to": "view"
					},
					{
						"from": "view",
						"to": "display"
					}
				]
			},
			"evaluation": {
				"illuminant": "D65",
				"observer": "CIE-1931-2deg"
			}
		},
		{
			"id": "molten-chrome",
			"version": "0.1.0",
			"title": "Molten chrome",
			"taxonomyIds": [
				"conductor-interface",
				"microfacet",
				"emission",
				"view-weight"
			],
			"summary": "Liquid chromium: complex-IOR Fresnel, convection-driven roughness, and thermal emission. Heat is volume-emission with a blackbody temperature, not a moltenChrome flag.",
			"phenomena": [
				"conductor-fresnel",
				"thermal-emission",
				"view-dependent-color"
			],
			"fields": [{
				"id": "convection-roughness",
				"kind": "roughness",
				"unit": "dimensionless",
				"domain": "surface",
				"source": {
					"type": "procedural",
					"generator": "fbm",
					"octaves": 5,
					"frequency": 1.8
				},
				"range": [.02, .22]
			}, {
				"id": "flow-anisotropy",
				"kind": "anisotropy",
				"unit": "dimensionless",
				"domain": "surface",
				"source": {
					"type": "analytic",
					"generator": "anisotropic-orientation",
					"frequency": .6
				},
				"range": [.2, .7]
			}],
			"parameters": [
				{
					"id": "ior-chrome",
					"kind": "ior-complex",
					"unit": "dimensionless",
					"complex": {
						"n": 3.2,
						"k": 4.2
					}
				},
				{
					"id": "temperature",
					"kind": "temperature",
					"unit": "K",
					"value": 1900,
					"range": [1400, 2200]
				},
				{
					"id": "emit-density",
					"kind": "density",
					"unit": "kg/m3",
					"value": 1
				},
				{
					"id": "view-exp",
					"kind": "weight",
					"unit": "dimensionless",
					"value": 2
				},
				{
					"id": "view-lobe",
					"kind": "lobe",
					"unit": "enum",
					"enum": "fresnel"
				},
				{
					"id": "illuminant",
					"kind": "illuminant",
					"unit": "enum",
					"enum": "A"
				},
				{
					"id": "observer",
					"kind": "observer",
					"unit": "enum",
					"enum": "CIE-1931-2deg"
				}
			],
			"nodes": [
				{
					"id": "metal",
					"operator": "fresnel-conductor",
					"bind": { "ior": { "param": "ior-chrome" } }
				},
				{
					"id": "microfacet",
					"operator": "microfacet-scatter",
					"bind": {
						"roughness": { "field": "convection-roughness" },
						"anisotropy": { "field": "flow-anisotropy" }
					}
				},
				{
					"id": "heat",
					"operator": "volume-emission",
					"bind": {
						"density": { "param": "emit-density" },
						"temperature": { "param": "temperature" }
					}
				},
				{
					"id": "view",
					"operator": "view-dependent-weight",
					"bind": {
						"exponent": { "param": "view-exp" },
						"lobe": { "param": "view-lobe" }
					}
				},
				{
					"id": "display",
					"operator": "spectral-integrate",
					"bind": {
						"illuminant": { "param": "illuminant" },
						"observer": { "param": "observer" }
					}
				}
			],
			"graph": {
				"output": "display",
				"edges": [
					{
						"from": "metal",
						"to": "microfacet"
					},
					{
						"from": "microfacet",
						"to": "view"
					},
					{
						"from": "heat",
						"to": "display"
					},
					{
						"from": "view",
						"to": "display"
					}
				]
			},
			"evaluation": {
				"illuminant": "A",
				"observer": "CIE-1931-2deg"
			}
		},
		{
			"id": "nacre",
			"version": "0.1.0",
			"title": "Nacre",
			"taxonomyIds": [
				"multilayer",
				"dielectric-interface",
				"view-weight"
			],
			"summary": "Aragonite tablets separated by protein sheets. Pearl luster is multilayer Bragg interference plus a dielectric Fresnel envelope, not a pearlescent flag.",
			"phenomena": [
				"multilayer-interference",
				"view-dependent-color",
				"dielectric-fresnel"
			],
			"fields": [{
				"id": "tablet-orientation",
				"kind": "angle",
				"unit": "rad",
				"domain": "surface",
				"source": {
					"type": "procedural",
					"generator": "lamellar-tilt",
					"frequency": 1.6
				},
				"range": [-.18, .18]
			}, {
				"id": "tablet-thickness",
				"kind": "thickness",
				"unit": "nm",
				"domain": "surface",
				"source": {
					"type": "procedural",
					"generator": "fbm",
					"octaves": 3,
					"frequency": 6
				},
				"range": [300, 600]
			}],
			"parameters": [
				{
					"id": "n-aragonite",
					"kind": "ior-real",
					"unit": "dimensionless",
					"value": 1.65
				},
				{
					"id": "n-protein",
					"kind": "ior-real",
					"unit": "dimensionless",
					"value": 1.4
				},
				{
					"id": "protein-thickness",
					"kind": "thickness",
					"unit": "nm",
					"value": 20
				},
				{
					"id": "layer-count",
					"kind": "count",
					"unit": "dimensionless",
					"value": 180,
					"range": [40, 400]
				},
				{
					"id": "view-exp",
					"kind": "weight",
					"unit": "dimensionless",
					"value": 3.2
				},
				{
					"id": "view-lobe",
					"kind": "lobe",
					"unit": "enum",
					"enum": "grazing"
				},
				{
					"id": "illuminant",
					"kind": "illuminant",
					"unit": "enum",
					"enum": "D65"
				},
				{
					"id": "observer",
					"kind": "observer",
					"unit": "enum",
					"enum": "CIE-1931-2deg"
				}
			],
			"nodes": [
				{
					"id": "stack",
					"operator": "multilayer-interference",
					"bind": {
						"layerCount": { "param": "layer-count" },
						"thicknessA": { "field": "tablet-thickness" },
						"thicknessB": { "param": "protein-thickness" },
						"nA": { "param": "n-aragonite" },
						"nB": { "param": "n-protein" },
						"orientation": { "field": "tablet-orientation" }
					}
				},
				{
					"id": "interface",
					"operator": "fresnel-dielectric",
					"bind": { "ior": { "param": "n-aragonite" } }
				},
				{
					"id": "view",
					"operator": "view-dependent-weight",
					"bind": {
						"exponent": { "param": "view-exp" },
						"lobe": { "param": "view-lobe" }
					}
				},
				{
					"id": "display",
					"operator": "spectral-integrate",
					"bind": {
						"illuminant": { "param": "illuminant" },
						"observer": { "param": "observer" }
					}
				}
			],
			"graph": {
				"output": "display",
				"edges": [
					{
						"from": "stack",
						"to": "view"
					},
					{
						"from": "interface",
						"to": "view"
					},
					{
						"from": "view",
						"to": "display"
					}
				]
			},
			"evaluation": {
				"illuminant": "D65",
				"observer": "CIE-1931-2deg"
			}
		},
		{
			"id": "nebula",
			"version": "0.1.0",
			"title": "Nebula",
			"taxonomyIds": [
				"scattering",
				"emission",
				"absorption"
			],
			"summary": "Low-density participating medium with mixed phase, dust absorption, and spectral line emission. Same volume operators as cloud; emission and spectral peaks do the rest.",
			"phenomena": [
				"henyey-greenstein",
				"volume-emission",
				"spectral-absorption"
			],
			"fields": [{
				"id": "gas-density",
				"kind": "density",
				"unit": "kg/m3",
				"domain": "volume",
				"source": {
					"type": "procedural",
					"generator": "worley",
					"octaves": 4,
					"frequency": .9
				},
				"range": [0, .12]
			}, {
				"id": "line-emission",
				"kind": "spectral-power",
				"unit": "W/m3/sr/nm",
				"domain": "spectral",
				"source": {
					"type": "analytic",
					"generator": "spectral-peak",
					"peaksNm": [
						486.1,
						500.7,
						656.3
					],
					"bandwidthNm": 6
				},
				"range": [0, 4],
				"notes": "Hβ, [O III], Hα — line list is data, not a nebula operator."
			}],
			"parameters": [
				{
					"id": "sigma-s",
					"kind": "scattering-coeff",
					"unit": "1/m",
					"value": .35
				},
				{
					"id": "sigma-a",
					"kind": "extinction",
					"unit": "1/m",
					"value": .18
				},
				{
					"id": "phase",
					"kind": "phase-function",
					"unit": "enum",
					"enum": "hg"
				},
				{
					"id": "g",
					"kind": "anisotropy",
					"unit": "dimensionless",
					"value": .35
				},
				{
					"id": "illuminant",
					"kind": "illuminant",
					"unit": "enum",
					"enum": "E"
				},
				{
					"id": "observer",
					"kind": "observer",
					"unit": "enum",
					"enum": "CIE-1931-2deg"
				}
			],
			"nodes": [
				{
					"id": "scatter",
					"operator": "volume-scattering",
					"bind": {
						"density": { "field": "gas-density" },
						"sigmaS": { "param": "sigma-s" },
						"phase": { "param": "phase" },
						"g": { "param": "g" }
					}
				},
				{
					"id": "absorb",
					"operator": "volume-absorption",
					"bind": {
						"density": { "field": "gas-density" },
						"sigmaA": { "param": "sigma-a" }
					}
				},
				{
					"id": "emit",
					"operator": "volume-emission",
					"bind": {
						"density": { "field": "gas-density" },
						"radiance": { "field": "line-emission" }
					}
				},
				{
					"id": "display",
					"operator": "spectral-integrate",
					"bind": {
						"illuminant": { "param": "illuminant" },
						"observer": { "param": "observer" }
					}
				}
			],
			"graph": {
				"output": "display",
				"edges": [
					{
						"from": "scatter",
						"to": "display"
					},
					{
						"from": "absorb",
						"to": "display"
					},
					{
						"from": "emit",
						"to": "display"
					}
				]
			},
			"evaluation": {
				"illuminant": "E",
				"observer": "CIE-1931-2deg"
			}
		},
		{
			"id": "oil-slick",
			"version": "0.1.0",
			"title": "Oil slick",
			"taxonomyIds": [
				"thin-film",
				"dielectric-interface",
				"caustics",
				"view-weight"
			],
			"summary": "A spreading hydrocarbon film on water. Color is two-interface interference whose optical path varies with thickness; wave displacement under the film reuses caustic transport.",
			"phenomena": [
				"thin-film-interference",
				"view-dependent-color",
				"variable-thickness",
				"caustics",
				"dielectric-fresnel"
			],
			"fields": [{
				"id": "film-thickness",
				"kind": "thickness",
				"unit": "nm",
				"domain": "surface",
				"source": {
					"type": "procedural",
					"generator": "fbm",
					"octaves": 4,
					"frequency": 2.4
				},
				"range": [80, 900],
				"notes": "Spreading and wind set the local optical path. Typical crude-oil slicks sit in the 100–1000 nm band."
			}, {
				"id": "wave-displacement",
				"kind": "length",
				"unit": "mm",
				"domain": "surface",
				"source": {
					"type": "analytic",
					"generator": "surface-waves",
					"frequency": .7
				},
				"range": [-8, 8]
			}],
			"parameters": [
				{
					"id": "n-air",
					"kind": "ior-real",
					"unit": "dimensionless",
					"value": 1.0003
				},
				{
					"id": "n-oil",
					"kind": "ior-real",
					"unit": "dimensionless",
					"value": 1.47,
					"range": [1.4, 1.55],
					"notes": "Typical hydrocarbon film."
				},
				{
					"id": "n-water",
					"kind": "ior-real",
					"unit": "dimensionless",
					"value": 1.333
				},
				{
					"id": "view-exp",
					"kind": "weight",
					"unit": "dimensionless",
					"value": 1.8
				},
				{
					"id": "view-lobe",
					"kind": "lobe",
					"unit": "enum",
					"enum": "fresnel"
				},
				{
					"id": "caustic-focus",
					"kind": "weight",
					"unit": "dimensionless",
					"value": .55
				},
				{
					"id": "illuminant",
					"kind": "illuminant",
					"unit": "enum",
					"enum": "D65"
				},
				{
					"id": "observer",
					"kind": "observer",
					"unit": "enum",
					"enum": "CIE-1931-2deg"
				}
			],
			"nodes": [
				{
					"id": "film",
					"operator": "thin-film-interference",
					"bind": {
						"thickness": { "field": "film-thickness" },
						"nIncident": { "param": "n-air" },
						"nFilm": { "param": "n-oil" },
						"nExit": { "param": "n-water" }
					}
				},
				{
					"id": "interface",
					"operator": "fresnel-dielectric",
					"bind": { "ior": { "param": "n-oil" } }
				},
				{
					"id": "caustics",
					"operator": "caustic-transport",
					"bind": {
						"displacement": { "field": "wave-displacement" },
						"ior": { "param": "n-water" },
						"focusScale": { "param": "caustic-focus" }
					}
				},
				{
					"id": "view",
					"operator": "view-dependent-weight",
					"bind": {
						"exponent": { "param": "view-exp" },
						"lobe": { "param": "view-lobe" }
					}
				},
				{
					"id": "display",
					"operator": "spectral-integrate",
					"bind": {
						"illuminant": { "param": "illuminant" },
						"observer": { "param": "observer" }
					}
				}
			],
			"graph": {
				"output": "display",
				"edges": [
					{
						"from": "film",
						"to": "view"
					},
					{
						"from": "interface",
						"to": "view"
					},
					{
						"from": "caustics",
						"to": "display"
					},
					{
						"from": "view",
						"to": "display"
					}
				]
			},
			"evaluation": {
				"illuminant": "D65",
				"observer": "CIE-1931-2deg"
			}
		},
		{
			"id": "opalescent-glass",
			"version": "0.1.0",
			"title": "Opalescent glass",
			"taxonomyIds": [
				"scattering",
				"dielectric-interface",
				"absorption",
				"refraction"
			],
			"summary": "Nano-inclusions in a dielectric bulk. Opalescence is Rayleigh volume scattering plus Fresnel and Snell at the glass boundary. Blue scatter / warm transmit falls out of λ⁻⁴, not an opal flag.",
			"phenomena": [
				"rayleigh-scattering",
				"dielectric-fresnel",
				"refraction",
				"spectral-absorption"
			],
			"fields": [{
				"id": "inclusion-density",
				"kind": "density",
				"unit": "kg/m3",
				"domain": "volume",
				"source": {
					"type": "procedural",
					"generator": "fbm",
					"octaves": 3,
					"frequency": 4.2
				},
				"range": [.02, .35]
			}],
			"parameters": [
				{
					"id": "n-air",
					"kind": "ior-real",
					"unit": "dimensionless",
					"value": 1.0003
				},
				{
					"id": "n-glass",
					"kind": "ior-real",
					"unit": "dimensionless",
					"value": 1.52
				},
				{
					"id": "sigma-s",
					"kind": "scattering-coeff",
					"unit": "1/m",
					"spectral": {
						"wavelengthsNm": [
							450,
							550,
							650
						],
						"samples": [
							4.8,
							2.1,
							1.1
						]
					},
					"notes": "Approximate Rayleigh tilt. A full renderer should evaluate λ⁻⁴ per sample."
				},
				{
					"id": "sigma-a",
					"kind": "extinction",
					"unit": "1/m",
					"value": .12
				},
				{
					"id": "phase",
					"kind": "phase-function",
					"unit": "enum",
					"enum": "rayleigh"
				},
				{
					"id": "illuminant",
					"kind": "illuminant",
					"unit": "enum",
					"enum": "D65"
				},
				{
					"id": "observer",
					"kind": "observer",
					"unit": "enum",
					"enum": "CIE-1931-2deg"
				}
			],
			"nodes": [
				{
					"id": "scatter",
					"operator": "volume-scattering",
					"bind": {
						"density": { "field": "inclusion-density" },
						"sigmaS": { "param": "sigma-s" },
						"phase": { "param": "phase" }
					}
				},
				{
					"id": "absorb",
					"operator": "volume-absorption",
					"bind": {
						"density": { "field": "inclusion-density" },
						"sigmaA": { "param": "sigma-a" }
					}
				},
				{
					"id": "interface",
					"operator": "fresnel-dielectric",
					"bind": { "ior": { "param": "n-glass" } }
				},
				{
					"id": "refract",
					"operator": "refraction-snell",
					"bind": {
						"iorInside": { "param": "n-glass" },
						"iorOutside": { "param": "n-air" }
					}
				},
				{
					"id": "display",
					"operator": "spectral-integrate",
					"bind": {
						"illuminant": { "param": "illuminant" },
						"observer": { "param": "observer" }
					}
				}
			],
			"graph": {
				"output": "display",
				"edges": [
					{
						"from": "interface",
						"to": "refract"
					},
					{
						"from": "refract",
						"to": "scatter"
					},
					{
						"from": "scatter",
						"to": "absorb"
					},
					{
						"from": "absorb",
						"to": "display"
					}
				]
			},
			"evaluation": {
				"illuminant": "D65",
				"observer": "CIE-1931-2deg"
			}
		},
		{
			"id": "soap-film",
			"version": "0.1.0",
			"title": "Soap film",
			"taxonomyIds": [
				"thin-film",
				"dielectric-interface",
				"view-weight"
			],
			"summary": "A surfactant film in air. Same two-interface operator as oil slick; the stack is air/film/air, thickness drains toward a black film, and there is no metal and no pigment.",
			"phenomena": [
				"thin-film-interference",
				"view-dependent-color",
				"variable-thickness",
				"dielectric-fresnel"
			],
			"fields": [{
				"id": "film-thickness",
				"kind": "thickness",
				"unit": "nm",
				"domain": "surface",
				"source": {
					"type": "analytic",
					"generator": "drainage",
					"frequency": .15
				},
				"range": [8, 1200],
				"notes": "Gravity and evaporation thin the film. Below ~10 nm the film goes black (destructive interference of all visible λ)."
			}],
			"parameters": [
				{
					"id": "n-air",
					"kind": "ior-real",
					"unit": "dimensionless",
					"value": 1.0003
				},
				{
					"id": "n-film",
					"kind": "ior-real",
					"unit": "dimensionless",
					"value": 1.35,
					"range": [1.33, 1.42],
					"notes": "Water plus surfactant. Lower than hydrocarbon oil."
				},
				{
					"id": "view-exp",
					"kind": "weight",
					"unit": "dimensionless",
					"value": 2.4
				},
				{
					"id": "view-lobe",
					"kind": "lobe",
					"unit": "enum",
					"enum": "grazing"
				},
				{
					"id": "illuminant",
					"kind": "illuminant",
					"unit": "enum",
					"enum": "D65"
				},
				{
					"id": "observer",
					"kind": "observer",
					"unit": "enum",
					"enum": "CIE-1931-2deg"
				}
			],
			"nodes": [
				{
					"id": "film",
					"operator": "thin-film-interference",
					"bind": {
						"thickness": { "field": "film-thickness" },
						"nIncident": { "param": "n-air" },
						"nFilm": { "param": "n-film" },
						"nExit": { "param": "n-air" }
					}
				},
				{
					"id": "interface",
					"operator": "fresnel-dielectric",
					"bind": { "ior": { "param": "n-film" } }
				},
				{
					"id": "view",
					"operator": "view-dependent-weight",
					"bind": {
						"exponent": { "param": "view-exp" },
						"lobe": { "param": "view-lobe" }
					}
				},
				{
					"id": "display",
					"operator": "spectral-integrate",
					"bind": {
						"illuminant": { "param": "illuminant" },
						"observer": { "param": "observer" }
					}
				}
			],
			"graph": {
				"output": "display",
				"edges": [
					{
						"from": "film",
						"to": "view"
					},
					{
						"from": "interface",
						"to": "view"
					},
					{
						"from": "view",
						"to": "display"
					}
				]
			},
			"evaluation": {
				"illuminant": "D65",
				"observer": "CIE-1931-2deg"
			},
			"notes": "Oil slick and soap film share thin-film-interference. They differ by n-exit (water vs air), n-film, thickness generator, and view lobe."
		}
	],
	taxonomy: {
		"version": "0.1.0",
		"id": "shader-grammar-material-taxonomy",
		"principle": "Materials are classified by optical mechanism, not by trade name, pigment, or marketing effect. Words like iridescent, pearlescent, holographic, and opalescent are appearance aliases that map onto mechanisms. A specimen is valid only if every tag here resolves to a catalog operator.\n",
		"families": [
			{
				"id": "interference",
				"title": "Interference",
				"description": "Color from optical-path phase in a film or stack. Thickness and IOR contrast are the degrees of freedom, not a hue slider.\n",
				"members": [{
					"id": "thin-film",
					"operators": ["thin-film-interference"]
				}, {
					"id": "multilayer",
					"operators": ["multilayer-interference"]
				}]
			},
			{
				"id": "diffraction",
				"title": "Diffraction",
				"description": "Color from periodic microstructure. Period, groove depth, and viewing angle set the orders — not a rainbow texture.\n",
				"members": [{
					"id": "grating",
					"operators": ["diffraction-grating"]
				}]
			},
			{
				"id": "interface",
				"title": "Interface",
				"description": "Energy split at a boundary. Dielectrics use real IOR; conductors use complex IOR. Roughness is a separate geometric operator.\n",
				"members": [
					{
						"id": "dielectric-interface",
						"operators": ["fresnel-dielectric"]
					},
					{
						"id": "conductor-interface",
						"operators": ["fresnel-conductor"]
					},
					{
						"id": "microfacet",
						"operators": ["microfacet-scatter"]
					}
				]
			},
			{
				"id": "geometric-transport",
				"title": "Geometric transport",
				"description": "Rays bent by a dielectric interface, then focused by a displacement field. Caustics are a consequence of refraction plus geometry.\n",
				"members": [{
					"id": "refraction",
					"operators": ["refraction-snell"]
				}, {
					"id": "caustics",
					"operators": ["caustic-transport"]
				}]
			},
			{
				"id": "volume",
				"title": "Volume transport",
				"description": "In-scattering, absorption, and emission in a participating medium. Phase function and density field do the work; cloud and nebula are not separate shader types.\n",
				"members": [
					{
						"id": "scattering",
						"operators": ["volume-scattering"]
					},
					{
						"id": "absorption",
						"operators": ["volume-absorption"]
					},
					{
						"id": "emission",
						"operators": ["volume-emission"]
					}
				]
			},
			{
				"id": "evaluation",
				"title": "Evaluation",
				"description": "View weighting and spectral-to-display conversion. Shared by every recipe that produces color.\n",
				"members": [{
					"id": "view-weight",
					"operators": ["view-dependent-weight"]
				}, {
					"id": "display",
					"operators": ["spectral-integrate"]
				}]
			}
		],
		"aliases": {
			"iridescent": [
				"thin-film",
				"multilayer",
				"grating"
			],
			"pearlescent": ["multilayer"],
			"labradorescence": ["multilayer"],
			"holographic": ["grating", "thin-film"],
			"opalescence": ["scattering"],
			"metallic": ["conductor-interface", "microfacet"],
			"molten": [
				"conductor-interface",
				"emission",
				"microfacet"
			],
			"watery": [
				"refraction",
				"caustics",
				"dielectric-interface"
			],
			"nebular": [
				"scattering",
				"absorption",
				"emission"
			],
			"cloudy": ["scattering", "absorption"]
		},
		"specimens": {
			"oil-slick": {
				"primary": ["thin-film"],
				"secondary": [
					"dielectric-interface",
					"caustics",
					"view-weight"
				]
			},
			"soap-film": {
				"primary": ["thin-film"],
				"secondary": ["dielectric-interface", "view-weight"]
			},
			"nacre": {
				"primary": ["multilayer"],
				"secondary": ["dielectric-interface", "view-weight"]
			},
			"labradorite": {
				"primary": ["multilayer"],
				"secondary": ["microfacet", "view-weight"]
			},
			"butterfly-structural-color": {
				"primary": ["multilayer", "grating"],
				"secondary": ["view-weight"]
			},
			"holographic-foil": {
				"primary": ["grating", "thin-film"],
				"secondary": ["conductor-interface"]
			},
			"bismuth-oxide": {
				"primary": ["thin-film", "conductor-interface"],
				"secondary": ["microfacet"]
			},
			"molten-chrome": {
				"primary": ["conductor-interface", "microfacet"],
				"secondary": ["emission", "view-weight"]
			},
			"caustic-water": {
				"primary": ["refraction", "caustics"],
				"secondary": ["dielectric-interface", "absorption"]
			},
			"cloud": {
				"primary": ["scattering"],
				"secondary": ["absorption"]
			},
			"nebula": {
				"primary": ["scattering", "emission"],
				"secondary": ["absorption"]
			},
			"opalescent-glass": {
				"primary": ["scattering"],
				"secondary": [
					"dielectric-interface",
					"absorption",
					"refraction"
				]
			}
		}
	},
	coverage: {
		"thin-film-interference": [
			"bismuth-oxide",
			"holographic-foil",
			"oil-slick",
			"soap-film"
		],
		"multilayer-interference": [
			"butterfly-structural-color",
			"labradorite",
			"nacre"
		],
		"diffraction-grating": ["butterfly-structural-color", "holographic-foil"],
		"fresnel-dielectric": [
			"caustic-water",
			"nacre",
			"oil-slick",
			"opalescent-glass",
			"soap-film"
		],
		"fresnel-conductor": [
			"bismuth-oxide",
			"holographic-foil",
			"molten-chrome"
		],
		"microfacet-scatter": [
			"bismuth-oxide",
			"labradorite",
			"molten-chrome"
		],
		"refraction-snell": ["caustic-water", "opalescent-glass"],
		"caustic-transport": ["caustic-water", "oil-slick"],
		"volume-scattering": [
			"cloud",
			"nebula",
			"opalescent-glass"
		],
		"volume-absorption": [
			"caustic-water",
			"cloud",
			"nebula",
			"opalescent-glass"
		],
		"volume-emission": ["molten-chrome", "nebula"],
		"view-dependent-weight": [
			"butterfly-structural-color",
			"labradorite",
			"molten-chrome",
			"nacre",
			"oil-slick",
			"soap-film"
		],
		"spectral-integrate": [
			"bismuth-oxide",
			"butterfly-structural-color",
			"caustic-water",
			"cloud",
			"holographic-foil",
			"labradorite",
			"molten-chrome",
			"nacre",
			"nebula",
			"oil-slick",
			"opalescent-glass",
			"soap-film"
		]
	},
	report: {
		"passed": true,
		"generatedAt": "2026-09-01T05:00:47.450Z",
		"reuse": {
			"thin-film-interference": 4,
			"multilayer-interference": 3,
			"diffraction-grating": 2,
			"fresnel-dielectric": 5,
			"fresnel-conductor": 3,
			"microfacet-scatter": 3,
			"refraction-snell": 2,
			"caustic-transport": 2,
			"volume-scattering": 3,
			"volume-absorption": 4,
			"volume-emission": 2,
			"view-dependent-weight": 6,
			"spectral-integrate": 12
		},
		"criteria": {
			"schemaValid": true,
			"noNamedEffectFlags": true,
			"allSpecimensPresent": true,
			"everyOperatorReused": true,
			"negativeControlRejected": true,
			"positiveControlAccepted": true
		},
		"findings": [
			{
				"level": "info",
				"code": "positive-control",
				"message": "examples/valid/minimal-thin-film.json passed."
			},
			{
				"level": "info",
				"code": "negative-control",
				"message": "examples/invalid/named-effect.json was rejected as required."
			},
			{
				"level": "info",
				"code": "reuse",
				"message": "Every catalog operator is used by at least two specimens."
			}
		]
	}
};
var SPECIMEN_ORDER = [
	"oil-slick",
	"soap-film",
	"nacre",
	"labradorite",
	"butterfly-structural-color",
	"holographic-foil",
	"bismuth-oxide",
	"molten-chrome",
	"caustic-water",
	"cloud",
	"nebula",
	"opalescent-glass"
];
function recipeById(id) {
	return bundle.recipes.find((r) => r.id === id) ?? bundle.recipes[0];
}
var STORAGE_KEY = "nacre-atelier-v2";
function loadStoredSpecimen() {
	try {
		const raw = localStorage.getItem("nacre-atelier-v2") ?? localStorage.getItem("nacre-atelier-v1");
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (parsed.specimenId && SPECIMEN_ORDER.includes(parsed.specimenId)) return parsed.specimenId;
	} catch {}
	return null;
}
function persist(id) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify({ specimenId: id }));
	} catch {}
}
var useGrammar = create((set, get) => ({
	specimenId: "nacre",
	fuseId: "soap-film",
	mode: "look",
	look: {
		x: .18,
		y: .28
	},
	knobs: defaultKnobs("nacre"),
	blend: .5,
	focusOperator: null,
	setSpecimen: (id) => {
		persist(id);
		set({
			specimenId: id,
			fuseId: get().fuseId === id ? id === "soap-film" ? "oil-slick" : "soap-film" : get().fuseId,
			focusOperator: null,
			look: {
				x: .18,
				y: .28
			},
			knobs: defaultKnobs(id)
		});
	},
	setFuseId: (id) => set({ fuseId: id }),
	setMode: (mode) => set({ mode }),
	setLook: (x, y) => set({ look: {
		x,
		y
	} }),
	setKnob: (id, value) => set({ knobs: {
		...get().knobs,
		[id]: value
	} }),
	setBlend: (blend) => set({ blend }),
	setFocusOperator: (focusOperator) => set({ focusOperator }),
	resetKnobs: () => set({
		knobs: defaultKnobs(get().specimenId),
		look: {
			x: .18,
			y: .28
		},
		blend: .5
	}),
	cycleSpecimen: (dir) => {
		const next = SPECIMEN_ORDER[(SPECIMEN_ORDER.indexOf(get().specimenId) + dir + SPECIMEN_ORDER.length) % SPECIMEN_ORDER.length];
		get().setSpecimen(next);
	}
}));
function paramOf(recipe, id) {
	return recipe.parameters.find((p) => p.id === id);
}
function fieldOf(recipe, id) {
	return recipe.fields.find((f) => f.id === id);
}
function scalar(recipe, bind, fallback = 0) {
	if (!bind) return fallback;
	if (bind.param) {
		const p = paramOf(recipe, bind.param);
		if (!p) return fallback;
		if (typeof p.value === "number") return p.value;
		if (p.complex) return p.complex.n;
		if (p.spectral?.samples.length) return p.spectral.samples.reduce((a, b) => a + b, 0) / p.spectral.samples.length;
		if (p.enum === "mie") return 2;
		if (p.enum === "rayleigh") return 1;
		if (p.enum === "hg") return 0;
		if (p.enum === "grazing") return 1;
		if (p.enum === "retro") return 2;
		if (p.enum === "specular") return 3;
		if (p.enum === "fresnel") return 0;
		return fallback;
	}
	if (bind.field) {
		const f = fieldOf(recipe, bind.field);
		if (!f) return fallback;
		if (typeof f.source.value === "number") return f.source.value;
		if (f.range) return (f.range[0] + f.range[1]) / 2;
	}
	return fallback;
}
function complexK(recipe, bind) {
	if (!bind?.param) return 0;
	return paramOf(recipe, bind.param)?.complex?.k ?? 0;
}
var GENERATORS = [
	"constant",
	"fbm",
	"worley",
	"gradient",
	"drainage",
	"lamellar-tilt",
	"surface-waves",
	"anisotropic-orientation",
	"spectral-peak",
	"radial"
];
function generatorIndex(name) {
	if (!name) return 0;
	const i = GENERATORS.indexOf(name);
	return i < 0 ? 1 : i;
}
function sharedWith(coverage, operatorId, selfId) {
	return (coverage[operatorId] ?? []).filter((id) => id !== selfId);
}
var UNIFORM_KEYS = [
	"uThinFilm",
	"uThick0",
	"uThick1",
	"uN0",
	"uN1",
	"uN2",
	"uFilmGen",
	"uFilmFreq",
	"uMulti",
	"uLayers",
	"uTa",
	"uTb",
	"uNA",
	"uNB",
	"uOriGen",
	"uGrating",
	"uPeriod",
	"uGroove",
	"uOrders",
	"uFDiel",
	"uIorD",
	"uFCond",
	"uN",
	"uK",
	"uMicro",
	"uRough",
	"uAniso",
	"uRefr",
	"uEta",
	"uCaustic",
	"uCScale",
	"uCGen",
	"uCMix",
	"uScatter",
	"uDensity",
	"uG",
	"uPhase",
	"uSigmaS",
	"uSigmaA",
	"uAbsorb",
	"uDensGen",
	"uEmit",
	"uTemp",
	"uEmitAmt",
	"uViewExp",
	"uViewLobe",
	"uStage"
];
function node(recipe, op) {
	return recipe.nodes.find((n) => n.operator === op);
}
/**
* Stage is derived from bound operators, never from specimen id.
* 1 sphere · 2 volume · 3 water plane · 4 membrane · 5 film-on-water
*/
function stageFromRecipe(recipe) {
	const ops = new Set(recipe.nodes.map((n) => n.operator));
	const vol = ops.has("volume-scattering");
	const film = ops.has("thin-film-interference");
	const multi = ops.has("multilayer-interference");
	const cau = ops.has("caustic-transport");
	const refr = ops.has("refraction-snell");
	const cond = ops.has("fresnel-conductor");
	const grat = ops.has("diffraction-grating");
	const fd = ops.has("fresnel-dielectric");
	if (vol && (fd || refr) && !film && !multi && !grat && !cond) return 1;
	if (vol && !film && !multi && !grat && !cond && !fd) return 2;
	if (cau && refr && !film) return 3;
	if (film && cau) return 5;
	if (film && !cond && !grat && !multi) return 4;
	return 1;
}
function uniformsFromRecipe(recipe) {
	const film = node(recipe, "thin-film-interference");
	const multi = node(recipe, "multilayer-interference");
	const grating = node(recipe, "diffraction-grating");
	const fd = node(recipe, "fresnel-dielectric");
	const fc = node(recipe, "fresnel-conductor");
	const mf = node(recipe, "microfacet-scatter");
	const refr = node(recipe, "refraction-snell");
	const cau = node(recipe, "caustic-transport");
	const sc = node(recipe, "volume-scattering");
	const ab = node(recipe, "volume-absorption");
	const em = node(recipe, "volume-emission");
	const vw = node(recipe, "view-dependent-weight");
	const filmField = film?.bind.thickness?.field ? recipe.fields.find((f) => f.id === film.bind.thickness.field) : recipe.fields[0];
	const oriField = multi?.bind.orientation?.field ? recipe.fields.find((f) => f.id === multi.bind.orientation.field) : void 0;
	const roughField = mf?.bind.roughness?.field ? recipe.fields.find((f) => f.id === mf.bind.roughness.field) : void 0;
	const cField = cau?.bind.displacement?.field ? recipe.fields.find((f) => f.id === cau.bind.displacement.field) : void 0;
	const dBind = sc?.bind.density ?? ab?.bind.density;
	const dField = dBind?.field ? recipe.fields.find((f) => f.id === dBind.field) : void 0;
	const oilLike = Boolean(film && cau);
	return {
		uThinFilm: film ? 1 : 0,
		uThick0: filmField?.range?.[0] ?? 80,
		uThick1: filmField?.range?.[1] ?? 400,
		uN0: film ? scalar(recipe, film.bind.nIncident, 1) : 1,
		uN1: film ? scalar(recipe, film.bind.nFilm, 1.4) : 1.4,
		uN2: film ? scalar(recipe, film.bind.nExit, 1) : 1,
		uFilmGen: generatorIndex(filmField?.source.generator),
		uFilmFreq: filmField?.source.frequency ?? 1,
		uMulti: multi ? 1 : 0,
		uLayers: multi ? scalar(recipe, multi.bind.layerCount, 10) : 0,
		uTa: multi ? scalar(recipe, multi.bind.thicknessA, 90) : 90,
		uTb: multi ? scalar(recipe, multi.bind.thicknessB, 70) : 70,
		uNA: multi ? scalar(recipe, multi.bind.nA, 1.5) : 1.5,
		uNB: multi ? scalar(recipe, multi.bind.nB, 1) : 1,
		uOriGen: generatorIndex(oriField?.source.generator ?? "lamellar-tilt"),
		uGrating: grating ? 1 : 0,
		uPeriod: grating ? scalar(recipe, grating.bind.period, .8) : .8,
		uGroove: grating ? scalar(recipe, grating.bind.depth, 140) : 140,
		uOrders: grating ? scalar(recipe, grating.bind.orders, 3) : 3,
		uFDiel: fd ? 1 : 0,
		uIorD: fd ? scalar(recipe, fd.bind.ior, 1.5) : 1.5,
		uFCond: fc ? 1 : 0,
		uN: fc ? scalar(recipe, fc.bind.ior, 2) : 2,
		uK: fc ? complexK(recipe, fc.bind.ior) : 0,
		uMicro: mf ? 1 : 0,
		uRough: mf ? roughField?.range ? (roughField.range[0] + roughField.range[1]) / 2 : scalar(recipe, mf.bind.roughness, .2) : .2,
		uAniso: mf ? scalar(recipe, mf.bind.anisotropy, 0) : 0,
		uRefr: refr ? 1 : 0,
		uEta: refr ? scalar(recipe, refr.bind.iorInside, 1.33) : 1.33,
		uCaustic: cau ? 1 : 0,
		uCScale: cau ? scalar(recipe, cau.bind.focusScale, 1) : 1,
		uCGen: generatorIndex(cField?.source.generator ?? "surface-waves"),
		uCMix: oilLike ? .16 : 1,
		uScatter: sc ? 1 : 0,
		uDensity: sc ? .7 : ab ? .5 : .4,
		uG: sc ? scalar(recipe, sc.bind.g, .4) : .4,
		uPhase: sc ? scalar(recipe, sc.bind.phase, 0) : 0,
		uSigmaS: sc ? scalar(recipe, sc.bind.sigmaS, 1) : 1,
		uSigmaA: ab ? scalar(recipe, ab.bind.sigmaA, .1) : 0,
		uAbsorb: ab ? 1 : 0,
		uDensGen: generatorIndex(dField?.source.generator ?? "fbm"),
		uEmit: em ? 1 : 0,
		uTemp: em ? scalar(recipe, em.bind.temperature, 0) : 0,
		uEmitAmt: em ? 1 : 0,
		uViewExp: vw ? scalar(recipe, vw.bind.exponent, 2) : 0,
		uViewLobe: vw ? scalar(recipe, vw.bind.lobe, 0) : 0,
		uStage: stageFromRecipe(recipe)
	};
}
function mixUniforms(a, b, t) {
	const out = { ...a };
	for (const key of UNIFORM_KEYS) {
		const av = a[key];
		const bv = b[key];
		if (key === "uFilmGen" || key === "uOriGen" || key === "uCGen" || key === "uDensGen") {
			out[key] = t < .5 ? av : bv;
			continue;
		}
		if (key === "uStage") {
			out[key] = t < .5 ? av : bv;
			continue;
		}
		out[key] = av * (1 - t) + bv * t;
	}
	return out;
}
var TABS = [
	{
		id: "contract",
		label: "Contract"
	},
	{
		id: "wgsl",
		label: "WGSL"
	},
	{
		id: "hlsl",
		label: "HLSL"
	},
	{
		id: "unity",
		label: "Unity"
	},
	{
		id: "glsl",
		label: "GLSL"
	}
];
function BackendsPanel() {
	const specimenId = useGrammar((s) => s.specimenId);
	const knobs = useGrammar((s) => s.knobs);
	const [tab, setTab] = (0, import_react.useState)("contract");
	const [caps, setCaps] = (0, import_react.useState)(null);
	const [copied, setCopied] = (0, import_react.useState)(false);
	const files = (0, import_react.useMemo)(() => {
		const rec = recipeById(specimenId);
		const u = applyPhysicalKnobs(uniformsFromRecipe(rec), specimenId, knobs).uniforms;
		return emitBackends(rec, u);
	}, [specimenId, knobs]);
	const file = files.find((f) => f.id === tab) ?? files[0];
	(0, import_react.useEffect)(() => {
		probeRenderers().then(setCaps);
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-mono text-2xs tracking-caps text-signal uppercase",
			children: "Backends"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm leading-normal text-muted text-pretty",
			children: "The grammar is the IR. Lookdev runs GLSL on WebGL2. WebGPU takes WGSL. Unity URP takes HLSL. three.js / r3f consume the same uniform block on a closed graph — camera, fog, vertex table, particles. Nothing here is a named nacre shader, and optical stays a simulation."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CapsStrip, { caps }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
			className: "mt-3 flex flex-wrap gap-1",
			"aria-label": "Backend files",
			children: TABS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setTab(t.id),
				className: cn("h-11 min-w-11 rounded-md px-3 text-sm transition-colors duration-150", tab === t.id ? "bg-fg text-bg" : "bg-elevated text-fg hover:bg-elevated/80"),
				children: t.label
			}, t.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BackendCard, {
			file,
			copied,
			onCopy: () => void copy(),
			onDownload: () => downloadBackend(file)
		})
	] });
}
function CapsStrip({ caps }) {
	if (!caps) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-3 font-mono text-2xs text-subtle",
		children: "Probing this browser…"
	});
	const bits = [
		["WebGL2", caps.webgl2],
		["WebGPU", caps.webgpu],
		["three.js", caps.three],
		["r3f", caps.r3f]
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
		className: "mt-3 flex flex-wrap gap-2",
		children: [bits.map(([label, on]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: cn("rounded-sm px-2 py-1 font-mono text-2xs tracking-caps uppercase", on ? "bg-pass/15 text-pass" : "bg-elevated text-subtle"),
			children: [
				label,
				" ",
				on ? "yes" : "no"
			]
		}, label)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
			className: "rounded-sm px-2 py-1 font-mono text-2xs text-muted",
			children: caps.adapter
		})]
	});
}
function BackendCard({ file, copied, onCopy, onDownload }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-3 rounded-md border border-border bg-surface p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-start justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-2xs tracking-caps text-subtle uppercase",
						children: file.runtime
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 font-mono text-xs text-fg",
						children: file.filename
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs leading-normal text-muted",
						children: file.note
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "outline",
					onClick: onCopy,
					children: copied ? "Copied" : "Copy"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "solid",
					onClick: onDownload,
					children: "Download"
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
			className: "mt-3 max-h-64 overflow-auto rounded-sm bg-void p-3 font-mono text-2xs leading-relaxed text-fg",
			children: file.body
		})]
	});
}
function compile(gl, type, src) {
	const sh = gl.createShader(type);
	if (!sh) return null;
	gl.shaderSource(sh, src);
	gl.compileShader(sh);
	if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
		const log = gl.getShaderInfoLog(sh) ?? "compile failed";
		console.error(log);
		gl.deleteShader(sh);
		return null;
	}
	return sh;
}
function loc(gl, prog, name) {
	return gl.getUniformLocation(prog, name);
}
function bindUniforms(gl, prog, u, look, time, res, timeScale, warp) {
	const set1 = (name, v) => {
		const l = loc(gl, prog, name);
		if (l) gl.uniform1f(l, v);
	};
	const set2 = (name, a, b) => {
		const l = loc(gl, prog, name);
		if (l) gl.uniform2f(l, a, b);
	};
	set2("uRes", res[0], res[1]);
	set1("uTime", time);
	set2("uLook", look.x, look.y);
	set1("uTimeScale", timeScale);
	set1("uWarp", warp);
	set1("uThickMul", 1);
	set1("uDensMul", 1);
	set1("uRoughMul", 1);
	for (const key of UNIFORM_KEYS) set1(key, u[key]);
}
function PreviewCanvas({ className }) {
	const canvasRef = (0, import_react.useRef)(null);
	const specimenId = useGrammar((s) => s.specimenId);
	const fuseId = useGrammar((s) => s.fuseId);
	const mode = useGrammar((s) => s.mode);
	const setLook = useGrammar((s) => s.setLook);
	const recipe = recipeById(specimenId);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const gl = canvas.getContext("webgl2", {
			antialias: false,
			alpha: false,
			powerPreference: "high-performance"
		});
		if (!gl) return;
		const vs = compile(gl, gl.VERTEX_SHADER, VERT);
		const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
		if (!vs || !fs) return;
		const prog = gl.createProgram();
		if (!prog) return;
		gl.attachShader(prog, vs);
		gl.attachShader(prog, fs);
		gl.linkProgram(prog);
		if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
			console.error(gl.getProgramInfoLog(prog));
			return;
		}
		const vao = gl.createVertexArray();
		gl.bindVertexArray(vao);
		const buf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buf);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			-1,
			-1,
			3,
			-1,
			-1,
			3
		]), gl.STATIC_DRAW);
		gl.enableVertexAttribArray(0);
		gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
		gl.useProgram(prog);
		let raf = 0;
		const start = performance.now();
		const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const draw = () => {
			const state = useGrammar.getState();
			const rec = recipeById(state.specimenId);
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
			const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
			if (canvas.width !== w || canvas.height !== h) {
				canvas.width = w;
				canvas.height = h;
			}
			gl.viewport(0, 0, w, h);
			gl.bindVertexArray(vao);
			gl.useProgram(prog);
			gl.clearColor(.02, .022, .028, 1);
			gl.clear(gl.COLOR_BUFFER_BIT);
			try {
				const a = applyPhysicalKnobs(uniformsFromRecipe(rec), state.specimenId, state.knobs);
				const u = state.mode === "fuse" ? mixUniforms(a.uniforms, uniformsFromRecipe(recipeById(state.fuseId)), state.blend) : a.uniforms;
				const timeScale = reduceMotion ? 0 : a.timeScale;
				bindUniforms(gl, prog, u, state.look, (performance.now() - start) / 1e3, [w, h], timeScale, a.warp);
				gl.drawArrays(gl.TRIANGLES, 0, 3);
			} catch (err) {
				console.error(err);
			}
			raf = requestAnimationFrame(draw);
		};
		raf = requestAnimationFrame(draw);
		return () => {
			cancelAnimationFrame(raf);
			gl.deleteProgram(prog);
			gl.deleteShader(vs);
			gl.deleteShader(fs);
			gl.deleteBuffer(buf);
			gl.deleteVertexArray(vao);
		};
	}, [FRAG]);
	const onPointer = (e) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const x = (e.clientX - rect.left) / rect.width * 2 - 1;
		const y = (e.clientY - rect.top) / rect.height * 2 - 1;
		setLook(Math.max(-1, Math.min(1, x)), Math.max(-1, Math.min(1, -y)));
	};
	const label = mode === "fuse" ? `Fusion of ${recipe.title} and ${recipeById(fuseId).title}` : `${recipe.title} evaluative sketch`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref: canvasRef,
		className: cn("preview-canvas h-full w-full touch-none", className),
		onPointerMove: onPointer,
		onPointerDown: onPointer,
		"aria-label": label
	});
}
var FINGERPRINTS = {
	"oil-slick": {
		thesis: "A hydrocarbon film on water. Color is optical path, not pigment.",
		composition: "Plan view of a spreading film over a disturbed dielectric.",
		form: "Organic, fluid, no hard edge.",
		material: "Hydrocarbon film, air above, water below.",
		optics: "Two-interface interference, dielectric Fresnel, caustic transport.",
		color: "Spectral bands that cycle with thickness. No hue slider.",
		surface: "Viscous, wind-streaked. Optical path 80–900 nm.",
		invariants: [
			"Airy two-interface",
			"view-dependent color",
			"caustics under film"
		],
		flexible: ["thickness range", "wind frequency"]
	},
	"soap-film": {
		thesis: "The same two-interface operator as oil, with air on both sides.",
		composition: "A hanging membrane. Drainage toward a black film at the top.",
		form: "Thin, tensile, slightly curved.",
		material: "Surfactant film in air.",
		optics: "Thin-film interference plus dielectric Fresnel. No caustics.",
		color: "Newton orders collapsing as thickness drains toward zero.",
		surface: "Drainage field. Black film where path is a few nanometers.",
		invariants: ["air / film / air stack", "drainage toward black"],
		flexible: ["drainage rate", "starting thickness"]
	},
	nacre: {
		thesis: "Pearl luster is a Bragg stack, not a pearl shader.",
		composition: "Curved tablet surface, glancing light.",
		form: "Lamellar, slightly brick-like, organic.",
		material: "Aragonite tablets and protein sheets.",
		optics: "Multilayer interference plus dielectric Fresnel envelope.",
		color: "Warm orient that walks with angle. Compressed spectrum.",
		surface: "Polished, low roughness, tablet-scale orientation field.",
		invariants: ["bilayer optical thickness", "angular flash"],
		flexible: ["layer count", "protein fraction"]
	},
	labradorite: {
		thesis: "Labradorescence is nacre’s operator at lower contrast and tighter tilt.",
		composition: "A cleaved feldspar face. Schiller in a narrow lobe.",
		form: "Crystalline, planar, fractured.",
		material: "Exsolution lamellae in plagioclase.",
		optics: "Multilayer interference, microfacet scatter, view weight.",
		color: "Blue-green flash against a dark body. Not a pigment.",
		surface: "Cleavage polish. Tight orientation field.",
		invariants: ["low IOR contrast", "narrow angular lobe"],
		flexible: ["lamella period", "polish"]
	},
	"butterfly-structural-color": {
		thesis: "Morpho blue is a multilayer plus a ridge grating. No blue pigment.",
		composition: "Scale field, raked light, high angular selectivity.",
		form: "Periodic ridges over a lamellar stack.",
		material: "Chitin architecture.",
		optics: "Bragg peak from the stack, spectral orders from the grating.",
		color: "Saturated blue that collapses off-axis.",
		surface: "Ridge period in the micrometer band.",
		invariants: ["stack + grating composition", "view-dependent collapse"],
		flexible: ["ridge period", "layer count"]
	},
	"holographic-foil": {
		thesis: "No holographic flag. Grating orders on conductor Fresnel, lacquer film on top.",
		composition: "Embossed sheet, grazing specular.",
		form: "Mechanical, periodic, planar.",
		material: "PET lacquer over aluminum.",
		optics: "Diffraction grating, thin-film interference, conductor Fresnel.",
		color: "Spectral orders walking with angle. Metal underneath.",
		surface: "Embossed grooves. High specularity.",
		invariants: ["grating equation", "metal exit medium"],
		flexible: ["period", "lacquer thickness"]
	},
	"bismuth-oxide": {
		thesis: "Hopper-crystal tarnish is a film on a conductor, not a rainbow texture.",
		composition: "Stepped hopper geometry, oxide over metal.",
		form: "Crystalline stairs, iridescent.",
		material: "Bismuth metal with oxide film.",
		optics: "Thin-film interference against conductor Fresnel.",
		color: "Orders set by oxide thickness. Metal tint from (n, k).",
		surface: "Hopper roughness. Microfacet scatter.",
		invariants: ["film on conductor", "thickness as color"],
		flexible: ["oxide range", "hopper scale"]
	},
	"molten-chrome": {
		thesis: "Heat is volume emission. The metal is complex-IOR Fresnel.",
		composition: "Convecting liquid body, hot core.",
		form: "Fluid metal, anisotropic streaks.",
		material: "Liquid chromium.",
		optics: "Conductor Fresnel, microfacet scatter, blackbody emission.",
		color: "Cool metal with thermal incandescence in the troughs.",
		surface: "Convection-driven roughness. Anisotropic shear.",
		invariants: ["complex IOR", "emission independent of Fresnel"],
		flexible: ["temperature", "shear"]
	},
	"caustic-water": {
		thesis: "Caustics are Snell plus a displacement field. Not a caustic texture.",
		composition: "Looking through a dielectric surface onto focused light.",
		form: "Liquid plane, refractive.",
		material: "Water.",
		optics: "Refraction, caustic transport, dielectric Fresnel, absorption.",
		color: "White caustic network, red-preferring beer-law depth.",
		surface: "Surface waves. No pigment.",
		invariants: ["Snell + geometry", "wavelength-dependent absorption"],
		flexible: ["wave frequency", "focus scale"]
	},
	cloud: {
		thesis: "White is high albedo and a forward phase function, not a cloud shader.",
		composition: "Participating medium against void.",
		form: "Soft, billowing density field.",
		material: "Water droplets in air.",
		optics: "Mie volume scattering plus absorption.",
		color: "Near-white. Silver lining from forward scatter.",
		surface: "No surface. Density is the form.",
		invariants: ["Mie / HG phase", "density field"],
		flexible: ["density", "asymmetry g"]
	},
	nebula: {
		thesis: "Same volume operators as cloud. Emission and dust make the difference.",
		composition: "Low-density medium, embedded emission.",
		form: "Filamentary, open, astronomical.",
		material: "Dust and ionized gas.",
		optics: "Volume scattering, absorption, spectral emission.",
		color: "Line emission against dust-reddened scatter. Not a nebula LUT.",
		surface: "None. Density and emission fields.",
		invariants: ["shared volume operators with cloud", "emission as a separate node"],
		flexible: ["emission mix", "dust density"]
	},
	"opalescent-glass": {
		thesis: "Opalescence is Rayleigh scatter in a dielectric bulk, plus a glass boundary.",
		composition: "Transmitted slab, cool scatter, warm transmission.",
		form: "Solid dielectric, rounded.",
		material: "Glass with nano-inclusions.",
		optics: "Volume scattering, absorption, dielectric Fresnel, Snell.",
		color: "Blue scatter / amber transmit. No opal preset.",
		surface: "Polished glass Fresnel.",
		invariants: ["Rayleigh λ⁻⁴ tint", "boundary vs bulk"],
		flexible: ["inclusion density", "slab thickness"]
	}
};
function fingerprintOf(recipe) {
	return FINGERPRINTS[recipe.id] ?? {
		thesis: recipe.summary,
		composition: "Unspecified.",
		form: "Unspecified.",
		material: recipe.title,
		optics: recipe.nodes.map((n) => n.operator).join(", "),
		color: "Unspecified.",
		surface: "Unspecified.",
		invariants: recipe.phenomena ?? [],
		flexible: []
	};
}
function fusionKind(aOps, bOps) {
	const a = new Set(aOps);
	const b = new Set(bOps);
	const shared = [...a].filter((x) => b.has(x) && x !== "spectral-integrate");
	const aFam = familyOf(a);
	const bFam = familyOf(b);
	if (shared.length >= 2 && aFam === bFam) return "conservative";
	if (aFam === bFam || shared.length >= 1) return "expressive";
	return "speculative";
}
function familyOf(ops) {
	if (ops.has("thin-film-interference") || ops.has("multilayer-interference")) return "interference";
	if (ops.has("diffraction-grating")) return "diffraction";
	if (ops.has("volume-scattering")) return "volume";
	if (ops.has("caustic-transport") || ops.has("refraction-snell")) return "transport";
	if (ops.has("fresnel-conductor")) return "conductor";
	return "other";
}
var MODES = [
	{
		id: "look",
		label: "Look"
	},
	{
		id: "fuse",
		label: "Fuse"
	},
	{
		id: "proof",
		label: "Proof"
	}
];
function shortOp(id) {
	return id.replace(/-interference|-transport|-scatter|-weight|-integrate/g, "");
}
function NacreAtelier() {
	const setSpecimen = useGrammar((s) => s.setSpecimen);
	const cycleSpecimen = useGrammar((s) => s.cycleSpecimen);
	const resetKnobs = useGrammar((s) => s.resetKnobs);
	const setMode = useGrammar((s) => s.setMode);
	const mode = useGrammar((s) => s.mode);
	(0, import_react.useEffect)(() => {
		const stored = loadStoredSpecimen();
		if (stored && stored !== useGrammar.getState().specimenId) setSpecimen(stored);
	}, [setSpecimen]);
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			const t = e.target;
			if (t && [
				"INPUT",
				"TEXTAREA",
				"SELECT"
			].includes(t.tagName)) return;
			if (e.key === "ArrowDown" || e.key === "j") {
				e.preventDefault();
				cycleSpecimen(1);
			} else if (e.key === "ArrowUp" || e.key === "k") {
				e.preventDefault();
				cycleSpecimen(-1);
			} else if (e.key === "r") resetKnobs();
			else if (e.key === "l") setMode("look");
			else if (e.key === "f") setMode("fuse");
			else if (e.key === "p") setMode("proof");
			else if (/^[1-9]$/.test(e.key)) {
				const i = Number(e.key) - 1;
				if (SPECIMEN_ORDER[i]) setSpecimen(SPECIMEN_ORDER[i]);
			} else if (e.key === "0") setSpecimen(SPECIMEN_ORDER[9]);
			else if (e.key === "-") setSpecimen(SPECIMEN_ORDER[10]);
			else if (e.key === "=") setSpecimen(SPECIMEN_ORDER[11]);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [
		cycleSpecimen,
		resetKnobs,
		setMode,
		setSpecimen
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-dvh min-h-0 flex-col overflow-hidden bg-bg text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,26rem)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "relative flex min-h-0 min-w-0 flex-col",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative min-h-[42vh] flex-1 bg-void lg:min-h-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewCanvas, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StageCaption, {})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpecimenRail, {})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "min-h-0 overflow-y-auto border-t border-border bg-bg lg:border-t-0 lg:border-l",
				children: [
					mode === "look" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LookPanel, {}),
					mode === "fuse" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FusePanel, {}),
					mode === "proof" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProofPanel, {})
				]
			})]
		})]
	});
}
function Header() {
	const mode = useGrammar((s) => s.mode);
	const setMode = useGrammar((s) => s.setMode);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "identity-bar border-b border-border bg-surface",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center gap-3 px-4 py-3 md:px-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wordmark, { size: "sm" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 font-mono text-2xs tracking-caps text-muted uppercase",
						children: "Lookdev · Shader Grammar v0.1"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductNav, { active: "lookdev" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "flex rounded-md border border-border p-0.5",
					"aria-label": "Studio mode",
					children: MODES.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setMode(m.id),
						className: cn("h-11 min-w-16 rounded-sm px-3 text-sm font-medium transition-colors duration-150 ease-out", mode === m.id ? "bg-fg text-bg" : "text-muted hover:text-fg"),
						children: m.label
					}, m.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn("rounded-sm px-2.5 py-1 font-mono text-2xs tracking-caps uppercase", bundle.report.passed ? "bg-pass/15 text-pass" : "bg-danger/15 text-danger"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "sm:hidden",
						children: bundle.report.passed ? "pass" : "fail"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "hidden sm:inline",
						children: bundle.report.passed ? "validation pass" : "validation fail"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "solid",
					size: "sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/shader-grammar-v0.1.zip",
						download: true,
						children: "ZIP"
					})
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "border-t border-border px-4 py-2 text-xs leading-relaxed text-muted md:px-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sm:hidden",
				children: "Lookdev. Twelve specimens, shared operators, physical knobs."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "hidden sm:inline",
				children: "Nacre Atelier is lookdev for twelve specimens described by shared optical operators — not named-effect flags. Knobs write physical quantities with units. Drag the canvas to change view."
			})]
		})]
	});
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 md:p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-xl rounded-md bg-bg/75 px-3 py-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-2xs tracking-caps text-muted uppercase",
					children: mode === "fuse" ? "Hybrid recipe" : "Living specimen"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl leading-tight tracking-display md:text-3xl",
					children: mode === "fuse" ? `${recipe.title} × ${fuse.title}` : recipe.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm leading-normal text-muted text-pretty",
					children: mode === "fuse" ? `Blend ${Math.round((1 - blend) * 100)} / ${Math.round(blend * 100)}. Same shader. Operator weights only.` : fp.thesis
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "hidden rounded-sm bg-bg/70 px-2 py-1 font-mono text-2xs text-muted sm:block",
			children: [
				"Drag to change view · ",
				ops.length,
				" operators"
			]
		})]
	});
}
function SpecimenRail() {
	const specimenId = useGrammar((s) => s.specimenId);
	const setSpecimen = useGrammar((s) => s.setSpecimen);
	const focusOperator = useGrammar((s) => s.focusOperator);
	const coverage = bundle.coverage;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border-t border-border bg-surface",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "sr-only",
			children: "Twelve specimens"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "specimen-rail",
			children: SPECIMEN_ORDER.map((id, i) => {
				const r = recipeById(id);
				const active = id === specimenId;
				const lit = focusOperator ? (coverage[focusOperator] ?? []).includes(id) : true;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "shrink-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setSpecimen(id),
						className: cn("flex h-11 min-w-11 items-center gap-2 whitespace-nowrap rounded-md px-3 text-left transition-colors duration-150 ease-out", active ? "bg-fg text-bg" : lit ? "text-fg hover:bg-elevated" : "text-subtle hover:text-muted"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-2xs tabular-nums opacity-70",
							children: String(i + 1).padStart(2, "0")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm",
							children: r.title
						})]
					})
				}, id);
			})
		})]
	});
}
function LookPanel() {
	const specimenId = useGrammar((s) => s.specimenId);
	const recipe = recipeById(specimenId);
	const fp = FINGERPRINTS[specimenId] ?? fingerprintOf(recipe);
	const resetKnobs = useGrammar((s) => s.resetKnobs);
	const controls = controlsFor(specimenId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6 px-4 py-5 md:px-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-2xs tracking-caps text-muted uppercase",
					children: "Fingerprint"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "mt-3 space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
							label: "Optics",
							value: fp.optics
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
							label: "Color",
							value: fp.color
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
							label: "Surface",
							value: fp.surface
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
							label: "Form",
							value: fp.form
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-2xs tracking-caps text-muted uppercase",
						children: "Must survive"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 flex flex-wrap gap-1.5",
						children: fp.invariants.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "rounded-sm bg-elevated px-2 py-1 text-xs text-fg",
							children: item
						}, item))
					})]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MathPanel, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-2xs tracking-caps text-muted uppercase",
						children: "Physical knobs"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: resetKnobs,
						className: "h-11 px-2 text-xs text-muted hover:text-fg",
						children: "Reset"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mb-3 text-xs leading-normal text-subtle",
					children: [controls.equation, ". Each slider writes a uniform with units."]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-4",
					children: controls.knobs.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KnobSlider, {
						id: k.id,
						label: k.label,
						unit: k.unit,
						min: k.min,
						max: k.max,
						step: k.step,
						mapsTo: k.mapsTo
					}, k.id))
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OperatorList, { recipeId: specimenId }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm leading-normal text-muted text-pretty",
				children: recipe.summary
			})
		]
	});
}
function MathPanel() {
	const specimenId = useGrammar((s) => s.specimenId);
	const knobs = useGrammar((s) => s.knobs);
	const look = useGrammar((s) => s.look);
	const applied = applyPhysicalKnobs(uniformsFromRecipe(recipeById(specimenId)), specimenId, knobs).uniforms;
	const lines = controlsFor(specimenId).live(applied, look);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-md border border-border bg-surface p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-2xs tracking-caps text-signal uppercase",
				children: "Live equation"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
				className: "mt-2 space-y-1.5",
				children: lines.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-[7.5rem_minmax(0,1fr)] gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "font-mono text-2xs text-subtle",
						children: line.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "font-mono text-2xs text-fg text-pretty",
						children: line.value
					})]
				}, line.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-2xs leading-normal text-subtle",
				children: "Evaluative sketch. Polarization and tabulated metal IOR are not in v0.1. Drag the sphere to change cosθ."
			})
		]
	});
}
function ClientSlider(props) {
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setReady(true), []);
	if (!ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-11" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, { ...props });
}
function Fact({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
		className: "font-mono text-2xs tracking-caps text-subtle uppercase",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
		className: "mt-1 text-sm leading-normal text-fg text-pretty",
		children: value
	})] });
}
function KnobSlider({ id, label, unit, min, max, step, mapsTo }) {
	const value = useGrammar((s) => s.knobs[id] ?? min);
	const setKnob = useGrammar((s) => s.setKnob);
	const digits = step < .01 ? 3 : step < .1 ? 2 : step < 1 ? 1 : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "mb-1 flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm text-fg",
					children: label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-mono text-2xs tabular-nums text-muted",
					children: [
						value.toFixed(digits),
						" ",
						unit
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClientSlider, {
				min,
				max,
				step,
				value: [value],
				onValueChange: (v) => setKnob(id, v[0] ?? min)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-1 block text-xs leading-normal text-subtle",
				children: mapsTo
			})
		]
	});
}
function OperatorList({ recipeId }) {
	const recipe = recipeById(recipeId);
	const focusOperator = useGrammar((s) => s.focusOperator);
	const setFocusOperator = useGrammar((s) => s.setFocusOperator);
	const ops = recipe.nodes.map((n) => n.operator).filter((o) => o !== "spectral-integrate");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-mono text-2xs tracking-caps text-muted uppercase",
			children: "Bound operators"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-xs leading-normal text-subtle",
			children: "Click an operator to light every specimen that shares it. That is the generalization test."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-3 space-y-2",
			children: ops.map((op) => {
				const peers = sharedWith(bundle.coverage, op, recipeId);
				const on = focusOperator === op;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => setFocusOperator(on ? null : op),
					className: cn("w-full rounded-md border px-3 py-3 text-left transition-colors duration-150 ease-out", on ? "border-fg bg-elevated" : "border-border bg-surface hover:bg-elevated"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-baseline justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm text-fg",
							children: shortOp(op)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-mono text-2xs tabular-nums text-subtle",
							children: [bundle.report.reuse[op] ?? 0, "×"]
						})]
					}), peers.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "mt-1 block text-xs leading-normal text-muted",
						children: ["Shared with ", peers.map((id) => recipeById(id).title).join(", ")]
					}) : null]
				}) }, op);
			})
		})
	] });
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
	const kindLabel = kind === "conservative" ? "Conservative — same family, shared operators" : kind === "expressive" ? "Expressive — overlapping mechanisms" : "Speculative — distant families";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6 px-4 py-5 md:px-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-2xs tracking-caps text-muted uppercase",
					children: "Controlled fusion"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm leading-normal text-muted text-pretty",
					children: [
						a.title,
						" supplies one recipe. ",
						b.title,
						" supplies the other. The canvas is a single shader mixing operator weights. No named hybrid."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 rounded-md border border-border bg-elevated px-3 py-2 text-sm text-fg",
					children: kindLabel
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "mb-2 flex items-center justify-between text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: a.title }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: b.title })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClientSlider, {
					min: 0,
					max: 1,
					step: .01,
					value: [blend],
					onValueChange: (v) => setBlend(v[0] ?? .5)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-2xs tracking-caps text-muted uppercase",
				children: "Fuse with"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 grid grid-cols-2 gap-1.5",
				children: SPECIMEN_ORDER.filter((id) => id !== specimenId).map((id) => {
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setFuseId(id),
						className: cn("h-11 w-full rounded-md px-3 text-left text-sm transition-colors duration-150 ease-out", id === fuseId ? "bg-fg text-bg" : "bg-elevated text-fg hover:bg-elevated/80"),
						children: recipeById(id).title
					}) }, id);
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid grid-cols-2 gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SupplyColumn, {
					title: a.title,
					ops: aOps
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SupplyColumn, {
					title: b.title,
					ops: bOps
				})]
			})
		]
	});
}
function SupplyColumn({ title, ops }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "font-mono text-2xs tracking-caps text-muted uppercase",
		children: [title, " supplies"]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "mt-2 space-y-1",
		children: ops.filter((o) => o !== "spectral-integrate").map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
			className: "font-mono text-2xs text-fg",
			children: shortOp(o)
		}, o))
	})] });
}
function ProofPanel() {
	const specimenId = useGrammar((s) => s.specimenId);
	const setSpecimen = useGrammar((s) => s.setSpecimen);
	const focusOperator = useGrammar((s) => s.focusOperator);
	const setFocusOperator = useGrammar((s) => s.setFocusOperator);
	const c = bundle.report.criteria;
	const rows = [
		["Schemas valid", c.schemaValid],
		["No named-effect flags", c.noNamedEffectFlags],
		["All 12 specimens", c.allSpecimensPresent],
		["Every operator reused", c.everyOperatorReused],
		["Negative control rejected", c.negativeControlRejected],
		["Positive control accepted", c.positiveControlAccepted]
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6 px-4 py-5 md:px-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-2xs tracking-caps text-muted uppercase",
				children: "Why this exists"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-normal text-muted text-pretty",
				children: "Shader packs accumulate named looks. This grammar refuses that. Oil slick and soap film share thin-film interference. Nacre, labradorite, and butterfly share a multilayer. Cloud, nebula, and opalescent glass share volume scattering. If those twelve can be described without a one-off per material, the ontology is beginning to generalize."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BackendsPanel, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-2xs tracking-caps text-muted uppercase",
				children: "Acceptance gates"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 space-y-2",
				children: rows.map(([label, ok]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between gap-3 rounded-md border border-border bg-surface px-3 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm",
						children: label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("font-mono text-2xs tracking-caps uppercase", ok ? "text-pass" : "text-danger"),
						children: ok ? "pass" : "fail"
					})]
				}, label))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-2xs tracking-caps text-muted uppercase",
					children: "Coverage"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs leading-normal text-subtle",
					children: "Click an operator header to highlight its specimens. Click a row to load it."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full border-collapse text-left",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 pr-2 font-mono text-2xs font-medium tracking-caps text-muted uppercase",
								children: "Specimen"
							}), bundle.operators.filter((op) => op.id !== "spectral-integrate").map((op) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-0.5 py-2 text-center",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									title: op.id,
									onClick: () => setFocusOperator(focusOperator === op.id ? null : op.id),
									className: cn("size-7 rounded-sm font-mono text-2xs", focusOperator === op.id ? "bg-fg text-bg" : "text-subtle hover:text-fg"),
									children: op.id.split("-").map((w) => w[0]).join("")
								})
							}, op.id))]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: SPECIMEN_ORDER.map((id) => {
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: cn("cursor-pointer border-b border-border", id === specimenId ? "bg-elevated" : "hover:bg-surface"),
								onClick: () => setSpecimen(id),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-2 pr-2 text-sm font-medium text-fg",
									children: recipeById(id).title
								}), bundle.operators.filter((op) => op.id !== "spectral-integrate").map((op) => {
									const on = (bundle.coverage[op.id] ?? []).includes(id);
									const focused = focusOperator === op.id;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-0.5 py-2 text-center",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("inline-block size-2 rounded-full", on ? focused ? "bg-accent" : "bg-fg" : "bg-elevated") })
									}, op.id);
								})]
							}, id);
						}) })]
					})
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-2xs tracking-caps text-muted uppercase",
				children: "Where it is weak"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-normal text-muted text-pretty",
				children: "This canvas is an evaluative sketch driven by operator weights. Polarization, 3D photonic crystals, inelastic scatter, BSSRDF, and full spectral metal IOR are not in v0.1."
			})] })
		]
	});
}
function GrammarPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NacreAtelier, {});
}
//#endregion
export { GrammarPage as component };
