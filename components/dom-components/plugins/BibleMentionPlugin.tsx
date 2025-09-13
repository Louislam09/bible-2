/**
 * Bible Mention Plugin for Lexical Editor
 * Detects Bible references and fetches verse content
 */

import type { JSX } from "react";

import { $createBibleMentionNode, BibleMentionNode } from "./BibleMentionNode";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalTextEntity } from "@lexical/react/useLexicalTextEntity";
import { useCallback, useEffect, useState } from "react";
import { $getSelection, $isRangeSelection, TextNode } from "lexical";
import {
  DB_BOOK_NAMES,
  DB_BOOK_CHAPTER_VERSES,
  getBookDetail,
} from "../../../constants/BookNames";
import { BibleBookDropdown } from "./BibleBookDropdown";
import { ChapterVerseDropdown } from "./ChapterVerseDropdown";
import { BiblePlaceholderGuide } from "./BiblePlaceholderGuide";
import removeAccent from "../../../utils/removeAccent";
import type { IDBBookNames } from "../../../types";

// Helper function to safely set cursor position
function safeCursorPosition(
  selection: any,
  textNode: any,
  position: number,
  text: string,
  context: string = "cursor positioning"
) {
  try {
    // Ensure position is within valid range
    const safePosition = Math.max(0, Math.min(position, text.length));

    // Validate that the text node still exists and has the expected content
    if (!textNode || textNode.getTextContent() !== text) {
      console.warn(
        `Text node mismatch during ${context}, skipping cursor positioning`
      );
      return false;
    }

    selection.anchor.offset = safePosition;
    selection.focus.offset = safePosition;
    return true;
  } catch (error) {
    console.warn(`Failed to set cursor position during ${context}:`, error);

    // Fallback: try to position at end of text
    try {
      const endPosition = text.length;
      selection.anchor.offset = endPosition;
      selection.focus.offset = endPosition;
      return true;
    } catch (fallbackError) {
      console.error(
        `Fallback cursor positioning also failed during ${context}:`,
        fallbackError
      );
      return false;
    }
  }
}

type SelectionState = {
  step: "book" | "chapter" | "verse" | "complete" | "error";
  book?: IDBBookNames;
  chapter?: number;
  verse?: number;
  atPosition?: number;
  originalText?: string;
  error?: string;
  allowSkip?: boolean;
};

// Generate Bible books mapping from BookNames.ts data (Spanish only)
function createBibleBooksMapping(): Record<string, string> {
  const mapping: Record<string, string> = {};

  DB_BOOK_NAMES.forEach((book) => {
    // Add full name mapping (case-insensitive)
    mapping[book.longName.toLowerCase()] = book.longName;

    // Add short name mapping (case-insensitive)
    mapping[book.shortName.toLowerCase()] = book.longName;

    // Add accent-removed versions for flexible search
    mapping[removeAccent(book.longName)] = book.longName;
    mapping[removeAccent(book.shortName)] = book.longName;

    // Add some common variations and clean up special characters
    const cleanLongName = book.longName
      .replace(/[()]/g, "") // Remove parentheses like in "Apocalipsis (de Juan)"
      .trim();

    if (cleanLongName !== book.longName) {
      mapping[cleanLongName.toLowerCase()] = book.longName;
      mapping[removeAccent(cleanLongName)] = book.longName;
    }
  });

  return mapping;
}

const BIBLE_BOOKS = createBibleBooksMapping();

// Validation functions
function validateChapterForBook(book: IDBBookNames, chapter: number): boolean {
  const chapterData = DB_BOOK_CHAPTER_VERSES.filter(
    (item) => item.bookNumber === book.bookNumber
  );

  if (chapterData.length === 0) {
    // Fallback validation for books without data
    const maxChapter = getMaxChapterForBookFallback(book.longName);
    return chapter >= 1 && chapter <= maxChapter;
  }

  const chapters = [...new Set(chapterData.map((item) => item.chapterNumber))];
  return chapters.includes(chapter);
}

function validateVerseForChapter(
  book: IDBBookNames,
  chapter: number,
  verse: number
): boolean {
  const verseData = DB_BOOK_CHAPTER_VERSES.find(
    (item) =>
      item.bookNumber === book.bookNumber && item.chapterNumber === chapter
  );

  if (!verseData) {
    // Fallback: assume max 31 verses
    return verse >= 1 && verse <= 31;
  }

  return verse >= 1 && verse <= verseData.verseCount;
}

