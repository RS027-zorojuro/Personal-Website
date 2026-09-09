/**
 * Driving World — "NIGHT DRIVE"
 *
 * Atmosphere, not a simulator. There is no telemetry here and there must
 * never be: no speed, no GPS, no route, no trip data. The instrument
 * cluster is explicitly labelled decorative.
 *
 * ── Why this was rewritten ───────────────────────────────────────────
 *
 * The previous version stored pointer position in React state:
 *
 *     const [pointerPos, setPointerPos] = useState({ x: .5, y: .5 });
 *     ...
 *     }, [visible, pointerPos]);      // ← the canvas effect
 *
 * Every mouse move set state, which re-ran the effect, which tore down
 * the animation, re-created the 2D context, re-measured, re-attached a
 * resize listener and started a *new* requestAnimationFrame loop. Moving
 * the pointer across the section rebuilt the entire scene dozens of
 * times a second, and any frame where teardown lost the race leaked a
 * second loop.
 *
 * Pointer and scroll now live in refs (lib/motion.js). The animation
 * effect depends only on `active`, so it initialises once and the frame
 * loop reads whatever the refs currently hold. Nothing here re-renders
 * in response to input.
 */

import React, { useEffect, useRef, useState } from "react";
import {
  observeOnce,
  usePointerRef,
  useReducedMotion,
} from "../lib/motion.js";
import { TechnicalLabel } from "../components/motion/index.jsx";

/* Road geometry, in one place so the scene can be re-proportioned. */
const HORIZON = 0.42; // fraction of height
const ROAD_HALF = 0.46; // road half-width at the camera, as a fraction of width
const DEPTH_POWER = 2.35; // perspective falloff
const STRIPES = 22;
const POLES = 9;

/** Depth 0 (horizon) → 1 (camera). */
function depthToY(t, horizonY, height) {
  return horizonY + (height - horizonY) * Math.pow(t, DEPTH_POWER);
}

