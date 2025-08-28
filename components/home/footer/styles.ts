import { TTheme } from "@/types";
import { StyleSheet } from "react-native";

export const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    footer: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      paddingVertical: 15,
      backgroundColor: colors.background + 99,
      paddingHorizontal: 20,
      position: "absolute",
      bottom: 0,
      paddingBottom: 25,
    },
    footerAudio: {
      backgroundColor: colors.notification + 90,
      position: 'absolute',
      top: -60,
      right: 10,
      width: 50,
      height: 50,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
    },
    progressBarContainer: {
      position: "absolute",
      top: 0,
      width: "100%",
      height: 10,
      zIndex: 13,
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
      backgroundColor: "transparent",
      flex: 1,
    },
    footerEnd: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
      // marginLeft: 10,
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
    },
  });
