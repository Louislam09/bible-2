import Animation from "@/components/Animation";
import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import Icon from "@/components/Icon";
import ActionButton, { Backdrop } from "@/components/note/ActionButton";
import NoteItem from "@/components/note/NoteItem";
import ScreenWithAnimation from "@/components/ScreenWithAnimation";
import { Text, View } from "@/components/Themed";
import { useBibleContext } from "@/context/BibleContext";
import { storedData$ } from "@/context/LocalstoreContext";
import { useNetwork } from "@/context/NetworkProvider";
import { useMyTheme } from "@/context/ThemeContext";
import usePrintAndShare from "@/hooks/usePrintAndShare";
import { useSyncNotes } from "@/hooks/useSyncNotes";
import { useNoteService } from "@/services/noteService";
import { useNotificationService } from "@/services/notificationServices";
import { bibleState$ } from "@/state/bibleState";
import { noteSelectors$ } from "@/state/notesState";
import { Screens, TNote, TTheme } from "@/types";
import removeAccent from "@/utils/removeAccent";
import Ionicons from "@expo/vector-icons/Ionicons";
import { use$ } from "@legendapp/state/react";
import { FlashList, FlashListRef, ListRenderItem } from "@shopify/flash-list";
import { Stack, useNavigation } from "expo-router";
import { goBack } from "expo-router/build/global-state/routing";
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

