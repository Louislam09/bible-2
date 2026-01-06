import ActionButton, { Backdrop } from "@/components/note/ActionButton";
import { View as ThemedView } from "@/components/Themed";
import { getBookDetail } from "@/constants/BookNames";
import { favoriteListHtmlTemplate } from "@/constants/favoriteListTemplate";
import { useAlert } from "@/context/AlertContext";
import { useBibleContext } from "@/context/BibleContext";
import { useDBContext } from "@/context/databaseContext";
import { useMyTheme } from "@/context/ThemeContext";
import { useFavoriteVerseService } from "@/services/favoriteVerseService";
import { authState$ } from "@/state/authState";
import { bibleState$ } from "@/state/bibleState";
import { favoriteState$ } from "@/state/favoriteState";
import { IVerseItem, Screens, TTheme } from "@/types";
import copyToClipboard from "@/utils/copyToClipboard";
import { getVerseTextRaw } from "@/utils/getVerseTextRaw";
import { showToast } from "@/utils/showToast";
import { createOptimizedWebViewProps } from "@/utils/webViewOptimizations";
import { use$ } from "@legendapp/state/react";
import { useNavigation } from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  StyleSheet,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import WebView from "react-native-webview";

type TListVerse = {};

const FavoriteList = ({ }: TListVerse) => {
  const { confirm, alertWarning } = useAlert();
  const [filterData, setFilterData] = useState<(IVerseItem & { id: number })[]>(
    []
  );
  const [originalData, setOriginalData] = useState<
    (IVerseItem & { id: number })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  const webViewRef = useRef<WebView>(null);

  // Hooks
  const { theme } = useMyTheme();
  const navigation = useNavigation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const styles = getStyles(theme);

  const { toggleFavoriteVerse, currentBibleLongName, orientation, currentBibleVersion } =
    useBibleContext();
  const { installedBibles } = useDBContext();
  const { addFavoriteVerse, getAllFavoriteVerses, removeFavoriteVerse } =
    useFavoriteVerseService();
  const reloadFavorites = use$(() => bibleState$.reloadFavorites.get());
  const isLoggedIn = use$(() => !!authState$.user.get());

  // Get current Bible version short name
  const currentVersionShortName = useMemo(() => {
    const currentBible = installedBibles.find((version) => version.id === currentBibleVersion);
    return currentBible?.shortName || currentBibleLongName || "NIV";
  }, [installedBibles, currentBibleVersion, currentBibleLongName]);

  // Format relative time (e.g., "2 days ago") - not used for favorites but kept for template compatibility
  const formatTimeAgo = useCallback((timestamp: number | string): string => {
    return "";
  }, []);

  // Calculate if scroll position is beyond threshold for showing top button

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const verses = await getAllFavoriteVerses();
      setOriginalData(verses ?? []);
      setFilterData(verses ?? []);
    } catch (error) {
      console.error("Error fetching favorite verses:", error);
      showToast("Error al cargar versículos favoritos");
    } finally {
      setLoading(false);
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


  const handleSyncToCloud = useCallback(async () => {
    if (!isLoggedIn) {
      alertWarning(
        "Sincronización requerida",
        "Debes iniciar sesión para sincronizar tus versículos favoritos con la nube",
      );
      return;
    }

    try {
      const favoriteVerses = await getAllFavoriteVerses();

      if (favoriteVerses.length === 0) {
        showToast("No hay versículos favoritos para sincronizar");
        return;
      }

      let syncCount = 0;
      for (const favoriteVerse of favoriteVerses) {
        if (!favoriteVerse.uuid) {
          console.warn(
            "Favorito sin UUID, no se puede sincronizar:",
            favoriteVerse.id
          );
          continue;
        }

        try {
          await favoriteState$.addFavorite(favoriteVerse);
          syncCount++;
        } catch (error) {
          console.error(
            "Error al sincronizar versículo:",
            favoriteVerse.id,
            error
          );
        }
      }

      showToast(`${syncCount} versículos favoritos sincronizados con la nube`);
    } catch (error) {
      console.error(
        "Error al sincronizar versículos favoritos con la nube:",
        error
      );
      showToast("Error al sincronizar versículos favoritos");
    } finally {
      setShowMoreOptions(false);
    }
  }, [isLoggedIn, getAllFavoriteVerses, alertWarning]);

  const handleDownloadFromCloud = useCallback(async () => {
    if (!isLoggedIn) {
      alertWarning(
        "Sincronización requerida",
        "Debes iniciar sesión para descargar tus versículos favoritos desde la nube",
      );
      return;
    }

    try {
      const favoriteCloudEntries = await favoriteState$.fetchFavorites();

      if (!favoriteCloudEntries || favoriteCloudEntries.length === 0) {
        showToast("No hay versículos favoritos en la nube");
        return;
      }

      const localFavorites = await getAllFavoriteVerses();
      let downloadCount = 0;

      for (const cloudFavoriteVerse of favoriteCloudEntries) {
        if (!cloudFavoriteVerse.uuid) {
          console.warn(
            "Favorito en la nube sin UUID, se omite:",
            cloudFavoriteVerse.id
          );
          continue;
        }

        try {
          const existingFavoriteEntry = localFavorites.find(
            (n) => n.uuid === cloudFavoriteVerse.uuid
          );

          if (existingFavoriteEntry) {
            console.log(
              "Favorito ya existe localmente, se omite:",
              existingFavoriteEntry.id
            );
          } else {
            await addFavoriteVerse(
              cloudFavoriteVerse.book_number,
              cloudFavoriteVerse.chapter,
              cloudFavoriteVerse.verse,
              cloudFavoriteVerse.uuid
            );
            downloadCount++;
          }
        } catch (error) {
          console.error(
            "Error al guardar versículo local:",
            cloudFavoriteVerse.id,
            error
          );
        }
      }

      showToast(
        `${downloadCount} versículos favoritos descargados desde la nube`
      );
    } catch (error) {
      console.error("Error al descargar versículos desde la nube:", error);
      showToast("Error al descargar versículos");
    } finally {
      setShowMoreOptions(false);
      bibleState$.toggleReloadFavorites();
    }
  }, [isLoggedIn,]);

  const showMoreOptionHandle = useCallback(() => {
    setShowMoreOptions((prev) => !prev);
  }, []);

  const dismiss = useCallback(() => {
    Keyboard.dismiss();
    setShowMoreOptions(false);
  }, []);

  // Handle WebView messages
  const handleWebViewMessage = useCallback(
    (event: any) => {
      try {
        const message = JSON.parse(event.nativeEvent.data);
        const { type, data } = message;

        // Find item by id
        const item = filterData.find((v) => {
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
    return favoriteListHtmlTemplate(
      filterData,
      theme,
      currentVersionShortName,
      formatTimeAgo,
      16,
      undefined // selectedFont - can be added later if needed
    );
  }, [filterData, theme, currentVersionShortName,]);

  const actionButtons = useMemo(() => {
    const buttons = [
      {
        bottom: 25,
        name: "EllipsisVertical",
        color: "#008CBA",
        action: showMoreOptionHandle,
        hide: showMoreOptions,
        label: "",
      },
      {
        bottom: 25,
        name: "Import",
        color: "#008CBA",
        action: handleDownloadFromCloud,
        hide: !showMoreOptions,
        label: "Cargar desde la cuenta",
        isSync: true,
      },
      {
        bottom: 90,
        name: "Share",
        color: "#45a049",
        action: handleSyncToCloud,
        hide: !showMoreOptions,
        label: "Guardar en la cuenta",
        isSync: true,
      },
      {
        bottom: 155,
        name: "ChevronDown",
        color: theme.colors.notification,
        action: showMoreOptionHandle,
        hide: !showMoreOptions,
        label: "Cerrar menú",
      },
    ];

    return buttons.filter((item) => !item.hide);
  }, [showMoreOptions, theme]);

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Mis versículos favoritos",
          headerTitleStyle: { color: theme.colors.text },
          headerStyle: { backgroundColor: theme.colors.background },
        }}
      />

      <Backdrop visible={showMoreOptions} onPress={dismiss} theme={theme} />
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

      {actionButtons.map((item, index) => (
        <ActionButton key={index} theme={theme} item={item} index={index} />
      ))}
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
  });

export default FavoriteList;
