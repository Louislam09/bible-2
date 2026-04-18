import {
  buildQuizHistoryBooksHtml,
  buildQuizHistoryChaptersHtml,
  type QuizHistoryBooksLayout,
  type QuizHistorySurfacesCss,
} from "@/constants/quizHistoryWebViewHtml";
import {
  QUIZ_HISTORY_BOOK_CARD_VARIANT,
  type QuizHistoryBookCardVariant,
} from "@/constants/quizHistoryBookCardVariant";
import { DB_BOOK_NAMES } from "@/constants/BookNames";
import { useMyTheme } from "@/context/ThemeContext";
import type {
  BookSummary,
  ChapterAttemptIndex,
} from "@/hooks/useQuizProgress";
import {
  FAIL_COLOR,
  PASS_COLOR_FALLBACK,
  SP,
  getSurfaces,
} from "@/components/quizHistory/quizHistoryTokens";
import type { ChapterQuizHistoryMetrics } from "@/utils/quizHistory";
import { formatRelativeDate } from "@/utils/quizHistory";
import {
  bookCardPaletteColors,
  mixHex,
  statusBadgeColors,
} from "@/utils/quizBookPalette";
import {
  deriveStatusBadge,
  maxChapterTouched,
} from "@/utils/quizBookMeta";
import { encodeChapterTileStates } from "@/utils/quizChapterTileStates";
import { createOptimizedWebViewProps } from "@/utils/webViewOptimizations";
import React, { useCallback, useMemo } from "react";
import { useWindowDimensions } from "react-native";

const BOOK_META_BY_LONG = (() => {
  const m = new Map<string, { shortName: string; bookColor: string }>();
  for (const b of DB_BOOK_NAMES) {
    m.set(b.longName, { shortName: b.shortName, bookColor: b.bookColor });
  }
  return m;
})();
import WebView from "react-native-webview";
import { View } from "../Themed";
import { AnimatedView } from "./AnimatedView";

type Surfaces = ReturnType<typeof getSurfaces>;

function toCss(s: Surfaces): QuizHistorySurfacesCss {
  return {
    base: s.base,
    card: s.card,
    text: s.text,
    muted: s.muted,
    softText: s.softText,
    border: s.border,
    borderStrong: s.borderStrong,
    accent: s.accent,
    accentSoft: s.accentSoft,
    fail: s.fail,
    failSoft: s.failSoft,
    statOk: PASS_COLOR_FALLBACK,
    statProg: FAIL_COLOR,
  };
}

type BooksFilter = "started" | "all";

