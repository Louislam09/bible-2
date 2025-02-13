import { DB_BOOK_CHAPTER_VERSES, DB_BOOK_NAMES } from "@/constants/BookNames";
import { useBibleContext } from "@/context/BibleContext";
import useParams from "@/hooks/useParams";
import { ChooseChapterNumberParams, Screens, TTheme } from "@/types";
import ChooseFromListScreen from "@/components/chooseFromListScreen";
import { Stack, useNavigation } from "expo-router";
import { Fragment, useMemo } from "react";
import { Image, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "@react-navigation/native";
import { renameLongBookName } from "@/utils/extractVersesInfo";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { Text, View } from "@/components/Themed";
import { BOOK_IMAGES } from "@/constants/Images";
import { useStorage } from "@/context/LocalstoreContext";
import { useBibleChapter } from "@/context/BibleChapterContext";

const chooseVerseNumber = () => {
  const routeParam = useParams<ChooseChapterNumberParams>();
  const { isBottomSideSearching } = useBibleContext();
  const { book, bottomSideBook, bottomSideChapter, chapter } = routeParam;
  const selectedBook = isBottomSideSearching ? bottomSideBook : book;
  const selectedChapter = isBottomSideSearching ? bottomSideChapter : chapter;
  const navigation = useNavigation();
  const theme = useTheme();
  const styles = getStyles(theme);
  const displayBookName = renameLongBookName(selectedBook || "");
  const { updateBibleQuery } = useBibleChapter();

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

  const handlePress = (item: number) => {
    const params = {
      ...routeParam,
      [isBottomSideSearching ? "bottomSideVerse" : "verse"]: item,
      isHistory: false,
    } as any;

    console.log("verse chopo", isBottomSideSearching);
    updateBibleQuery({ ...params, isBibleBottom: isBottomSideSearching });
    navigation.navigate(Screens.Home, params);
  };

  const renderItem: ListRenderItem<number> = ({ item, index }) => {
    return (
      <TouchableOpacity
        style={styles.listItem}
        onPress={() => handlePress(item)}
        activeOpacity={0.7}
      >
        <Text style={[styles.listTitle]}>{item}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Fragment>
      <Stack.Screen options={{ headerShown: true }} />
      <View style={styles.listWrapper}>
        {selectedBook && (
          <Image
            style={[styles.bookImage]}
            source={{
              uri: BOOK_IMAGES[selectedBook ?? "Génesis"],
            }}
            alt={selectedBook}
          />
        )}
        {selectedBook && (
          <Text style={styles.listChapterTitle}>
            {displayBookName} {chapter}
          </Text>
        )}
      </View>
      <FlashList
        contentContainerStyle={styles.flatContainer}
        data={numberOfVerses}
        renderItem={renderItem}
        estimatedItemSize={50}
        numColumns={numberOfVerses.length > 12 ? 5 : 3}
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

export default chooseVerseNumber;
