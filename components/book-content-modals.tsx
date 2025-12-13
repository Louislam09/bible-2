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

  // Modal open state flags for conditional rendering (only for WebView-based modals - most expensive)
  const isBibleSettingOpen = use$(() => modalState$.isBibleSettingOpen.get());
  const isInterlinearOpen = use$(() => modalState$.isInterlinearOpen.get());
  const isStrongSearchOpen = use$(() => modalState$.isStrongSearchOpen.get());
  const isMultipleStrongsOpen = use$(() => modalState$.isMultipleStrongsOpen.get());
  const isDictionaryOpen = use$(() => modalState$.isDictionaryOpen.get());
  const isCommentaryOpen = use$(() => modalState$.isCommentaryOpen.get());

  return (
    <>
      {/* WebView-based modals - conditionally rendered for performance */}
      {isBibleSettingOpen && <WebviewBibleSettingBottomModal />}
      {isInterlinearOpen && <InterlinearBottomSheet />}
      {isStrongSearchOpen && (
        <StrongContentBottomModal
          theme={theme}
          navigation={navigation}
          fontSize={fontSize}
        />
      )}
      {isMultipleStrongsOpen && (
        <MultipleStrongsContentBottomModal
          theme={theme}
          navigation={navigation}
          fontSize={fontSize}
          data={multipleStrongsData as any}
        />
      )}
      {isDictionaryOpen && (
        <DictionaryContentBottomModal
          navigation={navigation}
          theme={theme}
          fontSize={fontSize}
        />
      )}
      {isCommentaryOpen && (
        <CommentaryBottomSheet
          bookNumber={commentaryReference.bookNumber}
          chapter={commentaryReference.chapter}
          verse={commentaryReference.verse}
        />
      )}

      {/* Simpler modals - always mounted (less expensive) */}
      <NoteNameListBottomModal />
      <ExpandableChooseReference />
      {isPlayerOpened && <AudioPlayerExpandedSheet />}
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
