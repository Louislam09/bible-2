import { useNavigation, useTheme } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import Animation from "@/components/Animation";
import DecoratorLine from "@/components/DecoratorLine";
import Icon from "@/components/Icon";
import { Text } from "@/components/Themed";
import { useBibleContext } from "@/context/BibleContext";
import { useEffect, useRef, useState } from "react";
import {
  ListRenderItem,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { IVerseItem, Screens, TTheme } from "@/types";
import copyToClipboard from "@/utils/copyToClipboard";
import { getVerseTextRaw } from "@/utils/getVerseTextRaw";
import { Stack } from 'expo-router';
import { renameLongBookName } from '@/utils/extractVersesInfo';

type TListVerse = {
  data: IVerseItem[] | any;
  isLoading: boolean;
};

const FavoriteList = ({ data }: TListVerse) => {
  const [filterData, setFilter] = useState([]);
  const theme = useTheme();
  const navigation = useNavigation();
  const styles = getStyles(theme);
  const { toggleFavoriteVerse, currentBibleLongName, orientation } =
    useBibleContext();
  const flatListRef = useRef<FlashList<any>>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const notFoundSource = require('../../assets/lottie/notFound.json');

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
      <TouchableOpacity
        style={styles.itemContainer}
        activeOpacity={0.9}
        onPress={() => onVerseClick(item)}
      >
        {/* <DecoratorLine color="#ffd41d" theme={theme} /> */}
        <View style={styles.cardContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.cardTitle}>{`${renameLongBookName(
              item.bookName
            )} ${item.chapter}:${item.verse}`}</Text>
            <View style={styles.verseAction}>
              <Icon
                size={20}
                name='Copy'
                style={styles.icon}
                onPress={() => onCopy(item)}
              />
              <Icon
                size={20}
                name='Star'
                strokeWidth={3}
                color='#ffd41d'
                style={styles.icon}
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
          !filterData.length && { display: 'none' },
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
          !showScrollToTop && { display: 'none' },
        ]}
        onPress={() => {
          flatListRef?.current?.scrollToOffset({ animated: true, offset: 0 });
        }}
      >
        <Icon color={theme.colors.notification} name='ChevronsUp' size={26} />
      </TouchableOpacity>
    );
  };

  return (
    <View key={orientation + theme.dark} style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: true }} />
      <FlashList
        ref={flatListRef}
        ListHeaderComponent={SearchedHeader}
        decelerationRate={'normal'}
        estimatedItemSize={135}
        data={filterData}
        renderItem={renderItem as any}
        onScroll={handleScroll}
        keyExtractor={(item: any, index: any) => `fav-${index}`}
        // ItemSeparatorComponent={() => <View style={styles.separator} />}
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
              {'\n'}
              No tienes versiculos favoritos en esta version de la escritura.
            </Text>
          </View>
        }
      />
      {renderScrollToTopButton()}
    </View>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
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
    itemContainer: {
      flexDirection: "row",
      backgroundColor: dark ? colors.background : "white",
      marginVertical: 5,
      paddingLeft: 5,
    },
    cardContainer: {
      display: "flex",
      borderRadius: 10,
      padding: 10,
      flex: 1,
      elevation: 5,
      ...Platform.select({
        ios: {
          shadowColor: "black",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        },
      }),
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
      borderColor: colors.notification + "50",
      backgroundColor: dark ? colors.background : "white",
      borderWidth: dark ? 1 : 0,
      shadowColor: colors.notification,
      shadowOpacity: 1,
      shadowRadius: 10,
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
      backgroundColor: "transparent",
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
