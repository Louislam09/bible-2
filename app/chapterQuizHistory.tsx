import ChapterQuizBottomSheet from "@/components/ChapterQuizBottomSheet";
import {
  singleScreenHeader,
  type SingleScreenHeaderProps,
} from "@/components/common/singleScreenHeader";
import Icon from "@/components/Icon";
import { AnimatedView } from "@/components/quizHistory/AnimatedView";
import { BookCard } from "@/components/quizHistory/BookCard";
import {
  ChapterCell,
  type ChapterCellState,
} from "@/components/quizHistory/ChapterCell";
import { HistoryHeader } from "@/components/quizHistory/HistoryHeader";
import {
  RADIUS,
  SP,
  getSurfaces,
} from "@/components/quizHistory/quizHistoryTokens";
import { QuizReviewItem } from "@/components/quizHistory/QuizReviewItem";
import ScreenWithAnimation from "@/components/ScreenWithAnimation";
import { Text, View as ThemedView } from "@/components/Themed";
import { useAlert } from "@/context/AlertContext";
import { useMyTheme } from "@/context/ThemeContext";
import { pb } from "@/globalConfig";
import {
  useQuizProgress,
  type BookSummary,
  type ChapterAttemptIndex,
} from "@/hooks/useQuizProgress";
import {
  fetchUserDownvotedChapterKeys,
  removeChapterQuizDownvote,
  submitChapterQuizDownvote,
} from "@/services/chapterQuizDownvoteService";
import {
  chapterQuizLocalDbService,
  type ChapterQuizAttemptRow,
} from "@/services/chapterQuizLocalDbService";
import { bibleState$ } from "@/state/bibleState";
import { chapterQuizStateHelpers } from "@/state/chapterQuizState";
import { modalState$ } from "@/state/modalState";
import { Screens } from "@/types";
import { computeChapterQuizMetrics } from "@/utils/quizHistory";
import { showToast } from "@/utils/showToast";
import { shuffleArray } from "@/utils/shuffleOptions";
import { use$ } from "@legendapp/state/react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BackHandler,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";

type ViewState =
  | { kind: "books" }
  | { kind: "chapters"; book: string }
  | { kind: "review"; attemptId: string; fromBook: string | null };

type BooksFilter = "started" | "all";

