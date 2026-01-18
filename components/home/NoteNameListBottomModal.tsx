import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { modalState$ } from "@/state/modalState";
import { useMyTheme } from "@/context/ThemeContext";
import { TTheme } from "@/types";
import BottomSheet from "@gorhom/bottom-sheet";
import { use$ } from "@legendapp/state/react";
import WebviewNotesList from "./content/WebviewNotesList";
import { View } from "../Themed";
import useBackHandler from "@/hooks/useBackHandler";

const NoteNameListBottomModal = () => {
  const { theme } = useMyTheme();
  const styles = getStyles(theme);
  const isOpen = use$(() => modalState$.isNoteListOpen.get());

  useBackHandler("BottomSheet", isOpen, () => {
    modalState$.closeNoteListBottomSheet();
  });

  // Open the bottom sheet when the component mounts
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      modalState$.noteListRef.current?.snapToIndex(0);
    }, 50);
    return () => clearTimeout(timer);
  }, [isOpen]);

  return (
    <BottomSheet
      ref={modalState$.noteListRef.get()}
      index={-1}
      snapPoints={["55%"]}
      backgroundStyle={{
        ...styles.bottomSheet,
        backgroundColor: theme.colors.background,
      }}
      enablePanDownToClose
      handleIndicatorStyle={{ backgroundColor: theme.colors.notification }}
      enableDynamicSizing={false}
      onClose={() => {
        modalState$.isNoteListOpen.set(false);
      }}
    >
      <View style={styles.webviewWrapper}>
        <WebviewNotesList theme={theme} />
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
      borderWidth: 1,
      borderColor: colors.notification,
    },
    webviewWrapper: {
      flex: 1,
      minWidth: "100%",
      backgroundColor: "transparent",
      paddingHorizontal: 1
    },
  });

export default NoteNameListBottomModal;
