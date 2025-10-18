import { IBookVerse } from "@/types";
import { getVerseTextRaw } from "@/utils/getVerseTextRaw";
import { tailwindCss } from "./tailwindCss";

const bibleChapterStyles = (
    colors: any,
    containerWidth: number,
    showReadingTime: boolean,
    fontSize: number
) => `
         <style>
            /* Custom styles that can't be replaced with Tailwind */
            body {
                font-family: 'Georgia', 'Times New Roman', serif;
                font-size: ${fontSize}px;
                line-height: 1.8;
                letter-spacing: 2px;
            }
            
            .container {
                width: ${containerWidth};
            }
            
            .verse-actions.show {
                display: flex !important;
            }
            
            /* Dynamic hover states with theme colors */
            .verse:hover {
                background-color: ${colors.notification}20;
            }
            
            .verse.tapped {
                background-color: ${colors.notification}20;
            }
            
            .action-button:hover {
                opacity: 0.7;
            }
            
            .strong-word:hover {
                opacity: 0.7;
            }
            
            /* Scrollbar styling - not supported by Tailwind */
            .container::-webkit-scrollbar {
                width: 6px;
            }
            
            .container::-webkit-scrollbar-track {
                background: transparent;
            }
            
            .container::-webkit-scrollbar-thumb {
                background: ${colors.notification}40;
                border-radius: 3px;
            }
            
            .container::-webkit-scrollbar-thumb:hover {
                background: ${colors.notification}60;
            }
        </style>
`;

// HTML document structure functions
const createHtmlHead = (
    chapterNumber: number,
    colors: any,
    containerWidth: any,
    showReadingTime: boolean,
    fontSize: number
) => `
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Capítulo ${chapterNumber}</title>
        <!-- Tailwind CSS (Offline) -->
         <style>
             /* Theme CSS Variables */
             :root {
                 --color-primary: ${colors.primary || '#3b82f6'};
                 --color-background: ${colors.background || '#ffffff'};
                 --color-card: ${colors.card || '#f8fafc'};
                 --color-text: ${colors.text || '#1f2937'};
                 --color-border: ${colors.border || '#e5e7eb'};
                 --color-notification: ${colors.notification || '#ef4444'};
             }
             
             ${tailwindCss}
         </style>
         ${bibleChapterStyles(colors, containerWidth, showReadingTime, fontSize)}
    </head>
`;

