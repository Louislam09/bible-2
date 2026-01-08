import Icon from "@/components/Icon";
import { KeyboardPaddingView } from "@/components/keyboard-padding";
import { View } from "@/components/Themed";
import { getBookDetail } from "@/constants/BookNames";
import { GET_SINGLE_OR_MULTIPLE_VERSES } from "@/constants/queries";
import { useDBContext } from "@/context/databaseContext";
import { storedData$ } from "@/context/LocalstoreContext";
import { useMyTheme } from "@/context/ThemeContext";
import useDebounce from "@/hooks/useDebounce";
import useParams from "@/hooks/useParams";
import usePrintAndShare from "@/hooks/usePrintAndShare";
import { useNoteService } from "@/services/noteService";
import { bibleState$ } from "@/state/bibleState";
import { useAlert } from "@/context/AlertContext";
import { EBibleVersions, EViewMode, Screens, TNote, TTheme } from "@/types";
import { formatTextToClipboard } from "@/utils/copyToClipboard";
import { formatNoteTitleDate } from "@/utils/formatDateShortDayMonth";
import { use$ } from "@legendapp/state/react";
import Constants from "expo-constants";
import { Stack, useNavigation, useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  ToastAndroid,
  TouchableOpacity
} from "react-native";
// @ts-ignore
import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import LexicalWebView from "@/components/LexicalWebView";
import "../global.css";
import { getFontCss } from "@/hooks/useLoadFonts";

type NoteDetailProps = {};
type NoteDetailParams = { noteId: number | null; isNewNote: boolean };

