import {
  StyleSheet,
  TouchableWithoutFeedback,
  Button,
  TouchableOpacity,
} from 'react-native';
import React, { FC, useState } from 'react';
import { Text, View } from '../Themed';
import { IVerseItem, TTheme } from '@/types';
import { getVerseTextRaw } from '@/utils/getVerseTextRaw';
import { splitText } from '@/utils/groupBy';
import { useTheme } from '@react-navigation/native';
import { useRouter } from 'expo-router';

type ReadChallengeProps = {
  item: IVerseItem | any;
};

const ReadChallenge: FC<ReadChallengeProps> = ({ item }) => {
  const router = useRouter();
  const theme = useTheme();
  const styles = getStyles(theme);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [started, setStarted] = useState(false);
  const [currentParts, setCurrentParts] = useState<string[]>([]);
  const text = getVerseTextRaw(item.text);
  const splitByComma = text.split(/[,;]/);
  const verseReference = `${item?.bookName} ${item?.chapter}:${item?.verse}`;
  const parts =
    splitByComma.length <= 1
      ? [...splitText(text, 3), verseReference]
      : [...splitByComma, verseReference];
  const isCompleted = currentIndex === parts.length - 1;

  const onPress = () => {
    if (!started) {
      setStarted(true);
    } else if (currentIndex < parts.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentParts([...currentParts, parts[currentIndex + 1]]);
    }
  };

  return (
    <TouchableWithoutFeedback
      style={{ flex: 1, borderWidth: 1, borderColor: 'red' }}
      onPress={onPress}
    >
      <View style={styles.container}>
        {started && (
          <View style={{}}>
            <Text style={styles.verseText}>
              {currentParts.map((part, index) => {
                const isCurrent = index === currentIndex;
                if (index === parts.length - 1) return '';
                return isCurrent ? (
                  <Text style={{ fontSize: 24 }} key={index}>
                    {` ${part}`}
                  </Text>
                ) : (
                  `${part} `
                );
              })}
            </Text>
            {isCompleted && (
              <Text style={styles.verseReference}>{verseReference}</Text>
            )}
          </View>
        )}
        {!started && (
          <View style={styles.introContainer}>
            <Text style={styles.introText}>
              Toca para revelar el versículo por sección
            </Text>
          </View>
        )}
        {started && isCompleted && (
          <TouchableOpacity
            style={styles.completedButton}
            onPress={() => router.back()}
          >
            <Text
              style={{
                fontSize: 18,
              }}
            >
              Completado
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default ReadChallenge;

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    container: {
      padding: 16,
      flex: 1,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    introContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    introText: {
      textAlign: 'center',
      fontSize: 20,
    },
    completedButton: {
      width: '100%',
      backgroundColor: colors.notification,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
      marginTop: 20,
    },
    verseText: {
      marginBottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      color: '#cfcfce',
      fontSize: 24,
    },
    verseReference: {
      fontSize: 22,
      color: '#fff',
      fontWeight: 'bold',
      textAlign: 'left',
    },
  });
