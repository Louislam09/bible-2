import { useRoute, useTheme } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import React, { FC, useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, StyleSheet, View } from "react-native";
import { DB_BOOK_NAMES } from "../../../constants/BookNames";
import { useDBContext } from "../../../context/databaseContext";
import { HomeParams, IBookVerse, TTheme } from "../../../types";

import Chapter from "./Chapter";
import {
  GET_SUBTITLE_BY_BOOK_AND_CHAPTER,
  GET_VERSES_BY_BOOK_AND_CHAPTER,
  QUERY_BY_DB,
} from "../../../constants/Queries";
import { useStorage } from "context/LocalstoreContext";
import getCurrentDbName from "utils/getCurrentDB";

interface BookContentInterface {}

const BookContent: FC<BookContentInterface> = ({}) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const {
    storedData: { currentBibleVersion },
    saveData,
  } = useStorage();
  const { myBibleDB, executeSql } = useDBContext();
  const route = useRoute();
  const { book = "Mateo", chapter, verse } = route.params as HomeParams;
  const bookRef = React.useRef<FlashList<IBookVerse[]>>(null);
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = useState<any>({});
  const currentBook = DB_BOOK_NAMES.find((x) => x.longName === book);
  const dimensions = Dimensions.get("window");

  useEffect(() => {
    // if(loading) return
    (async () => {
      if (myBibleDB && executeSql) {
        setData({});
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
            saveData({ lastBook: book, lastChapter: chapter });
            setData({ verses, subtitles });
          })
          .catch((error) => {
            console.error("Error:content:", error);
          });
      }
    })();

    return () => {};
  }, [myBibleDB, book, chapter]);

  return (
    <View style={styles.bookContainer}>
      {!loading ? (
        <Chapter dimensions={dimensions} item={data} />
      ) : (
        <View style={{ flex: 1, display: "flex", alignItems: "center" }}>
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
    chapterContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    chapterHeader: {
      paddingVertical: 15,
      display: "flex",
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
    },
    chapterHeaderTitle: {
      fontSize: 20,
      fontWeight: "bold",
    },
    verseContent: {
      height: "100%",
      paddingRight: 10,
      paddingBottom: 10,
    },
    verseContainer: {},
    verse: {
      paddingHorizontal: 4,
      marginVertical: 5,
      fontSize: 18,
    },
  });

export default BookContent;
