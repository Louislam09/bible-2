import BottomModal from "@/components/BottomModal";
import CompareVersions from "@/components/CompareVersions";
import NoteNameList from "@/components/home/NoteNameList";
import { getBookDetail } from "@/constants/BookNames";
import { storedData$ } from "@/context/LocalstoreContext";
import { useMyTheme } from "@/context/ThemeContext";
import { audioState$ } from "@/hooks/useAudioPlayer";
import { bibleState$ } from "@/state/bibleState";
import { modalState$ } from "@/state/modalState";
import { TTheme } from "@/types";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { use$ } from "@legendapp/state/react";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet } from "react-native";
import ExpandableChooseReference from "./animations/expandable-choose-reference";
import { AudioPlayerExpandedSheet } from "./animations/expandable-mini-player";
import InterlinearVerse from "./home/content/InterlinearVerse";
import MultipleStrongsContentBottomModal from "./home/content/MultipleStrongsContentBottomSheet";
import StrongContentBottomModal from "./home/content/StrongContentBottomModal";
import { Text, View } from "./Themed";
import DictionaryBottomModalContent from "./DictionaryBottomModalContent";
import CommentaryBottomSheet from "./CommentaryBottomSheet";
import WebviewBibleSettingBottomModal from "./home/WebviewBibleSettingBottomModal";

const BookContentModals = () => {
  const { theme } = useMyTheme();
  const styles = getStyles(theme);
  const fontSize = use$(() => storedData$.fontSize.get());
  const navigation = useNavigation();
  const verseToInterlinear = use$(() => bibleState$.verseToInterlinear.get());
  const multipleStrongsData = use$(() => bibleState$.multipleStrongsData.get());
  const isPlayerOpened = use$(() => audioState$.isPlayerOpened.get());
  const commentaryReference = use$(() => modalState$.commentaryReference.get());

  // Get all refs directly without reactive subscriptions (refs don't need reactivity)
  const noteListBottomSheetRef = bibleState$.noteListBottomSheetRef.get();
  const interlinealRef = modalState$.interlinealRef.get();
  const dictionaryRef = modalState$.dictionaryRef.get();
  const compareRef = modalState$.compareRef.get();

  return (
    <>
      <BottomModal
        justOneSnap
        showIndicator
        justOneValue={["50%"]}
        startAT={0}
        ref={noteListBottomSheetRef}
      >
        <NoteNameList />
      </BottomModal>
      {/* {isChooseReferenceOpened && <ExpandableChooseReference />} */}
      <ExpandableChooseReference />
      {isPlayerOpened && <AudioPlayerExpandedSheet />}

      <BottomSheet
        ref={interlinealRef}
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

      <MultipleStrongsContentBottomModal
        theme={theme}
        navigation={navigation}
        fontSize={fontSize}
        data={multipleStrongsData as any}
      />

      <WebviewBibleSettingBottomModal />

      <StrongContentBottomModal
        theme={theme}
        navigation={navigation}
        fontSize={fontSize}
      />

      <BottomModal
        style={styles.bottomSheet}
        backgroundColor={theme.dark ? theme.colors.background : "#eee"}
        shouldScroll={false}
        ref={dictionaryRef}
        justOneSnap
        showIndicator
        justOneValue={["60%"]}
        startAT={0}
      >
        <DictionaryBottomModalContent
          navigation={navigation}
          theme={theme}
          fontSize={fontSize}
        />
      </BottomModal>

      <BottomModal shouldScroll startAT={3} ref={compareRef}>
        <CompareVersions
          {...{
            theme,
            book: "Génesis",
            chapter: 1,
            navigation,
            compareRef: compareRef,
          }}
        />
      </BottomModal>

      <CommentaryBottomSheet
        bookNumber={commentaryReference.bookNumber}
        chapter={commentaryReference.chapter}
        verse={commentaryReference.verse}
      />
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
      // backgroundColor: colors.background + 99,
      borderWidth: 2,
    },
  });

export default BookContentModals;
