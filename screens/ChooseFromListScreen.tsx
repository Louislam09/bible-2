import { RouteProp, useTheme } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useMemo, useState } from "react";
import BookNameList from "../components/BookNameList";
import {
  DB_BOOK_CHAPTER_NUMBER,
  DB_BOOK_CHAPTER_VERSES,
  DB_BOOK_NAMES,
} from "../constants/BookNames";
import { HomeParams, RootStackParamList } from "../types";
import { useDBContext } from "../context/databaseContext";
import { useBibleContext } from "context/BibleContext";

type ChooseFromListScreenRouteProp = RouteProp<RootStackParamList>;

type ChooseFromListScreenNavigationProp = NativeStackScreenProps<
  RootStackParamList,
  "ChooseChapterNumber"
>;

type ChooseFromListScreenProps = {
  route: ChooseFromListScreenRouteProp;
  navigation: ChooseFromListScreenNavigationProp;
};

const ChooseFromListScreen = ({ route }: ChooseFromListScreenProps) => {
  const theme = useTheme();
  const { book, chapter, bottomSideBook, bottomSideChapter } =
    route.params as any;
  const [numOfVerse, setNumVerse] = useState(0);
  const isVerseScreen = route.name === "ChooseVerseNumber";
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
