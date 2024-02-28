import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useTheme } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import Animation from "components/Animation";
import { Text } from "components/Themed";
import { useBibleContext } from "context/BibleContext";
import { useEffect, useRef, useState } from "react";
import {
  ListRenderItem,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { IVerseItem, Screens, TTheme } from "types";
import copyToClipboard from "utils/copyToClipboard";
import { getVerseTextRaw } from "utils/getVerseTextRaw";

type TListVerse = {
  data: IVerseItem[] | any;
  isLoading: boolean;
};

const NoteList = ({ data }: TListVerse) => {
  const [filterData, setFilter] = useState([]);
  const theme = useTheme();
  const navigation = useNavigation();
  const styles = getStyles(theme);
  const { toggleFavoriteVerse } = useBibleContext();
  const flatListRef = useRef<FlashList<any>>(null);
  const notFoundSource = require("../../assets/lottie/notFound.json");

  useEffect(() => {
    if (!data) return;
    setFilter(data);
  }, [data]);

  const onVerseClick = async (item: IVerseItem) => {
    navigation.navigate(Screens.Home, {
      book: item.bookName,
      chapter: item.chapter,
      verse: item.verse,
    });
  };

  const onFavorite = (item: IVerseItem & { id: number }) => {
    toggleFavoriteVerse({
      bookNumber: item.book_number,
      chapter: item.chapter,
      verse: item.verse,
      isFav: true,
    });
    setFilter((prev) => prev.filter((x: any) => x.id !== item.id));
  };

  const onCopy = async (item: IVerseItem) => {
    await copyToClipboard(item);
  };

  const renderItem: ListRenderItem<IVerseItem & { id: number }> = ({
    item,
  }) => {
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={() => onVerseClick(item)}>
        <View style={styles.cardContainer}>
          <View style={styles.headerContainer}>
            <Text
              style={styles.cardTitle}
            >{`${item.bookName} ${item.chapter}:${item.verse}`}</Text>
            <View style={styles.verseAction}>
              <MaterialCommunityIcons
                size={20}
                name="content-copy"
                style={styles.icon}
                onPress={() => onCopy(item)}
              />
              <MaterialCommunityIcons
                size={20}
                name="delete"
                style={[styles.icon]}
                onPress={() => onFavorite(item)}
              />
            </View>
          </View>
          <Text style={styles.verseBody}>{getVerseTextRaw(item.text)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const SearchedHeader = () => {
    return (
      <View
        style={[
          styles.chapterHeader,
          !filterData.length && { display: "none" },
        ]}
      >
        <Text style={styles.chapterHeaderTitle}>
          {(filterData ?? []).length}{" "}
          {(filterData ?? []).length > 1 ? "Notas" : "Nota"}
        </Text>
      </View>
    );
  };

  const renderScrollToTopButton = () => {
    return (
      <TouchableOpacity
        style={[styles.scrollToTopButton]}
        onPress={() => {
          // flatListRef?.current?.scrollToOffset({ animated: true, offset: 0 });
          console.log("CREATE NEW NOTE");
        }}
      >
        <MaterialCommunityIcons
          style={{ color: theme.colors.notification }}
          name="plus-circle"
          size={26}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <FlashList
        ref={flatListRef}
        ListHeaderComponent={SearchedHeader}
        decelerationRate={"normal"}
        estimatedItemSize={135}
        data={filterData}
        renderItem={renderItem as any}
        // onScroll={handleScroll}
        keyExtractor={(item: any, index: any) => `note-${index}`}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={[styles.noResultsContainer]}>
            <Animation
              backgroundColor={theme.colors.background}
              source={notFoundSource}
              loop={false}
            />
            <Text style={styles.noResultsText}>No tienes notas</Text>
          </View>
        }
      />
      {renderScrollToTopButton()}
    </View>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    verseBody: {
      color: colors.text,
    },
    scrollToTopButton: {
      position: "absolute",
      bottom: 20,
      right: 20,
      backgroundColor: colors.background,
      padding: 10,
      borderRadius: 50,
      borderColor: colors.notification,
      borderWidth: 1,
    },
    chapterHeader: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      padding: 16,
    },
    chapterHeaderTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
    },
    cardContainer: {
      display: "flex",
      borderRadius: 10,
      padding: 10,
      margin: 8,
    },
    headerContainer: {
      position: "relative",
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
      backgroundColor: colors.notification + "99",
      marginVertical: 8,
    },
    noResultsContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    noResultsText: {
      fontSize: 18,
      color: colors.text,
    },
    verseAction: {
      alignSelf: "flex-end",
      flexDirection: "row",
    },
    icon: {
      fontWeight: "700",
      marginHorizontal: 10,
      color: colors.primary,
      fontSize: 24,
    },
  });

export default NoteList;
