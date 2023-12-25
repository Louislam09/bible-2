import { useRoute, useTheme } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, StyleSheet, View } from "react-native";
import { DB_BOOK_NAMES } from "../../constants/BookNames";
import { useDBContext } from "../../context/databaseContext";
import { HomeParams, IBookVerse, TTheme } from "../../types";

// import { View } from "../Themed";
import Chapter from "./Chapter";

const BookContent = () => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { database, executeSql } = useDBContext();
  const route = useRoute();
  const { book, chapter } = route.params as HomeParams;
  const bookRef = React.useRef<FlashList<IBookVerse[]>>(null);
  const [loading, setLoading] = React.useState(true);
  const [scrollEnabled, setScrollEnabled] = React.useState(false);
  const [listWidth, setListWidth] = React.useState(0);
  const [data, setData] = useState<any>([]);
  const [currentData, setCurrentData] = useState<any>([]);
  const currentBookNumber = DB_BOOK_NAMES.find((x) => x.longName === book);
  const [dimensions, setDimensions] = useState(Dimensions.get("window"));
  const [currentIndex, setCurrentIndex] = useState(0);

  function groupByChapter(data: IBookVerse[]): IBookVerse[][] {
    const groupedData: Record<number, IBookVerse[]> = {};
    for (const item of data) {
      const chapterNum = item.chapter;
      if (!groupedData[chapterNum]) {
        groupedData[chapterNum] = [];
      }
      groupedData[chapterNum].push(item);
    }
    return Object.values(groupedData);
  }

  useEffect(() => {
    (async () => {
      if (database && executeSql) {
        const sql = `SELECT * FROM verses WHERE book_number=${
          currentBookNumber?.bookNumber
        } and chapter=${chapter || 1};`;
        setLoading(true);
        executeSql(sql)
          .then((rows) => {
            console.log("==DATE FETCHED==");
            // setData(groupByChapter(rows as any));
            setData(rows);
            setCurrentData(
              groupByChapter(rows as any).slice(0, currentIndex + 2)
            );
            setLoading(false);
          })
          .catch((err) => {
            console.warn(err);
          });
      }
    })();
  }, [database, book, chapter]);

  return (
    <View style={styles.bookContainer}>
      {!loading ? (
        <Chapter
          dimensions={dimensions}
          item={data}
          setScrollEnabled={setScrollEnabled}
        />
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
    bookContent: {
      borderColor: "red",
      borderWidth: 2,
      borderStyle: "solid",
    },
    chapterContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    chapterHeader: {
      // paddingTop: 30,
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
      // width: 400, // my default width
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
