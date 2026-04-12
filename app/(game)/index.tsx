import { GameManager } from '@/classes/GameManager';
import CardTheme from '@/components/game/CardTheme';
import GameConsoleTheme from '@/components/game/GameConsoleTheme';
import GameOverScreen from '@/components/game/Gameover';
import MedievalTheme from '@/components/game/MedievalTheme';
import NeonTheme from '@/components/game/NeonTheme';
import { SOUNDS } from '@/constants/gameSound';
import useParams from '@/hooks/useParams';
import { usePlaySound } from '@/hooks/usePlaySound';
import { chapterQuizState$, chapterQuizStateHelpers } from '@/state/chapterQuizState';
import { AnswerResult, GameProgress, Question } from '@/types';
import { use$ } from '@legendapp/state/react';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const themes = [
  { component: CardTheme },
  { component: GameConsoleTheme },
  { component: MedievalTheme },
  { component: NeonTheme },
];

const Game = () => {
  const router = useRouter();
  const params = useParams<{
    questionsPerLevel?: number;
    quizMode?: "classic" | "chapter_ai";
    chapterQuizKey?: string;
  }>();
  const activeChapterQuiz = use$(() => chapterQuizState$.activeQuiz.get());
  const {
    questionsPerLevel = 10,
    quizMode = "classic",
    chapterQuizKey,
  } = params;
  const isChapterQuiz = quizMode === "chapter_ai";
  const chapterQuizQuestions =
    isChapterQuiz && activeChapterQuiz?.chapterKey === chapterQuizKey
      ? activeChapterQuiz.questions
      : [];
  const number = questionsPerLevel / 5 - 1 || 0;
  const [currentTheme] = useState(number ?? 0);
  const gameManager = useMemo(
    () => new GameManager(questionsPerLevel, chapterQuizQuestions),
    [questionsPerLevel, chapterQuizQuestions]
  );
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<AnswerResult | null>(null);
  const [progress, setProgress] = useState<GameProgress | null>(null);
  const currentLevel = progress?.level;
  const scrollViewRef = useRef<ScrollView>(null);
  const [hasSavedResult, setHasSavedResult] = useState(false);
  const { play: playNextQuestion } = usePlaySound(SOUNDS.nextQuestion);

  if (isChapterQuiz && chapterQuizQuestions.length === 0) {
    return (
      <View style={[styles.container, styles.emptyQuizState]}>
        <Text style={styles.emptyQuizStateTitle}>No se encontro el quiz del capitulo</Text>
        <TouchableOpacity style={styles.emptyQuizStateButton} onPress={() => router.back()}>
          <Text style={styles.emptyQuizStateButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  useEffect(() => {
    updateGameState();
    playNextQuestion();
  }, [currentLevel]);

  const updateGameState = (): void => {
    setCurrentQuestion(gameManager.getCurrentQuestion());
    setProgress(gameManager.getProgress());
    setSelectedAnswer(null);
    setFeedback(null);
  };

  const handleAnswer = (option: string): void => {
    if (selectedAnswer !== null) return;

    const result = gameManager.checkAnswer(option);
    setSelectedAnswer(option);
    setFeedback(result);
    scrollViewRef.current?.scrollToEnd();
  };

  const handleNextQuestion = (): void => {
    if (gameManager.gameOver) return;
    if (gameManager.nextQuestion()) {
      updateGameState();
      playNextQuestion();
    } else {
      setProgress(gameManager.getProgress());
    }
  };

  const handleNextLevel = (): void => {
    gameManager.nextLevel();
    updateGameState();
  };

  const handleTryAgain = (): void => {
    gameManager.resetGame();
    setHasSavedResult(false);
    updateGameState();
  };

  useEffect(() => {
    if (!gameManager.gameOver || hasSavedResult || !isChapterQuiz || !progress || !chapterQuizKey) {
      return;
    }

    chapterQuizStateHelpers.markChapterCompleted(
      chapterQuizKey,
      progress.score,
      progress.total
    );
    chapterQuizStateHelpers.clearActiveQuiz();
    setHasSavedResult(true);
  }, [chapterQuizKey, gameManager.gameOver, hasSavedResult, isChapterQuiz, progress]);

  if (gameManager.gameOver) {
    return (
      <GameOverScreen
        handleTryAgain={handleTryAgain}
        handleNextLevel={isChapterQuiz ? () => router.back() : handleNextLevel}
        progress={progress}
        isChapterQuiz={isChapterQuiz}
      />
    );
  }

  const Card = themes[currentTheme].component;

  return (
    <View style={[styles.container]}>
      <Card
        scrollViewRef={scrollViewRef}
        title='Quiz_Bíblico'
        router={router}
        currentQuestion={currentQuestion}
        onAnswer={handleAnswer}
        onNext={handleNextQuestion}
        progress={progress}
        selectedAnswer={selectedAnswer}
        feedback={feedback}
      />
    </View>
  );
};

export default Game;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    emptyQuizState: {
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      gap: 14,
      backgroundColor: "#0f172a",
    },
    emptyQuizStateTitle: {
      color: "white",
      fontSize: 17,
      textAlign: "center",
    },
    emptyQuizStateButton: {
      backgroundColor: "#22c55e",
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    emptyQuizStateButtonText: {
      color: "white",
      fontWeight: "700",
      fontSize: 15,
    },
});
