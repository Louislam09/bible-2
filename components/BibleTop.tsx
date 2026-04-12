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
import { useChapterQuizAI } from "@/hooks/useChapterQuizAI";
import { chapterQuizCacheService } from "@/services/chapterQuizCacheService";
import { chapterQuizLocalDbService } from "@/services/chapterQuizLocalDbService";
import { bibleState$ } from "@/state/bibleState";
import { chapterQuizStateHelpers } from "@/state/chapterQuizState";
import { modalState$ } from "@/state/modalState";
import { tourState$ } from "@/state/tourState";
import { EBibleVersions, IBookVerse, IFavoriteVerse } from "@/types";
import copyToClipboard, { formatForImageQuote } from "@/utils/copyToClipboard";
import { getStrongValue, WordTagPair } from "@/utils/extractVersesInfo";
import { getChapterTextRaw, getVerseTextRaw } from "@/utils/getVerseTextRaw";
import { showToast } from "@/utils/showToast";
import { use$ } from "@legendapp/state/react";
import BottomModal from "@/components/BottomModal";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Dimensions, StyleSheet, TouchableOpacity } from "react-native";
import { useAlert } from "@/context/AlertContext";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import WebViewChapter from "./home/content/WebViewChapter";
import WebviewInterlinearChapter from "./home/content/WebviewInterlinearChapter";
import BibleFooter from "./home/footer/BibleFooter";
import SwipeWrapper from "./SwipeWrapper";
import { Text, View } from "./Themed";

interface BibleTopProps {
}

