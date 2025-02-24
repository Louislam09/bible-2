import { DB_BOOK_CHAPTER_NUMBER, DB_BOOK_NAMES } from "@/constants/BookNames";
import { useBibleContext } from "@/context/BibleContext";
import useAudioPlayer from "@/hooks/useAudioPlayer";
import { EBibleVersions, Screens } from "@/types";
import { useTheme } from "@react-navigation/native";
import { FC, useCallback, useEffect, useMemo, useRef } from "react";
import { Animated, TouchableOpacity } from "react-native";

import BottomModal from "@/components/BottomModal";
import Icon from "@/components/Icon";
import { Text, View } from "@/components/Themed";
import { iconSize } from "@/constants/size";
import { useBibleChapter } from "@/context/BibleChapterContext";
import { useStorage } from "@/context/LocalstoreContext";
import useBibleReader from "@/hooks/useBibleReading";
import useInternetConnection from "@/hooks/useInternetConnection";
import useParams from "@/hooks/useParams";
import useSingleAndDoublePress from "@/hooks/useSingleOrDoublePress";
import { renameLongBookName } from "@/utils/extractVersesInfo";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useNavigation } from "expo-router";
import Play from "../header/Play";
import ProgressBar from "./ProgressBar";
import { getStyles } from "./styles";
import withRenderCount from "@/components/withRenderCount";
import { bibleState$ } from "@/state/bibleState";

interface FooterInterface {
  refs: any;
  isSplit?: boolean;
  book: any;
  chapter: any;
  verse: any;
}

const BibleFooter: FC<FooterInterface> = ({
  refs,
  isSplit,
  book: bookProp,
  chapter: chapterProp,
  verse,
}) => {
  const { book: bookRef, back: backRef, next: nextRef, audi: audioRef } = refs;
  const {
    currentBibleVersion,
    isSplitActived,
    toggleBottomSideSearching,
    shouldLoopReading,
    setShouldLoop,
  } = useBibleContext();
  const {
    storedData: { currentVoiceIdentifier, currentVoiceRate = 1 },
  } = useStorage();
  const isConnected = useInternetConnection();
  const FOOTER_ICON_SIZE = iconSize;
  const theme = useTheme();
  const styles = getStyles(theme);
  const playRef = useRef<BottomSheetModal>(null);
  const navigation = useNavigation();
  const params = useParams();
  const chpaterInfo = useBibleChapter();
  const {
    verses,
    bibleQuery,
    updateBibleQuery,
    historyManager: { getCurrentItem },
  } = chpaterInfo;

  const book = isSplit
    ? bibleQuery?.bottomSideBook || bookProp
    : bibleQuery.book || bookProp;
  const chapter = isSplit
    ? bibleQuery?.bottomSideChapter || bookProp
    : bibleQuery.chapter || chapterProp;

  const { bookNumber } = DB_BOOK_NAMES.find((x) => x.longName === book) || {};
  const bookIndex = DB_BOOK_NAMES.findIndex((x) => x.longName === book);
  const isRVR = currentBibleVersion === EBibleVersions.BIBLE && isConnected;
  const { isDownloading, isPlaying, playAudio, duration, position } =
    useAudioPlayer({
      book: bookIndex + 1,
      chapterNumber: +chapter,
      nextChapter,
    });

  const { verseIndex, startReading, stopReading, isSpeaking, ended, reset } =
    useBibleReader({
      currentChapterVerses: verses as any,
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
    bibleState$.clearSelection();
    const queryInfo = {
      [isSplit ? "bottomSideBook" : "book"]: name,
      [isSplit ? "bottomSideChapter" : "chapter"]: chapter,
      [isSplit ? "bottomSideVerse" : "verse"]: 1,
    };
    updateBibleQuery({
      ...queryInfo,
      shouldFetch: true,
      isBibleBottom: isSplit,
    });
    navigation.setParams({ ...queryInfo, isHistory: false });
  };

  function nextChapter() {
    if (DB_BOOK_CHAPTER_NUMBER[book as any] === chapter) {
      if (bookNumber === 730) return;
      const newBookName = DB_BOOK_NAMES[bookIndex + 1].longName;
      nextOrPreviousBook(newBookName);
      return;
    }

    const _chapter = +(chapter as number) + 1;
    const queryInfo = {
      [isSplit ? "bottomSideBook" : "book"]: book,
      [isSplit ? "bottomSideChapter" : "chapter"]: _chapter || 1,
      [isSplit ? "bottomSideVerse" : "verse"]: 1,
    };
    updateBibleQuery({
      ...queryInfo,
      shouldFetch: true,
      isBibleBottom: isSplit,
    });
    navigation.setParams({ ...queryInfo, isHistory: false });
  }
  const previousChapter = () => {
    if (bookNumber !== 10 && chapter === 1) {
      const newBookName = DB_BOOK_NAMES[bookIndex - 1].longName;
      const newChapter = DB_BOOK_CHAPTER_NUMBER[newBookName];
      nextOrPreviousBook(newBookName, newChapter);
      return;
    }
    if ((chapter as number) <= 1) return;
    const queryInfo = {
      [isSplit ? "bottomSideBook" : "book"]: book,
      [isSplit ? "bottomSideChapter" : "chapter"]: (chapter as number) - 1,
      [isSplit ? "bottomSideVerse" : "verse"]: 1,
    };
    updateBibleQuery({
      ...queryInfo,
      shouldFetch: true,
      isBibleBottom: isSplit,
    });
    navigation.setParams({ ...queryInfo, isHistory: false });
  };

  const onSingleFooterTitle = () => {
    bibleState$.clearSelection();
    toggleBottomSideSearching(isSplit as boolean);
    navigation?.navigate(Screens.ChooseBook, { ...params });
  };
  const onDoubleFooterTitle = () => {
    bibleState$.clearSelection();
    toggleBottomSideSearching(isSplit as boolean);
    navigation?.navigate(Screens.ChooseChapterNumber, { ...params });
  };

  const onPress = useSingleAndDoublePress({
    onSinglePress: onSingleFooterTitle,
    onDoublePress: onDoubleFooterTitle,
    delay: 200,
  });

  const onLongFooterTitle = () => {
    bibleState$.clearSelection();
    toggleBottomSideSearching(isSplit as boolean);
    navigation?.navigate(Screens.ChooseChapterNumber, { ...params });
  };

  const playHandlePresentModalPress = useCallback(() => {
    playRef.current?.present();
  }, []);

  const displayBookName = renameLongBookName(isSplit ? bookProp : book);

  // const currentHistoryItemVerse = getCurrentItem()?.verse;

  return (
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
            {`${displayBookName ?? ""} ${
              isSplit ? chapterProp : chapter ?? ""
            }:${verse}`}
          </Text>
          {/* <Text style={[styles.bookLabel, { fontSize: FOOTER_ICON_SIZE - 5 }]}>
            {`${displayBookName ?? ""} ${
              isSplit ? chapterProp : chapter ?? ""
            }:${isSplitActived ? verse : currentHistoryItemVerse || verse}`}
          </Text> */}
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
        <View style={{ flexDirection: "row", backgroundColor: "transparent" }}>
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

      <BottomModal id="footer" justOneSnap startAT={0} ref={playRef}>
        <Play
          isRvr={isRVR}
          {...{
            theme,
            isDownloading,
            isPlaying: _isPlaying,
            playAudio: _playAudio,
            duration: isRVR ? duration : (verses || []).length,
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
  );
};

// export default withRenderCount(BibleFooter);
export default BibleFooter;
