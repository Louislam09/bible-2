import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  ViewStyle,
  TextStyle,
} from "react-native";

const { width } = Dimensions.get("window");

interface AnimatedPickerProps {
  options: string[];
  onValueChange: (value: string) => void;
  initialValue?: string;
  style?: ViewStyle;
}

interface Styles {
  container: ViewStyle;
  selectedOption: ViewStyle;
  selectedOptionText: TextStyle;
  optionsContainer: ViewStyle;
  option: ViewStyle;
  optionText: TextStyle;
}

const AnimatedPicker: React.FC<AnimatedPickerProps> = ({
  options,
  onValueChange,
  initialValue,
  style,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedValue, setSelectedValue] = useState<string>(
    initialValue || options[0]
  );
  const animation = useRef(new Animated.Value(0)).current;

  const togglePicker = (): void => {
    const toValue = isOpen ? 0 : 1;
    setIsOpen(!isOpen);
    Animated.spring(animation, {
      toValue,
      useNativeDriver: true,
    }).start();
  };

  const handleSelect = (value: string): void => {
    setSelectedValue(value);
    onValueChange(value);
    togglePicker();
  };

  const pickerHeight = options.length * 50;
  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-pickerHeight, 0],
  });

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity onPress={togglePicker} style={styles.selectedOption}>
        <Text style={styles.selectedOptionText}>{selectedValue}</Text>
      </TouchableOpacity>
      <Animated.View
        style={[
          styles.optionsContainer,
          {
            transform: [{ translateY }],
            height: pickerHeight,
          },
        ]}
      >
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.option}
            onPress={() => handleSelect(option)}
          >
            <Text
              style={[
                styles.optionText,
                selectedValue === option && styles.selectedOptionText,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create<Styles>({
  container: {
    width: width * 0.8,
    alignSelf: "center",
  },
  selectedOption: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
  },
  selectedOptionText: {
    fontWeight: "bold",
  },
  optionsContainer: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    overflow: "hidden",
  },
  option: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  optionText: {
    fontSize: 16,
  },
});

export default AnimatedPicker;
