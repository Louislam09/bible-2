import ChapterQuizBottomSheet from "@/components/ChapterQuizBottomSheet";
import {
  singleScreenHeader,
  type SingleScreenHeaderProps,
} from "@/components/common/singleScreenHeader";
import Icon from "@/components/Icon";
import { AnimatedView } from "@/components/quizHistory/AnimatedView";
import {
  ChapterQuizDetailView,
  type ChapterQuizSizeOption,
} from "@/components/quizHistory/ChapterQuizDetailView";
import { QuizHistoryBooksSettingsModal } from "@/components/quizHistory/QuizHistoryBooksSettingsModal";
import {
  QuizHistoryBooksWebView,
  QuizHistoryChaptersWebView,
} from "@/components/quizHistory/QuizHistoryListWebViews";
import {
  RADIUS,
  SP,
  getSurfaces,
} from "@/components/quizHistory/quizHistoryTokens";
import {
  QuizQuickAction,
  QuizQuickActionsRow,
} from "@/components/quizHistory/QuizQuickAction";
import { QuizReviewItem } from "@/components/quizHistory/QuizReviewItem";
import ScreenWithAnimation from "@/components/ScreenWithAnimation";
import { Text, View as ThemedView } from "@/components/Themed";
import { useAlert } from "@/context/AlertContext";
import { useDBContext } from "@/context/databaseContext";
import { storedData$ } from "@/context/LocalstoreContext";
import { useMyTheme } from "@/context/ThemeContext";
import { pb } from "@/globalConfig";
import {
  isChapterQuizLoginRequiredError,
  isChapterQuizOfflineError,
  useChapterQuizAI,
} from "@/hooks/useChapterQuizAI";
import {
  useQuizProgress,
  type BookSummary,
  type ChapterAttemptIndex,
} from "@/hooks/useQuizProgress";
import { aiManager } from "@/services/ai/aiManager";
import {
  fetchUserDownvotedChapterKeys,
  removeChapterQuizDownvote,
  submitChapterQuizDownvote,
} from "@/services/chapterQuizDownvoteService";
import { chapterQuizCacheService } from "@/services/chapterQuizCacheService";
import {
  chapterQuizLocalDbService,
  type ChapterQuizAttemptRow,
  type ChapterQuizSessionRow,
} from "@/services/chapterQuizLocalDbService";
import { bibleState$ } from "@/state/bibleState";
import { chapterQuizStateHelpers } from "@/state/chapterQuizState";
import { modalState$ } from "@/state/modalState";
import { Screens, type pbUser } from "@/types";
import {
  parseQuizHistoryBookCardVariant,
  type QuizHistoryBookCardVariant,
} from "@/constants/quizHistoryBookCardVariant";
import type { QuizHistoryBooksLayout } from "@/constants/quizHistoryWebViewHtml";
import { headerIconSize } from "@/constants/size";
import { computeChapterQuizMetrics } from "@/utils/quizHistory";
import { loadChapterVersesTextForQuiz } from "@/utils/loadChapterVersesForQuiz";
import { showToast } from "@/utils/showToast";
import { shuffleArray } from "@/utils/shuffleOptions";
import { use$ } from "@legendapp/state/react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
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
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";

type ReviewNavigationFrom =
  | { kind: "chapters"; book: string }
  | { kind: "chapterDetail"; book: string; chapter: number };

type ViewState =
  | { kind: "books" }
  | { kind: "chapters"; book: string }
  | { kind: "chapterDetail"; book: string; chapter: number }
  | {
      kind: "review";
      attemptId: string;
      reviewFrom: ReviewNavigationFrom | null;
    };

type BooksFilter = "started" | "all";

