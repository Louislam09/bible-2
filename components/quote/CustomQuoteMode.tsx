import React from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  TextStyle,
} from "react-native";
import { Text } from "@/components/Themed";
import { TTheme } from "@/types";

type FontType = {
  readonly label: "Aa";
  readonly fontFamily: "System" | "serif" | "sans-serif" | "monospace";
  readonly fontWeight: "400" | "700";
};

interface CustomQuoteModeProps {
  selectedColor: string;
  selectedFont: FontType;
  quoteText: string;
  reference: string;
  onColorSelect: (color: string) => void;
  onFontSelect: (font: FontType) => void;
  onQuoteTextChange: (text: string) => void;
  onReferenceChange: (text: string) => void;
  colors: string[];
  fonts: readonly FontType[];
}

export const CustomQuoteMode: React.FC<CustomQuoteModeProps> = ({
  selectedColor,
  selectedFont,
  quoteText,
  reference,
  onColorSelect,
  onFontSelect,
  onQuoteTextChange,
  onReferenceChange,
  colors,
  fonts,
}) => {
  return (
    <View style={styles.customModeContainer}>
      <View style={styles.previewContainer}>
        <TouchableOpacity
          activeOpacity={1}
          style={[styles.cardPreview, { backgroundColor: selectedColor }]}
          onPress={() => {}}
        >
          <TextInput
            style={[
              styles.cardText,
              {
                fontFamily: selectedFont.fontFamily,
                fontWeight: selectedFont.fontWeight,
              },
            ]}
            value={quoteText}
            onChangeText={onQuoteTextChange}
            multiline
            textAlign="center"
            placeholder="Your verse here..."
            placeholderTextColor="#fff9"
          />
          <TextInput
            style={styles.referenceText}
            value={reference}
            onChangeText={onReferenceChange}
            textAlign="center"
            placeholder="Reference (Book Chapter:Verse)"
            placeholderTextColor="#fff9"
          />
        </TouchableOpacity>
      </View>
      <View style={styles.pickerRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {colors.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorCircle,
                {
                  backgroundColor: color,
                  borderWidth: selectedColor === color ? 3 : 1,
                  borderColor: selectedColor === color ? "#fff" : "#000",
                },
              ]}
              onPress={() => onColorSelect(color)}
            />
          ))}
        </ScrollView>
      </View>
      <View style={styles.pickerRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {fonts.map((font, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.fontCircle,
                {
                  borderWidth: selectedFont === font ? 3 : 1,
                  borderColor: selectedFont === font ? "#fff" : "#000",
                },
              ]}
              onPress={() => onFontSelect(font)}
            >
              <Text
                style={{
                  fontFamily: font.fontFamily,
                  fontWeight: font.fontWeight,
                  color: "#fff",
                  fontSize: 18,
                }}
              >
                {font.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  customModeContainer: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 20,
  },
  previewContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 16,
  },
  cardPreview: {
    width: "100%",
    height: 350,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    padding: 24,
  },
  cardText: {
    color: "#fff",
    fontSize: 32,
    textAlign: "center",
    fontWeight: "400",
  },
  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    marginHorizontal: 8,
    minHeight: 48,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginHorizontal: 6,
    borderColor: "#fff",
    borderWidth: 1,
  },
  fontCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginHorizontal: 6,
    backgroundColor: "#2228",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#fff",
    borderWidth: 1,
  },
  referenceText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginTop: 8,
  },
});
