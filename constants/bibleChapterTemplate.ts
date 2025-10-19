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
                line-height: 1.5;
                letter-spacing: 2px;
            }
            
            .container {
                width: ${containerWidth};
            }
            
            .strong-word {
                transition: all 0.2s ease;
                cursor: pointer;
                user-select: none;
            }
            
            .strong-word:hover {
                opacity: 0.7;
                transform: scale(1.02);
            }
            
            .strong-word:active {
                transform: scale(0.98);
            }
            
            /* Verse toggle styles */
            .verse-content, .verse-strong-content {
                transition: opacity 0.3s ease;
            }
            
            .verse-strong-content.hidden {
                display: none;
            }
            
            .verse-content.hidden {
                display: none;
            }
            
            /* Hover effect for verses */
            [data-verse-mode] {
                transition: all 0.2s ease;
            }
            
            [data-verse-mode]:hover {
                transform: translateX(2px);
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
            
            /* Action buttons styling */
            .verse-actions {
                background: rgba(0, 0, 0, 0.1) !important;
                border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
                padding: 8px 12px !important;
                margin-top: 8px !important;
                display: none !important;
                flex-direction: row !important;
                justify-content: flex-start !important;
                align-items: center !important;
                gap: 16px !important;
                overflow-x: auto !important;
                overflow-y: hidden !important;
                white-space: nowrap !important;
                scrollbar-width: thin !important;
                scrollbar-color: rgba(255, 255, 255, 0.3) transparent !important;
            }
            
            .verse-actions::-webkit-scrollbar {
                height: 4px !important;
            }
            
            .verse-actions::-webkit-scrollbar-track {
                background: transparent !important;
            }
            
            .verse-actions::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.3) !important;
                border-radius: 2px !important;
            }
            
            .verse-actions::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.5) !important;
            }
            
            .action-btn {
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                justify-content: center !important;
                background: transparent !important;
                border: none !important;
                cursor: pointer !important;
                transition: all 0.2s ease !important;
                padding: 4px 8px !important;
                min-width: 50px !important;
                flex-shrink: 0 !important;
                color: rgba(255, 255, 255, 0.8) !important;
            }
            
            .action-btn:hover {
                color: rgba(255, 255, 255, 1) !important;
                transform: scale(1.05) !important;
            }
            
            .action-btn:active {
                transform: scale(0.95) !important;
            }
            
            .action-icon {
                font-size: 20px !important;
                margin-bottom: 4px !important;
            }
            
            .action-label {
                font-size: 10px !important;
                text-align: center !important;
                line-height: 1.2 !important;
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
        <!-- Lucide Icons -->
        <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
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
            
            // Handle strong word click
            function handleStrongWordClick(event, strongNumber) {
                event.stopPropagation();
                event.preventDefault();
                
                // Add visual feedback
                const element = event.target;
                element.style.opacity = '0.5';
                setTimeout(() => {
                    element.style.opacity = '';
                }, 150);
                
                // Get verse data to determine cognate
                const verseElement = element.closest('[data-verse-number]');
                const verseData = verseElement ? JSON.parse(verseElement.dataset.verseData || '{}') : {};
                const bookNumber = verseData.book_number || 0;
                
                // Determine cognate based on book number (same logic as Verse.tsx)
                const NT_BOOK_NUMBER = 470;
                const cognate = bookNumber < NT_BOOK_NUMBER ? "H" : "G";
                const cognateStrongNumber = cognate + strongNumber;
                
                // Send strong word click message
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'strongWordClick',
                    data: { 
                        tagValue: cognateStrongNumber,
                        word: element.textContent,
                        verseNumber: verseElement?.getAttribute('data-verse-number')
                    },
                    verseData: verseData
                }));
            }
            
            // Handle strong word keyboard interaction
            function handleStrongWordKeydown(event, strongNumber) {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleStrongWordClick(event, strongNumber);
                }
            }
            
            // Toggle verse mode between regular and Strong's numbers
            function toggleVerseMode(verseElement, verseKey) {
                const currentMode = verseElement.getAttribute('data-verse-mode');
                const regularContent = verseElement.querySelector('.verse-content');
                const strongContent = verseElement.querySelector('.verse-strong-content');
                
                if (currentMode === 'regular') {
                    // Switch to Strong's mode
                    regularContent.classList.add('hidden');
                    strongContent.classList.remove('hidden');
                    verseElement.setAttribute('data-verse-mode', 'strong');
                    
                    // Add visual indicator use theme colors from variables
                    verseElement.style.borderLeft = "3px solid var(--color-notification)";
                } else {
                    // Switch to regular mode
                    regularContent.classList.remove('hidden');
                    strongContent.classList.add('hidden');
                    verseElement.setAttribute('data-verse-mode', 'regular');
                    
                    // Remove visual indicator
                    verseElement.style.backgroundColor = '';
                    verseElement.style.borderLeft = '';
                }
                
                // Send toggle message to React Native
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'verseModeToggle',
                    data: { 
                        verseKey: verseKey,
                        mode: currentMode === 'regular' ? 'strong' : 'regular',
                        verseNumber: verseElement.getAttribute('data-verse-number')
                    }
                }));
            }
            
            // Track selected verses in WebView (similar to React Native state)
            let selectedVerses = new Map();
            
            // Handle verse long press to show actions
            function handleVerseLongPress(verseElement, verseKey) {
                const verseData = JSON.parse(verseElement.dataset.verseData || '{}');
                const verseNumber = parseInt(verseElement.getAttribute('data-verse-number'));
                
                // Toggle verse in selectedVerses Map (same logic as React Native)
                if (selectedVerses.has(verseNumber)) {
                    selectedVerses.delete(verseNumber);
                } else {
                    selectedVerses.set(verseNumber, verseData);
                }
                
                // Update action button visibility
                updateActionButtonVisibility(verseNumber, selectedVerses.has(verseNumber));
                
                // Send long press message to React Native for other purposes
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'verseLongPress',
                    data: { 
                        verseKey: verseKey,
                        verseNumber: verseNumber,
                        item: verseData
                    }
                }));
            }
            
            // Function to update action button visibility based on state
            function updateActionButtonVisibility(verseNumber, isVisible) {
                const verseElement = document.querySelector(\`[data-verse-number="\${verseNumber}"]\`);
                if (!verseElement) return;
                
                const actionButtons = verseElement.querySelector('.verse-actions');
                if (!actionButtons) return;
                
                if (isVisible) {
                    actionButtons.style.setProperty('display', 'flex', 'important');
                    actionButtons.style.flexDirection = 'row';
                    actionButtons.style.justifyContent = 'flex-start';
                    actionButtons.style.alignItems = 'center';
                    actionButtons.style.gap = '16px';
                    actionButtons.style.flexWrap = 'nowrap';
                    actionButtons.style.padding = '8px 12px';
                    actionButtons.style.marginTop = '8px';
                    actionButtons.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
                    actionButtons.style.borderTop = '1px solid rgba(255, 255, 255, 0.1)';
                    actionButtons.style.overflowX = 'auto';
                    actionButtons.style.overflowY = 'hidden';
                    actionButtons.style.whiteSpace = 'nowrap';
                    
                    // Initialize Lucide icons
                    if (typeof lucide !== 'undefined') {
                        lucide.createIcons();
                    }
                } else {
                    actionButtons.style.setProperty('display', 'none', 'important');
                }
            }
            
            // Handle verse action clicks
            function handleVerseAction(action, verseElement, verseKey) {
                const verseData = JSON.parse(verseElement.dataset.verseData || '{}');
                const verseNumber = parseInt(verseElement.getAttribute('data-verse-number'));
                
                // Hide action buttons for this verse after action is clicked
                selectedVerses.delete(verseNumber);
                updateActionButtonVisibility(verseNumber, false);
                
                // Send action message to React Native
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'verseAction',
                    data: { 
                        action: action,
                        verseKey: verseKey,
                        verseNumber: verseNumber,
                        item: verseData
                    }
                }));
            }
            
            // Handle verse context menu (right-click or long press)
            function handleVerseContextMenu(verseElement, verseKey, event) {
                event.preventDefault(); // Prevent default context menu
                handleVerseLongPress(verseElement, verseKey);
            }
            
            // Function to hide all action buttons (can be called from outside)
            function hideAllActionButtons() {
                selectedVerses.clear();
                document.querySelectorAll('.verse-actions').forEach(btn => {
                    btn.style.setProperty('display', 'none', 'important');
                });
            }
            
            // Handle state updates from React Native
            function handleStateUpdate(message) {
                if (message.type === 'updateActionVisibility') {
                    const { verseNumber, isVisible } = message.data;
                    updateActionButtonVisibility(verseNumber, isVisible);
                } else if (message.type === 'clearAllActions') {
                    hideAllActionButtons();
                }
            }
            
            // Function to check if verse should show actions (similar to verseShowAction in Verse.tsx)
            function shouldShowActions(verseNumber) {
                return selectedVerses.has(verseNumber);
            }
            
            // Make functions available globally for React Native to call
            window.updateActionButtonVisibility = updateActionButtonVisibility;
            window.hideAllActionButtons = hideAllActionButtons;
            window.shouldShowActions = shouldShowActions;
            
            // Initialize when DOM is loaded
            document.addEventListener('DOMContentLoaded', function() {
                const container = document.getElementById('chapterContainer');
                if (container) {
                    container.addEventListener('scroll', handleScroll, { passive: true });
                }
                
                // Initialize Lucide icons
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
                
                // Perform initial scroll after a short delay to ensure content is rendered
                setTimeout(performInitialScroll, 100);
                
                // Send initial height
                // window.ReactNativeWebView.postMessage(JSON.stringify({
                //     type: 'height',
                //     height: document.body.scrollHeight
                // }));
            });
            
            // Send height when content changes
            // window.ReactNativeWebView.postMessage(JSON.stringify({
            //     type: 'height',
            //     height: document.body.scrollHeight
            // }));
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

// Parse verse text with Strong's numbers for clickable words
// This function converts the DomClickableVerse component logic into a template string
// that can be used directly in the HTML template for better performance
const parseVerseTextWithStrongs = (text: string): string => {
    if (!text || typeof text !== 'string') {
        return '';
    }

    try {
        // More robust regex pattern for Strong's numbers
        const strongPattern = /<S>(\d+)<\/S>/g;
        const segments = text.split(strongPattern);

        let result = '';
        let i = 0;

        while (i < segments.length) {
            const segment = segments[i];

            // Check if next segment is a Strong's number
            if (i + 1 < segments.length && /^\d+$/.test(segments[i + 1])) {
                const strongNumber = segments[i + 1];

                // Process the text segment to find words
                const words = segment.trim().split(/\s+/).filter(w => w.length > 0);

                if (words.length > 0) {
                    // All words except the last are non-clickable
                    for (let j = 0; j < words.length - 1; j++) {
                        result += cleanWord(words[j]) + ' ';
                    }

                    // Last word gets the Strong's number and becomes clickable
                    const lastWord = words[words.length - 1];
                    if (lastWord) {
                        const cleanLastWord = cleanWord(lastWord);
                        result += `<span class="strong-word cursor-pointer bg-white/10 px-1 py-0.5 rounded-md border border-white/10 text-theme-notification hover:opacity-70 transition-opacity" 
                                     onclick="handleStrongWordClick(event, '${strongNumber}')" 
                                     onkeydown="handleStrongWordKeydown(event, '${strongNumber}')"
                                     role="button" 
                                     tabindex="0"
                                     aria-label="Strong's number ${strongNumber} for word ${cleanLastWord}"
                                     data-strong="${strongNumber}">${cleanLastWord}</span> `;
                    }
                }

                i += 2; // Skip both the text and the Strong's number
            } else {
                // Regular text without Strong's number
                const words = segment.trim().split(/\s+/).filter(w => w.length > 0);
                words.forEach(word => {
                    if (word) {
                        result += cleanWord(word) + ' ';
                    }
                });
                i++;
            }
        }

        return result.trim();
    } catch (error) {
        console.error('Error parsing verse text:', error);
        // Fallback: return plain text
        return text.replace(/<.*?>|<\/.*?> |<.*?>.*?<\/.*?>|\[.*?\]/gi, "").replace(/\s{2,}/g, " ");
    }
};

// Helper function to clean word from punctuation artifacts
const cleanWord = (word: string): string => {
    return word.replace(/[<>]/g, '').trim();
};

// Parse verse text to regular text without Strong's numbers
const parseVerseTextRegular = (text: string): string => {
    if (!text || typeof text !== 'string') {
        return '';
    }

    try {
        // Remove Strong's number tags and clean up the text
        return text
            .replace(/<S>\d+<\/S>/g, '') // Remove Strong's number tags
            .replace(/\s{2,}/g, ' ') // Replace multiple spaces with single space
            .trim();
    } catch (error) {
        console.error('Error parsing regular verse text:', error);
        // Fallback: return plain text
        return text.replace(/<.*?>|<\/.*?> |<.*?>.*?<\/.*?>|\[.*?\]/gi, "").replace(/\s{2,}/g, " ");
    }
};




const createRegularVerse = (item: IBookVerse, verseKey: string) => `
    <div class="py-2 px-8 my-0.5 overflow-hidden w-full cursor-pointer transition-colors duration-200" 
         data-verse-number="${item.verse}" 
         data-verse-key="${verseKey}"
         data-verse-data='${JSON.stringify(item)}'
         data-verse-mode="regular"
         onclick="toggleVerseMode(this, '${verseKey}')"
         oncontextmenu="handleVerseContextMenu(this, '${verseKey}', event)"
         style="position: relative; z-index: 1;">
        ${createVerseNumber(item.verse, item.is_favorite)}
        <span class="text-theme-text select-text verse-content">
            ${parseVerseTextRegular(item.text)}
        </span>
        <span class="text-theme-text select-text verse-strong-content hidden">
            ${parseVerseTextWithStrongs(item.text)}
        </span>
        
        <!-- Action buttons (hidden by default, shown on long press) -->
        <div class="verse-actions" style="display: none;">
            <button class="action-btn" onclick="handleVerseAction('copy', this.closest('[data-verse-key]'), '${verseKey}')">
                <i data-lucide="copy" class="action-icon"></i>
                <div class="action-label">Copiar</div>
            </button>
              <button class="action-btn" onclick="handleVerseAction('image', this.closest('[data-verse-key]'), '${verseKey}')">
                <i data-lucide="image" class="action-icon"></i>
                <div class="action-label">Imagen</div>
            </button>
            <button class="action-btn" onclick="handleVerseAction('interlinear', this.closest('[data-verse-key]'), '${verseKey}')">
                <i data-lucide="book-open" class="action-icon"></i>
                <div class="action-label">Interlinear</div>
            </button>
            <button class="action-btn" onclick="handleVerseAction('quote', this.closest('[data-verse-key]'), '${verseKey}')">
                <i data-lucide="quote" class="action-icon"></i>
                <div class="action-label">Cita</div>
            </button>
            <button class="action-btn" onclick="handleVerseAction('note', this.closest('[data-verse-key]'), '${verseKey}')">
                <i data-lucide="pen-tool" class="action-icon"></i>
                <div class="action-label">Anotar</div>
            </button>
            <button class="action-btn" onclick="handleVerseAction('favorite', this.closest('[data-verse-key]'), '${verseKey}')">
                <i data-lucide="${item.is_favorite ? 'star' : 'star-off'}" class="action-icon"></i>
                <div class="action-label">Favorito</div>
            </button>
            <button class="action-btn" onclick="handleVerseAction('memorize', this.closest('[data-verse-key]'), '${verseKey}')">
                <i data-lucide="brain" class="action-icon"></i>
                <div class="action-label">Memorizar</div>
            </button>
            <button class="action-btn" onclick="handleVerseAction('compare', this.closest('[data-verse-key]'), '${verseKey}')">
                <i data-lucide="git-compare" class="action-icon"></i>
                <div class="action-label">Comparar</div>
            </button>
        </div>
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
