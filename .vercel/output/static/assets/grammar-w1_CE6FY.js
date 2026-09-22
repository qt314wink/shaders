import{r as e}from"./rolldown-runtime-hePW80VL.js";import{i as t,s as n}from"./index-C4toEqZB.js";import{a as r,i,n as a,o,r as s,s as c,t as l}from"./wordmark-lcHxujZh.js";var u=e(n(),1),d=`#version 300 es
precision highp float;
layout(location=0) in vec2 aPos;
out vec2 vUv;
void main(){
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`,f=`#version 300 es
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
}`;function p(e){return e.id.replace(/[^a-z0-9-]/g,`-`)}function m(e){return e.title.replace(/[^A-Za-z0-9]+/g,``)}function h(e){return Object.keys(e).map(t=>`  ${t}: ${Number(e[t]).toFixed(4)}`).join(`
`)}function g(e){return e.nodes.map(e=>e.operator).filter(e=>e!==`spectral-integrate`)}var _=`Operator kernels — Shader Grammar v0.1
The live lookdev canvas is GLSL ES 3.00 / WebGL2. These files are the SAME
operators (Airy film, Bragg orders m=1..6, grating as modulation when stacked
with Bragg, HG phase, conductor Fresnel). They are not a bit-identical decompile
of the sketch, so they will not pixel-match. Bind the uniform block. Do not add
a named-effect flag (oilSlick, pearlescent, holographic).

Optical is simulation-only. Do not drive a laser, beam, or haptic from this.`,v=`// λ_m = 2 Λ cosθ / m, Λ = nA tA + nB tB. Sample m = 1..6 in the visible.`;function y(e){return`// ${_}

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

// ${v}
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
static const float uThinFilm = ${e.uThinFilm.toFixed(4)};
static const float uMulti    = ${e.uMulti.toFixed(4)};
static const float uGrating  = ${e.uGrating.toFixed(4)};
static const float uTa = ${e.uTa.toFixed(3)};
static const float uTb = ${e.uTb.toFixed(3)};
static const float uNA = ${e.uNA.toFixed(4)};
static const float uNB = ${e.uNB.toFixed(4)};
static const float uLayers = ${e.uLayers.toFixed(1)};
static const float uThick0 = ${e.uThick0.toFixed(2)};
static const float uThick1 = ${e.uThick1.toFixed(2)};
static const float uN0 = ${e.uN0.toFixed(4)};
static const float uN1 = ${e.uN1.toFixed(4)};
static const float uN2 = ${e.uN2.toFixed(4)};
static const float uPeriod = ${e.uPeriod.toFixed(4)};
static const float uG = ${e.uG.toFixed(4)};
static const float uDensity = ${e.uDensity.toFixed(4)};
static const float uStage = ${e.uStage.toFixed(1)};
`}function ee(e){return`// ${_}

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
// ta=${e.uTa.toFixed(1)} tb=${e.uTb.toFixed(1)} nA=${e.uNA.toFixed(3)} nB=${e.uNB.toFixed(3)}
// film ${e.uThinFilm} multi ${e.uMulti} grating ${e.uGrating} stage ${e.uStage}
`}function te(e,t){return`Shader "AURELITH/Grammar/${m(e)}"
{
    Properties
    {
        [Header(Shader Grammar v0.1)]
        _Ta ("Thickness A (nm)", Float) = ${t.uTa.toFixed(1)}
        _Tb ("Thickness B (nm)", Float) = ${t.uTb.toFixed(1)}
        _NA ("nA", Float) = ${t.uNA.toFixed(3)}
        _NB ("nB", Float) = ${t.uNB.toFixed(3)}
        _Layers ("Bilayers", Float) = ${t.uLayers.toFixed(0)}
        _Thick0 ("Film min (nm)", Float) = ${t.uThick0.toFixed(1)}
        _Thick1 ("Film max (nm)", Float) = ${t.uThick1.toFixed(1)}
        _N0 ("n incident", Float) = ${t.uN0.toFixed(4)}
        _N1 ("n film", Float) = ${t.uN1.toFixed(4)}
        _N2 ("n exit", Float) = ${t.uN2.toFixed(4)}
        _Period ("Grating period (um)", Float) = ${t.uPeriod.toFixed(3)}
        _G ("HG g", Float) = ${t.uG.toFixed(3)}
        _Density ("Density", Float) = ${t.uDensity.toFixed(3)}
        _ThinFilm ("Thin film weight", Range(0,1)) = ${t.uThinFilm.toFixed(1)}
        _Multi ("Multilayer weight", Range(0,1)) = ${t.uMulti.toFixed(1)}
        _Grating ("Grating weight", Range(0,1)) = ${t.uGrating.toFixed(1)}
        _Scatter ("Scatter weight", Range(0,1)) = ${t.uScatter.toFixed(1)}
        _IorMetal ("Conductor n", Float) = ${t.uN.toFixed(3)}
        _KMetal ("Conductor k", Float) = ${t.uK.toFixed(3)}
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

            ${y(t)}

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
`}function ne(e){return`// AurelithGrammarBinder.cs
// Maps aurelith.scene.v1 macros onto AURELITH/Grammar/${m(e)}.
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
`}function re(e,t){return JSON.stringify({schema:`aurelith.grammar.backend.v1`,recipe:e.id,title:e.title,operators:g(e),optical:`simulation-only`,runtimes:{lookdev:`GLSL ES 3.00 / WebGL2 (live canvas)`,webgpu:`WGSL fragment, same uniform block`,unity:`URP shader AURELITH/Grammar/${m(e)}`,three:`r3f / three.js ShaderMaterial using the GLSL kernels. Closed graph only.`},uniforms:t,equations:{film:`2 n d cosθ = m λ`,bragg:`λ_m = 2 (nA tA + nB tB) cosθ / m`,grating:`d sinθ = m λ (modulates Bragg when both bound)`,hg:`p(μ) = (1 - g²) / (1 + g² - 2 g μ)^{3/2}`},r3fGraph:[`PerspectiveCamera — depth macro → z`,`FogExp2 — atmosphere macro → density`,`Points — closed vertex table (bloom 16 / lattice 49 / coil 96 / gate 24 / vesica 64)`,`LineLoop — same table`,`Points — particle budget from quality tier`,`No GLTF, no unbounded scene graph, no physical beam`],warnings:[`Do not add named-effect flags.`,`Do not drive a laser, haptic, or health device.`,`Kernels will not pixel-match the lookdev sketch.`]},null,2)}function b(e,t){return`/* Live lookdev backend — GLSL ES 3.00 / WebGL2
 * Specimen: ${e.title} (${e.id})
 * Operators: ${g(e).join(`, `)}
 * ${_}
 *
 * Uniforms at export:
${h(t)}
 */

${d}

${f}
`}function x(e,t){return`// WebGPU backend — WGSL
// Specimen: ${e.title} (${e.id})
// Operators: ${g(e).join(`, `)}
// Bind group 0, binding 0 = Uniforms. Draw a fullscreen triangle or a mesh.
// Prefer navigator.gpu when present; lookdev stays on WebGL2 until this is wired.

${ee(t)}

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
`}function ie(e,t){let n=p(e);return[{id:`glsl`,title:`GLSL ES 3.00`,filename:`${n}.lookdev.glsl`,mime:`text/plain`,runtime:`Lookdev canvas · WebGL2`,note:`This is the live backend. The canvas compiles this source.`,body:b(e,t)},{id:`wgsl`,title:`WGSL`,filename:`${n}.frag.wgsl`,mime:`text/plain`,runtime:`WebGPU (navigator.gpu)`,note:`Same operators. Wire bind group 0 when a WebGPU path is present. Lookdev does not switch until that path is proven.`,body:x(e,t)},{id:`hlsl`,title:`HLSL kernels`,filename:`${n}.grammar.hlsl`,mime:`text/plain`,runtime:`Unity URP / DX12 / HDRP custom pass`,note:`Operator kernels plus the captured uniform block. Not a named nacre shader.`,body:y(t)},{id:`unity`,title:`Unity URP shader`,filename:`${m(e)}Grammar.shader`,mime:`text/plain`,runtime:`Unity 6 / URP · shader AURELITH/Grammar/`+m(e),note:`Assign to a mesh. Pair with AurelithGrammarBinder.cs. Optical stays a simulation.`,body:te(e,t)+`

/* ---- binder ---- */

`+ne(e)},{id:`contract`,title:`Backend contract`,filename:`${n}.backend.json`,mime:`application/json`,runtime:`three.js / r3f / Unity / WebGPU`,note:`Uniform block, equations, and the closed r3f graph. This is the IR handoff.`,body:re(e,t)}]}function ae(e){let t=new Blob([e.body],{type:e.mime}),n=URL.createObjectURL(t),r=document.createElement(`a`);r.href=n,r.download=e.filename,r.click(),URL.revokeObjectURL(n)}function S(e,t,n){let r=e[t];return typeof r==`number`&&Number.isFinite(r)?r:n}function C(e){let t=-e.x*1.5,n=-e.y*1.25;return Math.max(.2,Math.min(1,1/(Math.hypot(t,n,1)||1)))}function w(e,t=0){return e.toFixed(t)}var oe={equation:`2 n d cosθ = m λ`,timeScale:.55,warp:.7,knobs:[{id:`d`,label:`Mean thickness`,unit:`nm`,min:80,max:900,step:5,default:340,mapsTo:`uThick0 / uThick1 — optical path of the hydrocarbon film`},{id:`nFilm`,label:`Film IOR`,unit:`n`,min:1.4,max:1.55,step:.005,default:1.47,mapsTo:`uN1 — hydrocarbon n`},{id:`caustic`,label:`Caustic mix`,unit:`weight`,min:0,max:.4,step:.01,default:.16,mapsTo:`uCMix — water caustics sit under the film, not over it`}],apply(e,t){let n=S(t,`d`,340),r=S(t,`nFilm`,1.47),i=S(t,`caustic`,.16);return{...e,uThick0:n*.35,uThick1:n*2.1,uN1:r,uCMix:i,uCScale:.7}},live(e,t){let n=C(t),r=(e.uThick0+e.uThick1)/2,i=2*e.uN1*r*n;return[{label:`Equation`,value:`2 n d cosθ = m λ`},{label:`n, d, cosθ`,value:`${w(e.uN1,2)} · ${w(r,0)} nm · ${w(n,2)}`},{label:`2 n d cosθ`,value:`${w(i,0)} nm`},{label:`constructive m=1`,value:`λ ≈ ${w(i/1.5,0)} nm  (2nd = 3λ/2)`},{label:`constructive m=2`,value:`λ ≈ ${w(i/2.5,0)} nm`},{label:`Stack`,value:`air ${w(e.uN0,3)} / film ${w(e.uN1,2)} / water ${w(e.uN2,3)}`}]}},se={equation:`2 n d cosθ = m λ · black film as d → 0`,timeScale:.18,warp:.12,knobs:[{id:`dMax`,label:`Foot thickness`,unit:`nm`,min:80,max:1200,step:10,default:720,mapsTo:`uThick1 — drainage field still goes to uThick0 at the top`},{id:`nFilm`,label:`Film IOR`,unit:`n`,min:1.33,max:1.42,step:.005,default:1.35,mapsTo:`uN1 — water + surfactant`},{id:`dMin`,label:`Black-film floor`,unit:`nm`,min:4,max:40,step:1,default:8,mapsTo:`uThick0 — below ~10 nm all visible λ cancel`}],apply(e,t){return{...e,uThick0:S(t,`dMin`,8),uThick1:S(t,`dMax`,720),uN1:S(t,`nFilm`,1.35),uN2:1.0003}},live(e,t){let n=C(t);return[{label:`Equation`,value:`2 n d cosθ = m λ`},{label:`n, cosθ`,value:`${w(e.uN1,2)} · ${w(n,2)}`},{label:`Top (black)`,value:`d = ${w(e.uThick0,0)} nm`},{label:`Foot`,value:`d = ${w(e.uThick1,0)} nm`},{label:`Stack`,value:`air / film / air — net π, black at zero`}]}};function T(e,t){let n=C(t),r=e.uNA*e.uTa+e.uNB*e.uTb,i=[{label:`Equation`,value:`λ_m = 2 Λ cosθ / m`},{label:`Λ = nA tA + nB tB`,value:`${w(e.uNA,2)}×${w(e.uTa,0)} + ${w(e.uNB,2)}×${w(e.uTb,0)} = ${w(r,0)} nm`},{label:`cosθ`,value:w(n,2)}];for(let e=1;e<=4;e++){let t=2*r*n/e,a=t>=380&&t<=780?`visible`:t<380?`UV`:`IR`;i.push({label:`m = ${e}`,value:`λ = ${w(t,0)} nm (${a})`})}return i.push({label:`Δn, N`,value:`${w(Math.abs(e.uNA-e.uNB),3)} · ${w(e.uLayers,0)} bilayers`}),i}var E={equation:`λ_m = 2 (nA tA + nB tB) cosθ / m`,timeScale:.06,warp:.08,knobs:[{id:`tA`,label:`Aragonite tablet`,unit:`nm`,min:220,max:700,step:5,default:450,mapsTo:`uTa — nA = 1.65. Pearl orient is m = 2, 3 of Λ ≈ 770 nm`},{id:`tB`,label:`Protein sheet`,unit:`nm`,min:8,max:40,step:1,default:20,mapsTo:`uTb — nB = 1.40`},{id:`layers`,label:`Bilayers`,unit:`N`,min:40,max:400,step:2,default:180,mapsTo:`uLayers — peak narrows as N grows`}],apply(e,t){return{...e,uTa:S(t,`tA`,450),uTb:S(t,`tB`,20),uLayers:S(t,`layers`,180)}},live:T},D={"oil-slick":oe,"soap-film":se,nacre:E,labradorite:{equation:`λ_m = 2 Λ cosθ / m · Δn ≈ 0.03`,timeScale:.04,warp:.05,knobs:[{id:`period`,label:`Lamella period`,unit:`nm`,min:180,max:420,step:4,default:260,mapsTo:`Scales tA + tB. m = 2 of Λ ≈ 400 nm is the blue-green flash`},{id:`dn`,label:`IOR contrast Δn`,unit:`Δn`,min:.012,max:.08,step:.001,default:.03,mapsTo:`uNA − uNB. Low contrast is labradorescence, not a pigment`},{id:`view`,label:`Angular lobe`,unit:`exp`,min:2,max:12,step:.1,default:8.5,mapsTo:`uViewExp — flash collapses off the cleavage`}],apply(e,t){let n=S(t,`period`,260),r=S(t,`dn`,.03),i=n/260;return{...e,uTa:140*i,uTb:120*i,uNA:1.545+r/2,uNB:1.545-r/2,uViewExp:S(t,`view`,8.5)}},live:T},"butterfly-structural-color":{equation:`λ₁ = 2 Λ cosθ · ridges modulate, they do not add a rainbow`,timeScale:.08,warp:.1,knobs:[{id:`tA`,label:`Chitin lamella`,unit:`nm`,min:60,max:130,step:1,default:90,mapsTo:`uTa — nA = 1.56. Λ ≈ 210 nm → λ₁ ≈ 420 nm`},{id:`tB`,label:`Air gap`,unit:`nm`,min:40,max:110,step:1,default:70,mapsTo:`uTb — nB = 1.00`},{id:`period`,label:`Ridge period`,unit:`μm`,min:.4,max:1.6,step:.02,default:.85,mapsTo:`uPeriod — grating modulates the Bragg lobe`}],apply(e,t){return{...e,uTa:S(t,`tA`,90),uTb:S(t,`tB`,70),uPeriod:S(t,`period`,.85),uViewExp:Math.min(e.uViewExp,4.2)}},live(e,t){let n=T(e,t);return n.push({label:`Ridges`,value:`d = ${w(e.uPeriod,2)} μm · d sinθ = m λ (modulation only)`}),n}},"holographic-foil":{equation:`d sinθ = m λ`,timeScale:.12,warp:.08,knobs:[{id:`period`,label:`Groove period`,unit:`μm`,min:.4,max:2,step:.02,default:.85,mapsTo:`uPeriod — grating equation`},{id:`lacquer`,label:`Lacquer thickness`,unit:`nm`,min:80,max:520,step:5,default:300,mapsTo:`uThick0 / uThick1 — Airy on the metal`},{id:`orders`,label:`Orders`,unit:`m`,min:1,max:5,step:1,default:4,mapsTo:`uOrders`}],apply(e,t){let n=S(t,`lacquer`,300);return{...e,uPeriod:S(t,`period`,.85),uThick0:n*.7,uThick1:n*1.3,uOrders:S(t,`orders`,4)}},live(e,t){let n=C(t),r=Math.sqrt(Math.max(1-n*n,.08)),i=e.uPeriod*1e3;return[{label:`Equation`,value:`d sinθ = m λ`},{label:`d, sinθ`,value:`${w(i,0)} nm · ${w(r,2)}`},{label:`m = 1`,value:`λ = ${w(i*r/1,0)} nm`},{label:`m = 2`,value:`λ = ${w(i*r/2,0)} nm`},{label:`Lacquer`,value:`d ≈ ${w((e.uThick0+e.uThick1)/2,0)} nm · 2 n d cosθ`}]}},"bismuth-oxide":{equation:`2 n d cosθ = m λ against conductor (n, k)`,timeScale:.1,warp:.06,knobs:[{id:`d`,label:`Oxide thickness`,unit:`nm`,min:40,max:380,step:4,default:180,mapsTo:`uThick0 / uThick1 — hopper steps set the field`},{id:`nFilm`,label:`Oxide IOR`,unit:`n`,min:1.9,max:2.5,step:.01,default:2.15,mapsTo:`uN1`},{id:`rough`,label:`Hopper roughness`,unit:`α`,min:.06,max:.5,step:.01,default:.22,mapsTo:`uRough`}],apply(e,t){let n=S(t,`d`,180);return{...e,uThick0:n*.45,uThick1:n*1.55,uN1:S(t,`nFilm`,2.15),uRough:S(t,`rough`,.22)}},live(e,t){let n=C(t),r=(e.uThick0+e.uThick1)/2,i=2*e.uN1*r*n;return[{label:`Equation`,value:`2 n d cosθ = m λ`},{label:`n, d, cosθ`,value:`${w(e.uN1,2)} · ${w(r,0)} nm · ${w(n,2)}`},{label:`2 n d cosθ`,value:`${w(i,0)} nm`},{label:`Exit`,value:`conductor n,k · film sits on metal, not a rainbow texture`}]}},"molten-chrome":{equation:`Fresnel (n, k) + B(T) emission`,timeScale:.42,warp:.55,knobs:[{id:`temp`,label:`Temperature`,unit:`K`,min:1400,max:2200,step:10,default:1900,mapsTo:`uTemp — blackbody in the troughs, independent of Fresnel`},{id:`rough`,label:`Convection roughness`,unit:`α`,min:.02,max:.4,step:.01,default:.12,mapsTo:`uRough`},{id:`aniso`,label:`Shear`,unit:`aniso`,min:0,max:1,step:.01,default:.45,mapsTo:`uAniso`}],apply(e,t){return{...e,uTemp:S(t,`temp`,1900),uRough:S(t,`rough`,.12),uAniso:S(t,`aniso`,.45),uEmitAmt:.85}},live(e){return[{label:`Metal`,value:`n = ${w(e.uN,2)}, k = ${w(e.uK,2)}`},{label:`Blackbody`,value:`T = ${w(e.uTemp,0)} K`},{label:`Roughness`,value:`α = ${w(e.uRough,2)} · aniso ${w(e.uAniso,2)}`},{label:`Note`,value:`Heat is volume emission. The metal is complex-IOR Fresnel.`}]}},"caustic-water":{equation:`Snell + focus of ∇h · Beer’s law`,timeScale:.7,warp:.35,knobs:[{id:`focus`,label:`Focus scale`,unit:`weight`,min:.4,max:2.2,step:.02,default:1.4,mapsTo:`uCScale — caustic tightness`},{id:`eta`,label:`Water IOR`,unit:`n`,min:1.31,max:1.36,step:.001,default:1.333,mapsTo:`uEta`},{id:`absorb`,label:`Absorption`,unit:`1/m`,min:.02,max:.8,step:.01,default:.14,mapsTo:`uSigmaA — red-preferring`}],apply(e,t){return{...e,uCScale:S(t,`focus`,1.4),uEta:S(t,`eta`,1.333),uIorD:S(t,`eta`,1.333),uSigmaA:S(t,`absorb`,.14),uCMix:1}},live(e){return[{label:`Snell`,value:`n_air sinθ_i = ${w(e.uEta,3)} sinθ_t`},{label:`Focus`,value:`scale ${w(e.uCScale,2)}`},{label:`Beer`,value:`σ_a = ${w(e.uSigmaA,2)} /m · water takes red first`}]}},cloud:{equation:`p(θ) = HG(g) · high albedo`,timeScale:.28,warp:.2,knobs:[{id:`density`,label:`Droplet density`,unit:`rel`,min:.25,max:1.4,step:.02,default:.85,mapsTo:`uDensity`},{id:`g`,label:`Asymmetry g`,unit:`g`,min:.4,max:.95,step:.01,default:.85,mapsTo:`uG — Mie droplets are forward-peaked. Silver lining.`},{id:`sigmaS`,label:`σ_s`,unit:`1/m`,min:4,max:22,step:.2,default:12,mapsTo:`uSigmaS`}],apply(e,t){return{...e,uDensity:S(t,`density`,.85),uG:S(t,`g`,.85),uSigmaS:S(t,`sigmaS`,12),uPhase:2}},live(e){return[{label:`Phase`,value:`Henyey–Greenstein / Mie`},{label:`p(θ)`,value:`(1 − g²) / (1 + g² − 2 g μ)^{3/2}`},{label:`g, σ_s, ρ`,value:`${w(e.uG,2)} · ${w(e.uSigmaS,1)} /m · ${w(e.uDensity,2)}`},{label:`Albedo`,value:`σ_s / (σ_s + σ_a) ≈ 1 — white is not a cloud shader`}]}},nebula:{equation:`Same volume operators as cloud. Emission is a separate node.`,timeScale:.16,warp:.12,knobs:[{id:`density`,label:`Dust density`,unit:`rel`,min:.15,max:1.2,step:.02,default:.55,mapsTo:`uDensity`},{id:`emit`,label:`Line emission`,unit:`weight`,min:.2,max:1.6,step:.02,default:1,mapsTo:`uEmitAmt — Hβ, [O III], Hα as data`},{id:`g`,label:`Asymmetry g`,unit:`g`,min:-.2,max:.7,step:.02,default:.35,mapsTo:`uG`}],apply(e,t){return{...e,uDensity:S(t,`density`,.55),uEmitAmt:S(t,`emit`,1),uG:S(t,`g`,.35),uPhase:0}},live(e){return[{label:`Lines`,value:`Hβ 486 nm · [O III] 501 nm · Hα 656 nm`},{label:`g, ρ, emit`,value:`${w(e.uG,2)} · ${w(e.uDensity,2)} · ${w(e.uEmitAmt,2)}`},{label:`Operators`,value:`volume-scattering + absorption + emission`}]}},"opalescent-glass":{equation:`I_s ∝ λ⁻⁴ · glass Fresnel at the boundary`,timeScale:.08,warp:.06,knobs:[{id:`density`,label:`Inclusion density`,unit:`rel`,min:.08,max:.9,step:.02,default:.42,mapsTo:`uDensity — Rayleigh scatter in the bulk`},{id:`ior`,label:`Glass IOR`,unit:`n`,min:1.45,max:1.55,step:.005,default:1.52,mapsTo:`uIorD / uEta — sphere boundary`},{id:`sigmaS`,label:`σ_s (blue-weighted)`,unit:`1/m`,min:1,max:8,step:.1,default:2.7,mapsTo:`uSigmaS`}],apply(e,t){let n=S(t,`ior`,1.52);return{...e,uDensity:S(t,`density`,.42),uIorD:n,uEta:n,uSigmaS:S(t,`sigmaS`,2.7),uPhase:1,uStage:1}},live(e){return[{label:`Rayleigh`,value:`I_s / I_t ∝ λ⁻⁴  →  blue scatter / amber transmit`},{label:`n, ρ, σ_s`,value:`${w(e.uIorD,2)} · ${w(e.uDensity,2)} · ${w(e.uSigmaS,1)} /m`},{label:`Boundary`,value:`Dielectric Fresnel + Snell on a glass sphere. Not a volume slab.`}]}}};function O(e){return D[e]??E}function k(e){let t={};for(let n of O(e).knobs)t[n.id]=n.default;return t}function A(e,t,n){let r=O(t);return{uniforms:r.apply(e,n),timeScale:r.timeScale,warp:r.warp}}var j={version:`0.1.0`,operators:[{id:`thin-film-interference`,title:`Thin-film interference`,family:`interference`,reusable:!0,description:`Two-interface Airy interference. Color is a function of optical path 2 n d cos θ, not a material flag. Oil slicks, soap films, oxide tarnish, and lacquered foil all bind this operator.`,outputs:[`spectral-radiance`],references:[`Heavens 1955`,`Belcour & Barla 2017`],slots:{thickness:{kind:`thickness`,unit:`nm`,required:!0,field:`required`},nIncident:{kind:`ior-real`,unit:`dimensionless`,required:!0,field:`forbidden`},nFilm:{kind:`ior-real`,unit:`dimensionless`,required:!0,field:`forbidden`},nExit:{kind:`ior-real`,unit:`dimensionless`,required:!0,field:`forbidden`}}},{id:`multilayer-interference`,title:`Multilayer interference`,family:`interference`,reusable:!0,description:`N-period Bragg / lamellar stack. Peak wavelength is set by bilayer optical thickness and IOR contrast. Nacre, labradorite, and Morpho-type scales share this operator.`,outputs:[`spectral-radiance`],references:[`Kinoshita 2008`,`Nassau 2001`],slots:{layerCount:{kind:`count`,unit:`dimensionless`,required:!0,field:`forbidden`},thicknessA:{kind:`thickness`,unit:`nm`,required:!0,field:`allowed`},thicknessB:{kind:`thickness`,unit:`nm`,required:!0,field:`allowed`},nA:{kind:`ior-real`,unit:`dimensionless`,required:!0,field:`forbidden`},nB:{kind:`ior-real`,unit:`dimensionless`,required:!0,field:`forbidden`},orientation:{kind:`angle`,unit:`rad`,required:!0,field:`required`}}},{id:`diffraction-grating`,title:`Diffraction grating`,family:`diffraction`,reusable:!0,description:`Periodic microstructure. The grating equation m λ = p (sin θi + sin θd) produces spectral orders. Butterfly scale ridges and embossed holographic foil bind the same operator with different periods.`,outputs:[`spectral-radiance`],references:[`Born & Wolf`,`Kinoshita 2008`],slots:{period:{kind:`period`,unit:`um`,required:!0,field:`allowed`},depth:{kind:`length`,unit:`nm`,required:!0,field:`allowed`},orientation:{kind:`angle`,unit:`rad`,required:!0,field:`allowed`},orders:{kind:`count`,unit:`dimensionless`,required:!0,field:`forbidden`}}},{id:`fresnel-dielectric`,title:`Dielectric Fresnel`,family:`interface`,reusable:!0,description:`Real-IOR interface reflectance (Schlick / exact Fresnel). Used wherever a dielectric boundary is visible: films, nacre, water, glass.`,outputs:[`bsdf-lobe`,`weight`],slots:{ior:{kind:`ior-real`,unit:`dimensionless`,required:!0,field:`forbidden`}}},{id:`fresnel-conductor`,title:`Conductor Fresnel`,family:`interface`,reusable:!0,description:`Complex-IOR interface for metals. n and k may be spectral. Foil aluminum, bismuth, and molten chrome share this operator.`,outputs:[`bsdf-lobe`],slots:{ior:{kind:`ior-complex`,unit:`dimensionless`,required:!0,field:`forbidden`}}},{id:`microfacet-scatter`,title:`Microfacet scatter`,family:`interface`,reusable:!0,description:`GGX/Beckmann distribution of normals. Roughness and anisotropy are geometric, independent of the Fresnel term they modulate.`,outputs:[`bsdf-lobe`],slots:{roughness:{kind:`roughness`,unit:`dimensionless`,required:!0,field:`allowed`},anisotropy:{kind:`anisotropy`,unit:`dimensionless`,required:!0,field:`allowed`}}},{id:`refraction-snell`,title:`Snell refraction`,family:`geometric`,reusable:!0,description:`Transmission through a dielectric interface. eta is the relative IOR. Water and bulk glass both bind this operator.`,outputs:[`throughput`],slots:{iorInside:{kind:`ior-real`,unit:`dimensionless`,required:!0,field:`forbidden`},iorOutside:{kind:`ior-real`,unit:`dimensionless`,required:!0,field:`forbidden`}}},{id:`caustic-transport`,title:`Caustic transport`,family:`geometric`,reusable:!0,description:`Focusing of refracted or reflected light by a displacement field. Intensity follows the inverse Jacobian of the refracted mapping. Water surfaces are the type specimen; oil on waves reuses it.`,outputs:[`spectral-radiance`],slots:{displacement:{kind:`length`,unit:`mm`,required:!0,field:`required`},ior:{kind:`ior-real`,unit:`dimensionless`,required:!0,field:`forbidden`},focusScale:{kind:`weight`,unit:`dimensionless`,required:!0,field:`forbidden`}}},{id:`volume-scattering`,title:`Volume scattering`,family:`volume`,reusable:!0,description:`In-scattering with a closed phase-function enum (Henyey-Greenstein, Rayleigh, Mie). Cloud, nebula, and opalescent glass differ by density, albedo, and phase — not by separate operators.`,outputs:[`spectral-radiance`],slots:{density:{kind:`density`,unit:`kg/m3`,required:!0,field:`required`},sigmaS:{kind:`scattering-coeff`,unit:`1/m`,required:!0,field:`allowed`},phase:{kind:`phase-function`,unit:`enum`,required:!0,field:`forbidden`,enumValues:[`hg`,`rayleigh`,`mie`]},g:{kind:`anisotropy`,unit:`dimensionless`,required:!1,field:`forbidden`,notes:`Used when phase is hg or mie.`}}},{id:`volume-absorption`,title:`Volume absorption`,family:`volume`,reusable:!0,description:`Beer-Lambert extinction. sigmaA may be spectral (water red-absorb, nebular dust). Shared by participating media and tinted dielectrics.`,outputs:[`throughput`],slots:{density:{kind:`density`,unit:`kg/m3`,required:!0,field:`required`},sigmaA:{kind:`extinction`,unit:`1/m`,required:!0,field:`allowed`}}},{id:`volume-emission`,title:`Volume emission`,family:`volume`,reusable:!0,description:`Additive spectral emission in a medium or at a hot surface treated as a thin emitting layer. Nebular lines and molten-metal blackbody both bind this operator.`,outputs:[`spectral-radiance`],slots:{density:{kind:`density`,unit:`kg/m3`,required:!0,field:`allowed`},radiance:{kind:`spectral-power`,unit:`W/m3/sr/nm`,required:!1,field:`allowed`},temperature:{kind:`temperature`,unit:`K`,required:!1,field:`forbidden`}}},{id:`view-dependent-weight`,title:`View-dependent weight`,family:`evaluation`,reusable:!0,description:`Weights upstream radiance by a viewing/lighting lobe (fresnel, grazing, retro, specular). Structural color is directional because of this operator, not because of a material-named anisotropic flag.`,outputs:[`weight`],slots:{exponent:{kind:`weight`,unit:`dimensionless`,required:!0,field:`forbidden`},lobe:{kind:`lobe`,unit:`enum`,required:!0,field:`forbidden`,enumValues:[`fresnel`,`grazing`,`retro`,`specular`]}}},{id:`spectral-integrate`,title:`Spectral integrate`,family:`evaluation`,reusable:!0,description:`Converts spectral radiance to display RGB under a standard illuminant and observer. Every colored recipe ends here so that encoding stays spectral until evaluation.`,outputs:[`display-rgb`],slots:{illuminant:{kind:`illuminant`,unit:`enum`,required:!0,field:`forbidden`,enumValues:[`D65`,`A`,`E`]},observer:{kind:`observer`,unit:`enum`,required:!0,field:`forbidden`,enumValues:[`CIE-1931-2deg`]}}}],recipes:[{id:`bismuth-oxide`,version:`0.1.0`,title:`Bismuth oxide`,taxonomyIds:[`thin-film`,`conductor-interface`,`microfacet`],summary:`An oxide film on bismuth metal. Iridescent tarnish is thin-film interference against a conductor Fresnel exit medium, with hopper-crystal roughness — the same film operator as oil and soap.`,phenomena:[`thin-film-interference`,`conductor-fresnel`],fields:[{id:`oxide-thickness`,kind:`thickness`,unit:`nm`,domain:`surface`,source:{type:`procedural`,generator:`worley`,frequency:4.5},range:[40,380],notes:`Oxidation fronts follow hopper steps, so thickness is cellular rather than smoothly fbm.`},{id:`hopper-roughness`,kind:`roughness`,unit:`dimensionless`,domain:`surface`,source:{type:`procedural`,generator:`worley`,frequency:3.2},range:[.08,.45]}],parameters:[{id:`n-air`,kind:`ior-real`,unit:`dimensionless`,value:1.0003},{id:`n-oxide`,kind:`ior-real`,unit:`dimensionless`,value:2.15,range:[1.9,2.5]},{id:`n-exit-proxy`,kind:`ior-real`,unit:`dimensionless`,value:1.8,notes:`Real part of the metal used as film exit IOR; the conductor node carries the complex pair.`},{id:`ior-bismuth`,kind:`ior-complex`,unit:`dimensionless`,complex:{n:1.8,k:3.4}},{id:`anisotropy`,kind:`anisotropy`,unit:`dimensionless`,value:.15},{id:`illuminant`,kind:`illuminant`,unit:`enum`,enum:`D65`},{id:`observer`,kind:`observer`,unit:`enum`,enum:`CIE-1931-2deg`}],nodes:[{id:`oxide`,operator:`thin-film-interference`,bind:{thickness:{field:`oxide-thickness`},nIncident:{param:`n-air`},nFilm:{param:`n-oxide`},nExit:{param:`n-exit-proxy`}}},{id:`metal`,operator:`fresnel-conductor`,bind:{ior:{param:`ior-bismuth`}}},{id:`microfacet`,operator:`microfacet-scatter`,bind:{roughness:{field:`hopper-roughness`},anisotropy:{param:`anisotropy`}}},{id:`display`,operator:`spectral-integrate`,bind:{illuminant:{param:`illuminant`},observer:{param:`observer`}}}],graph:{output:`display`,edges:[{from:`oxide`,to:`display`},{from:`metal`,to:`microfacet`},{from:`microfacet`,to:`display`}]},evaluation:{illuminant:`D65`,observer:`CIE-1931-2deg`}},{id:`butterfly-structural-color`,version:`0.1.0`,title:`Butterfly structural color`,taxonomyIds:[`multilayer`,`grating`,`view-weight`],summary:`Chitin scale architecture: a multilayer stack for the Bragg peak plus a ridge grating for angular selectivity. Morpho-type blue is composed, not a named morpho shader.`,phenomena:[`multilayer-interference`,`diffraction`,`view-dependent-color`],fields:[{id:`scale-orientation`,kind:`angle`,unit:`rad`,domain:`surface`,source:{type:`procedural`,generator:`anisotropic-orientation`,frequency:8},range:[-.12,.12]},{id:`ridge-period`,kind:`period`,unit:`um`,domain:`surface`,source:{type:`procedural`,generator:`fbm`,octaves:2,frequency:12},range:[.6,1.1]}],parameters:[{id:`n-chitin`,kind:`ior-real`,unit:`dimensionless`,value:1.56},{id:`n-air-gap`,kind:`ior-real`,unit:`dimensionless`,value:1},{id:`lamella-thickness`,kind:`thickness`,unit:`nm`,value:90},{id:`gap-thickness`,kind:`thickness`,unit:`nm`,value:70},{id:`layer-count`,kind:`count`,unit:`dimensionless`,value:10},{id:`groove-depth`,kind:`length`,unit:`nm`,value:220},{id:`orders`,kind:`count`,unit:`dimensionless`,value:3},{id:`view-exp`,kind:`weight`,unit:`dimensionless`,value:6},{id:`view-lobe`,kind:`lobe`,unit:`enum`,enum:`specular`},{id:`illuminant`,kind:`illuminant`,unit:`enum`,enum:`D65`},{id:`observer`,kind:`observer`,unit:`enum`,enum:`CIE-1931-2deg`}],nodes:[{id:`stack`,operator:`multilayer-interference`,bind:{layerCount:{param:`layer-count`},thicknessA:{param:`lamella-thickness`},thicknessB:{param:`gap-thickness`},nA:{param:`n-chitin`},nB:{param:`n-air-gap`},orientation:{field:`scale-orientation`}}},{id:`ridges`,operator:`diffraction-grating`,bind:{period:{field:`ridge-period`},depth:{param:`groove-depth`},orientation:{field:`scale-orientation`},orders:{param:`orders`}}},{id:`view`,operator:`view-dependent-weight`,bind:{exponent:{param:`view-exp`},lobe:{param:`view-lobe`}}},{id:`display`,operator:`spectral-integrate`,bind:{illuminant:{param:`illuminant`},observer:{param:`observer`}}}],graph:{output:`display`,edges:[{from:`stack`,to:`view`},{from:`ridges`,to:`view`},{from:`view`,to:`display`}]},evaluation:{illuminant:`D65`,observer:`CIE-1931-2deg`}},{id:`caustic-water`,version:`0.1.0`,title:`Caustic water`,taxonomyIds:[`refraction`,`caustics`,`dielectric-interface`,`absorption`],summary:`A dielectric water surface. Caustics are Snell refraction composed with caustic transport of a displacement field; red-preferring absorption tints the volume. No water shader type.`,phenomena:[`refraction`,`caustics`,`dielectric-fresnel`,`spectral-absorption`],fields:[{id:`surface-displacement`,kind:`length`,unit:`mm`,domain:`surface`,source:{type:`analytic`,generator:`surface-waves`,frequency:1.1},range:[-24,24]},{id:`volume-density`,kind:`density`,unit:`kg/m3`,domain:`volume`,source:{type:`constant`,generator:`constant`,value:1e3},range:[997,1025]}],parameters:[{id:`n-air`,kind:`ior-real`,unit:`dimensionless`,value:1.0003},{id:`n-water`,kind:`ior-real`,unit:`dimensionless`,value:1.333},{id:`focus-scale`,kind:`weight`,unit:`dimensionless`,value:1.4},{id:`sigma-a`,kind:`extinction`,unit:`1/m`,spectral:{wavelengthsNm:[450,550,650],samples:[.02,.06,.35]},notes:`Water absorbs red more than blue.`},{id:`illuminant`,kind:`illuminant`,unit:`enum`,enum:`D65`},{id:`observer`,kind:`observer`,unit:`enum`,enum:`CIE-1931-2deg`}],nodes:[{id:`refract`,operator:`refraction-snell`,bind:{iorInside:{param:`n-water`},iorOutside:{param:`n-air`}}},{id:`caustics`,operator:`caustic-transport`,bind:{displacement:{field:`surface-displacement`},ior:{param:`n-water`},focusScale:{param:`focus-scale`}}},{id:`interface`,operator:`fresnel-dielectric`,bind:{ior:{param:`n-water`}}},{id:`absorb`,operator:`volume-absorption`,bind:{density:{field:`volume-density`},sigmaA:{param:`sigma-a`}}},{id:`display`,operator:`spectral-integrate`,bind:{illuminant:{param:`illuminant`},observer:{param:`observer`}}}],graph:{output:`display`,edges:[{from:`refract`,to:`caustics`},{from:`caustics`,to:`absorb`},{from:`interface`,to:`display`},{from:`absorb`,to:`display`}]},evaluation:{illuminant:`D65`,observer:`CIE-1931-2deg`}},{id:`cloud`,version:`0.1.0`,title:`Cloud`,taxonomyIds:[`scattering`,`absorption`],summary:`Water-droplet Mie scattering in a density field. White appearance is high albedo plus forward-peaked phase, not a cloud shader. Shares volume-scattering with nebula and opalescent glass.`,phenomena:[`mie-scattering`,`spectral-absorption`],fields:[{id:`droplet-density`,kind:`density`,unit:`kg/m3`,domain:`volume`,source:{type:`procedural`,generator:`fbm`,octaves:5,frequency:1.3},range:[0,.8]}],parameters:[{id:`sigma-s`,kind:`scattering-coeff`,unit:`1/m`,value:12},{id:`sigma-a`,kind:`extinction`,unit:`1/m`,value:.04},{id:`phase`,kind:`phase-function`,unit:`enum`,enum:`mie`},{id:`g`,kind:`anisotropy`,unit:`dimensionless`,value:.85,notes:`Large droplets are strongly forward-scattering.`},{id:`illuminant`,kind:`illuminant`,unit:`enum`,enum:`D65`},{id:`observer`,kind:`observer`,unit:`enum`,enum:`CIE-1931-2deg`}],nodes:[{id:`scatter`,operator:`volume-scattering`,bind:{density:{field:`droplet-density`},sigmaS:{param:`sigma-s`},phase:{param:`phase`},g:{param:`g`}}},{id:`absorb`,operator:`volume-absorption`,bind:{density:{field:`droplet-density`},sigmaA:{param:`sigma-a`}}},{id:`display`,operator:`spectral-integrate`,bind:{illuminant:{param:`illuminant`},observer:{param:`observer`}}}],graph:{output:`display`,edges:[{from:`scatter`,to:`display`},{from:`absorb`,to:`display`}]},evaluation:{illuminant:`D65`,observer:`CIE-1931-2deg`}},{id:`holographic-foil`,version:`0.1.0`,title:`Holographic foil`,taxonomyIds:[`grating`,`thin-film`,`conductor-interface`],summary:`Embossed PET over aluminum. Spectral orders come from the grating; a lacquer film adds Airy modulation; the metal is conductor Fresnel. No holographic boolean.`,phenomena:[`diffraction`,`thin-film-interference`,`conductor-fresnel`],fields:[{id:`groove-orientation`,kind:`angle`,unit:`rad`,domain:`surface`,source:{type:`analytic`,generator:`anisotropic-orientation`,frequency:1},range:[0,3.1416]},{id:`lacquer-thickness`,kind:`thickness`,unit:`nm`,domain:`surface`,source:{type:`procedural`,generator:`fbm`,octaves:2,frequency:5},range:[180,420]}],parameters:[{id:`n-air`,kind:`ior-real`,unit:`dimensionless`,value:1.0003},{id:`n-pet`,kind:`ior-real`,unit:`dimensionless`,value:1.58},{id:`n-lacquer`,kind:`ior-real`,unit:`dimensionless`,value:1.5},{id:`period`,kind:`period`,unit:`um`,value:.85,range:[.5,1.6]},{id:`groove-depth`,kind:`length`,unit:`nm`,value:140},{id:`orders`,kind:`count`,unit:`dimensionless`,value:4},{id:`ior-aluminum`,kind:`ior-complex`,unit:`dimensionless`,complex:{n:.9,k:6.5},notes:`Visible-band aluminum, approximate.`},{id:`illuminant`,kind:`illuminant`,unit:`enum`,enum:`D65`},{id:`observer`,kind:`observer`,unit:`enum`,enum:`CIE-1931-2deg`}],nodes:[{id:`grating`,operator:`diffraction-grating`,bind:{period:{param:`period`},depth:{param:`groove-depth`},orientation:{field:`groove-orientation`},orders:{param:`orders`}}},{id:`lacquer`,operator:`thin-film-interference`,bind:{thickness:{field:`lacquer-thickness`},nIncident:{param:`n-air`},nFilm:{param:`n-lacquer`},nExit:{param:`n-pet`}}},{id:`metal`,operator:`fresnel-conductor`,bind:{ior:{param:`ior-aluminum`}}},{id:`display`,operator:`spectral-integrate`,bind:{illuminant:{param:`illuminant`},observer:{param:`observer`}}}],graph:{output:`display`,edges:[{from:`grating`,to:`display`},{from:`lacquer`,to:`display`},{from:`metal`,to:`display`}]},evaluation:{illuminant:`D65`,observer:`CIE-1931-2deg`}},{id:`labradorite`,version:`0.1.0`,title:`Labradorite`,taxonomyIds:[`multilayer`,`microfacet`,`view-weight`],summary:`Exsolution lamellae in feldspar. Labradorescence is the same multilayer operator as nacre, with much lower IOR contrast, a tighter orientation field, and a microfacet envelope.`,phenomena:[`multilayer-interference`,`lamellar-flash`,`view-dependent-color`],fields:[{id:`lamellar-orientation`,kind:`angle`,unit:`rad`,domain:`surface`,source:{type:`analytic`,generator:`anisotropic-orientation`,frequency:.4},range:[-.08,.08],notes:`Flash occurs only when the viewing vector aligns with the lamellar normal.`},{id:`cleavage-roughness`,kind:`roughness`,unit:`dimensionless`,domain:`surface`,source:{type:`procedural`,generator:`fbm`,octaves:2,frequency:3},range:[.04,.18]}],parameters:[{id:`n-lamella-a`,kind:`ior-real`,unit:`dimensionless`,value:1.56},{id:`n-lamella-b`,kind:`ior-real`,unit:`dimensionless`,value:1.53,notes:`Δn ≈ 0.03 — enough for coherent interference, not a pigment.`},{id:`thickness-a`,kind:`thickness`,unit:`nm`,value:140},{id:`thickness-b`,kind:`thickness`,unit:`nm`,value:120},{id:`layer-count`,kind:`count`,unit:`dimensionless`,value:64},{id:`anisotropy`,kind:`anisotropy`,unit:`dimensionless`,value:.72},{id:`view-exp`,kind:`weight`,unit:`dimensionless`,value:8.5},{id:`view-lobe`,kind:`lobe`,unit:`enum`,enum:`specular`},{id:`illuminant`,kind:`illuminant`,unit:`enum`,enum:`D65`},{id:`observer`,kind:`observer`,unit:`enum`,enum:`CIE-1931-2deg`}],nodes:[{id:`stack`,operator:`multilayer-interference`,bind:{layerCount:{param:`layer-count`},thicknessA:{param:`thickness-a`},thicknessB:{param:`thickness-b`},nA:{param:`n-lamella-a`},nB:{param:`n-lamella-b`},orientation:{field:`lamellar-orientation`}}},{id:`microfacet`,operator:`microfacet-scatter`,bind:{roughness:{field:`cleavage-roughness`},anisotropy:{param:`anisotropy`}}},{id:`view`,operator:`view-dependent-weight`,bind:{exponent:{param:`view-exp`},lobe:{param:`view-lobe`}}},{id:`display`,operator:`spectral-integrate`,bind:{illuminant:{param:`illuminant`},observer:{param:`observer`}}}],graph:{output:`display`,edges:[{from:`stack`,to:`view`},{from:`microfacet`,to:`view`},{from:`view`,to:`display`}]},evaluation:{illuminant:`D65`,observer:`CIE-1931-2deg`}},{id:`molten-chrome`,version:`0.1.0`,title:`Molten chrome`,taxonomyIds:[`conductor-interface`,`microfacet`,`emission`,`view-weight`],summary:`Liquid chromium: complex-IOR Fresnel, convection-driven roughness, and thermal emission. Heat is volume-emission with a blackbody temperature, not a moltenChrome flag.`,phenomena:[`conductor-fresnel`,`thermal-emission`,`view-dependent-color`],fields:[{id:`convection-roughness`,kind:`roughness`,unit:`dimensionless`,domain:`surface`,source:{type:`procedural`,generator:`fbm`,octaves:5,frequency:1.8},range:[.02,.22]},{id:`flow-anisotropy`,kind:`anisotropy`,unit:`dimensionless`,domain:`surface`,source:{type:`analytic`,generator:`anisotropic-orientation`,frequency:.6},range:[.2,.7]}],parameters:[{id:`ior-chrome`,kind:`ior-complex`,unit:`dimensionless`,complex:{n:3.2,k:4.2}},{id:`temperature`,kind:`temperature`,unit:`K`,value:1900,range:[1400,2200]},{id:`emit-density`,kind:`density`,unit:`kg/m3`,value:1},{id:`view-exp`,kind:`weight`,unit:`dimensionless`,value:2},{id:`view-lobe`,kind:`lobe`,unit:`enum`,enum:`fresnel`},{id:`illuminant`,kind:`illuminant`,unit:`enum`,enum:`A`},{id:`observer`,kind:`observer`,unit:`enum`,enum:`CIE-1931-2deg`}],nodes:[{id:`metal`,operator:`fresnel-conductor`,bind:{ior:{param:`ior-chrome`}}},{id:`microfacet`,operator:`microfacet-scatter`,bind:{roughness:{field:`convection-roughness`},anisotropy:{field:`flow-anisotropy`}}},{id:`heat`,operator:`volume-emission`,bind:{density:{param:`emit-density`},temperature:{param:`temperature`}}},{id:`view`,operator:`view-dependent-weight`,bind:{exponent:{param:`view-exp`},lobe:{param:`view-lobe`}}},{id:`display`,operator:`spectral-integrate`,bind:{illuminant:{param:`illuminant`},observer:{param:`observer`}}}],graph:{output:`display`,edges:[{from:`metal`,to:`microfacet`},{from:`microfacet`,to:`view`},{from:`heat`,to:`display`},{from:`view`,to:`display`}]},evaluation:{illuminant:`A`,observer:`CIE-1931-2deg`}},{id:`nacre`,version:`0.1.0`,title:`Nacre`,taxonomyIds:[`multilayer`,`dielectric-interface`,`view-weight`],summary:`Aragonite tablets separated by protein sheets. Pearl luster is multilayer Bragg interference plus a dielectric Fresnel envelope, not a pearlescent flag.`,phenomena:[`multilayer-interference`,`view-dependent-color`,`dielectric-fresnel`],fields:[{id:`tablet-orientation`,kind:`angle`,unit:`rad`,domain:`surface`,source:{type:`procedural`,generator:`lamellar-tilt`,frequency:1.6},range:[-.18,.18]},{id:`tablet-thickness`,kind:`thickness`,unit:`nm`,domain:`surface`,source:{type:`procedural`,generator:`fbm`,octaves:3,frequency:6},range:[300,600]}],parameters:[{id:`n-aragonite`,kind:`ior-real`,unit:`dimensionless`,value:1.65},{id:`n-protein`,kind:`ior-real`,unit:`dimensionless`,value:1.4},{id:`protein-thickness`,kind:`thickness`,unit:`nm`,value:20},{id:`layer-count`,kind:`count`,unit:`dimensionless`,value:180,range:[40,400]},{id:`view-exp`,kind:`weight`,unit:`dimensionless`,value:3.2},{id:`view-lobe`,kind:`lobe`,unit:`enum`,enum:`grazing`},{id:`illuminant`,kind:`illuminant`,unit:`enum`,enum:`D65`},{id:`observer`,kind:`observer`,unit:`enum`,enum:`CIE-1931-2deg`}],nodes:[{id:`stack`,operator:`multilayer-interference`,bind:{layerCount:{param:`layer-count`},thicknessA:{field:`tablet-thickness`},thicknessB:{param:`protein-thickness`},nA:{param:`n-aragonite`},nB:{param:`n-protein`},orientation:{field:`tablet-orientation`}}},{id:`interface`,operator:`fresnel-dielectric`,bind:{ior:{param:`n-aragonite`}}},{id:`view`,operator:`view-dependent-weight`,bind:{exponent:{param:`view-exp`},lobe:{param:`view-lobe`}}},{id:`display`,operator:`spectral-integrate`,bind:{illuminant:{param:`illuminant`},observer:{param:`observer`}}}],graph:{output:`display`,edges:[{from:`stack`,to:`view`},{from:`interface`,to:`view`},{from:`view`,to:`display`}]},evaluation:{illuminant:`D65`,observer:`CIE-1931-2deg`}},{id:`nebula`,version:`0.1.0`,title:`Nebula`,taxonomyIds:[`scattering`,`emission`,`absorption`],summary:`Low-density participating medium with mixed phase, dust absorption, and spectral line emission. Same volume operators as cloud; emission and spectral peaks do the rest.`,phenomena:[`henyey-greenstein`,`volume-emission`,`spectral-absorption`],fields:[{id:`gas-density`,kind:`density`,unit:`kg/m3`,domain:`volume`,source:{type:`procedural`,generator:`worley`,octaves:4,frequency:.9},range:[0,.12]},{id:`line-emission`,kind:`spectral-power`,unit:`W/m3/sr/nm`,domain:`spectral`,source:{type:`analytic`,generator:`spectral-peak`,peaksNm:[486.1,500.7,656.3],bandwidthNm:6},range:[0,4],notes:`Hβ, [O III], Hα — line list is data, not a nebula operator.`}],parameters:[{id:`sigma-s`,kind:`scattering-coeff`,unit:`1/m`,value:.35},{id:`sigma-a`,kind:`extinction`,unit:`1/m`,value:.18},{id:`phase`,kind:`phase-function`,unit:`enum`,enum:`hg`},{id:`g`,kind:`anisotropy`,unit:`dimensionless`,value:.35},{id:`illuminant`,kind:`illuminant`,unit:`enum`,enum:`E`},{id:`observer`,kind:`observer`,unit:`enum`,enum:`CIE-1931-2deg`}],nodes:[{id:`scatter`,operator:`volume-scattering`,bind:{density:{field:`gas-density`},sigmaS:{param:`sigma-s`},phase:{param:`phase`},g:{param:`g`}}},{id:`absorb`,operator:`volume-absorption`,bind:{density:{field:`gas-density`},sigmaA:{param:`sigma-a`}}},{id:`emit`,operator:`volume-emission`,bind:{density:{field:`gas-density`},radiance:{field:`line-emission`}}},{id:`display`,operator:`spectral-integrate`,bind:{illuminant:{param:`illuminant`},observer:{param:`observer`}}}],graph:{output:`display`,edges:[{from:`scatter`,to:`display`},{from:`absorb`,to:`display`},{from:`emit`,to:`display`}]},evaluation:{illuminant:`E`,observer:`CIE-1931-2deg`}},{id:`oil-slick`,version:`0.1.0`,title:`Oil slick`,taxonomyIds:[`thin-film`,`dielectric-interface`,`caustics`,`view-weight`],summary:`A spreading hydrocarbon film on water. Color is two-interface interference whose optical path varies with thickness; wave displacement under the film reuses caustic transport.`,phenomena:[`thin-film-interference`,`view-dependent-color`,`variable-thickness`,`caustics`,`dielectric-fresnel`],fields:[{id:`film-thickness`,kind:`thickness`,unit:`nm`,domain:`surface`,source:{type:`procedural`,generator:`fbm`,octaves:4,frequency:2.4},range:[80,900],notes:`Spreading and wind set the local optical path. Typical crude-oil slicks sit in the 100–1000 nm band.`},{id:`wave-displacement`,kind:`length`,unit:`mm`,domain:`surface`,source:{type:`analytic`,generator:`surface-waves`,frequency:.7},range:[-8,8]}],parameters:[{id:`n-air`,kind:`ior-real`,unit:`dimensionless`,value:1.0003},{id:`n-oil`,kind:`ior-real`,unit:`dimensionless`,value:1.47,range:[1.4,1.55],notes:`Typical hydrocarbon film.`},{id:`n-water`,kind:`ior-real`,unit:`dimensionless`,value:1.333},{id:`view-exp`,kind:`weight`,unit:`dimensionless`,value:1.8},{id:`view-lobe`,kind:`lobe`,unit:`enum`,enum:`fresnel`},{id:`caustic-focus`,kind:`weight`,unit:`dimensionless`,value:.55},{id:`illuminant`,kind:`illuminant`,unit:`enum`,enum:`D65`},{id:`observer`,kind:`observer`,unit:`enum`,enum:`CIE-1931-2deg`}],nodes:[{id:`film`,operator:`thin-film-interference`,bind:{thickness:{field:`film-thickness`},nIncident:{param:`n-air`},nFilm:{param:`n-oil`},nExit:{param:`n-water`}}},{id:`interface`,operator:`fresnel-dielectric`,bind:{ior:{param:`n-oil`}}},{id:`caustics`,operator:`caustic-transport`,bind:{displacement:{field:`wave-displacement`},ior:{param:`n-water`},focusScale:{param:`caustic-focus`}}},{id:`view`,operator:`view-dependent-weight`,bind:{exponent:{param:`view-exp`},lobe:{param:`view-lobe`}}},{id:`display`,operator:`spectral-integrate`,bind:{illuminant:{param:`illuminant`},observer:{param:`observer`}}}],graph:{output:`display`,edges:[{from:`film`,to:`view`},{from:`interface`,to:`view`},{from:`caustics`,to:`display`},{from:`view`,to:`display`}]},evaluation:{illuminant:`D65`,observer:`CIE-1931-2deg`}},{id:`opalescent-glass`,version:`0.1.0`,title:`Opalescent glass`,taxonomyIds:[`scattering`,`dielectric-interface`,`absorption`,`refraction`],summary:`Nano-inclusions in a dielectric bulk. Opalescence is Rayleigh volume scattering plus Fresnel and Snell at the glass boundary. Blue scatter / warm transmit falls out of λ⁻⁴, not an opal flag.`,phenomena:[`rayleigh-scattering`,`dielectric-fresnel`,`refraction`,`spectral-absorption`],fields:[{id:`inclusion-density`,kind:`density`,unit:`kg/m3`,domain:`volume`,source:{type:`procedural`,generator:`fbm`,octaves:3,frequency:4.2},range:[.02,.35]}],parameters:[{id:`n-air`,kind:`ior-real`,unit:`dimensionless`,value:1.0003},{id:`n-glass`,kind:`ior-real`,unit:`dimensionless`,value:1.52},{id:`sigma-s`,kind:`scattering-coeff`,unit:`1/m`,spectral:{wavelengthsNm:[450,550,650],samples:[4.8,2.1,1.1]},notes:`Approximate Rayleigh tilt. A full renderer should evaluate λ⁻⁴ per sample.`},{id:`sigma-a`,kind:`extinction`,unit:`1/m`,value:.12},{id:`phase`,kind:`phase-function`,unit:`enum`,enum:`rayleigh`},{id:`illuminant`,kind:`illuminant`,unit:`enum`,enum:`D65`},{id:`observer`,kind:`observer`,unit:`enum`,enum:`CIE-1931-2deg`}],nodes:[{id:`scatter`,operator:`volume-scattering`,bind:{density:{field:`inclusion-density`},sigmaS:{param:`sigma-s`},phase:{param:`phase`}}},{id:`absorb`,operator:`volume-absorption`,bind:{density:{field:`inclusion-density`},sigmaA:{param:`sigma-a`}}},{id:`interface`,operator:`fresnel-dielectric`,bind:{ior:{param:`n-glass`}}},{id:`refract`,operator:`refraction-snell`,bind:{iorInside:{param:`n-glass`},iorOutside:{param:`n-air`}}},{id:`display`,operator:`spectral-integrate`,bind:{illuminant:{param:`illuminant`},observer:{param:`observer`}}}],graph:{output:`display`,edges:[{from:`interface`,to:`refract`},{from:`refract`,to:`scatter`},{from:`scatter`,to:`absorb`},{from:`absorb`,to:`display`}]},evaluation:{illuminant:`D65`,observer:`CIE-1931-2deg`}},{id:`soap-film`,version:`0.1.0`,title:`Soap film`,taxonomyIds:[`thin-film`,`dielectric-interface`,`view-weight`],summary:`A surfactant film in air. Same two-interface operator as oil slick; the stack is air/film/air, thickness drains toward a black film, and there is no metal and no pigment.`,phenomena:[`thin-film-interference`,`view-dependent-color`,`variable-thickness`,`dielectric-fresnel`],fields:[{id:`film-thickness`,kind:`thickness`,unit:`nm`,domain:`surface`,source:{type:`analytic`,generator:`drainage`,frequency:.15},range:[8,1200],notes:`Gravity and evaporation thin the film. Below ~10 nm the film goes black (destructive interference of all visible λ).`}],parameters:[{id:`n-air`,kind:`ior-real`,unit:`dimensionless`,value:1.0003},{id:`n-film`,kind:`ior-real`,unit:`dimensionless`,value:1.35,range:[1.33,1.42],notes:`Water plus surfactant. Lower than hydrocarbon oil.`},{id:`view-exp`,kind:`weight`,unit:`dimensionless`,value:2.4},{id:`view-lobe`,kind:`lobe`,unit:`enum`,enum:`grazing`},{id:`illuminant`,kind:`illuminant`,unit:`enum`,enum:`D65`},{id:`observer`,kind:`observer`,unit:`enum`,enum:`CIE-1931-2deg`}],nodes:[{id:`film`,operator:`thin-film-interference`,bind:{thickness:{field:`film-thickness`},nIncident:{param:`n-air`},nFilm:{param:`n-film`},nExit:{param:`n-air`}}},{id:`interface`,operator:`fresnel-dielectric`,bind:{ior:{param:`n-film`}}},{id:`view`,operator:`view-dependent-weight`,bind:{exponent:{param:`view-exp`},lobe:{param:`view-lobe`}}},{id:`display`,operator:`spectral-integrate`,bind:{illuminant:{param:`illuminant`},observer:{param:`observer`}}}],graph:{output:`display`,edges:[{from:`film`,to:`view`},{from:`interface`,to:`view`},{from:`view`,to:`display`}]},evaluation:{illuminant:`D65`,observer:`CIE-1931-2deg`},notes:`Oil slick and soap film share thin-film-interference. They differ by n-exit (water vs air), n-film, thickness generator, and view lobe.`}],taxonomy:{version:`0.1.0`,id:`shader-grammar-material-taxonomy`,principle:`Materials are classified by optical mechanism, not by trade name, pigment, or marketing effect. Words like iridescent, pearlescent, holographic, and opalescent are appearance aliases that map onto mechanisms. A specimen is valid only if every tag here resolves to a catalog operator.
`,families:[{id:`interference`,title:`Interference`,description:`Color from optical-path phase in a film or stack. Thickness and IOR contrast are the degrees of freedom, not a hue slider.
`,members:[{id:`thin-film`,operators:[`thin-film-interference`]},{id:`multilayer`,operators:[`multilayer-interference`]}]},{id:`diffraction`,title:`Diffraction`,description:`Color from periodic microstructure. Period, groove depth, and viewing angle set the orders — not a rainbow texture.
`,members:[{id:`grating`,operators:[`diffraction-grating`]}]},{id:`interface`,title:`Interface`,description:`Energy split at a boundary. Dielectrics use real IOR; conductors use complex IOR. Roughness is a separate geometric operator.
`,members:[{id:`dielectric-interface`,operators:[`fresnel-dielectric`]},{id:`conductor-interface`,operators:[`fresnel-conductor`]},{id:`microfacet`,operators:[`microfacet-scatter`]}]},{id:`geometric-transport`,title:`Geometric transport`,description:`Rays bent by a dielectric interface, then focused by a displacement field. Caustics are a consequence of refraction plus geometry.
`,members:[{id:`refraction`,operators:[`refraction-snell`]},{id:`caustics`,operators:[`caustic-transport`]}]},{id:`volume`,title:`Volume transport`,description:`In-scattering, absorption, and emission in a participating medium. Phase function and density field do the work; cloud and nebula are not separate shader types.
`,members:[{id:`scattering`,operators:[`volume-scattering`]},{id:`absorption`,operators:[`volume-absorption`]},{id:`emission`,operators:[`volume-emission`]}]},{id:`evaluation`,title:`Evaluation`,description:`View weighting and spectral-to-display conversion. Shared by every recipe that produces color.
`,members:[{id:`view-weight`,operators:[`view-dependent-weight`]},{id:`display`,operators:[`spectral-integrate`]}]}],aliases:{iridescent:[`thin-film`,`multilayer`,`grating`],pearlescent:[`multilayer`],labradorescence:[`multilayer`],holographic:[`grating`,`thin-film`],opalescence:[`scattering`],metallic:[`conductor-interface`,`microfacet`],molten:[`conductor-interface`,`emission`,`microfacet`],watery:[`refraction`,`caustics`,`dielectric-interface`],nebular:[`scattering`,`absorption`,`emission`],cloudy:[`scattering`,`absorption`]},specimens:{"oil-slick":{primary:[`thin-film`],secondary:[`dielectric-interface`,`caustics`,`view-weight`]},"soap-film":{primary:[`thin-film`],secondary:[`dielectric-interface`,`view-weight`]},nacre:{primary:[`multilayer`],secondary:[`dielectric-interface`,`view-weight`]},labradorite:{primary:[`multilayer`],secondary:[`microfacet`,`view-weight`]},"butterfly-structural-color":{primary:[`multilayer`,`grating`],secondary:[`view-weight`]},"holographic-foil":{primary:[`grating`,`thin-film`],secondary:[`conductor-interface`]},"bismuth-oxide":{primary:[`thin-film`,`conductor-interface`],secondary:[`microfacet`]},"molten-chrome":{primary:[`conductor-interface`,`microfacet`],secondary:[`emission`,`view-weight`]},"caustic-water":{primary:[`refraction`,`caustics`],secondary:[`dielectric-interface`,`absorption`]},cloud:{primary:[`scattering`],secondary:[`absorption`]},nebula:{primary:[`scattering`,`emission`],secondary:[`absorption`]},"opalescent-glass":{primary:[`scattering`],secondary:[`dielectric-interface`,`absorption`,`refraction`]}}},coverage:{"thin-film-interference":[`bismuth-oxide`,`holographic-foil`,`oil-slick`,`soap-film`],"multilayer-interference":[`butterfly-structural-color`,`labradorite`,`nacre`],"diffraction-grating":[`butterfly-structural-color`,`holographic-foil`],"fresnel-dielectric":[`caustic-water`,`nacre`,`oil-slick`,`opalescent-glass`,`soap-film`],"fresnel-conductor":[`bismuth-oxide`,`holographic-foil`,`molten-chrome`],"microfacet-scatter":[`bismuth-oxide`,`labradorite`,`molten-chrome`],"refraction-snell":[`caustic-water`,`opalescent-glass`],"caustic-transport":[`caustic-water`,`oil-slick`],"volume-scattering":[`cloud`,`nebula`,`opalescent-glass`],"volume-absorption":[`caustic-water`,`cloud`,`nebula`,`opalescent-glass`],"volume-emission":[`molten-chrome`,`nebula`],"view-dependent-weight":[`butterfly-structural-color`,`labradorite`,`molten-chrome`,`nacre`,`oil-slick`,`soap-film`],"spectral-integrate":[`bismuth-oxide`,`butterfly-structural-color`,`caustic-water`,`cloud`,`holographic-foil`,`labradorite`,`molten-chrome`,`nacre`,`nebula`,`oil-slick`,`opalescent-glass`,`soap-film`]},report:{passed:!0,generatedAt:`2026-09-01T05:00:47.450Z`,reuse:{"thin-film-interference":4,"multilayer-interference":3,"diffraction-grating":2,"fresnel-dielectric":5,"fresnel-conductor":3,"microfacet-scatter":3,"refraction-snell":2,"caustic-transport":2,"volume-scattering":3,"volume-absorption":4,"volume-emission":2,"view-dependent-weight":6,"spectral-integrate":12},criteria:{schemaValid:!0,noNamedEffectFlags:!0,allSpecimensPresent:!0,everyOperatorReused:!0,negativeControlRejected:!0,positiveControlAccepted:!0},findings:[{level:`info`,code:`positive-control`,message:`examples/valid/minimal-thin-film.json passed.`},{level:`info`,code:`negative-control`,message:`examples/invalid/named-effect.json was rejected as required.`},{level:`info`,code:`reuse`,message:`Every catalog operator is used by at least two specimens.`}]}},M=[`oil-slick`,`soap-film`,`nacre`,`labradorite`,`butterfly-structural-color`,`holographic-foil`,`bismuth-oxide`,`molten-chrome`,`caustic-water`,`cloud`,`nebula`,`opalescent-glass`];function N(e){return j.recipes.find(t=>t.id===e)??j.recipes[0]}var ce=`nacre-atelier-v2`;function le(){try{let e=localStorage.getItem(`nacre-atelier-v2`)??localStorage.getItem(`nacre-atelier-v1`);if(!e)return null;let t=JSON.parse(e);if(t.specimenId&&M.includes(t.specimenId))return t.specimenId}catch{}return null}function ue(e){try{localStorage.setItem(ce,JSON.stringify({specimenId:e}))}catch{}}var P=c((e,t)=>({specimenId:`nacre`,fuseId:`soap-film`,mode:`look`,look:{x:.18,y:.28},knobs:k(`nacre`),blend:.5,focusOperator:null,setSpecimen:n=>{ue(n),e({specimenId:n,fuseId:t().fuseId===n?n===`soap-film`?`oil-slick`:`soap-film`:t().fuseId,focusOperator:null,look:{x:.18,y:.28},knobs:k(n)})},setFuseId:t=>e({fuseId:t}),setMode:t=>e({mode:t}),setLook:(t,n)=>e({look:{x:t,y:n}}),setKnob:(n,r)=>e({knobs:{...t().knobs,[n]:r}}),setBlend:t=>e({blend:t}),setFocusOperator:t=>e({focusOperator:t}),resetKnobs:()=>e({knobs:k(t().specimenId),look:{x:.18,y:.28},blend:.5}),cycleSpecimen:e=>{let n=M[(M.indexOf(t().specimenId)+e+M.length)%M.length];t().setSpecimen(n)}}));function F(e,t){return e.parameters.find(e=>e.id===t)}function de(e,t){return e.fields.find(e=>e.id===t)}function I(e,t,n=0){if(!t)return n;if(t.param){let r=F(e,t.param);return r?typeof r.value==`number`?r.value:r.complex?r.complex.n:r.spectral?.samples.length?r.spectral.samples.reduce((e,t)=>e+t,0)/r.spectral.samples.length:r.enum===`mie`?2:r.enum===`rayleigh`?1:r.enum===`hg`?0:r.enum===`grazing`?1:r.enum===`retro`?2:r.enum===`specular`?3:r.enum===`fresnel`?0:n:n}if(t.field){let r=de(e,t.field);if(!r)return n;if(typeof r.source.value==`number`)return r.source.value;if(r.range)return(r.range[0]+r.range[1])/2}return n}function fe(e,t){return t?.param?F(e,t.param)?.complex?.k??0:0}var L=[`constant`,`fbm`,`worley`,`gradient`,`drainage`,`lamellar-tilt`,`surface-waves`,`anisotropic-orientation`,`spectral-peak`,`radial`];function R(e){if(!e)return 0;let t=L.indexOf(e);return t<0?1:t}function z(e,t,n){return(e[t]??[]).filter(e=>e!==n)}var B=`uThinFilm.uThick0.uThick1.uN0.uN1.uN2.uFilmGen.uFilmFreq.uMulti.uLayers.uTa.uTb.uNA.uNB.uOriGen.uGrating.uPeriod.uGroove.uOrders.uFDiel.uIorD.uFCond.uN.uK.uMicro.uRough.uAniso.uRefr.uEta.uCaustic.uCScale.uCGen.uCMix.uScatter.uDensity.uG.uPhase.uSigmaS.uSigmaA.uAbsorb.uDensGen.uEmit.uTemp.uEmitAmt.uViewExp.uViewLobe.uStage`.split(`.`);function V(e,t){return e.nodes.find(e=>e.operator===t)}function pe(e){let t=new Set(e.nodes.map(e=>e.operator)),n=t.has(`volume-scattering`),r=t.has(`thin-film-interference`),i=t.has(`multilayer-interference`),a=t.has(`caustic-transport`),o=t.has(`refraction-snell`),s=t.has(`fresnel-conductor`),c=t.has(`diffraction-grating`),l=t.has(`fresnel-dielectric`);return n&&(l||o)&&!r&&!i&&!c&&!s?1:n&&!r&&!i&&!c&&!s&&!l?2:a&&o&&!r?3:r&&a?5:r&&!s&&!c&&!i?4:1}function H(e){let t=V(e,`thin-film-interference`),n=V(e,`multilayer-interference`),r=V(e,`diffraction-grating`),i=V(e,`fresnel-dielectric`),a=V(e,`fresnel-conductor`),o=V(e,`microfacet-scatter`),s=V(e,`refraction-snell`),c=V(e,`caustic-transport`),l=V(e,`volume-scattering`),u=V(e,`volume-absorption`),d=V(e,`volume-emission`),f=V(e,`view-dependent-weight`),p=t?.bind.thickness?.field?e.fields.find(e=>e.id===t.bind.thickness.field):e.fields[0],m=n?.bind.orientation?.field?e.fields.find(e=>e.id===n.bind.orientation.field):void 0,h=o?.bind.roughness?.field?e.fields.find(e=>e.id===o.bind.roughness.field):void 0,g=c?.bind.displacement?.field?e.fields.find(e=>e.id===c.bind.displacement.field):void 0,_=l?.bind.density??u?.bind.density,v=_?.field?e.fields.find(e=>e.id===_.field):void 0,y=!!(t&&c);return{uThinFilm:+!!t,uThick0:p?.range?.[0]??80,uThick1:p?.range?.[1]??400,uN0:t?I(e,t.bind.nIncident,1):1,uN1:t?I(e,t.bind.nFilm,1.4):1.4,uN2:t?I(e,t.bind.nExit,1):1,uFilmGen:R(p?.source.generator),uFilmFreq:p?.source.frequency??1,uMulti:+!!n,uLayers:n?I(e,n.bind.layerCount,10):0,uTa:n?I(e,n.bind.thicknessA,90):90,uTb:n?I(e,n.bind.thicknessB,70):70,uNA:n?I(e,n.bind.nA,1.5):1.5,uNB:n?I(e,n.bind.nB,1):1,uOriGen:R(m?.source.generator??`lamellar-tilt`),uGrating:+!!r,uPeriod:r?I(e,r.bind.period,.8):.8,uGroove:r?I(e,r.bind.depth,140):140,uOrders:r?I(e,r.bind.orders,3):3,uFDiel:+!!i,uIorD:i?I(e,i.bind.ior,1.5):1.5,uFCond:+!!a,uN:a?I(e,a.bind.ior,2):2,uK:a?fe(e,a.bind.ior):0,uMicro:+!!o,uRough:o?h?.range?(h.range[0]+h.range[1])/2:I(e,o.bind.roughness,.2):.2,uAniso:o?I(e,o.bind.anisotropy,0):0,uRefr:+!!s,uEta:s?I(e,s.bind.iorInside,1.33):1.33,uCaustic:+!!c,uCScale:c?I(e,c.bind.focusScale,1):1,uCGen:R(g?.source.generator??`surface-waves`),uCMix:y?.16:1,uScatter:+!!l,uDensity:l?.7:u?.5:.4,uG:l?I(e,l.bind.g,.4):.4,uPhase:l?I(e,l.bind.phase,0):0,uSigmaS:l?I(e,l.bind.sigmaS,1):1,uSigmaA:u?I(e,u.bind.sigmaA,.1):0,uAbsorb:+!!u,uDensGen:R(v?.source.generator??`fbm`),uEmit:+!!d,uTemp:d?I(e,d.bind.temperature,0):0,uEmitAmt:+!!d,uViewExp:f?I(e,f.bind.exponent,2):0,uViewLobe:f?I(e,f.bind.lobe,0):0,uStage:pe(e)}}function me(e,t,n){let r={...e};for(let i of B){let a=e[i],o=t[i];if(i===`uFilmGen`||i===`uOriGen`||i===`uCGen`||i===`uDensGen`){r[i]=n<.5?a:o;continue}if(i===`uStage`){r[i]=n<.5?a:o;continue}r[i]=a*(1-n)+o*n}return r}var U=t(),he=[{id:`contract`,label:`Contract`},{id:`wgsl`,label:`WGSL`},{id:`hlsl`,label:`HLSL`},{id:`unity`,label:`Unity`},{id:`glsl`,label:`GLSL`}];function ge(){let e=P(e=>e.specimenId),t=P(e=>e.knobs),[n,r]=(0,u.useState)(`contract`),[a,s]=(0,u.useState)(null),[c,l]=(0,u.useState)(!1),d=(0,u.useMemo)(()=>{let n=N(e),r=A(H(n),e,t).uniforms;return ie(n,r)},[e,t]),f=d.find(e=>e.id===n)??d[0];(0,u.useEffect)(()=>{i().then(s)},[]);let p=async()=>{try{await navigator.clipboard.writeText(f.body),l(!0),window.setTimeout(()=>l(!1),1400)}catch{l(!1)}};return(0,U.jsxs)(`section`,{children:[(0,U.jsx)(`p`,{className:`font-mono text-2xs tracking-caps text-signal uppercase`,children:`Backends`}),(0,U.jsx)(`p`,{className:`mt-2 text-sm leading-normal text-muted text-pretty`,children:`The grammar is the IR. Lookdev runs GLSL on WebGL2. WebGPU takes WGSL. Unity URP takes HLSL. three.js / r3f consume the same uniform block on a closed graph — camera, fog, vertex table, particles. Nothing here is a named nacre shader, and optical stays a simulation.`}),(0,U.jsx)(_e,{caps:a}),(0,U.jsx)(`nav`,{className:`mt-3 flex flex-wrap gap-1`,"aria-label":`Backend files`,children:he.map(e=>(0,U.jsx)(`button`,{type:`button`,onClick:()=>r(e.id),className:o(`h-11 min-w-11 rounded-md px-3 text-sm transition-colors duration-150`,n===e.id?`bg-fg text-bg`:`bg-elevated text-fg hover:bg-elevated/80`),children:e.label},e.id))}),(0,U.jsx)(ve,{file:f,copied:c,onCopy:()=>void p(),onDownload:()=>ae(f)})]})}function _e({caps:e}){if(!e)return(0,U.jsx)(`p`,{className:`mt-3 font-mono text-2xs text-subtle`,children:`Probing this browser…`});let t=[[`WebGL2`,e.webgl2],[`WebGPU`,e.webgpu],[`three.js`,e.three],[`r3f`,e.r3f]];return(0,U.jsxs)(`ul`,{className:`mt-3 flex flex-wrap gap-2`,children:[t.map(([e,t])=>(0,U.jsxs)(`li`,{className:o(`rounded-sm px-2 py-1 font-mono text-2xs tracking-caps uppercase`,t?`bg-pass/15 text-pass`:`bg-elevated text-subtle`),children:[e,` `,t?`yes`:`no`]},e)),(0,U.jsx)(`li`,{className:`rounded-sm px-2 py-1 font-mono text-2xs text-muted`,children:e.adapter})]})}function ve({file:e,copied:t,onCopy:n,onDownload:i}){return(0,U.jsxs)(`div`,{className:`mt-3 rounded-md border border-border bg-surface p-3`,children:[(0,U.jsxs)(`div`,{className:`flex flex-wrap items-start justify-between gap-2`,children:[(0,U.jsxs)(`div`,{className:`min-w-0`,children:[(0,U.jsx)(`p`,{className:`font-mono text-2xs tracking-caps text-subtle uppercase`,children:e.runtime}),(0,U.jsx)(`p`,{className:`mt-1 font-mono text-xs text-fg`,children:e.filename}),(0,U.jsx)(`p`,{className:`mt-1 text-xs leading-normal text-muted`,children:e.note})]}),(0,U.jsxs)(`div`,{className:`flex gap-1`,children:[(0,U.jsx)(r,{size:`sm`,variant:`outline`,onClick:n,children:t?`Copied`:`Copy`}),(0,U.jsx)(r,{size:`sm`,variant:`solid`,onClick:i,children:`Download`})]})]}),(0,U.jsx)(`pre`,{className:`mt-3 max-h-64 overflow-auto rounded-sm bg-void p-3 font-mono text-2xs leading-relaxed text-fg`,children:e.body})]})}function W(e,t,n){let r=e.createShader(t);if(!r)return null;if(e.shaderSource(r,n),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS)){let t=e.getShaderInfoLog(r)??`compile failed`;return console.error(t),e.deleteShader(r),null}return r}function G(e,t,n){return e.getUniformLocation(t,n)}function ye(e,t,n,r,i,a,o,s){let c=(n,r)=>{let i=G(e,t,n);i&&e.uniform1f(i,r)},l=(n,r,i)=>{let a=G(e,t,n);a&&e.uniform2f(a,r,i)};l(`uRes`,a[0],a[1]),c(`uTime`,i),l(`uLook`,r.x,r.y),c(`uTimeScale`,o),c(`uWarp`,s),c(`uThickMul`,1),c(`uDensMul`,1),c(`uRoughMul`,1);for(let e of B)c(e,n[e])}function be({className:e}){let t=(0,u.useRef)(null),n=P(e=>e.specimenId),r=P(e=>e.fuseId),i=P(e=>e.mode),a=P(e=>e.setLook),s=N(n);(0,u.useEffect)(()=>{let e=t.current;if(!e)return;let n=e.getContext(`webgl2`,{antialias:!1,alpha:!1,powerPreference:`high-performance`});if(!n)return;let r=W(n,n.VERTEX_SHADER,d),i=W(n,n.FRAGMENT_SHADER,f);if(!r||!i)return;let a=n.createProgram();if(!a)return;if(n.attachShader(a,r),n.attachShader(a,i),n.linkProgram(a),!n.getProgramParameter(a,n.LINK_STATUS)){console.error(n.getProgramInfoLog(a));return}let o=n.createVertexArray();n.bindVertexArray(o);let s=n.createBuffer();n.bindBuffer(n.ARRAY_BUFFER,s),n.bufferData(n.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),n.STATIC_DRAW),n.enableVertexAttribArray(0),n.vertexAttribPointer(0,2,n.FLOAT,!1,0,0),n.useProgram(a);let c=0,l=performance.now(),u=window.matchMedia(`(prefers-reduced-motion: reduce)`).matches,p=()=>{let t=P.getState(),r=N(t.specimenId),i=Math.min(window.devicePixelRatio||1,2),s=Math.max(1,Math.floor(e.clientWidth*i)),d=Math.max(1,Math.floor(e.clientHeight*i));(e.width!==s||e.height!==d)&&(e.width=s,e.height=d),n.viewport(0,0,s,d),n.bindVertexArray(o),n.useProgram(a),n.clearColor(.02,.022,.028,1),n.clear(n.COLOR_BUFFER_BIT);try{let e=A(H(r),t.specimenId,t.knobs),i=t.mode===`fuse`?me(e.uniforms,H(N(t.fuseId)),t.blend):e.uniforms,o=u?0:e.timeScale;ye(n,a,i,t.look,(performance.now()-l)/1e3,[s,d],o,e.warp),n.drawArrays(n.TRIANGLES,0,3)}catch(e){console.error(e)}c=requestAnimationFrame(p)};return c=requestAnimationFrame(p),()=>{cancelAnimationFrame(c),n.deleteProgram(a),n.deleteShader(r),n.deleteShader(i),n.deleteBuffer(s),n.deleteVertexArray(o)}},[f]);let c=e=>{let t=e.currentTarget.getBoundingClientRect(),n=(e.clientX-t.left)/t.width*2-1,r=(e.clientY-t.top)/t.height*2-1;a(Math.max(-1,Math.min(1,n)),Math.max(-1,Math.min(1,-r)))},l=i===`fuse`?`Fusion of ${s.title} and ${N(r).title}`:`${s.title} evaluative sketch`;return(0,U.jsx)(`canvas`,{ref:t,className:o(`preview-canvas h-full w-full touch-none`,e),onPointerMove:c,onPointerDown:c,"aria-label":l})}var K={"oil-slick":{thesis:`A hydrocarbon film on water. Color is optical path, not pigment.`,composition:`Plan view of a spreading film over a disturbed dielectric.`,form:`Organic, fluid, no hard edge.`,material:`Hydrocarbon film, air above, water below.`,optics:`Two-interface interference, dielectric Fresnel, caustic transport.`,color:`Spectral bands that cycle with thickness. No hue slider.`,surface:`Viscous, wind-streaked. Optical path 80–900 nm.`,invariants:[`Airy two-interface`,`view-dependent color`,`caustics under film`],flexible:[`thickness range`,`wind frequency`]},"soap-film":{thesis:`The same two-interface operator as oil, with air on both sides.`,composition:`A hanging membrane. Drainage toward a black film at the top.`,form:`Thin, tensile, slightly curved.`,material:`Surfactant film in air.`,optics:`Thin-film interference plus dielectric Fresnel. No caustics.`,color:`Newton orders collapsing as thickness drains toward zero.`,surface:`Drainage field. Black film where path is a few nanometers.`,invariants:[`air / film / air stack`,`drainage toward black`],flexible:[`drainage rate`,`starting thickness`]},nacre:{thesis:`Pearl luster is a Bragg stack, not a pearl shader.`,composition:`Curved tablet surface, glancing light.`,form:`Lamellar, slightly brick-like, organic.`,material:`Aragonite tablets and protein sheets.`,optics:`Multilayer interference plus dielectric Fresnel envelope.`,color:`Warm orient that walks with angle. Compressed spectrum.`,surface:`Polished, low roughness, tablet-scale orientation field.`,invariants:[`bilayer optical thickness`,`angular flash`],flexible:[`layer count`,`protein fraction`]},labradorite:{thesis:`Labradorescence is nacre’s operator at lower contrast and tighter tilt.`,composition:`A cleaved feldspar face. Schiller in a narrow lobe.`,form:`Crystalline, planar, fractured.`,material:`Exsolution lamellae in plagioclase.`,optics:`Multilayer interference, microfacet scatter, view weight.`,color:`Blue-green flash against a dark body. Not a pigment.`,surface:`Cleavage polish. Tight orientation field.`,invariants:[`low IOR contrast`,`narrow angular lobe`],flexible:[`lamella period`,`polish`]},"butterfly-structural-color":{thesis:`Morpho blue is a multilayer plus a ridge grating. No blue pigment.`,composition:`Scale field, raked light, high angular selectivity.`,form:`Periodic ridges over a lamellar stack.`,material:`Chitin architecture.`,optics:`Bragg peak from the stack, spectral orders from the grating.`,color:`Saturated blue that collapses off-axis.`,surface:`Ridge period in the micrometer band.`,invariants:[`stack + grating composition`,`view-dependent collapse`],flexible:[`ridge period`,`layer count`]},"holographic-foil":{thesis:`No holographic flag. Grating orders on conductor Fresnel, lacquer film on top.`,composition:`Embossed sheet, grazing specular.`,form:`Mechanical, periodic, planar.`,material:`PET lacquer over aluminum.`,optics:`Diffraction grating, thin-film interference, conductor Fresnel.`,color:`Spectral orders walking with angle. Metal underneath.`,surface:`Embossed grooves. High specularity.`,invariants:[`grating equation`,`metal exit medium`],flexible:[`period`,`lacquer thickness`]},"bismuth-oxide":{thesis:`Hopper-crystal tarnish is a film on a conductor, not a rainbow texture.`,composition:`Stepped hopper geometry, oxide over metal.`,form:`Crystalline stairs, iridescent.`,material:`Bismuth metal with oxide film.`,optics:`Thin-film interference against conductor Fresnel.`,color:`Orders set by oxide thickness. Metal tint from (n, k).`,surface:`Hopper roughness. Microfacet scatter.`,invariants:[`film on conductor`,`thickness as color`],flexible:[`oxide range`,`hopper scale`]},"molten-chrome":{thesis:`Heat is volume emission. The metal is complex-IOR Fresnel.`,composition:`Convecting liquid body, hot core.`,form:`Fluid metal, anisotropic streaks.`,material:`Liquid chromium.`,optics:`Conductor Fresnel, microfacet scatter, blackbody emission.`,color:`Cool metal with thermal incandescence in the troughs.`,surface:`Convection-driven roughness. Anisotropic shear.`,invariants:[`complex IOR`,`emission independent of Fresnel`],flexible:[`temperature`,`shear`]},"caustic-water":{thesis:`Caustics are Snell plus a displacement field. Not a caustic texture.`,composition:`Looking through a dielectric surface onto focused light.`,form:`Liquid plane, refractive.`,material:`Water.`,optics:`Refraction, caustic transport, dielectric Fresnel, absorption.`,color:`White caustic network, red-preferring beer-law depth.`,surface:`Surface waves. No pigment.`,invariants:[`Snell + geometry`,`wavelength-dependent absorption`],flexible:[`wave frequency`,`focus scale`]},cloud:{thesis:`White is high albedo and a forward phase function, not a cloud shader.`,composition:`Participating medium against void.`,form:`Soft, billowing density field.`,material:`Water droplets in air.`,optics:`Mie volume scattering plus absorption.`,color:`Near-white. Silver lining from forward scatter.`,surface:`No surface. Density is the form.`,invariants:[`Mie / HG phase`,`density field`],flexible:[`density`,`asymmetry g`]},nebula:{thesis:`Same volume operators as cloud. Emission and dust make the difference.`,composition:`Low-density medium, embedded emission.`,form:`Filamentary, open, astronomical.`,material:`Dust and ionized gas.`,optics:`Volume scattering, absorption, spectral emission.`,color:`Line emission against dust-reddened scatter. Not a nebula LUT.`,surface:`None. Density and emission fields.`,invariants:[`shared volume operators with cloud`,`emission as a separate node`],flexible:[`emission mix`,`dust density`]},"opalescent-glass":{thesis:`Opalescence is Rayleigh scatter in a dielectric bulk, plus a glass boundary.`,composition:`Transmitted slab, cool scatter, warm transmission.`,form:`Solid dielectric, rounded.`,material:`Glass with nano-inclusions.`,optics:`Volume scattering, absorption, dielectric Fresnel, Snell.`,color:`Blue scatter / amber transmit. No opal preset.`,surface:`Polished glass Fresnel.`,invariants:[`Rayleigh λ⁻⁴ tint`,`boundary vs bulk`],flexible:[`inclusion density`,`slab thickness`]}};function q(e){return K[e.id]??{thesis:e.summary,composition:`Unspecified.`,form:`Unspecified.`,material:e.title,optics:e.nodes.map(e=>e.operator).join(`, `),color:`Unspecified.`,surface:`Unspecified.`,invariants:e.phenomena??[],flexible:[]}}function xe(e,t){let n=new Set(e),r=new Set(t),i=[...n].filter(e=>r.has(e)&&e!==`spectral-integrate`),a=J(n),o=J(r);return i.length>=2&&a===o?`conservative`:a===o||i.length>=1?`expressive`:`speculative`}function J(e){return e.has(`thin-film-interference`)||e.has(`multilayer-interference`)?`interference`:e.has(`diffraction-grating`)?`diffraction`:e.has(`volume-scattering`)?`volume`:e.has(`caustic-transport`)||e.has(`refraction-snell`)?`transport`:e.has(`fresnel-conductor`)?`conductor`:`other`}var Se=[{id:`look`,label:`Look`},{id:`fuse`,label:`Fuse`},{id:`proof`,label:`Proof`}];function Y(e){return e.replace(/-interference|-transport|-scatter|-weight|-integrate/g,``)}function Ce(){let e=P(e=>e.setSpecimen),t=P(e=>e.cycleSpecimen),n=P(e=>e.resetKnobs),r=P(e=>e.setMode),i=P(e=>e.mode);return(0,u.useEffect)(()=>{let t=le();t&&t!==P.getState().specimenId&&e(t)},[e]),(0,u.useEffect)(()=>{let i=i=>{let a=i.target;if(!(a&&[`INPUT`,`TEXTAREA`,`SELECT`].includes(a.tagName))){if(i.key===`ArrowDown`||i.key===`j`)i.preventDefault(),t(1);else if(i.key===`ArrowUp`||i.key===`k`)i.preventDefault(),t(-1);else if(i.key===`r`)n();else if(i.key===`l`)r(`look`);else if(i.key===`f`)r(`fuse`);else if(i.key===`p`)r(`proof`);else if(/^[1-9]$/.test(i.key)){let t=Number(i.key)-1;M[t]&&e(M[t])}else i.key===`0`?e(M[9]):i.key===`-`?e(M[10]):i.key===`=`&&e(M[11])}};return window.addEventListener(`keydown`,i),()=>window.removeEventListener(`keydown`,i)},[t,n,r,e]),(0,U.jsxs)(`div`,{className:`flex h-dvh min-h-0 flex-col overflow-hidden bg-bg text-fg`,children:[(0,U.jsx)(we,{}),(0,U.jsxs)(`div`,{className:`grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,26rem)]`,children:[(0,U.jsxs)(`section`,{className:`relative flex min-h-0 min-w-0 flex-col`,children:[(0,U.jsxs)(`div`,{className:`relative min-h-[42vh] flex-1 bg-void lg:min-h-0`,children:[(0,U.jsx)(be,{}),(0,U.jsx)(Te,{})]}),(0,U.jsx)(Ee,{})]}),(0,U.jsxs)(`aside`,{className:`min-h-0 overflow-y-auto border-t border-border bg-bg lg:border-t-0 lg:border-l`,children:[i===`look`&&(0,U.jsx)(X,{}),i===`fuse`&&(0,U.jsx)(Ae,{}),i===`proof`&&(0,U.jsx)(je,{})]})]})]})}function we(){let e=P(e=>e.mode),t=P(e=>e.setMode);return(0,U.jsxs)(`header`,{className:`identity-bar border-b border-border bg-surface`,children:[(0,U.jsxs)(`div`,{className:`flex flex-wrap items-center gap-3 px-4 py-3 md:px-5`,children:[(0,U.jsxs)(`div`,{className:`min-w-0 flex-1`,children:[(0,U.jsx)(a,{size:`sm`}),(0,U.jsx)(`p`,{className:`mt-1 font-mono text-2xs tracking-caps text-muted uppercase`,children:`Lookdev · Shader Grammar v0.1`})]}),(0,U.jsx)(l,{active:`lookdev`}),(0,U.jsx)(`nav`,{className:`flex rounded-md border border-border p-0.5`,"aria-label":`Studio mode`,children:Se.map(n=>(0,U.jsx)(`button`,{type:`button`,onClick:()=>t(n.id),className:o(`h-11 min-w-16 rounded-sm px-3 text-sm font-medium transition-colors duration-150 ease-out`,e===n.id?`bg-fg text-bg`:`text-muted hover:text-fg`),children:n.label},n.id))}),(0,U.jsxs)(`div`,{className:o(`rounded-sm px-2.5 py-1 font-mono text-2xs tracking-caps uppercase`,j.report.passed?`bg-pass/15 text-pass`:`bg-danger/15 text-danger`),children:[(0,U.jsx)(`span`,{className:`sm:hidden`,children:j.report.passed?`pass`:`fail`}),(0,U.jsx)(`span`,{className:`hidden sm:inline`,children:j.report.passed?`validation pass`:`validation fail`})]}),(0,U.jsx)(r,{asChild:!0,variant:`solid`,size:`sm`,children:(0,U.jsx)(`a`,{href:`/shader-grammar-v0.1.zip`,download:!0,children:`ZIP`})})]}),(0,U.jsxs)(`p`,{className:`border-t border-border px-4 py-2 text-xs leading-relaxed text-muted md:px-5`,children:[(0,U.jsx)(`span`,{className:`sm:hidden`,children:`Lookdev. Twelve specimens, shared operators, physical knobs.`}),(0,U.jsx)(`span`,{className:`hidden sm:inline`,children:`Nacre Atelier is lookdev for twelve specimens described by shared optical operators — not named-effect flags. Knobs write physical quantities with units. Drag the canvas to change view.`})]})]})}function Te(){let e=P(e=>e.specimenId),t=P(e=>e.fuseId),n=P(e=>e.mode),r=P(e=>e.blend),i=N(e),a=N(t),o=q(i),s=i.nodes.map(e=>e.operator).filter(e=>e!==`spectral-integrate`);return(0,U.jsxs)(`div`,{className:`pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 md:p-5`,children:[(0,U.jsxs)(`div`,{className:`max-w-xl rounded-md bg-bg/75 px-3 py-2`,children:[(0,U.jsx)(`p`,{className:`font-mono text-2xs tracking-caps text-muted uppercase`,children:n===`fuse`?`Hybrid recipe`:`Living specimen`}),(0,U.jsx)(`h2`,{className:`font-display text-2xl leading-tight tracking-display md:text-3xl`,children:n===`fuse`?`${i.title} × ${a.title}`:i.title}),(0,U.jsx)(`p`,{className:`mt-1 text-sm leading-normal text-muted text-pretty`,children:n===`fuse`?`Blend ${Math.round((1-r)*100)} / ${Math.round(r*100)}. Same shader. Operator weights only.`:o.thesis})]}),(0,U.jsxs)(`p`,{className:`hidden rounded-sm bg-bg/70 px-2 py-1 font-mono text-2xs text-muted sm:block`,children:[`Drag to change view · `,s.length,` operators`]})]})}function Ee(){let e=P(e=>e.specimenId),t=P(e=>e.setSpecimen),n=P(e=>e.focusOperator),r=j.coverage;return(0,U.jsxs)(`div`,{className:`border-t border-border bg-surface`,children:[(0,U.jsx)(`p`,{className:`sr-only`,children:`Twelve specimens`}),(0,U.jsx)(`ul`,{className:`specimen-rail`,children:M.map((i,a)=>{let s=N(i),c=i===e,l=!n||(r[n]??[]).includes(i);return(0,U.jsx)(`li`,{className:`shrink-0`,children:(0,U.jsxs)(`button`,{type:`button`,onClick:()=>t(i),className:o(`flex h-11 min-w-11 items-center gap-2 whitespace-nowrap rounded-md px-3 text-left transition-colors duration-150 ease-out`,c?`bg-fg text-bg`:l?`text-fg hover:bg-elevated`:`text-subtle hover:text-muted`),children:[(0,U.jsx)(`span`,{className:`font-mono text-2xs tabular-nums opacity-70`,children:String(a+1).padStart(2,`0`)}),(0,U.jsx)(`span`,{className:`text-sm`,children:s.title})]})},i)})})]})}function X(){let e=P(e=>e.specimenId),t=N(e),n=K[e]??q(t),r=P(e=>e.resetKnobs),i=O(e);return(0,U.jsxs)(`div`,{className:`space-y-6 px-4 py-5 md:px-5`,children:[(0,U.jsxs)(`section`,{children:[(0,U.jsx)(`p`,{className:`font-mono text-2xs tracking-caps text-muted uppercase`,children:`Fingerprint`}),(0,U.jsxs)(`dl`,{className:`mt-3 space-y-3`,children:[(0,U.jsx)(Q,{label:`Optics`,value:n.optics}),(0,U.jsx)(Q,{label:`Color`,value:n.color}),(0,U.jsx)(Q,{label:`Surface`,value:n.surface}),(0,U.jsx)(Q,{label:`Form`,value:n.form})]}),(0,U.jsxs)(`div`,{className:`mt-4`,children:[(0,U.jsx)(`p`,{className:`font-mono text-2xs tracking-caps text-muted uppercase`,children:`Must survive`}),(0,U.jsx)(`ul`,{className:`mt-2 flex flex-wrap gap-1.5`,children:n.invariants.map(e=>(0,U.jsx)(`li`,{className:`rounded-sm bg-elevated px-2 py-1 text-xs text-fg`,children:e},e))})]})]}),(0,U.jsx)(De,{}),(0,U.jsxs)(`section`,{children:[(0,U.jsxs)(`div`,{className:`mb-3 flex items-center justify-between`,children:[(0,U.jsx)(`p`,{className:`font-mono text-2xs tracking-caps text-muted uppercase`,children:`Physical knobs`}),(0,U.jsx)(`button`,{type:`button`,onClick:r,className:`h-11 px-2 text-xs text-muted hover:text-fg`,children:`Reset`})]}),(0,U.jsxs)(`p`,{className:`mb-3 text-xs leading-normal text-subtle`,children:[i.equation,`. Each slider writes a uniform with units.`]}),(0,U.jsx)(`div`,{className:`space-y-4`,children:i.knobs.map(e=>(0,U.jsx)(Oe,{id:e.id,label:e.label,unit:e.unit,min:e.min,max:e.max,step:e.step,mapsTo:e.mapsTo},e.id))})]}),(0,U.jsx)(ke,{recipeId:e}),(0,U.jsx)(`p`,{className:`text-sm leading-normal text-muted text-pretty`,children:t.summary})]})}function De(){let e=P(e=>e.specimenId),t=P(e=>e.knobs),n=P(e=>e.look),r=A(H(N(e)),e,t).uniforms,i=O(e).live(r,n);return(0,U.jsxs)(`section`,{className:`rounded-md border border-border bg-surface p-3`,children:[(0,U.jsx)(`p`,{className:`font-mono text-2xs tracking-caps text-signal uppercase`,children:`Live equation`}),(0,U.jsx)(`dl`,{className:`mt-2 space-y-1.5`,children:i.map(e=>(0,U.jsxs)(`div`,{className:`grid grid-cols-[7.5rem_minmax(0,1fr)] gap-2`,children:[(0,U.jsx)(`dt`,{className:`font-mono text-2xs text-subtle`,children:e.label}),(0,U.jsx)(`dd`,{className:`font-mono text-2xs text-fg text-pretty`,children:e.value})]},e.label))}),(0,U.jsx)(`p`,{className:`mt-2 text-2xs leading-normal text-subtle`,children:`Evaluative sketch. Polarization and tabulated metal IOR are not in v0.1. Drag the sphere to change cosθ.`})]})}function Z(e){let[t,n]=(0,u.useState)(!1);return(0,u.useEffect)(()=>n(!0),[]),t?(0,U.jsx)(s,{...e}):(0,U.jsx)(`div`,{className:`h-11`})}function Q({label:e,value:t}){return(0,U.jsxs)(`div`,{children:[(0,U.jsx)(`dt`,{className:`font-mono text-2xs tracking-caps text-subtle uppercase`,children:e}),(0,U.jsx)(`dd`,{className:`mt-1 text-sm leading-normal text-fg text-pretty`,children:t})]})}function Oe({id:e,label:t,unit:n,min:r,max:i,step:a,mapsTo:o}){let s=P(t=>t.knobs[e]??r),c=P(e=>e.setKnob),l=a<.01?3:a<.1?2:+(a<1);return(0,U.jsxs)(`label`,{className:`block`,children:[(0,U.jsxs)(`span`,{className:`mb-1 flex items-center justify-between gap-3`,children:[(0,U.jsx)(`span`,{className:`text-sm text-fg`,children:t}),(0,U.jsxs)(`span`,{className:`font-mono text-2xs tabular-nums text-muted`,children:[s.toFixed(l),` `,n]})]}),(0,U.jsx)(Z,{min:r,max:i,step:a,value:[s],onValueChange:t=>c(e,t[0]??r)}),(0,U.jsx)(`span`,{className:`mt-1 block text-xs leading-normal text-subtle`,children:o})]})}function ke({recipeId:e}){let t=N(e),n=P(e=>e.focusOperator),r=P(e=>e.setFocusOperator),i=t.nodes.map(e=>e.operator).filter(e=>e!==`spectral-integrate`);return(0,U.jsxs)(`section`,{children:[(0,U.jsx)(`p`,{className:`font-mono text-2xs tracking-caps text-muted uppercase`,children:`Bound operators`}),(0,U.jsx)(`p`,{className:`mt-1 text-xs leading-normal text-subtle`,children:`Click an operator to light every specimen that shares it. That is the generalization test.`}),(0,U.jsx)(`ul`,{className:`mt-3 space-y-2`,children:i.map(t=>{let i=z(j.coverage,t,e),a=n===t;return(0,U.jsx)(`li`,{children:(0,U.jsxs)(`button`,{type:`button`,onClick:()=>r(a?null:t),className:o(`w-full rounded-md border px-3 py-3 text-left transition-colors duration-150 ease-out`,a?`border-fg bg-elevated`:`border-border bg-surface hover:bg-elevated`),children:[(0,U.jsxs)(`span`,{className:`flex items-baseline justify-between gap-3`,children:[(0,U.jsx)(`span`,{className:`text-sm text-fg`,children:Y(t)}),(0,U.jsxs)(`span`,{className:`font-mono text-2xs tabular-nums text-subtle`,children:[j.report.reuse[t]??0,`×`]})]}),i.length>0?(0,U.jsxs)(`span`,{className:`mt-1 block text-xs leading-normal text-muted`,children:[`Shared with `,i.map(e=>N(e).title).join(`, `)]}):null]})},t)})})]})}function Ae(){let e=P(e=>e.specimenId),t=P(e=>e.fuseId),n=P(e=>e.setFuseId),r=P(e=>e.blend),i=P(e=>e.setBlend),a=N(e),s=N(t),c=a.nodes.map(e=>e.operator),l=s.nodes.map(e=>e.operator),u=xe(c,l),d=u===`conservative`?`Conservative — same family, shared operators`:u===`expressive`?`Expressive — overlapping mechanisms`:`Speculative — distant families`;return(0,U.jsxs)(`div`,{className:`space-y-6 px-4 py-5 md:px-5`,children:[(0,U.jsxs)(`section`,{children:[(0,U.jsx)(`p`,{className:`font-mono text-2xs tracking-caps text-muted uppercase`,children:`Controlled fusion`}),(0,U.jsxs)(`p`,{className:`mt-2 text-sm leading-normal text-muted text-pretty`,children:[a.title,` supplies one recipe. `,s.title,` supplies the other. The canvas is a single shader mixing operator weights. No named hybrid.`]}),(0,U.jsx)(`p`,{className:`mt-3 rounded-md border border-border bg-elevated px-3 py-2 text-sm text-fg`,children:d})]}),(0,U.jsxs)(`label`,{className:`block`,children:[(0,U.jsxs)(`span`,{className:`mb-2 flex items-center justify-between text-sm`,children:[(0,U.jsx)(`span`,{children:a.title}),(0,U.jsx)(`span`,{children:s.title})]}),(0,U.jsx)(Z,{min:0,max:1,step:.01,value:[r],onValueChange:e=>i(e[0]??.5)})]}),(0,U.jsxs)(`section`,{children:[(0,U.jsx)(`p`,{className:`font-mono text-2xs tracking-caps text-muted uppercase`,children:`Fuse with`}),(0,U.jsx)(`ul`,{className:`mt-2 grid grid-cols-2 gap-1.5`,children:M.filter(t=>t!==e).map(e=>(0,U.jsx)(`li`,{children:(0,U.jsx)(`button`,{type:`button`,onClick:()=>n(e),className:o(`h-11 w-full rounded-md px-3 text-left text-sm transition-colors duration-150 ease-out`,e===t?`bg-fg text-bg`:`bg-elevated text-fg hover:bg-elevated/80`),children:N(e).title})},e))})]}),(0,U.jsxs)(`section`,{className:`grid grid-cols-2 gap-3`,children:[(0,U.jsx)($,{title:a.title,ops:c}),(0,U.jsx)($,{title:s.title,ops:l})]})]})}function $({title:e,ops:t}){return(0,U.jsxs)(`div`,{children:[(0,U.jsxs)(`p`,{className:`font-mono text-2xs tracking-caps text-muted uppercase`,children:[e,` supplies`]}),(0,U.jsx)(`ul`,{className:`mt-2 space-y-1`,children:t.filter(e=>e!==`spectral-integrate`).map(e=>(0,U.jsx)(`li`,{className:`font-mono text-2xs text-fg`,children:Y(e)},e))})]})}function je(){let e=P(e=>e.specimenId),t=P(e=>e.setSpecimen),n=P(e=>e.focusOperator),r=P(e=>e.setFocusOperator),i=j.report.criteria,a=[[`Schemas valid`,i.schemaValid],[`No named-effect flags`,i.noNamedEffectFlags],[`All 12 specimens`,i.allSpecimensPresent],[`Every operator reused`,i.everyOperatorReused],[`Negative control rejected`,i.negativeControlRejected],[`Positive control accepted`,i.positiveControlAccepted]];return(0,U.jsxs)(`div`,{className:`space-y-6 px-4 py-5 md:px-5`,children:[(0,U.jsxs)(`section`,{children:[(0,U.jsx)(`p`,{className:`font-mono text-2xs tracking-caps text-muted uppercase`,children:`Why this exists`}),(0,U.jsx)(`p`,{className:`mt-2 text-sm leading-normal text-muted text-pretty`,children:`Shader packs accumulate named looks. This grammar refuses that. Oil slick and soap film share thin-film interference. Nacre, labradorite, and butterfly share a multilayer. Cloud, nebula, and opalescent glass share volume scattering. If those twelve can be described without a one-off per material, the ontology is beginning to generalize.`})]}),(0,U.jsx)(ge,{}),(0,U.jsxs)(`section`,{children:[(0,U.jsx)(`p`,{className:`font-mono text-2xs tracking-caps text-muted uppercase`,children:`Acceptance gates`}),(0,U.jsx)(`ul`,{className:`mt-3 space-y-2`,children:a.map(([e,t])=>(0,U.jsxs)(`li`,{className:`flex items-center justify-between gap-3 rounded-md border border-border bg-surface px-3 py-2`,children:[(0,U.jsx)(`span`,{className:`text-sm`,children:e}),(0,U.jsx)(`span`,{className:o(`font-mono text-2xs tracking-caps uppercase`,t?`text-pass`:`text-danger`),children:t?`pass`:`fail`})]},e))})]}),(0,U.jsxs)(`section`,{children:[(0,U.jsx)(`p`,{className:`font-mono text-2xs tracking-caps text-muted uppercase`,children:`Coverage`}),(0,U.jsx)(`p`,{className:`mt-1 text-xs leading-normal text-subtle`,children:`Click an operator header to highlight its specimens. Click a row to load it.`}),(0,U.jsx)(`div`,{className:`mt-3 overflow-x-auto`,children:(0,U.jsxs)(`table`,{className:`w-full border-collapse text-left`,children:[(0,U.jsx)(`thead`,{children:(0,U.jsxs)(`tr`,{className:`border-b border-border`,children:[(0,U.jsx)(`th`,{className:`py-2 pr-2 font-mono text-2xs font-medium tracking-caps text-muted uppercase`,children:`Specimen`}),j.operators.filter(e=>e.id!==`spectral-integrate`).map(e=>(0,U.jsx)(`th`,{className:`px-0.5 py-2 text-center`,children:(0,U.jsx)(`button`,{type:`button`,title:e.id,onClick:()=>r(n===e.id?null:e.id),className:o(`size-7 rounded-sm font-mono text-2xs`,n===e.id?`bg-fg text-bg`:`text-subtle hover:text-fg`),children:e.id.split(`-`).map(e=>e[0]).join(``)})},e.id))]})}),(0,U.jsx)(`tbody`,{children:M.map(r=>(0,U.jsxs)(`tr`,{className:o(`cursor-pointer border-b border-border`,r===e?`bg-elevated`:`hover:bg-surface`),onClick:()=>t(r),children:[(0,U.jsx)(`th`,{className:`py-2 pr-2 text-sm font-medium text-fg`,children:N(r).title}),j.operators.filter(e=>e.id!==`spectral-integrate`).map(e=>{let t=(j.coverage[e.id]??[]).includes(r),i=n===e.id;return(0,U.jsx)(`td`,{className:`px-0.5 py-2 text-center`,children:(0,U.jsx)(`span`,{className:o(`inline-block size-2 rounded-full`,t?i?`bg-accent`:`bg-fg`:`bg-elevated`)})},e.id)})]},r))})]})})]}),(0,U.jsxs)(`section`,{children:[(0,U.jsx)(`p`,{className:`font-mono text-2xs tracking-caps text-muted uppercase`,children:`Where it is weak`}),(0,U.jsx)(`p`,{className:`mt-2 text-sm leading-normal text-muted text-pretty`,children:`This canvas is an evaluative sketch driven by operator weights. Polarization, 3D photonic crystals, inelastic scatter, BSSRDF, and full spectral metal IOR are not in v0.1.`})]})]})}function Me(){return(0,U.jsx)(Ce,{})}export{Me as component};