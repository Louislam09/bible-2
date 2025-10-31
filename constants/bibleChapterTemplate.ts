import { IBookVerse } from "@/types";
import { lucideIcons } from "@/utils/lucideIcons";
import { DB_BOOK_NAMES } from "./BookNames";
import { Platform } from "react-native";
import { bibleState$ } from "@/state/bibleState";
import { storedData$ } from "@/context/LocalstoreContext";

export const generateAssetFontCss = ({
    fontFileName,
    extension = 'ttf',
}: {
    fontFileName: string;
    extension?: string;
}) => {
    const fileUri = Platform.select({
        ios: `${fontFileName}.${extension}`,
        android: `file:///android_asset/fonts/${fontFileName}.${extension}`,
    });

    return `@font-face {
        font-family: '${fontFileName}';
        src: local('${fontFileName}'), url('${fileUri}') ;
    }`;
};

const bibleChapterStyles = (
    theme: any,
    containerWidth: number,
    showReadingTime: boolean,
    fontSize: number
) => `
         <style>
            /* Custom styles that can't be replaced with Tailwind */
            body {
                font-family: 'Quicksand', 'Noto Sans Hebrew', 'Georgia', 'Times New Roman', serif;
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
                background: ${theme.colors.notification}40;
                border-radius: 3px;
            }
            
            .container::-webkit-scrollbar-thumb:hover {
                background: ${theme.colors.notification}60;
            }
            
            /* Action buttons styling */
            .verse-actions {
                background: transparent;
                padding: 8px 12px !important;
                margin-top: 8px !important;
                margin-left: 32px !important;
                margin-right: 32px !important;
                display: none !important;
                flex-direction: row !important;
                justify-content: flex-start !important;
                align-items: center !important;
                gap: 10px !important;
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
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                width: 30px !important;
                height: 30px !important;
                margin-bottom: 4px !important;
            }
            
            .action-icon svg {
                width: 100% !important;
                height: 100% !important;
            }
            
            .action-label {
                font-size: 16px !important;
                text-align: center !important;
                line-height: 1.2 !important;
            }
            
            /* Strong's word inline badge system */
            .strong-word-container {
                display: inline-flex !important;
                align-items: center !important;
                gap: 4px !important;
                background: rgba(255, 255, 255, 0.05) !important;
                padding: 2px 6px !important;
                border-radius: 8px !important;
                border: 1px solid rgba(255, 255, 255, 0.1) !important;
                transition: all 0.2s ease !important;
            }
            
            .strong-word-container:hover {
                background: rgba(255, 255, 255, 0.1) !important;
                border-color: rgba(255, 255, 255, 0.2) !important;
                transform: translateY(-1px) !important;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
            }
            
            .regular-word-text {
                border-bottom: 2px solid  rgba(255, 255, 255, 0.2)  !important;
            }
            
        </style>
`;

// HTML document structure functions
const createHtmlHead = (
    chapterNumber: number,
    theme: any,
    containerWidth: any,
    showReadingTime: boolean,
    fontSize: number,
    tailwindScript?: string
) => `
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Capítulo ${chapterNumber}</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+Hebrew:wght@100..900&display=swap">
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400&display=swap">
        ${tailwindScript}
      
         <style>
             :root {
                --font-size: ${fontSize}px;
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
         </style>

           <style type="text/tailwindcss">
            @custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));
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
                /* Font size tokens */
                .text-font-xxs {  font-size: ${fontSize * 0.5}px;  }
                .text-font-xs {  font-size: ${fontSize * 0.6}px;  }
                .text-font-sm {  font-size: ${fontSize * 0.9}px;  }
                .text-font-base { font-size: ${fontSize * 1}px;  }
                .text-font-lg {  font-size: ${fontSize * 1.1}px;  }
                .text-font-xl {  font-size: ${fontSize * 1.2}px;  }
                .text-font-2xl {  font-size: ${fontSize * 1.3}px;  }
                .text-font-3xl {  font-size: ${fontSize * 1.4}px;  }
                .text-font-4xl {  font-size: ${fontSize * 1.5}px;  }
                .text-font-5xl {  font-size: ${fontSize * 1.6}px;  }
             
        </style>
         ${bibleChapterStyles(theme, containerWidth, showReadingTime, fontSize)}
    </head>
`;

