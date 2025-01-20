import { GameManager } from '@/classes/GameManager';
import CardTheme from '@/components/game/CardTheme';
import GameConsoleTheme from '@/components/game/GameConsoleTheme';
import GameOverScreen from '@/components/game/Gameover';
import MedievalTheme from '@/components/game/MedievalTheme';
import NeonTheme from '@/components/game/NeonTheme';
import { SOUNDS } from '@/constants/gameSound';
import useParams from '@/hooks/useParams';
import { usePlaySound } from '@/hooks/usePlaySound';
import { AnswerResult, GameProgress, Question } from '@/types';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';


const themes = [
    { component: CardTheme },
    { component: GameConsoleTheme },
    { component: MedievalTheme },
    { component: NeonTheme },
];

const Game = () => {
    const router = useRouter()
    const params = useParams()
    const { questionsPerLevel = 10 } = params
    const number = (questionsPerLevel / 5 - 1) || 0
    const [currentTheme] = useState(number ?? 0);
    const gameManager = useMemo(() => new GameManager(questionsPerLevel), [questionsPerLevel]);
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<AnswerResult | null>(null);
    const [progress, setProgress] = useState<GameProgress | null>(null);
    const currentLevel = progress?.level;
    const scrollViewRef = useRef<ScrollView>(null)
    const { play: playNextQuestion } = usePlaySound(SOUNDS.nextQuestion);

    useEffect(() => {
        updateGameState();
        playNextQuestion()
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
        scrollViewRef.current?.scrollToEnd()
    };

    const handleNextQuestion = (): void => {
        if (gameManager.gameOver) return;
        if (gameManager.nextQuestion()) {
            updateGameState();
            playNextQuestion()
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
        updateGameState();
    };


    if (gameManager.gameOver) {
        return <GameOverScreen handleTryAgain={handleTryAgain} handleNextLevel={handleNextLevel} progress={progress} />
    }

    const Card = themes[currentTheme].component


    return (
        <View style={[styles.container]}>
            <Card
                scrollViewRef={scrollViewRef}
                title="Quiz_Bíblico"
                router={router}
                currentQuestion={currentQuestion}
                onAnswer={handleAnswer}
                onNext={handleNextQuestion}
                progress={progress}
                selectedAnswer={selectedAnswer}
                feedback={feedback}
            />
        </View>
    )
};

export default Game;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
});
