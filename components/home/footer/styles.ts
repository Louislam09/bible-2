import { StyleSheet } from "react-native";
import { TTheme } from "types";

export const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    footer: {
      position: "absolute",
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      right: 10,
      bottom: 5,
      paddingVertical: 0,
      backgroundColor: colors.background,
      boxSizing: "border-box",
      alignSelf: 'flex-end',
      borderWidth: 1,
      borderColor: colors.notification,
      borderRadius: 50,
    },
    progressBarContainer: {
      position: "absolute",
      top: 0,
      width: "100%",
      height: 10,
      zIndex: 111,
    },
    titleContainer: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
    },
    footerCenter: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.backgroundContrast,
    },
    footerEnd: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.backgroundContrast,
    },
    icon: {
      fontWeight: "900",
      marginHorizontal: 5,
      color: colors.primary,
    },
    bookLabel: {
      color: colors.notification,
      textAlign: "center",
      fontSize: 18,
      fontWeight: "bold",
      textDecorationColor: colors.text,
      textDecorationLine: "underline",
      textDecorationStyle: "solid",
    },
  });
