import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import OptimizedChapterList from "@/components/optimized-chapter-list";
import { DB_BOOK_CHAPTER_NUMBER } from "@/constants/BookNames";
import { BOOK_IMAGES } from "@/constants/Images";
import { useBibleChapter } from "@/context/BibleChapterContext";
import { useBibleContext } from "@/context/BibleContext";
import useParams from "@/hooks/useParams";
import { ChooseChapterNumberParams, Screens, TTheme } from "@/types";
import { renameLongBookName } from "@/utils/extractVersesInfo";
import { useTheme } from "@react-navigation/native";
import { Stack, useNavigation } from "expo-router";
import { Fragment, useCallback, useMemo } from "react";
import { StyleSheet } from "react-native";

const ChooseChapterNumber = () => {
  const navigation = useNavigation();
  const routeParam = useParams<ChooseChapterNumberParams>();
  const { isBottomSideSearching } = useBibleContext();
  const { book, bottomSideBook } = routeParam;
  const selectedBook = isBottomSideSearching ? bottomSideBook : book;
  const displayBookName = renameLongBookName(selectedBook || "");
  const { updateBibleQuery } = useBibleChapter();
  const theme = useTheme();

  const numberOfChapters = useMemo(() => {
    return Array.from(
      { length: DB_BOOK_CHAPTER_NUMBER[selectedBook ?? "Génesis"] },
      (_, i) => i + 1
    );
  }, [selectedBook]);

  const handleChapterSelect = useCallback(
    (item: number) => {
      const params = {
        ...routeParam,
        [isBottomSideSearching ? "bottomSideChapter" : "chapter"]: item,
        isHistory: false,
      } as any;

      updateBibleQuery({
        ...params,
        isBibleBottom: isBottomSideSearching,
        shouldFetch: true,
      });
      navigation.navigate(Screens.ChooseVerseNumber, params);
    },
    [routeParam, isBottomSideSearching, updateBibleQuery, navigation]
  );

  return (
    <Fragment>
      <Stack.Screen
        options={{
          ...singleScreenHeader({
            theme,
            title: "Capitulos",
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
      <OptimizedChapterList
        bookName={displayBookName}
        chapters={numberOfChapters}
        onChapterSelect={handleChapterSelect}
        bookImageUri={BOOK_IMAGES[selectedBook ?? "Génesis"]}
      />
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

export default ChooseChapterNumber;
