import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import { Text, View } from "@/components/Themed";
import { DB_BOOK_NAMES } from "@/constants/BookNames";
import { useBibleContext } from "@/context/BibleContext";
import { storedData$, useStorage } from "@/context/LocalstoreContext";
import useParams from "@/hooks/useParams";
import {
  BookIndexes,
  ChooseChapterNumberParams,
  IDBBookNames,
  Screens,
  TTheme,
} from "@/types";
import { renameLongBookName } from "@/utils/extractVersesInfo";
import { use$ } from "@legendapp/state/react";
import { useTheme } from "@react-navigation/native";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { Stack, useNavigation } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";

const BookItem = React.memo(
  ({
    item,
    isCurrent,
    isNewVow,
    onPress,
    viewLayoutGrid,
    isShowName,
    theme,
  }: {
    item: IDBBookNames;
    isCurrent: boolean;
    isNewVow: boolean;
    onPress: () => void;
    viewLayoutGrid: boolean;
    isShowName: boolean;
    theme: any;
  }) => {
    const styles = useMemo(() => getStyles(theme), [theme]);

    return (
      <TouchableOpacity
        style={[
          styles.listItem,
          isCurrent && { backgroundColor: theme.colors.notification + "60" },
          isNewVow && { backgroundColor: theme.colors.text + "20" },
          !isShowName && { justifyContent: "center", height: "auto" },
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.listTitle,
            { color: theme.dark ? item.bookColor : "" },
          ]}
        >
          {viewLayoutGrid
            ? item.longName.replace(/\s+/g, "").slice(0, 3)
            : renameLongBookName(item.longName)}
        </Text>
        {isShowName && viewLayoutGrid && (
          <Text
            numberOfLines={1}
            ellipsizeMode="middle"
            style={styles.subTitle}
          >
            {renameLongBookName(item.longName)}
          </Text>
        )}
      </TouchableOpacity>
    );
  }
);

const BookList = React.memo(
  ({
    data,
    viewLayoutGrid,
    isShowName,
    book,
    onBookPress,
    startIndex,
    theme,
  }: {
    data: IDBBookNames[];
    viewLayoutGrid: boolean;
    isShowName: boolean;
    book: string;
    onBookPress: (item: IDBBookNames) => void;
    startIndex: number;
    theme: any;
  }) => {
    const renderItem: ListRenderItem<IDBBookNames> = useCallback(
      ({ item, index }) => (
        <BookItem
          item={item}
          isCurrent={book === item.longName}
          isNewVow={index + startIndex >= BookIndexes.Malaquias}
          onPress={() => onBookPress(item)}
          viewLayoutGrid={viewLayoutGrid}
          isShowName={isShowName}
          theme={theme}
        />
      ),
      [book, startIndex, viewLayoutGrid, isShowName, theme]
    );

    const keyExtractor = useCallback(
      (item: IDBBookNames, index: number) => `book-${index}`,
      []
    );

    return (
      <FlashList
        contentContainerStyle={styles.flatContainer}
        keyExtractor={keyExtractor}
        data={data}
        renderItem={renderItem}
        estimatedItemSize={47}
        numColumns={viewLayoutGrid ? (isShowName ? 4 : 5) : 1}
        removeClippedSubviews={true}
      />
    );
  }
);

