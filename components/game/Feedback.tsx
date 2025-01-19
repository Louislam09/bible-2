import { useBibleContext } from '@/context/BibleContext';
import { useDBContext } from '@/context/databaseContext';
import { AnswerResult } from '@/types';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Reference from './Reference';
import { GET_DAILY_VERSE } from '@/constants/Queries';
import { DB_BOOK_NAMES } from '@/constants/BookNames';

type TypeTHeme = 'Card' | 'GameConsole' | 'Neon' | 'Medieval'

interface IFeedback {
    feedback: AnswerResult;
    feedbackOpacity: Animated.Value;
    onNext: () => void;
    theme: TypeTHeme;
}

interface BibleReference {
    book: string;
    chapter: string;
    verse: string;
    endVerse: string | null;
}

function parseBibleReferences(references: string): BibleReference[] {
    // Regular expression to match book names, chapters, and verses, supporting books with spaces or numbers (e.g., "1 Samuel")
    const regex = /(\d?\s?[A-Za-záéíóúñ]+(?:\s[A-Za-záéíóúñ]+)?)\s+(\d+):(\d+)(?:-(\d+))?/g;

    // Find all matches using matchAll
    const matches = [...references.matchAll(regex)];

    if (matches.length === 0) {
        throw new Error("Formato inválido. Asegúrate de usar 'Libro Capítulo:Versículo' o 'Libro Capítulo:Versículo-Versículo'.");
    }

    // Map the matches to the BibleReference structure
    return matches.map(match => {
        const [, book, chapter, verse, endVerse] = match;
        return {
            book: book.trim(),  // Remove extra spaces
            chapter: chapter || "",
            verse: verse || "",
            endVerse: endVerse || null
        };
    });
}

const Feedback = ({ theme, feedback, feedbackOpacity, onNext }: IFeedback) => {
    const styles = useMemo(() => getStyles({ theme }), [theme])
    const refenceRef = useRef(null)
    const [displayRef, setDisplayRef] = useState(false)
    const [item, setItem] = useState(null)

    const { executeSql, myBibleDB } = useDBContext();

    const fetchVerseDetails = async (reference: string) => {
        if (!myBibleDB || !executeSql) return;

        const [{ book, chapter, verse }] = parseBibleReferences(reference);
        const { bookNumber: book_number } = DB_BOOK_NAMES.find((x) => x.longName === book || x.longName.includes(book)) || {};
        console.log({ book, book_number, chapter, verse });

        try {
            const response: any = await executeSql(myBibleDB, GET_DAILY_VERSE, [
                book_number,
                chapter,
                verse,
            ]);
            setItem(response?.[0]);
        } catch (error) {
            console.log(error);
        }
    };

    const onReference = (reference: string) => {
        setDisplayRef(true)
        fetchVerseDetails(feedback.reference);
    }

    const onClose = () => {
        console.log('closing ref')
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
                    <Reference item={item} onClose={onClose} isVisible={displayRef} target={refenceRef} />
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