import { $generateNodesFromDOM } from "@lexical/html";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createParagraphNode, $getRoot, $insertNodes, TextNode } from "lexical";
import { useEffect, useRef } from "react";

interface LoadHTMLPluginProps {
  htmlString: string;
  shouldClearEditor?: boolean;
  shouldAppend?: boolean;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
}

const sanitizeHTML = (html: string) => {
  return html
    .replace(/<br\s*\/?>/gi, "<p />")
    .trim();
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
    const isJSON = htmlString.startsWith("{");
    if (isJSON) {
      const data = JSON.parse(htmlString)
      const state = editor.parseEditorState(data.json);
      editor.setEditorState(state);
    } else {
      editor.update(() => {
        // Parse the HTML string
        const parser = new DOMParser();
        const dom = parser.parseFromString(sanitizeHTML(htmlString), "text/html");

        // Generate Lexical nodes from the DOM
        const nodes = $generateNodesFromDOM(editor, dom);
        nodes.forEach((node) => {
          // Wrap plain text nodes or unsupported nodes
          if (node instanceof TextNode) {
            const p = $createParagraphNode();
            p.append(node);
            $getRoot().append(p);
          } else {
            $getRoot().append(node); // ElementNode or DecoratorNode
          }
        });
      });
    }


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
