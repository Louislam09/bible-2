import { DB_BOOK_CHAPTER_NUMBER, DB_BOOK_NAMES } from "@/constants/BookNames";
import { useBibleContext } from "@/context/BibleContext";
import useAudioPlayer from "@/hooks/useAudioPlayer";
import { EBibleVersions, Screens } from "@/types";
import { useTheme } from "@react-navigation/native";
import { FC, useCallback, useEffect, useRef } from "react";
import { Animated, TouchableOpacity } from "react-native";

import BottomModal from "@/components/BottomModal";
import Icon from "@/components/Icon";
import { Text, View } from "@/components/Themed";
import { iconSize } from "@/constants/size";
import { useStorage } from "@/context/LocalstoreContext";
import useBibleReader from "@/hooks/useBibleReading";
import useInternetConnection from "@/hooks/useInternetConnection";
import useParams from "@/hooks/useParams";
import useSingleAndDoublePress from "@/hooks/useSingleOrDoublePress";
import { bibleState$ } from "@/state/bibleState";
import { tourState$ } from "@/state/tourState";
import { renameLongBookName } from "@/utils/extractVersesInfo";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useNavigation } from "expo-router";
import Play from "../header/Play";
import ProgressBar from "./ProgressBar";
import { getStyles } from "./styles";
import { batch } from "@legendapp/state";

interface FooterInterface {
  isSplit?: boolean;
}

const BibleFooter: FC<FooterInterface> = ({ isSplit }) => {
  const { currentBibleVersion, shouldLoopReading, setShouldLoop } =
    useBibleContext();
  const isSplitActived = bibleState$.isSplitActived.get();

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
  const bibleQuery = bibleState$.bibleQuery.get();

  const book = isSplit ? bibleQuery?.bottomSideBook : bibleQuery.book;
  const chapter = isSplit ? bibleQuery?.bottomSideChapter : bibleQuery.chapter;
  const verse = isSplit ? bibleQuery?.bottomSideVerse : bibleQuery.verse;

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
      currentChapterVerses: bibleState$.bibleData.topVerses.get() as any,
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
    bibleState$.changeBibleQuery({
      ...queryInfo,
      shouldFetch: true,
      isBibleBottom: isSplit,
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
    const queryInfo = {
      [isSplit ? "bottomSideBook" : "book"]: book,
      [isSplit ? "bottomSideChapter" : "chapter"]: _chapter || 1,
      [isSplit ? "bottomSideVerse" : "verse"]: 1,
    };
    bibleState$.changeBibleQuery({
      ...queryInfo,
      shouldFetch: true,
      isBibleBottom: isSplit,
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
    const queryInfo = {
      [isSplit ? "bottomSideBook" : "book"]: book,
      [isSplit ? "bottomSideChapter" : "chapter"]: (chapter as number) - 1,
      [isSplit ? "bottomSideVerse" : "verse"]: 1,
    };
    bibleState$.changeBibleQuery({
      ...queryInfo,
      shouldFetch: true,
      isBibleBottom: isSplit,
      isHistory: false,
    });
  };

  const onSingleFooterTitle = () => {
    batch(() => {
      bibleState$.clearSelection();
      bibleState$.isBottomBibleSearching.set(!!isSplit);
    });
    navigation?.navigate(Screens.ChooseBook, { ...params });
  };
  const onDoubleFooterTitle = () => {
    batch(() => {
      bibleState$.clearSelection();
      bibleState$.isBottomBibleSearching.set(!!isSplit);
    });
    navigation?.navigate(Screens.ChooseChapterNumber, { ...params });
  };

  const onPress = useSingleAndDoublePress({
    onSinglePress: onSingleFooterTitle,
    onDoublePress: onDoubleFooterTitle,
    delay: 200,
  });

  const onLongFooterTitle = () => {
    batch(() => {
      bibleState$.clearSelection();
      bibleState$.isBottomBibleSearching.set(!!isSplit);
    });
    navigation?.navigate(Screens.ChooseChapterNumber, { ...params });
  };

  const playHandlePresentModalPress = useCallback(() => {
    playRef.current?.present();
  }, []);

  const displayBookName = renameLongBookName(book);

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
        <TouchableOpacity
          ref={tourState$.backButton.get()}
          onPress={() => previousChapter()}
        >
          <Icon
            name={"ChevronsLeft"}
            size={FOOTER_ICON_SIZE}
            style={[styles.icon, { marginHorizontal: 0 }]}
          />
        </TouchableOpacity>
        <TouchableOpacity
          ref={tourState$.footerTitleRef.get()}
          style={styles.titleContainer}
          onPress={onPress}
          onLongPress={onLongFooterTitle}
          delayLongPress={200}
        >
          <Text style={[styles.bookLabel, { fontSize: FOOTER_ICON_SIZE - 5 }]}>
            {`${displayBookName ?? ""} ${chapter ?? ""}:${verse}`}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          ref={tourState$.nextButton.get()}
          onPress={() => nextChapter()}
        >
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
            ref={tourState$.audio.get()}
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
            duration: isRVR
              ? duration
              : (bibleState$.bibleData.topVerses.get() || []).length,
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
