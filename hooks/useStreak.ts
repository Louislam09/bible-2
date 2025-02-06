import { useState, useEffect } from 'react';
import {
  GET_STREAKS,
  UPDATE_STREAK,
  DELETE_ALL_STEAKS,
  GET_STREAK,
} from '@/constants/Queries';
import { showToast } from '@/utils/showToast';
import { useDBContext } from '@/context/databaseContext';

type StreakDay = { label: string; date: string; active: boolean };

type Streak = {
  streak: number;
  bestStreak: number;
  days: StreakDay[];
  updateStreak: () => Promise<void>;
  deleteAllStreaks: () => Promise<void>;
  refreshStreak: () => Promise<void>;
};

export const useStreak = (): Streak => {
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
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
      const streakData = data;
      if (streakData.length > 0) {
        const lastDate = new Date(streakData[0].date);
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

        setStreak(streakData[0].streak);
        setBestStreak(streakData[0].bestStreak);
        setDays(
          streakData.map(({ date }, index) => ({
            label: new Date(date).toUTCString().split(', ')[0],
            date,
            active: index < streak,
          }))
        );
      }
    } catch (error) {
      console.warn('Error refreshing streak:', error);
    }
  };

  const updateStreak = async () => {
    const today = new Date().toISOString().split('T')[0];

    try {
      if (!myBibleDB || !executeSql) return;
      let values = null;
      const streaks = await executeSql(myBibleDB, GET_STREAK, []);

      if (streaks.length > 0) {
        const lastDate = new Date(streaks[0].date);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (
          lastDate.toISOString().split('T')[0] ===
          yesterday.toISOString().split('T')[0]
        ) {
          values = [today, streak + 1, Math.max(bestStreak, streak + 1)];
        } else {
          values = [today, 1, Math.max(bestStreak, 1)];
        }
      } else {
        values = [today, 1, 1];
      }

      if (streaks.length > 0) {
        const lastDate = new Date(streaks[0].date);
        const isAnotherDay = lastDate.toISOString().split('T')[0] !== today;
        if (isAnotherDay) {
          await executeSql(myBibleDB, UPDATE_STREAK, values);
          await refreshStreak();
          showToast('¡Racha actualizada con éxito!');
        }
      } else {
        await executeSql(myBibleDB, UPDATE_STREAK, values);
        await refreshStreak();
        showToast('¡Racha actualizada con éxito!');
      }
    } catch (error) {
      console.warn('Error updating streak:', error);
    }
  };

  const deleteAllStreaks = async () => {
    try {
      if (!myBibleDB || !executeSql) return;
      await executeSql(myBibleDB, DELETE_ALL_STEAKS, []);
      refreshStreak();
      showToast('¡Racha reiniciada con éxito!');
    } catch (error) {
      console.warn('Error resetting streak:', error);
    }
  };

  return {
    streak,
    bestStreak,
    days,
    updateStreak,
    deleteAllStreaks,
    refreshStreak,
  };
};
