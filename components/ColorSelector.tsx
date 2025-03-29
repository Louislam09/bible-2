import { EThemes } from "@/types";
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";

// Define color types and interface
type ColorOption = {
  label: any;
  color: EThemes;
  action: () => void;
  extraText: string;
};

interface ColorSelectorProps {
  onSelectColor: (color: ColorOption) => void;
  initialColor?: string;
}

const colorNames: any = {
  Orange: "Naranja",
  BlackWhite: "Negro",
  Cyan: "Cian",
  BlueLight: "Azul Claro",
  Green: "Verde",
  Red: "Rojo",
  Purple: "Púrpura",
  BlueGreen: "Azul Verde",
  Pink: "Rosa",
  PinkLight: "Rosa Claro",
  BlueGray: "Gris Azul",
  Blue: "Azul",
};

const ColorSelector: React.FC<ColorSelectorProps> = ({
  onSelectColor,
  initialColor = "#000",
}) => {
  const getColosTheme = useCallback(() => {
    return Object.values(EThemes).map((color, index) => {
      const name = Object.keys(EThemes)[index];

      return {
        label: colorNames[name],
        color: color,
        action: () => {
          // selectTheme(name);
        },
        extraText: "",
      };
    });
  }, []);
  const colors = getColosTheme();
  // Find initial color object or default to first color
  const initialColorObj =
    colors.find((c) => c.color === initialColor) || colors[0];
  const [selectedColor, setSelectedColor] =
    useState<ColorOption>(initialColorObj);

  const handleColorSelect = (color: ColorOption): void => {
    setSelectedColor(color);
    onSelectColor(color);
  };

  // Determine if text should be white or black based on background color
  const getTextColor = (hexColor: string): string => {
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    // Calculate luminance - weighted average method
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return white for dark backgrounds, black for light backgrounds
    return luminance > 0.5 ? "#000" : "#fff";
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Seleccionar color</Text>
      <View style={styles.previewContainer}>
        <Text style={styles.previewLabel}>Preview:</Text>
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
            {selectedColor.label} ({selectedColor.color})
          </Text>
        </View>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.colorList}>
        {colors.map((colorItem, index) => (
          <TouchableOpacity
            key={colorItem.color}
            style={[
              styles.colorOption,
              { backgroundColor: colorItem.color },
              selectedColor.color === colorItem.color &&
                styles.selectedColorOption,
            ]}
            onPress={() => Object.keys(EThemes)[index]}
            accessibilityLabel={`Select ${colorItem.label} color`}
            accessibilityRole="button"
            accessibilityState={{
              selected: selectedColor.color === colorItem.color,
            }}
          >
            <Text
              style={[
                styles.colorLabel,
                { color: getTextColor(colorItem.color) },
              ]}
            >
              {colorItem.label}
            </Text>
            {selectedColor.color === colorItem.color && (
              <View
                style={[
                  styles.checkmark,
                  { borderColor: getTextColor(colorItem.color) },
                ]}
              >
                <Text style={{ color: getTextColor(colorItem.color) }}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  colorList: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  colorOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedColorOption: {
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  colorLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  previewContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "white",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  previewLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  colorPreview: {
    height: 100,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  previewText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ColorSelector;
