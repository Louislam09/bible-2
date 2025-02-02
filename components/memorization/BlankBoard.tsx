import { TTheme } from '@/types';
import { useTheme } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

type BlankBoardProps = {
  phrase: string;
  reference?: string;
};

type VersePart = string | null;

const BlankBoard: React.FC<BlankBoardProps> = ({ phrase, reference = '' }) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const [selectedBlankIndex, setSelectedBlankIndex] = useState<number | null>(
    null
  );
  const [answers, setAnswers] = useState<string[]>([]);
  const [verseParts, setVerseParts] = useState<VersePart[]>([]);
  const [wordBank, setWordBank] = useState<string[]>([]);

  useEffect(() => {
    generatePuzzle();
  }, [phrase]);

  const generatePuzzle = () => {
    // Split the phrase, preserving spaces for reconstruction
    const parts = phrase.split(/(\s+)/).filter(Boolean);
    const processedParts: VersePart[] = [];
    const hiddenWords: string[] = [];

    // Randomly select words to hide
    const wordsToHide = parts
      .filter((part) => part.trim() !== '')
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(parts.length / 4));

    parts.forEach((part) => {
      if (part.trim() === '') {
        // It's a space, preserve it
        processedParts.push(part);
      } else {
        // Check if this part should be hidden
        if (wordsToHide.includes(part)) {
          // It's a word to hide
          hiddenWords.push(part.toLowerCase());
          processedParts.push(null);
        } else {
          processedParts.push(part);
        }
      }
    });

    setVerseParts(processedParts);
    // Remove duplicates and sort
    setWordBank([...new Set(hiddenWords)].sort());
    setAnswers(new Array(hiddenWords.length).fill(''));
  };

  const handleBlankPress = (index: number) => {
    setSelectedBlankIndex(index);
  };

  const handleWordPress = (word: string) => {
    if (selectedBlankIndex !== null) {
      const newAnswers = [...answers];
      newAnswers[selectedBlankIndex] = word;
      setAnswers(newAnswers);
      setSelectedBlankIndex(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.verseContainer}>
        {verseParts.map((part, index) => {
          if (part === null) {
            const blankIndex = verseParts
              .slice(0, index)
              .filter((p) => p === null).length;
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.blank,
                  selectedBlankIndex === blankIndex && styles.selectedBlank,
                ]}
                onPress={() => handleBlankPress(blankIndex)}
              >
                <Text style={styles.blankText}>{answers[blankIndex]}</Text>
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

      {/* {reference && (
        <View style={styles.reference}>
          <Text style={styles.referenceText}>{reference}</Text>
        </View>
      )} */}

      <View style={styles.wordBank}>
        {wordBank.map((word, index) => (
          <TouchableOpacity
            key={index}
            style={styles.word}
            onPress={() => handleWordPress(word)}
          >
            <Text style={styles.wordText}>{word}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.card,
    },
    verseContainer: {
      flex: 1,
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    verseText: {
      color: colors.text,
      fontSize: 18,
    },
    blank: {
      backgroundColor: '#404040',
      minWidth: 60,
      height: 30,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 2,
      marginVertical: 2,
      borderRadius: 5,
    },
    selectedBlank: {
      backgroundColor: '#606060',
    },
    blankText: {
      color: colors.text,
      fontSize: 16,
    },
    reference: {
      padding: 20,
    },
    referenceText: {
      color: colors.text,
      fontSize: 18,
      fontWeight: 'bold',
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
      borderRadius: 20,
    },
    wordText: {
      color: colors.card,
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

export default BlankBoard;
