import BottomModal from "@/components/BottomModal";
import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import ScreenWithAnimation from "@/components/ScreenWithAnimation";
import BiblicalChronologyFAQ from "@/components/timeline/TimelineFAQ";
import TimelineList from "@/components/timeline/TimelineList";
import { useMyTheme } from "@/context/ThemeContext";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import React, { useCallback, useRef } from "react";
import { StyleSheet } from "react-native";

const timeline = () => {
  const { theme } = useMyTheme();
  const timelineFaqBottomSheetModalRef = useRef<BottomSheetModal>(null);

  const timelineFaqHandlePresentModalPress = useCallback(() => {
    timelineFaqBottomSheetModalRef.current?.present();
  }, []);

  return (
    <>
      <Stack.Screen
        options={{
          ...singleScreenHeader({
            theme,
            title: "Linea de tiempo",
            titleIcon: "CalendarRange",
            titleIconColor: "#6de5cb",
            headerRightProps: {
              headerRightIcon: "Info",
              headerRightIconColor: theme.colors.text,
              onPress: () => timelineFaqHandlePresentModalPress(),
              disabled: false,
              style: { opacity: 1 },
            },
          }),
        }}
      />
      <ScreenWithAnimation
        duration={800}
        speed={1}
        title="Linea de tiempo"
        icon="CalendarRange"
      >
        <TimelineList />
        <BottomModal
          justOneSnap
          showIndicator
          justOneValue={["90%"]}
          startAT={0}
          ref={timelineFaqBottomSheetModalRef}
          shouldScroll
        >
          <BiblicalChronologyFAQ />
        </BottomModal>
      </ScreenWithAnimation>
    </>
  );
};

export default timeline;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
  },
  list: {
    flex: 1,
    marginTop: 20,
  },
});
