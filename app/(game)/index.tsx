import { GameManager } from '@/classes/GameManager';
import CardTheme from '@/components/game/CardTheme';
import GameConsoleTheme from '@/components/game/GameConsoleTheme';
import GameOverScreen from '@/components/game/Gameover';
import MedievalTheme from '@/components/game/MedievalTheme';
import NeonTheme from '@/components/game/NeonTheme';
import useParams from '@/hooks/useParams';
import { AnswerResult, GameProgress, Question } from '@/types';
import { useNavigation, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
    const number = (questionsPerLevel / 5 - 1)
    const [currentTheme] = useState(number ?? 0);
    const gameManager = useMemo(() => new GameManager(questionsPerLevel), [questionsPerLevel]);
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<AnswerResult | null>(null);
    const [progress, setProgress] = useState<GameProgress | null>(null);
    const currentLevel = progress?.level;
    const currentOptions = useMemo(() => shuffleOptions(currentQuestion?.options), [currentQuestion]);

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
    scrollContainer: {
        padding: 20,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconContainer: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 50,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    scoreContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    scoreBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    questionContainer: {
        marginBottom: 20,
    },
    questionText: {
        fontSize: 18,
        marginBottom: 20,
    },
    optionsContainer: {
        marginBottom: 20,
    },
    optionButton: {
        backgroundColor: '#ffffff',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    selectedButton: {
        backgroundColor: '#d1e9fc',
        transform: [{ scale: 1.05 }],
    },
    correctButton: {
        backgroundColor: '#4CAF50',
    },
    incorrectButton: {
        backgroundColor: '#f44336',
    },
    optionText: {
        fontSize: 16,
    },
    feedbackContainer: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    feedbackText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    correctText: {
        color: '#4CAF50',
    },
    incorrectText: {
        color: '#f44336',
    },
    explanationText: {
        fontSize: 16,
        marginBottom: 10,
    },
    referenceText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#2196F3',
        padding: 15,
        borderRadius: 12,
        marginTop: 10,
    },
    closeButton: {
        backgroundColor: '#ff7b6d',
    },
    nextButton: {
        backgroundColor: '#2196F3',
        padding: 15,
        borderRadius: 12,
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
    },
    scoreText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 10,
    },
    gameOverContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#e3f2fd',
    },
});
