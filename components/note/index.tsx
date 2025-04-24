import Animation from "@/components/Animation";
import Icon from "@/components/Icon";
import ActionButton, { Backdrop } from "@/components/note/ActionButton";
import { Text, View } from "@/components/Themed";
import { headerIconSize } from "@/constants/size";
import { useBibleContext } from "@/context/BibleContext";
import { useStorage } from "@/context/LocalstoreContext";
import useNotesExportImport from "@/hooks/useNotesExportImport";
import { useNoteService } from "@/services/noteService";
import { authState$ } from "@/state/authState";
import { bibleState$ } from "@/state/bibleState";
import { notesState$ } from "@/state/notesState";
import { IVerseItem, Screens, TNote, TTheme } from "@/types";
import convertHtmlToText from "@/utils/convertHtmlToText";
import removeAccent from "@/utils/removeAccent";
import Ionicons from "@expo/vector-icons/Ionicons";
import { use$ } from "@legendapp/state/react";
import { useTheme } from "@react-navigation/native";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { format } from "date-fns";
import { Stack, useNavigation } from "expo-router";
import { Download, NotebookText, Trash2 } from "lucide-react-native";
import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AccessibilityInfo,
  ActivityIndicator,
  Alert,
  Animated,
  Keyboard,
  Platform,
  View as RNView,
  StyleSheet,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { singleScreenHeader } from "../common/singleScreenHeader";

const SWIPEABLE_THRESHOLD = 100;
const SWIPEABLE_FRICTION = 0.6;

type TListVerse = {
  data: IVerseItem[] | any;
};

