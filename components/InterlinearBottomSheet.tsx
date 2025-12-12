import { storedData$ } from "@/context/LocalstoreContext";
import { useMyTheme } from "@/context/ThemeContext";
import { bibleState$ } from "@/state/bibleState";
import { modalState$ } from "@/state/modalState";
import { EBibleVersions, TTheme } from "@/types";
import BottomSheet from "@gorhom/bottom-sheet";
import { use$ } from "@legendapp/state/react";
import React, { useMemo } from "react";
import { StyleSheet } from "react-native";
import WebviewInterlinearChapter from "./home/content/WebviewInterlinearChapter";
import { View } from "./Themed";

interface InterlinearBottomSheetProps { }

const InterlinearBottomSheet: React.FC<InterlinearBottomSheetProps> = ({
}) => {
  const { theme } = useMyTheme();
  const styles = getStyles(theme);
  const currentBibleVersion = use$(() => storedData$.currentBibleVersion.get());

  const isHebrewInterlinear = [EBibleVersions.INTERLINEAR].includes(
    currentBibleVersion as EBibleVersions
  );

  const isGreekInterlinear = [EBibleVersions.GREEK].includes(
    currentBibleVersion as EBibleVersions
  );

  const isInterlinear = isHebrewInterlinear || isGreekInterlinear;
  const interlinearVerses = use$(() => bibleState$.bibleData.interlinearVerses.get()) ?? [];

  const chapterData = useMemo(() => {
    return interlinearVerses;
  }, [isInterlinear]);

  return (
    <BottomSheet
      ref={modalState$.interlinealRef.get()}
      index={-1}
      snapPoints={["50%", "99%"]}
      backgroundStyle={{
        ...styles.bottomSheet,
        backgroundColor: theme.colors.background,
      }}
      enablePanDownToClose
      handleIndicatorStyle={{ backgroundColor: theme.colors.notification }}
      enableDynamicSizing={false}
      onClose={() =>
        bibleState$.handleVerseToInterlinear({
          book_number: 0,
          chapter: 0,
          verse: 0,
          text: "",
        })
      }
    >
      <View style={styles.webviewWrapper}>
        <WebviewInterlinearChapter isModal theme={theme} data={chapterData} />
      </View>
    </BottomSheet>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    bottomSheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    webviewWrapper: {
      flex: 1,
      minWidth: "100%",
      backgroundColor: "transparent",
    },
  });

export default InterlinearBottomSheet;
