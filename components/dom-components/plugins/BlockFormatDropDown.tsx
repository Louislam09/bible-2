import {
    $getSelection,
    $isRangeSelection,
    FORMAT_ELEMENT_COMMAND,
} from "lexical";
import { $setBlocksType } from "@lexical/selection";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $createListNode } from "@lexical/list";
import { $createCodeNode } from "@lexical/code";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useState, useCallback } from "react";

export default function BlockFormatDropDown() {
    const [editor] = useLexicalComposerContext();
    const [blockType, setBlockType] = useState("paragraph");

    const formatBlock = useCallback((type: string) => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                switch (type) {
                    case "h1":
                        $setBlocksType(selection, () => $createHeadingNode("h1"));
                        break;
                    case "h2":
                        $setBlocksType(selection, () => $createHeadingNode("h2"));
                        break;
                    case "h3":
                        $setBlocksType(selection, () => $createHeadingNode("h3"));
                        break;
                    case "quote":
                        $setBlocksType(selection, () => $createQuoteNode());
                        break;
                    case "ul":
                        $setBlocksType(selection, () => $createListNode("bullet"));
                        break;
                    case "ol":
                        $setBlocksType(selection, () => $createListNode("number"));
                        break;
                    case "check":
                        $setBlocksType(selection, () => $createListNode("check"));
                        break;
                    case "code":
                        $setBlocksType(selection, () => $createCodeNode());
                        break;
                    default:
                        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
                }
                setBlockType(type);
            }
        });
    }, [editor]);

    return (
        <select
            value={blockType}
            onChange={(e) => formatBlock(e.target.value)}
            className="border rounded px-1 py-1"
        >
            <option value="paragraph">Normal</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="ul">Bullet List</option>
            <option value="ol">Numbered List</option>
            <option value="check">Check List</option>
            <option value="quote">Quote</option>
            <option value="code">Code Block</option>
        </select>
    );
}
