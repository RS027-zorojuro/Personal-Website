/**
 * Manga World — "THE ARCHIVE"
 *
 * A physical shelf, not a card grid. Books stand on their spines at a
 * slight angle; the one under the pointer lifts and pushes its
 * neighbours aside; selecting one pulls it off the shelf and opens it
 * into a two-page spread.
 *
 * ── Performance note ─────────────────────────────────────────────────
 *
 * Neighbour displacement is the interesting problem here. Doing it in
 * React state would re-render all 27 books on every hover. Instead the
 * shelf writes a `--dx` custom property directly onto the handful of
 * elements near the pointer — a constant number of DOM writes per hover
 * and zero renders. Only *selection* (a deliberate, infrequent act) goes
 * through state.
 *
 * ── Assets ───────────────────────────────────────────────────────────
 *
 * assets/manga/ is currently empty, so every cover falls back to a
 * typeset spine built from the title. The fallback is designed to be the
 * real presentation rather than a placeholder — dropping a jpg into
 * assets/manga/covers/ upgrades a book with no code change.
 *
 * ── Content ──────────────────────────────────────────────────────────
 *
 * currentChapter is Rahil's personal reading position, NOT the series'
 * latest published chapter. Do not "update" these. No ratings, no
 * reviews, no invented commentary.
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { MANGA } from "../data/manga.js";
import {
  observeOnce,
  useFocusTrap,
  useReducedMotion,
  useRovingIndex,
} from "../lib/motion.js";
import { TechnicalLabel, IndexMark } from "../components/motion/index.jsx";

const FILTERS = [
  { id: "all", label: "ALL" },
  { id: "reading", label: "READING" },
  { id: "completed", label: "COMPLETED" },
  { id: "bookmarked", label: "BOOKMARKED" },
];

const STATUS_TEXT = {
  reading: "CURRENTLY READING",
  completed: "COMPLETED",
  bookmarked: "BOOKMARKED",
};

/* How far a neighbour is pushed aside, by distance from the focused
   book. Scaled to the wider cover plate so books actually make room for
   the one being pulled out instead of overlapping it. */
const DISPLACE = [0, 26, 14, 6];

