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

import { useHighlightRender } from "@/components/home/content/Chapter";
import BibleHeader from "@/components/home/header/BibleHeader";
import StatusBarBackground from "@/components/StatusBarBackground";
import BibleChapterProvider from "@/context/BibleChapterContext";
import { useInitialState } from "@/hooks/useInitialState";
import { useSplitScreen } from "@/hooks/useSplitScreen";
import { bibleState$ } from "@/state/bibleState";
import { tourState$ } from "@/state/tourState";
import { TTheme } from "@/types";
import { use$ } from "@legendapp/state/react";
import { Stack, useNavigation } from "expo-router";

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
  const navigation = useNavigation();
  const theme = useTheme();
  const { orientation } = useBibleContext();
  const isSplitActived = use$(() => bibleState$.isSplitActived.get());
  const tourPopoverVisible = use$(() => tourState$.tourPopoverVisible.get());

  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  // const initialState = useInitialState();
  const initialState = bibleState$.bibleQuery.get();

  // const { style } = useHighlightRender();

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
  }, [SCREEN_HEIGHT, SCREEN_WIDTH, backgroundColor]);

  return (
    // <Animated.View style={[{ flex: 1 }, style]}>
    <StatusBarBackground>
      <SafeAreaView key={orientation + theme.dark} style={[styles.container]}>
        <Stack.Screen options={{ headerShown: false }} />
        <BibleHeader />
        <View
          style={[styles.container, !isPortrait && { flexDirection: "row" }]}
        >
          <BibleTop height={topHeight} width={topWidth} />
          {isSplitActived && renderBottomContent()}
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
    // </Animated.View>
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
