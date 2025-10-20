import AiVerseExplanationContent from "@/components/ai/AiVerseExplanationContent";
import BottomModal from "@/components/BottomModal";
import CompareVersions from "@/components/CompareVersions";
import DictionaryContent from "@/components/DictionaryContent";
import NoteNameList from "@/components/home/NoteNameList";
import { getBookDetail } from "@/constants/BookNames";
import { useBibleContext } from "@/context/BibleContext";
import { useMyTheme } from "@/context/ThemeContext";
import { useGoogleAI } from "@/hooks/useGoogleAI";
import { bibleState$ } from "@/state/bibleState";
import { modalState$ } from "@/state/modalState";
import { TTheme } from "@/types";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { use$ } from "@legendapp/state/react";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import InterlinearVerse from "./home/content/InterlinearVerse";
import StrongContent from "./home/content/StrongContent";
import { Text, View } from "./Themed";
import ExpandableChooseReference from "./animations/expandable-choose-reference";
import { ExpandedSheet } from "./animations/expandable-mini-player";
import { audioState$ } from "@/hooks/useAudioPlayer";
import MultipleStrongsContent from "./home/content/MultipleStrongsContent";

const BookContentModals = () => {
  const { theme } = useMyTheme();
  const { fontSize } = useBibleContext();
  const styles = getStyles(theme);
  const navigation = useNavigation();
  const aiResponse = useGoogleAI();
  const verse = use$(() => bibleState$.verseToExplain.get());
  const verseToInterlinear = use$(() => bibleState$.verseToInterlinear.get());
  const multipleStrongsData = use$(() => bibleState$.multipleStrongsData.get());

  const isPlayerOpened = use$(() => audioState$.isPlayerOpened.get());
  useEffect(() => {
    if (aiResponse.loading) return;
    if (verse.text && !aiResponse.error) {
      console.log("fetching explanation");
      // aiResponse.fetchExplanation(verse);
    }
  }, [verse, aiResponse]);

  return (
    <>
      <BottomModal
        justOneSnap
        showIndicator
        justOneValue={["50%"]}
        startAT={0}
        ref={bibleState$.noteListBottomSheetRef.get()}
      >
        <NoteNameList />
      </BottomModal>
      {/* {isChooseReferenceOpened && <ExpandableChooseReference />} */}
      <ExpandableChooseReference />
      {isPlayerOpened && <ExpandedSheet />}

      <BottomSheet
        ref={modalState$.interlinealRef.get()}
        index={-1}
        snapPoints={["30%", "60%", "99%"]}
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
        <BottomSheetScrollView
          contentContainerStyle={{ backgroundColor: theme.colors.background }}
        >
          <View
            style={{ padding: 10, backgroundColor: theme.colors.background }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                textAlign: "center",
                // marginBottom: 10,
              }}
            >
              {getBookDetail(verseToInterlinear.book_number)?.longName || ""}
              {` ${verseToInterlinear.chapter}:${verseToInterlinear.verse}`}
            </Text>
            <InterlinearVerse withBackground item={verseToInterlinear as any} />
          </View>
        </BottomSheetScrollView>
      </BottomSheet>

      <BottomSheet
        backgroundStyle={styles.bottomSheet}
        enablePanDownToClose
        snapPoints={["30%", "60%"]}
        enableDynamicSizing={false}
        index={-1}
        ref={modalState$.strongSearchRef.get()}
        handleIndicatorStyle={{ backgroundColor: theme.colors.notification }}
        onClose={() => bibleState$.handleStrongWord({ text: "", code: "" })}
      >
        <BottomSheetScrollView
          contentContainerStyle={{ backgroundColor: theme.colors.background }}
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
        enableDynamicSizing={false}
        index={-1}
        ref={modalState$.explainVerseRef.get()}
        handleIndicatorStyle={{ backgroundColor: theme.colors.notification }}
        onClose={() =>
          bibleState$.handleVerseToExplain({ text: "", reference: "" })
        }
      >
        <BottomSheetScrollView
          contentContainerStyle={{ backgroundColor: theme.colors.background }}
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
            book: "Génesis",
            chapter: 1,
            navigation,
            compareRef: modalState$.compareRef.get(),
          }}
        />
      </BottomModal>

      <BottomSheet
        backgroundStyle={styles.bottomSheet}
        enablePanDownToClose
        snapPoints={["40%", "70%", "99%"]}
        enableDynamicSizing={false}
        index={-1}
        ref={modalState$.multipleStrongsRef.get()}
        handleIndicatorStyle={{ backgroundColor: theme.colors.notification }}
        onClose={() =>
          bibleState$.handleMultipleStrongs({
            word: "",
            strongNumbers: [],
            verseData: {},
          })
        }
      >
        <BottomSheetScrollView
          contentContainerStyle={{ backgroundColor: theme.colors.background }}
        >
          <MultipleStrongsContent
            navigation={navigation}
            theme={theme}
            fontSize={fontSize}
            data={multipleStrongsData as any}
          />
        </BottomSheetScrollView>
      </BottomSheet>
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
