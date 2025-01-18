import { GameManager } from '@/classes/GameManager';
import CardTheme from '@/components/game/CardTheme';
import GameConsoleTheme from '@/components/game/GameConsoleTheme';
import GameOverScreen from '@/components/game/Gameover';
import MedievalTheme from '@/components/game/MedievalTheme';
import NeonTheme from '@/components/game/NeonTheme';
import useParams from '@/hooks/useParams';
import { AnswerResult, GameProgress, Question } from '@/types';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

interface ButtonStyleProps {
    isSelected: boolean;
    isCorrect: boolean;
    showResult: boolean;
}

const shuffleOptions = (options: string[] | undefined): string[] => {
    if (!options) return [];
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }
    return options;
};

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

    useEffect(() => {
        updateGameState();
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
    };

    const handleNext = (): void => {
        if (gameManager.gameOver) return;
        if (gameManager.nextQuestion()) {
            updateGameState();
        } else {
            setProgress(gameManager.getProgress());
        }
    };

    const handleRestart = (): void => {
        gameManager.nextLevel();
        updateGameState();
    };


    if (gameManager.gameOver) {
        return <GameOverScreen handleRestart={handleRestart} progress={progress} />
    }

    const Card = themes[currentTheme].component

    return (
        <View style={styles.container}>
            <Card
                router={router}
                title="JuegoBiblico"
                currentQuestion={currentQuestion}
                onAnswer={handleAnswer}
                onNext={handleNext}
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
