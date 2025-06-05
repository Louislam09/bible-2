import { Text } from "@/components/Themed";
import React, { RefObject, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import ViewShot from "react-native-view-shot";
import Icon from "../Icon";

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
  viewShotRef?: RefObject<ViewShot>;
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
  viewShotRef,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <View style={styles.customModeContainer}>
      <View style={styles.previewContainer}>
        <View style={styles.previewWrapper}>
          <ViewShot
            ref={viewShotRef}
            options={{
              format: "png",
              quality: 1,
              result: "tmpfile"
            }}
            style={styles.viewShotContainer}
          >
            <View style={[styles.cardPreview, { backgroundColor: selectedColor }]}>
              {isEditing ? (
                <View style={styles.editContainer}>
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
                    autoFocus
                  />
                  <TextInput
                    style={[styles.referenceTextInput]}
                    value={reference}
                    onChangeText={onReferenceChange}
                  />
                </View>
              ) : (
                <>
                  <Text
                    style={[
                      styles.cardText,
                      {
                        fontFamily: selectedFont.fontFamily,
                        fontWeight: selectedFont.fontWeight,
                      },
                    ]}
                  >
                    {quoteText}
                  </Text>
                  <Text style={styles.referenceText}>{reference}</Text>
                </>
              )}
            </View>
          </ViewShot>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Icon name={isEditing ? "Check" : "Pen"} size={20} color="#fff" />
          </TouchableOpacity>
        </View>
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
  previewWrapper: {
    position: "relative",
    width: "100%",
  },
  previewContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 16,
  },
  cardPreview: {
    width: "100%",
    aspectRatio: 0.7,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    padding: 24,
    position: "relative",
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
  referenceTextInput: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginTop: 8,
    minWidth: 100,
    padding: 4,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.3)",
  },
  viewShotContainer: {
    width: "100%",
    backgroundColor: "transparent",
  },
  editButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  editContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