const createHtmlBody = (content: string, initialScrollIndex: number = 0, chapterNumber: number = 1, showReadingTime: boolean) => `
    <body class="p-0 m-0 text-theme-text bg-theme-background select-none overflow-x-hidden ">
    <div class="container relative h-screen overflow-y-auto pt-[70px] pb-[100px] " id="chapterContainer">
        <!-- Chapter Header -->
        <div class="px-4 pt-3 my-2">
        <h1 class=" font-bold text-theme-text text-center text-font-xl">Capítulo ${chapterNumber}</h1>
        <p class="text-theme-text text-center text-font-xs mt-1 ${showReadingTime ? 'block' : 'hidden'}">Tiempo de lectura: ~ ${bibleState$.readingTimeData.top.get()} min(s)</p>
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

            // Handle regular word click
            function handleRegularWordClick(event, word) {
                event.stopPropagation();
                event.preventDefault();
                
                // Send regular word click message
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'regularWordClick',
                    data: word
                }));
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
                
                // Get the word text (handle both direct clicks and tooltip option clicks)
                let wordText = element.textContent;
                if (element.classList.contains('tooltip-option')) {
                    // If clicked from tooltip, get the parent word
                    const parentWord = element.closest('.strong-word-multiple');
                    wordText = parentWord ? parentWord.textContent.replace(/Strong's \d+/g, '').trim() : element.textContent;
                }
                
                // Send strong word click message
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'strongWordClick',
                    data: { 
                        tagValue: cognateStrongNumber,
                        word: wordText,
                        verseNumber: verseElement?.getAttribute('data-verse-number'),
                        selectedStrongNumber: strongNumber
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
               
                function handleMultiple(event, strongNumbersJson, word) {
                 event.stopPropagation();
                 event.preventDefault();
                alert('handleMultiple called with:');
                }
            
            // Handle multiple Strong's numbers click with proper event handling
            function handleMultipleStrongsClick(event, strongNumbersStr, word) {
                event.stopPropagation();
                event.preventDefault();
                
                // Add visual feedback
                const element = event.target;
                element.style.opacity = '0.5';
                setTimeout(() => {
                    element.style.opacity = '';
                }, 150);
                
                const strongNumbers = strongNumbersStr.split(',');
                
                // Get verse context
                const verseElement = event.target.closest('[data-verse-number]');
                const verseData = verseElement ? JSON.parse(verseElement.dataset.verseData || '{}') : {};
                
                // Send message to React Native to open bottom sheet
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'multipleStrongsClick',
                    data: {
                        word: word,
                        strongNumbers: strongNumbers,
                        verseNumber: verseElement?.getAttribute('data-verse-number'),
                        verseData: verseData
                    }
                }));
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
                
                const verseKey = verseElement.getAttribute('data-verse-key');
                const actionButtons = document.querySelector(\`.verse-actions[data-verse-key="\${verseKey}"]\`);
                if (!actionButtons) return;
                
                if (isVisible) {
                    actionButtons.style.setProperty('display', 'flex', 'important');
                    // Trigger animation after a small delay to ensure display is set
                    setTimeout(() => {
                        actionButtons.classList.remove('opacity-0', '-translate-y-2', 'scale-95');
                        actionButtons.classList.add('opacity-100', 'translate-y-0', 'scale-100');
                        
                        // Animate individual buttons
                        const buttons = actionButtons.querySelectorAll('.action-btn');
                        buttons.forEach(btn => {
                            btn.classList.remove('opacity-0', 'translate-y-5', 'scale-75');
                            btn.classList.add('opacity-100', 'translate-y-0', 'scale-100');
                        });
                    }, 10);
                } else {
                    // Reverse animation
                    actionButtons.classList.remove('opacity-100', 'translate-y-0', 'scale-100');
                    actionButtons.classList.add('opacity-0', '-translate-y-2', 'scale-95');
                    
                    const buttons = actionButtons.querySelectorAll('.action-btn');
                    buttons.forEach(btn => {
                        btn.classList.remove('opacity-100', 'translate-y-0', 'scale-100');
                        btn.classList.add('opacity-0', 'translate-y-5', 'scale-75');
                    });
                    
                    // Hide after animation completes
                    setTimeout(() => {
                        actionButtons.style.setProperty('display', 'none', 'important');
                    }, 300);
                }
            }
            
            // Handle verse action clicks
            function handleVerseAction(action, verseKey) {
                // Find the verse element by verseKey (now it's the inner div with the verse data)
                const verseElement = document.querySelector(\`[data-verse-key="\${verseKey}"][data-verse-number]\`);
                if (!verseElement) return;
                
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
                    // Reverse animation
                    btn.classList.remove('opacity-100', 'translate-y-0', 'scale-100');
                    btn.classList.add('opacity-0', '-translate-y-2', 'scale-95');
                    
                    const buttons = btn.querySelectorAll('.action-btn');
                    buttons.forEach(button => {
                        button.classList.remove('opacity-100', 'translate-y-0', 'scale-100');
                        button.classList.add('opacity-0', 'translate-y-5', 'scale-75');
                    });
                    
                    // Hide after animation completes
                    setTimeout(() => {
                        btn.style.setProperty('display', 'none', 'important');
                    }, 300);
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
            
            // Handle verse link clicks (converted from DomVerseTitle.tsx)
            function handleVerseLinkClick(bookNumber, bookName, chapter, verse, endVerse) {
                // Send verse link click message to React Native
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'verseLinkClick',
                    data: {
                        bookNumber: bookNumber,
                        bookName: bookName,
                        chapter: chapter,
                        verse: verse,
                        endVerse: endVerse
                    }
                }));
            }
            
            // Make functions available globally for React Native to call
            window.updateActionButtonVisibility = updateActionButtonVisibility;
            window.hideAllActionButtons = hideAllActionButtons;
            window.shouldShowActions = shouldShowActions;
            window.handleVerseLinkClick = handleVerseLinkClick;
            window.handleMultipleStrongsClick = handleMultipleStrongsClick;
            
            // Initialize when DOM is loaded
            document.addEventListener('DOMContentLoaded', function() {
                const container = document.getElementById('chapterContainer');
                if (container) {
                    container.addEventListener('scroll', handleScroll, { passive: true });
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

// Verse title rendering function (converted from DomVerseTitle.tsx)
const createVerseTitle = (subheading: string[], links: string) => {
    if (!subheading || subheading.length === 0 || subheading === null || subheading === undefined) {
        return '';
    }

    try {
        const [subTitle, link] = JSON.parse(subheading as any);
        const linkVerses = link
            ? link.split("—").map((linkVerse: any) => extractVersesInfo(linkVerse))
            : [];
        const verseLinks = links
            ? links.split(";").map((linkVerse: any) => extractVersesInfo(linkVerse))
            : [];
        const myLinks = links ? verseLinks : linkVerses;
        // // Check if subTitle is null, undefined, or empty
        if (!subTitle || subTitle === null || subTitle === undefined || subTitle.trim() === '') {
            return '';
        }

        const renderLinkItem = (verseInfo: any, index: number) => {
            const { bookNumber, chapter, verse, endVerse } = verseInfo;
            const bookName = DB_BOOK_NAMES.find(
                (x: any) => x.bookNumber === bookNumber
            )?.longName;

            if (!bookName) return '';
            // text-theme-text rounded-lg py-0.5 px-1.5 my-1 bg-theme-notification border border-theme-notification text-sm font-bold w-fit cursor-pointer hover:bg-theme-notification mx-4 transition-colors

            return `
          <div class="p-[1px] my-1 rounded-lg bg-linear-to-r  from-theme-notification via-theme-notification/50 to-theme-primary">
                <p class="text-theme-text rounded-lg py-1 px-1.5 text-font-xs font-bold w-fit cursor-pointer transition-colors bg-theme-background"
                onclick="handleVerseLinkClick(${bookNumber}, '${bookName}', ${chapter}, ${verse}, ${endVerse || 'null'})">
                    ${bookName} ${chapter}:${verse}${endVerse ? `-${endVerse}` : ''}
                </p>
                </div>
            `;
        };

        return `
            <div class="verse-title-container my-1">
                <h3 class="text-theme-notification px-4 text-center font-bold mb-2 text-font-lg">
                    ${subTitle}
                    </h3>
                <div class="flex flex-row gap-3 items-center flex-wrap px-4">
                    ${myLinks.map(renderLinkItem).join('')}
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error parsing verse title:', error);
        return '';
    }
};

