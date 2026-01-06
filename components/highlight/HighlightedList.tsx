import { View as ThemedView } from "@/components/Themed";
import { getBookDetail } from "@/constants/BookNames";
import { highlightedListHtmlTemplate } from "@/constants/highlightedListTemplate";
import { useAlert } from "@/context/AlertContext";
import { useBibleContext } from "@/context/BibleContext";
import { useDBContext } from "@/context/databaseContext";
import { useMyTheme } from "@/context/ThemeContext";
import { THighlightedVerse, useHighlightService } from "@/services/highlightService";
import { bibleState$ } from "@/state/bibleState";
import { IVerseItem, Screens, TTheme } from "@/types";
import copyToClipboard from "@/utils/copyToClipboard";
import { getVerseTextRaw } from "@/utils/getVerseTextRaw";
import { showToast } from "@/utils/showToast";
import { createOptimizedWebViewProps } from "@/utils/webViewOptimizations";
import { useNavigation } from "@react-navigation/native";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Stack, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  StyleSheet,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import WebView from "react-native-webview";

type HighlightedListProps = {};

const HighlightedList = ({ }: HighlightedListProps) => {
  const { confirm } = useAlert();
  const [data, setData] = useState<THighlightedVerse[]>([]);

  const webViewRef = useRef<WebView>(null);

  // Hooks
  const { theme } = useMyTheme();
  const navigation = useNavigation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const styles = getStyles(theme);

  const { currentBibleLongName, currentBibleVersion } = useBibleContext();
  const { installedBibles } = useDBContext();
  const { getAllHighlightedVerses, deleteHighlight } = useHighlightService();

  // Get current Bible version short name
  const currentVersionShortName = useMemo(() => {
    const currentBible = installedBibles.find((version) => version.id === currentBibleVersion);
    return currentBible?.shortName || currentBibleLongName || "NIV";
  }, [installedBibles, currentBibleVersion, currentBibleLongName]);

  // Format relative time (e.g., "hace 2 días")
  const formatTimeAgo = useCallback((timestamp: number | string): string => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp);
    return formatDistanceToNow(date, { addSuffix: true, locale: es });
  }, []);

  const fetchData = useCallback(async () => {
    const highlights = await getAllHighlightedVerses();
    setData(highlights ?? []);
  }, [getAllHighlightedVerses]);

  useEffect(() => {
    fetchData();
  }, []);

  const onVerseClick = useCallback(
    (item: THighlightedVerse) => {
      const queryInfo = {
        book: item.bookName || getBookDetail(item.book_number).longName,
        chapter: item.chapter,
        verse: item.verse,
      };

      bibleState$.changeBibleQuery({
        ...queryInfo,
        shouldFetch: true,
        isHistory: false,
      });

      navigation.navigate(Screens.Home, queryInfo);
    },
    [navigation]
  );


  const onCopy = useCallback(async (item: THighlightedVerse) => {
    try {
      const verseItem: IVerseItem = {
        book_number: item.book_number,
        chapter: item.chapter,
        verse: item.verse,
        text: item.text || "",
        bookName: item.bookName || getBookDetail(item.book_number).longName,
      };
      await copyToClipboard(verseItem);
    } catch (error) {
      console.error("Error copying verse:", error);
      showToast("Error al copiar versículo");
    }
  }, []);

  const onShare = useCallback((item: THighlightedVerse) => {
    const verseText = item.text ? getVerseTextRaw(item.text) : "";
    const reference = `${getBookDetail(item?.book_number).longName} ${item.chapter}:${item.verse}`;
    bibleState$.handleSelectVerseForNote(verseText);
    router.push({ pathname: "/quoteMaker", params: { text: verseText, reference } });
  }, [router]);

  const onDelete = useCallback(
    (item: THighlightedVerse) => {
      confirm(
        "Eliminar destacado",
        "¿Estás seguro de eliminar este versículo destacado?",
        async () => {
          try {
            await deleteHighlight(
              item.book_number,
              item.chapter,
              item.verse,
            );

            setData((prev) => prev.filter((v: THighlightedVerse) => v.id !== item.id));

            showToast("Versículo destacado eliminado");
          } catch (error) {
            console.error("Error removing highlight:", error);
            showToast("Error al eliminar versículo destacado");
          }
        }
      );
    },
    [confirm, deleteHighlight]
  );

  // Handle WebView messages
  const handleWebViewMessage = useCallback(
    (event: any) => {
      try {
        const message = JSON.parse(event.nativeEvent.data);
        const { type, data } = message;

        console.log("WebView message received:", type, data);

        // Find item by id
        const item = data.find((v: THighlightedVerse) => {
          const itemId = v.id?.toString();
          const dataId = data.id?.toString();
          return itemId === dataId;
        });

        if (!item) {
          console.warn("Item not found for id:", data.id);
          return;
        }

        switch (type) {
          case "copy":
            console.log("Copy action triggered");
            onCopy(item);
            break;
          case "share":
            console.log("Share action triggered");
            onShare(item);
            break;
          case "delete":
            console.log("Delete action triggered");
            onDelete(item);
            break;
          case "goToContext":
          case "context":
            console.log("Go to context action triggered");
            onVerseClick(item);
            break;
          default:
            console.log("Unknown message type:", type);
        }
      } catch (error) {
        console.error("Error parsing WebView message:", error, event.nativeEvent.data);
      }
    },
    [data, onCopy, onShare, onDelete, onVerseClick]
  );

  // Generate HTML content
  const htmlContent = useMemo(() => {
    return highlightedListHtmlTemplate(
      data,
      theme,
      currentVersionShortName,
      formatTimeAgo,
      16,
      undefined // selectedFont - can be added later if needed
    );
  }, [data, theme, currentVersionShortName, formatTimeAgo]);


  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Mis versículos destacados",
          headerTitleStyle: { color: theme.colors.text },
          headerStyle: { backgroundColor: theme.colors.background },
        }}
      />
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{ html: htmlContent }}
        style={styles.webView}
        onMessage={handleWebViewMessage}
        scrollEnabled={true}
        bounces={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        renderLoading={() => (
          <View
            style={{
              backgroundColor: theme.colors.background,
              flex: 1,
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1000,
              justifyContent: "center",
              alignItems: "center",
            }}
          />
        )}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error("WebView error:", nativeEvent);
        }}
        {...createOptimizedWebViewProps({}, "static")}
      />
    </ThemedView>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    webView: {
      flex: 1,
      backgroundColor: "transparent",
    },
    headerCompositeContainer: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 8,
      backgroundColor: colors.background,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 10,
      marginVertical: 12,
      borderWidth: 1,
      width: "100%",
      height: 48,
      backgroundColor: colors.notification + "20",
      borderColor: colors.text,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      color: colors.text,
      fontSize: 16,
      padding: 8,
      fontWeight: "400",
    },
    chapterHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    chapterHeaderTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
    },
    selectButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: colors.notification + "30",
    },
    selectButtonText: {
      color: colors.notification,
      fontWeight: "500",
    },
    itemContainer: {
      marginVertical: 8,
      marginHorizontal: 16,
      borderRadius: 16,
      overflow: "hidden",
    },
    selectedItem: {
      backgroundColor: colors.notification + "20",
    },
    pressedCard: {
      transform: [{ scale: 0.99 }],
      opacity: 0.95,
    },
    cardContainer: {
      borderRadius: 16,
      padding: 20,
      backgroundColor: dark ? colors.text + 20 : 'white',
      borderWidth: 1,
      borderColor: dark ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.1)",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    colorDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginRight: 8,
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 4,
    },
    verseReference: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
    },
    timestamp: {
      fontSize: 10,
      fontWeight: "500",
      textTransform: "uppercase",
      letterSpacing: 0.5,
      color: colors.text + "99",
    },
    verseTextContainer: {
      position: "relative",
      paddingLeft: 12,
      marginBottom: 12,
      marginTop: 0,
    },
    leftBorderAccent: {
      position: "absolute",
      left: 0,
      top: 4,
      bottom: 4,
      width: 2,
      borderRadius: 1,
    },
    verseText: {
      fontSize: 15,
      lineHeight: 24,
      color: colors.text + "CC",
    },
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: dark ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.1)",
    },
    versionText: {
      fontSize: 12,
      fontWeight: "500",
      color: colors.text + "99",
    },
    goToContextButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 4,
      paddingLeft: 8,
      paddingRight: 4,
      borderRadius: 8,
    },
    goToContextText: {
      fontSize: 12,
      fontWeight: "500",
      color: colors.notification || colors.primary,
    },
    icon: {
      color: colors.primary,
    },
    rightSwipeActions: {
      width: 80,
      alignItems: "center",
      justifyContent: "center",
      marginVertical: 5,
    },
    deleteAction: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      width: 80,
      backgroundColor: "#ff3b30",
      borderTopRightRadius: 10,
      borderBottomRightRadius: 10,
    },
    deleteButton: {
      backgroundColor: "#ff3b30",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      width: "100%",
      borderRadius: 6,
    },
    deleteButtonText: {
      color: "#fff",
      fontWeight: "600",
      fontSize: 14,
      marginLeft: 6,
    },
    scrollToTopButton: {
      position: "absolute",
      bottom: 80,
      right: 20,
      backgroundColor: "transparent",
    },
    scrollToTopButtonInner: {
      backgroundColor: colors.notification,
      padding: 12,
      borderRadius: 30,
    },
    noResultsContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
      padding: 20,
    },
    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
    },
    animation: {
      width: 200,
      height: 200,
    },
    loadingText: {
      fontSize: 16,
      color: colors.text,
      marginTop: 20,
    },
    noResultsText: {
      fontSize: 18,
      color: colors.text,
      textAlign: "center",
      paddingHorizontal: 10,
      marginTop: 16,
    },
    emptyStateContent: {
      alignItems: "center",
    },
    addFavoriteButton: {
      marginTop: 20,
      backgroundColor: colors.notification,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 8,
    },
    addFavoriteButtonText: {
      color: "#fff",
      fontWeight: "600",
    },
    selectionToolbar: {
      marginTop: 8,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    selectedCount: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.text,
      marginBottom: 8,
    },
    selectionActions: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    toolbarButton: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 6,
      backgroundColor: colors.card,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    toolbarButtonText: {
      color: colors.text,
      fontWeight: "500",
      fontSize: 14,
    },
    checkboxContainer: {
      marginRight: 12,
      justifyContent: "center",
      marginBottom: 10,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: colors.notification,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
    },
    checkboxSelected: {
      backgroundColor: colors.notification,
      borderColor: colors.notification,
    },
    buttonLoader: {
      position: "absolute",
    },
  });

export default HighlightedList;
