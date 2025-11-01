import { storedData$ } from "@/context/LocalstoreContext";
import { modalState$ } from "@/state/modalState";
import { lucideIcons } from "@/utils/lucideIcons";

type DictionaryListHtmlTemplateProps = {
    data: any[],
    theme: any,
    fontSize: any,
    wordNotFound: boolean,
    loading: boolean,
    selectedWord: any,
    showDefinition: boolean,
}

export const dictionaryListHtmlTemplate = ({
    data,
    theme,
    fontSize,
    wordNotFound,
    loading,
    selectedWord,
    showDefinition,
}: DictionaryListHtmlTemplateProps) => {
    const colors = theme.colors;
    const generateContent = () => {
        if (showDefinition && selectedWord) {
            return generateWordDefinition();
        }
        return generateWordCards();
    };

    const generateWordDefinition = () => {
        const definition = selectedWord.definition || "";

        return `
       <div class="p-1 w-full">
         <div class="action-buttons flex flex-row items-center justify-between mb-4 [&>button>span>svg]:!w-7 [&>button>span>svg]:!h-7">
           <button class="flex flex-col items-center justify-center" onclick="goBack()">
             <span class="text-theme-notification">${lucideIcons.arrowLeft}</span>
             <span class="text-sm font-bold">Anterior</span>
           </button>
           <button class="flex flex-col items-center justify-center" onclick="shareContent()">
            <span class="text-theme-notification">${lucideIcons.share}</span>
            <span class="text-sm font-bold">Compartir</span>
           </button>
         </div>
        <h2 class="text-2xl font-bold">Definición</h2>
        <div class="definition-content ">
           ${definition.replace(/<b>(.*?)<\/b>/g, "<h3>$1</h3>")}
        </div>
       </div>
     `;
    };

    const generateWordCards = () => {
        if (wordNotFound) {
            return `
        <div class="no-results">
          <div class="searching-animation">🔍</div>
          <p class="no-results-text text-theme-text">No encontramos resultados para: "${modalState$.searchWordOnDic.get()}"</p>
        </div>
      `;
        }

        if (!data || data.length === 0 || loading) {
            return `
        <div class="no-results">
          <div class="searching-animation">🔍</div>
          <p class="no-results-text">Buscar un palabra</p>
        </div>
      `;
        }

        return data.map((version, versionIndex) => {
            if (version.words.length === 0) return '';

            const wordCards = version.words.slice(0, 10).map((word: any, wordIndex: number) => `
        <div class="word-card bg-theme-background border border-theme-chip-border" data-word='${versionIndex}-${wordIndex}' style="animation-delay: ${wordIndex * 100}ms">
          <div class="word-content ">
            <span class="word-topic text-theme-text">${word.topic || ''}</span>
          </div>
        </div>
      `).join('');

            return `
        <div class="dictionary-version w-full">
          <h3 class="version-title text-theme-notification">${version.dbShortName}</h3>
          <div class="words-container overflow-hidden w-full">
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
         ${storedData$.tailwindScript.get()}
         <style type="text/tailwindcss">
            @theme {
                /* Define Tailwind theme tokens */
                --color-theme-text: ${theme.colors.text || '#1f2937'};
                --color-theme-background: ${theme.colors.background || '#ffffff'};
                --color-theme-card: ${theme.colors.card || '#f8fafc'};
                --color-theme-border: ${theme.colors.border || '#e5e7eb'};
                --color-theme-primary: ${theme.colors.primary || '#3b82f6'};
                --color-theme-notification: ${theme.colors.notification || '#ef4444'};
                --color-theme-chip: ${theme.dark ? theme.colors.text + 40 : theme.colors.notification + 80 || '#e5e7eb'};
                --color-theme-chip-border: ${theme.colors.text + 80 || '#e5e7eb'};
            }
        </style>
        <title>Dictionary</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                overflow-x: hidden;
                font-family: "Noto Sans Hebrew", sans-serif;
            }
            
            .action-buttons {
                margin-bottom: 20px;
            }
            .dictionary-version {
                margin-bottom: 20px;
            }
            
            .version-title {
                font-weight: bold;
                margin-bottom: 10px;
                text-transform: uppercase;
            }
            
            .words-container {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }
            
            .word-card {
                border-radius: 8px;
                padding: 15px;
                margin: 5px 0;
                cursor: pointer;
                transition: all 0.2s ease;
                opacity: 0;
                animation: slideIn 0.1s ease forwards;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            
            .word-card:hover {
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
                line-height: 1.5;
            }
            
            @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(300px);
            }
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
            
            .footer {
                height: 30px;
            }
            
            /* Definition View Styles */
            
            .definition-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                position: relative;
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
        <div class="flex flex-col items-center justify-center w-full">
            ${generateContent()}
            <div class="footer"></div>
        </div>
        
        <script>
            // Handle word card clicks
            document.addEventListener('DOMContentLoaded', function() {
                const wordCards = document.querySelectorAll('.word-card');
                
                wordCards.forEach(card => {
                    card.addEventListener('click', function() {
                        const dataWord = this.getAttribute('data-word');
                        const [versionIndex, wordIndex] = dataWord.split('-');
                        const data = ${JSON.stringify(data)};
                        const wordData = data[versionIndex].words[wordIndex];

                        if (wordData) {
                            try {
                                window.ReactNativeWebView.postMessage(JSON.stringify({
                                    type: 'wordSelected',
                                    data: wordData
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
