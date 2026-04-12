import Icon from "@/components/Icon";
import { useMyTheme } from "@/context/ThemeContext";
import { chapterQuizState$, chapterQuizStateHelpers } from "@/state/chapterQuizState";
import { modalState$ } from "@/state/modalState";
import { TTheme } from "@/types";
import { shuffleArray } from "@/utils/shuffleOptions";
import { use$ } from "@legendapp/state/react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import LottieView from "lottie-react-native";
import BottomModal from "./BottomModal";
import { Text, View } from "./Themed";

const confettiSource = require("../assets/lottie/confetti_animation.json");

/** Same bar as "Muy bien" / completion tiers: 70%+ counts as pass. */
const PASS_RATIO = 0.7;

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
  const styles = getStyles(theme);
  const activeQuiz = use$(() => chapterQuizState$.activeQuiz.get());

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completionRunId, setCompletionRunId] = useState(0);

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
  }, [activeQuiz?.chapterKey, total]);

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

    if (currentIndex >= total - 1) {
      const finalScore = selectedOption === currentQuestion?.correct ? score : score;
      if (activeQuiz) {
        chapterQuizStateHelpers.markChapterCompleted(activeQuiz.chapterKey, finalScore, total);
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
    chapterQuizStateHelpers.clearActiveQuiz();
    modalState$.closeChapterQuizBottomSheet();
  };

  const onRetakeQuiz = useCallback(() => {
    const quiz = chapterQuizState$.activeQuiz.get();
    if (quiz?.questions?.length) {
      chapterQuizStateHelpers.setActiveQuiz({
        ...quiz,
        questions: shuffleArray(quiz.questions),
      });
    }
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setHasAnswered(false);
    setIsCompleted(false);
  }, []);

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
        onDismiss={() => {
          modalState$.isChapterQuizOpen.set(false);
          chapterQuizStateHelpers.clearActiveQuiz();
        }}
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
    <BottomModal
      style={styles.bottomSheet}
      shouldScroll={false}
      ref={modalState$.chapterQuizRef.get()}
      justOneSnap
      showIndicator
      justOneValue={["70%", "95%"]}
      startAT={1}
      onDismiss={() => {
        modalState$.isChapterQuizOpen.set(false);
        chapterQuizStateHelpers.clearActiveQuiz();
      }}
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
          <>
            <Text style={styles.title}>
              {activeQuiz.book} {activeQuiz.chapter}
            </Text>
            <Text style={styles.progress}>{progressLabel}</Text>
          </>
        )}

        {!isCompleted && currentQuestion && (
          <>
            <Text style={styles.question}>{currentQuestion.question}</Text>
            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option) => {
                const isSelected = selectedOption === option;
                const isCorrect = hasAnswered && option === currentQuestion.correct;
                const isWrongSelection =
                  hasAnswered && isSelected && option !== currentQuestion.correct;

                return (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionButton,
                      isCorrect && styles.optionCorrect,
                      isWrongSelection && styles.optionWrong,
                    ]}
                    onPress={() => onSelectOption(option)}
                    disabled={hasAnswered}
                  >
                    <Text style={styles.optionText}>{option}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {hasAnswered && (
              <View style={styles.feedbackBox}>
                <Text style={styles.feedbackTitle}>
                  {selectedOption === currentQuestion.correct ? "Correcto" : "Incorrecto"}
                </Text>
                {currentQuestion.reference ? (
                  <Text style={styles.feedbackText}>Referencia: {currentQuestion.reference}</Text>
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
              {!didPassQuiz ? (
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
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    bottomSheet: {
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      padding: 16,
      gap: 12,
    },
    containerCompleted: {
      justifyContent: "center",
      paddingTop: 4,
      paddingBottom: 20,
    },
    title: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
      textAlign: "center",
    },
    progress: {
      fontSize: 13,
      color: colors.text + "BB",
      textAlign: "center",
    },
    question: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      marginTop: 8,
    },
    optionsContainer: {
      gap: 8,
      marginTop: 6,
    },
    optionButton: {
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.text + "33",
      paddingVertical: 10,
      paddingHorizontal: 12,
      backgroundColor: colors.card,
    },
    optionCorrect: {
      borderColor: "#22c55e",
      backgroundColor: "#22c55e22",
    },
    optionWrong: {
      borderColor: "#ef4444",
      backgroundColor: "#ef444422",
    },
    optionText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "500",
    },
    feedbackBox: {
      borderRadius: 10,
      padding: 10,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.text + "22",
      gap: 4,
    },
    feedbackTitle: {
      color: colors.notification,
      fontWeight: "700",
      fontSize: 14,
    },
    feedbackText: {
      color: colors.text,
      fontSize: 13,
    },
    primaryButton: {
      marginTop: 8,
      borderRadius: 12,
      backgroundColor: colors.notification,
      paddingVertical: 14,
      paddingHorizontal: 16,
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
      color: "white",
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
      borderRadius: 20,
      borderWidth: 1,
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
  });

export default ChapterQuizBottomSheet;