function extractVersesInfo(input: string): any {
    // Updated regex to match both cases
    const regex = /<x>(\d+)\s+(\d+):(\d+)(?:-(\d+))?<\/x>/;
    const match = input.match(regex);

    if (match) {
        const [, book, chapter, startVerse, endVerse] = match;
        return {
            bookNumber: parseInt(book, 10),
            chapter: parseInt(chapter, 10),
            verse: parseInt(startVerse, 10),
            endVerse: endVerse ? parseInt(endVerse, 10) : "", // Handle optional end verse
        };
    } else {
        return {
            bookNumber: "",
            chapter: "",
            verse: "",
            endVerse: "",
        };
    }
}

// Verse rendering functions
const createVerseNumber = (verse: number, isFavorite: boolean) => `
    <span class="text-theme-notification font-bold inline-flex items-center py-1 rounded-full">
        ${isFavorite ? '<span class="text-yellow-400 mr-1 text-xs">★</span>' : ""}
        ${verse}
    </span>
`;

// Pre-process text to combine consecutive Strong's numbers
// This function detects patterns like <S>12312</S> <S>1234</S> <S>5678</S> and combines them into <S>12312, 1234, 5678</S>
const preprocessConsecutiveStrongs = (text: string): string => {
    if (!text || typeof text !== 'string') {
        return '';
    }

    try {
        // Pattern to match one or more consecutive Strong's numbers with optional whitespace between them
        const consecutiveStrongsPattern = /(<S>\d+<\/S>(?:\s*<S>\d+<\/S>)+)/g;

        let result = text;
        let match;

        // Find all sequences of consecutive Strong's numbers
        while ((match = consecutiveStrongsPattern.exec(result)) !== null) {
            const fullMatch = match[1];

            // Extract all Strong's numbers from the sequence
            const strongNumbers = fullMatch.match(/<S>(\d+)<\/S>/g);
            if (strongNumbers && strongNumbers.length > 1) {
                // Extract just the numbers and combine them
                const numbers = strongNumbers.map(s => s.replace(/<S>|<\/S>/g, ''));
                const combinedStrongs = numbers.join(', ');

                // Replace the entire sequence with combined version
                result = result.replace(fullMatch, `<S>${combinedStrongs}</S>`);
            }

            // Reset regex lastIndex to start from beginning for next iteration
            consecutiveStrongsPattern.lastIndex = 0;
        }

        return result;
    } catch (error) {
        console.error('Error preprocessing consecutive Strongs:', error);
        return text; // Return original text if preprocessing fails
    }
};

