import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute, useTheme } from "@react-navigation/native";
import React, { FC, useCallback, useRef } from "react";
import { Platform, StyleSheet, TouchableOpacity } from "react-native";
import { useBibleContext } from "../../../context/BibleContext";
import { useCustomTheme } from "../../../context/ThemeContext";

import { BottomSheetModal } from "@gorhom/bottom-sheet";
import BottomModal from "components/BottomModal";
import {
  EBibleVersions,
  HomeParams,
  Screens,
  TIcon,
  TRoute,
  TTheme,
} from "../../../types";
import { Text, View } from "../../Themed";
import Settings from "./Settings";
import VersionList from "./VersionList";

interface HeaderInterface {
  bibleVersionRef: any;
  searchRef: any;
  favRef: any;
  dashboardRef: any;
  settingRef: any;
}

const CustomHeader: FC<HeaderInterface> = ({
  bibleVersionRef,
  searchRef,
  favRef,
  dashboardRef,
  settingRef,
}) => {
  const { currentBibleVersion, selectBibleVersion, clearHighlights } =
    useBibleContext();
  const route = useRoute<TRoute>();
  const { book, chapter = 1, verse } = route.params as HomeParams;
  const theme = useTheme();
  const navigation = useNavigation();
  const { toggleTheme } = useCustomTheme();
  const styles = getStyles(theme);
  const headerIconSize = 28;
  const fontBottomSheetModalRef = useRef<BottomSheetModal>(null);
  const versionRef = useRef<BottomSheetModal>(null);
  const isNTV = currentBibleVersion === EBibleVersions.NTV;

  const fontHandlePresentModalPress = useCallback(() => {
    fontBottomSheetModalRef.current?.present();
  }, []);
  const versionHandlePresentModalPress = useCallback(() => {
    versionRef.current?.present();
  }, []);

  const goSearchScreen = () => {
    clearHighlights();
    navigation.navigate(Screens.Search, { book: book });
  };

  const onCopyLong = () => {
    // navigation.navigate("Log");
  };

  const headerIconData: TIcon[] = [
    {
      name: "home",
      action: () => navigation.navigate("Dashboard"),
      isIonicon: true,
      ref: dashboardRef,
    },
    {
      name: "format-font",
      action: fontHandlePresentModalPress,
      ref: settingRef,
    },
    { name: "magnify", action: goSearchScreen, ref: searchRef },
    {
      name: "playlist-star",
      action: () => navigation.navigate("Favorite"),
      longAction: onCopyLong,
      ref: favRef,
    },
  ];

  const onSelect = (version: string) => {
    clearHighlights();
    selectBibleVersion(version);
    versionRef.current?.dismiss();
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerCenter}>
        {headerIconData.map((icon, index) => (
          <TouchableOpacity
            ref={icon.ref}
            style={styles.iconContainer}
            key={index}
            onPress={icon?.action}
            onLongPress={icon?.longAction}
          >
            {icon.isIonicon ? (
              <Ionicons
                name={icon.name}
                size={headerIconSize}
                style={[styles.icon]}
                color={icon.color}
              />
            ) : (
              <MaterialCommunityIcons
                style={[styles.icon, icon.color && { color: icon.color }]}
                name={icon.name}
                size={headerIconSize}
                color={icon.color}
              />
            )}
          </TouchableOpacity>
        ))}
        <BottomModal startAT={2} ref={fontBottomSheetModalRef}>
          <Settings theme={theme} />
        </BottomModal>
      </View>
      <TouchableOpacity
        ref={bibleVersionRef}
        style={styles.headerEnd}
        onPress={versionHandlePresentModalPress}
      >
        <MaterialCommunityIcons
          name={isNTV ? "book-cross" : "crown"}
          size={isNTV ? 24 : headerIconSize}
          style={[styles.icon, { marginHorizontal: 0 }]}
        />
        <Text style={styles.text}>{currentBibleVersion}</Text>
      </TouchableOpacity>
      <BottomModal startAT={1} ref={versionRef}>
        <VersionList {...{ currentBibleVersion, onSelect, theme }} />
      </BottomModal>
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
      paddingVertical: 5,
      paddingHorizontal: 10,
      backgroundColor: colors.background,
      boxSizing: "border-box",
      gap: 10,
      width: "100%",
      borderBottomColor: colors.border,
      borderWidth: 0.5,
      borderStyle: "solid",
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
    versionContainer: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 25,
      borderRadius: 45,
    },
    card: {
      width: "90%",
      backgroundColor: "white",
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
    versionText: {
      color: colors.border,
      fontSize: 24,
      textAlign: "center",
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
      position: "relative",
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
      color: colors.primary,
    },
    text: {
      color: colors.text,
    },
    picker: {
      position: "absolute",
      color: colors.text,
      top: 55,
      left: 20,
    },
  });

export default CustomHeader;
