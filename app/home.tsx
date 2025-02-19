import React, {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
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
import { TTheme } from "@/types";
import { Stack, useNavigation, useRouter } from "expo-router";

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
  target: RefObject<any>;
}

type HomeScreenProps = {};

const HomeScreen: React.FC<HomeScreenProps> = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const theme = useTheme();
  const { noteListBottomSheetRef, isSplitActived, orientation } =
    useBibleContext();
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();

  const [stepIndex, setStepIndex] = useState(0);

  const isPortrait = orientation === "PORTRAIT";
  const styles = useMemo(
    () => getStyles(theme, isPortrait),
    [theme, isPortrait]
  );

  const initialState = useInitialState();

  const { topHeight, topWidth, panResponder, backgroundColor } = useSplitScreen(
    {
      screenWidth: SCREEN_WIDTH,
      screenHeight: SCREEN_HEIGHT,
      theme,
      minSplitSize: MIN_SPLIT_SIZE,
    }
  );

  const componentRefs = {
    book: useRef<any>(null),
    next: useRef<any>(null),
    back: useRef<any>(null),
    audio: useRef<any>(null),
    dashboard: useRef<any>(null),
    bibleVersion: useRef<any>(null),
    search: useRef<any>(null),
    setting: useRef<any>(null),
    fav: useRef<any>(null),
  };

  const tutorialSteps = useMemo<TutorialStep[]>(
    () => [
      {
        text: "🏠 Toque aquí para ir a la pantalla principal.",
        target: componentRefs.dashboard,
      },
      {
        text: "✂️ Toque aquí para partir la pantalla en dos secciones de escrituras.",
        target: componentRefs.fav,
      },
      {
        text: "⏪⏩ Toque las flechas para moverse atras/delante en su historial de busqueda.",
        target: componentRefs.setting,
      },
      {
        text: "🔍 Toque aquí para buscar en la escritura.",
        target: componentRefs.search,
      },
      {
        text: "📑 Toque aquí para cambiar la versión de la escritura.",
        target: componentRefs.bibleVersion,
      },
      {
        text: "📚 Toque aquí para elegir un libro.",
        target: componentRefs.book,
      },
      {
        text: "⬅️ Toque aquí para retroceder al capítulo anterior.",
        target: componentRefs.back,
      },
      {
        text: "➡️ Toque aquí para pasar al siguiente capítulo.",
        target: componentRefs.next,
      },
      {
        text: "🔊 Toque aquí para escuchar el capítulo.",
        target: componentRefs.audio,
      },
    ],
    [componentRefs]
  );

  const renderSplitScreenDivider = useCallback(() => {
    if (!isSplitActived) return null;

    return (
      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.slider, { backgroundColor }]}
      >
        <View style={styles.sliderHandle} />
      </Animated.View>
    );
  }, [isSplitActived, panResponder, backgroundColor, styles]);

  const renderBottomContent = useCallback(() => {
    if (!isSplitActived) return null;

    return (
      <BibleBottom
        refs={componentRefs}
        book={initialState.bottomSideBook}
        chapter={initialState.bottomSideChapter}
        verse={initialState.bottomSideVerse}
        height={Animated.subtract(new Animated.Value(SCREEN_HEIGHT), topHeight)}
        width={Animated.subtract(new Animated.Value(SCREEN_WIDTH), topWidth)}
        navigation={navigation}
      />
    );
  }, [
    isSplitActived,
    initialState,
    componentRefs,
    SCREEN_HEIGHT,
    SCREEN_WIDTH,
    navigation,
  ]);

  return (
    <StatusBarBackground>
      <SafeAreaView key={orientation + theme.dark} style={[styles.container]}>
        <Stack.Screen options={{ headerShown: false }} />
        <BibleHeader refs={componentRefs} />
        <View
          style={[styles.container, !isPortrait && { flexDirection: "row" }]}
        >
          <BibleTop
            refs={componentRefs}
            {...{
              ...initialState,
              height: topHeight,
              width: topWidth,
              navigation,
            }}
          />
          {isSplitActived && (
            <>
              {renderSplitScreenDivider()}
              {renderBottomContent()}
            </>
          )}
        </View>
        <>
          <BookContentModals
            book={initialState.book}
            chapter={initialState.chapter}
          />
          <FloatingButton iconName="NotebookText" navigation={router}>
            <CurrentNoteDetail />
          </FloatingButton>

          <BottomModal
            shouldScroll
            justOneSnap
            justOneValue={["50%"]}
            startAT={0}
            ref={noteListBottomSheetRef}
          >
            <NoteNameList {...{ theme }} />
          </BottomModal>
          {componentRefs.book.current && initialState.isTour === true && (
            <Walkthrough
              steps={tutorialSteps}
              setStep={setStepIndex}
              currentStep={stepIndex}
            />
          )}
        </>
      </SafeAreaView>
    </StatusBarBackground>
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
