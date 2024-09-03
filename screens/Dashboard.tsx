import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { BottomSheetModal, WINDOW_WIDTH } from "@gorhom/bottom-sheet";
import { useNavigation, useRoute, useTheme } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import BottomModal from "components/BottomModal";
import DailyVerse from "components/DailyVerse";
import Icon, { IconProps } from "components/Icon";
import { Text, View } from "components/Themed";
import VoiceList from "components/VoiceList";
import Settings from "components/home/header/Settings";
import VersionList from "components/home/header/VersionList";
import { useBibleContext } from "context/BibleContext";
import { useStorage } from "context/LocalstoreContext";
import React, { useCallback, useRef } from "react";
import { StyleSheet, ToastAndroid, useWindowDimensions } from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import {
  EBibleVersions,
  IoniconsIconNameType,
  MaterialIconNameType,
  Screens,
  TTheme,
} from "types";

type IDashboardOption = {
  icon: IconProps["name"];
  // icon: MaterialIconNameType | IoniconsIconNameType;
  label: string;
  action: () => void;
  disabled?: boolean;
  isIonicon?: boolean;
  tag?: string;
};

const Dashboard = () => {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const {
    currentBibleVersion,
    selectBibleVersion,
    clearHighlights,
    orientation = "PORTRAIT",
  } = useBibleContext();
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const isPortrait = orientation === "PORTRAIT";
  const styles = getStyles(theme, isPortrait);
  const isNTV = currentBibleVersion === EBibleVersions.NTV;
  const fontBottomSheetModalRef = useRef<BottomSheetModal>(null);
  const voiceBottomSheetModalRef = useRef<BottomSheetModal>(null);
  const versionRef = useRef<BottomSheetModal>(null);
  const columnNumber = 3;
  const {
    storedData,
    historyManager: { getCurrentItem },
  } = useStorage();
  const {
    lastBook,
    lastChapter,
    lastVerse,
    lastBottomSideBook,
    lastBottomSideChapter,
    lastBottomSideVerse,
    isSongLyricEnabled,
  } = storedData;
  const {
    book: lastHistoryBook,
    chapter: lastHistoryChapter,
    verse: lastHistoryVerse,
  } = (getCurrentItem() as any) || {};

  const fontHandlePresentModalPress = useCallback(() => {
    fontBottomSheetModalRef.current?.present();
  }, []);
  const voiceHandlePresentModalPress = useCallback(() => {
    voiceBottomSheetModalRef.current?.present();
  }, []);

  const versionHandlePresentModalPress = useCallback(() => {
    versionRef.current?.present();
  }, []);

  const onSelect = (version: string) => {
    clearHighlights();
    selectBibleVersion(version);
    versionRef.current?.dismiss();
  };

  const homePageInitParams = {
    book: lastHistoryBook || lastBook || "Génesis",
    chapter: lastHistoryChapter || lastChapter || 1,
    verse: lastHistoryVerse || lastVerse || 1,
    bottomSideBook: lastBottomSideBook || "Génesis",
    bottomSideChapter: lastBottomSideChapter || 1,
    bottomSideVerse: lastBottomSideVerse || 0,
    isTour: false,
    isHistory: true,
  };

  const onSong = () => {
    if (!isSongLyricEnabled) {
      ToastAndroid.show(
        "Busca 📖 y presiona el nombre del himnario 🔒🔑",
        ToastAndroid.LONG
      );
      return;
    }
    navigation.navigate("Song");
  };

  const options: IDashboardOption[] = [
    {
      icon: isNTV ? "BookText" : "Crown",
      label: "Santa Escritura",
      action: () => navigation.navigate(Screens.Home, homePageInitParams),
      tag: isNTV ? "book-cross" : "crown-outline",
    },
    {
      icon: "LayoutGrid",
      label: "Lista de Libro",
      action: () =>
        navigation?.navigate(Screens.ChooseBook, { ...route.params }),
    },
    {
      icon: "BookA",
      label: "Diccionarios",
      action: () =>
        navigation?.navigate(Screens.DictionarySearch, { word: "" }),
    },
    {
      icon: "SwatchBook",
      label: "Concordancia Escritural",
      action: () => navigation.navigate(Screens.Concordance, {}),
    },

    {
      icon: "Star",
      // icon: "star-outline",
      label: "Versiculos Favoritos",
      action: () => navigation.navigate(Screens.Favorite),
    },
    {
      icon: "UserSearch",
      // icon: "person-outline",
      label: "Buscar Personaje",
      isIonicon: true,
      action: () => navigation.navigate(Screens.Character),
    },
    {
      icon: "Music4",
      // icon: "musical-notes-outline",
      label: "Himnos",
      isIonicon: true,
      action: onSong,
    },
    {
      icon: "AudioLines",
      // icon: "waveform",
      label: "Selecciona Una Voz",
      action: voiceHandlePresentModalPress,
    },
    {
      icon: "NotebookText",
      // icon: "notebook-outline",
      label: "Notas",
      action: () => navigation.navigate(Screens.Notes),
    },
    {
      icon: "MonitorDown",
      // icon: "download",
      label: "Gestor de descargas",
      action: () => navigation.navigate(Screens.DownloadManager),
    },
    {
      icon: "FileStack",
      // icon: "book-open-page-variant-outline",
      label: "Versiones",
      action: versionHandlePresentModalPress,
    },
    {
      icon: "Search",
      // icon: "text-search",
      label: "Buscador",
      action: () => navigation.navigate(Screens.Search, {}),
    },

    {
      icon: "Settings",
      // icon: "settings-outline",
      label: "Ajustes",
      isIonicon: true,
      // action: fontHandlePresentModalPress,
      action: () => navigation.navigate(Screens.Settings),
    },
    {
      icon: "HandHelping",
      // icon: "television-guide",
      label: "Como Usar?",
      action: () => navigation.navigate(Screens.Onboarding),
    },
  ];

  const renderItem = ({
    item,
    index,
  }: {
    item: IDashboardOption;
    index: number;
  }) => (
    <TouchableWithoutFeedback
      onPress={item.action}
      style={[
        {
          padding: 0,
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
        isPortrait && { width: SCREEN_WIDTH / columnNumber },
      ]}
      disabled={item.disabled}
    >
      <View
        style={[
          styles.card,
          item.disabled && { backgroundColor: "#ddd" },
          index === 0 && {
            backgroundColor: theme.colors.notification,
          },
        ]}
      >
        <Icon
          name={item.icon as any}
          size={36}
          style={[styles.cardIcon]}
          color={index === 0 ? "white" : theme.colors.notification}
        />

        <Text style={[styles.cardLabel, index === 0 && { color: "white" }]}>
          {item.label}
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );

  return (
    <View
      key={orientation + theme.dark}
      style={[styles.container, !isPortrait && { flexDirection: "row" }]}
    >
      <DailyVerse navigation={navigation} theme={theme} />

      <View
        style={[
          styles.optionContainer,
          {
            width: isPortrait ? WINDOW_WIDTH : WINDOW_WIDTH / 2,
          },
          isPortrait && { padding: 15 },
          !isPortrait && { paddingVertical: 50 },
        ]}
      >
        <FlashList
          data={options}
          keyExtractor={(item) => item.label}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          estimatedItemSize={5}
          numColumns={columnNumber}
        />
      </View>
      <BottomModal shouldScroll startAT={2} ref={voiceBottomSheetModalRef}>
        <VoiceList theme={theme} />
      </BottomModal>
      <BottomModal shouldScroll startAT={2} ref={fontBottomSheetModalRef}>
        <Settings theme={theme} />
      </BottomModal>
      <BottomModal shouldScroll startAT={1} ref={versionRef}>
        <VersionList {...{ currentBibleVersion, onSelect, theme }} />
      </BottomModal>
    </View>
  );
};

export default Dashboard;

const getStyles = ({ colors }: TTheme, isPortrait: boolean) =>
  StyleSheet.create({
    container: {
      display: "flex",
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    optionContainer: {
      flex: 1,
      width: "100%",
      backgroundColor: "transparent",
      minHeight: 450,
    },
    card: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-evenly",
      padding: 10,
      paddingHorizontal: 5,
      borderRadius: 15,
      elevation: 5,
      height: 100,
      width: 100,
      margin: 5,
      marginBottom: 0,
      backgroundColor: "white",
    },
    separator: {
      margin: 10,
    },
    cardLabel: {
      backgroundColor: "transparent",
      textAlign: "center",
      color: colors.border,
      fontWeight: "bold",
    },
    cardIcon: {
      backgroundColor: "transparent",
      color: colors.notification,
      fontSize: 36,
    },
    text: {
      color: "white",
    },
  });
