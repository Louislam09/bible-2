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
            * {
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Georgia', 'Times New Roman', serif;
                font-size: ${fontSize}px;
                padding: 0;
                margin: 0;
                line-height: 1.8;
                color: ${colors.text};
                background: ${colors.background};
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
                overflow-x: hidden;
            }
            
            .container {
                width: ${containerWidth};
                height: 100vh;
                overflow-y: auto;
                position: relative;
                padding-top: 70px;
                padding-bottom: 100px;
            }
            
            .reading-time {
                display: ${showReadingTime ? "flex" : "none"};
                flex-direction: row;
                align-items: center;
                justify-content: flex-end;
                padding-right: 16px;
                width: 100%;
                margin-bottom: 20px;
            }
            
            .reading-time-icon {
                width: 14px;
                height: 14px;
                margin-right: 4px;
                color: ${colors.notification};
            }
            
            .reading-time-text {
                color: ${colors.text};
                font-size: 14px;
            }
            
            .verse {
                padding: 8px 32px;
                margin: 2px 0;
                cursor: pointer;
                position: relative;
                overflow: hidden;
                width: 100%;
                transition: background-color 0.2s ease;
            }
            
            .verse:hover {
                background-color: ${colors.notification}20;
            }
            
            .verse.tapped {
                background-color: ${colors.notification}20;
            }
            
            .verse-number {
                color: ${colors.notification};
                font-weight: bold;
                margin-right: 8px;
                display: inline-flex;
                align-items: center;
            }
            
            .verse-text {
                color: ${colors.text};
                letter-spacing: 2px;
            }
            
            .verse-actions {
                display: none;
                overflow-x: auto;
                gap: 12px;
                margin-top: 8px;
                margin-left: -32px;
                margin-right: -32px;
                padding: 0 32px;
            }
            
            .verse-actions.show {
                display: flex;
            }
            
            .action-button {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background: none;
                border: none;
                cursor: pointer;
                transition: color 0.2s ease;
                min-width: 60px;
            }
            
            .action-button:hover {
                opacity: 0.7;
            }
            
            .action-icon {
                width: 30px;
                height: 30px;
                margin-bottom: 4px;
            }
            
            .action-text {
                font-size: 12px;
                color: ${colors.text};
            }
            
            .strong-word {
                color: ${colors.notification};
                cursor: pointer;
                text-decoration: underline;
            }
            
            .strong-word:hover {
                opacity: 0.7;
            }
            
            .favorite-star {
                color: #ffd41d;
                margin-right: 4px;
            }
            
            .interlinear-verse {
                padding: 16px;
                border: 1px solid ${colors.border};
                border-radius: 8px;
                margin: 8px 0;
                background: ${colors.background};
            }
            
            .loading {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 48px;
                margin-top: 100px;
            }
            
            .loading-text {
                margin-top: 8px;
                font-size: 16px;
                color: ${colors.text};
            }
            
            /* Scrollbar styling */
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

const createHtmlBody = (content: string, initialScrollIndex: number = 0) => `
    <body>
    <div class="container" id="chapterContainer">
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
                if (verseNumber > 0) {
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
    <span class="verse-number">
        ${isFavorite ? '<span class="favorite-star">★</span>' : ""}
        ${verse}&nbsp;
    </span>
`;

const createVerseActions = (verse: number) => `
    <div class="verse-actions" id="actions-${verse}">
        <button class="action-button" onclick="handleVerseAction('favorite', ${verse})">
            <div class="action-icon">⭐</div>
            <div class="action-text">Favorito</div>
        </button>
        <button class="action-button" onclick="handleVerseAction('interlinear', ${verse})">
            <div class="action-icon">📖</div>
            <div class="action-text">Interlinear</div>
        </button>
        <button class="action-button" onclick="handleVerseAction('annotate', ${verse})">
            <div class="action-icon">✏️</div>
            <div class="action-text">Anotar</div>
        </button>
        <button class="action-button" onclick="handleVerseAction('compare', ${verse})">
            <div class="action-icon">🔄</div>
            <div class="action-text">Comparar</div>
        </button>
        <button class="action-button" onclick="handleVerseAction('memorize', ${verse})">
            <div class="action-icon">🧠</div>
            <div class="action-text">Memorizar</div>
        </button>
    </div>
`;

const createInterlinearVerse = (item: IBookVerse, verseKey: string) => `
    <div class="interlinear-verse" data-verse-number="${item.verse
    }" data-verse-key="${verseKey}">
        <div class="verse-number">
            ${item.is_favorite ? '<span class="favorite-star">★</span>' : ""}
            ${item.verse}&nbsp;
        </div>
        <div class="verse-text">${item.text}</div>
    </div>
`;

const createRegularVerse = (item: IBookVerse, verseKey: string) => `
    <div class="verse" 
         data-verse-number="${item.verse}" 
         data-verse-key="${verseKey}"
         data-verse-data='${JSON.stringify(item)}'
         onclick="handleVerseClick(this, ${item.verse})"
         oncontextmenu="handleVerseLongPress(this, event)">
        ${createVerseNumber(item.verse, item.is_favorite)}
        <span class="verse-text" onclick="handleVerseTextClick(event, ${item.verse
    })">
            ${getVerseTextRaw(item.text)}
        </span>
        ${createVerseActions(item.verse)}
    </div>
`;

const createLoadingState = () => `
    <div class="loading">
        <div>⏳</div>
        <div class="loading-text">Cargando...</div>
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
        ${createHtmlBody(versesContent, initialScrollIndex)}
    </html>
    `;
};
