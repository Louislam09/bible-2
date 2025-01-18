import { ICardTheme } from '@/types';
import { shuffleOptions } from '@/utils/shuffleOptions';
import React, { useMemo } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from '../Icon';

interface ButtonStyleProps {
    isSelected: boolean;
    isCorrect: boolean;
    showResult: boolean;
}

const NeonTheme = ({ router, title, currentQuestion, onAnswer, onNext, progress, selectedAnswer, feedback }: ICardTheme) => {
    const currentOptions = useMemo(() => shuffleOptions(currentQuestion?.options), [currentQuestion]);

    const getButtonStyle = ({ isSelected, isCorrect, showResult }: ButtonStyleProps): object => {
        return [
            isSelected && styles.selectedButton,
            showResult && isCorrect && styles.correctButton,
            isSelected && !isCorrect && showResult && styles.incorrectButton,
        ];
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: '#030712' }]}>
            <View style={styles.header}>
                {/* <CloudLightning color="#22d3ee" size={32} /> */}
                <Icon onPress={() => router.back()} name="ChevronLeft" color="#22d3ee" size={32} />

                <Text style={styles.neonTitle}>{title}</Text>
                <Text style={styles.neonText}>{progress?.current}/{progress?.total}</Text>
            </View>

            <View style={[styles.neonCard, styles.neonShadow]}>
                <Text style={styles.neonQuestionText}>{currentQuestion?.question}</Text>

                <View style={styles.optionsContainer}>
                    {currentOptions.map((option, i) => (
                        <TouchableOpacity
                            key={i}
                            onPress={() => onAnswer(option)}
                            disabled={selectedAnswer !== null}
                            style={[
                                styles.neonOption,
                                getButtonStyle({
                                    isSelected: selectedAnswer === option,
                                    isCorrect: option === currentQuestion?.correct,
                                    showResult: selectedAnswer !== null,
                                }),
                            ]}
                        >
                            <Text style={styles.neonOptionText}>{option}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {feedback && (
                    <View style={styles.feedbackContainer}>
                        <Text
                            style={[
                                styles.feedbackText,
                                feedback.isCorrect ? styles.correctText : styles.incorrectText,
                            ]}
                        >
                            {feedback.isCorrect ? "¡Correcto!" : "Incorrecto"}
                        </Text>
                        <Text style={styles.explanationText}>{feedback.explanation}</Text>
                        {feedback.reference && (
                            <Text style={styles.referenceText}>Referencia: {feedback.reference}</Text>
                        )}
                        <TouchableOpacity style={styles.nextButton} onPress={onNext}>
                            <Text style={styles.buttonText}>Siguiente pregunta</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

export default NeonTheme;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    neonTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#22d3ee',
    },
    neonText: {
        color: '#22d3ee',
    },
    neonCard: {
        borderWidth: 1,
        borderColor: '#22d3ee',
        borderRadius: 8,
        padding: 24,
    },
    neonShadow: {
        shadowColor: '#22d3ee',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    neonQuestionText: {
        color: '#22d3ee',
        fontSize: 20,
        marginBottom: 32,
    },
    optionsContainer: {
        gap: 12,
    },
    neonOption: {
        backgroundColor: '#111827',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#22d3ee',
    },
    neonOptionText: {
        color: '#22d3ee',
    },
    feedbackContainer: {
        marginTop: 20,
    },
    feedbackText: {
        fontSize: 16,
        textAlign: 'center',
    },
    correctText: {
        color: '#4caf50',
    },
    incorrectText: {
        color: '#f44336',
    },
    explanationText: {
        fontSize: 14,
        color: '#b0bec5',
        marginTop: 8,
    },
    referenceText: {
        fontSize: 14,
        color: '#22d3ee',
        marginTop: 8,
    },
    nextButton: {
        marginTop: 20,
        alignItems: 'center',

        backgroundColor: '#111827',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#fff',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },

    selectedButton: {
        backgroundColor: '#78350f',
        borderColor: '#fbbf24',
        borderWidth: 2,
    },
    correctButton: {
        backgroundColor: '#166534',
        borderColor: '#4ade80',
    },
    incorrectButton: {
        backgroundColor: '#991b1b',
        borderColor: '#f87171',
    },
});
