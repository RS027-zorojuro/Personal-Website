/**
 * Engineering World — "THE WORKSHOP"
 *
 * A drawing sheet that constructs itself. Each stage of the process
 * draws its own geometry: construction marks, then outlines, then
 * assembled components, then dimensions, then a revision loop.
 *
 * ── Implementation note ──────────────────────────────────────────────
 *
 * Every animated path carries pathLength="1". That normalises the
 * stroke length regardless of the path's real geometry, so the draw-on
 * animation is pure CSS (dasharray 1 → dashoffset 0) with no
 * getTotalLength() measurement, no layout read, and no JS per frame.
 * Adding a new construction line needs no code — just the attribute.
 *
 * ── Content ──────────────────────────────────────────────────────────
 *
 * The geometry is abstract on purpose. It is a drawing *about* a
 * process, not a schematic of a real device: no pinouts, no component
 * values, no sensor names, no measurements presented as real. The
 * dimension figures are drawn as unresolved marks for that reason.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  observeOnce,
  useReducedMotion,
  useRovingIndex,
} from "../lib/motion.js";
import { TechnicalLabel } from "../components/motion/index.jsx";

const STAGES = [
  {
    id: "idea",
    number: "01",
    label: "IDEA",
    description:
      "Start with a question or a problem. Not every idea needs to be original — sometimes the starting point is understanding why something already exists.",
    note: "SKETCH · UNRESOLVED",
  },
  {
    id: "design",
    number: "02",
    label: "DESIGN",
    description:
      "Break it down. Sketch the structure, define the constraints, figure out what connects to what before writing a single line.",
    note: "OUTLINE · CENTRELINES",
  },
  {
    id: "build",
    number: "03",
    label: "BUILD",
    description:
      "Put it together — code, hardware, whatever the medium is. The first version is never the final one.",
    note: "ASSEMBLY · IN PROGRESS",
  },
  {
    id: "test",
    number: "04",
    label: "TEST",
    description:
      "Find out where it breaks. Testing is not validation — it is the process of discovering what you missed.",
    note: "DIMENSIONS · CHECK",
  },
  {
    id: "iterate",
    number: "05",
    label: "ITERATE",
    description:
      "Go back. Change what needs changing. The loop is the process, not a failure mode.",
    note: "REV · RETURN TO 01",
  },
];

/* A construction path. `step` is the stage index at which it appears;
   `order` sequences the draw within that stage. */
function Draw({ d, step, order = 0, current, kind = "line", ...rest }) {
  const shown = current >= step;
  return (
    <path
      d={d}
      pathLength="1"
      className={`bp-path bp-${kind}${shown ? " is-drawn" : ""}`}
      style={{ "--draw-delay": `${order * 90}ms` }}
      {...rest}
    />
  );
}

function DrawCircle({ cx, cy, r, step, order = 0, current, kind = "line" }) {
  const shown = current >= step;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={r}
      pathLength="1"
      className={`bp-path bp-${kind}${shown ? " is-drawn" : ""}`}
      style={{ "--draw-delay": `${order * 90}ms` }}
    />
  );
}

