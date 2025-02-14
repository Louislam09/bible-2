import Animation from "@/components/Animation";
import Icon from "@/components/Icon";
import { Text, View } from "@/components/Themed";
import { headerIconSize } from "@/constants/size";
import { useBibleContext } from "@/context/BibleContext";
import useNotesExportImport from "@/hooks/useNotesExportImport";
import { IVerseItem, Screens, TNote, TTheme } from "@/types";
import removeAccent from "@/utils/removeAccent";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@react-navigation/native";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { format } from "date-fns";
import { Stack, useNavigation } from "expo-router";
import { Download, NotebookText, Trash2 } from "lucide-react-native";
import React, {
  Fragment,
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
  Keyboard,
  StyleSheet,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { singleScreenHeader } from "../common/singleScreenHeader";

type TListVerse = {
  data: IVerseItem[] | any;
  setShouldFetch: any;
};
interface ActionButtonProps {
  item: {
    bottom: number;
    name: string;
    color: string;
    action: () => void;
  };
  index: number;
  styles: any;
  theme: any;
}

const ActionButton = ({ item, index, styles, theme }: ActionButtonProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 500,
        delay: index * 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, translateYAnim, index]);

  return (
    <Animated.View
      key={`button-${item.name}`}
      style={[
        styles.scrollToTopButton,
        {
          bottom: item.bottom,
          backgroundColor: item.color,
          opacity: fadeAnim,
          transform: [{ translateY: translateYAnim }],
        },
      ]}
    >
      <TouchableOpacity onPress={item.action}>
        <Icon
          style={[{}]}
          color={theme.colors.text}
          name={item.name as any}
          size={30}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const Note = ({ data, setShouldFetch }: TListVerse) => {
  const theme = useTheme();
  const navigation = useNavigation();
  const {
    onDeleteNote,
    onDeleteAllNotes,
    addToNoteText,
    currentBibleLongName,
  } = useBibleContext();
  const { exportNotes, importNotes, error, isLoading } = useNotesExportImport();

  const styles = getStyles(theme);
  const notFoundSource = require("../../assets/lottie/notFound.json");

  const [filterData, setFilterData] = useState([]);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [searchText, setSearchText] = useState<any>(null);
  const flatListRef = useRef<FlashList<any>>(null);

  const noteCountTitle = useMemo(
    () => `${filterData.length} ${filterData.length > 1 ? "Notas" : "Nota"}`,
    [filterData]
  );

  const noteList = useMemo(() => {
    return searchText
      ? filterData.filter(
          (x: any) =>
            removeAccent(x.title).indexOf(searchText.toLowerCase()) !== -1 ||
            removeAccent(x.note_text).indexOf(searchText.toLowerCase()) !== -1
        )
      : filterData;
  }, [searchText, filterData]);

  useEffect(() => {
    if (!data) return;
    if (addToNoteText) showAddNoteAlert();
  }, [addToNoteText, data]);

  useEffect(() => {
    if (!data) return;
    setFilterData(data);
  }, [data]);

  const showAddNoteAlert = () => {
    ToastAndroid.show(
      "Seleccione la nota a la que quieres añadir el versiculo",
      ToastAndroid.LONG
    );
  };

  const onCreateNewNote = () => {
    navigation.navigate(Screens.NoteDetail, { noteId: null, isNewNote: true });
  };

  const onDelete = async (id: number) => {
    closeCurrentSwiped(id);
    setTimeout(async () => {
      await onDeleteNote(id);
      setShouldFetch((prev: any) => !prev);
      ToastAndroid.show("Nota borrada!", ToastAndroid.SHORT);
      setSearchText("");
    }, 300);
  };

  const onDeleteAll = async () => {
    await onDeleteAllNotes();
    setShouldFetch((prev: any) => !prev);
    ToastAndroid.show("Todas las notas han sido borradas!", ToastAndroid.SHORT);
    setSearchText("");
  };

  const closeCurrentSwiped = (id: number) => {
    const swipeable = swipeableRefs.current.get(id);
    swipeable?.close();
  };

  const warnBeforeDelete = (id: number) => {
    Alert.alert(
      "Eliminar Nota",
      "¿Estás seguro que quieres eliminar esta nota?",
      [
        {
          text: "Cancelar",
          onPress: () => closeCurrentSwiped(id),
          style: "cancel",
        },
        { text: "Eliminar", onPress: () => onDelete(id) },
      ]
    );
  };
  const warnBeforeExporting = (id: number) => {
    Alert.alert(
      "Exportar Nota",
      "¿Estás seguro que quieres exportar esta nota?",
      [
        {
          text: "Cancelar",
          onPress: () => closeCurrentSwiped(id),
          style: "cancel",
        },
        {
          text: "Exportar",
          onPress: () => {
            exportNotes(id);
            closeCurrentSwiped(id);
          },
        },
      ]
    );
  };

  const warnBeforeDeleteAll = () => {
    Alert.alert(
      "Eliminar Todas las Notas",
      "¿Estás seguro que quieres eliminar todas las notas?",
      [
        {
          text: "Cancelar",
          onPress: () => {},
          style: "cancel",
        },
        { text: "Eliminar", onPress: () => onDeleteAll() },
      ]
    );
  };

  const onOpenNoteDetail = useCallback((id: number) => {
    navigation.navigate(Screens.NoteDetail, { noteId: id, isNewNote: false });
  }, []);

  const NoteHero = () => {
    return (
      <View style={[styles.noteHeader]}>
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

  const ListEmptyComponent = () => {
    return (
      <View style={[styles.noResultsContainer]}>
        <Animation
          backgroundColor={theme.colors.background}
          source={notFoundSource}
          loop={false}
        />
        <Text style={styles.noResultsText}>
          <Text style={{ color: theme.colors.notification }}>
            ({currentBibleLongName})
          </Text>{" "}
          {"\n"}
          No tienes notas en esta version de la escritura.
        </Text>
      </View>
    );
  };

  const onImportNotes = async () => {
    await importNotes();
    setShouldFetch((prev: any) => !prev);
  };

  const showMoreOptionHandle = () => {
    setShowMoreOptions((prev) => !prev);
  };

  const dismiss = () => {
    Keyboard.dismiss();
    setShowMoreOptions(false);
  };

  const actionButtons = useMemo(
    () =>
      [
        {
          bottom: 25,
          name: "Plus",
          color: theme.colors.notification,
          action: onCreateNewNote,
          hide: false,
        },
        {
          bottom: 90,
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
        },
        {
          bottom: 155,
          name: "Share",
          color: "#45a049",
          action: exportNotes,
          hide: !showMoreOptions,
        },
      ].filter((item) => !item.hide),
    [showMoreOptions]
  );

  const swipeableRefs = useRef<Map<number, Swipeable | null>>(new Map());
  const openSwipeableId = useRef<number | null>(null);

  const handleSwipeableOpen = (id: number) => {
    if (openSwipeableId.current && openSwipeableId.current !== id) {
      swipeableRefs.current.get(openSwipeableId.current)?.close();
    }
    openSwipeableId.current = id;
  };

  const swipeAction = {
    right: warnBeforeDelete,
    left: warnBeforeExporting,
  };
  const onSwipeableWillOpen = (direction: "left" | "right", item: TNote) => {
    swipeAction[direction](item.id);
  };
  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
    item: any
  ) => {
    const translateX = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [0, 80],
      extrapolate: "clamp",
    });

    return (
      <Animated.View
        style={{
          transform: [{ translateX }],
          backgroundColor: "#dc2626",
        }}
      >
        <TouchableOpacity
          style={[styles.renderActionButton, { backgroundColor: "#dc2626" }]}
        >
          <Trash2 size={headerIconSize} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    );
  };
  const renderLeftActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
    item: any
  ) => {
    const translateX = dragX.interpolate({
      inputRange: [0, 80],
      outputRange: [-80, 0],
      extrapolate: "clamp",
    });

    return (
      <Animated.View
        style={{
          transform: [{ translateX }],
          backgroundColor: "#008CBA",
        }}
      >
        <TouchableOpacity
          style={[styles.renderActionButton, { backgroundColor: "#008CBA" }]}
        >
          <Download size={headerIconSize} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    );
  };
  const RenderItem: ListRenderItem<TNote> = ({ item }) => {
    return (
      <Swipeable
        ref={(ref) => swipeableRefs.current.set(item.id, ref)}
        friction={0.6}
        rightThreshold={100}
        leftThreshold={100}
        onSwipeableWillOpen={(direction) =>
          onSwipeableWillOpen(direction, item)
        }
        onSwipeableOpenStartDrag={(direction) => handleSwipeableOpen(item.id)}
        renderRightActions={(progress, dragX) =>
          renderRightActions(progress, dragX, item)
        }
        renderLeftActions={(progress, dragX) =>
          renderLeftActions(progress, dragX, item)
        }
      >
        <TouchableOpacity
          style={styles.verseContainer}
          activeOpacity={0.9}
          onPress={() => onOpenNoteDetail(item.id)}
        >
          <View style={styles.verseItem}>
            <View style={styles.verseBody}>
              <Text
                ellipsizeMode="tail"
                numberOfLines={1}
                style={styles.verseText}
              >
                {item.title}
              </Text>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
              >
                <Icon
                  name="CalendarDays"
                  size={18}
                  color={theme.colors.notification}
                />
                <Text style={styles.verseDate}>
                  {format(
                    new Date(item.updated_at || item.created_at),
                    "MMM dd, yyyy - hh:mm a"
                  )}
                </Text>
              </View>
            </View>
            <View
              style={{
                backgroundColor: "transparent",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <NotebookText size={50} color={theme.colors.text} />
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  if (isLoading)
    return (
      <View>
        <ActivityIndicator />
      </View>
    );

  return (
    <Fragment>
      <Stack.Screen
        options={{
          ...singleScreenHeader({
            theme,
            title: "Mis Notas",
            titleIcon: "NotebookPen",
            headerRightProps: {
              headerRightIconColor: "red",
              headerRightText: `${(noteList || []).length} 📝`,
              onPress: () => console.log(),
              disabled: true,
              style: { opacity: 1 },
            },
          }),
        }}
      />
      <TouchableWithoutFeedback
        key={theme.dark + ""}
        style={{ flex: 1 }}
        onPress={dismiss}
      >
        <View
          style={{
            flex: 1,
            padding: 5,
            backgroundColor: theme.dark ? theme.colors.background : "#eee",
          }}
        >
          {NoteHero()}
          {error && <Text style={styles.textError}>{error}</Text>}
          <FlashList
            contentContainerStyle={{ backgroundColor: theme.colors.background }}
            ref={flatListRef}
            decelerationRate={"normal"}
            estimatedItemSize={135}
            data={noteList}
            renderItem={RenderItem as any}
            keyExtractor={(item: any, index: any) =>
              `note-${item?.id}:${index}`
            }
            ListEmptyComponent={ListEmptyComponent}
            ListFooterComponent={
              <View
                style={{
                  paddingVertical: 30,
                  backgroundColor: theme.colors.background,
                }}
              />
            }
          />
          {actionButtons.map((item, index) => (
            <ActionButton
              key={index}
              theme={theme}
              styles={styles}
              item={item}
              index={index}
            />
          ))}
        </View>
      </TouchableWithoutFeedback>
    </Fragment>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    contentContainerStyle: {
      backgroundColor: dark ? colors.background : "#eee",
      paddingVertical: 20,
    },
    textError: { textAlign: "center", color: "#e74856" },

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
      right: 20,
      backgroundColor: colors.notification + 99,
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
      // marginTop: 40,
      backgroundColor: "transparent",
    },
    noteListTitle: {
      fontSize: 30,
      // marginVertical: 10,
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
      // marginVertical: 20,
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
      backgroundColor: colors.background,
      padding: 15,
      borderColor: "#a29f9f",
      borderTopWidth: 0.3,
      borderBottomWidth: 0.3,
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
      backgroundColor: "#a29f9f",
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

    // verseee
    verseContainer: {
      borderColor: "#a29f9f",
      borderTopWidth: 0.3,
      borderBottomWidth: 0.3,
      backgroundColor: colors.background,
      paddingVertical: 10,
    },
    verseItem: {
      flex: 1,
      alignItems: "flex-start",
      justifyContent: "space-between",
      flexDirection: "row",
      padding: 10,
    },
    verseBody: {
      flex: 1,
      height: "100%",
      alignItems: "flex-start",
      justifyContent: "space-around",
    },
    verseText: {
      fontSize: 18,
    },
    verseDate: {
      fontSize: 18,
      color: colors.text,
      opacity: 0.7,
    },
    renderActionButton: {
      justifyContent: "center",
      alignItems: "center",
      width: 80,
      height: "100%",
      // borderRadius: 10,
    },
    deleteButtonText: {
      color: "white",
      fontWeight: "bold",
    },
  });

export default Note;
