import { bibleChapterHtmlTemplate } from "@/constants/bibleChapterTemplate";
import { storedData$ } from "@/context/LocalstoreContext";
import { bibleState$ } from "@/state/bibleState";
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
  onCopy?: (item: IBookVerse) => void;
  onExplain?: (item: IBookVerse) => void;
  onImage?: (item: IBookVerse) => void;
  onQuote?: (item: IBookVerse) => void;
  onVerseLongPress?: (item: IBookVerse) => void;
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
    onCopy,
    onExplain,
    onImage,
    onQuote,
    onVerseLongPress,
  }: WebViewChapterProps) => {
    const webViewRef = useRef<WebView>(null);
    const fontSize = use$(() => storedData$.fontSize.get());

    const handleMessage = useCallback(
      (event: any) => {
        try {
          const message = JSON.parse(event.nativeEvent.data);
          console.log("message-" + message.type);

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
            case "verseLongPress":
              // Handle verse long press - could trigger haptic feedback or other UI updates
              onVerseLongPress?.(message.data.item);
              break;
            case "verseAction":
              const { action, item } = message.data;
              switch (action) {
                case "copy":
                  onCopy?.(item);
                  break;
                case "interlinear":
                  onInterlinear?.(item);
                  break;
                case "explain":
                  onExplain?.(item);
                  break;
                case "image":
                  onImage?.(item);
                  break;
                case "quote":
                  onQuote?.(item);
                  break;
                case "note":
                  onAnotar?.(item);
                  break;
                case "favorite":
                  onFavoriteVerse?.({
                    bookNumber: item.book_number,
                    chapter: item.chapter,
                    verse: item.verse,
                    isFav: !item.is_favorite,
                  });
                  break;
                case "memorize":
                  onMemorizeVerse?.(item.text, "version");
                  break;
                case "compare":
                  onComparar?.(item);
                  break;
              }
              break;
            case "verseLinkClick":
              // Handle verse link clicks from verse titles
              if (message.data) {
                const { bookName, chapter, verse } = message.data;

                const isBottom = false;
                const queryInfo = {
                  [isBottom ? "bottomSideBook" : "book"]: bookName,
                  [isBottom ? "bottomSideChapter" : "chapter"]: chapter,
                  [isBottom ? "bottomSideVerse" : "verse"]: verse,
                };
                bibleState$.changeBibleQuery({
                  ...queryInfo,
                  shouldFetch: true,
                  isBibleBottom: isBottom,
                  isHistory: false,
                });
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
        onCopy,
        onExplain,
        onImage,
        onQuote,
        onVerseLongPress,
      ]
    );
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
          // paddingBottom: insets.bottom + 40,
          backgroundColor: "red",
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
