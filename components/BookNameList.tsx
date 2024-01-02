import {
  Theme,
  useNavigation,
  useRoute,
  useTheme,
} from "@react-navigation/native";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "./Themed";
import { FlashList } from "@shopify/flash-list";
import { HomeParams, IDBBookNames, Screens, TTheme } from "../types";
import useStorage from "../hooks/useAsyncStorage";
import { StorageKeys } from "../constants/StorageKeys";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BOOK_IMAGES } from "../constants/Images";

interface IBookNameList {
  bookList: IDBBookNames[] | any[];
}

const BookNameList = ({ bookList }: IBookNameList) => {
  // const { setLastReadBook } = useStorage(StorageKeys.LAST_READ_BOOK, {}, true)
  const navigation = useNavigation();
  const route = useRoute();
  const { book: selectedBook, chapter } = route?.params as HomeParams;
  const theme = useTheme();
  const styles = getStyles(theme);

  const screenNavigationMap: any = {
    [Screens.Book]: (item: any) => ({
      screen: Screens.ChooseChapterNumber,
      params: { book: item },
    }),
    [Screens.ChooseChapterNumber]: (item: any, routeParams: any) => ({
      screen: Screens.ChooseVerseNumber,
      params: { ...routeParams, chapter: item },
    }),
    [Screens.ChooseVerseNumber]: (item: any, routeParams: any) => ({
      screen: Screens.Home,
      params: { ...routeParams, verse: item },
    }),
    // Default case
    default: (item: any) => ({
      screen: Screens.ChooseChapterNumber,
      params: { book: item },
    }),
  };

  const handlePress = (item: string | number) => {
    const routeName = route.name;
    const navigationInfo =
      screenNavigationMap[routeName] || screenNavigationMap.default;
    const { screen, params } = navigationInfo(item, route.params);
    navigation.navigate(screen, params);
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.listItem,
        selectedBook ? { justifyContent: "center" } : {},
      ]}
      onPress={() => handlePress(item)}
    >
      <Text style={styles.listTitle}>{item}</Text>
      {!selectedBook && (
        <MaterialCommunityIcons
          style={styles.icon}
          name="greater-than"
          size={26}
          color="white"
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {selectedBook && (
          <Text
            style={[
              styles.listChapterTitle,
              {
                fontSize: 26,
                position: "absolute",
                top: 10,
                zIndex: 11,
                // backgroundColor: "white",
                paddingVertical: 5,
              },
            ]}
          >
            {selectedBook} {chapter}
          </Text>
        )}
        {selectedBook && (
          <Image
            style={[styles.bookImage, { marginTop: 40 }]}
            source={{
              uri: BOOK_IMAGES[selectedBook ?? "Génesis"],
            }}
            alt={selectedBook}
          />
        )}
      </View>
      <FlashList
        contentContainerStyle={styles.flatContainer}
        data={bookList?.map((x) => (x?.longName ? x?.longName : x))}
        renderItem={renderItem}
        estimatedItemSize={47}
        numColumns={selectedBook ? 6 : 1}
      />
    </View>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
      borderWidth: 1,
      borderColor: "#ffffff34",
      margin: 5,
      paddingVertical: 5,
      paddingHorizontal: 10,
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
