import { storedData$ } from "@/context/LocalstoreContext";
import { getTailwindStyleTag } from "@/hooks/useLoadTailwindScript";
import { TTheme } from "@/types";

const headContent = (theme: TTheme, isReadOnly: boolean) => `
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Lexical Editor</title>
    
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
      ${storedData$.tailwindScript.get()}
      
         ${getTailwindStyleTag({ theme, fontSize: storedData$.fontSize.get() })}
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background-color: ${theme.colors.background};
            color: ${theme.colors.text};
            overflow: hidden;
            width: 100vw;
            height: 100vh;
            -webkit-font-smoothing: antialiased;
            -webkit-tap-highlight-color: transparent;
        }
        
        #root {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            padding: 0 16px;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
        }
        
        /* Main Container */
        .main-container {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
        }
        
        /* Scrollable Content Area */
        .content-wrapper {
            position: relative;
            overflow-y: auto;
            overflow-x: hidden;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            border-radius: 8px;
        }
        
        /* Title Input */
        .title-container {
            padding: 16px;
            padding-top: 40px;
            background: ${theme.colors.background};
        }
        
        .title-input {
            width: 100%;
            font-size: 24px;
            font-weight: 600;
            background: transparent;
            border: none;
            outline: none;
            color: ${theme.colors.text};
            padding: 8px 0;
            font-family: 'Montserrat', sans-serif;
        }
        
        .title-input::placeholder {
            color: ${theme.colors.text}80;
            opacity: 0.5;
        }
        
        /* Toolbar Container */
        .toolbar-container {
            position: sticky;
            top: 0;
            left: 0;
            right: 0;
            z-index: 10;
            background: ${theme.colors.background};
        }
        
        /* Toolbar */
        .toolbar {
            background: ${theme.colors.background};
            padding: 8px;
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
            align-items: center;
            justify-content: center;
        }
        
        /* Toolbar Separator */
        .toolbar-separator {
            width: 100%;
            height: 2px;
            margin: 8px 0;
            background: ${theme.colors.border}30;
            border-radius: 9999px;
        }
        
        /* Editor Container */
        .editor-wrapper {
            position: relative;
            flex: 1;
            background: ${theme.colors.background};
            scroll-behavior: smooth;
        }
        
        .toolbar-button {
            background: transparent;
            border: none;
            padding: 8px;
            color: ${theme.colors.text};
            cursor: pointer;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 40px;
            min-height: 40px;
        }
        
        .toolbar-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .toolbar-button:not(:disabled):hover {
            background: ${theme.colors.border}40;
        }
        
        .toolbar-button.active {
            background: ${theme.colors.notification}20;
        }
        
        .toolbar-button svg {
            width: 24px;
            height: 24px;
        }
        
        .toolbar-button.active svg {
            stroke: ${theme.colors.notification};
        }
        
        .toolbar-divider {
            width: 1px;
            height: 24px;
            background: ${theme.colors.border}40;
            margin: 0 4px;
        }
        
        /* Editor */
        .editor-container {
            position: relative;
            padding: 10px 16px;
            padding-bottom: 70px;
            width: 100%;
            height: 100%;
            background: ${theme.colors.background};
            scroll-behavior: smooth;
            cursor: text;
        }
        
        .editor-input {
            /* min-height: 200px;  */
            width: 100%;
            height: 100%;
            outline: none;
            color: ${theme.colors.text} !important;
            font-size: 16px;
            line-height: 1.6;
            position: relative;
            z-index: 1;
            cursor: text;
            caret-color: ${theme.colors.text};
            resize: none;
        }
        
        /* Make all content clickable */
        .editor-input,
        .editor-input *,
        .editor-input p,
        .editor-input h1,
        .editor-input h2,
        .editor-input h3,
        .editor-input ul,
        .editor-input ol,
        .editor-input li,
        .editor-input blockquote,
        .editor-input span {
            pointer-events: auto !important;
            cursor: text;
        }
        
        /* Ensure text is selectable */
        .editor-input * {
            user-select: text;
            -webkit-user-select: text;
        }
        
        /* Allow text-decoration on spans with inline styles */
        .editor-input span:not([style*="text-decoration"]) {
            text-decoration: inherit;
        }
        
        /* Ensure all text nodes are visible */
        .editor-input * {
            color: ${theme.colors.text};
        }
        
        .editor-input span {
            color: inherit;
        }
        
        /* Preserve list styling */
        .editor-input ul,
        .editor-input ol {
            list-style-position: outside;
        }
        
        .editor-input li {
            list-style-position: outside;
        }
        
        .editor-placeholder {
            color: ${theme.colors.text}60;
            position: absolute;
            top: 16px;
            left: 16px;
            pointer-events: none !important;
            user-select: none;
            z-index: 0;
        }
        
        /* Lexical specific styles */
        .editor-input h1 {
            font-size: 32px;
            font-weight: 700;
            margin: 16px 0;
            color: ${theme.colors.text};
        }
        
        .editor-input h2 {
            font-size: 24px;
            font-weight: 600;
            margin: 12px 0;
            color: ${theme.colors.text};
        }
        
        .editor-input h3 {
            font-size: 20px;
            font-weight: 600;
            margin: 10px 0;
            color: ${theme.colors.text};
        }
        
        .editor-input p {
            margin: 8px 0;
            color: ${theme.colors.text};
            min-height: 1em;
        }
        
        .editor-input p br {
            display: block;
            content: "";
            margin-top: 0;
        }
        
        .editor-input blockquote {
            border-left: 4px solid ${theme.colors.notification};
            padding-left: 16px;
            margin: 12px 0;
            color: ${theme.colors.text}CC;
            font-style: italic;
        }
        
        .editor-input code {
            background: ${theme.dark ? '#374151' : '#f3f4f6'};
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            color: ${theme.colors.text};
        }
        
        .editor-input pre {
            background: ${theme.dark ? '#374151' : '#f3f4f6'};
            padding: 12px;
            border-radius: 8px;
            overflow-x: auto;
            margin: 12px 0;
        }
        
        .editor-input pre code {
            background: transparent;
            padding: 0;
        }
        
        .editor-input ul,
        .editor-input ol {
            padding-left: 28px;
            margin: 8px 0;
            color: ${theme.colors.text};
        }
        
        .editor-input ul {
            list-style-type: disc;
        }
        
        .editor-input ol {
            list-style-type: decimal;
        }
        
        .editor-input li {
            margin: 4px 0;
            color: ${theme.colors.text};
            display: list-item;
        }
        
        /* Nested lists */
        .editor-input ul ul {
            list-style-type: circle;
            margin: 4px 0;
        }
        
        .editor-input ul ul ul {
            list-style-type: square;
        }
        
        .editor-input ol ol {
            list-style-type: lower-alpha;
        }
        
        .editor-input ol ol ol {
            list-style-type: lower-roman;
        }
        
        .editor-input a {
            color: #3b82f6;
            text-decoration: underline;
        }
        
        .editor-input strong,
        .editor-input b {
            font-weight: 700 !important;
        }
        
        .editor-input em,
        .editor-input i {
            font-style: italic !important;
        }
        
        .editor-input u,
        .editor-input [style*="text-decoration: underline"],
        .editor-input [style*="text-decoration-line: underline"] {
            text-decoration: underline !important;
            -webkit-text-decoration: underline !important;
        }
        
        .editor-input s,
        .editor-input [style*="text-decoration: line-through"],
        .editor-input [style*="text-decoration-line: line-through"] {
            text-decoration: line-through !important;
            -webkit-text-decoration: line-through !important;
        }
        
        /* Lexical specific formatting classes */
        .editor-input span[data-lexical-text="true"] {
            white-space: pre-wrap;
        }
        
        /* Lexical theme classes for text formatting */
        .editor-input .lexical-bold {
            font-weight: 700 !important;
        }
        
        .editor-input .lexical-italic {
            font-style: italic !important;
        }
        
        .editor-input .lexical-underline {
            text-decoration: underline !important;
            -webkit-text-decoration: underline !important;
        }
        
        .editor-input .lexical-strikethrough {
            text-decoration: line-through !important;
            -webkit-text-decoration: line-through !important;
        }
        
        .editor-input .lexical-code {
            font-family: 'Courier New', monospace !important;
            background: ${theme.dark ? '#374151' : '#f3f4f6'};
            padding: 2px 4px;
            border-radius: 3px;
        }
        
        /* Lexical text formatting - using attribute selectors for format flags */
        .editor-input span[style*="font-weight: 700"],
        .editor-input span[style*="font-weight:700"],
        .editor-input span[style*="font-weight: bold"],
        .editor-input span[style*="font-weight:bold"] {
            font-weight: 700 !important;
        }
        
        .editor-input span[style*="font-style: italic"],
        .editor-input span[style*="font-style:italic"] {
            font-style: italic !important;
        }
        
        /* CRITICAL: Underline formatting - multiple selectors to ensure it works */
        .editor-input span[style*="text-decoration: underline"],
        .editor-input span[style*="text-decoration:underline"],
        .editor-input span[style*="text-decoration-line: underline"],
        .editor-input span[style*="text-decoration-line:underline"],
        .editor-input span[style*="underline"] {
            text-decoration: underline !important;
            -webkit-text-decoration-line: underline !important;
            text-decoration-line: underline !important;
            text-decoration-style: solid !important;
        }
        
        /* CRITICAL: Strikethrough formatting - multiple selectors to ensure it works */
        .editor-input span[style*="text-decoration: line-through"],
        .editor-input span[style*="text-decoration:line-through"],
        .editor-input span[style*="text-decoration-line: line-through"],
        .editor-input span[style*="text-decoration-line:line-through"],
        .editor-input span[style*="line-through"] {
            text-decoration: line-through !important;
            -webkit-text-decoration-line: line-through !important;
            text-decoration-line: line-through !important;
            text-decoration-style: solid !important;
        }
        
        .editor-input span[style*="font-family: monospace"],
        .editor-input span[style*="font-family:monospace"] {
            font-family: 'Courier New', monospace !important;
            background: ${theme.dark ? '#374151' : '#f3f4f6'};
            padding: 2px 4px;
            border-radius: 3px;
        }
        
        /* Text alignment */
        .editor-input [style*="text-align: left"],
        .editor-input .text-left {
            text-align: left;
        }
        
        .editor-input [style*="text-align: center"],
        .editor-input .text-center {
            text-align: center;
        }
        
        .editor-input [style*="text-align: right"],
        .editor-input .text-right {
            text-align: right;
        }
        
        .editor-input [style*="text-align: justify"],
        .editor-input .text-justify {
            text-align: justify;
        }
        
        /* Hide toolbar in read-only mode */
        ${isReadOnly ? '.toolbar { display: none !important; }' : ''}
        
        /* Loading State */
        .loading {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            color: ${theme.colors.text}80;
            font-size: 16px;
        }
    </style>
    <!-- Bundled Lexical JS -->
    ${storedData$.lexicalBundle.get()}
</head>
`;