const createHtmlBody = (content: string, initialScrollIndex: number = 0, chapterNumber: number = 1) => `
    <body class="p-0 m-0 text-theme-text bg-theme-background select-none overflow-x-hidden">
    <div class="container relative h-screen overflow-y-auto pt-[70px] pb-[100px]" id="chapterContainer">
        <!-- Chapter Header -->
        <div class="sticky top-0 z-10 backdrop-blur-sm px-4 pt-3 my-2">
            <h1 class="text-2xl font-bold text-theme-text text-center">Capítulo ${chapterNumber}</h1>
        </div>
        ${content}
    </div>
        
        <script>
            let lastScrollTime = 0;
            let lastOffset = 0;
            let topVerseRef = null;
            let intersectionObserver = null;
            
            // Initial scroll functionality
            function performInitialScroll() {
                const verseNumber = ${initialScrollIndex};
                if (verseNumber > 1) {
                    const verseElement = document.querySelector(\`[data-verse-number="\${verseNumber}"]\`);
                    if (verseElement) {
                        verseElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            }
            
            // Initialize intersection observer
            function initIntersectionObserver() {
                intersectionObserver = new IntersectionObserver(
                    (entries) => {
                        const visibleEntries = entries.filter(entry => entry.isIntersecting);
                        if (visibleEntries.length > 0) {
                            const topEntry = visibleEntries.reduce((prev, current) => {
                                return (current.intersectionRatio > prev.intersectionRatio) ? current : prev;
                            });
                            
                            const verseElement = topEntry.target;
                            const verseNumber = parseInt(verseElement.dataset.verseNumber || '0');
                            
                            if (verseNumber && topVerseRef !== verseNumber) {
                                topVerseRef = verseNumber;
                                // Send message to React Native
                                window.ReactNativeWebView.postMessage(JSON.stringify({
                                    type: 'verseInView',
                                    verseNumber: verseNumber
                                }));
                            }
                        }
                    },
                    {
                        threshold: [0.5],
                        rootMargin: '0px'
                    }
                );
                
                // Observe all verse elements
                document.querySelectorAll('[data-verse-number]').forEach(el => {
                    intersectionObserver.observe(el);
                });
            }
            
            // Handle scroll events
            function handleScroll(event) {
                const now = Date.now();
                const minScrollTime = 50;
                
                if (now - lastScrollTime < minScrollTime) {
                    return;
                }
                
                const currentOffset = event.target.scrollTop;
                const direction = currentOffset > lastOffset ? "down" : "up";
                
                if (Math.abs(currentOffset - lastOffset) > 10) {
                    lastOffset = currentOffset;
                    lastScrollTime = now;
                    
                    // Send scroll message to React Native
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'scroll',
                        direction: direction
                    }));
                }
            }
            
            // Handle verse click
            function handleVerseClick(element, verseNumber) {
                element.classList.toggle('tapped');
                
                // Send verse click message
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'verseClick',
                    verseNumber: verseNumber
                }));
            }
            
            // Handle verse long press
            function handleVerseLongPress(element, event) {
                event.preventDefault();
                const actionsElement = element.querySelector('.verse-actions');
                if (actionsElement) {
                    actionsElement.classList.toggle('show');
                }
            }
            
            // Handle verse text click
            function handleVerseTextClick(event, verseNumber) {
                event.stopPropagation();
            }
            
            // Handle strong word click
            function handleStrongWordClick(event, strongNumber) {
                event.stopPropagation();
                
                // Send strong word click message
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'strongWordClick',
                    data: { strongNumber: strongNumber }
                }));
            }
            
            // Handle verse action
            function handleVerseAction(action, verseNumber) {
                const verseElement = document.querySelector(\`[data-verse-number="\${verseNumber}"]\`);
                const verseData = verseElement ? JSON.parse(verseElement.dataset.verseData || '{}') : {};
                
                // Send verse action message
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'verseAction',
                    action: action,
                    item: verseData
                }));
            }
            
            // Initialize when DOM is loaded
            document.addEventListener('DOMContentLoaded', function() {
                const container = document.getElementById('chapterContainer');
                if (container) {
                    container.addEventListener('scroll', handleScroll, { passive: true });
                }
                
                initIntersectionObserver();
                
                // Perform initial scroll after a short delay to ensure content is rendered
                setTimeout(performInitialScroll, 100);
                
                // Send initial height
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'height',
                    height: document.body.scrollHeight
                }));
            });
            
            // Send height when content changes
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'height',
                height: document.body.scrollHeight
            }));
        </script>
    </body>
`;

// Verse rendering functions
const createVerseNumber = (verse: number, isFavorite: boolean) => `
    <span class="text-theme-notification font-bold inline-flex items-center py-1 rounded-full">
        ${isFavorite ? '<span class="text-yellow-400 mr-1 text-xs">★</span>' : ""}
        ${verse}
    </span>
`;

const createVerseActions = (verse: number) => `
    <div class="verse-actions hidden overflow-x-auto gap-3 mt-2 -mx-8 px-8 py-2" id="actions-${verse}">
        <button class="flex flex-col items-center justify-center bg-transparent border-none cursor-pointer transition-all duration-200 min-w-[60px] hover:bg-theme-card/50 rounded-lg p-2 hover:scale-105 active:scale-95" onclick="handleVerseAction('favorite', ${verse})">
            <div class="w-8 h-8 mb-1 text-yellow-400">⭐</div>
            <div class="text-xs text-theme-text font-medium">Favorito</div>
        </button>
        <button class="flex flex-col items-center justify-center bg-transparent border-none cursor-pointer transition-all duration-200 min-w-[60px] hover:bg-theme-card/50 rounded-lg p-2 hover:scale-105 active:scale-95" onclick="handleVerseAction('interlinear', ${verse})">
            <div class="w-8 h-8 mb-1 text-blue-500">📖</div>
            <div class="text-xs text-theme-text font-medium">Interlinear</div>
        </button>
        <button class="flex flex-col items-center justify-center bg-transparent border-none cursor-pointer transition-all duration-200 min-w-[60px] hover:bg-theme-card/50 rounded-lg p-2 hover:scale-105 active:scale-95" onclick="handleVerseAction('annotate', ${verse})">
            <div class="w-8 h-8 mb-1 text-green-500">✏️</div>
            <div class="text-xs text-theme-text font-medium">Anotar</div>
        </button>
        <button class="flex flex-col items-center justify-center bg-transparent border-none cursor-pointer transition-all duration-200 min-w-[60px] hover:bg-theme-card/50 rounded-lg p-2 hover:scale-105 active:scale-95" onclick="handleVerseAction('compare', ${verse})">
            <div class="w-8 h-8 mb-1 text-purple-500">🔄</div>
            <div class="text-xs text-theme-text font-medium">Comparar</div>
        </button>
        <button class="flex flex-col items-center justify-center bg-transparent border-none cursor-pointer transition-all duration-200 min-w-[60px] hover:bg-theme-card/50 rounded-lg p-2 hover:scale-105 active:scale-95" onclick="handleVerseAction('memorize', ${verse})">
            <div class="w-8 h-8 mb-1 text-pink-500">🧠</div>
            <div class="text-xs text-theme-text font-medium">Memorizar</div>
        </button>
    </div>
`;

