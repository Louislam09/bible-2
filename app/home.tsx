import React, {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Animated,
  SafeAreaView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";

import { useBibleContext } from "@/context/BibleContext";

import BibleBottom from "@/components/BibleBottom";
import BibleTop from "@/components/BibleTop";
import BookContentModals from "@/components/book-content-modals";
import BottomModal from "@/components/BottomModal";
import CurrentNoteDetail from "@/components/CurrentNoteDetail";
import FloatingButton from "@/components/FloatingButton";
import NoteNameList from "@/components/home/NoteNameList";
import Walkthrough from "@/components/Walkthrough";
import { useTheme } from "@react-navigation/native";
// import CustomHeader from "../components/home/header";

import BibleHeader from "@/components/home/header/BibleHeader";
import StatusBarBackground from "@/components/StatusBarBackground";
import { useInitialState } from "@/hooks/useInitialState";
import { useSplitScreen } from "@/hooks/useSplitScreen";
import { bibleState$, getReadingTime } from "@/state/bibleState";
import { tourState$ } from "@/state/tourState";
import { IBookVerse, TTheme } from "@/types";
import { use$, useObservable } from "@legendapp/state/react";
import { Stack, useNavigation } from "expo-router";
import { DB_BOOK_NAMES } from "@/constants/BookNames";
import { getDatabaseQueryKey } from "@/constants/databaseNames";
import { QUERY_BY_DB } from "@/constants/Queries";
import { batch } from "@legendapp/state";
import { useDBContext } from "@/context/databaseContext";
import { BibleChapterProvider } from "@/context/BibleChapterContext";

// Constants
const MIN_SPLIT_SIZE = 200;
const ANIMATION_DELAY = 100;

interface SplitConfig {
  minTopHeight: number;
  maxTopHeight: number;
  minWidth: number;
  maxWidth: number;
}

interface TutorialStep {
  text: string;
  target: RefObject<any> | null;
}

type HomeScreenProps = {};

const HomeScreen: React.FC<HomeScreenProps> = () => {
  console.log(`🏠 HomeScreen Component Rendered`);
  const navigation = useNavigation();
  const theme = useTheme();
  const { orientation } = useBibleContext();
  const isSplitActived = use$(() => bibleState$.isSplitActived.get());
  // const { executeSql, isMyBibleDbLoaded } = useDBContext();

  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const initialState = useInitialState();

  const [stepIndex, setStepIndex] = useState(0);
  const isPortrait = orientation === "PORTRAIT";
  const styles = useMemo(
    () => getStyles(theme, isPortrait),
    [theme, isPortrait]
  );

  const { topHeight, topWidth, panResponder, backgroundColor } = useSplitScreen(
    {
      screenWidth: SCREEN_WIDTH,
      screenHeight: SCREEN_HEIGHT,
      theme,
      minSplitSize: MIN_SPLIT_SIZE,
    }
  );

  const tourPopoverVisible = use$(() => tourState$.tourPopoverVisible.get());

  const tutorialSteps = useMemo<TutorialStep[]>(
    () => [
      {
        text: "🏠 Toque aquí para ir a la pantalla principal.",
        target: null,
      },
      {
        text: "✂️ Toque aquí para partir la pantalla en dos secciones de escrituras.",
        target: tourState$.fav.get(),
      },
      {
        text: "⏪⏩ Toque las flechas para moverse atras/delante en su historial de busqueda.",
        target: tourState$.setting.get(),
      },
      {
        text: "🔍 Toque aquí para buscar en la escritura.",
        target: tourState$.search.get(),
      },
      {
        text: "📑 Toque aquí para cambiar la versión de la escritura.",
        target: tourState$.bibleVersion.get(),
      },
      {
        text: "📚 Toque aquí para elegir un libro.",
        target: tourState$.footerTitleRef.get(),
      },
      {
        text: "⬅️ Toque aquí para retroceder al capítulo anterior.",
        target: tourState$.backButton.get(),
      },
      {
        text: "➡️ Toque aquí para pasar al siguiente capítulo.",
        target: tourState$.nextButton.get(),
      },
      {
        text: "🔊 Toque aquí para escuchar el capítulo.",
        target: tourState$.audio.get(),
      },
    ],
    [tourPopoverVisible]
  );

  // const shouldFetch = use$(() => bibleState$.bibleQuery.shouldFetch.get());
  // const bibleQuery = bibleState$.bibleQuery.get();

  // const fetchChapter = async () => {
  //   console.log("🟢 Fetching chapter 🟢");
  //   const { book, chapter, verse, isBibleBottom } = bibleQuery;
  //   const loadingKey = isBibleBottom ? "bottom" : "top";
  //   const targetBook = isBibleBottom ? bibleQuery.bottomSideBook : book;
  //   const targetChapter = isBibleBottom
  //     ? bibleQuery.bottomSideChapter
  //     : chapter;
  //   const targetVerse = isBibleBottom ? bibleQuery.bottomSideVerse : verse;
  //   const currentBook = DB_BOOK_NAMES.find((x) => x.longName === targetBook);

  //   const queryKey = getDatabaseQueryKey(currentBibleVersion);
  //   const query = QUERY_BY_DB[queryKey];
  //   const startTime = Date.now();
  //   try {
  //     const verses = await executeSql<IBookVerse>(
  //       query.GET_VERSES_BY_BOOK_AND_CHAPTER,
  //       [currentBook?.bookNumber, targetChapter || 1],
  //       "verses"
  //     );

  //     const endTime = Date.now();
  //     const executionTime = endTime - startTime;

  //     console.log(
  //       `📚 ${targetBook} ${targetChapter}:${targetVerse} in ${executionTime} ms. ${verses.length}`
  //     );

  //     batch(() => {
  //       bibleState$.bibleQuery.isBibleBottom.set(false);
  //       bibleState$.bibleQuery.shouldFetch.set(false);
  //       bibleState$.bibleData[`${loadingKey}Verses`].set(verses);
  //       bibleState$.readingTimeData[loadingKey].set(getReadingTime(verses));
  //       bibleState$.isDataLoading[loadingKey].set(false);
  //       console.log("✅ Data Fetched ✅");
  //     });
  //   } catch (error) {
  //     console.error("Error fetching Bible data:", error);
  //     batch(() => {
  //       bibleState$.bibleQuery.isBibleBottom.set(false);
  //       bibleState$.bibleQuery.shouldFetch.set(false);
  //       bibleState$.isDataLoading[loadingKey].set(false);
  //     });
  //   }
  // };

  // useEffect(() => {
  //   if (!isMyBibleDbLoaded) return;
  //   if (!bibleQuery.shouldFetch) return;
  //   fetchChapter();
  // }, [shouldFetch, isMyBibleDbLoaded]);

  const renderBottomContent = useCallback(() => {
    return (
      <>
        <Animated.View
          {...panResponder.panHandlers}
          style={[styles.slider, { backgroundColor }]}
        >
          <View style={styles.sliderHandle} />
        </Animated.View>
        <BibleBottom
          book={initialState.bottomSideBook}
          chapter={initialState.bottomSideChapter}
          verse={initialState.bottomSideVerse}
          height={Animated.subtract(
            new Animated.Value(SCREEN_HEIGHT),
            topHeight
          )}
          width={Animated.subtract(new Animated.Value(SCREEN_WIDTH), topWidth)}
          navigation={navigation}
        />
      </>
    );
  }, [initialState, SCREEN_HEIGHT, SCREEN_WIDTH, navigation, backgroundColor]);

  return (
    <BibleChapterProvider>
      <StatusBarBackground>
        <SafeAreaView key={orientation + theme.dark} style={[styles.container]}>
          <Stack.Screen options={{ headerShown: false }} />
          <BibleHeader />
          <View
            style={[styles.container, !isPortrait && { flexDirection: "row" }]}
          >
            <BibleTop height={topHeight} width={topWidth} />
            {isSplitActived && <>{renderBottomContent()}</>}
          </View>
          <>
            <BookContentModals
              book={initialState.book}
              chapter={initialState.chapter}
            />
            <FloatingButton iconName="NotebookText">
              <CurrentNoteDetail />
            </FloatingButton>

            <BottomModal
              shouldScroll
              justOneSnap
              justOneValue={["50%"]}
              startAT={0}
              ref={bibleState$.noteListBottomSheetRef.get()}
            >
              <NoteNameList />
            </BottomModal>
            {tourState$.tourPopoverVisible.get() === "FUNCTION" && (
              <Walkthrough
                steps={tutorialSteps}
                setStep={setStepIndex}
                currentStep={stepIndex}
              />
            )}
            {/* )} */}
          </>
        </SafeAreaView>
      </StatusBarBackground>
    </BibleChapterProvider>
  );
};

const getStyles = ({ colors }: TTheme, isPortrait: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      position: "relative",
      width: "100%",
      height: "100%",
    },
    separator: {
      position: "relative",
      width: "100%",
      borderColor: "red",
      borderWidth: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    separatorIcon: {
      position: "absolute",
      bottom: 0,
    },
    slider: {
      height: isPortrait ? 15 : "100%",
      justifyContent: "center",
      alignItems: "center",
      width: isPortrait ? "100%" : 10,
    },
    sliderHandle: {
      width: isPortrait ? 40 : 4,
      height: isPortrait ? 4 : 40,
      backgroundColor: colors.text,
      borderRadius: 2,
    },
  });

export default HomeScreen;
