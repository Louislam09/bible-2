import React, { useState, useCallback } from "react";
import { StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { TTheme } from "@/types";
import { Text, View } from "./Themed";
import CustomSlider from "./Slider";
import useDebounce from "@/hooks/useDebounce";

interface FontSizeAdjusterProps {
  onSizeChange: (size: number, adjustmentType: "decrease" | "increase") => void;
  initialSize?: number;
  minSize?: number;
  maxSize?: number;
  step?: number;
  fontFamily?: string;
}

const FontSizeAdjuster: React.FC<FontSizeAdjusterProps> = ({
  onSizeChange,
  initialSize = 16,
  minSize = 8,
  maxSize = 40,
  step = 1,
  fontFamily = "System",
}) => {
  const [fontSize, setFontSize] = useState<number>(initialSize);
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const debouncedSearchText = useDebounce(fontSize, 500);

  const debouncedOnSizeChange = useCallback(
    debounce((size: number, type: "decrease" | "increase") => {
      onSizeChange(size, type);
    }, 300),
    []
  );

  const handleIncrease = (): void => {
    if (fontSize < maxSize) {
      const newSize = Math.min(fontSize + step, maxSize);
      setFontSize(newSize);
      debouncedOnSizeChange(newSize, "increase");
    }
  };

  const handleDecrease = (): void => {
    if (fontSize > minSize) {
      const newSize = Math.max(fontSize - step, minSize);
      setFontSize(newSize);
      debouncedOnSizeChange(newSize, "decrease");
    }
  };

  const decreaseOpacity = fontSize <= minSize ? 0.3 : 1;
  const increaseOpacity = fontSize >= maxSize ? 0.3 : 1;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Tamaño de fuente</Text>

      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.button, { opacity: decreaseOpacity }]}
          onPress={handleDecrease}
          disabled={fontSize <= minSize}
          accessibilityLabel="Decrease font size"
          accessibilityRole="button"
          accessibilityHint="Decreases the text size"
        >
          <Text style={styles.buttonText}>-</Text>
        </TouchableOpacity>

        <View style={styles.sizeDisplay}>
          <Text style={styles.sizeText}>{fontSize}px</Text>
        </View>

        <TouchableOpacity
          style={[styles.button, { opacity: increaseOpacity }]}
          onPress={handleIncrease}
          disabled={fontSize >= maxSize}
          accessibilityLabel="Increase font size"
          accessibilityRole="button"
          accessibilityHint="Increases the text size"
        >
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.previewContainer}>
        <Text style={styles.previewLabel}>Preview:</Text>
        <Text style={[styles.previewText, { fontSize, fontFamily }]}>
          El Señor es mi pastor; nada me faltará.
        </Text>
      </View>
    </SafeAreaView>
  );
};

// Add debounce utility function at the top of the file
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

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
      marginBottom: 16,
      textAlign: "center",
    },
    controlsContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },
    button: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.notification,
      justifyContent: "center",
      alignItems: "center",
    },
    buttonText: {
      color: "white",
      fontSize: 24,
      fontWeight: "bold",
    },
    sizeDisplay: {
      width: 80,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
      marginHorizontal: 16,
      backgroundColor: colors.text + 99,
      borderRadius: 8,
    },
    sizeText: {
      fontSize: 18,
      fontWeight: "bold",
    },
    slider: {
      marginBottom: 24,
      height: 40,
    },
    previewContainer: {
      padding: 16,
      backgroundColor: colors.text + 30,
      borderRadius: 8,
      marginVertical: 16,
    },
    previewLabel: {
      fontSize: 14,
      color: colors.text,
      marginBottom: 8,
    },
    previewText: {
      lineHeight: 28,
    },
    sizeComparisonContainer: {
      padding: 16,
      backgroundColor: colors.text + 30,
      borderRadius: 8,
    },
    sizeComparisonLabel: {
      fontSize: 14,
      color: colors.text,
      marginBottom: 8,
    },
    sizeComparison: {
      flexDirection: "column",
      justifyContent: "space-between",
      backgroundColor: "transparent",
    },
    smallSizeText: {
      fontSize: 12,
      marginBottom: 4,
    },
    mediumSizeText: {
      fontSize: 16,
      marginBottom: 4,
    },
    largeSizeText: {
      fontSize: 24,
      marginBottom: 4,
    },
  });

export default FontSizeAdjuster;
