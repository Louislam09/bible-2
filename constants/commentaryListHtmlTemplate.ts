import { DB_BOOK_NAMES } from "./BookNames";
import { lucideIcons } from "@/utils/lucideIcons";

type CommentaryListHtmlTemplateProps = {
    data: any[];
    theme: any;
    fontSize: any;
    commentaryNotFound: boolean;
    loading: boolean;
    selectedCommentary: any;
    showDetail: boolean;
    tailwindScript: string;
    currentReference?: {
        book: string;
        chapter: number;
        verse?: number;
    };
};

export const commentaryListHtmlTemplate = ({
    data,
    theme,
    fontSize,
    commentaryNotFound,
    loading,
    selectedCommentary,
    showDetail,
    tailwindScript,
    currentReference,
}: CommentaryListHtmlTemplateProps) => {
    const colors = theme.colors;

    const generateContent = () => {
        if (showDetail && selectedCommentary) {
            return generateCommentaryDetail();
        }
        return generateCommentaryCards();
    };

    const generateCommentaryDetail = () => {
        const text = selectedCommentary.text || "";
        const bookName =
            DB_BOOK_NAMES.find(
                (b) => b.bookNumber === selectedCommentary.book_number
            )?.longName || "";
        const reference = `${bookName} ${selectedCommentary.chapter_number_from}:${selectedCommentary.verse_number_from}${selectedCommentary.verse_number_to !== selectedCommentary.verse_number_from
                ? `-${selectedCommentary.verse_number_to}`
                : ""
            }`;

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
        <h2 class="text-2xl font-bold text-theme-notification">${reference}</h2>
        <div class="commentary-content mt-4">
          ${text.replace(/<b>(.*?)<\/b>/g, "<h3>$1</h3>")}
        </div>
      </div>
    `;
    };

    const generateCommentaryCards = () => {
        if (commentaryNotFound) {
            return `
        <div class="no-results">
          <div class="searching-animation">📖</div>
          <p class="no-results-text text-theme-text">
            No encontramos comentarios para: ${currentReference
                    ? `${currentReference.book} ${currentReference.chapter}${currentReference.verse ? `:${currentReference.verse}` : ""
                    }`
                    : "esta referencia"
                }
          </p>
        </div>
      `;
        }

        if (!data || data.length === 0 || loading) {
            return `
        <div class="no-results">
          <div class="searching-animation">📖</div>
          <p class="no-results-text">Selecciona una referencia bíblica para ver comentarios</p>
        </div>
      `;
        }

        return data
            .map((version, versionIndex) => {
                if (version.commentaries.length === 0) return "";

                const commentaryCards = version.commentaries
                    .map((commentary: any, commentaryIndex: number) => {
                        const bookName =
                            DB_BOOK_NAMES.find((b) => b.bookNumber === commentary.book_number)
                                ?.longName || "";
                        const reference = `${bookName} ${commentary.chapter_number_from}:${commentary.verse_number_from
                            }${commentary.verse_number_to !== commentary.verse_number_from
                                ? `-${commentary.verse_number_to}`
                                : ""
                            }`;
                        const preview =
                            commentary.text.substring(0, 150).replace(/<[^>]*>/g, "") + "...";

                        return `
          <div class="commentary-card bg-theme-background border border-theme-chip-border" 
               data-commentary='${versionIndex}-${commentaryIndex}' 
               style="animation-delay: ${commentaryIndex * 100}ms">
            <div class="commentary-header">
              <span class="commentary-reference text-theme-notification">${reference}</span>
            </div>
            <div class="commentary-preview text-theme-text">
              ${preview}
            </div>
          </div>
        `;
                    })
                    .join("");

                return `
        <div class="commentary-version w-full">
          <h3 class="version-title text-theme-notification">${version.dbShortName}</h3>
          <div class="commentaries-container overflow-hidden w-full">
            ${commentaryCards}
          </div>
        </div>
      `;
            })
            .join("");
    };

    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+Hebrew:wght@100..900&display=swap">

        <!-- Tailwind CSS (Offline) -->
        ${tailwindScript}
        <style type="text/tailwindcss">
            @theme {
                --color-theme-text: ${theme.colors.text || "#1f2937"};
                --color-theme-background: ${theme.colors.background || "#ffffff"};
                --color-theme-card: ${theme.colors.card || "#f8fafc"};
                --color-theme-border: ${theme.colors.border || "#e5e7eb"};
                --color-theme-primary: ${theme.colors.primary || "#3b82f6"};
                --color-theme-notification: ${theme.colors.notification || "#ef4444"
        };
                --color-theme-chip: ${theme.dark
            ? theme.colors.text + 40
            : theme.colors.notification + 80 || "#e5e7eb"
        };
                --color-theme-chip-border: ${theme.colors.text + 80 || "#e5e7eb"};
            }
        </style>
        <title>Comentarios</title>
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
            
            .commentary-version {
                margin-bottom: 20px;
            }
            
            .version-title {
                font-weight: bold;
                margin-bottom: 10px;
                text-transform: uppercase;
            }
            
            .commentaries-container {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .commentary-card {
                border-radius: 8px;
                padding: 15px;
                margin: 5px 0;
                cursor: pointer;
                transition: all 0.2s ease;
                opacity: 0;
                animation: slideIn 0.1s ease forwards;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            
            .commentary-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 10px rgba(0,0,0,0.15);
            }
            
            .commentary-card:active {
                transform: translateY(0);
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            
            .commentary-header {
                margin-bottom: 8px;
            }
            
            .commentary-reference {
                font-weight: 700;
                font-size: 16px;
            }
            
            .commentary-preview {
                font-size: 14px;
                line-height: 1.5;
                opacity: 0.9;
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
            
            /* Commentary Detail Styles */
            .commentary-content {
                color: ${colors.text};
                font-size: ${fontSize}px;
                line-height: 1.8;
                font-family: "Open Sans", sans-serif;
            }
            
            .commentary-content h3 {
                text-transform: uppercase;
                color: ${colors.notification};
                margin: 15px 0 10px 0;
                font-size: ${fontSize + 2}px;
            }
            
            .commentary-content p {
                color: ${colors.text};
                margin: 10px 0;
            }
            
            .commentary-content a {
                color: ${colors.notification};
                text-decoration: none;
            }
            
            .commentary-content a:after {
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
            // Handle commentary card clicks
            document.addEventListener('DOMContentLoaded', function() {
                const commentaryCards = document.querySelectorAll('.commentary-card');
                
                commentaryCards.forEach(card => {
                    card.addEventListener('click', function() {
                        const dataCommentary = this.getAttribute('data-commentary');
                        const [versionIndex, commentaryIndex] = dataCommentary.split('-');
                        const data = ${JSON.stringify(data)};
                        const commentaryData = data[versionIndex].commentaries[commentaryIndex];

                        if (commentaryData) {
                            try {
                                window.ReactNativeWebView.postMessage(JSON.stringify({
                                    type: 'commentarySelected',
                                    data: commentaryData
                                }));
                            } catch (e) {
                                console.error('Error parsing commentary data:', e);
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

