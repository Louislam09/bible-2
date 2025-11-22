import React, { RefObject, useCallback, useMemo } from "react";

import {
  Animated,
  SafeAreaView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";

import BibleBottom from "@/components/BibleBottom";
import BookContentModals from "@/components/book-content-modals";
import CurrentNoteDetail from "@/components/CurrentNoteDetail";
import FloatingButton from "@/components/FloatingButton";
import TutorialWalkthrough from "@/components/TutorialWalkthrough";
import { useMyTheme } from "@/context/ThemeContext";

import StatusBarBackground from "@/components/StatusBarBackground";
import withDrawTimeMeasurement from "@/components/withDrawTimeMeasurement";
import { useDeviceOrientation } from "@/hooks/useDeviceOrientation";
import { useSplitScreen } from "@/hooks/useSplitScreen";
import { bibleState$ } from "@/state/bibleState";
import { tourState$ } from "@/state/tourState";
import { OrientationType, TTheme } from "@/types";
import { observer, use$ } from "@legendapp/state/react";
import { Stack, useNavigation } from "expo-router";
import ResizableSplitView from "@/components/animations/resizable-split-view";
import BibleTop from "@/components/BibleTop";
import BibleBottomContent from "@/components/BibleBottomContent";

// Constants
const MIN_SPLIT_SIZE = 200;
const ANIMATION_DELAY = 100;

interface TutorialStep {
  text: string;
  target: RefObject<any> | null;
}

type HomeScreenProps = {};

const HomeScreen: React.FC<HomeScreenProps> = observer(() => {
  const { theme } = useMyTheme();
  const orientation = useDeviceOrientation();
  const isSplitActived = use$(() => bibleState$.isSplitActived.get());
  const tourPopoverVisible = use$(() => tourState$.tourPopoverVisible.get());

  const isPortrait = orientation === OrientationType.PORTRAIT;
  const styles = useMemo(
    () => getStyles(theme, isPortrait),
    [theme, isPortrait]
  );

  return (
    <StatusBarBackground>
      {/* <SafeAreaView key={theme.dark.toString()} style={[styles.container]}> */}
      <SafeAreaView style={[styles.container]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View
          style={[styles.container, !isPortrait && { flexDirection: "row" }]}
        >
          {isSplitActived ? (
            <ResizableSplitView
              topContent={<BibleTop />}
              bottomContent={<BibleBottomContent />}
            />
          ) : (
            <BibleTop />
          )}
          {/* <BibleTop height={topHeight} width={topWidth} /> */}
          {/* {isSplitActived && renderBottomContent()} */}
        </View>

        <>
          <BookContentModals />

          <FloatingButton iconName="NotebookText">
            <CurrentNoteDetail />
          </FloatingButton>

          <TutorialWalkthrough />
        </>
      </SafeAreaView>
    </StatusBarBackground>
  );
});

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
