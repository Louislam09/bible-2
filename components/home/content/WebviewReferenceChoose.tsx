import { chooseReferenceHtmlTemplate } from "@/chooseReferenceTemplate";
import { bibleChapterHtmlTemplate } from "@/constants/bibleChapterTemplate";
import { storedData$ } from "@/context/LocalstoreContext";
import { bibleState$ } from "@/state/bibleState";
import { IBookVerse, IFavoriteVerse, TTheme } from "@/types";
import { WordTagPair } from "@/utils/extractVersesInfo";
import { createOptimizedWebViewProps } from "@/utils/webViewOptimizations";
import { use$ } from "@legendapp/state/react";
import React, { useCallback, useRef } from "react";
import WebView from "react-native-webview";

interface WebviewReferenceChooseProps {
  theme: TTheme;
  onConfirm: (ref: { book: string; chapter: number; verse: number }) => void;
}

const WebviewReferenceChoose = React.memo(
  ({ theme, onConfirm }: WebviewReferenceChooseProps) => {
    const webViewRef = useRef<WebView>(null);
    const fontSize = use$(() => storedData$.fontSize.get());
    const bibleQuery = bibleState$.bibleQuery.get();
    console.log({ bibleQuery });

    const handleMessage = useCallback((event: any) => {
      try {
        const message = JSON.parse(event.nativeEvent.data);
        console.log({ message });
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
  }
);

export default React.memo(WebviewReferenceChoose);
