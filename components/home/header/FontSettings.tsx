import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { View, Text } from "components/Themed";
import { useBibleContext } from "context/BibleContext";
import React from "react";
import { TouchableOpacity, StyleSheet, Platform } from "react-native";
import { TFont, TTheme } from "types";
import SelectThemeList from "./SelectThemeList";

const FontSettings = ({ theme }: any) => {
  const styles = getStyles(theme);

  const {
    selectFont,
    decreaseFontSize,
    increaseFontSize,
    fontSize,
    selectedFont,
    selectTheme,
  } = useBibleContext();

  const fontName = Object.values(TFont) as string[];
  return (
    <View style={styles.modalContent}>
      <Text style={styles.title}>Tipo de letras</Text>
      <View style={[styles.fontContainer, styles.card]}>
        {fontName.map((font: string, index: any) => (
          <TouchableOpacity key={index} onPress={() => selectFont(font)}>
            <View style={styles.fontItem}>
              <MaterialCommunityIcons
                name={
                  [
                    "format-text-variant",
                    "format-letter-case",
                    "format-color-text",
                  ][index] as any
                }
                style={[
                  styles.fontIcon,
                  selectedFont === font && {
                    backgroundColor: theme.colors.notification,
                    color: "white",
                  },
                ]}
              />

              <Text style={styles.fontLabel}>{font}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.title, { marginTop: 15 }]}>Tamaño</Text>
      <View style={[styles.fontSizeContainer, styles.card]}>
        <TouchableOpacity onPress={() => decreaseFontSize()}>
          <MaterialCommunityIcons
            name="format-font-size-decrease"
            style={styles.fontIcon}
          />
        </TouchableOpacity>
        <Text style={styles.fontSize}>{fontSize}</Text>
        <TouchableOpacity onPress={() => increaseFontSize()}>
          <MaterialCommunityIcons
            name="format-font-size-increase"
            style={styles.fontIcon}
          />
        </TouchableOpacity>
      </View>

      <SelectThemeList selectTheme={selectTheme} />
    </View>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    icon: {
      color: colors.backgroundContrast,
    },
    title: {
      color: "white",
      fontSize: 20,
      padding: 5,
      width: "90%",
      textAlign: "center",
      backgroundColor: colors.notification,
    },
    linea: {
      width: "90%",
      height: 1,
      backgroundColor: colors.background,
      elevation: 5,
      marginVertical: 5,
    },
    modalContent: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 25,
      borderRadius: 45,
      flex: 1,
    },
    card: {
      backgroundColor: "white",
      borderWidth: 1,
      borderColor: colors.notification,
      borderRadius: 8,
      padding: 16,
      marginVertical: 8,
      elevation: 5,
      ...Platform.select({
        ios: {
          shadowColor: "black",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        },
      }),
    },
    fontContainer: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      gap: 10,
      width: "90%",
    },
    fontSizeContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      gap: 10,
      width: "90%",
    },
    fontItem: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
      gap: 5,
    },
    fontIcon: {
      padding: 10,
      borderRadius: 50,
      elevation: 5,
      backgroundColor: "white",
      color: colors.text,
      fontSize: 30,
    },
    fontLabel: {
      color: colors.text,
      fontWeight: "bold",
    },
    fontSize: {
      fontWeight: "bold",
      color: colors.text,
      fontSize: 30,
    },
  });

export default FontSettings;
