import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import OptimizedChapterList from "@/components/optimized-chapter-list";
import { View } from "@/components/Themed";
import { DB_BOOK_CHAPTER_VERSES, DB_BOOK_NAMES } from "@/constants/BookNames";
import { BOOK_IMAGES } from "@/constants/Images";
import useParams from "@/hooks/useParams";
import { bibleState$ } from "@/state/bibleState";
import { ChooseChapterNumberParams, Screens } from "@/types";
import { renameLongBookName } from "@/utils/extractVersesInfo";
import { useTheme } from "@react-navigation/native";
import { Stack, useNavigation } from "expo-router";
import { Fragment, useMemo } from "react";

const chooseVerseNumber = () => {
  const routeParam = useParams<ChooseChapterNumberParams>();
  const isBottomSideSearching = false;
  const { book, bottomSideBook, bottomSideChapter, chapter } = routeParam;
  const selectedBook = isBottomSideSearching ? bottomSideBook : book;
  const selectedChapter = isBottomSideSearching ? bottomSideChapter : chapter;
  const navigation = useNavigation();
  const theme = useTheme();
  const displayBookName = renameLongBookName(selectedBook || "");

  const numberOfVerses = useMemo(() => {
    const bookNumber = DB_BOOK_NAMES.find(
      (bookItem) => bookItem.longName === selectedBook
    )?.bookNumber;

    const verseCount =
      DB_BOOK_CHAPTER_VERSES.find(
        (bookItem) =>
          bookItem.bookNumber === bookNumber &&
          bookItem.chapterNumber === selectedChapter
      )?.verseCount || 0;

    return Array.from({ length: verseCount }, (_, index) => index + 1);
  }, [selectedBook, selectedChapter]);

  const handlePress = (item: number) => {
    const params = {
      ...routeParam,
      [isBottomSideSearching ? "bottomSideVerse" : "verse"]: item,
      isHistory: false,
      // shouldFetch: true,
    } as any;

    bibleState$.changeBibleQuery({
      ...params,
      isBibleBottom: isBottomSideSearching,
      isHistory: false,
    });
    navigation.navigate(Screens.Home, params);
  };

  return (
    <Fragment>
      <Stack.Screen
        options={{
          ...singleScreenHeader({
            theme,
            title: "Versiculos",
            titleIcon: "List",
            headerRightProps: {
              headerRightIconColor: "red",
              onPress: () => console.log(),
              disabled: true,
              style: { opacity: 1 },
            },
          }),
        }}
      />
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <OptimizedChapterList
          bookName={displayBookName}
          selectedChapeter={selectedChapter as number}
          chapters={numberOfVerses}
          onChapterSelect={handlePress}
          bookImageUri={BOOK_IMAGES[selectedBook ?? "Génesis"]}
        />
      </View>
    </Fragment>
  );
};

export default chooseVerseNumber;