const ChapterQuizHistoryScreen = () => {
  const { theme } = useMyTheme();
  const router = useRouter();
  const navigation = useNavigation<any>();
  const params = useLocalSearchParams<{ attemptId?: string | string[] }>();
  const { alertWarning, confirm, actionSheet } = useAlert();
  const surfaces = useMemo(() => getSurfaces(theme), [theme]);

  const [attempts, setAttempts] = useState<ChapterQuizAttemptRow[]>([]);
  const [viewState, setViewState] = useState<ViewState>({ kind: "books" });
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [booksFilter, setBooksFilter] = useState<BooksFilter>("started");
  const [reviewAttempt, setReviewAttempt] =
    useState<ChapterQuizAttemptRow | null>(null);
  const [userDownvotedChapterKeys, setUserDownvotedChapterKeys] = useState<
    string[]
  >([]);
  const [downvoteLoadingChapterKey, setDownvoteLoadingChapterKey] = useState<
    string | null
  >(null);

  const isChapterQuizOpen = use$(() => modalState$.isChapterQuizOpen.get());
  const wasQuizOpenRef = useRef(false);

  const { bookSummaries, indexByBook } = useQuizProgress(attempts);
  const metrics = useMemo(
    () => computeChapterQuizMetrics(attempts),
    [attempts],
  );

  const downvotedSet = useMemo(
    () => new Set(userDownvotedChapterKeys),
    [userDownvotedChapterKeys],
  );

  const reloadAttempts = useCallback(async () => {
    const rows = await chapterQuizLocalDbService.getAllAttempts();
    setAttempts(rows);
  }, []);

  const reloadDownvotes = useCallback(async () => {
    if (!pb.authStore.isValid) {
      setUserDownvotedChapterKeys([]);
      return;
    }
    const keys = await fetchUserDownvotedChapterKeys();
    setUserDownvotedChapterKeys(keys);
  }, []);

  useEffect(() => {
    if (wasQuizOpenRef.current && !isChapterQuizOpen) {
      void reloadAttempts();
    }
    wasQuizOpenRef.current = isChapterQuizOpen;
  }, [isChapterQuizOpen, reloadAttempts]);

  useFocusEffect(
    useCallback(() => {
      void reloadAttempts();
      void reloadDownvotes();
    }, [reloadAttempts, reloadDownvotes]),
  );

  // Deep-link entry: ?attemptId=...
  useEffect(() => {
    const raw = params.attemptId;
    const id = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined;
    if (!id) return;
    let cancelled = false;
    void chapterQuizLocalDbService.getAttemptById(id).then((row) => {
      if (cancelled || !row) return;
      setReviewAttempt(row);
      setViewState({ kind: "review", attemptId: id, fromBook: row.book });
      setDirection("forward");
    });
    return () => {
      cancelled = true;
    };
  }, [params.attemptId]);

  // Internal back navigation through view stack.
  const goBackInternal = useCallback((): boolean => {
    if (viewState.kind === "review") {
      setDirection("backward");
      if (viewState.fromBook) {
        setViewState({ kind: "chapters", book: viewState.fromBook });
      } else {
        setViewState({ kind: "books" });
      }
      setReviewAttempt(null);
      return true;
    }
    if (viewState.kind === "chapters") {
      setDirection("backward");
      setViewState({ kind: "books" });
      return true;
    }
    return false;
  }, [viewState]);

  // Hardware back (Android).
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        return goBackInternal();
      });
      return () => sub.remove();
    }, [goBackInternal]),
  );

  const headerGoBack = useCallback(() => {
    if (!goBackInternal()) {
      router.push("/(dashboard)");
    }
  }, [goBackInternal, router]);

  const openBook = useCallback((book: string) => {
    setDirection("forward");
    setViewState({ kind: "chapters", book });
  }, []);

  const openReviewByAttempt = useCallback((row: ChapterQuizAttemptRow) => {
    setReviewAttempt(row);
    setDirection("forward");
    setViewState({
      kind: "review",
      attemptId: row.id,
      fromBook: row.book,
    });
  }, []);

  const openChapter = useCallback(
    (book: string, chapter: number) => {
      const idx = indexByBook.get(book);
      const best = idx?.bestByChapter.get(chapter);
      if (best) {
        openReviewByAttempt(best);
        return;
      }
      // Not started → navigate to the Bible chapter so the user can read &
      // generate a quiz from BibleTop. Cleanest UX given quiz needs context.
      const queryInfo = { book, chapter, verse: 1 };
      bibleState$.changeBibleQuery({
        ...queryInfo,
        shouldFetch: true,
        isHistory: false,
      });
      navigation.navigate(Screens.Home as any, queryInfo);
    },
    [indexByBook, navigation, openReviewByAttempt],
  );

  const handleToggleFavorite = useCallback(
    async (id: string) => {
      const row = await chapterQuizLocalDbService.getAttemptById(id);
      if (!row) return;
      await chapterQuizLocalDbService.setAttemptFavorite(id, !row.isFavorite);
      await reloadAttempts();
      if (reviewAttempt?.id === id) {
        setReviewAttempt({ ...row, isFavorite: !row.isFavorite });
      }
      showToast(row.isFavorite ? "Quitado de favoritos" : "Guardado en favoritos");
    },
    [reloadAttempts, reviewAttempt?.id],
  );

  const handleDeleteAttempt = useCallback(
    (id: string) => {
      confirm(
        "Eliminar intento",
        "Este registro se borrará solo de tu dispositivo. Las preguntas del quiz compartido no se modifican. ¿Continuar?",
        async () => {
          await chapterQuizLocalDbService.deleteAttempt(id);
          await reloadAttempts();
          if (reviewAttempt?.id === id) {
            setReviewAttempt(null);
            goBackInternal();
          }
          showToast("Intento eliminado");
        },
      );
    },
    [confirm, reloadAttempts, reviewAttempt?.id, goBackInternal],
  );

  const handleDownvote = useCallback(
    (chapterKey: string) => {
      if (!pb.authStore.isValid) {
        alertWarning(
          "Inicia sesión",
          "Necesitas una cuenta para votar cuando un quiz no es bueno.",
        );
        return;
      }
      confirm(
        "Marcar quiz compartido como poco útil",
        "Esto cuenta como un voto negativo sobre la versión del quiz que comparten todos los usuarios. Si varias personas coinciden, ese quiz se puede sustituir por uno nuevo. ¿Deseas continuar?",
        async () => {
          setDownvoteLoadingChapterKey(chapterKey);
          try {
            const result = await submitChapterQuizDownvote(chapterKey);
            if (!result.ok) {
              showToast(result.message);
              return;
            }
            await reloadDownvotes();
            if (result.reachedThreshold) {
              showToast(
                "Este quiz se sustituirá por uno nuevo cuando alguien lo genere de nuevo.",
              );
            } else {
              showToast("Gracias por tu opinión");
            }
          } finally {
            setDownvoteLoadingChapterKey(null);
          }
        },
      );
    },
    [alertWarning, confirm, reloadDownvotes],
  );

  const handleRemoveDownvote = useCallback(
    (chapterKey: string) => {
      if (!pb.authStore.isValid) {
        alertWarning("Inicia sesión", "Necesitas una cuenta para gestionar tu voto.");
        return;
      }
      confirm(
        "Quitar voto negativo",
        "Se eliminará tu voto sobre el quiz compartido de este capítulo. ¿Continuar?",
        async () => {
          setDownvoteLoadingChapterKey(chapterKey);
          try {
            const result = await removeChapterQuizDownvote(chapterKey);
            if (!result.ok) {
              showToast(result.message);
              return;
            }
            await reloadDownvotes();
            showToast("Voto eliminado");
          } finally {
            setDownvoteLoadingChapterKey(null);
          }
        },
      );
    },
    [alertWarning, confirm, reloadDownvotes],
  );

  const handleRetryFailed = useCallback(
    async (id: string) => {
      const attempt = await chapterQuizLocalDbService.getAttemptById(id);
      if (!attempt) return;
      const byIndex = new Map(
        attempt.answers.map((x) => [x.questionIndex, x.selected]),
      );
      const failed = attempt.questions.filter((q, idx) => {
        const sel = byIndex.get(idx) ?? null;
        return sel !== q.correct;
      });
      if (failed.length === 0) {
        showToast("No hubo preguntas falladas en este intento");
        return;
      }
      chapterQuizStateHelpers.setActiveQuiz({
        chapterKey: attempt.chapterKey,
        book: attempt.book,
        chapter: attempt.chapter,
        requestedCount: failed.length,
        questions: shuffleArray(failed),
      });
      modalState$.openChapterQuizBottomSheet();
    },
    [],
  );

  const handleChapterLongPress = useCallback(
    (row: ChapterQuizAttemptRow) => {
      actionSheet(
        `${row.book} ${row.chapter}`,
        row.pass ? "Aprobado" : "En proceso",
        [
          {
            text: row.isFavorite ? "Quitar de favoritos" : "Guardar en favoritos",
            onPress: () => void handleToggleFavorite(row.id),
          },
          {
            text: "Reintentar falladas",
            onPress: () => void handleRetryFailed(row.id),
          },
          {
            text: "Eliminar intento",
            style: "destructive",
            onPress: () => handleDeleteAttempt(row.id),
          },
          { text: "Cancelar", style: "cancel", onPress: () => { } },
        ],
      );
    },
    [actionSheet, handleToggleFavorite, handleRetryFailed, handleDeleteAttempt],
  );

  const screenOptions: SingleScreenHeaderProps = useMemo(() => {
    const title =
      viewState.kind === "books"
        ? "Mis Quiz"
        : viewState.kind === "chapters"
          ? viewState.book
          : reviewAttempt
            ? `${reviewAttempt.book} ${reviewAttempt.chapter}`
            : "Repasar";

    return {
      theme,
      title,
      titleIcon: viewState.kind === "books" ? "ListChecks" : "BookOpen",
      titleIconColor: theme.colors.notification,
      goBack: headerGoBack,
      headerRightProps: {
        headerRightIcon: "RefreshCw",
        style: { display: "none" },
        headerRightIconColor: theme.colors.notification,
        disabled: true,
      },
    };
  }, [
    headerGoBack,
    reviewAttempt,
    theme,
    viewState,
  ]);

  return (
    <Fragment>
      <Stack.Screen options={singleScreenHeader(screenOptions)} />
      <ScreenWithAnimation
        icon="ListChecks"
        iconColor={theme.colors.notification}
        title="Mis Quiz"
      >
        <ThemedView style={[styles.container, { backgroundColor: surfaces.base }]}>
          {viewState.kind === "books" ? (
            <AnimatedView key="books" direction={direction}>
              <BooksView
                surfaces={surfaces}
                metrics={metrics}
                bookSummaries={bookSummaries}
                filter={booksFilter}
                onFilterChange={setBooksFilter}
                onPressBook={openBook}
              />
            </AnimatedView>
          ) : viewState.kind === "chapters" ? (
            <AnimatedView
              key={`chapters-${viewState.book}`}
              direction={direction}
            >
              <ChaptersView
                surfaces={surfaces}
                book={viewState.book}
                summary={
                  bookSummaries.find((b) => b.book === viewState.book) ?? null
                }
                attemptIndex={indexByBook.get(viewState.book) ?? null}
                onPressChapter={(chapter) => openChapter(viewState.book, chapter)}
                onLongPressChapter={handleChapterLongPress}
              />
            </AnimatedView>
          ) : reviewAttempt ? (
            <AnimatedView
              key={`review-${viewState.attemptId}`}
              direction={direction}
            >
              <ReviewView
                surfaces={surfaces}
                attempt={reviewAttempt}
                isDownvoted={downvotedSet.has(reviewAttempt.chapterKey)}
                isDownvoteLoading={
                  downvoteLoadingChapterKey === reviewAttempt.chapterKey
                }
                onRetryFailed={() => void handleRetryFailed(reviewAttempt.id)}
                onBack={headerGoBack}
                onToggleFavorite={() => void handleToggleFavorite(reviewAttempt.id)}
                onDelete={() => handleDeleteAttempt(reviewAttempt.id)}
                onDownvote={() => handleDownvote(reviewAttempt.chapterKey)}
                onRemoveDownvote={() => handleRemoveDownvote(reviewAttempt.chapterKey)}
              />
            </AnimatedView>
          ) : null}
        </ThemedView>
        {isChapterQuizOpen ? <ChapterQuizBottomSheet /> : null}
      </ScreenWithAnimation>
    </Fragment>
  );
};

