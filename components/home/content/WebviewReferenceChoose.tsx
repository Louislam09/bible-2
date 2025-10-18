import { chooseReferenceHtmlTemplate } from "@/chooseReferenceTemplate";
import { ChooseReferenceMutableProgress } from "@/components/animations/expandable-choose-reference";
import { storedData$ } from "@/context/LocalstoreContext";
import { useMyTheme } from "@/context/ThemeContext";
import useParams from "@/hooks/useParams";
import { bibleState$ } from "@/state/bibleState";
import { modalState$ } from "@/state/modalState";
import { ChooseChapterNumberParams, Screens } from "@/types";
import { createOptimizedWebViewProps } from "@/utils/webViewOptimizations";
import { use$ } from "@legendapp/state/react";
import { useNavigation } from "expo-router";
import React, { useCallback, useRef } from "react";
import { Easing, runOnJS, withTiming } from "react-native-reanimated";
import WebView from "react-native-webview";

interface WebviewReferenceChooseProps {}

const WebviewReferenceChoose = React.memo(({}: WebviewReferenceChooseProps) => {
  const webViewRef = useRef<WebView>(null);
  const fontSize = use$(() => storedData$.fontSize.get());
  const bibleQuery = bibleState$.bibleQuery.get();

  const navigation = useNavigation();
  const routeParam = useParams<ChooseChapterNumberParams>();
  const { theme } = useMyTheme();

  const closeModal = () => {
    modalState$.toggleIsChooseReferenceOpened();
    // navigation.navigate(Screens.Home, params);
  };

  const onConfirm = useCallback(
    (ref: {
      book: string;
      chapter: number;
      verse: number;
      goHome: boolean;
    }) => {
      const isBottomSideSearching = bibleState$.isBottomBibleSearching.get();
      const params = {
        ...routeParam,
        [isBottomSideSearching ? "bottomSideBook" : "book"]: ref.book,
        [isBottomSideSearching ? "bottomSideChapter" : "chapter"]: ref.chapter,
        [isBottomSideSearching ? "bottomSideVerse" : "verse"]: ref.verse,
        isHistory: false,
      } as any;

      bibleState$.changeBibleQuery({
        ...params,
        isBibleBottom: isBottomSideSearching,
        shouldFetch: ref.goHome ? false : true,
        isHistory: false,
      });

      if (ref.goHome) {
        ChooseReferenceMutableProgress.value = withTiming(
          0,
          {
            duration: 50,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          },
          (finished) => {
            if (finished) {
              runOnJS(closeModal)();
            }
          }
        );
        // navigation.navigate(Screens.Home, params);
      }
    },
    [routeParam, navigation]
  );

  const handleMessage = useCallback((event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      const { data } = message;
      onConfirm(data);
    } catch (error) {
      console.warn("Error parsing WebView message:", error);
    }
  }, []);

  return (
    <WebView
      ref={webViewRef}
      key={bibleQuery.book + bibleQuery.chapter + bibleQuery.verse}
      originWhitelist={["*"]}
      style={{
        flex: 1,
        minWidth: "100%",
        backgroundColor: "transparent",
      }}
      source={{
        html: chooseReferenceHtmlTemplate({
          theme,
          initialBook: bibleQuery.book,
          initialChapter: bibleQuery.chapter,
          initialVerse: bibleQuery.verse,
        }),
      }}
      onMessage={handleMessage}
      onError={(syntheticEvent) => {
        const { nativeEvent = {} } = syntheticEvent;
        console.warn("WebView error: ", nativeEvent);
      }}
      {...createOptimizedWebViewProps({}, "static")}
    />
  );
});

export default React.memo(WebviewReferenceChoose);
