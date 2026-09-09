# Beyond the Resume — Seven Interactive Worlds Upgrade

A major experience upgrade to Rahil Shah's existing portfolio, evolving it from a strong editorial portfolio into a personal interactive exhibition with seven distinct worlds.

## Current State Analysis

The existing [index.html](file:///c:/Users/TPT14s/Downloads/website/rahil-shah-site-animation-brief-with-downloader/index.html) is a **1941-line single-file** static site with:
- Fully working design system (ink/charcoal/graphite/paper/vermilion/amber tokens)
- Typography: Big Shoulders Display, Fraunces italic, IBM Plex Sans, IBM Plex Mono
- Working systems: reveal observers, pointer handlers, custom cursor, command palette, hero animations, anime exhibition (stage+index+strip+keyboard+parallax+glare), games archive (rows+drawer+backdrop), scroll progress, education timeline, skill nodes, certification document
- 10 anime + 6 games with local artwork and graceful fallbacks
- "Beyond the Resume" index exists as a simple typographic grid — **Manga, Technology, Driving, Cars, Engineering are inert spans** (no linked sections)

## User Review Required

> [!IMPORTANT]
> **File size concern**: The existing `index.html` is already 94KB as a single file. Adding 5 major new sections with their CSS + JS + HTML will push this well past 200KB. The plan keeps it as a single file per the user's "static HTML/CSS/JS" requirement, but if at any point you'd prefer splitting into separate CSS/JS files, please say so.

> [!IMPORTANT]
> **Car & Driving imagery**: The three garage vehicles (R34 GT-R, AE86, 911 GT3/GT3 RS) currently have no image assets. The implementation will use a **premium placeholder system** with silhouette/gradient treatments until real images are supplied. Same for Driving section atmospherics.

> [!IMPORTANT]
> **Manga content**: No manga titles are specified. The section will be built with a data-driven array (like Anime/Games) populated with placeholder entries that make it obvious where to add real titles. No fake titles will be invented.

## Open Questions

> [!NOTE]
> **Manga titles**: Should I populate the manga shelf with any specific titles, or leave it as an empty-but-styled data array for you to fill in later?

> [!NOTE]
> **Car images**: Do you have or plan to source specific car images (side/front 3/4 views)? The architecture supports transparent PNG cutouts, side views, front views — I'll build the data model and placeholder system so dropping in images is seamless.

---

## Proposed Changes

This follows the phased approach from the prompt. All changes happen in the existing single-file `index.html` plus new asset directories.

---

### Phase 1 — Architecture & Data Models

#### [MODIFY] [index.html](file:///c:/Users/TPT14s/Downloads/website/rahil-shah-site-animation-brief-with-downloader/index.html)

**New data models** (JS arrays, same pattern as existing ANIME/GAMES):
- `MANGA` — title, volume count, author (if known), accent, img path, description
- `CARS` — name, designation, era, description, images (front/side/rear/hero), accent
- `DRIVING` — conceptual data for the night-drive dashboard (speed labels, route labels — all decorative)
- `TECH_NODES` — concept name, description, connections, icon
- `ENGINEERING_STAGES` — stage name, description, diagram data

**New asset directories** (created empty with README):

#### [NEW] `assets/manga/README.txt`
#### [NEW] `assets/cars/README.txt`
#### [NEW] `assets/driving/README.txt`
#### [NEW] `assets/engineering/README.txt`
#### [NEW] `assets/technology/README.txt`

---

### Phase 2 — Five New Sections (HTML + CSS + JS)

Each section gets its own distinct visual language and interaction model.

#### MANGA — "The Archive"
- **Concept**: Horizontal manga shelf with physical-book depth
- **Visual**: Paper textures, panel borders, ink, halftone, book spines
- **Interaction**: Hover lifts a volume, neighbors shift, click opens an editorial reading view with page-spread layout
- **Motion**: Panel reveal, ink wipe, stagger, shared-axis transition
- **Mobile**: Horizontal scrollable shelf, single selected book

#### TECHNOLOGY — "My AI Lab"  
- **Concept**: Node-graph workspace showing how Rahil thinks about AI
- **Visual**: Technical control room aesthetic (editorial, not cyberpunk), connected nodes
- **Nodes**: Local LLM Deployment → Prompt Engineering → Context Engineering → Output
- **Interaction**: Hover activates connections/beams, click expands explanation panel
- **Motion**: SVG stroke drawing, beam travel, packet animation, terminal cursor
- **Mobile**: Vertical node flow

#### DRIVING — "Night Drive"
- **Concept**: Atmospheric first-person night driving experience
- **Visual**: Road perspective, vanishing point, dashboard instrumentation, lane markers, light streaks
- **Interaction**: Pointer shifts horizon/headlights, scroll drives speed, dashboard indicators react
- **Motion**: Road line movement, headlight sweep, tachometer arc, speed-based transform
- **Note**: All speed/gauges are decorative — no fake telemetry
- **Mobile**: Simplified cockpit

#### CARS — "The Garage"
- **Concept**: Dark industrial Japanese showroom with three vehicles
- **Vehicles**: Nissan Skyline GT-R R34, Toyota Sprinter Trueno GT-Apex (AE86), Porsche 911 GT3/GT3 RS
- **Visual**: Showroom floor, directional lighting, floor shadows, depth, large typography
- **Interaction**: Selected car foreground, others recede, click transitions camera, showroom light sweeps
- **Switching**: Staged camera transition (not simple swap), vehicle recedes/enters with floor lighting shift
- **Views**: Front, Side, Rear conceptual views per car
- **Phrasing**: "Cars that stand out to me" — preferences, not ownership
- **Mobile**: Single-car viewport with swipe navigation

#### ENGINEERING — "The Workshop"
- **Concept**: Blueprint/technical drawing surface
- **Visual**: Construction lines, dimension markers, grid, dashed lines, callouts
- **Stages**: Idea → Design → Build → Test → Iterate
- **Content**: Raspberry Pi 5 as in-progress build (already in Technical Work — referenced here as engineering philosophy)
- **Interaction**: Hover highlights diagram lines, measurements appear, click expands stage
- **Motion**: SVG stroke draw, measurement tick animation, blueprint grid parallax, callout reveal
- **Mobile**: Vertically stacked blueprint phases

---

### Phase 3 — Motion Systems

Each section gets its own motion vocabulary (per the brief):

| Section | Primary Motion | Secondary |
|---------|---------------|-----------|
| Existing sections | Polished reveals (clip, stagger) | Spring easing on buttons |
| Anime | Layered depth, directional transitions | Rank transition, pointer glare |
| Manga | Panel reveal, ink wipe, shelf physics | Page spread, halftone |
| Technology | Beam travel, SVG stroke draw | Node activation, packet flow |
| Gaming | Image wipe, cinematic expand | Row depth, luminance |
| Driving | Road perspective, speed transform | Headlight sweep, tach arc |
| Cars | Showroom camera, light sweep | Floor shadow, silhouette parallax |
| Engineering | Construction draw, dimension expand | Callout reveal, grid parallax |

**Cursor upgrade** — extend existing `.motion-cursor` with states:
- `is-art` (existing) — for anime/manga
- `is-car` — showroom reticle
- `is-tech` — crosshair
- `is-engineering` — drafting point
- `is-driving` — subtle gauge indicator

---

### Phase 4 — Integration

#### Beyond the Resume Grid Upgrade
- Each cell gets a subtle "living" preview animation:
  - Anime: tiny artwork movement
  - Manga: panel-line motion
  - Technology: node connection pulse
  - Gaming: image strip bleed
  - Driving: road markings moving
  - Cars: headlight sweep
  - Engineering: construction lines drawing
- Hover activates the cell, adjacent cells subtly respond
- Keyboard focus produces equivalent feedback
- All cells now link to actual sections

#### Command Palette Update
Add new sections: Manga, Technology, Driving, Cars, Engineering

#### Navigation Update
Add new nav items + index rail entries for new sections

#### Cross-Section Transitions (subtle)
- Anime → Manga: ink line divider
- Manga → Technology: panel grid becomes technical grid
- Technology → Gaming: data lines become visual traces
- Gaming → Driving: screen → road perspective
- Driving → Cars: road → showroom floor
- Cars → Engineering: contour → technical drawing

---

### Phase 5 — Polish

- **Responsive**: Intentional mobile behavior per section (not scaled-down desktop)
- **Accessibility**: Keyboard navigation for all new sections, aria labels, focus states
- **Reduced motion**: `prefers-reduced-motion` removes parallax/camera/inertia, keeps opacity/state
- **Performance**: `IntersectionObserver` for lazy init, `requestAnimationFrame`, `transform`/`opacity` only, lazy image loading
- **Micro-interactions**: Button press compression, link arrow motion, image hover luminance
- **Certification upgrade**: Cursor-based paper parallax, subtle shadow change
- **Technical Work**: Animated SVG stroke drawing on schematics

---

### Phase 6 — Audit & Validation

#### [NEW] [PROJECT_STATE.md](file:///c:/Users/TPT14s/Downloads/website/rahil-shah-site-animation-brief-with-downloader/PROJECT_STATE.md)
Maintained after each phase for model handoff.

**Validation checklist** (from the brief):
1. HTML structure integrity
2. All IDs unique and correct
3. All image paths valid
4. No broken image references
5. JavaScript syntax valid
6. Desktop behavior
7. Mobile behavior
8. Keyboard navigation
9. Reduced-motion behavior
10. Command palette with all sections
11. Anime selection still works
12. Games drawer still works
13. Manga interaction works
14. Technology interaction works
15. Driving interaction works
16. Garage interaction works
17. Engineering interaction works
18. No console errors
19. No duplicate event listeners
20. No performance regressions
21. Existing functionality preserved
22. Visual coherence audit

---

## Verification Plan

### Automated Tests
- Open the site in browser, run through all sections
- Check console for JS errors
- Verify all image paths resolve or gracefully fallback
- Test keyboard navigation (Tab, Arrow keys, Enter, Escape)

### Manual Verification
- Visual audit of each section on desktop
- Responsive check at 640px, 768px, 1024px, 1440px
- Reduced-motion media query test
- Command palette with all new sections
- Cross-browser: the site uses standard CSS/JS, no vendor-specific APIs

---

## Implementation Notes

- **Single file architecture preserved**: Everything stays in `index.html`
- **No new dependencies**: Pure HTML/CSS/JS, same as existing
- **Design token reuse**: All new sections use existing `--ink`, `--paper`, `--vermilion`, etc.
- **Observer reuse**: Extend existing `revealObserver` and `lateObserver` patterns
- **Cursor reuse**: Extend existing `.motion-cursor` — no second cursor system
- **Image loader reuse**: Same `loadArt()` / `preload()` / `accentVars()` functions
- **Easing reuse**: Same `--ease` and `--ease-spring` custom properties
- **Estimated final file size**: ~280-320KB (large but acceptable for a single-page portfolio with inline CSS/JS)
