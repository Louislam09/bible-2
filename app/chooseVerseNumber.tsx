import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import OptimizedChapterList from "@/components/optimized-chapter-list";
import { View } from "@/components/Themed";
import { DB_BOOK_CHAPTER_VERSES, DB_BOOK_NAMES } from "@/constants/BookNames";
import { BOOK_IMAGES } from "@/constants/Images";
import { useBibleChapter } from "@/context/BibleChapterContext";
import { useBibleContext } from "@/context/BibleContext";
import useParams from "@/hooks/useParams";
import { ChooseChapterNumberParams, Screens, TTheme } from "@/types";
import { renameLongBookName } from "@/utils/extractVersesInfo";
import { useTheme } from "@react-navigation/native";
import { Stack, useNavigation } from "expo-router";
import { Fragment, useMemo } from "react";
import { StyleSheet } from "react-native";

const chooseVerseNumber = () => {
  const routeParam = useParams<ChooseChapterNumberParams>();
  const { isBottomSideSearching } = useBibleContext();
  const { book, bottomSideBook, bottomSideChapter, chapter } = routeParam;
  const selectedBook = isBottomSideSearching ? bottomSideBook : book;
  const selectedChapter = isBottomSideSearching ? bottomSideChapter : chapter;
  const navigation = useNavigation();
  const theme = useTheme();
  const displayBookName = renameLongBookName(selectedBook || "");
  const { updateBibleQuery } = useBibleChapter();

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
    } as any;

    updateBibleQuery({
      ...params,
      isBibleBottom: isBottomSideSearching,
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

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      width: "100%",
    },
    listWrapper: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    bookImage: {
      resizeMode: "contain",
      position: "relative",
      width: 100,
      height: 100,
    },
    flatContainer: {
      paddingVertical: 20,
      backgroundColor: colors.background,
    },
    listItem: {
      display: "flex",
      borderStyle: "solid",
      borderWidth: 1,
      borderColor: colors.text + 10,
      padding: 10,
      flex: 1,
      height: 70,
      alignItems: "center",
      justifyContent: "center",
    },
    listTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "bold",
    },
    subTitle: {
      fontSize: 14,
      color: colors.text,
      opacity: 0.9,
    },
    listChapterTitle: {
      color: colors.notification,
      paddingHorizontal: 20,
      paddingBottom: 0,
      fontSize: 26,
      paddingVertical: 5,
    },
    icon: {
      fontWeight: "900",
      color: colors.text,
      marginHorizontal: 10,
    },
  });

export default chooseVerseNumber;
