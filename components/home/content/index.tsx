import { useTheme } from "@react-navigation/native";
import React, { FC } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { TTheme } from "../../../types";

import { View } from "@/components/Themed";
import { useBibleChapter } from "@/context/BibleChapterContext";
import Chapter from "./Chapter";

interface BookContentInterface {
  isSplit: boolean;
  book: any;
  chapter: any;
  verse: any;
}

const BookContent: FC<BookContentInterface> = ({ isSplit, verse }) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { data, bottomData, estimatedReadingTime, estimatedReadingTimeBottom } =
    useBibleChapter();

  return (
    <View style={styles.bookContainer}>
      <Chapter
        {...{ verse }}
        isSplit={isSplit}
        item={isSplit ? bottomData : data}
        estimatedReadingTime={
          isSplit ? estimatedReadingTimeBottom : estimatedReadingTime
        }
      />
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
