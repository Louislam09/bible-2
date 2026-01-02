import { View } from "@/components/Themed";
import { bibleChapterHtmlTemplate } from "@/constants/bibleChapterTemplate";
import { getBookDetail } from "@/constants/BookNames";
import { useDBContext } from "@/context/databaseContext";
import { storedData$ } from "@/context/LocalstoreContext";
import { useHighlightService } from "@/services/highlightService";
import { bibleState$ } from "@/state/bibleState";
import { modalState$ } from "@/state/modalState";
import { tourState$ } from "@/state/tourState";
import { IBookVerse, IFavoriteVerse, TTheme } from "@/types";
import { WordTagPair } from "@/utils/extractVersesInfo";
import { createOptimizedWebViewProps } from "@/utils/webViewOptimizations";
import { use$ } from "@legendapp/state/react";
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  onStrongWordClicked?: (value: WordTagPair) => void;
  onWordClicked?: (code: string, item: IBookVerse) => void;
  onScroll?: (direction: "up" | "down") => void;
  estimatedReadingTime?: number;
  onInterlinear?: (item: IBookVerse) => void;
  onAnotar?: (item: IBookVerse | IBookVerse[]) => void;
  onComparar?: (item: IBookVerse) => void;
  onMemorizeVerse?: (verse: string, version: string) => void;
  onFavoriteVerse?: ({
    bookNumber,
    chapter,
    verse,
    isFav,
  }: IFavoriteVerse) => Promise<void>;
  onCopy?: (item: IBookVerse | IBookVerse[]) => void;
  onExplain?: (item: IBookVerse) => void;
  onImage?: (item: IBookVerse | IBookVerse[]) => void;
  onQuote?: (item: IBookVerse | IBookVerse[]) => void;
  onVerseLongPress?: (item: IBookVerse) => void;
}

