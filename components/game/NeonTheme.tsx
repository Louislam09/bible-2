import { ICardTheme, QuestionDifficulty } from '@/types';
import { shuffleOptions } from '@/utils/shuffleOptions';
import React, { useMemo } from 'react';
import { Animated, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import Icon from '../Icon';
import useGameAnimation from '@/hooks/useGameAnimation';
import { CloudLightning, Lightbulb } from 'lucide-react-native';
import ProgressBar from '../home/footer/ProgressBar';
import OptionItem from './OptionItem';
import Feedback from './Feedback';

const NeonTheme = ({ router, title, currentQuestion, onAnswer, onNext, progress, selectedAnswer, feedback }: ICardTheme) => {
    const currentOptions = useMemo(() => shuffleOptions(currentQuestion?.options), [currentQuestion]);
    const { blinkingColor, feedbackOpacity, optionsOpacity, questionCardOpacity } = useGameAnimation({ progress, feedback, currentQuestion })
    const { width } = useWindowDimensions();
    const isSmallSDevice = width < 300;
    const questionDifficulty = currentQuestion?.difficulty as keyof typeof QuestionDifficulty

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: '#030712' }]}>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon onPress={() => router.back()} name="ChevronLeft" color="#22d3ee" size={32} />
                    {!isSmallSDevice && <Text style={styles.neonTitle}>{title}</Text>}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <CloudLightning color={QuestionDifficulty[questionDifficulty]} size={24} />
                    <Text style={styles.neonText}>LVL_{progress?.level}</Text>
                </View>
                {/* <Text style={styles.neonText}>{progress?.current}/{progress?.total}</Text> */}
            </View>
            <View style={{ marginVertical: 20 }}>
                <ProgressBar
                    hideCircle
                    height={4}
                    color='#22d3ee'
                    barColor='#854d0e'
                    progress={(progress?.current || 0) / (progress?.total || 10)}
                    circleColor='#22d3ee'
                />
            </View>

            <ScrollView style={[styles.neonCard, styles.neonShadow]}>
                <Animated.View style={{
                    // opacity: questionCardOpacity,
                    borderColor: blinkingColor,
                    borderWidth: 2,
                    borderRadius: 8,
                    marginBottom: 10,
                    padding: 16,
                    paddingBottom: 10

                }}>
                    <Text style={styles.neonQuestionText}>{currentQuestion?.question}</Text>
                    <Lightbulb
                        style={{ position: 'relative', alignSelf: 'flex-end', }}
                        strokeWidth={2}
                        color={QuestionDifficulty[questionDifficulty]}
                        size={28}
                    />
                </Animated.View>


                <Animated.View style={[styles.optionsContainer, { opacity: optionsOpacity }]}>
                    {currentOptions.map((option, i) => (
                        <OptionItem
                            key={i}
                            index={i}
                            theme='Neon'
                            isCorrect={option === currentQuestion?.correct}
                            isSelected={selectedAnswer === option}
                            onAnswer={onAnswer}
                            selectedAnswer={selectedAnswer}
                            showResult={selectedAnswer !== null}
                            value={option}
                        />
                    ))}
                </Animated.View>

                {feedback && (
                    <Feedback
                        theme='Neon'
                        feedback={feedback}
                        feedbackOpacity={feedbackOpacity}
                        onNext={onNext}
                    />
                )}
                {/* {feedback && (
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
                )} */}
            </ScrollView>
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
