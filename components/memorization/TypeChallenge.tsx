import {
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableOpacity,
  TextInput,
  Keyboard,
} from 'react-native';
import React, { FC, useEffect, useRef, useState } from 'react';
import { Text, View } from '../Themed';
import { IVerseItem, TTheme } from '@/types';
import { getVerseTextRaw } from '@/utils/getVerseTextRaw';
import { splitText } from '@/utils/groupBy';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import ProgressBar from '../home/footer/ProgressBar';
import removeAccent from '@/utils/removeAccent';

type TypeChallengeProps = {
  item: IVerseItem;
  typeInfo: TPoints;
  onUpdateProgress: (value: number) => void;
};

type TPoints = {
  point: number;
  maxPoint: number;
  description: string;
};

const TypeChallenge: FC<TypeChallengeProps> = ({
  item,
  typeInfo,
  onUpdateProgress,
}) => {
  const router = useRouter();
  const theme = useTheme();
  const styles = getStyles(theme);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [completedWords, setCompletedWords] = useState<
    Array<{ text: string; isCorrect: boolean }>
  >([]);

  const text = getVerseTextRaw(item?.text || '');
  const words = text
    .replace(/«.*»/, '')
    .split(' ')
    .filter((x: string) => x !== '*' && x !== '');

  const verseReference = `${item?.bookName} ${item?.chapter}:${item?.verse}`;
  const parts =
    words.length <= 1
      ? [...splitText(text, 3), verseReference]
      : [...words, verseReference];

  const inputRef = useRef<TextInput>(null);
  const isCompleted = currentIndex === parts.length - 1;
  const allowNumberOfMistakes = 3;

  useEffect(() => {
    if (isCompleted) {
      Keyboard.dismiss();
    }
  }, [isCompleted]);

  useEffect(() => {
    if (mistakes >= allowNumberOfMistakes) {
      setTimeout(() => {
        resetGame();
      }, 500);
    }
  }, [mistakes]);

  const onPress = () => {
    if (!Keyboard.isVisible() && !isCompleted) {
      Keyboard.dismiss();
      inputRef.current?.focus();
    }
  };

  const resetGame = () => {
    setStarted(false);
    setMistakes(0);
    setCurrentIndex(0);
    setCompletedWords([]);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyPress = (key: string) => {
    setStarted(true);
    if (isCompleted) return;

    const currentWord = removeAccent(parts[currentIndex]);
    const expectedFirstLetter = currentWord.charAt(0).toLowerCase();
    const inputLetter = key.toLowerCase();

    const isCorrect = expectedFirstLetter === inputLetter;

    if (!isCorrect) {
      setMistakes((prev) => prev + 1);
    }

    setCompletedWords((prev) => [...prev, { text: currentWord, isCorrect }]);
    setCurrentIndex((prev) => prev + 1);

    if (currentIndex === parts.length - 2) Keyboard.dismiss();
  };

  const onCompleted = async () => {
    await onUpdateProgress(typeInfo.point);
    router.back();
  };

  const renderWord = (word: string, index: number) => {
    const completed = completedWords[index];
    if (!completed) {
      return (
        <Text
          key={index}
          style={[
            styles.verseText,
            index === currentIndex && styles.currentWord,
            { color: 'transparent' },
          ]}
        >
          {word}{' '}
        </Text>
      );
    }

    return (
      <Text
        key={index}
        style={[
          styles.verseText,
          {
            color: completed.isCorrect ? '#1ce265' : '#dc2626',
          },
        ]}
      >
        {word}{' '}
      </Text>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={styles.container}>
        <TextInput
          ref={inputRef}
          style={styles.hiddenInput}
          onKeyPress={(e) => handleKeyPress(e.nativeEvent.key)}
          autoFocus
          autoCapitalize='none'
          autoCorrect={false}
          blurOnSubmit={false}
        />
        <View style={{ marginBottom: 20, width: '100%' }}>
          <ProgressBar
            hideCircle
            height={4}
            color={'#dc2626'}
            barColor={theme.colors.text}
            progress={mistakes / allowNumberOfMistakes}
            circleColor='transparent'
          />
          <Text style={styles.verseReference}>{verseReference}</Text>
        </View>

        {started && (
          <View style={styles.gameContainer}>
            <View>
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>Errores: {mistakes}</Text>
                <Text style={styles.progressText}>
                  Progreso: {Math.round((currentIndex / parts.length) * 100)}%
                </Text>
              </View>

              <View style={styles.wordsContainer}>
                {parts
                  .slice(0, -1)
                  .map((word, index) => renderWord(word, index))}
              </View>
            </View>

            {isCompleted && (
              <TouchableOpacity
                style={styles.completedButton}
                onPress={() => onCompleted()}
              >
                <Text style={styles.completedButtonText}>Completedo</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {!started && (
          <View style={styles.introContainer}>
            <Text style={styles.introText}>{typeInfo.description}</Text>
            <Text style={[styles.instructionText, { marginTop: 10 }]}>
              El juego se reiniciará después de {allowNumberOfMistakes} errores
            </Text>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    container: {
      padding: 16,
      flex: 1,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    hiddenInput: {
      position: 'absolute',
      width: 1,
      height: 1,
      opacity: 0,
    },
    gameContainer: {
      width: '100%',
      flex: 1,
      justifyContent: 'space-between',
    },
    progressContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    progressText: {
      fontSize: 16,
      color: colors.text,
    },
    wordsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 20,
    },
    introContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
    },
    introText: {
      textAlign: 'center',
      fontSize: 20,
      marginBottom: 16,
    },
    instructionText: {
      textAlign: 'center',
      fontSize: 16,
      color: colors.text,
      opacity: 0.8,
    },
    verseText: {
      fontSize: 22,
      color: colors.text,
      opacity: 0.6,
    },
    currentWord: {
      opacity: 1,
      fontWeight: 'bold',
    },
    verseReference: {
      marginTop: 10,
      fontSize: 20,
      color: colors.text,
      fontWeight: 'bold',
      textAlign: 'left',
    },
    completedButton: {
      width: '100%',
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
      marginTop: 20,
    },
    completedButtonText: {
      fontSize: 18,
      color: dark ? '#fff' : '#000',
      fontWeight: 'bold',
    },
  });

export default TypeChallenge;