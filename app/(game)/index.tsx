import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { GameManager } from '@/classes/GameManager';
import { StatusBar } from 'expo-status-bar';
import { Question, GameProgress, AnswerResult } from '@/types';
import { useRouter } from 'expo-router';

interface ButtonStyleProps {
    isSelected: boolean;
    isCorrect: boolean;
    showResult: boolean;
}

const shuffleOptions = (options: string[] | undefined): string[] => {
    if (!options) return []
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }
    return options;
};

const Game = () => {
    const router = useRouter()
    const gameManager = useMemo(() => new GameManager(3), []);
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<AnswerResult | null>(null);
    const [progress, setProgress] = useState<GameProgress | null>(null);
    const currentLevel = progress?.level;
    const currentOptions = useMemo(() => shuffleOptions(currentQuestion?.options), [currentQuestion])

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
        if (gameManager.gameOver) return
        if (gameManager.nextQuestion()) {
            updateGameState()
        } else {
            setProgress(gameManager.getProgress())
        }
    };

    const handleRestart = (): void => {
        gameManager.nextLevel()
        updateGameState();
    };

    const getButtonStyle = ({ isSelected, isCorrect, showResult }: ButtonStyleProps): object => {
        return [
            styles.optionButton,
            isSelected && styles.selectedButton,
            showResult && isCorrect && styles.correctButton,
            isSelected && !isCorrect && showResult && styles.incorrectButton,
        ];
    };

    if (gameManager.gameOver) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.gameOverContainer}>
                    <Text style={styles.title}>¡Juego Completado!</Text>
                    <Text style={styles.scoreText}>
                        Puntuación final: {progress?.score} de {progress?.total}
                    </Text>
                    <TouchableOpacity style={styles.button} onPress={handleRestart}>
                        <Text style={styles.buttonText}>Siguiente Nivel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, { backgroundColor: '#ff7b6d' }]} onPress={() => router.back()}>
                        <Text style={styles.buttonText}>Cerrar</Text>
                    </TouchableOpacity>
                </View>
                <StatusBar style="auto" />
            </SafeAreaView>
        );
    }



    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.title}>
                    Preguntas Bíblicas - Nivel {currentLevel} ({progress?.current}/{progress?.total})
                </Text>

                <View style={styles.questionContainer}>
                    <Text style={styles.questionText}>{currentQuestion?.question}</Text>

                    <View style={styles.optionsContainer}>
                        {currentOptions.map((option, index) => (
                            <TouchableOpacity
                                key={index}
                                style={getButtonStyle({
                                    isSelected: selectedAnswer === option,
                                    isCorrect: option === currentQuestion?.correct,
                                    showResult: selectedAnswer !== null
                                })}
                                onPress={() => handleAnswer(option)}
                                disabled={selectedAnswer !== null}
                            >
                                <Text style={styles.optionText}>{option}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {feedback && (
                        <View style={styles.feedbackContainer}>
                            <Text style={[styles.feedbackText, feedback.isCorrect ? styles.correctText : styles.incorrectText]}>
                                {feedback.isCorrect ? "¡Correcto!" : "Incorrecto"}
                            </Text>
                            <Text style={styles.explanationText}>{feedback.explanation}</Text>
                            {feedback.reference && (
                                <Text style={styles.referenceText}>Referencia: {feedback.reference}</Text>
                            )}
                            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                                <Text style={styles.buttonText}>Siguiente pregunta</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <Text style={styles.scoreText}>
                        Puntuación actual: {progress?.score}/{progress?.current}
                    </Text>
                </View>
            </ScrollView>
            <StatusBar style="auto" />
        </SafeAreaView>
    );
}

export default Game;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContainer: {
        padding: 20,
    },
    gameOverContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
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
        backgroundColor: '#f0f0f0',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
    },
    selectedButton: {
        backgroundColor: '#ddd',
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
        borderRadius: 8,
        marginBottom: 20,
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
        borderRadius: 8,
        marginTop: 10,
    },
    nextButton: {
        backgroundColor: '#2196F3',
        padding: 15,
        borderRadius: 8,
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
});