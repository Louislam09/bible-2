import { MaterialCommunityIcons } from "@expo/vector-icons";
import { WINDOW_WIDTH } from "@gorhom/bottom-sheet";
import DAILY_VERSES from "constants/dailyVerses";
import { GET_DAILY_VERSE } from "constants/Queries";
import { useBibleContext } from "context/BibleContext";
import { useDBContext } from "context/databaseContext";
import { useRouter } from "node_modules/expo-router/build";
import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { IVerseItem, TTheme } from "types";
import { getVerseTextRaw } from "utils/getVerseTextRaw";
import { Text, View } from "./Themed";

const defaultDailyVerse = {
  book_number: 0,
  chapter: 3,
  text: "Oh Jehová, he oído tu palabra, y temí. Oh Jehová, aviva tu obra en medio de los tiempos, En  medio de los tiempos hazla conocer; En la ira acuérdate  de la misericordia.",
  verse: 2,
  bookName: "Habacuc",
  is_favorite: false,
};

const defaultDailyObject = {
  book_number: 510,
  chapter: 3,
  verse: 19,
};

type DailyVerseProps = {
  theme: TTheme;
  dailyVerseObject?: {
    book_number: number;
    chapter: number;
    text: string;
    verse: number;
    bookName: string;
    is_favorite: boolean;
  };
};

const DailyVerse = ({
  theme,
  dailyVerseObject,
}: DailyVerseProps) => {
  const router = useRouter()
  const { executeSql, myBibleDB } = useDBContext();
  const [dailyVerse, setDailyVerse] = useState<IVerseItem>(
    dailyVerseObject || defaultDailyVerse
  );
  const { currentBibleVersion, orientation = "PORTRAIT" } = useBibleContext();
  const styles = getStyles(theme);
  const isPortrait = orientation === "PORTRAIT";
  const isDefaultVerse = dailyVerseObject?.bookName;

  useEffect(() => {
    if (!myBibleDB || !executeSql) return;
    if (isDefaultVerse) return;
    const currentDate: any = new Date();
    const lastDayOfYear: any = new Date(currentDate.getFullYear(), 0, 0);
    const dayPassed = Math.floor((currentDate - lastDayOfYear) / 86400000);

    const { book_number, chapter, verse } =
      DAILY_VERSES[dayPassed] || defaultDailyObject;
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
  }, [currentBibleVersion, myBibleDB, dailyVerseObject]);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => {
        if (isDefaultVerse) return;
        router.navigate("Home", {
          book: dailyVerse.bookName,
          chapter: dailyVerse.chapter,
          verse: dailyVerse?.verse,
        });
      }}
      style={[
        styles.dailyVerseContainer,
        { width: isPortrait ? WINDOW_WIDTH : WINDOW_WIDTH / 2 },
      ]}
    >
      <View style={styles.verse}>
        {!isDefaultVerse && (
          <Text style={[styles.verseTitle]}>Versiculo del dia</Text>
        )}
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
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    dailyVerseContainer: {
      backgroundColor: "transparent",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      minHeight: 140,
      flex: 1,
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
    separator: {
      margin: 10,
    },
    text: {
      color: "white",
    },
  });

export default DailyVerse;
