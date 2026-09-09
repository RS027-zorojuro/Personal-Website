/**
 * Device / renderer capability detection.
 *
 * Single source of truth — worlds must not re-implement these checks.
 * Everything is computed once and cached; these values do not change
 * within a page session.
 */

let _webgl = null;

/** True if a WebGL context can actually be created (not just declared). */
export function hasWebGL() {
  if (_webgl !== null) return _webgl;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    _webgl = Boolean(gl);
    // Release the probe context immediately — browsers cap concurrent contexts.
    if (gl) {
      const lose = gl.getExtension("WEBGL_lose_context");
      if (lose) lose.loseContext();
    }
  } catch {
    _webgl = false;
  }
  return _webgl;
}

/** Coarse pointer / small viewport — used to scale render cost down. */
export function isHandheld() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 760
  );
}

/** Honours the OS reduced-motion setting. Read at call time, not cached. */
export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Device pixel ratio ceiling for 3D. Handhelds and low-core machines get
 * less, so a heavy model does not melt an integrated GPU.
 */
export function renderDpr() {
  if (typeof window === "undefined") return 1;
  const cores = navigator.hardwareConcurrency || 4;
  if (isHandheld()) return [1, 1.25];
  if (cores <= 4) return [1, 1.25];
  return [1, 1.75];
}
