import { singleScreenHeader, SingleScreenHeaderProps } from "@/components/common/singleScreenHeader";
import ScreenWithAnimation from "@/components/ScreenWithAnimation";
import { View as ThemedView } from "@/components/Themed";
import TutorialWalkthrough from "@/components/TutorialWalkthrough";
import { DB_BOOK_NAMES } from "@/constants/BookNames";
import { dictionaryListHtmlTemplate, DictionaryViewMode } from "@/constants/dictionaryListTemplate";
import { storedData$ } from "@/context/LocalstoreContext";
import { useMyTheme } from "@/context/ThemeContext";
import useBackHandler from "@/hooks/useBackHandler";
import useDictionaryData from "@/hooks/useDictionaryData";
import { bibleState$ } from "@/state/bibleState";
import { ModulesFilters, Screens, TTheme } from "@/types";
import { createOptimizedWebViewProps } from "@/utils/webViewOptimizations";
import { useNavigation } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import { Stack, useRouter } from "expo-router";
import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Share, StyleSheet, View } from "react-native";
import WebView from "react-native-webview";

type DictionarySearchProps = {};

const DictionarySearch: React.FC<DictionarySearchProps> = () => {
  const { theme } = useMyTheme();
  const navigation = useNavigation();
  const router = useRouter();
  const styles = getStyles(theme);
  const webViewRef = useRef<WebView>(null);
  const searchingSource = require("../assets/lottie/searching.json");

  const [viewMode, setViewMode] = useState<DictionaryViewMode>(() => {
    return (storedData$.dictionaryViewMode?.get() as DictionaryViewMode) || 'list';
  });
  const [isDetailView, setIsDetailView] = useState(false);

  const { data, loading, onSearch, hasDictionary } = useDictionaryData({});

  // Handle back button - if in detail view, go back to list
  useBackHandler("dictionary", isDetailView, () => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({ type: "goBackToList" }));
    }
  });

  // Send search results to WebView when data changes
  useEffect(() => {
    if (webViewRef.current && hasDictionary) {
      webViewRef.current.injectJavaScript(`
        if (typeof updateResults === 'function') {
          updateResults(${JSON.stringify(data)}, ${loading});
        }
        true;
      `);
    }
  }, [data, loading, hasDictionary]);

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
        const { type, data: msgData } = message;

        switch (type) {
          case 'search':
            if (msgData.query && msgData.query.length >= 3) {
              onSearch({ searchParam: msgData.query });
            } else if (msgData.query === '') {
              // Clear results when search is cleared
            }
            break;
          case 'viewModeChange':
            const newMode = msgData.viewMode as DictionaryViewMode;
            setViewMode(newMode);
            storedData$.dictionaryViewMode.set(newMode);
            break;
          case 'copy':
            handleCopy(msgData.text, msgData.topic);
            break;
          case 'share':
            handleShare(msgData.text, msgData.topic);
            break;
          case 'linkPress':
            handleLinkPress(msgData.href);
            break;
          case 'navigateToDownload':
            router.push({
              pathname: `/${Screens.DownloadManager}`,
              params: { filter: ModulesFilters.DICTIONARIES },
            });
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
    [router]
  );

  // Generate HTML content
  const htmlContent = useMemo(() => {
    return dictionaryListHtmlTemplate({
      theme,
      hasDictionary,
      fontSize: 16,
      viewMode,
    });
  }, [theme, hasDictionary, viewMode]);

  const screenOptions: SingleScreenHeaderProps = useMemo(() => {
    return {
      theme,
      title: "",
      titleIcon: "BookA",
      titleIconColor: "#ec899e",
      goBack: () => { navigation.navigate(Screens.Dashboard as any) },
      headerRightProps: {
        headerRightIconColor: "#ffffff",
      }
    };
  }, [theme, navigation]);

  return (
    <Fragment>
      <Stack.Screen options={singleScreenHeader(screenOptions)} />
      <ScreenWithAnimation
        animationSource={searchingSource}
        speed={2}
        title="Diccionario"
        icon="BookA"
        iconColor="#ec899e"
      >
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
      </ScreenWithAnimation>
      <TutorialWalkthrough />
    </Fragment>
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

export default DictionarySearch;
