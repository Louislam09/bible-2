import Icon from "@/components/Icon";
import {
  RADIUS,
  SP,
  getSurfaces,
} from "@/components/quizHistory/quizHistoryTokens";
import { useAlert } from "@/context/AlertContext";
import { useMyTheme } from "@/context/ThemeContext";
import { pb } from "@/globalConfig";
import type { ChapterQuizAttemptRow } from "@/services/chapterQuizLocalDbService";
import { chapterQuizLocalDbService } from "@/services/chapterQuizLocalDbService";
import { submitChapterQuizDownvote } from "@/services/chapterQuizDownvoteService";
import type { ActiveChapterQuiz } from "@/state/chapterQuizState";
import { chapterQuizState$, chapterQuizStateHelpers } from "@/state/chapterQuizState";
import { modalState$ } from "@/state/modalState";
import { TTheme } from "@/types";
import { computeChapterQuizProgress } from "@/utils/chapterQuizProgress";
import {
  findNewlyUnlockedQuizBadgesByCriteria,
  persistNewQuizBadgeUnlocks,
  type QuizBadgeState,
} from "@/utils/quizBadges";
import { showToast } from "@/utils/showToast";
import { shuffleArray } from "@/utils/shuffleOptions";
import { use$ } from "@legendapp/state/react";
import * as Crypto from "expo-crypto";
import { useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View as RNView,
  type LayoutChangeEvent,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import LottieView from "lottie-react-native";
import Reference from "@/components/Reference";
import BottomModal from "./BottomModal";
import { Text, View } from "./Themed";

const confettiSource = require("../assets/lottie/confetti_animation.json");

/** Same bar as "Muy bien" / completion tiers: 70%+ counts as pass. */
const PASS_RATIO = 0.7;

const VIEW_TRANS_MS = 220;

/** Full border draw around the row; starts at bottom-right; icon after (ms). */
const OPTION_BORDER_TRACE_MS = 820;
const OPTION_TRACE_STROKE = 2;
/** Inward (concave) corner scallops — matches the “plaque” outline when selected. */
const OPTION_PLAQUE_NOTCH = 11;
const AnimatedPath = Animated.createAnimatedComponent(Path);

function optionPlaqueNotchClamp(W: number, H: number): number {
  if (W <= 0 || H <= 0) return 0;
  return Math.min(OPTION_PLAQUE_NOTCH, W / 2 - 1, H / 2 - 1);
}

/** Closed plaque with concave corners; perimeter = 2(W+H) - 8n + 2πn. */
function optionPlaquePathD(W: number, H: number, n: number): string {
  if (W <= 0 || H <= 0 || n <= 0) return "";
  const nn = Math.min(n, W / 2 - 0.01, H / 2 - 0.01);
  return [
    `M ${nn} 0`,
    `L ${W - nn} 0`,
    `A ${nn} ${nn} 0 0 0 ${W} ${nn}`,
    `L ${W} ${H - nn}`,
    `A ${nn} ${nn} 0 0 0 ${W - nn} ${H}`,
    `L ${nn} ${H}`,
    `A ${nn} ${nn} 0 0 0 0 ${H - nn}`,
    `L 0 ${nn}`,
    `A ${nn} ${nn} 0 0 0 ${nn} 0`,
    "Z",
  ].join(" ");
}

/** Same plaque; trace starts at bottom-right (BR arc last in draw order). */
function optionPlaqueTracePathD(W: number, H: number, n: number): string {
  if (W <= 0 || H <= 0 || n <= 0) return "";
  const nn = Math.min(n, W / 2 - 0.01, H / 2 - 0.01);
  return [
    `M ${W - nn} ${H}`,
    `L ${nn} ${H}`,
    `A ${nn} ${nn} 0 0 0 0 ${H - nn}`,
    `L 0 ${nn}`,
    `A ${nn} ${nn} 0 0 0 ${nn} 0`,
    `L ${W - nn} 0`,
    `A ${nn} ${nn} 0 0 0 ${W} ${nn}`,
    `L ${W} ${H - nn}`,
    `A ${nn} ${nn} 0 0 0 ${W - nn} ${H}`,
    "Z",
  ].join(" ");
}

const STEPPER_SEGMENT_H = 5;

/** Segmented stepper (Duolingo-style): completed = accent, current = soft accent, rest = muted track. */
const QuizStepper: React.FC<{
  total: number;
  currentIndex: number;
  hasAnswered: boolean;
  surfaces: ReturnType<typeof getSurfaces>;
}> = ({ total, currentIndex, hasAnswered, surfaces }) => {
  if (total <= 0) return null;
  return (
    <RNView style={{ width: "100%", marginTop: SP.sm }}>
      <RNView
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: SP.xs,
        }}
      >
        {Array.from({ length: total }, (_, i) => {
          const completed =
            i < currentIndex || (i === currentIndex && hasAnswered);
          const current = i === currentIndex && !hasAnswered;
          const backgroundColor = completed
            ? surfaces.accent
            : current
              ? surfaces.accent + "55"
              : surfaces.border;
          return (
            <RNView
              key={i}
              style={{
                flex: 1,
                height: STEPPER_SEGMENT_H,
                borderRadius: RADIUS.pill,
                backgroundColor,
              }}
            />
          );
        })}
      </RNView>
      <RNView
        style={{
          height: StyleSheet.hairlineWidth,
          width: "100%",
          marginTop: SP.sm,
          backgroundColor: surfaces.border,
        }}
      />
    </RNView>
  );
};

