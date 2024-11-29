import { DB_BOOK_CHAPTER_VERSES, DB_BOOK_NAMES } from "@/constants/BookNames";
import { useBibleContext } from "@/context/BibleContext";
import useParams from "@/hooks/useParams";
import { ChooseChapterNumberParams } from "@/types";
import ChooseFromListScreen from "@/components/chooseFromListScreen";
import { Stack } from "expo-router";
import { Fragment, useMemo } from "react";

const chooseVerseNumber = () => {
  const routeParam = useParams<ChooseChapterNumberParams>();
  const { isBottomSideSearching } = useBibleContext();
  const { book, bottomSideBook, bottomSideChapter, chapter } = routeParam;
  const selectedBook = isBottomSideSearching ? bottomSideBook : book;
  const selectedChapter = isBottomSideSearching ? bottomSideChapter : chapter;

  const bookNumber = DB_BOOK_NAMES.find(
    (bookItem) => bookItem.longName === selectedBook
  )?.bookNumber;

  const verseCount = DB_BOOK_CHAPTER_VERSES.find(
    (bookItem) =>
      bookItem.bookNumber === bookNumber &&
      bookItem.chapterNumber === selectedChapter
  )?.verseCount;

  const numberOfVerses = useMemo(() => {
    return new Array(verseCount).fill(0).map((_, index) => index + 1);
  }, [verseCount]);

  return (
    <Fragment>
      <Stack.Screen options={{ headerShown: true }} />
      <ChooseFromListScreen list={numberOfVerses} />
    </Fragment>
  );
};

export default chooseVerseNumber;
