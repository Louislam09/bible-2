/**
 * Download PDF Plugin for Lexical Editor
 * Generates PDF from the current editor content with styling
 */

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $generateHtmlFromNodes } from "@lexical/html";
import { $getRoot } from "lexical";
import { useCallback, useState } from "react";
import Icon from "@/components/Icon";

interface DownloadPdfPluginProps {
  title?: string;
  activeColor?: string;
  className?: string;
  onDownloadPdf?: (htmlContent: string, noteTitle: string) => Promise<void>;
}

export default function DownloadPdfPlugin({
  title = "Untitled Note",
  activeColor = "#007AFF",
  className = "",
  onDownloadPdf,
}: DownloadPdfPluginProps) {
  const [editor] = useLexicalComposerContext();
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = useCallback(async () => {
    if (isGenerating || !onDownloadPdf) return;
    setIsGenerating(true);
    try {
      // Get the current editor content as HTML
      let htmlContent = "";

      editor.getEditorState().read(() => {
        const root = $getRoot();
        htmlContent = $generateHtmlFromNodes(editor, null);
      });

      // Call the parent function to handle PDF generation
      await onDownloadPdf(htmlContent, title);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  }, [editor, title, onDownloadPdf, isGenerating]);

  // Don't render if no download function is provided
  if (!onDownloadPdf) {
    return null;
  }

  return (
    <button
      onClick={generatePDF}
      disabled={isGenerating}
      className={`toolbar-item ${className}`}
      aria-label="Download PDF"
      title="Download as PDF"
      style={{ opacity: isGenerating ? 0.6 : 1 }}
    >
      <Icon
        name={isGenerating ? "Loader" : "Download"}
        size={24}
        color="black"
      />
    </button>
  );
}
