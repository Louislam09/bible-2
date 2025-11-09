import { lexicalHtmlContent } from '@/constants/lexicalHtml';
import { useMyTheme } from '@/context/ThemeContext';
import { createOptimizedWebViewProps } from '@/utils/webViewOptimizations';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { KeyboardPaddingView, MoveWithKeyboardWrapper } from './keyboard-padding';

interface LexicalWebViewProps {
  moveWithKeyboard?: boolean;
  noteId?: string;
  isReadOnly?: boolean;
  isNewNote?: boolean;
  initialTitle?: string;
  initialContent?: string;
  onContentChange?: (content: string) => void;
  onTitleChange?: (title: string) => void;
  onReady?: () => void;
  onError?: (error: any) => void;
  placeholder?: string;
  fetchBibleVerse?: (book: string, chapter: number, startVerse: number, endVerse: number) => Promise<string>;
}

export interface LexicalWebViewRef {
  loadContent: (content: string, title?: string) => void;
  setReadOnly: (readonly: boolean) => void;
  getContent: () => void;
  reload: () => void;
}

const LexicalWebView = React.forwardRef<LexicalWebViewRef, LexicalWebViewProps>(({
  moveWithKeyboard = false,
  noteId,
  isReadOnly = false,
  isNewNote = false,
  initialTitle = '',
  initialContent = '',
  placeholder = 'Escribe algo...',
  onContentChange,
  onTitleChange,
  onReady,
  onError,
  fetchBibleVerse,
}, ref) => {
  const { theme } = useMyTheme();
  const webViewRef = useRef<WebView>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [webViewKey, setWebViewKey] = useState(0);


  // Generate HTML with current theme and bundle
  const htmlContent = React.useMemo(() => {
    const isJSON = initialContent.startsWith("{");
    const htmlString = isJSON ? JSON.parse(initialContent).htmlString : initialContent;
    return lexicalHtmlContent({
      theme,
      initialTitle,
      initialContent: htmlString,
      isReadOnly,
      placeholder,
    });
  }, [theme, initialTitle, initialContent, isReadOnly, placeholder]);

  // Handle messages from WebView
  const handleMessage = useCallback(
    (event: any) => {
      try {
        const message = JSON.parse(event.nativeEvent.data);

        switch (message.type) {
          case 'ready':
            setIsEditorReady(true);
            onReady?.();
            break;

          case 'titleChange':
            setHasUnsavedChanges(true);
            onTitleChange?.(message.data.title);
            break;

          case 'contentChange':
            const content = JSON.parse(message.data.content);
            // console.log('contentChange:', content.text);
            setHasUnsavedChanges(true);
            onContentChange?.(content);
            break;

          case 'contentResponse':
            // Handle content response if needed
            console.log('Content received:', message.data.content);
            break;

          case 'error':
            console.error('WebView error:', message.data);
            onError?.(message.data);
            break;

          case 'bibleMentionRequest':
            // Handle Bible verse fetch request
            if (fetchBibleVerse && message.data) {
              const { book, chapter, startVerse, endVerse } = message.data;
              fetchBibleVerse(book, chapter, startVerse, endVerse)
                .then((verseText) => {
                  sendMessage('bibleMentionResponse', {
                    verseText,
                    book,
                    chapter,
                    startVerse,
                    endVerse,
                  });
                })
                .catch((error) => {
                  console.error('Failed to fetch Bible verse:', error);
                  sendMessage('bibleMentionResponse', {
                    verseText: '[Error cargando versículo]',
                    book,
                    chapter,
                    startVerse,
                    endVerse,
                  });
                });
            }
            break;

          default:
            console.log('Unknown message type:', message.type);
        }
      } catch (error) {
        console.error('Failed to handle WebView message:', error);
        onError?.(error);
      }
    },
    [onContentChange, onTitleChange, onReady, onError, fetchBibleVerse, noteId]
  );

  // Send messages to WebView
  const sendMessage = useCallback(
    (type: string, data: any) => {
      if (webViewRef.current && isEditorReady) {
        try {
          webViewRef.current.postMessage(JSON.stringify({ type, data }));
        } catch (error) {
          console.error('Failed to send message to WebView:', error);
          onError?.(error);
        }
      } else {
        console.warn('WebView not ready, message queued:', type);
      }
    },
    [isEditorReady, onError]
  );

  // Public methods via ref
  // useImperativeHandle(
  //   ref,
  //   () => ({
  //     loadContent: (content: string, title?: string) => {
  //       console.log('loadContent', content, title);
  //       sendMessage('loadContent', { content, title });
  //     },
  //     setReadOnly: (readonly: boolean) => {
  //       console.log('setReadOnly', readonly);
  //       sendMessage('setReadOnly', { isReadOnly: readonly });
  //     },
  //     getContent: () => {
  //       console.log('getContent');
  //       sendMessage('getContent', {});
  //     },
  //     reload: () => {
  //       setWebViewKey(prev => prev + 1);
  //       setIsEditorReady(false);
  //       setIsLoading(true);
  //     },
  //   }),
  //   [sendMessage]
  // );

  // Update theme when it changes - reload WebView
  useEffect(() => {
    if (isEditorReady) {
      // Reload WebView with new theme
      setWebViewKey(prev => prev + 1);
      setIsEditorReady(false);
    }
  }, [theme.dark]);


  return (
    <View style={styles.container}>
      <WebView
        key={webViewKey}
        ref={webViewRef}
        originWhitelist={["*"]}
        style={{
          flex: 1,
          minWidth: "100%",
          backgroundColor: "transparent",
        }}
        containerStyle={{ backgroundColor: "transparent" }}
        scrollEnabled={true}
        source={{ html: htmlContent }}
        onMessage={handleMessage}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error:', nativeEvent);
          onError?.(nativeEvent);
        }}
        onLoadEnd={() => { }}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={theme.colors.notification} />
          </View>
        )}
        {...createOptimizedWebViewProps({}, "editor")}
      />
      {moveWithKeyboard ? <KeyboardPaddingView /> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    zIndex: 1000,
  },
});

// Set display name for debugging
LexicalWebView.displayName = 'StandaloneLexicalWebView';

export default LexicalWebView;
