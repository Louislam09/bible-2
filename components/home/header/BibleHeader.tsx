import { useTheme } from "@react-navigation/native";
import React, { FC, useCallback, useMemo, useRef } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { useBibleContext } from "../../../context/BibleContext";

import BottomModal from "@/components/BottomModal";
import Icon from "@/components/Icon";
import { Text, View } from "@/components/Themed";
import { iconSize } from "@/constants/size";
import { useDBContext } from "@/context/databaseContext";
import useHistoryManager from "@/hooks/useHistoryManager";
import useParams from "@/hooks/useParams";
import { bibleState$ } from "@/state/bibleState";
import { tourState$ } from "@/state/tourState";
import { EBibleVersions, HomeParams, Screens, TIcon, TTheme } from "@/types";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { use$ } from "@legendapp/state/react";
import { useNavigation, useRouter } from "expo-router";
import ProgressBar from "../footer/ProgressBar";
import Settings from "./Settings";
import VersionList from "./VersionList";
import { batch } from "@legendapp/state";

interface HeaderInterface {}

const BibleHeader: FC<HeaderInterface> = ({}) => {
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
  // const currentHistoryIndex = use$(() => bibleState$.currentHistoryIndex.get());

  const {
    goBack,
    goForward,
    history,
    getCurrentItem,
    currentIndex: currentHistoryIndex,
  } = historyManager;

  const params = useParams<HomeParams>();
  const { book } = params;
  const theme = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const isSmallSDevice = width < 300;

  const styles = getStyles(theme);
  const headerIconSize = isSmallSDevice ? 26 : iconSize;
  const fontBottomSheetModalRef = useRef<BottomSheetModal>(null);
  const versionRef = useRef<BottomSheetModal>(null);
  const isNTV = currentBibleVersion === EBibleVersions.NTV;
  const canGoForward = !(currentHistoryIndex === history?.length - 1);
  const canGoBackward = currentHistoryIndex !== 0;
  const { installedBibles } = useDBContext();
  const currentItem = getCurrentItem?.();
  const currentVerse = currentItem?.verse;
  const currentVersionName =
    installedBibles.find((version) => version.id === currentBibleVersion)
      ?.shortName || installedBibles[0].shortName;

  const versionHandlePresentModalPress = useCallback(() => {
    versionRef.current?.present();
  }, []);

  const goSearchScreen = () => {
    bibleState$.clearSelection();
    // @ts-ignore
    navigation.navigate(Screens.Search, { Book: book });
  };

  // const moveBackInHistory = () => {
  //   const index = goBack();
  //   if (index === -1) return;
  //   const currentHistory = getCurrentItem() as any;
  //   if (!currentHistory) return;
  //   bibleState$.handleCurrentHistoryIndex(index);
  //   delete currentHistory.created_at;
  //   delete currentHistory.id;

  //   bibleState$.changeBibleQuery({
  //     ...currentHistory,
  //     isHistory: true,
  //     shouldFetch: true,
  //   });
  // };

  // const moveForwardInHistory = () => {
  //   const index = goForward();
  //   if (index === -1) return;
  //   const currentHistory = getCurrentItem() as any;
  //   if (!currentHistory) return;
  //   bibleState$.handleCurrentHistoryIndex(index);
  //   delete currentHistory.created_at;
  //   delete currentHistory.id;

  //   bibleState$.changeBibleQuery({
  //     ...currentHistory,
  //     isHistory: true,
  //     shouldFetch: true,
  //   });
  // };

  const moveBackInHistory = () => {
    const index = goBack();
    goBackOnHistory?.(index);
  };

  const moveForwardInHistory = () => {
    const index = goForward();
    goForwardOnHistory?.(index);
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
            bibleState$.handleSplitActived();
          });
        },
        ref: tourState$.fav,
        isIonicon: false,
        color: isSplitActived ? theme.colors.notification : theme.colors.text,
      },
      {
        name: "ArrowBigLeftDash",
        action: moveBackInHistory,
        ref: tourState$.setting,
        isIonicon: true,
        disabled: !canGoBackward,
        hide: isSplitActived,
        color: canGoBackward ? theme.colors.notification : "#7a7a7a",
      },
      {
        name: "ArrowBigRightDash",
        action: moveForwardInHistory,
        ref: tourState$.search,
        isIonicon: true,
        hide: isSplitActived,
        disabled: !canGoForward,
        color: canGoForward ? theme.colors.notification : "#7a7a7a",
      },
      { name: "Search", action: goSearchScreen, ref: tourState$.search },
    ];
    return options.filter((x) => !x.hide);
  }, [isSplitActived, canGoForward, canGoBackward]);

  const onSelect = (version: string) => {
    bibleState$.clearSelection();
    selectBibleVersion(version);
    versionRef.current?.dismiss();
  };
  const progressValue = useMemo(() => {
    return (currentVerse || 0) / (verses?.length || 10);
  }, [currentVerse, verses]);

  return (
    <View style={styles.header}>
      <View style={{ flexDirection: "row", backgroundColor: "transparent" }}>
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => router.navigate("(dashboard)")}
        >
          <Icon
            name="House"
            size={headerIconSize}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          {headerIconData.map((icon, index) => (
            <TouchableOpacity
              ref={icon.ref.get()}
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
          <BottomModal startAT={2} ref={fontBottomSheetModalRef}>
            <Settings theme={theme} />
          </BottomModal>
        </View>
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
            <Text style={styles.text}>{currentVersionName.trim()}</Text>
          )}
        </TouchableOpacity>
        <BottomModal shouldScroll startAT={1} ref={versionRef}>
          <VersionList {...{ currentBibleVersion, onSelect, theme }} />
        </BottomModal>
      </View>
      {!isSplitActived && (
        <View style={[styles.progressContainer]}>
          <ProgressBar
            hideCircle
            height={4}
            color={theme.colors.notification}
            barColor={theme.colors.text}
            progress={progressValue}
            circleColor={theme.colors.notification}
          />
        </View>
      )}
    </View>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    header: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      paddingHorizontal: 10,
      paddingTop: 10,
      backgroundColor: colors.background,
      width: "100%",
      borderWidth: 0.5,
    },
    progressContainer: {
      width: "100%",
      marginVertical: 8,
      backgroundColor: colors.background,
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
      gap: 15,
      flex: 1,
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
      backgroundColor: colors.notification,
      borderRadius: 4,
    },
  });

export default BibleHeader;
