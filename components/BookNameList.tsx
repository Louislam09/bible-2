import { useNavigation, useRoute, useTheme } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Text } from "./Themed";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { BOOK_IMAGES } from "constants/Images";
import { HomeParams, IDBBookNames, Screens, TTheme } from "types";
import { useBibleContext } from "context/BibleContext";

interface IBookNameList {
  bookList: IDBBookNames[] | any[];
}

const BookNameList = ({ bookList }: IBookNameList) => {
  const navigation = useNavigation();
  const route = useRoute();
  const isVerseScreen = route.name === "ChooseVerseNumber";
  const {
    book: selectedBook,
    chapter,
    bottomSideBook,
    bottomSideChapter,
  } = route?.params as HomeParams;

  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const theme = useTheme();
  const styles = getStyles(theme);
  const { isBottomSideSearching, toggleBottomSideSearching, orientation } =
    useBibleContext();
  const isPortrait = orientation === "PORTRAIT";
  const selectedSideBook = isBottomSideSearching
    ? bottomSideBook
    : selectedBook;
  const selectedSideChapter = isBottomSideSearching
    ? bottomSideChapter
    : chapter;

  const screenNavigationMap: any = {
    [Screens.ChooseBook]: (item: any, routeParams: any) => ({
      screen: Screens.ChooseChapterNumber,
      params: {
        ...routeParams,
        [isBottomSideSearching ? "bottomSideBook" : "book"]: item,
      },
    }),
    [Screens.ChooseChapterNumber]: (item: any, routeParams: any) => ({
      screen: Screens.ChooseVerseNumber,
      params: {
        ...routeParams,
        [isBottomSideSearching ? "bottomSideChapter" : "chapter"]: item,
      },
    }),
    [Screens.ChooseVerseNumber]: (item: any, routeParams: any) => ({
      screen: Screens.Home,
      params: {
        ...routeParams,
        [isBottomSideSearching ? "bottomSideVerse" : "verse"]: item,
        isHistory: false,
      },
    }),
    // Default case
    default: (item: any) => ({
      screen: Screens.ChooseChapterNumber,
      params: {
        [isBottomSideSearching ? "bottomSideChapter" : "chapter"]: item,
      },
    }),
  };

  const handlePress = (item: string | number) => {
    const routeName = route.name;
    const navigationInfo =
      screenNavigationMap[routeName] || screenNavigationMap.default;
    const { screen, params } = navigationInfo(item, route.params);
    if (isVerseScreen) toggleBottomSideSearching(false);
    navigation.navigate(screen, params);
  };

  const renderItem = ({ item, index }: any) => (
    <TouchableOpacity
      style={[
        styles.listItem,
        selectedSideBook ? { justifyContent: "center" } : {},
      ]}
      onPress={() => handlePress(item)}
    >
      <Text style={styles.listTitle}>{item}</Text>
      {!selectedSideBook && (
        <MaterialCommunityIcons
          style={[styles.icon, { color: bookList[index].bookColor }]}
          name="greater-than"
          size={26}
          color="white"
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View
      style={[
        styles.container,
        { width: SCREEN_WIDTH },
        !isPortrait && { flexDirection: "row" },
      ]}
    >
      <View style={styles.listWrapper}>
        {selectedSideBook && (
          <Text
            style={[
              styles.listChapterTitle,
              {
                fontSize: 26,
                position: "absolute",
                top: 10,
                zIndex: 11,
                paddingVertical: 5,
              },
            ]}
          >
            {selectedSideBook} {isVerseScreen && selectedSideChapter}
          </Text>
        )}
        {selectedSideBook && (
          <Image
            style={[styles.bookImage, { marginTop: 40 }]}
            source={{
              uri: BOOK_IMAGES[selectedSideBook ?? "Génesis"],
            }}
            alt={selectedSideBook}
          />
        )}
      </View>
      <FlashList
        contentContainerStyle={styles.flatContainer}
        data={bookList?.map((x) => (x?.longName ? x?.longName : x))}
        renderItem={renderItem}
        estimatedItemSize={50}
        numColumns={bookList.length > 12 ? 5 : 3}
      />
    </View>
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
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    bookImage: {
      resizeMode: "contain",
      position: "relative",
      width: 200,
      height: 200,
    },
    flatContainer: {
      paddingVertical: 20,
      backgroundColor: colors.background,
    },
    listItem: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderStyle: "solid",
      borderWidth: 0.5,
      borderColor: colors.text,
      padding: 15,
      flex: 1,
    },
    listTitle: {
      color: colors.text,
      fontSize: 20,
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

export default BookNameList;