const ChapterQuizHistoryScreen = () => {
  const { theme } = useMyTheme();
  const router = useRouter();
  const navigation = useNavigation<any>();
  const params = useLocalSearchParams<{ attemptId?: string | string[] }>();
  const { alert, alertWarning, confirm } = useAlert();
  const surfaces = useMemo(() => getSurfaces(theme), [theme]);
  const { allBibleLoaded, getBibleServices } = useDBContext();
  const currentBibleVersion = use$(() => storedData$.currentBibleVersion.get());
  const quizHistoryBookCardVariant = use$(() =>
    parseQuizHistoryBookCardVariant(
      storedData$.quizHistoryBookCardVariant.get(),
    ),
  );
  const quizHistoryUser = use$(() => storedData$.user.get());
  const { getQuestionsForChapter } = useChapterQuizAI();

  const [attempts, setAttempts] = useState<ChapterQuizAttemptRow[]>([]);
  const [quizSessions, setQuizSessions] = useState<ChapterQuizSessionRow[]>([]);
  const [viewState, setViewState] = useState<ViewState>({ kind: "books" });
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [booksFilter, setBooksFilter] = useState<BooksFilter>("started");
  const [booksLayout, setBooksLayout] = useState<QuizHistoryBooksLayout>("grid");
  const [booksSettingsOpen, setBooksSettingsOpen] = useState(false);
  const [reviewAttempt, setReviewAttempt] =
    useState<ChapterQuizAttemptRow | null>(null);
  const [userDownvotedChapterKeys, setUserDownvotedChapterKeys] = useState<
    string[]
  >([]);
  const [downvoteLoadingChapterKey, setDownvoteLoadingChapterKey] = useState<
    string | null
  >(null);
  const [loadingQuizSize, setLoadingQuizSize] =
    useState<ChapterQuizSizeOption | null>(null);

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

  const reloadLocalQuizData = useCallback(async () => {
    const [rows, sessions] = await Promise.all([
      chapterQuizLocalDbService.getAllAttempts(),
      chapterQuizLocalDbService.getAllQuizSessions(),
    ]);
    setAttempts(rows);
    setQuizSessions(sessions);
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
      void reloadLocalQuizData();
    }
    wasQuizOpenRef.current = isChapterQuizOpen;
  }, [isChapterQuizOpen, reloadLocalQuizData]);

  useFocusEffect(
    useCallback(() => {
      void reloadLocalQuizData();
      void reloadDownvotes();
    }, [reloadLocalQuizData, reloadDownvotes]),
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
      setViewState({
        kind: "review",
        attemptId: id,
        reviewFrom: { kind: "chapters", book: row.book },
      });
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
      const rf = viewState.reviewFrom;
      if (rf?.kind === "chapterDetail") {
        setViewState({
          kind: "chapterDetail",
          book: rf.book,
          chapter: rf.chapter,
        });
      } else if (rf?.kind === "chapters") {
        setViewState({ kind: "chapters", book: rf.book });
      } else {
        setViewState({ kind: "books" });
      }
      setReviewAttempt(null);
      return true;
    }
    if (viewState.kind === "chapterDetail") {
      setDirection("backward");
      setViewState({ kind: "chapters", book: viewState.book });
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

  const openReviewByAttempt = useCallback(
    (row: ChapterQuizAttemptRow, reviewFrom: ReviewNavigationFrom) => {
      setReviewAttempt(row);
      setDirection("forward");
      setViewState({
        kind: "review",
        attemptId: row.id,
        reviewFrom,
      });
    },
    [],
  );

  const openChapter = useCallback((book: string, chapter: number) => {
    setDirection("forward");
    setViewState({ kind: "chapterDetail", book, chapter });
  }, []);

  const chapterAttemptsForDetail = useMemo(() => {
    if (viewState.kind !== "chapterDetail") return [];
    return attempts.filter(
      (a) => a.book === viewState.book && a.chapter === viewState.chapter,
    );
  }, [attempts, viewState]);

  const attemptsForChaptersList = useMemo(() => {
    if (viewState.kind !== "chapters") return [];
    return attempts.filter((a) => a.book === viewState.book);
  }, [attempts, viewState]);

  const sessionsForChapterDetail = useMemo(() => {
    if (viewState.kind !== "chapterDetail") return [];
    const key = chapterQuizCacheService.buildChapterKey(
      viewState.book,
      viewState.chapter,
    );
    return quizSessions.filter((s) => s.chapterKey === key);
  }, [quizSessions, viewState]);

  const handleReadChapterFromDetail = useCallback(() => {
    if (viewState.kind !== "chapterDetail") return;
    const { book, chapter } = viewState;
    const queryInfo = { book, chapter, verse: 1 };
    bibleState$.changeBibleQuery({
      ...queryInfo,
      shouldFetch: true,
      isHistory: false,
    });
    navigation.navigate(Screens.Home as any, queryInfo);
  }, [navigation, viewState]);

  const runStartQuizFromDetail = useCallback(
    async (size: ChapterQuizSizeOption) => {
      if (viewState.kind !== "chapterDetail") return;
      const { book, chapter } = viewState;
      if (!aiManager.hasAnyProvider()) {
        alertWarning(
          "Aviso",
          "El servicio de IA no está disponible en este momento.",
        );
        return;
      }
      try {
        setLoadingQuizSize(size);
        const versesText =
          allBibleLoaded
            ? await loadChapterVersesTextForQuiz(
                getBibleServices,
                String(currentBibleVersion),
                book,
                chapter,
              )
            : "";
        const result = await getQuestionsForChapter({
          book,
          chapter,
          requestedCount: size,
          versesText,
        });
        chapterQuizStateHelpers.setActiveQuiz({
          chapterKey: result.chapterKey,
          book,
          chapter,
          requestedCount: size,
          questions: result.questions,
        });
        modalState$.openChapterQuizBottomSheet();
      } catch (e) {
        if (isChapterQuizLoginRequiredError(e)) {
          alert({
            type: "warning",
            title: "Inicio de sesión requerido",
            message:
              "Debes iniciar sesión para generar preguntas nuevas. Si ya hay un quiz guardado para este capítulo, se usará sin cuenta.",
            buttons: [
              { text: "Cancelar", style: "cancel" },
              {
                text: "Iniciar sesión",
                onPress: () => navigation.navigate(Screens.Login),
              },
            ],
          });
        } else if (isChapterQuizOfflineError(e)) {
          alert({
            type: "offline",
            title: "Sin conexión",
            message:
              "No hay internet y este capítulo no tiene un quiz guardado en el dispositivo. Conéctate para generarlo, o abre un capítulo en el que ya hayas jugado o descargado preguntas.",
          });
        } else {
          alertWarning(
            "Error",
            "No se pudo preparar el quiz. Intenta nuevamente.",
          );
        }
      } finally {
        setLoadingQuizSize(null);
      }
    },
    [
      alert,
      alertWarning,
      allBibleLoaded,
      currentBibleVersion,
      getBibleServices,
      getQuestionsForChapter,
      navigation,
      viewState,
    ],
  );

  const handleStartQuizFromDetail = useCallback(
    (size: ChapterQuizSizeOption) => {
      if (viewState.kind !== "chapterDetail") return;
      const key = chapterQuizCacheService.buildChapterKey(
        viewState.book,
        viewState.chapter,
      );
      const hasAnyAttemptForChapter = attempts.some(
        (a) => a.book === viewState.book && a.chapter === viewState.chapter,
      );
      const hasAnySessionForChapter = quizSessions.some(
        (s) => s.chapterKey === key,
      );

      if (hasAnyAttemptForChapter || hasAnySessionForChapter) {
        void runStartQuizFromDetail(size);
        return;
      }

      confirm(
        "¿Ya leíste este capítulo?",
        "El quiz se basa en lo que leíste. Confirma que leíste el texto en la Biblia antes de comenzar.",
        () => void runStartQuizFromDetail(size),
      );
    },
    [attempts, confirm, quizSessions, runStartQuizFromDetail, viewState],
  );

  const handleToggleFavorite = useCallback(
    async (id: string) => {
      const row = await chapterQuizLocalDbService.getAttemptById(id);
      if (!row) return;
      await chapterQuizLocalDbService.setAttemptFavorite(id, !row.isFavorite);
      await reloadLocalQuizData();
      if (reviewAttempt?.id === id) {
        setReviewAttempt({ ...row, isFavorite: !row.isFavorite });
      }
      showToast(row.isFavorite ? "Quitado de favoritos" : "Guardado en favoritos");
    },
    [reloadLocalQuizData, reviewAttempt?.id],
  );

  const handleDeleteAttempt = useCallback(
    (id: string) => {
      confirm(
        "Eliminar intento",
        "Este registro se borrará solo de tu dispositivo. Las preguntas del quiz compartido no se modifican. ¿Continuar?",
        async () => {
          await chapterQuizLocalDbService.deleteAttempt(id);
          await reloadLocalQuizData();
          if (reviewAttempt?.id === id) {
            setReviewAttempt(null);
            goBackInternal();
          }
          showToast("Intento eliminado");
        },
      );
    },
    [confirm, reloadLocalQuizData, reviewAttempt?.id, goBackInternal],
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

  const screenOptions: SingleScreenHeaderProps = useMemo(() => {
    const title =
      viewState.kind === "books"
        ? "Mis Quiz"
        : viewState.kind === "chapters"
          ? viewState.book
          : viewState.kind === "chapterDetail"
            ? `${viewState.book} ${viewState.chapter}`
            : reviewAttempt
              ? `${reviewAttempt.book} ${reviewAttempt.chapter}`
              : "Repasar";

    return {
      theme,
      title,
      titleIcon:
        viewState.kind === "books" ? "ListChecks" : "BookOpen",
      titleIconColor: theme.colors.notification,
      goBack: headerGoBack,
      headerRightProps:
        viewState.kind === "books"
          ? {
              RightComponent: () => (
                <Pressable
                  onPress={() => {
                    void Haptics.selectionAsync();
                    setBooksSettingsOpen(true);
                  }}
                  style={{ marginRight: 4, padding: 6 }}
                  hitSlop={12}
                >
                  <Icon
                    name="Settings"
                    size={headerIconSize}
                    color={theme.colors.notification}
                  />
                </Pressable>
              ),
              headerRightIcon: "RefreshCw",
              headerRightIconColor: theme.colors.notification,
              disabled: false,
            }
          : {
              headerRightIcon: "RefreshCw",
              style: { display: "none" },
              headerRightIconColor: theme.colors.notification,
              disabled: true,
            },
    };
  }, [headerGoBack, reviewAttempt, theme, viewState]);

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
                direction={direction}
                surfaces={surfaces}
                metrics={metrics}
                attempts={attempts}
                bookSummaries={bookSummaries}
                indexByBook={indexByBook}
                filter={booksFilter}
                booksLayout={booksLayout}
                cardVariant={quizHistoryBookCardVariant}
                user={quizHistoryUser}
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
                direction={direction}
                surfaces={surfaces}
                book={viewState.book}
                summary={
                  bookSummaries.find((b) => b.book === viewState.book) ?? null
                }
                attempts={attemptsForChaptersList}
                quizSessions={quizSessions}
                onPressChapter={(chapter) => openChapter(viewState.book, chapter)}
              />
            </AnimatedView>
          ) : viewState.kind === "chapterDetail" ? (
            <AnimatedView
              key={`chapter-detail-${viewState.book}-${viewState.chapter}`}
              direction={direction}
            >
              <ChapterQuizDetailView
                surfaces={surfaces}
                book={viewState.book}
                chapter={viewState.chapter}
                chapterKey={chapterQuizCacheService.buildChapterKey(
                  viewState.book,
                  viewState.chapter,
                )}
                attempts={chapterAttemptsForDetail}
                sessions={sessionsForChapterDetail}
                loadingQuizSize={loadingQuizSize}
                onPressSize={(size) => void handleStartQuizFromDetail(size)}
                onPressAttempt={(row) =>
                  openReviewByAttempt(row, {
                    kind: "chapterDetail",
                    book: row.book,
                    chapter: row.chapter,
                  })
                }
                onReadChapter={handleReadChapterFromDetail}
                onToggleFavoriteBest={(id) => void handleToggleFavorite(id)}
                onRetryFailedBest={(id) => void handleRetryFailed(id)}
                onDeleteBestAttempt={handleDeleteAttempt}
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
        <QuizHistoryBooksSettingsModal
          visible={booksSettingsOpen}
          onClose={() => setBooksSettingsOpen(false)}
          surfaces={surfaces}
          booksLayout={booksLayout}
          onBooksLayoutChange={setBooksLayout}
        />
        {isChapterQuizOpen ? <ChapterQuizBottomSheet /> : null}
      </ScreenWithAnimation>
    </Fragment>
  );
};

