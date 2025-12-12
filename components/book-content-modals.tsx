import NoteNameListBottomModal from "@/components/home/NoteNameListBottomModal";
import { storedData$ } from "@/context/LocalstoreContext";
import { useMyTheme } from "@/context/ThemeContext";
import { audioState$ } from "@/hooks/useAudioPlayer";
import { bibleState$ } from "@/state/bibleState";
import { modalState$ } from "@/state/modalState";
import { TTheme } from "@/types";
import { use$ } from "@legendapp/state/react";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet } from "react-native";
import ExpandableChooseReference from "./animations/expandable-choose-reference";
import { AudioPlayerExpandedSheet } from "./animations/expandable-mini-player";
import CommentaryBottomSheet from "./CommentaryBottomSheet";
import DictionaryContentBottomModal from "./DictionaryContentBottomModal";
import MultipleStrongsContentBottomModal from "./home/content/MultipleStrongsContentBottomSheet";
import StrongContentBottomModal from "./home/content/StrongContentBottomModal";
import WebviewBibleSettingBottomModal from "./home/WebviewBibleSettingBottomModal";
import InterlinearBottomSheet from "./InterlinearBottomSheet";

const BookContentModals = () => {
  const { theme } = useMyTheme();
  const navigation = useNavigation();

  const fontSize = use$(() => storedData$.fontSize.get());
  const multipleStrongsData = use$(() => bibleState$.multipleStrongsData.get());
  const isPlayerOpened = use$(() => audioState$.isPlayerOpened.get());
  const commentaryReference = use$(() => modalState$.commentaryReference.get());

  return (
    <>
      <WebviewBibleSettingBottomModal />

      <InterlinearBottomSheet />

      <NoteNameListBottomModal />

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
