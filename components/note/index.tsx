import Animation from "@/components/Animation";
import Icon from "@/components/Icon";
import ActionButton, { Backdrop } from "@/components/note/ActionButton";
import NoteItem from "@/components/note/NoteItem";
import ScreenWithAnimation from "@/components/ScreenWithAnimation";
import { Text, View } from "@/components/Themed";
import { htmlTemplate } from "@/constants/HtmlTemplate";
import { useBibleContext } from "@/context/BibleContext";
import { useMyTheme } from "@/context/ThemeContext";
import usePrintAndShare from "@/hooks/usePrintAndShare";
import { useSyncNotes } from "@/hooks/useSyncNotes";
import { useNoteService } from "@/services/noteService";
import { bibleState$ } from "@/state/bibleState";
import { noteSelectors$ } from "@/state/notesState";
import { IVerseItem, Screens, TNote, TTheme } from "@/types";
import checkConnection from "@/utils/checkConnection";
import removeAccent from "@/utils/removeAccent";
import Ionicons from "@expo/vector-icons/Ionicons";
import { use$ } from "@legendapp/state/react";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { Stack, useNavigation } from "expo-router";
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
  RefreshControl,
  View as RNView,
  StyleSheet,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { singleScreenHeader } from "../common/singleScreenHeader";

type TListVerse = {
  data: IVerseItem[] | any;
};

