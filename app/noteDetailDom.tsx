import DomNoteEditor from "@/components/dom-components/DomNoteEditor";
import Icon from "@/components/Icon";
import { KeyboardPaddingView } from "@/components/keyboard-padding";
import MyRichEditor from "@/components/RichTextEditor";
import { Text, View } from "@/components/Themed";
import { htmlTemplate } from "@/constants/HtmlTemplate";
import { useMyTheme } from "@/context/ThemeContext";
import useDebounce from "@/hooks/useDebounce";
import useParams from "@/hooks/useParams";
import usePrintAndShare from "@/hooks/usePrintAndShare";
import { useNoteService } from "@/services/noteService";
import { bibleState$ } from "@/state/bibleState";
import { EViewMode, Screens, TNote, TTheme, EBibleVersions } from "@/types";
import { formatDateShortDayMonth } from "@/utils/formatDateShortDayMonth";
import { use$ } from "@legendapp/state/react";
import { useDBContext } from "@/context/databaseContext";
import { storedData$ } from "@/context/LocalstoreContext";
import {
  GET_SINGLE_OR_MULTIPLE_VERSES,
  QUERY_BY_DB,
} from "@/constants/Queries";
import { getVerseTextRaw } from "@/utils/getVerseTextRaw";
import { getBookDetail } from "@/constants/BookNames";
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
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
  Keyboard,
  StyleSheet,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
} from "react-native";
import "../global.css";
import { formatTextToClipboard } from "@/utils/copyToClipboard";
const { width, height } = Dimensions.get("window");

type NoteDetailProps = {};
type NoteDetailParams = { noteId: number | null; isNewNote: boolean };

