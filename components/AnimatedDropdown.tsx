import React, { useState, useEffect } from "react";
import {
  TouchableOpacity,
  Animated,
  StyleSheet,
  ScrollView,
  ViewStyle,
  StyleProp,
  TextStyle,
} from "react-native";
import { Text, View } from "./Themed";
import { TTheme } from "types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Icon from "./Icon";

interface AnimatedDropdownProps {
  options: string[];
  selectedValue: string;
  onValueChange: (value: any) => void;
  theme: TTheme;
  customStyle?: {
    picker?: StyleProp<ViewStyle>;
    dropdown?: StyleProp<ViewStyle>;
    pickerText?: StyleProp<TextStyle>;
    dropdownOptionText?: StyleProp<TextStyle>;
    selectedOptionText?: StyleProp<TextStyle>;
  };
  withIcon?: boolean;
}

const AnimatedDropdown: React.FC<AnimatedDropdownProps> = ({
  options,
  selectedValue,
  onValueChange,
  theme,
  customStyle,
  withIcon,
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
        style={[
          styles.picker,
          { backgroundColor: "#ddd" },
          customStyle?.picker,
          {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          },
        ]}
      >
        <Text style={[styles.selectedText, customStyle?.pickerText]}>
          {selectedValue}
        </Text>
        {withIcon && (
          <Icon
            name="ChevronDown"
            size={24}
            color={theme.colors.notification}
          />
        )}
      </TouchableOpacity>
      <Animated.View
        style={[
          styles.dropdown,
          { height: animatedHeight },
          customStyle?.picker,
          { borderWidth: isOpen ? 1 : 0 },
        ]}
      >
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
                style={[
                  {
                    color:
                      selectedValue === option
                        ? theme.colors.notification
                        : "#000",
                  },
                  customStyle?.dropdownOptionText,
                  selectedValue === option && customStyle?.selectedOptionText,
                ]}
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
      marginTop: 4,
    },
    option: {
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#ccc",
    },
  });

export default AnimatedDropdown;
