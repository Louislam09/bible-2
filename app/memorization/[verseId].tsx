import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
// import { ProgressBar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import StatusBarBackground from '@/components/StatusBarBackground';
import { router, Stack, useRouter } from 'expo-router';
import CircularProgressBar from '@/components/CircularProgressBar';
import { useTheme } from '@react-navigation/native';
import ProgressBar from '@/components/home/footer/ProgressBar';
import { TTheme, MemorizationButtonType } from '@/types';
import Icon from '@/components/Icon';
import { useBibleContext } from '@/context/BibleContext';
import { databaseNames } from '@/constants/databaseNames';
import { icons } from 'lucide-react-native';
import isWithinTimeframe from '@/utils/isWithinTimeframe';
import { showToast } from '@/utils/showToast';
import useParams from '@/hooks/useParams';
import { formatDateShortDayMonth } from '@/utils/formatDateShortDayMonth';

type MemorizationScreenProps = {
  verse: string;
  version: string;
  progress: number;
  lastPracticed: Date;
  addedDate: Date;
};

type TButtonItem = {
  icon: keyof typeof icons;
  label: MemorizationButtonType;
  isTest?: boolean;
  action: (type: MemorizationButtonType) => void;
};

const MOCK_DATA = [
  {
    is_favorite: false,
    bookName: 'Proverbios',
    book_number: 240,
    chapter: 1,
    id: 7,
    text: 'El principio de<S>3374</S> <S>7225</S> <S>1847</S> la sabiduría es el temor de Jehová; Los<S>3068</S> insensatos desprecian<S>191</S> la sabiduría y<S>2451</S> <S>4148</S> la enseñanza.',
    verse: 7,
  },
  {
    is_favorite: false,
    bookName: 'Génesis',
    book_number: 10,
    chapter: 1,
    id: 6,
    text: 'En el principio<S>7225</S> creó<S>1254</S> Dios<S>430</S> los cielos<S>8064</S> y la tierra.<S>776</S> ',
    verse: 1,
  },
  {
    is_favorite: false,
    bookName: 'Salmos',
    book_number: 230,
    chapter: 100,
    id: 5,
    text: '«Salmo de<S>4210</S> alabanza.» * Cantad<S>8426</S> <S>7321</S> alegres a Dios, habitantes<S>3068</S> de toda la<S>3605</S> <S>776</S> tierra.',
    verse: 1,
  },
];

