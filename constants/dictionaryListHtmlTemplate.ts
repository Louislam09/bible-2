import { lucideIcons } from "@/utils/lucideIcons";
import { tailwindCss } from "./tailwindCss";

export const dictionaryListHtmlTemplate = (
    data: any[],
    theme: any,
    fontSize: any,
    wordNotFound: boolean = false,
    searchWord: string = "",
    selectedWord: any = null,
    showDefinition: boolean = false,
) => {
    const colors = theme.colors;
    const generateContent = () => {
        if (showDefinition && selectedWord) {
            return generateWordDefinition();
        }
        return generateWordCards();
    };

    const generateWordDefinition = () => {
        const definition = selectedWord.definition || "";
        const topic = selectedWord.topic || "";

        return `
       <div class="p-1 w-full">
         <div class="flex flex-row items-center justify-between mb-4">
           <button class="flex flex-col items-center justify-center" onclick="goBack()">
             <span class="action-icon back-icon">${lucideIcons.arrowLeft}</span>
             <span class="text-sm font-bold">Anterior</span>
           </button>
           <button class="flex flex-col items-center justify-center" onclick="shareContent()">
            <span class="action-icon share-icon">${lucideIcons.share}</span>
            <span class="text-sm font-bold">Compartir</span>
           </button>
         </div>
        <h2 class="text-2xl font-bold">Definición</h2>
         <div class="definition-content">
           ${definition.replace(/<b>(.*?)<\/b>/g, "<h3>$1</h3>")}
         </div>
       </div>
     `;
    };

    const generateWordCards = () => {
        if (wordNotFound && searchWord) {
            return `
        <div class="no-results">
          <div class="searching-animation">🔍</div>
          <p class="no-results-text">No encontramos resultados para: "${searchWord}"</p>
        </div>
      `;
        }

        if (!data || data.length === 0) {
            return `
        <div class="no-results">
          <div class="searching-animation">🔍</div>
          <p class="no-results-text">Buscar un palabra</p>
        </div>
      `;
        }

        return data.map((version) => {
            if (version.words.length === 0) return '';

            const wordCards = version.words.slice(0, 10).map((word: any, index: number) => `
        <div class="word-card" data-word='${JSON.stringify(word)}' style="animation-delay: ${index * 100}ms">
          <div class="word-content ">
            <span class="word-topic">${word.topic || ''}</span>
          </div>
        </div>
      `).join('');

            return `
        <div class="dictionary-version">
          <h3 class="version-title">${version.dbShortName}</h3>
          <div class="words-container">
            ${wordCards}
          </div>
        </div>
      `;
        }).join('');
    };

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+Hebrew:wght@100..900&display=swap">

          <!-- Tailwind CSS (Offline) -->
         <style>
             /* Theme CSS Variables */
             :root {
                --data-theme: ${theme.dark ? "dark" : "light"};
                --theme: ${theme.dark ? "theme-dark" : "theme-light"};
                 --color-primary: ${theme.colors.primary || '#3b82f6'};
                 --color-background: ${theme.colors.background || '#ffffff'};
                 --color-card: ${theme.colors.card || '#f8fafc'};
                 --color-text: ${theme.colors.text || '#1f2937'};
                 --color-chip: ${theme.dark ? theme.colors.text + 40 : theme.colors.notification + 80 || '#e5e7eb'};
                 --color-chip-border: ${theme.colors.text + 80 || '#e5e7eb'};
                 --color-border: ${theme.colors.border || '#e5e7eb'};
                 --color-notification: ${theme.colors.notification || '#ef4444'};
             }
             
             ${tailwindCss}
         </style>
        <title>Dictionary</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                color: var(--color-text);
                background: var(--color-background);
                overflow-x: hidden;
                font-family: "Noto Sans Hebrew", sans-serif;
            }
            
            .dictionary-version {
                margin-bottom: 20px;
            }
            
            .version-title {
                font-weight: bold;
                color: var(--color-notification);
                margin-bottom: 10px;
                text-transform: uppercase;
            }
            
            .words-container {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }
            
            .word-card {
                background: var(--color-card);
                border: 1px solid var(--color-chip-border);
                border-radius: 8px;
                padding: 15px;
                margin: 5px 0;
                cursor: pointer;
                transition: all 0.2s ease;
                opacity: 0;
                transform: translateX(300px);
                animation: slideIn 0.1s ease forwards;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            
            .word-card:hover {
                background: var(--color-notification)20;
                transform: translateY(-2px);
                box-shadow: 0 4px 10px rgba(0,0,0,0.15);
            }
            
            .word-card:active {
                transform: translateY(0);
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            
            .word-content {
                display: flex;
                align-items: center;
            }
            
            .word-topic {
                color: var(--color-text);
                text-transform: uppercase;
                font-weight: 600;
            }
            
            .no-results {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 200px;
                text-align: center;
            }
            
            .searching-animation {
                font-size: 48px;
                margin-bottom: 20px;
                animation: pulse 2s infinite;
            }
            
            .no-results-text {
                color: var(--color-text);
                line-height: 1.5;
            }
            
            @keyframes slideIn {
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            @keyframes pulse {
                0%, 100% {
                    opacity: 1;
                }
                50% {
                    opacity: 0.5;
                }
            }
            
            .separator {
                height: 1px;
                background: var(--color-notification)30;
                margin: 10px 0;
            }
            
            .footer {
                height: 30px;
            }
            
            /* Definition View Styles */
            .definition-container {
                padding: 20px;
                background: var(--color-background);
            }
            
            .definition-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                position: relative;
            }
            
            .back-button {
                display: flex;
                align-items: center;
                background: transparent;
                border: none;
                cursor: pointer;
                padding: 8px 12px;
                border-radius: 8px;
                transition: background-color 0.2s ease;
                color: var(--color-notification);
            }
            
            .back-button:hover {
                background: var(--color-notification)20;
            }
            
            .back-icon {
                margin-right: 8px;
                display: flex;
                align-items: center;
            }
            
            .back-icon svg {
                stroke: var(--color-notification);
                width: 100% !important;
                height: 100% !important;
            }
            
            .back-text {
                font-weight: bold;
                color: var(--color-text);
            }
            
            .definition-title {
                color: var(--color-text);
                font-size: ${fontSize + 2}px;
                font-weight: bold;
                margin: 0;
            }
            
            .share-button {
                background: transparent;
                border: none;
                cursor: pointer;
                padding: 8px;
                border-radius: 8px;
                transition: background-color 0.2s ease;
            }
            
            .share-button:hover {
                background: ${colors.notification}20;
            }
            
            .share-icon {
                color: ${colors.notification};
            }

            .action-icon svg {
                width: 30px !important;
                height: 30px !important;
            }
            
            .definition-content {
                color: ${colors.text};
                font-size: ${fontSize - 2}px;
                line-height: 1.6;
                font-family: "Open Sans", sans-serif;
            }
            
            .definition-content h3 {
                text-transform: uppercase;
                color: ${colors.notification};
                margin: 15px 0 10px 0;
                font-size: ${fontSize}px;
            }
            
            .definition-content p {
                color: ${colors.text};
                margin: 10px 0;
            }
            
            .definition-content a {
                color: ${colors.notification};
                text-decoration: none;
            }
            
            .definition-content a:after {
                content: '🔎';
                margin-left: 5px;
            }
        </style>
    </head>
    <body class="w-full py-4 px-2 m-0 text-theme-text bg-theme-background select-none overflow-x-hidden">
        <div class="flex flex-col items-center justify-center w-full  ">
            ${generateContent()}
            <div class="footer"></div>
        </div>
        
        <script>
            // Handle word card clicks
            document.addEventListener('DOMContentLoaded', function() {
                const wordCards = document.querySelectorAll('.word-card');
                
                wordCards.forEach(card => {
                    card.addEventListener('click', function() {
                        const wordData = this.getAttribute('data-word');
                        if (wordData) {
                            try {
                                const word = JSON.parse(wordData);
                                window.ReactNativeWebView.postMessage(JSON.stringify({
                                    type: 'wordSelected',
                                    data: word
                                }));
                            } catch (e) {
                                console.error('Error parsing word data:', e);
                            }
                        }
                    });
                });
                
                // Handle Bible reference links
                const links = document.querySelectorAll('a[href^="b:"]');
                links.forEach(link => {
                    link.addEventListener('click', function(e) {
                        e.preventDefault();
                        const url = this.getAttribute('href');
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'bibleLink',
                            url: url
                        }));
                    });
                });
                
                // Auto-resize height
                setTimeout(() => {
                    const height = Math.max(
                        document.documentElement.scrollHeight,
                        document.body.scrollHeight
                    );
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'heightUpdate',
                        height: height
                    }));
                }, 100);
            });
            
            // Share functionality
            function shareContent() {
                const content = document.body.innerText;
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'shareContent',
                    content: content
                }));
            }
            // Back button functionality
            function goBack() {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'goBack'
                }));
            }
        </script>
    </body>
    </html>
  `;
};
