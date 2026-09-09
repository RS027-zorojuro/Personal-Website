/**
 * Cars World — "THE GARAGE"
 *
 * A real-time 3D showroom (React Three Fiber + Three.js) built around three
 * personal-favourite vehicles. Not ownership claims.
 *
 * ── Why this file is shaped the way it is ────────────────────────────────
 *
 * The previous implementation crashed the section. Three things mattered:
 *
 *  1. It passed an inline onLoaded arrow into the model component and put
 *     that arrow in a useEffect dependency array. The effect called back
 *     into setLoadedModels(new Set(...)), which is a fresh object every
 *     time, so every commit re-ran the effect, which set state, which
 *     re-rendered... an unbounded loop measured at ~800 renders/second,
 *     each one running two full Box3.setFromObject traversals over a
 *     12 MB vehicle. That pegged the main thread.
 *
 *     The fix is structural, not a patched dependency array: readiness is
 *     now expressed by Suspense, so no parent state and no callback exists
 *     to loop through. There is no onLoaded any more.
 *
 *  2. Every car that had ever been shown stayed mounted, merely
 *     visible={false}. Hidden is not unloaded — all three (34.5 MB) ended
 *     up resident. Now exactly one vehicle is in the scene, and the
 *     outgoing one is disposed and evicted from the loader cache.
 *
 *  3. Environment preset="city" pulled an HDR from a third-party CDN and
 *     suspended without a boundary, so a flaky network could throw the
 *     whole React root away. Lighting is now baked locally from
 *     Lightformers — no network, no external dependency.
 *
 * Camera authority: the rig writes camera.position and controls.target at
 * frame priority -2, before drei's OrbitControls updates at -1. The old code
 * had the rig and OrbitControls both writing the camera at the same
 * priority, which is why the view drifted under the floor.
 */

import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Html,
  Lightformer,
  OrbitControls,
  useGLTF,
  useProgress,
} from "@react-three/drei";
import * as THREE from "three";
import { CARS, CAR_VIEWS } from "../data/cars.js";
import ErrorBoundary from "../components/ErrorBoundary.jsx";
import { retainGltf, releaseGltf } from "../lib/gltf.js";
import {
  hasWebGL,
  isHandheld,
  prefersReducedMotion,
  renderDpr,
} from "../lib/webgl.js";

/* Frame-loop scratch objects. Allocating these per frame is what makes a
   3D scene stutter, so they live at module scope and are reused. */
const _pos = new THREE.Vector3();
const _target = new THREE.Vector3();
const _sweep = new THREE.Vector3();

const EXIT_MS = 420;
const MIN_DISTANCE = 2.6; // shared with OrbitControls' minDistance
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeInQuad = (t) => t * t;