const QuizOptionRow: React.FC<{
  option: string;
  optionIndex: number;
  isSelected: boolean;
  isCorrect: boolean;
  isWrongSelection: boolean;
  hasAnswered: boolean;
  disabled: boolean;
  surfaces: ReturnType<typeof getSurfaces>;
  styles: ReturnType<typeof getStyles>;
  onPress: () => void;
}> = ({
  option,
  optionIndex,
  isSelected,
  isCorrect,
  isWrongSelection,
  hasAnswered,
  disabled,
  surfaces,
  styles,
  onPress,
}) => {
  const pressed = useSharedValue(0);
  const traceProgress = useSharedValue(0);
  const iconReveal = useSharedValue(0);
  const layoutW = useSharedValue(0);
  const layoutH = useSharedValue(0);
  const [traceBox, setTraceBox] = useState({ w: 0, h: 0 });

  const shouldRevealAnim = hasAnswered && (isCorrect || isWrongSelection);
  const traceColor = isCorrect ? surfaces.accent : surfaces.fail;

  const onOptionLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    layoutW.value = width;
    layoutH.value = height;
    setTraceBox({ w: width, h: height });
  };

  useLayoutEffect(() => {
    if (!shouldRevealAnim) {
      traceProgress.value = 0;
      iconReveal.value = 0;
      return;
    }
    if (traceBox.w <= 0 || traceBox.h <= 0) return;
    traceProgress.value = 0;
    iconReveal.value = 0;
    traceProgress.value = withTiming(
      1,
      {
        duration: OPTION_BORDER_TRACE_MS,
        easing: Easing.inOut(Easing.cubic),
      },
      (finished) => {
        if (finished) {
          iconReveal.value = withTiming(1, {
            duration: 260,
            easing: Easing.out(Easing.cubic),
          });
        }
      },
    );
  }, [
    shouldRevealAnim,
    traceBox.w,
    traceBox.h,
    traceProgress,
    iconReveal,
  ]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.02 }],
    opacity: 1 - pressed.value * 0.05,
  }));

  const tracePathProps = useAnimatedProps(() => {
    const w = layoutW.value;
    const h = layoutH.value;
    if (w <= 1 || h <= 1) {
      return { strokeDashoffset: 0, strokeDasharray: "0 1" };
    }
    const sw = OPTION_TRACE_STROKE;
    const innerW = w - sw;
    const innerH = h - sw;
    const n = Math.min(
      OPTION_PLAQUE_NOTCH,
      innerW / 2 - 1,
      innerH / 2 - 1,
    );
    const p = 2 * (innerW + innerH) - 8 * n + 2 * Math.PI * n;
    const t = traceProgress.value;
    return {
      strokeDasharray: `${p} ${p}`,
      strokeDashoffset: p * (1 - t),
    };
  });

  const iconAnimStyle = useAnimatedStyle(() => ({
    opacity: iconReveal.value,
    transform: [{ scale: 0.72 + iconReveal.value * 0.28 }],
  }));

  const focused = isSelected && !hasAnswered;
  const dimmed =
    hasAnswered && !isCorrect && !isWrongSelection && !focused;

  const plaquePaint = useMemo(() => {
    const hideStroke = shouldRevealAnim;
    if (hasAnswered && isWrongSelection) {
      return {
        fill: surfaces.failSoft,
        stroke: hideStroke ? "transparent" : surfaces.fail + "55",
        strokeWidth: hideStroke ? 0 : 1.5,
      };
    }
    if (hasAnswered && isCorrect) {
      return {
        fill: surfaces.accentSoft,
        stroke: hideStroke ? "transparent" : surfaces.accent,
        strokeWidth: hideStroke ? 0 : 1.5,
      };
    }
    if (focused) {
      return {
        fill: surfaces.accentSoft,
        stroke: hideStroke ? "transparent" : surfaces.accent,
        strokeWidth: hideStroke ? 0 : 1.5,
      };
    }
    return {
      fill: surfaces.card,
      stroke: hideStroke ? "transparent" : surfaces.borderStrong,
      strokeWidth: hideStroke ? 0 : 1,
    };
  }, [
    shouldRevealAnim,
    focused,
    hasAnswered,
    isCorrect,
    isWrongSelection,
    surfaces,
  ]);

  const plaqueD =
    traceBox.w > 0 && traceBox.h > 0
      ? optionPlaquePathD(
          traceBox.w,
          traceBox.h,
          optionPlaqueNotchClamp(traceBox.w, traceBox.h),
        )
      : "";

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => {
        if (disabled) return;
        pressed.value = withTiming(1, { duration: 90 });
      }}
      onPressOut={() => {
        pressed.value = withTiming(0, { duration: 140 });
      }}
    >
      <RNView
        style={styles.optionRowOuter}
        onLayout={onOptionLayout}
      >
        <Animated.View
          style={[
            styles.optionRowShell,
            dimmed && styles.optionRowDimmed,
            animStyle,
          ]}
        >
          {plaqueD ? (
            <Svg
              width={traceBox.w}
              height={traceBox.h}
              style={StyleSheet.absoluteFillObject}
              pointerEvents="none"
            >
              <Path
                d={plaqueD}
                fill={plaquePaint.fill}
                stroke={plaquePaint.stroke}
                strokeWidth={plaquePaint.strokeWidth}
                strokeLinejoin="round"
              />
            </Svg>
          ) : null}
          <RNView style={styles.optionRowContent}>
            <RNView
              style={[
                styles.optionChip,
                focused && styles.optionChipFocused,
                hasAnswered && isCorrect && styles.optionChipCorrect,
                hasAnswered && isWrongSelection && styles.optionChipWrong,
              ]}
            >
              <Text
                style={[
                  styles.optionChipLabel,
                  { color: surfaces.muted },
                  focused && { color: surfaces.accent },
                  hasAnswered && isCorrect && { color: surfaces.accent },
                  hasAnswered && isWrongSelection && { color: surfaces.fail },
                  dimmed && { color: surfaces.softText },
                ]}
              >
                {optionIndex + 1}
              </Text>
            </RNView>
            <Text
              style={[
                styles.optionRowText,
                dimmed && styles.optionRowTextDimmed,
              ]}
              numberOfLines={5}
            >
              {option}
            </Text>
            {hasAnswered && isCorrect ? (
              <Animated.View style={iconAnimStyle}>
                <Icon
                  name="Check"
                  size={18}
                  color={surfaces.accent}
                  strokeWidth={2.2}
                />
              </Animated.View>
            ) : null}
            {hasAnswered && isWrongSelection ? (
              <Animated.View style={iconAnimStyle}>
                <Icon
                  name="X"
                  size={18}
                  color={surfaces.fail}
                  strokeWidth={2.2}
                />
              </Animated.View>
            ) : null}
          </RNView>
        </Animated.View>
        {shouldRevealAnim && traceBox.w > 0 && traceBox.h > 0 ? (
          <Svg
            width={traceBox.w}
            height={traceBox.h}
            style={StyleSheet.absoluteFillObject}
            pointerEvents="none"
          >
            <AnimatedPath
              d={optionPlaqueTracePathD(
                traceBox.w - OPTION_TRACE_STROKE,
                traceBox.h - OPTION_TRACE_STROKE,
                optionPlaqueNotchClamp(
                  traceBox.w - OPTION_TRACE_STROKE,
                  traceBox.h - OPTION_TRACE_STROKE,
                ),
              )}
              transform={`translate(${OPTION_TRACE_STROKE / 2},${OPTION_TRACE_STROKE / 2})`}
              stroke={traceColor}
              strokeWidth={OPTION_TRACE_STROKE}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              animatedProps={tracePathProps}
            />
          </Svg>
        ) : null}
      </RNView>
    </Pressable>
  );
};

