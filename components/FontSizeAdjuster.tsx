import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import { useTheme } from "@react-navigation/native";
import { TTheme } from "@/types";
import { Text, View } from "./Themed";
import CustomSlider from "./Slider";

interface FontSizeAdjusterProps {
  onSizeChange: (size: number) => void;
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
  const theme = useTheme();
  const styles = getStyles(theme);

  const handleIncrease = (): void => {
    if (fontSize < maxSize) {
      const newSize = Math.min(fontSize + step, maxSize);
      setFontSize(newSize);
      onSizeChange(newSize);
    }
  };

  const handleDecrease = (): void => {
    if (fontSize > minSize) {
      const newSize = Math.max(fontSize - step, minSize);
      setFontSize(newSize);
      onSizeChange(newSize);
    }
  };

  const handleSliderChange = (value: number): void => {
    const newSize = Math.round(value);
    setFontSize(newSize);
    onSizeChange(newSize);
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
      <View
        style={{
          marginBottom: 24,
          height: 40,
        }}
      >
        <CustomSlider
          options={[minSize, 22, maxSize]}
          initialValue={fontSize}
          onChange={handleSliderChange}
          activeColor={theme.colors.notification}
          inactiveColor="#D1D8E0"
          textColor={theme.colors.text}
          labels={["Pequeña", "Mediana", "Grande"]}
        />
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
