import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { Text } from "components/Themed";
import { ListRenderItem, StyleSheet, View } from "react-native";
import { IVerseItem, TTheme } from "types";
import { getVerseTextRaw } from "utils/getVerseTextRaw";

const verse = [
  {
    bookName: "Apocalipsis (de Juan)",
    book_number: 730,
    chapter: 22,
    text: "El<S>3588</S> que da testimonio<S>3140</S> de estas<S>5023</S> cosas dice:<S>3004</S> Ciertamente<S>3483</S> vengo<S>2064</S> en breve.<S>5035</S> Amén;<S>281</S> sí,<S>3483</S> ven,<S>2064</S> Señor<S>2962</S> Jesús.<S>2424</S> ",
    verse: 20,
  },
  {
    bookName: "Apocalipsis (de Juan)",
    book_number: 730,
    chapter: 22,
    text: "La<S>3588</S> gracia<S>5485</S> de nuestro<S>2257</S> Señor<S>3588</S> <S>2962</S> Jesucristo<S>2424</S> <S>5547</S> sea con<S>3326</S> todos<S>3956</S> vosotros.<S>5216</S> Amén.<S>281</S> ",
    verse: 21,
  },
];

type TListVerse = {
  data: IVerseItem[] | any;
};

const ListVerse = ({ data }: TListVerse) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const _data = data;
  const renderItem: ListRenderItem<IVerseItem> = ({ item }) => {
    return (
      <View style={styles.cardContainer}>
        <View style={styles.headerContainer}>
          <Text
            style={styles.cardTitle}
          >{`${item.bookName} ${item.chapter}:${item.verse}`}</Text>
        </View>
        <Text style={styles.cardBody}>{getVerseTextRaw(item.text)}</Text>
      </View>
    );
  };

  return _data.length ? (
    <FlashList
      decelerationRate={"normal"}
      estimatedItemSize={_data.length}
      data={_data}
      renderItem={renderItem as any}
      keyExtractor={(item: any, index: any) => `list-${index}`}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  ) : (
    <View style={styles.noResultsContainer}>
      <MaterialCommunityIcons
        name="book-open-page-variant-outline"
        size={40}
        color={theme.colors.text}
      />
      <Text style={styles.noResultsText}>No encontramos resultados</Text>
    </View>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    cardContainer: {
      borderRadius: 10,
      padding: 16,
      margin: 8,
    },
    headerContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.notification,
    },
    cardBody: {
      fontSize: 16,
      color: colors.text,
    },
    separator: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 8,
    },
    noResultsContainer: {
      flex: 0.7,
      alignItems: "center",
      justifyContent: "center",
    },
    noResultsText: {
      fontSize: 18,
      color: colors.text,
    },
  });

export default ListVerse;