const MemorizationScreen = () => {
  const { verseId } = useParams();
  const item = MOCK_DATA.find((x) => x.id === verseId);
  const progress = Math.floor(Math.random() * 100);
  const lastPracticed = new Date();
  const addedDate = new Date('2025-01-30T13:45:57.911Z');

  const theme = useTheme();
  const styles = getStyles(theme);
  const router = useRouter();
  const { currentBibleVersion } = useBibleContext();
  const versionName = databaseNames.find((x) => x.id === currentBibleVersion);
  const { width } = useWindowDimensions();
  const buttonWidth = width / 3;

  const isTestLocked = progress < 80;

  const remainingTime = isWithinTimeframe('3d', new Date(addedDate));

  const onTestPress = () => {
    showToast('¡Desbloqueado con una puntuación de 80!', 'LONG');
  };

  const onActionButtonPress = (type: MemorizationButtonType) => {
    router.push(`memorization/${verseId}/challenge/${type}`);
  };

  const actionButtons: TButtonItem[] = [
    {
      icon: 'BookOpenText',
      label: MemorizationButtonType.Read,
      action: onActionButtonPress,
    },
    {
      icon: 'ListMinus',
      label: MemorizationButtonType.Blank,
      action: onActionButtonPress,
    },
    {
      icon: 'Fingerprint',
      label: MemorizationButtonType.Type,
      action: onActionButtonPress,
    },
    {
      icon: isTestLocked ? 'LockKeyhole' : 'CircleCheck',
      label: isTestLocked
        ? MemorizationButtonType.Locked
        : MemorizationButtonType.Test,
      isTest: isTestLocked,
      action: () => onTestPress(),
    },
  ];

  return (
    <ScrollView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerLeft: () => <View />,
          headerRight: () => (
            <Text style={styles.version}>{versionName?.shortName}</Text>
          ),
          headerTitle: () => (
            <View
              style={{ gap: 4, flexDirection: 'row', alignItems: 'center' }}
            >
              <Text
                style={styles.title}
              >{`${item?.bookName} ${item?.chapter}:${item?.verse}`}</Text>
            </View>
          ),
        }}
      />
      <View style={styles.container}>
        <View style={styles.progressCircle}>
          <CircularProgressBar
            size={150}
            strokeWidth={8}
            progress={progress}
            maxProgress={100}
            color={theme.colors.notification}
            backgroundColor={'#a29f9f'}
          >
            <Text style={[styles.progressText, { color: theme.colors.text }]}>
              {progress}
            </Text>
          </CircularProgressBar>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonGrid}>
          {actionButtons.map(({ icon, label, isTest, action }) => (
            <TouchableOpacity
              onPress={() => action(label)}
              key={icon}
              style={[
                styles.actionButton,
                { width: buttonWidth },
                isTest && { borderColor: '#fff' },
              ]}
            >
              <Icon
                name={icon}
                size={75}
                color={isTest ? '#fff' : theme.colors.notification}
              />
              <Text
                style={[
                  styles.actionLabel,
                  isTest && { color: theme.colors.text },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Practice Tracker */}
        <View style={styles.practiceContainer}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text style={styles.practiceTitle}>Practicado</Text>
            <Icon
              name='CircleCheck'
              size={24}
              color={theme.colors.notification}
            />
          </View>
          <Text style={styles.practiceTime}>
            {remainingTime.remainingTime} restantes
          </Text>

          <View style={{ marginVertical: 10 }}>
            <ProgressBar
              height={8}
              color={theme.colors.notification}
              barColor={theme.colors.text}
              progress={progress / 100}
              hideCircle
              circleColor={theme.colors.notification}
            />
          </View>
          <View style={styles.dateContainer}>
            <View>
              <Text style={[styles.dateText, { color: theme.colors.text }]}>
                {' '}
                Añadido{' '}
              </Text>
              <Text style={styles.dateText}>
                {' '}
                {formatDateShortDayMonth(addedDate.toDateString())}{' '}
              </Text>
            </View>
            <View>
              <Text style={[styles.dateText, { color: theme.colors.text }]}>
                Última práctica
              </Text>
              <Text style={styles.dateText}>
                {formatDateShortDayMonth(lastPracticed.toDateString())}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#121212',
      padding: 16,
      paddingTop: 0,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      fontSize: 22,
      color: colors.text,
      fontWeight: 'bold',
    },
    version: { fontSize: 16, color: '#B0BEC5' },
    progressCircle: {
      alignItems: 'center',
      marginVertical: 20,
    },
    progressText: {
      fontSize: 40,
      color: colors.notification,
    },
    buttonGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 30,
      marginVertical: 20,
    },
    actionButton: {
      width: 140,
      height: 150,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      borderRadius: 25,
      borderColor: colors.notification,
      borderWidth: 2,
    },
    actionLabel: { color: colors.notification, marginTop: 8, fontSize: 20 },
    practiceContainer: {
      backgroundColor: '#1E1E1E',
      padding: 16,
      borderRadius: 12,
      marginTop: 20,
    },
    practiceTitle: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
    },
    practiceTime: { color: '#B0BEC5', fontSize: 16 },
    progressBar: { height: 6, borderRadius: 5, marginVertical: 8 },
    dateContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 10,
    },
    dateText: { color: '#B0BEC5', fontSize: 14 },
  });

export default MemorizationScreen;
