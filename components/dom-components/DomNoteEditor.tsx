"use dom";
import "../../global.css";
import "./styles.css";

import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import {
  InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";

import { TTheme } from "@/types";
import { $generateHtmlFromNodes } from "@lexical/html";
import { $getRoot } from "lexical";
import { useRef, useState } from "react";
import { Dimensions } from "react-native";
import ExampleTheme from "./ExampleTheme";
import AutoScrollPlugin from "./plugins/AutoScrollPlugin";
import ReadOnlyPlugin from "./plugins/ReadOnlyPlugin";
import BootomToolbarPlugin from "./plugins/BootomToolbarPlugin";
const placeholder = "Enter some rich text...";

import { useThemeVariables } from "@/hooks/useThemeVariables";
import { CodeNode } from "@lexical/code";
import { ListItemNode, ListNode } from "@lexical/list";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import LoadHTMLPlugin from "./plugins/LoadHtmlPlugin";
import TopToolbarPlugin from "./plugins/TopToolbarPlugin";

const editorConfig: InitialConfigType = {
  namespace: "React.js Demo",
  nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, CodeNode],
  // Handling of errors during update
  onError(error: Error) {
    throw error;
  },
  // The editor theme
  theme: ExampleTheme,
};

interface DomNoteEditorProps {
  noteId?: string;
  isNewNote?: boolean;
  onChangeText: (text: string) => void;
  theme: TTheme;
  isReadOnly?: boolean;
  value?: string;
  width?: number;
  height?: number;
  onSave: () => Promise<void>;
  statusBarHeight?: number;
  // dom: import("expo/dom").DOMProps;
}

const DomNoteEditor = ({
  onChangeText,
  theme,
  isReadOnly = false,
  value,
  width,
  height,
  onSave,
  statusBarHeight,
}: DomNoteEditorProps) => {
  const { colors } = theme;
  const isLoadingInitialContent = useRef(false);
  useThemeVariables(theme);

  const [topToolbarHeight, setTopToolbarHeight] = useState(48);

  return (
    <div
      // className={`rounded w-full h-full pt-[${isReadOnly ? 0 : 26}px] `}
      className={`rounded w-full h-full  `}
      style={{ width: width || "100%", height: height || "100%" }}
    >
      <LexicalComposer initialConfig={editorConfig}>
        <ReadOnlyPlugin isReadOnly={isReadOnly} />
        <div
          className={`editor-container bg-theme-notification text-sm text-left w-full h-full relative font-normal rounded-lg flex flex-col`}
          style={{ paddingTop: topToolbarHeight }}
        >
          {!isReadOnly && (
            <div
              className={`fixed  top-0 left-0 right-0 bg-white border-t border-gray-200 z-10 `}
            >
              <TopToolbarPlugin
                onSave={onSave}
                activeColor={colors.notification}
                onTopToolbarHeightChange={(height: number) => {
                  console.log("topToolbarHeight,", height);
                  setTopToolbarHeight(height);
                }}
              />
            </div>
          )}
          <div className="editor-inner flex-1 overflow-y-auto">
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  className="editor-input !pb-[70px]"
                  aria-placeholder={placeholder}
                  placeholder={
                    <div className="editor-placeholder">{placeholder}</div>
                  }
                />
              }
              ErrorBoundary={LexicalErrorBoundary}
            />

            <OnChangePlugin
              onChange={(editorState, editor, tags) => {
                if (isLoadingInitialContent.current) return;
                editorState.read(() => {
                  const root = $getRoot();
                  const htmlString = $generateHtmlFromNodes(editor, null);
                  // const textContent = root.getTextContent();
                  onChangeText(htmlString);
                });
                //   setEditorState(JSON.stringify(editorState.toJSON()));
              }}
              ignoreHistoryMergeTagChange
              ignoreSelectionChange
            />
            <HistoryPlugin />
            <AutoFocusPlugin />
            <AutoScrollPlugin />
            {/* {!isReadOnly && <AutoScrollPlugin />} */}
            {isReadOnly && (
              <LoadHTMLPlugin
                htmlString={value || ""}
                onLoadStart={() => {
                  isLoadingInitialContent.current = true;
                }}
                onLoadEnd={() => {
                  isLoadingInitialContent.current = false;
                }}
              />
            )}
            {/* <TreeViewPlugin /> */}
          </div>
          {!isReadOnly && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10 ">
              <BootomToolbarPlugin activeColor={colors.notification} />
            </div>
          )}
        </div>
      </LexicalComposer>
    </div>
  );
};

export default DomNoteEditor;
