import { TTheme } from "@/types";
import { useTheme } from "@react-navigation/native";
import React, { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Text, View } from "./Themed";

// Define types for props
type FontFamily = string;

interface FontSelectorProps {
  onSelectFont: (font: FontFamily) => void;
  initialFont?: FontFamily | string;
}

const FontSelector: React.FC<FontSelectorProps> = ({
  onSelectFont,
  initialFont = "Roboto",
}) => {
  const [selectedFont, setSelectedFont] = useState<FontFamily>(initialFont);
  const theme = useTheme();
  const styles = getStyles(theme);

  const fonts: FontFamily[] = [
    "Roboto",
    "OpenSans",
    "Cardo",
    "Inter",
    "InterBold",
    "DMSans",
    "DMSansBold",
    "Manrope",
    "ManropeBold",
    "Poppins",
    "PoppinsBold",
    "EBGaramond",
    "EBGaramondBold",
  ];

  const handleFontSelect = (font: FontFamily): void => {
    setSelectedFont(font);
    onSelectFont(font);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Seleccionar fuente</Text>
      <View style={styles.previewContainer}>
        <Text style={styles.previewLabel}>Vista previa</Text>
        <Text style={[styles.previewText, { fontFamily: selectedFont }]}>
          Porque de tal manera amó Dios al mundo, que ha dado a su Hijo
          unigénito, para que todo aquel que en él cree, no se pierda, mas tenga
          vida eterna.
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.fontList}>
        {fonts.map((font) => (
          <TouchableOpacity
            key={font}
            style={[
              styles.fontOption,
              selectedFont === font && styles.selectedFontOption,
            ]}
            onPress={() => handleFontSelect(font)}
            accessibilityLabel={`Select ${font} font`}
            accessibilityRole="button"
            accessibilityState={{ selected: selectedFont === font }}
          >
            <Text style={[styles.fontLabel, { fontFamily: font }]}>{font}</Text>
            {selectedFont === font && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
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
      marginBottom: 16,
      textAlign: "center",
    },
    fontList: {
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    fontOption: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      backgroundColor: colors.text + 99,
      borderRadius: 8,
      marginBottom: 8,
      gap: 10,
    },
    selectedFontOption: {
      backgroundColor: colors.notification,
      borderColor: colors.notification + 30,
      borderWidth: 1,
    },
    fontLabel: {
      fontSize: 16,
      color: "white",
    },
    checkmark: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: "#4ec9b0",
      justifyContent: "center",
      alignItems: "center",
    },
    checkmarkText: {
      color: "white",
      fontWeight: "bold",
    },
    previewContainer: {
      marginBottom: 8,
      padding: 16,
      backgroundColor: colors.background,
      borderRadius: 8,
    },
    previewLabel: {
      fontSize: 18,
      color: colors.text,
      marginBottom: 8,
    },
    previewText: {
      fontSize: 16,
      lineHeight: 24,
    },
  });

export default FontSelector;
