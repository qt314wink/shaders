import { FRAG, VERT } from "./preview-shader";
import type { Recipe } from "./types";
import type { PreviewUniforms } from "./uniforms";

export type BackendId = "glsl" | "wgsl" | "hlsl" | "unity" | "contract";

export type BackendFile = {
  id: BackendId;
  title: string;
  filename: string;
  mime: string;
  runtime: string;
  note: string;
  body: string;
};

function slug(recipe: Recipe) {
  return recipe.id.replace(/[^a-z0-9-]/g, "-");
}

function shaderName(recipe: Recipe) {
  return recipe.title.replace(/[^A-Za-z0-9]+/g, "");
}

function uniformBlock(u: PreviewUniforms): string {
  return (Object.keys(u) as (keyof PreviewUniforms)[])
    .map((k) => `  ${k}: ${Number(u[k]).toFixed(4)}`)
    .join("\n");
}

function opsList(recipe: Recipe) {
  return recipe.nodes.map((n) => n.operator).filter((o) => o !== "spectral-integrate");
}

const KERNEL_DOC = `Operator kernels — Shader Grammar v0.1
The live lookdev canvas is GLSL ES 3.00 / WebGL2. These files are the SAME
operators (Airy film, Bragg orders m=1..6, grating as modulation when stacked
with Bragg, HG phase, conductor Fresnel). They are not a bit-identical decompile
of the sketch, so they will not pixel-match. Bind the uniform block. Do not add
a named-effect flag (oilSlick, pearlescent, holographic).

Optical is simulation-only. Do not drive a laser, beam, or haptic from this.`;

const BRAGG_GLSL = `// λ_m = 2 Λ cosθ / m, Λ = nA tA + nB tB. Sample m = 1..6 in the visible.`;

function hlslKernels(u: PreviewUniforms) {
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

function wgslKernels(u: PreviewUniforms) {
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

function unityShader(recipe: Recipe, u: PreviewUniforms) {
  const name = shaderName(recipe);
  return `Shader "AURELITH/Grammar/${name}"
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

function unityBinder(recipe: Recipe) {
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

function contractJson(recipe: Recipe, u: PreviewUniforms) {
  return JSON.stringify(
    {
      schema: "aurelith.grammar.backend.v1",
      recipe: recipe.id,
      title: recipe.title,
      operators: opsList(recipe),
      optical: "simulation-only",
      runtimes: {
        lookdev: "GLSL ES 3.00 / WebGL2 (live canvas)",
        webgpu: "WGSL fragment, same uniform block",
        unity: `URP shader AURELITH/Grammar/${shaderName(recipe)}`,
        three: "r3f / three.js ShaderMaterial using the GLSL kernels. Closed graph only.",
      },
      uniforms: u,
      equations: {
        film: "2 n d cosθ = m λ",
        bragg: "λ_m = 2 (nA tA + nB tB) cosθ / m",
        grating: "d sinθ = m λ (modulates Bragg when both bound)",
        hg: "p(μ) = (1 - g²) / (1 + g² - 2 g μ)^{3/2}",
      },
      r3fGraph: [
        "PerspectiveCamera — depth macro → z",
        "FogExp2 — atmosphere macro → density",
        "Points — closed vertex table (bloom 16 / lattice 49 / coil 96 / gate 24 / vesica 64)",
        "LineLoop — same table",
        "Points — particle budget from quality tier",
        "No GLTF, no unbounded scene graph, no physical beam",
      ],
      warnings: [
        "Do not add named-effect flags.",
        "Do not drive a laser, haptic, or health device.",
        "Kernels will not pixel-match the lookdev sketch.",
      ],
    },
    null,
    2,
  );
}

function glslFile(recipe: Recipe, u: PreviewUniforms) {
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

function wgslFile(recipe: Recipe, u: PreviewUniforms) {
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

export function emitBackends(recipe: Recipe, uniforms: PreviewUniforms): BackendFile[] {
  const id = slug(recipe);
  return [
    {
      id: "glsl",
      title: "GLSL ES 3.00",
      filename: `${id}.lookdev.glsl`,
      mime: "text/plain",
      runtime: "Lookdev canvas · WebGL2",
      note: "This is the live backend. The canvas compiles this source.",
      body: glslFile(recipe, uniforms),
    },
    {
      id: "wgsl",
      title: "WGSL",
      filename: `${id}.frag.wgsl`,
      mime: "text/plain",
      runtime: "WebGPU (navigator.gpu)",
      note: "Same operators. Wire bind group 0 when a WebGPU path is present. Lookdev does not switch until that path is proven.",
      body: wgslFile(recipe, uniforms),
    },
    {
      id: "hlsl",
      title: "HLSL kernels",
      filename: `${id}.grammar.hlsl`,
      mime: "text/plain",
      runtime: "Unity URP / DX12 / HDRP custom pass",
      note: "Operator kernels plus the captured uniform block. Not a named nacre shader.",
      body: hlslKernels(uniforms),
    },
    {
      id: "unity",
      title: "Unity URP shader",
      filename: `${shaderName(recipe)}Grammar.shader`,
      mime: "text/plain",
      runtime: "Unity 6 / URP · shader AURELITH/Grammar/" + shaderName(recipe),
      note: "Assign to a mesh. Pair with AurelithGrammarBinder.cs. Optical stays a simulation.",
      body: unityShader(recipe, uniforms) + "\n\n/* ---- binder ---- */\n\n" + unityBinder(recipe),
    },
    {
      id: "contract",
      title: "Backend contract",
      filename: `${id}.backend.json`,
      mime: "application/json",
      runtime: "three.js / r3f / Unity / WebGPU",
      note: "Uniform block, equations, and the closed r3f graph. This is the IR handoff.",
      body: contractJson(recipe, uniforms),
    },
  ];
}

export function downloadBackend(file: BackendFile) {
  const blob = new Blob([file.body], { type: file.mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.filename;
  a.click();
  URL.revokeObjectURL(url);
}
