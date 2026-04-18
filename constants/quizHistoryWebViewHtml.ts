/**
 * Self-contained HTML documents for quiz history lists (fast scroll in WebView).
 * Data is JSON-injected from RN; user strings are escaped for script/HTML safety.
 */

import type { QuizHistoryBookCardVariant } from "@/constants/quizHistoryBookCardVariant";

export type QuizHistorySurfacesCss = {
  base: string;
  card: string;
  text: string;
  muted: string;
  softText: string;
  border: string;
  borderStrong: string;
  accent: string;
  accentSoft: string;
  fail: string;
  failSoft: string;
  /** Aprobados / ok (green) */
  statOk: string;
  /** En progreso (orange) */
  statProg: string;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeJsonForScript(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

export type QuizHistoryBooksLayout = "list" | "grid";

export type QuizHistoryBookCardPayload = {
  book: string;
  bookNumber: number;
  percent: number;
  totalChapters: number;
  completedChapters: number;
  passedChapters: number;
  attemptCount: number;
  lastActivityLabel: string;
  hasAnyAttempt: boolean;
  shortName: string;
  bookColor: string;
  avatarBg: string;
  segProgColor: string;
  borderAccent: string;
  inProgressChapters: number;
  notStartedChapters: number;
  segPassPct: number;
  segProgPct: number;
  segIdlePct: number;
  /** Per-chapter states for V12: `o` ok, `p` prog, `n` none */
  chapterTileStates: string;
  /** V7 list footer: e.g. `Gn 12` */
  focalChapterLabel: string;
  /** V7 subtitle: `50 cap · Gn 12 · hace 2 días` */
  metaSubtitle: string;
  statusBadgeKind: "good" | "mid" | "none";
  statusBadgeLabel: string;
  badgeBg: string;
  badgeFg: string;
  /** V16 tinted surface background */
  tintCardBg: string;
  /** V16 darker chips / mosaic panels */
  tintDeep: string;
};

function bookCardStyleVars(
  b: QuizHistoryBookCardPayload,
  idx: number,
  surfaces: QuizHistorySurfacesCss,
): string {
  const borderCol = b.hasAnyAttempt
    ? b.borderAccent
    : surfaces.borderStrong;
  return [
    `--i:${Math.min(idx, 28)}`,
    `--book:${b.bookColor}`,
    `--avatar-bg:${b.avatarBg}`,
    `--seg-prog:${b.segProgColor}`,
    `border-color:${borderCol}`,
  ].join("; ");
}

function simpleBarPct(b: QuizHistoryBookCardPayload): number {
  return b.hasAnyAttempt
    ? Math.max(0, Math.min(100, b.percent))
    : 0;
}

function buildV7BookCardHtml(
  b: QuizHistoryBookCardPayload,
  idx: number,
  layout: QuizHistoryBooksLayout,
  surfaces: QuizHistorySurfacesCss,
): string {
  const muted = !b.hasAnyAttempt;
  const style = bookCardStyleVars(b, idx, surfaces);
  const mod = layout === "grid" ? "book-card--grid" : "book-card--list";
  const w = `${simpleBarPct(b).toFixed(2)}%`;
  const badgeStyle = `background:${b.badgeBg};color:${b.badgeFg}`;
  const pctCell = b.hasAnyAttempt ? `${b.percent}%` : "—";
  const okCell = b.hasAnyAttempt ? String(b.passedChapters) : "—";
  const attCell = b.hasAnyAttempt ? String(b.attemptCount) : "—";

  if (layout === "grid") {
    return `<button type="button" class="book-card v7 ${mod}${muted ? " muted" : ""}${b.hasAnyAttempt ? " book-card--has-progress" : ""}" data-book-idx="${idx}" style="${style}">
  <div class="v7-header">
    <div class="v7-abbr-sq">${escapeHtml(b.shortName)}</div>
    <span class="v7-badge" style="${badgeStyle}">${escapeHtml(b.statusBadgeLabel)}</span>
  </div>
  <div class="v7-book-name">${escapeHtml(b.book)}</div>
  <div class="v7-meta">${escapeHtml(b.metaSubtitle)}</div>
  <div class="v7-grid3">
    <div class="v7-cell"><div class="v7-cell-val">${pctCell}</div><div class="v7-cell-lbl">aprobado</div></div>
    <div class="v7-cell"><div class="v7-cell-val">${okCell}</div><div class="v7-cell-lbl">ok</div></div>
    <div class="v7-cell"><div class="v7-cell-val">${attCell}</div><div class="v7-cell-lbl">intentos</div></div>
  </div>
  <div class="v7-bar-track"><div class="v7-bar-fill" style="width:${w}"></div></div>
</button>`;
  }

  const listMeta = b.hasAnyAttempt
    ? `${b.percent}% · ${b.passedChapters} ok · ${b.attemptCount} intentos · ${escapeHtml(b.focalChapterLabel)}`
    : "—";
  return `<button type="button" class="book-card v7 ${mod}${muted ? " muted" : ""}${b.hasAnyAttempt ? " book-card--has-progress" : ""}" data-book-idx="${idx}" style="${style}">
  <div class="v7-list-row">
    <div class="v7-abbr-sq">${escapeHtml(b.shortName)}</div>
    <div class="v7-list-main">
      <div class="v7-list-top">
        <span class="v7-list-title">${escapeHtml(b.book)}</span>
        <span class="v7-badge" style="${badgeStyle}">${escapeHtml(b.statusBadgeLabel)}</span>
      </div>
      <div class="v7-bar-track v7-bar-track--list"><div class="v7-bar-fill" style="width:${w}"></div></div>
      <div class="v7-list-meta">${listMeta}</div>
    </div>
  </div>
</button>`;
}

function buildV4BookCardHtml(
  b: QuizHistoryBookCardPayload,
  idx: number,
  layout: QuizHistoryBooksLayout,
  surfaces: QuizHistorySurfacesCss,
  segW: (pct: number) => string,
): string {
  const muted = !b.hasAnyAttempt;
  const pctStr = b.hasAnyAttempt ? `${b.percent}%` : "—";
  const style = bookCardStyleVars(b, idx, surfaces);
  const thin = layout === "list";
  const seg = `<div class="v4-seg-track${thin ? " v4-seg-track--thin" : ""}">
    <div class="v4-seg v4-seg-pass" style="flex:0 0 ${segW(b.segPassPct)}"></div>
    <div class="v4-seg v4-seg-prog" style="flex:0 0 ${segW(b.segProgPct)}"></div>
    <div class="v4-seg v4-seg-idle" style="flex:0 0 ${segW(b.segIdlePct)}"></div>
  </div>`;
  const chapsLine =
    layout === "grid"
      ? `${b.totalChapters} capítulos`
      : `Libro ${b.bookNumber} · ${b.totalChapters} capítulos`;
  const legend =
    layout === "grid"
      ? `<div class="v4-legend v4-legend--grid">
    <span class="v4-leg"><span class="v4-dot v4-dot-pass"></span> ${b.passedChapters} aprobados</span>
    <span class="v4-leg"><span class="v4-dot v4-dot-prog"></span> ${b.inProgressChapters} en progreso</span>
    <span class="v4-leg"><span class="v4-dot v4-dot-idle"></span> ${b.notStartedChapters} sin intentar</span>
  </div>`
      : `<div class="v4-legend v4-legend--list">
    <div class="v4-legend-left">
      <span class="v4-leg"><span class="v4-dot v4-dot-pass"></span> ${b.passedChapters} aprob</span>
      <span class="v4-leg"><span class="v4-dot v4-dot-prog"></span> ${b.inProgressChapters} prog</span>
    </div>
    <span class="v4-legend-meta">${escapeHtml(b.hasAnyAttempt ? b.lastActivityLabel : "—")}</span>
  </div>`;

  const mod = layout === "grid" ? "book-card--grid" : "book-card--list";

  return `<button type="button" class="book-card v4 ${mod}${muted ? " muted" : ""}${b.hasAnyAttempt ? " book-card--has-progress" : ""}" data-book-idx="${idx}" style="${style}">
  <div class="v4-top">
    <div class="v4-left">
      <div class="v4-avatar">${escapeHtml(b.shortName)}</div>
      <div class="v4-headings">
        <div class="v4-name">${escapeHtml(b.book)}</div>
        <div class="v4-sub">${escapeHtml(chapsLine)}</div>
      </div>
    </div>
    <div class="v4-pct ${b.hasAnyAttempt ? "v4-pct--on" : "v4-pct--off"}">${escapeHtml(pctStr)}</div>
  </div>
  ${seg}
  ${legend}
</button>`;
}

function buildV12BookCardHtml(
  b: QuizHistoryBookCardPayload,
  idx: number,
  layout: QuizHistoryBooksLayout,
  surfaces: QuizHistorySurfacesCss,
): string {
  const muted = !b.hasAnyAttempt;
  const pctStr = b.hasAnyAttempt ? `${b.percent}%` : "—";
  const style = bookCardStyleVars(b, idx, surfaces);
  const mod = layout === "grid" ? "book-card--grid" : "book-card--list";
  const states = b.chapterTileStates;
  const tiles = Array.from(states)
    .map((ch) => {
      const t = ch === "o" ? "o" : ch === "p" ? "p" : "n";
      return `<span class="v12-tile v12-tile--${t}"></span>`;
    })
    .join("");
  const tilesWrap = `<div class="v12-tiles v12-tiles--${layout}">${tiles}</div>`;
  const legendGrid = `<div class="v12-legend">
    <span class="v12-leg"><span class="v12-sq v12-sq--o"></span> ${b.passedChapters} ok</span>
    <span class="v12-leg"><span class="v12-sq v12-sq--p"></span> ${b.inProgressChapters} prog</span>
    <span class="v12-leg"><span class="v12-sq v12-sq--n"></span> ${b.notStartedChapters} pendiente</span>
  </div>`;

  if (layout === "grid") {
    return `<button type="button" class="book-card v12 ${mod}${muted ? " muted" : ""}${b.hasAnyAttempt ? " book-card--has-progress" : ""}" data-book-idx="${idx}" style="${style}">
  <div class="v12-top">
    <div class="v12-left">
      <span class="v12-pill">${escapeHtml(b.shortName)}</span>
      <span class="v12-title">${escapeHtml(b.book)}</span>
    </div>
    <span class="v12-pct ${b.hasAnyAttempt ? "v12-pct--on" : "v12-pct--off"}">${escapeHtml(pctStr)}</span>
  </div>
  ${tilesWrap}
  ${legendGrid}
</button>`;
  }

  const statLine = b.hasAnyAttempt
    ? `${b.percent}% · ${b.passedChapters} ok · ${b.inProgressChapters} prog`
    : "—";
  return `<button type="button" class="book-card v12 ${mod}${muted ? " muted" : ""}${b.hasAnyAttempt ? " book-card--has-progress" : ""}" data-book-idx="${idx}" style="${style}">
  <div class="v12-top v12-top--list">
    <div class="v12-left">
      <span class="v12-pill">${escapeHtml(b.shortName)}</span>
      <span class="v12-title">${escapeHtml(b.book)}</span>
    </div>
    <span class="v12-statline ${b.hasAnyAttempt ? "v12-statline--on" : ""}">${escapeHtml(statLine)}</span>
  </div>
  ${tilesWrap}
</button>`;
}

function buildV13BookCardHtml(
  b: QuizHistoryBookCardPayload,
  idx: number,
  layout: QuizHistoryBooksLayout,
  surfaces: QuizHistorySurfacesCss,
): string {
  const muted = !b.hasAnyAttempt;
  const style = bookCardStyleVars(b, idx, surfaces);
  const w = `${simpleBarPct(b).toFixed(2)}%`;
  const pct = b.hasAnyAttempt ? `${b.percent}%` : "—";
  const mod = layout === "grid" ? "book-card--grid" : "book-card--list";
  if (layout === "grid") {
    return `<button type="button" class="book-card v13 ${mod}${muted ? " muted" : ""}${b.hasAnyAttempt ? " book-card--has-progress" : ""}" data-book-idx="${idx}" style="${style}">
  <div class="v13-split">
    <div class="v13-sc">
      <div class="v13-lbl">aprobados</div>
      <div class="v13-big v13-big--book">${b.passedChapters}</div>
      <div class="v13-sub">de ${b.totalChapters} cap.</div>
    </div>
    <div class="v13-sc">
      <div class="v13-lbl">intentos</div>
      <div class="v13-big">${b.attemptCount}</div>
      <div class="v13-sub">totales</div>
    </div>
  </div>
  <div class="v13-band">
    <div class="v13-bav">${escapeHtml(b.shortName)}</div>
    <div class="v13-bti">${escapeHtml(b.book)}</div>
    <div class="v13-bpc">${escapeHtml(pct)}</div>
  </div>
  <div class="v13-bwrap"><div class="v13-bfill" style="width:${w}"></div></div>
</button>`;
  }
  const meta = `${b.totalChapters} cap · ${b.passedChapters} ok · ${b.inProgressChapters} prog · ${b.attemptCount} intentos`;
  return `<button type="button" class="book-card v13 v13--list ${mod}${muted ? " muted" : ""}${b.hasAnyAttempt ? " book-card--has-progress" : ""}" data-book-idx="${idx}" style="${style}">
  <div class="v13l-side">
    <div class="v13l-p">${b.hasAnyAttempt ? `${b.percent}<span class="v13l-pu">%</span>` : "—"}</div>
  </div>
  <div class="v13l-main">
    <div class="v13l-top"><span>${escapeHtml(b.book)}</span><span class="v13l-time">${escapeHtml(b.lastActivityLabel)}</span></div>
    <div class="v13l-sm">${meta}</div>
    <div class="v13l-bar"><div class="v13l-fill" style="width:${w}"></div></div>
  </div>
</button>`;
}

function buildV16BookCardHtml(
  b: QuizHistoryBookCardPayload,
  idx: number,
  layout: QuizHistoryBooksLayout,
  surfaces: QuizHistorySurfacesCss,
): string {
  const muted = !b.hasAnyAttempt;
  const style = [
    `--i:${Math.min(idx, 28)}`,
    `--book:${b.bookColor}`,
    `--avatar-bg:${b.avatarBg}`,
    `--seg-prog:${b.segProgColor}`,
    `--tint-bg:${b.tintCardBg}`,
    `--tint-deep:${b.tintDeep}`,
    `border-color:${b.hasAnyAttempt ? b.borderAccent : surfaces.borderStrong}`,
    `background:${b.tintCardBg}`,
  ].join("; ");
  const w = `${simpleBarPct(b).toFixed(2)}%`;
  const pct = b.hasAnyAttempt ? `${b.percent}%` : "—";
  const mod = layout === "grid" ? "book-card--grid" : "book-card--list";
  if (layout === "grid") {
    return `<button type="button" class="book-card v16 ${mod}${muted ? " muted" : ""}${b.hasAnyAttempt ? " book-card--has-progress" : ""}" data-book-idx="${idx}" style="${style}">
  <div class="v16-h">
    <div class="v16-hl">
      <div class="v16-line1">${escapeHtml(b.shortName)} · ${escapeHtml(b.book)}</div>
      <div class="v16-line2">${b.totalChapters} capítulos</div>
    </div>
    <div class="v16-pill">${escapeHtml(pct)}</div>
  </div>
  <div class="v16-bar"><div class="v16-fill" style="width:${w}"></div></div>
  <div class="v16-ft">
    <span class="v16-chip">${b.passedChapters} ok</span>
    <span class="v16-chip v16-chip--soft">${b.inProgressChapters} prog</span>
    <span class="v16-time">${escapeHtml(b.lastActivityLabel)}</span>
  </div>
</button>`;
  }
  return `<button type="button" class="book-card v16 v16--list ${mod}${muted ? " muted" : ""}${b.hasAnyAttempt ? " book-card--has-progress" : ""}" data-book-idx="${idx}" style="${style}">
  <div class="v16lr-av">${escapeHtml(b.shortName)}</div>
  <div class="v16lr-m">
    <div class="v16lr-row"><span>${escapeHtml(b.book)}</span><span class="v16lr-p">${escapeHtml(pct)}</span></div>
    <div class="v16lr-bar"><div class="v16lr-fill" style="width:${w}"></div></div>
    <div class="v16lr-ft">${b.passedChapters} ok · ${b.inProgressChapters} prog · ${b.attemptCount} intentos</div>
  </div>
</button>`;
}

function buildV29BookCardHtml(
  b: QuizHistoryBookCardPayload,
  idx: number,
  layout: QuizHistoryBooksLayout,
  surfaces: QuizHistorySurfacesCss,
): string {
  const muted = !b.hasAnyAttempt;
  const style = bookCardStyleVars(b, idx, surfaces);
  const w = `${simpleBarPct(b).toFixed(2)}%`;
  const pct = b.hasAnyAttempt ? `${b.percent}%` : "—";
  const mod = layout === "grid" ? "book-card--grid" : "book-card--list";
  const okC = surfaces.statOk;
  const progC = surfaces.statProg;
  if (layout === "grid") {
    return `<button type="button" class="book-card v29 ${mod}${muted ? " muted" : ""}${b.hasAnyAttempt ? " book-card--has-progress" : ""}" data-book-idx="${idx}" style="${style}">
  <div class="v29-head">
    <div class="v29-av">${escapeHtml(b.shortName)}</div>
    <div class="v29-ttl">${escapeHtml(b.book)}</div>
  </div>
  <div class="v29-rows">
    <div class="v29-row"><span>Total cap.</span><span>${b.totalChapters}</span></div>
    <div class="v29-row"><span>Aprobados</span><span style="color:${okC}">${b.passedChapters}</span></div>
    <div class="v29-row"><span>En progreso</span><span style="color:${progC}">${b.inProgressChapters}</span></div>
    <div class="v29-row"><span>Intentos</span><span>${b.attemptCount}</span></div>
  </div>
  <div class="v29-bar"><div class="v29-fill" style="width:${w}"></div></div>
  <div class="v29-bot">
    <span>${escapeHtml(pct)} aprobado</span>
    <span>${escapeHtml(b.lastActivityLabel)}</span>
  </div>
</button>`;
  }
  return `<button type="button" class="book-card v29 v29--list ${mod}${muted ? " muted" : ""}${b.hasAnyAttempt ? " book-card--has-progress" : ""}" data-book-idx="${idx}" style="${style}">
  <div class="v29-l">
    <div class="v29-lh">
      <div class="v29-lav">${escapeHtml(b.shortName)}</div>
      <div class="v29-lt">${escapeHtml(b.book)}</div>
    </div>
    <div class="v29-lbar"><div class="v29-lfill" style="width:${w}"></div></div>
  </div>
  <div class="v29-r">
    <div class="v29-rc"><span style="color:${okC}">${b.passedChapters}</span><span class="v29-rl">ok</span></div>
    <div class="v29-rc"><span style="color:${progC}">${b.inProgressChapters}</span><span class="v29-rl">prog</span></div>
    <div class="v29-rc"><span>${escapeHtml(pct)}</span><span class="v29-rl">aprob.</span></div>
  </div>
</button>`;
}

export function buildQuizHistoryBooksHtml(payload: {
  surfaces: QuizHistorySurfacesCss;
  metrics: {
    avgPercent: number;
    streakDays: number;
    chaptersCompleted: number;
  };
  filter: "started" | "all";
  startedCount: number;
  layout: QuizHistoryBooksLayout;
  cardVariant: QuizHistoryBookCardVariant;
  books: QuizHistoryBookCardPayload[];
}): string {
  const { surfaces, metrics, filter, startedCount, layout, books, cardVariant } =
    payload;
  const dataJson = safeJsonForScript({
    filter,
    books: books.map((b) => b.book),
  });

  const segW = (pct: number) =>
    `${Math.max(0, Math.min(100, pct)).toFixed(4)}%`;

  const booksHtml =
    books.length === 0
      ? `<div class="empty" style="--i:0">
          <div class="empty-icon">✓</div>
          <p class="empty-text">Aún no has completado ningún quiz.<br/>Comienza a leer y prueba tu conocimiento.</p>
        </div>`
      : books
        .map((b, idx) => {
          if (cardVariant === "v29") {
            return buildV29BookCardHtml(b, idx, layout, surfaces);
          }
          if (cardVariant === "v16") {
            return buildV16BookCardHtml(b, idx, layout, surfaces);
          }
          if (cardVariant === "v13") {
            return buildV13BookCardHtml(b, idx, layout, surfaces);
          }
          if (cardVariant === "v12") {
            return buildV12BookCardHtml(b, idx, layout, surfaces);
          }
          if (cardVariant === "v7") {
            return buildV7BookCardHtml(b, idx, layout, surfaces);
          }
          return buildV4BookCardHtml(b, idx, layout, surfaces, segW);
        })
        .join("");

  const filterStartedLabel = `Iniciados${startedCount > 0 ? ` · ${startedCount}` : ""}`;
  const gridColClass =
    layout === "grid" && books.length > 0
      ? filter === "started"
        ? "book-container--grid-cols-1"
        : "book-container--grid-cols-2"
      : "";
  const listContainerClass =
    books.length === 0
      ? "book-container book-container--list"
      : `book-container book-container--${layout}${gridColClass ? ` ${gridColClass}` : ""
      }`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
<style>
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  html, body { margin: 0; padding: 0; background: ${surfaces.base}; color: ${surfaces.text};
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-size: 15px; line-height: 1.35; }
  @keyframes metricsIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes controlsIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes bookCardIn {
    from { opacity: 0; transform: translateY(18px) scale(0.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes emptyIn {
    from { opacity: 0; transform: scale(0.94); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes barGrow {
    from { transform: scaleX(0.004); }
    to { transform: scaleX(1); }
  }
  .wrap { padding: 16px 16px 40px; }
  .metrics { display: flex; border: 1px solid ${surfaces.borderStrong}; border-radius: 16px; overflow: hidden; margin-bottom: 16px;
    animation: metricsIn 0.48s cubic-bezier(0.22, 1, 0.36, 1) both;
    box-shadow: 0 1px 0 ${surfaces.borderStrong}, 0 4px 14px rgba(0,0,0,0.06); }
  .metric-cell { flex: 1; text-align: center; padding: 12px 8px; border-right: 1px solid ${surfaces.borderStrong}; }
  .metric-cell:last-child { border-right: 0; }
  .metric-val { font-size: 17px; font-weight: 700; color: ${surfaces.text}; letter-spacing: -0.3px; }
  .metric-lbl { font-size: 11px; font-weight: 500; color: ${surfaces.muted}; margin-top: 2px; }
  .filter-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; align-items: center;
    animation: controlsIn 0.42s cubic-bezier(0.22, 1, 0.36, 1) both; }
  .filter-label { width: 100%; font-size: 11px; font-weight: 600; color: ${surfaces.muted}; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 2px;
    animation: controlsIn 0.42s cubic-bezier(0.22, 1, 0.36, 1) both; animation-delay: 0.06s; }
  .filter-label + .filter-row { animation-delay: 0.1s; }
  .chip { border: 1px solid ${surfaces.borderStrong}; padding: 7px 12px; border-radius: 999px; font-size: 12px; font-weight: 600;
    background: ${surfaces.card}; color: ${surfaces.muted}; cursor: pointer;
    transition: border-color 0.22s ease, background 0.22s ease, color 0.22s ease, transform 0.16s ease; }
  .chip:active { transform: scale(0.96); }
  .chip.on { border-color: ${surfaces.accent}; background: ${surfaces.accentSoft}; color: ${surfaces.accent}; }
  .book-container--grid { display: grid; gap: 12px; align-items: stretch; }
  .book-container--grid-cols-1 { grid-template-columns: 1fr; }
  .book-container--grid-cols-2 { grid-template-columns: 1fr 1fr; }
  .book-container--list { display: flex; flex-direction: column; gap: 0; }
  .book-card { background: ${surfaces.card}; border: 1px solid ${surfaces.borderStrong}; border-radius: 16px; cursor: pointer;
    text-align: left; -webkit-appearance: none; appearance: none; font: inherit; color: inherit;
    animation: bookCardIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
    animation-delay: calc(var(--i, 0) * 40ms);
    transition: filter 0.2s ease, box-shadow 0.22s ease, border-color 0.2s ease;
    box-shadow: 0 1px 0 ${surfaces.borderStrong}, 0 4px 12px rgba(0,0,0,0.05); }
  .book-card--has-progress { box-shadow: 0 1px 0 ${surfaces.borderStrong}, 0 6px 18px rgba(0,0,0,0.07); }
  .book-card:active { filter: brightness(0.97); }
  .book-card.muted { opacity: 0.52; }
  .book-card.v4.book-card--list { display: block; width: 100%; margin-bottom: 14px; padding: 14px 16px; overflow: hidden; }
  .book-card.v4.book-card--grid { display: flex; flex-direction: column; padding: 14px; min-height: 0; margin-bottom: 0; overflow: hidden; }
  .v4-top { display: flex; flex-direction: row; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 12px; }
  .v4-left { display: flex; flex-direction: row; align-items: center; gap: 12px; min-width: 0; flex: 1; }
  .v4-top .v4-avatar { width: 44px; height: 44px; border-radius: 11px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 800; letter-spacing: -0.35px; background: var(--avatar-bg); color: var(--book); }
  .book-card--grid .v4-top .v4-avatar { width: 40px; height: 40px; font-size: 12px; border-radius: 10px; }
  .v4-headings { min-width: 0; }
  .v4-name { font-size: 16px; font-weight: 700; letter-spacing: -0.35px; color: ${surfaces.text}; line-height: 1.25;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .book-card--grid .v4-name { font-size: 14px; -webkit-line-clamp: 3; }
  .v4-sub { font-size: 12px; font-weight: 500; color: ${surfaces.muted}; margin-top: 3px; }
  .v4-pct { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; line-height: 1; flex-shrink: 0; }
  .book-card--grid .v4-pct { font-size: 20px; }
  .v4-pct--on { color: var(--book); }
  .v4-pct--off { color: ${surfaces.softText}; font-size: 18px; }
  .book-card--grid .v4-pct--off { font-size: 17px; }
  .v4-seg-track { display: flex; flex-direction: row; flex-wrap: nowrap; gap: 2px; height: 8px; border-radius: 6px; overflow: hidden; margin-bottom: 12px; width: 100%; }
  .v4-seg-track--thin { height: 4px; margin-bottom: 10px; }
  .v4-seg { min-width: 0; height: 100%; border-radius: 3px; transform-origin: left center;
    animation: barGrow 0.68s cubic-bezier(0.22, 1, 0.36, 1) both;
    animation-delay: calc(var(--i, 0) * 40ms + 0.1s); }
  .v4-seg.v4-seg-pass { background: var(--book); }
  .v4-seg.v4-seg-prog { background: var(--seg-prog); }
  .v4-seg.v4-seg-idle { background: ${surfaces.borderStrong}; opacity: 0.95; }
  .v4-legend--grid { display: flex; flex-direction: column; gap: 6px; }
  .v4-legend--list { display: flex; flex-direction: row; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; }
  .v4-legend-left { display: flex; flex-wrap: wrap; gap: 10px 12px; align-items: center; }
  .v4-legend-meta { font-size: 12px; font-weight: 600; color: ${surfaces.muted}; text-align: right; }
  .v4-leg { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; color: ${surfaces.muted}; }
  .v4-dot { width: 7px; height: 7px; border-radius: 999px; flex-shrink: 0; display: inline-block; }
  .v4-dot-pass { background: var(--book); }
  .v4-dot-prog { background: var(--seg-prog); }
  .v4-dot-idle { background: transparent; border: 1px solid ${surfaces.borderStrong}; box-sizing: border-box; }
  .book-card.v7.book-card--grid { display: flex; flex-direction: column; padding: 14px 16px; min-height: 0; margin-bottom: 0; overflow: hidden; }
  .book-card.v7.book-card--list { display: block; width: 100%; margin-bottom: 12px; padding: 10px 14px; overflow: hidden; }
  .v7-header { display: flex; flex-direction: row; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 10px; }
  .v7-abbr-sq { width: 32px; height: 32px; border-radius: 10px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 800; letter-spacing: -0.2px; background: var(--avatar-bg); color: var(--book); }
  .v7-badge { font-size: 10px; font-weight: 700; padding: 3px 9px; border-radius: 999px; flex-shrink: 0; max-width: 52%; text-align: center; line-height: 1.25; }
  .v7-book-name { font-size: 14px; font-weight: 700; color: ${surfaces.text}; letter-spacing: -0.28px; margin-bottom: 3px; }
  .v7-meta { font-size: 11px; font-weight: 500; color: ${surfaces.muted}; margin-bottom: 10px; line-height: 1.35; }
  .v7-grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 4px; }
  .v7-cell { background: ${surfaces.base}; border: 1px solid ${surfaces.borderStrong}; border-radius: 10px; padding: 8px 6px; text-align: center; }
  .v7-cell-val { font-size: 14px; font-weight: 800; color: ${surfaces.text}; letter-spacing: -0.35px; }
  .v7-cell-lbl { font-size: 9px; font-weight: 600; color: ${surfaces.muted}; margin-top: 3px; text-transform: lowercase; }
  .v7-bar-track { height: 4px; border-radius: 99px; background: ${surfaces.borderStrong}; overflow: hidden; margin-top: 8px; }
  .v7-bar-fill { height: 100%; border-radius: 99px; background: var(--book); transform-origin: left center;
    animation: barGrow 0.68s cubic-bezier(0.22, 1, 0.36, 1) both; animation-delay: calc(var(--i, 0) * 40ms + 0.08s); }
  .v7-list-row { display: flex; flex-direction: row; align-items: stretch; gap: 12px; }
  .v7-list-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0; }
  .v7-list-top { display: flex; flex-direction: row; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 5px; }
  .v7-list-title { font-size: 13px; font-weight: 700; color: ${surfaces.text}; letter-spacing: -0.22px; flex: 1; min-width: 0; }
  .v7-bar-track--list { margin-top: 0; margin-bottom: 0; }
  .v7-list-meta { font-size: 10px; font-weight: 500; color: ${surfaces.muted}; margin-top: 4px; line-height: 1.35; }
  .book-card.v12.book-card--grid { display: flex; flex-direction: column; padding: 14px 16px; min-height: 0; margin-bottom: 0; overflow: hidden; }
  .book-card.v12.book-card--list { display: block; width: 100%; margin-bottom: 12px; padding: 10px 14px; overflow: hidden; }
  .v12-top { display: flex; flex-direction: row; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 10px; }
  .v12-top--list { margin-bottom: 6px; align-items: flex-start; }
  .v12-left { display: flex; flex-direction: row; align-items: center; gap: 7px; min-width: 0; flex: 1; }
  .v12-pill { display: inline-flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; padding: 3px 9px; border-radius: 999px; background: var(--avatar-bg); color: var(--book); flex-shrink: 0; letter-spacing: -0.2px; }
  .v12-title { font-size: 14px; font-weight: 700; color: ${surfaces.text}; letter-spacing: -0.28px; min-width: 0; flex: 1;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .book-card--list .v12-title { font-size: 13px; }
  .v12-pct { font-size: 13px; font-weight: 800; letter-spacing: -0.35px; flex-shrink: 0; }
  .v12-pct--on { color: var(--book); }
  .v12-pct--off { color: ${surfaces.softText}; }
  .v12-statline { font-size: 12px; font-weight: 700; letter-spacing: -0.2px; text-align: right; flex-shrink: 0; max-width: 58%; line-height: 1.25; }
  .v12-statline--on { color: var(--book); }
  .v12-statline:not(.v12-statline--on) { color: ${surfaces.softText}; font-weight: 600; }
  .v12-tiles { display: grid; gap: 2px; width: 100%; }
  .v12-tiles--grid { grid-template-columns: repeat(10, 1fr); margin-bottom: 10px; }
  .v12-tiles--list { grid-template-columns: repeat(25, 1fr); margin-bottom: 0; }
  .v12-tiles--grid .v12-tile { height: 8px; border-radius: 2px; min-width: 0; }
  .v12-tiles--list .v12-tile { height: 6px; border-radius: 1px; min-width: 0; }
  .v12-tile--o { background: var(--book); }
  .v12-tile--p { background: var(--seg-prog); }
  .v12-tile--n { background: ${surfaces.borderStrong}; opacity: 0.88; }
  .v12-legend { display: flex; flex-wrap: wrap; gap: 10px; }
  .v12-leg { display: flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 600; color: ${surfaces.muted}; }
  .v12-sq { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; display: inline-block; }
  .v12-sq--o { background: var(--book); }
  .v12-sq--p { background: var(--seg-prog); }
  .v12-sq--n { background: transparent; border: 1px solid ${surfaces.borderStrong}; box-sizing: border-box; }
  .book-card.v13 { padding: .5px; overflow: hidden; padding-bottom: 1px; }
  .book-card.v13.book-card--list { padding: 0; }
  .v13-split { display: flex; flex-direction: row; border-bottom: 1px solid ${surfaces.borderStrong}; }
  .v13-sc { flex: 1; padding: 14px 12px; text-align: center; }
  .v13-sc:first-child { border-right: 1px solid ${surfaces.borderStrong}; }
  .v13-lbl { font-size: 10px; font-weight: 600; color: ${surfaces.muted}; margin-bottom: 6px; }
  .v13-big { font-size: 26px; font-weight: 800; color: ${surfaces.text}; letter-spacing: -0.5px; line-height: 1; }
  .v13-big--book { color: var(--book); }
  .v13-sub { font-size: 10px; font-weight: 500; color: ${surfaces.muted}; margin-top: 6px; }
  .v13-band { display: flex; flex-direction: row; align-items: center; gap: 10px; padding: 10px 14px; background: ${surfaces.base}; }
  .v13-bav { width: 28px; height: 28px; border-radius: 999px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; background: var(--book); color: #fff; flex-shrink: 0; }
  .v13-bti { flex: 1; font-size: 14px; font-weight: 700; color: ${surfaces.text}; }
  .v13-bpc { font-size: 14px; font-weight: 800; color: var(--book); }
  .v13-bwrap { height: 8px; border-radius: 99px; background: ${surfaces.borderStrong}; overflow: hidden; margin: 0; }
  .v13-bfill { height: 100%; background: var(--book); border-radius: 99px;  }
  .book-card.v13--list { display: flex !important; flex-direction: row; align-items: stretch; padding: 0; min-height: 88px; width: 100%; margin-bottom: 14px; }
  .v13l-side { width: 64px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: var(--avatar-bg); border-radius: 16px 0 0 16px; }
  .v13l-p { font-size: 20px; font-weight: 800; color: var(--book); line-height: 1; text-align: center; }
  .v13l-pu { font-size: 9px; font-weight: 700; color: var(--book); opacity: 0.85; }
  .v13l-main { flex: 1; padding: 10px 14px; display: flex; flex-direction: column; justify-content: center; min-width: 0; }
  .v13l-top { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; margin-bottom: 4px; }
  .v13l-top span:first-child { font-size: 13px; font-weight: 700; color: ${surfaces.text}; }
  .v13l-time { font-size: 10px; color: ${surfaces.muted}; }
  .v13l-sm { font-size: 10px; color: ${surfaces.muted}; margin-bottom: 6px; }
  .v13l-bar { height: 3px; border-radius: 99px; background: ${surfaces.borderStrong}; overflow: hidden; }
  .v13l-fill { height: 100%; background: var(--book); border-radius: 99px; }
  .book-card.v16.book-card--grid { display: flex; flex-direction: column; padding: 14px 16px; gap: 10px; border-radius: 16px; }
  .book-card.v16.v16--list { display: flex !important; flex-direction: row; padding: 12px 14px; gap: 12px; align-items: stretch; width: 100%; margin-bottom: 14px; }
  .v16-h { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
  .v16-line1 { font-size: 13px; font-weight: 800; color: ${surfaces.text}; letter-spacing: -0.25px; }
  .v16-line2 { font-size: 11px; font-weight: 500; color: ${surfaces.muted}; margin-top: 2px; }
  .v16-pill { font-size: 12px; font-weight: 800; padding: 5px 11px; border-radius: 999px; background: var(--tint-deep); color: var(--book); flex-shrink: 0; }
  .v16-bar, .v16lr-bar { height: 4px; border-radius: 99px; background: ${surfaces.borderStrong}; overflow: hidden; }
  .v16-fill, .v16lr-fill { height: 100%; background: var(--book); border-radius: 99px; }
  .v16-ft { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; justify-content: space-between; }
  .v16-chip { font-size: 10px; font-weight: 700; padding: 4px 9px; border-radius: 999px; background: var(--tint-deep); color: ${surfaces.text}; }
  .v16-chip--soft { opacity: 0.95; }
  .v16-time { font-size: 10px; font-weight: 500; color: ${surfaces.muted}; margin-left: auto; }
  .v16lr-av { width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 900; background: var(--book); color: #ffffff; align-self: center; }
  .v16lr-m { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center; gap: 5px; }
  .v16lr-row { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
  .v16lr-row span:first-child { font-size: 14px; font-weight: 700; color: ${surfaces.text}; }
  .v16lr-p { font-size: 14px; font-weight: 800; color: var(--book); }
  .v16lr-ft { font-size: 10px; font-weight: 500; color: ${surfaces.muted}; }
  .book-card.v29.book-card--grid { display: flex; flex-direction: column; padding: 14px 16px; gap: 0; }
  .v29-head { display: flex; flex-direction: row; align-items: center; gap: 10px; margin-bottom: 10px; }
  .v29-av { width: 36px; height: 36px; border-radius: 999px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; background: var(--book); color: #ffffff; }
  .v29-ttl { font-size: 15px; font-weight: 800; color: ${surfaces.text}; }
  .v29-rows { border-top: 1px solid ${surfaces.borderStrong}; border-bottom: 1px solid ${surfaces.borderStrong}; margin-bottom: 10px; }
  .v29-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; font-size: 12px; color: ${surfaces.muted}; border-bottom: 1px solid ${surfaces.borderStrong}; }
  .v29-row:last-child { border-bottom: 0; }
  .v29-row span:last-child { font-weight: 700; color: ${surfaces.text}; }
  .v29-bar { height: 4px; border-radius: 99px; background: ${surfaces.borderStrong}; overflow: hidden; margin-bottom: 8px; }
  .v29-fill { height: 100%; background: var(--book); border-radius: 99px; }
  .v29-bot { display: flex; justify-content: space-between; font-size: 10px; color: ${surfaces.muted}; gap: 8px; }
  .book-card.v29.v29--list { display: flex !important; flex-direction: row; padding: 0; overflow: hidden; align-items: stretch; width: 100%; margin-bottom: 14px; }
  .v29-l { flex: 1; min-width: 0; padding: 10px 12px; display: flex; flex-direction: column; justify-content: center; gap: 6px; border-right: 1px solid ${surfaces.borderStrong}; }
  .v29-lh { display: flex; align-items: center; gap: 8px; }
  .v29-lav { width: 28px; height: 28px; border-radius: 999px; background: var(--book); color: #fff; font-size: 10px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .v29-lt { font-size: 13px; font-weight: 700; color: ${surfaces.text}; }
  .v29-lbar { height: 3px; border-radius: 99px; background: ${surfaces.borderStrong}; overflow: hidden; }
  .v29-lfill { height: 100%; background: var(--book); border-radius: 99px; }
  .v29-r { width: 112px; flex-shrink: 0; display: flex; flex-direction: row; padding: 8px 6px; align-items: stretch; background: ${surfaces.base}; }
  .v29-rc { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 2px; border-right: 1px solid ${surfaces.borderStrong}; padding: 4px 2px; }
  .v29-rc:last-child { border-right: 0; }
  .v29-rc span:first-child { font-size: 14px; font-weight: 800; }
  .v29-rl { font-size: 9px; font-weight: 600; color: ${surfaces.muted}; text-transform: lowercase; }
  .empty { text-align: center; padding: 40px 16px; grid-column: 1 / -1;
    animation: emptyIn 0.55s cubic-bezier(0.22, 1, 0.36, 1) 0.15s both; }
  .empty-icon { font-size: 36px; color: ${surfaces.softText}; margin-bottom: 12px; opacity: 0.8; }
  .empty-text { font-size: 14px; font-weight: 500; color: ${surfaces.muted}; line-height: 22px; }
  @media (prefers-reduced-motion: reduce) {
    .metrics, .filter-label, .filter-row, .book-card, .book-card .v4-seg, .book-card .v7-bar-fill,
    .book-card .v16-fill, .book-card .v16lr-fill,
    .book-card .v29-fill, .book-card .v29-lfill, .empty {
      animation: none !important; animation-delay: 0s !important; }
    .book-card, .chip { transition: none !important; }
    .chip:active { transform: none !important; }
  }
</style>
</head>
<body>
<div class="wrap">
  <div class="metrics">
    <div class="metric-cell"><div class="metric-val">${metrics.avgPercent}%</div><div class="metric-lbl">Promedio</div></div>
    <div class="metric-cell"><div class="metric-val">${metrics.streakDays}</div><div class="metric-lbl">Racha</div></div>
    <div class="metric-cell"><div class="metric-val">${metrics.chaptersCompleted}</div><div class="metric-lbl">Capítulos</div></div>
  </div>
  <div class="filter-label">Filtro</div>
  <div class="filter-row">
    <button type="button" class="chip ${filter === "started" ? "on" : ""}" id="chip-started">${escapeHtml(filterStartedLabel)}</button>
    <button type="button" class="chip ${filter === "all" ? "on" : ""}" id="chip-all">Todos</button>
  </div>
  <div id="list" class="${listContainerClass}">${booksHtml}</div>
</div>
<script>
(function(){
  var DATA = ${dataJson};
  function post(o) {
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(o));
  }
  document.getElementById("chip-started").onclick = function() {
    post({ type: "filter", filter: "started" });
  };
  document.getElementById("chip-all").onclick = function() {
    post({ type: "filter", filter: "all" });
  };
  document.getElementById("list").addEventListener("click", function(e) {
    var btn = e.target.closest(".book-card");
    if (!btn) return;
    var idx = parseInt(btn.getAttribute("data-book-idx"), 10);
    if (isNaN(idx) || !DATA.books[idx]) return;
    post({ type: "selectBook", book: DATA.books[idx] });
  });
})();
</script>
</body>
</html>`;
}

export function buildQuizHistoryChaptersHtml(payload: {
  surfaces: QuizHistorySurfacesCss;
  book: string;
  passed: number;
  total: number;
  completed: number;
  percent: number;
  numColumns: number;
  cells: Array<{
    chapter: number;
    state: "pass" | "fail" | "none";
    attemptId: string | null;
    ratio: number;
  }>;
}): string {
  const { surfaces, book, passed, total, completed, percent, numColumns, cells } = payload;

  const sub =
    `${passed} de ${total} aprobados` +
    (completed > passed ? `  ·  ${completed - passed} en proceso` : "") +
    `  ·  ${percent}%`;

  const grid = cells
    .map((c) => {
      const cls =
        c.state === "pass" ? "cell pass" : c.state === "fail" ? "cell fail" : "cell none";
      const circ = 2 * Math.PI * 24;
      const dash = circ * Math.max(0, Math.min(1, c.ratio));
      const ring =
        c.state !== "none"
          ? `<svg class="ring" viewBox="0 0 58 58" width="58" height="58" aria-hidden="true">
            <circle cx="29" cy="29" r="24" fill="none" stroke="${surfaces.border}" stroke-width="2"/>
            <circle cx="29" cy="29" r="24" fill="none" stroke="${c.state === "pass" ? surfaces.accent : surfaces.fail
          }" stroke-width="2" stroke-dasharray="${dash} ${circ - dash}" transform="rotate(-90 29 29)" stroke-linecap="round"/>
          </svg>`
          : "";
      const att = c.attemptId ? encodeURIComponent(c.attemptId) : "";
      return `<button type="button" class="${cls}" data-chapter="${c.chapter}" data-attempt="${att}">
        ${ring}
        <span class="cell-num">${c.chapter}</span>
      </button>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
<style>
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  html, body { margin: 0; padding: 0; background: ${surfaces.base}; color: ${surfaces.text};
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
  .wrap { padding: 16px 16px 40px; }
  .head { margin-bottom: 12px; }
  .title { font-size: 22px; font-weight: 700; letter-spacing: -0.5px; color: ${surfaces.text}; margin-bottom: 4px; }
  .sub { font-size: 13px; font-weight: 500; color: ${surfaces.muted}; }
  .divider { height: 1px; background: ${surfaces.border}; margin-bottom: 16px; }
  .grid { display: grid; grid-template-columns: repeat(${numColumns}, 1fr); gap: 10px; margin-bottom: 24px; }
  .cell { position: relative; width: 58px; height: 58px; margin: 0 auto; border-radius: 12px; border: none;
    display: flex; align-items: center; justify-content: center; cursor: pointer; padding: 0; }
  .cell .ring { position: absolute; top: 0; left: 0; pointer-events: none; }
  .cell-num { position: relative; z-index: 1; font-size: 15px; font-weight: 600; letter-spacing: -0.2px; }
  .cell.pass { background: ${surfaces.accentSoft}; color: ${surfaces.text}; }
  .cell.pass .cell-num { font-weight: 700; }
  .cell.fail { background: ${surfaces.failSoft}; color: ${surfaces.text}; }
  .cell.fail .cell-num { font-weight: 700; }
  .cell.none { background: transparent; color: ${surfaces.softText}; border: 1px solid ${surfaces.borderStrong}; font-weight: 500; }
  .legend { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 8px; }
  .leg { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 500; color: ${surfaces.muted}; }
  .dot { width: 8px; height: 8px; border-radius: 4px; }
  .dot.hollow { background: transparent; border: 1px solid ${surfaces.borderStrong}; }
</style>
</head>
<body>
<div class="wrap">
  <div class="head">
    <div class="title">${escapeHtml(book)}</div>
    <div class="sub">${escapeHtml(sub)}</div>
  </div>
  <div class="divider"></div>
  <div class="grid">${grid}</div>
  <div class="legend">
    <div class="leg"><span class="dot" style="background:${surfaces.accent}"></span> Aprobado</div>
    <div class="leg"><span class="dot" style="background:${surfaces.fail}"></span> En proceso</div>
    <div class="leg"><span class="dot hollow"></span> Sin iniciar</div>
  </div>
</div>
<script>
(function(){
  function post(o) {
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(o));
  }
  document.querySelectorAll(".cell").forEach(function(btn) {
    var ch = parseInt(btn.getAttribute("data-chapter"), 10);
    var raw = btn.getAttribute("data-attempt") || "";
    var aid = raw ? decodeURIComponent(raw) : "";
    var t = null;
    var longFired = false;
    btn.addEventListener("touchstart", function() {
      longFired = false;
      t = setTimeout(function() {
        t = null;
        longFired = true;
        if (aid) post({ type: "longPressChapter", attemptId: aid });
      }, 450);
    }, { passive: true });
    btn.addEventListener("touchend", function() {
      if (t) { clearTimeout(t); t = null; }
      if (!longFired) post({ type: "selectChapter", chapter: ch });
    });
    btn.addEventListener("touchcancel", function() {
      if (t) { clearTimeout(t); t = null; }
    });
    btn.addEventListener("click", function() {
      if (longFired) { longFired = false; return; }
      if ("ontouchstart" in window) return;
      post({ type: "selectChapter", chapter: ch });
    });
  });
})();
</script>
</body>
</html>`;
}
