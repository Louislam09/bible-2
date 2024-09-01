import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  PanResponder,
  Animated,
  Text,
  StyleSheet,
  LayoutChangeEvent,
} from "react-native";

interface CustomSliderProps {
  options: any[];
  initialValue?: any;
  onChange?: (value: any) => void;
  activeColor?: string;
  inactiveColor?: string;
  textColor?: string;
}

const useSlider = (
  options: string[],
  initialValue: string | undefined,
  width: number,
  onChange?: (value: string) => void
) => {
  const [value, setValue] = useState(initialValue || options[0]);
  const pan = useRef(new Animated.ValueXY()).current;
  const progress = useRef(new Animated.Value(0)).current;
  const optionWidth = width / (options.length - 1);

  useEffect(() => {
    const index = options.indexOf(value);
    const percentage = index / (options.length - 1);
    progress.setValue(percentage);
    pan.x.setValue(index * optionWidth); // Use the calculated option width for positioning
  }, [value, options, width]);

  const snapToClosestOption = useCallback(
    (gestureX: number) => {
      const index = Math.round(gestureX / optionWidth); // Calculate the closest index
      const snapX = index * optionWidth; // Snap to the exact position of the index

      Animated.spring(pan.x, {
        toValue: snapX,
        useNativeDriver: false,
      }).start();

      const newValue = options[index];
      setValue(newValue);
      if (onChange) {
        progress.setValue(snapX / width);
        onChange(newValue);
      }
    },
    [options, optionWidth, pan.x, onChange]
  );

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      const newX = Math.max(0, Math.min(gestureState.moveX, width));
      pan.x.setValue(newX);
      const percentage = newX / width;
      progress.setValue(percentage);
    },
    onPanResponderRelease: (_, gestureState) => {
      snapToClosestOption(gestureState.moveX);
    },
  });

  return { panResponder, pan, progress, value };
};

const CustomSlider: React.FC<CustomSliderProps> = ({
  options,
  initialValue,
  onChange,
  activeColor = "#3498db",
  inactiveColor = "#bdc3c7",
  textColor = "#2c3e50",
}) => {
  const [sliderWidth, setSliderWidth] = useState(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setSliderWidth(width);
  };

  const { panResponder, pan, progress } = useSlider(
    options,
    initialValue,
    sliderWidth,
    onChange
  );

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={[styles.container]} onLayout={handleLayout}>
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
          <Text
            key={index}
            style={[
              styles.label,
              {
                color: textColor,
                textAlign: "center",
              },
            ]}
          >
            {option}x
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
    width: "100%",
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
    width: 25,
    height: 25,
    borderRadius: 15,
    backgroundColor: "white",
    position: "absolute",
    top: 8,
    marginLeft: -5,
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
