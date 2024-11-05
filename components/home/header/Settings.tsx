import Icon, { IconProps } from "components/Icon";
import { Text, View } from "components/Themed";
import { useBibleContext } from "context/BibleContext";
import { useCustomTheme } from "context/ThemeContext";
import React from "react";
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { TFont, TTheme } from "types";
import SelectThemeList from "./SelectThemeList";

type IThemeOption = {
  icon: IconProps["name"];
  label: string;
  action: () => void;
  isIonicon?: boolean;
  disabled?: boolean;
};

const Settings = ({ theme }: any) => {
  const styles = getStyles(theme);
  const { toggleTheme, schema } = useCustomTheme();
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
      icon: "SunMoon",
      label: "Default",
      action: () => toggleTheme(colorScheme),
      isIonicon: true,
    },
    {
      icon: "Moon",
      label: "Oscuro",
      isIonicon: true,
      action: toggleTheme,
      disabled: _themeScheme === "dark",
    },
    {
      icon: "Sun",
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
              <Icon
                name={item.icon}
                style={[styles.fontIcon]}
                color={item.disabled ? theme.colors.notification : "#000"}
                size={30}
              />
              <Text
                style={[
                  styles.fontLabel,
                  item.disabled && { color: theme.colors.notification },
                ]}
              >
                {item.label}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.title}>Tipo de Letra</Text>
      <View style={[styles.fontContainer, styles.card]}>
        {fontName.map((font: string, index: any) => (
          <TouchableOpacity key={index} onPress={() => selectFont(font)}>
            <View style={styles.fontItem}>
              <Icon
                name="CaseSensitive"
                size={30}
                style={[styles.fontIcon]}
                color={
                  selectedFont === font ? theme.colors.notification : "#000"
                }
              />

              <Text
                style={[
                  styles.fontLabel,
                  selectedFont === font && {
                    color: theme.colors.notification,
                  },
                ]}
              >
                {font}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.title, { marginTop: 15 }]}>Tamaño de Letra</Text>
      <View style={[styles.fontSizeContainer, styles.card]}>
        <TouchableOpacity onPress={() => decreaseFontSize()}>
          <Icon name="AArrowDown" size={34} style={styles.fontIcon} />
        </TouchableOpacity>
        <Text style={[styles.fontSize, { color: theme.colors.notification }]}>
          {fontSize}
        </Text>
        <TouchableOpacity onPress={() => increaseFontSize()}>
          <Icon name="AArrowUp" size={34} style={styles.fontIcon} />
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
