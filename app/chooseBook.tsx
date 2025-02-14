import Icon from "@/components/Icon";
import { Text, View } from "@/components/Themed";
import { DB_BOOK_NAMES } from "@/constants/BookNames";
import { useBibleContext } from "@/context/BibleContext";
import { useStorage } from "@/context/LocalstoreContext";
import useParams from "@/hooks/useParams";
import {
  BookIndexes,
  ChooseChapterNumberParams,
  IDBBookNames,
  Screens,
  TTheme,
} from "@/types";
import { renameLongBookName } from "@/utils/extractVersesInfo";
import removeAccent from "@/utils/removeAccent";
import { useTheme } from "@react-navigation/native";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { Stack, useNavigation } from "expo-router";
import React, { Fragment, useCallback, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";

type ChooseBookProps = {};

const ChooseBook: React.FC<ChooseBookProps> = () => {
  const navigation = useNavigation();
  const routeParam = useParams<ChooseChapterNumberParams>();
  const {
    saveData,
    storedData: { isShowName },
  } = useStorage();
  const { book } = routeParam;
  const theme = useTheme();
  const styles = getStyles(theme);
  const {
    viewLayoutGrid,
    toggleViewLayoutGrid,
    isBottomSideSearching,
    orientation,
  } = useBibleContext();
  const isPortrait = orientation === "PORTRAIT";

  const title: { [key: string]: string } = {
    Gn: "Antiguo Pacto",
    Mt: "Nuevo Pacto",
  };

  const handlePress = (item: IDBBookNames) => {
    const topSide: any = { book: item.longName };
    const bottomSide: any = { bottomSideBook: item.longName };
    const params = isBottomSideSearching ? bottomSide : topSide;
    navigation.navigate(Screens.ChooseChapterNumber, {
      ...routeParam,
      ...params,
    });
  };

  const handleLongPress = () => {
    saveData({ isShowName: !isShowName });
  };

  const renderItem: ListRenderItem<IDBBookNames> = ({ item, index }) => {
    const isCurrent = book === item.longName;
    const isNewVow = index >= BookIndexes.Malaquias;
    return (
      <TouchableOpacity
        style={[
          styles.listItem,
          isCurrent && { backgroundColor: theme.colors.notification + "60" },
          isNewVow && { backgroundColor: theme.colors.text + 20 },
          !isShowName && { justifyContent: "center", height: "auto" },
        ]}
        onPress={() => handlePress(item)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.listTitle,
            { color: theme.dark ? item.bookColor : "" },
          ]}
        >
          {viewLayoutGrid
            ? item.longName.replace(/\s+/g, "").slice(0, 3)
            : renameLongBookName(item.longName)}
        </Text>
        {isShowName && viewLayoutGrid && (
          <Text
            numberOfLines={1}
            ellipsizeMode="middle"
            style={styles.subTitle}
          >
            {renameLongBookName(item.longName)}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Fragment>
      <Stack.Screen
        options={{
          headerShown: true,
          headerRight: () => (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity onPress={() => toggleViewLayoutGrid()}>
                <Icon
                  style={styles.icon}
                  name={!viewLayoutGrid ? "LayoutGrid" : "List"}
                  size={24}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleLongPress()}>
                <Icon
                  style={styles.icon}
                  color={
                    isShowName ? theme.colors.notification : theme.colors.text
                  }
                  name={"ChartNoAxesGantt"}
                  size={24}
                />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.listWrapper}>
          <Text style={styles.sectionTitle}>{title.Gn}</Text>
          <FlashList
            contentContainerStyle={styles.flatContainer}
            keyExtractor={(item, index) => `book-${index}`}
            data={DB_BOOK_NAMES.slice(0, BookIndexes.Malaquias)} // Old Testament Books
            renderItem={renderItem}
            estimatedItemSize={47}
            numColumns={viewLayoutGrid ? (isShowName ? 4 : 5) : 1}
          />
          <Text style={styles.sectionTitle}>{title.Mt}</Text>
          <FlashList
            contentContainerStyle={styles.flatContainer}
            keyExtractor={(item, index) => `book-${index}`}
            data={DB_BOOK_NAMES.slice(BookIndexes.Malaquias)} // New Testament Books
            renderItem={renderItem}
            estimatedItemSize={47}
            numColumns={viewLayoutGrid ? (isShowName ? 4 : 5) : 1}
          />
        </View>
      </ScrollView>
    </Fragment>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    scrollContainer: {
      flexGrow: 1,
      paddingBottom: 20,
      backgroundColor: colors.background,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: "bold",
      textAlign: "center",
      marginVertical: 5,
      color: colors.notification,
      backgroundColor: colors.background,
      padding: 15,
      width: "100%",
    },
    container: {
      flex: 1,
      position: "relative",
      alignItems: "flex-start",
      width: "100%",
      backgroundColor: dark ? colors.background : colors.text + 20,
    },
    listWrapper: {
      display: "flex",
      flex: 1,
      width: "100%",
      height: "100%",
    },
    bookImage: {
      resizeMode: "contain",
      position: "relative",
      width: 200,
      height: 200,
    },
    flatContainer: {
      backgroundColor: colors.background,
    },
    listItem: {
      display: "flex",
      borderStyle: "solid",
      borderWidth: 1,
      borderColor: colors.text + 10,
      padding: 10,
      flex: 1,
      height: 70,
      alignItems: "center",
    },
    listViewItem: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderStyle: "solid",
      borderWidth: 0.19,
      borderColor: "#4a4949",

      borderLeftWidth: 0,
      borderRightWidth: 0,
      padding: 15,
      flex: 1,
    },
    listViewTitle: {
      fontSize: 20,
      marginVertical: 10,
      paddingLeft: 15,
      color: colors.notification,
      textAlign: "center",
    },
    listTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "bold",
    },
    subTitle: {
      fontSize: 14,
      color: colors.text,
      opacity: 0.9,
    },
    listChapterTitle: {
      color: colors.notification,
      padding: 20,
      paddingBottom: 0,
      fontSize: 20,
    },
    icon: {
      fontWeight: "900",
      color: colors.text,
      marginHorizontal: 10,
    },
  });

export default ChooseBook;