/* ───────────────────────── Books View ───────────────────────── */

const BooksView: React.FC<{
  surfaces: ReturnType<typeof getSurfaces>;
  metrics: ReturnType<typeof computeChapterQuizMetrics>;
  bookSummaries: BookSummary[];
  filter: BooksFilter;
  onFilterChange: (f: BooksFilter) => void;
  onPressBook: (book: string) => void;
}> = ({ surfaces, metrics, bookSummaries, filter, onFilterChange, onPressBook }) => {
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

  return (
    <FlatList
      data={visible}
      keyExtractor={(item) => item.book}
      renderItem={({ item }) => (
        <BookCard summary={item} surfaces={surfaces} onPress={onPressBook} />
      )}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View style={styles.booksHeader}>
          <HistoryHeader metrics={metrics} surfaces={surfaces} />
          <View style={styles.filterRow}>
            <FilterChip
              label={`Iniciados${startedCount > 0 ? ` · ${startedCount}` : ""}`}
              active={filter === "started"}
              onPress={() => onFilterChange("started")}
              surfaces={surfaces}
            />
            <FilterChip
              label="Todos"
              active={filter === "all"}
              onPress={() => onFilterChange("all")}
              surfaces={surfaces}
            />
          </View>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Icon
            name="ListChecks"
            color={surfaces.softText}
            size={36}
            strokeWidth={1.5}
          />
          <Text style={[styles.emptyText, { color: surfaces.muted }]}>
            Aún no has completado ningún quiz.{"\n"}
            Comienza a leer y prueba tu conocimiento.
          </Text>
        </View>
      }
    />
  );
};

