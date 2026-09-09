/**
 * Technology World — "MY AI LAB"
 *
 * An interactive laboratory rather than a row of cards. A signal runs
 * the loop — context → prompt → model → output → iterate → back to
 * context — activating each node as it arrives and lighting the
 * connector it just travelled.
 *
 * ── Design notes ─────────────────────────────────────────────────────
 *
 * The signal advances at ~1.5s per stage, so this re-renders well under
 * once a second. That is state's job. The pointer glow, by contrast, is
 * high-frequency and lives in a ref written straight to a CSS custom
 * property — it never renders.
 *
 * The loop pauses while a visitor is hovering or has focus inside the
 * lab, so it cannot yank attention away from something being read.
 *
 * ── Content ──────────────────────────────────────────────────────────
 *
 * Everything shown describes the *practice* of prompt/context work and
 * running local models. Nothing here claims a production pipeline, and
 * no metric of any kind appears — see the header of data/tech.js.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { TECH_STAGES } from "../data/tech.js";
import {
  observeOnce,
  usePointerRef,
  useReducedMotion,
  useRovingIndex,
} from "../lib/motion.js";
import { TechnicalLabel } from "../components/motion/index.jsx";

const STAGE_MS = 1500;

const ICONS = {
  layers: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="M12 3 3 7.5 12 12l9-4.5L12 3Z" />
      <path d="M3 12.5 12 17l9-4.5" />
      <path d="M3 17.5 12 22l9-4.5" />
    </svg>
  ),
  braces: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="M8 4a2 2 0 0 0-2 2v3a2 2 0 0 1-2 2 2 2 0 0 1 2 2v3a2 2 0 0 0 2 2" />
      <path d="M16 4a2 2 0 0 1 2 2v3a2 2 0 0 0 2 2 2 2 0 0 0-2 2v3a2 2 0 0 1-2 2" />
    </svg>
  ),
  cpu: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <rect x="6" y="6" width="12" height="12" rx="1.5" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="0.5" />
      <path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" />
    </svg>
  ),
  output: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="M4 5h10M4 10h13M4 15h8M4 20h5" />
      <path d="M16 17l3 3 4-5" />
    </svg>
  ),
  loop: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="M20 11a8 8 0 1 0-1.9 6.3" />
      <path d="M20 5v6h-6" />
    </svg>
  ),
};

function StageNode({ stage, index, state, isOpen, onOpen, onKeyDown, tabIndex }) {
  return (
    <button
      type="button"
      className={`lab-node is-${state}${isOpen ? " is-open" : ""}`}
      data-cursor="tech"
      onClick={() => onOpen(stage.id)}
      onKeyDown={onKeyDown}
      tabIndex={tabIndex}
      aria-expanded={isOpen}
      aria-controls="lab-readout"
      style={{ "--node-index": index }}
    >
      <span className="lab-node-order">{stage.order}</span>

      <span className="lab-node-core" aria-hidden="true">
        <span className="lab-node-icon">{ICONS[stage.icon]}</span>
        <span className="lab-node-pulse" />
      </span>

      <span className="lab-node-label">{stage.label}</span>
      <span className="lab-node-title">{stage.title}</span>

      {/*
        Per-stage activity. Each stage shows what it actually does —
        context accumulating, the prompt being shaped, the model working,
        output arriving, the loop closing — rather than every node
        pulsing identically. Abstract on purpose: these are not real
        tokens or real output.
      */}
      <span className="lab-node-activity" data-kind={stage.id} aria-hidden="true">
        {stage.id === "context" && (
          <>
            <i /><i /><i /><i />
          </>
        )}
        {stage.id === "prompt" && <em>{"{ }"}</em>}
        {stage.id === "model" && <b />}
        {stage.id === "output" && <s />}
        {stage.id === "iterate" && <u />}
      </span>
    </button>
  );
}

/** The connector between two nodes; the beam animates when the signal
    is crossing it. */
function Connector({ live, vertical }) {
  return (
    <span className={`lab-link${live ? " is-live" : ""}`} aria-hidden="true">
      <span className="lab-link-track" />
      <span className="lab-link-beam" />
      <svg className="lab-link-tip" viewBox="0 0 10 10" aria-hidden="true">
        {vertical ? (
          <path d="M2 3 L5 7 L8 3" fill="none" stroke="currentColor" strokeWidth="1" />
        ) : (
          <path d="M3 2 L7 5 L3 8" fill="none" stroke="currentColor" strokeWidth="1" />
        )}
      </svg>
    </span>
  );
}

