import React from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';

interface StreakCardProps {
  visible: boolean;
  streak: number;
  bestStreak: number;
  days: { label: string; date: string; active: boolean }[];
  onClose: () => void;
}

const StreakCard: React.FC<StreakCardProps> = ({
  visible,
  streak,
  bestStreak,
  days,
}) => {
  return (
    <Modal transparent visible={visible} animationType='fade'>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>You have a streak of {streak} days!</Text>
          <Text style={styles.subtitle}>Best: {bestStreak} days</Text>
          <View style={styles.daysContainer}>
            {days.map((day, index) => (
              <View
                key={index}
                style={[styles.day, day.active && styles.activeDay]}
              >
                <Text
                  style={[styles.dayLabel, day.active && styles.activeText]}
                >
                  {day.label}
                </Text>
                <Text style={[styles.dayDate, day.active && styles.activeText]}>
                  {day.date}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  card: {
    backgroundColor: '#222',
    padding: 20,
    borderRadius: 10,
    width: 300,
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 10,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  day: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#333',
    width: 50,
  },
  activeDay: {
    backgroundColor: '#4CAF50',
  },
  dayLabel: {
    color: '#ccc',
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeText: {
    color: '#fff',
  },
  dayDate: {
    color: '#bbb',
    fontSize: 12,
  },
});

export default StreakCard;
