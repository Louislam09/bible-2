import React, { useEffect, useMemo, useRef, useState } from "react";

import {
  Animated,
  BackHandler,
  PanResponder,
  PanResponderGestureState,
  SafeAreaView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";

import { useBibleContext } from "@/context/BibleContext";
import { useStorage } from "@/context/LocalstoreContext";

import { useTheme } from "@react-navigation/native";
import BookContentModals from "@/components/book-content-modals";
import BottomModal from "@/components/BottomModal";
import CurrentNoteDetail from "@/components/CurrentNoteDetail";
import FloatingButton from "@/components/FloatingButton";
import NoteNameList from "@/components/home/NoteNameList";
import SplitBottomSide from "@/components/SplitBottomSide";
import SplitTopSide from "@/components/SplitTopSide";
import Walkthrough from "@/components/Walkthrough";
// import CustomHeader from "../components/home/header";

import useParams from "@/hooks/useParams";
import CustomHeader from "@/components/home/header";
import { useRouter } from "expo-router";
import { HomeParams, TTheme } from "@/types";

// Constants
const MIN_SPLIT_SIZE = 200;
const ANIMATION_DELAY = 100;

interface SplitConfig {
  minTopHeight: number;
  maxTopHeight: number;
  minWidth: number;
  maxWidth: number;
}

type HomeScreenProps = {};

const HomeScreen: React.FC<HomeScreenProps> = () => {
  const router = useRouter();
  const routeParams = useParams<HomeParams>();

  const theme = useTheme();
  const { storedData } = useStorage();
  const { noteListBottomSheetRef } = useBibleContext();
  const { isSplitActived, orientation } = useBibleContext();
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();

  const [stepIndex, setStepIndex] = useState(0);
  const [topHeight] = useState(new Animated.Value(SCREEN_HEIGHT / 2));
  const [topWidth] = useState(new Animated.Value(SCREEN_WIDTH / 2));
  const [bColor] = useState(new Animated.Value(0));

  const isPortrait = orientation === "PORTRAIT";
  const styles = getStyles(theme, isPortrait);

  const initialState = useMemo(
    () => ({
      book: routeParams.book || storedData.lastBook,
      chapter: routeParams.chapter || storedData.lastChapter,
      verse:
        (routeParams.verse === 0 ? 1 : routeParams.verse) ||
        storedData.lastVerse,
      bottomSideBook:
        routeParams.bottomSideBook || storedData.lastBottomSideBook,
      bottomSideChapter:
        routeParams.bottomSideChapter || storedData.lastBottomSideChapter,
      bottomSideVerse:
        (routeParams.bottomSideVerse === 0 ? 1 : routeParams.bottomSideVerse) ||
        storedData.lastBottomSideVerse,
    }),
    [routeParams, storedData]
  );

  const screenHeight = useRef(SCREEN_HEIGHT).current;
  const lastTopHeight = useRef(SCREEN_HEIGHT);
  const lastTopWidth = useRef(SCREEN_WIDTH);
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

  const tutorialSteps = [
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
  ];

  const splitConfig: SplitConfig = useMemo(
    () => ({
      minTopHeight: MIN_SPLIT_SIZE,
      maxTopHeight: SCREEN_HEIGHT - MIN_SPLIT_SIZE,
      minWidth: MIN_SPLIT_SIZE,
      maxWidth: SCREEN_WIDTH - MIN_SPLIT_SIZE,
    }),
    [SCREEN_HEIGHT, SCREEN_WIDTH]
  );

  const animateBackgroundColor = (toValue: number) => {
    Animated.timing(bColor, {
      toValue,
      delay: ANIMATION_DELAY,
      useNativeDriver: false,
    }).start();
  };

  const backgroundColor = bColor.interpolate({
    inputRange: [0, 1],
    outputRange: [
      `${theme.colors.notification}30`,
      `${theme.colors.notification}90`,
    ],
  });

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => {
          animateBackgroundColor(1);
          return true;
        },
        onPanResponderMove: (_, gestureState: PanResponderGestureState) => {
          const newHeight = lastTopHeight.current + gestureState.dy;
          const newWidth = lastTopWidth.current + gestureState.dx;

          if (
            newWidth >= splitConfig.minWidth &&
            newWidth <= splitConfig.maxWidth
          ) {
            topWidth.setValue(newWidth);
          }
          if (
            newHeight >= splitConfig.minTopHeight &&
            newHeight <= splitConfig.maxTopHeight
          ) {
            topHeight.setValue(newHeight);
          }
        },
        onPanResponderRelease: () => {
          animateBackgroundColor(0);
          lastTopHeight.current = (topHeight as any)._value;
          lastTopWidth.current = (topWidth as any)._value;
        },
      }),
    [splitConfig, topHeight, topWidth]
  );

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        router.back();
        return true;
      }
    );
    return () => backHandler.remove();
  }, [router]);

  return (
    <SafeAreaView key={orientation + theme.dark} style={[styles.container]}>
      <CustomHeader refs={componentRefs} />
      <View style={[styles.container, !isPortrait && { flexDirection: "row" }]}>
        <SplitTopSide
          refs={componentRefs}
          {...{
            ...initialState,
            height: topHeight,
            width: topWidth,
            router,
          }}
        />
        {isSplitActived && (
          <>
            <Animated.View
              {...panResponder.panHandlers}
              style={[styles.slider, { backgroundColor }]}
            >
              <View style={styles.sliderHandle} />
            </Animated.View>
            <SplitBottomSide
              refs={componentRefs}
              {...{
                book: initialState.bottomSideBook,
                chapter: initialState.bottomSideChapter,
                verse: initialState.bottomSideVerse,
                height: Animated.subtract(
                  new Animated.Value(screenHeight),
                  topHeight
                ),
                width: Animated.subtract(
                  new Animated.Value(SCREEN_WIDTH),
                  topWidth
                ),
                router,
              }}
            />
          </>
        )}
      </View>
      <BookContentModals
        book={initialState.book}
        chapter={initialState.chapter}
      />

      <FloatingButton navigation={router}>
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
      {componentRefs.book.current && routeParams.isTour === true && (
        <Walkthrough
          steps={tutorialSteps}
          setStep={setStepIndex}
          currentStep={stepIndex}
        />
      )}
    </SafeAreaView>
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