const FilterChip: React.FC<{
  label: string;
  active: boolean;
  onPress: () => void;
  surfaces: ReturnType<typeof getSurfaces>;
}> = ({ label, active, onPress, surfaces }) => (
  <Pressable onPress={onPress} hitSlop={6}>
    <View
      style={[
        styles.chip,
        {
          borderColor: active ? surfaces.accent : surfaces.border,
          backgroundColor: active ? surfaces.accentSoft : "transparent",
        },
      ]}
    >
      <Text
        style={[
          styles.chipText,
          { color: active ? surfaces.accent : surfaces.muted },
        ]}
      >
        {label}
      </Text>
    </View>
  </Pressable>
);

/* ───────────────────────── Chapters View ───────────────────────── */

const ChaptersView: React.FC<{
  surfaces: ReturnType<typeof getSurfaces>;
  book: string;
  summary: BookSummary | null;
  attemptIndex: ChapterAttemptIndex | null;
  onPressChapter: (chapter: number) => void;
  onLongPressChapter: (row: ChapterQuizAttemptRow) => void;
}> = ({
  surfaces,
  book,
  summary,
  attemptIndex,
  onPressChapter,
  onLongPressChapter,
}) => {
    const total = summary?.totalChapters ?? 0;
    const passed = summary?.passedChapters ?? 0;
    const completed = summary?.completedChapters ?? 0;
    const percent = summary?.percent ?? 0;

    const chapters = useMemo(
      () => Array.from({ length: total }, (_, i) => i + 1),
      [total],
    );

    return (
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.chaptersHead}>
          <Text style={[styles.chaptersTitle, { color: surfaces.text }]}>
            {book}
          </Text>
          <Text style={[styles.chaptersSub, { color: surfaces.muted }]}>
            {`${passed} de ${total} aprobados`}
            {completed > passed ? `  ·  ${completed - passed} en proceso` : ""}
            {`  ·  ${percent}%`}
          </Text>
        </View>
        <View
          style={[
            styles.divider,
            { backgroundColor: surfaces.border, marginBottom: SP.lg },
          ]}
        />

        <View style={styles.grid}>
          {chapters.map((c) => {
            const best = attemptIndex?.bestByChapter.get(c);
            let state: ChapterCellState = { kind: "not_started" };
            if (best) {
              state = best.pass
                ? {
                  kind: "passed",
                  score: best.score,
                  total: best.total,
                  attemptId: best.id,
                }
                : {
                  kind: "failed",
                  score: best.score,
                  total: best.total,
                  attemptId: best.id,
                };
            }
            return (
              <ChapterCell
                key={c}
                chapter={c}
                state={state}
                surfaces={surfaces}
                onPress={() => onPressChapter(c)}
                onLongPress={best ? () => onLongPressChapter(best) : undefined}
              />
            );
          })}
        </View>

        {/* Tiny legend */}
        <View style={styles.legend}>
          <LegendDot color={surfaces.accent} label="Aprobado" surfaces={surfaces} />
          <LegendDot color={surfaces.fail} label="En proceso" surfaces={surfaces} />
          <LegendDot
            color={surfaces.borderStrong}
            label="Sin iniciar"
            surfaces={surfaces}
            hollow
          />
        </View>
      </ScrollView>
    );
  };

