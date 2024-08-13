import { StyleSheet } from "react-native";
import { TTheme } from "types";

export const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    footer: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      paddingVertical: 5,
      backgroundColor: colors.background,
      // boxSizing: "border-box",
      paddingHorizontal: 20,
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
      justifyContent: "space-between",
      backgroundColor: colors.backgroundContrast,
      flex: 1,
    },
    footerEnd: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.backgroundContrast,
      marginLeft: 10,
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
      // textDecorationLine: "underline",
      // textDecorationStyle: "solid",
    },
  });
