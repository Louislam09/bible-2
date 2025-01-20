import useGameAnimation from '@/hooks/useGameAnimation';
import { ICardTheme, QuestionDifficulty } from '@/types';
import { shuffleOptions } from '@/utils/shuffleOptions';
import { Lightbulb, ShieldCheck } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Animated, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Icon from '../Icon';
import QuestionOptionItem from './QuestionOptionItem';
import ProgressBar from '@/components/home/footer/ProgressBar';
import Feedback from './Feedback';

const CardTheme = ({ scrollViewRef, router, feedback, currentQuestion, onAnswer, onNext, progress, selectedAnswer, title }: ICardTheme) => {
    const currentOptions = useMemo(() => shuffleOptions(currentQuestion?.options), [currentQuestion]);
    const { blinkingColor, feedbackOpacity, optionsOpacity, questionCardOpacity } = useGameAnimation({ progress, feedback, currentQuestion })
    const questionDifficulty = currentQuestion?.difficulty as keyof typeof QuestionDifficulty

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: '#fefce8' }]}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Icon onPress={() => router.back()} name="ChevronLeft" color="#ca8a04" size={24} />
                    <Text style={[styles.headerTitle]}>{title}</Text>
                </View>
                <View style={[styles.progress, { backgroundColor: '#fef08a', flexDirection: 'row', alignItems: 'center' }]}>
                    <ShieldCheck color={QuestionDifficulty[questionDifficulty]} size={24} />
                    <Text style={{ fontSize: 16, color: '#854d0e' }}>LVL_{progress?.level}</Text>
                </View>
                {/* <View style={[styles.progress, { backgroundColor: '#fef08a' }]}>
                    <Text style={{ fontSize: 16, color: '#854d0e' }}>{progress?.current} / {progress?.total}</Text>
                </View> */}
            </View>
            <View style={{ marginVertical: 20 }}>
                <ProgressBar
                    hideCircle
                    height={4}
                    color='#ca8a04'
                    barColor='#854d0e'
                    progress={(progress?.current || 0) / (progress?.total || 10)}
                    circleColor='#ca8a04'
                />
            </View>

            <ScrollView ref={scrollViewRef} style={[styles.cardContainer, styles.shadowProp]}>
                <Animated.View style={[
                    styles.questionCard,
                    {
                        backgroundColor: '#fef9c3',
                        opacity: questionCardOpacity,
                        borderColor: blinkingColor,
                        borderWidth: 2
                    }
                ]}>
                    <Text style={[styles.questionText]}>{currentQuestion?.question}</Text>
                    <Lightbulb
                        style={{ position: 'relative', alignSelf: 'flex-end', marginRight: -20 }}
                        strokeWidth={2}
                        color={QuestionDifficulty[questionDifficulty]}
                        size={28}
                    />
                </Animated.View>

                <Animated.View style={[styles.optionsContainer, { opacity: optionsOpacity }]}>
                    {currentOptions.map((option, i) => (
                        <QuestionOptionItem 
                            key={i}
                            index={i}
                            theme='Card'
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
                        theme='Card'
                        feedback={feedback}
                        feedbackOpacity={feedbackOpacity}
                        onNext={onNext}
                    />
                )}
            </ScrollView>
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
        // marginBottom: 32,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginLeft: 16,
        color: '#854d0e'
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
        borderRadius: 16,
        marginBottom: 24,
    },
    questionText: {
        fontSize: 20,
        color: '#854d0e'
    },
    optionsContainer: {
        gap: 12,
    },
    option: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        backgroundColor: '#fefce8',
        borderWidth: 2,
        borderColor: '#fef08a'
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