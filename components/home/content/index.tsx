import { useRoute, useTheme } from "@react-navigation/native";
import React, { FC, useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, StyleSheet, View } from "react-native";
import { DB_BOOK_NAMES } from "../../../constants/BookNames";
import { useDBContext } from "../../../context/databaseContext";
import { HomeParams, TTheme } from "../../../types";

import { useBibleContext } from "context/BibleContext";
import { useStorage } from "context/LocalstoreContext";
import getCurrentDbName from "utils/getCurrentDB";
import { QUERY_BY_DB } from "../../../constants/Queries";
import Chapter from "./Chapter";

interface BookContentInterface {}

const BookContent: FC<BookContentInterface> = ({}) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const {
    storedData: { currentBibleVersion },
    saveData,
  } = useStorage();
  const { setverseInStrongDisplay, clearHighlights, addToHistory } =
    useBibleContext();
  const { myBibleDB, executeSql } = useDBContext();
  const route = useRoute();
  const {
    book = "Mateo",
    chapter,
    verse,
    isHistory,
  } = route.params as HomeParams;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({});
  const currentBook = DB_BOOK_NAMES.find((x) => x.longName === book);
  const dimensions = Dimensions.get("window");

  useEffect(() => {
    (async () => {
      clearHighlights();
      setLoading(true);

      if (myBibleDB && executeSql) {
        setData({});
        setverseInStrongDisplay(0);
        const query = QUERY_BY_DB[getCurrentDbName(currentBibleVersion)];
        const promises = [
          executeSql(myBibleDB, query.GET_VERSES_BY_BOOK_AND_CHAPTER, [
            currentBook?.bookNumber,
            chapter || 1,
          ]),
          executeSql(myBibleDB, query.GET_SUBTITLE_BY_BOOK_AND_CHAPTER, [
            currentBook?.bookNumber,
            chapter || 1,
          ]),
        ];

        Promise.all(promises)
          .then(([verses, subtitles]) => {
            setLoading(false);
            saveData({
              lastBook: book,
              lastChapter: chapter,
              lastVerse: verse,
            });
            !isHistory &&
              addToHistory &&
              addToHistory({ book, verse, chapter });
            setData({ verses, subtitles });
          })
          .catch((error) => {
            console.error("Error:content:", error);
          });
      }
    })();

    return () => {};
  }, [myBibleDB, book, chapter, verse]);

  return (
    <View style={styles.bookContainer}>
      {!loading ? (
        <Chapter dimensions={dimensions} item={data} />
      ) : (
        <View style={styles.activiyContainer}>
          <ActivityIndicator style={{ flex: 1 }} />
        </View>
      )}
    </View>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    bookContainer: {
      position: "relative",
      flex: 1,
      backgroundColor: colors.background,
    },
    activiyContainer: { flex: 1, display: "flex", alignItems: "center" },
  });

export default BookContent;
