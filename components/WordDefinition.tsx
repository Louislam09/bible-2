import { DB_BOOK_NAMES } from "@/constants/BookNames";
import { wordDefinitionHtmlTemplate } from "@/constants/wordDefinitionHtmlTemplate";
import { useBibleContext } from "@/context/BibleContext";
import { useMyTheme } from "@/context/ThemeContext";
import usePrintAndShare from "@/hooks/usePrintAndShare";
import { bibleState$ } from "@/state/bibleState";
import { DictionaryData, Screens, TTheme } from "@/types";
import { createOptimizedWebViewProps } from "@/utils/webViewOptimizations";
import { useNavigation } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import React, { useCallback, useRef } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import WebView from "react-native-webview";
import {
  ShouldStartLoadRequest,
  WebViewMessageEvent,
} from "react-native-webview/lib/WebViewTypes";
import { Text, View } from "./Themed";
import Icon from "./Icon";

type WordDefinitionProps = {
  wordData: DictionaryData;
  subTitle: string;
  navigation?: any;
  theme?: TTheme;
  mainColor?: string;
};

const WordDefinition = ({
  wordData,
  subTitle,
  navigation: _navigation,
  mainColor = "",
}: WordDefinitionProps) => {
  const defaultNavigation = useNavigation();
  const navigation = _navigation || defaultNavigation;
  const { theme } = useMyTheme();
  const styles = getStyles(theme);
  const webViewRef = useRef<WebView>(null);
  const { definition, topic } = wordData;
  const { fontSize } = useBibleContext();
  const { printToFile } = usePrintAndShare();

  const html = wordDefinitionHtmlTemplate({
    content: definition || "",
    topic: topic || "",
    mainColor: mainColor || theme.colors.notification,
    theme,
    fontSize,
    isPrint: false,
  });

  const copyContentToClipboard = useCallback(() => {
    if (!webViewRef?.current) return;
    webViewRef?.current.injectJavaScript(`
      function copyContentToClipboard() {
        let content = document.body.innerText;
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'copy', content }));
      }
      copyContentToClipboard();
      true;
    `);
  }, []);

  const handleShare = useCallback(() => {
    if (!webViewRef?.current) return;
    webViewRef?.current.injectJavaScript(`
      function shareContent() {
        let content = document.body.innerText;
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'share', content }));
      }
      shareContent();
      true;
    `);
  }, []);

  const onShouldStartLoadWithRequest = useCallback((event: ShouldStartLoadRequest) => {
    const { url } = event;
    if (url.startsWith("b:")) {
      const [, bookNumber, chapter, verse] =
        url.match(/b:(\d+) (\d+):(\d+)/) || [];
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
      navigation.navigate(Screens.Home, queryInfo);
    }
    return false;
  }, [navigation]);

  const onMessage = useCallback(async (event: WebViewMessageEvent) => {
    try {
      const eventData = event.nativeEvent.data;

      // Try to parse as JSON first
      try {
        const parsed = JSON.parse(eventData);
        if (parsed.type === 'copy') {
          await Clipboard.setStringAsync(parsed.content);
          return;
        }
        if (parsed.type === 'share') {
          const printHtml = wordDefinitionHtmlTemplate({
            content: definition || "",
            topic: topic || "",
            theme,
            fontSize,
            isPrint: true,
          });
          printToFile(printHtml, topic?.toUpperCase() || "--");
          return;
        }
      } catch {
        // Not JSON, handle legacy format
      }

      // Legacy handling
      const isNumber = !isNaN(+eventData);
      if (isNumber) return;

      const text = `${eventData}`;
      await Clipboard.setStringAsync(text);
      const printHtml = wordDefinitionHtmlTemplate({
        content: definition || "",
        topic: topic || "",
        theme,
        fontSize,
        isPrint: true,
      });
      printToFile(printHtml, topic?.toUpperCase() || "--");
    } catch (error) {
      console.error("Error handling WebView message:", error);
    }
  }, [definition, topic, theme, fontSize, printToFile]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={[styles.titleIndicator, { backgroundColor: mainColor || theme.colors.notification }]} />
          <Text style={styles.title}>{subTitle}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={copyContentToClipboard}
            activeOpacity={0.7}
          >
            <Icon name="Copy" color={mainColor || theme.colors.notification} size={20} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Icon name="Share2" color={mainColor || theme.colors.notification} size={20} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View style={styles.definitionContainer}>
        <WebView
          startInLoadingState
          style={styles.webView}
          ref={webViewRef}
          originWhitelist={["*"]}
          source={{ html }}
          onMessage={onMessage}
          onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
          renderLoading={() => (
            <View style={styles.loadingContainer} />
          )}
          scrollEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
          {...createOptimizedWebViewProps({}, "static")}
        />
      </View>
    </View>
  );
};

export default WordDefinition;

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 16,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 16,
      backgroundColor: colors.background,
    },
    titleContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      flex: 1,
      backgroundColor: "transparent",
    },
    titleIndicator: {
      width: 4,
      height: 24,
      backgroundColor: "#cec8ff",
      borderRadius: 2,
    },
    title: {
      color: colors.text,
      fontSize: 20,
      fontWeight: "700",
    },
    actions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: "transparent",
    },
    actionButton: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.text + "08",
      alignItems: "center",
      justifyContent: "center",
    },
    definitionContainer: {
      flex: 1,
      backgroundColor: "transparent",
      borderRadius: 16,
      overflow: "hidden",
    },
    webView: {
      backgroundColor: "transparent",
      flex: 1,
    },
    loadingContainer: {
      backgroundColor: colors.background,
      flex: 1,
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
      justifyContent: "center",
      alignItems: "center",
    },
  });