export const QuizHistoryBooksWebView: React.FC<{
  direction: "forward" | "backward";
  surfaces: Surfaces;
  metrics: ChapterQuizHistoryMetrics;
  bookSummaries: BookSummary[];
  indexByBook: Map<string, ChapterAttemptIndex>;
  filter: BooksFilter;
  booksLayout: QuizHistoryBooksLayout;
  /** Override default in `constants/quizHistoryBookCardVariant.ts` */
  cardVariant?: QuizHistoryBookCardVariant;
  onFilterChange: (f: BooksFilter) => void;
  onPressBook: (book: string) => void;
}> = ({
  direction,
  surfaces,
  metrics,
  bookSummaries,
  indexByBook,
  filter,
  booksLayout,
  cardVariant = QUIZ_HISTORY_BOOK_CARD_VARIANT,
  onFilterChange,
  onPressBook,
}) => {
    const { theme } = useMyTheme();

    const visible = useMemo(() => {
      if (filter === "started") {
        return bookSummaries.filter((b) => b.hasAnyAttempt);
      }
      return bookSummaries;
    }, [bookSummaries, filter]);

    const startedCount = useMemo(
      () => bookSummaries.filter((b) => b.hasAnyAttempt).length,
      [bookSummaries],
    );

    const html = useMemo(() => {
      const isDark = theme.dark;
      const cardHex = surfaces.card;
      const books = visible.map((s) => {
        const meta = BOOK_META_BY_LONG.get(s.book);
        const shortName = meta?.shortName ?? s.book.slice(0, 2);
        const bookColor = meta?.bookColor ?? "#888888";
        const pal = bookCardPaletteColors(bookColor, cardHex, isDark);
        const total = s.totalChapters;
        const passed = s.passedChapters;
        const completed = s.completedChapters;
        const inProgress = Math.max(0, completed - passed);
        const notStarted =
          total > 0 ? Math.max(0, total - completed) : 0;
        const denom = total > 0 ? total : 1;
        const segPassPct = (passed / denom) * 100;
        const segProgPct = (inProgress / denom) * 100;
        const segIdlePct = (notStarted / denom) * 100;

        const attemptIndex = indexByBook.get(s.book);
        const focalCh = maxChapterTouched(attemptIndex);
        const focalChapterLabel =
          focalCh != null ? `${shortName} ${focalCh}` : "—";
        const lastLbl = s.lastCompletedAt
          ? formatRelativeDate(s.lastCompletedAt)
          : "—";
        const locPart = focalCh != null ? `${shortName} ${focalCh}` : "—";
        const metaSubtitle = `${s.totalChapters} cap · ${locPart} · ${lastLbl}`;
        const badge = deriveStatusBadge(s.hasAnyAttempt, s.percent);
        const badgePal = statusBadgeColors(
          badge.kind,
          bookColor,
          cardHex,
          surfaces.softText,
        );

        return {
          book: s.book,
          bookNumber: s.bookNumber,
          percent: s.percent,
          totalChapters: s.totalChapters,
          completedChapters: s.completedChapters,
          passedChapters: s.passedChapters,
          attemptCount: s.attemptCount,
          lastActivityLabel: lastLbl,
          hasAnyAttempt: s.hasAnyAttempt,
          shortName,
          bookColor,
          avatarBg: pal.avatarBg,
          segProgColor: pal.segProgColor,
          borderAccent: pal.borderAccent,
          inProgressChapters: inProgress,
          notStartedChapters: notStarted,
          segPassPct,
          segProgPct,
          segIdlePct,
          chapterTileStates: encodeChapterTileStates(
            s.totalChapters,
            attemptIndex,
          ),
          focalChapterLabel,
          metaSubtitle,
          statusBadgeKind: badge.kind,
          statusBadgeLabel: badge.label,
          badgeBg: badgePal.bg,
          badgeFg: badgePal.fg,
          tintCardBg: mixHex(
            bookColor,
            cardHex,
            isDark ? 0.14 : 0.1,
          ),
          tintDeep: mixHex(bookColor, cardHex, isDark ? 0.45 : 0.32),
        };
      });

      return buildQuizHistoryBooksHtml({
        surfaces: toCss(surfaces),
        metrics,
        filter,
        startedCount,
        layout: booksLayout,
        cardVariant,
        books,
      });
    }, [
      visible,
      surfaces,
      metrics,
      filter,
      startedCount,
      booksLayout,
      theme.dark,
      indexByBook,
      cardVariant,
    ]);

    const onMessage = useCallback(
      (event: { nativeEvent: { data: string } }) => {
        try {
          const msg = JSON.parse(event.nativeEvent.data) as {
            type: string;
            filter?: BooksFilter;
            book?: string;
          };
          if (msg.type === "filter" && msg.filter) {
            onFilterChange(msg.filter);
          }
          if (msg.type === "selectBook" && msg.book) {
            onPressBook(msg.book);
          }
        } catch {
          /* ignore */
        }
      },
      [onFilterChange, onPressBook],
    );

    return (
      <WebView
        key={`books-${filter}-${visible.length}-${booksLayout}-${cardVariant}`}
        originWhitelist={["*"]}
        source={{ html }}
        style={{ flex: 1, minWidth: "100%", backgroundColor: surfaces.base }}
        containerStyle={{ backgroundColor: surfaces.base }}
        scrollEnabled
        nestedScrollEnabled
        onMessage={onMessage}
        renderLoading={() => (
          <AnimatedView
            key={`AnimatedView-books`}
            direction={direction}
            style={{
              backgroundColor: surfaces.base,
              flex: 1,
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1000,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <></>

          </AnimatedView>
        )}
        {...createOptimizedWebViewProps({}, "static")}
      />
    );
  };

export const QuizHistoryChaptersWebView: React.FC<{
  surfaces: Surfaces;
  book: string;
  summary: BookSummary | null;
  attemptIndex: ChapterAttemptIndex | null;
  onPressChapter: (chapter: number) => void;
  onLongPressAttemptId: (attemptId: string) => void;
  direction: "forward" | "backward";
}> = ({
  surfaces,
  book,
  summary,
  attemptIndex,
  onPressChapter,
  onLongPressAttemptId,
  direction,
}) => {
    const { width: windowWidth } = useWindowDimensions();
    const total = summary?.totalChapters ?? 0;
    const passed = summary?.passedChapters ?? 0;
    const completed = summary?.completedChapters ?? 0;
    const percent = summary?.percent ?? 0;

    const chapters = useMemo(
      () => Array.from({ length: total }, (_, i) => i + 1),
      [total],
    );

    const gridGap = 10;
    const cellSize = 58;
    const hPad = SP.lg * 2;
    const numColumns = Math.min(
      8,
      Math.max(
        3,
        Math.floor(
          (windowWidth - hPad + gridGap) / (cellSize + gridGap),
        ),
      ),
    );

    const cells = useMemo(() => {
      return chapters.map((c) => {
        const best = attemptIndex?.bestByChapter.get(c);
        if (!best) {
          return {
            chapter: c,
            state: "none" as const,
            attemptId: null as string | null,
            ratio: 0,
          };
        }
        const ratio = best.total > 0 ? best.score / best.total : 0;
        return {
          chapter: c,
          state: best.pass ? ("pass" as const) : ("fail" as const),
          attemptId: best.id,
          ratio,
        };
      });
    }, [chapters, attemptIndex]);

    const html = useMemo(
      () =>
        buildQuizHistoryChaptersHtml({
          surfaces: toCss(surfaces),
          book,
          passed,
          total,
          completed,
          percent,
          numColumns,
          cells,
        }),
      [
        surfaces,
        book,
        passed,
        total,
        completed,
        percent,
        numColumns,
        cells,
      ],
    );

    const onMessage = useCallback(
      (event: { nativeEvent: { data: string } }) => {
        try {
          const msg = JSON.parse(event.nativeEvent.data) as {
            type: string;
            chapter?: number;
            attemptId?: string;
          };
          if (msg.type === "selectChapter" && typeof msg.chapter === "number") {
            onPressChapter(msg.chapter);
          }
          if (msg.type === "longPressChapter" && msg.attemptId) {
            onLongPressAttemptId(msg.attemptId);
          }
        } catch {
          /* ignore */
        }
      },
      [onPressChapter, onLongPressAttemptId],
    );

    return (
      <WebView
        key={`chapters-${book}-${total}-${cells.length}`}
        originWhitelist={["*"]}
        source={{ html }}
        style={{ flex: 1, minWidth: "100%", backgroundColor: surfaces.base }}
        containerStyle={{ backgroundColor: surfaces.base }}
        scrollEnabled
        nestedScrollEnabled
        onMessage={onMessage}
        renderLoading={() => (
          <AnimatedView
            key={`AnimatedView-chapters`}
            direction={direction}
            style={{
              backgroundColor: surfaces.base,
              flex: 1,
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1000,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <></>
          </AnimatedView>
        )}
        {...createOptimizedWebViewProps({}, "static")}
      />
    );
  };
