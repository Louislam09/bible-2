import {
  buildQuizHistoryBooksHtml,
  buildQuizHistoryChaptersHtml,
  type QuizHistoryBooksLayout,
  type QuizHistoryHomeUserAvatar,
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
import { computeChapterQuizProgress } from "@/utils/chapterQuizProgress";
import type { ChapterQuizHistoryMetrics } from "@/utils/quizHistory";
import { POCKETBASE_URL } from "@/globalConfig";
import { chapterQuizCacheService } from "@/services/chapterQuizCacheService";
import type {
  ChapterQuizAttemptRow,
  ChapterQuizSessionRow,
} from "@/services/chapterQuizLocalDbService";
import { countCompletedChallengesForChapter } from "@/utils/quizChapterChallenges";
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
import type { pbUser } from "@/types";
import React, { useCallback, useMemo, useRef } from "react";
import { useWindowDimensions, View } from "react-native";

const BOOK_META_BY_LONG = (() => {
  const m = new Map<string, { shortName: string; bookColor: string }>();
  for (const b of DB_BOOK_NAMES) {
    m.set(b.longName, { shortName: b.shortName, bookColor: b.bookColor });
  }
  return m;
})();
import WebView from "react-native-webview";
import { AnimatedView, type AnimatedViewTransition } from "./AnimatedView";

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

/** Same avatar URLs as `UserProfile` (PocketBase file vs Robohash). */
export function quizHistoryHomeAvatarFromUser(
  user: pbUser | null | undefined,
): QuizHistoryHomeUserAvatar | null {
  if (!user) return null;
  const base = POCKETBASE_URL ?? "";
  const avatarUrl = `${base}/api/files/${user.collectionId}/${user.id}/${user.avatar}`;
  const defaultAvatar = `https://robohash.org/set_set10/bgset_bg1/${user.id}?size=200x200`;
  const src = user.avatar ? avatarUrl : defaultAvatar;
  return { src, onErrorSrc: defaultAvatar };
}

export const QuizHistoryBooksWebView: React.FC<{
  direction: AnimatedViewTransition;
  surfaces: Surfaces;
  metrics: ChapterQuizHistoryMetrics;
  /** Intentos (misma fuente que `computeChapterQuizMetrics`) para XP/nivel. */
  attempts: ChapterQuizAttemptRow[];
  bookSummaries: BookSummary[];
  indexByBook: Map<string, ChapterAttemptIndex>;
  filter: BooksFilter;
  booksLayout: QuizHistoryBooksLayout;
  /** Override default in `constants/quizHistoryBookCardVariant.ts` */
  cardVariant?: QuizHistoryBookCardVariant;
  user?: pbUser | null;
  onFilterChange: (f: BooksFilter) => void;
  onPressBook: (book: string) => void;
  onOpenProfile: (origin?: { x: number; y: number; w: number; h: number }) => void;
}> = ({
  direction,
  surfaces,
  metrics,
  attempts,
  bookSummaries,
  indexByBook,
  filter,
  booksLayout,
  cardVariant = QUIZ_HISTORY_BOOK_CARD_VARIANT,
  user = null,
  onFilterChange,
  onPressBook,
  onOpenProfile,
}) => {
    const { theme } = useMyTheme();
    const webHostRef = useRef<View>(null);

    const startedCount = useMemo(
      () => bookSummaries.filter((b) => b.hasAnyAttempt).length,
      [bookSummaries],
    );

    const homeUserAvatar = useMemo(
      () => quizHistoryHomeAvatarFromUser(user),
      [user],
    );

    const progress = useMemo(
      () => computeChapterQuizProgress(attempts),
      [attempts],
    );

    const html = useMemo(() => {
      const isDark = theme.dark;
      const cardHex = surfaces.card;
      const books = bookSummaries.map((s) => {
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
        progress,
        filter,
        startedCount,
        layout: booksLayout,
        cardVariant,
        books,
        homeUserAvatar,
      });
      // `filter` se aplica solo en el DOM del WebView (evita recargar `source` al tocar chips).
      // eslint-disable-next-line react-hooks/exhaustive-deps -- filter omitido a propósito
    }, [
      bookSummaries,
      surfaces,
      metrics,
      progress,
      startedCount,
      booksLayout,
      theme.dark,
      indexByBook,
      cardVariant,
      homeUserAvatar,
    ]);

    const onMessage = useCallback(
      (event: { nativeEvent: { data: string } }) => {
        try {
          const msg = JSON.parse(event.nativeEvent.data) as {
            type: string;
            filter?: BooksFilter;
            book?: string;
            x?: number;
            y?: number;
            w?: number;
            h?: number;
          };
          if (msg.type === "filter" && msg.filter) {
            onFilterChange(msg.filter);
          }
          if (msg.type === "selectBook" && msg.book) {
            onPressBook(msg.book);
          }
          if (msg.type === "openProfile") {
            const ax = typeof msg.x === "number" ? msg.x : 0;
            const ay = typeof msg.y === "number" ? msg.y : 0;
            const aw = typeof msg.w === "number" && msg.w > 0 ? msg.w : 50;
            const ah = typeof msg.h === "number" && msg.h > 0 ? msg.h : 50;
            const host = webHostRef.current;
            if (host) {
              host.measureInWindow((wx, wy) => {
                onOpenProfile({ x: wx + ax, y: wy + ay, w: aw, h: ah });
              });
            } else {
              onOpenProfile({ x: ax, y: ay, w: aw, h: ah });
            }
          }
        } catch {
          /* ignore */
        }
      },
      [onFilterChange, onOpenProfile, onPressBook],
    );

    return (
      <View
        ref={webHostRef}
        style={{ flex: 1, minWidth: "100%", backgroundColor: surfaces.base }}
        collapsable={false}
      >
        <WebView
          key={`books-${booksLayout}-${cardVariant}`}
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
      </View>
    );
  };

export const QuizHistoryChaptersWebView: React.FC<{
  surfaces: Surfaces;
  book: string;
  summary: BookSummary | null;
  attempts: ChapterQuizAttemptRow[];
  quizSessions: ChapterQuizSessionRow[];
  onPressChapter: (chapter: number) => void;
  direction: AnimatedViewTransition;
}> = ({
  surfaces,
  book,
  summary,
  attempts,
  quizSessions,
  onPressChapter,
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
        const chapterKey = chapterQuizCacheService.buildChapterKey(book, c);
        const completedN = countCompletedChallengesForChapter(attempts, book, c);
        const ratio = completedN / 4;
        const hasAnyAttempt = attempts.some(
          (a) => a.book === book && a.chapter === c,
        );
        const hasOpenSession = quizSessions.some(
          (s) => s.chapterKey === chapterKey,
        );

        let state: "pass" | "fail" | "none";
        if (completedN === 4) state = "pass";
        else if (hasAnyAttempt || hasOpenSession) state = "fail";
        else state = "none";

        return {
          chapter: c,
          state,
          ratio,
        };
      });
    }, [attempts, book, chapters, quizSessions]);

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
        } catch {
          /* ignore */
        }
      },
      [onPressChapter],
    );

    return (
      <WebView
        key={`chapters-${book}-${total}-${attempts.length}-${quizSessions.length}-${cells.length}`}
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
