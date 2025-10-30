import Animation from "@/components/Animation";
import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import Icon from "@/components/Icon";
import ScreenWithAnimation from "@/components/ScreenWithAnimation";
import { Text, View } from "@/components/Themed";
import { DB_BOOK_NAMES } from "@/constants/BookNames";
import { useBibleContext } from "@/context/BibleContext";
import { useDBContext } from "@/context/databaseContext";
import { useMyTheme } from "@/context/ThemeContext";
import useCommentaryData, {
  DatabaseCommentaryData,
} from "@/hooks/useCommentaryData";
import useParams from "@/hooks/useParams";
import usePrintAndShare from "@/hooks/usePrintAndShare";
import { bibleState$ } from "@/state/bibleState";
import { ModulesFilters, Screens, TTheme } from "@/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { FlashList } from "@shopify/flash-list";
import { Stack, useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  BackHandler,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import * as Clipboard from "expo-clipboard";

type RenderItem = {
  item: DatabaseCommentaryData;
  index: any;
  theme: any;
  onItemClick: any;
  styles: any;
};

const RenderItem = ({
  item,
  index,
  theme,
  onItemClick,
  styles,
}: RenderItem) => {
  const { dbShortName, commentaries } = item;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateXAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 100,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(translateXAnim, {
        toValue: 0,
        duration: 100,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, translateXAnim, index]);

  if (commentaries.length === 0) return <></>;

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={styles.itemTitle}>{dbShortName}</Text>
      {commentaries.map((commentary: any, idx: number) => {
        const bookName =
          DB_BOOK_NAMES.find((b) => b.bookNumber === commentary.book_number)
            ?.longName || "";
        const reference = `${bookName} ${commentary.chapter_number_from}:${
          commentary.verse_number_from
        }${
          commentary.verse_number_to !== commentary.verse_number_from
            ? `-${commentary.verse_number_to}`
            : ""
        }`;
        const preview =
          commentary.text.substring(0, 150).replace(/<[^>]*>/g, "") + "...";

        return (
          <Animated.View
            key={`${commentary.book_number}-${commentary.chapter_number_from}-${commentary.verse_number_from}-${idx}`}
            style={[
              {
                opacity: fadeAnim,
                transform: [{ translateX: translateXAnim }],
                borderWidth: 1,
                borderRadius: 10,
                marginVertical: 5,
                borderColor: "#eeeeee50",
              },
            ]}
          >
            <TouchableOpacity
              style={[styles.cardContainer, { backgroundColor: "transparent" }]}
              onPress={() => onItemClick(commentary)}
            >
              <Text style={styles.cardTitle}>{reference}</Text>
              <Text style={styles.cardBody} numberOfLines={3}>
                {preview}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </View>
  );
};

type ReferencePickerProps = {
  bookNumber: number;
  chapter: number;
  verse: number | undefined;
  onReferenceChange: (book: number, chapter: number, verse?: number) => void;
  theme: TTheme;
};

const ReferencePicker: React.FC<ReferencePickerProps> = ({
  bookNumber,
  chapter,
  verse,
  onReferenceChange,
  theme,
}) => {
  const styles = getStyles(theme);
  const router = useRouter();

  const selectedBook = useMemo(
    () => DB_BOOK_NAMES.find((b) => b.bookNumber === bookNumber),
    [bookNumber]
  );

  const handleSelectReference = () => {
    const currentBook = bibleState$.bibleQuery.book.get();
    const currentChapter = bibleState$.bibleQuery.chapter.get();
    const currentVerse = bibleState$.bibleQuery.verse.get();

    router.push({
      pathname: Screens.ChooseReferenceDom,
      params: {
        book: currentBook,
        chapter: currentChapter.toString(),
        verse: currentVerse?.toString() || "0",
        returnScreen: Screens.Commentary,
      },
    });
  };

  return (
    <TouchableOpacity
      style={styles.referencePicker}
      onPress={handleSelectReference}
    >
      <View style={styles.referenceContent}>
        <Icon name="BookOpen" size={24} color={theme.colors.notification} />
        <Text style={styles.referenceText}>
          {selectedBook?.longName || "Seleccionar"} {chapter}
          {verse ? `:${verse}` : ""}
        </Text>
      </View>
      <Icon name="ChevronRight" size={24} color={theme.colors.text} />
    </TouchableOpacity>
  );
};

type CommentaryScreenProps = {};

const CommentaryScreen: React.FC<CommentaryScreenProps> = ({}) => {
  const {
    book: paramBook,
    chapter: paramChapter,
    verse: paramVerse,
  } = useParams<{ book?: string; chapter?: string; verse?: string }>();

  const { fontSize } = useBibleContext();
  const [selectedCommentary, setSelectedCommentary] = useState<any>(null);
  const [filterData, setFilterData] = useState<DatabaseCommentaryData[]>([]);
  const { theme, schema } = useMyTheme();
  const router = useRouter();
  const styles = getStyles(theme);
  const { installedCommentary: dbNames } = useDBContext();
  const { printToFile } = usePrintAndShare();
  const searchingSource = require("../assets/lottie/searching.json");
  const animationRef = useRef<any>(null);
  console.log({ dbNames });
  // Get reference from params or current bible state
  const currentBook = useMemo(() => {
    if (paramBook) {
      return DB_BOOK_NAMES.find((b) => b.longName === paramBook);
    }
    const stateBook = bibleState$.bibleQuery.book.get();
    return DB_BOOK_NAMES.find((b) => b.longName === stateBook);
  }, [paramBook]);

  const bookNumber = currentBook?.bookNumber || 40; // Default to Matthew
  const chapter = paramChapter
    ? parseInt(paramChapter)
    : bibleState$.bibleQuery.chapter.get() || 1;
  const verse = paramVerse ? parseInt(paramVerse) : undefined;

  useEffect(() => {
    if (!animationRef.current) return;
    return () => animationRef.current?.pause();
  }, []);

  const { data, error, loading, onSearch } = useCommentaryData({
    databases: dbNames,
    enabled: true,
    autoSearch: true,
    bookNumber,
    chapter,
    verse,
  });

  const commentaryNotFound = useMemo(
    () => data?.every((version) => version.commentaries.length === 0),
    [data]
  );

  const hasCommentary = useMemo(() => dbNames.length >= 1, [dbNames]);

  useEffect(() => {
    if (!loading && !error) {
      setFilterData(
        data?.sort((a, b) => a.commentaries.length - b.commentaries.length)
      );
    } else if (error) {
      console.log("Error fetching commentary data:", error);
    }
  }, [data, loading, error]);

  useEffect(() => {
    const backAction = () => {
      if (selectedCommentary) {
        setSelectedCommentary(null);
        return true;
      }
      router.back();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [selectedCommentary]);

  const onItemClick = (commentary: any) => {
    setSelectedCommentary(commentary);
  };

  const onNavToManagerDownload = useCallback(() => {
    router.push({
      pathname: Screens.DownloadManager,
      params: { filter: ModulesFilters.COMMENTARIES },
    });
  }, [router]);

  const handleShareContent = async () => {
    if (!selectedCommentary) return;

    try {
      const bookName =
        DB_BOOK_NAMES.find(
          (b) => b.bookNumber === selectedCommentary.book_number
        )?.longName || "";
      const reference = `${bookName} ${selectedCommentary.chapter_number_from}:${selectedCommentary.verse_number_from}`;
      const content = `${reference}\n\n${selectedCommentary.text.replace(
        /<[^>]*>/g,
        ""
      )}`;

      await Clipboard.setStringAsync(content);
      printToFile(selectedCommentary.text, reference);
    } catch (error) {
      console.error("Error sharing content:", error);
    }
  };

  const CommentaryDetail = () => {
    if (!selectedCommentary) return null;

    const bookName =
      DB_BOOK_NAMES.find((b) => b.bookNumber === selectedCommentary.book_number)
        ?.longName || "";
    const reference = `${bookName} ${selectedCommentary.chapter_number_from}:${
      selectedCommentary.verse_number_from
    }${
      selectedCommentary.verse_number_to !==
      selectedCommentary.verse_number_from
        ? `-${selectedCommentary.verse_number_to}`
        : ""
    }`;

    return (
      <View style={styles.detailContainer}>
        <View style={styles.detailHeader}>
          <TouchableOpacity
            onPress={() => setSelectedCommentary(null)}
            style={styles.backButton}
          >
            <Icon
              name="ArrowLeft"
              size={24}
              color={theme.colors.notification}
            />
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleShareContent}
            style={styles.shareButton}
          >
            <Icon name="Share" size={24} color={theme.colors.notification} />
          </TouchableOpacity>
        </View>
        <Text style={styles.detailReference}>{reference}</Text>
        <Text style={styles.detailText}>
          {selectedCommentary.text.replace(/<[^>]*>/g, "")}
        </Text>
      </View>
    );
  };

  const ListEmptyComponent = useCallback(() => {
    return hasCommentary ? (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "transparent",
        }}
      >
        <Animation
          animationRef={animationRef}
          backgroundColor={theme.colors.background}
          source={searchingSource}
        />
        {commentaryNotFound ? (
          <Text style={[styles.noResultsText, { fontSize }]}>
            No encontramos comentarios para esta referencia
          </Text>
        ) : (
          <Text>Selecciona una referencia bíblica</Text>
        )}
      </View>
    ) : (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="cloud-download-outline"
          size={50}
          color={theme.colors.text}
        />
        <Text style={styles.emptyText}>
          No tienes ningún comentario descargado. {"\n"}
          <TouchableOpacity onPress={onNavToManagerDownload}>
            <Text style={styles.linkText}>
              Haz clic aquí para descargar uno.
            </Text>
          </TouchableOpacity>
        </Text>
      </View>
    );
  }, [hasCommentary, commentaryNotFound]);

  const screenOptions = useMemo(() => {
    return {
      theme,
      title: "Comentarios",
      titleIcon: "MessageSquare",
      headerRightProps: {
        headerRightIcon: "RefreshCw",
        headerRightIconColor: theme.colors.notification,
        onPress: () => onSearch({ bookNumber, chapter, verse }),
        disabled: loading,
        style: { opacity: loading ? 0.5 : 1 },
      },
    } as any;
  }, [loading, bookNumber, chapter, verse]);

  return (
    <>
      <Stack.Screen
        options={{
          ...singleScreenHeader(screenOptions),
        }}
      />

      <ScreenWithAnimation
        animationSource={searchingSource}
        speed={2}
        title="Comentarios"
      >
        <View
          style={{
            flex: 1,
            padding: 5,
            backgroundColor: theme.dark ? theme.colors.background : "#eee",
          }}
        >
          {selectedCommentary ? (
            <CommentaryDetail />
          ) : (
            <>
              <ReferencePicker
                bookNumber={bookNumber}
                chapter={chapter}
                verse={verse}
                onReferenceChange={(book, ch, v) => {
                  onSearch({ bookNumber: book, chapter: ch, verse: v });
                }}
                theme={theme}
              />
              <FlashList
                key={schema}
                contentContainerStyle={{
                  backgroundColor: theme.dark
                    ? theme.colors.background
                    : "#eee",
                  paddingVertical: 20,
                }}
                decelerationRate={"normal"}
                data={commentaryNotFound ? [] : filterData}
                renderItem={({ item, index }) => (
                  <RenderItem
                    {...{ theme, styles, onItemClick }}
                    item={item}
                    index={index}
                  />
                )}
                keyExtractor={(item: any, index: any) =>
                  `commentary-${item.dbShortName}-${index}`
                }
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                ListEmptyComponent={<ListEmptyComponent />}
              />
            </>
          )}
        </View>
      </ScreenWithAnimation>
    </>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    referencePicker: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.notification + "20",
      borderWidth: 1,
      borderColor: colors.text,
      borderRadius: 10,
      padding: 15,
      marginVertical: 12,
    },
    referenceContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: "transparent",
    },
    referenceText: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
    },
    cardContainer: {
      padding: 15,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.notification,
      marginBottom: 8,
    },
    cardBody: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
    separator: {
      height: 1,
      marginVertical: 5,
    },
    noResultsText: {
      fontSize: 18,
      color: colors.text,
      textAlign: "center",
    },
    itemTitle: {
      fontSize: 20,
      marginVertical: 5,
      color: colors.notification,
    },
    emptyContainer: {
      alignItems: "center",
      backgroundColor: "transparent",
      justifyContent: "center",
      padding: 20,
    },
    emptyText: {
      textAlign: "center",
      marginVertical: 20,
      color: colors.text,
      fontSize: 18,
    },
    linkText: {
      color: colors.notification,
      textDecorationLine: "underline",
      fontSize: 18,
    },
    detailContainer: {
      flex: 1,
      padding: 15,
      backgroundColor: dark ? colors.background : "#fff",
      borderRadius: 10,
    },
    detailHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 15,
      backgroundColor: "transparent",
    },
    backButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: "transparent",
    },
    backButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.notification,
    },
    shareButton: {
      padding: 8,
    },
    detailReference: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.notification,
      marginBottom: 15,
    },
    detailText: {
      fontSize: 16,
      lineHeight: 24,
      color: colors.text,
    },
  });

export default CommentaryScreen;