const ChooseBook: React.FC = () => {
  const navigation = useNavigation();
  const routeParam = useParams<ChooseChapterNumberParams>();
  const isShowName = use$(() => storedData$.isShowName.get());
  const { book } = routeParam;
  const theme = useTheme();
  const { viewLayoutGrid, toggleViewLayoutGrid } = useBibleContext();
  const isBottomSideSearching = false;

  const handlePress = useCallback(
    (item: IDBBookNames) => {
      const params = isBottomSideSearching
        ? { bottomSideBook: item.longName }
        : { book: item.longName };
      navigation.navigate(Screens.ChooseChapterNumber, {
        ...routeParam,
        ...params,
      });
    },
    [isBottomSideSearching, routeParam, navigation]
  );

  const handleLongPress = useCallback(() => {
    storedData$.isShowName.set(!isShowName);
    // saveData({ isShowName: !isShowName });
  }, [isShowName]);

  const [oldTestamentBooks, newTestamentBooks] = useMemo(
    () => [
      DB_BOOK_NAMES.slice(0, BookIndexes.Malaquias),
      DB_BOOK_NAMES.slice(BookIndexes.Malaquias),
    ],
    []
  );

  const refreshKey = useMemo(
    () => theme.dark + "" + isShowName + viewLayoutGrid,
    [theme.dark, isShowName, viewLayoutGrid]
  );

  return (
    <View style={{ flex: 1 }} key={refreshKey}>
      <Stack.Screen
        options={{
          ...singleScreenHeader({
            theme,
            title: "Libros",
            titleIcon: "LibraryBig",
            headerRightProps: {
              headerRightIcon: !viewLayoutGrid ? "LayoutGrid" : "List",
              headerRightIconColor: viewLayoutGrid
                ? theme.colors.notification
                : theme.colors.text,
              onPress: () => toggleViewLayoutGrid(),
              onLongPress: handleLongPress,
              disabled: false,
              style: { opacity: 1 },
            },
          }),
        }}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <View style={styles.listWrapper}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.notification }]}
          >
            {"Antiguo Pacto"}
          </Text>
          <BookList
            data={oldTestamentBooks}
            viewLayoutGrid={viewLayoutGrid}
            isShowName={isShowName}
            book={book as string}
            onBookPress={handlePress}
            startIndex={0}
            theme={theme}
          />
          <Text
            style={[styles.sectionTitle, { color: theme.colors.notification }]}
          >
            {"Nuevo Pacto"}
          </Text>
          <BookList
            data={newTestamentBooks}
            viewLayoutGrid={viewLayoutGrid}
            isShowName={isShowName}
            book={book as string}
            onBookPress={handlePress}
            startIndex={BookIndexes.Malaquias}
            theme={theme}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 5,
    padding: 15,
    width: "100%",
  },
  listWrapper: {
    display: "flex",
    flex: 1,
    width: "100%",
    height: "100%",
  },
  flatContainer: {
    backgroundColor: "transparent",
  },
  listItem: {
    display: "flex",
    borderStyle: "solid",
    borderWidth: 1,
    padding: 10,
    flex: 1,
    height: 70,
    alignItems: "center",
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  subTitle: {
    fontSize: 14,
    opacity: 0.9,
  },
  icon: {
    fontWeight: "900",
    marginHorizontal: 10,
  },
});

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    scrollContainer: {
      flexGrow: 1,
      paddingBottom: 20,
      backgroundColor: colors.background,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: "bold",
      textAlign: "center",
      marginVertical: 5,
      color: colors.notification,
      backgroundColor: colors.background,
      padding: 15,
      width: "100%",
    },
    container: {
      flex: 1,
      position: "relative",
      alignItems: "flex-start",
      width: "100%",
      backgroundColor: dark ? colors.background : colors.text + 20,
    },
    listWrapper: {
      display: "flex",
      flex: 1,
      width: "100%",
      height: "100%",
    },
    bookImage: {
      resizeMode: "contain",
      position: "relative",
      width: 200,
      height: 200,
    },
    flatContainer: {
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
    },
    listViewItem: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderStyle: "solid",
      borderWidth: 0.19,
      borderColor: "#4a4949",

      borderLeftWidth: 0,
      borderRightWidth: 0,
      padding: 15,
      flex: 1,
    },
    listViewTitle: {
      fontSize: 20,
      marginVertical: 10,
      paddingLeft: 15,
      color: colors.notification,
      textAlign: "center",
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
      padding: 20,
      paddingBottom: 0,
      fontSize: 20,
    },
    icon: {
      fontWeight: "900",
      color: colors.text,
      marginHorizontal: 10,
    },
  });

export default React.memo(ChooseBook);
