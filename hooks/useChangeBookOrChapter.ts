import { NavigationProp, NavigationState } from "@react-navigation/native";
import { DB_BOOK_CHAPTER_NUMBER, DB_BOOK_NAMES } from "@/constants/BookNames";
import { useBibleChapter } from "@/context/BibleChapterContext";

interface useChangeBookOrChapterProps {
  navigation: Omit<
    NavigationProp<ReactNavigation.RootParamList>,
    "getState"
  > & {
    getState(): NavigationState | undefined;
  };
  isSplit?: boolean;
  book: string;
  chapter: number;
  verse: number;
}

const useChangeBookOrChapter = ({
  navigation,
  isSplit = false,
  book,
  chapter,
}: useChangeBookOrChapterProps) => {
  const bookIndex = DB_BOOK_NAMES.findIndex((x) => x.longName === book);
  const { bookNumber, shortName } =
    DB_BOOK_NAMES.find((x) => x.longName === book) || {};
  const { updateBibleQuery } = useBibleChapter();

  const nextOrPreviousBook = (name: string, chapter: number = 1) => {
    const queryInfo = {
      [isSplit ? "bottomSideBook" : "book"]: name,
      [isSplit ? "bottomSideChapter" : "chapter"]: chapter,
      [isSplit ? "bottomSideVerse" : "verse"]: 0,
      isHistory: false,
    };
    updateBibleQuery({
      ...queryInfo,
      shouldFetch: true,
      isBibleBottom: isSplit,
    });
    navigation.setParams(queryInfo);
  };

  function nextChapter() {
    if (DB_BOOK_CHAPTER_NUMBER[book as any] === chapter) {
      if (bookNumber === 730) return;
      const newBookName = DB_BOOK_NAMES[bookIndex + 1]?.longName;
      nextOrPreviousBook(newBookName);
      return;
    }

    const _chapter = +(chapter as number) + 1;
    const queryInfo = {
      [isSplit ? "bottomSideBook" : "book"]: book,
      [isSplit ? "bottomSideChapter" : "chapter"]: _chapter || 0,
      [isSplit ? "bottomSideVerse" : "verse"]: 0,
      isHistory: false,
    };
    updateBibleQuery({
      ...queryInfo,
      shouldFetch: true,
      isBibleBottom: isSplit,
    });
    navigation.setParams(queryInfo);
  }
  const previousChapter = () => {
    if (bookNumber !== 10 && chapter === 1) {
      const newBookName = DB_BOOK_NAMES[bookIndex - 1]?.longName;
      const newChapter = DB_BOOK_CHAPTER_NUMBER[newBookName];
      nextOrPreviousBook(newBookName, newChapter);
      return;
    }
    if ((chapter as number) <= 1) return;
    const queryInfo = {
      [isSplit ? "bottomSideBook" : "book"]: book,
      [isSplit ? "bottomSideChapter" : "chapter"]: (chapter as number) - 1,
      [isSplit ? "bottomSideVerse" : "verse"]: 0,
      isHistory: false,
    };
    updateBibleQuery({
      ...queryInfo,
      shouldFetch: true,
      isBibleBottom: isSplit,
    });
    navigation.setParams(queryInfo);
  };

  return {
    nextChapter,
    previousChapter,
  };
};

export default useChangeBookOrChapter;
