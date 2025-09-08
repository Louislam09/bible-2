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
import ExampleTheme from "./ExampleTheme";
import ReadOnlyPlugin from "./plugins/ReadOnlyPlugin";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
const placeholder = "Enter some rich text...";

import { CodeNode } from "@lexical/code";
import { ListItemNode, ListNode } from "@lexical/list";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";

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

const { width } = Dimensions.get("window");

interface DomNoteEditorProps {
  noteId?: string;
  isNewNote?: boolean;
  setPlainText: React.Dispatch<React.SetStateAction<string>>;
  setEditorState: React.Dispatch<React.SetStateAction<string | null>>;
  theme: TTheme;
  isReadOnly?: boolean;
}

const DomNoteEditor = ({
  setPlainText,
  setEditorState,
  theme,
  isReadOnly = false,
}: DomNoteEditorProps) => {
  const { colors } = theme;
  return (
    <div className={`rounded w-full px-1`} style={{ width: width }}>
      <LexicalComposer initialConfig={editorConfig}>
        <ReadOnlyPlugin isReadOnly={isReadOnly} />
        <div className="text-sm text-left w-full h-full text-black relative font-normal rounded-lg">
          <div className="sticky top-0 left-0 right-0 z-10 ">
            <ToolbarPlugin activeColor={colors.notification} />
          </div>

          {true && (
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
                  editorState.read(() => {
                    const root = $getRoot();
                    const htmlString = $generateHtmlFromNodes(editor, null);
                    const textContent = root.getTextContent();
                    setPlainText(textContent);
                    // console.log({ htmlString });
                  });
                  setEditorState(JSON.stringify(editorState.toJSON()));
                }}
                ignoreHistoryMergeTagChange
                ignoreSelectionChange
              />
              <HistoryPlugin />
              <AutoFocusPlugin />
              {/* <TreeViewPlugin /> */}
            </div>
          )}
        </div>
      </LexicalComposer>
    </div>
  );
};

export default DomNoteEditor;
