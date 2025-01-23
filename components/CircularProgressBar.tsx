import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { ReactNode } from 'react';

interface CircularProgressBarProps {
    size?: number;
    strokeWidth?: number;
    progress?: number;
    maxProgress?: number;
    color?: string;
    backgroundColor?: string;
    children?: ReactNode;
}

const CircularProgressBar: React.FC<CircularProgressBarProps> = ({
    size = 120,
    strokeWidth = 10,
    progress = 50,
    maxProgress = 100,
    color = '#3498db',
    backgroundColor = '#e0e0e0',
    children
}) => {
    const radius = (size - strokeWidth) / 2; // Radius of the circle
    const circumference = 2 * Math.PI * radius; // Circumference of the circle
    const progressValue = (progress / maxProgress) * circumference; // Progress in the circle

    return (
        <View style={styles.container}>
            <Svg width={size} height={size}>
                {/* Background Circle */}
                <Circle
                    cx={size / 2} // Center x
                    cy={size / 2} // Center y
                    r={radius} // Radius
                    stroke={backgroundColor} // Background color
                    strokeWidth={strokeWidth} // Thickness of the background
                    fill="none" // Transparent fill
                />
                {/* Progress Circle */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color} // Progress color
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference} // Dashed pattern for the circle
                    strokeDashoffset={circumference - progressValue} // Offset for the progress
                    strokeLinecap="round" // Round the ends of the progress line
                    rotation="-90" // Rotate to start progress from the top
                    origin={`${size / 2}, ${size / 2}`} // Center the rotation
                />
            </Svg>
            {/* Text in the center */}
            <View style={[styles.textContainer, { width: size, height: size }]}>
                {children}
            </View>
        </View>
    );
};

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
