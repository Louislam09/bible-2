import { AnswerResult } from '@/types';
import React, { useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Reference from './Reference';

type TypeTHeme = 'Card' | 'GameConsole' | 'Neon' | 'Medieval'

interface IFeedback {
    feedback: AnswerResult;
    feedbackOpacity: Animated.Value;
    onNext: () => void;
    theme: TypeTHeme;
}


const Feedback = ({ theme, feedback, feedbackOpacity, onNext }: IFeedback) => {
    const styles = useMemo(() => getStyles({ theme }), [theme])
    const refenceRef = useRef(null)
    const [displayRef, setDisplayRef] = useState(false)
    const [references, SetReferences] = useState<string | null>(null)

    const onReference = (reference: string) => {
        SetReferences(reference)
        setDisplayRef(true)
    }

    const onClose = () => {
        setDisplayRef(false)
    }

    return (
        <Animated.View style={[styles.feedbackContainer, { opacity: feedbackOpacity }]}>
            <Text
                style={[styles.feedbackText, feedback.isCorrect ? styles.correctText : styles.incorrectText]}
            >
                {feedback.isCorrect ? "¡Correcto!" : "Incorrecto"}
            </Text>
            <Text style={styles.explanationText}>{feedback.explanation}</Text>
            {feedback.reference && (
                <>
                <View style={styles.referenceText}>
                    <Text style={styles.ref}>Referencia: </Text>
                    <TouchableOpacity onPress={() => onReference(feedback.reference)}>
                        <Text ref={refenceRef} style={{ color: '#34d399' }}>{feedback.reference}</Text>
                    </TouchableOpacity>
                    </View>
                    <Reference references={references} onClose={onClose} isVisible={displayRef} target={refenceRef} />
                </>
            )}
            <TouchableOpacity style={styles.nextButton} onPress={onNext}>
                <Text style={styles.buttonText}>Siguiente pregunta</Text>
            </TouchableOpacity>
        </Animated.View >
    )
}

export default Feedback

const feedbackTheme = {
    Card: {
        next: '#ca8a04',
        color: '#854d0e',
        borderRadius: 8
    },
    GameConsole: {
        next: '#1f2937',
        color: '#fff',
        borderRadius: 0
    },
    Medieval: {
        next: '#92400e',
        color: '#fff',
        borderRadius: 4
    },
    Neon: {
        next: '#111827',
        color: '#fff',
        borderRadius: 8
    },
}

const getStyles = ({ theme }: { theme: TypeTHeme }) => StyleSheet.create({
    feedbackContainer: {
        paddingVertical: 16,
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
        color: feedbackTheme[theme].color
    },
    ref: {
        color: feedbackTheme[theme].color
    },
    referenceText: {
        fontSize: 14,
        marginBottom: 16,
        fontWeight: 'bold',
        flexDirection: 'row', gap: 4, alignItems: 'center'
    },
    nextButton: {
        backgroundColor: feedbackTheme[theme].next,
        padding: 12,
        borderRadius: feedbackTheme[theme].borderRadius,
        alignItems: 'center',
        borderColor: feedbackTheme[theme].color,
        borderWidth: 1
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
})