const NotesPage = () => {
  const { theme } = useMyTheme();
  const navigation = useNavigation();
  const { currentBibleLongName } = useBibleContext();
  const { deleteNote, exportNotes, importNotes, getAllNotes } =
    useNoteService();
  const isSyncing = use$(() => bibleState$.isSyncingNotes.get());
  const { syncNotes, downloadCloudNotesToLocal, syncSingleNote } =
    useSyncNotes();
  const notificationService = useNotificationService();
  const user = use$(() => storedData$.user.get()) || null;

  const { printToFile } = usePrintAndShare();
  const netInfo = useNetwork();
  const { isConnected } = netInfo;

  const styles = getStyles(theme);
  const notFoundSource = require("../assets/lottie/notFound.json");

  const [filterData, setFilterData] = useState<TNote[]>([]);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [searchText, setSearchText] = useState<string>("");
  const [showSearch, setShowSearch] = useState(false);

  const flatListRef = useRef<FlashListRef<any>>(null);
  const searchInputRef = useRef<TextInput>(null);

  const [refreshing, setRefreshing] = useState(false);
  const isSelectionActive = use$(() => noteSelectors$.isSelectionMode.get());
  const selectedItems = use$(() => noteSelectors$.selectedNoteIds.get());

  const reloadNotes = use$(() => bibleState$.reloadNotes.get());
  const noteDetailScreen = Screens.NoteDetailDom;

  useEffect(() => {
    const getNotes = async () => {
      const notes = await getAllNotes();
      setFilterData(notes ?? []);
    };
    getNotes();
  }, [reloadNotes]);

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
    if (showSearch) {
      setTimeout(() => searchInputRef.current?.focus(), 300);
    }
  }, [showSearch]);

  const onCreateNewNote = () => {
    navigation.navigate(noteDetailScreen, { noteId: null, isNewNote: true });
  };

  const onOpenNoteDetail = useCallback(
    (id: number) => {
      navigation.navigate(noteDetailScreen, { noteId: id, isNewNote: false });
    },
    [navigation, noteDetailScreen]
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

  const onDownloadPdf = useCallback(
    async (htmlContent: string, noteTitle: string) => {
      let data;
      try {
        data = JSON.parse(htmlContent);
      } catch (error) {
        data = { htmlString: htmlContent };
      }
      try {
        // Process HTML to convert Bible mentions to proper structure
        const processedHtml = (data.htmlString || "").replace(
          /<span[^>]*data-lexical-bible-mention="true"[^>]*>(.*?)<\/span>/g,
          (match: any, content: any) => {
            // Extract data attributes from the span
            const bookMatch = match.match(/data-book="([^"]*)"/);
            const chapterMatch = match.match(/data-chapter="([^"]*)"/);
            const verseMatch =
              match.match(/data-start-verse="([^"]*)"/) ||
              match.match(/data-verse="([^"]*)"/);
            const verseTextMatch = match.match(/data-verse-text="([^"]*)"/);

            const book = bookMatch ? bookMatch[1] : "";
            const chapter = chapterMatch ? chapterMatch[1] : "";
            const verse = verseMatch ? verseMatch[1] : "";
            const verseText = verseTextMatch ? verseTextMatch[1] : "";

            // Create the wrapper structure like in the mobile editor
            let result = `<div class="editor-bible-mention-wrapper">`;
            result += `<span class="editor-bible-mention" title="${verseText}">${content}</span>`;

            // Add verse text if available and not a placeholder
            if (
              verseText &&
              !verseText.includes("Integrar con base de datos") &&
              !verseText.includes("Error cargando")
            ) {
              result += `<div class="editor-bible-mention-verse">${verseText}</div>`;
            }

            result += `</div>`;
            return result;
          }
        );

        const styledHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.2, maximum-scale=2.0, user-scalable=yes, shrink-to-fit=no">
              <title>${noteTitle}</title>
              <style>
                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }
                
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif;
                  line-height: 1.6;
                  color: #111;
                  background: #fff;
                  padding: 20px;
                  font-size: 2rem;
                  max-width: 100%;
                  margin: 0;
                  word-wrap: break-word;
                  text-align: left;
                  min-height: 100vh;
                  zoom: 1.1;
                }
                
                .note-title {
                  font-size: 3rem;
                  font-weight: 700;
                  margin-bottom: 16px;
                  color: #000;
                  text-align: center;
                  line-height: 1.4;
                  border-bottom: 2px solid #ddd;
                  padding-bottom: 8px;
                }
                
                .note-content {
                  max-width: 100%;
                  word-wrap: break-word;
                  font-size: 2rem;
                  line-height: 1.6;
                  text-align: left;
                  color: #111;
                }
                
                /* Paragraph styling for clean PDF */
                .editor-paragraph, p {
                  margin: 0 0 12px 0;
                  font-size: 2rem;
                  line-height: 1.6;
                  color: #111;
                  text-align: left;
                  text-indent: 0;
                }
                
                .editor-paragraph:last-child, p:last-child {
                  margin-bottom: 0;
                }
                
                /* Headings for clean PDF */
                .editor-heading-h1, h1 {
                  font-size: 2.5rem;
                  color: #000;
                  font-weight: 700;
                  margin: 20px 0 10px 0;
                  padding: 0;
                  line-height: 1.4;
                  text-align: left;
                }
                
                .editor-heading-h2, h2 {
                  font-size: 2.2rem;
                  color: #000;
                  font-weight: 600;
                  margin: 16px 0 8px 0;
                  padding: 0;
                  line-height: 1.4;
                  text-align: left;
                }
                
                /* Quotes for clean PDF */
                .editor-quote, blockquote {
                  margin: 12px 0;
                  padding: 8px 12px;
                  font-size: 14px;
                  color: #555;
                  border-left: 3px solid #ccc;
                  background-color: #f9f9f9;
                  font-style: italic;
                  line-height: 1.5;
                }
                
                /* Lists for clean PDF */
                .editor-list-ul, ul {
                  padding: 0;
                  margin: 12px 0 12px 20px;
                  list-style-type: disc;
                  font-size: 2rem;
                }
                
                .editor-list-ol, ol {
                  padding: 0;
                  margin: 12px 0 12px 20px;
                  list-style-type: decimal;
                  font-size: 2rem;
                }
                
                .editor-listitem, li {
                  margin: 6px 0;
                  padding-left: 4px;
                  line-height: 1.6;
                  font-size: 2rem;
                  color: #111;
                }
                
                /* Text formatting - matches mobile editor */
                .editor-text-bold, strong, b {
                  font-weight: bold;
                }
                
                .editor-text-italic, em, i {
                  font-style: italic;
                }
                
                .editor-text-underline, u {
                  text-decoration: underline;
                }
                
                .editor-text-strikethrough, s, del {
                  text-decoration: line-through;
                }
                
                .editor-text-code, code {
                  background-color: #f5f5f5;
                  padding: 2px 4px;
                  font-family: 'Courier New', Courier, monospace;
                  font-size: 13px;
                  border-radius: 3px;
                  border: 1px solid #ddd;
                }
                
                /* Code blocks */
                .editor-code, pre {
                  background-color: #f5f5f5;
                  font-family: 'Courier New', Courier, monospace;
                  display: block;
                  padding: 12px;
                  line-height: 1.4;
                  font-size: 12px;
                  margin: 12px 0;
                  border-radius: 4px;
                  border: 1px solid #ddd;
                  overflow-x: auto;
                }
                
                /* Bible mentions for clean PDF */
                .editor-bible-mention-wrapper {
                  display: block;
                  margin: 12px 0;
                  padding: 8px;
                  background-color: #f8f9fa;
                  border-left: 4px solid ${theme.colors.notification};
                  border-radius: 6px;
                }
                
                .editor-bible-mention {
                  color: ${theme.colors.notification};
                  font-weight: 600;
                  font-size: 2rem;
                  display: block;
                  margin-bottom: 6px;
                }
                
                .editor-bible-mention-verse {
                  color: #111;
                  font-style: normal;
                  font-size: 1.8rem;
                  line-height: 1.6;
                  text-align: left;
                  margin: 0;
                  padding: 0;
                }
                
                /* Hashtags for clean PDF */
                .editor-hashtag {
                  color: ${theme.colors.notification};
                  font-weight: 500;
                  font-size: 2rem;
                  text-decoration: none;
                }
                
                /* Text alignment */
                .text-left { text-align: left; }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .text-justify { text-align: justify; }
                
                /* Mobile-specific optimizations */
                @media screen and (max-width: 768px) {
                  body {
                    font-size: 2.2rem;
                    padding: 20px;
                    zoom: 1.15;
                  }
                  
                  .note-title {
                    font-size: 3.5rem;
                    margin-bottom: 16px;
                  }
                  
                  .editor-paragraph, p {
                    font-size: 2.2rem;
                    margin-bottom: 12px;
                  }
                  
                  .editor-heading-h1, h1 {
                    font-size: 3rem;
                    margin: 20px 0 10px 0;
                  }
                  
                  .editor-heading-h2, h2 {
                    font-size: 2.6rem;
                    margin: 16px 0 8px 0;
                  }
                  
                  .editor-bible-mention-wrapper {
                    margin: 12px 0;
                    padding: 8px;
                  }
                  
                  .editor-bible-mention {
                    font-size: 2.2rem;
                    margin-bottom: 6px;
                  }
                  
                  .editor-bible-mention-verse {
                    font-size: 2rem;
                  }
                  
                  .editor-list-ul, .editor-list-ol, ul, ol {
                    font-size: 2.2rem;
                    margin: 12px 0 12px 20px;
                  }
                  
                  .editor-listitem, li {
                    font-size: 2.2rem;
                    margin: 6px 0;
                  }
                }
                
                /* Print optimizations */
                @media print {
                  body {
                    padding: 20px;
                    font-size: 2rem;
                    max-width: 100%;
                  }
                  
                  .note-title {
                    page-break-after: avoid;
                    font-size: 3rem;
                  }
                  
                  .editor-heading-h1, .editor-heading-h2, h1, h2, h3 {
                    page-break-after: avoid;
                  }
                  
                  .editor-quote, blockquote {
                    page-break-inside: avoid;
                  }
                  
                  .editor-bible-mention-wrapper {
                    page-break-inside: avoid;
                  }
                  
                  .editor-paragraph, p {
                    font-size: 2rem;
                  }
                  
                  .editor-bible-mention-verse {
                    font-size: 1.8rem;
                  }
                }
              </style>
            </head>
            <body>
              <div class="note-title">${noteTitle}</div>
              <div class="note-content">
                ${processedHtml}
              </div>
            </body>
          </html>
        `;

        // Use the existing printToFile function from usePrintAndShare hook
        await printToFile(styledHtml, noteTitle || "nota");
      } catch (error) {
        console.error("Error generating PDF:", error);
        Alert.alert("Error", "No se pudo generar el PDF");
      }
    },
    [printToFile, theme.colors.notification]
  );

  const handleShareSelectedNotes = async () => {
    const note = noteList.find((note: TNote) => selectedItems.has(note.id));
    if (!note) return;
    onDownloadPdf(note.note_text, note.title);
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

  const checkUserAndConnection = useCallback(() => {
    if (!user) {
      Alert.alert(
        "Sincronizar notas",
        "Debes iniciar sesión para sincronizar tus notas.",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Iniciar sesión",
            onPress: () => navigation.navigate(Screens.Login),
          },
        ]
      );
      return false;
    }
    if (!isConnected) {
      // schedule a notification
      return false;
    }
    return true;
  }, [user, isConnected, navigation, notificationService]);

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
          action: () => {
            if (!checkUserAndConnection()) return;
            downloadCloudNotesToLocal();
          },
          hide: !showMoreOptions,
          label: "Cargar desde la cuenta",
          isDownload: true,
        },
        {
          bottom: 280,
          name: "RefreshCw",
          color: "#2da5ff",
          action: () => {
            if (!checkUserAndConnection()) return;
            syncNotes();
          },
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
      isConnected,
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
      goBack: () => { navigation.navigate(Screens.Dashboard as any) },
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
            <Backdrop
              visible={showMoreOptions}
              onPress={dismiss}
              theme={theme}
            />
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
              data={noteList}
              renderItem={renderItem}
              keyExtractor={(item: TNote) => `note-${item.id}`}
              ListEmptyComponent={ListEmptyComponent}
              ListFooterComponent={<View style={styles.listFooter} />}
              removeClippedSubviews={true}
              numColumns={2}
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
                    style={{
                      alignItems: "center",
                      opacity: item.hide ? 0.5 : 1,
                    }}
                    onPress={() => item.action()}
                    disabled={item.hide}
                    accessible={true}
                    accessibilityLabel={item.label}
                    accessibilityRole="button"
                    accessibilityHint={"Pulsa para " + item.label}
                  >
                    <Icon
                      name={item.name as any}
                      size={24}
                      color={item.color}
                    />
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

export default NotesPage;
