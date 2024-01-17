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
import { getVerseTextRaw } from "utils/getVerseTextRaw";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Highlighter from "components/Highlighter";

type TListVerse = {
  data: IVerseItem[] | any;
  isLoading: boolean;
};

const ListVerse = ({ data, isLoading }: TListVerse) => {
  const animationRef = useRef<any>(null);
  const theme = useTheme();
  const navigation = useNavigation();
  const styles = getStyles(theme);
  const { saerchQuery: query } = useBibleContext();
  const flatListRef = useRef<FlashList<any>>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const notFoundSource = require("../../assets/lottie/notFound.json");
  const searchingSource = require("../../assets/lottie/searching.json");
  const land = require("../../assets/lottie/land.json");

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const shouldShowButton = offsetY > 100; // Adjust the threshold as needed
    setShowScrollToTop(shouldShowButton);
  };

  const onVerseClick = (item: IVerseItem) => {
    navigation.navigate(Screens.Home, {
      book: item.bookName,
      chapter: item.chapter,
      verse: item.verse,
    });
  };

  const renderItem: ListRenderItem<IVerseItem> = ({ item }) => {
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={() => onVerseClick(item)}>
        <View style={styles.cardContainer}>
          <View style={styles.headerContainer}>
            <Text
              style={styles.cardTitle}
            >{`${item.bookName} ${item.chapter}:${item.verse}`}</Text>
          </View>
          <Highlighter
            style={styles.cardBody}
            highlightStyle={{ color: theme.colors.notification }}
            searchWords={[...query.split(" ")]}
            textToHighlight={getVerseTextRaw(item.text)}
            // onWordClick={(text) => console.log({ text })}
          />
        </View>
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    if (!animationRef.current) return;
    // animationRef.current.play();

    return () => animationRef.current?.pause();
  }, []);

  const SearchedHeader = () => {
    return (
      <View style={styles.chapterHeader}>
        <Text style={styles.chapterHeaderTitle}>
          {(data ?? []).length} versiculos encontrado
        </Text>
      </View>
    );
  };

  if (isLoading || !data) {
    return (
      <View style={styles.noResultsContainer}>
        <Animation
          animationRef={animationRef}
          backgroundColor={theme.colors.background}
          source={searchingSource}
        />
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
        data={data}
        renderItem={renderItem as any}
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