function initials(title) {
  return title
    .split(/[\s:·—-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function chapterLine(item) {
  if (item.status === "completed" && item.completedChapter) {
    return `CH. ${item.completedChapter} / ${item.completedChapter}`;
  }
  if (item.currentChapter) return `CH. ${item.currentChapter}`;
  return "NOT STARTED";
}

/* ─── One book on the shelf ───────────────────────────────────────── */

const Book = React.forwardRef(function Book(
  { item, index, isSelected, onSelect, onFocusBook, tabIndex, onKeyDown },
  ref
) {
  const [failed, setFailed] = useState(false);

  return (
    <button
      ref={ref}
      type="button"
      role="option"
      aria-selected={isSelected}
      tabIndex={tabIndex}
      className={`shelf-book${isSelected ? " is-pulled" : ""}`}
      data-accent={item.accent}
      data-cursor="manga"
      style={{ "--book-index": index }}
      onClick={() => onSelect(index)}
      onKeyDown={onKeyDown}
      onPointerEnter={() => onFocusBook(index)}
      onFocus={() => onFocusBook(index)}
      aria-label={`${item.title} — ${STATUS_TEXT[item.status] || item.status}, ${chapterLine(item)}`}
    >
      {/* Spine: what you actually see on a shelf. */}
      <span className="shelf-spine" aria-hidden="true">
        <span className="shelf-spine-head" />
        <span className="shelf-spine-title">{item.title}</span>
        <span className="shelf-spine-mark">{initials(item.title)}</span>
      </span>

      {/* Cover: revealed as the book rotates out under the pointer. */}
      <span className="shelf-cover" aria-hidden="true">
        {item.cover && !failed ? (
          <img
            src={item.cover}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
          />
        ) : (
          <span className="shelf-cover-typeset">
            <span className="shelf-cover-mark">{initials(item.title)}</span>
            <span className="shelf-cover-title">{item.title}</span>
          </span>
        )}
        <span className="shelf-cover-halftone" />
      </span>

      {/* Page block — the paper edge, which is what sells the depth. */}
      <span className="shelf-pages" aria-hidden="true" />
    </button>
  );
});

/* ─── Opened book (dialog) ────────────────────────────────────────── */

function OpenBook({ item, index, total, onClose, onStep }) {
  const panelRef = useRef(null);
  const [failed, setFailed] = useState(false);
  useFocusTrap(panelRef, { active: true, onClose });

  return (
    <div className="archive-scrim" onClick={onClose}>
      <div
        ref={panelRef}
        className="openbook"
        role="dialog"
        aria-modal="true"
        aria-labelledby="openbook-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left leaf — the cover */}
        <div className="openbook-leaf openbook-left" data-accent={item.accent}>
          {item.cover && !failed ? (
            <img
              className="openbook-art"
              src={item.cover}
              alt=""
              onError={() => setFailed(true)}
            />
          ) : (
            <div className="openbook-typeset">
              <span className="openbook-mark">{initials(item.title)}</span>
              <span className="openbook-imprint">ARCHIVE</span>
            </div>
          )}
          <span className="openbook-halftone" aria-hidden="true" />
        </div>

        {/* Gutter — the spine of the open book */}
        <div className="openbook-gutter" aria-hidden="true" />

        {/* Right leaf — the record */}
        <div className="openbook-leaf openbook-right">
          <IndexMark current={index + 1} total={total} />
          <h3 className="openbook-title" id="openbook-title">
            {item.title}
          </h3>

          <dl className="openbook-record">
            <div>
              <dt>STATUS</dt>
              <dd className={`is-${item.status}`}>
                {STATUS_TEXT[item.status] || item.status}
              </dd>
            </div>
            <div>
              <dt>POSITION</dt>
              <dd>{chapterLine(item)}</dd>
            </div>
          </dl>

          <p className="openbook-note">
            Chapter position is my own bookmark, not the series&rsquo; latest
            release.
          </p>

          <div className="openbook-controls">
            <button
              type="button"
              className="openbook-step"
              onClick={() => onStep(-1)}
              aria-label="Previous book"
            >
              ←
            </button>
            <button
              type="button"
              className="openbook-step"
              onClick={() => onStep(1)}
              aria-label="Next book"
            >
              →
            </button>
            <button
              type="button"
              className="openbook-close"
              onClick={onClose}
              data-cursor="close"
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── The archive ─────────────────────────────────────────────────── */

export default function MangaWorld() {
  const containerRef = useRef(null);
  const shelfRef = useRef(null);
  const bookRefs = useRef([]);
  const [active, setActive] = useState(false);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [focusIndex, setFocusIndex] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    return observeOnce(el, () => setActive(true));
  }, []);

  const books = useMemo(
    () => (filter === "all" ? MANGA : MANGA.filter((m) => m.status === filter)),
    [filter]
  );

  const counts = useMemo(() => {
    const c = { all: MANGA.length, reading: 0, completed: 0, bookmarked: 0 };
    for (const m of MANGA) if (c[m.status] !== undefined) c[m.status] += 1;
    return c;
  }, []);

  /**
   * Neighbour displacement, written straight to the DOM.
   * Called on every pointerenter; touching only the books within range
   * keeps this O(1) and renders nothing.
   */
  const displace = useCallback(
    (focus) => {
      if (reduced) return;
      const nodes = bookRefs.current;
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (!node) continue;
        const distance = Math.abs(i - focus);
        const push = DISPLACE[distance] ?? 0;
        const dx = focus === -1 || distance === 0 ? 0 : (i < focus ? -push : push);
        node.style.setProperty("--dx", `${dx}px`);
        node.style.setProperty("--near", distance <= 3 && focus !== -1 ? "1" : "0");
      }
    },
    [reduced]
  );

  const onFocusBook = useCallback(
    (index) => {
      setFocusIndex(index);
      displace(index);
    },
    [displace]
  );

  const clearFocus = useCallback(() => displace(-1), [displace]);

  /* Reset displacement whenever the visible set changes, or stale
     offsets stick to books that moved position in the list. */
  useEffect(() => {
    bookRefs.current.length = books.length;
    displace(-1);
  }, [books, displace]);

  const step = useCallback(
    (delta) => {
      setSelected((prev) => {
        if (prev === null) return prev;
        return (prev + delta + books.length) % books.length;
      });
    },
    [books.length]
  );

  const onKeyDown = useRovingIndex({
    count: books.length,
    index: focusIndex,
    onChange: (next) => {
      setFocusIndex(next);
      displace(next);
      bookRefs.current[next]?.focus();
    },
    orientation: "horizontal",
  });

  return (
    <div
      ref={containerRef}
      className={`archive${active ? " is-active" : ""}`}
    >
      <header className="archive-head">
        <TechnicalLabel>02 · The archive</TechnicalLabel>
        <p className="archive-stats">
          <span>{counts.all} titles</span>
          <i aria-hidden="true">·</i>
          <span>{counts.reading} reading</span>
          <i aria-hidden="true">·</i>
          <span>{counts.completed} completed</span>
          <i aria-hidden="true">·</i>
          <span>{counts.bookmarked} bookmarked</span>
        </p>
      </header>

      <div className="archive-filters" role="tablist" aria-label="Filter the archive">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            className={`archive-filter${filter === f.id ? " is-active" : ""}`}
            onClick={() => {
              setFilter(f.id);
              setFocusIndex(0);
            }}
          >
            {f.label}
            <span className="archive-filter-count">{counts[f.id]}</span>
          </button>
        ))}
      </div>

      {/* The shelf itself. */}
      <div className="archive-shelf-wrap">
        <div
          ref={shelfRef}
          className="archive-shelf"
          role="listbox"
          aria-label="Manga shelf"
          aria-orientation="horizontal"
          onPointerLeave={clearFocus}
          data-cursor="drag"
        >
          {books.map((item, i) => (
            <Book
              key={item.title}
              ref={(el) => {
                bookRefs.current[i] = el;
              }}
              item={item}
              index={i}
              isSelected={selected === i}
              onSelect={setSelected}
              onFocusBook={onFocusBook}
              tabIndex={i === focusIndex ? 0 : -1}
              onKeyDown={onKeyDown}
            />
          ))}
        </div>
        {/* The board the books stand on. */}
        <div className="archive-board" aria-hidden="true" />
      </div>

      <p className="archive-foot">
        Chapter numbers are my own reading positions, not the latest
        published chapters. Covers load from local files when present.
      </p>

      {selected !== null && books[selected] && (
        <OpenBook
          item={books[selected]}
          index={selected}
          total={books.length}
          onClose={() => setSelected(null)}
          onStep={step}
        />
      )}
    </div>
  );
}
