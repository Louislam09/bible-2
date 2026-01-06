import { useMyTheme } from "@/context/ThemeContext";
import useChangeBookOrChapter from "@/hooks/useChangeBookOrChapter";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";
import { bibleState$ } from "@/state/bibleState";
import { IBookVerse, IFavoriteVerse, OrientationType, Screens } from "@/types";
import { use$ } from "@legendapp/state/react";
import React, { FC, useCallback, useMemo } from "react";
import { ActivityIndicator, Dimensions, StyleSheet } from "react-native";
import { useAlert } from "@/context/AlertContext";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import Chapter from "./home/content/Chapter";
import BibleFooter from "./home/footer/BibleFooter";
import SwipeWrapper from "./SwipeWrapper";
import WebViewChapter from "./home/content/WebViewChapter";
import { getBookDetail } from "@/constants/BookNames";
import { storedData$ } from "@/context/LocalstoreContext";
import { modalState$ } from "@/state/modalState";
import copyToClipboard, { formatForImageQuote } from "@/utils/copyToClipboard";
import { WordTagPair, getStrongValue } from "@/utils/extractVersesInfo";
import { getVerseTextRaw } from "@/utils/getVerseTextRaw";
import { showToast } from "@/utils/showToast";
import { router } from "expo-router";
import { useBibleContext } from "@/context/BibleContext";
import { useMemorization } from "@/context/MemorizationContext";
import { useHaptics } from "@/hooks/useHaptics";

type BibleBottomContentProps = {
};

const BibleBottomContent: FC<BibleBottomContentProps> = ({ }) => {
  const { alertWarning } = useAlert();
  const { theme } = useMyTheme();
  const orientation = useDeviceOrientation();
  const isPortrait = orientation === OrientationType.PORTRAIT;
  const { selectBibleVersion, toggleFavoriteVerse } = useBibleContext();
  const { addVerse } = useMemorization();
  const haptics = useHaptics();

  const isSplitActived = use$(() => bibleState$.isSplitActived.get());
  const isDataLoading = use$(() => bibleState$.isDataLoading.bottom.get());
  const bottomVerses = use$(() => bibleState$.bibleData.bottomVerses.get());
  const interlinearVerses = use$(
    () => bibleState$.bibleData.interlinearVerses.get() ?? []
  );
  const bibleQuery = use$(() => bibleState$.bibleQuery.get());

  const verse = bibleQuery?.bottomSideVerse || 1;
  const book = bibleQuery?.bottomSideBook || "Génesis";
  const chapter = bibleQuery?.bottomSideChapter || 1;

  const { nextChapter, previousChapter } = useChangeBookOrChapter({
    book,
    chapter,
    isSplit: true,
  });

  const initialScrollIndex = useMemo(
    () => Math.min(verse - 1, bottomVerses.length - 1),
    [verse, bottomVerses]
  );


  const containerAnimatedStyle = useAnimatedStyle(() => ({
    flex: 1,
    backgroundColor: theme.colors.background,
    position: "relative",
    width: "100%",
  }));

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

  // const onComparar = useCallback((item: IBookVerse) => {
  //   bibleState$.verseToCompare.set(item.verse);
  //   modalState$.openCompareBottomSheet();
  //   bibleState$.clearSelection();
  // }, []);

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
        alertWarning("Aviso", "No se ha configurado la API key de Google AI");
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
    [router, alertWarning]
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
    async ({ bookNumber, chapter, verse, isFav, text }: IFavoriteVerse) => {
      await toggleFavoriteVerse({
        bookNumber,
        chapter,
        verse,
        isFav,
        text,
      });
      bibleState$.clearSelection();
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


  return (
    <Animated.View style={[containerAnimatedStyle]}>
      <SwipeWrapper onSwipeLeft={nextChapter} onSwipeRight={previousChapter}>
        {isDataLoading ? (
          <ActivityIndicator />
        ) : (
          <WebViewChapter
            width={Dimensions.get("window").width}
            theme={theme}
            data={bottomVerses}
            initialScrollIndex={initialScrollIndex}
            isInterlinear={false}
            isSplit={false}
            onScroll={() => { }}
            {...{
              onStrongWordClicked,
              onInterlinear,
              onAnotar,
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
        )}
      </SwipeWrapper>
      <BibleFooter isSplit />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
  },
});

export default BibleBottomContent;
