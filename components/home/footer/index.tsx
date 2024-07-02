import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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
import { FC, useCallback, useEffect, useRef } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { EBibleVersions, HomeParams, Screens, TTheme } from "types";

import { BottomSheetModal } from "@gorhom/bottom-sheet";
import BottomModal from "components/BottomModal";
import { Text, View } from "components/Themed";
import Play from "../header/Play";
import ProgressBar from "./ProgressBar";
import { iconSize } from "constants/size";
import { getStyles } from "./styles";
interface FooterInterface {
  bookRef: any;
  nextRef: any;
  audioRef: any;
  backRef: any;
  isSplit?: boolean;
  book: any;
  chapter: any;
  verse: any;
}

const CustomFooter: FC<FooterInterface> = ({
  bookRef,
  backRef,
  nextRef,
  audioRef,
  isSplit,
  book,
  chapter,
  verse,
}) => {
  const {
    currentBibleVersion,
    clearHighlights,
    currentHistoryIndex,
    searchHistorial,
    isSplitActived,
    toggleBottomSideSearching,
    isBottomSideSearching,
  } = useBibleContext();
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const FOOTER_ICON_SIZE = iconSize;
  const theme = useTheme();
  const styles = getStyles(theme);
  const playRef = useRef<BottomSheetModal>(null);
  const navigation = useNavigation();
  const route = useRoute();
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

  console.log(book, chapter);
  const nextOrPreviousBook = (name: string, chapter: number = 1) => {
    clearHighlights();
    navigation.setParams({
      [isSplit ? "bottomSideBook" : "book"]: name,
      [isSplit ? "bottomSideChapter" : "chapter"]: chapter,
      verse: 0,
    });
  };

  function nextChapter() {
    if (DB_BOOK_CHAPTER_NUMBER[book as any] === chapter) {
      if (bookNumber === 730) return;
      const newBookName = DB_BOOK_NAMES[bookIndex + 1].longName;
      nextOrPreviousBook(newBookName);
      return;
    }
    console.log({
      [isSplit ? "bottomSideBook" : "book"]: book,
      [isSplit ? "bottomSideChapter" : "chapter"]:
        ((chapter as number) || 0) + 1,
      verse: 0,
    });

    navigation.setParams({
      [isSplit ? "bottomSideBook" : "book"]: book,
      [isSplit ? "bottomSideChapter" : "chapter"]:
        ((chapter as number) || 0) + 1,
      verse: 0,
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
      [isSplit ? "bottomSideBook" : "book"]: book,
      [isSplit ? "bottomSideChapter" : "chapter"]: (chapter as number) - 1,
      verse: 0,
    });
  };

  const onFooterTitle = () => {
    clearHighlights();
    toggleBottomSideSearching(isSplit as boolean);
    navigation?.navigate(Screens.ChooseBook, { ...route.params });
  };

  const playHandlePresentModalPress = useCallback(() => {
    playRef.current?.present();
  }, []);

  const displayBookName = (book || "")?.length > 10 ? shortName : book;

  useEffect(() => {
    if (currentHistoryIndex === -1) return;
    const currentHistory = searchHistorial[currentHistoryIndex];

    if (!currentHistory) return;
    navigation.setParams({
      book: currentHistory.book,
      chapter: currentHistory.chapter,
      bottomSideBook: currentHistory.book,
      bottomSideChapter: currentHistory.chapter,
      verse: currentHistory.verse,
      isHistory: true,
    });
  }, [currentHistoryIndex]);

  return (
    <View style={[styles.footer, { width: "52%" }]}>
      {isPlaying && (
        <View style={[styles.progressBarContainer]}>
          <ProgressBar
            height={8}
            color={theme.colors.notification}
            barColor={theme.colors.text}
            progress={position / duration}
            circleColor={theme.colors.notification}
          />
        </View>
      )}
      <View style={styles.footerCenter}>
        <TouchableOpacity ref={backRef} onPress={() => previuosChapter()}>
          <Ionicons
            name="chevron-back-sharp"
            style={[styles.icon]}
            size={FOOTER_ICON_SIZE}
            color="white"
          />
        </TouchableOpacity>
        <TouchableOpacity
          ref={bookRef}
          style={styles.titleContainer}
          onPress={onFooterTitle}
        >
          <Text style={[styles.bookLabel, { fontSize: FOOTER_ICON_SIZE - 5 }]}>
            {`${displayBookName ?? ""} ${chapter ?? ""}`}
          </Text>
          {/* <MaterialCommunityIcons
            style={[styles.icon, { margin: 0 }]}
            name="menu"
            size={FOOTER_ICON_SIZE - 5}
            color={"white"}
          /> */}
          {/* {isSplit ? <Text>Second</Text> : <Text>first</Text>} */}
        </TouchableOpacity>
        <TouchableOpacity ref={nextRef} onPress={() => nextChapter()}>
          <Ionicons
            name="chevron-forward-sharp"
            style={styles.icon}
            size={FOOTER_ICON_SIZE}
            color="white"
          />
        </TouchableOpacity>
      </View>
      {!isSplitActived && (
        <TouchableOpacity
          ref={audioRef}
          style={[styles.footerEnd, isNTV && { display: "none" }]}
          onPress={playHandlePresentModalPress}
        >
          <MaterialCommunityIcons
            name={"headphones"}
            size={FOOTER_ICON_SIZE}
            style={[styles.icon, { marginHorizontal: 0 }]}
          />
        </TouchableOpacity>
      )}

      <BottomModal justOneSnap startAT={0} ref={playRef}>
        <Play
          {...{
            theme,
            isDownloading,
            isPlaying,
            playAudio,
            duration,
            position,
            nextChapter,
            previuosChapter,
            book,
            chapter,
          }}
        />
      </BottomModal>
    </View>
  );
};

export default CustomFooter;