const LegendDot: React.FC<{
  color: string;
  label: string;
  surfaces: ReturnType<typeof getSurfaces>;
  hollow?: boolean;
}> = ({ color, label, surfaces, hollow }) => (
  <View style={styles.legendItem}>
    <View
      style={[
        styles.legendDot,
        hollow
          ? { borderColor: color, borderWidth: 1, backgroundColor: "transparent" }
          : { backgroundColor: color },
      ]}
    />
    <Text style={[styles.legendText, { color: surfaces.muted }]}>{label}</Text>
  </View>
);

/* ───────────────────────── Review View ───────────────────────── */

const ReviewView: React.FC<{
  surfaces: ReturnType<typeof getSurfaces>;
  attempt: ChapterQuizAttemptRow;
  isDownvoted: boolean;
  isDownvoteLoading: boolean;
  onRetryFailed: () => void;
  onBack: () => void;
  onToggleFavorite: () => void;
  onDelete: () => void;
  onDownvote: () => void;
  onRemoveDownvote: () => void;
}> = ({
  surfaces,
  attempt,
  isDownvoted,
  isDownvoteLoading,
  onRetryFailed,
  onBack,
  onToggleFavorite,
  onDelete,
  onDownvote,
  onRemoveDownvote,
}) => {
    const byIndex = useMemo(
      () => new Map(attempt.answers.map((x) => [x.questionIndex, x.selected])),
      [attempt],
    );
    const hasFailed = useMemo(() => {
      for (let i = 0; i < attempt.questions.length; i++) {
        const q = attempt.questions[i];
        const sel = byIndex.get(i) ?? null;
        if (sel !== q.correct) return true;
      }
      return false;
    }, [attempt, byIndex]);

    const ratio = attempt.total > 0 ? attempt.score / attempt.total : 0;

    const subline = ratio >= 1
      ? "Respondiste todo correctamente"
      : ratio >= 0.7
        ? "Repasa lo que no acertaste"
        : "Cada repaso ayuda a entender mejor";

    return (
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.reviewHead}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.reviewTitle, { color: surfaces.text }]}>
              {attempt.book} {attempt.chapter}
            </Text>
            <Text style={[styles.reviewSub, { color: surfaces.muted }]}>
              {`${attempt.score} de ${attempt.total} correctas · ${subline}`}
            </Text>
          </View>
          <ScoreRing
            score={attempt.score}
            total={attempt.total}
            pass={attempt.pass}
            surfaces={surfaces}
          />
        </View>
        <View
          style={[
            styles.divider,
            { backgroundColor: surfaces.border, marginBottom: SP.lg },
          ]}
        />

        {/* Quick row of small actions */}
        <View style={styles.reviewQuickRow}>
          <QuickAction
            icon={attempt.isFavorite ? "Star" : "Star"}
            label={attempt.isFavorite ? "Guardado" : "Guardar"}
            active={attempt.isFavorite}
            onPress={onToggleFavorite}
            surfaces={surfaces}
          />
          <QuickAction
            icon="Trash2"
            label="Eliminar"
            onPress={onDelete}
            surfaces={surfaces}
            danger
          />
        </View>

        {attempt.questions.map((q, idx) => (
          <QuizReviewItem
            key={`${attempt.id}-${idx}`}
            index={idx}
            question={q}
            selected={byIndex.get(idx) ?? null}
            surfaces={surfaces}
          />
        ))}

        <View style={styles.reviewActions}>
          {hasFailed ? (
            <PrimaryButton
              label="Reintentar falladas"
              icon="RotateCcw"
              onPress={onRetryFailed}
              surfaces={surfaces}
            />
          ) : null}
          <SecondaryButton
            label="Volver al capítulo"
            icon="ArrowLeft"
            onPress={onBack}
            surfaces={surfaces}
          />
        </View>

        {/* Downvote section */}
        <View
          style={[
            styles.voteSection,
            { borderTopColor: surfaces.border },
          ]}
        >
          {isDownvoted ? (
            <>
              <Text style={[styles.voteHint, { color: surfaces.muted }]}>
                Ya votaste negativo este quiz compartido
              </Text>
              <DangerButton
                label={isDownvoteLoading ? "Quitando…" : "Quitar voto negativo"}
                icon="Undo2"
                onPress={onRemoveDownvote}
                surfaces={surfaces}
                loading={isDownvoteLoading}
                variant="active"
              />
            </>
          ) : (
            <DangerButton
              label={
                isDownvoteLoading ? "Enviando…" : "Reportar quiz como incorrecto"
              }
              icon="ThumbsDown"
              onPress={onDownvote}
              surfaces={surfaces}
              loading={isDownvoteLoading}
            />
          )}
        </View>
      </ScrollView>
    );
  };

