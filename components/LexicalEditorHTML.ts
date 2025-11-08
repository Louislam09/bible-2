// Rich Text Editor HTML Template for WebView  
// Using Quill.js - Pure JavaScript, no build tools needed

export const generateLexicalEditorHTML = (options: {
    theme: {
        dark: boolean;
        colors: {
            background: string;
            text: string;
            primary: string;
            notification: string;
            card: string;
            border: string;
        };
    };
    initialTitle?: string;
    initialContent?: string;
    isReadOnly?: boolean;
    placeholder?: string;
}) => {
    const { theme, initialTitle = '', initialContent = '', isReadOnly = false, placeholder = 'Escribe algo...' } = options;

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Editor</title>
    
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
    
    <!-- Quill Editor -->
    <link href="https://cdn.quilljs.com/1.3.7/quill.snow.css" rel="stylesheet">
    <script src="https://cdn.quilljs.com/1.3.7/quill.min.js"></script>
    
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
        
        /* Quill Toolbar Customization */
        .ql-toolbar {
            background: ${theme.colors.background};
            border: none !important;
            border-bottom: 1px solid ${theme.colors.border}40 !important;
            padding: 8px !important;
        }
        
        .ql-toolbar button {
            color: ${theme.colors.text} !important;
        }
        
        .ql-toolbar button:hover {
            color: ${theme.colors.notification} !important;
        }
        
        .ql-toolbar .ql-active {
            color: ${theme.colors.notification} !important;
        }
        
        .ql-toolbar .ql-stroke {
            stroke: ${theme.colors.text} !important;
        }
        
        .ql-toolbar .ql-fill {
            fill: ${theme.colors.text} !important;
        }
        
        .ql-toolbar .ql-active .ql-stroke {
            stroke: ${theme.colors.notification} !important;
        }
        
        .ql-toolbar .ql-active .ql-fill {
            fill: ${theme.colors.notification} !important;
        }
        
        .ql-toolbar button:hover .ql-stroke {
            stroke: ${theme.colors.notification} !important;
        }
        
        .ql-toolbar button:hover .ql-fill {
            fill: ${theme.colors.notification} !important;
        }
        
        /* Quill Editor Customization */
        .ql-container {
            background: ${theme.colors.background};
            border: none !important;
            font-family: 'Montserrat', sans-serif !important;
            font-size: 16px !important;
            color: ${theme.colors.text} !important;
            height: 100% !important;
        }
        
        .ql-editor {
            padding: 16px !important;
            color: ${theme.colors.text} !important;
            overflow-y: auto !important;
        }
        
        .ql-editor.ql-blank::before {
            color: ${theme.colors.text}60 !important;
            opacity: 0.6;
            font-style: normal !important;
        }
        
        .ql-editor p,
        .ql-editor ol,
        .ql-editor ul,
        .ql-editor pre,
        .ql-editor blockquote,
        .ql-editor h1,
        .ql-editor h2,
        .ql-editor h3 {
            color: ${theme.colors.text} !important;
        }
        
        .ql-editor a {
            color: #3b82f6 !important;
        }
        
        .ql-editor blockquote {
            border-left: 4px solid ${theme.colors.border} !important;
            color: ${theme.colors.text}CC !important;
        }
        
        .ql-editor code,
        .ql-editor pre {
            background-color: ${theme.dark ? '#374151' : '#f3f4f6'} !important;
            color: ${theme.colors.text} !important;
        }
        
        .ql-snow .ql-picker {
            color: ${theme.colors.text} !important;
        }
        
        .ql-snow .ql-picker-options {
            background-color: ${theme.colors.card} !important;
            border: 1px solid ${theme.colors.border} !important;
        }
        
        .ql-snow .ql-picker-item {
            color: ${theme.colors.text} !important;
        }
        
        .ql-snow .ql-picker-item:hover {
            color: ${theme.colors.notification} !important;
        }
        
        /* Hide toolbar in read-only mode */
        ${isReadOnly ? '.ql-toolbar { display: none !important; }' : ''}
        
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
</head>
<body>
    <div id="root">
        <div class="loading">Inicializando editor...</div>
    </div>
    
    <script>
        let quill;
        let currentTitle = '${initialTitle.replace(/'/g, "\\'")}';
        let isReadOnly = ${isReadOnly};
        let updateTimeout;
        
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
                <div class="editor-wrapper">
                    <div id="editor-container"></div>
                </div>
            \`;
            
            // Quill toolbar configuration
            const toolbarOptions = ${isReadOnly ? 'false' : `[
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ 'header': 1 }, { 'header': 2 }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'indent': '-1'}, { 'indent': '+1' }],
                [{ 'size': ['small', false, 'large', 'huge'] }],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'align': [] }],
                ['link'],
                ['clean']
            ]`};
            
            // Initialize Quill
            quill = new Quill('#editor-container', {
                theme: 'snow',
                modules: {
                    toolbar: toolbarOptions
                },
                placeholder: '${placeholder}',
                readOnly: isReadOnly
            });
            
            console.log('Quill initialized');
            
            // Load initial content
            if ('${initialContent}') {
                try {
                    const content = JSON.parse(\`${initialContent.replace(/`/g, '\\`')}\`);
                    if (content.htmlString) {
                        quill.root.innerHTML = content.htmlString;
                    } else if (content.delta) {
                        quill.setContents(content.delta);
                    }
                } catch (error) {
                    console.error('Failed to load initial content:', error);
                }
            }
            
            // Setup event listeners
            const debouncedContentChange = debounce(() => {
                const htmlString = quill.root.innerHTML;
                const delta = quill.getContents();
                const text = quill.getText();
                
                sendMessage('contentChange', {
                    content: JSON.stringify({ 
                        htmlString, 
                        delta,
                        text 
                    })
                });
            }, 500);
            
            quill.on('text-change', () => {
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
        
        // Listen for messages from React Native
        function handleNativeMessage(event) {
            try {
                const message = JSON.parse(event.data);
                console.log('Received message:', message.type);
                
                switch (message.type) {
                    case 'updateTheme':
                        // Theme updates would require recreating styles
                        console.log('Theme update received');
                        break;
                        
                    case 'loadContent':
                        if (message.data.content && quill) {
                            try {
                                const content = JSON.parse(message.data.content);
                                if (content.htmlString) {
                                    quill.root.innerHTML = content.htmlString;
                                } else if (content.delta) {
                                    quill.setContents(content.delta);
                                }
                            } catch (error) {
                                console.error('Failed to load content:', error);
                            }
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
                        if (quill) {
                            quill.enable(!isReadOnly);
                        }
                        break;
                        
                    case 'getContent':
                        const htmlString = quill.root.innerHTML;
                        const delta = quill.getContents();
                        sendMessage('contentResponse', {
                            content: JSON.stringify({ htmlString, delta })
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
