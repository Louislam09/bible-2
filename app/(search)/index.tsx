import { View as ThemedView } from "@/components/Themed";
import { searchListHtmlTemplate } from "@/constants/searchListTemplate";
import { useBibleContext } from "@/context/BibleContext";
import { useMyTheme } from "@/context/ThemeContext";
import { bibleState$ } from "@/state/bibleState";
import { IVerseItem, Screens, TTheme } from "@/types";
import copyToClipboard from "@/utils/copyToClipboard";
import { getVerseTextRaw } from "@/utils/getVerseTextRaw";
import { createOptimizedWebViewProps } from "@/utils/webViewOptimizations";
import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BackHandler, StyleSheet, View } from "react-native";
import WebView from "react-native-webview";

type SearchPageProps = {};

const SearchPage: React.FC<SearchPageProps> = () => {
  const { theme } = useMyTheme();
  const navigation = useNavigation();
  const styles = getStyles(theme);
  const webViewRef = useRef<WebView>(null);
  const { performSearch, searchState } = useBibleContext();
  const abortControllerRef = useRef<AbortController | null>(null);
  const [currentQuery, setCurrentQuery] = useState('');

  // Handle back button
  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

    return () => {
      backHandler.remove();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [navigation]);

  // Handle search results from context
  useEffect(() => {
    if (searchState?.searchResults && webViewRef.current) {
      const results = searchState.searchResults.map((item: IVerseItem) => ({
        ...item,
        text: getVerseTextRaw(item.text),
      }));

      webViewRef.current.postMessage(JSON.stringify({
        type: 'searchResults',
        data: { results, query: currentQuery }
      }));
    } else if (searchState?.error && webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'searchResults',
        data: { results: [], query: currentQuery }
      }));
    }
  }, [searchState, currentQuery]);

  // Handle search
  const handleSearch = useCallback(async (query: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (!query || query.length < 3) {
      return;
    }

    setCurrentQuery(query);

    try {
      const newAbortController = new AbortController();
      abortControllerRef.current = newAbortController;
      await performSearch(query, newAbortController);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
      console.error("Search error:", error);
    }
  }, [performSearch]);

  // Handle copy
  const handleCopy = useCallback(async (verse: IVerseItem) => {
    try {
      await copyToClipboard({
        ...verse,
        book_number: verse.book_number,
      });
    } catch (error) {
      console.error("Error copying to clipboard:", error);
    }
  }, []);

  // Handle go to verse
  const handleGoToVerse = useCallback((bookName: string, chapter: number, verse: number) => {
    const queryInfo = {
      book: bookName,
      chapter,
      verse,
    };
    bibleState$.changeBibleQuery({
      ...queryInfo,
      shouldFetch: true,
      isHistory: false,
    });
    (navigation as any).navigate(Screens.Home, queryInfo);
  }, [navigation]);

  // Handle WebView messages
  const handleWebViewMessage = useCallback(
    async (event: any) => {
      try {
        const message = JSON.parse(event.nativeEvent.data);
        const { type, data } = message;

        switch (type) {
          case 'search':
            handleSearch(data.query);
            break;
          case 'searchCleared':
            setCurrentQuery('');
            if (abortControllerRef.current) {
              abortControllerRef.current.abort();
            }
            break;
          case 'copy':
            handleCopy(data);
            break;
          case 'goToVerse':
            handleGoToVerse(data.bookName, data.chapter, data.verse);
            break;
          default:
            console.log("Unknown message type:", type);
        }
      } catch (error) {
        console.error("Error parsing WebView message:", error, event.nativeEvent.data);
      }
    },
    [handleSearch, handleCopy, handleGoToVerse]
  );

  // Generate HTML content
  const htmlContent = useMemo(() => {
    return searchListHtmlTemplate({
      theme,
      fontSize: 16,
      searchQuery: '',
    });
  }, [theme]);

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

export default SearchPage;
