import { useMyTheme } from "@/context/ThemeContext";
import { EThemes, TTheme } from "@/types";
import React, { useCallback, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Icon from "./Icon";
import { Text, View } from "./Themed";

// Define color types and interface
type ColorOption = {
  label: any;
  color: EThemes;
  value: string;
};

interface ColorSelectorProps {
  onSelectColor: (color: ColorOption) => void;
  initialColor?: string;
}

const colorNames: any = {
  Cyan: "Cian",
  Blue: "Azul",
  Green: "Verde",
  Red: "Rojo",
  Pink: "Rosa",
  Purple: "Púrpura",
  Orange: "Naranja",
  BlackWhite: "Negro",
  PinkLight: "Rosa Claro",
  BlueLight: "Azul Claro",
  BlueGray: "Gris Azul",
  BlueGreen: "Azul Verde",
};

const ColorSelector: React.FC<ColorSelectorProps> = ({
  onSelectColor,
  initialColor,
}) => {
  const getColosTheme = useCallback(() => {
    return Object.values(EThemes).map((color, index) => {
      const name = Object.keys(EThemes)[index];

      return {
        label: colorNames[name],
        color: color,
        value: name,
      };
    });
  }, []);
  const { theme } = useMyTheme();
  const styles = getStyles(theme);
  const colors = getColosTheme();
  const initialColorObj =
    colors.find((c) => c.value === initialColor) || colors[0];
  const [selectedColor, setSelectedColor] =
    useState<ColorOption>(initialColorObj);

  const handleColorSelect = (color: ColorOption): void => {
    setSelectedColor(color);
    onSelectColor(color);
  };

  const getTextColor = (hexColor: string): string => {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#000" : "#fff";
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Seleccionar color</Text>
      <View style={styles.previewContainer}>
        <Text style={styles.previewLabel}>Vista Previa:</Text>
        <View
          style={[
            styles.colorPreview,
            { backgroundColor: selectedColor.color },
          ]}
        >
          <Text
            style={[
              styles.previewText,
              { color: getTextColor(selectedColor.color) },
            ]}
          >
            {selectedColor.label}
          </Text>
        </View>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.colorList}>
        {colors.map((colorItem) => {
          const isSelected = selectedColor.color === colorItem.color;
          return (
            <TouchableOpacity
              key={colorItem.color}
              style={[
                styles.colorOption,
                { backgroundColor: colorItem.color },
                isSelected && styles.selectedColorOption,
              ]}
              onPress={() => handleColorSelect(colorItem)}
              accessibilityLabel={`Select ${colorItem.label} color`}
              accessibilityRole="button"
              accessibilityState={{
                selected: isSelected,
              }}
            >
              <Text
                style={[
                  styles.colorLabel,
                  {
                    color: getTextColor(colorItem.color),
                  },
                ]}
              >
                {colorItem.label}
              </Text>
              {isSelected && (
                <Icon
                  name="CircleCheck"
                  size={22}
                  color="white"
                  fillColor="#4ec9b0"
                  style={{ position: "absolute", top: 2, right: 2 }}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: "transparent",
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      textAlign: "center",
      color: colors.text,
    },
    colorList: {
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      gap: 10,
    },
    colorOption: {
      flexGrow: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 16,
      borderRadius: 8,
    },
    selectedColorOption: {
      borderWidth: 2,
      borderColor: dark ? "#fff" : "#000",
    },
    colorLabel: {
      fontSize: 16,
      fontWeight: "500",
    },
    previewContainer: {
      marginVertical: 10,
      backgroundColor: colors.background,
    },
    previewLabel: {
      fontSize: 16,
      color: colors.text,
      marginBottom: 8,
    },
    colorPreview: {
      height: 100,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
      borderColor: colors.text,
      borderWidth: 1,
    },
    previewText: {
      fontSize: 18,
      fontWeight: "bold",
    },
  });

export default ColorSelector;
