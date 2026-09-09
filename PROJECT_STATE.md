# PROJECT STATE — Rahil Shah Portfolio

Last updated: 2026-09-09

Two sessions have run against this project:

1. **Cars crash** — diagnosed, fixed, verified. (Previous session.)
2. **Next-level upgrade** — design system, motion system, and a rebuild of
   Manga / Technology / Driving / Engineering, plus cross-section seams,
   cursor states, dialog accessibility and the command palette. (This
   session.)

---

## Current Status

The site builds, loads and runs with **zero console errors**. All five
React worlds and every vanilla section mount cleanly. Verified in a real
browser against the running dev server, not by inspection.

| Check | Result |
|---|---|
| Production build | succeeds — 581 modules, 62 asset files copied |
| Uncaught console errors across the whole page | 0 |
| Contained world faults | 0 |
| `transition: all` occurrences | **0** (was 7) |
| Driving canvas re-inits per 200 pointer moves | **0** (was ~200) |
| Section seams generated | 13 |
| Images without reserved layout space | **0** of 33 |
| Mobile horizontal overflow | none |
| Reduced motion: seam + blueprint paths still visible | 156/156 and 26/26 |

---

## Active Problem

None blocking. What remains is unfinished scope, listed under **Remaining
Work** — not defects.

---

## Completed this session

### Foundation

- **`src/styles/tokens.css`** — the systematic layers the project lacked:
  spacing scale, type scale, five motion durations, four easings, named
  z-index ladder, grid sizes, overlay/blur values. The existing colour and
  font tokens in `index.html` were deliberately **not** redefined; there is
  one palette, not two.
- **`src/lib/motion.js`** — one shared IntersectionObserver for every
  React reveal (the project had one per world), plus `usePointerRef`,
  `useScrollProgressRef`, `useFocusTrap`, `useRovingIndex`,
  `useReducedMotion`. High-frequency values are handed back as refs by
  design.
- **`src/components/motion/index.jsx`** + **`src/styles/motion.css`** —
  `Reveal` (rise / clip / line / frame), `Stagger`, `TextReveal`,
  `LineDraw`, `MagneticButton`, `TechnicalLabel`, `IndexMark`.
- **Motion gate** — `html[data-motion]` overrides the OS setting in both
  directions, persists in `localStorage`, and is wired to TOGGLE MOTION in
  the command palette.

### Worlds rebuilt

- **Technology → "MY AI LAB"** (`.lab`). A signal travels
  CONTEXT → PROMPT → MODEL → OUTPUT → ITERATE and loops back, activating
  each node and firing the connector beam it just crossed. Pauses while
  hovered or focused. Any node can be pinned. Bench grid lights under the
  pointer via a custom property — no renders. Vertical flow on handheld.
- **Driving → "NIGHT DRIVE"** (`.drive`). City silhouette with parallax,
  horizon glow, wet asphalt, roadside lamps with reflections streaming
  toward the camera, headlight cone that steers with the pointer, cockpit
  A-pillars, curving road. Instrumentation is explicitly labelled
  DECORATIVE and shows no numbers.
- **Engineering → "THE WORKSHOP"** (`.bp`). A drawing sheet that
  constructs itself across five stages: construction marks → outline and
  centrelines → components assembling → dimensions and callouts →
  revision cloud and return arc. Full-width title block. 26 paths.
- **Manga → "THE ARCHIVE"** (`.archive`). A physical shelf: books stand on
  spines, the one under the pointer rotates its cover out and lifts, and
  neighbours are pushed aside. Selecting one opens a two-page spread with
  gutter and halftone.

### Cross-section transitions

Thirteen seams are generated between sections, each drawing one world's
visual language becoming the next's — `INK · PANEL EDGE`,
`ROAD · SHOWROOM FLOOR`, `CONTOUR · DRAWING`, and so on. Geometry is
generated from a config rather than hand-authored, so all thirteen share
one implementation.

### Interaction & accessibility

- **Cursor** upgraded from one `is-art` state to a ten-state machine
  driven by `data-cursor` on any element. Still a single cursor system.
- **Games drawer** — previously had *no* dialog role, *no* `aria-modal`,
  never moved focus in, and left the page behind it Tab-reachable. Now a
  complete dialog: role, modal, labelled by its title, focus moved in and
  trapped, scroll locked, Escape closes, focus restored to the trigger.
  **Verified:** focus restored to the exact triggering element.
- **Manga open-book** and **command palette** given the same contract.
- **Command palette** — 20 commands in GO / WORLDS / ACTIONS groups,
  covering every world plus Toggle Motion (with a live FULL/REDUCED
  hint), Print Resume, Copy Email, Reset View. Focus trapped.

---

## Remaining Work

Honest list. The brief's Phase 3 was not started.

1. **Hero, About, Education, Skills, Certification, Technical Work** —
   untouched. They still use the original vanilla implementations in
   `index.html`. The brief asks for an editorial About, a constructing
   Education timeline, a Skills system diagram and case-file project
   presentation. **None of that is done.**
2. **Anime** — untouched beyond the seams either side of it. The brief's
   cinematic exhibition upgrade is not done.
3. **Gaming** — the drawer is now accessible, but the archive interaction
   itself is unchanged.
4. **Resume / print** — `window.print()` still works; the print
   stylesheet was not improved.
5. **3D asset compression** — still shipping raw GLBs (34.5 MB total).
   Only the *loading strategy* is optimised (one model resident).
6. **Micro-sound** — not implemented (optional in the brief).
7. **Deep-linking** selected states — not implemented.

### Verification gaps

- **Real touch hardware** — mobile was verified through viewport
  emulation only. Pinch-zoom, momentum scrolling and the shelf's
  snap behaviour are unverified on a real device.
