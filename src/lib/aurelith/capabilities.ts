export type RendererCaps = {
  webgl2: boolean;
  webgpu: boolean;
  adapter: string;
  three: boolean;
  r3f: boolean;
  probedAt: number;
};

type GpuAdapterLike = {
  info?: { device?: string; description?: string };
};

type GpuNav = Navigator & {
  gpu?: { requestAdapter: () => Promise<GpuAdapterLike | null> };
};

const empty = (): RendererCaps => ({
  webgl2: false,
  webgpu: false,
  adapter: "not probed",
  three: false,
  r3f: false,
  probedAt: 0,
});

export async function probeRenderers(): Promise<RendererCaps> {
  const caps = empty();
  caps.probedAt = Date.now();
  try {
    const c = document.createElement("canvas");
    caps.webgl2 = !!c.getContext("webgl2");
  } catch {
    caps.webgl2 = false;
  }
  try {
    const gpu = (navigator as GpuNav).gpu;
    if (gpu?.requestAdapter) {
      const adapter = await gpu.requestAdapter();
      caps.webgpu = !!adapter;
      caps.adapter = adapter?.info?.device || adapter?.info?.description || (adapter ? "adapter present" : "no adapter");
    } else {
      caps.adapter = "navigator.gpu missing";
    }
  } catch {
    caps.webgpu = false;
    caps.adapter = "requestAdapter failed";
  }
  try {
    await import("three");
    caps.three = true;
  } catch {
    caps.three = false;
  }
  try {
    await import("@react-three/fiber");
    caps.r3f = true;
  } catch {
    caps.r3f = false;
  }
  return caps;
}
