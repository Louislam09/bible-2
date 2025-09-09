/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import "../styles.css";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import { $setBlocksType } from "@lexical/selection";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $createListNode } from "@lexical/list";
import { useCallback, useEffect, useRef, useState } from "react";
import BlockFormatDropDown from "./BlockFormatDropDown";
import Icon from "@/components/Icon";

const LowPriority = 1;

function Divider() {
  return <div className="divider" />;
}

interface BootomToolbarPluginProps {
  className?: string;
  activeColor?: string;
}

export default function BootomToolbarPlugin({
  className,
  activeColor,
}: BootomToolbarPluginProps) {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [actionButtons, setActionButtons] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    code: false,
    heading1: false,
    heading2: false,
    bulletList: false,
    numberedList: false,
    quote: false,
    leftAlign: false,
    centerAlign: false,
    rightAlign: false,
    justifyAlign: false,
  });

  // Add block format functions
  const formatHeading = useCallback(
    (headingLevel: "h1" | "h2" | "h3") => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode(headingLevel));
          setActionButtons((prev) => ({
            ...prev,
            heading1: headingLevel === "h1",
            heading2: headingLevel === "h2",
          }));
        }
      });
    },
    [editor]
  );

  const formatBulletList = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createListNode("bullet"));
        setActionButtons((prev) => ({
          ...prev,
          bulletList: !prev.bulletList,
        }));
      }
    });
  }, [editor]);

  const formatNumberedList = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createListNode("number"));
        setActionButtons((prev) => ({
          ...prev,
          numberedList: !prev.numberedList,
        }));
      }
    });
  }, [editor]);

  const formatQuote = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode());
        setActionButtons((prev) => ({
          ...prev,
          quote: !prev.quote,
        }));
      }
    });
  }, [editor]);

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Get the current element format
      const anchorNode = selection.anchor.getNode();
      let element = anchorNode.getTopLevelElementOrThrow();
      const elementFormat = element.getFormatType();

      setActionButtons((prev) => ({
        ...prev,
        bold: selection.hasFormat("bold"),
        italic: selection.hasFormat("italic"),
        underline: selection.hasFormat("underline"),
        strikethrough: selection.hasFormat("strikethrough"),
        code: selection.hasFormat("code"),
        leftAlign: elementFormat === "left" || elementFormat === "",
        centerAlign: elementFormat === "center",
        rightAlign: elementFormat === "right",
        justifyAlign: elementFormat === "justify",
      }));
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, _newEditor) => {
          $updateToolbar();
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        LowPriority
      )
    );
  }, [editor, $updateToolbar]);

  return (
    <div
      className={`toolbar !bg-gray-300 w-full overflow-x-auto`}
      ref={toolbarRef}
    >
      {/* <button
        disabled={!canUndo}
        onClick={() => {
          editor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
        className="toolbar-item spaced "
        aria-label="Undo"
      >
        <Icon name="Undo2" size={24} color="black" />
      </button>

      <button
        disabled={!canRedo}
        onClick={() => {
          editor.dispatchCommand(REDO_COMMAND, undefined);
        }}
        className="toolbar-item"
        aria-label="Redo"
      >
        <Icon name="Redo2" size={24} color="black" />
      </button> */}

      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
        }}
        className={
          "toolbar-item spaced " + (actionButtons.bold ? "active" : "")
        }
        style={{ color: actionButtons.bold ? activeColor : "black" }}
        aria-label="Format Bold"
      >
        <Icon
          name="Bold"
          size={24}
          color={actionButtons.bold ? activeColor : "black"}
        />
      </button>

      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
        }}
        className={
          "toolbar-item spaced " + (actionButtons.italic ? "active" : "")
        }
        style={{ color: actionButtons.italic ? activeColor : "black" }}
        aria-label="Format Italics"
      >
        <Icon
          name="Italic"
          size={24}
          color={actionButtons.italic ? activeColor : "black"}
        />
      </button>

      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
        }}
        className={
          "toolbar-item spaced " + (actionButtons.underline ? "active" : "")
        }
        style={{ color: actionButtons.underline ? activeColor : "black" }}
        aria-label="Format Underline"
      >
        <Icon
          name="Underline"
          size={24}
          color={actionButtons.underline ? activeColor : "black"}
        />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
        }}
        className={
          "toolbar-item spaced " + (actionButtons.strikethrough ? "active" : "")
        }
        style={{ color: actionButtons.strikethrough ? activeColor : "black" }}
        aria-label="Format Strikethrough"
      >
        <Icon
          name="Strikethrough"
          size={24}
          color={actionButtons.strikethrough ? activeColor : "black"}
        />
      </button>
      <Divider />

      <button
        onClick={formatBulletList}
        className="toolbar-item spaced"
        aria-label="Bullet List"
        style={{ color: actionButtons.bulletList ? activeColor : "black" }}
      >
        <Icon
          name="List"
          size={24}
          color={actionButtons.bulletList ? activeColor : "black"}
        />
      </button>

      <button
        onClick={formatNumberedList}
        className="toolbar-item spaced"
        aria-label="Numbered List"
        style={{ color: actionButtons.numberedList ? activeColor : "black" }}
      >
        <Icon
          name="ListOrdered"
          size={24}
          color={actionButtons.numberedList ? activeColor : "black"}
        />
      </button>

      <button
        onClick={() => formatHeading("h1")}
        className="toolbar-item spaced"
        aria-label="Heading 1"
        style={{ color: actionButtons.heading1 ? activeColor : "black" }}
      >
        <Icon
          name="Heading1"
          size={24}
          color={actionButtons.heading1 ? activeColor : "black"}
        />
      </button>

      <button
        onClick={() => formatHeading("h2")}
        className="toolbar-item spaced"
        aria-label="Heading 2"
        style={{ color: actionButtons.heading2 ? activeColor : "black" }}
      >
        <Icon
          name="Heading2"
          size={24}
          color={actionButtons.heading2 ? activeColor : "black"}
        />
      </button>

      <button
        onClick={formatQuote}
        className="toolbar-item spaced"
        aria-label="Quote"
        style={{ color: actionButtons.quote ? activeColor : "black" }}
      >
        <Icon
          name="Quote"
          size={24}
          color={actionButtons.quote ? activeColor : "black"}
        />
      </button>

      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
        }}
        style={{ color: actionButtons.code ? activeColor : "black" }}
        className={
          "toolbar-item spaced " + (actionButtons.code ? "active" : "")
        }
        aria-label="Insert code block"
      >
        <Icon
          name="Code"
          size={24}
          color={actionButtons.code ? activeColor : "black"}
        />
      </button>

      <Divider />

      <Divider />
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
        }}
        className={
          "toolbar-item spaced " + (actionButtons.leftAlign ? "active" : "")
        }
        aria-label="Left Align"
        style={{ color: actionButtons.leftAlign ? activeColor : "black" }}
      >
        <Icon
          name="AlignLeft"
          size={24}
          color={actionButtons.leftAlign ? activeColor : "black"}
        />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
        }}
        className={
          "toolbar-item spaced " + (actionButtons.centerAlign ? "active" : "")
        }
        aria-label="Center Align"
        style={{ color: actionButtons.centerAlign ? activeColor : "black" }}
      >
        <Icon
          name="AlignCenter"
          size={24}
          color={actionButtons.centerAlign ? activeColor : "black"}
        />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
        }}
        className={
          "toolbar-item spaced " + (actionButtons.rightAlign ? "active" : "")
        }
        aria-label="Right Align"
        style={{ color: actionButtons.rightAlign ? activeColor : "black" }}
      >
        <Icon
          name="AlignRight"
          size={24}
          color={actionButtons.rightAlign ? activeColor : "black"}
        />
      </button>
    </div>
  );
}
