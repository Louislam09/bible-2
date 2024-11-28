import { RouteProp, useTheme } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useBibleContext } from "context/BibleContext";
import { useLocalSearchParams } from "node_modules/expo-router/build";
import React, { useEffect, useMemo, useState } from "react";
import {
  DB_BOOK_CHAPTER_NUMBER,
  DB_BOOK_CHAPTER_VERSES,
  DB_BOOK_NAMES,
} from "../constants/BookNames";
import { RootStackParamList, RootStackScreenProps } from "../types";
import BookNameList from "./BookNameList";

type ChooseFromListScreenRouteProp = RouteProp<RootStackParamList>;

type ChooseFromListScreenNavigationProp = NativeStackScreenProps<
  RootStackParamList,
  "chooseChapterNumber" | "chooseVerseNumber"
>;

export type ChooseFromListScreenProps = {
  route: ChooseFromListScreenRouteProp;
  navigation: ChooseFromListScreenNavigationProp;
};

const ChooseFromListScreen: React.FC<RootStackScreenProps<"chooseChapterNumber" | "chooseVerseNumber">> = (props) => {
  const theme = useTheme();
  const params = useLocalSearchParams();
  const route = {}
  const { book, chapter, bottomSideBook, bottomSideChapter } =
    params as any;
  const [numOfVerse, setNumVerse] = useState(0);
  const isVerseScreen = route.name === "chooseVerseNumber";
  const { isBottomSideSearching, orientation } = useBibleContext();
  const selectedSideBook = isBottomSideSearching ? bottomSideBook : book;
  const selectedSideChapter = isBottomSideSearching
    ? bottomSideChapter
    : chapter;

  useEffect(() => {
    if (!isVerseScreen) return;
    const bookInfo = DB_BOOK_NAMES.find((x) => x.longName === selectedSideBook);
    const verseInfo = DB_BOOK_CHAPTER_VERSES.find(
      (x) =>
        x.bookNumber === bookInfo?.bookNumber &&
        x.chapterNumber === selectedSideChapter
    );
    setNumVerse(verseInfo?.verseCount || 0);
  }, [isVerseScreen, selectedSideBook, selectedSideChapter]);

  const numberOfChapters = useMemo(() => {
    const totalChapters = isVerseScreen
      ? numOfVerse
      : DB_BOOK_CHAPTER_NUMBER[selectedSideBook ?? "Génesis"];

    return new Array(totalChapters).fill(0).map((_, index) => index + 1);
  }, [isVerseScreen, selectedSideBook, numOfVerse]);

  return (
    <BookNameList key={orientation + theme.dark} bookList={numberOfChapters} />
  );
};

export default ChooseFromListScreen;
