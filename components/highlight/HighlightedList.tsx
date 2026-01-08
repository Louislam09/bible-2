import { View as ThemedView } from "@/components/Themed";
import { getBookDetail } from "@/constants/BookNames";
import { highlightedListHtmlTemplate, HighlightViewMode } from "@/constants/highlightedListTemplate";
import { useAlert } from "@/context/AlertContext";
import { useBibleContext } from "@/context/BibleContext";
import { useDBContext } from "@/context/databaseContext";
import { storedData$ } from "@/context/LocalstoreContext";
import { useMyTheme } from "@/context/ThemeContext";
import { THighlightedVerse, useHighlightService } from "@/services/highlightService";
import { bibleState$ } from "@/state/bibleState";
import { IVerseItem, Screens, TTheme } from "@/types";
import copyToClipboard from "@/utils/copyToClipboard";
import { getVerseTextRaw } from "@/utils/getVerseTextRaw";
import { showToast } from "@/utils/showToast";
import { createOptimizedWebViewProps } from "@/utils/webViewOptimizations";
import { use$ } from "@legendapp/state/react";
import { useNavigation } from "@react-navigation/native";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  StyleSheet,
  View
} from "react-native";
import WebView from "react-native-webview";

type HighlightedListProps = {};

const HighlightedList = ({ }: HighlightedListProps) => {
  const { confirm } = useAlert();
  const [data, setData] = useState<THighlightedVerse[]>([]);
  const [viewMode, setViewMode] = useState<HighlightViewMode>(() => {
    return (storedData$.highlightsViewMode?.get() as HighlightViewMode) || 'list';
  });

  const webViewRef = useRef<WebView>(null);

  // Hooks
  const { theme } = useMyTheme();
  const navigation = useNavigation();
  const router = useRouter();
  const styles = getStyles(theme);

  const { currentBibleLongName, currentBibleVersion } = useBibleContext();
  const { installedBibles } = useDBContext();
  const { getAllHighlightedVerses, deleteHighlight } = useHighlightService();

  const reloadHighlights = use$(() => bibleState$.reloadHighlights.get());

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
    try {
      const highlights = await getAllHighlightedVerses();
      setData(highlights ?? []);
    } catch (error) {
      console.error("Error fetching highlighted verses:", error);
      showToast("Error al cargar versículos destacados");
    }
  }, [getAllHighlightedVerses]);

  useEffect(() => {
    fetchData();
  }, [reloadHighlights]);

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
              item.uuid
            );

            setData((prev) => prev.filter((v) => v.id !== item.id));

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
        const { type, data: msgData } = message;

        // Handle view mode change
        if (type === 'viewModeChange') {
          const newMode = msgData.viewMode as HighlightViewMode;
          setViewMode(newMode);
          storedData$.highlightsViewMode.set(newMode);
          return;
        }

        // Find item by id
        const item = data.find((v) => {
          const itemId = v.id?.toString();
          const dataId = msgData.id?.toString();
          return itemId === dataId;
        });

        if (!item) {
          console.warn("Item not found for id:", msgData.id);
          return;
        }

        switch (type) {
          case "copy":
            onCopy(item);
            break;
          case "share":
            onShare(item);
            break;
          case "delete":
            onDelete(item);
            break;
          case "goToContext":
          case "context":
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
    return highlightedListHtmlTemplate({
      highlights: data,
      theme,
      versionShortName: currentVersionShortName,
      formatTimeAgo,
      fontSize: 16,
      viewMode,
    });
  }, [data, theme, currentVersionShortName, formatTimeAgo, viewMode]);

  return (
    <ThemedView style={styles.container}>
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

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    webView: {
      flex: 1,
      backgroundColor: "transparent",
    },
  });

export default HighlightedList;
