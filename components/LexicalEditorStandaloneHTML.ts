// Standalone Lexical Editor HTML Template for WebView
// Uses bundled lexical-bundle.min.js - no external CDN required

import { TTheme } from "@/types";

export const generateStandaloneLexicalHTML = (options: {
    theme: TTheme;
    lexicalBundle: string;
    initialTitle?: string;
    initialContent?: string;
    isReadOnly?: boolean;
    placeholder?: string;
}) => {
    const {
        theme,
        lexicalBundle,
        initialTitle = '',
        initialContent = '',
        isReadOnly = false,
        placeholder = 'Escribe algo...',
    } = options;

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Lexical Editor</title>
    
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
    
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
        }
        
        /* Title Input */
        .title-container {
            padding: 16px;
            border-bottom: 1px solid ${theme.colors.border}40;
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
        
        /* Editor Container */
        .editor-wrapper {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        
        /* Toolbar */
        .toolbar {
            background: ${theme.colors.background};
            border-bottom: 1px solid ${theme.colors.border}40;
            padding: 8px;
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
        }
        
        .toolbar-button {
            background: transparent;
            border: none;
            padding: 8px 12px;
            color: ${theme.colors.text};
            cursor: pointer;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s;
        }
        
        .toolbar-button:hover {
            background: ${theme.colors.border}40;
            color: ${theme.colors.notification};
        }
        
        .toolbar-button.active {
            background: ${theme.colors.notification}20;
            color: ${theme.colors.notification};
        }
        
        .toolbar-divider {
            width: 1px;
            background: ${theme.colors.border}40;
            margin: 0 4px;
        }
        
        /* Editor */
        .editor-container {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            background: ${theme.colors.background};
        }
        
        .editor-input {
            min-height: 200px;
            outline: none;
            color: ${theme.colors.text};
            font-size: 16px;
            line-height: 1.6;
        }
        
        .editor-placeholder {
            color: ${theme.colors.text}60;
            position: absolute;
            top: 16px;
            left: 16px;
            pointer-events: none;
            user-select: none;
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
            padding-left: 24px;
            margin: 8px 0;
            color: ${theme.colors.text};
        }
        
        .editor-input li {
            margin: 4px 0;
        }
        
        .editor-input a {
            color: #3b82f6;
            text-decoration: underline;
        }
        
        .editor-input strong {
            font-weight: 700;
        }
        
        .editor-input em {
            font-style: italic;
        }
        
        .editor-input u {
            text-decoration: underline;
        }
        
        .editor-input s {
            text-decoration: line-through;
        }
        
        /* Hide toolbar in read-only mode */
        ${isReadOnly ? '.toolbar { display: none !important; }' : ''}
        ${isReadOnly ? '.title-container { display: none !important; }' : ''}
        
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
    ${lexicalBundle}
</head>
<body>
    <div id="root">
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
            $setBlocksType,
            $createHeadingNode,
            $createQuoteNode,
            INSERT_ORDERED_LIST_COMMAND,
            INSERT_UNORDERED_LIST_COMMAND,
            COMMAND_PRIORITY_LOW,
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
                } else {
                    console.log('Message:', type, data);
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
                ${!isReadOnly ? `
                <div class="title-container">
                    <input 
                        id="title-input" 
                        type="text" 
                        class="title-input" 
                        placeholder="Título" 
                        value="${initialTitle.replace(/"/g, '&quot;')}"
                    />
                </div>
                ` : ''}
                ${!isReadOnly ? `
                <div class="toolbar">
                    <button class="toolbar-button" data-format="bold"><strong>B</strong></button>
                    <button class="toolbar-button" data-format="italic"><em>I</em></button>
                    <button class="toolbar-button" data-format="underline"><u>U</u></button>
                    <button class="toolbar-button" data-format="strikethrough"><s>S</s></button>
                    <div class="toolbar-divider"></div>
                    <button class="toolbar-button" data-block="h1">H1</button>
                    <button class="toolbar-button" data-block="h2">H2</button>
                    <button class="toolbar-button" data-block="h3">H3</button>
                    <div class="toolbar-divider"></div>
                    <button class="toolbar-button" data-block="quote">Quote</button>
                    <button class="toolbar-button" data-block="ul">• List</button>
                    <button class="toolbar-button" data-block="ol">1. List</button>
                    <button class="toolbar-button" data-block="code">Code</button>
                </div>
                ` : ''}
                <div class="editor-wrapper">
                    <div class="editor-container">
                        <div class="editor-placeholder" id="placeholder">${placeholder}</div>
                        <div class="editor-input" contenteditable="${!isReadOnly}" id="editor"></div>
                    </div>
                </div>
            \`;
            
            // Configure Lexical
            const config = {
                namespace: 'LexicalEditor',
                theme: {},
                onError: (error) => {
                    console.error('Lexical error:', error);
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
            
            console.log('Lexical editor initialized');
            
            // Load initial content
            if ('${initialContent}') {
                try {
                    const content = JSON.parse(\`${initialContent.replace(/`/g, '\\`')}\`);
                    if (content.htmlString) {
                        editor.update(() => {
                            const parser = new DOMParser();
                            const dom = parser.parseFromString(content.htmlString, 'text/html');
                            const nodes = $generateNodesFromDOM(editor, dom);
                            $getRoot().clear().append(...nodes);
                        });
                    } else if (content.json) {
                        const editorState = editor.parseEditorState(content.json);
                        editor.setEditorState(editorState);
                    }
                } catch (error) {
                    console.error('Failed to load initial content:', error);
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
                        placeholder.style.display = text.trim() ? 'none' : 'block';
                    }
                });
            }, 500);
            
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
            console.log('Editor ready');
        }
        
        // Setup toolbar handlers
        function setupToolbar() {
            // Text formatting buttons
            document.querySelectorAll('[data-format]').forEach(button => {
                button.addEventListener('click', () => {
                    const format = button.getAttribute('data-format');
                    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
                });
            });
            
            // Block type buttons
            document.querySelectorAll('[data-block]').forEach(button => {
                button.addEventListener('click', () => {
                    const blockType = button.getAttribute('data-block');
                    
                    editor.update(() => {
                        const selection = $getSelection();
                        
                        if (blockType === 'h1' || blockType === 'h2' || blockType === 'h3') {
                            $setBlocksType(selection, () => $createHeadingNode(blockType));
                        } else if (blockType === 'quote') {
                            $setBlocksType(selection, () => $createQuoteNode());
                        } else if (blockType === 'ul') {
                            editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
                        } else if (blockType === 'ol') {
                            editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
                        }
                    });
                });
            });
        }
        
        // Listen for messages from React Native
        function handleNativeMessage(event) {
            try {
                const message = JSON.parse(event.data);
                console.log('Received message:', message.type);
                
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

