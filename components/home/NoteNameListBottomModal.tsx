import Icon from "@/components/Icon";
import { GET_ALL_NOTE } from "@/constants/Queries";
import { iconSize } from "@/constants/size";
import { useDBContext } from "@/context/databaseContext";
import { storedData$ } from "@/context/LocalstoreContext";
import { useMyTheme } from "@/context/ThemeContext";
import { bibleState$ } from "@/state/bibleState";
import { TNote, TTheme } from "@/types";
import { formatDateShortDayMonth } from "@/utils/formatDateShortDayMonth";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity
} from "react-native";
import { Text, View } from "../Themed";
import BottomModal from "../BottomModal";

type NoteNameListProps = {
  handleSnapPress?: (index: number) => void;
};

const ITEM_HEIGHT = 70;

const NoteNameListBottomModal: FC<NoteNameListProps> = ({ handleSnapPress }) => {
  const { theme } = useMyTheme();
  const styles = getStyles(theme);
  const { myBibleDB, executeSql } = useDBContext();
  const [data, setData] = useState<TNote[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const fontSize = storedData$.fontSize.get();

  const fetchNotes = useCallback(async () => {
    if (!myBibleDB || !executeSql) return;

    try {
      setLoading(true);
      const notes = await executeSql(GET_ALL_NOTE, []);
      setData(notes || []);
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [myBibleDB, executeSql]);

  useEffect(() => {
    fetchNotes();
    return () => { };
  }, [fetchNotes]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotes();
  }, [fetchNotes]);

  const onSelectNote = useCallback(
    (id: number) => {
      bibleState$.currentNoteId.set(id);
      bibleState$.closeNoteListBottomSheet();
      if (handleSnapPress) {
        handleSnapPress(0); // Close the bottom sheet
      }
    },
    [handleSnapPress]
  );

  const renderItem = useCallback(
    ({ item, index }: any) => {
      const isEven = index % 2 === 0;

      return (
        <View
          style={{
            flexDirection: "row",
            marginVertical: 5,
            backgroundColor: "transparent",
            alignSelf: "center",
          }}
        >
          <TouchableOpacity
            style={[
              styles.card,
              {
                borderLeftColor: theme.colors.primary,
                borderLeftWidth: 3,
              },
            ]}
            activeOpacity={0.7}
            onPress={() => onSelectNote(item.id)}
          >
            <View style={styles.noteContent}>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[styles.noteTitle, { fontSize: fontSize }]}
              >
                {item.title}
              </Text>
              <Text style={styles.noteDate}>
                {formatDateShortDayMonth(item.updated_at || item.created_at)}
              </Text>
            </View>
            <View style={styles.iconContainer}>
              <Icon
                name="NotebookText"
                color={theme.colors.primary}
                size={iconSize - 2}
              />
            </View>
          </TouchableOpacity>
        </View>
      );
    },
    [theme, styles, fontSize, onSelectNote]
  );

  const ListHeaderComponent = useMemo(
    () => (
      <View style={styles.headerContainer}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>Tus Notas</Text>
          <View style={styles.notesCountContainer}>
            <Text style={styles.notesCount}>{data?.length || 0}</Text>
          </View>
        </View>

        <View style={styles.createNoteContainer}>
          <TouchableOpacity
            style={[styles.createNoteCard]}
            activeOpacity={0.7}
            onPress={() => onSelectNote(-1)}
          >
            <Icon
              name="Plus"
              color={theme.colors.notification}
              size={iconSize}
            />
            <View style={styles.createNoteTextContainer}>
              <Text style={styles.createNoteText}>Crear nueva nota</Text>
            </View>
            <Icon
              name="NotebookText"
              color={theme.colors.notification}
              size={iconSize}
            />
          </TouchableOpacity>
        </View>
      </View>
    ),
    [theme, styles, data?.length, onSelectNote]
  );

  const ListEmptyComponent = useMemo(
    () =>
      !loading && (
        <View style={styles.emptyContainer}>
          <Icon
            name="BookOpen"
            color={theme.colors.text + "70"}
            size={iconSize * 2}
          />
          <Text style={styles.emptyText}>No tienes notas todavía</Text>
          <Text style={styles.emptySubtext}>
            Crea una nueva nota para comenzar
          </Text>
        </View>
      ),
    [loading, theme, styles]
  );

  return (
    <BottomModal
      justOneSnap
      showIndicator
      justOneValue={["50%"]}
      startAT={0}
      ref={bibleState$.noteListBottomSheetRef.get()}
    >
      <View style={styles.container}>
        {loading && !data ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.notification} />
            <Text style={styles.loadingText}>Cargando notas...</Text>
          </View>
        ) : (
          <BottomSheetFlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            ListHeaderComponent={ListHeaderComponent}
            ListEmptyComponent={ListEmptyComponent as any}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={onRefresh}
            getItemLayout={(data, index) => ({
              length: ITEM_HEIGHT,
              offset: ITEM_HEIGHT * index,
              index,
            })}
          />
        )}
      </View>
    </BottomModal>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 15,
      backgroundColor: "transparent",
    },
    headerTitleContainer: {
      width: "90%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
      backgroundColor: "transparent",
    },
    notesCountContainer: {
      backgroundColor: colors.notification,
      width: 30,
      height: 30,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 10,
    },
    notesCount: {
      color: "#FFFFFF",
      fontWeight: "bold",
      fontSize: 14,
    },
    listContainer: {
      paddingBottom: 30,
    },
    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 50,
      backgroundColor: "transparent",
    },
    loadingText: {
      marginTop: 10,
      color: colors.text,
      fontSize: 16,
    },
    headerContainer: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
    },
    emptyContainer: {
      padding: 30,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
    },
    emptyText: {
      marginTop: 15,
      color: colors.text,
      fontSize: 18,
      fontWeight: "bold",
    },
    emptySubtext: {
      marginTop: 5,
      color: dark ? colors.text + "90" : colors.text,
      fontSize: 14,
    },
    title: {
      color: dark ? "white" : colors.text,
      fontSize: 20,
      fontWeight: "bold",
      paddingVertical: 10,
      textAlign: "center",
      overflow: "hidden",
    },
    createNoteContainer: {
      flexDirection: "row",
      marginVertical: 15,
      backgroundColor: "transparent",
    },
    createNoteCard: {
      flexDirection: "row",
      width: "90%",
      padding: 15,
      borderRadius: 10,
      backgroundColor: colors.background + 99,
      borderWidth: 1,
      borderColor: colors.notification + 99,
      alignItems: "center",
      justifyContent: "space-between",
    },
    createNoteTextContainer: {
      flex: 1,
      backgroundColor: "transparent",
      alignItems: "center",
    },
    createNoteText: {
      color: colors.notification,
      fontSize: 16,
      fontWeight: "bold",
    },
    card: {
      flexDirection: "row",
      width: "90%",
      padding: 15,
      marginVertical: 3,
      borderRadius: 10,
      backgroundColor: colors.background + "80",
      alignItems: "center",
      justifyContent: "space-between",
    },
    noteContent: {
      flex: 1,
      backgroundColor: "transparent",
    },
    noteTitle: {
      color: colors.text,
      fontWeight: "600",
      marginBottom: 4,
    },
    noteDate: {
      color: colors.text,
      fontSize: 12,
    },
    iconContainer: {
      backgroundColor: "transparent",
      padding: 5,
    },
  });

export default NoteNameListBottomModal;
