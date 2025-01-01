import { useTheme } from "@react-navigation/native";
import React, { FC, useCallback, useMemo, useRef } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useBibleContext } from '../../../context/BibleContext';

import BottomModal from '@/components/BottomModal';
import Icon from '@/components/Icon';
import { iconSize } from '@/constants/size';
import { useStorage } from '@/context/LocalstoreContext';
import useInstalledBibles from '@/hooks/useInstalledBible';
import useParams from '@/hooks/useParams';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useNavigation, useRouter } from 'expo-router';
import ProgressBar from '../footer/ProgressBar';
import Settings from './Settings';
import VersionList from './VersionList';
import { EBibleVersions, HomeParams, Screens, TIcon, TTheme } from '@/types';
import { View, Text } from '@/components/Themed';

interface HeaderInterface {
  refs: any;
}

const CustomHeader: FC<HeaderInterface> = ({ refs }) => {
  const { bibleVersion, search, dashboard, setting, fav } = refs;
  const { width } = useWindowDimensions();
  const {
    currentBibleVersion,
    selectBibleVersion,
    clearHighlights,
    goBackOnHistory,
    goForwardOnHistory,
    isSplitActived,
    toggleSplitMode,
    toggleBottomSideSearching,
    chapterVerseLength,
  } = useBibleContext();
  const {
    historyManager: {
      goBack,
      goForward,
      history,
      getCurrentIndex,
      getCurrentItem,
    },
  } = useStorage();
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
  const shouldForward = !(getCurrentIndex() === history.length - 1);
  const shouldBackward = getCurrentIndex() !== 0;
  const { installedBibles } = useInstalledBibles();
  const currentItem = getCurrentItem();
  const currentVerse = currentItem?.verse;
  const currentVersionName =
    installedBibles.find((version) => version.id === currentBibleVersion)
      ?.shortName || installedBibles[0].shortName;

  const versionHandlePresentModalPress = useCallback(() => {
    versionRef.current?.present();
  }, []);

  const goSearchScreen = () => {
    clearHighlights();
    // @ts-ignore
    navigation.navigate('(search)', { book: book });
  };

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
        name: 'SquareSplitVertical',
        action: () => {
          toggleSplitMode();
          toggleBottomSideSearching(!isSplitActived);
        },
        ref: fav,
        isIonicon: false,
        color: isSplitActived ? theme.colors.notification : theme.colors.text,
      },
      {
        name: 'ArrowBigLeftDash',
        action: moveBackInHistory,
        ref: setting,
        isIonicon: true,
        disabled: isSplitActived,
        color: shouldBackward ? theme.colors.notification : theme.colors?.text,
      },
      {
        name: 'ArrowBigRightDash',
        action: moveForwardInHistory,
        ref: search,
        isIonicon: true,
        disabled: isSplitActived,
        color: shouldForward ? theme.colors.notification : theme.colors?.text,
      },
      { name: 'Search', action: goSearchScreen, ref: search },
    ];
    return options.filter((x) => !x.disabled);
  }, [isSplitActived, shouldForward, shouldBackward]);

  const onSelect = (version: string) => {
    clearHighlights();
    selectBibleVersion(version);
    versionRef.current?.dismiss();
  };
  const progressValue = useMemo(() => {
    return (currentVerse || 0) / (chapterVerseLength || 10);
  }, [currentVerse, chapterVerseLength]);

  return (
    <View style={styles.header}>
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity
          ref={dashboard}
          style={styles.iconContainer}
          onPress={() => router.navigate('(dashboard)')}
        >
          <Icon
            name='House'
            size={headerIconSize}
            color={theme.colors.primary}
          />
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
          ref={bibleVersion}
          style={styles.headerEnd}
          onPress={versionHandlePresentModalPress}
        >
          <Icon
            name={isNTV ? 'BookText' : 'Crown'}
            size={headerIconSize}
            color={theme.colors.primary}
          />
          {!isSmallSDevice && (
            <Text style={styles.text}>{currentVersionName}</Text>
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
      paddingVertical: 10,
      backgroundColor: colors.background + "cc",
      width: "100%",
      borderWidth: 0.5,
    },
    progressContainer: {
      width: "100%",
      marginVertical: 8,
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
      color: colors.primary,
    },
    text: {
      color: dark ? "white" : colors.background,
      paddingHorizontal: 4,
      fontSize: 18,
      backgroundColor: colors.notification,
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
      // fontWeight: "bold",
    },
  });

export default CustomHeader;
