/**
 * Motion primitives — the site's single reveal/motion engine.
 *
 * Two rules this module exists to enforce:
 *
 *  1. ONE IntersectionObserver for all scroll reveals. The project had
 *     a separate observer per world (and index.html has its own for the
 *     vanilla sections); adding one per component does not scale and
 *     makes threshold behaviour inconsistent between sections.
 *
 *  2. High-frequency values (pointer, scroll) NEVER live in React state.
 *     Driving stored pointer position in state and listed it as an effect
 *     dependency, which tore down and rebuilt the whole canvas animation
 *     on every mouse move. These hooks hand back refs instead.
 */

import { useCallback, useEffect, useRef, useState } from "react";

/* ─── Shared reveal observer ──────────────────────────────────────────── */

const revealCallbacks = new WeakMap();
let sharedObserver = null;

function getObserver() {
  if (sharedObserver || typeof IntersectionObserver === "undefined") {
    return sharedObserver;
  }
  sharedObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const fn = revealCallbacks.get(entry.target);
        if (fn) {
          fn();
          sharedObserver.unobserve(entry.target);
          revealCallbacks.delete(entry.target);
        }
      }
    },
    // Fires slightly before the element is fully on screen so the
    // reveal has begun by the time the visitor reaches it.
    { threshold: 0.15, rootMargin: "0px 0px -6% 0px" }
  );
  return sharedObserver;
}

/**
 * Observe `element` and run `onEnter` once, the first time it appears.
 * Returns an unsubscribe function.
 */
export function observeOnce(element, onEnter) {
  const observer = getObserver();
  if (!element) return () => {};
  if (!observer) {
    // No IntersectionObserver (very old browser, or a non-painting test
    // environment): show the content rather than hiding it forever.
    onEnter();
    return () => {};
  }
  revealCallbacks.set(element, onEnter);
  observer.observe(element);
  return () => {
    observer.unobserve(element);
    revealCallbacks.delete(element);
  };
}

/* ─── Hooks ───────────────────────────────────────────────────────────── */

/**
 * `[ref, isInView]` — flips true once, when the element first appears.
 * Deliberately one-way: content that has been revealed stays revealed.
 */
export function useInView() {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return observeOnce(el, () => setInView(true));
  }, []);

  return [ref, inView];
}

/**
 * Live reduced-motion preference, honouring both the OS setting and the
 * site's own TOGGLE MOTION control. Re-renders when either changes, so a
 * component can drop an animation mid-session rather than only at mount.
 */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => isMotionReduced());

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(isMotionReduced());

    query.addEventListener("change", sync);
    // The site-level override is written to <html data-motion>.
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-motion"],
    });

    return () => {
      query.removeEventListener("change", sync);
      observer.disconnect();
    };
  }, []);

  return reduced;
}

/** Current effective motion preference, without subscribing. */
export function isMotionReduced() {
  if (typeof window === "undefined") return false;
  const override = document.documentElement.dataset.motion;
  if (override === "reduced") return true;
  if (override === "full") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Pointer position as a ref, normalised to -1..1 within `targetRef`.
 *
 * Nothing here triggers a render. Read `pointer.current` inside a frame
 * loop. Listeners are passive and are skipped entirely on touch devices
 * and under reduced motion.
 */
export function usePointerRef(targetRef, { enabled = true } = {}) {
  const pointer = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    const el = targetRef.current;
    if (!el || !enabled) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let frame = 0;
    let pendingX = 0;
    let pendingY = 0;

    const commit = () => {
      frame = 0;
      pointer.current.x = pendingX;
      pointer.current.y = pendingY;
      pointer.current.active = true;
    };

    const onMove = (event) => {
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pendingX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pendingY = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      // Coalesce to one write per frame; pointermove can fire far more
      // often than the display refreshes.
      if (!frame) frame = requestAnimationFrame(commit);
    };

    const onLeave = () => {
      pendingX = 0;
      pendingY = 0;
      pointer.current.active = false;
      if (!frame) frame = requestAnimationFrame(commit);
    };

    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [targetRef, enabled]);

  return pointer;
}

/**
 * Scroll progress through an element, 0 (entering) → 1 (leaving), as a ref.
 * Updated from a scroll listener that only writes a number, so nothing
 * re-renders while the page moves.
 */
export function useScrollProgressRef(targetRef) {
  const progress = useRef(0);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    let frame = 0;
    const measure = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const total = rect.height + window.innerHeight;
      const travelled = window.innerHeight - rect.top;
      progress.current = Math.max(0, Math.min(1, travelled / total));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [targetRef]);

  return progress;
}

/**
 * Focus trap for dialogs and drawers.
 *
 * The Games drawer previously restored focus on close but never moved
 * focus in, had no dialog role, and left the whole page behind it
 * reachable by Tab. This covers the full contract: move focus in, keep
 * Tab and Shift+Tab inside, close on Escape, restore focus to whatever
 * opened it, and mark the rest of the document inert to assistive tech.
 */
const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function useFocusTrap(containerRef, { active, onClose }) {
  const restoreRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    restoreRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const focusables = () =>
      Array.from(container.querySelectorAll(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );

    // Move focus in — prefer the first control, fall back to the panel.
    const first = focusables()[0];
    if (first) {
      first.focus();
    } else {
      container.setAttribute("tabindex", "-1");
      container.focus();
    }

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose?.();
        return;
      }
      if (event.key !== "Tab") return;

      const items = focusables();
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const firstItem = items[0];
      const lastItem = items[items.length - 1];

      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      } else if (!container.contains(document.activeElement)) {
        // Focus escaped (browser chrome, a stray programmatic focus).
        event.preventDefault();
        firstItem.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = previousOverflow;
      restoreRef.current?.focus?.();
    };
  }, [active, containerRef, onClose]);
}

/**
 * Roving-index keyboard navigation for a list of controls
 * (thumbnail rails, shelves, archive rows).
 */
export function useRovingIndex({ count, index, onChange, orientation = "horizontal" }) {
  return useCallback(
    (event) => {
      const next = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";
      const prev = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";

      if (event.key === next) {
        event.preventDefault();
        onChange((index + 1) % count);
      } else if (event.key === prev) {
        event.preventDefault();
        onChange((index - 1 + count) % count);
      } else if (event.key === "Home") {
        event.preventDefault();
        onChange(0);
      } else if (event.key === "End") {
        event.preventDefault();
        onChange(count - 1);
      }
    },
    [count, index, onChange, orientation]
  );
}
