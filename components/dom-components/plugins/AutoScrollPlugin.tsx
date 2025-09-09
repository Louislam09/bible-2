import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection } from "lexical";
import { useEffect } from "react";

const SCROLL_TRIGGER_DISTANCE = 250; // Trigger auto-scroll when cursor is 250px from bottom

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

      // Check if cursor is within 250px of the bottom edge
      const distanceFromBottom = editorRect.bottom - cursorBottom;
      const scrollAmount = SCROLL_TRIGGER_DISTANCE - distanceFromBottom + 150; // +50px extra buffer for more comfortable spacing

      // console.log(
      //   `Cursor ${Math.round(
      //     distanceFromBottom
      //   )}px from bottom, scrolling ${Math.round(scrollAmount)}px
      //   should scroll: ${distanceFromBottom < SCROLL_TRIGGER_DISTANCE}
      //   `
      // );
      // If cursor is too close to the bottom (within 250px), scroll to keep it visible
      if (distanceFromBottom < SCROLL_TRIGGER_DISTANCE) {
        // Calculate how much we need to scroll to bring cursor to comfortable position

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
