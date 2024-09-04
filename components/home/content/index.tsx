import { useNavigation, useRoute, useTheme } from "@react-navigation/native";
import React, { FC, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Dimensions,
  StyleSheet,
  View,
} from "react-native";
import { DB_BOOK_NAMES } from "../../../constants/BookNames";
import { useDBContext } from "../../../context/databaseContext";
import { HomeParams, IBookVerse, TTheme } from "../../../types";

import { Text } from "components/Themed";
import { getDatabaseQueryKey } from "constants/databaseNames";
import { useBibleContext } from "context/BibleContext";
import { useStorage } from "context/LocalstoreContext";
import { QUERY_BY_DB } from "../../../constants/Queries";
import Chapter from "./Chapter";
import { getChapterTextRaw } from "utils/getVerseTextRaw";
import useReadingTime from "hooks/useReadTime";

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
  const { currentBibleVersion, fontSize } = storedData;

  const {
    setverseInStrongDisplay,
    clearHighlights,
    currentBibleLongName,
    setChapterLengthNumber,
    setChapterVerses,
    highlightedVerses,
  } = useBibleContext();
  const { myBibleDB, executeSql } = useDBContext();
  const route = useRoute();
  const { isHistory } = route.params as HomeParams;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({});
  const [chapterText, setChapterText] = useState<string>("");
  const currentBook = DB_BOOK_NAMES.find((x) => x.longName === book);
  const dimensions = Dimensions.get("window");
  const navigation = useNavigation();
  const isNewLaw = useRef<boolean>(false);
  const estimatedReadingTime = useReadingTime({
    text: chapterText,
  });

  useEffect(() => {
    isNewLaw.current = currentBibleLongName
      .toLowerCase()
      .includes("nuevo testamento");
  }, [currentBibleLongName]);

  useEffect(() => {
    (async () => {
      if (highlightedVerses.length) clearHighlights();
      setLoading(true);
      if (!myBibleDB || !executeSql) return;
      setData({});
      setverseInStrongDisplay(0);
      const queryKey = getDatabaseQueryKey(currentBibleVersion);
      const query = QUERY_BY_DB[queryKey];
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
      setChapterVerses(verses as IBookVerse[]);
      setChapterLengthNumber(verses?.length || 0);
      setChapterText(getChapterTextRaw(verses as any));
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

  const displayErrorMessage = (_isNewLaw: boolean) => {
    if (_isNewLaw) {
      return "Solo disponible el Nuevo Pacto en esta versión.";
    } else {
      return "No se puede mostrar esta versión. Intenta con otra.";
    }
  };

  const notVerseToRender = data?.verses?.length && !loading;

  if (loading || data?.verses?.length === undefined) {
    return (
      <View style={styles.activiyContainer}>
        <ActivityIndicator style={{ flex: 1 }} />
      </View>
    );
  }

  return (
    <View style={styles.bookContainer}>
      {!notVerseToRender ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text
            style={{
              color: theme.colors.notification,
              fontSize,
              textAlign: "center",
            }}
          >
            {displayErrorMessage(isNewLaw.current)}
          </Text>
        </View>
      ) : (
        <Chapter
          {...{ book, chapter, verse }}
          isSplit={isSplit}
          dimensions={dimensions}
          item={data}
          estimatedReadingTime={estimatedReadingTime}
        />
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
    activiyContainer: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  });

export default BookContent;
