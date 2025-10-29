import { View } from "@/components/Themed";
import { bibleChapterHtmlTemplate } from "@/constants/bibleChapterTemplate";
import { useBibleContext } from "@/context/BibleContext";
import { storedData$ } from "@/context/LocalstoreContext";
import { bibleState$ } from "@/state/bibleState";
import { modalState$ } from "@/state/modalState";
import { IBookVerse, IFavoriteVerse, TTheme } from "@/types";
import { WordTagPair } from "@/utils/extractVersesInfo";
import { createOptimizedWebViewProps } from "@/utils/webViewOptimizations";
import { use$ } from "@legendapp/state/react";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Dimensions } from "react-native";
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
    const [hasLoaded, setHasLoaded] = useState(false);
    const { tailwindScript } = useBibleContext();

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
            case "regularWordClick":
              console.log("regularWordClick", message.data);
              modalState$.openDictionaryBottomSheet(message.data);
              break;
            case "strongWordClick":
              if (onStrongWordClicked && message.data) {
                onStrongWordClicked(message.data);
              }
              break;
            case "multipleStrongsClick":
              if (message.data) {
                // Handle multiple Strong's numbers click
                const { word, strongNumbers, verseData } = message.data;
                // Set the data and open the bottom sheet
                bibleState$.handleMultipleStrongs({
                  word,
                  strongNumbers,
                  verseData,
                });
                modalState$.openMultipleStrongsBottomSheet();
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

    const fontSize = use$(() => storedData$.fontSize.get());
    const showReadingTime = use$(() => storedData$.showReadingTime.get());

    const htmlChapterTemplate = useMemo(() => {
      return bibleChapterHtmlTemplate({
        data,
        theme,
        width: Dimensions.get("window").width,
        isSplit: false,
        isInterlinear,
        fontSize,
        initialScrollIndex,
        tailwindScript,
        showReadingTime,
      });
    }, [
      data,
      theme,
      isInterlinear,
      initialScrollIndex,
      tailwindScript,
      fontSize,
      showReadingTime,
    ]);

    return (
      <>
        {!hasLoaded && (
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
            }}
          />
        )}
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
            backgroundColor: "transparent",
          }}
          source={{ html: htmlChapterTemplate }}
          scrollEnabled={true}
          onMessage={handleMessage}
          onLoadStart={() => {}}
          onLoadEnd={() => {
            setHasLoaded(true);
          }}
          onError={(syntheticEvent) => {
            const { nativeEvent = {} } = syntheticEvent;
            console.warn("WebView error: ", nativeEvent);
          }}
          {...createOptimizedWebViewProps({}, "static")}
        />
      </>
    );
  }
);

export default React.memo(WebViewChapter);
