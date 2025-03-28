import DAILY_VERSES from "@/constants/dailyVerses";
import { GET_DAILY_VERSE } from "@/constants/Queries";
import { useBibleContext } from "@/context/BibleContext";
import { useDBContext } from "@/context/databaseContext";
import { storedData$, useStorage } from "@/context/LocalstoreContext";
import { bibleState$ } from "@/state/bibleState";
import { IVerseItem, Screens, TTheme } from "@/types";
import { getVerseTextRaw } from "@/utils/getVerseTextRaw";
import { showToast } from "@/utils/showToast";
import { useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import Icon from "../Icon";
import { Text, View } from "../Themed";
import { use$ } from "@legendapp/state/react";
import ProfileCard from "../UserProfile";

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
  dailyVerseObject?: {
    book_number: number;
    chapter: number;
    text: string;
    verse: number;
    bookName: string;
    is_favorite: boolean;
  };
  theme: TTheme;
};

const DailyVerseTwo = ({ dailyVerseObject, theme }: DailyVerseProps) => {
  const navigation = useNavigation();
  const { executeSql, myBibleDB, isMyBibleDbLoaded } = useDBContext();
  const [dailyVerse, setDailyVerse] = useState<IVerseItem>(
    dailyVerseObject || defaultDailyVerse
  );
  const user = use$(() => storedData$.user.get());
  const styles = getStyles(theme);
  const isDefaultVerse = dailyVerseObject?.bookName;

  useEffect(() => {
    if (!isMyBibleDbLoaded) return;
    if (!myBibleDB || !executeSql) return;
    if (isDefaultVerse) return;
    const currentDate: any = new Date();
    const lastDayOfYear: any = new Date(currentDate.getFullYear(), 0, 0);
    const dayPassed = Math.floor((currentDate - lastDayOfYear) / 86400000);

    const { book_number, chapter, verse } =
      DAILY_VERSES[dayPassed] || defaultDailyObject;
    (async () => {
      try {
        const response: any = await executeSql(
          GET_DAILY_VERSE,
          [book_number, chapter, verse],
          "GET_DAILY_VERSE2"
        );
        setDailyVerse(response?.length ? response?.[0] : defaultDailyVerse);
      } catch (error) {
        console.log(error);
      }
    })();
  }, [isMyBibleDbLoaded, myBibleDB, dailyVerseObject]);

  return (
    <View style={styles.dailyVerseContainer}>
      <TouchableOpacity
        onPress={() => navigation.navigate(Screens.Onboarding)}
        style={styles.infoIcon}
      >
        <Icon name={"Info"} size={20} color={"white"} />
      </TouchableOpacity>
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        {user && <ProfileCard user={user} />}
      </View>
      <View style={styles.header}>
        <Text style={styles.title}>Versículo del día</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            if (isDefaultVerse) return;
            const queryInfo = {
              book: dailyVerse.bookName,
              chapter: dailyVerse.chapter,
              verse: dailyVerse?.verse,
            };
            bibleState$.changeBibleQuery({
              ...queryInfo,
              shouldFetch: true,
              isHistory: false,
            });
            navigation.navigate(Screens.Home, queryInfo);
          }}
          style={styles.verseContainer}
        >
          <Text style={styles.verseRef}>
            {`${dailyVerse.bookName} ${dailyVerse.chapter}:${dailyVerse?.verse}`}
          </Text>
          <Text style={styles.verseText}>{`${
            dailyVerse?.verse
          } ${getVerseTextRaw(dailyVerse?.text || "")}`}</Text>
        </TouchableOpacity>
      </View>
    </View>
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
      marginTop: 10,
    },
    infoIcon: {
      position: "absolute",
      top: 0,
      right: 0,
      zIndex: 100,
    },
    header: {
      backgroundColor: "transparent",
      marginBottom: 16,
      alignItems: "center",
    },
    title: {
      width: "100%",
      color: colors.notification,
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 8,
    },
    verseContainer: {
      backgroundColor: colors.text + 20,
      padding: 12,
      borderRadius: 8,
    },
    verseRef: {
      color: colors.text,
      fontSize: 18,
      fontStyle: "italic",
      textAlign: "center",
      fontWeight: "bold",
    },
    verseText: {
      color: colors.text,
      fontSize: 18,
      fontStyle: "italic",
      textAlign: "center",
    },
  });

export default DailyVerseTwo;