const Note = ({ data }: TListVerse) => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { currentBibleLongName } = useBibleContext();
  const { deleteNote, deleteAllNotes, getAllNotes, createNote, updateNote } = useNoteService();
  const { exportNotes, importNotes, error, isLoading } = useNotesExportImport();
  const selectedVerseForNote = use$(() => bibleState$.selectedVerseForNote.get());
  const isAuthenticated = use$(() => authState$.isAuthenticated.get());
  const isSyncing = use$(() => bibleState$.isSyncingNotes.get());
  const { syncWithCloud } = useStorage();

  const styles = getStyles(theme);
  const notFoundSource = require("../../assets/lottie/notFound.json");

  const [filterData, setFilterData] = useState([]);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [searchText, setSearchText] = useState<string>("");
  const [showSearch, setShowSearch] = useState(false);

  const flatListRef = useRef<FlashList<any>>(null);
  const swipeableRefs = useRef<Map<number, Swipeable | null>>(new Map());
  const openSwipeableId = useRef<number | null>(null);
  const searchInputRef = useRef<TextInput>(null);

  const noteList = useMemo(() => {
    if (!searchText) return filterData;

    const searchLower = removeAccent(searchText.toLowerCase());
    return filterData.filter((x: TNote) =>
      removeAccent(x.title).toLowerCase().includes(searchLower) ||
      removeAccent(x.note_text).toLowerCase().includes(searchLower)
    );
  }, [searchText, filterData]);

  useEffect(() => {
    if (!data) return;
    if (selectedVerseForNote) showAddNoteAlert();
  }, [selectedVerseForNote, data]);

  useEffect(() => {
    if (!data) return;
    setFilterData(data);
  }, [data]);

  useEffect(() => {
    if (showSearch) {
      setTimeout(() => searchInputRef.current?.focus(), 300);
    }
  }, [showSearch]);

  const showAddNoteAlert = () => {
    ToastAndroid.show(
      "Seleccione la nota a la que quieres añadir el versiculo",
      ToastAndroid.LONG
    );
  };

  const onCreateNewNote = () => {
    navigation.navigate(Screens.NoteDetail, { noteId: null, isNewNote: true });
  };

  const closeCurrentSwiped = useCallback((id: number) => {
    const swipeable = swipeableRefs.current.get(id);
    swipeable?.close();
  }, []);

  const onDelete = async (id: number) => {
    closeCurrentSwiped(id);
    try {
      setTimeout(async () => {
        await deleteNote(id);
        bibleState$.toggleReloadNotes();
        ToastAndroid.show("Nota borrada!", ToastAndroid.SHORT);
        setSearchText("");
      }, 300);
    } catch (error) {
      console.error("Error deleting note:", error);
      ToastAndroid.show("Error al borrar la nota", ToastAndroid.SHORT);
    }
  };

  const warnBeforeDelete = useCallback((id: number) => {
    Alert.alert(
      "Eliminar Nota",
      "¿Estás seguro que quieres eliminar esta nota?",
      [
        {
          text: "Cancelar",
          onPress: () => closeCurrentSwiped(id),
          style: "cancel",
        },
        { text: "Eliminar", onPress: () => onDelete(id) },
      ],
      { cancelable: true }
    );
  }, [closeCurrentSwiped, onDelete]);

  const warnBeforeExporting = useCallback((id: number) => {
    Alert.alert(
      "Guardar en el dispositivo",
      "¿Estás seguro que quieres Guardar en el dispositivo esta nota?",
      [
        {
          text: "Cancelar",
          onPress: () => closeCurrentSwiped(id),
          style: "cancel",
        },
        {
          text: "Guardar",
          onPress: () => {
            exportNotes(id);
            closeCurrentSwiped(id);
          },
        },
      ],
      { cancelable: true }
    );
  }, [closeCurrentSwiped, exportNotes]);

  const onOpenNoteDetail = useCallback((id: number) => {
    navigation.navigate(Screens.NoteDetail, { noteId: id, isNewNote: false });
  }, [navigation]);

  const toggleSearch = useCallback(() => {
    setShowSearch((prev) => !prev);
    if (showSearch) {
      setSearchText("");
    }
  }, [showSearch]);

  const dismiss = useCallback(() => {
    Keyboard.dismiss();
    setShowMoreOptions(false);
  }, []);

  const handleLogin = useCallback(() => {
    navigation.navigate(Screens.Login);
  }, [navigation]);

  const handleSyncToCloud = useCallback(async () => {
    bibleState$.isSyncingNotes.set(true);
    try {
      const notes = await getAllNotes();

      if (!authState$.user.get()) {
        Alert.alert(
          "Iniciar Sesión Requerido",
          "Necesitas iniciar sesión para guardar con la nube.",
          [
            { text: "Cancelar", style: "cancel" },
            { text: "Iniciar Sesión", onPress: handleLogin },
          ]
        );
        return;
      }

      for (const note of notes) {
        if (!note.uuid) {
          console.warn("Nota sin UUID, no se puede sincronizar:", note.id);
          continue;
        }

        try {
          await notesState$.addNote(note);
        } catch (error) {
          console.error("Error al sincronizar nota:", note.id, error);
        }
      }

      ToastAndroid.show("Notas sincronizadas con la nube", ToastAndroid.SHORT);
    } catch (error) {
      console.error("Error al sincronizar notas con la nube:", error);
      ToastAndroid.show("Error al sincronizar notas", ToastAndroid.SHORT);
    } finally {
      bibleState$.isSyncingNotes.set(false);
    }
  }, [getAllNotes]);

  const handleDownloadFromCloud = useCallback(async () => {
    bibleState$.isSyncingNotes.set(true);
    try {
      if (!authState$.user.get()) {
        Alert.alert(
          "Iniciar Sesión Requerido",
          "Debes iniciar sesión para descargar tus notas desde la nube",
          [
            { text: "Cancelar", style: "cancel" },
            { text: "Iniciar Sesión", onPress: handleLogin },
          ]
        );
        return;
      }

      const cloudNotes = await notesState$.fetchNotes();
      const localNotes = await getAllNotes();

      let updatedCount = 0;
      let createdCount = 0;

      for (const cloudNote of cloudNotes) {
        if (!cloudNote.uuid) {
          console.warn("Nota en la nube sin UUID, se omite:", cloudNote.id);
          continue;
        }

        try {
          const existingNote = localNotes.find(n => n.uuid === cloudNote.uuid);

          if (existingNote) {
            await updateNote(existingNote.id, {
              title: cloudNote.title,
              note_text: cloudNote.note_text,
              updated_at: cloudNote.updated_at,
            });
            updatedCount++;
          } else {
            await createNote({
              uuid: cloudNote.uuid,
              title: cloudNote.title,
              note_text: cloudNote.note_text,
              created_at: cloudNote.created_at,
              updated_at: cloudNote.updated_at,
            });
            createdCount++;
          }
        } catch (error) {
          console.error("Error al guardar nota local:", cloudNote.id, error);
        }
      }

      ToastAndroid.show(
        `Notas descargadas: ${createdCount} nuevas, ${updatedCount} actualizadas`,
        ToastAndroid.SHORT
      );
    } catch (error) {
      console.error("Error al descargar notas desde la nube:", error);
      ToastAndroid.show("Error al descargar notas", ToastAndroid.SHORT);
    } finally {
      bibleState$.toggleReloadNotes();
      bibleState$.isSyncingNotes.set(false);
    }
  }, [getAllNotes, updateNote, createNote]);

  const showMoreOptionHandle = useCallback(() => {
    setShowMoreOptions((prev) => !prev);
    AccessibilityInfo.announceForAccessibility(
      showMoreOptions ? "Menú cerrado" : "Menú abierto"
    );
  }, [showMoreOptions]);

  const onImportNotes = useCallback(async () => {
    try {
      await importNotes();
      bibleState$.toggleReloadNotes();
    } catch (error) {
      console.error("Error importing notes:", error);
      ToastAndroid.show("Error al importar notas", ToastAndroid.SHORT);
    }
  }, [importNotes]);

  const actionButtons = useMemo(
    () =>
      [
        {
          bottom: 25,
          name: "Plus",
          color: theme.colors.notification,
          action: onCreateNewNote,
          hide: !showMoreOptions,
          label: "Nueva nota",
        },
        {
          bottom: 25,
          name: "EllipsisVertical",
          color: "#008CBA",
          action: showMoreOptionHandle,
          hide: showMoreOptions,
        },
        {
          bottom: 90,
          name: "Import",
          color: "#008CBA",
          action: onImportNotes,
          hide: !showMoreOptions,
          label: "Cargar desde el dispositivo",
        },
        {
          bottom: 155,
          name: "Share",
          color: "#45a049",
          action: exportNotes,
          hide: !showMoreOptions,
          label: "Guardar en el dispositivo",
        },
        {
          bottom: 220,
          name: "Download",
          color: '#2da5ff',
          action: handleDownloadFromCloud,
          hide: !showMoreOptions,
          label: "Cargar desde la cuenta",
          isDownload: true
        },
        {
          bottom: 280,
          name: "RefreshCw",
          color: '#2da5ff',
          action: handleSyncToCloud,
          hide: !showMoreOptions,
          label: "Guardar en la cuenta",
          isSync: true
        },
        {
          bottom: 340,
          name: "ChevronDown",
          color: theme.colors.notification,
          action: showMoreOptionHandle,
          hide: !showMoreOptions,
          label: "Cerrar menú",
        },
      ].filter((item) => !item.hide),
    [showMoreOptions, theme.colors.notification, onCreateNewNote, onImportNotes,
      exportNotes, handleDownloadFromCloud, handleSyncToCloud, showMoreOptionHandle]
  );

  const handleSwipeableOpen = useCallback((id: number) => {
    if (openSwipeableId.current && openSwipeableId.current !== id) {
      swipeableRefs.current.get(openSwipeableId.current)?.close();
    }
    openSwipeableId.current = id;
  }, []);

  const swipeAction = useMemo(() => ({
    right: warnBeforeDelete,
    left: warnBeforeExporting,
  }), [warnBeforeDelete, warnBeforeExporting]);

  const onSwipeableWillOpen = useCallback((direction: "left" | "right", item: TNote) => {
    swipeAction[direction](item.id);
  }, [swipeAction]);

  const renderRightActions = useCallback((
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const translateX = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [0, 80],
      extrapolate: "clamp",
    });

    return (
      <Animated.View
        style={{
          transform: [{ translateX }],
          backgroundColor: "#dc2626",
        }}
      >
        <TouchableOpacity
          style={[styles.renderActionButton, { backgroundColor: "#dc2626" }]}
          accessible={true}
          accessibilityLabel="Eliminar nota"
          accessibilityRole="button"
        >
          <Trash2 size={headerIconSize} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    );
  }, [styles.renderActionButton]);

  const renderLeftActions = useCallback((
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const translateX = dragX.interpolate({
      inputRange: [0, 80],
      outputRange: [-80, 0],
      extrapolate: "clamp",
    });

    return (
      <Animated.View
        style={{
          transform: [{ translateX }],
          backgroundColor: "#008CBA",
        }}
      >
        <TouchableOpacity
          style={[styles.renderActionButton, { backgroundColor: "#008CBA" }]}
          accessible={true}
          accessibilityLabel="Exportar nota"
          accessibilityRole="button"
        >
          <Download size={headerIconSize} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    );
  }, [styles.renderActionButton]);

  const NoteHero = useCallback(() => {
    return (
      <>
        <Animated.View
          style={[
            styles.noteHeader,
            {
              height: showSearch ? "auto" : 0,
              opacity: showSearch ? 1 : 0,
              overflow: "hidden",
            },
          ]}
        >
          <View style={styles.searchContainer}>
            <Ionicons
              style={styles.searchIcon}
              name="search"
              size={24}
              color={theme.colors.notification}
            />
            <TextInput
              ref={searchInputRef}
              placeholder="Buscar en tus notas..."
              style={[styles.noteHeaderSearchInput]}
              onChangeText={(text) => setSearchText(text)}
              value={searchText}
              accessible={true}
              accessibilityLabel="Buscar en tus notas"
              accessibilityRole="search"
              accessibilityHint="Escribe para buscar en tus notas"
              returnKeyType="search"
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />
          </View>
        </Animated.View>
        <Text style={styles.notesCountText} accessible={true} accessibilityRole="text">
          {noteList.length} {noteList.length !== 1 ? "notas" : "nota"}
        </Text>
      </>
    );
  }, [showSearch, searchText, noteList.length, styles, theme.colors.notification]);

  const ListEmptyComponent = useCallback(() => {
    return (
      <View style={[styles.noResultsContainer]}>
        <Animation
          backgroundColor={theme.colors.background}
          source={notFoundSource}
          loop={false}
        />
        <Text style={styles.noResultsText} accessible={true} accessibilityRole="text">
          <Text style={{ color: theme.colors.notification }}>
            ({currentBibleLongName})
          </Text>{" "}
          {"\n"}
          {searchText
            ? "No se encontraron notas con ese criterio de búsqueda."
            : "No tienes notas en esta versión de la escritura."}
        </Text>
      </View>
    );
  }, [styles, theme.colors, notFoundSource, currentBibleLongName, searchText]);

  const RenderItem: ListRenderItem<TNote> = useCallback(({ item }) => {
    const formattedDate = format(
      new Date(item.updated_at || item.created_at),
      "MMM dd, yyyy - hh:mm a"
    );
    const preview = item.note_text?.trim().substring(0, 50);

    const notePreview = preview ? convertHtmlToText(item.note_text, { maxLength: 100, preserveLineBreaks: false, preserveWhitespace: true }) : '';

    const handlePress = () => {
      onOpenNoteDetail(item.id);
    };

    return (
      <Swipeable
        ref={(ref) => swipeableRefs.current.set(item.id, ref)}
        friction={SWIPEABLE_FRICTION}
        rightThreshold={SWIPEABLE_THRESHOLD}
        leftThreshold={SWIPEABLE_THRESHOLD}
        onSwipeableWillOpen={(direction) => onSwipeableWillOpen(direction, item)}
        onSwipeableOpenStartDrag={(direction) => handleSwipeableOpen(item.id)}
        renderRightActions={renderRightActions}
        renderLeftActions={renderLeftActions}
      >
        <TouchableOpacity
          style={styles.verseContainer}
          activeOpacity={0.7}
          onPress={handlePress}
          accessible={true}
          accessibilityLabel={`Nota: ${item.title}`}
          accessibilityRole="button"
          accessibilityHint="Pulsa para ver o editar esta nota"
        >
          <View style={styles.verseItem}>
            <View style={styles.verseBody}>
              <Text
                ellipsizeMode="tail"
                numberOfLines={1}
                style={styles.verseText}
              >
                {item.title || 'Sin título'}
              </Text>

              {notePreview && (
                <Text
                  ellipsizeMode="tail"
                  numberOfLines={2}
                  style={styles.notePreview}
                >
                  {notePreview}
                </Text>
              )}

              <View style={styles.dateContainer}>
                <Icon
                  name="CalendarDays"
                  size={16}
                  color={theme.colors.notification}
                />
                <Text style={styles.verseDate}>
                  {formattedDate}
                </Text>
              </View>
            </View>
            <View style={styles.noteIconContainer}>
              <NotebookText
                size={30}
                color={theme.colors.text}
                style={{
                  opacity: 0.8,
                  ...Platform.select({
                    android: {
                      elevation: 2,
                    },
                    ios: {
                      shadowColor: '#000',
                      shadowOffset: { width: 1, height: 1 },
                      shadowOpacity: 0.2,
                      shadowRadius: 1,
                    },
                  }),
                }}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  }, [
    onSwipeableWillOpen,
    handleSwipeableOpen,
    renderRightActions,
    renderLeftActions,
    styles,
    theme.colors.text,
    theme.colors.notification,
    onOpenNoteDetail
  ]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.notification} />
        <Text style={styles.loadingText}>Cargando notas...</Text>
      </View>
    );
  }

  return (
    <Fragment>
      <Stack.Screen
        options={{
          ...singleScreenHeader({
            theme,
            title: "Mis Notas",
            titleIcon: "NotebookPen",
            headerRightProps: {
              headerRightIcon: "Search",
              headerRightIconColor: showSearch
                ? theme.colors.notification
                : theme.colors.text,
              onPress: toggleSearch,
              disabled: isSyncing,
              style: { opacity: isSyncing ? 0.5 : 1 },
            },
          }),
        }}
      />
      <TouchableWithoutFeedback
        style={{ flex: 1 }}
        onPress={dismiss}
        accessible={false}
      >
        <RNView style={styles.container}>
          <Backdrop visible={showMoreOptions} onPress={dismiss} theme={theme} />
          {NoteHero()}
          {error && <Text style={styles.textError} accessible={true} accessibilityRole="alert">{error}</Text>}

          {/* Main Note List */}
          <FlashList
            contentContainerStyle={styles.flashListContent}
            ref={flatListRef}
            decelerationRate="normal"
            estimatedItemSize={135}
            data={noteList}
            renderItem={RenderItem}
            keyExtractor={(item: TNote) => `note-${item.id}`}
            ListEmptyComponent={ListEmptyComponent}
            ListFooterComponent={
              <View style={styles.listFooter} />
            }
            removeClippedSubviews={true}
            accessible={true}
            accessibilityLabel="Lista de notas"
            accessibilityRole="list"
          />

          {/* Action Buttons */}
          {actionButtons.map((item, index) => (
            <ActionButton
              key={`action-${item.name}-${index}`}
              theme={theme}
              item={item}
              index={index}
            />
          ))}

          {/* Syncing Indicator */}
          {isSyncing && (
            <View style={styles.syncingOverlay}>
              <ActivityIndicator size="large" color={theme.colors.notification} />
              <Text style={styles.syncingText}>Sincronizando...</Text>
            </View>
          )}
        </RNView>
      </TouchableWithoutFeedback>
    </Fragment>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 5,
    },
    flashListContent: {
      backgroundColor: colors.background
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: colors.text,
    },
    textError: {
      textAlign: "center",
      color: "#e74856",
      marginVertical: 10,
      padding: 10,
      backgroundColor: "#ffeeee",
      borderRadius: 5,
    },
    noteHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 4,
      paddingVertical: 10,
      backgroundColor: "transparent",
    },
    notesCountText: {
      paddingHorizontal: 4,
      fontSize: 18,
      marginBottom: 10,
      fontWeight: '600',
    },
    searchContainer: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.notification,
      borderStyle: "solid",
      width: "100%",
      fontWeight: "100",
      backgroundColor: colors.notification + "99",
      elevation: 2,
    },
    searchIcon: {
      color: colors.text,
      paddingHorizontal: 15,
      borderRadius: 10,
      fontWeight: "bold",
    },
    noteHeaderSearchInput: {
      borderRadius: 10,
      padding: 10,
      paddingLeft: 15,
      fontSize: 18,
      flex: 1,
      fontWeight: "100",
      backgroundColor: "#ddd",
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
      color: '#000',
    },
    noResultsContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 10,
      paddingBottom: 20,
      backgroundColor: "transparent",
      paddingTop: 50,
    },
    noResultsText: {
      fontSize: 18,
      color: colors.text,
      textAlign: "center",
      marginTop: 20,
    },
    verseContainer: {
      borderColor: colors.border,
      borderWidth: 0.5,
      borderRadius: 8,
      backgroundColor: colors.card,
      marginHorizontal: 4,
      marginVertical: 3,
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 1,
    },
    verseItem: {
      flex: 1,
      alignItems: "flex-start",
      justifyContent: "space-between",
      flexDirection: "row",
      padding: 12,
    },
    verseBody: {
      flex: 1,
      height: "100%",
      alignItems: "flex-start",
      justifyContent: "space-around",
      marginRight: 10,
    },
    verseText: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 6,
      color: colors.text,
    },
    notePreview: {
      fontSize: 14,
      color: colors.text,
      opacity: 0.8,
      marginBottom: 8,
    },
    dateContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    verseDate: {
      fontSize: 14,
      color: colors.text,
      opacity: 0.7,
    },
    noteIconContainer: {
      backgroundColor: "transparent",
      justifyContent: "center",
      alignItems: "center",
      width: 40,
      height: 40,
      borderRadius: 20,
      overflow: 'hidden',
    },
    renderActionButton: {
      justifyContent: "center",
      alignItems: "center",
      width: 80,
      height: "100%",
    },
    listFooter: {
      paddingVertical: 30,
      backgroundColor: colors.background,
    },
    syncingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 100,
    },
    syncingText: {
      color: '#fff',
      fontSize: 18,
      marginTop: 10,
      fontWeight: 'bold',
    }
  });

export default Note;