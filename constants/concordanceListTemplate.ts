import { getTailwindStyleTag } from "@/hooks/useLoadTailwindScript";
import { getFontCss } from "@/hooks/useLoadFonts";
import { scriptDownloadHelpers } from "@/state/scriptDownloadState";
import { TTheme } from "@/types";
import { storedData$ } from "@/context/LocalstoreContext";
import { TWord } from "./words";

export type ConcordanceViewMode = 'grid' | 'list';

interface ConcordanceListTemplateProps {
  words: TWord[];
  theme: TTheme;
  fontSize?: number;
  viewMode?: ConcordanceViewMode;
  randomLetter?: string;
}

const concordanceListStyles = (theme: TTheme, accentColor: string) => {
  const isDark = theme.dark;

  return `
    <style>
      * {
        font-family: system-ui, -apple-system, sans-serif;
        box-sizing: border-box;
      }
      
      html, body {
        margin: 0;
        padding: 0;
        overflow-x: hidden;
        max-width: 100vw;
      }
      
      body {
        -webkit-font-smoothing: antialiased;
        user-select: none;
        -webkit-user-select: none;
        -webkit-tap-highlight-color: transparent;
        overflow-y: auto;
      }
      
      .card {
        transition: all 0.2s ease;
        touch-action: manipulation;
        min-width: 0;
        word-wrap: break-word;
        overflow-wrap: break-word;
      }
      
      .card:active:not(:has(.action-btn:active)) {
        transform: scale(0.98);
        opacity: 0.9;
      }
      
      /* Grid View Styles */
      .cards-container.grid-view {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        width: 100%;
        padding: 0 8px;
      }
      
      .cards-container.grid-view .card {
        padding: 16px;
        margin-bottom: 0;
        min-width: 0;
        flex-direction: column;
        align-items: center;
        text-align: center;
      }
      
      .cards-container.grid-view .word-name {
        font-size: 14px;
      }
      
      .cards-container.grid-view .word-count {
        margin-top: 4px;
      }
      
      /* List View Styles */
      .cards-container.list-view {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 0 8px;
      }
      
      .cards-container.list-view .card {
        margin-bottom: 0;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }
      
      /* Word Card Styles */
      .word-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
        background: ${isDark ? 'rgba(255,255,255,0.06)' : '#ffffff'};
        border: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
        border-radius: 16px;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .word-card:active {
        transform: scale(0.98);
        opacity: 0.9;
      }
      
      .word-card-letter {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        font-weight: 700;
        flex-shrink: 0;
      }
      
      .word-card-content {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      
      .word-card-name {
        font-size: 15px;
        font-weight: 600;
        color: inherit;
        text-transform: capitalize;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .word-card-meta {
        font-size: 12px;
        opacity: 0.5;
      }
      
      .word-card-action {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      /* Grid view adjustments for word cards */
      .cards-container.grid-view .word-card {
        flex-direction: column;
        text-align: center;
        padding: 20px 16px;
      }
      
      .cards-container.grid-view .word-card-letter {
        width: 56px;
        height: 56px;
        font-size: 24px;
        border-radius: 14px;
        margin-bottom: 4px;
      }
      
      .cards-container.grid-view .word-card-content {
        align-items: center;
      }
      
      .cards-container.grid-view .word-card-name {
        font-size: 14px;
      }
      
      .cards-container.grid-view .word-card-action {
        display: none;
      }
      
      /* View toggle button */
      .view-toggle-btn {
        transition: all 0.2s ease;
        opacity: 0.5;
      }
      
      .view-toggle-btn:active {
        transform: scale(0.95);
      }
      
      .view-toggle-btn.active {
        background: ${accentColor}20;
        color: ${accentColor};
        opacity: 1;
      }
      
      /* Search input styles */
      .search-container {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 14px;
        border-radius: 12px;
        background: ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'};
        border: 1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'};
      }
      
      .search-input {
        flex: 1;
        border: none;
        outline: none;
        background: transparent;
        font-size: 16px;
        color: inherit;
      }
      
      .search-input::placeholder {
        color: ${isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'};
      }
      
      @media (max-width: 360px) {
        .cards-container.grid-view {
          grid-template-columns: 1fr;
        }
      }
      
      .scrollbar-hide::-webkit-scrollbar { display: none; }
      .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      
      /* Action buttons */
      .action-btn {
        transition: all 0.15s ease;
      }
      
      .action-btn:active {
        transform: scale(0.92);
        opacity: 0.8;
      }
      
      /* Detail View Styles */
      #detail-view {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 100;
        opacity: 0;
        transform: scale(0.95);
        pointer-events: none;
        transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
        will-change: opacity, transform;
      }
      
      #detail-view.visible {
        opacity: 1;
        transform: scale(1);
        pointer-events: auto;
      }
      
      #list-view {
        transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
        will-change: opacity, transform;
      }
      
      #list-view.hidden {
        opacity: 0;
        transform: scale(1.05);
        pointer-events: none;
      }
      
      .back-btn {
        transition: all 0.2s ease;
      }
      
      .back-btn:active {
        transform: scale(0.95);
        opacity: 0.8;
      }
      
      /* Verse card styles */
      .verse-card {
        transition: all 0.2s ease;
      }
      
      .verse-card:active {
        transform: scale(0.98);
        opacity: 0.9;
      }
      
      /* Highlight word in text */
      .highlight {
        color: ${accentColor};
        font-weight: 600;
      }
      
      /* Filter button */
      .filter-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        background: ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'};
        border: 1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'};
        border-radius: 10px;
        padding: 8px 12px;
        font-size: 13px;
        color: inherit;
        cursor: pointer;
        transition: all 0.2s ease;
        max-width: 140px;
      }
      
      .filter-btn:active {
        transform: scale(0.97);
        opacity: 0.9;
      }
      
      .filter-btn .filter-text {
        flex: 1;
        text-align: left;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      /* Bottom Sheet */
      .bottom-sheet-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 500;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
      }
      
      .bottom-sheet-backdrop.visible {
        opacity: 1;
        pointer-events: auto;
      }
      
      .bottom-sheet {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        background: ${isDark ? '#1a1a1a' : '#ffffff'};
        border-top-left-radius: 20px;
        border-top-right-radius: 20px;
        z-index: 501;
        transform: translateY(100%);
        transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
        max-height: 60vh;
        display: flex;
        flex-direction: column;
        border: 1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'};
        border-bottom: none;
      }
      
      .bottom-sheet.visible {
        transform: translateY(0);
      }
      
      .bottom-sheet-handle {
        width: 36px;
        height: 4px;
        background: ${accentColor};
        border-radius: 2px;
        margin: 12px auto;
        flex-shrink: 0;
      }
      
      .bottom-sheet-header {
        padding: 0 16px 12px;
        border-bottom: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
        flex-shrink: 0;
      }
      
      .bottom-sheet-title {
        font-size: 16px;
        font-weight: 600;
        text-align: center;
        color: inherit;
      }
      
      .bottom-sheet-content {
        flex: 1;
        overflow-y: auto;
        padding: 8px 0;
        -webkit-overflow-scrolling: touch;
      }
      
      .bottom-sheet-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 16px;
        cursor: pointer;
        transition: background 0.15s ease;
      }
      
      .bottom-sheet-item:active {
        background: ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'};
      }
      
      .bottom-sheet-item.selected {
        background: ${accentColor}15;
      }
      
      .bottom-sheet-item-text {
        font-size: 15px;
        color: inherit;
      }
      
      .bottom-sheet-item-count {
        font-size: 13px;
        color: ${isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'};
        font-weight: 500;
      }
      
      .bottom-sheet-item.selected .bottom-sheet-item-text {
        color: ${accentColor};
        font-weight: 600;
      }
      
      .bottom-sheet-item-check {
        width: 20px;
        height: 20px;
        color: ${accentColor};
      }
      
      /* Loading spinner */
      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
        border-top-color: ${accentColor};
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      
      /* Toast notification */
      .toast {
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background: ${isDark ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.9)'};
        color: ${isDark ? '#1a1a1a' : '#ffffff'};
        padding: 12px 24px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 500;
        opacity: 0;
        transition: all 0.3s ease;
        z-index: 200;
        pointer-events: none;
      }
      
      .toast.show {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    </style>
  `;
};