function getCompletionCopy(score: number, total: number) {
  if (total <= 0) {
    return {
      headline: "Quiz completado",
      subline: "Gracias por repasar este capítulo.",
    };
  }
  const ratio = score / total;
  if (ratio >= 1) {
    return {
      headline: "¡Excelente!",
      subline: "Respondiste todas las preguntas sobre este pasaje.",
    };
  }
  if (ratio >= 0.7) {
    return {
      headline: "Muy bien",
      subline: "Repasa los versos que no acertaste para fijarlos mejor.",
    };
  }
  return {
    headline: "Buen intento",
    subline: "Cada repaso ayuda a entender mejor la lectura.",
  };
}

const ChapterQuizBottomSheet = () => {
  const { theme } = useMyTheme();
  const { alertWarning, confirm } = useAlert();
  const router = useRouter();
  const surfaces = useMemo(() => getSurfaces(theme), [theme]);
  const styles = getStyles(theme);
  const activeQuiz = use$(() => chapterQuizState$.activeQuiz.get());

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completionRunId, setCompletionRunId] = useState(0);
  const [completedAttemptId, setCompletedAttemptId] = useState<string | null>(null);
  const [voteChoice, setVoteChoice] = useState<null | "up" | "down">(null);
  const [downvoteSubmitting, setDownvoteSubmitting] = useState(false);
  const [isFavoriteMarked, setIsFavoriteMarked] = useState(false);
  const answersRef = useRef<(string | null)[]>([]);
  const isCompletedRef = useRef(false);
  const lastQuizRef = useRef<ActiveChapterQuiz | null>(null);
  const referenceAnchorRef = useRef(null);
  const [referencePopoverVisible, setReferencePopoverVisible] = useState(false);
  const [referenceForPopover, setReferenceForPopover] = useState<string | null>(null);
  const [badgeUnlockModalVisible, setBadgeUnlockModalVisible] = useState(false);
  const [badgesJustUnlocked, setBadgesJustUnlocked] = useState<QuizBadgeState[]>(
    [],
  );

  const questions = activeQuiz?.questions || [];
  const currentQuestion = questions[currentIndex];
  const total = questions.length;

  useEffect(() => {
    const timer = setTimeout(() => {
      modalState$.chapterQuizRef.current?.present();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setHasAnswered(false);
    setIsCompleted(false);
    setCompletionRunId(0);
    setCompletedAttemptId(null);
    setVoteChoice(null);
    setDownvoteSubmitting(false);
    setIsFavoriteMarked(false);
    setBadgeUnlockModalVisible(false);
    setBadgesJustUnlocked([]);
    answersRef.current = new Array(Math.max(total, 0)).fill(null);
  }, [activeQuiz?.chapterKey, total]);

  useEffect(() => {
    isCompletedRef.current = isCompleted;
  }, [isCompleted]);

  useEffect(() => {
    if (activeQuiz) lastQuizRef.current = activeQuiz;
  }, [activeQuiz]);

  /** Persist “opened this quiz size” as soon as the sheet has questions (covers Bible + Mis Quiz). */
  useEffect(() => {
    if (!activeQuiz || total === 0) return;
    void chapterQuizLocalDbService.upsertQuizSession(
      activeQuiz.chapterKey,
      activeQuiz.requestedCount,
    );
  }, [activeQuiz?.chapterKey, activeQuiz?.requestedCount, total]);

  useEffect(() => {
    setReferencePopoverVisible(false);
    setReferenceForPopover(null);
  }, [currentIndex]);

  const finalizeQuizDismiss = useCallback(() => {
    setBadgeUnlockModalVisible(false);
    setBadgesJustUnlocked([]);
    modalState$.isChapterQuizOpen.set(false);
    const q = lastQuizRef.current;
    if (q && !isCompletedRef.current) {
      void chapterQuizLocalDbService.upsertQuizSession(
        q.chapterKey,
        q.requestedCount,
      );
    }
    chapterQuizStateHelpers.clearActiveQuiz();
  }, []);

  const progressLabel = useMemo(() => {
    if (isCompleted) return `Puntuacion final: ${score}/${total}`;
    return `Pregunta ${Math.min(currentIndex + 1, Math.max(total, 1))} de ${Math.max(total, 1)}`;
  }, [currentIndex, isCompleted, score, total]);

  const onSelectOption = (option: string) => {
    if (hasAnswered || !currentQuestion) return;
    const isCorrect = option === currentQuestion.correct;
    setSelectedOption(option);
    setHasAnswered(true);
    if (isCorrect) setScore((prev) => prev + 1);
  };

  const onNext = () => {
    if (!hasAnswered) return;

    answersRef.current[currentIndex] = selectedOption;

    if (currentIndex >= total - 1) {
      const finalScore = score;
      if (activeQuiz) {
        chapterQuizStateHelpers.markChapterCompleted(activeQuiz.chapterKey, finalScore, total);
        const pass = total > 0 && finalScore / total >= PASS_RATIO;
        const answersPayload = questions.map((_, i) => ({
          questionIndex: i,
          selected: answersRef.current[i] ?? null,
        }));
        const attemptId = Crypto.randomUUID();
        setCompletedAttemptId(attemptId);
        const quizSnapshot = activeQuiz;
        void (async () => {
          let attemptsBefore: ChapterQuizAttemptRow[] = [];
          try {
            attemptsBefore = await chapterQuizLocalDbService.getAllAttempts();
            await chapterQuizLocalDbService.insertAttempt({
              id: attemptId,
              chapterKey: quizSnapshot.chapterKey,
              book: quizSnapshot.book,
              chapter: quizSnapshot.chapter,
              score: finalScore,
              total,
              completedAt: new Date().toISOString(),
              questions,
              answers: answersPayload,
              pass,
            });
            await chapterQuizLocalDbService.deleteQuizSession(
              quizSnapshot.chapterKey,
              quizSnapshot.requestedCount,
            );
            const attemptsAfter = await chapterQuizLocalDbService.getAllAttempts();
            const progressAfter = computeChapterQuizProgress(attemptsAfter);
            await persistNewQuizBadgeUnlocks(attemptsAfter, progressAfter);
            const newly = findNewlyUnlockedQuizBadgesByCriteria(
              attemptsBefore,
              attemptsAfter,
            );
            if (newly.length > 0) {
              setBadgesJustUnlocked(newly);
              setTimeout(() => setBadgeUnlockModalVisible(true), 480);
            }
          } catch (e) {
            console.error("[ChapterQuiz] persist attempt / badges", e);
          }
        })();
      }
      setCompletionRunId((r) => r + 1);
      setIsCompleted(true);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedOption(null);
    setHasAnswered(false);
  };

  const onClose = () => {
    modalState$.closeChapterQuizBottomSheet();
  };

  const onRetakeQuiz = useCallback(() => {
    const quiz = chapterQuizState$.activeQuiz.get();
    if (quiz?.questions?.length) {
      chapterQuizStateHelpers.setActiveQuiz({
        ...quiz,
        questions: shuffleArray(quiz.questions),
      });
      void chapterQuizLocalDbService.upsertQuizSession(
        quiz.chapterKey,
        quiz.requestedCount,
      );
    }
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setHasAnswered(false);
    setIsCompleted(false);
    setCompletedAttemptId(null);
    setVoteChoice(null);
    setDownvoteSubmitting(false);
    setIsFavoriteMarked(false);
    setBadgeUnlockModalVisible(false);
    setBadgesJustUnlocked([]);
  }, []);

  const onVoteUp = useCallback(() => {
    if (voteChoice) return;
    setVoteChoice("up");
    showToast("¡Gracias! Nos alegra que te haya servido.");
  }, [voteChoice]);

  const onVoteDown = useCallback(() => {
    if (voteChoice || downvoteSubmitting || !activeQuiz) return;
    if (!pb.authStore.isValid) {
      alertWarning(
        "Inicia sesión",
        "Para marcar un quiz como poco útil necesitas una cuenta.",
      );
      return;
    }
    confirm(
      "Marcar quiz compartido como poco útil",
      "Esto cuenta como un voto negativo sobre la versión del quiz que comparten todos los usuarios. Si varias personas coinciden, ese quiz se puede sustituir por uno nuevo. ¿Deseas continuar?",
      async () => {
        setDownvoteSubmitting(true);
        try {
          const result = await submitChapterQuizDownvote(activeQuiz.chapterKey);
          if (!result.ok) {
            showToast(result.message);
            return;
          }
          setVoteChoice("down");
          if (result.reachedThreshold) {
            showToast("Con varios votos negativos este quiz se renovará al generarse de nuevo.");
          } else {
            showToast("Gracias por tu opinión");
          }
        } finally {
          setDownvoteSubmitting(false);
        }
      },
    );
  }, [activeQuiz, alertWarning, confirm, downvoteSubmitting, voteChoice]);

  const onFavoriteThisAttempt = useCallback(async () => {
    if (!completedAttemptId) return;
    const next = !isFavoriteMarked;
    await chapterQuizLocalDbService.setAttemptFavorite(completedAttemptId, next);
    setIsFavoriteMarked(next);
    showToast(next ? "Guardado en Mis Quiz (favoritos)" : "Quitado de favoritos");
  }, [completedAttemptId, isFavoriteMarked]);

  const onOpenMisQuizDetail = useCallback(() => {
    if (!completedAttemptId) return;
    modalState$.closeChapterQuizBottomSheet();
    chapterQuizStateHelpers.clearActiveQuiz();
    router.push({
      pathname: "/chapterQuizHistory",
      params: { attemptId: completedAttemptId },
    });
  }, [completedAttemptId, router]);

  const completionCopy = useMemo(
    () => getCompletionCopy(score, total),
    [score, total]
  );

  const scorePercent = useMemo(
    () => (total > 0 ? Math.round((score / total) * 100) : 0),
    [score, total]
  );

  const didPassQuiz = useMemo(
    () => total > 0 && score / total >= PASS_RATIO,
    [score, total]
  );

  const showConfettiOverlay = isCompleted && didPassQuiz;

  const dismissBadgeUnlockModal = useCallback(() => {
    setBadgeUnlockModalVisible(false);
    setBadgesJustUnlocked([]);
  }, []);

  if (!activeQuiz || total === 0) {
    return (
      <BottomModal
        style={styles.bottomSheet}
        shouldScroll={false}
        ref={modalState$.chapterQuizRef.get()}
        justOneSnap
        showIndicator
        justOneValue={["50%", "85%"]}
        startAT={1}
        onDismiss={finalizeQuizDismiss}
      >
        <View style={styles.container}>
          <Text style={styles.title}>No hay quiz disponible</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={onClose}>
            <Text style={styles.primaryButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </BottomModal>
    );
  }

  return (
    <>
    <BottomModal
      style={styles.bottomSheet}
      shouldScroll={false}
      ref={modalState$.chapterQuizRef.get()}
      justOneSnap
      showIndicator
      justOneValue={["70%", "95%"]}
      startAT={1}
      onDismiss={finalizeQuizDismiss}
    >
      <View style={[styles.container, isCompleted && styles.containerCompleted]}>
        {showConfettiOverlay ? (
          <View pointerEvents="none" style={styles.confettiOverlay} collapsable={false}>
            <LottieView
              key={completionRunId}
              source={confettiSource}
              autoPlay
              loop
              resizeMode="cover"
              style={styles.confettiLottie}
            />
          </View>
        ) : null}

        {!isCompleted && (
          <RNView style={styles.quizHeader}>
            <Text style={styles.title}>
              {activeQuiz.book} {activeQuiz.chapter}
            </Text>
            <Text style={styles.progress}>{progressLabel}</Text>
            <QuizStepper
              total={total}
              currentIndex={currentIndex}
              hasAnswered={hasAnswered}
              surfaces={surfaces}
            />
          </RNView>
        )}

        {!isCompleted && currentQuestion && (
          <>
            <Animated.View
              key={`question-${currentIndex}`}
              entering={FadeIn.duration(VIEW_TRANS_MS).easing(
                Easing.out(Easing.quad),
              )}
            >
              <RNView collapsable={false} style={styles.questionSection}>
                <Text style={styles.questionKicker}>Pregunta</Text>
                <Text style={styles.question}>{currentQuestion.question}</Text>
              </RNView>
            </Animated.View>
            <RNView style={styles.optionsContainer}>
              {currentQuestion.options.map((option, optionIndex) => {
                const isSelected = selectedOption === option;
                const isCorrect = hasAnswered && option === currentQuestion.correct;
                const isWrongSelection =
                  hasAnswered && isSelected && option !== currentQuestion.correct;

                return (
                  <RNView key={`${currentIndex}-${option}`}>
                    <QuizOptionRow
                      option={option}
                      optionIndex={optionIndex}
                      isSelected={isSelected}
                      isCorrect={!!isCorrect}
                      isWrongSelection={!!isWrongSelection}
                      hasAnswered={hasAnswered}
                      disabled={hasAnswered}
                      surfaces={surfaces}
                      styles={styles}
                      onPress={() => onSelectOption(option)}
                    />
                  </RNView>
                );
              })}
            </RNView>

            {hasAnswered && (
              <View style={styles.feedbackBox}>
                <Text
                  style={[
                    styles.feedbackTitle,
                    {
                      color:
                        selectedOption === currentQuestion.correct
                          ? surfaces.accent
                          : surfaces.fail,
                    },
                  ]}
                >
                  {selectedOption === currentQuestion.correct ? "Correcto" : "Incorrecto"}
                </Text>
                {currentQuestion.reference ? (
                  <>
                    <View style={styles.referenceRow}>
                      <Text style={styles.referenceLabel}>Referencia: </Text>
                      <TouchableOpacity
                        ref={referenceAnchorRef}
                        onPress={() => {
                          setReferenceForPopover(currentQuestion.reference ?? null);
                          setReferencePopoverVisible(true);
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={`Ver texto bíblico: ${currentQuestion.reference}`}
                      >
                        <Text style={styles.referenceLink}>{currentQuestion.reference}</Text>
                      </TouchableOpacity>
                    </View>
                    <Reference
                      references={referenceForPopover}
                      onClose={() => setReferencePopoverVisible(false)}
                      isVisible={referencePopoverVisible}
                      target={referenceAnchorRef}
                    />
                  </>
                ) : null}
                {currentQuestion.explanation ? (
                  <Text style={styles.feedbackText}>{currentQuestion.explanation}</Text>
                ) : null}
              </View>
            )}

            <TouchableOpacity
              style={[styles.primaryButton, !hasAnswered && styles.primaryButtonDisabled]}
              onPress={onNext}
              disabled={!hasAnswered}
            >
              <Text style={styles.primaryButtonText}>
                {currentIndex >= total - 1 ? "Finalizar" : "Siguiente"}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {isCompleted && (
          <View style={styles.completionPanel}>
            <View
              style={[
                styles.resultCard,
                {
                  backgroundColor: 'transparent',
                  borderColor: theme.colors.notification + "4D",
                },
              ]}
            >
              {didPassQuiz ? (
                <Text style={styles.resultCelebration} accessibilityLabel="Celebración">
                  🎉
                </Text>
              ) : null}

              <Text style={[styles.resultScreenTitle, { color: theme.colors.text }]}>
                ¡Quiz completado!
              </Text>

              <View style={[styles.resultChapterPill, { borderColor: theme.colors.text + "22" }]}>
                <Text style={[styles.resultChapterPillText, { color: theme.colors.text + "AA" }]}>
                  {activeQuiz.book} · Cap. {activeQuiz.chapter}
                </Text>
              </View>

              <Text style={[styles.resultPercent, { color: theme.colors.notification }]}>
                {scorePercent}%
              </Text>

              <Text style={[styles.resultCountLine, { color: theme.colors.text + "AA" }]}>
                {score} de {total} correctas
              </Text>

              <Text style={[styles.resultFeedbackTitle, { color: theme.colors.text }]}>
                {completionCopy.headline}
              </Text>
              <Text style={[styles.resultFeedbackBody, { color: theme.colors.text + "99" }]}>
                {completionCopy.subline}
              </Text>

              <Text style={[styles.rateLabel, { color: theme.colors.text + "AA" }]}>
                ¿Te pareció útil este quiz?
              </Text>
              <View style={styles.voteRow}>
                <TouchableOpacity
                  style={[
                    styles.voteButton,
                    {
                      borderColor: theme.colors.text + "33",
                      backgroundColor:
                        voteChoice === "up" ? "#22c55e33" : theme.colors.card,
                    },
                  ]}
                  onPress={onVoteUp}
                  disabled={!!voteChoice || downvoteSubmitting}
                  accessibilityLabel="Útil"
                >
                  <Icon
                    name="ThumbsUp"
                    size={22}
                    color={voteChoice === "up" ? "#22c55e" : theme.colors.text}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.voteButton,
                    {
                      borderColor: theme.colors.text + "33",
                      backgroundColor:
                        voteChoice === "down" ? "#ef444433" : theme.colors.card,
                    },
                  ]}
                  onPress={onVoteDown}
                  disabled={!!voteChoice || downvoteSubmitting}
                  accessibilityLabel="Poco útil"
                >
                  {downvoteSubmitting ? (
                    <ActivityIndicator size="small" color={theme.colors.notification} />
                  ) : (
                    <Icon
                      name="ThumbsDown"
                      size={22}
                      color={voteChoice === "down" ? "#ef4444" : theme.colors.text}
                    />
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.favoriteRow,
                  {
                    borderColor: theme.colors.text + "22",
                    backgroundColor: theme.colors.card,
                  },
                ]}
                onPress={onFavoriteThisAttempt}
                activeOpacity={0.85}
              >
                <Icon
                  name="Heart"
                  size={20}
                  color={isFavoriteMarked ? "#f43f5e" : theme.colors.text}
                  fillColor={isFavoriteMarked ? "#f43f5e" : "none"}
                />
                <Text style={[styles.favoriteRowText, { color: theme.colors.text }]}>
                  {isFavoriteMarked ? "En favoritos en Mis Quiz" : "Guardar en favoritos para repasar"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.linkToHistory, { borderColor: theme.colors.notification + "55" }]}
                onPress={onOpenMisQuizDetail}
                activeOpacity={0.85}
                disabled={!completedAttemptId}
              >
                <Icon name="ListChecks" size={18} color={theme.colors.notification} />
                <Text style={[styles.linkToHistoryText, { color: theme.colors.notification }]}>
                  Ver repaso completo en Mis Quiz
                </Text>
              </TouchableOpacity>

              <View style={styles.resultActions}>
                <TouchableOpacity
                  style={[
                    styles.resultPillOutline,
                    {
                      borderColor: theme.colors.text + "40",
                      backgroundColor: theme.colors.background,
                    },
                  ]}
                  onPress={onRetakeQuiz}
                  activeOpacity={0.85}
                >
                  <Icon name="RotateCcw" size={18} color={theme.colors.text} />
                  <Text style={[styles.resultPillOutlineLabel, { color: theme.colors.text }]}>
                    Repetir
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.resultPillPrimary, { backgroundColor: theme.colors.notification }]}
                  onPress={onClose}
                  activeOpacity={0.9}
                >
                  <Text style={styles.resultPillPrimaryLabel}>Listo</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </BottomModal>

    <Modal
      visible={badgeUnlockModalVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={dismissBadgeUnlockModal}
    >
      <Pressable
        style={styles.badgeUnlockBackdrop}
        onPress={dismissBadgeUnlockModal}
        accessibilityRole="button"
        accessibilityLabel="Cerrar"
      >
        <RNView
          style={[
            styles.badgeUnlockCard,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.text + "18",
            },
          ]}
        >
          <Text style={[styles.badgeUnlockKicker, { color: theme.colors.notification }]}>
            {badgesJustUnlocked.length === 1
              ? "¡Nueva insignia!"
              : "¡Nuevas insignias!"}
          </Text>
          <Text
            style={[styles.badgeUnlockTitle, { color: theme.colors.text }]}
            accessibilityRole="header"
          >
            {badgesJustUnlocked.length === 1
              ? "Desbloqueaste una insignia de perfil"
              : `Desbloqueaste ${badgesJustUnlocked.length} insignias de perfil`}
          </Text>
          <RNView style={styles.badgeUnlockList}>
            {badgesJustUnlocked.map((b) => (
              <RNView key={b.id} style={styles.badgeUnlockRow}>
                <Text style={styles.badgeUnlockEmoji} accessibilityLabel={b.label}>
                  {b.emoji}
                </Text>
                <Text
                  style={[styles.badgeUnlockLabel, { color: theme.colors.text }]}
                  numberOfLines={2}
                >
                  {b.label}
                </Text>
              </RNView>
            ))}
          </RNView>
          <Text style={[styles.badgeUnlockHint, { color: theme.colors.text + "99" }]}>
            La verás en tu perfil de Mis Quiz.
          </Text>
          <TouchableOpacity
            style={[
              styles.badgeUnlockButton,
              { backgroundColor: theme.colors.notification },
            ]}
            onPress={dismissBadgeUnlockModal}
            activeOpacity={0.9}
          >
            <Text style={styles.badgeUnlockButtonText}>Genial</Text>
          </TouchableOpacity>
        </RNView>
      </Pressable>
    </Modal>
    </>
  );
};

const getStyles = (theme: TTheme) => {
  const s = getSurfaces(theme);
  return StyleSheet.create({
    bottomSheet: {
      backgroundColor: s.base,
    },
    container: {
      flex: 1,
      padding: SP.lg,
      gap: SP.md,
    },
    containerCompleted: {
      justifyContent: "center",
      paddingTop: 4,
      paddingBottom: 20,
    },
    quizHeader: {
      width: "100%",
    },
    title: {
      fontSize: 22,
      fontWeight: "700",
      letterSpacing: -0.5,
      color: s.text,
      textAlign: "center",
    },
    progress: {
      fontSize: 13,
      fontWeight: "500",
      color: s.muted,
      textAlign: "center",
      marginTop: 2,
    },
    questionSection: {
      width: "100%",
      marginTop: SP.sm,
      paddingBottom: SP.xs,
    },
    questionKicker: {
      fontSize: 10,
      fontWeight: "600",
      letterSpacing: 0.65,
      textTransform: "uppercase",
      color: s.muted,
      marginBottom: 6,
    },
    question: {
      fontSize: 18,
      fontWeight: "700",
      letterSpacing: -0.35,
      lineHeight: 26,
      color: s.text,
    },
    optionsContainer: {
      gap: 10,
      marginTop: SP.md,
    },
    optionRowOuter: {
      width: "100%",
      position: "relative",
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: theme.dark ? 0.42 : 0.12,
      shadowRadius: 12,
      elevation: 6,
    },
    optionRowShell: {
      position: "relative",
      minHeight: 56,
      overflow: "visible",
    },
    optionRowContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: SP.md,
      minHeight: 56,
      paddingVertical: 14,
      paddingHorizontal: SP.md,
    },
    optionRowDimmed: {
      opacity: 0.48,
    },
    optionChip: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: s.accentSofter,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: s.border,
    },
    optionChipFocused: {
      borderColor: s.accent,
      backgroundColor: s.accentSoft,
    },
    optionChipCorrect: {
      borderColor: s.accent,
      backgroundColor: s.accentSoft,
    },
    optionChipWrong: {
      borderColor: s.fail + "55",
      backgroundColor: s.failSoft,
    },
    optionChipLabel: {
      fontSize: 14,
      fontWeight: "700",
      letterSpacing: -0.2,
    },
    optionRowText: {
      flex: 1,
      color: s.text,
      fontSize: 15,
      fontWeight: "600",
      letterSpacing: -0.1,
      lineHeight: 22,
    },
    optionRowTextDimmed: {
      color: s.softText,
    },
    feedbackBox: {
      borderRadius: RADIUS.card,
      padding: SP.md,
      backgroundColor: s.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: s.border,
      gap: 4,
      marginTop: 2,
    },
    feedbackTitle: {
      fontWeight: "700",
      fontSize: 14,
    },
    feedbackText: {
      color: s.text,
      fontSize: 13,
      fontWeight: "500",
    },
    referenceRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 4,
    },
    referenceLabel: {
      color: s.text,
      fontSize: 13,
      fontWeight: "700",
    },
    referenceLink: {
      color: s.accent,
      fontSize: 13,
      fontWeight: "600",
    },
    primaryButton: {
      marginTop: SP.sm,
      borderRadius: RADIUS.button,
      backgroundColor: s.accent,
      paddingVertical: 14,
      paddingHorizontal: SP.lg,
      alignItems: "center",
      justifyContent: "center",
    },
    primaryButtonFlex: {
      marginTop: 0,
      flex: 1,
    },
    primaryButtonDisabled: {
      opacity: 0.5,
    },
    primaryButtonText: {
      color: "#FFFFFF",
      fontWeight: "700",
      fontSize: 15,
    },
    confettiOverlay: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 0,
      backgroundColor: "transparent",
    },
    confettiLottie: {
      width: "100%",
      height: "100%",
      backgroundColor: "transparent",
    },
    completionPanel: {
      width: "100%",
      alignItems: "center",
      zIndex: 2,
      position: "relative",
      backgroundColor: "transparent",
    },
    resultCard: {
      width: "100%",
      borderRadius: RADIUS.card,
      borderWidth: StyleSheet.hairlineWidth,
      paddingHorizontal: 22,
      paddingVertical: 26,
      alignItems: "center",
      gap: 10,
    },
    resultCelebration: {
      fontSize: 46,
      lineHeight: 52,
      marginBottom: 2,
    },
    resultScreenTitle: {
      fontSize: 22,
      fontWeight: "800",
      textAlign: "center",
      letterSpacing: -0.3,
    },
    resultChapterPill: {
      marginTop: 2,
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 100,
      borderWidth: StyleSheet.hairlineWidth,
      backgroundColor: 'transparent',
    },
    resultChapterPillText: {
      fontSize: 12,
      fontWeight: "600",
      letterSpacing: 0.2,
    },
    resultPercent: {
      fontSize: 64,
      fontWeight: "700",
      letterSpacing: -2,
      marginTop: 8,
    },
    resultCountLine: {
      fontSize: 15,
      fontWeight: "500",
      marginTop: -2,
    },
    resultFeedbackTitle: {
      fontSize: 17,
      fontWeight: "700",
      textAlign: "center",
      marginTop: 10,
    },
    resultFeedbackBody: {
      fontSize: 14,
      lineHeight: 20,
      textAlign: "center",
      paddingHorizontal: 6,
      maxWidth: 300,
    },
    rateLabel: {
      fontSize: 13,
      fontWeight: "600",
      textAlign: "center",
      marginTop: 10,
      width: "100%",
    },
    voteRow: {
      flexDirection: "row",
      gap: 10,
      justifyContent: "center",
      marginTop: 10,
    },
    voteButton: {
      borderRadius: 12,
      borderWidth: 1,
      paddingVertical: 12,
      paddingHorizontal: 22,
    },
    favoriteRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      width: "100%",
      marginTop: 18,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 12,
      borderWidth: 1,
    },
    favoriteRowText: {
      flex: 1,
      fontSize: 14,
      fontWeight: "600",
    },
    linkToHistory: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      width: "100%",
      marginTop: 10,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 12,
      borderWidth: 1,
    },
    linkToHistoryText: {
      fontSize: 14,
      fontWeight: "700",
    },
    resultActions: {
      flexDirection: "row",
      gap: 10,
      width: "100%",
      marginTop: 18,
      alignItems: "stretch",
      backgroundColor: 'transparent',
    },
    resultPillOutline: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      borderRadius: 999,
      borderWidth: 1,
      paddingVertical: 14,
      paddingHorizontal: 14,
    },
    resultPillOutlineLabel: {
      fontSize: 15,
      fontWeight: "700",
    },
    resultPillPrimary: {
      flex: 1,
      borderRadius: 999,
      paddingVertical: 14,
      paddingHorizontal: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    resultPillPrimaryLabel: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "800",
    },
    badgeUnlockBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: SP.lg,
    },
    badgeUnlockCard: {
      width: "100%",
      maxWidth: 340,
      borderRadius: RADIUS.card + 4,
      borderWidth: StyleSheet.hairlineWidth,
      padding: SP.lg,
      gap: SP.md,
    },
    badgeUnlockKicker: {
      fontSize: 13,
      fontWeight: "800",
      textAlign: "center",
      letterSpacing: 0.3,
      textTransform: "uppercase",
    },
    badgeUnlockTitle: {
      fontSize: 18,
      fontWeight: "800",
      textAlign: "center",
      letterSpacing: -0.3,
    },
    badgeUnlockList: {
      width: "100%",
      gap: SP.sm,
      marginTop: SP.xs,
    },
    badgeUnlockRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: SP.md,
      paddingVertical: SP.sm,
      paddingHorizontal: SP.sm,
    },
    badgeUnlockEmoji: {
      fontSize: 40,
      lineHeight: 48,
    },
    badgeUnlockLabel: {
      flex: 1,
      fontSize: 16,
      fontWeight: "700",
    },
    badgeUnlockHint: {
      fontSize: 13,
      textAlign: "center",
      lineHeight: 18,
    },
    badgeUnlockButton: {
      marginTop: SP.sm,
      borderRadius: 999,
      paddingVertical: 14,
      alignItems: "center",
    },
    badgeUnlockButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "800",
    },
  });
};

export default ChapterQuizBottomSheet;
