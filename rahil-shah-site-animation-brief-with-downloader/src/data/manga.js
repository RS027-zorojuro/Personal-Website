/**
 * MANGA DATA — Rahil's personal manga archive
 *
 * Statuses:
 *   "completed"  — finished series, canonical endpoint known
 *   "reading"    — actively reading, chapter position is personal bookmark
 *   "bookmarked" — saved but no chapter position recorded
 *   "ongoing"    — series still publishing, user following it
 *
 * IMPORTANT: currentChapter is the user's PERSONAL reading position,
 * NOT the manga's latest published chapter.
 * Do not silently update these to newer web chapters.
 */

export const MANGA = [
  // ── COMPLETED ──────────────────────────────────────────
  {
    title: "Jujutsu Kaisen",
    currentChapter: 271,
    completedChapter: 271,
    status: "completed",
    accent: "crimson",
    cover: "assets/manga/covers/jujutsu-kaisen.jpg",
  },
  {
    title: "Jujutsu Kaisen Modulo",
    currentChapter: 25,
    completedChapter: 25,
    status: "completed",
    accent: "crimson",
    cover: "assets/manga/covers/jjk-modulo.jpg",
  },
  {
    title: "Kaiju No. 8",
    currentChapter: 129,
    completedChapter: 129,
    status: "completed",
    accent: "steel",
    cover: "assets/manga/covers/kaiju-no-8.jpg",
  },
  {
    title: "Boku no Hero Academia",
    currentChapter: 431,
    completedChapter: 431,
    status: "completed",
    accent: "vermilion",
    cover: "assets/manga/covers/mha.jpg",
  },
  {
    title: "Solo Leveling",
    currentChapter: 179,
    completedChapter: 179,
    status: "completed",
    accent: "amber",
    cover: "assets/manga/covers/solo-leveling.jpg",
  },
  {
    title: "Boruto: Naruto Next Generations",
    currentChapter: 80,
    completedChapter: 80,
    status: "completed",
    accent: "amber",
    cover: "assets/manga/covers/boruto-nng.jpg",
  },
  {
    title: "Deadpool: Samurai",
    currentChapter: 26,
    completedChapter: 26,
    status: "completed",
    accent: "vermilion",
    cover: "assets/manga/covers/deadpool-samurai.jpg",
  },

  // ── CURRENTLY READING ──────────────────────────────────
  {
    title: "One Piece",
    currentChapter: 1192,
    status: "reading",
    accent: "amber",
    cover: "assets/manga/covers/one-piece.jpg",
  },
  {
    title: "Black Clover",
    currentChapter: 392,
    status: "reading",
    accent: "crimson",
    cover: "assets/manga/covers/black-clover.jpg",
  },
  {
    title: "Omniscient Reader's Viewpoint",
    currentChapter: 311,
    status: "reading",
    accent: "steel",
    cover: "assets/manga/covers/orv.jpg",
  },
  {
    title: "Sakamoto Days",
    currentChapter: 273,
    status: "reading",
    accent: "steel",
    cover: "assets/manga/covers/sakamoto-days.jpg",
  },
  {
    title: "The Beginning After the End",
    currentChapter: 251,
    status: "reading",
    accent: "amber",
    cover: "assets/manga/covers/tbate.jpg",
  },
  {
    title: "Dandadan",
    currentChapter: 245,
    status: "reading",
    accent: "vermilion",
    cover: "assets/manga/covers/dandadan.jpg",
  },
  {
    title: "The Player That Can't Level Up",
    currentChapter: 242,
    status: "reading",
    accent: "steel",
    cover: "assets/manga/covers/player-cant-level-up.jpg",
  },
  {
    title: "Onepunch-Man",
    currentChapter: 238,
    status: "reading",
    accent: "amber",
    cover: "assets/manga/covers/opm.jpg",
  },
  {
    title: "Fairy Tail: 100 Years Quest",
    currentChapter: 219,
    status: "reading",
    accent: "vermilion",
    cover: "assets/manga/covers/ft-100yq.jpg",
  },
  {
    title: "Hunter X Hunter",
    currentChapter: 347,
    status: "reading",
    accent: "steel",
    cover: "assets/manga/covers/hxh.jpg",
  },
  {
    title: "Kagurabachi",
    currentChapter: 130,
    status: "reading",
    accent: "crimson",
    cover: "assets/manga/covers/kagurabachi.jpg",
  },
  {
    title: "Tensei Shitara Slime Datta Ken",
    currentChapter: 119,
    status: "reading",
    accent: "amber",
    cover: "assets/manga/covers/tensura.jpg",
  },
  {
    title: "Dragon Ball Super",
    currentChapter: 104,
    status: "reading",
    accent: "amber",
    cover: "assets/manga/covers/dbs.jpg",
  },
  {
    title: "Solo Leveling: Ragnarok",
    currentChapter: 68,
    status: "reading",
    accent: "amber",
    cover: "assets/manga/covers/sl-ragnarok.jpg",
  },
  {
    title: "A Story About Smoking at the Back of the Supermarket",
    currentChapter: 63,
    status: "reading",
    accent: "steel",
    cover: "assets/manga/covers/smoking-supermarket.jpg",
  },
  {
    title: "They Are Still Being Shaken This Morning",
    currentChapter: 50,
    status: "reading",
    accent: "steel",
    cover: "assets/manga/covers/shaken-morning.jpg",
  },
  {
    title: "Haimiya-Senpai is Scary But Cute",
    currentChapter: 40,
    status: "reading",
    accent: "vermilion",
    cover: "assets/manga/covers/haimiya-senpai.jpg",
  },
  {
    title: "Boruto: Two Blue Vortex",
    currentChapter: 36,
    status: "reading",
    accent: "amber",
    cover: "assets/manga/covers/boruto-tbv.jpg",
  },

  // ── BOOKMARKED (no chapter position) ───────────────────
  {
    title: "Gachiakuta",
    status: "bookmarked",
    accent: "steel",
    cover: "assets/manga/covers/gachiakuta.jpg",
  },
  {
    title: "Countach",
    status: "bookmarked",
    accent: "amber",
    cover: "assets/manga/covers/countach.jpg",
  },
];
