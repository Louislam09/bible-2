import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface CircularProgressBarProps {
  size?: number;
  strokeWidth?: number;
  progress?: number;
  maxProgress?: number;
  color?: string;
  backgroundColor?: string;
  children?: React.ReactNode;
}

const CircularProgressBar: React.FC<CircularProgressBarProps> = ({
  size = 120,
  strokeWidth = 10,
  progress = 50,
  maxProgress = 100,
  color = '#3498db',
  backgroundColor = '#e0e0e0',
  children,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Animated value
  const animatedProgress = useRef(new Animated.Value(0)).current;

  // Effect to animate progress
  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 800, // Animation duration (ms)
      useNativeDriver: false,
    }).start();
  }, [progress]);

  // Interpolating progress into strokeDashoffset
  const strokeDashoffset = animatedProgress.interpolate({
    inputRange: [0, maxProgress],
    outputRange: [circumference, 0], // Inverted because strokeDashoffset works backward
  });

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill='none'
        />
        {/* Progress Circle with Animated Stroke */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill='none'
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap='round'
          rotation='-90'
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      {/* Text in the center */}
      <View style={[styles.textContainer, { width: size, height: size }]}>
        {children}
      </View>
    </View>
  );
};

// Animated version of the Circle component
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CircularProgressBar;