interface ToolbarContentProps {
    isReadOnly: boolean;
}

const toolbarContent = ({ isReadOnly }: ToolbarContentProps) => `
<div class="toolbar-container${isReadOnly ? 'hidden' : ''}">
    <div class="toolbar">
        <button class="toolbar-button" id="btn-undo" aria-label="Undo">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 7v6h6" />
                <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
            </svg>
        </button>
        <button class="toolbar-button" id="btn-redo" aria-label="Redo">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 7v6h-6" />
                <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
            </svg>
        </button>
        <button class="toolbar-button" id="btn-bold" data-format="bold" aria-label="Bold">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
                <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
            </svg>
        </button>
        <button class="toolbar-button" id="btn-italic" data-format="italic" aria-label="Italic">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="19" y1="4" x2="10" y2="4" />
                <line x1="14" y1="20" x2="5" y2="20" />
                <line x1="15" y1="4" x2="9" y2="20" />
            </svg>
        </button>
        <button class="toolbar-button" id="btn-underline" data-format="underline" aria-label="Underline">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" />
                <line x1="4" y1="21" x2="20" y2="21" />
            </svg>
        </button>
        <button class="toolbar-button" id="btn-strikethrough" data-format="strikethrough" aria-label="Strikethrough">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 4H9a3 3 0 0 0-2.83 4" />
                <path d="M14 12a4 4 0 0 1 0 8H6" />
                <line x1="4" y1="12" x2="20" y2="12" />
            </svg>
        </button>
        <div class="toolbar-divider"></div>
        <button class="toolbar-button" id="btn-bullet-list" data-block="ul" aria-label="Bullet List">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
        </button>
        <button class="toolbar-button" id="btn-numbered-list" data-block="ol" aria-label="Numbered List">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="10" y1="6" x2="21" y2="6" />
                <line x1="10" y1="12" x2="21" y2="12" />
                <line x1="10" y1="18" x2="21" y2="18" />
                <path d="M4 6h1v4" />
                <path d="M4 10h2" />
                <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
            </svg>
        </button>
        <div class="toolbar-divider"></div>
        <button class="toolbar-button" id="btn-h1" data-block="h1" aria-label="Heading 1">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 12h8" />
                <path d="M4 18V6" />
                <path d="M12 18V6" />
                <path d="m17 12 3-2v8" />
            </svg>
        </button>
        <button class="toolbar-button" id="btn-quote" data-block="quote" aria-label="Quote">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path
                    d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
                <path
                    d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
            </svg>
        </button>
        <button class="toolbar-button" id="btn-code" data-format="code" aria-label="Code">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
            </svg>
        </button>
        <div class="toolbar-divider"></div>
        <button class="toolbar-button" id="btn-align-left" data-align="left" aria-label="Align Left">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="21" y1="6" x2="3" y2="6" />
                <line x1="15" y1="12" x2="3" y2="12" />
                <line x1="17" y1="18" x2="3" y2="18" />
            </svg>
        </button>
        <button class="toolbar-button" id="btn-align-center" data-align="center" aria-label="Align Center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="21" y1="6" x2="3" y2="6" />
                <line x1="17" y1="12" x2="7" y2="12" />
                <line x1="19" y1="18" x2="5" y2="18" />
            </svg>
        </button>
        <button class="toolbar-button" id="btn-align-right" data-align="right" aria-label="Align Right">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="21" y1="6" x2="3" y2="6" />
                <line x1="21" y1="12" x2="9" y2="12" />
                <line x1="21" y1="18" x2="7" y2="18" />
            </svg>
        </button>
    </div>
    <div class="toolbar-separator"></div>
</div> `

