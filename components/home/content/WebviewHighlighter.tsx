import { View } from "@/components/Themed";
import { highlighterHtmlTemplate } from "@/constants/highlighterHtmlTemplate";
import { storedData$ } from "@/context/LocalstoreContext";
import { useDBContext } from "@/context/databaseContext";
import { useHaptics } from "@/hooks/useHaptics";
import { HighlightStyle, useHighlightService } from "@/services/highlightService";
import { bibleState$ } from "@/state/bibleState";
import { modalState$ } from "@/state/modalState";
import { TTheme } from "@/types";
import { createOptimizedWebViewProps } from "@/utils/webViewOptimizations";
import { use$ } from "@legendapp/state/react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import WebView from "react-native-webview";

const HIGHLIGHT_COLORS = [
  { color: "#FFEB3B", label: "Amarillo" }, // Yellow
  { color: "#4CAF50", label: "Verde" }, // Green
  { color: "#2196F3", label: "Azul" }, // Blue
  { color: "#E91E63", label: "Rosa" }, // Pink
];

interface Props {
  theme: TTheme;
}

const WebviewHighlighter: React.FC<Props> = ({ theme }) => {
  const webViewRef = useRef<WebView>(null);
  const fontSize = use$(() => storedData$.fontSize.get());
  const haptics = useHaptics();
  const {
    createHighlight,
    updateHighlight,
    deleteHighlight,
    getAllHighlightedVerses,
    getAllHighlightedVersesByBookAndChapter
  } = useHighlightService();

  const isOpen = use$(() => modalState$.isHighlighterOpen.get());
  const reference = use$(() => modalState$.highlighterReference.get());
  const selectedVerses = use$(() => bibleState$.selectedVerses.get());
  const bibleQuery = use$(() => bibleState$.bibleQuery.get());

  const [existingHighlights, setExistingHighlights] = useState<
    Map<string, { id?: number; style: HighlightStyle; color: string; uuid: string }>
  >(new Map());
  const [loading, setLoading] = useState(false);

  const loadExistingHighlights = useCallback(async () => {
    try {
      const allHighlights = await getAllHighlightedVersesByBookAndChapter(reference.bookNumber, reference.chapter);
      const highlightsMap = new Map();

      allHighlights.forEach((highlight) => {
        const key = `${highlight.book_number}-${highlight.chapter}-${highlight.verse}`;
        highlightsMap.set(key, {
          id: highlight.id,
          style: highlight.style,
          color: highlight.color,
          uuid: highlight.uuid,
        });
      });
      setExistingHighlights(highlightsMap);
    } catch (error) {
      console.error("Error loading existing highlights:", error);
    }
  }, []);

  // Load existing highlights for the verses and clear preview when opening
  useEffect(() => {
    if (isOpen) {
      loadExistingHighlights();
      // Clear any stale preview data when highlighter opens
      modalState$.previewHighlight.set({ color: "", style: "" });
    }
  }, [isOpen]);

  const handleColorSelect = useCallback(async (color: string, style: HighlightStyle = 'highlight') => {
    haptics.selection();
    setLoading(true);

    try {
      // Get current verses
      const verses = selectedVerses.size > 0
        ? Array.from(selectedVerses.values()).sort((a, b) => a.verse - b.verse)
        : [{
          book_number: reference.bookNumber || (typeof bibleQuery.book === 'number' ? bibleQuery.book : 1),
          chapter: reference.chapter || bibleQuery.chapter,
          verse: reference.verse || bibleQuery.verse,
          text: '',
          is_favorite: 0,
          subheading: []
        }];

      // Get current highlights
      const allHighlights = await getAllHighlightedVersesByBookAndChapter(reference.bookNumber, reference.chapter);

      const highlightsMap = new Map();
      allHighlights.forEach((highlight) => {
        const key = `${highlight.book_number}-${highlight.chapter}-${highlight.verse}`;
        highlightsMap.set(key, {
          id: highlight.id,
          style: highlight.style,
          color: highlight.color,
          uuid: highlight.uuid,
        });
      });

      for (const verse of verses) {
        const bookNumber = verse.book_number;
        const chapter = verse.chapter;
        const verseNumber = verse.verse;
        const key = `${bookNumber}-${chapter}-${verseNumber}`;
        const existing = highlightsMap.get(key);

        if (existing) {
          // Update existing highlight
          await updateHighlight(bookNumber, chapter, verseNumber, {
            style,
            color,
          });
        } else {
          // Create new highlight
          await createHighlight({
            book_number: bookNumber,
            chapter,
            verse: verseNumber,
            style,
            color,
            text: verse.text || '',
          });
        }
      }

      // Reload highlights
      await loadExistingHighlights();

      // Clear preview
      modalState$.previewHighlight.set({ color: "", style: "" });

      // Clear selection and close
      bibleState$.clearSelection();
      modalState$.closeHighlighterBottomSheet();
    } catch (error) {
      console.error("Error applying highlight:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedVerses, reference, bibleQuery]);

  const handleClearHighlight = useCallback(async () => {
    haptics.selection();
    setLoading(true);

    try {
      // Get current verses
      const verses = selectedVerses.size > 0
        ? Array.from(selectedVerses.values()).sort((a, b) => a.verse - b.verse)
        : [{
          book_number: reference.bookNumber || (typeof bibleQuery.book === 'number' ? bibleQuery.book : 1),
          chapter: reference.chapter || bibleQuery.chapter,
          verse: reference.verse || bibleQuery.verse,
          text: '',
          is_favorite: 0,
          subheading: []
        }];

      // Get current highlights
      const allHighlights = await getAllHighlightedVerses();
      const highlightsMap = new Map();
      allHighlights.forEach((highlight) => {
        const key = `${highlight.book_number}-${highlight.chapter}-${highlight.verse}`;
        highlightsMap.set(key, {
          id: highlight.id,
          style: highlight.style,
          color: highlight.color,
          uuid: highlight.uuid,
        });
      });

      for (const verse of verses) {
        const bookNumber = verse.book_number;
        const chapter = verse.chapter;
        const verseNumber = verse.verse;
        const key = `${bookNumber}-${chapter}-${verseNumber}`;
        const existing = highlightsMap.get(key);

        if (existing && existing.uuid) {
          await deleteHighlight(bookNumber, chapter, verseNumber, existing.uuid);
        }
      }

      // Reload highlights
      await loadExistingHighlights();

      // Clear preview
      modalState$.previewHighlight.set({ color: "", style: "" });

      // Clear selection and close
      bibleState$.clearSelection();
      modalState$.closeHighlighterBottomSheet();
    } catch (error) {
      console.error("Error clearing highlight:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedVerses, reference, bibleQuery]);

  // Get verses to highlight (from selectedVerses or current reference)
  const verses = useMemo(() => {
    if (selectedVerses.size > 0) {
      return Array.from(selectedVerses.values()).sort((a, b) => a.verse - b.verse);
    }
    // Fallback to current reference
    const bookNumber = reference.bookNumber || (typeof bibleQuery.book === 'number' ? bibleQuery.book : 1);
    const chapter = reference.chapter || bibleQuery.chapter;
    const verseNumber = reference.verse || bibleQuery.verse;

    return [{
      book_number: bookNumber,
      chapter,
      verse: verseNumber,
      text: '',
      is_favorite: 0,
      subheading: []
    }];
  }, [selectedVerses, reference, bibleQuery]);


  // Get selected colors and styles for the verses
  const selectedColors = useMemo(() => {
    const selected: string[] = [];
    verses.forEach((verse: any) => {
      const key = `${verse.book_number}-${verse.chapter}-${verse.verse}`;
      const existing = existingHighlights.get(key);
      if (existing?.color) {
        selected.push(existing.color);
      }
    });
    return selected;
  }, [verses, existingHighlights]);

  // Get selected style for the verses (if all verses have the same style, use it; otherwise default to 'highlight')
  const selectedStyle = useMemo(() => {
    if (verses.length === 0) return 'highlight';

    const styles = verses.map((verse: any) => {
      const key = `${verse.book_number}-${verse.chapter}-${verse.verse}`;
      const existing = existingHighlights.get(key);
      return existing?.style || 'highlight';
    });

    // If all verses have the same style, return it; otherwise default to 'highlight'
    const firstStyle = styles[0];
    return styles.every(style => style === firstStyle) ? firstStyle : 'highlight';
  }, [verses, existingHighlights]);

  const htmlTemplate = useMemo(() => {
    return highlighterHtmlTemplate({
      theme,
      colors: HIGHLIGHT_COLORS,
      selectedColors,
      selectedStyle,
      fontSize: fontSize || 16,
    });
  }, [theme, selectedColors, selectedStyle, fontSize]);

  const handleMessage = useCallback(
    (event: any) => {
      try {
        const message = JSON.parse(event.nativeEvent.data);

        switch (message.type) {
          case "colorSelect":
            if (message.data?.color && message.data?.style) {
              handleColorSelect(message.data.color, message.data.style);
            }
            break;
          case "clearHighlight":
            handleClearHighlight();
            break;
          case "previewHighlight":
            // Forward preview message to WebViewChapter via modalState
            if (message.data?.color && message.data?.style) {
              modalState$.previewHighlight.set({
                color: message.data.color,
                style: message.data.style
              });
            }
            break;
        }
      } catch (error) {
        console.warn("Error parsing WebView message:", error);
      }
    },
    [handleColorSelect, handleClearHighlight]
  );

  return (
    <WebView
      ref={webViewRef}
      key="highlighter-webview"
      originWhitelist={["*"]}
      style={{
        flex: 1,
        minWidth: "100%",
        backgroundColor: "transparent",
      }}
      containerStyle={{
        backgroundColor: "transparent",
      }}
      source={{
        html: htmlTemplate,
      }}
      scrollEnabled={true}
      nestedScrollEnabled={true}
      onMessage={handleMessage}
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
      {...createOptimizedWebViewProps({}, "static")}
    />
  );
};

export default WebviewHighlighter;

