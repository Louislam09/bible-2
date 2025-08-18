import { useMyTheme } from "@/context/ThemeContext";
import { TFont, TTheme } from "@/types";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Icon from "./Icon";
import { Text, View } from "./Themed";

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
  const { theme } = useMyTheme();
  const styles = getStyles(theme);

  const fonts: FontFamily[] = Object.values(TFont);

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
        {fonts.map((font) => {
          const isSelected = selectedFont === font;
          return (
            <TouchableOpacity
              key={font}
              style={[
                styles.fontOption,
                isSelected && styles.selectedFontOption,
              ]}
              onPress={() => handleFontSelect(font)}
              accessibilityLabel={`Select ${font} font`}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              <Text style={[styles.fontLabel, { fontFamily: font }]}>
                {font}
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
      marginBottom: 16,
      textAlign: "center",
    },
    fontList: {
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      gap: 10,
    },
    fontOption: {
      backgroundColor: colors.text + 99,
      flexGrow: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 16,
      borderRadius: 8,
    },
    selectedFontOption: {
      backgroundColor: colors.notification,
      borderWidth: 2,
      borderColor: dark ? "#fff" : "#000",
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
      backgroundColor: colors.text + 30,
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
