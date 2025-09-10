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
import { ToolbarContext } from "./context/ToolbarContext";
import { HashtagPlugin } from "./plugins/LexicalHashtagPlugin";
import { HashtagNode } from "@lexical/hashtag";
import { BibleMentionPlugin } from "./plugins/BibleMentionPlugin";
import { BibleMentionNode } from "./plugins/BibleMentionNode";

const editorConfig: InitialConfigType = {
  namespace: "React.js Demo",
  nodes: [
    HeadingNode,
    QuoteNode,
    ListNode,
    ListItemNode,
    CodeNode,
    HashtagNode,
    BibleMentionNode,
  ],
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
  title?: string;
  onTitleChange: (title: string) => void;
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
  title = "",
  onTitleChange,
}: DomNoteEditorProps) => {
  const { colors } = theme;
  const isLoadingInitialContent = useRef(false);
  useThemeVariables(theme);

  const [toolbarHeight, setToolbarHeight] = useState({
    top: 48,
    bottom: 48,
  });

  return (
    <ToolbarContext>
      <div
        className={`rounded w-full h-full `}
        style={{ width: width || "100%", height: height || "100%" }}
      >
        <LexicalComposer initialConfig={editorConfig}>
          <ReadOnlyPlugin isReadOnly={isReadOnly} />
          <HashtagPlugin />
          <BibleMentionPlugin />
          <div
            className={`editor-container  text-sm text-left w-full h-full relative font-normal rounded-lg flex flex-col`}
            style={{ paddingTop: isReadOnly ? 0 : toolbarHeight.top }}
          >
            {!isReadOnly && (
              <div className={`fixed top-0 left-0 right-0 bg-white z-10 `}>
                <TopToolbarPlugin
                  onSave={onSave}
                  activeColor={colors.notification}
                  onTopToolbarHeightChange={(height: number) => {
                    setToolbarHeight((prev) => ({ ...prev, top: height }));
                  }}
                />
              </div>
            )}

            <div className="editor-inner !bg-white flex-1 overflow-y-auto">
              {/* Title Field */}
              {!isReadOnly && (
                <div className="px-4 py-3 border-b border-gray-200 bg-white">
                  <input
                    type="text"
                    defaultValue={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    placeholder="Enter note title..."
                    className="w-full text-xl font-semibold bg-transparent border-none outline-none placeholder-gray-400 text-gray-900 "
                  />
                </div>
              )}

              <RichTextPlugin
                contentEditable={
                  <ContentEditable
                    className="editor-input relative !bg-white !text-black !pb-[70px]"
                    // className="editor-input dark:!bg-black !bg-white dark:!text-white !text-black !caret-white !pb-[70px]"
                    aria-placeholder={placeholder}
                    placeholder={
                      <div className="text-black absolute top-16 left-2 select-none  text-base">
                        {placeholder}
                      </div>
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
                }}
                ignoreHistoryMergeTagChange
                ignoreSelectionChange
              />
              <HistoryPlugin />
              <AutoFocusPlugin />
              <AutoScrollPlugin />
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
              <div className="fixed bottom-0 left-0 right-0 bg-white  z-10 ">
                <BootomToolbarPlugin
                  activeColor={colors.notification}
                  onBottomToolbarHeightChange={(height: number) => {
                    setToolbarHeight((prev) => ({ ...prev, bottom: height }));
                  }}
                />
              </div>
            )}
          </div>
        </LexicalComposer>
      </div>
    </ToolbarContext>
  );
};

export default DomNoteEditor;
