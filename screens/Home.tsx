import BottomSheet from "@gorhom/bottom-sheet";
import { useRoute, useTheme } from "@react-navigation/native";
import CustomBottomSheet from "components/BottomSheet";
import Walkthrough from "components/Walkthrough";
import StrongContent from "components/home/content/StrongContent";
import { useBibleContext } from "context/BibleContext";
import React, { useCallback, useRef, useState } from "react";
import {
  Animated,
  PanResponder,
  PanResponderGestureState,
  SafeAreaView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { HomeParams, TTheme } from "types";
import BookContent from "../components/home/content";
import CustomFooter from "../components/home/footer";
import CustomHeader from "../components/home/header";
import SplitBottomSide from "components/SplitBottomSide";
import SplitTopSide from "components/SplitTopSide";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AdjustableSplitScreen from "components/AdjustableSplitScreen";

function HomeScreen() {
  const theme = useTheme();
  const route = useRoute();
  const {
    isTour,
    book,
    chapter,
    verse,
    bottomSideBook,
    bottomSideChapter,
    bottomSideVerse,
  } = route.params as HomeParams;
  const [stepIndex, setStepIndex] = useState(0);
  const sheetRef = useRef<BottomSheet>(null);
  const bookRef = useRef<any>(null);
  const nextRef = useRef<any>(null);
  const backRef = useRef<any>(null);
  const audioRef = useRef<any>(null);
  const dashboardRef = useRef<any>(null);
  const bibleVersionRef = useRef<any>(null);
  const searchRef = useRef<any>(null);
  const settingRef = useRef<any>(null);
  const favRef = useRef<any>(null);
  const {
    strongWord,
    fontSize,
    setStrongWord,
    onAddToNote,
    isSplitActived,
    orientation,
  } = useBibleContext();
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const isPortrait = orientation === "PORTRAIT";
  const styles = getStyles(theme, isPortrait);

  const handleSheetChange = useCallback((index: any) => {
    if (!index) {
      setStrongWord({ code: "", text: "" });
      onAddToNote("");
    }
  }, []);

  const steps = [
    {
      text: "🏠 Toque aquí para ir a la pantalla principal.",
      target: dashboardRef,
    },
    {
      text: "🔙 Toque aquí para moverse atras en su historial de busqueda.",
      target: settingRef,
    },
    {
      text: "⏭️ Toque aquí para moverse adelante en su historial de busqueda.",
      target: favRef,
    },
    {
      text: "🔍 Toque aquí para buscar en la escritura.",
      target: searchRef,
    },
    {
      text: "📑 Toque aquí para cambiar la versión de la escritura.",
      target: bibleVersionRef,
    },
    {
      text: "📚 Toque aquí para elegir un libro.",
      target: bookRef,
    },
    {
      text: "⬅️ Toque aquí para retroceder al capítulo anterior.",
      target: backRef,
    },
    {
      text: "➡️ Toque aquí para pasar al siguiente capítulo.",
      target: nextRef,
    },
    {
      text: "🔊 Toque aquí para escuchar el capítulo.",
      target: audioRef,
    },
  ];

  const [topHeight] = useState(new Animated.Value(SCREEN_HEIGHT / 2));
  const [topWidth] = useState(new Animated.Value(SCREEN_WIDTH / 2));
  const screenHeight = useRef(SCREEN_HEIGHT).current;
  const lastTopHeight = useRef(SCREEN_HEIGHT);
  const lastTopWidth = useRef(SCREEN_WIDTH);
  const minTopHeight = 200;
  const maxTopHeight = SCREEN_HEIGHT - 200;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState: PanResponderGestureState) => {
      const newHeight = lastTopHeight.current + gestureState.dy;
      const newWidth = lastTopWidth.current + gestureState.dx;
      if (newWidth >= 200 && newWidth <= SCREEN_WIDTH - 200) {
        topWidth.setValue(newWidth);
      }
      if (newHeight >= minTopHeight && newHeight <= maxTopHeight) {
        topHeight.setValue(newHeight);
      }
    },
    onPanResponderRelease: () => {
      lastTopHeight.current = (topHeight as any)._value;
      lastTopWidth.current = (topWidth as any)._value;
    },
  });

  return (
    <SafeAreaView key={orientation} style={[styles.container]}>
      <CustomHeader
        {...{ bibleVersionRef, searchRef, favRef, settingRef, dashboardRef }}
      />

      <View style={[styles.container, !isPortrait && { flexDirection: "row" }]}>
        <SplitTopSide
          {...{
            audioRef,
            bookRef,
            backRef,
            nextRef,
            book,
            chapter,
            verse,
            height: topHeight,
            width: topWidth,
          }}
        />

        {/* AdjustableSplit */}
        <View
          {...panResponder.panHandlers}
          style={[
            styles.slider,
            { display: !isSplitActived ? "none" : "flex" },
          ]}
        >
          <View style={styles.sliderHandle} />
        </View>

        {isSplitActived && (
          <SplitBottomSide
            {...{
              audioRef,
              bookRef,
              backRef,
              nextRef,
              book: bottomSideBook,
              chapter: bottomSideChapter,
              verse: bottomSideVerse,
              height: Animated.subtract(
                new Animated.Value(screenHeight),
                topHeight
              ),
              width: Animated.subtract(
                new Animated.Value(SCREEN_WIDTH),
                topWidth
              ),
            }}
          />
        )}
      </View>
      {strongWord.code && (
        <View style={styles.strongContainer}>
          <CustomBottomSheet
            ref={sheetRef}
            handleSheetChange={handleSheetChange}
          >
            <StrongContent
              theme={theme}
              data={strongWord}
              fontSize={fontSize}
            />
          </CustomBottomSheet>
        </View>
      )}
      {bookRef.current && isTour && (
        <Walkthrough
          steps={steps}
          setStep={setStepIndex}
          currentStep={stepIndex}
        />
      )}
    </SafeAreaView>
  );
}

const getStyles = ({ colors }: TTheme, isPortrait: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      position: "relative",
      width: "100%",
      height: "100%",
    },
    strongContainer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      width: "100%",
      zIndex: 999,
      height: "60%",
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
      backgroundColor: colors.border,
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
