import ColorPicker from "@/components/ColorPicker";
import Icon from "@/components/Icon";
import { View } from "@/components/Themed";
import { iconSize } from "@/constants/size";
import { TTheme } from "@/types";
import { useTheme } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import {
  RichEditor,
  RichToolbar,
  actions,
} from "react-native-pell-rich-editor";

const handleHead = ({ tintColor, label }: any) => (
  <Icon color={tintColor} size={iconSize} name={label} />
);

interface IRichEditor {
  onChangeText: any;
  value: any;
  readOnly: boolean;
  Textinput: any;
  isModal?: boolean;
  shouldOpenKeyboard?: boolean;
}

const MyRichEditor: React.FC<IRichEditor> = ({
  onChangeText,
  value,
  readOnly,
  Textinput,
  isModal,
  shouldOpenKeyboard,
}) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const richTextRef = useRef<RichEditor>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [textColor, setTextColor] = useState(theme.colors.text); // Default text color
  const [colorVisible, setColorVisible] = useState(false);

  const [cursorY, setCursorY] = useState(0);

  const toolbarActions = [
    actions.foreColor,
    actions.setBold,
    actions.setItalic,
    actions.setUnderline,
    actions.setParagraph,
    actions.heading2,
    actions.insertBulletsList,
    actions.alignLeft,
    actions.alignCenter,
    actions.alignRight,
  ];

  const handleScrollToCursor = () => {
    const offset = 150;
    scrollViewRef.current?.scrollTo({
      y: cursorY - offset,
      animated: true,
    });
  };

  useEffect(() => {
    if (!shouldOpenKeyboard) return;
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd();
      richTextRef.current?.focusContentEditor();
    }, 800);
  }, [shouldOpenKeyboard]);

  const handleColor = useCallback(() => {
    setColorVisible(!colorVisible);
  }, [colorVisible]);

  const onSelectColor = (color: string) => {
    setTextColor(color);
    richTextRef.current?.setForeColor(color);
  };

  return (
    <View style={{ flex: 1 }}>
      {(!readOnly) && <>{Textinput}</>}
      <ScrollView ref={scrollViewRef}>
        <RichEditor
          pasteAsPlainText
          initialHeight={600}
          onCursorPosition={(cursorY) => {
            setCursorY(cursorY);
          }}
          style={[
            value && {
              borderRadius: 15,
              paddingHorizontal: 5,
            },
          ]}
          ref={richTextRef}
          placeholder="Escribe aqui..."
          editorStyle={{
            backgroundColor: theme.colors.text + 30,
            color: theme.colors.text,
            caretColor: theme.colors.notification,
            placeholderColor: theme.colors.text + 90,
          }}
          onChange={(descriptionText: string) => {
            onChangeText(descriptionText);
            handleScrollToCursor();
          }}
          initialContentHTML={value}
          disabled={readOnly}
        />
      </ScrollView>

      {(colorVisible && !readOnly) && (
        <ColorPicker
          mainColor={theme.colors.text}
          onSelectColor={onSelectColor}
          onClose={() => setColorVisible(false)}
        />
      )}
      {!readOnly && (
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
            [actions.alignLeft]: ({ tintColor }: any) =>
              handleHead({ tintColor, label: "AlignLeft" }),
            [actions.alignRight]: ({ tintColor }: any) =>
              handleHead({ tintColor, label: "AlignRight" }),
            [actions.alignCenter]: ({ tintColor }: any) =>
              handleHead({ tintColor, label: "AlignCenter" }),
            [actions.setParagraph]: ({ tintColor }: any) =>
              handleHead({ tintColor, label: "Pilcrow" }),
            [actions.insertBulletsList]: ({ tintColor }: any) =>
              handleHead({ tintColor, label: "List" }),
            [actions.foreColor]: ({ tintColor }: any) =>
              handleHead({ tintColor: textColor, label: "Palette" }),
          }}
          foreColor={handleColor}
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
