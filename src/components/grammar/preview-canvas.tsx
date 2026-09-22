import { useEffect, useRef } from "react";
import { applyPhysicalKnobs } from "@/lib/grammar/knobs";
import { FRAG, VERT } from "@/lib/grammar/preview-shader";
import { recipeById, useGrammar } from "@/lib/grammar/store";
import { mixUniforms, uniformsFromRecipe, UNIFORM_KEYS, type PreviewUniforms } from "@/lib/grammar/uniforms";
import { cn } from "@/lib/utils";

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
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

function loc(gl: WebGL2RenderingContext, prog: WebGLProgram, name: string) {
  return gl.getUniformLocation(prog, name);
}

function bindUniforms(
  gl: WebGL2RenderingContext,
  prog: WebGLProgram,
  u: PreviewUniforms,
  look: { x: number; y: number },
  time: number,
  res: [number, number],
  timeScale: number,
  warp: number,
) {
  const set1 = (name: string, v: number) => {
    const l = loc(gl, prog, name);
    if (l) gl.uniform1f(l, v);
  };
  const set2 = (name: string, a: number, b: number) => {
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
  for (const key of UNIFORM_KEYS) {
    set1(key, u[key]);
  }
}

export function PreviewCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const specimenId = useGrammar((s) => s.specimenId);
  const fuseId = useGrammar((s) => s.fuseId);
  const mode = useGrammar((s) => s.mode);
  const setLook = useGrammar((s) => s.setLook);
  const recipe = recipeById(specimenId);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { antialias: false, alpha: false, powerPreference: "high-performance" });
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
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
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
      gl.clearColor(0.02, 0.022, 0.028, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      try {
        const a0 = uniformsFromRecipe(rec);
        const a = applyPhysicalKnobs(a0, state.specimenId, state.knobs);
        const u =
          state.mode === "fuse"
            ? mixUniforms(a.uniforms, uniformsFromRecipe(recipeById(state.fuseId)), state.blend)
            : a.uniforms;
        const timeScale = reduceMotion ? 0 : a.timeScale;
        bindUniforms(gl, prog, u, state.look, (performance.now() - start) / 1000, [w, h], timeScale, a.warp);
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

  const onPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setLook(Math.max(-1, Math.min(1, x)), Math.max(-1, Math.min(1, -y)));
  };

  const label =
    mode === "fuse"
      ? `Fusion of ${recipe.title} and ${recipeById(fuseId).title}`
      : `${recipe.title} evaluative sketch`;

  return (
    <canvas
      ref={canvasRef}
      className={cn("preview-canvas h-full w-full touch-none", className)}
      onPointerMove={onPointer}
      onPointerDown={onPointer}
      aria-label={label}
    />
  );
}
