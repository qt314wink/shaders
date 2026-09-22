export const VERT = `#version 300 es
precision highp float;
layout(location=0) in vec2 aPos;
out vec2 vUv;
void main(){
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

export const FRAG = `#version 300 es
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