function getMaxChapterForBookFallback(bookName: string): number {
  const longBooks = ["Salmos", "Isaías", "Jeremías", "Ezequiel"];
  const mediumBooks = [
    "Génesis",
    "Éxodo",
    "Levítico",
    "Números",
    "Deuteronomio",
  ];

  if (longBooks.some((name) => bookName.includes(name))) return 150; // Psalms has 150
  if (mediumBooks.some((name) => bookName.includes(name))) return 50;
  return 28; // Default for most books
}

// Create regex pattern for @ bible references
function createBibleReferenceRegex(): RegExp {
  const bookNames = Object.keys(BIBLE_BOOKS)
    .filter((key) => key && key.trim())
    .map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) // Escape special regex characters
    .join("|");

  // Fallback pattern if no book names are found
  if (!bookNames) {
    return new RegExp("(?!.*)", "gi"); // Regex that never matches
  }

  // Match patterns like "@génesis 1:1", "@genesis 1:1", "@mateo 5:3", "@sal 23:1"
  // This includes both accented and accent-free versions
  const pattern = `@(${bookNames})\\s+(\\d+):(\\d+)\\b`;

  // if (__DEV__) {
  //   // Test the regex with our example
  //   const testRegex = new RegExp(pattern, "gi");
  //   const testMatch = "@Génesis 2:2".match(testRegex);
  // }

  return new RegExp(pattern, "gi");
}

const BIBLE_REGEX = createBibleReferenceRegex();

// Default fallback function when no fetch function is provided
async function defaultFetchBibleVerse(
  book: string,
  chapter: number,
  verse: number
): Promise<string> {
  return `[Base de datos no disponible - ${book} ${chapter}:${verse}]`;
}

interface BibleMentionPluginProps {
  fetchBibleVerse?: (
    book: string,
    chapter: number,
    verse: number
  ) => Promise<string>;
}

