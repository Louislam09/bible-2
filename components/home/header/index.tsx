import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute, useTheme } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import React, { FC, useCallback, useMemo, useRef } from "react";
import { Platform, StyleSheet, TouchableOpacity } from "react-native";
import { useBibleContext } from "../../../context/BibleContext";
import { useCustomTheme } from "../../../context/ThemeContext";

import { BottomSheetModal } from "@gorhom/bottom-sheet";
import BottomModal from "components/BottomModal";
import {
  EBibleVersions,
  HomeParams,
  Screens,
  TRoute,
  TTheme,
} from "../../../types";
import { getVerseTextRaw } from "../../../utils/getVerseTextRaw";
import { Text, View } from "../../Themed";
import FontSettings from "./FontSettings";
import VersionList from "./VersionList";

interface HeaderInterface {}
type TIcon = {
  name: any;
  color?: string | any;
  action?: any;
};

const CustomHeader: FC<HeaderInterface> = ({}) => {
  const {
    highlightedVerses,
    selectFont,
    selectedFont,
    currentBibleVersion,
    selectBibleVersion,
    clearHighlights,
  } = useBibleContext();
  const route = useRoute<TRoute>();
  const { book, chapter = 1, verse } = route.params as HomeParams;
  const theme = useTheme();
  const navigation = useNavigation();
  const { toggleTheme } = useCustomTheme();
  const styles = getStyles(theme);
  const headerIconSize = 28;
  const highlightedGreaterThanOne = highlightedVerses.length > 1;
  const fontBottomSheetModalRef = useRef<BottomSheetModal>(null);
  const versionRef = useRef<BottomSheetModal>(null);
  const isNTV = currentBibleVersion === EBibleVersions.NTV;

  const fontHandlePresentModalPress = useCallback(() => {
    fontBottomSheetModalRef.current?.present();
  }, []);
  const versionHandlePresentModalPress = useCallback(() => {
    versionRef.current?.present();
  }, []);

  const snapPoints = useMemo(() => ["50%", "75%", "100%"], []);

  const formatTextToClipboard = () => {
    return highlightedVerses.reduce((acc, next) => {
      return acc + `\n ${next.verse} ${getVerseTextRaw(next.text)}`;
    }, `${book} ${chapter}:${highlightedVerses[0].verse}${highlightedGreaterThanOne ? "-" + highlightedVerses[highlightedVerses.length - 1].verse : ""}`);
  };

  const copyToClipboard = async () => {
    if (!highlightedVerses.length) {
      alert("No hay nada seleccinado para copiar.");
      return;
    }
    const textFormat = formatTextToClipboard();
    await Clipboard.setStringAsync(textFormat);
    const text = await Clipboard.getStringAsync();
    clearHighlights();
    console.log(text);
  };

  const goSearchScreen = () => {
    navigation.navigate(Screens.Search, { book: book });
  };

  const headerIconData: TIcon[] = [
    { name: "theme-light-dark", action: toggleTheme },
    {
      name: "content-copy",
      action: copyToClipboard,
      color: highlightedVerses.length && theme.colors.notification,
    },
    { name: "format-font", action: fontHandlePresentModalPress },
    { name: "magnify", action: goSearchScreen },
  ];

  const onSelect = (version: string) => {
    selectBibleVersion(version);
    versionRef.current?.dismiss();
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerCenter}>
        {headerIconData.map((icon, index) => (
          <TouchableOpacity
            style={styles.iconContainer}
            key={index}
            onPress={icon?.action}
          >
            <MaterialCommunityIcons
              style={[styles.icon, icon.color && { color: icon.color }]}
              name={icon.name}
              size={headerIconSize}
              color={icon.color}
            />
          </TouchableOpacity>
        ))}
        <BottomModal startAT={3} ref={fontBottomSheetModalRef}>
          <FontSettings theme={theme} />
        </BottomModal>
      </View>
      <TouchableOpacity
        style={styles.headerEnd}
        onPress={versionHandlePresentModalPress}
      >
        <MaterialCommunityIcons
          name={isNTV ? "book-cross" : "crown"}
          size={isNTV ? 24 : headerIconSize}
          style={[styles.icon, { marginHorizontal: 0 }]}
        />
        <Text style={styles.text}>{currentBibleVersion}</Text>
        <BottomModal startAT={1} ref={versionRef}>
          <VersionList {...{ currentBibleVersion, onSelect }} />
        </BottomModal>
      </TouchableOpacity>
    </View>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
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
      // backgroundColor: colors.background,
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
