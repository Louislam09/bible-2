import BottomModal from "@/components/BottomModal";
import CompareVersions from "@/components/CompareVersions";
import DictionaryContent from "@/components/DictionaryContent";
import { useBibleContext } from "@/context/BibleContext";
import { bibleState$ } from "@/state/bibleState";
import { modalState$ } from "@/state/modalState";
import { TTheme } from "@/types";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useNavigation, useTheme } from "@react-navigation/native";
import React from "react";
import { StyleSheet } from "react-native";
import StrongContent from "./home/content/StrongContent";
import { View } from "./Themed";

const BookContentModals = ({ book, chapter }: any) => {
  const theme = useTheme();
  const { fontSize } = useBibleContext();
  const styles = getStyles(theme);
  const navigation = useNavigation();

  return (
    <>
      <BottomSheet
        backgroundStyle={styles.bottomSheet}
        enablePanDownToClose
        snapPoints={["30%", "60%"]}
        index={-1}
        ref={modalState$.strongSearchRef.get()}
        handleIndicatorStyle={{ backgroundColor: theme.colors.notification }}
        onClose={() => bibleState$.handleStrongWord({ text: "", code: "" })}
      >
        <BottomSheetScrollView
          contentContainerStyle={{ backgroundColor: "transparent" }}
        >
          <StrongContent
            navigation={navigation}
            theme={theme}
            fontSize={fontSize}
          />
        </BottomSheetScrollView>
      </BottomSheet>
      <View></View>

      <BottomModal
        backgroundColor={theme.dark ? theme.colors.background : "#eee"}
        shouldScroll
        startAT={2}
        ref={modalState$.dictionaryRef.get()}
      >
        <DictionaryContent
          navigation={navigation}
          theme={theme}
          fontSize={fontSize}
        />
      </BottomModal>

      <BottomModal shouldScroll startAT={3} ref={modalState$.compareRef.get()}>
        <CompareVersions
          {...{
            theme,
            book,
            chapter,
            verse: bibleState$.verseToCompare.get() || 1,
            navigation,
            compareRef: modalState$.compareRef.get(),
          }}
        />
      </BottomModal>
    </>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    slider: {
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 10,
      width: "100%",
    },
    bottomSheet: {
      backgroundColor: colors.background,
      borderColor: colors.notification,
      borderWidth: 2,
    },
  });

export default BookContentModals;