// rename this component to something more descriptive with header and footer
const BibleTop: FC<BibleTopProps> = ({ }) => {
  const { theme } = useMyTheme();
  const haptics = useHaptics();
  const router = useRouter();
  const { alertWarning } = useAlert();
  const { orientation, selectBibleVersion, toggleFavoriteVerse } = useBibleContext();
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
  const googleAIKey = use$(() => storedData$.googleAIKey.get());
  const completedByChapter = use$(() =>
    storedData$.chapterQuizCompletedByChapter.get()
  );
  const { loading: isPreparingQuiz, getQuestionsForChapter } = useChapterQuizAI(googleAIKey);
  const quizCountSheetRef = useRef<BottomSheetModal>(null);
  const [selectedQuestionCount, setSelectedQuestionCount] = useState(5);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [chapterQuizStatusByKey, setChapterQuizStatusByKey] = useState<
    Record<string, "take_quiz" | "completed" | "retake">
  >({});
  const quizQuestionCountOptions = [5, 10, 15, 20];
  const chapterKey = `${book.trim().toLowerCase()}-${chapter}`;

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

  useEffect(() => {
    let isMounted = true;
    const hydrateChapterQuizCompletion = async () => {
      try {
        const completionMap = await chapterQuizLocalDbService.getAllCompletions();
        if (!isMounted) return;
        if (Object.keys(completionMap).length > 0) {
          storedData$.chapterQuizCompletedByChapter.set((prev) => ({
            ...prev,
            ...completionMap,
          }));
        }
      } catch (error) {
        // Keep the UI working with whatever is already in memory.
      }
    };
    hydrateChapterQuizCompletion();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (isInterlinear) return;
    if (!chapterData || chapterData.length === 0) return;

    let isActive = true;
    const prefetchQuizInBackground = () => {
      const key = chapterQuizCacheService.buildChapterKey(book, chapter);
      void chapterQuizCacheService
        .getValidChapterQuestions(key)
        .then((questions) => {
          if (!isActive || !questions || questions.length === 0) return;
          chapterQuizStateHelpers.setPrefetchedQuestions(key, questions);
        })
        .catch(() => {
          // Ignore background prefetch failures.
        });
    };

    const timer = setTimeout(prefetchQuizInBackground, 250);
    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [book, chapter, chapterData, isInterlinear]);

  useEffect(() => {
    const completion = completedByChapter[chapterKey];
    if (!completion) return;

    setChapterQuizStatusByKey((prev) => ({ ...prev, [chapterKey]: "completed" }));
    const timeout = setTimeout(() => {
      setChapterQuizStatusByKey((prev) => {
        if (prev[chapterKey] !== "completed") return prev;
        return { ...prev, [chapterKey]: "retake" };
      });
    }, 1400);

    return () => clearTimeout(timeout);
  }, [chapterKey, completedByChapter]);

  const headerHeight = useSharedValue(1);

  const handleOpenQuizSelector = useCallback(() => {
    if (isPreparingQuiz || isGeneratingQuiz) return;
    const hasAIKey = storedData$.googleAIKey.get();
    if (!hasAIKey) {
      alertWarning("Aviso", "Configura tu API key de Google AI para crear quizzes");
      return;
    }
    requestAnimationFrame(() => {
      quizCountSheetRef.current?.present();
    });
  }, [alertWarning, isPreparingQuiz, isGeneratingQuiz]);

  const handleStartChapterQuiz = useCallback(
    async (questionCount: number) => {
      try {
        setSelectedQuestionCount(questionCount);
        setIsGeneratingQuiz(true);

        const versesText = getChapterTextRaw(chapterData);
        const result = await getQuestionsForChapter({
          book,
          chapter,
          requestedCount: questionCount,
          versesText,
        });

        chapterQuizStateHelpers.setActiveQuiz({
          chapterKey: result.chapterKey,
          book,
          chapter,
          requestedCount: questionCount,
          questions: result.questions,
        });

        quizCountSheetRef.current?.dismiss();
        modalState$.openChapterQuizBottomSheet();
      } catch (error) {
        alertWarning("Error", "No se pudo preparar el quiz. Intenta nuevamente.");
      } finally {
        setIsGeneratingQuiz(false);
      }
    },
    [book, chapter, chapterData, getQuestionsForChapter, router, alertWarning]
  );

  const headerStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: headerHeight.value }],
    opacity: headerHeight.value,
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
      if (!bibleState$.currentNoteId.get()) modalState$.openNoteListBottomSheet();
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
    if (!bibleState$.currentNoteId.get()) modalState$.openNoteListBottomSheet();
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
    [alertWarning, router]
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

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    flex: 1,
    backgroundColor: theme.colors.background,
    position: "relative",
    width: "100%",
  }));

  const showRegularChapter = !isInterlinear;
  const currentQuizStatus = chapterQuizStatusByKey[chapterKey] || "take_quiz";
  const quizButtonLabel =
    isPreparingQuiz || isGeneratingQuiz
      ? "Preparando preguntas..."
      : currentQuizStatus === "completed"
        ? "Quiz completado"
        : currentQuizStatus === "retake"
          ? "Volver a hacer quiz"
          : "Tomar quiz";

  return (
    <Animated.View style={[containerAnimatedStyle]}>
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
        ) : showRegularChapter ? (
          <WebViewChapter
            width={Dimensions.get("window").width}
            theme={theme}
            data={chapterData}
            initialScrollIndex={initialScrollIndex}
            isInterlinear={isInterlinear}
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
              onChapterQuizPressed: handleOpenQuizSelector,
              quizButtonText: quizButtonLabel,
            }}
          />
        ) : (
          <WebviewInterlinearChapter theme={theme} data={chapterData} />
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

      <BottomModal
        ref={quizCountSheetRef}
        _theme={theme}
        justOneSnap
        showIndicator
        justOneValue={["52%"]}
        startAT={0}
        shouldScroll={false}
      >
        <View style={styles.quizSheetContent}>
          <Text style={[styles.quizModalTitle, { color: theme.colors.text }]}>
            Selecciona número de preguntas
          </Text>
          <View style={styles.quizModalOptions}>
            {quizQuestionCountOptions.map((count) => (
              <TouchableOpacity
                key={count}
                style={[
                  styles.quizOptionButton,
                  {
                    borderColor:
                      selectedQuestionCount === count
                        ? theme.colors.notification
                        : theme.colors.text + "40",
                    backgroundColor:
                      selectedQuestionCount === count
                        ? theme.colors.notification + "25"
                        : "transparent",
                  },
                ]}
                onPress={() => {
                  if (isPreparingQuiz || isGeneratingQuiz) return;
                  setSelectedQuestionCount(count);
                  handleStartChapterQuiz(count);
                }}
                disabled={isPreparingQuiz || isGeneratingQuiz}
              >
                <Text style={[styles.quizOptionText, { color: theme.colors.text }]}>
                  {count} preguntas
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {(isPreparingQuiz || isGeneratingQuiz) && (
            <View style={styles.quizLoadingContainer}>
              <ActivityIndicator color={theme.colors.notification} />
              <Text style={[styles.quizLoadingText, { color: theme.colors.text }]}>
                Generando preguntas del capitulo...
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.quizModalCloseButton}
            disabled={isPreparingQuiz || isGeneratingQuiz}
            onPress={() => quizCountSheetRef.current?.dismiss()}
          >
            <Text style={{ color: theme.colors.text, opacity: isPreparingQuiz || isGeneratingQuiz ? 0.5 : 1 }}>
              Cancelar
            </Text>
          </TouchableOpacity>
        </View>
      </BottomModal>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  quizSheetContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
  },
  quizModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  quizModalOptions: {
    gap: 8,
    marginTop: 8,
  },
  quizOptionButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  quizOptionText: {
    fontSize: 15,
    fontWeight: "600",
  },
  quizModalCloseButton: {
    marginTop: 8,
    alignItems: "center",
    paddingVertical: 8,
  },
  quizLoadingContainer: {
    marginTop: 8,
    alignItems: "center",
    gap: 8,
  },
  quizLoadingText: {
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
  },
});

export default BibleTop;
// export default withRenderCount(BibleTop);
