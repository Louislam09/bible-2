import { View as ThemedView } from "@/components/Themed";
import { DB_BOOK_NAMES } from "@/constants/BookNames";
import Characters from "@/constants/Characters";
import { characterListHtmlTemplate, CharacterViewMode } from "@/constants/characterListTemplate";
import { storedData$ } from "@/context/LocalstoreContext";
import { useMyTheme } from "@/context/ThemeContext";
import useBackHandler from "@/hooks/useBackHandler";
import { bibleState$ } from "@/state/bibleState";
import { Screens, TTheme } from "@/types";
import { createOptimizedWebViewProps } from "@/utils/webViewOptimizations";
import { useNavigation } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Share, StyleSheet, View } from "react-native";
import WebView from "react-native-webview";

type CharacterProps = {};

const Character: React.FC<CharacterProps> = () => {
  const { theme } = useMyTheme();
  const navigation = useNavigation();
  const styles = getStyles(theme);
  const webViewRef = useRef<WebView>(null);
  const [viewMode, setViewMode] = useState<CharacterViewMode>(() => {
    return (storedData$.charactersViewMode?.get() as CharacterViewMode) || 'list';
  });
  const [isDetailView, setIsDetailView] = useState(false);

  // Handle back button - if in detail view, go back to list
  useBackHandler("character", isDetailView, () => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({ type: "goBackToList" }));
    }
  });

  // Handle copy
  const handleCopy = useCallback(async (text: string, topic: string) => {
    try {
      const fullText = `${topic}\n\n${text}`;
      await Clipboard.setStringAsync(fullText);
    } catch (error) {
      console.error("Error copying to clipboard:", error);
    }
  }, []);

  // Handle share
  const handleShare = useCallback(async (text: string, topic: string) => {
    try {
      await Share.share({
        message: `${topic}\n\n${text}`,
        title: topic,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  }, []);

  // Handle Bible verse links
  const handleLinkPress = useCallback((href: string) => {
    // Parse links like "B:20 7:12" -> book 20, chapter 7, verse 12
    const match = href.match(/B:(\d+)\s+(\d+):(\d+)/i);
    if (match) {
      const [, bookNumber, chapter, verse] = match;
      const currentBook = DB_BOOK_NAMES.find(
        (x) => x.bookNumber === +bookNumber
      );
      const queryInfo = {
        book: currentBook?.longName || "Mateo",
        chapter: +chapter,
        verse: +verse || 0,
      };
      bibleState$.changeBibleQuery({
        ...queryInfo,
        shouldFetch: true,
        isHistory: false,
      });
      (navigation as any).navigate(Screens.Home, queryInfo);
    }
  }, [navigation]);

  // Handle WebView messages
  const handleWebViewMessage = useCallback(
    (event: any) => {
      try {
        const message = JSON.parse(event.nativeEvent.data);
        const { type, data } = message;

        switch (type) {
          case 'viewModeChange':
            const newMode = data.viewMode as CharacterViewMode;
            setViewMode(newMode);
            storedData$.charactersViewMode.set(newMode);
            break;
          case 'copy':
            handleCopy(data.text, data.topic);
            break;
          case 'share':
            handleShare(data.text, data.topic);
            break;
          case 'linkPress':
            handleLinkPress(data.href);
            break;
          case 'detailViewOpened':
            setIsDetailView(true);
            break;
          case 'detailViewClosed':
            setIsDetailView(false);
            break;
          default:
            console.log("Unknown message type:", type);
        }
      } catch (error) {
        console.error("Error parsing WebView message:", error, event.nativeEvent.data);
      }
    },
    [handleCopy, handleShare, handleLinkPress]
  );

  // Generate HTML content
  const htmlContent = useMemo(() => {
    return characterListHtmlTemplate({
      characters: Characters,
      theme,
      fontSize: 16,
      viewMode,
    });
  }, [theme, viewMode]);

  return (
    <ThemedView style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{ html: htmlContent }}
        style={styles.webView}
        onMessage={handleWebViewMessage}
        scrollEnabled={true}
        bounces={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        keyboardDisplayRequiresUserAction={false}
        renderLoading={() => (
          <View
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
          />
        )}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error("WebView error:", nativeEvent);
        }}
        {...createOptimizedWebViewProps({}, "static")}
      />
    </ThemedView>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    webView: {
      flex: 1,
      backgroundColor: "transparent",
    },
  });

export default Character;
