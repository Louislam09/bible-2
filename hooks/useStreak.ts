import { useState, useEffect } from 'react';
import { GET_STREAKS, UPDATE_STREAK, RESET_STREAK } from '@/constants/Queries';
import { showToast } from '@/utils/showToast';
import { useDBContext } from '@/context/databaseContext';

type Streak = {
  currentStreak: number;
  lastPracticed: number;
  bestStreak: number;
  days: { label: string; date: string; active: boolean }[];
};

export const useStreak = () => {
  const [streak, setStreak] = useState<Streak | null>(null);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [days, setDays] = useState<
    { label: string; date: string; active: boolean }[]
  >([]);
  const { myBibleDB, executeSql } = useDBContext();

  useEffect(() => {
    if (!myBibleDB || !executeSql) return;
    refreshStreak();
  }, [myBibleDB, executeSql]);

  const refreshStreak = async () => {
    try {
      if (!myBibleDB || !executeSql) return;
      const data = await executeSql(myBibleDB, GET_STREAKS, []);
      const streakData = data[0];
      if (streakData.length > 0) {
        const lastDate = new Date(streakData.date);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const today = new Date().toISOString().split('T')[0];

        if (lastDate.toISOString().split('T')[0] !== today) {
          if (
            lastDate.toISOString().split('T')[0] !==
            yesterday.toISOString().split('T')[0]
          ) {
            setStreak(0);
          }
        }

        setStreak(streakData.streak);
        setBestStreak(streakData.bestStreak);
        setDays(
          streakData.map(({ date }, index) => ({
            label: new Date(date)
              .toLocaleDateString('en-US', { weekday: 'short' })
              .charAt(0),
            date,
            active: index < streakData.streak,
          }))
        );
      }
    } catch (error) {
      console.warn('Error refreshing streak:', error);
    }
  };

  const updateStreak = async (currentStreak: number) => {
    const timestamp = Date.now();
    try {
      if (!myBibleDB || !executeSql) return;
      const values = [currentStreak, timestamp];
      await executeSql(myBibleDB, UPDATE_STREAK, values);
      refreshStreak();
      showToast('Streak updated successfully!');
    } catch (error) {
      console.warn('Error updating streak:', error);
    }
  };

  const resetStreak = async () => {
    try {
      if (!myBibleDB || !executeSql) return;
      await executeSql(myBibleDB, RESET_STREAK, []);
      refreshStreak();
      showToast('Streak reset successfully!');
    } catch (error) {
      console.warn('Error resetting streak:', error);
    }
  };

  return {
    streak,
    bestStreak,
    days,
    updateStreak,
    resetStreak,
    refreshStreak,
  };
};
