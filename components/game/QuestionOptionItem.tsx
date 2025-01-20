import { SOUNDS } from '@/constants/gameSound';
import { usePlaySound } from '@/hooks/usePlaySound';
import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, Vibration } from 'react-native';

type TypeTHeme = 'Card' | 'GameConsole' | 'Neon' | 'Medieval'

interface IOptionItem {
    onAnswer: (answer: string) => void;
    selectedAnswer: string | null;
    value: string;
    isSelected: boolean;
    isCorrect: boolean;
    index: number;
    showResult: boolean;
    theme: TypeTHeme;
}

const gameThemes = {
    Card: {
        selectedButtonColor: '#ca8a04',
        correctBorderColor: '#166534',
        correctButtonColor: '#4ade80',
        incorrectBorderColor: '#991b1b',
        incorrectButtonColor: '#f87171',
        option: {
            padding: 16,
            borderRadius: 12,
            marginBottom: 12,
            backgroundColor: '#fefce8',
            borderWidth: 2,
            borderColor: '#fef08a'
        },
        optionText: {
            fontSize: 16,
            color: '#854d0e'
        }
    },
    GameConsole: {
        selectedButtonColor: '#fff',
        correctButtonColor: '#166534',
        correctBorderColor: '#4ade80',
        incorrectButtonColor: '#991b1b',
        incorrectBorderColor: '#f87171',
        option: {
            backgroundColor: '#1f2937',
            padding: 12,
            marginBottom: 8,
            borderWidth: 1,
            borderColor: '#34d399',
        },
        optionText: {
            fontSize: 20,
            color: '#34d399',
            fontFamily: 'monospace',
        }
    },
    Medieval: {
        selectedButtonColor: '#fbbf24',
        correctButtonColor: '#166534',
        correctBorderColor: '#4ade80',
        incorrectButtonColor: '#991b1b',
        incorrectBorderColor: '#f87171',
        option: {
            backgroundColor: '#92400e',
            padding: 16,
            borderRadius: 4,
            borderWidth: 1,
            borderColor: '#fbbf24',
            marginBottom: 12,
        },
        optionText: {
            color: '#fef3c7',
            fontFamily: 'serif',
        }
    },
    Neon: {
        selectedButtonColor: '#78350f',
        correctButtonColor: '#166534',
        correctBorderColor: '#4ade80',
        incorrectButtonColor: '#991b1b',
        incorrectBorderColor: '#f87171',
        option: {
            backgroundColor: '#111827',
            padding: 16,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#22d3ee',
        },
        optionText: {
            color: '#22d3ee',
        }
    },

}

const QuestionOptionItem = ({ index, theme, isSelected, showResult, isCorrect, onAnswer, selectedAnswer, value }: IOptionItem) => {
    const styles = useMemo(() => getStyles({ theme }), [theme])
    const defaultTranslation = -100
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateYAnim = useRef(new Animated.Value(defaultTranslation)).current;
    const { play: playCorrectChoise } = usePlaySound(SOUNDS.correct);
    const { play: playIncorrectChoise } = usePlaySound(SOUNDS.incorrectChoice);

    useEffect(() => {
        if (isCorrect && isSelected) {
            playCorrectChoise()
        } else if (isSelected && !isCorrect && showResult) {
            playIncorrectChoise()
        }
    }, [isSelected])

    useEffect(() => {
        fadeAnim.setValue(0)
        translateYAnim.setValue(defaultTranslation)
    }, [value])

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                delay: index * 200,
                useNativeDriver: true,
            }),
            Animated.timing(translateYAnim, {
                toValue: 0,
                duration: 500,
                delay: index * 200,
                useNativeDriver: true,
            }),
        ]).start();
    }, [fadeAnim, translateYAnim, index, value]);

    return (
        <Animated.View style={{
            opacity: fadeAnim,
            transform: [{ translateX: translateYAnim }]
        }}>
            <TouchableOpacity
                key={value}
                onPress={() => {
                    onAnswer(value)
                }}
                disabled={selectedAnswer !== null}
                style={[
                    styles.option,
                    isSelected && styles.selectedButton,
                    showResult && isCorrect && styles.correctButton,
                    isSelected && !isCorrect && showResult && styles.incorrectButton,
                ]}
            >
                <Text style={[
                    styles.optionText,
                    isSelected && styles.optionSelectText,
                    showResult && isCorrect && styles.optionSelectText,
                ]}>{value}</Text>
            </TouchableOpacity>
        </Animated.View >
    )
}

export default QuestionOptionItem

const getStyles = ({ theme }: { theme: TypeTHeme }) => StyleSheet.create({
    option: gameThemes[theme].option,
    optionText: gameThemes[theme].optionText,
    optionSelectText: { color: 'white', fontWeight: 'bold' },
    selectedButton: {
        borderColor: '#ca8a04',
        borderWidth: 2,
    },
    correctButton: {
        backgroundColor: gameThemes[theme].correctButtonColor,
        borderColor: gameThemes[theme].correctBorderColor,
    },
    incorrectButton: {
        backgroundColor: gameThemes[theme].incorrectButtonColor,
        borderColor: gameThemes[theme].incorrectBorderColor,
    },
})