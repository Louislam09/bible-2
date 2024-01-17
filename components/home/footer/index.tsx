import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import {
  ParamListBase,
  RouteProp,
  useNavigation,
  useRoute,
  useTheme,
} from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import BottomModal from "components/BottomModal";
import { useBibleContext } from "context/BibleContext";
import React, { FC, useCallback, useMemo, useRef } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import {
  DB_BOOK_CHAPTER_NUMBER,
  DB_BOOK_NAMES,
} from "../../../constants/BookNames";
import { EThemes, HomeParams, Screens, TTheme } from "../../../types";
import { Text, View } from "../../Themed";
interface FooterInterface {}

const CustomFooter: FC<FooterInterface> = () => {
  const { selectTheme } = useBibleContext();
  const theme = useTheme();
  const styles = getStyles(theme);
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ParamListBase>>();
  const { book, chapter = 1 } = route.params as HomeParams;
  const { bookNumber, shortName } =
    DB_BOOK_NAMES.find((x) => x.longName === book) || {};
  const bookIndex = DB_BOOK_NAMES.findIndex((x) => x.longName === book);
  const footerIconSize = 28;
  const snapPoints = useMemo(() => ["25%", "50%"], []);

  const themeRef = useRef<BottomSheetModal>(null);

  const themeHandlePresentModalPress = useCallback(() => {
    themeRef.current?.present();
  }, []);

  const nextOrPreviousBook = (name: string, chapter: number = 1) => {
    navigation.setParams({
      book: name,
      chapter,
    });
  };

  const nextChapter = () => {
    if (DB_BOOK_CHAPTER_NUMBER[book as any] === chapter) {
      if (bookNumber === 730) return;
      const newBookName = DB_BOOK_NAMES[bookIndex + 1].longName;
      nextOrPreviousBook(newBookName);
      return;
    }
    navigation.setParams({
      book,
      chapter: ((chapter as number) || 0) + 1,
    });
  };
  const previuosChapter = () => {
    if (bookNumber !== 10 && chapter === 1) {
      const newBookName = DB_BOOK_NAMES[bookIndex - 1].longName;
      const newChapter = DB_BOOK_CHAPTER_NUMBER[newBookName];
      nextOrPreviousBook(newBookName, newChapter);
      return;
    }
    if ((chapter as number) <= 1) return;
    navigation.setParams({
      book,
      chapter: (chapter as number) - 1,
    });
  };

  const displayBookName = (book || "")?.length > 10 ? shortName : book;

  const onItemClick = (name: string) => {
    selectTheme(name);
    themeRef.current?.dismiss();
  };

  const renderItem = ({ item, index }: any) => {
    const name = Object.keys(EThemes)[index];
    return (
      <TouchableOpacity
        style={[styles.themeCard, { backgroundColor: item }]}
        onPress={() => onItemClick(name)}
      >
        <Text style={styles.themeLabel}>{name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.footer}>
      <View style={styles.footerCenter}>
        <TouchableOpacity onPress={() => previuosChapter()}>
          <MaterialCommunityIcons
            style={styles.icon}
            name="less-than"
            size={footerIconSize}
            color="white"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={{ flex: 1, alignItems: "center" }}
          onPress={() => navigation?.navigate(Screens.Book)}
        >
          <Text style={styles.bookLabel}>
            {`${displayBookName ?? ""} ${chapter ?? ""}`}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => nextChapter()}>
          <MaterialCommunityIcons
            style={styles.icon}
            name="greater-than"
            size={footerIconSize}
            color="white"
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.footerEnd}
        onPress={themeHandlePresentModalPress}
      >
        <MaterialCommunityIcons
          name="application-settings-outline"
          // name="play"
          size={footerIconSize}
          style={[styles.icon, { marginHorizontal: 0 }]}
        />
      </TouchableOpacity>
      <BottomModal snapPoints={snapPoints} ref={themeRef}>
        <View style={styles.modalBody}>
          <Text style={[styles.title]}>Seleccionar Tema</Text>
          <FlashList
            contentContainerStyle={{ padding: 0 }}
            data={Object.values(EThemes)}
            renderItem={renderItem}
            estimatedItemSize={10}
            numColumns={3}
          />
        </View>
      </BottomModal>
    </View>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    title: {
      color: "white",
      fontSize: 20,
      padding: 5,
      width: "100%",
      textAlign: "center",
      backgroundColor: colors.notification,
      marginBottom: 15,
    },
    linea: {
      width: "100%",
      height: 1,
      backgroundColor: colors.background,
      elevation: 5,
      marginVertical: 5,
      textAlign: "center",
    },
    footer: {
      right: 0,
      width: "100%",
      display: "flex",
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      paddingVertical: 15,
      paddingHorizontal: 10,
      backgroundColor: colors.background,
      boxSizing: "border-box",
      gap: 10,
      borderTopColor: colors.border,
      borderWidth: 0.5,
      borderStyle: "solid",
    },
    footerCenter: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderRadius: 50,
      flex: 1,
      padding: 15,
      backgroundColor: colors.backgroundContrast,
    },
    footerEnd: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 15,
      borderRadius: 50,
      backgroundColor: colors.backgroundContrast,
    },
    icon: {
      fontWeight: "900",
      // color: colors.text,
      marginHorizontal: 10,
      color: colors.primary,
    },
    bookLabel: {
      color: colors.primary,
      textAlign: "center",
      fontSize: 24,
      fontWeight: "bold",
    },
    modalBody: {
      position: "relative",
      display: "flex",
      borderRadius: 45,
      padding: 10,
      flex: 1,
    },
    themeCard: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      margin: 5,
      flex: 1,
      padding: 10,
    },
    themeLabel: {
      color: "white",
    },
  });

export default CustomFooter;
