/**
 * Motion primitives.
 *
 * These exist so a reveal in Manga and a reveal in Engineering are the
 * same reveal — the project previously hand-rolled `opacity: 0 →
 * translateY(20px)` in three separate stylesheets with three different
 * durations. Visual diversity between worlds comes from *which*
 * primitive a world reaches for and how it is composed, not from each
 * world reinventing the timing.
 *
 * Everything here is CSS-driven: the components add a class and a
 * custom property, the browser animates. No animation library.
 */

import React, { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "../../lib/motion.js";

/**
 * Reveal — the workhorse.
 *
 * variant:
 *   "rise"  editorial copy lifting into place (default)
 *   "clip"  a masked wipe; the content is uncovered, not faded
 *   "line"  a rule drawing itself out from its origin
 *   "frame" a bordered panel assembling from its corner
 */
export function Reveal({
  as: Tag = "div",
  variant = "rise",
  delay = 0,
  direction = "up",
  className = "",
  children,
  ...rest
}) {
  const [ref, inView] = useInView();
  return (
    <Tag
      ref={ref}
      className={`mo-reveal mo-${variant} mo-dir-${direction}${
        inView ? " is-in" : ""
      }${className ? " " + className : ""}`}
      style={{ "--mo-delay": `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/**
 * Stagger — sequences its children.
 *
 * Applies an incrementing delay via a custom property rather than
 * cloning elements, so it works with any child that reads `--mo-delay`.
 */
export function Stagger({
  as: Tag = "div",
  step = 55,
  start = 0,
  variant = "rise",
  className = "",
  children,
  ...rest
}) {
  const [ref, inView] = useInView();
  const items = React.Children.toArray(children);

  return (
    <Tag
      ref={ref}
      className={`mo-stagger${inView ? " is-in" : ""}${
        className ? " " + className : ""
      }`}
      {...rest}
    >
      {items.map((child, i) => (
        <div
          key={i}
          className={`mo-reveal mo-${variant}${inView ? " is-in" : ""}`}
          style={{ "--mo-delay": `${start + i * step}ms` }}
        >
          {child}
        </div>
      ))}
    </Tag>
  );
}

/**
 * TextReveal — per-word masked rise.
 *
 * Each word sits in an overflow-hidden box and travels up from below its
 * own baseline, so the text is uncovered rather than faded in. Under
 * reduced motion it renders as plain text with no wrappers at all, which
 * also keeps it clean for screen readers and text selection.
 */
export function TextReveal({
  as: Tag = "p",
  text,
  delay = 0,
  step = 42,
  className = "",
  ...rest
}) {
  const [ref, inView] = useInView();
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <Tag className={className} {...rest}>
        {text}
      </Tag>
    );
  }

  return (
    <Tag
      ref={ref}
      className={`mo-text${inView ? " is-in" : ""}${
        className ? " " + className : ""
      }`}
      {...rest}
    >
      {text.split(" ").map((word, i) => (
        <span className="mo-word" key={i}>
          <span
            className="mo-word-inner"
            style={{ "--mo-delay": `${delay + i * step}ms` }}
          >
            {word}
          </span>
          {i < text.split(" ").length - 1 ? " " : ""}
        </span>
      ))}
    </Tag>
  );
}

/**
 * LineDraw — an SVG path that draws itself.
 *
 * Used by Engineering for construction geometry and by the section
 * seams. Measures its own length so any path works without the caller
 * hand-computing a dash array.
 */
export function LineDraw({
  d,
  duration = 900,
  delay = 0,
  play = true,
  className = "",
  ...rest
}) {
  const pathRef = useRef(null);
  const [length, setLength] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    try {
      setLength(path.getTotalLength());
    } catch {
      // getTotalLength throws on a detached or degenerate path; a length
      // of 0 just means the dash animation is skipped.
      setLength(0);
    }
  }, [d]);

  const drawn = reduced || !length;

  return (
    <path
      ref={pathRef}
      d={d}
      className={`mo-line${play ? " is-drawing" : ""}${
        className ? " " + className : ""
      }`}
      style={
        drawn
          ? undefined
          : {
              strokeDasharray: length,
              strokeDashoffset: play ? 0 : length,
              transition: `stroke-dashoffset ${duration}ms var(--ease-emphasis) ${delay}ms`,
            }
      }
      {...rest}
    />
  );
}

/**
 * MagneticButton — the control drifts a few pixels toward the pointer.
 *
 * Reserved for a small number of primary controls (see the brief: not
 * every link). Writes transforms directly to the node inside a frame
 * callback; it never sets state, so a hover costs no renders.
 */
export function MagneticButton({
  as: Tag = "button",
  strength = 0.28,
  radius = 90,
  className = "",
  children,
  ...rest
}) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let frame = 0;
    let tx = 0;
    let ty = 0;

    const apply = () => {
      frame = 0;
      el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    };

    const onMove = (event) => {
      const rect = el.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      const distance = Math.hypot(dx, dy);
      const pull = Math.max(0, 1 - distance / (rect.width / 2 + radius));
      tx = dx * strength * pull;
      ty = dy * strength * pull;
      if (!frame) frame = requestAnimationFrame(apply);
    };

    const onLeave = () => {
      tx = 0;
      ty = 0;
      if (!frame) frame = requestAnimationFrame(apply);
    };

    // Listening on the window lets the control react as the pointer
    // approaches, which is the whole point — a listener on the element
    // itself only fires once the pointer is already on top of it.
    window.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.style.transform = "";
    };
  }, [reduced, strength, radius]);

  return (
    <Tag
      ref={ref}
      className={`mo-magnetic${className ? " " + className : ""}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/**
 * TechnicalLabel — the small mono metadata mark used across every world.
 * Not motion, but it belongs with the shared primitives: it was
 * re-declared in four stylesheets with four different letter-spacings.
 */
export function TechnicalLabel({ as: Tag = "p", tone, className = "", children, ...rest }) {
  return (
    <Tag
      className={`mo-label${tone ? " mo-label-" + tone : ""}${
        className ? " " + className : ""
      }`}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** Index mark: `03 / 27`. */
export function IndexMark({ current, total, accent, className = "" }) {
  return (
    <p className={`mo-index${className ? " " + className : ""}`}>
      <span style={accent ? { color: accent } : undefined}>
        {String(current).padStart(2, "0")}
      </span>
      <i aria-hidden="true">/</i>
      <span className="mo-index-total">{String(total).padStart(2, "0")}</span>
    </p>
  );
}