const ScoreRing: React.FC<{
  score: number;
  total: number;
  pass: boolean;
  surfaces: ReturnType<typeof getSurfaces>;
  size?: number;
}> = ({ score, total, pass, surfaces, size = 50 }) => {
  const stroke = 3;
  const r = (size - stroke) / 2 - 1;
  const cx = size / 2;
  const cy = size / 2;
  const ratio = total > 0 ? score / total : 0;
  const circ = 2 * Math.PI * r;
  const dash = circ * Math.max(0, Math.min(1, ratio));
  const color = pass ? surfaces.accent : surfaces.fail;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={cx} cy={cy} r={r} stroke={surfaces.border} strokeWidth={stroke} fill="none" />
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          rotation={-90}
          originX={cx}
          originY={cy}
        />
      </Svg>
      <Text style={{ fontSize: 11, fontWeight: "700", color: surfaces.text, letterSpacing: -0.2 }}>
        {score}/{total}
      </Text>
    </View>
  );
};

/* ───────────────────────── Buttons ───────────────────────── */

const PrimaryButton: React.FC<{
  label: string;
  icon?: any;
  onPress: () => void;
  surfaces: ReturnType<typeof getSurfaces>;
}> = ({ label, icon, onPress, surfaces }) => (
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={onPress}
    style={[
      styles.btn,
      styles.btnPrimary,
      { backgroundColor: surfaces.accent, borderRadius: RADIUS.button },
    ]}
  >
    {icon ? <Icon name={icon} size={15} color="#fff" /> : null}
    <Text style={styles.btnPrimaryText}>{label}</Text>
  </TouchableOpacity>
);

