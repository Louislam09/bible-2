import { lexicalHtmlContent } from '@/constants/lexicalHtml';
import { useMyTheme } from '@/context/ThemeContext';
import { sanitizeHTML } from '@/utils/convertHtmlToText';
import { createOptimizedWebViewProps } from '@/utils/webViewOptimizations';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { KeyboardPaddingView } from './keyboard-padding';

interface LexicalWebViewProps {
  moveWithKeyboard?: boolean;
  noteId?: string;
  isReadOnly?: boolean;
  isNewNote?: boolean;
  initialTitle?: string;
  initialContent?: string;
  isModal?: boolean;
  onContentChange?: (content: string) => void;
  onTitleChange?: (title: string) => void;
  onReady?: (sendMessageCallback: (type: string, data: any) => void) => void;
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

// const mock = ``

const LexicalWebView = React.forwardRef<LexicalWebViewRef, LexicalWebViewProps>(({
  moveWithKeyboard = false,
  noteId,
  isReadOnly = false,
  isNewNote = false,
  initialTitle = '',
  initialContent = '',
  placeholder = 'Escribe algo...',
  isModal = false,
  onContentChange,
  onTitleChange,
  onReady,
  onError,
  fetchBibleVerse,
}, ref) => {
  const { theme } = useMyTheme();
  const webViewRef = useRef<WebView>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [webViewKey, setWebViewKey] = useState(0);

  // Generate HTML with current theme and bundle
  const htmlContent = React.useMemo(() => {
    const isJSON = initialContent.startsWith("{");
    const content = isJSON ? JSON.parse(initialContent) : { htmlString: sanitizeHTML(initialContent) };
    // const content = isJSON ? JSON.parse(initialContent) : { htmlString: sanitizeHTML(mock) };

    // console.log({ initialContent, isJSON, content })

    return lexicalHtmlContent({
      theme,
      initialTitle,
      initialContent: content,
      isReadOnly,
      placeholder,
      isModal
    });
  }, [theme, initialTitle, initialContent, isReadOnly, placeholder, isModal]);

  // Handle messages from WebView
  const handleMessage = useCallback(
    (event: any) => {
      try {
        const message = JSON.parse(event.nativeEvent.data);

        switch (message.type) {
          case 'ready':
            setIsEditorReady(true);
            onReady?.(sendMessage);
            break;

          case 'titleChange':
            onTitleChange?.(message.data.title);
            break;

          case 'contentChange':
            const content = JSON.parse(message.data.content);
            onContentChange?.(JSON.stringify(content));
            break;

          case 'contentResponse':
            console.log('Content received:', message.data.content);
            break;

          case 'error':
            console.error('WebView error:', message.data);
            onError?.(message.data);
            break;

          case 'log':
            console.log('🌐:', message.data);
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
            console.log('Unknown message type:', message);
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
      if (webViewRef.current) {
        try {
          webViewRef.current.postMessage(JSON.stringify({ type, data }));
        } catch (error) {
          console.error('Failed to send message to WebView:', error);
          onError?.(error);
        }
      }
    },
    []
  );

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
