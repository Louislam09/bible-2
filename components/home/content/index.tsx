import { useNavigation, useRoute, useTheme } from "@react-navigation/native";
import React, { FC, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Dimensions,
  StyleSheet,
  View,
} from "react-native";
import { DB_BOOK_NAMES } from "../../../constants/BookNames";
import { useDBContext } from "../../../context/databaseContext";
import { HomeParams, TTheme } from "../../../types";

import { useBibleContext } from "context/BibleContext";
import { useStorage } from "context/LocalstoreContext";
import getCurrentDbName from "utils/getCurrentDB";
import { QUERY_BY_DB } from "../../../constants/Queries";
import Chapter from "./Chapter";

interface BookContentInterface {
  isSplit: boolean;
  book: any;
  chapter: any;
  verse: any;
}

const BookContent: FC<BookContentInterface> = ({
  isSplit,
  book,
  chapter,
  verse,
}) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const {
    storedData,
    saveData,
    historyManager: { add: addToHistory },
  } = useStorage();
  const { currentBibleVersion } = storedData;

  const { setverseInStrongDisplay, clearHighlights } = useBibleContext();
  const { myBibleDB, executeSql } = useDBContext();
  const route = useRoute();
  const { isHistory } = route.params as HomeParams;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({});
  const currentBook = DB_BOOK_NAMES.find((x) => x.longName === book);
  const dimensions = Dimensions.get("window");
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      clearHighlights();
      setLoading(true);
      if (!myBibleDB || !executeSql) return;
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

      const responses = await Promise.all(promises);
      const [verses, subtitles] = responses;
      setData({ verses, subtitles });

      if (!isHistory) {
        addToHistory({ book, verse, chapter });
      }

      await saveData({
        [isSplit ? "lastBottomSideBook" : "lastBook"]: book,
        [isSplit ? "lastBottomSideChapter" : "lastChapter"]: chapter,
        [isSplit ? "lastBottomSideVerse" : "lastVerse"]: verse,
      });

      setLoading(false);
    })();

    return () => {};
  }, [myBibleDB, book, chapter, verse]);

  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  return (
    <View style={styles.bookContainer}>
      {!loading ? (
        <Chapter
          {...{ book, chapter, verse }}
          isSplit={isSplit}
          dimensions={dimensions}
          item={data}
        />
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
