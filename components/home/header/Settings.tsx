import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, View } from "components/Themed";
import { useBibleContext } from "context/BibleContext";
import React from "react";
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { TFont, TTheme } from "types";
import SelectThemeList from "./SelectThemeList";
import { useCustomTheme } from "context/ThemeContext";

type IThemeOption = {
  icon: string | any;
  label: string;
  action: () => void;
  isIonicon?: boolean;
  disabled?: boolean;
};

const Settings = ({ theme }: any) => {
  const styles = getStyles(theme);
  const { toggleTheme, theme: _themeScheme } = useCustomTheme();
  const colorScheme = useColorScheme() as typeof _themeScheme;
  const {
    selectFont,
    decreaseFontSize,
    increaseFontSize,
    fontSize,
    selectedFont,
    selectTheme,
  } = useBibleContext();

  const fontName = Object.values(TFont) as string[];

  const themesIcon: IThemeOption[] = [
    {
      icon: "theme-light-dark",
      label: "Default",
      action: () => toggleTheme(colorScheme),
    },
    {
      icon: "moon-outline",
      label: "Oscuro",
      isIonicon: true,
      action: toggleTheme,
      disabled: _themeScheme === "dark",
    },
    {
      icon: "sunny-outline",
      label: "Claro",
      isIonicon: true,
      action: toggleTheme,
      disabled: _themeScheme === "light",
    },
  ];

  return (
    <View style={styles.modalContent}>
      <Text style={[styles.title, { marginTop: 15 }]}>Color de Tema</Text>
      <View style={[styles.fontContainer, styles.card]}>
        {themesIcon.map((item, index: any) => (
          <TouchableOpacity
            key={index}
            onPress={item.action}
            disabled={item.disabled}
          >
            <View style={styles.fontItem}>
              {item.isIonicon ? (
                <Ionicons
                  name={item.icon}
                  style={[
                    styles.fontIcon,
                    item.disabled && {
                      backgroundColor: theme.colors.notification,
                      color: "white",
                    },
                  ]}
                />
              ) : (
                <MaterialCommunityIcons
                  name={item.icon}
                  style={[
                    styles.fontIcon,
                    item.disabled && {
                      backgroundColor: theme.colors.notification,
                      color: "white",
                    },
                  ]}
                />
              )}
              <Text style={styles.fontLabel}>{item.label}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.title}>Tipo de Letra</Text>
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

      <Text style={[styles.title, { marginTop: 15 }]}>Tamaño de Letra</Text>
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

      <Text style={[styles.title, { marginTop: 15 }]}>Color de Tema</Text>
      <SelectThemeList selectTheme={selectTheme} theme={theme} />
    </View>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    modalContent: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      borderRadius: 45,
      flex: 1,
      backgroundColor: "transparent",
    },
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
      color: "#000",
      fontSize: 30,
    },
    fontLabel: {
      color: "#000",
      fontWeight: "bold",
    },
    fontSize: {
      fontWeight: "bold",
      color: "#000",
      fontSize: 30,
    },
  });

export default Settings;
