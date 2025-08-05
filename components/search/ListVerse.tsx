import Animation from "@/components/Animation";
import RenderVerse from "@/components/concordance/RenderVerse";
import Icon from "@/components/Icon";
import { Text, View } from "@/components/Themed";
import { useBibleContext } from "@/context/BibleContext";
import { useTheme } from "@/context/ThemeContext";
import { bibleState$ } from "@/state/bibleState";
import { IVerseItem, Screens, TTheme } from "@/types";
import { getVerseTextRaw } from "@/utils/getVerseTextRaw";
import removeAccent from "@/utils/removeAccent";
import { useNavigation } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

type TListVerse = {
  data: IVerseItem[] | any;
  isLoading: boolean;
};

const ListVerse = ({ data, isLoading }: TListVerse) => {
  const animationRef = useRef<any>(null);
  const { theme } = useTheme();
  const navigation = useNavigation();
  const styles = getStyles(theme);
  const { searchQuery: query } = useBibleContext();
  const flatListRef = useRef<FlashList<any>>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const notFoundSource = require("../../assets/lottie/notFound.json");
  const searchingSource = require("../../assets/lottie/searching.json");

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

  useEffect(() => {
    if (!animationRef.current) return;
    // animationRef.current.play();

    return () => animationRef.current?.pause();
  }, []);

  if (isLoading || !data) {
    return (
      <View style={styles.noResultsContainer}>
        <Animation
          animationRef={animationRef}
          backgroundColor={theme.colors.background}
          source={searchingSource}
        />
        {query && <Text>Buscando...</Text>}
      </View>
    );
  }

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
        estimatedItemSize={135}
        data={data}
        renderItem={({ item, index }) => (
          <RenderVerse
            {...{
              theme,
              onItemClick: onVerseClick,
              sanitize: removeAccent,
              index,
              selected: !query
                ? []
                : [...removeAccent(query).trim().split(" ")],
            }}
            item={{
              ...item,
              text: getVerseTextRaw(item.text),
            }}
          />
        )}
        onScroll={handleScroll}
        keyExtractor={(item: any, index: any) => `list-${index}`}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.noResultsContainer}>
            <Animation
              backgroundColor={theme.colors.background}
              source={notFoundSource}
            />
            <Text style={styles.noResultsText}>No encontramos resultados</Text>
          </View>
        }
      />
      {renderScrollToTopButton()}
    </View>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
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
      backgroundColor: colors.notification,
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
