import type { ChapterQuizAttemptRow } from "@/services/chapterQuizLocalDbService";
import { TTheme } from "@/types";

export type ChapterQuizHistoryFilter = "all" | "passed" | "failed" | "favorites";

export type ChapterQuizHistoryMetrics = {
  avgPercent: number;
  streakDays: number;
  chaptersCompleted: number;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function computeStreakDays(attempts: { completedAt: string }[]): number {
  if (attempts.length === 0) return 0;
  const daySet = new Set(attempts.map((a) => a.completedAt.slice(0, 10)));
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 400; i++) {
    const key = d.toISOString().slice(0, 10);
    if (daySet.has(key)) {
      streak += 1;
      d.setDate(d.getDate() - 1);
    } else if (streak > 0) {
      break;
    } else {
      d.setDate(d.getDate() - 1);
    }
  }
  return streak;
}

export function computeChapterQuizMetrics(attempts: ChapterQuizAttemptRow[]): ChapterQuizHistoryMetrics {
  if (attempts.length === 0) {
    return { avgPercent: 0, streakDays: 0, chaptersCompleted: 0 };
  }
  const ratios = attempts.map((a) => (a.total > 0 ? a.score / a.total : 0));
  const avgPercent = Math.round((ratios.reduce((s, x) => s + x, 0) / ratios.length) * 100);
  const streakDays = computeStreakDays(attempts);
  const chaptersWithPass = new Set(
    attempts.filter((a) => a.pass).map((a) => a.chapterKey),
  );
  return {
    avgPercent,
    streakDays,
    chaptersCompleted: chaptersWithPass.size,
  };
}

function filterAttempts(
  attempts: ChapterQuizAttemptRow[],
  filter: ChapterQuizHistoryFilter,
): ChapterQuizAttemptRow[] {
  switch (filter) {
    case "passed":
      return attempts.filter((a) => a.pass);
    case "failed":
      return attempts.filter((a) => !a.pass);
    case "favorites":
      return attempts.filter((a) => a.isFavorite);
    default:
      return attempts;
  }
}

export { filterAttempts };

type TemplateArgs = {
  theme: TTheme;
  view: "list" | "review";
  filter: ChapterQuizHistoryFilter;
  attempts: ChapterQuizAttemptRow[];
  reviewAttempt: ChapterQuizAttemptRow | null;
};