export default function TechnologyWorld() {
  const containerRef = useRef(null);
  const railRef = useRef(null);
  const [active, setActive] = useState(false);
  const [signal, setSignal] = useState(0); // index of the node the signal is at
  const [openId, setOpenId] = useState(null);
  const [focusIndex, setFocusIndex] = useState(0);
  const pausedRef = useRef(false);
  const reduced = useReducedMotion();

  const pointer = usePointerRef(containerRef, { enabled: !reduced });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    return observeOnce(el, () => setActive(true));
  }, []);

  /* The travelling signal. One state change per stage — slow enough that
     it costs nothing, and it stops entirely when someone is reading. */
  useEffect(() => {
    if (!active || reduced) return;
    let timer = 0;
    const tick = () => {
      if (!pausedRef.current) {
        setSignal((s) => (s + 1) % TECH_STAGES.length);
      }
      timer = window.setTimeout(tick, STAGE_MS);
    };
    timer = window.setTimeout(tick, STAGE_MS);
    return () => window.clearTimeout(timer);
  }, [active, reduced]);

  /* Pointer glow, written straight to a custom property. No renders. */
  useEffect(() => {
    if (!active || reduced) return;
    const el = containerRef.current;
    if (!el) return;
    let frame = 0;
    const write = () => {
      frame = requestAnimationFrame(write);
      const { x, y } = pointer.current;
      el.style.setProperty("--lab-px", `${50 + x * 34}%`);
      el.style.setProperty("--lab-py", `${50 + y * 34}%`);
    };
    frame = requestAnimationFrame(write);
    return () => cancelAnimationFrame(frame);
  }, [active, reduced, pointer]);

  const handleOpen = useCallback((id) => {
    setOpenId((prev) => (prev === id ? null : id));
  }, []);

  const onKeyDown = useRovingIndex({
    count: TECH_STAGES.length,
    index: focusIndex,
    onChange: (next) => {
      setFocusIndex(next);
      const nodes = railRef.current?.querySelectorAll(".lab-node");
      nodes?.[next]?.focus();
    },
    orientation: "horizontal",
  });

  const openStage = openId
    ? TECH_STAGES.find((s) => s.id === openId)
    : TECH_STAGES[signal];

  return (
    <div
      ref={containerRef}
      className={`lab${active ? " is-active" : ""}${reduced ? " is-still" : ""}`}
      onPointerEnter={() => { pausedRef.current = true; }}
      onPointerLeave={() => { pausedRef.current = false; }}
      onFocusCapture={() => { pausedRef.current = true; }}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) pausedRef.current = false;
      }}
    >
      {/* Bench surface: a fine grid that the pointer lights up. */}
      <div className="lab-surface" aria-hidden="true" />

      <header className="lab-head">
        <TechnicalLabel>03 · The loop</TechnicalLabel>
        <p className="lab-head-note">
          How I work with models — conceptual, not a production architecture.
        </p>
      </header>

      <div
        ref={railRef}
        className="lab-rail"
        role="tablist"
        aria-label="AI working loop"
        aria-orientation="horizontal"
      >
        {TECH_STAGES.map((stage, i) => {
          const state =
            i === signal ? "live" : i === (signal - 1 + TECH_STAGES.length) % TECH_STAGES.length ? "trailing" : "idle";
          return (
            <React.Fragment key={stage.id}>
              <StageNode
                stage={stage}
                index={i}
                state={reduced ? "idle" : state}
                isOpen={openId === stage.id}
                onOpen={handleOpen}
                onKeyDown={onKeyDown}
                tabIndex={i === focusIndex ? 0 : -1}
              />
              {i < TECH_STAGES.length - 1 && (
                <Connector live={!reduced && signal === i + 1} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* The loop-back arc: iterate returns to context. */}
      <svg className="lab-return" viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden="true">
        <path
          className={`lab-return-path${!reduced && signal === 0 ? " is-live" : ""}`}
          d="M96 1 C96 9, 88 10, 50 10 C12 10, 4 9, 4 1"
        />
      </svg>
      <p className="lab-return-label" aria-hidden="true">ITERATE → CONTEXT</p>

      {/* Readout. Follows the signal, or pins to whatever was opened. */}
      <div
        className="lab-readout"
        id="lab-readout"
        role="region"
        aria-live="polite"
        aria-label="Stage detail"
      >
        <div className="lab-readout-head">
          <span className="lab-readout-order">{openStage.order}</span>
          <h4 className="lab-readout-title">{openStage.title}</h4>
          {openId && (
            <button
              type="button"
              className="lab-readout-unpin"
              onClick={() => setOpenId(null)}
              aria-label="Unpin and resume the loop"
            >
              UNPIN
            </button>
          )}
        </div>
        <p className="lab-readout-summary" key={openStage.id}>
          {openStage.summary}
        </p>
        <ul className="lab-readout-notes">
          {openStage.notes.map((note, i) => (
            <li key={note} style={{ "--note-index": i }}>
              {note}
            </li>
          ))}
        </ul>
      </div>

      <p className="lab-foot">
        <span className="lab-caret" aria-hidden="true">_</span>
        Conceptual workflow. No live model runs on this page, and no
        performance figures are shown because none have been measured.
      </p>
    </div>
  );
}
