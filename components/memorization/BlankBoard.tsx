import { TTheme } from '@/types';
import removeAccent from '@/utils/removeAccent';
import { useTheme } from '@react-navigation/native';
import React, { useState, useEffect, useMemo } from 'react';
import { TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Text, View } from '../Themed';
import ProgressBar from '../home/footer/ProgressBar';

type BlankBoardProps = {
  verse: string;
  reference?: string;
  onFinished: () => void;
};

type VersePart = string | null;

const BlankBoard: React.FC<BlankBoardProps> = ({
  verse: phrase,
  reference = '',
  onFinished,
}) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const [answers, setAnswers] = useState<string[]>([]);
  const [correctAnswers, setCorrentAnswers] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [mistakes, setMistakes] = useState(0);
  const [verseParts, setVerseParts] = useState<VersePart[]>([]);
  const [wordBank, setWordBank] = useState<string[]>([]);
  const isChallengeCompleted =
    currentIndex > 0 && currentIndex === correctAnswers.length;
  const shuffleOptions = (options: string[], correctAnswer: string) => {
    const uniqueOptions = Array.from(
      new Set(options.filter((word) => word !== correctAnswer))
    );
    const randomWords = uniqueOptions
      .sort(() => 0.5 - Math.random())
      .slice(0, 5);
    return [...randomWords, correctAnswer].sort(() => 0.5 - Math.random());
  };

  const currentOptions = useMemo(
    () => shuffleOptions(wordBank, correctAnswers[currentIndex]),
    [currentIndex, wordBank, correctAnswers]
  );

  useEffect(() => {
    generatePuzzle();
  }, [phrase]);

  useEffect(() => {
    if (isChallengeCompleted) onFinished();
  }, [isChallengeCompleted]);

  useEffect(() => {
    if (mistakes > 0) {
      setTimeout(() => {
        resetGame();
        generatePuzzle();
      }, 500);
    }
  }, [mistakes]);

  const generatePuzzle = () => {
    // Split the phrase, preserving spaces for reconstruction
    const parts = phrase.split(/(\s+)/).filter(Boolean);
    const processedParts: VersePart[] = [];
    const hiddenWords: string[] = [];

    const wordsToHide = parts
      .filter((part) => part.trim() !== '')
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(parts.length / 4));

    parts.forEach((part) => {
      if (part.trim() === '') {
        processedParts.push(part);
      } else {
        if (wordsToHide.includes(part)) {
          hiddenWords.push(part);
          processedParts.push(null);
        } else {
          processedParts.push(part);
        }
      }
    });

    setVerseParts(processedParts);
    setCorrentAnswers(hiddenWords);
    setWordBank(hiddenWords);
  };

  const handleWordPress = (word: string) => {
    if (currentIndex === correctAnswers.length) return;
    const isCorrect = correctAnswers[currentIndex] === word;
    if (!isCorrect) setMistakes((prev) => prev + 1);
    setCurrentIndex((prev) => prev + 1);
    setAnswers((prev) => [...prev, word]);
  };

  const checkFilledBlank = (blankIndex: number) => {
    const isFilled = !!answers[blankIndex];
    const isCorrent =
      removeAccent(answers[blankIndex] || '') ===
      removeAccent(correctAnswers[blankIndex] || '');
    const isCurrentBlank = blankIndex === currentIndex;

    return { isFilled, isCorrent, isCurrentBlank };
  };

  const resetGame = () => {
    setAnswers([]);
    setCorrentAnswers([]);
    setCurrentIndex(0);
    setMistakes(0);
    setVerseParts([]);
    setWordBank([]);
    generatePuzzle();
  };

  return (
    <View style={styles.container}>
      <View style={{ marginTop: 10 }}>
        <ProgressBar
          hideCircle
          height={4}
          color={'#dc2626'}
          barColor={theme.colors.text}
          progress={mistakes / 1}
          circleColor='transparent'
        />
        <View style={styles.reference}>
          <Text style={styles.referenceText}>{reference || ''}</Text>
        </View>
      </View>

      <View style={styles.verseContainer}>
        {verseParts.map((part, index) => {
          if (index === 0 && part?.trim() === '') return;
          if (part === null) {
            const blankIndex = verseParts
              .slice(0, index)
              .filter((p) => p === null).length;
            const { isCorrent, isCurrentBlank, isFilled } =
              checkFilledBlank(blankIndex);
            const key = isCorrent ? 'correctText' : 'incorrectText';

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.blank,
                  isCurrentBlank && styles.selectedBlank,
                  isFilled && styles.filled,
                  {
                    minWidth: (correctAnswers?.[blankIndex]?.length || 1) * 10,
                  },
                ]}
                onPress={() => {}}
              >
                <Text style={[styles.blankText, isFilled && styles[key]]}>
                  {isFilled ? correctAnswers[blankIndex] : ''}
                </Text>
              </TouchableOpacity>
            );
          }
          return (
            <Text key={index} style={styles.verseText}>
              {part}
            </Text>
          );
        })}
      </View>

      {!isChallengeCompleted && (
        <View style={styles.wordBank}>
          {currentOptions.map((word, index) => (
            <TouchableOpacity
              key={index}
              style={styles.word}
              onPress={() => handleWordPress(word)}
            >
              <Text style={styles.wordText}>{word}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    verseContainer: {
      flex: 1,
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    verseText: {
      color: colors.text,
      fontSize: 20,
    },
    blank: {
      // backgroundColor: '#ffffff',
      backgroundColor: colors.text + 40,
      // minWidth: 60,
      height: 30,
      justifyContent: 'center',
      alignItems: 'center',
      // marginHorizontal: 2,
      // marginVertical: 2,
      borderRadius: 5,
    },
    selectedBlank: {
      backgroundColor: colors.text,
    },
    filled: {
      backgroundColor: 'transparent',
    },
    correctText: {
      color: '#1ce265',
      fontSize: 20,
    },
    incorrectText: {
      color: '#dc2626',
      fontSize: 20,
    },
    blankText: {
      color: colors.text,
      fontSize: 20,
    },
    reference: {
      padding: 20,
      paddingLeft: 0,
    },
    referenceText: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '700',
    },
    wordBank: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      padding: 20,
      justifyContent: 'center',
      gap: 10,
    },
    word: {
      backgroundColor: colors.notification,
      paddingVertical: 10,
      paddingHorizontal: 20,
      // borderRadius: 20,
      borderRadius: 5,
    },
    wordText: {
      color: colors.card,
      fontSize: 20,
      fontWeight: 'bold',
    },
  });

export default BlankBoard;
