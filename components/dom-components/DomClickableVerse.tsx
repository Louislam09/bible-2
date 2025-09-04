"use dom";
import { WordTagPair } from '@/utils/extractVersesInfo';
import { useDOMImperativeHandle, type DOMImperativeFactory } from 'expo/dom';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';

// @ts-ignore
const IS_DOM = typeof ReactNativeWebView !== "undefined";

// Types for the component
interface ParsedWord {
    word: string;
    strongNumber?: string;
    isClickable: boolean;
    index: number;
}

interface ClickableVerseProps {
    text: string;
    fontSize?: number;
    theme: {
        colors: {
            text: string;
            notification: string;
            background: string;
            primary?: string;
        }
    };
    onWordClick?: (word: WordTagPair) => void;
    //   onWordClick?: (word: string, strongNumber: string) => Promise<void>;
    onMeasure?: (height: number, width: number) => Promise<void>;
    verse: string | number;
    ref?: React.Ref<DomClickableVerseRef>;
    dom?: any;
}

// Imperative handle interface
export interface DomClickableVerseRef extends DOMImperativeFactory {
    // highlightWord: (strongNumber: string) => void;
    clearHighlights: () => void;
    getWordCount: () => number;
    // scrollToWord: (strongNumber: string) => void;
}

// Enhanced text parsing with better error handling and performance
const parseVerseText = (text: string): ParsedWord[] => {
    if (!text || typeof text !== 'string') {
        return [];
    }

    const parts: ParsedWord[] = [];
    let wordIndex = 0;

    try {
        // More robust regex pattern for Strong's numbers
        const strongPattern = /<S>(\d+)<\/S>/g;
        const segments = text.split(strongPattern);

        let i = 0;
        while (i < segments.length) {
            const segment = segments[i];

            // Check if next segment is a Strong's number
            if (i + 1 < segments.length && /^\d+$/.test(segments[i + 1])) {
                const strongNumber = segments[i + 1];

                // Process the text segment to find words
                const words = segment.trim().split(/\s+/).filter(w => w.length > 0);

                if (words.length > 0) {
                    // All words except the last are non-clickable
                    for (let j = 0; j < words.length - 1; j++) {
                        parts.push({
                            word: cleanWord(words[j]),
                            isClickable: false,
                            index: wordIndex++
                        });
                    }

                    // Last word gets the Strong's number
                    const lastWord = words[words.length - 1];
                    if (lastWord) {
                        parts.push({
                            word: cleanWord(lastWord),
                            strongNumber: strongNumber,
                            isClickable: true,
                            index: wordIndex++
                        });
                    }
                }

                i += 2; // Skip both the text and the Strong's number
            } else {
                // Regular text without Strong's number
                const words = segment.trim().split(/\s+/).filter(w => w.length > 0);
                words.forEach(word => {
                    if (word) {
                        parts.push({
                            word: cleanWord(word),
                            isClickable: false,
                            index: wordIndex++
                        });
                    }
                });
                i++;
            }
        }
    } catch (error) {
        console.error('Error parsing verse text:', error);
        // Fallback: return plain text as non-clickable words
        return text.split(/\s+/).filter(w => w.length > 0).map((word, index) => ({
            word: cleanWord(word),
            isClickable: false,
            index
        }));
    }

    return parts;
};

// Helper function to clean word from punctuation artifacts
const cleanWord = (word: string): string => {
    return word.replace(/[<>]/g, '').trim();
};

const DomClickableVerse: React.FC<ClickableVerseProps> = ({
    text,
    fontSize = 16,
    theme,
    onWordClick,
    // onMeasure,
    verse,
    ref,
    dom
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Parse words with memoization for performance
    const parsedWords = useMemo(() => parseVerseText(text), [text]);

    // Handle word click with native action
    const handleWordClick = useCallback(async (
        word: string,
        strongNumber: string,
        wordIndex: number,
        event: React.MouseEvent
    ) => {
        event.stopPropagation();
        event.preventDefault();

        if (!strongNumber || !onWordClick) return;

        try {
            await onWordClick({ word, tagValue: strongNumber });
        } catch (error) {
            console.error('Error handling word click:', error);
        }
    }, [onWordClick, verse]);


    // Accessibility and interaction enhancements
    const renderWord = (parsedWord: ParsedWord) => {

        if (!parsedWord.isClickable) {
            return (
                <span key={parsedWord.index}>
                    {parsedWord.word}
                </span>
            );
        }

        return (
            <span
                key={parsedWord.index}
                style={{ color: theme.colors.notification }}
                onClick={(e) => handleWordClick(
                    parsedWord.word,
                    parsedWord.strongNumber!,
                    parsedWord.index,
                    e
                )}
                className="bg-white/10 p-1 rounded-md border border-white/10"
                role="button"
                tabIndex={0}
            >
                {parsedWord.word}
            </span>
        );
    };

    return (
        <div
            ref={containerRef}
            role="region"
            aria-label={`Bible verse ${verse} with clickable Strong's numbers`}
            className="inline"
        >
            {parsedWords.map((parsedWord, index) => (
                <React.Fragment key={parsedWord.index}>
                    {renderWord(parsedWord)}
                    {index < parsedWords.length - 1 && ' '}
                </React.Fragment>
            ))}
        </div>
    );
};

export default DomClickableVerse;
