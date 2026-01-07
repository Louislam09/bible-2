import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import ActionButton, { Backdrop } from "@/components/note/ActionButton";
import NoteActionsBottomSheet from "@/components/note/NoteActionsBottomSheet";
import ScreenWithAnimation from "@/components/ScreenWithAnimation";
import { Text, View } from "@/components/Themed";
import TutorialWalkthrough from "@/components/TutorialWalkthrough";
import { notesListHtmlTemplate, ViewMode } from "@/constants/notesListHtmlTemplate";
import { useAlert } from "@/context/AlertContext";
import { useBibleContext } from "@/context/BibleContext";
import { storedData$ } from "@/context/LocalstoreContext";
import { useNetwork } from "@/context/NetworkProvider";
import { useMyTheme } from "@/context/ThemeContext";
import { getFontCss } from "@/hooks/useLoadFonts";
import usePrintAndShare from "@/hooks/usePrintAndShare";
import { useSyncNotes } from "@/hooks/useSyncNotes";
import { useNoteService } from "@/services/noteService";
import { bibleState$ } from "@/state/bibleState";
import { modalState$ } from "@/state/modalState";
import { noteSelectors$ } from "@/state/notesState";
import { Screens, TNote, TTheme } from "@/types";
import { createOptimizedWebViewProps } from "@/utils/webViewOptimizations";
import { use$ } from "@legendapp/state/react";
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
  Keyboard,
  View as RNView,
  StyleSheet,
  ToastAndroid,
} from "react-native";
import WebView from "react-native-webview";

