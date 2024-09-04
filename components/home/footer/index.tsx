import { useNavigation, useRoute, useTheme } from "@react-navigation/native";
import { DB_BOOK_CHAPTER_NUMBER, DB_BOOK_NAMES } from "constants/BookNames";
import { useBibleContext } from "context/BibleContext";
import useAudioPlayer from "hooks/useAudioPlayer";
import { FC, useCallback, useEffect, useRef } from "react";
import { Animated, TouchableOpacity, useWindowDimensions } from "react-native";
import { EBibleVersions, Screens } from "types";

import { BottomSheetModal } from "@gorhom/bottom-sheet";
import BottomModal from "components/BottomModal";
import Icon from "components/Icon";
import { Text, View } from "components/Themed";
import { iconSize } from "constants/size";
import { useStorage } from "context/LocalstoreContext";
import useBibleReader from "hooks/useBibleReading";
import useInternetConnection from "hooks/useInternetConnection";
import useSingleAndDoublePress from "hooks/useSingleOrDoublePress";
import {
  GestureHandlerStateChangeNativeEvent,
  State,
} from "react-native-gesture-handler";
import Play from "../header/Play";
import ProgressBar from "./ProgressBar";
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

type handleGestureStateChangeProps = {
  nativeEvent: GestureHandlerStateChangeNativeEvent;
};

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
    isSplitActived,
    toggleBottomSideSearching,
    currentChapterVerses,
    shouldLoopReading,
    setShouldLoop,
  } = useBibleContext();
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const {
    historyManager,
    storedData: { currentVoiceIdentifier, currentVoiceRate = 1 },
  } = useStorage();
  const isConnected = useInternetConnection();
  const FOOTER_ICON_SIZE = iconSize;
  const theme = useTheme();
  const styles = getStyles(theme);
  const playRef = useRef<BottomSheetModal>(null);
  const navigation = useNavigation();
  const route = useRoute();
  const currentHistoryItemVerse = historyManager.getCurrentItem()?.verse;

  const { bookNumber, shortName } =
    DB_BOOK_NAMES.find((x) => x.longName === book) || {};
  const bookIndex = DB_BOOK_NAMES.findIndex((x) => x.longName === book);
  const isRVR = currentBibleVersion === EBibleVersions.BIBLE && isConnected;
  const translateX = useRef(new Animated.Value(0)).current;
  const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
  const { isDownloading, isPlaying, playAudio, duration, position } =
    useAudioPlayer({
      book: bookIndex + 1,
      chapterNumber: +chapter,
      nextChapter,
    });

  const { verseIndex, startReading, stopReading, isSpeaking, ended, reset } =
    useBibleReader({
      currentChapterVerses,
      currentVoiceIdentifier,
      voiceRate: currentVoiceRate,
    });
  const startOrStop = isSpeaking ? stopReading : startReading;
  const _playAudio = isRVR ? playAudio : startOrStop;
  const _isPlaying = isRVR ? isPlaying : isSpeaking;

  useEffect(() => {
    if (ended && shouldLoopReading) {
      nextChapter();
      setTimeout(() => {
        reset({ andPlay: shouldLoopReading });
      }, 1000);
    }
  }, [ended, shouldLoopReading]);

  useEffect(() => {
    return () => {
      if (isPlaying) playAudio();
      stopReading();
    };
  }, []);

  const nextOrPreviousBook = (name: string, chapter: number = 1) => {
    clearHighlights();
    navigation.setParams({
      [isSplit ? "bottomSideBook" : "book"]: name,
      [isSplit ? "bottomSideChapter" : "chapter"]: chapter,
      [isSplit ? "bottomSideVerse" : "verse"]: 0,
      isHistory: false,
    });
  };

  function nextChapter() {
    if (DB_BOOK_CHAPTER_NUMBER[book as any] === chapter) {
      if (bookNumber === 730) return;
      const newBookName = DB_BOOK_NAMES[bookIndex + 1].longName;
      nextOrPreviousBook(newBookName);
      return;
    }

    const _chapter = +(chapter as number) + 1;
    navigation.setParams({
      [isSplit ? "bottomSideBook" : "book"]: book,
      [isSplit ? "bottomSideChapter" : "chapter"]: _chapter || 0,
      [isSplit ? "bottomSideVerse" : "verse"]: 0,
      isHistory: false,
    });
  }
  const previousChapter = () => {
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
      [isSplit ? "bottomSideVerse" : "verse"]: 0,
      isHistory: false,
    });
  };

  const onSingleFooterTitle = () => {
    clearHighlights();
    toggleBottomSideSearching(isSplit as boolean);
    navigation?.navigate(Screens.ChooseBook, { ...route.params });
  };
  const onDoubleFooterTitle = () => {
    clearHighlights();
    toggleBottomSideSearching(isSplit as boolean);
    navigation?.navigate(Screens.ChooseChapterNumber, { ...route.params });
  };

  const onPress = useSingleAndDoublePress({
    onSinglePress: onSingleFooterTitle,
    onDoublePress: onDoubleFooterTitle,
    delay: 200,
  });

  const onLongFooterTitle = () => {
    clearHighlights();
    toggleBottomSideSearching(isSplit as boolean);
    navigation?.navigate(Screens.ChooseChapterNumber, { ...route.params });
  };

  const playHandlePresentModalPress = useCallback(() => {
    playRef.current?.present();
  }, []);

  const displayBookName = (book || "")?.length > 10 ? shortName : book;

  useEffect(() => {
    if (isSplitActived) return;
    if (currentHistoryIndex === -1) return;
    const currentHistory = historyManager.getCurrentItem();

    if (!currentHistory) return;
    navigation.setParams({
      book: currentHistory.book,
      chapter: currentHistory.chapter,
      verse: currentHistory.verse,
      isHistory: true,
    });
  }, [currentHistoryIndex]);

  const handleGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    {
      useNativeDriver: false,
    }
  );

  const handleGestureStateChange = ({
    nativeEvent,
  }: handleGestureStateChangeProps) => {
    if (nativeEvent.state !== State.END) return;
    // @ts-ignore
    const _translationX = nativeEvent.translationX;
    if (_translationX < -SWIPE_THRESHOLD) {
      Animated.timing(translateX, {
        toValue: -SCREEN_WIDTH,
        duration: 100,
        useNativeDriver: true,
      }).start(() => {
        nextChapter();
        translateX.setValue(0);
      });
    } else if (_translationX > SWIPE_THRESHOLD) {
      Animated.timing(translateX, {
        toValue: SCREEN_WIDTH,
        duration: 100,
        useNativeDriver: true,
      }).start(() => {
        previousChapter();
        translateX.setValue(0);
      });
    } else {
      Animated.timing(translateX, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    // <PanGestureHandler
    //   onGestureEvent={handleGestureEvent}
    //   onHandlerStateChange={handleGestureStateChange}
    // >
    <Animated.View style={[styles.footer]}>
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
        <TouchableOpacity ref={backRef} onPress={() => previousChapter()}>
          <Icon
            name={"ChevronsLeft"}
            size={FOOTER_ICON_SIZE}
            style={[styles.icon, { marginHorizontal: 0 }]}
          />
        </TouchableOpacity>
        <TouchableOpacity
          ref={bookRef}
          style={styles.titleContainer}
          onPress={onPress}
          onLongPress={onLongFooterTitle}
          delayLongPress={200}
        >
          <Text style={[styles.bookLabel, { fontSize: FOOTER_ICON_SIZE - 5 }]}>
            {`${displayBookName ?? ""} ${chapter ?? ""}:${
              currentHistoryItemVerse || verse
            }`}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity ref={nextRef} onPress={() => nextChapter()}>
          <Icon
            name={"ChevronsRight"}
            size={FOOTER_ICON_SIZE}
            style={[styles.icon, { marginHorizontal: 0 }]}
          />
        </TouchableOpacity>
      </View>
      {!isSplitActived && (
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity
            ref={audioRef}
            style={[styles.footerEnd]}
            onPress={playHandlePresentModalPress}
          >
            <Icon
              name={"Headphones"}
              size={FOOTER_ICON_SIZE}
              style={[styles.icon, { marginHorizontal: 0 }]}
            />
          </TouchableOpacity>
        </View>
      )}

      <BottomModal justOneSnap startAT={0} ref={playRef}>
        <Play
          isRvr={isRVR}
          {...{
            theme,
            isDownloading,
            isPlaying: _isPlaying,
            playAudio: _playAudio,
            duration: isRVR ? duration : currentChapterVerses.length,
            position: isRVR ? position : verseIndex,
            nextChapter,
            previousChapter,
            book,
            chapter,
            shouldLoopReading,
            setShouldLoop,
          }}
        />
      </BottomModal>
    </Animated.View>
    // </PanGestureHandler>
  );
};

export default CustomFooter;
