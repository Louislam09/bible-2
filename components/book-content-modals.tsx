import NoteNameListBottomModal from "@/components/home/NoteNameListBottomModal";
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
import CommentaryBottomSheet from "./CommentaryBottomSheet";
import DictionaryContentBottomModal from "./DictionaryContentBottomModal";
import InterlinearVerse from "./home/content/InterlinearVerse";
import MultipleStrongsContentBottomModal from "./home/content/MultipleStrongsContentBottomSheet";
import StrongContentBottomModal from "./home/content/StrongContentBottomModal";
import WebviewBibleSettingBottomModal from "./home/WebviewBibleSettingBottomModal";
import { Text, View } from "./Themed";
import InterlinearBottomSheet from "./InterlinearBottomSheet";

const BookContentModals = () => {
  const { theme } = useMyTheme();
  const styles = getStyles(theme);
  const navigation = useNavigation();

  const fontSize = use$(() => storedData$.fontSize.get());
  const verseToInterlinear = use$(() => bibleState$.verseToInterlinear.get());
  const multipleStrongsData = use$(() => bibleState$.multipleStrongsData.get());
  const isPlayerOpened = use$(() => audioState$.isPlayerOpened.get());
  const commentaryReference = use$(() => modalState$.commentaryReference.get());

  const interlinealRef = modalState$.interlinealRef.get();

  return (
    <>
      <ExpandableChooseReference />
      {isPlayerOpened && <AudioPlayerExpandedSheet />}

      <StrongContentBottomModal
        theme={theme}
        navigation={navigation}
        fontSize={fontSize}
      />

      <MultipleStrongsContentBottomModal
        theme={theme}
        navigation={navigation}
        fontSize={fontSize}
        data={multipleStrongsData as any}
      />

      <DictionaryContentBottomModal
        navigation={navigation}
        theme={theme}
        fontSize={fontSize}
      />

      <WebviewBibleSettingBottomModal />

      <CommentaryBottomSheet
        bookNumber={commentaryReference.bookNumber}
        chapter={commentaryReference.chapter}
        verse={commentaryReference.verse}
      />

      <InterlinearBottomSheet />

      <NoteNameListBottomModal />

      {/* <BottomSheet
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
      </BottomSheet> */}
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
