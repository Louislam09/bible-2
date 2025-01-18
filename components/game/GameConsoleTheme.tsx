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

const GameConsoleTheme = ({ router, feedback, currentQuestion, onAnswer, onNext, progress, selectedAnswer, title }: ICardTheme) => {
    const currentOptions = useMemo(() => shuffleOptions(currentQuestion?.options), [currentQuestion]);

    const getButtonStyle = ({ isSelected, isCorrect, showResult }: ButtonStyleProps): object => {
        return [
            isSelected && styles.selectedButton,
            showResult && isCorrect && styles.correctButton,
            isSelected && !isCorrect && showResult && styles.incorrectButton,
        ];
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: '#111827' }]}>
            <View style={[styles.consoleContainer, styles.consoleBorder]}>
                <View style={[styles.header, styles.consoleBorderBottom]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Icon onPress={() => router.back()} name="ChevronLeft" color="#34d399" size={32} />
                        <Text style={styles.consoleTitle}>{title.toUpperCase()}</Text>

                    </View>
                    <View style={styles.headerRight}>
                        <Text style={styles.consoleText}>⚡</Text>
                        <Text style={[styles.consoleText, { marginLeft: 8 }]}>LVL_{progress?.level}</Text>
                    </View>
                </View>

                <View style={styles.questionCard}>
                    <Text style={styles.consoleText}>{`> ${currentQuestion?.question}`}</Text>
                </View>

                <View style={styles.optionsContainer}>

                    {currentOptions.map((option, i) => (
                        <TouchableOpacity
                            key={i}
                            onPress={() => onAnswer(option)}
                            disabled={selectedAnswer !== null}
                            style={[
                                styles.consoleOption,
                                getButtonStyle({
                                    isSelected: selectedAnswer === option,
                                    isCorrect: option === currentQuestion?.correct,
                                    showResult: selectedAnswer !== null,
                                })
                            ]}
                        >
                            <Text style={[styles.consoleText]}>[{i + 1}] {option}</Text>
                        </TouchableOpacity>
                    ))}
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
                            <TouchableOpacity style={[styles.nextButton]} onPress={onNext}>
                                <Text style={styles.buttonText}>[ Siguiente pregunta ]</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
}

export default GameConsoleTheme

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    safeArea: {
        flex: 1,
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
        color: '#34d399',
        marginTop: 8,
    },
    nextButton: {
        marginTop: 20,
        padding: 10,
        alignItems: 'center',

        backgroundColor: '#1f2937',
        borderWidth: 1,
        borderColor: '#fff',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    selectedButton: {
        borderColor: '#fff',
        borderWidth: 2,
    },
    correctButton: {
        backgroundColor: '#34d39977',
        color: '#fff'
    },
    incorrectButton: {
        backgroundColor: '#dc26267d',
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
        fontSize: 18,
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
    optionText: {
        color: 'white',
        fontSize: 16,
    },

    // Console Theme styles
    consoleContainer: {
        flex: 1,
        borderWidth: 2,
        borderColor: '#34d399',
        borderRadius: 8,
        padding: 16,
    },
    consoleBorderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: '#34d399',
        paddingBottom: 16,
    },
    consoleTitle: {
        fontSize: 20,
        color: '#34d399',
        fontFamily: 'monospace',
    },
    consoleText: {
        fontSize: 20,
        color: '#34d399',
        fontFamily: 'monospace',
    },
    consoleOption: {
        backgroundColor: '#1f2937',
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#34d399',
    },

    shadowProp: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    consoleBorder: {
        borderColor: '#34d399',
    },
});