const NoteDetailDom: React.FC<NoteDetailProps> = ({ }) => {
  const { confirm, alertError, alert } = useAlert();
  const { theme } = useMyTheme();
  const navigation = useNavigation();
  const router = useRouter();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const { getNoteById, createNote, updateNote } = useNoteService();
  const selectedVerseForNote = use$(() =>
    bibleState$.selectedVerseForNote.get()
  );

  // Database context for Bible verse fetching
  const { getBibleServices, allBibleLoaded } = useDBContext();
  const currentBibleVersion = use$(() => storedData$.currentBibleVersion.get());

  const routeParams = useParams<NoteDetailParams>();
  const { noteId, isNewNote } = routeParams;

  const rotation = useRef(new Animated.Value(0)).current;
  const typingTimeoutRef = useRef<any>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [isTyping, setTyping] = useState(false);
  const [noteInfo, setNoteInfo] = useState<TNote | null>(null);
  const [viewMode, setViewMode] = useState<keyof typeof EViewMode>(
    isNewNote ? "NEW" : "VIEW"
  );
  const [noteContent, setNoteContent] = useState({
    title: "",
    content: "",
  });

  const isView = viewMode === "VIEW";
  const defaultTitle = "Sin título";

  const debouncedNoteContent = useDebounce(noteContent, 3000);
  const { printToFile } = usePrintAndShare();

  // Function to fetch Bible verse from database
  const fetchBibleVerse = useCallback(
    async (
      book: string,
      chapter: number,
      startVerse: number,
      endVerse: number
    ): Promise<string> => {
      try {
        const bookDetail = getBookDetail(book);
        if (!bookDetail) {
          console.log(`Book "${book}" not found in database.`);
          return `[Libro "${book}" no encontrado]`;
        }

        const NT_BOOK_NUMBER = 470;
        const isNewCovenant = bookDetail.bookNumber >= NT_BOOK_NUMBER;
        const { primaryDB, baseDB } = getBibleServices({ isNewCovenant });

        if (!primaryDB || !primaryDB.executeSql) {
          return `[Base de datos no disponible]`;
        }

        let conditions: string = "";
        if (endVerse) {
          conditions = `(v.book_number = ? AND v.chapter = ? AND v.verse BETWEEN ? AND ?)`;
        } else {
          conditions = `(v.book_number = ? AND v.chapter = ? AND v.verse = ?)`;
        }

        // Determine which query to use based on the current Bible version
        const isInterlinear = [
          EBibleVersions.INTERLINEAR,
          EBibleVersions.GREEK,
        ].includes(currentBibleVersion as EBibleVersions);

        const query2 = `${GET_SINGLE_OR_MULTIPLE_VERSES} ${conditions};
        `;

        const isValidRange = endVerse && endVerse > startVerse;

        // Fetch the verse from database
        const verses = await primaryDB.executeSql(
          query2,
          [
            bookDetail.bookNumber,
            chapter,
            startVerse,
            isValidRange ? endVerse : startVerse,
          ],
          "fetchBibleVerse"
        );
        const textCopied = await formatTextToClipboard({
          highlightedVerses: verses,
          highlightedGreaterThanOne: verses.length > 1,
          book: bookDetail.longName,
          chapter: chapter,
          shouldReturnHmlt: false,
          noTitle: true,
        });

        if (verses && verses.length > 0) {
          return textCopied;
        } else {
          return `[Versículo ${book} ${chapter}:${startVerse} no encontrado]`;
        }
      } catch (error) {
        console.error("Failed to fetch verse from database:", error);
        return `[Error cargando ${book} ${chapter}:${startVerse}]`;
      }
    },
    [getBibleServices, currentBibleVersion, allBibleLoaded]
  );

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  useEffect(() => {
    if (noteId && debouncedNoteContent && typingTimeoutRef.current) {
      onUpdate(noteId as number);
    } else {
      setTyping(false);
    }
  }, [debouncedNoteContent, noteId]);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        if (noteId === undefined || noteId === null || isNewNote || !isView) {
          setLoading(false);
          return;
        }
        setLoading(true);
        const note = await getNoteById(noteId);
        if (note) {
          setNoteInfo(note as TNote);
        }
      } catch (error) {
        console.error("Failed to fetch note:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [noteId, isNewNote, isView]);

  useEffect(() => {
    if (!isLoading) {
      addTextToNote();
    }
  }, [noteInfo, isNewNote, isLoading]);

  useEffect(() => {
    if (isNewNote) {
      navigation.setOptions({
        headerTitle: "📝",
      });
    }
  }, [isView, noteInfo, isNewNote]);


  useEffect(() => {
    if (isTyping) {
      startRotation();
    } else {
      stopRotation();
    }
  }, [isTyping]);

  const onSave = useCallback(async () => {
    try {
      if (noteId) {
        await onUpdate(noteId, true);
        return;
      }
      if (!noteContent.title) {
        noteContent.title = formatNoteTitleDate();
      }
      setHasUnsavedChanges(false);
      const success = await createNote({
        title: noteContent.title,
        note_text: noteContent.content,
      });

      if (success) {
        bibleState$.toggleReloadNotes();
        navigation.navigate(Screens.Notes, { shouldRefresh: true });
        ToastAndroid.show("Nota guardada!", ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error("Failed to save note:", error);
    }
  }, [noteContent, noteId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (!hasUnsavedChanges) return;

      e.preventDefault();

      alert({
        title: "Guardar cambios",
        message: "Tienes cambios sin guardar, ¿quieres salir sin guardar?",
        type: "warning",
        buttons: [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Salir sin guardar",
            style: "destructive",
            onPress: () => navigation.dispatch(e.data.action),
          },
          {
            text: "Guardar",
            onPress: async () => {
              await onSave();
              navigation.dispatch(e.data.action);
            },
          },
        ],
      });
    });

    return unsubscribe;
  }, [navigation, hasUnsavedChanges, onSave, alert]);

  const renderActionButtons = useCallback(() => {
    return (
      <TouchableOpacity
        style={[
          styles.scrollToTopButton,

        ]}
        onPress={isView ? onEditMode : onSave}
      >
        {isTyping ? (
          <Animated.View
            style={{
              transform: [
                { rotate: isView ? "0deg" : isTyping ? rotate : "0deg" },
              ],
            }}
          >
            <Icon
              style={[{}]}
              color={theme.colors.notification}
              name={"Loader"}
              size={30}
            />
          </Animated.View>
        ) : (
          <Icon
            style={[{}]}
            color={theme.colors.notification}
            name={isView ? "Pencil" : "Save"}
            size={30}
          />
        )}
      </TouchableOpacity>
    );
  }, [isTyping, isView, noteContent]);

  const startRotation = () => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  const stopRotation = () => {
    rotation.stopAnimation();
    rotation.setValue(0);
  };

  const addTextToNote = useCallback(() => {
    const isEditMode = !!selectedVerseForNote;
    if (isEditMode) {
      setViewMode("EDIT");
      setHasUnsavedChanges(true);
    }
    const contentToAdd = selectedVerseForNote
      ? `<br> <div>${selectedVerseForNote}</div><br>`
      : "";
    const myContent = `${noteInfo?.note_text || ""} ${contentToAdd}`;
    setNoteContent({
      title: noteInfo?.title || "",
      content: !noteInfo && !selectedVerseForNote ? "" : myContent,
    });
    bibleState$.clearSelectedVerseForNote();
  }, [noteInfo, selectedVerseForNote]);

  const afterSaving = () => {
    setTyping(false);
    typingTimeoutRef.current = null;
  };

  const onUpdate = async (id: number, goToViewMode = false) => {
    try {
      const success = await updateNote(
        id,
        {
          title: noteContent.title,
          note_text: noteContent.content,
          uuid: noteInfo?.uuid,
        }
      );

      if (success) {
        afterSaving();
        setHasUnsavedChanges(false);
        if (goToViewMode) {
          setViewMode("VIEW");
          ToastAndroid.show("Nota actualizada!", ToastAndroid.SHORT);
          bibleState$.toggleReloadNotes();
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onContentChange = async (field: any, text: string) => {
    if (!isNewNote) {
      typingTimeoutRef.current = true;
      setTyping(true);
    }
    setHasUnsavedChanges(true);

    setNoteContent((prev: any) => ({
      ...prev,
      [field]: text || "",
    }));
  };

  const onEditMode = () => {
    setViewMode("EDIT");
  };

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
        alertError("Error", "No se pudo generar el PDF");
      }
    },
    [printToFile, theme.colors.notification, alertError]
  );

  const screenOptions: any = useMemo(() => {
    return {
      theme,
      title: isView ? "Vista previa" : "Editor",
      titleIcon: isView ? "NotebookPen" : "SquarePen",
      goBack: () => { navigation.navigate(Screens.Dashboard as any) },
      headerRightProps: {
        headerRightIcon: "Share2",
        headerRightIconColor: theme.colors.text,
        onPress: () => onDownloadPdf(noteInfo?.note_text || "", noteInfo?.title || ""),
        disabled: false,
        style: { opacity: 1 },
      },
    };
  }, [theme.colors, isView, noteInfo]);

  return (
    <View style={styles.pageContainer} >
      <Stack.Screen options={singleScreenHeader(screenOptions)} />
      <View style={styles.container}>
        <LexicalWebView
          initialTitle={noteInfo?.title || ""}
          initialContent={noteInfo?.note_text || ""}
          onContentChange={(content) => onContentChange('content', content)}
          onTitleChange={(title) => onContentChange('title', title)}
          placeholder="Escribe tu nota..."
          isReadOnly={isView}
          noteId={noteId?.toString()}
          isNewNote={isNewNote}
          isModal
        />
        {renderActionButtons()}
      </View>
      <KeyboardPaddingView />
    </View>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    pageContainer: {
      flex: 1,
      width: "100%",
    },
    container: {
      flex: 1,
      backgroundColor: dark ? colors.background : "#eee",

    },
    titleContainer: {
      gap: 4,
      alignItems: "center",
      backgroundColor: "transparent",
      justifyContent: "center",
      marginVertical: 5,
      flexDirection: "column",
    },
    dateLabel: {
      // textTransform: "uppercase",
      // textAlign: "center",
      fontSize: 12,
      color: colors.text,
      letterSpacing: 1,
      opacity: 0.7,
      marginBottom: 8,
      textTransform: "uppercase",
    },
    textInput: {
      padding: 10,
      fontSize: 26,
      fontWeight: "bold",
      color: colors.text,
      marginVertical: 5,
    },
    scrollToTopButton: {
      position: "absolute",
      bottom: 10,
      right: 20,
      backgroundColor: colors.background,
      padding: 10,
      borderRadius: 10,
      elevation: 3,
      borderWidth: 1,
      borderColor: colors.notification,
    },
    noteHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 4,
      paddingVertical: 10,
      marginTop: 40,
      backgroundColor: "transparent",
    },
    noteListTitle: {
      fontSize: 30,
      marginVertical: 10,
      fontWeight: "bold",
      textAlign: "center",
      color: colors.notification,
    },
    noteHeaderTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      alignSelf: "flex-start",
      borderRadius: 8,
      paddingHorizontal: 2,
      // borderWidth: 1,
      // borderColor: colors.text + 40,
      // paddingVertical: 5,
      // backgroundColor: colors.notification + "20",
      width: "100%",
    },
    noteHeaderSubtitle: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.text,
      alignSelf: "center",
      paddingHorizontal: 2,
    },
    noteHeaderSubtitleContainer: {
      gap: 4,
      flexDirection: "column",
      width: "70%",
      backgroundColor: "transparent",
      // flex: 1,
    },
    activiyContainer: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    searchContainer: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      borderRadius: 10,
      marginVertical: 20,
      borderWidth: 1,
      borderColor: colors.notification,
      borderStyle: "solid",
      width: "100%",
      fontWeight: "100",
      backgroundColor: colors.notification + "99",
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
    },
    cardContainer: {
      display: "flex",
      borderRadius: 10,
      backgroundColor: dark ? "#151517" : colors.card,
      padding: 15,
      margin: 5,
      elevation: 5,
      borderColor: "#ddd",
      borderWidth: 0.5,
    },
    headerContainer: {
      position: "relative",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 10,
      paddingHorizontal: 10,
      // borderWidth: 1,
      // borderColor: colors.notification,
      paddingTop: Constants.statusBarHeight + 10,
      backgroundColor: colors.background,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.notification,
      flex: 1,
    },
    cardBody: {
      fontSize: 16,
      color: colors.text,
    },
    separator: {
      height: 1,
      backgroundColor: colors.notification + "99",
      marginVertical: 8,
    },
    noResultsContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 10,
      paddingBottom: 20,
      backgroundColor: "transparent",
    },
    noResultsText: {
      fontSize: 18,
      color: colors.text,
      textAlign: "center",
    },
    verseAction: {
      flexDirection: "row",
      backgroundColor: "transparent",
    },
    icon: {
      fontWeight: "700",
      marginHorizontal: 10,
      color: colors.primary,
      // fontSize: 24,
    },
  });

export default NoteDetailDom;