/* ───────────────────────── Books / chapters (WebView lists) ───────────────────────── */

const BooksView: React.FC<{
  direction: "forward" | "backward";
  surfaces: ReturnType<typeof getSurfaces>;
  metrics: ReturnType<typeof computeChapterQuizMetrics>;
  attempts: ChapterQuizAttemptRow[];
  bookSummaries: BookSummary[];
  indexByBook: Map<string, ChapterAttemptIndex>;
  filter: BooksFilter;
  booksLayout: QuizHistoryBooksLayout;
  cardVariant: QuizHistoryBookCardVariant;
  user?: pbUser | null;
  onFilterChange: (f: BooksFilter) => void;
  onPressBook: (book: string) => void;
}> = (props) => <QuizHistoryBooksWebView {...props} />;

const ChaptersView: React.FC<{
  direction: "forward" | "backward";
  surfaces: ReturnType<typeof getSurfaces>;
  book: string;
  summary: BookSummary | null;
  attempts: ChapterQuizAttemptRow[];
  quizSessions: ChapterQuizSessionRow[];
  onPressChapter: (chapter: number) => void;
}> = (props) => <QuizHistoryChaptersWebView {...props} />;

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
        <QuizQuickActionsRow>
          <QuizQuickAction
            icon="Star"
            label={attempt.isFavorite ? "Guardado" : "Guardar"}
            active={attempt.isFavorite}
            onPress={onToggleFavorite}
            surfaces={surfaces}
          />
          <QuizQuickAction
            icon="Trash2"
            label="Eliminar"
            onPress={onDelete}
            surfaces={surfaces}
            danger
          />
        </QuizQuickActionsRow>

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

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: {
    paddingHorizontal: SP.lg,
    paddingTop: SP.lg,
    paddingBottom: SP.xxl + SP.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    width: "100%",
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
