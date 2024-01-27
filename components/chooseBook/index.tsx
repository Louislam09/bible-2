import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { Text, View } from "components/Themed";
import { DB_BOOK_NAMES } from "constants/BookNames";
import { useBibleContext } from "context/BibleContext";
import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import {
  BookIndexes,
  IDBBookNames,
  RootStackScreenProps,
  Screens,
  TTheme,
} from "types";

const ChooseBook: React.FC<RootStackScreenProps<"ChooseBook">> = ({
  navigation,
}) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { viewLayoutGrid } = useBibleContext();
  const [query, setQuery] = useState("");

  const handlePress = (item: IDBBookNames) => {
    navigation.navigate(Screens.ChooseChapterNumber, { book: item.longName });
  };

  const handelSearch = async (query: string) => {
    setQuery(query);
  };

  const withTitle = (index: number) =>
    [BookIndexes.Genesis, BookIndexes.Mateo].includes(index);

  const title: { [key: string]: string } = {
    Gn: "Antiguo Pacto",
    Mt: "Nuevo Pacto",
  };

  const renderListView: ListRenderItem<IDBBookNames> = ({ item, index }) => (
    <>
      {withTitle(index) && (
        <Text
          style={[
            styles.listViewTitle,
            item.shortName === "Mt" && { padding: 10 },
          ]}
        >
          {title[item.shortName]}
        </Text>
      )}
      <TouchableOpacity
        style={[styles.listViewItem, index === 0 && { borderTopWidth: 0 }]}
        onPress={() => handlePress(item)}
      >
        <Text
          style={[
            styles.listTitle,
            { color: theme.dark ? item.bookColor : "black" },
          ]}
        >
          {item.longName}
        </Text>
        <MaterialCommunityIcons
          style={[styles.icon, { color: item.bookColor }]}
          name="greater-than"
          size={26}
          color="white"
        />
      </TouchableOpacity>
    </>
  );
  const renderItem: ListRenderItem<IDBBookNames> = ({ item, index }) => {
    return (
      <TouchableOpacity
        key={index}
        style={[styles.listItem]}
        onPress={() => handlePress(item)}
      >
        <Text
          style={[
            styles.listTitle,
            { color: theme.dark ? item.bookColor : "black" },
          ]}
        >
          {item.shortName}
        </Text>
      </TouchableOpacity>
    );
  };

  const GridView = (
    <>
      <View style={styles.listWrapper}>
        <Text style={styles.listTitle}>Antiguo Pacto</Text>
        <FlashList
          contentContainerStyle={styles.flatContainer}
          data={DB_BOOK_NAMES.filter((_, index) => index < BookIndexes.Mateo)}
          renderItem={renderItem}
          estimatedItemSize={47}
          numColumns={6}
        />
      </View>
      <View style={[styles.listWrapper, { flex: 0.9 }]}>
        <Text style={styles.listTitle}>Nuevo Pacto</Text>
        <FlashList
          contentContainerStyle={styles.flatContainer}
          data={DB_BOOK_NAMES.filter((_, index) => index >= BookIndexes.Mateo)}
          renderItem={renderItem}
          estimatedItemSize={47}
          numColumns={6}
        />
      </View>
    </>
  );

  const removeAccent = (text: string) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const ListView = (
    <View style={{ flex: 1, width: "100%" }}>
      <View style={{ marginVertical: 4 }}>
        <TextInput
          placeholder="Filtra libro"
          cursorColor={theme.colors.notification}
          style={styles.saerchInput}
          placeholderTextColor={theme.colors.text + "99"}
          onChangeText={handelSearch}
        />
      </View>
      <FlashList
        contentContainerStyle={styles.flatContainer}
        data={
          query
            ? DB_BOOK_NAMES.filter(
                (x) =>
                  removeAccent(x.longName).indexOf(query.toLowerCase()) !== -1
              )
            : DB_BOOK_NAMES
        }
        renderItem={renderListView}
        estimatedItemSize={47}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {viewLayoutGrid ? GridView : ListView}
    </SafeAreaView>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    saerchInput: {
      borderBottomColor: colors.notification,
      borderBottomWidth: 0.7,
      borderStyle: "solid",
      color: colors.text,
    },
    container: {
      flex: 1,
      position: "relative",
      paddingHorizontal: 5,
      alignItems: "flex-start",
      width: "100%",
      marginTop: 5,
      backgroundColor: colors.background,
    },
    listWrapper: {
      display: "flex",
      flex: 1,
      width: "100%",
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
      alignItems: "center",
      borderStyle: "solid",
      borderWidth: 0.5,
      borderColor: "#4a4949",
      padding: 10,
      flex: 1,
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
    },
    listTitle: {
      color: colors.notification,
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

export default ChooseBook;
