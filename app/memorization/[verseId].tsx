import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import CircularProgressBar from '@/components/CircularProgressBar';
import ProgressBar from '@/components/home/footer/ProgressBar';
import Icon from '@/components/Icon';
import { databaseNames } from '@/constants/databaseNames';
import { headerIconSize } from '@/constants/size';
import { useMemorization } from '@/context/MemorizationContext';
import useDebounce from '@/hooks/useDebounce';
import useParams from '@/hooks/useParams';
import { Memorization, MemorizationButtonType, TTheme } from '@/types';
import { formatDateShortDayMonth } from '@/utils/formatDateShortDayMonth';
import isWithinTimeframe from '@/utils/isWithinTimeframe';
import { showToast } from '@/utils/showToast';
import { useTheme } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { ChevronLeft, icons } from 'lucide-react-native';
import { Text, View } from '@/components/Themed';
import PracticeTracker from '@/components/memorization/PracticeTracker';

type TButtonItem = {
  icon: keyof typeof icons;
  label: MemorizationButtonType;
  isLock?: boolean;
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
  const memorizeProgress = useDebounce(item.progress, 1000);

  const isTestLocked = item.progress < 80;

  const currentTimeStat = isWithinTimeframe(
    '3d',
    new Date(item?.lastPracticed || 0)
  );

  const onActionButtonPress = (type: MemorizationButtonType) => {
    if (type === MemorizationButtonType.Locked) {
      showToast('Necesitas 80% de progreso para desbloquear.', 'LONG');
      return;
    }
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
      isLock: isTestLocked,
      action: onActionButtonPress,
    },
  ];

  const iconColor = theme.dark ? '#fff' : '#000';
  const isCompleted = memorizeProgress === 100;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
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
              style={{
                gap: 4,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'transparent',
              }}
            >
              <Text style={styles.title}>{item.verse}</Text>
            </View>
          ),
        }}
      />
      <View style={styles.container}>
        <View style={styles.progressCircle}>
          <CircularProgressBar
            size={150}
            strokeWidth={8}
            progress={memorizeProgress}
            maxProgress={100}
            color={isCompleted ? '#1ce265' : theme.colors.notification}
            backgroundColor={theme.colors.text + 70}
          >
            <Text style={[styles.progressText]}>{memorizeProgress}</Text>
          </CircularProgressBar>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonGrid}>
          {actionButtons.map(({ icon, label, isLock, action }) => {
            const lockTextKey = isLock
              ? 'isLockLabelText'
              : 'isUnlockLabelText';
            const lockBorderKey = isLock ? 'isLockButton' : 'isUnlockButton';
            const isLockButton = isLock !== undefined;
            const lockIconColor = isLockButton
              ? isCompleted
                ? '#1ce265'
                : theme.colors.notification
              : theme.colors.text;

            return (
              <TouchableOpacity
                onPress={() => action(label)}
                key={icon}
                style={[
                  styles.actionButton,
                  isLockButton && styles[lockBorderKey],
                  isLockButton && isCompleted && styles.isCompletedButton,
                ]}
              >
                <Icon
                  name={icon}
                  size={75}
                  color={isLock ? iconColor : lockIconColor}
                />
                <Text
                  style={[
                    styles.actionLabel,
                    isLockButton && styles[lockTextKey],
                    isLockButton && isCompleted && styles.isCompletedLabelText,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Practice Tracker */}
        <PracticeTracker currentTimeStat={currentTimeStat} item={item} />
        {/* <View style={styles.practiceContainer}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'transparent',
            }}
          >
            <Text style={styles.practiceTitle}>Practicado</Text>
            <Icon
              name='CircleCheck'
              size={24}
              color={isCompleted ? '#1ce265' : theme.colors.notification}
            />
          </View>
          {currentTimeStat.remainingDate && (
            <Text style={styles.practiceTime}>
              {currentTimeStat.remainingDate} restantes
            </Text>
          )}

          <View style={{ marginVertical: 10 }}>
            <ProgressBar
              height={8}
              color={isCompleted ? '#1ce265' : theme.colors.notification}
              barColor={theme.colors.text}
              progress={(currentTimeStat.progress || 0) / 100}
              hideCircle
              circleColor={theme.colors.notification}
            />
          </View>
          <View style={styles.dateContainer}>
            <View style={{ backgroundColor: 'transparent' }}>
              <Text style={[styles.dateText, { color: theme.colors.text }]}>
                {' '}
                Añadido{' '}
              </Text>
              <Text style={styles.dateSubText}>
                {' '}
                {formatDateShortDayMonth(item?.addedDate || '')}{' '}
              </Text>
            </View>

            <View style={{ backgroundColor: 'transparent' }}>
              <Text style={[styles.dateText, { color: theme.colors.text }]}>
                Última práctica
              </Text>
              <Text style={styles.dateSubText}>
                {formatDateShortDayMonth(item?.lastPracticed || '')}
              </Text>
            </View>
          </View>
        </View> */}
      </View>
    </ScrollView>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      // backgroundColor: colors.text + 20,
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
      backgroundColor: 'transparent',
    },
    progressText: {
      fontSize: 60,
      color: colors.text,
    },
    buttonGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 30,
      marginVertical: 20,
      backgroundColor: 'transparent',
    },
    actionButton: {
      width: 140,
      height: 150,
      alignItems: 'center',
      justifyContent: 'center',
      // padding: 16,
      borderRadius: 25,
      borderColor: colors.text,
      borderWidth: 2,
    },
    isCompletedButton: {
      borderColor: '#1ce265',
    },
    isLockButton: {
      borderColor: dark ? '#fff' : '#000',
    },
    isUnlockButton: {
      borderColor: colors.notification,
    },
    actionLabel: {
      color: colors.text,
      marginTop: 8,
      fontSize: 20,
    },
    isCompletedLabelText: {
      color: '#1ce265',
      marginTop: 8,
      fontSize: 20,
    },
    isLockLabelText: {
      color: dark ? '#fff' : '#000',
      marginTop: 8,
      fontSize: 20,
    },
    isUnlockLabelText: {
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
      backgroundColor: 'transparent',
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
