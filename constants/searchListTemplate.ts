import { getTailwindStyleTag } from "@/hooks/useLoadTailwindScript";
import { getFontCss } from "@/hooks/useLoadFonts";
import { scriptDownloadHelpers } from "@/state/scriptDownloadState";
import { TTheme } from "@/types";
import { storedData$ } from "@/context/LocalstoreContext";

export type SearchViewMode = 'list';

interface SearchResult {
  book_number: number;
  chapter: number;
  text: string;
  verse: number;
  bookName?: string;
}

interface SearchListTemplateProps {
  theme: TTheme;
  fontSize?: number;
  searchQuery?: string;
}

const searchListStyles = (theme: TTheme, accentColor: string) => {
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
      
      .hidden {
        display: none !important;
      }
      
      /* Fixed Header */
      .fixed-header {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 100;
        background: ${isDark ? theme.colors.background : theme.colors.background};
        padding: 16px 16px 8px 16px;
      }
      
      /* Content spacer for fixed header */
      .header-spacer {
        height: 120px;
      }
      
      .header-spacer.with-results {
        height: 140px;
      }
      
      /* Search input styles */
      .search-container {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        border-radius: 12px;
        background: ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'};
        border: 1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'};
        transition: border-color 0.2s ease;
      }
      
      .search-container:focus-within {
        border-color: ${accentColor};
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
      
      .search-clear {
        padding: 4px;
        border-radius: 50%;
        cursor: pointer;
        opacity: 0.5;
        transition: opacity 0.2s ease;
      }
      
      .search-clear:active {
        opacity: 1;
      }
      
      /* Results header */
      .results-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 0;
      }
      
      .results-count {
        font-size: 14px;
        color: ${isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'};
      }
      
      .results-count strong {
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
      }
      
      .filter-btn:active {
        transform: scale(0.97);
        opacity: 0.9;
      }
      
      .filter-btn .filter-text {
        max-width: 100px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      /* Verse card styles */
      .verse-card {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 16px;
        background: ${isDark ? 'rgba(255,255,255,0.06)' : '#ffffff'};
        border: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
        border-radius: 16px;
        cursor: pointer;
        transition: all 0.2s ease;
        margin-bottom: 10px;
      }
      
      .verse-card:active {
        transform: scale(0.98);
        opacity: 0.9;
      }
      
      .verse-card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      
      .verse-reference {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .verse-reference-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: ${accentColor};
      }
      
      .verse-reference-text {
        font-size: 14px;
        font-weight: 600;
        color: ${accentColor};
      }
      
      .verse-card-actions {
        display: flex;
        gap: 4px;
      }
      
      .action-btn {
        padding: 6px;
        border-radius: 8px;
        cursor: pointer;
        opacity: 0.6;
        transition: all 0.15s ease;
      }
      
      .action-btn:active {
        transform: scale(0.9);
        opacity: 1;
      }
      
      .verse-text {
        font-size: 15px;
        line-height: 1.6;
        color: ${isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'};
      }
      
      .verse-text .highlight {
        color: ${accentColor};
        font-weight: 600;
        background: ${accentColor}15;
        padding: 0 2px;
        border-radius: 2px;
      }
      
      /* Loading state */
      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
        gap: 16px;
      }
      
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
      
      .loading-text {
        font-size: 14px;
        color: ${isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'};
      }
      
      /* Empty state */
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
        text-align: center;
      }
      
      .empty-icon {
        width: 80px;
        height: 80px;
        border-radius: 20px;
        background: ${accentColor}15;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16px;
      }
      
      .empty-title {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 8px;
      }
      
      .empty-subtitle {
        font-size: 14px;
        color: ${isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'};
        max-width: 280px;
      }
      
      /* Initial state */
      .initial-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 80px 20px;
        text-align: center;
      }
      
      .initial-icon {
        width: 100px;
        height: 100px;
        border-radius: 24px;
        background: ${accentColor}10;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 20px;
      }
      
      .initial-title {
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 8px;
      }
      
      .initial-subtitle {
        font-size: 14px;
        color: ${isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'};
        max-width: 280px;
        line-height: 1.5;
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
        z-index: 600;
        pointer-events: none;
      }
      
      .toast.show {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
      
      /* Scroll to top button */
      .scroll-top-btn {
        position: fixed;
        bottom: 24px;
        right: 16px;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: ${accentColor};
        color: ${isDark ? '#1a1a1a' : '#ffffff'};
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        opacity: 0;
        transform: scale(0.8);
        transition: all 0.2s ease;
        pointer-events: none;
        z-index: 50;
        box-shadow: 0 4px 12px ${accentColor}40;
      }
      
      .scroll-top-btn.visible {
        opacity: 1;
        transform: scale(1);
        pointer-events: auto;
      }
      
      .scroll-top-btn:active {
        transform: scale(0.9);
      }
    </style>
  `;
};

export const searchListHtmlTemplate = ({
  theme,
  fontSize = 16,
  searchQuery = '',
}: SearchListTemplateProps): string => {
  const themeSchema = theme.dark ? 'dark' : 'light';
  const isDark = theme.dark;
  const accentColor = isDark ? '#FFFFFF' : '#000000';

  // SVG icons
  const searchIcon = `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="opacity: 0.5; flex-shrink: 0;">
    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
  </svg>`;

  const clearIcon = `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
  </svg>`;

  const copyIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>`;

  const filterIcon = `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"/>
  </svg>`;

  const chevronIcon = `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
  </svg>`;

  const chevronUpIcon = `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5"/>
  </svg>`;

  const bookIcon = `<svg class="w-10 h-10" style="color: ${accentColor}; opacity: 0.6;" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
  </svg>`;

  return `
    <!DOCTYPE html>
    <html data-theme="${themeSchema}">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <title>Búsqueda Bíblica</title>
      ${scriptDownloadHelpers.getTailwindScript()}
      ${getTailwindStyleTag({ theme, fontSize })}
      ${getFontCss({ fontName: storedData$.selectedFont.get() || '' })}
      ${searchListStyles(theme, accentColor)}
    </head>
    <body class="p-0 m-0 text-theme-text bg-theme-background select-none overflow-x-hidden">
      
      <!-- Toast -->
      <div id="toast" class="toast"></div>
      
      <!-- Fixed Header -->
      <div id="fixed-header" class="fixed-header">
        <!-- Search Bar -->
        <div class="search-container" id="search-container">
          ${searchIcon}
          <input type="text" 
                 id="search-input" 
                 class="search-input text-theme-text" 
                 placeholder="Buscar referencia..."
                 autocomplete="off"
                 autocorrect="off"
                 autocapitalize="off"
                 spellcheck="false"
                 value="${searchQuery}">
          <div id="search-clear" class="search-clear hidden">
            ${clearIcon}
          </div>
          <div id="search-loading" class="loading-spinner hidden" style="width: 20px; height: 20px; border-width: 2px;"></div>
        </div>
        
        <!-- Results Header -->
        <div id="results-header" class="results-header hidden">
          <span class="results-count">
            <strong id="results-count">0</strong> resultados
          </span>
          <button id="filter-btn" class="filter-btn">
            ${filterIcon}
            <span class="filter-text" id="filter-btn-text">Todos</span>
            ${chevronIcon}
          </button>
        </div>
      </div>
      
      <!-- Main Content -->
      <div id="main-view" class="px-4">
        <!-- Header Spacer -->
        <div id="header-spacer" class="header-spacer"></div>
        
        <!-- Initial State -->
        <div id="initial-state" class="initial-state">
          <div class="initial-icon">
            ${bookIcon}
          </div>
          <div class="initial-title text-theme-text">Busca en la Biblia</div>
          <div class="initial-subtitle">Escribe al menos 3 caracteres para buscar versículos, referencias o palabras</div>
        </div>
        
        <!-- Loading State -->
        <div id="loading-state" class="loading-container hidden">
          <div class="loading-spinner"></div>
          <div class="loading-text">Buscando...</div>
        </div>
        
        <!-- Results Container -->
        <div id="results-container" class="hidden" style="padding-bottom: 100px;"></div>
        
        <!-- Empty State -->
        <div id="empty-state" class="empty-state hidden">
          <div class="empty-icon">
            ${bookIcon}
          </div>
          <div class="empty-title text-theme-text">Sin resultados</div>
          <div class="empty-subtitle" id="empty-message">No encontramos resultados para tu búsqueda</div>
        </div>
      </div>
      
      <!-- Scroll to Top Button -->
      <div id="scroll-top-btn" class="scroll-top-btn">
        ${chevronUpIcon}
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
          // State
          let searchResults = [];
          let filteredResults = [];
          let selectedFilter = '';
          let bookFilterData = [];
          let isLoading = false;
          let searchTimeout = null;
          
          // DOM Elements
          const searchInput = document.getElementById('search-input');
          const searchClear = document.getElementById('search-clear');
          const searchLoading = document.getElementById('search-loading');
          const resultsHeader = document.getElementById('results-header');
          const resultsCount = document.getElementById('results-count');
          const resultsContainer = document.getElementById('results-container');
          const initialState = document.getElementById('initial-state');
          const loadingState = document.getElementById('loading-state');
          const emptyState = document.getElementById('empty-state');
          const emptyMessage = document.getElementById('empty-message');
          const filterBtn = document.getElementById('filter-btn');
          const filterBtnText = document.getElementById('filter-btn-text');
          const filterBackdrop = document.getElementById('filter-backdrop');
          const filterBottomSheet = document.getElementById('filter-bottom-sheet');
          const filterOptions = document.getElementById('filter-options');
          const scrollTopBtn = document.getElementById('scroll-top-btn');
          const toast = document.getElementById('toast');
          const headerSpacer = document.getElementById('header-spacer');
          
          // Show toast
          function showToast(message) {
            toast.textContent = message;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 2000);
          }
          
          // Remove accents from text
          function removeAccents(text) {
            return text.normalize('NFD').replace(/[\\u0300-\\u036f]/g, '');
          }
          
          // Update UI state
          function updateState(state) {
            initialState.classList.add('hidden');
            loadingState.classList.add('hidden');
            resultsContainer.classList.add('hidden');
            emptyState.classList.add('hidden');
            resultsHeader.classList.add('hidden');
            headerSpacer.classList.remove('with-results');
            
            switch(state) {
              case 'initial':
                initialState.classList.remove('hidden');
                break;
              case 'loading':
                loadingState.classList.remove('hidden');
                break;
              case 'results':
                resultsHeader.classList.remove('hidden');
                resultsContainer.classList.remove('hidden');
                headerSpacer.classList.add('with-results');
                break;
              case 'empty':
                emptyState.classList.remove('hidden');
                break;
            }
          }
          
          // Highlight search words in text
          function highlightText(text, query) {
            if (!query || query.length < 3) return text;
            const words = query.trim().split(/\\s+/).filter(w => w.length >= 2);
            let result = text;
            words.forEach(word => {
              // Simple case-insensitive search and replace
              const lowerText = result.toLowerCase();
              const lowerWord = word.toLowerCase();
              let newResult = '';
              let lastIndex = 0;
              let index = lowerText.indexOf(lowerWord, lastIndex);
              while (index !== -1) {
                newResult += result.substring(lastIndex, index);
                newResult += '<span class="highlight">' + result.substring(index, index + word.length) + '</span>';
                lastIndex = index + word.length;
                index = lowerText.indexOf(lowerWord, lastIndex);
              }
              newResult += result.substring(lastIndex);
              if (newResult) result = newResult;
            });
            return result;
          }
          
          // Render results
          function renderResults(results, query) {
            if (results.length === 0) {
              resultsContainer.innerHTML = '';
              return;
            }
            
            resultsContainer.innerHTML = results.map((verse, index) => \`
              <div class="verse-card" data-index="\${index}" data-book="\${verse.bookName}" data-chapter="\${verse.chapter}" data-verse="\${verse.verse}">
                <div class="verse-card-header">
                  <div class="verse-reference">
                    <div class="verse-reference-dot"></div>
                    <span class="verse-reference-text">\${verse.bookName} \${verse.chapter}:\${verse.verse}</span>
                  </div>
                  <div class="verse-card-actions">
                    <div class="action-btn copy-btn" data-index="\${index}">
                      ${copyIcon}
                    </div>
                  </div>
                </div>
                <div class="verse-text">\${highlightText(verse.text, query)}</div>
              </div>
            \`).join('');
            
            // Attach event listeners
            setupResultListeners();
          }
          
          // Setup result card listeners
          function setupResultListeners() {
            resultsContainer.querySelectorAll('.verse-card').forEach(card => {
              card.addEventListener('click', function(e) {
                if (e.target.closest('.copy-btn')) return;
                
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
              
              const copyBtn = card.querySelector('.copy-btn');
              if (copyBtn) {
                copyBtn.addEventListener('click', function(e) {
                  e.stopPropagation();
                  const index = parseInt(this.dataset.index, 10);
                  const verse = filteredResults[index];
                  if (verse && window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'copy',
                      data: verse
                    }));
                    showToast('Copiado al portapapeles');
                  }
                });
              }
            });
          }
          
          // Update filter data
          function updateFilterData(results) {
            const bookNames = [...new Set(results.map(v => v.bookName).filter(Boolean))];
            bookFilterData = [
              { value: '', label: 'Todos', count: results.length },
              ...bookNames.map(name => ({
                value: name,
                label: name,
                count: results.filter(v => v.bookName === name).length
              }))
            ];
          }
          
          // Apply filter
          function applyFilter() {
            if (selectedFilter === '') {
              filteredResults = searchResults;
            } else {
              filteredResults = searchResults.filter(v => v.bookName === selectedFilter);
            }
            resultsCount.textContent = filteredResults.length;
            renderResults(filteredResults, searchInput.value);
          }
          
          // Search input handler
          function handleSearch() {
            const query = searchInput.value.trim();
            
            // Update clear button visibility
            if (query.length > 0) {
              searchClear.classList.remove('hidden');
            } else {
              searchClear.classList.add('hidden');
            }
            
            if (query.length < 3) {
              updateState('initial');
              searchResults = [];
              filteredResults = [];
              selectedFilter = '';
              filterBtnText.textContent = 'Todos';
              return;
            }
            
            // Show loading
            searchLoading.classList.remove('hidden');
            searchClear.classList.add('hidden');
            
            // Debounce
            if (searchTimeout) clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
              if (window.ReactNativeWebView) {
                const sanitizedQuery = removeAccents(query);
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'search',
                  data: { query: sanitizedQuery }
                }));
              }
            }, 500);
          }
          
          // Receive search results
          window.setSearchResults = function(results, query) {
            searchLoading.classList.add('hidden');
            if (searchInput.value.length > 0) {
              searchClear.classList.remove('hidden');
            }
            
            searchResults = results;
            selectedFilter = '';
            filterBtnText.textContent = 'Todos';
            
            updateFilterData(results);
            applyFilter();
            
            if (results.length === 0) {
              emptyMessage.textContent = 'No encontramos resultados para "' + query + '"';
              updateState('empty');
            } else {
              updateState('results');
            }
          };
          
          // Clear search
          searchClear.addEventListener('click', function() {
            searchInput.value = '';
            searchClear.classList.add('hidden');
            searchResults = [];
            filteredResults = [];
            selectedFilter = '';
            filterBtnText.textContent = 'Todos';
            updateState('initial');
            searchInput.focus();
            
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'searchCleared',
                data: {}
              }));
            }
          });
          
          // Search input events
          searchInput.addEventListener('input', handleSearch);
          
          // Bottom Sheet Functions
          function openFilterSheet() {
            const checkIcon = \`<svg class="w-5 h-5" style="color: ${accentColor};" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
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
            
            filterOptions.querySelectorAll('.bottom-sheet-item').forEach(item => {
              item.addEventListener('click', function() {
                selectFilter(this.dataset.value);
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
            applyFilter();
            closeFilterSheet();
          }
          
          filterBtn.addEventListener('click', openFilterSheet);
          filterBackdrop.addEventListener('click', closeFilterSheet);
          
          // Scroll to top
          let lastScrollY = 0;
          window.addEventListener('scroll', function() {
            const scrollY = window.scrollY;
            if (scrollY > 300) {
              scrollTopBtn.classList.add('visible');
            } else {
              scrollTopBtn.classList.remove('visible');
            }
            lastScrollY = scrollY;
          });
          
          scrollTopBtn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          });
          
          // Listen for messages from React Native
          function handleMessage(e) {
            try {
              const message = JSON.parse(e.data);
              if (message.type === 'searchResults') {
                window.setSearchResults(message.data.results, message.data.query);
              }
            } catch (err) {}
          }
          
          document.addEventListener('message', handleMessage);
          window.addEventListener('message', handleMessage);
          
          // Initial state
          if (searchInput.value.length >= 3) {
            handleSearch();
          }
        })();
      </script>
    </body>
    </html>
  `;
};