const Note = ({ data }: TListVerse) => {
  const { theme } = useMyTheme();
  const navigation = useNavigation();
  const { currentBibleLongName } = useBibleContext();
  const { deleteNote, exportNotes, importNotes } = useNoteService();
  const selectedVerseForNote = use$(() =>
    bibleState$.selectedVerseForNote.get()
  );
  const isSyncing = use$(() => bibleState$.isSyncingNotes.get());
  const { syncNotes, downloadCloudNotesToLocal, syncSingleNote } =
    useSyncNotes();
  const { printToFile } = usePrintAndShare();

  const styles = getStyles(theme);
  const notFoundSource = require("../../assets/lottie/notFound.json");

  const [filterData, setFilterData] = useState([]);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [searchText, setSearchText] = useState<string>("");
  const [showSearch, setShowSearch] = useState(false);

  const flatListRef = useRef<FlashList<any>>(null);
  const searchInputRef = useRef<TextInput>(null);

  const [refreshing, setRefreshing] = useState(false);
  const isSelectionActive = use$(() => noteSelectors$.isSelectionMode.get());
  const selectedItems = use$(() => noteSelectors$.selectedNoteIds.get());

  const noteList: TNote[] = useMemo(() => {
    if (!searchText) return filterData;

    const searchLower = removeAccent(searchText.toLowerCase());
    return filterData.filter(
      (x: TNote) =>
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

  const onOpenNoteDetail = useCallback(
    (id: number) => {
      navigation.navigate(Screens.NoteDetail, { noteId: id, isNewNote: false });
    },
    [navigation]
  );

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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    bibleState$.toggleReloadNotes();
    setRefreshing(false);
  }, []);

  const handleShareSelectedNotes = async () => {
    const note = noteList.find((note: TNote) => selectedItems.has(note.id));
    if (!note) return;
    const html = htmlTemplate(
      [
        {
          definition: note?.note_text,
          topic: note?.title,
        },
      ],
      theme.colors,
      10,
      true
    );
    await printToFile(html, note?.title?.toUpperCase() || "--");
  };

  const handleDeleteSelectedNotes = () => {
    const selectedIds = Array.from(selectedItems);

    Alert.alert(
      "Eliminar Notas",
      `¿Estás seguro que quieres eliminar ${selectedIds.length} notas seleccionadas?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          onPress: async () => {
            for (const id of selectedIds) {
              const currentNote = noteList.find(
                (note: TNote) => note.id === id
              );
              if (!currentNote) continue;
              await deleteNote(currentNote);
            }
            noteSelectors$.clearSelections();
            bibleState$.toggleReloadNotes();
            ToastAndroid.show("Notas eliminadas", ToastAndroid.SHORT);
          },
        },
      ]
    );
  };
  const handleSyncSelectedNotes = async () => {
    const isConnected = await checkConnection();
    console.log("Conexión a Internet:", isConnected);
    if (!isConnected) {
      Alert.alert(
        "Sin conexión",
        "No hay conexión a Internet para sincronizar las notas."
      );
      return;
    }
    const selectedIds = Array.from(selectedItems);
    for (const id of selectedIds) {
      const currentNote = noteList.find((note: TNote) => note.id === id);
      if (!currentNote) continue;
      await syncSingleNote(currentNote);
    }
    noteSelectors$.clearSelections();
    bibleState$.toggleReloadNotes();
    ToastAndroid.show("Notas sincronizadas", ToastAndroid.SHORT);
  };

  const handleExportSelectedNotes = async () => {
    const ids = Array.from(selectedItems);
    console.log("Exporting notes with IDs:", ids);
    await exportNotes(ids);
  };

  const noteActionButtons = useMemo(
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
          color: "#2da5ff",
          action: downloadCloudNotesToLocal,
          hide: !showMoreOptions,
          label: "Cargar desde la cuenta",
          isDownload: true,
        },
        {
          bottom: 280,
          name: "RefreshCw",
          color: "#2da5ff",
          action: syncNotes,
          hide: !showMoreOptions,
          label: "Guardar en la cuenta",
          isSync: true,
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
    [
      showMoreOptions,
      theme.colors.notification,
      onCreateNewNote,
      onImportNotes,
      exportNotes,
      showMoreOptionHandle,
    ]
  );

  const selectionActionButtons = useMemo(
    () => [
      {
        name: noteList.every((note: TNote) => selectedItems.has(note.id))
          ? "CircleX"
          : "CheckCheck",
        color: noteList.every((note: TNote) => selectedItems.has(note.id))
          ? "#FFA500"
          : theme.colors.notification,
        action: () => {
          const allSelected = noteList.length === selectedItems.size;
          if (allSelected) {
            noteSelectors$.clearSelections();
          } else {
            noteSelectors$.selectAll(noteList.map((note: TNote) => note.id));
          }
        },
        label: noteList.every((note: TNote) => selectedItems.has(note.id))
          ? "Cancelar"
          : "Todo",
      },
      {
        name: "RefreshCw",
        color: theme.colors.notification,
        action: handleSyncSelectedNotes,
        label: "Sincronizar",
      },
      {
        name: "Download",
        color: theme.colors.notification,
        action: handleExportSelectedNotes,
        label: "Guardar",
      },
      {
        name: "Share2",
        color: theme.colors.notification,
        action: handleShareSelectedNotes,
        label: "Compartir",
        hide: selectedItems.size > 1,
      },
      {
        bottom: 155,
        name: "Trash2",
        color: "#F44336",
        action: handleDeleteSelectedNotes,
        label: "Eliminar",
      },
    ],
    [
      selectedItems.size,
      noteList,
      theme.colors.notification,
      handleExportSelectedNotes,
      handleShareSelectedNotes,
      handleDeleteSelectedNotes,
    ]
  );

  const renderItem: ListRenderItem<TNote> = useCallback(
    ({ item }) => {
      return <NoteItem item={item} onPress={onOpenNoteDetail} theme={theme} />;
    },
    [isSelectionActive, selectedItems, theme, onOpenNoteDetail]
  );

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
        <View style={styles.chapterHeader}>
          <Text
            style={styles.notesCountText}
            accessible={true}
            accessibilityRole="text"
          >
            {noteList.length} {noteList.length !== 1 ? "notas" : "nota"}
          </Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => noteSelectors$.toggleSelectionMode()}
          >
            <Text style={styles.selectButtonText}>Seleccionar</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }, [
    showSearch,
    searchText,
    noteList.length,
    styles,
    theme.colors.notification,
  ]);

  const ListEmptyComponent = useCallback(() => {
    return (
      <View style={[styles.noResultsContainer]}>
        <Animation
          backgroundColor={theme.colors.background}
          source={notFoundSource}
          loop={false}
        />
        <Text
          style={styles.noResultsText}
          accessible={true}
          accessibilityRole="text"
        >
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

  const screenOptions: any = useMemo(() => {
    return {
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
    };
  }, [isSyncing, showSearch, theme.colors]);

  return (
    <Fragment>
      <Stack.Screen options={singleScreenHeader(screenOptions)} />
      <ScreenWithAnimation duration={800} icon="NotebookPen" title="Mis Notas">
        <TouchableWithoutFeedback
          style={{ flex: 1 }}
          onPress={dismiss}
          accessible={false}
        >
          <RNView style={styles.container}>
            <Backdrop visible={showMoreOptions} onPress={dismiss} theme={theme} />
            {NoteHero()}
            {isSelectionActive && (
              <View style={styles.noteHeader}>
                <Text
                  style={styles.notesCountText}
                  accessible={true}
                  accessibilityRole="text"
                >
                  {selectedItems.size}{" "}
                  {selectedItems.size !== 1 ? "notas" : "nota"} seleccionada
                  {selectedItems.size > 1 ? "s" : ""}
                </Text>
              </View>
            )}
            <FlashList
              contentContainerStyle={styles.flashListContent}
              ref={flatListRef}
              decelerationRate="normal"
              estimatedItemSize={135}
              data={noteList}
              renderItem={renderItem}
              keyExtractor={(item: TNote) => `note-${item.id}`}
              ListEmptyComponent={ListEmptyComponent}
              ListFooterComponent={<View style={styles.listFooter} />}
              removeClippedSubviews={true}
              accessible={true}
              accessibilityLabel="Lista de notas"
              accessibilityRole="list"
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[theme.colors.notification]}
                  tintColor={theme.colors.notification}
                />
              }
            />

            {!isSelectionActive &&
              noteActionButtons.map((item, index) => (
                <ActionButton
                  key={`action-${item.name}-${index}`}
                  theme={theme}
                  item={item}
                  index={index}
                />
              ))}

            {isSyncing && (
              <View style={styles.syncingOverlay}>
                <ActivityIndicator
                  size="large"
                  color={theme.colors.notification}
                />
                <Text style={styles.syncingText}>Sincronizando...</Text>
              </View>
            )}

            {isSelectionActive && (
              <View style={styles.selectionActionButtonsContainer}>
                {selectionActionButtons.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={{ alignItems: "center", opacity: item.hide ? 0.5 : 1 }}
                    onPress={() => item.action()}
                    disabled={item.hide}
                    accessible={true}
                    accessibilityLabel={item.label}
                    accessibilityRole="button"
                    accessibilityHint={"Pulsa para " + item.label}
                  >
                    <Icon name={item.name as any} size={24} color={item.color} />
                    <Text style={{ color: theme.colors.text, marginTop: 4 }}>
                      {" "}
                      {item.label}{" "}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </RNView>
        </TouchableWithoutFeedback>
      </ScreenWithAnimation>
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
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: colors.text,
    },
    selectButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: colors.notification + "30",
      borderColor: colors.text + 50,
      borderWidth: 1,
    },
    selectButtonText: {
      color: "white",
      fontWeight: "700",
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
      fontWeight: "600",
    },
    chapterHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
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
      color: "#000",
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
      fontWeight: "600",
      marginBottom: 6,
      color: colors.text,
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
      overflow: "hidden",
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
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 100,
    },
    syncingText: {
      color: "#fff",
      fontSize: 18,
      marginTop: 10,
      fontWeight: "bold",
    },
    selectionActionButtonsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 10,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
  });

export default Note;
