/**
 * Bible Book Dropdown Component for @ mentions
 */

import { useCallback, useEffect, useState } from "react";
import { DB_BOOK_NAMES } from "../../../constants/BookNames";
import removeAccent from "../../../utils/removeAccent";
import type { IDBBookNames } from "../../../types";
import Icon from "@/components/Icon";

interface BibleBookDropdownProps {
  query: string;
  onSelect: (book: IDBBookNames) => void;
  onClose: () => void;
  position: { x: number; y: number };
}

export function BibleBookDropdown({
  query,
  onSelect,
  onClose,
  position,
}: BibleBookDropdownProps) {
  const [filteredBooks, setFilteredBooks] = useState<IDBBookNames[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filter books based on query (with accent-insensitive search)
  useEffect(() => {
    if (!query) {
      setFilteredBooks(DB_BOOK_NAMES.slice(0, 10)); // Show first 10 books
    } else {
      const normalizedQuery = removeAccent(query);
      const filtered = DB_BOOK_NAMES.filter(
        (book) =>
          // Search with original accents
          book.longName.toLowerCase().includes(query.toLowerCase()) ||
          book.shortName.toLowerCase().includes(query.toLowerCase()) ||
          // Search with accent-removed versions
          removeAccent(book.longName).includes(normalizedQuery) ||
          removeAccent(book.shortName).includes(normalizedQuery)
      ).slice(0, 10); // Limit to 10 results

      setFilteredBooks(filtered);
    }
    setSelectedIndex(0);
  }, [query]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredBooks.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredBooks.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (filteredBooks[selectedIndex]) {
            onSelect(filteredBooks[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    },
    [filteredBooks, selectedIndex, onSelect, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (filteredBooks.length === 0) {
    return (
      <div
        className="bible-book-dropdown"
        style={{ left: position.x, top: position.y + 20 }}
      >
        <div style={{ padding: "12px", color: "#6b7280", fontSize: "14px" }}>
          No se encontraron libros para "{query}"
        </div>
      </div>
    );
  }

  return (
    <div
      className="bible-book-dropdown"
      style={{ left: position.x, top: position.y + 20 }}
    >
      {/* Header with close button */}
      <div
        style={{
          padding: "8px 12px",
          borderBottom: "1px solid #f3f4f6",
          fontWeight: "500",
          fontSize: "13px",
          color: "#374151",
          backgroundColor: "#f9fafb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>Selecciona libro bíblico</span>
        <button
          onClick={onClose}
          className="bible-dropdown-close-button"
          title="Cerrar"
        >
          <Icon name="X" size={24} color="black" />
        </button>
      </div>

      {filteredBooks.map((book, index) => (
        <div
          key={book.bookNumber}
          className={`bible-book-dropdown-item ${
            index === selectedIndex ? "selected" : ""
          }`}
          onClick={() => onSelect(book)}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div className="bible-book-dropdown-item-name">
                {book.longName}
              </div>
              <div className="bible-book-dropdown-item-short">
                {book.shortName}
              </div>
            </div>
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "2px",
                backgroundColor: book.bookColor,
              }}
            />
          </div>
        </div>
      ))}

      <div className="bible-book-dropdown-footer">
        ↑↓ para navegar • Enter para seleccionar • Esc para cerrar
        <br />
        <span style={{ fontSize: "10px", opacity: 0.8 }}>
          O escribe el nombre del libro directamente
        </span>
      </div>
    </div>
  );
}
