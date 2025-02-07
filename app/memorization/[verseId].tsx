import Animation from '@/components/Animation';
import CircularProgressBar from '@/components/CircularProgressBar';
import CofettiAnimation from '@/components/CofettiAnimation';
import Icon from '@/components/Icon';
import ScreenWithAnimation from '@/components/LottieTransitionScreen';
import PracticeTracker from '@/components/memorization/PracticeTracker';
import { Text, View } from '@/components/Themed';
import { databaseNames } from '@/constants/databaseNames';
import { headerIconSize } from '@/constants/size';
import { useMemorization } from '@/context/MemorizationContext';
import useDebounce from '@/hooks/useDebounce';
import useParams from '@/hooks/useParams';
import { Memorization, MemorizationButtonType, TTheme } from '@/types';
import isWithinTimeframe from '@/utils/isWithinTimeframe';
import { showToast } from '@/utils/showToast';
import { useTheme } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { Brain, ChevronLeft, icons, Trash2 } from 'lucide-react-native';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

type TButtonItem = {
  icon: keyof typeof icons;
  label: MemorizationButtonType;
  isLock?: boolean;
  action: (type: MemorizationButtonType) => void;
};

const MemorizationScreen = () => {
  const { verseId } = useParams();
  const { verses, deleteVerse } = useMemorization();
  const item = verses.find((x) => x.id === verseId) as Memorization;
  if (!item) return <ActivityIndicator />;
  const theme = useTheme();
  const styles = getStyles(theme);
  const router = useRouter();
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

  const onDelete = async (id: number) => {
    await deleteVerse(id);
    router.back();
  };

  const warnBeforeDelete = (id: number) => {
    Alert.alert(
      `Eliminar ${item.verse}`,
      '¿Estás seguro que quieres eliminar este versículo?',
      [
        {
          text: 'Cancelar',
          onPress: () => {},
          style: 'cancel',
        },
        { text: 'Eliminar', onPress: () => onDelete(id) },
      ]
    );
  };

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
            <TouchableOpacity onPress={() => console.log(item.id)}>
              <Brain color={theme.colors.notification} size={headerIconSize} />
            </TouchableOpacity>
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
          {isCompleted && <CofettiAnimation />}
          <CircularProgressBar
            size={150}
            strokeWidth={8}
            progress={memorizeProgress}
            maxProgress={100}
            color={isCompleted ? '#1ce265' : theme.colors.notification}
            backgroundColor={theme.colors.text + 70}
            animationDuration={1000}
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
                {isLockButton && isCompleted && <CofettiAnimation />}
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
      </View>
    </ScrollView>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      zIndex: 99,
      // backgroundColor: colors.text + 20,
      backgroundColor: 'transparent',
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
