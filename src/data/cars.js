/**
 * CAR DATA — The Garage
 *
 * These are personal favourites. They are NOT ownership claims and the
 * UI must never imply otherwise ("Garage picks" / "Cars that stand out").
 *
 * `glb` paths point at real local assets. Never swap these for images.
 *
 * `stage` carries the authored showroom treatment for each car — light
 * temperature, rim intensity, floor tint and reflection strength — so the
 * three vehicles read as three different rooms rather than one preset
 * with the model swapped out.
 *
 * `lengthUnits` is scene-scale only. It exists so the AE86 reads as the
 * smaller car next to the other two; it is never surfaced as a spec.
 *
 * `headingOffset` (radians) squares up each model's own forward axis. The
 * three GLBs were authored by different people and do not agree on which way
 * is front — without this the Porsche presents its rear in the "3/4" view and
 * the FRONT / REAR buttons are swapped for that car alone.
 */

export const CARS = [
  {
    id: "r34",
    name: "Nissan Skyline GT-R R34",
    designation: "BNR34 V-Spec II Nür",
    era: "1999–2002",
    tone: "Iconic · Aggressive · JDM · Night",
    description:
      "The R34 defined a generation of JDM culture. The final evolution of the Skyline GT-R line before the R35 era.",
    glb: "/assets/cars/2002-nissan-skyline-gt-r-v-spec-ii-nur-r34/source/2002 Nissan Skyline GT-R V-Spec II Nur.glb",
    accent: "steel",
    lengthUnits: 4.6,
    headingOffset: 0,
    // Dark showroom. Cold key, hard vermilion rim, deep floor.
    stage: {
      key: { color: "#DDE3E6", intensity: 2.0, position: [6, 7.5, 4] },
      rim: { color: "#C6402E", intensity: 0.85, position: [-6, 2.6, -5.5] },
      fill: { color: "#8FA0AD", intensity: 0.5 },
      floor: "#0B0B0C",
      grid: "#22252A",
      shadowOpacity: 0.62,
      envIntensity: 0.75,
    },
    views: {
      default: { position: [4.6, 1.55, 4.9], target: [0, 0.62, 0] },
      front: { position: [0.1, 1.15, 6.1], target: [0, 0.62, 0.2] },
      side: { position: [6.6, 1.05, 0.2], target: [0, 0.6, 0] },
      rear: { position: [-0.4, 1.45, -6.0], target: [0, 0.62, -0.2] },
      detail: { position: [2.1, 0.86, 2.35], target: [0.55, 0.62, 0.9] },
    },
  },
  {
    id: "ae86",
    name: "Toyota Sprinter Trueno GT-Apex",
    designation: "AE86 · Project D",
    era: "1983–1987",
    tone: "Lightweight · Touge · Street · Initial D",
    description:
      "The lightweight FR layout that became synonymous with mountain-road driving. An icon of touge culture.",
    glb: "/assets/cars/1985_toyota_sprinter_trueno_ae86_project_d.glb",
    accent: "amber",
    lengthUnits: 4.2,
    headingOffset: 0,
    // Street at night. Warm sodium key, softer contrast, lifted ambient.
    stage: {
      key: { color: "#F2DFBE", intensity: 1.85, position: [5, 6.6, 4.6] },
      rim: { color: "#D99A4E", intensity: 0.8, position: [-5.4, 2.4, -5.2] },
      fill: { color: "#B9762E", intensity: 0.62 },
      floor: "#100E0B",
      grid: "#2C2519",
      shadowOpacity: 0.52,
      envIntensity: 0.62,
    },
    views: {
      default: { position: [4.2, 1.5, 4.4], target: [0, 0.58, 0] },
      front: { position: [0.1, 1.1, 5.5], target: [0, 0.58, 0.2] },
      side: { position: [6.0, 1.0, 0.15], target: [0, 0.56, 0] },
      rear: { position: [-0.4, 1.4, -5.4], target: [0, 0.58, -0.2] },
      detail: { position: [1.95, 0.82, 2.15], target: [0.5, 0.58, 0.85] },
    },
  },
  {
    id: "gt3rs",
    name: "Porsche 911 GT3 RS",
    designation: "992 · 2023",
    era: "2022–present",
    tone: "Precision · Motorsport · Engineering · Technical",
    description:
      "Track-focused precision from Stuttgart. The GT3 RS represents the intersection of engineering and driving purity.",
    glb: "/assets/cars/porsche_911_gt3_rs_992_23.glb",
    accent: "vermilion",
    lengthUnits: 4.55,
    // This model is authored nose-along -Z, unlike the other two.
    headingOffset: Math.PI,
    // Technical bay. Neutral white key, clean rim, brightest reflections.
    stage: {
      key: { color: "#FFFFFF", intensity: 2.2, position: [5.5, 8.0, 3.4] },
      rim: { color: "#E2472F", intensity: 0.62, position: [-6.2, 3.0, -5.0] },
      fill: { color: "#C8CCD2", intensity: 0.48 },
      floor: "#0C0C0D",
      grid: "#24262B",
      shadowOpacity: 0.66,
      envIntensity: 0.95,
    },
    views: {
      default: { position: [4.5, 1.5, 4.8], target: [0, 0.58, 0] },
      front: { position: [0.1, 1.1, 6.0], target: [0, 0.58, 0.2] },
      side: { position: [6.5, 1.0, 0.15], target: [0, 0.56, 0] },
      rear: { position: [-0.4, 1.42, -5.9], target: [0, 0.58, -0.2] },
      detail: { position: [2.05, 0.8, 2.3], target: [0.55, 0.58, 0.9] },
    },
  },
];

export const CAR_VIEWS = [
  { key: "default", label: "3/4", title: "Three-quarter view" },
  { key: "front", label: "FRONT", title: "Front view" },
  { key: "side", label: "SIDE", title: "Side view" },
  { key: "rear", label: "REAR", title: "Rear view" },
  { key: "detail", label: "DETAIL", title: "Detail view" },
];
