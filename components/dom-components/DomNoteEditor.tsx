"use dom";
import "../../global.css";
import "./styles.css";

import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";

import { TTheme } from "@/types";
import { $generateHtmlFromNodes } from "@lexical/html";
import { $getRoot } from "lexical";
import { Dimensions } from "react-native";
import { useRef } from "react";
import ExampleTheme from "./ExampleTheme";
import ReadOnlyPlugin from "./plugins/ReadOnlyPlugin";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
const placeholder = "Enter some rich text...";

import { CodeNode } from "@lexical/code";
import { ListItemNode, ListNode } from "@lexical/list";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import LoadHTMLPlugin from "./plugins/LoadHtmlPlugin";

const editorConfig = {
  namespace: "React.js Demo",
  nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, CodeNode],
  // Handling of errors during update
  onError(error: Error) {
    throw error;
  },
  // The editor theme
  theme: ExampleTheme,
};

const { width, height } = Dimensions.get("window");

interface DomNoteEditorProps {
  noteId?: string;
  isNewNote?: boolean;
  onChangeText: (text: string) => void;
  theme: TTheme;
  isReadOnly?: boolean;
  value?: string;
  dom: import("expo/dom").DOMProps;
}

const DomNoteEditor = ({
  onChangeText,
  theme,
  isReadOnly = false,
  value,
}: DomNoteEditorProps) => {
  const { colors } = theme;
  const isLoadingInitialContent = useRef(false);
  return (
    <div className={`rounded w-full px-1`} style={{ width, height }}>
      <LexicalComposer initialConfig={editorConfig}>
        <ReadOnlyPlugin isReadOnly={isReadOnly} />
        <div className="text-sm text-left w-full h-full text-black relative font-normal rounded-lg">
          {!isReadOnly && (
            <div className="sticky top-0 left-0 right-0 z-10 ">
              <ToolbarPlugin activeColor={colors.notification} />
            </div>
          )}

          <div className="editor-inner">
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  className="editor-input"
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
        </div>
      </LexicalComposer>
    </div>
  );
};

export default DomNoteEditor;
