import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import OptimizedChapterList from "@/components/optimized-chapter-list";
import { DB_BOOK_CHAPTER_NUMBER } from "@/constants/BookNames";
import { BOOK_IMAGES } from "@/constants/Images";
import { useBibleChapter } from "@/context/BibleChapterContext";
import { useBibleContext } from "@/context/BibleContext";
import useParams from "@/hooks/useParams";
import { ChooseChapterNumberParams, Screens } from "@/types";
import { renameLongBookName } from "@/utils/extractVersesInfo";
import { useTheme } from "@react-navigation/native";
import { Stack, useNavigation } from "expo-router";
import React, { Fragment, useCallback, useMemo } from "react";

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

      // updateBibleQuery({
      //   ...params,
      //   isBibleBottom: isBottomSideSearching,
      //   shouldFetch: true,
      // });
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

export default React.memo(ChooseChapterNumber);
