import { useTheme } from "@react-navigation/native";
import Icon from "components/Icon";
import { View } from "components/Themed";
import { GET_NOTE_BY_ID } from "constants/Queries";
import { useBibleContext } from "context/BibleContext";
import { useDBContext } from "context/databaseContext";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
} from "react-native";
import { EViewMode, RootStackScreenProps, TNote, TTheme } from "types";
import MyRichEditor from "./RichTextEditor";

const NoteDetail: React.FC<RootStackScreenProps<"NoteDetail">> = ({
  route,
  navigation,
}) => {
  const defaultTitle = "Sin titulo 🖋️";
  const { noteId } = route.params as any;

  const theme = useTheme();
  const typingTimeoutRef = useRef<any>(null);
  const [noteInfo, setNoteInfo] = useState<TNote | any>({});
  const [viewMode, setViewMode] = useState<keyof typeof EViewMode>("VIEW");
  const [isTyping, setTyping] = useState(false);
  const [noteContent, setNoteContent] = useState({
    title: defaultTitle,
    content: "",
  });

  const styles = getStyles(theme);
  const isView = viewMode === "VIEW";
  const showExtraButton = ["NEW", "EDIT", "VIEW"].includes(viewMode);

  const { myBibleDB, executeSql } = useDBContext();
  const { onSaveNote, onUpdateNote, addToNoteText, onAddToNote } =
    useBibleContext();

  useEffect(() => {
    if (noteId === undefined || noteId === null) return;
    const getNoteById = async () => {
      if (!myBibleDB || !executeSql) return;
      const note = await executeSql(myBibleDB, GET_NOTE_BY_ID, [noteId]);
      setNoteInfo(note[0] as TNote);
    };

    getNoteById();
    return () => {};
  }, [noteId]);

  useEffect(() => {
    addTextToNote(noteInfo);
    navigation.setOptions({ headerTitle: noteInfo?.title });
  }, [noteInfo]);

  const addTextToNote = (selectedNote: TNote | null) => {
    const contentToAdd = `<br> <div>${addToNoteText}</div><br>`;
    const myContent = `${selectedNote?.note_text || ""} ${contentToAdd} `;
    setNoteContent({
      title: selectedNote?.title || defaultTitle,
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
      [field]: text ?? "",
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
      ToastAndroid.show("El titulo es requerido!", ToastAndroid.SHORT);
      return;
    }
    await onSaveNote(noteContent, () => console.log("onOpenOrCloseNote"));
    // setNoteContent({ title: "", content: "" });
    ToastAndroid.show("Nota guardada!", ToastAndroid.SHORT);
  };

  const onEditMode = () => {
    setViewMode("EDIT");
  };

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
  }, [isTyping, isView, showExtraButton]);

  return (
    <View style={styles.container}>
      <MyRichEditor
        Textinput={
          <TextInput
            placeholder="Escribe el titulo"
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
    verseBody: {
      color: colors.text,
      backgroundColor: "transparent",
    },
    date: {
      color: colors.notification,
      textAlign: "right",
      marginTop: 10,
    },
    textInput: {
      padding: 10,
      fontSize: 22,
      color: colors.text,
      marginVertical: 5,
      textDecorationStyle: "solid",
      textDecorationColor: "red",
      textDecorationLine: "underline",
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