export const lexicalHtmlContent = (options: {
    theme: TTheme;
    initialTitle?: string;
    initialContent?: string;
    isReadOnly?: boolean;
    placeholder?: string;
    isModal?: boolean;
}) => {
    const {
        theme,
        initialTitle = '',
        initialContent = '',
        isReadOnly = false,
        placeholder = 'Escribe algo...',
        isModal = false,
    } = options;

    return `
<!DOCTYPE html>
<html lang="es">
${headContent(theme, isReadOnly)}
<body class="overflow-y-hidden h-full ">
    <div id="root" class="overflow-y-hidden h-full">
        <div class="loading">Inicializando editor...</div>
    </div>
    
    <!-- Editor Logic -->
    <script>

        // Access Lexical from the global scope
        const {
            createEditor,
            $getRoot,
            $getSelection,
            $createParagraphNode,
            $createTextNode,
            $generateHtmlFromNodes,
            $generateNodesFromDOM,
            $isRangeSelection,
            $isHeadingNode,
            $isQuoteNode,
            $isListNode,
            HeadingNode,
            QuoteNode,
            ListNode,
            ListItemNode,
            CodeNode,
            CodeHighlightNode,
            LinkNode,
            AutoLinkNode,
            HashtagNode,
            FORMAT_TEXT_COMMAND,
            FORMAT_ELEMENT_COMMAND,
            UNDO_COMMAND,
            REDO_COMMAND,
            CAN_UNDO_COMMAND,
            CAN_REDO_COMMAND,
            SELECTION_CHANGE_COMMAND,
            $setBlocksType,
            $createHeadingNode,
            $createQuoteNode,
            INSERT_ORDERED_LIST_COMMAND,
            INSERT_UNORDERED_LIST_COMMAND,
            REMOVE_LIST_COMMAND,
            COMMAND_PRIORITY_LOW,
            COMMAND_PRIORITY_EDITOR,
            registerRichText,
            createEmptyHistoryState,
            registerHistory,
            registerList,
        } = window.Lexical || {};
        
        if (!window.Lexical) {
            console.error('Lexical bundle not loaded!');
            document.getElementById('root').innerHTML = '<div class="loading">Error: Lexical no se pudo cargar</div>';
        }
        
        let editor;
        let currentTitle = '${initialTitle.replace(/'/g, "\\'")}';
        let isReadOnly = ${isReadOnly};
        
        // Communication with React Native
        function sendMessage(type, data) {
            try {
                const message = JSON.stringify({ type, data });
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(message);
                }
            } catch (error) {
                console.error('Failed to send message:', error);
            }
        }
        
        // Debounce function
        function debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
        
        // Initialize the editor
        function initEditor() {
            const root = document.getElementById('root');
            
            // Create UI
            root.innerHTML = \`
                <div class="main-container">
                    <div class="content-wrapper">
                        <div class="title-container ${isReadOnly ? 'hidden' : ''}">
                            <input 
                                id="title-input" 
                                type="text" 
                                class="title-input" 
                                placeholder="Título" 
                                value="${initialTitle.replace(/"/g, '&quot;')}"
                            />
                        </div>
                        ${(isModal && isReadOnly) ? `
                            <div class="title-container">
                                <input 
                                    id="title-input" 
                                    type="text" 
                                    class="title-input" 
                                    placeholder="Título" 
                                    value="${initialTitle.replace(/"/g, '&quot;')}"
                                    disabled
                                />
                            </div>
                        ` : ''}
                       
                        ${toolbarContent({ isReadOnly })}

                        <div class="editor-wrapper">
                            <div class="editor-container">
                                <div class="editor-placeholder ${(isReadOnly || initialContent) ? 'hidden' : ''}" id="placeholder">${placeholder}</div>
                                <div class="editor-input" contenteditable=\${!isReadOnly} tabindex="0" role="textbox" aria-multiline="true" id="editor"></div>
                            </div>
                        </div>
                    </div>
                </div>
            \`;
            
            // Configure Lexical
            const config = {
                namespace: 'LexicalEditor',
                theme: {
                    text: {
                        bold: 'lexical-bold',
                        italic: 'lexical-italic',
                        underline: 'lexical-underline',
                        strikethrough: 'lexical-strikethrough',
                        code: 'lexical-code',
                    },
                },
                onError: (error) => {
                    console.error('Lexical error:', error);
                    sendMessage('error', { error: error.toString() });
                },
                nodes: [
                    HeadingNode,
                    QuoteNode,
                    ListNode,
                    ListItemNode,
                    CodeNode,
                    CodeHighlightNode,
                    LinkNode,
                    AutoLinkNode,
                    HashtagNode,
                ],
                editable: !isReadOnly,
            };
            
            // Create editor
            editor = createEditor(config);
            const editorElement = document.getElementById('editor');
            editor.setRootElement(editorElement);
            
            
            // Register essential plugins FIRST (before any content manipulation)
            if (registerRichText) {
                registerRichText(editor);
            }
            
            if (registerHistory && createEmptyHistoryState) {
                const historyState = createEmptyHistoryState();
                registerHistory(editor, historyState, 1000);
            }
            
            // Register list plugin (required for list commands to work)
            if (registerList) {
                registerList(editor);
            }
                
            // Initialize with empty paragraph if no initial content
             const content = \`${initialContent}\`;
            if (!content) {
                editor.update(() => {
                    const root = $getRoot();
                    if (root.getChildrenSize() === 0) {
                        const paragraph = $createParagraphNode();
                        root.append(paragraph);
                        // Ensure the paragraph is selected so typing works immediately
                        paragraph.select();
                    }
                });
            } else {
                // Load initial content if provided
                try {
                        editor.update(() => {
                            const parser = new DOMParser();
                            const dom = parser.parseFromString(content, 'text/html');
                            const nodes = $generateNodesFromDOM(editor, dom);
                            $getRoot().clear().append(...nodes);
                        });
                } catch (error) {
                    console.error('Failed to load initial content:', error);
                    // Fallback to empty paragraph on error
                    editor.update(() => {
                        const root = $getRoot();
                        if (root.getChildrenSize() === 0) {
                            const paragraph = $createParagraphNode();
                            root.append(paragraph);
                            paragraph.select();
                        }
                    });
                }
            }
            
            // Add click handler to focus editor when clicked
            if (!isReadOnly) {
                // Make the entire editor container clickable
                const editorContainer = editorElement.parentElement;
                
                // Handle clicks on the editor wrapper/container (empty space)
                if (editorContainer) {
                    editorContainer.addEventListener('click', (e) => {
                        // If clicking on empty space or placeholder, focus editor at end
                        if (e.target === editorContainer || e.target.id === 'placeholder' || e.target.classList.contains('editor-container')) {
                            e.preventDefault();
                            try {
                                // Focus on the last position
                                editor.update(() => {
                                    const root = $getRoot();
                                    const lastChild = root.getLastChild();
                                    if (lastChild) {
                                        lastChild.selectEnd();
                                    } else {
                                        // If no children, create a paragraph
                                        const paragraph = $createParagraphNode();
                                        root.append(paragraph);
                                        paragraph.select();
                                    }
                                });
                            } catch (err) {
                                console.warn('Focus error:', err);
                                editorElement.focus();
                            }
                        }
                    });
                }
            }
            
            // Setup toolbar (if not read-only)
            if (!isReadOnly) {
                setupToolbar();
            }
            
            // Content change listener
            const debouncedContentChange = debounce(() => {
                editor.getEditorState().read(() => {
                    const htmlString = $generateHtmlFromNodes(editor, null);
                    const json = editor.getEditorState().toJSON();
                    const text = $getRoot().getTextContent();
                    
                    sendMessage('contentChange', {
                        content: JSON.stringify({ htmlString, json, text })
                    });
                    
                    // Update placeholder visibility
                    const placeholder = document.getElementById('placeholder');
                    if (placeholder) {
                        placeholder.style.display = text ? 'none' : 'block';
                    }
                });
            }, 10);
            
            editor.registerUpdateListener(({ editorState }) => {
                if (!isReadOnly) {
                    debouncedContentChange();
                }
            });
            
 
          
            
            // Title input handler
            const titleInput = document.getElementById('title-input');
            if (titleInput) {
                titleInput.addEventListener('input', (e) => {
                    currentTitle = e.target.value;
                    sendMessage('titleChange', { title: currentTitle });
                });
            }
            
            // Notify React Native that editor is ready
            sendMessage('ready', { success: true });
        }
        
        // Toolbar state
        let toolbarState = {
            canUndo: false,
            canRedo: false,
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
        };
        
        // Update toolbar UI
        function updateToolbarUI() {
            // Update undo/redo buttons
            const undoBtn = document.getElementById('btn-undo');
            const redoBtn = document.getElementById('btn-redo');
            if (undoBtn) undoBtn.disabled = !toolbarState.canUndo;
            if (redoBtn) redoBtn.disabled = !toolbarState.canRedo;
            
            // Update format buttons
            const formatButtons = {
                'btn-bold': toolbarState.bold,
                'btn-italic': toolbarState.italic,
                'btn-underline': toolbarState.underline,
                'btn-strikethrough': toolbarState.strikethrough,
                'btn-code': toolbarState.code,
                'btn-h1': toolbarState.heading1,
                'btn-h2': toolbarState.heading2,
                'btn-bullet-list': toolbarState.bulletList,
                'btn-numbered-list': toolbarState.numberedList,
                'btn-quote': toolbarState.quote,
                'btn-align-left': toolbarState.leftAlign,
                'btn-align-center': toolbarState.centerAlign,
                'btn-align-right': toolbarState.rightAlign,
            };
            
            Object.entries(formatButtons).forEach(([id, isActive]) => {
                const btn = document.getElementById(id);
                if (btn) {
                    if (isActive) {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                }
            });
        }
        
        // Update toolbar state from editor
        function updateToolbarState() {
            if (!editor) return;
            
            try {
                editor.getEditorState().read(() => {
                    const selection = $getSelection();
                    
                    // Reset to defaults first
                    toolbarState.bold = false;
                    toolbarState.italic = false;
                    toolbarState.underline = false;
                    toolbarState.strikethrough = false;
                    toolbarState.code = false;
                    toolbarState.leftAlign = true;
                    toolbarState.centerAlign = false;
                    toolbarState.rightAlign = false;
                    toolbarState.justifyAlign = false;
                    toolbarState.bulletList = false;
                    toolbarState.numberedList = false;
                    toolbarState.heading1 = false;
                    toolbarState.heading2 = false;
                    toolbarState.quote = false;
                    
                    if (!$isRangeSelection(selection)) {
                        updateToolbarUI();
                        return;
                    }
                    
                    // Get format flags - safe to call on any range selection
                    toolbarState.bold = selection.hasFormat('bold');
                    toolbarState.italic = selection.hasFormat('italic');
                    toolbarState.underline = selection.hasFormat('underline');
                    toolbarState.strikethrough = selection.hasFormat('strikethrough');
                    toolbarState.code = selection.hasFormat('code');
                    
                    // Get block types - safely handle all node types
                    try {
                        const anchorNode = selection.anchor.getNode();
                        
                        // Skip if anchorNode is root itself
                        if (anchorNode.getKey() === 'root') {
                            updateToolbarUI();
                            return;
                        }
                        
                        // Get the top-level element (paragraph, heading, etc.)
                        const element = anchorNode.getTopLevelElementOrThrow();
                        
                        // Get alignment
                        const elementFormat = element.getFormatType();
                        toolbarState.leftAlign = elementFormat === 'left' || elementFormat === '';
                        toolbarState.centerAlign = elementFormat === 'center';
                        toolbarState.rightAlign = elementFormat === 'right';
                        toolbarState.justifyAlign = elementFormat === 'justify';
                        
                        // Check block type
                        if ($isHeadingNode(element)) {
                            const tag = element.getTag();
                            toolbarState.heading1 = tag === 'h1';
                            toolbarState.heading2 = tag === 'h2';
                        } else if ($isQuoteNode(element)) {
                            toolbarState.quote = true;
                        }
                        
                        // Check if inside a list by walking up the parent tree
                        let parent = anchorNode.getParent();
                        while (parent !== null) {
                            if ($isListNode(parent)) {
                                const listType = parent.getListType();
                                toolbarState.bulletList = listType === 'bullet';
                                toolbarState.numberedList = listType === 'number';
                                break;
                            }
                            parent = parent.getParent();
                        }
                    } catch (e) {
                        // If getTopLevelElementOrThrow fails, we're in an invalid state
                        // Keep the default values set above
                        console.warn('Could not determine element type:', e);
                    }
                    
                    updateToolbarUI();
                });
            } catch (error) {
                console.error('Error updating toolbar state:', error);
            }
        }
        
        // Setup toolbar handlers
        function setupToolbar() {
            // Undo button
            document.getElementById('btn-undo')?.addEventListener('click', () => {
                editor.dispatchCommand(UNDO_COMMAND, undefined);
            });
            
            // Redo button
            document.getElementById('btn-redo')?.addEventListener('click', () => {
                editor.dispatchCommand(REDO_COMMAND, undefined);
            });
            
            // Text formatting buttons
            document.querySelectorAll('[data-format]').forEach(button => {
                button.addEventListener('click', () => {
                    const format = button.getAttribute('data-format');
                    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
                });
            });
            
            // Alignment buttons
            document.querySelectorAll('[data-align]').forEach(button => {
                button.addEventListener('click', () => {
                    const align = button.getAttribute('data-align');
                    editor.update(() => {
                        const selection = $getSelection();
                        if ($isRangeSelection(selection)) {
                            const currentAlign = toolbarState.leftAlign && align === 'left' 
                                || toolbarState.centerAlign && align === 'center'
                                || toolbarState.rightAlign && align === 'right';
                            
                            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, currentAlign ? '' : align);
                        }
                    });
                });
            });
            
            // Block type buttons
            document.querySelectorAll('[data-block]').forEach(button => {
                button.addEventListener('click', () => {
                    const blockType = button.getAttribute('data-block');
                    
                    editor.update(() => {
                        const selection = $getSelection();
                        if (!$isRangeSelection(selection)) return;
                        
                        if (blockType === 'h1' || blockType === 'h2' || blockType === 'h3') {
                            const isActive = (blockType === 'h1' && toolbarState.heading1) 
                                || (blockType === 'h2' && toolbarState.heading2);
                            
                            if (isActive) {
                                $setBlocksType(selection, () => $createParagraphNode());
                            } else {
                                $setBlocksType(selection, () => $createHeadingNode(blockType));
                            }
                        } else if (blockType === 'quote') {
                            if (toolbarState.quote) {
                                $setBlocksType(selection, () => $createParagraphNode());
                            } else {
                                $setBlocksType(selection, () => $createQuoteNode());
                            }
                        } else if (blockType === 'ul') {
                            if (toolbarState.bulletList) {
                                editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
                            } else {
                                editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
                            }
                        } else if (blockType === 'ol') {
                            if (toolbarState.numberedList) {
                                editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
                            } else {
                                editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
                            }
                        }
                    });
                });
            });
            
            // Register listeners for toolbar updates
            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                () => {
                    updateToolbarState();
                    return false;
                },
                COMMAND_PRIORITY_LOW
            );
            
            editor.registerCommand(
                CAN_UNDO_COMMAND,
                (payload) => {
                    toolbarState.canUndo = payload;
                    updateToolbarUI();
                    return false;
                },
                COMMAND_PRIORITY_LOW
            );
            
            editor.registerCommand(
                CAN_REDO_COMMAND,
                (payload) => {
                    toolbarState.canRedo = payload;
                    updateToolbarUI();
                    return false;
                },
                COMMAND_PRIORITY_LOW
            );
            
            // Register update listener
            editor.registerUpdateListener(({ editorState }) => {
                editorState.read(() => {
                    updateToolbarState();
                });
            });
            
            // Initial toolbar state
            updateToolbarState();
        }
        
        // Listen for messages from React Native
        function handleNativeMessage(event) {
            try {
                const message = JSON.parse(event.data);
                
                switch (message.type) {
                    case 'loadContent':
                        if (message.data.content && editor) {
                            editor.update(() => {
                                try {
                                    const content = JSON.parse(message.data.content);
                                    if (content.htmlString) {
                                        const parser = new DOMParser();
                                        const dom = parser.parseFromString(content.htmlString, 'text/html');
                                        const nodes = $generateNodesFromDOM(editor, dom);
                                        $getRoot().clear().append(...nodes);
                                    } else if (content.json) {
                                        const editorState = editor.parseEditorState(content.json);
                                        editor.setEditorState(editorState);
                                    }
                                } catch (error) {
                                    console.error('Failed to load content:', error);
                                }
                            });
                        }
                        if (message.data.title) {
                            currentTitle = message.data.title;
                            const titleInput = document.getElementById('title-input');
                            if (titleInput) {
                                titleInput.value = message.data.title;
                            }
                        }
                        break;
                        
                    case 'setReadOnly':
                        isReadOnly = message.data.isReadOnly;
                        if (editor) {
                            editor.setEditable(!isReadOnly);
                        }
                        break;
                        
                    case 'getContent':
                        editor.getEditorState().read(() => {
                            const htmlString = $generateHtmlFromNodes(editor, null);
                            const json = editor.getEditorState().toJSON();
                            sendMessage('contentResponse', {
                                content: JSON.stringify({ htmlString, json })
                            });
                        });
                        break;
                    case 'addTextToNote':
                        if (editor) {
                            editor.update(() => {
                                const root = $getRoot();

                                console.log('Processing HTML text:', message.data.text);

                                // Parse the HTML manually for better control
                                const htmlText = message.data.text;

                                // Split by <br> tags to create paragraphs
                                const parts = htmlText.split('<br>');

                                parts.forEach((part, index) => {
                                    if (part.trim()) {
                                        const paragraph = $createParagraphNode();

                                        // For now, just add the text as plain text to test basic functionality
                                        // TODO: Implement proper HTML parsing with formatting
                                        paragraph.append($createTextNode(part.replace(/<[^>]*>/g, ''))); // Remove HTML tags for now

                                        root.append(paragraph);
                                    }
                                });

                            });
                        }
                        break;
                }
            } catch (error) {
                console.error('Failed to handle message:', error);
            }
        }
        
        // Listen for messages
        document.addEventListener('message', handleNativeMessage);
        window.addEventListener('message', handleNativeMessage);
        
        // Initialize when ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initEditor);
        } else {
            initEditor();
        }
    </script>
</body>
</html>
`;
};