const createInterlinearVerse = (item: IBookVerse, verseKey: string) => `
    <div class="p-4 border border-theme-border rounded-lg my-2 bg-theme-background shadow-sm hover:shadow-md transition-shadow duration-200" data-verse-number="${item.verse
    }" data-verse-key="${verseKey}">
        <div class="text-theme-notification font-bold mr-2 inline-flex items-center mb-2 text-sm bg-theme-notification/10 px-2 py-1 rounded-full">
            ${item.is_favorite ? '<span class="text-yellow-400 mr-1 text-xs">★</span>' : ""}
            ${item.verse}
        </div>
        <div class="text-theme-text leading-relaxed">${item.text}</div>
    </div>
`;

const createRegularVerse = (item: IBookVerse, verseKey: string) => `
    <div class="py-2 px-8 my-0.5 cursor-pointer relative overflow-hidden w-full transition-colors duration-200 hover:bg-theme-notification/20 active:bg-theme-notification/30" 
         data-verse-number="${item.verse}" 
         data-verse-key="${verseKey}"
         data-verse-data='${JSON.stringify(item)}'
         onclick="handleVerseClick(this, ${item.verse})"
         oncontextmenu="handleVerseLongPress(this, event)">
        ${createVerseNumber(item.verse, item.is_favorite)}
        <span class="text-theme-text cursor-pointer select-text" onclick="handleVerseTextClick(event, ${item.verse
    })">
            ${getVerseTextRaw(item.text)}
        </span>
        ${createVerseActions(item.verse)}
    </div>
`;

const createLoadingState = () => `
    <div class="flex flex-col items-center justify-center p-12 mt-24">
        <div class="text-6xl mb-4 animate-pulse">⏳</div>
        <div class="text-lg text-theme-text font-medium">Cargando...</div>
        <div class="mt-2 text-sm text-theme-text/70">Preparando el contenido</div>
    </div>
`;

const renderVerses = (
    data: IBookVerse[],
    isInterlinear: boolean,
    isSplit: boolean
) => {
    if (data.length === 0) {
        return createLoadingState();
    }

    return data
        .map((item) => {
            const verseKey = `${item.book_number}-${item.chapter}-${item.verse}`;

            if (isInterlinear && !isSplit) {
                return createInterlinearVerse(item, verseKey);
            }

            return createRegularVerse(item, verseKey);
        })
        .join("");
};

type TBibleChapterHtmlTemplateProps = {
    data: IBookVerse[];
    theme?: any;
    width?: number;
    isSplit?: boolean;
    isInterlinear?: boolean;
    fontSize?: number;
    initialScrollIndex?: number;
};

export const bibleChapterHtmlTemplate = ({
    data,
    theme,
    width,
    isSplit,
    isInterlinear,
    fontSize,
    initialScrollIndex = 0,
}: TBibleChapterHtmlTemplateProps) => {
    const colors = theme?.colors;
    const containerWidth = width || "100%";
    const showReadingTime = !isInterlinear;
    const chapterNumber = data[0]?.chapter || 1;

    const versesContent = renderVerses(
        data,
        isInterlinear || false,
        isSplit || false
    );

    return `
    <!DOCTYPE html>
    <html>
        ${createHtmlHead(
        chapterNumber,
        colors,
        containerWidth,
        showReadingTime,
        fontSize || 16
    )}
        ${createHtmlBody(versesContent, initialScrollIndex, chapterNumber)}
    </html>
    `;
};