export function BibleMentionPlugin({
  fetchBibleVerse = defaultFetchBibleVerse,
}: BibleMentionPluginProps): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownQuery, setDropdownQuery] = useState("");
  const [selectionState, setSelectionState] = useState<SelectionState>({
    step: "book",
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  // Placeholder guide state
  const [placeholderText, setPlaceholderText] = useState("");
  const [cursorPosition, setCursorPosition] = useState({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    if (!editor.hasNodes([BibleMentionNode])) {
      throw new Error(
        "BibleMentionPlugin: BibleMentionNode not registered on editor"
      );
    }
  }, [editor]);

  // Handle @ detection and multi-step selection
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          setShowDropdown(false);
          setSelectionState({ step: "book" });
          return;
        }

        const anchorNode = selection.anchor.getNode();

        if (!(anchorNode instanceof TextNode)) {
          setShowDropdown(false);
          setSelectionState({ step: "book" });
          return;
        }

        const text = anchorNode.getTextContent();
        const offset = selection.anchor.offset;

        // Look for @ mentions - always show appropriate dropdown for each step
        const beforeCursor = text.slice(0, offset);

        // Detect different patterns for each step
        const completeMatch = beforeCursor.match(
          /@([a-záéíóúüñ]+)\s+(\d+):(\d+)(\s|$)/i
        );

        const verseInProgressMatch = beforeCursor.match(
          /@([a-záéíóúüñ]+)\s+(\d+):(\d*)$/i
        );
        const chapterInProgressMatch = beforeCursor.match(
          /@([a-záéíóúüñ]+)\s+(\d*)$/i
        );
        const bookOnlyMatch = beforeCursor.match(
          /@([a-záéíóúüñ]+)\s+([^0-9]|$)/i
        );
        const bookInProgressMatch = beforeCursor.match(/@([a-záéíóúüñ]*)$/i);

        // Calculate cursor position
        const updateCursorPosition = () => {
          const domSelection = window.getSelection();
          if (domSelection && domSelection.rangeCount > 0) {
            const range = domSelection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            setCursorPosition({ x: rect.left, y: rect.top });
          }
        };

        updateCursorPosition();

        if (completeMatch) {
          console.log("completeMatch", { completeMatch });
          // User typed complete reference - validate and close dropdown
          const [, bookText, chapterText, verseText] = completeMatch;
          const bookKey = removeAccent(bookText.toLowerCase());
          const book =
            BIBLE_BOOKS[bookKey] || BIBLE_BOOKS[bookText.toLowerCase()];
          const foundBook = DB_BOOK_NAMES.find(
            (b) =>
              b.longName.toLowerCase() === book?.toLowerCase() ||
              removeAccent(b.longName).toLowerCase() === bookKey ||
              b.shortName.toLowerCase() === bookText.toLowerCase()
          );

          if (foundBook) {
            const chapter = parseInt(chapterText);
            const verse = parseInt(verseText);

            // Validate chapter and verse
            let errorMsg = null;
            if (!validateChapterForBook(foundBook, chapter)) {
              errorMsg = `Capítulo ${chapter} no existe en ${foundBook.longName}`;
            } else if (!validateVerseForChapter(foundBook, chapter, verse)) {
              errorMsg = `Versículo ${verse} no existe en ${foundBook.longName} ${chapter}`;
            }

            if (errorMsg) {
              setValidationError(errorMsg);
              setSelectionState({
                step: "error",
                book: foundBook,
                chapter,
                verse,
                error: errorMsg,
                atPosition: beforeCursor.indexOf("@"),
                originalText: text,
              });
              setShowDropdown(true);
              return;
            }
          }

          setValidationError(null);
          setShowDropdown(false);
          setSelectionState({ step: "book" });
          return; // Exit early to prevent further processing
        } else if (verseInProgressMatch) {
          // User is typing verse after chapter (e.g., "@genesis 1:" or "@genesis 1:5")
          const [, bookText, chapterText, verseText] = verseInProgressMatch;

          const bookKey = removeAccent(bookText.toLowerCase());
          const book =
            BIBLE_BOOKS[bookKey] || BIBLE_BOOKS[bookText.toLowerCase()];
          const foundBook = DB_BOOK_NAMES.find(
            (b) =>
              b.longName.toLowerCase() === book?.toLowerCase() ||
              removeAccent(b.longName).toLowerCase() === bookKey ||
              b.shortName.toLowerCase() === bookText.toLowerCase()
          );

          if (foundBook && chapterText) {
            const chapter = parseInt(chapterText);

            // Validate chapter first
            if (
              !isNaN(chapter) &&
              !validateChapterForBook(foundBook, chapter)
            ) {
              const errorMsg = `Capítulo ${chapter} no existe en ${foundBook.longName}`;
              setValidationError(errorMsg);
              setSelectionState({
                step: "error",
                book: foundBook,
                chapter,
                error: errorMsg,
                atPosition: beforeCursor.indexOf("@"),
                originalText: text,
              });
              setShowDropdown(true);
              return;
            }

            // If verse is complete (has a number), validate it
            if (verseText && verseText.trim() && !isNaN(parseInt(verseText))) {
              const verse = parseInt(verseText);
              if (!validateVerseForChapter(foundBook, chapter, verse)) {
                const errorMsg = `Versículo ${verse} no existe en ${foundBook.longName} ${chapter}`;
                setValidationError(errorMsg);
                setSelectionState({
                  step: "error",
                  book: foundBook,
                  chapter,
                  verse,
                  error: errorMsg,
                  atPosition: beforeCursor.indexOf("@"),
                  originalText: text,
                });
                setShowDropdown(true);
                return;
              } else {
                // Valid verse - close dropdown
                setValidationError(null);
                setShowDropdown(false);
                setSelectionState({ step: "book" });
                return;
              }
            }

            // If verse is incomplete (just ":"), show verse dropdown if chapter is valid
            if (!isNaN(chapter) && validateChapterForBook(foundBook, chapter)) {
              setValidationError(null);
              setSelectionState({
                step: "verse",
                book: foundBook,
                chapter,
                atPosition: beforeCursor.indexOf("@"),
                originalText: text,
                allowSkip: true,
              });
              setShowDropdown(true);

              // Show placeholder for verse input
              setPlaceholderText(verseInProgressMatch[0]);
            }
          }
        } else if (chapterInProgressMatch && !verseInProgressMatch) {
          // User is typing chapter after book (e.g., "@genesis " or "@genesis 1")
          const [, bookText, chapterText] = chapterInProgressMatch;

          const bookKey = removeAccent(bookText.toLowerCase());
          const book =
            BIBLE_BOOKS[bookKey] || BIBLE_BOOKS[bookText.toLowerCase()];
          const foundBook = DB_BOOK_NAMES.find(
            (b) =>
              b.longName.toLowerCase() === book?.toLowerCase() ||
              removeAccent(b.longName).toLowerCase() === bookKey ||
              b.shortName.toLowerCase() === bookText.toLowerCase()
          );

          if (foundBook) {
            // If chapter number is provided, validate it
            if (
              chapterText &&
              chapterText.trim() &&
              !isNaN(parseInt(chapterText))
            ) {
              const chapter = parseInt(chapterText);
              if (!validateChapterForBook(foundBook, chapter)) {
                const errorMsg = `Capítulo ${chapter} no existe en ${foundBook.longName}`;
                setValidationError(errorMsg);
                setSelectionState({
                  step: "error",
                  book: foundBook,
                  chapter,
                  error: errorMsg,
                  atPosition: beforeCursor.indexOf("@"),
                  originalText: text,
                });
                setShowDropdown(true);
                return;
              }
            }

            // Show chapter dropdown (optional)
            setValidationError(null);
            setSelectionState({
              step: "chapter",
              book: foundBook,
              atPosition: beforeCursor.indexOf("@"),
              originalText: text,
              allowSkip: true, // Allow skipping chapter selection
            });
            setShowDropdown(true);

            // Show placeholder for chapter input
            setPlaceholderText(chapterInProgressMatch[0]);
          }
        } else if (bookOnlyMatch) {
          // User has typed a book followed by space and non-numeric characters
          // This means they want to continue typing after the book name - close dropdown
          setValidationError(null);
          setShowDropdown(false);
          setSelectionState({ step: "book" });
          return;
        } else if (bookInProgressMatch) {
          // User is typing book name (e.g., "@gen")
          const query = bookInProgressMatch[1];
          const atPosition = beforeCursor.indexOf("@");

          setDropdownQuery(query);
          setSelectionState({
            step: "book",
            atPosition,
            originalText: text,
          });
          setShowDropdown(true);

          // Show placeholder guide
          const fullMatch = bookInProgressMatch[0]; // e.g., "@gen"
          setPlaceholderText(fullMatch);
        } else {
          // No @ match found, or user has moved cursor away from mention
          // Also check if cursor is after a completed mention with space
          const afterCompleteMatch = beforeCursor.match(
            /@([a-záéíóúüñ]+)\s+(\d+):(\d+)\s+$/i
          );

          if (afterCompleteMatch || selectionState.step !== "book") {
            console.log("afterCompleteMatch", { afterCompleteMatch });
            setShowDropdown(false);
            setSelectionState({ step: "book" });
          }
          setShowDropdown(false);
        }
      });
    });
  }, [editor]);

  // Handle book selection from dropdown
  const handleBookSelect = useCallback(
    (book: IDBBookNames) => {
      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          return;
        }

        const anchorNode = selection.anchor.getNode();
        if (!(anchorNode instanceof TextNode)) {
          return;
        }

        const text = anchorNode.getTextContent();
        const offset = selection.anchor.offset;
        const beforeCursor = text.slice(0, offset);

        // Find the @ and replace everything after it with the selected book
        const atMatch = beforeCursor.match(/@([a-záéíóúüñ]*)$/i);
        if (atMatch) {
          const atPosition = beforeCursor.length - atMatch[0].length;
          const newText =
            text.slice(0, atPosition) +
            `@${book.longName} ` +
            text.slice(offset);

          anchorNode.setTextContent(newText);

          // Position cursor after the book name and space
          const newOffset = atPosition + `@${book.longName} `.length;
          safeCursorPosition(
            selection,
            anchorNode,
            newOffset,
            newText,
            "book selection"
          );
        }
      });

      // Close dropdown after book selection - user can continue typing or manually trigger chapter selection
      setShowDropdown(false);
      setSelectionState({ step: "book" });
    },
    [editor]
  );

  // Handle chapter selection
  const handleChapterSelect = useCallback(
    (chapter: number) => {
      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          return;
        }

        const anchorNode = selection.anchor.getNode();
        if (!(anchorNode instanceof TextNode)) {
          return;
        }

        const text = anchorNode.getTextContent();
        const offset = selection.anchor.offset;
        const beforeCursor = text.slice(0, offset);

        // Look for book name followed by space at cursor position
        const bookMatch = beforeCursor.match(/@([a-záéíóúüñ\s]+)\s*(\d*)$/i);
        if (bookMatch) {
          const [fullMatch, bookText, existingChapter] = bookMatch;
          const matchStart = beforeCursor.length - fullMatch.length;

          // Replace with book + chapter:
          const newText =
            text.slice(0, matchStart) +
            `@${bookText.trim()} ${chapter}:` +
            text.slice(offset);

          anchorNode.setTextContent(newText);

          // Position cursor after chapter:
          const newOffset =
            matchStart + `@${bookText.trim()} ${chapter}:`.length;
          safeCursorPosition(
            selection,
            anchorNode,
            newOffset,
            newText,
            "chapter selection"
          );
        }
      });

      setSelectionState((prev) => ({
        ...prev,
        step: "verse",
        chapter,
      }));
    },
    [editor]
  );

  // Handle verse selection - this completes the selection process
  const handleVerseSelect = useCallback(
    (verse: number) => {
      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
          return;
        }

        const anchorNode = selection.anchor.getNode();
        if (!(anchorNode instanceof TextNode)) {
          return;
        }

        const text = anchorNode.getTextContent();
        const offset = selection.anchor.offset;
        const beforeCursor = text.slice(0, offset);

        // Look for book chapter: pattern and complete with verse
        const verseMatch = beforeCursor.match(
          /@([a-záéíóúüñ\s]+)\s+(\d+):\s*(\d*)$/i
        );
        if (verseMatch) {
          const [fullMatch, bookText, chapterText, existingVerse] = verseMatch;
          const matchStart = beforeCursor.length - fullMatch.length;

          // Complete the reference and add space for verse text
          const newText =
            text.slice(0, matchStart) +
            `@${bookText.trim()} ${chapterText}:${verse}\n\n` +
            text.slice(offset);

          anchorNode.setTextContent(newText);

          // Position cursor after the space reserved for verse text
          const newOffset =
            matchStart +
            `@${bookText.trim()} ${chapterText}:${verse}\n\n`.length;
          safeCursorPosition(
            selection,
            anchorNode,
            newOffset,
            newText,
            "verse selection"
          );
        }
      });

      // Close dropdown and reset state
      setShowDropdown(false);
      setSelectionState({ step: "book" });
    },
    [editor]
  );

  const handleCloseDropdown = useCallback(() => {
    setShowDropdown(false);
    setSelectionState({ step: "book" });
  }, []);

  // Use text entity for completed @ mentions
  const getBibleMentionMatch = useCallback((text: string) => {
    try {
      const match = BIBLE_REGEX.exec(text);
      BIBLE_REGEX.lastIndex = 0; // Reset regex state

      if (match === null) {
        return null;
      }

      const startOffset = match.index;
      const endOffset = startOffset + match[0].length;

      // Only transform if followed by space, punctuation, or at end
      const nextChar = text[endOffset];
      if (nextChar && !/[\s\n\r.,!?;:\)]/.test(nextChar)) {
        return null;
      }

      return {
        end: endOffset,
        start: startOffset,
      };
    } catch (error) {
      if (__DEV__) {
        console.error("Bible mention match error:", error);
      }
      return null;
    }
  }, []);

  const $createBibleMentionNodeSync = useCallback(
    (textNode: TextNode): BibleMentionNode => {
      const text = textNode.getTextContent();

      // Create a non-global version of the regex to get capture groups
      const bookNames = Object.keys(BIBLE_BOOKS)
        .filter((key) => key && key.trim())
        .map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) // Escape special regex characters
        .join("|");
      const pattern = `@(${bookNames})\\s+(\\d+):(\\d+)\\b`;
      const regex = new RegExp(pattern, "i"); // Remove 'g' flag to get capture groups

      const match = text.match(regex);

      if (match) {
        // Simple pattern: @(bookName)\s+(chapter):(verse)\b
        // Array structure: [fullMatch, bookKey, chapterStr, verseStr]
        const [fullMatch, bookKey, chapterStr, verseStr] = match;

        // Validate that we have all required match groups
        if (!bookKey || !chapterStr || !verseStr) {
          console.log("Missing match groups, creating basic node");
          return $createBibleMentionNode(text);
        }

        // Try to find the book using our getBookDetail function
        // First try exact match, then try accent-removed match
        let book =
          BIBLE_BOOKS[bookKey.toLowerCase()] ||
          BIBLE_BOOKS[removeAccent(bookKey)] ||
          bookKey;

        const bookDetail = getBookDetail(book) || getBookDetail(bookKey);

        // Use the official book name if found
        if (bookDetail?.longName) {
          book = bookDetail.longName;
        }

        const chapter = parseInt(chapterStr, 10);
        const verse = parseInt(verseStr, 10);

        console.log("Final values", `${book} ${chapter}:${verse}`);

        const mentionNode = $createBibleMentionNode(
          fullMatch,
          book,
          chapter,
          verse
        );

        // Fetch verse text asynchronously
        fetchBibleVerse(book, chapter, verse)
          .then((verseText) => {
            editor.update(() => {
              mentionNode.setVerseText(verseText);
            });
          })
          .catch((error) => {
            console.error("Failed to fetch verse:", error);
          })
          .finally(() => {
            setShowDropdown(false);
          });

        return mentionNode;
      }

      return $createBibleMentionNode(text);
    },
    [editor, fetchBibleVerse]
  );

  useLexicalTextEntity<BibleMentionNode>(
    getBibleMentionMatch,
    BibleMentionNode,
    $createBibleMentionNodeSync
  );

  // Error dropdown component
  const ErrorDropdown = ({
    error,
    position,
    onClose,
  }: {
    error: string;
    position: { x: number; y: number };
    onClose: () => void;
  }) => (
    <div
      className="bible-book-dropdown"
      style={{ left: position.x, top: position.y + 20 }}
    >
      <div
        style={{
          padding: "8px 12px",
          borderBottom: "1px solid #f3f4f6",
          fontWeight: "500",
          fontSize: "13px",
          color: "#dc2626",
          backgroundColor: "#fef2f2",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>❌ Error de referencia</span>
        <button
          onClick={onClose}
          className="bible-dropdown-close-button"
          title="Cerrar"
          style={{ color: "#dc2626" }}
        >
          <span style={{ fontSize: "16px" }}>✕</span>
        </button>
      </div>
      <div style={{ padding: "12px", color: "#dc2626", fontSize: "14px" }}>
        {error}
      </div>
      <div
        className="bible-book-dropdown-footer"
        style={{ backgroundColor: "#fef2f2", color: "#dc2626" }}
      >
        Corrija la referencia o presione Esc para cerrar
      </div>
    </div>
  );

  // Render appropriate dropdown based on selection state
  const renderDropdown = () => {
    if (!showDropdown) return null;

    switch (selectionState.step) {
      case "book":
        return (
          <BibleBookDropdown
            query={dropdownQuery}
            onSelect={handleBookSelect}
            onClose={handleCloseDropdown}
            position={cursorPosition}
          />
        );

      case "chapter":
        return selectionState.book ? (
          <ChapterVerseDropdown
            book={selectionState.book}
            mode="chapter"
            onSelect={handleChapterSelect}
            onClose={handleCloseDropdown}
            position={cursorPosition}
          />
        ) : null;

      case "verse":
        return selectionState.book && selectionState.chapter ? (
          <ChapterVerseDropdown
            book={selectionState.book}
            mode="verse"
            chapter={selectionState.chapter}
            onSelect={handleVerseSelect}
            onClose={handleCloseDropdown}
            position={cursorPosition}
          />
        ) : null;

      case "error":
        return (
          <ErrorDropdown
            error={selectionState.error || "Error desconocido"}
            position={cursorPosition}
            onClose={handleCloseDropdown}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      {renderDropdown()}
      <BiblePlaceholderGuide
        currentText={placeholderText}
        position={cursorPosition}
        isVisible={showDropdown}
      />
    </>
  );
}
