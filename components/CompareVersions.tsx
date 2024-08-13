import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { FlashList } from "@shopify/flash-list";
import Animation from "components/Animation";
import { Text } from "components/Themed";
import { DB_BOOK_CHAPTER_VERSES, DB_BOOK_NAMES } from "constants/BookNames";
import { useBibleContext } from "context/BibleContext";
import { useDBContext } from "context/databaseContext";
import useCompareVerses, { DatabaseData } from "hooks/useCompareVerses";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ListRenderItem,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { IVerseItem, Screens, TTheme } from "types";
import copyToClipboard from "utils/copyToClipboard";
import { getVerseTextRaw } from "utils/getVerseTextRaw";

interface CompareVersionsProps {
  theme: TTheme;
  book: any;
  chapter: any;
  verse: any;
  navigation: any;
  compareRef: React.RefObject<BottomSheetModalMethods>;
}

const CompareVersions = ({
  theme,
  book,
  chapter,
  verse,
  navigation,
  compareRef,
}: CompareVersionsProps) => {
  const { installedBibles: dbNames, executeSql } = useDBContext();
  const [filterData, setFilter] = useState<DatabaseData[]>([]);
  const styles = getStyles(theme);
  const { fontSize, selectBibleVersion } = useBibleContext();
  const flatListRef = useRef<FlashList<any>>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const notFoundSource = require("../assets/lottie/notFound.json");
  const [searchParam, setSearchParam] = useState({
    book,
    chapter,
    verse,
  });

  const { data, error, loading } = useCompareVerses({
    ...searchParam,
    databases: dbNames,
    executeSql,
  });
  const currentBook = DB_BOOK_NAMES.find(
    (x) => x.longName === book
  )?.bookNumber;

  const verseInfo =
    DB_BOOK_CHAPTER_VERSES.find(
      (x) => x.bookNumber === currentBook && x.chapterNumber === chapter
    )?.verseCount || 10;

  useEffect(() => {
    if (loading) {
    } else if (error) {
      console.error(error);
    } else {
      setFilter(data);
    }
  }, [data, loading, error]);

  const onVerseClick = async (item: IVerseItem, dbID: string) => {
    await selectBibleVersion(dbID);
    navigation.setParams({
      book: item.bookName,
      chapter: item.chapter,
      verse: item.verse,
    });
    compareRef.current?.dismiss();
  };

  const onCopy = async (item: IVerseItem, versionName: string) => {
    await copyToClipboard({
      ...item,
      bookName: `${versionName} \n\n${item.bookName}`,
    });
  };

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const shouldShowButton = offsetY > 100; // Adjust the threshold as needed
    setShowScrollToTop(shouldShowButton);
  };

  const renderItem: ListRenderItem<DatabaseData> = ({ item: versionItem }) => {
    const { dbItem, value: item } = versionItem;
    const { name: versionName, shortName, id } = dbItem;
    return (
      <TouchableOpacity activeOpacity={0.9}>
        <View style={[styles.cardContainer]}>
          <Text style={[styles.versionName, { fontSize: 18 }]}>
            {shortName} - {versionName}
          </Text>
          <View style={styles.headerContainer}>
            <Text style={[styles.cardTitle, { fontSize }]}>
              {`${item?.bookName} ${item?.chapter}:${item?.verse}`}
            </Text>
            <View style={styles.verseAction}>
              <MaterialCommunityIcons
                size={20}
                name="content-copy"
                style={styles.icon}
                onPress={() => onCopy(item, versionName)}
              />
            </View>
          </View>
          <Text style={[styles.verseBody, { fontSize }]}>
            {getVerseTextRaw(item.text || "")}
          </Text>
          <TouchableOpacity
            style={styles.verseAction}
            onPress={() => onVerseClick(item, id)}
          >
            <Text style={[styles.cardTitle]}>
              Lee {`${item?.bookName} ${item?.chapter}`}
            </Text>
            <MaterialCommunityIcons
              name="open-in-new"
              size={18}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const back = useCallback(() => {
    setSearchParam((prev) => ({ ...prev, verse: Math.max(1, prev.verse - 1) }));
  }, [searchParam]);

  const next = useCallback(() => {
    setSearchParam((prev) => ({
      ...prev,
      verse: Math.min(verseInfo, prev.verse + 1),
    }));
  }, [searchParam]);

  const actionOptions: any[] = useMemo(
    () => [
      {
        icon: "play-skip-back",
        action: back,
        label: "Anterior",
        isIonicon: true,
      },
      {
        icon: "play-skip-forward",
        action: next,
        label: "Siguiente",
        isIonicon: true,
      },
    ],
    [next, back]
  );

  const renderItemOption = (item: any) => (
    <TouchableOpacity
      key={item.label}
      onPress={item.action}
      disabled={item.disabled}
    >
      <View
        style={{
          backgroundColor: "transparent",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {item.isIonicon ? (
          <Ionicons
            name={item.icon}
            style={{
              fontSize: 45,
              color: item.disabled ? "#898989" : theme.colors.notification,
            }}
          />
        ) : (
          <MaterialCommunityIcons name={item.icon} style={{ fontSize: 35 }} />
        )}

        <Text style={{ color: theme.colors.text }}>{item.label}</Text>
      </View>
    </TouchableOpacity>
  );

  const SearchedHeader = () => {
    return (
      <View
        style={[
          styles.chapterHeader,
          !filterData.length && { display: "none" },
        ]}
      >
        <Text style={styles.chapterHeaderTitle}>
          Comparativa de {(filterData ?? []).length} Versiones
        </Text>
        {/* <View style={styles.footer}>{actionOptions.map(renderItemOption)}</View> */}
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
      {SearchedHeader()}
      <FlashList
        ref={flatListRef}
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
            <Text style={styles.noResultsText}>No hay resultados</Text>
          </View>
        }
      />
      {renderScrollToTopButton()}
    </View>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    footer: {
      width: "100%",
      justifyContent: "space-between",
      alignItems: "center",
      flexDirection: "row",
      backgroundColor: "transparent",
      color: colors.text,
      marginVertical: 10,
    },
    versionName: {
      color: colors.text,
      paddingVertical: 5,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 5,
    },
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
      borderBottomWidth: 1,
      borderColor: colors.notification + "99",
    },
    chapterHeaderTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
      width: "100%",
    },
    cardContainer: {
      display: "flex",
      borderRadius: 10,
      padding: 10,
      margin: 8,
      marginBottom: 0,
      paddingBottom: 0,
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
      marginVertical: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 10,
    },
    icon: {
      fontWeight: "700",
      marginHorizontal: 10,
      color: colors.primary,
      fontSize: 24,
    },
  });

export default CompareVersions;
