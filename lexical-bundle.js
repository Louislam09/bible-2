/**
 * Lexical Bundle - Single JS file with all Lexical functionality
 * This bundles all Lexical packages into a single file for use in WebViews
 * or standalone HTML editors without a build process.
 */

// Core Lexical
import {
  createEditor,
  $getRoot,
  $getSelection,
  $createParagraphNode,
  $createTextNode,
  $isRangeSelection,
  $isNodeSelection,
  $setSelection,
  $createRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_LOW,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_CRITICAL,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  KEY_TAB_COMMAND,
  SELECTION_CHANGE_COMMAND,
  FOCUS_COMMAND,
  BLUR_COMMAND,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  CLEAR_EDITOR_COMMAND,
  CLEAR_HISTORY_COMMAND,
  $isTextNode,
  $isParagraphNode,
  $isElementNode,
  $isDecoratorNode,
  $isLineBreakNode,
  $nodesOfType,
  TextNode,
  ElementNode,
  DecoratorNode,
  LineBreakNode,
  ParagraphNode,
  RootNode,
} from "lexical";

// HTML utilities
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";

// Rich Text nodes and utilities
import {
  HeadingNode,
  QuoteNode,
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode,
} from "@lexical/rich-text";

// List nodes and utilities
import {
  ListNode,
  ListItemNode,
  $createListNode,
  $createListItemNode,
  $isListNode,
  $isListItemNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  INSERT_CHECK_LIST_COMMAND,
} from "@lexical/list";

// Code nodes
import {
  CodeNode,
  CodeHighlightNode,
  $createCodeNode,
  $isCodeNode,
} from "@lexical/code";

// Link nodes
import {
  LinkNode,
  AutoLinkNode,
  $createLinkNode,
  $isLinkNode,
  $isAutoLinkNode,
  TOGGLE_LINK_COMMAND,
} from "@lexical/link";

// Hashtag node
import {
  HashtagNode,
  $createHashtagNode,
  $isHashtagNode,
} from "@lexical/hashtag";

// Markdown transformers
import {
  TRANSFORMERS,
  $convertFromMarkdownString,
  $convertToMarkdownString,
} from "@lexical/markdown";

// Selection utilities
import {
  $selectAll,
  $setBlocksType,
  $wrapNodes,
  $isAtNodeEnd,
} from "@lexical/selection";

// Utils
import {
  $findMatchingParent,
  $getNearestNodeOfType,
  addClassNamesToElement,
  removeClassNamesFromElement,
  mergeRegister,
} from "@lexical/utils";

// Table support (optional, but useful)
import {
  TableNode,
  TableCellNode,
  TableRowNode,
  $createTableNode,
  $createTableCellNode,
  $createTableRowNode,
  $isTableNode,
  $isTableCellNode,
  $isTableRowNode,
} from "@lexical/table";

// Export everything as a global Lexical object for browser use
const LexicalBundle = {
  // Core
  createEditor,
  $getRoot,
  $getSelection,
  $createParagraphNode,
  $createTextNode,
  $isRangeSelection,
  $isNodeSelection,
  $setSelection,
  $createRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_LOW,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_CRITICAL,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  KEY_TAB_COMMAND,
  SELECTION_CHANGE_COMMAND,
  FOCUS_COMMAND,
  BLUR_COMMAND,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  CLEAR_EDITOR_COMMAND,
  CLEAR_HISTORY_COMMAND,
  $isTextNode,
  $isParagraphNode,
  $isElementNode,
  $isDecoratorNode,
  $isLineBreakNode,
  $nodesOfType,
  TextNode,
  ElementNode,
  DecoratorNode,
  LineBreakNode,
  ParagraphNode,
  RootNode,

  // HTML
  $generateHtmlFromNodes,
  $generateNodesFromDOM,

  // Rich Text
  HeadingNode,
  QuoteNode,
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode,

  // Lists
  ListNode,
  ListItemNode,
  $createListNode,
  $createListItemNode,
  $isListNode,
  $isListItemNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  INSERT_CHECK_LIST_COMMAND,

  // Code
  CodeNode,
  CodeHighlightNode,
  $createCodeNode,
  $isCodeNode,

  // Links
  LinkNode,
  AutoLinkNode,
  $createLinkNode,
  $isLinkNode,
  $isAutoLinkNode,
  TOGGLE_LINK_COMMAND,

  // Hashtag
  HashtagNode,
  $createHashtagNode,
  $isHashtagNode,

  // Markdown
  TRANSFORMERS,
  $convertFromMarkdownString,
  $convertToMarkdownString,

  // Selection
  $selectAll,
  $setBlocksType,
  $wrapNodes,
  $isAtNodeEnd,

  // Utils
  $findMatchingParent,
  $getNearestNodeOfType,
  addClassNamesToElement,
  removeClassNamesFromElement,
  mergeRegister,

  // Table
  TableNode,
  TableCellNode,
  TableRowNode,
  $createTableNode,
  $createTableCellNode,
  $createTableRowNode,
  $isTableNode,
  $isTableCellNode,
  $isTableRowNode,
};

// Export for module systems
export default LexicalBundle;

// Export as global for browser
if (typeof window !== "undefined") {
  window.Lexical = LexicalBundle;
}
