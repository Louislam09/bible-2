import { useMyTheme } from "@/context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import React, { FC, useCallback, useMemo, useRef } from "react";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { useBibleContext } from "../../../context/BibleContext";

import BottomModal from "@/components/BottomModal";
import Icon from "@/components/Icon";
import { Text, View } from "@/components/Themed";
import { useDBContext } from "@/context/databaseContext";
import { useHaptics } from "@/hooks/useHaptics";
import useParams from "@/hooks/useParams";
import { bibleState$ } from "@/state/bibleState";
import { modalState$ } from "@/state/modalState";
import { tourState$ } from "@/state/tourState";
import { EBibleVersions, HomeParams, Screens, TIcon, TTheme } from "@/types";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { batch } from "@legendapp/state";
import { use$ } from "@legendapp/state/react";
import { useNavigation, useRouter } from "expo-router";
import VersionList from "./VersionList";

interface HeaderInterface { }

const BibleHeader: FC<HeaderInterface> = ({ }) => {
  const haptics = useHaptics();
  const { width } = useWindowDimensions();
  const {
    currentBibleVersion,
    selectBibleVersion,
    historyManager,
    goBackOnHistory,
    goForwardOnHistory,
  } = useBibleContext();

  const isSplitActived = use$(() => bibleState$.isSplitActived.get());
  const verses = use$(() => bibleState$.bibleData.topVerses.get());
  const currentHistoryIndexState = use$(() =>
    bibleState$.currentHistoryIndex.get()
  );

  const {
    goBack,
    goForward,
    history,
    getCurrentItem,
    currentIndex: currentHistoryIndex,
  } = historyManager;

  const params = useParams<HomeParams>();
  const { book } = params;
  const { theme, toggleTheme } = useMyTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const isSmallSDevice = width < 300;
  const headerIconSize = 20;

  const styles = getStyles(theme);
  const versionRef = useRef<BottomSheetModal>(null);
  const settingsRef = useRef<BottomSheetModal>(null);
  const isNTV = currentBibleVersion === EBibleVersions.NTV;
  const isInterlineal = [EBibleVersions.INTERLINEAR].includes(
    currentBibleVersion as EBibleVersions
  );
  const canGoForward = !(currentHistoryIndex === history?.length - 1);
  const canGoBackward = currentHistoryIndex !== 0;
  const { installedBibles } = useDBContext();
  const currentItem = getCurrentItem?.();
  const currentVersionName =
    installedBibles.find((version) => version.id === currentBibleVersion)
      ?.shortName || installedBibles[0].shortName;

  const versionHandlePresentModalPress = useCallback(() => {
    versionRef.current?.present();
  }, []);

  const settingsHandlePresentModalPress = useCallback(() => {
    modalState$.openBibleSettingBottomSheet();
  }, []);

  const goSearchScreen = () => {
    bibleState$.clearSelection();
    // @ts-ignore
    navigation.navigate(Screens.Search, { Book: book });
    haptics.impact.light();
  };

  const goHymnsScreen = () => {
    navigation.navigate(Screens.Hymn);
    haptics.impact.light();
  };

  const moveBackInHistory = () => {
    const index = goBack();
    goBackOnHistory?.(index);
    haptics.impact.light();
  };

  const moveForwardInHistory = () => {
    const index = goForward();
    goForwardOnHistory?.(index);
    haptics.impact.light();
  };

  const headerIconData = useMemo(() => {
    const options: TIcon[] = [
      {
        name: "SquareSplitVertical",
        action: () => {
          batch(() => {
            if (!isSplitActived) {
              bibleState$.changeBibleQuery({
                isBibleBottom: true,
                shouldFetch: true,
                isHistory: false,
              });
            }
            haptics.impact.light();
            bibleState$.handleSplitActived();
          });
        },
        ref: tourState$.splitScreenButton.get(),
        isIonicon: false,
        color: isSplitActived ? theme.colors.notification : theme.colors.text,
        hide: false
      },
      {
        name: "ArrowBigLeftDash",
        action: moveBackInHistory,
        ref: tourState$.moveBackwardButton.get(),
        isIonicon: true,
        disabled: !canGoBackward,
        hide: isSplitActived,
        color: canGoBackward ? theme.colors.notification : "#7a7a7a",
      },
      {
        name: "ArrowBigRightDash",
        action: moveForwardInHistory,
        ref: tourState$.moveForwardButton.get(),
        isIonicon: true,
        hide: isSplitActived,
        disabled: !canGoForward,
        color: canGoForward ? theme.colors.notification : "#7a7a7a",
      },
      { name: "Music4", action: goHymnsScreen, ref: tourState$.hymnalButton.get() },
      { name: "Search", action: goSearchScreen, ref: tourState$.search.get() },
    ];
    return options.filter((x) => !x.hide);
  }, [isSplitActived, canGoForward, canGoBackward]);

  const onSelect = (version: string) => {
    bibleState$.handleStrongWord({ text: "", code: "" });
    bibleState$.clearSelection();
    selectBibleVersion(version);
    versionRef.current?.dismiss();
    haptics.impact.light();
  };

  return (
    <LinearGradient
      colors={[
        theme.colors.background + "ee",
        theme.colors.background + "ee",
        // "transparent",
      ]}
      style={styles.header}
    >
      <View style={styles.headerContainer}>
        <TouchableOpacity
          ref={tourState$.dashboard.get()}
          style={[styles.iconContainer]}
          onPress={() => router.navigate("/(dashboard)")}
        >
          <Icon
            name="House"
            size={headerIconSize}
            color={theme.colors.primary}
          />
        </TouchableOpacity>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.headerCenter]}
          style={[styles.headerCenterScroll]}
        >
          {headerIconData.map((icon, index) => (
            <TouchableOpacity
              ref={icon.ref}
              style={[styles.iconContainer]}
              key={index}
              onPress={icon?.action}
              onLongPress={icon?.longAction}
              disabled={icon.disabled}
            >
              <Icon
                name={icon.name}
                size={headerIconSize}
                color={icon.color || theme.colors.primary}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          ref={tourState$.bibleVersion.get()}
          style={styles.headerEnd}
          onPress={versionHandlePresentModalPress}
        >
          <Icon
            name={isNTV ? "BookText" : "Crown"}
            size={headerIconSize}
            color={theme.colors.primary}
          />
          {!isSmallSDevice && (
            <Text style={styles.text}>
              {isInterlineal ? "Interlineal" : currentVersionName.trim()}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          ref={tourState$.setting.get()}
          style={[styles.iconContainer, { marginHorizontal: 10 }]}
          onPress={settingsHandlePresentModalPress}
        >
          <Icon
            name={"Settings"}
            size={headerIconSize}
            color={theme.colors.primary}
          />
        </TouchableOpacity>

        <BottomModal shouldScroll startAT={1} ref={versionRef}>
          <VersionList {...{ currentBibleVersion, onSelect, theme }} />
        </BottomModal>
      </View>
    </LinearGradient>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    header: {
      position: "absolute",
      top: 10,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 10,
      paddingTop: 10,
      width: "100%",
      zIndex: 10,
      paddingBottom: 10,
      borderRadius: 10,
      alignSelf: "center",
    },
    headerContainer: {
      flexDirection: "row",
      backgroundColor: "transparent",
      width: "100%",
    },
    progressContainer: {
      width: "100%",
      marginVertical: 8,
      backgroundColor: colors.background + 99,
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
    headerCenterScroll: {
      flex: 1,
      marginLeft: 10,
    },
    headerCenter: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      backgroundColor: "transparent",
      gap: 15,
      flexGrow: 1,
    },
    headerEnd: {
      position: "relative",
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      paddingLeft: 10,
      borderRadius: 50,
    },
    styledIconContainer: {
      borderWidth: 1,
      borderColor: colors.text + 20,
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    iconContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 50,
    },
    icon: {
      color: colors.primary,
    },
    text: {
      color: dark ? "white" : colors.background,
      paddingHorizontal: 4,
      fontSize: 18,
      backgroundColor: colors.notification + 99,
      borderRadius: 4,
    },
  });

export default BibleHeader;