const NoteDetailDom: React.FC<NoteDetailProps> = ({ }) => {
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
  const [keyboardOpen, setKeyboardOpen] = useState(false);
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
  const defaultTitle = "Sin titulo ✏️";

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
        Alert.alert(
          "Error",
          "No se pudo cargar la nota. Por favor, inténtelo de nuevo."
        );
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
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => setKeyboardOpen(true)
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => setKeyboardOpen(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

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
      const date = new Date().toLocaleDateString();
      const uniqueSuffix = Date.now().toString(36).slice(-4);
      if (!noteContent.title) {
        noteContent.title = `${defaultTitle} ${date} - ${uniqueSuffix}`;
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
      Alert.alert("Error", "No se pudo guardar la nota.");
    }
  }, [noteContent, noteId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (!hasUnsavedChanges) return;

      e.preventDefault();

      Alert.alert(
        "Guardar cambios",
        "Tienes cambios sin guardar, ¿quieres salir sin guardar?",
        [
          { text: "Cancelar", style: "cancel", onPress: () => { } },
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
        ]
      );
    });

    return unsubscribe;
  }, [navigation, hasUnsavedChanges, onSave]);

  const renderActionButtons = useCallback(() => {
    return (
      <>
        <TouchableOpacity
          style={[
            styles.scrollToTopButton,
            {
              borderWidth: 1,
              borderColor: theme.colors.notification,
              padding: 10,
              borderRadius: 10,
            },
            (keyboardOpen || !isView) && { bottom: 70 },
          ]}
          onPress={isView ? onEditMode : onSave}
        >
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
              name={isView ? "Pencil" : isTyping ? "Loader" : "Save"}
              size={30}
            />
          </Animated.View>
        </TouchableOpacity>
      </>
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
        },
        true
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
      Alert.alert("Error", "No se pudo actualizar la nota.");
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

  const onShare = () => {
    const html = htmlTemplate(
      [
        {
          definition: noteInfo?.note_text,
          topic: noteInfo?.title,
        },
      ],
      theme.colors,
      10,
      true
    );
    printToFile(html, noteInfo?.title?.toUpperCase() || "--");
  };

  const onDownloadPdf = useCallback(
    async (htmlContent: string, noteTitle: string) => {
      try {
        // Process HTML to convert Bible mentions to proper structure
        const processedHtml = htmlContent.replace(
          /<span[^>]*data-lexical-bible-mention="true"[^>]*>(.*?)<\/span>/g,
          (match, content) => {
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
                border-left: 4px solid #0066cc;
                border-radius: 6px;
              }
              
              .editor-bible-mention {
                color: #0066cc;
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
                color: #0066cc;
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

  if (isLoading) {
    return (
      <View style={styles.activiyContainer}>
        <ActivityIndicator style={{ flex: 1 }} />
      </View>
    );
  }

  const showNewEditor = false;

  const ViewModeHeader = () => {
    return (
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => {
            console.log("back");
            router.back();
          }}
          style={{ marginRight: 10 }}
        >
          <Icon name="ChevronLeft" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.noteHeaderSubtitleContainer}>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={styles.noteHeaderTitle}
          >
            {noteInfo?.title}
          </Text>
          <Text style={styles.noteHeaderSubtitle}>
            {formatDateShortDayMonth(
              isNewNote
                ? new Date()
                : ((noteInfo?.updated_at || noteInfo?.created_at) as any),
              {
                weekday: "short",
                day: "numeric",
                month: "long",
                year: "numeric",
              }
            )}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() =>
            onDownloadPdf(noteInfo?.note_text || "", noteInfo?.title || "")
          }
          style={{ marginRight: 10 }}
        >
          <Icon name="Share2" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
      <View
        style={{
          flex: 1,
          width: "100%",
        }}
      >
        <Stack.Screen
          options={{
            headerShown: isView,
            header: ViewModeHeader,
          }}
        />
        <View style={styles.container}>
          {/* {isView && (
            <View style={styles.titleContainer}>
              <Text style={{ fontSize: 22 }}>
                {noteInfo?.title?.toUpperCase() || defaultTitle}
              </Text>
              <Text style={styles.dateLabel}>
                {formatDateShortDayMonth(
                  isNewNote
                    ? new Date()
                    : ((noteInfo?.updated_at || noteInfo?.created_at) as any),
                  {
                    weekday: "short",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }
                )}
              </Text>
            </View>
          )} */}
          {showNewEditor ? (
            <MyRichEditor
              Textinput={
                <TextInput
                  editable={!isView}
                  placeholder="Titulo"
                  placeholderTextColor={theme.colors.text}
                  style={[styles.textInput]}
                  multiline
                  value={noteContent.title}
                  onChangeText={(text: string) =>
                    onContentChange("title", text)
                  }
                />
              }
              value={noteContent.content}
              onChangeText={(text: string) => onContentChange("content", text)}
              readOnly={isView}
            />
          ) : (
            <>
              <View
                style={{
                  height: isView ? 0 : Constants.statusBarHeight,
                }}
              />

              <DomNoteEditor
                isReadOnly={isView}
                theme={theme}
                noteId={noteId?.toString()}
                isNewNote={isNewNote}
                onChangeText={(key: string, text: string) =>
                  onContentChange(key, text)
                }
                value={noteInfo?.note_text || ""}
                title={noteInfo?.title || ""}
                width={width}
                height={height}
                onSave={onSave}
                fetchBibleVerse={fetchBibleVerse}
                onDownloadPdf={onDownloadPdf}
              // dom={{}}
              />
            </>
          )}
          {/* </StatusBarBackground> */}
          {renderActionButtons()}
        </View>
        <KeyboardPaddingView />
      </View>
    </>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 5,
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
      // textDecorationStyle: "solid",
      // textDecorationColor: "red",
      // textDecorationLine: "underline",
    },
    scrollToTopButton: {
      position: "absolute",
      bottom: 25,
      right: 20,
      backgroundColor: colors.background,
      padding: 10,
      borderRadius: 10,
      borderColor: "#ddd",
      borderWidth: 0.3,
      elevation: 3,
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
      borderWidth: 1,
      borderColor: colors.text + 40,
      // paddingVertical: 5,
      backgroundColor: colors.notification + "20",
      width: "100%",
    },
    noteHeaderSubtitle: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.text,
      alignSelf: "flex-start",
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
