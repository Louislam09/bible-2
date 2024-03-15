import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import {
  RichEditor,
  RichToolbar,
  actions,
} from "react-native-pell-rich-editor";
import { EViewMode } from "types";
import { customBorder } from "utils/customStyle";

const handleHead = ({ tintColor, label }: any) => (
  <MaterialCommunityIcons color={tintColor} size={22} name={label} />
);

interface IRichEditor {
  onSetContent: any;
  content: any;
  viewMode: keyof typeof EViewMode;
  Textinput: any;
}

const MyRichEditor: React.FC<IRichEditor> = ({
  onSetContent,
  content,
  viewMode,
  Textinput,
}) => {
  const richTextRef = useRef<RichEditor>(null);
  const theme = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [pos, setPos] = useState({
    cursorY: 0,
  });

  const toolbarActions = [
    actions.setBold,
    actions.setItalic,
    actions.setUnderline,
    actions.setParagraph,
    actions.heading2,
    actions.alignLeft,
    actions.alignCenter,
    actions.alignRight,
    actions.insertBulletsList,
    actions.undo,
    actions.redo,
  ];

  return (
    <View style={{ flex: 1 }}>
      {viewMode !== "VIEW" && (
        <>
          <RichToolbar
            style={{
              backgroundColor: theme.dark ? "#151517" : theme.colors.card,
              borderColor: "#ddd",
              borderWidth: 0.2,
              paddingHorizontal: 5,
              elevation: 3,
            }}
            editor={richTextRef}
            selectedIconTint={theme.colors.notification}
            actions={toolbarActions}
            iconMap={{
              [actions.heading2]: (props: any) =>
                handleHead({ ...props, label: "format-header-1" }),
              [actions.setParagraph]: (props: any) =>
                handleHead({ ...props, label: "format-paragraph" }),
            }}
          />
          {Textinput}
        </>
      )}
      <ScrollView ref={scrollViewRef}>
        {/* <KeyboardAvoidingView behavior="padding"> */}
        <RichEditor
          pasteAsPlainText
          initialHeight={200}
          onCursorPosition={(cursorY) => {
            setPos((prev) => ({ ...prev, cursorY }));
          }}
          editorInitializedCallback={() => {}}
          style={[
            content && {
              borderColor: theme.colors.text,
              marginTop: 5,
            },
          ]}
          ref={richTextRef}
          placeholder="Escribe tu nota"
          editorStyle={{
            backgroundColor: theme.colors.background,
            color: theme.colors.text,
            caretColor: theme.colors.notification,
          }}
          onChange={(descriptionText: string) => {
            onSetContent(descriptionText);
            const numberToCenterOffset = 150;
            scrollViewRef.current?.scrollTo({
              y: pos.cursorY - numberToCenterOffset,
              animated: true,
            });
          }}
          initialContentHTML={content}
          disabled={viewMode === "VIEW"}
        />
        {/* </KeyboardAvoidingView> */}
      </ScrollView>
    </View>
  );
};

export default MyRichEditor;
