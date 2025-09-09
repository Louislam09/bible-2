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

interface TopToolbarPluginProps {
  className?: string;
  activeColor?: string;
  onSave: () => Promise<void>;
  onTopToolbarHeightChange?: (height: number) => void;
}

export default function TopToolbarPlugin({
  className,
  activeColor,
  onSave,
  onTopToolbarHeightChange,
}: TopToolbarPluginProps) {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if (toolbarRef.current && onTopToolbarHeightChange) {
      onTopToolbarHeightChange(toolbarRef.current.clientHeight);
    }
  }, [toolbarRef.current]);

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
      className={`toolbar !bg-gray-300 !py-1 w-full overflow-x-auto`}
      ref={toolbarRef}
    >
      <button
        disabled={!canUndo}
        onClick={() => {
          onSave();
        }}
        className="mx-1 px-4 rounded-full !bg-theme-notification !text-white"
        aria-label="Check"
      >
        <Icon name="Check" size={24} color="white" />
      </button>
      <button
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
      </button>
    </div>
  );
}
