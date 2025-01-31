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

type BlankChallengeProps = {
  item: IVerseItem | any;
  typeInfo: TPoints;
  onUpdateProgress: (value: number) => void;
};

type TPoints = {
  point: number;
  maxPoint: number;
  description: string;
};

const BlankChallenge: FC<BlankChallengeProps> = ({
  item,
  typeInfo,
  onUpdateProgress,
}) => {
  const router = useRouter();
  const theme = useTheme();
  const styles = getStyles(theme);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [started, setStarted] = useState(false);
  const [currentParts, setCurrentParts] = useState<string[]>([]);
  const text = getVerseTextRaw(item?.text || '');
  const splitByComma = text.split(/[,;]/);
  const verseReference = `${item?.bookName} ${item?.chapter}:${item?.verse}`;
  const parts =
    splitByComma.length <= 1
      ? [...splitText(text, 3), verseReference]
      : [...splitByComma, verseReference];
  const isCompleted = currentIndex === parts.length - 1;

  const onPress = () => {
    if (!started) setStarted(true);
  };

  const onCompleted = async () => {
    await onUpdateProgress(typeInfo.point);
    router.back();
  };

  return (
    <TouchableWithoutFeedback
      style={{ flex: 1, borderWidth: 1, borderColor: 'red' }}
      onPress={onPress}
    >
      <View style={styles.container}>
        {started && (
          <View style={{ width: '100%' }}>
            <Text style={styles.verseText}>
              {currentParts.map((part, index) => {
                const isCurrent = index === currentIndex;
                if (index === parts.length - 1) return '';
                return (
                  <Text
                    style={{ color: isCurrent ? theme.colors.text : '#bebebd' }}
                    key={index}
                  >
                    {`${part.trim()}`}{' '}
                  </Text>
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
            <Text style={styles.introText}>{typeInfo.description}</Text>
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
                color: theme.dark ? '#fff' : '#000',
                fontWeight: 'bold',
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

export default BlankChallenge;

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
      flex: 1,
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
      textAlign: 'left',
      color: '#cfcfce',
      fontSize: 22,
    },
    verseReference: {
      marginTop: 5,
      fontSize: 20,
      color: colors.text,
      fontWeight: 'bold',
      textAlign: 'left',
    },
  });
