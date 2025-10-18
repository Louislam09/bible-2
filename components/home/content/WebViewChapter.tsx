import { bibleChapterHtmlTemplate } from "@/constants/bibleChapterTemplate";
import { storedData$ } from "@/context/LocalstoreContext";
import { IBookVerse, IFavoriteVerse, TTheme } from "@/types";
import { WordTagPair } from "@/utils/extractVersesInfo";
import { createOptimizedWebViewProps } from "@/utils/webViewOptimizations";
import { use$ } from "@legendapp/state/react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import WebView from "react-native-webview";

interface WebViewChapterProps {
  data: IBookVerse[];
  width: number;
  isInterlinear: boolean;
  isSplit?: boolean;
  initialScrollIndex?: number;
  theme: TTheme;
  verses: IBookVerse[];
  onStrongWordClicked?: (value: WordTagPair) => void;
  onWordClicked?: (code: string, item: IBookVerse) => void;
  onScroll?: (direction: "up" | "down") => void;
  estimatedReadingTime?: number;
  onInterlinear?: (item: IBookVerse) => void;
  onAnotar?: (item: IBookVerse) => void;
  onComparar?: (item: IBookVerse) => void;
  onMemorizeVerse?: (verse: string, version: string) => void;
  onFavoriteVerse?: ({
    bookNumber,
    chapter,
    verse,
    isFav,
  }: IFavoriteVerse) => Promise<void>;
}

const WebViewChapter = React.memo(
  ({
    data,
    width,
    isSplit = false,
    initialScrollIndex = 0,
    theme,
    verses,
    isInterlinear,
    onStrongWordClicked,
    onWordClicked,
    onScroll,
    estimatedReadingTime = 0,
    onInterlinear,
    onAnotar,
    onComparar,
    onMemorizeVerse,
    onFavoriteVerse,
  }: WebViewChapterProps) => {
    const webViewRef = useRef<WebView>(null);
    const fontSize = use$(() => storedData$.fontSize.get());

    const handleMessage = useCallback(
      (event: any) => {
        try {
          const message = JSON.parse(event.nativeEvent.data);

          switch (message.type) {
            case "scroll":
              onScroll?.(message.direction);
              break;
            case "verseClick":
              // Handle verse click
              break;
            case "strongWordClick":
              if (onStrongWordClicked && message.data) {
                onStrongWordClicked(message.data);
              }
              break;
            case "wordClick":
              if (onWordClicked && message.code && message.item) {
                onWordClicked(message.code, message.item);
              }
              break;
            case "verseAction":
              const { action, item } = message;
              switch (action) {
                case "interlinear":
                  onInterlinear?.(item);
                  break;
                case "annotate":
                  onAnotar?.(item);
                  break;
                case "compare":
                  onComparar?.(item);
                  break;
                case "memorize":
                  onMemorizeVerse?.(item.text, "version");
                  break;
                case "favorite":
                  onFavoriteVerse?.({
                    bookNumber: item.book_number,
                    chapter: item.chapter,
                    verse: item.verse,
                    isFav: !item.is_favorite,
                  });
                  break;
              }
              break;
          }
        } catch (error) {
          console.warn("Error parsing WebView message:", error);
        }
      },
      [
        onScroll,
        onStrongWordClicked,
        onWordClicked,
        onInterlinear,
        onAnotar,
        onComparar,
        onMemorizeVerse,
        onFavoriteVerse,
      ]
    );
    console.log({ initialScrollIndex });
    const insets = useSafeAreaInsets();
    const safeTop = insets.top;

    return (
      <WebView
        ref={webViewRef}
        key={data[0].book_number + data[0].chapter}
        originWhitelist={["*"]}
        style={{
          flex: 1,
          minWidth: "100%",
          backgroundColor: "transparent",
        }}
        containerStyle={{
          marginTop: safeTop + 10,
        }}
        source={{
          html: bibleChapterHtmlTemplate({
            data,
            theme,
            width,
            isSplit,
            isInterlinear,
            fontSize,
            initialScrollIndex,
          }),
        }}
        scrollEnabled={true}
        onMessage={handleMessage}
        onLoadEnd={() => {}}
        onError={(syntheticEvent) => {
          const { nativeEvent = {} } = syntheticEvent;
          console.warn("WebView error: ", nativeEvent);
        }}
        {...createOptimizedWebViewProps({}, "static")}
      />
    );
  }
);

export default React.memo(WebViewChapter);
