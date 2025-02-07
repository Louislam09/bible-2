import { TTheme } from '@/types';
import { useTheme } from '@react-navigation/native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Text, View } from '../Themed';

type StreakDay = { label: string; date: string; active: boolean; id: number };

interface StreakCardProps {
  streak: number;
  bestStreak: number;
  days: StreakDay[];
}

const mockDates = [
  {
    label: 'Sat',
    date: '2025-02-01',
    active: true,
  },
  {
    label: 'Mon',
    date: '2025-02-03',
    active: true,
  },
  {
    label: 'Wed',
    date: '2025-02-05',
    active: true,
  },
  {
    label: 'Thu',
    date: '2025-02-06',
    active: true,
  },
];

const generateDateRange = (startDate: string, days: StreakDay[]) => {
  const dates = [];
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 1);
  const currentDate = new Date(startDate);
  const end = new Date(endDate);
  const storedStreakDates = days.map((streak) => streak.date);

  while (currentDate <= end) {
    const date = currentDate.toISOString().split('T')[0];
    dates.push({
      label: currentDate.toUTCString().split(', ')[0],
      date: date,
      active: storedStreakDates.includes(date),
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

const weekdayShorts: { [key: string]: string } = {
  Mon: 'Lun',
  Tue: 'Mar',
  Wed: 'Mié',
  Thu: 'Jue',
  Fri: 'Vie',
  Sat: 'Sáb',
  Sun: 'Dom',
};

const StreakCard: React.FC<StreakCardProps> = ({
  streak,
  bestStreak,
  days = [],
}) => {
  const theme = useTheme();
  const steakListRef = useRef<FlashList<any>>(null);
  const [isLayoutMounted, setLayoutMounted] = useState(false);
  const styles = getStyles(theme);
  const startDate = '2025-02-01';
  const dayDatas = useMemo(
    () => generateDateRange(startDate, days.reverse()),
    [days]
  );

  const RenderItem: ListRenderItem<StreakDay> = ({
    item: { active, date, label },
  }) => (
    <View style={[styles.dayContainer]}>
      <View style={[styles.dayCircle, active && styles.dayActive]}>
        <Text style={[styles.dayLabel, active && styles.activeText]}>
          {weekdayShorts[label].charAt(0)}
        </Text>
      </View>
      <View style={styles.dateContainer}>
        <Text style={[styles.dayDate, active && styles.activeText]}>
          {date.split('-')[2]}
        </Text>
        <Text style={[styles.dayDate, active && styles.activeText]}>
          {new Date(date).toUTCString().split(' ')[2]}
        </Text>
      </View>
    </View>
  );

  useEffect(() => {
    if (steakListRef.current && isLayoutMounted) {
      setTimeout(() => {
        steakListRef.current?.scrollToIndex({
          index: dayDatas.length - 1,
          // index: dayDatas.findIndex((x) => x.date === days[0].date),
          animated: true,
          viewPosition: 0.5,
        });
      }, 500);
    }
  }, [steakListRef.current, isLayoutMounted]);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>¡Tienes una racha de {streak} días!</Text>
      <Text style={styles.subtitle}>Mejor: {bestStreak} días</Text>
      <View style={styles.daysContainer}>
        <FlashList
          ref={steakListRef}
          data={dayDatas}
          onLayout={() => setLayoutMounted(true)}
          decelerationRate='normal'
          horizontal
          estimatedItemSize={60}
          renderItem={RenderItem as any}
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
      marginHorizontal: 10,
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
