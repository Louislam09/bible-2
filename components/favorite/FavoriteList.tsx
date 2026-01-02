import Animation from "@/components/Animation";
import Icon from "@/components/Icon";
import ActionButton, { Backdrop } from "@/components/note/ActionButton";
import { Text, View as ThemedView } from "@/components/Themed";
import { getBookDetail } from "@/constants/BookNames";
import { useBibleContext } from "@/context/BibleContext";
import { useMyTheme } from "@/context/ThemeContext";
import { useFavoriteVerseService } from "@/services/favoriteVerseService";
import { authState$ } from "@/state/authState";
import { bibleState$ } from "@/state/bibleState";
import { favoriteState$ } from "@/state/favoriteState";
import { IVerseItem, Screens, TTheme } from "@/types";
import copyToClipboard from "@/utils/copyToClipboard";
import { renameLongBookName } from "@/utils/extractVersesInfo";
import { getVerseTextRaw } from "@/utils/getVerseTextRaw";
import { showToast } from "@/utils/showToast";
import { use$ } from "@legendapp/state/react";
import { useNavigation } from "@react-navigation/native";
import { FlashListRef } from "@shopify/flash-list";
// import * as Haptics from "expo-haptics";
import { Stack, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import { useAlert } from "@/context/AlertContext";
import { Swipeable } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  const flatListRef = useRef<FlashListRef<any>>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const swipeableRefs = useRef<{ [key: number]: Swipeable | null }>({});

  // Hooks
  const { theme } = useMyTheme();
  const navigation = useNavigation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const styles = getStyles(theme);
  const notFoundSource = require("../../assets/lottie/notFound.json");

  const { toggleFavoriteVerse, currentBibleLongName, orientation } =
    useBibleContext();
  const { addFavoriteVerse, getAllFavoriteVerses, removeFavoriteVerse } =
    useFavoriteVerseService();
  const reloadFavorites = use$(() => bibleState$.reloadFavorites.get());
  const isLoggedIn = use$(() => !!authState$.user.get());

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
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [reloadFavorites]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

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
      if (selectionMode) {
        toggleSelection(item.id as any);
        return;
      }

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
    [navigation, selectionMode]
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

        showToast("Versículo removido de favoritos");
      } catch (error) {
        console.error("Error removing favorite:", error);
        showToast("Error al eliminar versículo favorito");
      }
    },
    [removeFavoriteVerse, toggleFavoriteVerse]
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
    const reference = `${getBookDetail(item?.book_number).longName} ${item.chapter
      }:${item.verse}`;
    bibleState$.handleSelectVerseForNote(verseText);
    router.push({ pathname: "/quote", params: { text: verseText, reference } });
  }, []);

  const toggleSelectionMode = useCallback(() => {
    setSelectionMode((prev) => !prev);
    if (selectionMode) {
      setSelectedItems(new Set());
    }
  }, [selectionMode]);

  const toggleSelection = useCallback((id: number) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback(() => {
    const allIds = filterData.map((item) => item.id);
    setSelectedItems(new Set(allIds));
  }, [filterData]);

  const deselectAll = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  const deleteSelected = useCallback(async () => {
    if (selectedItems.size === 0) return;

    confirm(
      "Eliminar favoritos",
      `¿Estás seguro de eliminar ${selectedItems.size} versículos favoritos?`,
      async () => {
        try {
          const deletePromises = Array.from(selectedItems).map((id) => {
            const verse = originalData.find((v) => v.id === id);
            if (!verse) return Promise.resolve();

            return toggleFavoriteVerse({
              bookNumber: verse.book_number,
              chapter: verse.chapter,
              verse: verse.verse,
              isFav: true,
            });
          });

          await Promise.all(deletePromises);

          setFilterData((prev) =>
            prev.filter((item) => !selectedItems.has(item.id))
          );
          setOriginalData((prev) =>
            prev.filter((item) => !selectedItems.has(item.id))
          );

          setSelectionMode(false);
          setSelectedItems(new Set());

          showToast(`${selectedItems.size} versículos eliminados`);
        } catch (error) {
          console.error("Error deleting favorites:", error);
          showToast("Error al eliminar favoritos");
        }
      }
    );
  }, [confirm, selectedItems, originalData, removeFavoriteVerse, toggleFavoriteVerse]);

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
      // // Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error(
        "Error al sincronizar versículos favoritos con la nube:",
        error
      );
      showToast("Error al sincronizar versículos favoritos");
    } finally {
      setShowMoreOptions(false);
    }
  }, [isLoggedIn, getAllFavoriteVerses, router]);

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
      // // Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error al descargar versículos desde la nube:", error);
      showToast("Error al descargar versículos");
    } finally {
      setShowMoreOptions(false);
      bibleState$.toggleReloadFavorites();
    }
  }, [isLoggedIn, getAllFavoriteVerses, addFavoriteVerse, router]);

  const showMoreOptionHandle = useCallback(() => {
    setShowMoreOptions((prev) => !prev);
  }, []);

  const dismiss = useCallback(() => {
    Keyboard.dismiss();
    setShowMoreOptions(false);
  }, []);

  const renderItem: ListRenderItem<IVerseItem & { id: number }> = useCallback(
    ({ item, index }) => {
      const isSelected = selectedItems.has(item.id);

      const renderRightActions = (progress: any, dragX: any) => {
        const trans = dragX.interpolate({
          inputRange: [-80, 0],
          outputRange: [0, 80],
          extrapolate: "clamp",
        });

        return (
          <View style={styles.rightSwipeActions}>
            <Animated.View
              style={[
                styles.deleteAction,
                {
                  transform: [{ translateX: trans }],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => {
                  swipeableRefs.current[item.id]?.close();
                  confirm(
                    "Eliminar favorito",
                    "¿Estás seguro de eliminar este versículo de tus favoritos?",
                    () => onRemoveFavorite(item)
                  );
                }}
              >
                <Icon name="Trash2" size={24} color="#fff" />
              </TouchableOpacity>
            </Animated.View>
          </View>
        );
      };

      return (
        <Swipeable
          ref={(ref) => (swipeableRefs.current[item.id] = ref) as any}
          renderRightActions={renderRightActions}
          friction={2}
          overshootRight={false}
          enabled={!selectionMode}
        >
          <TouchableOpacity
            style={[styles.itemContainer, isSelected && styles.selectedItem]}
            activeOpacity={0.8}
            onPress={() => onVerseClick(item)}
            onLongPress={() => {
              if (!selectionMode) {
                setSelectionMode(true);
                toggleSelection(item.id);
                // // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
            }}
          >
            <View style={styles.cardContainer}>
              {selectionMode && (
                <View style={styles.checkboxContainer}>
                  <View
                    style={[
                      styles.checkbox,
                      isSelected && styles.checkboxSelected,
                    ]}
                  >
                    {isSelected && <Icon name="Check" size={16} color="#fff" />}
                  </View>
                </View>
              )}

              <View style={styles.headerContainer}>
                <Text style={styles.cardTitle}>
                  {`${renameLongBookName(item.bookName)} ${item.chapter}:${item.verse
                    }`}
                </Text>

                {!selectionMode && (
                  <View style={styles.verseAction}>
                    <TouchableOpacity
                      style={styles.actionIconButton}
                      onPress={() => onCopy(item)}
                      accessibilityLabel="Copiar versículo"
                    >
                      <Icon size={20} name="Copy" color={theme.colors.text} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionIconButton}
                      onPress={() => onShare(item)}
                      accessibilityLabel="Compartir versículo"
                    >
                      <Icon size={20} name="Share2" color={theme.colors.text} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <Text style={styles.verseBody} numberOfLines={3}>
                {getVerseTextRaw(item.text)}
              </Text>
            </View>
          </TouchableOpacity>
        </Swipeable>
      );
    },
    [
      styles,
      selectionMode,
      selectedItems,
      onVerseClick,
      onRemoveFavorite,
      onCopy,
      onShare,
      toggleSelection,
    ]
  );

  const EmptyComponent = useCallback(() => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            Cargando versículos favoritos...
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.noResultsContainer}>
        <Animation
          backgroundColor={theme.colors.background}
          source={notFoundSource}
          loop={false}
          style={styles.animation}
        />

        {searchQuery ? (
          <Text style={styles.noResultsText}>
            No se encontraron resultados para "{searchQuery}"
          </Text>
        ) : (
          <View style={styles.emptyStateContent}>
            <Text style={styles.noResultsText}>
              <Text style={{ color: theme.colors.notification }}>
                ({currentBibleLongName})
              </Text>
              {"\n"}
              No tienes versículos favoritos en esta versión de la escritura.
            </Text>

            <TouchableOpacity
              style={styles.addFavoriteButton}
              onPress={() => navigation.navigate(Screens.Home, {})}
            >
              <Text style={styles.addFavoriteButtonText}>
                Ir a la Biblia para añadir favoritos
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }, [loading, searchQuery, currentBibleLongName, navigation, theme, styles]);

  const actionButtons = useMemo(() => {
    const buttons = [
      {
        bottom: 25,
        name: "EllipsisVertical",
        color: "#008CBA",
        action: showMoreOptionHandle,
        hide: showMoreOptions || selectionMode,
        label: "",
      },
      {
        bottom: 25,
        name: "Import",
        color: "#008CBA",
        action: handleDownloadFromCloud,
        hide: !showMoreOptions || selectionMode,
        label: "Cargar desde la cuenta",
        isSync: true,
      },
      {
        bottom: 90,
        name: "Share",
        color: "#45a049",
        action: handleSyncToCloud,
        hide: !showMoreOptions || selectionMode,
        label: "Guardar en la cuenta",
        isSync: true,
      },
      {
        bottom: 155,
        name: "ChevronDown",
        color: theme.colors.notification,
        action: showMoreOptionHandle,
        hide: !showMoreOptions || selectionMode,
        label: "Cerrar menú",
      },
    ];

    return buttons.filter((item) => !item.hide);
  }, [showMoreOptions]);

  if (loading && !filterData.length) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: "Mis versículos favoritos",
            headerTitleStyle: { color: theme.colors.text },
            headerStyle: { backgroundColor: theme.colors.background },
          }}
        />
        <EmptyComponent />
      </View>
    );
  }

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
      <Animated.FlatList
        decelerationRate="normal"
        data={filterData}
        renderItem={renderItem as any}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        keyExtractor={(item: any) => `fav-${item.id}`}
        contentContainerStyle={styles.listContentContainer}
        ListEmptyComponent={EmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.notification]}
            tintColor={theme.colors.notification}
          />
        }
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
    listContentContainer: {
      paddingBottom: 120,
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
      flexDirection: "row",
      backgroundColor: dark ? colors.background : "white",
      marginVertical: 5,
      paddingLeft: 5,
      borderRadius: 10,
      overflow: "hidden",
    },
    selectedItem: {
      backgroundColor: colors.notification + "20",
    },
    cardContainer: {
      display: "flex",
      borderRadius: 10,
      padding: 12,
      flex: 1,
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
      borderColor: colors.notification + "40",
      backgroundColor: dark ? colors.background : "white",
      borderWidth: dark ? 1 : 0,
    },
    headerContainer: {
      position: "relative",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.notification,
      flex: 1,
    },
    verseBody: {
      color: colors.text,
      fontSize: 15,
      lineHeight: 22,
    },
    verseAction: {
      flexDirection: "row",
      alignItems: "center",
    },
    actionIconButton: {
      padding: 6,
      marginLeft: 8,
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

export default FavoriteList;
