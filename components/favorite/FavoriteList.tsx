import { View as ThemedView } from "@/components/Themed";
import { getBookDetail } from "@/constants/BookNames";
import { favoriteListHtmlTemplate, FavoriteViewMode } from "@/constants/favoriteListTemplate";
import { useAlert } from "@/context/AlertContext";
import { useBibleContext } from "@/context/BibleContext";
import { useDBContext } from "@/context/databaseContext";
import { storedData$ } from "@/context/LocalstoreContext";
import { useMyTheme } from "@/context/ThemeContext";
import { useFavoriteVerseService } from "@/services/favoriteVerseService";
import { bibleState$ } from "@/state/bibleState";
import { IVerseItem, Screens, TTheme } from "@/types";
import copyToClipboard from "@/utils/copyToClipboard";
import { getVerseTextRaw } from "@/utils/getVerseTextRaw";
import { showToast } from "@/utils/showToast";
import { createOptimizedWebViewProps } from "@/utils/webViewOptimizations";
import { use$ } from "@legendapp/state/react";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  StyleSheet,
  View
} from "react-native";
import WebView from "react-native-webview";

type TListVerse = {};

const FavoriteList = ({ }: TListVerse) => {
  const { confirm } = useAlert();
  const [filterData, setFilterData] = useState<(IVerseItem & { id: number; uuid?: string })[]>([]);
  const [originalData, setOriginalData] = useState<(IVerseItem & { id: number; uuid?: string })[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<FavoriteViewMode>(() => {
    return (storedData$.favoritesViewMode?.get() as FavoriteViewMode) || 'list';
  });

  const webViewRef = useRef<WebView>(null);

  // Hooks
  const { theme } = useMyTheme();
  const navigation = useNavigation();
  const router = useRouter();
  const styles = getStyles(theme);

  const { toggleFavoriteVerse, currentBibleLongName, currentBibleVersion } = useBibleContext();
  const { installedBibles } = useDBContext();
  const { getAllFavoriteVerses } = useFavoriteVerseService();
  
  const reloadFavorites = use$(() => bibleState$.reloadFavorites.get());

  // Get current Bible version short name
  const currentVersionShortName = useMemo(() => {
    const currentBible = installedBibles.find((version) => version.id === currentBibleVersion);
    return currentBible?.shortName || currentBibleLongName || "NIV";
  }, [installedBibles, currentBibleVersion, currentBibleLongName]);


  const fetchData = useCallback(async () => {
    try {
      const verses = await getAllFavoriteVerses();
      setOriginalData(verses ?? []);
      setFilterData(verses ?? []);
    } catch (error) {
      console.error("Error fetching favorite verses:", error);
      showToast("Error al cargar versículos favoritos");
    }
  }, [getAllFavoriteVerses]);

  useEffect(() => {
    fetchData();
  }, [reloadFavorites]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilterData(originalData);
      return;
    }

    const lowerQuery = searchQuery.toLowerCase();
    const filtered = originalData.filter((item) => {
      return (
        item.bookName?.toLowerCase().includes(lowerQuery) ||
        getVerseTextRaw(item.text).toLowerCase().includes(lowerQuery) ||
        `${item.chapter}:${item.verse}`.includes(lowerQuery)
      );
    });

    setFilterData(filtered);
  }, [searchQuery, originalData]);

  const onVerseClick = useCallback(
    (item: IVerseItem & { id: number }) => {
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
    },
    [navigation]
  );

  const onRemoveFavorite = useCallback(
    async (item: IVerseItem & { id: number }) => {
      try {
        toggleFavoriteVerse({
          bookNumber: item.book_number,
          chapter: item.chapter,
          verse: item.verse,
          isFav: true,
        });

        setFilterData((prev) => prev.filter((v) => v.id !== item.id));
        setOriginalData((prev) => prev.filter((v) => v.id !== item.id));

        showToast("Versículo removido de favoritos");
      } catch (error) {
        console.error("Error removing favorite:", error);
        showToast("Error al eliminar versículo favorito");
      }
    },
    [toggleFavoriteVerse]
  );

  const onCopy = useCallback(async (item: IVerseItem) => {
    try {
      await copyToClipboard(item);
    } catch (error) {
      console.error("Error copying verse:", error);
      showToast("Error al copiar versículo");
    }
  }, []);

  const onShare = useCallback((item: IVerseItem) => {
    const verseText = getVerseTextRaw(item.text);
    const reference = `${getBookDetail(item?.book_number).longName} ${item.chapter}:${item.verse}`;
    bibleState$.handleSelectVerseForNote(verseText);
    router.push({ pathname: "/quote", params: { text: verseText, reference } });
  }, [router]);

  // Handle WebView messages
  const handleWebViewMessage = useCallback(
    (event: any) => {
      try {
        const message = JSON.parse(event.nativeEvent.data);
        const { type, data: msgData } = message;

        // Handle view mode change
        if (type === 'viewModeChange') {
          const newMode = msgData.viewMode as FavoriteViewMode;
          setViewMode(newMode);
          storedData$.favoritesViewMode.set(newMode);
          return;
        }

        // Find item by id
        const item = filterData.find((v) => {
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
            confirm(
              "Eliminar favorito",
              "¿Estás seguro de eliminar este versículo de tus favoritos?",
              () => onRemoveFavorite(item)
            );
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
    [filterData, onCopy, onShare, onRemoveFavorite, onVerseClick, confirm]
  );

  // Generate HTML content
  const htmlContent = useMemo(() => {
    return favoriteListHtmlTemplate({
      favorites: filterData,
      theme,
      versionShortName: currentVersionShortName,
      fontSize: 16,
      viewMode,
    });
  }, [filterData, theme, currentVersionShortName, viewMode]);

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

export default FavoriteList;
