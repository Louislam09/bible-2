import { useTheme } from "@react-navigation/native";
import Icon from "components/Icon";
import { Text, View } from "components/Themed";
import { GET_NOTE_BY_ID } from "constants/Queries";
import { useBibleContext } from "context/BibleContext";
import { useDBContext } from "context/databaseContext";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  TextInput,
  ToastAndroid,
  TouchableOpacity
} from "react-native";
import { EViewMode, RootStackScreenProps, Screens, TNote, TTheme } from "types";
import { formatDateShortDayMonth } from "utils/formatDateShortDayMonth";
import MyRichEditor from "./RichTextEditor";

const NoteDetail: React.FC<RootStackScreenProps<"NoteDetail">> = ({
  route,
  navigation,
}) => {
  const theme = useTheme();
  const { myBibleDB, executeSql } = useDBContext();
  const { onSaveNote, onUpdateNote, addToNoteText, onAddToNote } =
    useBibleContext();

  const { noteId, isNewNote } = route.params as any;

  const typingTimeoutRef = useRef<any>(null);
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

  const styles = getStyles(theme);
  const isView = viewMode === "VIEW";
  const defaultTitle = "Sin titulo ✏️";

  useEffect(() => {
    if (noteId === undefined || noteId === null || isNewNote) {
      setLoading(false)
      return
    };
    setLoading(true)
    const getNoteById = async () => {
      if (!myBibleDB || !executeSql) return;
      const note = await executeSql(myBibleDB, GET_NOTE_BY_ID, [noteId]);
      setNoteInfo(note[0] as TNote);
      setLoading(false)
    };

    getNoteById();
    return () => { };
  }, [noteId, isNewNote]);

  useEffect(() => {
    if (isLoading) return
    addTextToNote(noteInfo);
  }, [noteInfo, isNewNote, isLoading]);

  useEffect(() => {
    if (isNewNote) {
      navigation.setOptions({
        headerTitle: "📝",
      });
    } else {
      const headerTitle = isView ? noteInfo?.title?.toUpperCase() : "✏️"
      navigation.setOptions({ headerTitle });
    }
  }, [isView, noteInfo, isNewNote])

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardOpen(true);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardOpen(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

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
          <Icon
            style={[{}]}
            color={theme.colors.notification}
            name={isView ? "Pencil" : isTyping ? "RefreshCcw" : "Save"}
            size={30}
          />
        </TouchableOpacity>
      </>
    );
  }, [isTyping, isView, noteContent]);


  const addTextToNote = (selectedNote: TNote | null) => {
    const isEditMode = !!addToNoteText
    if (isEditMode) setViewMode("EDIT")
    const contentToAdd = `<br> <div>${addToNoteText}</div><br>`;
    const myContent = `${selectedNote?.note_text || ""} ${contentToAdd} `;
    setNoteContent({
      title: selectedNote?.title || "",
      content: !selectedNote && !addToNoteText ? "" : myContent,
    });
    onAddToNote("");
  };

  const afterSaving = () => {
    setTyping(false);
    clearTimeout(typingTimeoutRef.current);
  };

  const onUpdate = async (id: number, goToViewMode: boolean = false) => {
    await onUpdateNote(noteContent, id, afterSaving);
    if (goToViewMode) {
      setViewMode("VIEW");
      ToastAndroid.show("Nota actualizada!", ToastAndroid.SHORT);
    }
  };

  const onSaveDelayed = async () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    setTyping(true);
    typingTimeoutRef.current = setTimeout(() => {
      onUpdate(noteId);
    }, 3000);
  };

  const onContentChange = async (field: any, text: string) => {
    setNoteContent((prev: any) => ({
      ...prev,
      [field]: text || "",
    }));
    if (noteId) {
      await onSaveDelayed();
    }
  };

  const onSave = async () => {
    if (noteId) {
      const goToViewMode = true;
      await onUpdate(noteId, goToViewMode);
      return;
    }
    if (!noteContent.title) {
      noteContent.title = defaultTitle;
      // ToastAndroid.show("El titulo es requerido!", ToastAndroid.SHORT);
      // return;
    }

    await onSaveNote(noteContent, () => navigation.navigate(Screens.Notes, { shouldRefresh: true }));
    // setNoteContent({ title: "", content: "" });
    ToastAndroid.show("Nota guardada!", ToastAndroid.SHORT);
  };

  const onEditMode = () => {
    setViewMode("EDIT");
  };

  if (isLoading) {
    return <View style={styles.activiyContainer}>
      <ActivityIndicator style={{ flex: 1 }} />
    </View>
  }

  return (
    <View style={styles.container}>
      <Text style={styles.dateLabel}>
        {formatDateShortDayMonth(
          isNewNote
            ? new Date()
            : ((noteInfo?.updated_at || noteInfo?.created_at) as any)
        )}
      </Text>
      <MyRichEditor
        Textinput={
          <TextInput
            placeholder="Titulo"
            placeholderTextColor={theme.colors.text}
            style={[styles.textInput]}
            multiline
            value={noteContent.title}
            onChangeText={(text: string) => onContentChange("title", text)}
          />
        }
        content={noteContent.content}
        onSetContent={(text: string) => onContentChange("content", text)}
        isViewMode={isView}
      />
      {renderActionButtons()}
    </View>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 5,
      backgroundColor: dark ? colors.background : "#eee",
    },
    dateLabel: {
      textTransform: "uppercase",
      textAlign: "center",
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

export default NoteDetail;
