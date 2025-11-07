import BibleHeader from "@/components/home/header/BibleHeader";
import Icon from "@/components/Icon";
import { getBookDetail } from "@/constants/BookNames";
import { useBibleContext } from "@/context/BibleContext";
import { storedData$ } from "@/context/LocalstoreContext";
import { useMemorization } from "@/context/MemorizationContext";
import { useMyTheme } from "@/context/ThemeContext";
import { audioState$ } from "@/hooks/useAudioPlayer";
import useChangeBookOrChapter from "@/hooks/useChangeBookOrChapter";
import { useHaptics } from "@/hooks/useHaptics";
import { bibleState$ } from "@/state/bibleState";
import { modalState$ } from "@/state/modalState";
import { tourState$ } from "@/state/tourState";
import { EBibleVersions, IBookVerse, IFavoriteVerse, Screens } from "@/types";
import copyToClipboard, { formatForImageQuote } from "@/utils/copyToClipboard";
import { getStrongValue, WordTagPair } from "@/utils/extractVersesInfo";
import { getVerseTextRaw } from "@/utils/getVerseTextRaw";
import { showToast } from "@/utils/showToast";
import { use$ } from "@legendapp/state/react";
import { useRouter } from "expo-router";
import React, { FC, useCallback, useEffect, useMemo, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Chapter from "./home/content/Chapter";
import WebViewChapter from "./home/content/WebViewChapter";
import BibleFooter from "./home/footer/BibleFooter";
import SwipeWrapper from "./SwipeWrapper";
import { Text, View } from "./Themed";

interface BibleTopProps {
  height: Animated.Value;
  width: Animated.Value;
}

const BibleTop: FC<BibleTopProps> = (props) => {
  const { theme } = useMyTheme();
  const haptics = useHaptics();
  const router = useRouter();
  const { orientation, selectBibleVersion, toggleFavoriteVerse } =
    useBibleContext();
  const { addVerse } = useMemorization();
  const isPortrait = orientation === "PORTRAIT";
  const isDataLoading = use$(() => bibleState$.isDataLoading.top.get());
  const verses = use$(() => bibleState$.bibleData.topVerses.get()) ?? [];
  const interlinearVerses = use$(() => bibleState$.bibleData.interlinearVerses.get()) ?? [];

  const currentBook = use$(() => bibleState$.bibleQuery.get().book);
  const bookInfo = getBookDetail(currentBook);
  const NT_BOOK_NUMBER = 470;
  const currentBibleVersion = use$(() => storedData$.currentBibleVersion.get());

  const isSplitActived = use$(() => bibleState$.isSplitActived.get());

  const isHebrewInterlinear = [EBibleVersions.INTERLINEAR].includes(
    currentBibleVersion as EBibleVersions
  );

  const isGreekInterlinear = [EBibleVersions.GREEK].includes(
    currentBibleVersion as EBibleVersions
  );
  const isInterlinear = isHebrewInterlinear || isGreekInterlinear;

  const chapterData = useMemo(() => {
    if (isInterlinear && !isSplitActived) {
      return interlinearVerses;
    }
    return verses;
  }, [isInterlinear, verses, isSplitActived]);

  const isNewTestamentAndInterlinear =
    bookInfo.bookNumber >= NT_BOOK_NUMBER && isHebrewInterlinear;

  const isOldTestamentAndGreekInterlineal =
    bookInfo.bookNumber < NT_BOOK_NUMBER && isGreekInterlinear;

  const bibleQuery = use$(() => bibleState$.bibleQuery.get());
  const {
    book: book,
    chapter: chapter,
    verse: verse,
  } = bibleQuery;
  const verseNumber = use$(() => bibleState$.bibleQuery.get().verse);

  const { nextChapter, previousChapter } = useChangeBookOrChapter({
    book,
    chapter,
  });

  const initialScrollIndex = useMemo(() => {
    if (verse <= 0) return 0;
    return Math.min(verseNumber || verse, Math.max(0, verses.length - 1));
  }, [verse, verses, verseNumber]);

  const onSwipeRight = () => {
    previousChapter();
  };

  const onSwipeLeft = () => {
    nextChapter();
  };

  const widthOrHeight = useMemo(
    () => (isPortrait ? "height" : "width"),
    [isPortrait]
  );
  const headerHeight = useRef(new Animated.Value(1)).current;

  const handleScroll = useCallback((direction: "up" | "down") => {
    // console.log("handleScroll", direction);
    // const toValue = direction === "up" ? 1 : 0;
    // Animated.parallel([
    //   Animated.timing(headerHeight, {
    //     toValue,
    //     duration: 200,
    //     useNativeDriver: false,
    //   }),
    //   Animated.timing(footerHeight, {
    //     toValue,
    //     duration: 200,
    //     useNativeDriver: false,
    //   }),
    // ]).start();
  }, []);

  const containerStyle = useMemo(
    () => ({
      [widthOrHeight]: props[widthOrHeight],
      flex: isSplitActived ? undefined : 1,
      backgroundColor: theme.colors.background,
    }),
    [widthOrHeight, props, isSplitActived, theme.colors.background]
  );

  const headerStyle = {
    transform: [{ scaleY: headerHeight }],
    opacity: headerHeight,
  };

  const onStrongWordClicked = useCallback(({ word, tagValue }: WordTagPair) => {
    haptics.selection();

    const value = {
      text: word.replace(/[.,;]/g, ""),
      code: tagValue ?? "",
    };
    bibleState$.handleStrongWord(value);
    modalState$.openStrongSearchBottomSheet();
  }, []);

  const onWordClicked = useCallback((code: string, item: IBookVerse) => {
    const { textValue = ["."], strongValue = [] } = getStrongValue(item.text);
    const isWordName = isNaN(+code);
    const wordIndex = isWordName
      ? textValue.indexOf(code)
      : strongValue.indexOf(code);

    const word = textValue[wordIndex];
    const secondCode =
      textValue[wordIndex + 1] === "-" ? strongValue[wordIndex + 1] : "";

    const isDash = word === "-" ? -1 : 0;
    const NT_BOOK_NUMBER = 470;
    const cognate = item?.book_number < NT_BOOK_NUMBER ? "H" : "G";
    const searchCode = isWordName
      ? `${cognate}${strongValue[wordIndex]}`
      : `${cognate}${code}`;
    const secondSearchCode = secondCode ? `,${cognate}${secondCode}` : ",";
    const searchWord = textValue[wordIndex + isDash] ?? searchCode;

    const value = {
      text: searchWord,
      code: searchCode.concat(secondSearchCode),
    };

    bibleState$.handleStrongWord(value);
    modalState$.openStrongSearchBottomSheet();
  }, []);

  const onInterlinear = useCallback((item: IBookVerse) => {
    const currentInterlinear =
      bibleState$.bibleData.interlinearVerses.get()?.[item.verse - 1];

    bibleState$.handleVerseToInterlinear({
      book_number: item?.book_number,
      chapter: item.chapter,
      verse: item.verse,
      text: currentInterlinear?.text || "",
    });
    modalState$.openInterlinealBottomSheet();
    // Use the default implementation from the original actions
    // The modal will be opened from the global state
  }, []);

  const onAnotar = useCallback(async (item: IBookVerse | IBookVerse[]) => {
    const shouldReturn = true;

    // If item is already an array (from WebView), use it directly
    if (Array.isArray(item)) {
      const verseToAdd = (await copyToClipboard(item, shouldReturn)) as string;
      bibleState$.handleSelectVerseForNote(verseToAdd);
      bibleState$.clearSelection();
      if (!bibleState$.currentNoteId.get()) bibleState$.openNoteListBottomSheet();
      return;
    }

    // Otherwise, fallback to original logic (for native Verse component)
    const isMoreThanOneHighted = bibleState$.selectedVerses.get().size > 1;
    const highlightedVerses = Array.from(
      bibleState$.selectedVerses.get().values()
    ).sort((a, b) => a.verse - b.verse);
    const value = isMoreThanOneHighted ? highlightedVerses : item;
    const verseToAdd = (await copyToClipboard(value, shouldReturn)) as string;
    bibleState$.handleSelectVerseForNote(verseToAdd);
    bibleState$.clearSelection();
    if (!bibleState$.currentNoteId.get()) bibleState$.openNoteListBottomSheet();
  }, []);

  const onComparar = useCallback((item: IBookVerse) => {
    bibleState$.verseToCompare.set(item.verse);
    modalState$.openCompareBottomSheet();
    bibleState$.clearSelection();
  }, []);

  const onCopy = useCallback(async (item: IBookVerse | IBookVerse[]) => {
    // If item is already an array (from WebView), use it directly
    if (Array.isArray(item)) {
      await copyToClipboard(item);
      bibleState$.clearSelection();
      return;
    }

    // Otherwise, fallback to original logic (for native Verse component)
    const highlightedVerses = Array.from(
      bibleState$.selectedVerses.get().values()
    ).sort((a, b) => a.verse - b.verse);
    const value = highlightedVerses.length > 0 ? highlightedVerses : [item];
    await copyToClipboard(value);
    bibleState$.clearSelection();
  }, []);

  const onExplain = useCallback(
    (item: IBookVerse) => {
      const googleAIKey = storedData$.googleAIKey.get();
      if (!googleAIKey) {
        Alert.alert("Aviso", "No se ha configurado la API key de Google AI", [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Configurar",
            onPress: () => {
              router.push(Screens.AISetup);
            },
          },
        ]);
        return;
      }
      const verseText = getVerseTextRaw(item.text);
      const reference = `${getBookDetail(item?.book_number).longName} ${item.chapter
        }:${item.verse}`;

      bibleState$.handleVerseWithAiAnimation(item.verse);
      bibleState$.handleVerseToExplain({ text: verseText, reference });
      modalState$.closeExplainVerseBottomSheet();
      bibleState$.clearSelection();
    },
    [router]
  );

  const onImage = useCallback(
    async (item: IBookVerse | IBookVerse[]) => {
      if (Array.isArray(item)) {
        const formattedValue = formatForImageQuote({ items: item });
        bibleState$.handleSelectVerseForNote(formattedValue.text);
        router.push({
          pathname: "/quoteMaker",
          params: { text: formattedValue.text, reference: formattedValue.reference },
        });
        return;
      }

      const verseText = getVerseTextRaw(item.text);
      const reference = `${getBookDetail(item?.book_number).longName} ${item.chapter
        }:${item.verse}`;
      bibleState$.handleSelectVerseForNote(verseText);
      router.push({
        pathname: "/quoteMaker",
        params: { text: verseText, reference },
      });
    },
    [router]
  );

  const onQuote = useCallback(
    (item: IBookVerse | IBookVerse[]) => {
      if (Array.isArray(item)) {
        const formattedValue = formatForImageQuote({ items: item });
        bibleState$.handleSelectVerseForNote(formattedValue.text);
        router.push({
          pathname: "/quote",
          params: { text: formattedValue.text, reference: formattedValue.reference },
        });
        return;
      }

      const verseText = getVerseTextRaw(item.text);
      const reference = `${getBookDetail(item?.book_number).longName} ${item.chapter
        }:${item.verse}`;
      bibleState$.handleSelectVerseForNote(verseText);
      router.push({
        pathname: "/quote",
        params: { text: verseText, reference },
      });
    },
    [router]
  );

  const onVerseLongPress = useCallback((item: IBookVerse) => {
    bibleState$.handleLongPressVerse(item);
    haptics.impact.medium();
  }, []);

  const onMemorizeVerse = useCallback(
    (verse: string, version: string) => {
      addVerse(verse, version);
      bibleState$.clearSelection();
    },
    [addVerse]
  );

  const onFavoriteVerse = useCallback(
    async ({ bookNumber, chapter, verse, isFav }: IFavoriteVerse) => {
      await toggleFavoriteVerse({
        bookNumber,
        chapter,
        verse,
        isFav,
      });
      bibleState$.clearSelection();
      showToast(
        isFav
          ? "Versículo agregado a favoritos"
          : "Versículo eliminado de favoritos"
      );
    },
    [toggleFavoriteVerse]
  );

  const onSelectBibleVersion = (version: string) => {
    bibleState$.clearSelection();
    selectBibleVersion(version);
    bibleState$.changeBibleQuery({
      isBibleBottom: false,
      shouldFetch: true,
      isHistory: false,
    });
    haptics.impact.light();
  };

  const autoChangeBibleVersion = useMemo(() => {
    return isNewTestamentAndInterlinear || isOldTestamentAndGreekInterlineal;
  }, [isNewTestamentAndInterlinear, isOldTestamentAndGreekInterlineal]);

  useEffect(() => {
    if (autoChangeBibleVersion) {
      setTimeout(() => {
        onSelectBibleVersion(
          isGreekInterlinear ? EBibleVersions.INTERLINEAR : EBibleVersions.GREEK
        );
      }, 50);
    }
  }, [autoChangeBibleVersion]);

  const isPlayerOpened = use$(() => audioState$.isPlayerOpened.get());
  const useDomComponent = use$(() => storedData$.useDomComponent.get());

  // const MyChapter = isInterlinear ? Chapter : (slowDevice ) ? DomChapter : Chapter;
  // const MyChapter = useDomComponent
  //   ? isInterlinear
  //     ? Chapter
  //     : DomChapter
  //   : Chapter;

  const showWebView = !isInterlinear;
  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Animated.View style={[styles.header, headerStyle]}>
        <BibleHeader />
      </Animated.View>
      <SwipeWrapper {...{ onSwipeRight, onSwipeLeft }}>
        {isDataLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator />
          </View>
        ) : autoChangeBibleVersion ? (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 20,
            }}
          >
            <View style={{ marginBottom: 20 }}>
              <Icon
                name="BookType"
                size={60}
                color={theme.colors.text + "60"}
              />
            </View>

            <Text
              style={{
                color: theme.colors.text,
                fontSize: 18,
                fontWeight: "600",
                marginBottom: 12,
                textAlign: "center",
              }}
            >
              Interlinear no disponible
            </Text>

            <Text
              style={{
                color: theme.colors.text + "CC",
                fontSize: 14,
                lineHeight: 20,
                marginBottom: 16,
                textAlign: "center",
              }}
            >
              Los versículos del {isGreekInterlinear ? "Antiguo" : "Nuevo"}{" "}
              Pacto no están disponibles en formato interlinear{" "}
              {isGreekInterlinear ? "griego" : "hebreo"} en este momento.
            </Text>

            <Text
              style={{
                color: theme.colors.notification,
                fontSize: 14,
                fontWeight: "500",
                textAlign: "center",
              }}
            >
              Selecciona un versículo del{" "}
              {isGreekInterlinear ? "Nuevo" : "Antiguo"} Pacto para usar la
              función interlinear {isGreekInterlinear ? "griego" : "hebreo"}
            </Text>

            <TouchableOpacity
              style={{
                backgroundColor: theme.colors.notification,
                padding: 10,
                borderRadius: 5,
                marginTop: 10,
              }}
              onPress={() =>
                onSelectBibleVersion(
                  isGreekInterlinear
                    ? EBibleVersions.INTERLINEAR
                    : EBibleVersions.GREEK
                )
              }
            >
              <Text style={{ color: "white" }}>Cambiar</Text>
            </TouchableOpacity>
          </View>
        ) : showWebView ? (
          <WebViewChapter
            width={Dimensions.get("window").width}
            theme={theme}
            data={chapterData}
            initialScrollIndex={initialScrollIndex}
            verses={verses}
            isInterlinear={isInterlinear}
            isSplit={false}
            onScroll={handleScroll}
            {...{
              onStrongWordClicked,
              onInterlinear,
              onAnotar,
              onComparar,
              onWordClicked,
              onCopy,
              onExplain,
              onImage,
              onQuote,
              onVerseLongPress,
              onMemorizeVerse,
              onFavoriteVerse,
            }}
          />
        ) : (
          <Chapter
            initialScrollIndex={
              initialScrollIndex === 1 ? 0 : initialScrollIndex || 0
            }
            verses={verses}
            data={chapterData}
            isInterlinear={isInterlinear}
            isSplit={false}
            theme={theme}
            onScroll={handleScroll}
            {...{
              onStrongWordClicked,
              onInterlinear,
              onAnotar,
              onComparar,
              onWordClicked,
            }}
          />
        )}
      </SwipeWrapper>
      {!isPlayerOpened && (
        <View
          style={[
            styles.audioButton,
            { backgroundColor: theme.colors.notification + 90 },
          ]}
        >
          <TouchableOpacity
            ref={tourState$.audio.get()}
            style={{}}
            onPress={() => audioState$.toggleIsPlayerOpened()}
          >
            <Icon name="Play" color="white" size={24} />
          </TouchableOpacity>
        </View>
      )}

      <Animated.View style={[styles.footer]}>
        <BibleFooter isSplit={false} />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    height: 50,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    height: 70,
  },
  progressContainer: {
    position: "absolute",
    width: "100%",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    backgroundColor: "transparent",
    paddingHorizontal: 8,
  },
  audioButton: {
    position: "absolute",
    bottom: 60,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
});

export default BibleTop;
// export default withRenderCount(BibleTop);
