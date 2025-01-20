import { useBibleContext } from '@/context/BibleContext';
import { useDBContext } from '@/context/databaseContext';
import { AnswerResult } from '@/types';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Reference from './Reference';
import { GET_DAILY_VERSE, GET_SINGLE_OR_MULTIPLE_VERSES } from '@/constants/Queries';
import { DB_BOOK_NAMES } from '@/constants/BookNames';
import { parseBibleReferences } from '@/utils/extractVersesInfo';

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

    const { executeSql, myBibleDB } = useDBContext();

    // const fetchVerseDetails = async (references: string) => {
    //     if (!myBibleDB || !executeSql) return;

    //     // Parse the references into structured data
    //     const parsedReferences = parseBibleReferences(references);

    //     // Build the query dynamically
    //     const conditions: string[] = [];
    //     const params: (string | number)[] = [];

    //     parsedReferences.forEach(({ book, chapter, verse, endVerse }) => {
    //         const { bookNumber: book_number } = DB_BOOK_NAMES.find(
    //             (x) => x.longName === book || x.longName.includes(book)
    //         ) || {};

    //         if (!book_number) {
    //             console.log(`Book "${book}" not found in database.`);
    //             return;
    //         }

    //         if (endVerse) {
    //             // Range condition for verses
    //             conditions.push(`(v.book_number = ? AND v.chapter = ? AND v.verse BETWEEN ? AND ?)`);
    //             params.push(book_number, chapter, verse, endVerse);
    //         } else {
    //             // Single verse condition
    //             conditions.push(`(v.book_number = ? AND v.chapter = ? AND v.verse = ?)`);
    //             params.push(book_number, chapter, verse);
    //         }
    //     });

    //     if (conditions.length === 0) {
    //         console.log("No valid references found.");
    //         return;
    //     }

    //     // Build the final query
    //     const query = `
    //         SELECT v.*, b.long_name AS bookName
    //         FROM verses v
    //         INNER JOIN books b
    //             ON b.book_number = v.book_number
    //         WHERE ${conditions.join(" OR ")};
    //     `;

    //     try {
    //         // Execute the query with parameters
    //         const response: any = await executeSql(myBibleDB, query, params);
    //         setItems(response); // Set the response
    //     } catch (error) {
    //         console.error("Error fetching verse details:", error);
    //     }
    // };

    const onReference = (reference: string) => {
        SetReferences(reference)
        setDisplayRef(true)
        // fetchVerseDetails(feedback.reference);
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