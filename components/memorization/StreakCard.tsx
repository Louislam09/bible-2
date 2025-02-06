import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Text, View } from '../Themed';
import { useTheme } from '@react-navigation/native';
import { TTheme } from '@/types';
import { FlashList, ListRenderItem } from '@shopify/flash-list';

type StreakDay = { label: string; date: string; active: boolean };

interface StreakCardProps {
  streak: number;
  bestStreak: number;
  days: StreakDay[];
}

// const mockStreakData: StreakCardProps = {
//   streak: 5,
//   bestStreak: 10,
//   days: Array.from({ length: 19 }, (_, i) => {
//     let date = Date.now() - i * 86400000;
//     return {
//       label: new Date(date)
//         .toLocaleDateString('es-ES', { weekday: 'short' })
//         .charAt(0),
//       date: new Date(date).toISOString().split('T')[0], // Generates past dates
//       active: Math.random() > 0.5, // Randomly marks some as active
//     };
//   }).reverse(),
// };

const StreakCard: React.FC<StreakCardProps> = ({
  streak,
  bestStreak,
  days = [],
}) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStreak = {
    label: tomorrow.toLocaleDateString('es-ES', { weekday: 'short' }).charAt(0),
    date: tomorrow.toISOString().split('T')[0],
    active: false,
  };

  const RenderItem: ListRenderItem<StreakDay> = ({
    item: { active, date, label },
  }) => (
    <View style={[styles.dayContainer]}>
      <View style={[styles.dayCircle, active && styles.dayActive]}>
        <Text style={[styles.dayLabel, active && styles.activeText]}>
          {label}
        </Text>
      </View>
      <View style={styles.dateContainer}>
        <Text style={[styles.dayDate, active && styles.activeText]}>
          {new Date(date).getDate()}
        </Text>
        <Text style={[styles.dayDate, active && styles.activeText]}>
          {new Date(date)
            .toLocaleDateString('es-ES', { month: 'short' })
            .toUpperCase()
            .replace('.', '')}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.card}>
      <Text style={styles.title}>¡Tienes una racha de {streak} días!</Text>
      <Text style={styles.subtitle}>Mejor: {bestStreak} días</Text>
      <View style={styles.daysContainer}>
        <FlashList
          horizontal
          estimatedItemSize={135}
          renderItem={RenderItem as any}
          data={[...days.reverse(), tomorrowStreak]}
          keyExtractor={(item: any, index: any) => `streak-${index}`}
        />
      </View>
    </View>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: colors.background,
      paddingVertical: 25,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      color: colors.text,
      fontSize: 18,
      fontWeight: 'bold',
    },
    subtitle: {
      color: colors.text,
      opacity: 0.8,
      fontSize: 14,
      marginBottom: 10,
    },
    daysContainer: {
      flexDirection: 'row',
      width: '100%',
    },
    dayContainer: {
      alignItems: 'center',
      marginHorizontal: 15,
    },
    dayCircle: {
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
      marginBottom: 10,
      borderColor: colors.text + 40,
      borderWidth: 4,
    },
    dayActive: {
      backgroundColor: '#4CAF50',
      borderColor: '#4CAF50',
    },
    dayLabel: {
      textTransform: 'uppercase',
      color: colors.text,
      fontSize: 18,
      fontWeight: 'bold',
    },
    activeText: {
      color: '#fff',
    },
    dateContainer: {
      alignItems: 'center',
    },
    dayDate: {
      color: colors.text,
      fontSize: 16,
    },
  });

export default StreakCard;