export function chapterQuizHistoryHtmlTemplate({
  theme,
  view,
  filter,
  attempts,
  reviewAttempt,
}: TemplateArgs): string {
  const bg = theme.colors.background;
  const text = theme.colors.text;
  const card = theme.colors.card;
  const accent = theme.colors.notification;
  const muted = `${text}99`;
  const border = `${text}22`;

  const filtered = filterAttempts(attempts, filter);
  const metrics = computeChapterQuizMetrics(attempts);

  const dataPayload = JSON.stringify({
    filter,
    attempts: filtered.map((a) => ({
      id: a.id,
      chapterKey: a.chapterKey,
      book: a.book,
      chapter: a.chapter,
      score: a.score,
      total: a.total,
      completedAt: a.completedAt,
      pass: a.pass,
      isFavorite: a.isFavorite,
    })),
    metrics,
    review: reviewAttempt
      ? {
          id: reviewAttempt.id,
          chapterKey: reviewAttempt.chapterKey,
          book: reviewAttempt.book,
          chapter: reviewAttempt.chapter,
          score: reviewAttempt.score,
          total: reviewAttempt.total,
          questions: reviewAttempt.questions,
          answers: reviewAttempt.answers,
        }
      : null,
    view,
  });

  const listHtml =
    view === "list"
      ? renderListHtml({
          filtered,
          metrics,
          filter,
          text,
          muted,
          card,
          border,
          accent,
          bg,
        })
      : "";

  const reviewHtml =
    view === "review" && reviewAttempt
      ? renderReviewHtml(reviewAttempt, { text, muted, card, border, accent })
      : "";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <style>
    * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    body {
      margin: 0;
      padding: 12px 12px 28px;
      font-family: system-ui, -apple-system, sans-serif;
      background: ${bg};
      color: ${text};
      font-size: 15px;
      line-height: 1.45;
    }
    .header-metrics {
      border-radius: 14px;
      border: 1px solid ${border};
      padding: 14px;
      margin-bottom: 14px;
      background: ${card};
    }
    .header-metrics h1 {
      margin: 0 0 10px;
      font-size: 20px;
      font-weight: 800;
    }
    .metrics-row {
      display: flex;
      flex-wrap: wrap;
      gap: 10px 16px;
      font-size: 14px;
      color: ${muted};
    }
    .metrics-row strong { color: ${text}; font-weight: 700; }
    .filters {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 14px;
    }
    .chip {
      border: 1px solid ${border};
      border-radius: 999px;
      padding: 8px 14px;
      font-size: 13px;
      font-weight: 600;
      background: transparent;
      color: ${text};
      cursor: pointer;
    }
    .chip.on {
      background: ${accent};
      color: #fff;
      border-color: ${accent};
    }
    .card {
      border: 1px solid ${border};
      border-radius: 14px;
      padding: 14px;
      margin-bottom: 12px;
      background: ${card};
    }
    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 8px;
    }
    .title { font-weight: 800; font-size: 16px; }
    .badge {
      font-size: 12px;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 8px;
    }
    .badge.ok { background: #22c55e33; color: #22c55e; }
    .badge.bad { background: #ef444433; color: #ef4444; }
    .meta { font-size: 13px; color: ${muted}; margin-bottom: 10px; }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .btn {
      flex: 1;
      min-width: 120px;
      border-radius: 10px;
      padding: 10px 12px;
      font-size: 13px;
      font-weight: 700;
      border: 1px solid ${border};
      background: ${bg};
      color: ${text};
      text-align: center;
      cursor: pointer;
    }
    .btn.primary {
      background: ${accent};
      border-color: ${accent};
      color: #fff;
    }
    .btn.danger {
      border-color: #ef444455;
      color: #ef4444;
    }
    .empty {
      text-align: center;
      padding: 32px 16px;
      color: ${muted};
      font-size: 15px;
    }
    .back {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 12px;
      font-weight: 700;
      color: ${accent};
      cursor: pointer;
      font-size: 15px;
      border: none;
      background: none;
      padding: 0;
    }
    .q-block {
      margin-bottom: 18px;
      padding-bottom: 14px;
      border-bottom: 1px solid ${border};
    }
    .q-block:last-child { border-bottom: none; }
    .q-title { font-weight: 700; margin-bottom: 8px; }
    .line { font-size: 14px; margin: 4px 0; }
    .wrong { color: #ef4444; }
    .right { color: #22c55e; }
  </style>
</head>
<body>
  <script>window.__QUIZ_HISTORY__ = ${dataPayload};</script>
  ${view === "list" ? listHtml : reviewHtml}
  <script>
    function post(type, data) {
      try {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, data: data || {} }));
        }
      } catch (e) {}
    }
    (function bindFilters() {
      var chips = document.querySelectorAll('.chip[data-filter]');
      chips.forEach(function(c) {
        c.addEventListener('click', function() {
          post('filterChange', { filter: c.getAttribute('data-filter') });
        });
      });
    })();
    (function bindListActions() {
      document.querySelectorAll('[data-action]').forEach(function(el) {
        el.addEventListener('click', function() {
          var action = el.getAttribute('data-action');
          var id = el.getAttribute('data-id') || '';
          var chapterKey = el.getAttribute('data-chapter-key') || '';
          var book = el.getAttribute('data-book') || '';
          var chapter = parseInt(el.getAttribute('data-chapter') || '0', 10);
          if (action === 'review') post('openReview', { attemptId: id });
          if (action === 'regen') post('regenerateLocal', { chapterKey: chapterKey, book: book, chapter: chapter });
          if (action === 'downvote') post('downvote', { chapterKey: chapterKey });
          if (action === 'favorite') post('toggleFavorite', { attemptId: id });
          if (action === 'retryFailed') post('retryFailed', { attemptId: id });
        });
      });
    })();
    (function bindBack() {
      var b = document.querySelector('.back');
      if (b) b.addEventListener('click', function() { post('goBackToList', {}); });
    })();
  </script>
