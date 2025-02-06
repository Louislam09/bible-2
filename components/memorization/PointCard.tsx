import { TTheme } from '@/types';
import { useTheme } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from '../Themed';

type PointsCardProps = {
  typeInfo: TPoints;
};

type TPoints = {
  point: number;
  maxPoint: number;
  description: string;
};

const PointsCard = ({ typeInfo }: PointsCardProps) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { description, maxPoint, point } = typeInfo;

  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <View style={styles.pointsContainer}>
          <Text style={styles.points}>
            <Text style={styles.bold}>{point}</Text>
            {'\n'}Puntos
          </Text>
          <Text style={styles.points}>
            <Text style={styles.bold}>{maxPoint}</Text>
            {'\n'}Tope de Puntos
          </Text>
        </View>
        <TouchableOpacity>
          <Text style={styles.tapText}>{description}</Text>
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
