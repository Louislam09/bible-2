import DecoratorLine from "components/DecoratorLine";
import Icon from "components/Icon";
import { GET_ALL_NOTE, GET_ALL_NOTE_NAME } from "constants/Queries";
import { iconSize } from "constants/size";
import { useDBContext } from "context/databaseContext";
import React, { FC, useEffect, useState } from "react";
import { Platform, StyleSheet, TouchableOpacity } from "react-native";
import { TNote, TTheme } from "types";
import { Text, View } from "../Themed";
import { useStorage } from "context/LocalstoreContext";
import { formatDateShortDayMonth } from "utils/formatDateShortDayMonth";
import { useBibleContext } from "context/BibleContext";

type NoteNameListProps = {
  theme: TTheme;
}

const NoteNameList: FC<NoteNameListProps> = ({ theme }) => {
  const styles = getStyles(theme);
  const { myBibleDB, executeSql } = useDBContext();
  const { setCurrentNoteId, noteListDismissModalPress } = useBibleContext()
  const [data, setData] = useState<TNote[] | any>(null);
  const {
    storedData: { fontSize },
  } = useStorage();

  useEffect(() => {
    if (!myBibleDB || !executeSql) return;
    const getNotes = async () => {
      const notes = await executeSql(myBibleDB, GET_ALL_NOTE, []);
      setData(notes || []);
    };
    getNotes();

    return () => { };
  }, [myBibleDB, executeSql]);

  const onItem = (id: number) => {
    setCurrentNoteId(id)
    noteListDismissModalPress()
  }

  return (
    <View style={[styles.versionContainer]}>
      <Text
        style={[
          styles.title,
          {
            textTransform: "capitalize",
            paddingVertical: 5,
            fontWeight: "bold",
          },
        ]}
      >
        Tus Notas
      </Text>
      <View
        style={{
          flexDirection: "row",
          marginVertical: 5,
          backgroundColor: "transparent",
        }}
      >
        <DecoratorLine theme={theme} color={theme.colors.text} />
        <TouchableOpacity
          style={[styles.card, { borderColor: theme.colors.text, borderRadius: 0 }]}
          onPress={() => onItem(-1)}
        >
          <Icon name='NotebookText' color={theme.colors.text} size={iconSize} />
          <View style={{ backgroundColor: "transparent", flex: 1 }}>
            <Text
              style={[
                styles.versionText,
                { color: theme.colors.text, fontSize, textAlign: 'center', fontWeight: 'bold' },
              ]}
            >
              Crea una nueva nota
            </Text>
          </View>
          <Icon name='NotebookText' color={theme.colors.text} size={iconSize} />
        </TouchableOpacity>
        <DecoratorLine theme={theme} color={theme.colors.text} />
      </View >
      {data?.map((note: any) => (
        <View
          key={note?.id}
          style={{
            flexDirection: "row",
            marginVertical: 5,
            backgroundColor: "transparent",
          }}
        >
          <DecoratorLine theme={theme} />
          <TouchableOpacity
            style={[styles.card, { borderRadius: 0 }]}
            onPress={() => onItem(note?.id)}
          >
            <View style={{ backgroundColor: "transparent", flex: 1 }}>
              <Text
                style={[
                  styles.versionText,
                  { color: theme.colors.notification, fontSize },
                ]}
              >
                {note.title}
              </Text>
              <Text style={[styles.versionText, {}]}>
                {formatDateShortDayMonth(note.updated_at || note.created_at)}
              </Text>
            </View>
            <Icon name='NotebookText' color={theme.colors.text} size={iconSize} />
          </TouchableOpacity>
        </View >
      ))
      }
    </View >
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    plusNote: {
      backgroundColor: colors.notification,
      paddingVertical: 5,
    },
    listHeader: {
      width: "90%",
      backgroundColor: 'transparent',
      flexDirection: 'row',
      marginBottom: 5,
      alignItems: 'center',
      gap: 4
    },
    title: {
      color: "white",
      fontSize: 20,
      padding: 0,
      width: "93%",
      textAlign: "center",
      backgroundColor: colors.notification,
    },
    versionContainer: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 25,
      borderRadius: 45,
      backgroundColor: "transparent",
    },
    card: {
      display: "flex",
      flexDirection: "row",
      width: "90%",
      padding: 5,
      elevation: 5,
      ...Platform.select({
        ios: {
          shadowColor: "black",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        },
      }),
      paddingVertical: 10,
      paddingLeft: 10,
      borderColor: colors.notification + "50",
      backgroundColor: dark ? colors.background : "white",
      borderWidth: dark ? 1 : 0,
      shadowColor: colors.notification,
      shadowOpacity: 1,
      shadowRadius: 10,
      borderRadius: 10,
      alignItems: "center",
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
    },
    icon: {
      fontWeight: "700",
      marginHorizontal: 10,
      color: colors.notification + "90",
      fontSize: 28,
    },
    versionText: {
      color: colors.text,
    },
  });

export default NoteNameList;
