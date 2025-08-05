import Icon from "@/components/Icon";
import MyRichEditor from "@/components/RichTextEditor";
import { Text, View } from "@/components/Themed";
import { GET_NOTE_BY_ID } from "@/constants/Queries";
import { useDBContext } from "@/context/databaseContext";
import useDebounce from "@/hooks/useDebounce";
import { useNoteService } from "@/services/noteService";
import { bibleState$ } from "@/state/bibleState";
import { EViewMode, TNote, TTheme } from "@/types";
import { formatDateShortDayMonth } from "@/utils/formatDateShortDayMonth";
import { use$ } from "@legendapp/state/react";
import { useTheme } from "@/context/ThemeContext";
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
  Easing,
  Keyboard,
  StyleSheet,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
} from "react-native";

const CurrentNoteDetail: React.FC<any> = ({}) => {
  const { theme } = useTheme();
  const { myBibleDB, executeSql } = useDBContext();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const { createNote, updateNote } = useNoteService();

  const selectedVerseForNote = use$(() =>
    bibleState$.selectedVerseForNote.get()
  );

  const currentNoteId = bibleState$.currentNoteId.get();
  const [noteId, setNoteId] = useState(currentNoteId);
  const [isNewNote, setNewNote] = useState(noteId === -1);
  const rotation = useRef(new Animated.Value(0)).current;
  const typingTimeoutRef = useRef<any>(null);
  const [isLoading, setLoading] = useState(true);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
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

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

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
        Alert.alert(
          "Error",
          "No se pudo cargar la nota. Por favor, inténtelo de nuevo."
        );
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
      Alert.alert("Error", "No se pudo guardar la nota.");
    }
  }, [noteContent, noteId]);

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
          <Animated.View style={{ transform: [{ rotate }] }}>
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
    const contentToAdd = selectedVerseForNote
      ? `<br> <div>${selectedVerseForNote}</div><br>`
      : "";
    const myContent = `${noteInfo?.note_text || ""} ${contentToAdd}`;
    setNoteContent({
      title: noteInfo?.title || "",
      content: !noteInfo && !selectedVerseForNote ? "" : myContent,
    });
    bibleState$.clearSelectedVerseForNote();
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

    setNoteContent((prev: any) => ({
      ...prev,
      [field]: text || "",
    }));
  };

  const onEditMode = () => {
    setViewMode("EDIT");
  };

  if (isLoading) {
    return (
      <View style={styles.activiyContainer}>
        <ActivityIndicator style={{ flex: 1 }} />
      </View>
    );
  }

  return (
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
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 5,
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
      bottom: 15,
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

export default CurrentNoteDetail;
