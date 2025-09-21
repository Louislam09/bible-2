"use dom";
import "../../global.css";
import "./styles.css";

import Icon from "@/components/Icon";
import { DB_BOOK_CHAPTER_NUMBER, DB_BOOK_CHAPTER_VERSES, DB_BOOK_NAMES } from "@/constants/BookNames";
import { useThemeVariables } from "@/hooks/useThemeVariables";
import { BookIndexes, TTheme } from "@/types";
import React, { useEffect, useMemo, useState } from "react";

interface DomChooseReferenceProps {
  theme: TTheme;
  initialBook?: string;
  initialChapter?: number;
  initialVerse?: number;
  onChange?: (ref: { book?: string; chapter?: number; verse?: number }) => void;
  onConfirm?: (ref: { book: string; chapter: number; verse: number, goHome: boolean }) => void;
  step: number;
  onStepChange: (step: number) => void;
}

const DomChooseReference: React.FC<DomChooseReferenceProps> = ({
  theme,
  initialBook,
  initialChapter,
  initialVerse,
  onChange,
  onConfirm,
  step,
  onStepChange,
}) => {
  useThemeVariables(theme);

  const [book, setBook] = useState<string | undefined>(initialBook);
  const [chapter, setChapter] = useState<number | undefined>(initialChapter);
  const [verse, setVerse] = useState<number | undefined>(initialVerse);

  // helpers
  const hexToRgba = (hex: string, alpha = 0.2) => {
    try {
      const parsed = hex.replace('#', '');
      const bigint = parseInt(parsed.length === 3 ? parsed.split('').map(c => c + c).join('') : parsed, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    } catch {
      return `rgba(0,0,0,0.1)`;
    }
  };

  const abbr = (name: string) => name.replace(/\s+/g, "").slice(0, 3);

  useEffect(() => {
    onChange?.({ book, chapter, verse });
  }, [book, chapter, verse]);

  const books = useMemo(() => DB_BOOK_NAMES, []);
  const [oldBooks, newBooks] = useMemo(() => {
    return [
      DB_BOOK_NAMES.slice(0, BookIndexes.Malaquias),
      DB_BOOK_NAMES.slice(BookIndexes.Malaquias),
    ];
  }, []);

  const chapters = useMemo(() => {
    if (!book) return [];
    const count = DB_BOOK_CHAPTER_NUMBER[book as keyof typeof DB_BOOK_CHAPTER_NUMBER];
    if (!count) return [];
    return Array.from({ length: count }, (_, i) => i + 1);
  }, [book]);

  const verses = useMemo(() => {
    if (!book || !chapter) return [];
    const bookNumber = DB_BOOK_NAMES.find((b) => b.longName === book)?.bookNumber;
    const verseCount = DB_BOOK_CHAPTER_VERSES.find(
      (it) => it.bookNumber === bookNumber && it.chapterNumber === chapter
    )?.verseCount;
    if (!verseCount) return [];
    return Array.from({ length: verseCount }, (_, i) => i + 1);
  }, [book, chapter]);

  return (
    <div className="w-full h-full bg-theme text-theme p-3">
      <div className="max-w-screen-lg mx-auto w-full h-full flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-theme-text">Seleccionar referencia</h2>
          {step > 0 && (
            <button
              type="button"
              className="px-3 py-2 rounded-md border border-theme-text text-theme-text text-sm"
              onClick={() => onStepChange(Math.max(0, step - 1))}
            >
              Atrás
            </button>
          )}
        </div>

        {/* Book selector */}
        {step === 0 && (
          <section className="p-2 bg-transparent">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="Hash" size={16} color={theme.colors.text} />
              <h3 className="text-base font-semibold text-theme-text">Antiguo Pacto</h3>
            </div>
            <div className="h-1 w-24 rounded-t bg-theme-notification mb-3" />
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 mb-4">
              {oldBooks.map((b) => (
                <button
                  key={b.longName}
                  type="button"
                  className={`px-3 py-2 rounded-md border text-sm truncate transition-colors ${book === b.longName ? "animate-pulse" : ""}`}
                  title={b.longName}
                  onClick={() => {
                    setBook(b.longName);
                    onStepChange(1);
                  }}
                  style={{
                    borderColor: theme.dark ? (b.bookColor as any) : theme.colors.text,
                    color: theme.dark ? (b.bookColor as any) : undefined,
                    backgroundColor: book === b.longName ? hexToRgba(b.bookColor as any, 0.18) : "transparent",
                  }}
                >
                  {abbr(b.longName)}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 mb-1">
              <Icon name="Hash" size={16} color={theme.colors.text} />
              <h3 className="text-base font-semibold text-theme-text">Nuevo Pacto</h3>
            </div>
            <div className="h-1 w-24 rounded-t bg-theme-notification mb-3" />
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {newBooks.map((b) => (
                <button
                  key={b.longName}
                  type="button"
                  className={`px-3 py-2 rounded-md border text-sm truncate transition-colors ${book === b.longName ? "animate-pulse" : ""}`}
                  title={b.longName}
                  onClick={() => {
                    setBook(b.longName);
                    onStepChange(1);
                  }}
                  style={{
                    borderColor: theme.dark ? (b.bookColor as any) : theme.colors.text,
                    color: theme.dark ? (b.bookColor as any) : undefined,
                    backgroundColor: book === b.longName ? hexToRgba(b.bookColor as any, 0.18) : "transparent",
                  }}
                >
                  {abbr(b.longName)}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Chapter selector */}
        {step === 1 && (
          <section className="p-2 bg-transparent">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="Hash" size={16} color={theme.colors.text} />
              <h3 className="text-base font-semibold text-theme-text">Capítulo</h3>
            </div>
            <div className="h-1 w-24 rounded-t bg-theme-notification mb-3" />
            {!book && <div className="text-sm opacity-60">Selecciona un libro primero</div>}
            {book && (
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-3 place-items-center">
                {chapters.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`text-theme-text w-full h-12 text-center rounded-lg border text-base ${chapter === c
                      ? "border-theme-notification animate-pulse"
                      : "border-theme-text hover:border-theme-primary"
                      }`}
                    onClick={() => {
                      setChapter(c);
                      onStepChange(2);
                      if (book) {
                        onConfirm?.({ book, chapter: c, verse: 1, goHome: false });
                      }
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Verse selector */}
        {step === 2 && (
          <section className="p-2 bg-transparent">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="Hash" size={16} color={theme.colors.text} />
              <h3 className="text-base font-semibold text-theme-text">Versículo</h3>
            </div>
            <div className="h-1 w-24 rounded-t bg-theme-notification mb-3" />
            {!chapter && <div className="text-sm opacity-60">Selecciona un capítulo primero</div>}
            {chapter && (
              <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 gap-3">
                {verses.map((v) => (
                  <button
                    key={v}
                    type="button"
                    className={`text-theme-text w-full h-12 text-center rounded-lg border text-base ${verse === v
                      ? "border-theme-notification animate-pulse"
                      : "border-theme-text hover:border-theme-primary"
                      }`}
                    onClick={() => {
                      setVerse(v);
                      if (book && chapter) {
                        onConfirm?.({ book, chapter, verse: v, goHome: true });
                      }
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default DomChooseReference;
