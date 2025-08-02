import DAILY_VERSES from "@/constants/dailyVerses";
import { GET_DAILY_VERSE } from "@/constants/Queries";
import { useDBContext } from "@/context/databaseContext";
import { bibleState$ } from "@/state/bibleState";
import { IVerseItem, pbUser, Screens, TTheme } from "@/types";
import { getVerseTextRaw } from "@/utils/getVerseTextRaw";
import { useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import Icon from "../Icon";
import { Text, View } from "../Themed";
import { useNotificationService } from "@/services/notificationServices";

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
  user: pbUser | null;
};

const DailyVerseTwo = ({ dailyVerseObject, theme, user }: DailyVerseProps) => {
  const { sendCustomNotification } = useNotificationService();
  const navigation = useNavigation();
  const { executeSql, myBibleDB, isMyBibleDbLoaded } = useDBContext();
  const [dailyVerse, setDailyVerse] = useState<IVerseItem>(
    dailyVerseObject || defaultDailyVerse
  );
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
        const dailyVerseData = response?.length
          ? response?.[0]
          : defaultDailyVerse;
        setDailyVerse(dailyVerseData);

        // if (user) {
        //   const nameInfo = user?.name?.split(" ") || [];
        //   const userName = nameInfo[0];

        //   const ref = `${dailyVerseData?.bookName} ${dailyVerseData?.chapter}:${dailyVerseData?.verse}`;
        //   const verseText = getVerseTextRaw(dailyVerseData?.text);

        //   const title = user
        //     ? `✨ Shalom, ${userName}! — Verso del Día ✨`
        //     : "✨Shalom! — Verso del Día ✨";
        //   const body = `📖 ${ref}\n\n“${verseText}”\n`;

        //   sendCustomNotification(title, body, { type: "daily-verse" }, 1);
        // }
      } catch (error) {
        console.log(error);
      }
    })();
  }, [isMyBibleDbLoaded, myBibleDB, dailyVerseObject]);

  return (
    <View style={styles.dailyVerseContainer}>
      <View style={styles.verseTitle}>
        <Icon
          name={"BookOpen"}
          size={24}
          color={theme.dark ? "#ffffff" : theme.colors.text + 99}
        />
        <Text style={styles.title}>Versículo del Día</Text>
      </View>
      <Icon
        name={"Quote"}
        size={34}
        // color={theme.colors.text + 70}
        color={theme.dark ? "#ffffff4c" : theme.colors.text + 70}
        style={styles.quoteIcon}
      />
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
        style={[styles.verseContainer, { position: "relative" }]}
      >
        <Text style={styles.verseText}>{`${getVerseTextRaw(
          dailyVerse?.text || ""
        )}`}</Text>
      </TouchableOpacity>
      <Text style={styles.verseRef}>
        {`${dailyVerse.bookName} ${dailyVerse.chapter}:${dailyVerse?.verse}`}
      </Text>
    </View>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    dailyVerseContainer: {
      alignItems: "flex-start",
      justifyContent: "center",
      width: "100%",
      flex: 1,
      backgroundColor: colors.text + 20,
      padding: 15,
      paddingHorizontal: 18,
      marginBottom: 16,
      borderRadius: 16,
      gap: 8,
    },
    infoIcon: {
      position: "absolute",
      top: 0,
      right: 0,
      zIndex: 100,
    },
    quoteIcon: {
      position: "absolute",
      top: 10,
      right: 10,
      zIndex: -1,
    },
    verseTitle: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: "transparent",
    },
    title: {
      fontSize: 18,
      fontWeight: "bold",
    },
    verseContainer: {
      borderRadius: 8,
      alignItems: "flex-start",
    },
    verseRef: {
      color: colors.text,
      fontSize: 18,
      fontStyle: "italic",
      alignSelf: "flex-end",
    },
    verseText: {
      color: colors.text,
      fontSize: 18,
      fontStyle: "italic",
      zIndex: 1,
    },
  });

export default DailyVerseTwo;
