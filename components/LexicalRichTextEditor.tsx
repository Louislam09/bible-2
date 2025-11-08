import { useMyTheme } from "@/context/ThemeContext";
import { generateLexicalEditorHTML } from "./LexicalEditorHTML";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

const { width, height } = Dimensions.get("window");

interface LexicalRichTextEditorProps {
  noteId?: string;
  isNewNote?: boolean;
  isReadOnly?: boolean;
  initialTitle?: string;
  initialContent?: string;
  onSave?: () => Promise<void>;
  onDownloadPdf?: (htmlContent: string, noteTitle: string) => Promise<void>;
  fetchBibleVerse: (
    book: string,
    chapter: number,
    startVerse: number,
    endVerse: number
  ) => Promise<string>;
}

const LexicalRichTextEditor: React.FC<LexicalRichTextEditorProps> = ({
  noteId,
  isNewNote = false,
  isReadOnly = false,
  initialTitle = "",
  initialContent = "",
  onSave,
  onDownloadPdf,
  fetchBibleVerse,
}) => {
  const { theme } = useMyTheme();
  const [title, setTitle] = useState<string>(initialTitle);
  const [content, setContent] = useState<string>(initialContent);
  const webViewRef = useRef<WebView>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const pendingBibleRequests = useRef<Map<string, any>>(new Map());

  // Generate HTML with current theme and initial values
  const htmlContent = generateLexicalEditorHTML({
    theme,
    initialTitle,
    initialContent,
    isReadOnly,
    placeholder: "Escribe algo...",
  });

  // Handle messages from WebView
  const handleMessage = useCallback(async (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);

      switch (message.type) {
        case 'ready':
          setIsEditorReady(true);
          console.log('Editor ready');
          break;

        case 'titleChange':
          setTitle(message.data.title);
          break;

        case 'contentChange':
          setContent(message.data.content);
          break;

        case 'fetchBibleVerse':
          // Handle Bible verse fetch request from WebView
          const { requestId, book, chapter, startVerse, endVerse } = message.data;
          try {
            const verseText = await fetchBibleVerse(book, chapter, startVerse, endVerse);
            // Send result back to WebView
            webViewRef.current?.postMessage(JSON.stringify({
              type: 'bibleVerseResult',
              data: { requestId, verseText, success: true }
            }));
          } catch (error) {
            webViewRef.current?.postMessage(JSON.stringify({
              type: 'bibleVerseResult',
              data: { requestId, error: String(error), success: false }
            }));
          }
          break;

        case 'requestSave':
          if (onSave) {
            await onSave();
          }
          break;

        case 'requestPdfDownload':
          if (onDownloadPdf && message.data.htmlContent) {
            await onDownloadPdf(message.data.htmlContent, message.data.noteTitle || title);
          }
          break;

        case 'error':
          console.error('WebView error:', message.data);
          break;

        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Failed to handle WebView message:', error);
    }
  }, [fetchBibleVerse, onSave, onDownloadPdf, title]);

  // Update theme when it changes
  useEffect(() => {
    if (isEditorReady && webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'updateTheme',
        data: { theme }
      }));
    }
  }, [theme, isEditorReady]);

  // Load initial content when editor is ready
  useEffect(() => {
    if (isEditorReady && webViewRef.current && initialContent) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'loadContent',
        data: { content: initialContent, title: initialTitle }
      }));
    }
  }, [isEditorReady, initialContent, initialTitle]);

  // Update read-only mode
  useEffect(() => {
    if (isEditorReady && webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'setReadOnly',
        data: { isReadOnly }
      }));
    }
  }, [isReadOnly, isEditorReady]);

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={styles.webview}
        onMessage={handleMessage}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        scalesPageToFit={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        keyboardDisplayRequiresUserAction={false}
        automaticallyAdjustContentInsets={false}
        bounces={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default LexicalRichTextEditor;
