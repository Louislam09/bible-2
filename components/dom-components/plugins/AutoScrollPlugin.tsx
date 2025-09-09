import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection } from "lexical";
import { useEffect } from "react";

const TOOLBAR_HEIGHT = 170; // Buffer space from bottom of editor inner
const SCROLL_BUFFER = 70 + TOOLBAR_HEIGHT; // Buffer space from bottom of editor inner

export default function AutoScrollPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const unregisterListener = editor.registerUpdateListener(
      ({ editorState }) => {
        editorState.read(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            // Small delay to ensure DOM is updated
            setTimeout(() => {
              scrollToCursor();
            }, 50);
          }
        });
      }
    );

    return unregisterListener;
  }, [editor]);

  const scrollToCursor = () => {
    try {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      if (rect.height === 0 && rect.width === 0) return;

      // Get the scrollable editor inner container
      const editorInner = document.querySelector(".editor-inner");
      if (!editorInner) return;

      const editorRect = editorInner.getBoundingClientRect();
      const cursorBottom = rect.bottom;
      const editorBottom = editorRect.bottom;

      // Calculate cursor position relative to the editor inner container
      const cursorRelativeToEditor = Math.round(cursorBottom - editorRect.top);
      const availableHeight = Math.round(editorRect.height - SCROLL_BUFFER);

      // Check if cursor is too close to the bottom of the editor inner
      if (cursorRelativeToEditor > availableHeight) {
        // Calculate how much we need to scroll to bring cursor into view
        const scrollAmount = Math.max(
          cursorRelativeToEditor - availableHeight,
          40
        );

        // console.log("Scrolling by:", scrollAmount);

        // Scroll the editor inner container
        editorInner.scrollBy({
          top: scrollAmount,
          behavior: "smooth",
        });
      }
    } catch (error) {
      console.warn("Auto scroll failed:", error);
    }
  };

  return null;
}