</body>
</html>`;
}

function renderListHtml(opts: {
  filtered: ChapterQuizAttemptRow[];
  metrics: ChapterQuizHistoryMetrics;
  filter: ChapterQuizHistoryFilter;
  text: string;
  muted: string;
  card: string;
  border: string;
  accent: string;
  bg: string;
}): string {
  const { filtered, metrics, filter } = opts;
  const chip = (id: ChapterQuizHistoryFilter, label: string) =>
    `<button type="button" class="chip ${filter === id ? "on" : ""}" data-filter="${id}">${escapeHtml(label)}</button>`;

  let cards = "";
  for (const a of filtered) {
    const pct = a.total > 0 ? Math.round((a.score / a.total) * 100) : 0;
    const dateStr = formatRelativeDate(a.completedAt);
    cards += `
      <div class="card">
        <div class="card-top">
          <div class="title">${escapeHtml(a.book)} ${a.chapter}</div>
          <span class="badge ${a.pass ? "ok" : "bad"}">${a.pass ? "Aprobado" : "En repaso"}</span>
        </div>
        <div class="meta">${a.score}/${a.total} · ${pct}% · ${escapeHtml(dateStr)}</div>
        <div class="actions">
          <button type="button" class="btn primary" data-action="review" data-id="${escapeHtml(a.id)}">Revisar</button>
          <button type="button" class="btn" data-action="regen" data-chapter-key="${escapeHtml(a.chapterKey)}" data-book="${escapeHtml(a.book)}" data-chapter="${a.chapter}">Nuevo quiz (solo aquí)</button>
        </div>
        <div class="actions" style="margin-top:8px">
          <button type="button" class="btn" data-action="retryFailed" data-id="${escapeHtml(a.id)}">Reintentar falladas</button>
          <button type="button" class="btn" data-action="favorite" data-id="${escapeHtml(a.id)}">${a.isFavorite ? "Quitar favorito" : "Favorito"}</button>
          <button type="button" class="btn danger" data-action="downvote" data-chapter-key="${escapeHtml(a.chapterKey)}">Mal quiz (votar)</button>
        </div>
      </div>`;
  }

  const empty =
    filtered.length === 0
      ? `<div class="empty">No hay intentos en esta vista. Completa un quiz en la lectura bíblica para ver tu historial.</div>`
      : "";

  return `
    <div class="header-metrics">
      <h1>Mis Quiz</h1>
      <div class="metrics-row">
        <span>Promedio: <strong>${metrics.avgPercent}%</strong></span>
        <span>Racha: <strong>${metrics.streakDays}</strong> días</span>
        <span>Capítulos logrados: <strong>${metrics.chaptersCompleted}</strong></span>
      </div>
    </div>
    <div class="filters">
      ${chip("all", "Todos")}
      ${chip("passed", "Aprobados")}
      ${chip("failed", "Fallados")}
      ${chip("favorites", "Favoritos")}
    </div>
    ${cards}
    ${empty}
  `;
}

function renderReviewHtml(
  a: ChapterQuizAttemptRow,
  colors: { text: string; muted: string; card: string; border: string; accent: string },
): string {
  const lines: string[] = [];
  lines.push(`<button type="button" class="back">← Volver</button>`);
  lines.push(`<div class="header-metrics"><h1>${escapeHtml(a.book)} ${a.chapter}</h1>`);
  lines.push(
    `<div class="metrics-row"><span>Resultado: <strong>${a.score}/${a.total}</strong></span></div></div>`,
  );

  const byIndex = new Map(a.answers.map((x) => [x.questionIndex, x.selected]));
  a.questions.forEach((q, idx) => {
    const selected = byIndex.get(idx) ?? null;
    lines.push(`<div class="q-block">`);
    lines.push(`<div class="q-title">${escapeHtml(q.question)}</div>`);
    lines.push(
      `<div class="line wrong">Tu respuesta: ${selected ? escapeHtml(selected) : "(sin respuesta)"}</div>`,
    );
    lines.push(`<div class="line right">Correcta: ${escapeHtml(String(q.correct))}</div>`);
    if (q.reference) {
      lines.push(`<div class="line" style="color:${colors.muted}">Ref: ${escapeHtml(q.reference)}</div>`);
    }
    if (q.explanation) {
      lines.push(`<div class="line" style="color:${colors.muted}">${escapeHtml(q.explanation)}</div>`);
    }
    lines.push(`</div>`);
  });

  lines.push(`
    <div class="actions">
      <button type="button" class="btn primary" data-action="retryFailed" data-id="${escapeHtml(a.id)}">Reintentar solo falladas</button>
    </div>
  `);

  return lines.join("\n");
}

function formatRelativeDate(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const days = Math.floor(diffMs / (86400000));
    if (days <= 0) return "Hoy";
    if (days === 1) return "Ayer";
    if (days < 7) return `Hace ${days} días`;
    return d.toLocaleDateString("es", { day: "numeric", month: "short" });
  } catch {
    return iso;
  }
}
