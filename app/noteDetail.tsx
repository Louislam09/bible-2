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
import { QUERY_BY_DB } from "@/constants/Queries";
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
const { width, height } = Dimensions.get("window");

type NoteDetailProps = {};
type NoteDetailParams = { noteId: number | null; isNewNote: boolean };

const NoteDetail: React.FC<NoteDetailProps> = ({}) => {
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
    async (book: string, chapter: number, verse: number): Promise<string> => {
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

        // Determine which query to use based on the current Bible version
        const isInterlinear = [
          EBibleVersions.INTERLINEAR,
          EBibleVersions.GREEK,
        ].includes(currentBibleVersion as EBibleVersions);
        const queryKey = isInterlinear
          ? EBibleVersions.BIBLE
          : currentBibleVersion;
        const query = QUERY_BY_DB[queryKey] || QUERY_BY_DB["OTHERS"];

        // Fetch the verse from database
        const verses = await primaryDB.executeSql(
          query.GET_VERSES_BY_BOOK_AND_CHAPTER_VERSE,
          [bookDetail.bookNumber, chapter, verse],
          "fetchBibleVerse"
        );

        if (verses && verses.length > 0) {
          const verseData = verses[0];
          return getVerseTextRaw(verseData.text || "");
        } else {
          return `[Versículo ${book} ${chapter}:${verse} no encontrado]`;
        }
      } catch (error) {
        console.error("Failed to fetch verse from database:", error);
        return `[Error cargando ${book} ${chapter}:${verse}]`;
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
          { text: "Cancelar", style: "cancel", onPress: () => {} },
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
            // ellipsizeMode="tail"
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
        <TouchableOpacity onPress={() => onShare()} style={{ marginRight: 10 }}>
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
          // backgroundColor: "white",
        }}
      >
        <Stack.Screen
          options={{
            headerShown: isView,
            header: ViewModeHeader,
            // ...singleScreenHeader({
            //   theme,
            //   title: "",
            //   titleIcon: "NotebookPen",
            //   headerRightProps: {
            //     headerRightIconColor: theme.colors.primary,
            //     headerRightIcon: "Share2",
            //     onPress: onShare,
            //     disabled: false,
            //     style: { opacity: 1 },
            //   },
            // }),
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
                onChangeText={(text: string) =>
                  onContentChange("content", text)
                }
                value={noteInfo?.note_text || ""}
                title={noteContent.title}
                width={width}
                height={height}
                onSave={onSave}
                onTitleChange={(text: string) => onContentChange("title", text)}
                fetchBibleVerse={allBibleLoaded ? fetchBibleVerse : undefined}
                // onTitleChange={(text: string) => console.log("title", text)}
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
      width: "auto",
      backgroundColor: "transparent",
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

export default NoteDetail;