/* ─── Vehicle ─────────────────────────────────────────────────────────────
   Mounted one at a time. `mode` is "in" or "out"; the parent owns the
   timing of the swap so this component never calls back up into parent
   state — that is the loop that used to crash the page.
─────────────────────────────────────────────────────────────────────────── */
function Vehicle({ car, mode, pointerRef, reduced }) {
  const { scene } = useGLTF(car.glb);
  const groupRef = useRef(null);
  const innerRef = useRef(null);

  /* Reveal progress, 0 → 1. Held in a ref so animating it never triggers a
     React render. */
  const presence = useRef(reduced ? 1 : 0);

  /**
   * Fit transform. Computed from the untouched cached scene and applied to
   * a wrapper group — the GLTF scene itself is never mutated, so returning
   * to a vehicle re-frames it identically instead of compounding scale.
   */
  const fit = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const longest = Math.max(size.x, size.y, size.z) || 1;
    return {
      scale: car.lengthUnits / longest,
      /*
       * Expressed in the model's own units, and applied *inside* the heading
       * rotation. Centring outside the rotation would pivot the car about the
       * stage origin instead of about itself, throwing it out of frame for
       * any model whose local origin is not already at its centre.
       *
       * Y-rotation does not change vertical extents, so dropping min.y here
       * still lands the wheels on the floor after the heading is applied.
       */
      recenter: [-center.x, -box.min.y, -center.z],
    };
  }, [scene, car.lengthUnits]);

  /* Shadow flags — idempotent, and keyed only on the scene. */
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material && !Array.isArray(child.material)) {
          child.material.envMapIntensity = car.stage.envIntensity;
        }
      }
    });
  }, [scene, car.stage.envIntensity]);

  /**
   * Release the vehicle when it leaves the scene. Refcounted in lib/gltf.js
   * so StrictMode's mount → cleanup → mount cycle cannot free a model that
   * is about to be remounted.
   */
  useEffect(() => {
    const url = car.glb;
    retainGltf(url);
    return () => releaseGltf(url, scene);
  }, [car.glb, scene]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    const inner = innerRef.current;
    if (!group || !inner) return;

    const step = Math.min(delta, 0.05);

    if (reduced) {
      presence.current = mode === "out" ? 0 : 1;
    } else if (mode === "out") {
      presence.current = Math.max(0, presence.current - step * (1000 / EXIT_MS));
    } else {
      presence.current = Math.min(1, presence.current + step * 1.15);
    }

    const p = presence.current;
    const eased = mode === "out" ? easeInQuad(p) : easeOutCubic(p);

    /* Staged arrival: the car settles down onto the floor and rotates the
       last few degrees into its three-quarter stance, rather than fading. */
    group.position.y = (1 - eased) * -0.34;
    group.rotation.y = (1 - eased) * (mode === "out" ? 0.16 : -0.2);
    group.scale.setScalar(fit.scale * (0.985 + eased * 0.015));

    /* Pointer response: a few hundredths of a radian around the model's own
       squared-up heading. Enough that the body reads as a physical object
       catching the light, not enough to become a wobble. */
    if (!reduced) {
      const { x, y } = pointerRef.current;
      const restY = car.headingOffset || 0;
      inner.rotation.y += (restY + x * 0.05 - inner.rotation.y) * 0.05;
      inner.rotation.x += (-y * 0.022 - inner.rotation.x) * 0.05;
    }
  });

  return (
    <group ref={groupRef} scale={fit.scale}>
      <group ref={innerRef} rotation={[0, car.headingOffset || 0, 0]}>
        <group position={fit.recenter}>
          <primitive object={scene} />
        </group>
      </group>
    </group>
  );
}

/* ─── Camera rig ──────────────────────────────────────────────────────────
   The single writer of camera position. Runs at priority -2 so OrbitControls
   (-1) consumes the result in the same frame instead of fighting it.
─────────────────────────────────────────────────────────────────────────── */
function CameraRig({ controlsRef, view, carId, userEngagedRef, reduced, handheld }) {
  const { camera } = useThree();

  /* A portrait viewport crops the frame horizontally, so the same camera
     distance leaves the car small and adrift. Pull in and lift slightly —
     but never inside MIN_DISTANCE, or the close DETAIL framing ends up
     clipping through the bodywork on a phone. */
  const dolly = handheld ? 0.82 : 1;

  /* Re-arm the automatic framing whenever the composition changes; a user
     drag hands control back to them until the next selection. */
  useEffect(() => {
    userEngagedRef.current = false;
  }, [view, carId, userEngagedRef]);

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls || userEngagedRef.current) return;

    _target.set(view.target[0], view.target[1], view.target[2]);
    _pos.set(
      view.position[0] * dolly,
      view.position[1] * (handheld ? 1.06 : 1),
      view.position[2] * dolly
    );

    // Hold the camera outside the orbit floor after the handheld pull-in.
    const reach = _pos.distanceTo(_target);
    if (reach < MIN_DISTANCE) {
      _pos.sub(_target).multiplyScalar(MIN_DISTANCE / reach).add(_target);
    }

    if (reduced) {
      camera.position.copy(_pos);
      controls.target.copy(_target);
      return;
    }

    // Frame-rate independent damping.
    const k = 1 - Math.pow(0.0016, Math.min(delta, 0.05));
    camera.position.lerp(_pos, k);
    controls.target.lerp(_target, k);
  }, -2);

  return null;
}

