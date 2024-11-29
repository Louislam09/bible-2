import { DB_BOOK_CHAPTER_NUMBER } from "@/constants/BookNames";
import { useBibleContext } from "@/context/BibleContext";
import useParams from "@/hooks/useParams";
import { ChooseChapterNumberParams } from "@/types";
import ChooseFromListScreen from "components/chooseFromListScreen";
import { Stack } from "expo-router";
import { Fragment, useMemo } from "react";

const chooseChapterNumber = () => {
  const routeParam = useParams<ChooseChapterNumberParams>();
  const { isBottomSideSearching } = useBibleContext();
  const { book, bottomSideBook } = routeParam;
  const selectedBook = isBottomSideSearching ? bottomSideBook : book;

  const numberOfChapters = useMemo(() => {
    const totalChapters = DB_BOOK_CHAPTER_NUMBER[selectedBook ?? "Génesis"];
    return new Array(totalChapters).fill(0).map((_, index) => index + 1);
  }, [selectedBook]);

  return (
    <Fragment>
      <Stack.Screen options={{ headerShown: true }} />
      <ChooseFromListScreen list={numberOfChapters} />
    </Fragment>
  );
};

export default chooseChapterNumber;
