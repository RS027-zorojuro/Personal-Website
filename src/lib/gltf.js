/**
 * GLTF resource lifecycle.
 *
 * The vehicles in the garage are 6–15 MB each. React Three Fiber does not
 * dispose objects handed to it through <primitive> — it does not own them —
 * and drei's loader cache holds them forever, so without this module every
 * car a visitor looks at stays on the GPU for the rest of the session.
 *
 * Two things make naive disposal wrong, which is why this is refcounted:
 *
 *  - React StrictMode runs effects as mount → cleanup → mount. Disposing
 *    directly in a cleanup would free the model microseconds before it is
 *    remounted, leaving an empty stage in development only.
 *
 *  - Flicking A → B → A faster than the release settles should reuse the
 *    cached model rather than re-download and re-parse it.
 *
 * So releases are deferred by a tick and skipped if anything re-retained the
 * asset in the meantime.
 */

import { useGLTF } from "@react-three/drei";

const refCounts = new Map();

/** Register interest in a model. Pair every call with `release`. */
export function retainGltf(url) {
  refCounts.set(url, (refCounts.get(url) || 0) + 1);
}

/**
 * Drop interest in a model. When the last holder lets go, the geometries,
 * materials and textures are disposed and the loader cache entry is evicted
 * so a later visit re-parses cleanly.
 */
export function releaseGltf(url, scene) {
  const remaining = (refCounts.get(url) || 1) - 1;
  refCounts.set(url, remaining);
  if (remaining > 0) return;

  // Deferred: a StrictMode remount or a quick flick back re-retains first.
  setTimeout(() => {
    if ((refCounts.get(url) || 0) > 0) return;
    refCounts.delete(url);
    disposeScene(scene);
    useGLTF.clear(url);
  }, 0);
}

/** Walk a loaded scene and free everything it holds on the GPU. */
export function disposeScene(scene) {
  if (!scene) return;
  const materialsSeen = new Set();
  const texturesSeen = new Set();

  scene.traverse((child) => {
    if (!child.isMesh) return;
    if (child.geometry) child.geometry.dispose();

    const materials = Array.isArray(child.material)
      ? child.material
      : [child.material];

    for (const material of materials) {
      if (!material || materialsSeen.has(material)) continue;
      materialsSeen.add(material);

      // Material texture slots vary per material type, so read them off the
      // instance rather than hard-coding map/normalMap/roughnessMap/...
      for (const value of Object.values(material)) {
        if (value && value.isTexture && !texturesSeen.has(value)) {
          texturesSeen.add(value);
          value.dispose();
        }
      }
      material.dispose();
    }
  });
}

/** Test seam — lets a check assert nothing was left retained. */
export function _retainedCount(url) {
  return refCounts.get(url) || 0;
}