const SecondaryButton: React.FC<{
  label: string;
  icon?: any;
  onPress: () => void;
  surfaces: ReturnType<typeof getSurfaces>;
}> = ({ label, icon, onPress, surfaces }) => (
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={onPress}
    style={[
      styles.btn,
      {
        borderColor: surfaces.border,
        borderWidth: 1,
        borderRadius: RADIUS.button,
      },
    ]}
  >
    {icon ? <Icon name={icon} size={14} color={surfaces.muted} /> : null}
    <Text style={[styles.btnSecondaryText, { color: surfaces.text }]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const DangerButton: React.FC<{
  label: string;
  icon?: any;
  onPress: () => void;
  surfaces: ReturnType<typeof getSurfaces>;
  loading?: boolean;
  variant?: "default" | "active";
}> = ({ label, icon, onPress, surfaces, loading, variant = "default" }) => (
  <TouchableOpacity
    activeOpacity={0.8}
    disabled={loading}
    onPress={onPress}
    style={[
      styles.btn,
      {
        borderColor: variant === "active" ? surfaces.fail : surfaces.fail + "55",
        borderWidth: 1,
        borderRadius: RADIUS.button,
        backgroundColor: variant === "active" ? surfaces.failSoft : "transparent",
        opacity: loading ? 0.6 : 1,
      },
    ]}
  >
    {icon ? <Icon name={icon} size={14} color={surfaces.fail} /> : null}
    <Text style={[styles.btnSecondaryText, { color: surfaces.fail }]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const QuickAction: React.FC<{
  icon: any;
  label: string;
  onPress: () => void;
  surfaces: ReturnType<typeof getSurfaces>;
  active?: boolean;
  danger?: boolean;
}> = ({ icon, label, onPress, surfaces, active, danger }) => {
  const color = danger
    ? surfaces.fail
    : active
      ? surfaces.accent
      : surfaces.muted;
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.quickAction,
        {
          borderColor: surfaces.border,
          borderRadius: RADIUS.pill,
        },
      ]}
    >
      <Icon name={icon} size={13} color={color} fillColor={active ? color : "none"} />
      <Text style={[styles.quickActionText, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: {
    paddingHorizontal: SP.lg,
    paddingTop: SP.lg,
    paddingBottom: SP.xxl + SP.md,
  },
  booksHeader: {
    marginBottom: SP.lg,
  },
  filterRow: {
    flexDirection: "row",
    gap: SP.sm,
    marginTop: SP.md,
  },
  chip: {
    borderWidth: 1,
    paddingHorizontal: SP.md,
    paddingVertical: SP.sm - 1,
    borderRadius: RADIUS.pill,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  empty: {
    alignItems: "center",
    paddingVertical: SP.xxl + SP.md,
    gap: SP.md,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "500",
  },
  chaptersHead: {
    marginBottom: SP.md,
  },
  chaptersTitle: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  chaptersSub: {
    fontSize: 13,
    fontWeight: "500",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    width: "100%",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  legend: {
    flexDirection: "row",
    gap: SP.lg,
    marginTop: SP.xl,
    flexWrap: "wrap",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SP.sm - 2,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    fontWeight: "500",
  },
  reviewHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: SP.md,
    marginBottom: SP.md,
  },
  reviewTitle: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  reviewSub: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },
  reviewQuickRow: {
    flexDirection: "row",
    gap: SP.sm,
    marginBottom: SP.lg,
  },
  quickAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: SP.md,
    paddingVertical: SP.sm - 1,
    borderWidth: 1,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: "600",
  },
  reviewActions: {
    marginTop: SP.md,
    gap: SP.sm,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SP.sm,
    paddingVertical: SP.md - 1,
    paddingHorizontal: SP.md,
  },
  btnPrimary: {
    borderWidth: 0,
  },
  btnPrimaryText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: -0.1,
  },
  btnSecondaryText: {
    fontSize: 13,
    fontWeight: "600",
  },
  voteSection: {
    marginTop: SP.xl,
    paddingTop: SP.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: SP.sm,
  },
  voteHint: {
    fontSize: 11,
    fontWeight: "500",
  },
});

export default ChapterQuizHistoryScreen;
