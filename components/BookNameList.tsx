import {
  Theme,
  useNavigation,
  useRoute,
  useTheme,
} from "@react-navigation/native";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "./Themed";
import { FlashList } from "@shopify/flash-list";
import { HomeParams, IDBBookNames, Screens } from "../types";
import useStorage from "../hooks/useAsyncStorage";
import { StorageKeys } from "../constants/StorageKeys";
import { TTheme } from "../types/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface IBookNameList {
  bookList: IDBBookNames[] | any[];
}

const BookNameList = ({ bookList }: IBookNameList) => {
  // const { setLastReadBook } = useStorage(StorageKeys.LAST_READ_BOOK, {}, true)
  const navigation = useNavigation();
  const route = useRoute();
  const { book: selectedBook } = route?.params as HomeParams;
  const theme = useTheme();
  const styles = getStyles(theme);

  const handlePress = (item: string | number) => {
    if (selectedBook) {
      const data = {
        book: selectedBook,
        chapter: item,
        strongKey: bookList.length > 30 ? "H" : "G",
      };
      // setLastReadBook(data)
      navigation.navigate(Screens.Home, { ...data });
      return;
    }
    navigation.navigate(Screens.ChooseChapterNumber, { book: item as string });
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
      {selectedBook && (
        <Text style={styles.listChapterTitle}>{selectedBook}</Text>
      )}
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
      color: colors.text,
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
