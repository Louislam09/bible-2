import { View as ThemedView } from "@/components/Themed";
import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import { getDatabaseQueryKey } from "@/constants/databaseNames";
import { QUERY_BY_DB } from "@/constants/queries";
import WORDS from "@/constants/words";
import { concordanceListHtmlTemplate, ConcordanceViewMode } from "@/constants/concordanceListTemplate";
import { useBibleContext } from "@/context/BibleContext";
import { useDBContext } from "@/context/databaseContext";
import { storedData$ } from "@/context/LocalstoreContext";
import { useMyTheme } from "@/context/ThemeContext";
import useBackHandler from "@/hooks/useBackHandler";
import { bibleState$ } from "@/state/bibleState";
import { Screens, TTheme } from "@/types";
import copyToClipboard from "@/utils/copyToClipboard";
import { createOptimizedWebViewProps } from "@/utils/webViewOptimizations";
import { useNavigation } from "@react-navigation/native";
import { Stack } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import WebView from "react-native-webview";

const LETTERS = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
  "N", "O", "P", "Q", "R", "S", "T", "U", "V", "Y", "Z",
];

type ConcordanceProps = {};

const Concordance: React.FC<ConcordanceProps> = () => {
  const { myBibleDB, executeSql } = useDBContext();
  const { currentBibleVersion } = useBibleContext();
  const { theme } = useMyTheme();
  const navigation = useNavigation();
  const styles = getStyles(theme);
  const webViewRef = useRef<WebView>(null);

  const [viewMode, setViewMode] = useState<ConcordanceViewMode>(() => {
    return (storedData$.concordanceViewMode?.get() as ConcordanceViewMode) || 'list';
  });
  const [isDetailView, setIsDetailView] = useState(false);
  const [randomLetter] = useState(() => LETTERS[Math.floor(Math.random() * LETTERS.length)]);

  // Handle back button - if in detail view, go back to list
  useBackHandler("concordance", isDetailView, () => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({ type: "goBackToList" }));
    }
  });

  // Fetch verses for a word
  const fetchVerses = useCallback(async (word: string) => {
    if (!myBibleDB || !executeSql) return [];

    try {
      const queryKey = getDatabaseQueryKey(currentBibleVersion);
      const query = QUERY_BY_DB[queryKey];
      const data = await executeSql(query.GET_VERSES_FOR_CONCORDANCIA, [`%${word}%`]);
      const verses = data.flatMap((x: any) => JSON.parse(x.data));
      return verses;
    } catch (error) {
      console.error("Error fetching verses:", error);
      return [];
    }
  }, [myBibleDB, executeSql, currentBibleVersion]);

  // Handle copy
  const handleCopy = useCallback(async (verse: any) => {
    try {
      await copyToClipboard({
        ...verse,
        book_number: verse.bookNumber || verse.book_number,
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
          case 'viewModeChange':
            const newMode = data.viewMode as ConcordanceViewMode;
            setViewMode(newMode);
            storedData$.concordanceViewMode?.set(newMode);
            break;
          case 'fetchVerses':
            const verses = await fetchVerses(data.word);
            if (webViewRef.current) {
              webViewRef.current.postMessage(JSON.stringify({
                type: 'versesData',
                data: verses
              }));
            }
            break;
          case 'copy':
            handleCopy(data);
            break;
          case 'goToVerse':
            handleGoToVerse(data.bookName, data.chapter, data.verse);
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
    [fetchVerses, handleCopy, handleGoToVerse]
  );

  // Generate HTML content
  const htmlContent = useMemo(() => {
    return concordanceListHtmlTemplate({
      words: WORDS,
      theme,
      fontSize: 16,
      viewMode,
      randomLetter,
    });
  }, [theme, viewMode, randomLetter]);

  return (
    <>
      <Stack.Screen
        options={{
          ...singleScreenHeader({
            theme,
            title: "Concordancia",
            titleIcon: "SwatchBook",
            titleIconColor: theme.dark ? '#FFFFFF' : '#000000',
            headerRightProps: {
              headerRightIcon: "List",
              headerRightIconColor: theme.colors.text,
              onPress: () => { },
              disabled: true,
              style: { opacity: 0 },
            },
          }),
        }}
      />
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
    </>
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

export default Concordance;
