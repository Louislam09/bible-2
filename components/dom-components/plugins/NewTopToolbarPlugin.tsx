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
  $createParagraphNode,
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
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode,
  HeadingTagType,
} from "@lexical/rich-text";
import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_CHECK_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";
import { useCallback, useEffect, useRef, useState } from "react";
import BlockFormatDropDown from "./BlockFormatDropDown";
import Icon from "@/components/Icon";
import { $patchStyleText } from "@lexical/selection";
import DropdownColorPicker from "../ui/DropdownColorPicker";

const LowPriority = 1;

function Divider() {
  return <div className="divider" />;
}

interface BootomToolbarPluginProps {
  className?: string;
  activeColor?: string;
  isDark?: boolean;
}

export default function NewTopToolbarPlugin({
  className,
  activeColor: mainColor,
  isDark,
}: BootomToolbarPluginProps) {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [fontColor, setFontColor] = useState("#ffffff");
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
    (headingLevel: HeadingTagType) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const isActive =
            (headingLevel === "h1" && actionButtons.heading1) ||
            (headingLevel === "h2" && actionButtons.heading2);

          if (isActive) {
            // Clear heading format by converting to paragraph
            $setBlocksType(selection, () => $createParagraphNode());
          } else {
            $setBlocksType(selection, () => $createHeadingNode(headingLevel));
          }
        }
      });
    },
    [editor, actionButtons.heading1, actionButtons.heading2]
  );

  const formatBulletList = useCallback(() => {
    if (actionButtons.bulletList) {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    }
  }, [editor, actionButtons.bulletList]);

  const formatNumberedList = useCallback(() => {
    if (actionButtons.numberedList) {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    }
  }, [editor, actionButtons.numberedList]);

  const formatQuote = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        if (actionButtons.quote) {
          // Clear quote format by converting to paragraph
          $setBlocksType(selection, () => $createParagraphNode());
        } else {
          $setBlocksType(selection, () => $createQuoteNode());
        }
      }
    });
  }, [editor, actionButtons.quote]);

  const applyTextColor = useCallback(
    (color: string, skipHistoryStack: boolean) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, { color });
        }
      });
      setFontColor(color);
    },
    [editor]
  );

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Get the current element format
      const anchorNode = selection.anchor.getNode();
      let element = anchorNode.getTopLevelElementOrThrow();
      const elementFormat = element.getFormatType();

      // Check block types by traversing up the node tree
      let parent = anchorNode.getParent();
      let isBulletList = false;
      let isNumberedList = false;
      let isHeading1 = false;
      let isHeading2 = false;
      let isQuote = false;

      while (parent) {
        if ($isListNode(parent)) {
          const listType = parent.getListType();
          isBulletList = listType === "bullet";
          isNumberedList = listType === "number";
          break;
        }
        parent = parent.getParent();
      }

      // Check if current element is a heading or quote
      if ($isHeadingNode(element)) {
        const tag = element.getTag();
        isHeading1 = tag === "h1";
        isHeading2 = tag === "h2";
      } else if ($isQuoteNode(element)) {
        isQuote = true;
      }

      setActionButtons((prev) => ({
        ...prev,
        bold: selection.hasFormat("bold"),
        italic: selection.hasFormat("italic"),
        underline: selection.hasFormat("underline"),
        strikethrough: selection.hasFormat("strikethrough"),
        code: selection.hasFormat("code"),
        heading1: isHeading1,
        heading2: isHeading2,
        bulletList: isBulletList,
        numberedList: isNumberedList,
        quote: isQuote,
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

  const activeColor = isDark ? "white" : "black";

  return (
    <div
      className={`flex flex-wrap items-center justify-center p-1 bg-theme-background w-full overflow-x-auto [&>button.toolbar-item]:border-0 [&>button.toolbar-item]:rounded-[10px] [&>button.toolbar-item]:p-[8px] [&>button.toolbar-item]:cursor-pointer
        h-full`}
      ref={toolbarRef}
    >
      <button
        disabled={!canUndo}
        onClick={() => {
          editor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
        className="toolbar-item spaced "
        aria-label="Undo"
      >
        <Icon name="Undo2" size={24} color={activeColor} />
      </button>

      <button
        disabled={!canRedo}
        onClick={() => {
          editor.dispatchCommand(REDO_COMMAND, undefined);
        }}
        className="toolbar-item"
        aria-label="Redo"
      >
        <Icon name="Redo2" size={24} color={activeColor} />
      </button>

      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
        }}
        className={
          "toolbar-item spaced " + (actionButtons.bold ? "active" : "")
        }
        aria-label="Format Bold"
      >
        <Icon
          name="Bold"
          size={24}
          color={actionButtons.bold ? mainColor : activeColor}
        />
      </button>

      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
        }}
        className={
          "toolbar-item spaced " + (actionButtons.italic ? "active" : "")
        }
        aria-label="Format Italics"
      >
        <Icon
          name="Italic"
          size={24}
          color={actionButtons.italic ? mainColor : activeColor}
        />
      </button>

      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
        }}
        className={
          "toolbar-item spaced " + (actionButtons.underline ? "active" : "")
        }
        aria-label="Format Underline"
      >
        <Icon
          name="Underline"
          size={24}
          color={actionButtons.underline ? mainColor : activeColor}
        />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
        }}
        className={
          "toolbar-item spaced " + (actionButtons.strikethrough ? "active" : "")
        }
        aria-label="Format Strikethrough"
      >
        <Icon
          name="Strikethrough"
          size={24}
          color={actionButtons.strikethrough ? mainColor : activeColor}
        />
      </button>
      <Divider />

      <button
        onClick={formatBulletList}
        className="toolbar-item spaced"
        aria-label="Bullet List"
      >
        <Icon
          name="List"
          size={24}
          color={actionButtons.bulletList ? mainColor : activeColor}
        />
      </button>

      <button
        onClick={formatNumberedList}
        className="toolbar-item spaced"
        aria-label="Numbered List"
      >
        <Icon
          name="ListOrdered"
          size={24}
          color={actionButtons.numberedList ? mainColor : activeColor}
        />
      </button>

      <button
        onClick={() => {
          console.log("Checklist button clicked");
          // Defer to avoid potential render conflicts
          setTimeout(() => {
            console.log("Dispatching INSERT_CHECK_LIST_COMMAND");
            const result = editor.dispatchCommand(
              INSERT_CHECK_LIST_COMMAND,
              undefined
            );
            console.log("Command result:", result);
          }, 0);
        }}
        className="toolbar-item spaced"
        aria-label="Check List"
      >
        <Icon name="ListChecks" size={24} color={activeColor} />
      </button>

      <Divider />

      <button
        onClick={() => formatHeading("h1")}
        className="toolbar-item spaced"
        aria-label="Heading 1"
      >
        <Icon
          name="Heading1"
          size={24}
          color={actionButtons.heading1 ? mainColor : activeColor}
        />
      </button>

      <DropdownColorPicker
        disabled={false}
        buttonClassName="toolbar-item color-picker"
        buttonAriaLabel="Formatting text color"
        buttonIcon="Palette"
        color={fontColor}
        iconColor={isDark ? "white" : "black"}
        onChange={applyTextColor}
        title="Text color"
      />

      <button
        onClick={formatQuote}
        className="toolbar-item spaced"
        aria-label="Quote"
      >
        <Icon
          name="Quote"
          size={24}
          color={actionButtons.quote ? mainColor : activeColor}
        />
      </button>

      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
        }}
        className={
          "toolbar-item spaced " + (actionButtons.code ? "active" : "")
        }
        aria-label="Insert code block"
      >
        <Icon
          name="Code"
          size={24}
          color={actionButtons.code ? mainColor : activeColor}
        />
      </button>

      <Divider />

      <Divider />
      <button
        onClick={() => {
          // Toggle left align - if already left aligned, clear to default (which is also left)
          if (actionButtons.leftAlign) {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "");
          } else {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
          }
        }}
        className={
          "toolbar-item spaced " + (actionButtons.leftAlign ? "active" : "")
        }
        aria-label="Left Align"
      >
        <Icon
          name="AlignLeft"
          size={24}
          color={actionButtons.leftAlign ? mainColor : activeColor}
        />
      </button>
      <button
        onClick={() => {
          // Toggle center align
          if (actionButtons.centerAlign) {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "");
          } else {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
          }
        }}
        className={
          "toolbar-item spaced " + (actionButtons.centerAlign ? "active" : "")
        }
        aria-label="Center Align"
      >
        <Icon
          name="AlignCenter"
          size={24}
          color={actionButtons.centerAlign ? mainColor : activeColor}
        />
      </button>
      <button
        onClick={() => {
          // Toggle right align
          if (actionButtons.rightAlign) {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "");
          } else {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
          }
        }}
        className={
          "toolbar-item spaced " + (actionButtons.rightAlign ? "active" : "")
        }
        aria-label="Right Align"
      >
        <Icon
          name="AlignRight"
          size={24}
          color={actionButtons.rightAlign ? mainColor : activeColor}
        />
      </button>
    </div>
  );
}
