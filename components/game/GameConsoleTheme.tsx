import { ICardTheme, QuestionDifficulty } from '@/types';
import { shuffleOptions } from '@/utils/shuffleOptions';
import React, { useMemo } from 'react';
import { Animated, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from '../Icon';
import useGameAnimation from '@/hooks/useGameAnimation';
import { Lightbulb, Zap } from 'lucide-react-native';
import ProgressBar from '../home/footer/ProgressBar';
import QuestionOptionItem from './QuestionOptionItem';
import Feedback from './Feedback';

const GameConsoleTheme = ({ router, feedback, currentQuestion, onAnswer, onNext, progress, selectedAnswer, title }: ICardTheme) => {
    const currentOptions = useMemo(() => shuffleOptions(currentQuestion?.options), [currentQuestion]);
    const { blinkingColor, feedbackOpacity, optionsOpacity, questionCardOpacity } = useGameAnimation({ progress, feedback, currentQuestion })
    const questionDifficulty = currentQuestion?.difficulty as keyof typeof QuestionDifficulty

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: '#111827' }]}>
            <View style={[styles.consoleContainer, styles.consoleBorder]}>
                <View style={[styles.header]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Icon onPress={() => router.back()} name="ChevronLeft" color="#34d399" size={32} />
                        <Text style={styles.consoleTitle}>{title.toUpperCase()}</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <Zap color={QuestionDifficulty[questionDifficulty]} size={24} />
                        <Text style={[styles.consoleText, { marginLeft: 8 }]}>LVL_{progress?.level}</Text>
                    </View>
                </View>
                <View style={{ marginBottom: 32, marginTop: 15 }}>
                    <ProgressBar
                        hideCircle
                        height={4}
                        color={"#34d399"}
                        barColor={QuestionDifficulty[questionDifficulty]}
                        progress={(progress?.current || 0) / (progress?.total || 10)}
                        circleColor={'#34d399'}
                    />
                </View>

                <Animated.View style={[styles.questionCard, {
                    opacity: questionCardOpacity, borderColor: blinkingColor,
                    borderWidth: 2
                }]}>
                    <Text style={styles.consoleText}>{`> ${currentQuestion?.question}`}</Text>
                    <Lightbulb
                        style={{ position: 'relative', alignSelf: 'flex-end', marginRight: -20 }}
                        strokeWidth={2}
                        color={QuestionDifficulty[questionDifficulty]}
                        size={28}
                    />
                </Animated.View>

                <ScrollView style={styles.optionsContainer}>
                    <Animated.View style={{ opacity: optionsOpacity }}>
                    {currentOptions.map((option, i) => (
                        <QuestionOptionItem
                            key={i}
                            index={i}
                            theme='GameConsole'
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
                            theme='GameConsole'
                            feedback={feedback}
                            feedbackOpacity={feedbackOpacity}
                            onNext={onNext}
                        />
                    )}

                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

export default GameConsoleTheme

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 4,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
        paddingBottom: 10,
        // borderRadius: 16,
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