const WebViewChapter = memo(
  ({
    data,
    initialScrollIndex = 0,
    theme,
    isInterlinear,
    onStrongWordClicked,
    onWordClicked,
    onScroll,
    onInterlinear,
    onAnotar,
    onMemorizeVerse,
    onFavoriteVerse,
    onCopy,
    onExplain,
    onImage,
    onQuote,
    onVerseLongPress,
  }: WebViewChapterProps) => {
    const webViewRef = useRef<WebView>(null);
    const startVerseSectionTour = use$(() => tourState$.startVerseSectionTour.get());
    const { isMyBibleDbLoaded } = useDBContext();
    const { getAllHighlightedVersesByBookAndChapter } = useHighlightService();
    const isHighlighterOpen = use$(() => modalState$.isHighlighterOpen.get());
    const previewHighlightData = use$(() => modalState$.previewHighlight.get());
    const [highlights, setHighlights] = useState<Map<string, { color: string; style: string }>>(new Map());
    const lastPreviewRef = useRef<{ color: string; style: string }>({ color: "", style: "" });

    const handleMessage = useCallback(
      (event: any) => {
        try {
          const message = JSON.parse(event.nativeEvent.data);

          switch (message.type) {
            case "onload":
              if (startVerseSectionTour) {
                startTour();
              }
              break;
            case "tourCompleted":
              tourState$.startVerseSectionTour.set(false);
              break;
            case "scroll":
              onScroll?.(message.direction);
              break;
            case "verseClick":
              if (message.data?.item) {
                const item = message.data.item;
                const isActionMode = bibleState$.selectedVerses.get().size > 0;
                if (!isActionMode) {
                  bibleState$.handleTapVerse(item);
                }
              }
              break;
            case "verseLongPress":
              onVerseLongPress?.(message.data.item);
              break;
            case "regularWordClick":
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
            case "verseAction":
              const { action, item, allSelectedVerses, isMultiVerse } = message.data;

              // For copy and note actions, use all selected verses if available
              const dataToUse = isMultiVerse && allSelectedVerses ? allSelectedVerses : item;

              switch (action) {
                case "copy":
                  onCopy?.(dataToUse);
                  break;
                case "interlinear":
                  onInterlinear?.(item);
                  break;
                case "explain":
                  onExplain?.(item);
                  break;
                case "image":
                  onImage?.(dataToUse);
                  break;
                case "quote":
                  onQuote?.(dataToUse);
                  break;
                case "commentary":
                  modalState$.openCommentaryBottomSheet(
                    item.book_number,
                    item.chapter,
                    item.verse
                  );
                  break;
                case "note":
                  onAnotar?.(dataToUse);
                  break;
                case "highlighter":
                  const verseToHighlight = isMultiVerse && allSelectedVerses ? allSelectedVerses[0] : item;
                  modalState$.openHighlighterBottomSheet(
                    verseToHighlight.book_number,
                    verseToHighlight.chapter,
                    verseToHighlight.verse
                  );
                  break;
                case "favorite":
                  onFavoriteVerse?.({
                    bookNumber: item.book_number,
                    chapter: item.chapter,
                    verse: item.verse,
                    isFav: item.is_favorite,
                  });
                  break;
                case "memorize":
                  const text = `${getBookDetail(item?.book_number).longName} ${item?.chapter}:${item?.verse}`
                  onMemorizeVerse?.(text, storedData$.currentBibleVersion.get());
                  break;
                // case "compare":
                //   onComparar?.(item);
                //   break;
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
            case "requestHighlights":
              // WebView requesting highlights update
              loadHighlights();
              break;
            case "previewHighlight":
              if (message.data?.color && message.data?.style) {
                previewHighlight(message.data.color, message.data.style);
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
        onMemorizeVerse,
        onFavoriteVerse,
        onCopy,
        onExplain,
        onImage,
        onQuote,
        onVerseLongPress,
        startVerseSectionTour
      ]
    );

    const insets = useSafeAreaInsets();
    const safeTop = insets.top;

    const fontSize = use$(() => storedData$.fontSize.get());
    const selectedFont = use$(() => storedData$.selectedFont.get());
    const showReadingTime = use$(() => storedData$.showReadingTime.get());

    const previewHighlight = useCallback((color: string, style: string) => {
      // Get current reference or selected verses
      const reference = modalState$.highlighterReference.get();
      const selectedVerses = bibleState$.selectedVerses.get();

      let versesToPreview: Array<{ book_number: number; chapter: number; verse: number }> = [];

      if (selectedVerses.size > 0) {
        versesToPreview = Array.from(selectedVerses.values()).map(v => ({
          book_number: v.book_number,
          chapter: v.chapter,
          verse: v.verse
        }));
      } else if (reference.bookNumber && reference.chapter && reference.verse) {
        versesToPreview = [{
          book_number: reference.bookNumber,
          chapter: reference.chapter,
          verse: reference.verse
        }];
      }

      // Send preview to WebView
      if (webViewRef.current && versesToPreview.length > 0) {
        const previewData: Record<string, { color: string; style: string }> = {};
        versesToPreview.forEach(verse => {
          const key = `${verse.book_number}-${verse.chapter}-${verse.verse}`;
          previewData[key] = { color, style };
        });

        webViewRef.current.injectJavaScript(`
          (function() {
            if (window.previewHighlight) {
              window.previewHighlight(${JSON.stringify(previewData)});
            }
          })();
          true;
        `);
      }
    }, []);

    const loadHighlights = useCallback(async () => {
      try {
        const reference = data[0] || { book_number: 10, chapter: 1 }
        const allHighlights = await getAllHighlightedVersesByBookAndChapter(reference.book_number, reference.chapter);
        const highlightsMap = new Map<string, { color: string; style: string }>();

        allHighlights.forEach((highlight) => {
          const key = `${highlight.book_number}-${highlight.chapter}-${highlight.verse}`;
          highlightsMap.set(key, {
            color: highlight.color,
            style: highlight.style,
          });
        });

        setHighlights(highlightsMap);

        // Send update message to WebView using injectedJavaScript
        if (webViewRef.current) {
          const highlightsObj = Object.fromEntries(highlightsMap);
          webViewRef.current.injectJavaScript(`
            (function() {
              if (window.updateHighlights) {
                window.updateHighlights(${JSON.stringify(highlightsObj)});
              }
            })();
            true; // note: this is required, or you'll sometimes get silent failures
          `);
        }
      } catch (error) {
        console.error("Error loading highlights:", error);
      }
    }, []);

    // Load highlights
    useEffect(() => {
      if (isMyBibleDbLoaded) {
        loadHighlights();
      }
    }, [isMyBibleDbLoaded, data, isHighlighterOpen]);

    // Handle preview highlight updates
    useEffect(() => {
      const hasColor = previewHighlightData.color && previewHighlightData.color !== "";
      const hasStyle = previewHighlightData.style && previewHighlightData.style !== "";
      const isDifferent =
        lastPreviewRef.current.color !== previewHighlightData.color ||
        lastPreviewRef.current.style !== previewHighlightData.style;

      if (hasColor && hasStyle && isHighlighterOpen && isDifferent) {
        lastPreviewRef.current = {
          color: previewHighlightData.color,
          style: previewHighlightData.style
        };
        previewHighlight(previewHighlightData.color, previewHighlightData.style);
      } else if (!hasColor && !hasStyle && isHighlighterOpen) {
        // Clear preview if both are empty
        if (lastPreviewRef.current.color || lastPreviewRef.current.style) {
          lastPreviewRef.current = { color: "", style: "" };
          if (webViewRef.current) {
            webViewRef.current.injectJavaScript(`
              (function() {
                if (window.clearPreview) {
                  window.clearPreview();
                }
              })();
              true;
            `);
          }
        }
      }
    }, [previewHighlightData.color, previewHighlightData.style]);

    const htmlChapterTemplate = useMemo(() => {
      return bibleChapterHtmlTemplate({
        data,
        theme,
        width: Dimensions.get("window").width,
        isSplit: false,
        isInterlinear,
        fontSize,
        initialScrollIndex,
        showReadingTime,
        selectedFont,
        shouldLoadTour: startVerseSectionTour, // Only load tour scripts when actually needed
        highlights: highlights,
      });
    }, [
      data,
      theme,
      isInterlinear,
      initialScrollIndex,
      fontSize,
      showReadingTime,
      selectedFont,
      startVerseSectionTour,
      highlights
    ]);

    const startTour = useCallback(() => {
      webViewRef.current?.postMessage(JSON.stringify({ type: "startTour" }));
      // tourState$.startVerseSectionTour.set(false);
    }, []);

    return (
      <>
        <WebView
          ref={webViewRef}
          key={
            bibleState$.bibleQuery.get().book +
            bibleState$.bibleQuery.get().chapter
          }
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
          source={{
            html: htmlChapterTemplate,
          }}
          scrollEnabled={true}
          onMessage={handleMessage}
          startInLoadingState={false}
          androidLayerType="hardware"
          renderLoading={() => <View
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
          />}
          {...createOptimizedWebViewProps({}, "bibleChapter")}
        />
      </>
    );
  }
);

export default WebViewChapter;