- **Focus-into-dialog under a focused document** — the automated browser
  reports `document.hasFocus() === false`, so programmatic focus at open
  time could not be observed landing. The elements are focusable and an
  explicit `.focus()` call does land; the focus *trap*, Escape and focus
  *restoration* are all verified working.

---

## Files Changed

| File | Change |
|---|---|
| `src/styles/tokens.css` | **New.** Spacing, type, motion, z-index, grid, overlay tokens. |
| `src/styles/motion.css` | **New.** Motion primitive styles + reduced-motion resolution. |
| `src/styles/worlds/*.css` | **New.** driving, technology, engineering, manga. |
| `src/lib/motion.js` | **New.** Shared observer, ref-based input hooks, focus trap, roving index. |
| `src/components/motion/index.jsx` | **New.** Reveal / Stagger / TextReveal / LineDraw / Magnetic / labels. |
| `src/worlds/Technology.jsx` | Rewritten as the AI lab. |
| `src/worlds/Driving.jsx` | Rewritten; pointer architecture fixed. |
| `src/worlds/Engineering.jsx` | Rewritten as a constructing drawing sheet. |
| `src/worlds/Manga.jsx` | Rewritten as a physical shelf. |
| `src/data/tech.js` | Rewritten as five stages with a content-integrity header. |
| `src/index.css` | Now an import manifest + Cars/shared-fault styles only (991 → 477 lines). |
| `index.html` | Cursor state machine, seam generator, palette upgrade, drawer dialog contract. |
| `.gitignore` | **New.** |
| `src/worlds/Cars.jsx`, `src/data/cars.js`, `src/lib/{gltf,webgl}.js`, `src/components/ErrorBoundary.jsx` | Unchanged this session (previous session's crash fix). |

---

## Architecture Decisions

1. **One reveal engine.** `lib/motion.js` owns a single
   IntersectionObserver. Do not add another per world.
2. **High-frequency input never touches state.** Pointer and scroll go to
   refs, consumed inside frame loops. This is the rule the old Driving
   broke, and it is why that section rebuilt its canvas on every mouse
   move.
3. **One cursor, one error boundary, one palette.** Extend them; do not
   add rivals.
4. **Colour and font tokens live in `index.html`.** The systematic scales
   live in `tokens.css`. Neither file redefines the other's tokens.
5. **`pathLength="1"`** on animated SVG paths, so draw-on is one CSS rule
   with no measurement. Used by Engineering and the seams.
6. **Reduced motion never hides content.** Every disabled animation
   resolves to its *finished* state, verified: 156/156 seam paths and
   26/26 blueprint paths visible with motion off.
7. **No new dependencies.** Nothing was added or removed.

---

## Dependencies

Unchanged: react 19.2.8, react-dom 19.2.8, three 0.186.0,
@react-three/fiber 9.7.0, @react-three/drei 10.7.8, vite 8.2.2,
@vitejs/plugin-react 6.1.1.

---

## Known Bugs

- None known.
- `assets/manga/` is **empty**, so all 27 covers fall back to a typeset
  spine/cover built from the title. This is intentional and designed to
  be the real presentation; dropping a jpg into `assets/manga/covers/`
  upgrades a book with no code change.
- Three console *warnings* from three.js itself remain (deprecated
  `THREE.Clock`, AMD D3D11 shader precision notes). None originate here.

---

## Performance Issues

- `three-vendor` is 1,046 kB (284 kB gzip), code-split so it is only
  fetched when a world needs it.
- **Highest-value next optimisation: compress the GLBs** (Draco or
  Meshopt, typically 5–10×). Note drei's default Draco decoder path is a
  Google CDN — set a **local** decoder path, or this reintroduces exactly
  the external-dependency failure mode that was removed from Cars.

---

## Content Integrity

Nothing fabricated. Specifically:

- Manga chapter numbers are **Rahil's own reading positions**, not the
  series' latest published chapters. Do not "update" them.
- `src/data/tech.js` carries a header listing the only three verified
  facts it is built from. It contains **no** model names, parameter
  counts, latency, token rates, GPU specs, benchmarks or accuracy
  figures, and must never gain any — none have been measured.
- The Engineering drawing is abstract on purpose: no pinouts, no
  component values, no sensor names. The dimension figures are drawn as
  unresolved marks because there is no real measurement to report.
- Driving shows no speed, route, GPS or trip data, and the cluster is
  labelled DECORATIVE.
- The three cars are personal favourites, **not** owned.

---

## Next Recommended Actions

1. **Phase 3** — bring Hero / About / Education / Skills / Certification /
   Work up to the standard of the four rebuilt worlds. This is now the
   largest gap and the most visible one, since those sections come first.
2. **Anime** — the cinematic exhibition upgrade.
3. Compress the GLBs (local decoder).
4. Improve the print stylesheet.
5. Verify on real touch hardware.

---

## Important Things Another Model Must Preserve

- **Never put pointer or scroll position in React state.** Use the ref
  hooks in `lib/motion.js`.
- **Never reintroduce a child→parent readiness callback inside the R3F
  tree** — that was the original crash.
- **Only one vehicle mounted at a time**; hidden is not unloaded.
- **No CDN-fetched assets inside the Canvas** (no
  `<Environment preset>`, no remote Draco decoder).
- **No `transition: all`.** Name the properties.
- **Reduced motion must resolve content to its visible final state**, not
  hide it.
- `index.html` holds the working hero, nav, cursor, palette, Anime and
  Gaming. Do not migrate them to React without a reason.
- Keep `publicDir: false` plus the copy plugin in `vite.config.js`; the
  naive `publicDir` fix flattens and breaks every asset path.