/* ─── Showroom shell ─────────────────────────────────────────────────────── */
function Showroom({ stage, pointerRef, reduced, handheld }) {
  const sweepRef = useRef(null);

  useFrame((_, delta) => {
    const light = sweepRef.current;
    if (!light || reduced) return;
    const { x, y } = pointerRef.current;
    _sweep.set(x * 5.5, 3.4 + y * -0.9, 4.2);
    light.position.lerp(_sweep, 1 - Math.pow(0.02, Math.min(delta, 0.05)));
  });

  return (
    <>
      <color attach="background" args={[stage.floor]} />
      <fog attach="fog" args={[stage.floor, 14, 34]} />

      <ambientLight intensity={stage.fill.intensity} color={stage.fill.color} />

      <directionalLight
        position={stage.key.position}
        intensity={stage.key.intensity}
        color={stage.key.color}
        castShadow
        shadow-mapSize={handheld ? [1024, 1024] : [2048, 2048]}
        shadow-bias={-0.0009}
        shadow-normalBias={0.02}
        shadow-camera-near={1}
        shadow-camera-far={26}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />

      <directionalLight
        position={stage.rim.position}
        intensity={stage.rim.intensity}
        color={stage.rim.color}
      />

      {/* Showroom light that tracks the pointer across the bodywork. */}
      <spotLight
        ref={sweepRef}
        position={[0, 3.4, 4.2]}
        angle={0.72}
        penumbra={1}
        intensity={handheld ? 2.6 : 4.2}
        distance={16}
        decay={1.6}
        color={stage.key.color}
      />

      {/* Floor. Slight metalness so the rim light travels along it. */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.002, 0]}
        receiveShadow
      >
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial
          color={stage.floor}
          roughness={0.74}
          metalness={0.12}
        />
      </mesh>

      <gridHelper
        args={[44, 44, stage.grid, stage.grid]}
        position={[0, 0.001, 0]}
      />

      <ContactShadows
        position={[0, 0.004, 0]}
        opacity={stage.shadowOpacity}
        scale={16}
        blur={2.2}
        far={5}
        resolution={handheld ? 256 : 512}
        frames={reduced ? 1 : Infinity}
        color="#000000"
      />

      {/*
        Reflections are baked locally from these emissive panels. This is the
        replacement for Environment preset="city", which fetched an HDR from
        raw.githack.com and could take the section down when the network was
        unavailable. frames={1} bakes once — no per-frame cost.
      */}
      <Environment resolution={handheld ? 128 : 256} frames={1}>
        <Lightformer
          form="rect"
          intensity={2.6}
          color={stage.key.color}
          position={[0, 5.5, -3]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[12, 5, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.5}
          color={stage.key.color}
          position={[-5, 2.4, 2]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[8, 3, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.5}
          color={stage.key.color}
          position={[5, 2.4, 2]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[8, 3, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.1}
          color={stage.rim.color}
          position={[0, 1.6, -6]}
          scale={[10, 2, 1]}
        />
      </Environment>
    </>
  );
}

/* ─── In-canvas loading readout ──────────────────────────────────────────── */
function GarageLoading() {
  const { progress } = useProgress();
  const pct = Math.max(4, Math.round(progress));
  return (
    <Html center prepend>
      <div className="garage-loading" aria-hidden="true">
        <div className="garage-loading-bar">
          <span style={{ width: pct + "%" }} />
        </div>
        <p className="garage-loading-label">
          LOADING VEHICLE <em>{String(pct).padStart(3, "0")}</em>
        </p>
      </div>
    </Html>
  );
}

/* ─── Fallback shown when the 3D scene cannot run ────────────────────────── */
function GarageUnavailable({ reason }) {
  return (
    <div className="garage-fault">
      <p className="garage-fault-kicker">GARAGE</p>
      <p className="garage-fault-title">MODEL UNAVAILABLE</p>
      <p className="garage-fault-body">{reason}</p>
    </div>
  );
}

/* ─── The Garage ─────────────────────────────────────────────────────────── */
export default function CarsWorld() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [mountedIdx, setMountedIdx] = useState(0);
  const [view, setView] = useState("default");
  const [inView, setInView] = useState(false);
  const [phase, setPhase] = useState("in"); // "in" | "out"

  const containerRef = useRef(null);
  const controlsRef = useRef(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const userEngagedRef = useRef(false);
  const swapTimer = useRef(null);

  /* Capabilities are read once — they cannot change mid-session. */
  const caps = useMemo(
    () => ({
      webgl: hasWebGL(),
      handheld: isHandheld(),
      reduced: prefersReducedMotion(),
      dpr: renderDpr(),
    }),
    []
  );

  const activeCar = CARS[activeIdx];
  const mountedCar = CARS[mountedIdx];

  /* Mount the canvas only once the section is approached. */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /**
   * Vehicle change is staged: the outgoing car is animated out, then swapped.
   * The timing lives here rather than in a child callback — a child calling
   * back into parent state is exactly what produced the original crash.
   */
  const selectCar = useCallback(
    (idx) => {
      if (idx === activeIdx) return;
      setActiveIdx(idx);
      setView("default");
      userEngagedRef.current = false;

      if (caps.reduced) {
        setMountedIdx(idx);
        setPhase("in");
        return;
      }

      setPhase("out");
      clearTimeout(swapTimer.current);
      swapTimer.current = setTimeout(() => {
        setMountedIdx(idx);
        setPhase("in");
      }, EXIT_MS);
    },
    [activeIdx, caps.reduced]
  );

  useEffect(() => () => clearTimeout(swapTimer.current), []);

  /* Pointer is written to a ref and consumed in the frame loop — it never
     triggers a React render. */
  useEffect(() => {
    const el = containerRef.current;
    if (!el || caps.reduced || caps.handheld) return;
    const onMove = (event) => {
      const rect = el.getBoundingClientRect();
      pointerRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointerRef.current.y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    };
    const onLeave = () => {
      pointerRef.current.x = 0;
      pointerRef.current.y = 0;
    };
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave, { passive: true });
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [caps.reduced, caps.handheld]);

  /* Keyboard: only while focus is inside the garage, so it never steals the
     page's own shortcuts. */
  const onKeyDown = useCallback(
    (event) => {
      const idx = CARS.findIndex((_, i) => String(i + 1) === event.key);
      if (idx !== -1) {
        event.preventDefault();
        selectCar(idx);
        return;
      }
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        const delta = event.key === "ArrowRight" ? 1 : -1;
        selectCar((activeIdx + delta + CARS.length) % CARS.length);
      }
    },
    [activeIdx, selectCar]
  );

  const viewSpec = useMemo(
    () => activeCar.views[view] || activeCar.views.default,
    [activeCar, view]
  );

  return (
    <div
      ref={containerRef}
      className="garage"
      onKeyDown={onKeyDown}
      data-car={activeCar.id}
    >
      <div className="garage-stage">
        {!caps.webgl ? (
          <GarageUnavailable reason="This browser could not start a 3D context. The vehicle notes below still work." />
        ) : (
          <ErrorBoundary
            label="cars"
            title="GARAGE"
            message="MODEL UNAVAILABLE"
            hint="The showroom could not be loaded here. Everything else on the page is unaffected."
          >
            {inView && (
              <Canvas
                shadows={{ type: THREE.PCFShadowMap }}
                dpr={caps.dpr}
                camera={{
                  position: activeCar.views.default.position,
                  fov: 38,
                  near: 0.1,
                  far: 120,
                }}
                gl={{
                  antialias: !caps.handheld,
                  alpha: false,
                  powerPreference: "high-performance",
                }}
                onCreated={({ gl }) => {
                  gl.toneMapping = THREE.ACESFilmicToneMapping;
                  gl.toneMappingExposure = 1.05;
                }}
              >
                <Showroom
                  stage={activeCar.stage}
                  pointerRef={pointerRef}
                  reduced={caps.reduced}
                  handheld={caps.handheld}
                />

                {/*
                  Exactly one vehicle in the scene. The key ties the Suspense
                  boundary to the mounted car, so switching unmounts (and
                  therefore disposes) the previous one.
                */}
                <Suspense key={mountedCar.id} fallback={<GarageLoading />}>
                  <Vehicle
                    car={mountedCar}
                    mode={phase}
                    pointerRef={pointerRef}
                    reduced={caps.reduced}
                  />
                </Suspense>

                <CameraRig
                  controlsRef={controlsRef}
                  view={viewSpec}
                  carId={activeCar.id}
                  userEngagedRef={userEngagedRef}
                  reduced={caps.reduced}
                  handheld={caps.handheld}
                />

                <OrbitControls
                  ref={controlsRef}
                  makeDefault
                  enablePan={false}
                  minDistance={MIN_DISTANCE}
                  maxDistance={11}
                  minPolarAngle={0.25}
                  maxPolarAngle={Math.PI / 2 - 0.04}
                  enableDamping={!caps.reduced}
                  dampingFactor={0.07}
                  rotateSpeed={0.7}
                  zoomSpeed={0.6}
                  onStart={() => {
                    userEngagedRef.current = true;
                  }}
                />
              </Canvas>
            )}
          </ErrorBoundary>
        )}
      </div>

      {/* Metadata runs on its own clock — it changes the moment you choose,
          while the vehicle is still leaving the stage. */}
      <div className="garage-plate" key={activeCar.id}>
        <p className="garage-plate-index">
          <span
            style={{
              color: "var(--accent-" + activeCar.accent + ", var(--paper))",
            }}
          >
            {String(activeIdx + 1).padStart(2, "0")}
          </span>
          <i>/</i>
          {String(CARS.length).padStart(2, "0")}
        </p>
        <h3 className="garage-plate-name">{activeCar.name}</h3>
        <p className="garage-plate-designation">
          {activeCar.designation} <i>·</i> {activeCar.era}
        </p>
        <p className="garage-plate-desc">{activeCar.description}</p>
        <p className="garage-plate-tone">{activeCar.tone}</p>
      </div>

      <div className="garage-picks" role="tablist" aria-label="Garage picks">
        {CARS.map((car, idx) => (
          <button
            key={car.id}
            role="tab"
            type="button"
            className={"garage-pick" + (idx === activeIdx ? " is-active" : "")}
            aria-selected={idx === activeIdx}
            onClick={() => selectCar(idx)}
          >
            <span className="garage-pick-id">{car.id.toUpperCase()}</span>
            <span className="garage-pick-name">{car.designation}</span>
          </button>
        ))}
      </div>

      <div className="garage-views" role="tablist" aria-label="Camera view">
        {CAR_VIEWS.map((v) => (
          <button
            key={v.key}
            role="tab"
            type="button"
            title={v.title}
            aria-selected={view === v.key}
            className={"garage-view" + (view === v.key ? " is-active" : "")}
            onClick={() => {
              userEngagedRef.current = false;
              setView(v.key);
            }}
          >
            {v.label}
          </button>
        ))}
      </div>

      <p className="garage-note">
        Garage picks — cars that stand out to me, not cars I own.
        <span>Drag to orbit · scroll to zoom · 1–3 or ← → to change vehicle</span>
      </p>
    </div>
  );
}
