import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from '../Themed';
import { TTheme } from '@/types';
import { useTheme } from '@react-navigation/native';

const PointsCard = () => {
  const theme = useTheme();
  const styles = getStyles(theme);
  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <View style={styles.pointsContainer}>
          <Text style={styles.points}>
            <Text style={styles.bold}>5</Text>
            {'\n'}Puntos
          </Text>
          <Text style={styles.points}>
            <Text style={styles.bold}>20</Text>
            {'\n'}Max Puntos
          </Text>
        </View>
        <TouchableOpacity>
          <Text style={styles.tapText}>
            Toca para revelar el versículo por sección
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.background,
      borderRadius: 12,
      paddingVertical: 20,
      margin: 16,
    },
    content: {
      backgroundColor: colors.background,
      alignItems: 'center',
      //   borderColor: 'red',
      //   borderWidth: 1,
      //   paddingHorizontal: 20,
    },
    pointsContainer: {
      backgroundColor: colors.background,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      marginBottom: 12,
    },
    points: {
      backgroundColor: colors.background,
      color: colors.text,
      fontSize: 18,
      textAlign: 'center',
      marginHorizontal: 20,
    },
    bold: {
      fontWeight: 'bold',
      fontSize: 24,
    },
    tapText: {
      color: colors.text,
      fontSize: 15,
      textAlign: 'center',
      marginBottom: 8,
    },
    footer: {
      color: colors.text,
      fontSize: 12,
    },
    link: {
      color: '#66A3FF',
      textDecorationLine: 'underline',
    },
  });

export default PointsCard;
