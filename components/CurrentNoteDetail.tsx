import Icon from "@/components/Icon";
import { KeyboardPaddingView } from "@/components/keyboard-padding";
import MyRichEditor from "@/components/RichTextEditor";
import { Text, View } from "@/components/Themed";
import { GET_NOTE_BY_ID } from "@/constants/queries";
import { useDBContext } from "@/context/databaseContext";
import { useMyTheme } from "@/context/ThemeContext";
import useDebounce from "@/hooks/useDebounce";
import { useNoteService } from "@/services/noteService";
import { bibleState$ } from "@/state/bibleState";
import { EViewMode, TNote, TTheme } from "@/types";
import { formatDateShortDayMonth } from "@/utils/formatDateShortDayMonth";
import { use$ } from "@legendapp/state/react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TextInput,
  ToastAndroid,
  TouchableOpacity
} from "react-native";
import LexicalWebView from "./LexicalWebView";
import { useAlert } from "@/context/AlertContext";

const CurrentNoteDetail: React.FC<any> = ({ }) => {
  const { alertError } = useAlert();
  const { theme } = useMyTheme();
  const { myBibleDB, executeSql } = useDBContext();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const { createNote, updateNote } = useNoteService();

  const selectedVerseForNote = use$(() =>
    bibleState$.selectedVerseForNote.get()
  );

  const currentNoteId = bibleState$.currentNoteId.get();
  const [noteId, setNoteId] = useState(currentNoteId);
  const [isNewNote, setNewNote] = useState(noteId === -1);
  const typingTimeoutRef = useRef<any>(null);
  const [isLoading, setLoading] = useState(true);
  const [isTyping, setTyping] = useState(false);
  const [shouldOpenKeyboard, setShouldOpenKeyboard] = useState(false);
  const [noteInfo, setNoteInfo] = useState<TNote | null>(null);
  const [viewMode, setViewMode] = useState<keyof typeof EViewMode>(
    isNewNote ? "NEW" : "EDIT"
  );
  const [noteContent, setNoteContent] = useState({
    title: "",
    content: "",
  });

  const isView = viewMode === "VIEW";
  const defaultTitle = "Sin titulo ✏️";

  const debouncedNoteContent = useDebounce(noteContent, 1000);

  useEffect(() => {
    setNoteId(currentNoteId);
    setNewNote(currentNoteId === -1);
  }, [currentNoteId]);

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
        if (noteId === undefined || noteId === null || isNewNote) {
          setLoading(false);
          return;
        }
        setLoading(true);
        if (!myBibleDB || !executeSql) return;
        const note = await executeSql(GET_NOTE_BY_ID, [noteId]);
        setNoteInfo(note[0] as TNote);
      } catch (error) {
        alertError("Error", "No se pudo cargar la nota. Por favor, inténtelo de nuevo.");
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [noteId, isNewNote]);

  useEffect(() => {
    if (!isLoading) {
      addTextToNote();
    }
  }, [noteInfo, isNewNote, isLoading]);

  const onSave = useCallback(async () => {
    try {
      if (noteId && !isNewNote) {
        await onUpdate(noteId, true);
        return;
      }
      const date = new Date().toLocaleDateString();
      const uniqueSuffix = Date.now().toString(36).slice(-4);
      if (!noteContent.title) {
        noteContent.title = `${defaultTitle} ${date} - ${uniqueSuffix}`;
      }
      const success = await createNote({
        title: noteContent.title,
        note_text: noteContent.content,
      });

      if (success) {
        setViewMode("VIEW");
        const result = await executeSql("SELECT last_insert_rowid() as id");
        const newNoteId = result[0]?.id;
        bibleState$.currentNoteId.set(newNoteId);
        ToastAndroid.show("Nota guardada!", ToastAndroid.SHORT);
      }
    } catch (error) {
      alertError("Error", "No se pudo guardar la nota.");
    }
  }, [noteContent, noteId]);

  const renderActionButtons = useCallback(() => {
    return (
      <>
        <TouchableOpacity
          style={[styles.scrollToTopButton]}
          onPress={isView ? onEditMode : onSave}
        >
          {isView ? (
            <Icon
              color={theme.colors.notification}
              name="Pencil"
              size={30}
            />
          ) : isTyping ? (
            <ActivityIndicator size={30} color={theme.colors.notification} />
          ) : (
            <Icon
              color={theme.colors.notification}
              name="Save"
              size={30}
            />
          )}

        </TouchableOpacity>
      </>
    );
  }, [isTyping, isView, noteContent]);

  const addTextToNote = useCallback(() => {
    const isEditMode = !!selectedVerseForNote;
    const myContent = noteInfo?.note_text || "";
    setNoteContent({
      title: noteInfo?.title || "",
      content: !noteInfo && !selectedVerseForNote ? "" : myContent,
    });
    if (isEditMode) {
      setViewMode("EDIT");
      setShouldOpenKeyboard(true);
    }
  }, [noteInfo, selectedVerseForNote]);

  const afterSaving = () => {
    setTyping(false);
    typingTimeoutRef.current = null;
  };

  const onUpdate = async (id: number, goToViewMode = false) => {
    try {
      const updatedNote = await updateNote(
        id,
        {
          title: noteContent.title,
          note_text: noteContent.content,
          uuid: noteInfo?.uuid,
        }
      );

      if (updatedNote) {
        afterSaving();
        if (goToViewMode) {
          setViewMode("VIEW");
          ToastAndroid.show("Nota actualizada!", ToastAndroid.SHORT);
          bibleState$.toggleReloadNotes();
        }
      }
    } catch (error) {
      console.log({ error });
      alertError("Error", "No se pudo actualizar la nota.");
    }
  };

  const onContentChange = async (field: any, text: string) => {
    if (!isNewNote) {
      typingTimeoutRef.current = true;
      setTyping(true);
    }

    setNoteContent((prev: any) => ({
      ...prev,
      [field]: text || "",
    }));
  };

  const onEditMode = () => {
    setViewMode("EDIT");
  };
  const onReady = (sendMessageCallback: (type: string, data: any) => void) => {
    if (selectedVerseForNote) {
      sendMessageCallback('addTextToNote', {
        text: selectedVerseForNote,
      });
      bibleState$.clearSelectedVerseForNote();
    }
  };

  if (isLoading) {
    return (
      <View style={styles.activiyContainer}>
        <ActivityIndicator style={{ flex: 1 }} />
      </View>
    );
  }

  return (
    <View style={styles.pageContainer}>
      <View style={styles.container}>
        <LexicalWebView
          initialTitle={isView ? noteContent.title : noteInfo?.title || ""}
          initialContent={isView ? noteContent.content : noteInfo?.note_text || ""}
          onContentChange={(content) => onContentChange('content', content)}
          onTitleChange={(title) => onContentChange('title', title)}
          placeholder="Escribe tu nota..."
          isReadOnly={isView}
          noteId={noteId?.toString()}
          isNewNote={isNewNote}
          isModal
          onReady={onReady}
        />
        {renderActionButtons()}
      </View>
      <KeyboardPaddingView />
    </View>
  )

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        {isView && (
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
        )}
        <MyRichEditor
          shouldOpenKeyboard={shouldOpenKeyboard}
          isModal
          Textinput={
            <TextInput
              editable={!isView}
              placeholder="Titulo"
              placeholderTextColor={theme.colors.text}
              style={[styles.textInput]}
              multiline
              value={noteContent.title}
              onChangeText={(text: string) => onContentChange("title", text)}
            />
          }
          value={noteContent.content}
          onChangeText={(text: string) => onContentChange("content", text)}
          readOnly={isView}
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
      zIndex: 100,
    },
    dateLabel: {
      textTransform: "uppercase",
      textAlign: "center",
    },
    titleContainer: {
      gap: 4,
      alignItems: "center",
      backgroundColor: "transparent",
      justifyContent: "center",
      marginVertical: 5,
      flexDirection: "column",
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
    noteHeaderSubtitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      alignSelf: "flex-start",
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
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
      backgroundColor: "transparent",
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

export default CurrentNoteDetail;
