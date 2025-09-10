/**
 * Chapter and Verse Dropdown Component for @ mentions
 */

import { useCallback, useEffect, useState } from "react";
import { DB_BOOK_CHAPTER_VERSES } from "../../../constants/BookNames";
import type { IDBBookNames } from "../../../types";

interface ChapterVerseDropdownProps {
  book: IDBBookNames;
  mode: "chapter" | "verse";
  chapter?: number;
  onSelect: (value: number) => void;
  onClose: () => void;
  position: { x: number; y: number };
}

export function ChapterVerseDropdown({
  book,
  mode,
  chapter,
  onSelect,
  onClose,
  position,
}: ChapterVerseDropdownProps) {
  const [options, setOptions] = useState<number[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Generate options based on mode using real data
  useEffect(() => {
    if (mode === "chapter") {
      // Get actual chapters for this book from BookNames data
      const chapterData = DB_BOOK_CHAPTER_VERSES.filter(
        (item) => item.bookNumber === book.bookNumber
      );

      if (chapterData.length > 0) {
        // Get unique chapter numbers for this book (real data)
        const chapters = [
          ...new Set(chapterData.map((item) => item.chapterNumber)),
        ].sort((a, b) => a - b);
        setOptions(chapters); // Show all actual chapters
      } else {
        // Fallback: estimate reasonable chapter count based on book
        const maxChapter = getMaxChapterForBook(book.longName);
        setOptions(Array.from({ length: maxChapter }, (_, i) => i + 1));
      }
    } else if (mode === "verse" && chapter) {
      // Get actual verse count for specific book and chapter
      const verseData = DB_BOOK_CHAPTER_VERSES.find(
        (item) =>
          item.bookNumber === book.bookNumber && item.chapterNumber === chapter
      );

      if (verseData) {
        // Show all actual verses for this chapter
        setOptions(
          Array.from({ length: verseData.verseCount }, (_, i) => i + 1)
        );
      } else {
        // Fallback: estimate reasonable verse count
        setOptions(Array.from({ length: 31 }, (_, i) => i + 1));
      }
    }

    setSelectedIndex(0);
  }, [book, mode, chapter]);

  // Fallback function to estimate max chapters
  const getMaxChapterForBook = (bookName: string): number => {
    const longBooks = ["Salmos", "Isaías", "Jeremías", "Ezequiel"];
    const mediumBooks = [
      "Génesis",
      "Éxodo",
      "Levítico",
      "Números",
      "Deuteronomio",
    ];

    if (longBooks.some((name) => bookName.includes(name))) return 50;
    if (mediumBooks.some((name) => bookName.includes(name))) return 40;
    return 28; // Default for most books
  };

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < options.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : options.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (options[selectedIndex]) {
            onSelect(options[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    },
    [options, selectedIndex, onSelect, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Enhanced title with counts
  const getTitle = () => {
    if (mode === "chapter") {
      const totalChapters = options.length;
      return `Selecciona capítulo - ${book.longName} (${totalChapters} capítulos)`;
    } else {
      const chapterData = DB_BOOK_CHAPTER_VERSES.find(
        (item) =>
          item.bookNumber === book.bookNumber && item.chapterNumber === chapter
      );
      const totalVerses = chapterData ? chapterData.verseCount : options.length;
      return `Selecciona versículo - ${book.longName} ${chapter} (${totalVerses} versículos)`;
    }
  };

  const title = getTitle();

  return (
    <div
      className="bible-book-dropdown"
      style={{
        left: position.x,
        top: position.y + 20,
        maxHeight: "200px", // Shorter for numbers
      }}
    >
      <div
        style={{
          padding: "8px 12px",
          borderBottom: "1px solid #f3f4f6",
          fontWeight: "500",
          fontSize: "13px",
          color: "#374151",
          backgroundColor: "#f9fafb",
        }}
      >
        {title}
      </div>

      <div style={{ maxHeight: "160px", overflowY: "auto" }}>
        {options.map((value, index) => {
          let additionalInfo = "";

          if (mode === "chapter") {
            // Show verse count for this chapter
            const chapterData = DB_BOOK_CHAPTER_VERSES.find(
              (item) =>
                item.bookNumber === book.bookNumber &&
                item.chapterNumber === value
            );
            additionalInfo = chapterData
              ? `${chapterData.verseCount} versículos`
              : "";
          } else if (mode === "verse") {
            // Could show additional verse info here if needed
            additionalInfo = "";
          }

          return (
            <div
              key={value}
              className={`bible-book-dropdown-item ${
                index === selectedIndex ? "selected" : ""
              }`}
              onClick={() => onSelect(value)}
              style={{ padding: "8px 12px" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <span style={{ fontWeight: "500" }}>
                    {mode === "chapter"
                      ? `Capítulo ${value}`
                      : `Versículo ${value}`}
                  </span>
                  {additionalInfo && (
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#9ca3af",
                        marginTop: "2px",
                      }}
                    >
                      {additionalInfo}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: "12px", color: "#6b7280" }}>
                  {value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bible-book-dropdown-footer">
        ↑↓ para navegar • Enter para seleccionar • Esc para cerrar
        <br />
        <span style={{ fontSize: "10px", opacity: 0.8 }}>
          {mode === "chapter"
            ? "O escribe el número del capítulo directamente"
            : "O escribe el número del versículo directamente"}
        </span>
      </div>
    </div>
  );
}
