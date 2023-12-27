import React, { FC, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Button, Pressable, StyleSheet, TouchableOpacity } from "react-native";
import { Text, View } from "../Themed";
import { TTheme } from "../../types";
import { useTheme } from "@react-navigation/native";
import { useCustomTheme } from "../../context/ThemeContext";
interface HeaderInterface {}
type TIcon = {
  name: any;
  color?: string;
  visible: boolean;
  action?: any;
};

const CustomHeader: FC<HeaderInterface> = () => {
  const theme = useTheme();
  const { toggleTheme } = useCustomTheme();
  const styles = getStyles(theme);
  const headerIconSize = 28;

  const iconData: TIcon[] = [
    {
      name: "theme-light-dark",
      visible: true,
      action: toggleTheme,
    },
    { name: "content-copy", visible: true },
    { name: "format-font", visible: true },
    { name: "magnify", visible: true },
  ];

  const onPressIcon = (r: string) => console.log("clicked: ", r);
  return (
    <View style={styles.header}>
      <View style={styles.headerCenter}>
        {iconData.map((icon, index) => (
          <TouchableOpacity
            style={styles.iconContainer}
            key={index}
            onPress={icon?.action}
          >
            <MaterialCommunityIcons
              style={styles.icon}
              name={icon.name}
              size={headerIconSize}
              color={icon.color}
            />
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={styles.headerEnd}
        onPress={() => console.log("clicked")}
      >
        <MaterialCommunityIcons
          name="crown"
          size={headerIconSize}
          style={[styles.icon, { marginHorizontal: 0 }]}
        />
        <Text style={styles.text}>RVR1960</Text>
      </TouchableOpacity>
    </View>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    header: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "flex-end",
      paddingVertical: 15,
      paddingHorizontal: 10,
      backgroundColor: colors.background,
      boxSizing: "border-box",
      gap: 10,
      width: "100%",
      borderBottomColor: colors.border,
      borderWidth: 0.5,
      borderStyle: "solid",
    },
    headerCenter: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "none",
      gap: 5,
    },
    headerEnd: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 50,
      backgroundColor: colors.backgroundContrast,
    },
    iconContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 10,
      borderRadius: 50,
      backgroundColor: colors.backgroundContrast,
    },
    icon: {
      fontWeight: "700",
      marginHorizontal: 10,
      color: colors.text,
    },
    text: {
      color: colors.text,
    },
  });

export default CustomHeader;
