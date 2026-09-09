/**
 * main.jsx — React Island Mounter
 *
 * This file mounts React components into specific DOM containers
 * within the existing vanilla HTML page. It does NOT take over
 * the entire page — existing vanilla JS for Anime, Gaming,
 * hero, cursor, etc. continues to run independently.
 *
 * Each "world" is lazily loaded so Three.js/R3F only downloads
 * when the Cars section is actually needed.
 */

import React, { lazy, Suspense, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

// Lazy-load each world so initial page load stays fast
const MangaWorld = lazy(() => import("./worlds/Manga.jsx"));
const TechnologyWorld = lazy(() => import("./worlds/Technology.jsx"));
const DrivingWorld = lazy(() => import("./worlds/Driving.jsx"));
const CarsWorld = lazy(() => import("./worlds/Cars.jsx"));
const EngineeringWorld = lazy(() => import("./worlds/Engineering.jsx"));

// Design tokens matching the existing CSS custom properties
export const tokens = {
  ink: "#0E0D0C",
  inkSoft: "#131110",
  charcoal: "#1B1815",
  graphite: "#252119",
  graphiteHi: "#332C22",
  line: "rgba(243,238,227,.14)",
  lineStrong: "rgba(243,238,227,.26)",
  paper: "#F3EEE3",
  paperDim: "#CFC7B4",
  paperFaint: "#8B8474",
  vermilion: "#C6402E",
  vermilionBright: "#E2472F",
  amber: "#B9762E",
  amberBright: "#D99A4E",
  steel: "#6E7168",
  crimson: "#7A2418",
};

// Loading fallback that matches the site's design language
function WorldLoader({ label }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 200,
        fontFamily: "var(--font-mono, 'IBM Plex Mono', monospace)",
        fontSize: "0.78rem",
        letterSpacing: "0.1em",
        color: tokens.paperFaint,
        gap: 12,
      }}
    >
      <span
        style={{
          width: 22,
          height: 1,
          background: tokens.vermilionBright,
          display: "inline-block",
        }}
      />
      {label || "LOADING"}
    </div>
  );
}

// Visibility-aware wrapper: only renders the world when near viewport
function LazyWorld({ rootId, children, label }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = document.getElementById(rootId);
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { rootMargin: "200px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [rootId]);

  if (!visible) return <WorldLoader label={label} />;

  return (
    <Suspense fallback={<WorldLoader label={label} />}>{children}</Suspense>
  );
}

/**
 * Mount one world into its DOM container.
 *
 * Every world is wrapped in an ErrorBoundary. Each world already has its own
 * React root, so a failure cannot reach its siblings — but without a boundary
 * an uncaught error still blanks that world's container. The boundary turns
 * that into an on-brand "unavailable" note instead. This matters most for
 * Cars, where React Three Fiber deliberately re-throws any error from inside
 * the Canvas out into the surrounding tree.
 */
function mountWorld(containerId, component, label, fault) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const root = createRoot(el);
  root.render(
    <React.StrictMode>
      <ErrorBoundary
        label={containerId}
        title={fault.title}
        message={fault.message}
        hint="Everything else on the page is unaffected."
      >
        <LazyWorld rootId={containerId} label={label}>
          {component}
        </LazyWorld>
      </ErrorBoundary>
    </React.StrictMode>
  );
}

// Wait for DOM to be ready, then mount all worlds
function init() {
  mountWorld("manga-root", <MangaWorld />, "LOADING ARCHIVE", {
    title: "ARCHIVE",
    message: "SHELF UNAVAILABLE",
  });
  mountWorld("technology-root", <TechnologyWorld />, "LOADING LAB", {
    title: "LAB",
    message: "BENCH UNAVAILABLE",
  });
  mountWorld("driving-root", <DrivingWorld />, "LOADING DRIVE", {
    title: "NIGHT DRIVE",
    message: "ROAD UNAVAILABLE",
  });
  mountWorld("cars-root", <CarsWorld />, "LOADING GARAGE", {
    title: "GARAGE",
    message: "MODEL UNAVAILABLE",
  });
  mountWorld("engineering-root", <EngineeringWorld />, "LOADING WORKSHOP", {
    title: "WORKSHOP",
    message: "DRAWING UNAVAILABLE",
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
