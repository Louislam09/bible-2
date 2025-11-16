import { storedData$ } from "@/context/LocalstoreContext";
import { getTailwindStyleTag } from "@/hooks/useLoadTailwindScript";
import { TTheme } from "@/types";
import { scriptDownloadHelpers } from "@/state/scriptDownloadState";

const headContent = (theme: TTheme, isReadOnly: boolean) => `
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Lexical Editor</title>
    
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
      ${scriptDownloadHelpers.getTailwindScript()}
      
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

         .divider-line {
            background-image: linear-gradient(90deg, #f8b04b 0, #e8465b 40.1%, #00a8c3 73.96%, #60bba2);
            height: .5px;
            width: 100%;
            border-radius: 50px;
            margin-top: 0px;
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
            display: flex;
            flex-wrap: wrap;
            gap: 2px;
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
            position: relative;
        }

        .toolbar-button.color-active::after {
            content: '';
            position: absolute;
            bottom: 4px;
            left: 50%;
            transform: translateX(-50%);
            width: 16px;
            height: 2px;
            background: currentColor;
            border-radius: 1px;
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
            color: ${theme.colors.text};
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

        /* Text color formatting - allow inline color styles to work */
        .editor-input span[style*="color"] {
            /* Inline color styles should take precedence */
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

        /* Color Picker Backdrop */
        .color-picker-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
            display: none;
        }

        .color-picker-backdrop.show {
            display: block;
        }

        /* Color Picker Dropdown */
        .color-picker-dropdown {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 1000;
            background: ${theme.colors.background};
            border: 1px solid ${theme.colors.border}40;
            border-radius: 8px;
            padding: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            display: none;
            min-width: 200px;
            max-width: 90vw;
        }

        .color-picker-dropdown.show {
            display: block;
        }

        .color-grid {
            display: grid;
            grid-template-columns: repeat(8, 1fr);
            gap: 6px;
            margin-bottom: 8px;
        }

        .color-option {
            width: 24px;
            height: 24px;
            border-radius: 4px;
            border: 2px solid transparent;
            cursor: pointer;
            transition: all 0.2s;
        }

        .color-option:hover {
            border-color: ${theme.colors.border}60;
            transform: scale(1.1);
        }

        .color-option.selected {
            border-color: ${theme.colors.notification};
            box-shadow: 0 0 0 2px ${theme.colors.notification}40;
        }

        .color-custom {
            margin-top: 8px;
        }

        .color-input-group {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .color-input {
            flex: 1;
            height: 32px;
            padding: 4px 8px;
            border: 1px solid ${theme.colors.border}40;
            border-radius: 4px;
            background: ${theme.colors.background};
            color: ${theme.colors.text};
            font-size: 14px;
        }

        .color-input:focus {
            outline: none;
            border-color: ${theme.colors.notification};
        }

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
    ${scriptDownloadHelpers.getLexicalBundle()}
</head>
`;

interface ToolbarContentProps {
    isReadOnly: boolean;
}

const toolbarContent = ({ isReadOnly }: ToolbarContentProps) => `
<div class="toolbar-container  ${isReadOnly ? 'hidden' : ''}">
    <div class="toolbar py-2">
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
            <button class="toolbar-button" id="btn-text-color" data-color="text" aria-label="Text Color">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-baseline-icon lucide-baseline">
                    <path d="M4 20h16"/>
                    <path d="m6 16 6-12 6 12"/>
                    <path d="M8 12h8"/>
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
</div>

<!-- Color Picker Backdrop -->
<div class="color-picker-backdrop" id="color-picker-backdrop"></div>

<!-- Color Picker Dropdown (positioned at body level for centering) -->
<div class="color-picker-dropdown" id="color-picker-dropdown">
    <div class="color-grid" id="color-grid">
        <!-- Color options will be populated by JavaScript -->
    </div>
    <div class="color-custom">
        <div class="color-input-group">
            <input type="color" class="color-input" id="color-input" value="#000000">
            <input type="text" class="color-input" id="color-hex" placeholder="#000000" maxlength="7">
        </div>
    </div>
</div>`

