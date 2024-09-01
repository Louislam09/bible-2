import React, { useState, useRef, useEffect } from "react";
import { View, PanResponder, Animated, Text, StyleSheet } from "react-native";

interface CustomSliderProps {
  options: string[];
  initialValue?: string;
  onChange?: (value: string) => void;
  width?: number;
  activeColor?: string;
  inactiveColor?: string;
  textColor?: string;
}

const CustomSlider: React.FC<CustomSliderProps> = ({
  options,
  initialValue,
  onChange,
  width = 300,
  activeColor = "#3498db",
  inactiveColor = "#bdc3c7",
  textColor = "#2c3e50",
}) => {
  const [value, setValue] = useState(initialValue || options[0]);
  const pan = useRef(new Animated.ValueXY()).current;
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const index = options.indexOf(value);
    const percentage = index / (options.length - 1);
    progress.setValue(percentage);
    pan.x.setValue(percentage * width);
  }, [value, options, width]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      const newX = Math.max(0, Math.min(gestureState.moveX, width));
      pan.x.setValue(newX);
      const percentage = newX / width;
      progress.setValue(percentage);
    },
    onPanResponderRelease: (_, gestureState) => {
      const percentage = gestureState.moveX / width;
      let index = options.indexOf(value);

      const threshold = 0.05; // Threshold for triggering a snap to the next or previous value

      if (percentage > index / (options.length - 1) + threshold) {
        index = Math.min(index + 1, options.length - 1);
      } else if (percentage < index / (options.length - 1) - threshold) {
        index = Math.max(index - 1, 0);
      }

      const snapX = (index / (options.length - 1)) * width;

      Animated.spring(pan.x, {
        toValue: snapX,
        useNativeDriver: false,
      }).start();

      const newValue = options[index];
      setValue(newValue);
      onChange && onChange(newValue);
    },
  });

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={[styles.container, { width: "100%" }]}>
      <View style={[styles.track, { backgroundColor: inactiveColor }]}>
        <Animated.View
          style={[
            styles.fill,
            { width: progressWidth, backgroundColor: activeColor },
          ]}
        />
      </View>
      <Animated.View
        style={[styles.thumb, { transform: [{ translateX: pan.x }] }]}
        {...panResponder.panHandlers}
      />
      <View style={styles.labelContainer}>
        {options.map((option, index) => (
          <Text key={index} style={[styles.label, { color: textColor }]}>
            {option}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    padding: 10,
  },
  track: {
    height: 4,
    borderRadius: 2,
    position: "absolute",
    left: 0,
    right: 0,
    top: 18,
  },
  fill: {
    height: "100%",
    borderRadius: 2,
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "white",
    position: "absolute",
    top: 10,
    marginLeft: -10,
    borderWidth: 2,
    borderColor: "#3498db",
  },
  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    left: 0,
    right: 0,
    top: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default CustomSlider;
