import BottomModal from "@/components/BottomModal";
import CompareVersions from "@/components/CompareVersions";
import DictionaryContent from "@/components/DictionaryContent";
import AiVerseExplanationContent from "@/components/ai/AiVerseExplanationContent";
import { useBibleContext } from "@/context/BibleContext";
import { useGoogleAI } from "@/hooks/useGoogleAI";
import { bibleState$ } from "@/state/bibleState";
import { modalState$ } from "@/state/modalState";
import { TTheme } from "@/types";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { use$ } from "@legendapp/state/react";
import { useNavigation, useTheme } from "@react-navigation/native";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import StrongContent from "./home/content/StrongContent";

const BookContentModals = ({ book, chapter }: any) => {
  const theme = useTheme();
  const { fontSize } = useBibleContext();
  const styles = getStyles(theme);
  const navigation = useNavigation();
  const aiResponse = useGoogleAI();
  const verse = use$(() => bibleState$.verseToExplain.get());

  useEffect(() => {
    if (aiResponse.loading) return
    if (verse.text) aiResponse.fetchExplanation(verse);
  }, [verse, aiResponse]);

  useEffect(() => {
    if (!aiResponse.loading) {
      bibleState$.handleVerseWithAiAnimation(0);
      modalState$.openExplainVerseBottomSheet();
    }
  }, [aiResponse])

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

      <BottomSheet
        backgroundStyle={styles.bottomSheet}
        enablePanDownToClose
        snapPoints={["30%", "60%"]}
        index={-1}
        ref={modalState$.explainVerseRef.get()}
        handleIndicatorStyle={{ backgroundColor: theme.colors.notification }}
        onClose={() => bibleState$.handleVerseToExplain({ text: "", reference: "" })}
      >
        <BottomSheetScrollView
          contentContainerStyle={{ backgroundColor: "transparent" }}
        >
          <AiVerseExplanationContent
            navigation={navigation}
            theme={theme}
            fontSize={fontSize}
            aiResponse={aiResponse}
          />
        </BottomSheetScrollView>
      </BottomSheet>

      <BottomModal
        style={styles.bottomSheet}
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
      backgroundColor: colors.background + 99,
      borderColor: colors.notification + 99,
      borderWidth: 2,
    },
  });

export default BookContentModals;
