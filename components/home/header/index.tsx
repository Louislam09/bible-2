import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useNavigation, useRoute, useTheme } from "@react-navigation/native";
import React, { FC, useCallback, useMemo, useRef } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { useBibleContext } from "../../../context/BibleContext";

import { BottomSheetModal } from "@gorhom/bottom-sheet";
import BottomModal from "components/BottomModal";
import { iconSize } from "constants/size";
import { useStorage } from "context/LocalstoreContext";
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
  dashboardRef,
  settingRef,
  favRef,
}) => {
  const {
    currentBibleVersion,
    selectBibleVersion,
    clearHighlights,
    goBackOnHistory,
    goForwardOnHistory,
    currentHistoryIndex,
    searchHistorial,
    isSplitActived,
    toggleSplitMode,
    toggleBottomSideSearching,
  } = useBibleContext();
  const {
    historyManager: { goBack, goForward, history, getCurrentIndex },
  } = useStorage();
  const route = useRoute<TRoute>();
  const { book, chapter = 1, verse } = route.params as HomeParams;
  const theme = useTheme();
  const navigation = useNavigation();
  const styles = getStyles(theme);
  const headerIconSize = iconSize;
  const fontBottomSheetModalRef = useRef<BottomSheetModal>(null);
  const versionRef = useRef<BottomSheetModal>(null);
  const isNTV = currentBibleVersion === EBibleVersions.NTV;
  const shouldForward = !(getCurrentIndex() === history.length - 1);
  const shouldBackward = getCurrentIndex() !== 0;

  const versionHandlePresentModalPress = useCallback(() => {
    versionRef.current?.present();
  }, []);

  const goSearchScreen = () => {
    clearHighlights();
    navigation.navigate(Screens.Search, { book: book });
  };

  const moveBackInHistory = () => {
    // if (!goBackOnHistory || [-1, 0].includes(currentHistoryIndex)) {
    //   ToastAndroid.show("No tiene historial", ToastAndroid.SHORT);
    //   return;
    // }
    const index = goBack();
    goBackOnHistory?.(index);
  };

  const moveForwardInHistory = () => {
    // if (
    //   !goForwardOnHistory ||
    //   -1 === currentHistoryIndex ||
    //   currentHistoryIndex + 1 >= searchHistorial.length
    // ) {
    //   ToastAndroid.show("No tiene historial", ToastAndroid.SHORT);
    //   return;
    // }
    const index = goForward();
    goForwardOnHistory?.(index);
  };

  const headerIconData: TIcon[] = useMemo(
    () =>
      [
        {
          name: "arrow-split-horizontal",
          action: () => {
            toggleSplitMode();
            toggleBottomSideSearching(!isSplitActived);
          },
          ref: favRef,
          isIonicon: false,
          color: isSplitActived ? theme.colors.notification : theme.colors.text,
        },
        {
          name: "arrow-back-outline",
          action: moveBackInHistory,
          ref: settingRef,
          isIonicon: true,
          disabled: isSplitActived,
          color: shouldBackward
            ? theme.colors.notification
            : theme.colors?.text,
        },
        {
          name: "arrow-forward-outline",
          action: moveForwardInHistory,
          ref: searchRef,
          isIonicon: true,
          disabled: isSplitActived,
          color: shouldForward ? theme.colors.notification : theme.colors?.text,
        },
        { name: "magnify", action: goSearchScreen, ref: searchRef },
      ].filter((x) => !x.disabled),
    [isSplitActived, shouldForward, shouldBackward]
  );

  const onSelect = (version: string) => {
    clearHighlights();
    selectBibleVersion(version);
    versionRef.current?.dismiss();
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity
        ref={dashboardRef}
        style={styles.iconContainer}
        onPress={() => navigation.navigate("Dashboard")}
      >
        <Ionicons name="home" size={headerIconSize} style={[styles.icon]} />
      </TouchableOpacity>
      <View style={styles.headerCenter}>
        {headerIconData.map((icon, index) => (
          <TouchableOpacity
            ref={icon.ref}
            style={styles.iconContainer}
            key={index}
            onPress={icon?.action}
            onLongPress={icon?.longAction}
            disabled={icon.disabled}
          >
            {icon.isIonicon ? (
              <Ionicons
                name={icon.name}
                size={headerIconSize}
                style={[styles.icon, { color: icon.color }]}
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
      <BottomModal justOneSnap startAT={0} ref={versionRef}>
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
      paddingHorizontal: 10,
      paddingVertical: 10,
      backgroundColor: colors.background + "cc",
      width: "100%",
      borderWidth: 0.5,
    },
    versionContainer: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 45,
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
      justifyContent: "flex-end",
      backgroundColor: "none",
      gap: 5,
      flex: 1,
    },
    headerEnd: {
      position: "relative",
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      paddingHorizontal: 10,
      borderRadius: 50,
    },
    iconContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 50,
    },
    icon: {
      fontWeight: "700",
      marginHorizontal: 10,
      color: colors.primary,
    },
    text: {
      color: colors.text,
    },
  });

export default CustomHeader;