const NotesPage = () => {
  const { alertError, confirm, alertWarning } = useAlert();
  const { theme } = useMyTheme();
  const navigation = useNavigation();
  const { currentBibleLongName } = useBibleContext();
  const { deleteNote, exportNotes, importNotes, getAllNotes } =
    useNoteService();
  const isSyncing = use$(() => bibleState$.isSyncingNotes.get());
  const { syncNotes, downloadCloudNotesToLocal, syncSingleNote } =
    useSyncNotes();
  const user = use$(() => storedData$.user.get()) || null;

  const { printToFile } = usePrintAndShare();
  const netInfo = useNetwork();
  const { isConnected } = netInfo;

  const styles = getStyles(theme);

  const [filterData, setFilterData] = useState<TNote[]>([]);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    // Get saved view mode from stored data or default to 'grid'
    return (storedData$.notesViewMode?.get() as ViewMode) || 'grid';
  });

  const webViewRef = useRef<WebView>(null);

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

  // Open bottom sheet when selection mode becomes active
  useEffect(() => {
    if (isSelectionActive) {
      modalState$.openNoteActionsBottomSheet();
    }
  }, [isSelectionActive]);

  const noteList: TNote[] = useMemo(() => {
    return filterData;
  }, [filterData]);

  const onCreateNewNote = useCallback(() => {
    navigation.navigate(noteDetailScreen, { noteId: null, isNewNote: true });
  }, [navigation, noteDetailScreen]);

  const onOpenNoteDetail = useCallback(
    (id: number) => {
      navigation.navigate(noteDetailScreen, { noteId: id, isNewNote: false });
    },
    [navigation, noteDetailScreen]
  );

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
            <title>${noteTitle}</title>
            ${getFontCss({ fontName: storedData$.selectedFont.get() || '' })}
            <style>
             @page { size: A4; margin: 0mm; }
              
              body {
                line-height: 1.6;
                color: #111;
                background: #fff;
                font-size: 2rem;
                max-width: 100%;
                margin: 0;
                word-wrap: break-word;
                text-align: left;
                min-height: 100vh;
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
              
              .editor-hashtag {
                color: ${theme.colors.notification};
                font-weight: 500;
                font-size: 2rem;
                text-decoration: none;
              }
              
              .text-left { text-align: left; }
              .text-center { text-align: center; }
              .text-right { text-align: right; }
              .text-justify { text-align: justify; }
              
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
        alertError("Error", "No se pudo generar el PDF");
      }
    },
    [printToFile, theme.colors.notification, alertError]
  );

  const handleShareSelectedNotes = useCallback(async () => {
    const note = noteList.find((note: TNote) => selectedItems.has(note.id));
    if (!note) return;
    onDownloadPdf(note.note_text, note.title);
  }, [noteList, selectedItems, onDownloadPdf]);

  const handleDeleteSelectedNotes = useCallback(() => {
    const selectedIds = Array.from(selectedItems);

    confirm(
      "Eliminar Notas",
      `¿Estás seguro que quieres eliminar ${selectedIds.length} notas seleccionadas?`,
      async () => {
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

        // Notify WebView to exit selection mode
        webViewRef.current?.injectJavaScript(`
          if (typeof exitSelectionMode === 'function') {
            exitSelectionMode();
          }
          true;
        `);
      }
    );
  }, [confirm, selectedItems, noteList, deleteNote]);

  const handleSyncSelectedNotes = useCallback(async () => {
    console.log("Conexión a Internet:", isConnected);
    if (!isConnected) {
      alertWarning("Sin conexión", "No hay conexión a Internet para sincronizar las notas.");
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

    // Notify WebView to exit selection mode
    webViewRef.current?.injectJavaScript(`
      if (typeof exitSelectionMode === 'function') {
        exitSelectionMode();
      }
      true;
    `);
  }, [isConnected, selectedItems, noteList, syncSingleNote, alertWarning]);

  const handleExportSelectedNotes = useCallback(async () => {
    const ids = Array.from(selectedItems);
    console.log("Exporting notes with IDs:", ids);
    await exportNotes(ids);
  }, [selectedItems, exportNotes]);

  const checkUserAndConnection = useCallback(() => {
    if (!user) {
      alertWarning("Sincronizar notas", "Debes iniciar sesión para sincronizar tus notas.");
      return false;
    }
    if (!isConnected) {
      return false;
    }
    return true;
  }, [user, isConnected, alertWarning]);

  // Handle WebView messages
  const handleWebViewMessage = useCallback(
    (event: any) => {
      try {
        const message = JSON.parse(event.nativeEvent.data);
        const { type, data } = message;

        switch (type) {
          case "selectNote":
            onOpenNoteDetail(data.id);
            break;
          case "createNote":
            onCreateNewNote();
            break;
          case "selectionModeChange":
            if (data.isActive) {
              noteSelectors$.isSelectionMode.set(true);
            } else {
              noteSelectors$.clearSelections();
            }
            break;
          case "toggleSelection":
            if (data.isSelected) {
              const currentSet = new Set(noteSelectors$.selectedNoteIds.get());
              currentSet.add(data.noteId);
              noteSelectors$.selectedNoteIds.set(currentSet);
            } else {
              const currentSet = new Set(noteSelectors$.selectedNoteIds.get());
              currentSet.delete(data.noteId);
              noteSelectors$.selectedNoteIds.set(currentSet);
            }
            if (!noteSelectors$.isSelectionMode.get()) {
              noteSelectors$.isSelectionMode.set(true);
            }
            break;
          case "selectAll":
            noteSelectors$.selectAll(data.selectedIds);
            break;
          case "clearSelections":
            console.log('clearSelections')
            noteSelectors$.clearSelections();
            // close the bottom sheet
            break;
          case "searchChange":
            // Search is handled in WebView, but we can track it if needed
            break;
          case "viewModeChange":
            // Save view mode preference
            const newMode = data.viewMode as ViewMode;
            setViewMode(newMode);
            storedData$.notesViewMode.set(newMode);
            break;
          case "requestRefresh":
            bibleState$.toggleReloadNotes();
            break;
          default:
            console.log("Unknown message type:", type);
        }
      } catch (error) {
        console.error("Error parsing WebView message:", error, event.nativeEvent.data);
      }
    },
    [onOpenNoteDetail, onCreateNewNote]
  );

  // Generate HTML content - DO NOT include isSelectionActive or selectedItems in dependencies
  // The WebView manages its own selection state internally. Including these would cause
  // the WebView to reload and lose its JavaScript state whenever selection changes.
  const htmlContent = useMemo(() => {
    return notesListHtmlTemplate({
      theme,
      notes: noteList,
      fontSize: 16,
      isSelectionMode: false, // Always start with selection mode off, WebView manages it
      selectedNoteIds: [],
      viewMode,
    });
  }, [noteList, theme, viewMode]);

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
      checkUserAndConnection,
      downloadCloudNotesToLocal,
      syncNotes,
    ]
  );

  const isAllSelected = useMemo(
    () => noteList.length > 0 && noteList.every((note: TNote) => selectedItems.has(note.id)),
    [noteList, selectedItems]
  );

  const handleSelectAll = useCallback(() => {
    if (isAllSelected) {
      noteSelectors$.clearSelections();
      webViewRef.current?.injectJavaScript(`
        if (typeof exitSelectionMode === 'function') {
          exitSelectionMode();
        }
        true;
      `);
    } else {
      noteSelectors$.selectAll(noteList.map((note: TNote) => note.id));
      webViewRef.current?.injectJavaScript(`
        if (typeof toggleSelectAll === 'function') {
          toggleSelectAll();
        }
        true;
      `);
    }
  }, [isAllSelected, noteList]);

  const handleCloseSelectionMode = useCallback(() => {
    noteSelectors$.clearSelections();
    webViewRef.current?.injectJavaScript(`
      if (typeof exitSelectionMode === 'function') {
        exitSelectionMode();
      }
      true;
    `);
  }, []);

  const screenOptions: any = useMemo(() => {
    return {
      theme,
      title: "Mis Notas",
      titleIcon: "NotebookPen",
      goBack: () => { navigation.navigate(Screens.Dashboard as any) },
    };
  }, [theme, navigation]);

  return (
    <Fragment>
      <Stack.Screen options={singleScreenHeader(screenOptions)} />
      <ScreenWithAnimation duration={800} icon="NotebookPen" title="Mis Notas">
        <RNView style={styles.container}>
          <Backdrop
            visible={showMoreOptions}
            onPress={dismiss}
            theme={theme}
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
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.notification} />
              </View>
            )}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error("WebView error:", nativeEvent);
            }}
            {...createOptimizedWebViewProps({}, "static")}
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

        </RNView>
      </ScreenWithAnimation>
      <TutorialWalkthrough />

      {/* Note Actions Bottom Sheet */}
      <NoteActionsBottomSheet
        selectedCount={selectedItems.size}
        onSync={handleSyncSelectedNotes}
        onExport={handleExportSelectedNotes}
        onShare={handleShareSelectedNotes}
        onDelete={handleDeleteSelectedNotes}
        onSelectAll={handleSelectAll}
        onClose={handleCloseSelectionMode}
        isAllSelected={isAllSelected}
      />
    </Fragment>
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
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
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
  });

export default NotesPage;
