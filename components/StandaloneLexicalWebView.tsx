import { useMyTheme } from '@/context/ThemeContext';
import { createOptimizedWebViewProps } from '@/utils/webViewOptimizations';
import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { generateStandaloneLexicalHTML } from './LexicalEditorStandaloneHTML';

interface StandaloneLexicalWebViewProps {
  noteId?: string;
  isReadOnly?: boolean;
  initialTitle?: string;
  initialContent?: string;
  onContentChange?: (content: string) => void;
  onTitleChange?: (title: string) => void;
  onReady?: () => void;
  placeholder?: string;
}

const StandaloneLexicalWebView: React.FC<StandaloneLexicalWebViewProps> = ({
  noteId,
  isReadOnly = false,
  initialTitle = '',
  initialContent = '',
  onContentChange,
  onTitleChange,
  onReady,
  placeholder = 'Escribe algo...',
}) => {
  const { theme } = useMyTheme();
  const webViewRef = useRef<WebView>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);

  // Generate HTML with current theme and bundle
  const htmlContent = React.useMemo(() => {
    return generateStandaloneLexicalHTML({
      theme,
      initialTitle,
      initialContent,
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
            console.log('Lexical editor ready');
            onReady?.();
            break;

          case 'titleChange':
            onTitleChange?.(message.data.title);
            break;

          case 'contentChange':
            onContentChange?.(message.data.content);
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
    },
    [onContentChange, onTitleChange, onReady]
  );

  // Send messages to WebView
  const sendMessage = useCallback(
    (type: string, data: any) => {
      if (webViewRef.current && isEditorReady) {
        webViewRef.current.postMessage(JSON.stringify({ type, data }));
      }
    },
    [isEditorReady]
  );

  // Public methods via ref (if needed)
  // React.useImperativeHandle(
  //   webViewRef,
  //   () => ({
  //     loadContent: (content: string, title?: string) => {
  //       sendMessage('loadContent', { content, title });
  //     },
  //     setReadOnly: (readonly: boolean) => {
  //       sendMessage('setReadOnly', { isReadOnly: readonly });
  //     },
  //     getContent: () => {
  //       sendMessage('getContent', {});
  //     },
  //   }),
  //   [sendMessage]
  // );

  // Update theme when it changes
  // useEffect(() => {
  //   if (isEditorReady) {
  //     // Reload WebView with new theme (simple approach)
  //     // For a more sophisticated approach, you could send theme updates via postMessage
  //     // and have JavaScript update CSS variables
  //   }
  // }, [theme.dark, isEditorReady]);

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        style={{
          flex: 1,
          minWidth: "100%",
          backgroundColor: "transparent",
        }}
        containerStyle={{ backgroundColor: "transparent", }}
        scrollEnabled={true}
        source={{ html: htmlContent }}
        onMessage={handleMessage}
        renderLoading={() => <View
          style={{
            backgroundColor: theme.colors.background,
            flex: 1,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            justifyContent: "center",
            alignItems: "center",
          }}
        />}
        {...createOptimizedWebViewProps({}, "static")}
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

export default StandaloneLexicalWebView;