// Generate a color based on the first letter
const getLetterColor = (letter: string): string => {
  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#cec8ff',
    '#ec4899', '#f43f5e'
  ];
  const index = letter.charCodeAt(0) % colors.length;
  return colors[index];
};

export const concordanceListHtmlTemplate = ({
  words,
  theme,
  fontSize = 16,
  viewMode = 'list',
  randomLetter = 'A',
}: ConcordanceListTemplateProps): string => {
  const themeSchema = theme.dark ? 'dark' : 'light';
  const isDark = theme.dark;
  const accentColor = isDark ? '#FFFFFF' : '#000000';

  // SVG icons
  const gridIcon = `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"/>
  </svg>`;

  const listIcon = `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/>
  </svg>`;

  const searchIcon = `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="opacity: 0.5; flex-shrink: 0;">
    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
  </svg>`;

  const backIcon = `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/>
  </svg>`;

  const copyIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>`;

  const bookIcon = `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
  </svg>`;

  // Serialize words data for JavaScript
  const wordsJson = JSON.stringify(words.map(w => ({
    id: w._id,
    name: w.name,
    nameLower: w.name_lower,
    firstLetter: w.first_letter,
    count: w.nv,
    nameLowerEnc: w.name_lower_enc
  })));

  // Filter words by random letter initially
  const filteredWords = words.filter(w => w.first_letter === randomLetter.toLowerCase());

  const arrowIcon = `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
  </svg>`;

  const cardsHtml = filteredWords.map((item, index) => {
    const firstLetter = item.first_letter.toUpperCase();
    const letterColor = getLetterColor(firstLetter);

    return `
      <div class="card word-card" 
           data-name="${item.name}"
           data-name-lower="${item.name_lower}"
           data-name-enc="${item.name_lower_enc}"
           data-index="${index}">
        <div class="word-card-letter" style="background: linear-gradient(135deg, ${letterColor}30, ${letterColor}10); color: ${letterColor};">
          ${firstLetter}
        </div>
        <div class="word-card-content">
          <span class="word-card-name">${item.name}</span>
          <span class="word-card-meta">${item.nv} versículos</span>
        </div>
        <div class="word-card-action" style="color: ${isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'};">
          ${arrowIcon}
        </div>
      </div>
    `;
  }).join("");

  const emptyStateHtml = `
    <div class="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div class="w-20 h-20 rounded-2xl flex items-center justify-center mb-5" style="background: ${accentColor}15;">
        ${bookIcon}
      </div>
      <p class="text-theme-text font-semibold text-lg mb-2">No se encontraron palabras</p>
      <p class="text-sm text-theme-text/50 max-w-xs">Intenta con otro término de búsqueda</p>
    </div>
  `;

  return `
    <!DOCTYPE html>
    <html data-theme="${themeSchema}">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <title>Concordancia Bíblica</title>
      ${scriptDownloadHelpers.getTailwindScript()}
      ${getTailwindStyleTag({ theme, fontSize })}
      ${getFontCss({ fontName: storedData$.selectedFont.get() || '' })}
      ${concordanceListStyles(theme, accentColor)}
    </head>
    <body class="p-0 m-0 text-theme-text bg-theme-background select-none overflow-x-hidden">
      
      <!-- Toast -->
      <div id="toast" class="toast"></div>
      
      <!-- List View (Words) -->
      <div id="list-view" class="px-4">
        <!-- Header -->
        <div class="sticky top-0 bg-theme-background z-10 pb-4 pt-4 px-1">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <svg class="w-6 h-6" style="color: ${accentColor};" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
              </svg>
              <h1 class="text-xl font-bold text-theme-text">Concordancia</h1>
              <span class="text-xs font-medium px-2 py-0.5 rounded-full" 
                    style="background: ${accentColor}20; color: ${accentColor}">
                <span id="count-display">${filteredWords.length}</span>
              </span>
            </div>
            
            <!-- View Mode Toggle -->
            <div class="flex items-center gap-1 p-1 rounded-lg" style="background: ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'};">
              <button id="grid-view-btn" 
                      onclick="setViewMode('grid')" 
                      class="view-toggle-btn p-2 rounded-md ${viewMode === 'grid' ? 'active' : ''}"
                      title="Vista cuadrícula">
                ${gridIcon}
              </button>
              <button id="list-view-btn" 
                      onclick="setViewMode('list')" 
                      class="view-toggle-btn p-2 rounded-md ${viewMode === 'list' ? 'active' : ''}"
                      title="Vista lista">
                ${listIcon}
              </button>
            </div>
          </div>
          
          <p class="text-sm text-theme-text/50 mb-3">Busca palabras y encuentra versículos</p>
          
          <!-- Search -->
          <div class="search-container">
            ${searchIcon}
            <input type="text" 
                   id="search-input" 
                   class="search-input text-theme-text" 
                   placeholder="Buscar una palabra..."
                   autocomplete="off"
                   autocorrect="off"
                   autocapitalize="off"
                   spellcheck="false">
          </div>
        </div>
        
        <div id="cards-container" class="cards-container ${viewMode}-view" style="padding-bottom: 45vh;">
          ${filteredWords.length > 0 ? cardsHtml : emptyStateHtml}
        </div>
        
        <div id="empty-search" class="hidden" style="padding-bottom: 45vh;">
          ${emptyStateHtml}
        </div>
      </div>
      
      <!-- Detail View (Verses) -->
      <div id="detail-view" class="bg-theme-background overflow-y-auto">
        <!-- Detail Header -->
        <div class="sticky top-0 bg-theme-background z-10 p-4">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <button id="back-btn" class="back-btn p-2 rounded-xl flex-shrink-0" style="background: ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'};">
                ${backIcon}
              </button>
              <span id="detail-word" class="text-base font-bold text-theme-text uppercase truncate"></span>
              <span id="detail-count" class="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0" style="background: ${accentColor}20; color: ${accentColor};"></span>
            </div>
            <!-- Filter Button -->
            <button id="filter-btn" class="filter-btn text-theme-text flex-shrink-0">
              <span class="filter-text" id="filter-btn-text">Todos</span>
              <svg class="w-4 h-4 flex-shrink-0" style="opacity: 0.6;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Loading -->
        <div id="loading-container" class="hidden flex items-center justify-center py-16">
          <div class="loading-spinner"></div>
        </div>
        
        <!-- Verses Container -->
        <div id="verses-container" class="px-4 pb-4" style="padding-bottom: 45vh;"></div>
      </div>
      
      <!-- Filter Bottom Sheet -->
      <div id="filter-backdrop" class="bottom-sheet-backdrop"></div>
      <div id="filter-bottom-sheet" class="bottom-sheet text-theme-text">
        <div class="bottom-sheet-handle"></div>
        <div class="bottom-sheet-header">
          <div class="bottom-sheet-title">Filtrar por libro</div>
        </div>
        <div class="bottom-sheet-content" id="filter-options"></div>
      </div>
      
      <script>
        (function() {
          // Data
          const wordsData = ${wordsJson};
          let currentViewMode = '${viewMode}';
          let currentWord = null;
          let currentVerses = [];
          let filteredVerses = [];
          const randomLetter = '${randomLetter.toLowerCase()}';
          
          // DOM Elements
          const listView = document.getElementById('list-view');
          const detailView = document.getElementById('detail-view');
          const cardsContainer = document.getElementById('cards-container');
          const emptySearch = document.getElementById('empty-search');
          const gridViewBtn = document.getElementById('grid-view-btn');
          const listViewBtn = document.getElementById('list-view-btn');
          const searchInput = document.getElementById('search-input');
          const countDisplay = document.getElementById('count-display');
          const backBtn = document.getElementById('back-btn');
          const detailWord = document.getElementById('detail-word');
          const detailCount = document.getElementById('detail-count');
          const versesContainer = document.getElementById('verses-container');
          const loadingContainer = document.getElementById('loading-container');
          const filterBtn = document.getElementById('filter-btn');
          const filterBtnText = document.getElementById('filter-btn-text');
          const filterBackdrop = document.getElementById('filter-backdrop');
          const filterBottomSheet = document.getElementById('filter-bottom-sheet');
          const filterOptions = document.getElementById('filter-options');
          const toast = document.getElementById('toast');
          
          let selectedFilter = '';
          let bookFilterData = [];
          
          // Show toast notification
          function showToast(message) {
            toast.textContent = message;
            toast.classList.add('show');
            setTimeout(() => {
              toast.classList.remove('show');
            }, 2000);
          }
          
          // Normalize text for search (remove accents)
          function normalizeText(text) {
            return text.toLowerCase()
              .normalize('NFD')
              .replace(/[\\u0300-\\u036f]/g, '');
          }
          
          // Highlight search word in text
          function highlightWord(text, word) {
            if (!word) return text;
            try {
              // Simple case-insensitive search and replace
              const lowerText = text.toLowerCase();
              const lowerWord = word.toLowerCase();
              let result = '';
              let lastIndex = 0;
              let index = lowerText.indexOf(lowerWord, lastIndex);
              while (index !== -1) {
                result += text.substring(lastIndex, index);
                result += '<span class="highlight">' + text.substring(index, index + word.length) + '</span>';
                lastIndex = index + word.length;
                index = lowerText.indexOf(lowerWord, lastIndex);
              }
              result += text.substring(lastIndex);
              return result;
            } catch (e) {
              return text;
            }
          }
          
          // Render word cards
          function renderWordCards(words) {
            if (words.length === 0) {
              cardsContainer.classList.add('hidden');
              emptySearch.classList.remove('hidden');
              return;
            }
            
            cardsContainer.classList.remove('hidden');
            emptySearch.classList.add('hidden');
            
            const letterColors = [
              '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
              '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
              '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#cec8ff',
              '#ec4899', '#f43f5e'
            ];
            
            const arrowIcon = \`<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
            </svg>\`;
            
            cardsContainer.innerHTML = words.map((item, index) => {
              const letterColor = letterColors[item.firstLetter.charCodeAt(0) % letterColors.length];
              const firstLetter = item.firstLetter.toUpperCase();
              return \`
                <div class="card word-card" 
                     data-name="\${item.name}"
                     data-name-lower="\${item.nameLower}"
                     data-name-enc="\${item.nameLowerEnc}"
                     data-index="\${index}">
                  <div class="word-card-letter" style="background: linear-gradient(135deg, \${letterColor}30, \${letterColor}10); color: \${letterColor};">
                    \${firstLetter}
                  </div>
                  <div class="word-card-content">
                    <span class="word-card-name">\${item.name}</span>
                    <span class="word-card-meta">\${item.count} versículos</span>
                  </div>
                  <div class="word-card-action" style="color: ${isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'};">
                    \${arrowIcon}
                  </div>
                </div>
              \`;
            }).join('');
            
            // Re-attach event listeners
            setupCardListeners();
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
          
          // Search functionality
          function performSearch(query) {
            let filtered;
            if (query === '') {
              // Show random letter words
              filtered = wordsData.filter(w => w.firstLetter === randomLetter);
            } else {
              // Search all words
              filtered = wordsData.filter(w => normalizeText(w.nameLower).includes(query));
            }
            
            countDisplay.textContent = filtered.length;
            renderWordCards(filtered);
          }
          
          const debouncedSearch = debounce(performSearch, 300);
          
          searchInput.addEventListener('input', function(e) {
            const query = normalizeText(e.target.value.trim());
            debouncedSearch(query);
          });
          
          // View mode function
          window.setViewMode = function(mode) {
            if (mode === currentViewMode) return;
            
            currentViewMode = mode;
            
            cardsContainer.classList.remove('grid-view', 'list-view');
            cardsContainer.classList.add(mode + '-view');
            
            if (mode === 'grid') {
              gridViewBtn.classList.add('active');
              listViewBtn.classList.remove('active');
            } else {
              gridViewBtn.classList.remove('active');
              listViewBtn.classList.add('active');
            }
            
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'viewModeChange',
                data: { viewMode: mode }
              }));
            }
          };
          
          // Show detail view
          function showDetail(word) {
            currentWord = word;
            detailWord.textContent = word.name;
            detailCount.textContent = '...';
            versesContainer.innerHTML = '';
            loadingContainer.classList.remove('hidden');
            selectedFilter = '';
            filterBtnText.textContent = 'Todos';
            bookFilterData = [];
            
            listView.classList.add('hidden');
            detailView.classList.add('visible');
            detailView.scrollTop = 0;
            
            // Notify React Native to fetch verses
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'fetchVerses',
                data: { word: word.nameLower, wordEnc: word.nameLowerEnc }
              }));
              
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'detailViewOpened',
                data: { word: word.name }
              }));
            }
          }
          
          // Render verses
          window.renderVerses = function(verses) {
            currentVerses = verses;
            filteredVerses = verses;
            loadingContainer.classList.add('hidden');
            detailCount.textContent = verses.length;
            
            // Get unique book names for filter
            const bookNames = [...new Set(verses.map(v => v.bookName))];
            bookFilterData = [
              { value: '', label: 'Todos', count: verses.length },
              ...bookNames.map(name => ({
                value: name,
                label: name,
                count: verses.filter(v => v.bookName === name).length
              }))
            ];
            
            renderVerseCards(verses);
          };
          
          // Render verse cards
          function renderVerseCards(verses) {
            if (verses.length === 0) {
              versesContainer.innerHTML = \`
                <div class="flex flex-col items-center justify-center py-16 px-8 text-center">
                  <p class="text-theme-text font-semibold text-lg mb-2">No se encontraron versículos</p>
                </div>
              \`;
              return;
            }
            
            versesContainer.innerHTML = verses.map((verse, index) => \`
              <div class="verse-card bg-white dark:bg-white/8 border border-white/5 dark:border-white/5 rounded-2xl p-4 mb-3 shadow-lg cursor-pointer"
                   data-book="\${verse.bookName}"
                   data-chapter="\${verse.chapter}"
                   data-verse="\${verse.verse}"
                   data-index="\${index}">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-bold" style="color: ${accentColor};">\${verse.bookName} \${verse.chapter}:\${verse.verse}</span>
                  <button class="copy-btn action-btn p-2 rounded-lg" style="color: ${accentColor};" data-index="\${index}">
                    ${copyIcon}
                  </button>
                </div>
                <p class="text-sm text-theme-text/80 leading-relaxed">\${highlightWord(verse.text, currentWord?.nameLower)}</p>
              </div>
            \`).join('');
            
            // Attach verse event listeners
            setupVerseListeners();
          }
          
          // Bottom Sheet Functions
          function openFilterSheet() {
            // Render filter options
            const checkIcon = \`<svg class="bottom-sheet-item-check" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
            </svg>\`;
            
            filterOptions.innerHTML = bookFilterData.map(item => \`
              <div class="bottom-sheet-item \${selectedFilter === item.value ? 'selected' : ''}" data-value="\${item.value}">
                <div>
                  <span class="bottom-sheet-item-text">\${item.label}</span>
                  <span class="bottom-sheet-item-count"> (\${item.count})</span>
                </div>
                \${selectedFilter === item.value ? checkIcon : '<div style="width: 20px;"></div>'}
              </div>
            \`).join('');
            
            // Add click listeners to options
            filterOptions.querySelectorAll('.bottom-sheet-item').forEach(item => {
              item.addEventListener('click', function() {
                const value = this.dataset.value;
                selectFilter(value);
              });
            });
            
            filterBackdrop.classList.add('visible');
            filterBottomSheet.classList.add('visible');
          }
          
          function closeFilterSheet() {
            filterBackdrop.classList.remove('visible');
            filterBottomSheet.classList.remove('visible');
          }
          
          function selectFilter(value) {
            selectedFilter = value;
            const filterItem = bookFilterData.find(item => item.value === value);
            filterBtnText.textContent = filterItem ? filterItem.label : 'Todos';
            
            if (value === '') {
              filteredVerses = currentVerses;
            } else {
              filteredVerses = currentVerses.filter(v => v.bookName === value);
            }
            detailCount.textContent = filteredVerses.length;
            renderVerseCards(filteredVerses);
            closeFilterSheet();
          }
          
          // Filter button click
          filterBtn.addEventListener('click', openFilterSheet);
          
          // Backdrop click to close
          filterBackdrop.addEventListener('click', closeFilterSheet);
          
          // Hide detail view
          function hideDetail() {
            detailView.classList.remove('visible');
            
            setTimeout(() => {
              listView.classList.remove('hidden');
            }, 50);
            
            currentWord = null;
            currentVerses = [];
            filteredVerses = [];
            
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'detailViewClosed',
                data: {}
              }));
            }
          }
          
          // Back button
          backBtn.addEventListener('click', hideDetail);
          
          // Setup card event listeners
          function setupCardListeners() {
            const cards = cardsContainer.querySelectorAll('.card');
            cards.forEach(card => {
              card.addEventListener('click', function() {
                const word = {
                  name: this.dataset.name,
                  nameLower: this.dataset.nameLower,
                  nameLowerEnc: this.dataset.nameEnc
                };
                showDetail(word);
              });
            });
          }
          
          // Setup verse event listeners
          function setupVerseListeners() {
            const verseCards = versesContainer.querySelectorAll('.verse-card');
            verseCards.forEach(card => {
              // Copy button
              const copyBtn = card.querySelector('.copy-btn');
              if (copyBtn) {
                copyBtn.addEventListener('click', function(e) {
                  e.stopPropagation();
                  const index = parseInt(this.dataset.index, 10);
                  const verse = filteredVerses[index];
                  if (verse && window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'copy',
                      data: verse
                    }));
                    showToast('Copiado al portapapeles');
                  }
                });
              }
              
              // Card click - go to verse
              card.addEventListener('click', function() {
                const bookName = this.dataset.book;
                const chapter = parseInt(this.dataset.chapter, 10);
                const verse = parseInt(this.dataset.verse, 10);
                
                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'goToVerse',
                    data: { bookName, chapter, verse }
                  }));
                }
              });
            });
          }
          
          // Listen for messages from React Native
          document.addEventListener('message', function(e) {
            try {
              const message = JSON.parse(e.data);
              if (message.type === 'goBackToList') {
                hideDetail();
              } else if (message.type === 'versesData') {
                window.renderVerses(message.data);
              }
            } catch (err) {}
          });
          
          window.addEventListener('message', function(e) {
            try {
              const message = JSON.parse(e.data);
              if (message.type === 'goBackToList') {
                hideDetail();
              } else if (message.type === 'versesData') {
                window.renderVerses(message.data);
              }
            } catch (err) {}
          });
          
          // Initial setup
          setupCardListeners();
        })();
      </script>
    </body>
    </html>
  `;
};

