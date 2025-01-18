import { ICardTheme, QuestionDifficulty } from '@/types';
import { shuffleOptions } from '@/utils/shuffleOptions';
import { Lightbulb, Shield, ShieldCheck } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Animated, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import Icon from '../Icon';
import useGameAnimation from '@/hooks/useGameAnimation';
import ProgressBar from '../home/footer/ProgressBar';

interface ButtonStyleProps {
    isSelected: boolean;
    isCorrect: boolean;
    showResult: boolean;
}

const MedievalTheme = ({
    router,
    feedback,
    currentQuestion,
    onAnswer,
    onNext,
    progress,
    selectedAnswer,
    title,
}: ICardTheme) => {
    const currentOptions = useMemo(() => shuffleOptions(currentQuestion?.options), [currentQuestion]);
    const { blinkingColor, feedbackOpacity, optionsOpacity, questionCardOpacity } = useGameAnimation({ progress, feedback, currentQuestion })
    const questionDifficulty = currentQuestion?.difficulty as keyof typeof QuestionDifficulty
    const { width } = useWindowDimensions();
    const isSmallSDevice = width < 300;


    const getButtonStyle = ({ isSelected, isCorrect, showResult }: ButtonStyleProps): object => {
        return [
            isSelected && styles.selectedButton,
            showResult && isCorrect && styles.correctButton,
            isSelected && !isCorrect && showResult && styles.incorrectButton,
        ];
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: '#92400e' }]}>
            <View style={styles.header}>
                <Icon onPress={() => router.back()} name="ChevronLeft" color="#fef3c7" size={32} />
                {!isSmallSDevice && <Text style={[styles.headerTitle, { fontFamily: 'serif' }]}>{title}</Text>}
                <View
                    style={[
                        { flexDirection: 'row', alignItems: 'center' }
                    ]}
                >
                    <ShieldCheck color="#fef08a" size={24} />
                    <Text style={{ fontSize: 16, fontFamily: 'serif', color: '#fef3c7' }}>LVL_{progress?.level}</Text>
                </View>
                <View style={styles.medievalLevel}>
                    <Text style={styles.medievalText}>{progress?.current}/{progress?.total}</Text>
                </View>
            </View>
            <View style={{ marginVertical: 20, marginBottom: 32 }}>
                <ProgressBar
                    hideCircle
                    height={4}
                    color={"#fbbf24"}
                    barColor={QuestionDifficulty[questionDifficulty]}
                    progress={(progress?.current || 0) / (progress?.total || 10)}
                    circleColor={'#fbbf24'}
                />
            </View>

            <ScrollView style={[styles.medievalCard]}>
                <Animated.View style={{
                    marginBottom: 24,
                    borderRadius: 4,
                    paddingHorizontal: 16,
                    opacity: questionCardOpacity, borderColor: blinkingColor,
                    borderWidth: 2,
                }}>
                    <Lightbulb
                        style={{ position: 'absolute', bottom: 20, right: 10 }}
                        strokeWidth={2}
                        color={QuestionDifficulty[questionDifficulty]}
                        size={28}
                    />
                    <Text style={styles.medievalQuestionText}>{currentQuestion?.question}</Text>
                </Animated.View>

                <Animated.View style={[styles.optionsContainer, { opacity: optionsOpacity }]}>
                    {currentOptions.map((option, i) => (
                        <TouchableOpacity
                            key={i}
                            onPress={() => onAnswer(option)}
                            disabled={selectedAnswer !== null}
                            style={[
                                styles.medievalOption,
                                getButtonStyle({
                                    isSelected: selectedAnswer === option,
                                    isCorrect: option === currentQuestion?.correct,
                                    showResult: selectedAnswer !== null,
                                }),
                            ]}
                        >
                            <Text style={styles.medievalOptionText}>{option}</Text>
                        </TouchableOpacity>
                    ))}
                </Animated.View>

                {feedback && (
                    <Animated.View style={[styles.feedbackContainer, { opacity: feedbackOpacity }]}>
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
                    </Animated.View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // marginBottom: 32,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fef3c7',
    },
    optionsContainer: {
        gap: 12,
    },
    feedbackContainer: {
        borderRadius: 8,
        marginTop: 10,
    },
    feedbackText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    medievalCard: {
        borderWidth: 2,
        borderColor: '#fbbf24',
        borderRadius: 8,
        padding: 24,
        paddingVertical: 10,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    medievalLevel: {
        backgroundColor: '#92400e',
        paddingHorizontal: 16,
        paddingVertical: 4,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#fbbf24',
    },
    medievalText: {
        color: '#fef3c7',
        fontFamily: 'serif',
    },
    medievalQuestionText: {
        color: '#fef3c7',
        fontSize: 20,
        marginBottom: 32,
        fontFamily: 'serif',
    },
    medievalOption: {
        backgroundColor: '#92400e',
        padding: 16,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#fbbf24',
        marginBottom: 12,
    },
    medievalOptionText: {
        color: '#fef3c7',
        fontFamily: 'serif',
    },
    // Button states
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
    correctText: {
        color: '#16a34a',
    },
    incorrectText: {
        color: '#dc2626',
    },
    explanationText: {
        fontSize: 16,
        marginBottom: 8,
        color: 'white'
    },
    referenceText: {
        fontSize: 14,
        color: '#fff',
        marginBottom: 16,
    },
    nextButton: {
        alignItems: 'center',

        backgroundColor: '#92400e',
        padding: 16,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#fff',
        marginBottom: 12,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default MedievalTheme;