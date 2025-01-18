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

const CardTheme = ({ router, feedback, currentQuestion, onAnswer, onNext, progress, selectedAnswer, title }: ICardTheme) => {
    const currentOptions = useMemo(() => shuffleOptions(currentQuestion?.options), [currentQuestion]);

    const getButtonStyle = ({ isSelected, isCorrect, showResult }: ButtonStyleProps): object => {
        return [
            isSelected && styles.selectedButton,
            showResult && isCorrect && styles.correctButton,
            isSelected && !isCorrect && showResult && styles.incorrectButton,
        ];
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: '#fefce8' }]}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Icon onPress={() => router.back()} name="ChevronLeft" color="#ca8a04" size={24} />
                    <Text style={[styles.headerTitle, { color: '#854d0e' }]}>{title}</Text>
                </View>
                <View style={[styles.progress, { backgroundColor: '#fef08a' }]}>
                    <Text style={{ color: '#854d0e' }}>{progress?.current}/{progress?.total}</Text>
                </View>
            </View>

            <View style={[styles.cardContainer, styles.shadowProp]}>
                <View style={[styles.questionCard, { backgroundColor: '#fef9c3' }]}>
                    <Text style={[styles.questionText, { color: '#854d0e' }]}>{currentQuestion?.question}</Text>
                </View>

                <View style={styles.optionsContainer}>
                    {currentOptions.map((option, i) => (
                        <TouchableOpacity
                            key={i}
                            onPress={() => onAnswer(option)}
                            disabled={selectedAnswer !== null}
                            style={[
                                styles.option,
                                {
                                    backgroundColor: '#fefce8',
                                    borderWidth: 2,
                                    borderColor: '#fef08a'
                                },
                                getButtonStyle({
                                    isSelected: selectedAnswer === option,
                                    isCorrect: option === currentQuestion?.correct,
                                    showResult: selectedAnswer !== null,
                                })
                            ]}
                        >
                            <Text style={[styles.optionText, { color: '#854d0e' }]}>{option}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {feedback && (
                    <View style={styles.feedbackContainer}>
                        <Text
                            style={[styles.feedbackText, feedback.isCorrect ? styles.correctText : styles.incorrectText]}
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
}

export default CardTheme

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    shadowProp: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginLeft: 16,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    levelText: {
        color: 'white',
        marginLeft: 8,
    },
    questionCard: {
        padding: 24,
        borderRadius: 16,
        marginBottom: 24,
    },
    questionText: {
        fontSize: 20,
        color: 'white',
    },
    optionsContainer: {
        gap: 12,
    },
    option: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    selectedButton: {
        borderColor: '#ca8a04',
        borderWidth: 2,
    },
    correctButton: {
        backgroundColor: '#16a34a6c',
    },
    incorrectButton: {
        backgroundColor: '#dc26267d',
    },
    optionText: {
        color: 'white',
        fontSize: 16,
    },
    feedbackContainer: {
        padding: 16,
        borderRadius: 8,
        backgroundColor: '#fefce8',
        marginBottom: 24,
    },
    feedbackText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    correctText: {
        color: '#16a34a',
    },
    incorrectText: {
        color: '#dc2626',
    },
    explanationText: {
        fontSize: 16,
        marginBottom: 8,
    },
    referenceText: {
        fontSize: 14,
        color: '#4b5563',
        marginBottom: 16,
    },
    nextButton: {
        backgroundColor: '#ca8a04',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Card Theme styles
    progress: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    cardContainer: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 24,
    },

});