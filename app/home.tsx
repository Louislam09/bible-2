import React, { RefObject, useCallback, useMemo } from "react";

import {
  Animated,
  SafeAreaView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";

import BibleBottom from "@/components/BibleBottom";
import BibleTop from "@/components/BibleTop";
import BookContentModals from "@/components/book-content-modals";
import CurrentNoteDetail from "@/components/CurrentNoteDetail";
import FloatingButton from "@/components/FloatingButton";
import { useMyTheme } from "@/context/ThemeContext";

import StatusBarBackground from "@/components/StatusBarBackground";
import withDrawTimeMeasurement from "@/components/withDrawTimeMeasurement";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";
import { useSplitScreen } from "@/hooks/useSplitScreen";
import { bibleState$ } from "@/state/bibleState";
import { tourState$ } from "@/state/tourState";
import { OrientationType, TTheme } from "@/types";
import { use$ } from "@legendapp/state/react";
import { Stack, useNavigation } from "expo-router";

// Constants
const MIN_SPLIT_SIZE = 200;
const ANIMATION_DELAY = 100;

interface TutorialStep {
  text: string;
  target: RefObject<any> | null;
}

type HomeScreenProps = {};

const HomeScreen: React.FC<HomeScreenProps> = () => {
  const navigation = useNavigation();
  const { theme } = useMyTheme();
  const orientation = useDeviceOrientation();
  const isSplitActived = use$(() => bibleState$.isSplitActived.get());
  const tourPopoverVisible = use$(() => tourState$.tourPopoverVisible.get());

  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const initialState = bibleState$.bibleQuery.get();

  const isPortrait = orientation === OrientationType.PORTRAIT;
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
    <StatusBarBackground>
      {/* <SafeAreaView key={theme.dark.toString()} style={[styles.container]}> */}
      <SafeAreaView style={[styles.container]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View
          style={[styles.container, !isPortrait && { flexDirection: "row" }]}
        >
          <BibleTop height={topHeight} width={topWidth} />
          {isSplitActived && renderBottomContent()}
        </View>
        <>
          <BookContentModals />

          <FloatingButton iconName="NotebookText">
            <CurrentNoteDetail />
          </FloatingButton>

          {/* {tourState$.tourPopoverVisible.get() === "FUNCTION" && (
            <Walkthrough
              steps={tutorialSteps}
              setStep={setStepIndex}
              currentStep={stepIndex}
            />
          )} */}
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

const MeasuredHomeScreen = withDrawTimeMeasurement(HomeScreen, {
  componentName: "HomeScreen",
  onDrawComplete: (drawTime) => {
    console.log(
      `🏠 Home Screen loaded in ${(drawTime / 1000).toFixed(3)} seconds`
    );
  },
});

export default MeasuredHomeScreen;

// export default HomeScreen;
