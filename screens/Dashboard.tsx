import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { BottomSheetModal, WINDOW_WIDTH } from "@gorhom/bottom-sheet";
import { useNavigation, useRoute, useTheme } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import BottomModal from "components/BottomModal";
import { Text, View } from "components/Themed";
import Settings from "components/home/header/Settings";
import VersionList from "components/home/header/VersionList";
import { GET_DAILY_VERSE } from "constants/Queries";
import DAILY_VERSES from "constants/dailyVerses";
import { useBibleContext } from "context/BibleContext";
import { useStorage } from "context/LocalstoreContext";
import { useDBContext } from "context/databaseContext";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  ToastAndroid,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { EBibleVersions, IVerseItem, Screens, TTheme } from "types";
import { getVerseTextRaw } from "utils/getVerseTextRaw";

type IDashboardOption = {
  icon: string | any;
  label: string;
  action: () => void;
  disabled?: boolean;
  isIonicon?: boolean;
  tag?: string;
};

const defaultDailyVerse = {
  book_number: 0,
  chapter: 3,
  text: "Oh Jehová, he oído tu palabra, y temí. Oh Jehová, aviva tu obra en medio de los tiempos, En  medio de los tiempos hazla conocer; En la ira acuérdate  de la misericordia.",
  verse: 2,
  bookName: "Habacuc",
  is_favorite: false,
};

const defaultDailyObject = {
  book_number: 510,
  chapter: 3,
  verse: 19,
};

const Dashboard = () => {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const { executeSql, myBibleDB } = useDBContext();
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
  const versionRef = useRef<BottomSheetModal>(null);
  const [dailyVerse, setDailyVerse] = useState<IVerseItem>(defaultDailyVerse);
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

  useEffect(() => {
    if (!myBibleDB || !executeSql) return;
    const currentDate: any = new Date();
    const lastDayOfYear: any = new Date(currentDate.getFullYear(), 0, 0);
    const dayPassed = Math.floor((currentDate - lastDayOfYear) / 86400000);

    const { book_number, chapter, verse } =
      DAILY_VERSES[dayPassed] ?? defaultDailyObject;
    (async () => {
      try {
        const response: any = await executeSql(myBibleDB, GET_DAILY_VERSE, [
          book_number,
          chapter,
          verse,
        ]);
        setDailyVerse(response?.length ? response?.[0] : defaultDailyVerse);
      } catch (error) {
        console.log(error);
      }
    })();
  }, [currentBibleVersion, myBibleDB]);

  const fontHandlePresentModalPress = useCallback(() => {
    fontBottomSheetModalRef.current?.present();
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
      icon: isNTV ? "book-cross" : "crown-outline",
      label: "Santa Escritura",
      action: () => navigation.navigate(Screens.Home, homePageInitParams),
      tag: isNTV ? "book-cross" : "crown-outline",
    },
    {
      icon: "book-outline",
      label: "Seleccion de Libro",
      action: () =>
        navigation?.navigate(Screens.ChooseBook, { ...route.params }),
    },
    {
      icon: "text-box-search-outline",
      label: "Concordancia Escritural",
      action: () => navigation.navigate(Screens.Concordance, {}),
    },

    {
      icon: "star-outline",
      label: "Versiculos Favoritos",
      action: () => navigation.navigate(Screens.Favorite),
    },
    {
      icon: "person-outline",
      label: "Buscar Personaje",
      isIonicon: true,
      action: () => navigation.navigate(Screens.Character),
    },
    {
      icon: "musical-notes-outline",
      label: "Himnos",
      isIonicon: true,
      action: onSong,
    },
    {
      icon: "notebook-outline",
      label: "Notas",
      action: () => navigation.navigate(Screens.Notes),
    },
    {
      icon: "download",
      label: "Gestor de descargas",
      action: () => navigation.navigate(Screens.DownloadManager),
    },
    {
      icon: "book-open-page-variant-outline",
      label: "Versiones",
      action: versionHandlePresentModalPress,
    },
    {
      icon: "text-search",
      label: "Buscador",
      action: () => navigation.navigate(Screens.Search, {}),
    },

    {
      icon: "settings-outline",
      label: "Ajustes",
      isIonicon: true,
      action: fontHandlePresentModalPress,
    },

    {
      icon: "television-guide",
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
        {item.isIonicon ? (
          <Ionicons
            name={item.icon}
            style={[styles.cardIcon, index === 0 && { color: "white" }]}
          />
        ) : (
          <MaterialCommunityIcons
            name={item.icon}
            style={[styles.cardIcon, index === 0 && { color: "white" }]}
          />
        )}

        <Text style={[styles.cardLabel, index === 0 && { color: "white" }]}>
          {item.label}
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );

  return (
    <View
      key={orientation}
      style={[styles.container, !isPortrait && { flexDirection: "row" }]}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() =>
          navigation.navigate("Home", {
            book: dailyVerse.bookName,
            chapter: dailyVerse.chapter,
            verse: dailyVerse?.verse,
          })
        }
        style={[
          styles.dailyVerseContainer,
          { width: isPortrait ? WINDOW_WIDTH : WINDOW_WIDTH / 2 },
        ]}
      >
        <View style={styles.verse}>
          <Text style={[styles.verseTitle]}>Versiculo del dia</Text>
          <Text style={[styles.verseText]}>
            <MaterialCommunityIcons
              name="format-quote-open"
              style={[styles.verseQuoteIcon]}
            />
            {`${dailyVerse?.verse} ${getVerseTextRaw(dailyVerse?.text || "")}`}
          </Text>
          <Text
            style={[styles.verseReference]}
          >{`${dailyVerse.bookName} ${dailyVerse.chapter}:${dailyVerse?.verse}`}</Text>
        </View>
      </TouchableOpacity>
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
    dailyVerseContainer: {
      backgroundColor: "transparent",
      alignItems: "center",
      justifyContent: "center",
      marginVertical: isPortrait ? 10 : 0,
      width: "100%",
      minHeight: 140,
      flex: 0.5,
    },
    optionContainer: {
      flex: 1,
      width: "100%",
      backgroundColor: "transparent",
      minHeight: 400,
    },
    verse: {
      display: "flex",
      backgroundColor: "transparent",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingHorizontal: 10,
    },
    verseTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.notification,
    },
    verseText: {
      fontSize: 18,
      color: colors.text,
      textAlign: "center",
    },
    verseReference: {
      fontSize: 16,
      //   color: "white",
      alignSelf: "flex-end",
      fontWeight: "bold",
      color: colors.notification,
    },
    verseQuoteIcon: {
      fontSize: 30,
      color: colors.notification,
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
