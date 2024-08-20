import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
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

const FavoriteList = ({ data }: TListVerse) => {
  const [filterData, setFilter] = useState([]);
  const theme = useTheme();
  const navigation = useNavigation();
  const styles = getStyles(theme);
  const { toggleFavoriteVerse, currentBibleLongName } = useBibleContext();
  const flatListRef = useRef<FlashList<any>>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const notFoundSource = require("../../assets/lottie/notFound.json");

  useEffect(() => {
    if (!data) return;
    setFilter(data);
  }, [data]);
  if (!data) return;

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const shouldShowButton = offsetY > 100; // Adjust the threshold as needed
    setShowScrollToTop(shouldShowButton);
  };

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
                name="star"
                style={[styles.icon, theme.dark && { color: "yellow" }]}
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
          {(filterData ?? []).length} versiculos favoritos
        </Text>
      </View>
    );
  };

  const renderScrollToTopButton = () => {
    return (
      <TouchableOpacity
        style={[
          styles.scrollToTopButton,
          !showScrollToTop && { display: "none" },
        ]}
        onPress={() => {
          flatListRef?.current?.scrollToOffset({ animated: true, offset: 0 });
        }}
      >
        <MaterialCommunityIcons
          style={{ color: theme.colors.notification }}
          name="arrow-up-circle"
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
        onScroll={handleScroll}
        keyExtractor={(item: any, index: any) => `fav-${index}`}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.noResultsContainer}>
            <Animation
              backgroundColor={theme.colors.background}
              source={notFoundSource}
              loop={false}
            />
            <Text style={styles.noResultsText}>
              <Text style={{ color: theme.colors.notification }}>
                ({currentBibleLongName})
              </Text>
              {"\n"}
              No tienes versiculos favoritos en esta version de la escritura.
            </Text>
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
      flex: 0.7,
      alignItems: "center",
      justifyContent: "center",
    },
    noResultsText: {
      fontSize: 18,
      color: colors.text,
      textAlign: "center",
      paddingHorizontal: 10,
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

export default FavoriteList;
