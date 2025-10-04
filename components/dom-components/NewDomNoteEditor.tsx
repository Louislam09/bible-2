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
import ExampleTheme from "./ExampleTheme";
import AutoScrollPlugin from "./plugins/AutoScrollPlugin";
import ReadOnlyPlugin from "./plugins/ReadOnlyPlugin";
import BootomToolbarPlugin from "./plugins/BootomToolbarPlugin";
const placeholder = "Escribe algo...";

import { useThemeVariables } from "@/hooks/useThemeVariables";
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { ListItemNode, ListNode } from "@lexical/list";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { LinkNode, AutoLinkNode } from "@lexical/link";
import LoadHTMLPlugin from "./plugins/LoadHtmlPlugin";
import TopToolbarPlugin from "./plugins/TopToolbarPlugin";
import { ToolbarContext } from "./context/ToolbarContext";
import { HashtagPlugin } from "./plugins/LexicalHashtagPlugin";
import { HashtagNode } from "@lexical/hashtag";
import { BibleMentionPlugin } from "./plugins/BibleMentionPlugin";
import { BibleMentionNode } from "./plugins/BibleMentionNode";
import NewTopToolbarPlugin from "./plugins/NewTopToolbarPlugin";

const editorConfig: InitialConfigType = {
  namespace: "React.js Demo",
  nodes: [
    HeadingNode,
    QuoteNode,
    ListNode,
    ListItemNode,
    CodeNode,
    CodeHighlightNode,
    HashtagNode,
    BibleMentionNode,
    LinkNode,
    AutoLinkNode,
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
  onChangeText: (key: "title" | "content", text: string) => void;
  theme: TTheme;
  isReadOnly?: boolean;
  value?: string;
  width?: number;
  height?: number;
  onSave: () => Promise<void>;
  title?: string;
  fetchBibleVerse: (
    book: string,
    chapter: number,
    startVerse: number,
    endVerse: number
  ) => Promise<string>;
  onDownloadPdf?: (htmlContent: string, noteTitle: string) => Promise<void>;
  // dom: import("expo/dom").DOMProps;
}

const NewDomNoteEditor = ({
  onChangeText,
  theme,
  isReadOnly = false,
  value,
  width,
  height,
  onSave,
  title = "",
  fetchBibleVerse,
  onDownloadPdf,
}: DomNoteEditorProps) => {
  const { colors } = theme;
  const isLoadingInitialContent = useRef(false);
  useThemeVariables(theme);
  const [disableEditor, setDisableEditor] = useState(false);

  return (
    <div className="w-full h-full flex flex-col px-4  bg-theme-background fixed top-0 left-0 right-0 ">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap"
        rel="stylesheet"
      />

      <ToolbarContext>
        <div
          className={`w-full h-full`}
          style={{ width: "100%", height: "100%" }}
        >
          <LexicalComposer initialConfig={editorConfig}>
            <ReadOnlyPlugin isReadOnly={isReadOnly || disableEditor} />
            <HashtagPlugin />
            <HistoryPlugin />
            <AutoFocusPlugin />
            <AutoScrollPlugin />
            <CheckListPlugin />
            <ListPlugin />
            <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
            <BibleMentionPlugin
              isReadOnly={isReadOnly || disableEditor}
              fetchBibleVerse={fetchBibleVerse}
            />

            <div
              className={`relative overflow-y-auto text-sm text-left w-full h-full  font-normal rounded-lg flex flex-col`}
            >
              {!isReadOnly && (
                <div className={`px-4  py-3 pt-10 rounded`}>
                  <input
                    type="text"
                    defaultValue={title}
                    onFocus={(e) => setDisableEditor(true)}
                    onBlur={(e) => setDisableEditor(false)}
                    onChange={(e) => onChangeText("title", e.target.value)}
                    placeholder="Titulo"
                    className={`w-full text-3xl font-semibold bg-transparent border-none outline-none text-black dark:text-white ${
                      !disableEditor ? "opacity-50" : ""
                    } placeholder:text-black-100 placeholder:font-semibold placeholder:text-3xl dark:placeholder:text-gray-400`}
                  />
                </div>
              )}
              {!isReadOnly && (
                <div className={`sticky !top-0 !left-0 !right-0 z-10 `}>
                  <NewTopToolbarPlugin
                    isDark={theme.dark}
                    activeColor={colors.notification}
                  />
                  <div className="w-full h-[2px] my-2 bg-gray-200/30 rounded-full" />
                </div>
              )}

              <div className="relative scroll-smooth !bg-theme-background flex-1">
                <RichTextPlugin
                  contentEditable={
                    <ContentEditable
                      className="relative !bg-theme-background !text-black dark:!text-white !pb-[70px] w-full h-full scroll-smooth min-h-[200px] caret-black dark:caret-white font-[Montserrat]
                      px-2.5 py-4 outline-0 resize-none text-base"
                      aria-placeholder={placeholder}
                      placeholder={
                        <div className="text-black-100 px-2.5 py-4 font-[Montserrat] absolute top-0 left-0 select-none text-base dark:text-gray-400">
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
                      const json = editorState.toJSON();
                      const htmlString = $generateHtmlFromNodes(editor, null);
                      // const textContent = root.getTextContent();
                      onChangeText(
                        "content",
                        JSON.stringify({ htmlString, json })
                      );
                    });
                  }}
                  ignoreHistoryMergeTagChange
                  ignoreSelectionChange
                />

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
      </ToolbarContext>
    </div>
  );
};

export default NewDomNoteEditor;
