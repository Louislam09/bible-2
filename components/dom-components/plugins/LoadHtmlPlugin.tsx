import { $generateNodesFromDOM } from "@lexical/html";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot, $insertNodes } from "lexical";
import { useEffect, useRef } from "react";

interface LoadHTMLPluginProps {
  htmlString: string;
  shouldClearEditor?: boolean;
  shouldAppend?: boolean;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
}

// Replace all editor content with HTML
{
  /* <LoadHTMLPlugin htmlString="<p>Hello <strong>world</strong>!</p>" />

// Append HTML to existing content
<LoadHTMLPlugin 
  htmlString="<p>Additional content</p>" 
  shouldClearEditor={false} 
  shouldAppend={true} 
/>

// Insert HTML at current cursor position
<LoadHTMLPlugin 
  htmlString="<em>Inserted text</em>" 
  shouldClearEditor={false} 
  shouldAppend={false} 
/> */
}

function LoadHTMLPlugin({
  htmlString,
  shouldClearEditor = true,
  shouldAppend = false,
  onLoadStart,
  onLoadEnd,
}: LoadHTMLPluginProps) {
  const [editor] = useLexicalComposerContext();
  const initRef = useRef(false);

  useEffect(() => {
    if (!htmlString || initRef.current) return;
    initRef.current = true;

    onLoadStart?.();

    editor.update(() => {
      // Parse the HTML string
      const parser = new DOMParser();
      const dom = parser.parseFromString(htmlString, "text/html");

      // Generate Lexical nodes from the DOM
      const nodes = $generateNodesFromDOM(editor, dom);

      if (shouldClearEditor && !shouldAppend) {
        // Clear existing content and replace with new nodes
        const root = $getRoot();
        root.clear();
        root.append(...nodes);
      } else if (shouldAppend) {
        // Append nodes to existing content
        const root = $getRoot();
        root.append(...nodes);
      } else {
        // Insert nodes at current selection
        $insertNodes(nodes);
      }
    });

    // Use setTimeout to ensure onLoadEnd is called after the editor update is complete
    setTimeout(() => {
      onLoadEnd?.();
    }, 0);
  }, [
    editor,
    htmlString,
    shouldClearEditor,
    shouldAppend,
    onLoadStart,
    onLoadEnd,
  ]);

  return null;
}

export default LoadHTMLPlugin;
