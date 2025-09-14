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
    const fullTemplate = "@Libro Capitulo:Versículo-Versículo";

    // Remove @ if current text starts with @
    const cleanCurrentText = currentText.startsWith("@")
      ? currentText.slice(1)
      : currentText;

    // Determine what part of the placeholder to show based on current input
    if (cleanCurrentText === "") {
      // User just typed @
      setPlaceholderText("Libro Capítulo:Versículo-Versículo");
    } else {
      // Analyze current text to determine what to show
      const spaceIndex = cleanCurrentText.indexOf(" ");
      const colonIndex = cleanCurrentText.indexOf(":");
      const dashIndex = cleanCurrentText.indexOf("-");

      if (dashIndex !== -1) {
        // User has typed dash, check if endVerse is complete
        const afterDash = cleanCurrentText.slice(dashIndex + 1);
        if (afterDash === "") {
          setPlaceholderText("Versículo");
        } else if (/^\d+$/.test(afterDash)) {
          // Complete endVerse number, hide placeholder
          setPlaceholderText("");
        } else {
          setPlaceholderText("Versículo");
        }
      } else if (colonIndex !== -1) {
        // User has typed colon, check if verse number is complete
        const afterColon = cleanCurrentText.slice(colonIndex + 1);
        if (afterColon === "") {
          setPlaceholderText("Versículo-Versículo");
        } else if (/^\d+$/.test(afterColon)) {
          // Complete start verse number, show dash for endVerse
          setPlaceholderText("-Versículo");
        } else {
          setPlaceholderText("Versículo-Versículo");
        }
      } else if (spaceIndex !== -1) {
        // User has typed space after book name
        const afterSpace = cleanCurrentText.slice(spaceIndex + 1);
        if (afterSpace === "") {
          setPlaceholderText("Capítulo:Versículo-Versículo");
        } else if (/^\d+$/.test(afterSpace)) {
          // User is typing chapter number
          setPlaceholderText(":Versículo-Versículo");
        } else {
          setPlaceholderText("Capítulo:Versículo-Versículo");
        }
      } else {
        // User is typing book name
        if (cleanCurrentText.length > 0) {
          setPlaceholderText(" Capítulo:Versículo-Versículo");
        } else {
          setPlaceholderText("Libro Capítulo:Versículo-Versículo");
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
