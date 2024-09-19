import { useTheme } from "@react-navigation/native";
import Icon from "components/Icon";
import { Text } from "components/Themed";
import { iconSize } from "constants/size";
import React, { useEffect, useRef, useState } from "react";
import { Keyboard, ScrollView, StyleSheet, View } from "react-native";
import {
  RichEditor,
  RichToolbar,
  actions,
} from "react-native-pell-rich-editor";
import { EViewMode, TTheme } from "types";

const handleHead = ({ tintColor, label }: any) => (
  <Icon color={tintColor} size={iconSize} name={label} />
);

interface IRichEditor {
  onSetContent: any;
  content: any;
  isViewMode: boolean;
  Textinput: any;
  isModal?: boolean;
  shouldOpenKeyboard?: boolean
}

const MyRichEditor: React.FC<IRichEditor> = ({
  onSetContent,
  content,
  isViewMode,
  Textinput,
  isModal,
  shouldOpenKeyboard
}) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const richTextRef = useRef<RichEditor>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const [cursorY, setCursorY] = useState(0);

  const toolbarActions = [
    actions.setBold,
    actions.setItalic,
    actions.setUnderline,
    actions.setParagraph,
    actions.heading2,
    actions.alignFull,
    actions.alignLeft,
    actions.alignCenter,
    actions.alignRight,
    // actions.redo,
  ];

  const handleScrollToCursor = () => {
    const offset = 150; // Offset to adjust the cursor position in view
    scrollViewRef.current?.scrollTo({
      y: cursorY - offset,
      animated: true,
    });
  };

  useEffect(() => {
    if (!shouldOpenKeyboard) return
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd()
      richTextRef.current?.focusContentEditor()
    }, 800);
  }, [shouldOpenKeyboard])

  return (
    <View style={{ flex: 1 }}>
      {(!isViewMode || isModal) && <>{Textinput}</>}
      <ScrollView ref={scrollViewRef}>
        <RichEditor
          pasteAsPlainText
          initialHeight={200}
          onCursorPosition={(cursorY) => {
            setCursorY(cursorY);
          }}
          style={[
            content && {
              borderRadius: 15,
              paddingHorizontal: 5,
            },
          ]}
          ref={richTextRef}
          placeholder="Escribe aqui..."
          editorStyle={{
            backgroundColor: theme.colors.text + "30",
            color: theme.colors.text,
            caretColor: theme.colors.notification,
            placeholderColor: theme.colors.text + 90,
          }}
          onChange={(descriptionText: string) => {
            onSetContent(descriptionText);
            handleScrollToCursor();
          }}
          initialContentHTML={content}
          disabled={isViewMode}
        />
      </ScrollView>
      {!isViewMode && (
        <RichToolbar
          style={styles.richToolbar}
          editor={richTextRef}
          selectedIconTint={theme.colors.notification}
          actions={toolbarActions}
          iconMap={{
            [actions.setBold]: (props: any) =>
              handleHead({ ...props, label: "Bold" }),
            [actions.setItalic]: (props: any) =>
              handleHead({ ...props, label: "Italic" }),
            [actions.setUnderline]: (props: any) =>
              handleHead({ ...props, label: "Underline" }),
            [actions.heading2]: (props: any) =>
              handleHead({ ...props, label: "Heading1" }),
            [actions.alignFull]: ({ tintColor }: any) =>
              handleHead({ tintColor, label: "AlignJustify" }),
            [actions.alignLeft]: ({ tintColor }: any) =>
              handleHead({ tintColor, label: "AlignLeft" }),
            [actions.alignRight]: ({ tintColor }: any) =>
              handleHead({ tintColor, label: "AlignRight" }),
            [actions.alignCenter]: ({ tintColor }: any) =>
              handleHead({ tintColor, label: "AlignCenter" }),
            [actions.setParagraph]: ({ tintColor }: any) =>
              handleHead({ tintColor, label: "Pilcrow" }),
          }}
        />
      )}
    </View>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    richToolbar: {
      backgroundColor: colors.background,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 20,
    },
  });

export default MyRichEditor;
