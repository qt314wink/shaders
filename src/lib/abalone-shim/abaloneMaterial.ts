// R3F/three ShaderMaterial shim over MelodicBloom camera-basis abalone (scaffold, not routed yet).
// No new deps: three ^0.186 + @react-three/fiber ^9.7 already present.
import * as THREE from "three";
import fragBody from "./abalone.mb.glsl?raw";

const vert = /* glsl */ `
out vec2 v_uv;
void main() { v_uv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

// three injects #version 300 es for GLSL3; MB declares `out vec4 outColor`, which three's GLSL3 path accepts.
export function createAbaloneMaterial() {
  return new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    vertexShader: vert,
    fragmentShader: fragBody.replace(/^\/\/ VENDORED.*\n/, ""),
    uniforms: {
      u_resolution: { value: new THREE.Vector2(1, 1) },
      u_mouse: { value: new THREE.Vector2() },
      u_time: { value: 0 },
      cameraOrbit: { value: new THREE.Vector3(0, 0, 3) },
      lightDirection: { value: new THREE.Vector3(0.4, 0.7, 0.6) },
      grain: { value: 0.5 }, layerSpacing: { value: 0.5 }, paletteShift: { value: 0 },
      spectral: { value: 0.7 }, fireStrength: { value: 0.6 }, roughness: { value: 0.3 },
      // camera-basis contract (camera right/up/forward), fed each frame
      u_camRight: { value: new THREE.Vector3(1, 0, 0) },
      u_camUp: { value: new THREE.Vector3(0, 1, 0) },
      u_camForward: { value: new THREE.Vector3(0, 0, -1) },
    },
  });
}

/** Call from useFrame: keeps lights camera-relative so the reverse side does not go dark. */
export function syncCameraBasis(mat: THREE.ShaderMaterial, camera: THREE.Camera, t: number) {
  const e = camera.matrixWorld.elements;
  mat.uniforms.u_camRight.value.set(e[0], e[1], e[2]).normalize();
  mat.uniforms.u_camUp.value.set(e[4], e[5], e[6]).normalize();
  mat.uniforms.u_camForward.value.set(-e[8], -e[9], -e[10]).normalize();
  mat.uniforms.cameraOrbit.value.copy(camera.position);
  mat.uniforms.u_time.value = t;
}