export default function DrivingWorld() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [active, setActive] = useState(false);
  const reduced = useReducedMotion();

  /* High-frequency inputs — refs, never state. */
  const pointer = usePointerRef(containerRef, { enabled: !reduced });
  const drive = useRef({ speed: 0.34, lastScroll: 0, curve: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    return observeOnce(el, () => setActive(true));
  }, []);

  /* Scroll feeds perceived acceleration. Writes a number to a ref; the
     component does not re-render as the page moves. */
  useEffect(() => {
    if (!active || reduced) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const now = window.scrollY;
      const delta = Math.abs(now - drive.current.lastScroll);
      drive.current.lastScroll = now;
      // Blend toward the new reading so speed eases rather than snaps.
      drive.current.speed += (Math.min(1, delta / 34) - drive.current.speed) * 0.5;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [active, reduced]);

  /* ── The scene. Depends only on `active` and `reduced`. ── */
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    const host = containerRef.current;
    if (!canvas || !host) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let frame = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let time = 0;

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function render(dt) {
      const p = pointer.current;
      const state = drive.current;

      // Speed settles back to a cruise when the page is still, so the
      // road is always moving a little.
      const cruise = 0.3;
      state.speed += (cruise - state.speed) * 0.012;
      const speed = 0.35 + state.speed * 1.45;

      // The road bends on a slow sine, plus the visitor's steering.
      const steer = p.x * 0.55;
      state.curve += ((Math.sin(time * 0.21) * 0.6 + steer) - state.curve) * 0.03;

      time += dt * (0.55 + speed * 0.5);

      const horizonY = height * (HORIZON + p.y * 0.018);
      const vpx = width * 0.5 + state.curve * width * 0.11;

      /* Sky — deep, with a faint sodium wash sitting on the horizon. */
      const sky = ctx.createLinearGradient(0, 0, 0, horizonY);
      sky.addColorStop(0, "#07070A");
      sky.addColorStop(0.55, "#100E12");
      sky.addColorStop(0.86, "#2A1D1C");
      sky.addColorStop(1, "#41282155");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, horizonY);

      /* Distant city, in two bands at different depths. Parallax between
         them is what makes the distance read as distance rather than as a
         painted backdrop. Geometry is deterministic per index so nothing
         shimmers between frames. */
      const bands = [
        { count: 26, spacing: 96, scale: 1, drift: 26, fill: "#0B0A0E", lit: 0.34 },
        { count: 34, spacing: 74, scale: 0.62, drift: 54, fill: "#070609", lit: 0.5 },
      ];
      for (let b = 0; b < bands.length; b++) {
        const band = bands[b];
        ctx.fillStyle = band.fill;
        for (let i = 0; i < band.count; i++) {
          const seed = Math.sin((i + b * 91) * 12.9898) * 43758.5453;
          const r = seed - Math.floor(seed);
          const bw = (18 + r * 44) * band.scale;
          const bh = (10 + r * 60) * band.scale;
          const bx =
            (((i * band.spacing - state.curve * band.drift) % (width + 200)) + width + 200) %
              (width + 200) -
            100;
          const by = horizonY - bh;
          ctx.fillRect(bx, by, bw, bh);

          /* A few lit windows. Nearer band is brighter — depth cue. */
          if (r > 0.55) {
            ctx.fillStyle = `rgba(217,154,78,${band.lit})`;
            const rows = Math.max(1, Math.floor(bh / 9));
            for (let w = 0; w < rows; w++) {
              const wr = Math.sin((i * 7.3 + w * 3.1)) * 0.5 + 0.5;
              if (wr < 0.62) continue;
              ctx.fillRect(bx + bw * 0.28, by + 4 + w * 9, Math.max(1, bw * 0.16), 2.4);
            }
            ctx.fillStyle = band.fill;
          }
        }
      }

      /* Horizon glow — the light the city throws up into the haze. */
      const glow = ctx.createRadialGradient(
        vpx, horizonY, 0,
        vpx, horizonY, width * 0.42
      );
      glow.addColorStop(0, "rgba(214,84,54,0.34)");
      glow.addColorStop(0.42, "rgba(140,48,30,0.13)");
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.fillRect(0, horizonY - height * 0.3, width, height * 0.34);

      /* Haze — sits between the city and the road so the distance reads
         as air rather than as a hard cut. */
      const haze = ctx.createLinearGradient(0, horizonY - height * 0.1, 0, horizonY + height * 0.06);
      haze.addColorStop(0, "rgba(30,22,22,0)");
      haze.addColorStop(0.55, "rgba(46,32,28,0.5)");
      haze.addColorStop(1, "rgba(20,16,15,0)");
      ctx.fillStyle = haze;
      ctx.fillRect(0, horizonY - height * 0.1, width, height * 0.16);

      /* Road surface — wet asphalt, darkest at the camera. */
      const road = ctx.createLinearGradient(0, horizonY, 0, height);
      road.addColorStop(0, "#2B2220");
      road.addColorStop(0.35, "#191413");
      road.addColorStop(1, "#0B0A09");
      ctx.fillStyle = road;
      ctx.fillRect(0, horizonY, width, height - horizonY);

      /* Road edges. Drawn as a filled band so the verge reads as a
         surface rather than two stray lines. */
      ctx.beginPath();
      ctx.moveTo(vpx, horizonY);
      ctx.lineTo(width * 0.5 - width * ROAD_HALF, height);
      ctx.lineTo(width * 0.5 + width * ROAD_HALF, height);
      ctx.closePath();
      ctx.fillStyle = "rgba(243,238,227,0.022)";
      ctx.fill();

      ctx.strokeStyle = "rgba(243,238,227,0.16)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(vpx, horizonY);
      ctx.lineTo(width * 0.5 - width * ROAD_HALF, height);
      ctx.moveTo(vpx, horizonY);
      ctx.lineTo(width * 0.5 + width * ROAD_HALF, height);
      ctx.stroke();

      /* Centre lane markings, travelling toward the camera. */
      ctx.fillStyle = "rgba(243,238,227,0.68)";
      for (let i = 0; i < STRIPES; i++) {
        const t = ((i / STRIPES + time * 0.42) % 1);
        if (t < 0.015) continue;
        const y = depthToY(t, horizonY, height);
        const yEnd = depthToY(Math.min(1, t + 0.028), horizonY, height);
        const x = vpx + (width * 0.5 - vpx) * Math.pow(t, DEPTH_POWER);
        const w = Math.max(0.6, t * width * 0.012);
        ctx.globalAlpha = Math.min(1, t * 2.4) * 0.8;
        ctx.fillRect(x - w / 2, y, w, Math.max(1, yEnd - y));
      }
      ctx.globalAlpha = 1;

      /* Roadside lights — the strongest cue that you are moving. Each
         pole throws a pool onto the wet surface below it. */
      for (let i = 0; i < POLES; i++) {
        const t = ((i / POLES + time * 0.42) % 1);
        if (t < 0.03) continue;
        const y = depthToY(t, horizonY, height);
        const spread = Math.pow(t, DEPTH_POWER);
        const edge = width * ROAD_HALF * spread * 1.28;
        const cx = vpx + (width * 0.5 - vpx) * spread;
        const fade = Math.min(1, t * 1.8);

        for (const side of [-1, 1]) {
          const lx = cx + edge * side;
          const ly = y - height * 0.09 * spread;
          const radius = Math.max(2, 42 * spread);

          const lamp = ctx.createRadialGradient(lx, ly, 0, lx, ly, radius);
          lamp.addColorStop(0, `rgba(228,171,96,${0.78 * fade})`);
          lamp.addColorStop(0.35, `rgba(198,128,52,${0.24 * fade})`);
          lamp.addColorStop(1, "transparent");
          ctx.fillStyle = lamp;
          ctx.fillRect(lx - radius, ly - radius, radius * 2, radius * 2);

          // Reflection smeared down the wet road.
          ctx.globalAlpha = 0.3 * fade;
          const reflect = ctx.createLinearGradient(lx, y, lx, y + radius * 1.5);
          reflect.addColorStop(0, "rgba(217,154,78,0.7)");
          reflect.addColorStop(1, "transparent");
          ctx.fillStyle = reflect;
          ctx.fillRect(lx - Math.max(1, radius * 0.1), y, Math.max(2, radius * 0.2), radius * 1.5);
          ctx.globalAlpha = 1;
        }
      }

      /* Roadside environment — closest scenery layer. Moves fastest, so
         it separates from the city and gives the road a place to be. */
      for (let i = 0; i < 7; i++) {
        const t = ((i / 7 + time * 0.42 + 0.06) % 1);
        if (t < 0.05) continue;
        const spread = Math.pow(t, DEPTH_POWER);
        const y = depthToY(t, horizonY, height);
        const edge = width * ROAD_HALF * spread * 2.1;
        const cx = vpx + (width * 0.5 - vpx) * spread;
        const h = height * 0.2 * spread;
        ctx.fillStyle = `rgba(8,7,9,${Math.min(1, t * 2)})`;
        for (const side of [-1, 1]) {
          const x = cx + edge * side;
          ctx.fillRect(x - h * 0.06, y - h, h * 0.12, h);
        }
      }

      /* Headlights — a cone from just under the camera, steering with
         the pointer. This is the "car" the visitor is sitting in. */
      const hx = width * 0.5 + p.x * width * 0.06;
      const cone = ctx.createRadialGradient(
        hx, height * 1.02, 0,
        hx, height * 1.02, height * 0.82
      );
      cone.addColorStop(0, "rgba(243,238,227,0.13)");
      cone.addColorStop(0.45, "rgba(243,238,227,0.045)");
      cone.addColorStop(1, "transparent");
      ctx.fillStyle = cone;
      ctx.fillRect(0, horizonY, width, height - horizonY);

      /* Vignette — pulls the eye to the vanishing point. */
      const vig = ctx.createRadialGradient(
        width * 0.5, height * 0.52, height * 0.18,
        width * 0.5, height * 0.52, height * 0.95
      );
      vig.addColorStop(0, "transparent");
      vig.addColorStop(1, "rgba(6,5,5,0.68)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, width, height);
    }

    /* A single still frame for reduced motion — the road is drawn, just
       not moving. Information and atmosphere survive; the loop does not. */
    function renderStill() {
      time = 0.32;
      drive.current.speed = 0;
      drive.current.curve = 0;
      render(0);
    }

    resize();

    const observer = new ResizeObserver(() => {
      resize();
      if (reduced) renderStill();
    });
    observer.observe(canvas.parentElement);

    if (reduced) {
      renderStill();
    } else {
      let last = performance.now();
      const loop = (now) => {
        // Clamp so a backgrounded tab does not jump the scene forward.
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        render(dt);
        frame = requestAnimationFrame(loop);
      };
      frame = requestAnimationFrame(loop);
    }

    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [active, reduced, pointer]);

  return (
    <div
      ref={containerRef}
      className={`drive${active ? " is-active" : ""}`}
      data-cursor="scroll"
    >
      <div className="drive-stage">
        <canvas ref={canvasRef} className="drive-canvas" aria-hidden="true" />

        {/* Cockpit geometry — a suggestion of a windscreen and A-pillars,
            drawn in the same hairline language as the rest of the site. */}
        <svg className="drive-cockpit" viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true">
          {/*
            Two subpaths with evenodd: the outer rectangle is filled and
            the windscreen aperture is punched out of it, so the darkening
            lands on the pillars and roof rather than over the road.
          */}
          <path
            className="drive-pillar"
            fillRule="evenodd"
            d="M0 0 H100 V60 H0 Z M6 60 L21 21 L79 21 L94 60 Z"
          />
          <path d="M21 21 L6 60" className="drive-pillar-edge" />
          <path d="M79 21 L94 60" className="drive-pillar-edge" />
          <path d="M21 21 H79" className="drive-pillar-edge" />
        </svg>

        <div className="drive-plate">
          <TechnicalLabel className="drive-plate-kicker">
            05 · Night drive
          </TechnicalLabel>
          <p className="drive-plate-voice">Mumbai roads after hours.</p>
          <p className="drive-plate-note">
            Atmosphere only — no speed, route or trip data is shown or recorded.
          </p>
        </div>
      </div>
    </div>
  );
}
