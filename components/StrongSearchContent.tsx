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
import { IStrongWord, IVerseItem, Screens, StrongData, TTheme } from "types";
import copyToClipboard from "utils/copyToClipboard";
import { getVerseTextRaw } from "utils/getVerseTextRaw";
import RenderTextWithClickableWords from "./home/content/RenderTextWithClickableWords";

type TListVerse = {
  data: IVerseItem[] | any;
  theme: TTheme;
  strongWord: { code: string; text: string };
};

const StrongSearchContent = ({ data, theme, strongWord }: TListVerse) => {
  const navigation = useNavigation();
  const [filterData, setFilter] = useState([]);
  const styles = getStyles(theme);
  const { fontSize } = useBibleContext();
  const flatListRef = useRef<FlashList<any>>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  useEffect(() => {
    if (!data) return;
    setFilter(data);
  }, [data]);

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
            </View>
          </View>
          <Text style={[styles.verseBody, { fontSize }]}>
            <RenderTextWithClickableWords
              highlightedWord={strongWord.code}
              justOneWord
              theme={theme}
              text={item.text}
              onWordClick={() => {}}
            />
          </Text>
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
          {strongWord.code} {"\n"}
        </Text>
        <Text
          style={[
            styles.chapterHeaderTitle,
            { color: theme.colors.notification },
          ]}
        >
          {(filterData ?? []).length} versiculos encontrados
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
        keyExtractor={(item: any, index: any) => `search-${index}`}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListFooterComponent={<View style={styles.footer} />}
        ListEmptyComponent={
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>
              No se encontró ningún resultado.
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
    footer: {
      backgroundColor: colors.background,
      paddingTop: 60,
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

export default StrongSearchContent;
