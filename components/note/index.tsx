import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useTheme } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import Animation from "components/Animation";
import { Text, View } from "components/Themed";
import { useBibleContext } from "context/BibleContext";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  BackHandler,
  ListRenderItem,
  StyleSheet,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  // View,
} from "react-native";
import MyRichEditor from "screens/RichTextEditor";
import { EViewMode, IVerseItem, TNote, TTheme } from "types";
import { customBorder } from "utils/customStyle";
import removeAccent from "utils/removeAccent";

type TListVerse = {
  data: IVerseItem[] | any;
  setShouldFetch: any;
};

const NoteList = ({ data, setShouldFetch }: TListVerse) => {
  const [filterData, setFilterData] = useState([]);
  const theme = useTheme();
  const navigation = useNavigation();
  const styles = getStyles(theme);
  const flatListRef = useRef<FlashList<any>>(null);
  const notFoundSource = require("../../assets/lottie/notFound.json");
  const [noteContent, setNoteContent] = useState({
    title: "",
    content: "",
  });
  const { title, content } = noteContent;
  const { onSaveNote, onDeleteNote, onUpdateNote } = useBibleContext();
  const [searchText, setSearchText] = useState<any>(null);
  const [openNoteId, setOpenNoteId] = useState<any>(null);
  const [viewMode, setViewMode] = useState<keyof typeof EViewMode>("LIST");
  const isView = viewMode === "VIEW";
  const showExtraButton = ["NEW", "EDIT", "VIEW"].includes(viewMode);
  const noteCountTitle = useMemo(
    () => `${filterData.length} ${filterData.length > 1 ? "Notas" : "Nota"}`,
    [filterData]
  );

  useEffect(() => {
    const currentOpenNote: TNote | any = filterData?.filter(
      (x: any) => x.id === openNoteId
    )?.[0];
    setNoteContent({
      title: currentOpenNote?.title,
      content: currentOpenNote?.note_text,
    });
  }, [openNoteId]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: showExtraButton,
      headerBackVisible: false,
    });
  }, [showExtraButton]);

  useEffect(() => {
    const backAction = () => {
      if (showExtraButton) setViewMode("LIST");
      return showExtraButton;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [showExtraButton]);

  useEffect(() => {
    if (!data) return;
    setFilterData(data);
  }, [data]);

  const onOpenOrCloseNote = () => {
    if (viewMode === "LIST") {
      setOpenNoteId(null);
      setNoteContent({ title: "", content: "" });
      setViewMode("NEW");
      return;
    }
    setNoteContent({ title: "", content: "" });
    setOpenNoteId(null);
    setViewMode("LIST");
  };

  const onUpdate = async (id: number) => {
    await onUpdateNote(noteContent, id, onOpenOrCloseNote);
    setShouldFetch((prev: any) => !prev);
    ToastAndroid.show("Nota actualizada!", ToastAndroid.SHORT);
  };

  const onSave = async () => {
    if (openNoteId) {
      await onUpdate(openNoteId);
      return;
    }
    if (!noteContent.title) {
      ToastAndroid.show("El titulo es requerido!", ToastAndroid.SHORT);
      return;
    }
    await onSaveNote(noteContent, onOpenOrCloseNote);
    setNoteContent({ title: "", content: "" });
    ToastAndroid.show("Nota guardada!", ToastAndroid.SHORT);
    setShouldFetch((prev: any) => !prev);
  };

  const onDelete = async (id: number) => {
    await onDeleteNote(id);
    setShouldFetch((prev: any) => !prev);
    ToastAndroid.show("Nota borrada!", ToastAndroid.SHORT);
    setSearchText("");
  };

  const warnBeforeDelete = (id: number) => {
    Alert.alert(
      "Eliminar Nota",
      "¿Estás seguro que quieres eliminar esta nota?",
      [
        {
          text: "Cancelar",
          onPress: () => {},
          style: "cancel",
        },
        { text: "Eliminar", onPress: () => onDelete(id) },
      ]
    );
  };

  const onViewMode = (id: number) => {
    setOpenNoteId(id);
    setSearchText("");
    setViewMode("VIEW");
  };

  const renderItem: ListRenderItem<TNote & { id: number }> = ({ item }) => {
    return (
      <TouchableOpacity
        style={{ backgroundColor: "transparent" }}
        activeOpacity={0.9}
        onPress={() => onViewMode(item.id)}
      >
        <View style={[styles.cardContainer]}>
          <View style={[styles.headerContainer]}>
            <Text style={[styles.cardTitle]}>{item.title}</Text>
            <View style={[styles.verseAction]}>
              <>
                <MaterialCommunityIcons
                  size={20}
                  name="eye"
                  style={styles.icon}
                  onPress={() => onViewMode(item.id)}
                />
                <MaterialCommunityIcons
                  size={20}
                  name="delete"
                  style={[styles.icon]}
                  onPress={() => warnBeforeDelete(item.id)}
                />
              </>
            </View>
          </View>
          <Text style={styles.verseBody}>
            {item?.note_text
              ?.slice(0, 100)
              .replace(/<br>/gi, "-")
              .replace(/<.*?>|<.*?\/>/gi, "")}
          </Text>
          <Text style={[styles.date]}>{item.created_at.split(" ")[0]}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const NoteHeader = () => {
    return (
      <View style={[styles.noteHeader]}>
        <Text style={[styles.noteListTitle]}>Mis Notas</Text>
        <Text
          style={[
            styles.noteHeaderSubtitle,
            !filterData.length && { display: "none" },
          ]}
        >
          {noteCountTitle}
        </Text>
        <View style={styles.searchContainer}>
          <Ionicons
            style={styles.searchIcon}
            name="search"
            size={24}
            color={theme.colors.notification}
          />
          <TextInput
            placeholder="Buscar en tus notas..."
            style={[styles.noteHeaderSearchInput]}
            onChangeText={(text) => setSearchText(text)}
            value={searchText}
          />
        </View>
      </View>
    );
  };

  const onEditMode = () => {
    setViewMode("EDIT");
  };

  const renderActionButtons = () => {
    return (
      <>
        <TouchableOpacity
          style={[
            styles.scrollToTopButton,
            {
              backgroundColor: theme.colors.background,
              padding: 0,
              borderWidth: 1,
              borderColor: theme.colors.notification,
            },
          ]}
          onPress={onOpenOrCloseNote}
        >
          <MaterialCommunityIcons
            style={[
              {
                color: theme.colors.text,
                fontWeight: "bold",
                padding: 10,
                borderRadius: 10,
                backgroundColor: theme.colors.notification + "99",
              },
            ]}
            name={showExtraButton ? "close" : "plus"}
            size={30}
          />
        </TouchableOpacity>
        {showExtraButton && (
          <TouchableOpacity
            style={[styles.scrollToTopButton, { bottom: 85 }]}
            onPress={isView ? onEditMode : onSave}
          >
            <MaterialCommunityIcons
              style={{ color: theme.colors.card, fontWeight: "bold" }}
              name={isView ? "pencil" : "content-save"}
              size={30}
            />
          </TouchableOpacity>
        )}
      </>
    );
  };

  return (
    <View
      style={{
        flex: 1,
        padding: 5,
        backgroundColor: theme.dark ? theme.colors.background : "#eee",
      }}
    >
      {showExtraButton ? (
        <>
          {isView && (
            <Text
              style={{
                color: theme.colors.notification,
                fontSize: 22,
                paddingVertical: 5,
                paddingLeft: 5,
                fontWeight: "bold",
                textDecorationLine: "underline",
              }}
            >
              {title}
            </Text>
          )}
          <MyRichEditor
            Textinput={
              <TextInput
                placeholder="Escribe el titulo"
                placeholderTextColor={theme.colors.text}
                style={[styles.textInput]}
                multiline
                value={title}
                onChangeText={(text) =>
                  setNoteContent((prev) => ({ ...prev, title: text }))
                }
              />
            }
            content={content}
            setContent={setNoteContent}
            viewMode={viewMode}
          />
        </>
      ) : (
        <>
          {NoteHeader()}
          <FlashList
            contentContainerStyle={{
              backgroundColor: theme.dark ? theme.colors.background : "#eee",
              // backgroundColor: theme.colors.background,
              paddingVertical: 20,
            }}
            ref={flatListRef}
            // ListHeaderComponent={NoteHeader}
            decelerationRate={"normal"}
            estimatedItemSize={135}
            data={
              searchText
                ? filterData.filter(
                    (x: any) =>
                      removeAccent(x.title).indexOf(
                        searchText.toLowerCase()
                      ) !== -1 ||
                      removeAccent(x.note_text).indexOf(
                        searchText.toLowerCase()
                      ) !== -1
                  )
                : filterData
            }
            // data={filterData}
            renderItem={renderItem as any}
            // onScroll={handleScroll}
            keyExtractor={(item: any, index: any) => `note-${index}`}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              <View style={[styles.noResultsContainer]}>
                <Animation
                  backgroundColor={theme.colors.background}
                  source={notFoundSource}
                  loop={false}
                />
                <Text style={styles.noResultsText}>No tienes notas</Text>
              </View>
            }
          />
        </>
      )}
      {renderActionButtons()}
    </View>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
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
      backgroundColor: colors.notification,
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
      borderWidth: 0.2,
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
    },
    noResultsText: {
      fontSize: 18,
      color: colors.text,
    },
    verseAction: {
      flexDirection: "row",
      backgroundColor: "transparent",
    },
    icon: {
      fontWeight: "700",
      marginHorizontal: 10,
      color: colors.primary,
      fontSize: 24,
    },
  });

export default NoteList;