export const lexicalHtmlContent = (options: {
    theme: TTheme;
    initialTitle?: string;
    initialContent?: { json: string; htmlString: string };
    isReadOnly?: boolean;
    placeholder?: string;
    isModal?: boolean;
}) => {
    const {
        theme,
        initialTitle = '',
        initialContent = { json: '', htmlString: '' },
        isReadOnly = false,
        placeholder = 'Escribe algo...',
        isModal = false,
    } = options;

    const content = initialContent
    const initialJson = content.json ? JSON.stringify(content.json) : '';
    const initialHtmlString = content.htmlString;

    return `
<!DOCTYPE html>
<html lang="es">
${headContent(theme, isReadOnly)}
<body class="overflow-y-hidden h-full">
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
            $isElementNode,
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
            $patchStyleText,
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
                                class="title-input !border-b !border-gray-200/10" 
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
             const initialJson = \`${initialJson}\`;
             const initialHtmlString = \`${initialHtmlString}\`;

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
                    if(initialJson) {
                        const editorState = editor.parseEditorState(initialJson);
                        editor.setEditorState(editorState);
                    }  else if(initialHtmlString) {
                        editor.update(() => {
                                const parser = new DOMParser();
                                const dom = parser.parseFromString(initialHtmlString, 'text/html');
                                const nodes = $generateNodesFromDOM(editor, dom);
                                $getRoot().clear().append(...nodes);
                            });
                    }
                } catch (error) {
                    // Fallback to empty paragraph on error
                    try {
                      if(initialHtmlString) {
                        editor.update(() => {
                                const parser = new DOMParser();
                                const dom = parser.parseFromString(initialHtmlString, 'text/html');
                                const nodes = $generateNodesFromDOM(editor, dom);
                                $getRoot().clear().append(...nodes);
                            });
                    } else {
                        editor.update(() => {
                            const root = $getRoot();
                            if (root.getChildrenSize() === 0) {
                                const paragraph = $createParagraphNode();
                                root.append(paragraph);
                                paragraph.select();
                            }
                        });
                     }
                    } catch (error) {
                        sendMessage('log', {  log: 'Failed to load initial content:' + error.message   });
                    }
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
            textColor: '#000000',
        };

        // Color picker functionality - include theme color first
        const defaultColors = [
            '${theme.colors.text}', // Theme color first
            '#000000', '#374151', '#6B7280', '#9CA3AF', '#D1D5DB', '#F3F4F6', '#FFFFFF',
            '#DC2626', '#EA580C', '#D97706', '#CA8A04', '#65A30D', '#16A34A', '#0891B2',
            '#2563EB', '#7C3AED', '#C026D3', '#DB2777', '#E11D48', '#F97316', '#F59E0B',
            '#84CC16', '#22C55E', '#06B6D4', '#3B82F6', '#8B5CF6', '#D946EF', '#EC4899',
            '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#10B981', '#06B6D4',
            '#0EA5E9', '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF', '#EC4899',
            '#F43F5E', '#FB7185', '#FDA4AF', '#FECDD3', '#FED7D7', '#FEF3C7', '#FEF9C3',
            '#ECFCCB', '#D1FAD7', '#A7F3D0', '#6EE7B7', '#34D399', '#10B981', '#059669'
        ];

        function initColorPicker() {
            const colorGrid = document.getElementById('color-grid');
            if (!colorGrid) return;

            // Clear existing colors
            colorGrid.innerHTML = '';

            // Add color options
            defaultColors.forEach(color => {
                const colorOption = document.createElement('div');
                colorOption.className = 'color-option';
                colorOption.style.backgroundColor = color;
                colorOption.setAttribute('data-color', color);
                colorOption.addEventListener('click', () => {
                    applyTextColor(color);
                    hideColorPicker();
                });
                colorGrid.appendChild(colorOption);
            });
        }

        function showColorPicker() {
            const dropdown = document.getElementById('color-picker-dropdown');
            const backdrop = document.getElementById('color-picker-backdrop');
            if (dropdown && backdrop) {
                dropdown.classList.add('show');
                backdrop.classList.add('show');
                updateSelectedColor();
            }
        }

        function hideColorPicker() {
            const dropdown = document.getElementById('color-picker-dropdown');
            const backdrop = document.getElementById('color-picker-backdrop');
            if (dropdown && backdrop) {
                dropdown.classList.remove('show');
                backdrop.classList.remove('show');
            }
        }

        function updateSelectedColor() {
            const selectedColor = toolbarState.textColor;
            document.querySelectorAll('.color-option').forEach(option => {
                const color = option.getAttribute('data-color');
                if (color === selectedColor) {
                    option.classList.add('selected');
                } else {
                    option.classList.remove('selected');
                }
            });

            // Update custom color inputs
            const colorInput = document.getElementById('color-input');
            const colorHex = document.getElementById('color-hex');
            if (colorInput) colorInput.value = selectedColor;
            if (colorHex) colorHex.value = selectedColor;
        }

        function applyTextColor(color) {
            if (!editor) return;

            toolbarState.textColor = color;
            updateSelectedColor();

            editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    // Use $patchStyleText for proper color application (like the React version)
                    $patchStyleText(selection, { color });
                }
            });

            // Ensure the editor gets focus back for typing
            setTimeout(() => {
                const editorElement = document.getElementById('editor');
                if (editorElement) {
                    editorElement.focus();
                }
            }, 10);
        }

        // Update toolbar UI
        function updateToolbarUI() {
            // Update undo/redo buttons
            const undoBtn = document.getElementById('btn-undo');
            const redoBtn = document.getElementById('btn-redo');
            if (undoBtn) undoBtn.disabled = !toolbarState.canUndo;
            if (redoBtn) redoBtn.disabled = !toolbarState.canRedo;

            // Update text color button indicator
            const colorBtn = document.getElementById('btn-text-color');
            if (colorBtn) {
                if (toolbarState.textColor && toolbarState.textColor !== '#000000') {
                    colorBtn.classList.add('color-active');
                    colorBtn.style.color = toolbarState.textColor;
                } else {
                    colorBtn.classList.remove('color-active');
                    colorBtn.style.color = '';
                }
            }
            
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
                    toolbarState.textColor = '#000000';
                    
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

                    // Get text color - check if selection has color formatting
                    let detectedColor = '#000000';
                    let hasUniformColor = false;

                    try {
                        const nodes = selection.getNodes();
                        let firstColor = null;
                        let allSameColor = true;

                        for (const node of nodes) {
                            if (node.getStyle) {
                                const nodeStyle = node.getStyle();
                                const colorMatch = nodeStyle.match(/color:\s*([^;]+)/);

                                if (colorMatch) {
                                    const nodeColor = colorMatch[1];
                                    if (firstColor === null) {
                                        firstColor = nodeColor;
                                    } else if (firstColor !== nodeColor) {
                                        allSameColor = false;
                                        break;
                                    }
                                } else if (firstColor !== null) {
                                    // Some nodes have color, some don't
                                    allSameColor = false;
                                    break;
                                }
                            }
                        }

                        if (allSameColor && firstColor) {
                            detectedColor = firstColor;
                            hasUniformColor = true;
                        }
                    } catch (e) {
                        console.warn('Error detecting text color:', e);
                    }

                    toolbarState.textColor = detectedColor;
                    
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
            
            // Color picker button
            const colorBtn = document.getElementById('btn-text-color');
            if (colorBtn) {
                colorBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const dropdown = document.getElementById('color-picker-dropdown');
                    if (dropdown && dropdown.classList.contains('show')) {
                        hideColorPicker();
                    } else {
                        showColorPicker();
                    }
                });
            }

            // Custom color input handlers
            const colorInput = document.getElementById('color-input');
            const colorHex = document.getElementById('color-hex');

            if (colorInput) {
                colorInput.addEventListener('input', (e) => {
                    const color = e.target.value;
                    if (colorHex) colorHex.value = color;
                    applyTextColor(color);
                });
            }

            if (colorHex) {
                colorHex.addEventListener('input', (e) => {
                    const color = e.target.value;
                    if (colorInput) colorInput.value = color;
                    if (/^#[0-9A-F]{6}$/i.test(color)) {
                        applyTextColor(color);
                    }
                });

                colorHex.addEventListener('blur', () => {
                    const color = colorHex.value;
                    if (!/^#[0-9A-F]{6}$/i.test(color)) {
                        // Reset to current color if invalid
                        colorHex.value = toolbarState.textColor;
                        if (colorInput) colorInput.value = toolbarState.textColor;
                    }
                });
            }

            // Close color picker when clicking outside or on backdrop
            document.addEventListener('click', (e) => {
                const dropdown = document.getElementById('color-picker-dropdown');
                const backdrop = document.getElementById('color-picker-backdrop');
                const colorBtn = document.getElementById('btn-text-color');
                if (dropdown && backdrop && colorBtn) {
                    if (e.target === backdrop || (!dropdown.contains(e.target) && !colorBtn.contains(e.target))) {
                        hideColorPicker();
                    }
                }
            });

            // Close color picker on ESC key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    hideColorPicker();
                }
            });

            // Initialize color picker
            initColorPicker();

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
                        editor.update(() => {
                    const parser = new DOMParser();
                    const dom = parser.parseFromString(message.data.text, "text/html");

                    const nodes = $generateNodesFromDOM(editor, dom);
                    const root = $getRoot();
                    // Don't clear existing content - just append new content

                    // ✅ Wrap non-element nodes inside a paragraph
                    const paragraph = $createParagraphNode();
                    for (const node of nodes) {
                        if ($isElementNode(node)) {
                        root.append(node);
                        } else {
                        paragraph.append(node);
                        }
                    }

                    // If paragraph has any children, append it
                    if (paragraph.getChildrenSize() > 0) {
                        root.append(paragraph);
                    }

                    // Scroll to bottom to show the newly added content
                    setTimeout(() => {
                        const contentWrapper = document.querySelector('.content-wrapper');
                        if (contentWrapper) {
                            contentWrapper.scrollTo({
                                top: contentWrapper.scrollHeight,
                                behavior: 'smooth'
                            });
                        }
                    }, 100);
                    });
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

