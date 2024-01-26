import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  ParamListBase,
  RouteProp,
  useNavigation,
  useRoute,
  useTheme,
} from "@react-navigation/native";
import { DB_BOOK_CHAPTER_NUMBER, DB_BOOK_NAMES } from "constants/BookNames";
import { useBibleContext } from "context/BibleContext";
import useAudioPlayer from "hooks/useAudioPlayer";
import { FC } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { EBibleVersions, HomeParams, Screens, TTheme } from "types";

import { Text, View } from "components/Themed";
import ProgressBar from "./ProgressBar";
interface FooterInterface {}
const FOOTER_ICON_SIZE = 28;

const CustomFooter: FC<FooterInterface> = () => {
  const { currentBibleVersion } = useBibleContext();
  const theme = useTheme();
  const styles = getStyles(theme);
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ParamListBase>>();
  const { book, chapter = 1 } = route.params as HomeParams;
  const { bookNumber, shortName } =
    DB_BOOK_NAMES.find((x) => x.longName === book) || {};
  const bookIndex = DB_BOOK_NAMES.findIndex((x) => x.longName === book);
  const isNTV = currentBibleVersion === EBibleVersions.NTV;
  const { isDownloading, isPlaying, playAudio, duration, position } =
    useAudioPlayer({
      book: bookIndex + 1,
      chapterNumber: +chapter,
      nextChapter,
    });

  const nextOrPreviousBook = (name: string, chapter: number = 1) => {
    navigation.setParams({
      book: name,
      chapter,
    });
  };

  function nextChapter() {
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
  }
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

  return (
    <View style={styles.footer}>
      <View
        style={[styles.progressBarContainer, !isPlaying && { display: "none" }]}
      >
        <ProgressBar
          color={theme.colors.notification}
          barColor={theme.colors.text}
          progress={position / duration}
        />
      </View>
      <View style={styles.footerCenter}>
        <TouchableOpacity onPress={() => previuosChapter()}>
          <MaterialCommunityIcons
            style={styles.icon}
            name="less-than"
            size={FOOTER_ICON_SIZE}
            color="white"
          />
        </TouchableOpacity>
        <TouchableOpacity style={{ flex: 1, alignItems: "center" }}>
          <Text
            style={styles.bookLabel}
            onPress={() => navigation?.navigate(Screens.ChooseBook)}
          >
            {`${displayBookName ?? ""} ${chapter ?? ""}`}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => nextChapter()}>
          <MaterialCommunityIcons
            style={styles.icon}
            name="greater-than"
            size={FOOTER_ICON_SIZE}
            color="white"
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={[styles.footerEnd, isNTV && { display: "none" }]}
        onPress={playAudio}
      >
        {!isDownloading ? (
          <MaterialCommunityIcons
            name={!isPlaying ? "play" : "stop"}
            size={FOOTER_ICON_SIZE}
            style={[styles.icon, { marginHorizontal: 0 }]}
          />
        ) : (
          <MaterialCommunityIcons
            name="download"
            size={FOOTER_ICON_SIZE}
            style={[styles.icon, { marginHorizontal: 0 }]}
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

// https://www.wordproaudio.net/bibles/app/audio/6/1/1.mp3

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    footer: {
      position: "relative",
      right: 0,
      width: "100%",
      display: "flex",
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      paddingVertical: 15,
      // paddingHorizontal: 10,
      backgroundColor: colors.background,
      boxSizing: "border-box",
      gap: 10,
      borderTopColor: colors.border,
      borderWidth: 0.5,
      borderStyle: "solid",
    },
    progressBarContainer: {
      position: "absolute",
      top: 0,
      width: "100%",
      height: 10,
    },
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
      color: colors.notification,
      textAlign: "center",
      fontSize: 24,
      fontWeight: "bold",
      textDecorationColor: colors.text,
      textDecorationLine: "underline",
      textDecorationStyle: "solid",
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
