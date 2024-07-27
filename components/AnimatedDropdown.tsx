import React, { useState, useEffect } from "react";
import {
  TouchableOpacity,
  Animated,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Text, View } from "./Themed";
import { TTheme } from "types";

interface AnimatedDropdownProps {
  options: string[];
  selectedValue: string;
  onValueChange: (value: any) => void;
  theme: TTheme;
}

const AnimatedDropdown: React.FC<AnimatedDropdownProps> = ({
  options,
  selectedValue,
  onValueChange,
  theme,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [animatedHeight] = useState(new Animated.Value(0));
  const styles = getStyles(theme);

  const togglePicker = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const minHieght = Math.min(options.length * 40, 400);
    Animated.timing(animatedHeight, {
      toValue: isOpen ? minHieght : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isOpen, options.length, animatedHeight]);

  return (
    <View style={[styles.container, { paddingBottom: isOpen ? 10 : 0 }]}>
      <TouchableOpacity
        onPress={togglePicker}
        style={[styles.picker, { backgroundColor: "#ddd" }]}
      >
        <Text style={[styles.selectedText]}>{selectedValue}</Text>
      </TouchableOpacity>
      <Animated.View style={[styles.dropdown, { height: animatedHeight }]}>
        <ScrollView persistentScrollbar>
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.option}
              onPress={() => {
                onValueChange(option);
                setIsOpen(false);
              }}
            >
              <Text
                style={{
                  color:
                    selectedValue === option
                      ? theme.colors.notification
                      : "#000",
                  //   fontWeight: "700",
                }}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    container: {
      backgroundColor: "transparent",
    },
    picker: {
      padding: 10,
      borderRadius: 5,
    },
    selectedText: {
      fontSize: 16,
      color: dark ? "black" : colors.text,
      fontWeight: "bold",
    },
    dropdown: {
      overflow: "hidden",
      maxHeight: 400,
      backgroundColor: "white",
      paddingHorizontal: 10,
    },
    option: {
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#ccc",
    },
  });

export default AnimatedDropdown;
