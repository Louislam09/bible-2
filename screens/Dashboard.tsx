import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useNavigation, useTheme } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import Animation from "components/Animation";
import BottomModal from "components/BottomModal";
import { Text, View } from "components/Themed";
import Settings from "components/home/header/Settings";
import VersionList from "components/home/header/VersionList";
import { GET_DAILY_VERSE } from "constants/Queries";
import DAILY_VERSES from "constants/dailyVerses";
import { useBibleContext } from "context/BibleContext";
import { useDBContext } from "context/databaseContext";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { EBibleVersions, IVerseItem, TTheme } from "types";
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
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const { executeSql, myBibleDB } = useDBContext();
  const { currentBibleVersion, selectBibleVersion, clearHighlights } =
    useBibleContext();
  const theme = useTheme();
  const navigation = useNavigation();
  const styles = getStyles(theme);
  const isNTV = currentBibleVersion === EBibleVersions.NTV;
  const fontBottomSheetModalRef = useRef<BottomSheetModal>(null);
  const versionRef = useRef<BottomSheetModal>(null);
  const [dailyVerse, setDailyVerse] = useState<IVerseItem>(defaultDailyVerse);
  const dashboardImage = require("../assets/lottie/dashboard.json");

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
        setDailyVerse(response?.[0]);
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

  const options: IDashboardOption[] = [
    {
      icon: isNTV ? "book-cross" : "crown-outline",
      label: "Santa Escritura",
      action: () => navigation.navigate("Home", { isTour: false }),
      tag: isNTV ? "book-cross" : "crown-outline",
    },
    {
      icon: "text-search",
      label: "Buscador",
      action: () => navigation.navigate("Search", {}),
    },
    {
      icon: "star-outline",
      label: "Versiculos Favoritos",
      action: () => navigation.navigate("Favorite"),
    },
    {
      icon: "book-open-page-variant-outline",
      label: "Versiones",
      action: versionHandlePresentModalPress,
    },
    {
      icon: "television-guide",
      label: "Como Usar?",
      action: () => navigation.navigate("Onboarding"),
    },
    {
      icon: "notebook-outline",
      label: "Notas",
      action: () => navigation.navigate("Notes"),
    },
    {
      icon: "settings-outline",
      label: "Ajustes",
      isIonicon: true,
      action: fontHandlePresentModalPress,
    },
  ];

  const renderItem = ({ item }: { item: IDashboardOption }) => (
    <TouchableWithoutFeedback
      onPress={item.action}
      style={[
        {
          padding: 0,
          flex: 1,
          display: "flex",
          width: SCREEN_WIDTH / 3,
          alignItems: "center",
          justifyContent: "center",
        },
      ]}
      disabled={item.disabled}
    >
      <View style={[styles.card, item.disabled && { backgroundColor: "#ddd" }]}>
        {item.isIonicon ? (
          <Ionicons name={item.icon} style={[styles.cardIcon]} />
        ) : (
          <MaterialCommunityIcons name={item.icon} style={[styles.cardIcon]} />
        )}

        <Text style={[styles.cardLabel]}>{item.label}</Text>
      </View>
    </TouchableWithoutFeedback>
  );

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Animation
          backgroundColor={"transparent"}
          source={dashboardImage}
          loop
          size={{ width: 220, height: 220 }}
          colorFilters={[
            { color: theme.colors.text, keypath: "Secondary shapes" },
            { color: theme.colors.text, keypath: "Clouds" },
            { color: theme.colors.text, keypath: "Plants" },
          ]}
        />
      </View>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() =>
          navigation.navigate("Home", {
            book: dailyVerse.bookName,
            chapter: dailyVerse.chapter,
          })
        }
        style={[styles.dailyVerseContainer, { width: SCREEN_WIDTH }]}
      >
        <View style={styles.verse}>
          <Text style={[styles.verseTitle]}>Versiculo del dia</Text>
          <Text style={[styles.verseText]}>
            <MaterialCommunityIcons
              name="format-quote-open"
              style={[styles.verseQuoteIcon]}
            />
            {`${dailyVerse.verse} ${getVerseTextRaw(dailyVerse.text)}`}
          </Text>
          <Text
            style={[styles.verseReference]}
          >{`${dailyVerse.bookName} ${dailyVerse.chapter}:${dailyVerse.verse}`}</Text>
        </View>
      </TouchableOpacity>
      <View style={[styles.optionContainer, { width: SCREEN_WIDTH }]}>
        <FlashList
          contentContainerStyle={{ padding: 15 }}
          data={options}
          keyExtractor={(item) => item.label}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          estimatedItemSize={5}
          numColumns={3}
        />
      </View>
      <BottomModal startAT={2} ref={fontBottomSheetModalRef}>
        <Settings theme={theme} />
      </BottomModal>
      <BottomModal startAT={0} ref={versionRef}>
        <VersionList {...{ currentBibleVersion, onSelect, theme }} />
      </BottomModal>
    </View>
  );
};

export default Dashboard;

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    container: {
      display: "flex",
      flex: 1,
      alignItems: "center",
      justifyContent: "space-evenly",
      paddingTop: 50,
    },
    imageContainer: {
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 15,
      padding: 5,
      backgroundColor: colors.border + "9c",
    },
    dailyVerseContainer: {
      backgroundColor: "transparent",
      alignItems: "center",
      justifyContent: "center",
      marginVertical: 10,
      width: "100%",
      minHeight: 140,
    },
    optionContainer: {
      flex: 1,
      width: "100%",
      backgroundColor: "transparent",
      minHeight: 390,
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
      textAlign: "center",
      color: colors.border,
      fontWeight: "bold",
    },
    cardIcon: {
      color: colors.notification,
      fontSize: 36,
    },
    text: {
      color: "white",
    },
  });
