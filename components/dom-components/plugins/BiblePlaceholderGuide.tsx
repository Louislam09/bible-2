import "../../../global.css";

/**
 * Bible Placeholder Guide Component
 * Shows "@libro capitulo:verse" format guide as user types
 */

import { useEffect, useState } from "react";

interface BiblePlaceholderGuideProps {
  currentText: string; // Current text user has typed after @
  position: { x: number; y: number };
  isVisible: boolean;
}

export function BiblePlaceholderGuide({
  currentText,
  position,
  isVisible,
}: BiblePlaceholderGuideProps) {
  const [placeholderText, setPlaceholderText] = useState("");

  useEffect(() => {
    if (!isVisible) {
      setPlaceholderText("");
      return;
    }

    // Base template
    const fullTemplate = "@Libro Capitulo:Versículo";

    // Remove @ if current text starts with @
    const cleanCurrentText = currentText.startsWith("@")
      ? currentText.slice(1)
      : currentText;

    // Determine what part of the placeholder to show based on current input
    if (cleanCurrentText === "") {
      // User just typed @
      setPlaceholderText("Libro Capitulo:Versículo");
    } else {
      // Analyze current text to determine what to show
      const spaceIndex = cleanCurrentText.indexOf(" ");
      const colonIndex = cleanCurrentText.indexOf(":");

      if (colonIndex !== -1) {
        // User has typed colon, check if verse number is complete
        const afterColon = cleanCurrentText.slice(colonIndex + 1);
        if (afterColon === "") {
          setPlaceholderText("Versículo");
        } else if (/^\d+$/.test(afterColon)) {
          // Complete verse number, hide placeholder
          setPlaceholderText("");
        } else {
          setPlaceholderText("Versículo");
        }
      } else if (spaceIndex !== -1) {
        // User has typed space after book name
        const afterSpace = cleanCurrentText.slice(spaceIndex + 1);
        if (afterSpace === "") {
          setPlaceholderText("Capítulo:Versículo");
        } else if (/^\d+$/.test(afterSpace)) {
          // User is typing chapter number
          setPlaceholderText(":Versículo");
        } else {
          setPlaceholderText("Capítulo:Versículo");
        }
      } else {
        // User is typing book name
        if (cleanCurrentText.length > 0) {
          setPlaceholderText(" Capítulo:Versículo");
        } else {
          setPlaceholderText("Libro Capítulo:Versículo");
        }
      }
    }
  }, [currentText, isVisible]);

  if (!isVisible || !placeholderText) {
    return null;
  }

  return (
    <span
      className="bible-placeholder-guide"
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        color: "#9ca3af",
        fontSize: "15px",
        fontStyle: "italic",
        pointerEvents: "none",
        userSelect: "none",
        zIndex: 1,
        opacity: 0.7,
      }}
    >
      {placeholderText}
    </span>
  );
}