export default function EngineeringWorld() {
  const containerRef = useRef(null);
  const railRef = useRef(null);
  const [active, setActive] = useState(false);
  const [stage, setStage] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    return observeOnce(el, () => setActive(true));
  }, []);

  /* Construct the drawing once, in order, the first time it is seen.
     It stops at the last stage rather than looping — a drawing that
     keeps erasing itself is a distraction, not a process. */
  useEffect(() => {
    if (!active || !autoplay) return;
    if (reduced) {
      setStage(STAGES.length - 1);
      setAutoplay(false);
      return;
    }
    if (stage >= STAGES.length - 1) {
      setAutoplay(false);
      return;
    }
    const timer = window.setTimeout(() => setStage((s) => s + 1), 1250);
    return () => window.clearTimeout(timer);
  }, [active, autoplay, stage, reduced]);

  const select = useCallback((index) => {
    setAutoplay(false);
    setStage(index);
  }, []);

  const onKeyDown = useRovingIndex({
    count: STAGES.length,
    index: stage,
    onChange: (next) => {
      select(next);
      railRef.current?.querySelectorAll(".bp-step")[next]?.focus();
    },
    orientation: "horizontal",
  });

  const currentStage = STAGES[stage];

  return (
    <div
      ref={containerRef}
      className={`bp${active ? " is-active" : ""}`}
      data-cursor="tech"
    >
      {/* ── Drawing sheet ── */}
      <div className="bp-sheet">
        <svg
          className="bp-svg"
          viewBox="0 0 200 128"
          role="img"
          aria-label={`Technical drawing illustrating the ${currentStage.label} stage of an engineering process. This is a conceptual drawing, not a schematic of a real device.`}
        >
          {/* Sheet border and title block — the frame of a real drawing.
              The block runs the full width along the bottom so the
              drawing area above it stays uncluttered. */}
          <rect className="bp-border" x="3" y="3" width="194" height="122" />
          <path className="bp-border" d="M3 108 H197 M74 108 V125 M138 108 V125" />
          <text className="bp-title-key" x="8" y="114">DRAWING</text>
          <text className="bp-title-val" x="8" y="121">PROCESS · CONCEPTUAL</text>
          <text className="bp-title-key" x="79" y="114">STAGE</text>
          <text className="bp-title-val" x="79" y="121">
            {currentStage.number} · {currentStage.label}
          </text>
          <text className="bp-title-key" x="143" y="114">SHEET</text>
          <text className="bp-title-val" x="143" y="121">
            {currentStage.number} OF {String(STAGES.length).padStart(2, "0")}
          </text>

          {/* All construction geometry sits in one group so the drawing
              can be positioned within the sheet without touching any of
              the individual path data. */}
          <g transform="translate(28 -2)">

          {/* ── 01 IDEA — construction marks, nothing resolved yet ── */}
          <g className="bp-layer">
            <Draw current={stage} step={0} order={0} kind="construction" d="M20 20 H112" />
            <Draw current={stage} step={0} order={1} kind="construction" d="M20 20 V88" />
            <DrawCircle current={stage} step={0} order={2} kind="construction" cx={66} cy={54} r={30} />
            <Draw current={stage} step={0} order={3} kind="construction" d="M36 24 L96 84" />
            <Draw current={stage} step={0} order={4} kind="construction" d="M96 24 L36 84" />
          </g>

          {/* ── 02 DESIGN — the outline and its centrelines ── */}
          <g className="bp-layer">
            <Draw current={stage} step={1} order={0} d="M38 32 H94 V76 H38 Z" />
            <Draw current={stage} step={1} order={1} kind="centre" d="M66 24 V84" />
            <Draw current={stage} step={1} order={2} kind="centre" d="M30 54 H102" />
            <Draw current={stage} step={1} order={3} kind="hidden" d="M46 32 V76" />
            <Draw current={stage} step={1} order={4} kind="hidden" d="M86 32 V76" />
          </g>

          {/* ── 03 BUILD — components snapping into the outline ── */}
          <g className="bp-layer">
            <Draw current={stage} step={2} order={0} kind="solid" d="M46 40 H62 V52 H46 Z" />
            <Draw current={stage} step={2} order={1} kind="solid" d="M70 40 H86 V52 H70 Z" />
            <Draw current={stage} step={2} order={2} kind="solid" d="M46 58 H86 V68 H46 Z" />
            <Draw current={stage} step={2} order={3} d="M62 46 H70" />
            <Draw current={stage} step={2} order={4} d="M54 52 V58" />
            <Draw current={stage} step={2} order={5} d="M78 52 V58" />
            <DrawCircle current={stage} step={2} order={6} cx={66} cy={63} r={2.4} />
            {/* Fastener positions at the corners of the outline — drawn as
                the crossed circles a drawing uses, not as real hardware. */}
            {[[43, 36], [89, 36], [43, 72], [89, 72]].map(([fx, fy], i) => (
              <g key={`f${fx}-${fy}`}>
                <DrawCircle current={stage} step={2} order={7 + i} cx={fx} cy={fy} r={1.5} />
                <Draw current={stage} step={2} order={7 + i} kind="centre" d={`M${fx - 2.6} ${fy} H${fx + 2.6} M${fx} ${fy - 2.6} V${fy + 2.6}`} />
              </g>
            ))}
          </g>

          {/* ── 04 TEST — dimensions and callouts.
                 The figures are drawn as unresolved marks: there is no
                 real measurement to report, so none is stated. ── */}
          <g className="bp-layer">
            <Draw current={stage} step={3} order={0} kind="dim" d="M38 24 H94" />
            <Draw current={stage} step={3} order={1} kind="dim" d="M38 21 V27" />
            <Draw current={stage} step={3} order={2} kind="dim" d="M94 21 V27" />
            <Draw current={stage} step={3} order={3} kind="dim" d="M108 32 V76" />
            <Draw current={stage} step={3} order={4} kind="dim" d="M105 32 H111" />
            <Draw current={stage} step={3} order={5} kind="dim" d="M105 76 H111" />
            <Draw current={stage} step={3} order={6} kind="leader" d="M86 46 L118 38" />
            {/* Section line A-A with its arrows, the way a drawing marks
                where a cut view would be taken. */}
            <Draw current={stage} step={3} order={7} kind="section" d="M28 54 H30 M34 54 H98 M102 54 H104" />
            <Draw current={stage} step={3} order={8} kind="section" d="M28 54 v-4 h4" />
            <Draw current={stage} step={3} order={8} kind="section" d="M104 54 v-4 h-4" />
            {/* Datum on the base edge. */}
            <Draw current={stage} step={3} order={9} kind="dim" d="M38 80 h6 l-3 -4 z M41 80 V84 M36 84 H46" />
            <g className={stage >= 3 ? "bp-anno is-drawn" : "bp-anno"}>
              <text className="bp-dim-text" x="66" y="19">—</text>
              <text className="bp-dim-text bp-dim-vert" x="114" y="54">—</text>
              <text className="bp-note" x="120" y="37">CHECK FIT</text>
              <text className="bp-sec" x="24" y="52">A</text>
              <text className="bp-sec" x="107" y="52">A</text>
              <text className="bp-note" x="120" y="46">TYP.</text>
              <text className="bp-datum" x="41" y="88">A</text>
              <text className="bp-note" x="96" y="86">REF.</text>
            </g>
          </g>

          {/* ── 05 ITERATE — revision mark and the return arc ── */}
          <g className="bp-layer">
            <Draw
              current={stage}
              step={4}
              order={0}
              kind="revision"
              d="M30 92 C40 86, 54 86, 62 92 C72 86, 86 88, 94 94 C104 92, 112 96, 108 102 C100 106, 84 106, 74 102 C62 106, 44 104, 34 100 C26 98, 24 94, 30 92 Z"
            />
            <Draw
              current={stage}
              step={4}
              order={1}
              kind="leader"
              d="M20 88 C10 70, 10 40, 20 22"
              markerEnd="url(#bp-arrow)"
            />
            <Draw current={stage} step={4} order={2} kind="revision" d="M112 90 l4 7 h-8 z" />
            <g className={stage >= 4 ? "bp-anno is-drawn" : "bp-anno"}>
              <text className="bp-rev" x="46" y="99">REV · BACK TO 01</text>
              <text className="bp-revno" x="112" y="96">2</text>
            </g>
          </g>

          </g>

          <defs>
            <marker
              id="bp-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M0 1 L9 5 L0 9 z" className="bp-arrow-head" />
            </marker>
          </defs>
        </svg>

        {/* Crosshair registration marks, the way a drawing sheet has them */}
        <span className="bp-reg bp-reg-tl" aria-hidden="true" />
        <span className="bp-reg bp-reg-br" aria-hidden="true" />
      </div>

      {/* ── Process rail ── */}
      <div
        ref={railRef}
        className="bp-rail"
        role="tablist"
        aria-label="Engineering process stages"
      >
        {STAGES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={i === stage}
            tabIndex={i === stage ? 0 : -1}
            className={`bp-step${i === stage ? " is-current" : ""}${
              i < stage ? " is-done" : ""
            }`}
            onClick={() => select(i)}
            onKeyDown={onKeyDown}
          >
            <span className="bp-step-no">{s.number}</span>
            <span className="bp-step-label">{s.label}</span>
            <span className="bp-step-rule" aria-hidden="true" />
          </button>
        ))}
      </div>

      {/* ── Annotation panel ── */}
      <div className="bp-readout" role="region" aria-live="polite">
        <TechnicalLabel className="bp-readout-note">
          {currentStage.note}
        </TechnicalLabel>
        <p className="bp-readout-text" key={currentStage.id}>
          {currentStage.description}
        </p>
      </div>

      <p className="bp-foot">
        Conceptual drawing — it illustrates a way of working, not a real
        assembly. No components, values or measurements are specified.
      </p>
    </div>
  );
}
