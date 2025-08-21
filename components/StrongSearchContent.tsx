import { Text } from "@/components/Themed";
import { useBibleContext } from "@/context/BibleContext";
import { bibleState$ } from "@/state/bibleState";
import { IVerseItem, Screens, TTheme } from "@/types";
import copyToClipboard from "@/utils/copyToClipboard";
import { renameLongBookName } from "@/utils/extractVersesInfo";
import { useNavigation } from "@react-navigation/native";
import { FlashList, FlashListRef } from "@shopify/flash-list";
import { useEffect, useRef, useState } from "react";
import {
  ListRenderItem,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import RenderTextWithClickableWords from "./home/content/RenderTextWithClickableWords";
import Icon from "./Icon";

type TListVerse = {
  data: IVerseItem[] | any;
  theme: TTheme;
  strongWord: { code: string; text: string };
  currentFilter: string;
};

const StrongSearchContent = ({
  data,
  theme,
  strongWord,
  currentFilter,
}: TListVerse) => {
  const navigation = useNavigation();
  const [filterData, setFilter] = useState([]);
  const styles = getStyles(theme);
  const { fontSize } = useBibleContext();
  const flatListRef = useRef<FlashListRef<any>>(null);
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
    const queryInfo = {
      book: item.bookName,
      chapter: item.chapter,
      verse: item.verse,
    };
    bibleState$.changeBibleQuery({
      ...queryInfo,
      shouldFetch: true,
      isHistory: false,
    });
    navigation.navigate(Screens.Home, queryInfo);
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
            <Text style={styles.cardTitle}>{`${renameLongBookName(
              item.bookName
            )} ${item.chapter}:${item.verse}`}</Text>
            <View style={styles.verseAction}>
              <Icon
                size={20}
                name="Copy"
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
        <Icon color={theme.colors.notification} name="ChevronsUp" size={26} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <FlashList
        ref={flatListRef}
        decelerationRate={"normal"}
        data={filterData}
        renderItem={renderItem as any}
        onScroll={handleScroll}
        keyExtractor={(item: any, index: any) => `search-${index}`}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListFooterComponent={<View style={styles.footer} />}
        ListEmptyComponent={
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>
              No se encontraron resultados en: {"\n"} {currentFilter}
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
      paddingTop: 20,
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