// Parse verse text with Strong's numbers for clickable words
// This function converts the DomClickableVerse component logic into a template string
// that can be used directly in the HTML template for better performance
// Enhanced to handle multiple consecutive Strong's numbers
const parseVerseTextWithStrongs = (text: string): string => {
    if (!text || typeof text !== 'string') {
        return '';
    }

    try {
        // Pre-process text to combine consecutive Strong's numbers
        const preprocessedText = preprocessConsecutiveStrongs(text);

        // More robust regex pattern for Strong's numbers
        const strongPattern = /<S>(\d+(?:,\s*\d+)*)<\/S>/g;
        const segments = preprocessedText.split(strongPattern);

        let result = '';
        let i = 0;

        while (i < segments.length) {
            const segment = segments[i];

            // Check if next segment is a Strong's number (including combined numbers with commas)
            if (i + 1 < segments.length && /^\d+(?:,\s*\d+)*$/.test(segments[i + 1])) {
                const strongNumber = segments[i + 1];

                // Process the text segment to find words
                const words = segment.trim().split(/\s+/).filter(w => w.length > 0);

                if (words.length > 0) {
                    // All words except the last are non-clickable
                    for (let j = 0; j < words.length - 1; j++) {
                        // result += cleanWord(words[j]) + ' ';
                        result += `<span class="regular-word-text text-theme-text cursor-pointer bg-white/10 border border-white/10 px-1 py-0.5 rounded-md hover:opacity-70 transition-opacity" onclick="handleRegularWordClick(event, '${cleanWord(words[j])}')">${cleanWord(words[j])}</span> `;
                    }

                    // Last word gets the Strong's number and becomes clickable
                    const lastWord = words[words.length - 1];
                    if (lastWord) {
                        const cleanLastWord = cleanWord(lastWord);
                        const strongNumbers = strongNumber.includes(',') ? strongNumber.split(',').map(n => n.trim()) : [strongNumber];

                        if (strongNumbers.length > 1) {
                            // Two or more Strong's numbers - show indicator and open bottom sheet
                            const strongNumbersStr = strongNumbers.join(',');
                            result += `<span class="border cursor-pointer px-1 py-0.5 m-1 rounded-md  dark:border-white/10 border-gray-300/70 text-theme-notification hover:opacity-70  border-b-2 border-b-theme-notification dark:border-b-theme-notification transition-opacity font-semibold dark:font-normal dark:bg-white/10 bg-gray-300/70 " 
                                         onclick="handleMultipleStrongsClick(event, '${strongNumbersStr}', '${cleanLastWord}')"
                                         title="Múltiples números de Strong: ${strongNumbers.join(', ')}">
                                         ${cleanLastWord}
                                       </span> `;
                        } else {
                            // Single Strong's number - normal behavior
                            result += `<span class="strong-word cursor-pointer px-1 py-0.5 rounded-md border dark:border-white/10 border-gray-300/70 text-theme-notification hover:opacity-70 transition-opacity font-semibold dark:font-normal dark:bg-white/10 bg-gray-300/70" 
                                         onclick="handleStrongWordClick(event, '${strongNumber}')" 
                                         onkeydown="handleStrongWordKeydown(event, '${strongNumber}')"
                                         role="button" 
                                         tabindex="0"
                                         aria-label="Número de Strong ${strongNumber} para la palabra ${cleanLastWord}"
                                         data-strong="${strongNumber}">${cleanLastWord}</span> `;
                        }
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
    <div class="verse-container" data-verse-key="${verseKey}">
        ${item.subheading && item.subheading !== null && item.subheading !== undefined ? createVerseTitle(item.subheading, '') : ''}
        <!-- Verse content -->
        <div class="py-2 px-8 my-0.5 overflow-hidden w-full cursor-pointer transition-colors duration-200" 
             data-verse-number="${item.verse}" 
             data-verse-key="${verseKey}"
             data-verse-data='${JSON.stringify(item)}'
             data-verse-mode="regular"
             onclick="toggleVerseMode(this, '${verseKey}')"
             oncontextmenu="handleVerseContextMenu(this, '${verseKey}', event)"
             style="position: relative; z-index: 1;">
            ${createVerseNumber(item.verse, item.is_favorite)}
            <span class="select-text verse-content font-semibold dark:font-normal text-theme-text">
                ${parseVerseTextRegular(item.text)}
            </span>
            <span class="text-theme-text select-text verse-strong-content hidden">
                ${parseVerseTextWithStrongs(item.text)}
            </span>
        </div>
        
        <!-- Action buttons (hidden by default, shown on long press) - Outside verse container -->
        <div class="verse-actions opacity-0 -translate-y-2 scale-95 transition-all duration-300 ease-out" data-verse-key="${verseKey}" style="display: none;">
            <button class="action-btn opacity-0 translate-y-5 scale-75 transition-all duration-300 ease-out delay-[50ms] hover:scale-105" onclick="handleVerseAction('copy', '${verseKey}')">
                <span class="action-icon" style="color: rgba(255, 255, 255, 0.8);">${lucideIcons.copy}</span>
                <div class="action-label">Copiar</div>
            </button>
            <button class="action-btn opacity-0 translate-y-5 scale-75 transition-all duration-300 ease-out delay-[100ms] hover:scale-105" onclick="handleVerseAction('image', '${verseKey}')">
                <span class="action-icon" style="color: #9dcd7d;">${lucideIcons.image}</span>
                <div class="action-label">Imagen</div>
            </button>
            <button class="action-btn opacity-0 translate-y-5 scale-75 transition-all duration-300 ease-out delay-[150ms] hover:scale-105" onclick="handleVerseAction('interlinear', '${verseKey}')">
                <span class="action-icon" style="color: #f79c67;">${lucideIcons['book-open']}</span>
                <div class="action-label">Interlinear</div>
            </button>
         
            <button class="action-btn opacity-0 translate-y-5 scale-75 transition-all duration-300 ease-out delay-[200ms] hover:scale-105" onclick="handleVerseAction('quote', '${verseKey}')">
                <span class="action-icon" style="color: #CDAA7D;">${lucideIcons.quote}</span>
                <div class="action-label">Cita</div>
            </button>
            <button class="action-btn opacity-0 translate-y-5 scale-75 transition-all duration-300 ease-out delay-[225ms] hover:scale-105" onclick="handleVerseAction('commentary', '${verseKey}')">
                <span class="action-icon" style="color: #87c4ff;">${lucideIcons.messageSquare}</span>
                <div class="action-label">Comentarios</div>
            </button>
            <button class="action-btn opacity-0 translate-y-5 scale-75 transition-all duration-300 ease-out delay-[250ms] hover:scale-105" onclick="handleVerseAction('note', '${verseKey}')">
                <span class="action-icon" style="color: var(--color-notification);">${lucideIcons['notebook-pen']}</span>
                <div class="action-label">Anotar</div>
            </button>
            <button class="action-btn opacity-0 translate-y-5 scale-75 transition-all duration-300 ease-out delay-[300ms] hover:scale-105" onclick="handleVerseAction('favorite', '${verseKey}')">
                <span class="action-icon" style="color: ${item.is_favorite ? 'var(--color-notification)' : '#fedf75'};">${lucideIcons[item.is_favorite ? 'star' : 'star-off']}</span>
                <div class="action-label">Favorito</div>
            </button>
            <button class="action-btn opacity-0 translate-y-5 scale-75 transition-all duration-300 ease-out delay-[350ms] hover:scale-105" onclick="handleVerseAction('memorize', '${verseKey}')">
                <span class="action-icon" style="color: #f1abab;">${lucideIcons.brain}</span>
                <div class="action-label">Memorizar</div>
            </button>
            <button class="action-btn opacity-0 translate-y-5 scale-75 transition-all duration-300 ease-out delay-[400ms] hover:scale-105" onclick="handleVerseAction('compare', '${verseKey}')">
                <span class="action-icon" style="color: rgba(255, 255, 255, 0.8);">${lucideIcons['git-compare']}</span>
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
        .join("") + "<br />".repeat(7);
};

type TBibleChapterHtmlTemplateProps = {
    data: IBookVerse[];
    theme?: any;
    width?: number;
    isSplit?: boolean;
    isInterlinear?: boolean;
    fontSize?: number;
    initialScrollIndex?: number;
    tailwindScript?: string;
    showReadingTime: boolean
};

export const bibleChapterHtmlTemplate = ({
    data,
    theme,
    width,
    isSplit,
    isInterlinear,
    fontSize,
    initialScrollIndex = 0,
    tailwindScript,
    showReadingTime
}: TBibleChapterHtmlTemplateProps) => {
    const containerWidth = width || "100%";
    const chapterNumber = data[0]?.chapter || 1;

    const versesContent = renderVerses(
        data,
        isInterlinear || false,
        isSplit || false
    );

    const themeSchema = theme.dark ? 'dark' : 'light';

    return `
    <!DOCTYPE html>
    <html data-theme="${themeSchema}" >
        ${createHtmlHead(
        chapterNumber,
        theme,
        containerWidth,
        showReadingTime,
        fontSize || 16,
        tailwindScript
    )}
        ${createHtmlBody(versesContent, initialScrollIndex, chapterNumber, showReadingTime)}
    </html>
    `;
};
