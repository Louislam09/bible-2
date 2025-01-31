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
import { TTheme, MemorizationButtonType, Memorization } from '@/types';
import Icon from '@/components/Icon';
import { useBibleContext } from '@/context/BibleContext';
import { databaseNames } from '@/constants/databaseNames';
import { ChevronLeft, icons } from 'lucide-react-native';
import isWithinTimeframe from '@/utils/isWithinTimeframe';
import { showToast } from '@/utils/showToast';
import useParams from '@/hooks/useParams';
import { formatDateShortDayMonth } from '@/utils/formatDateShortDayMonth';
import { useMemorization } from '@/context/MemorizationContext';
import { headerIconSize } from '@/constants/size';

type TButtonItem = {
  icon: keyof typeof icons;
  label: MemorizationButtonType;
  isTest?: boolean;
  action: (type: MemorizationButtonType) => void;
};

const MemorizationScreen = () => {
  const { verseId } = useParams();
  const { verses } = useMemorization();
  const item = verses.find((x) => x.id === verseId) as Memorization;

  const theme = useTheme();
  const styles = getStyles(theme);
  const router = useRouter();
  const versionName = databaseNames.find((x) => x.id === item.version);
  const { width } = useWindowDimensions();
  // const buttonWidth = width / 2.8;

  const isTestLocked = item.progress < 80;

  const currentTimeStat = isWithinTimeframe(
    '3d',
    new Date(item?.addedDate || 0)
  );

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
          headerBackVisible: false,
          headerLeft: () => (
            <ChevronLeft
              color={theme.colors.text}
              size={headerIconSize}
              onPress={() => router.back()}
            />
          ),
          headerRight: () => (
            <Text style={styles.version}>{versionName?.shortName}</Text>
          ),
          headerTitle: () => (
            <View
              style={{ gap: 4, flexDirection: 'row', alignItems: 'center' }}
            >
              <Text style={styles.title}>{item?.verse}</Text>
            </View>
          ),
        }}
      />
      <View style={styles.container}>
        <View style={styles.progressCircle}>
          <CircularProgressBar
            size={150}
            strokeWidth={8}
            progress={item.progress}
            maxProgress={100}
            color={theme.colors.notification}
            backgroundColor={'#a29f9f'}
          >
            <Text style={[styles.progressText, { color: theme.colors.text }]}>
              {item.progress}
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
                // { width: buttonWidth },
                isTest && { borderColor: theme.colors.text },
              ]}
            >
              <Icon
                name={icon}
                size={75}
                color={isTest ? theme.colors.text : theme.colors.notification}
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
            {currentTimeStat.remainingDate} restantes
          </Text>

          <View style={{ marginVertical: 10 }}>
            <ProgressBar
              height={8}
              color={theme.colors.notification}
              barColor={theme.colors.text}
              progress={10 / 100}
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
              <Text style={styles.dateSubText}>
                {' '}
                {formatDateShortDayMonth(item?.addedDate || '')}{' '}
              </Text>
            </View>
            <View>
              <Text style={[styles.dateText, { color: theme.colors.text }]}>
                Última práctica
              </Text>
              <Text style={styles.dateSubText}>
                {formatDateShortDayMonth(item?.lastPracticed || '')}
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
      // backgroundColor: '#121212',
      backgroundColor: colors.text + 20,
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
    version: {
      fontSize: 16,
      color: colors.text,
    },
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
    actionLabel: {
      color: colors.notification,
      marginTop: 8,
      fontSize: 20,
    },
    practiceContainer: {
      backgroundColor: colors.text + 20,
      padding: 16,
      borderRadius: 12,
      marginTop: 20,
      borderColor: dark ? colors.text : colors.notification,
      borderWidth: 2,
    },
    practiceTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: 'bold',
    },
    practiceTime: {
      color: colors.text,
      fontSize: 16,
    },
    progressBar: {
      height: 6,
      borderRadius: 5,
      marginVertical: 8,
    },
    dateContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 10,
    },
    dateText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: 'bold',
    },
    dateSubText: {
      color: colors.text,
      fontSize: 14,
    },
  });

export default MemorizationScreen;
