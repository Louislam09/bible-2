import { getTailwindStyleTag } from "@/hooks/useLoadTailwindScript";
import { getFontCss } from "@/hooks/useLoadFonts";
import { scriptDownloadHelpers } from "@/state/scriptDownloadState";
import { TTheme, DictionaryData } from "@/types";
import { storedData$ } from "@/context/LocalstoreContext";

export type DictionaryViewMode = 'grid' | 'list';

interface DatabaseResult {
  dbShortName: string;
  words: DictionaryData[];
}

interface DictionaryListTemplateProps {
  theme: TTheme;
  hasDictionary: boolean;
  fontSize?: number;
  viewMode?: DictionaryViewMode;
}

const dictionaryListStyles = (theme: TTheme, accentColor: string) => {
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
      
      .card {
        transition: all 0.2s ease;
        touch-action: manipulation;
        min-width: 0;
        word-wrap: break-word;
        overflow-wrap: break-word;
        background: ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'};
        border: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
        border-radius: 12px;
        padding: 14px;
        cursor: pointer;
      }
      
      .card:active:not(:has(.action-btn:active)) {
        transform: scale(0.98);
        opacity: 0.9;
      }
      
      .card.expanding {
        transform: scale(1.02);
        box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        z-index: 50;
      }
      
      /* Cards Container (for backward compat) */
      .cards-container {
        padding: 0 8px;
      }
      
      /* Grid/List View applied to section-cards is handled in section styles */
      
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
      
      /* Search container */
      .search-container {
        display: flex;
        align-items: center;
        background: ${accentColor}15;
        border: 1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'};
        border-radius: 12px;
        padding: 0 14px;
        height: 48px;
        transition: all 0.2s ease;
      }
      
      .search-container:focus-within {
        border-color: ${accentColor};
        box-shadow: 0 0 0 3px ${accentColor}20;
      }
      
      .search-container svg {
        width: 20px;
        height: 20px;
        color: ${isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'};
        flex-shrink: 0;
      }
      
      .search-input {
        flex: 1;
        border: none;
        background: transparent;
        padding: 12px;
        font-size: 15px;
        outline: none;
        color: inherit;
      }
      
      .search-input::placeholder {
        color: ${isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'};
      }
      
      .clear-btn {
        padding: 6px;
        border-radius: 50%;
        cursor: pointer;
        opacity: 0.6;
        transition: all 0.2s ease;
      }
      
      .clear-btn:active {
        opacity: 1;
        transform: scale(0.9);
      }
      
      /* Dictionary Section */
      .dictionary-section {
        margin-bottom: 12px;
        border-radius: 16px;
        overflow: hidden;
        background: ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'};
        border: 1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'};
      }
      
      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 16px;
        cursor: pointer;
        background: ${isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'};
        transition: background 0.2s ease;
        user-select: none;
      }
      
      .section-header:active {
        background: ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'};
      }
      
      .section-header-left {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .section-icon {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        background: ${accentColor}20;
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${accentColor};
      }
      
      .section-title {
        font-size: 15px;
        font-weight: 600;
        color: ${isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.85)'};
      }
      
      .section-count {
        font-size: 12px;
        font-weight: 500;
        padding: 3px 8px;
        border-radius: 10px;
        background: ${accentColor}20;
        color: ${accentColor};
      }
      
      .section-chevron {
        width: 20px;
        height: 20px;
        color: ${isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)'};
        transition: transform 0.3s ease;
      }
      
      .section-chevron.expanded {
        transform: rotate(180deg);
      }
      
      .section-content {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease-out;
      }
      
      .section-content.expanded {
        max-height: 5000px;
        transition: max-height 0.5s ease-in;
      }
      
      .section-cards {
        padding: 8px 12px 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      .section-cards.grid-view {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
      }
      
      /* Expand/Collapse All */
      .expand-controls {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        padding: 0 8px 12px;
      }
      
      .expand-btn {
        font-size: 12px;
        color: ${accentColor};
        background: none;
        border: none;
        padding: 6px 10px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .expand-btn:active {
        background: ${accentColor}15;
      }
      
      /* Detail view */
      #detail-view {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        z-index: 100;
      }
      
      #detail-view.visible {
        transform: translateX(0);
      }
      
      .back-btn {
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .back-btn:active {
        transform: scale(0.95);
        opacity: 0.8;
      }
      
      .action-btn {
        cursor: pointer;
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      
      .action-btn:active {
        transform: scale(0.95);
        opacity: 0.8;
      }
      
      /* Definition content */
      .definition-content {
        font-size: 15px;
        line-height: 1.7;
      }
      
      .definition-content p {
        margin: 0 0 12px 0;
      }
      
      .definition-content a {
        color: ${accentColor};
        text-decoration: none;
        font-weight: 500;
      }
      
      /* Toast */
      .toast {
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background: ${isDark ? '#333' : '#222'};
        color: #fff;
        padding: 12px 24px;
        border-radius: 25px;
        font-size: 14px;
        z-index: 1000;
        opacity: 0;
        transition: all 0.3s ease;
        pointer-events: none;
      }
      
      .toast.show {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
      }
      
      /* Loading spinner */
      .spinner {
        width: 24px;
        height: 24px;
        border: 2px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
        border-top-color: ${accentColor};
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      
      @keyframes spin {
        to { transform: rotate(360deg); }
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
        margin-bottom: 20px;
      }
      
      .download-btn {
        margin-top: 16px;
        padding: 12px 24px;
        background: ${accentColor};
        color: #fff;
        border: none;
        border-radius: 12px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .download-btn:active {
        transform: scale(0.98);
        opacity: 0.9;
      }
      
      /* Letter badge */
      .letter-badge {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        font-weight: 700;
        color: #fff;
        flex-shrink: 0;
      }
      
      /* Card arrow indicator */
      .card-arrow {
        width: 16px;
        height: 16px;
        color: ${isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)'};
        flex-shrink: 0;
      }
      
      .section-cards.grid-view .card-arrow {
        display: none;
      }
      
      @media (max-width: 360px) {
        .cards-container.grid-view {
          grid-template-columns: 1fr;
        }
      }
    </style>
  `;
};

// Get color based on first letter
const getLetterColor = (letter: string): string => {
  const colors = [
    '#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#1abc9c',
    '#3498db', '#9b59b6', '#e91e63', '#00bcd4', '#ff5722',
    '#795548', '#607d8b', '#8bc34a', '#ffc107', '#03a9f4'
  ];
  const index = (letter.toUpperCase().charCodeAt(0) - 65) % colors.length;
  return colors[Math.abs(index)] || colors[0];
};

export const dictionaryListHtmlTemplate = ({
  theme,
  hasDictionary,
  fontSize = 16,
  viewMode = 'list',
}: DictionaryListTemplateProps): string => {
  const themeSchema = theme.dark ? 'dark' : 'light';
  const isDark = theme.dark;
  const accentColor = isDark ? '#ec899e' : '#000000';

  // Icons
  const searchIcon = `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>`;

  const clearIcon = `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>
  </svg>`;

  const gridIcon = `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>`;

  const listIcon = `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
    <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>`;

  const backIcon = `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
    <path d="m15 18-6-6 6-6"/>
  </svg>`;

  const copyIcon = `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>`;

  const shareIcon = `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>`;

  const bookIcon = `<svg class="w-10 h-10" style="color: ${accentColor};" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
    <path d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"/>
  </svg>`;

  const downloadIcon = `<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>
  </svg>`;

  // No dictionary installed state
  const noDictionaryHtml = `
    <div class="empty-state">
      <div class="empty-icon">
        ${bookIcon}
      </div>
      <p class="text-theme-text font-semibold text-lg mb-2">Sin diccionarios</p>
      <p class="text-sm text-theme-text/50 max-w-xs">No tienes ningún diccionario descargado. Descarga uno para buscar definiciones.</p>
      <button class="download-btn" onclick="navigateToDownload()">
        ${downloadIcon}
        <span style="margin-left: 8px;">Descargar diccionario</span>
      </button>
    </div>
  `;

  // Initial search state
  const initialStateHtml = `
    <div id="initial-state" class="empty-state">
      <div class="empty-icon">
        ${searchIcon}
      </div>
      <p class="text-theme-text font-semibold text-lg mb-2">Buscar una palabra</p>
      <p class="text-sm text-theme-text/50 max-w-xs">Escribe al menos 3 caracteres para buscar definiciones</p>
    </div>
  `;

  // Loading state
  const loadingStateHtml = `
    <div id="loading-state" class="empty-state hidden">
      <div class="spinner"></div>
      <p class="text-theme-text/70 mt-4">Buscando...</p>
    </div>
  `;

  // No results state
  const noResultsHtml = `
    <div id="no-results" class="empty-state hidden">
      <div class="empty-icon">
        ${bookIcon}
      </div>
      <p class="text-theme-text font-semibold text-lg mb-2">Sin resultados</p>
      <p id="no-results-text" class="text-sm text-theme-text/50 max-w-xs">No se encontraron definiciones</p>
    </div>
  `;

  return `
    <!DOCTYPE html>
    <html data-theme="${themeSchema}">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <title>Diccionario</title>
      ${scriptDownloadHelpers.getTailwindScript()}
      ${getTailwindStyleTag({ theme, fontSize })}
      ${getFontCss({ fontName: storedData$.selectedFont.get() || '' })}
      ${dictionaryListStyles(theme, accentColor)}
    </head>
    <body class="p-0 m-0 text-theme-text bg-theme-background select-none overflow-x-hidden">
      
      <!-- Toast -->
      <div id="toast" class="toast"></div>
      
      ${!hasDictionary ? noDictionaryHtml : `
      <!-- List View -->
      <div id="list-view" class="px-1">
        <!-- Header -->
        <div class="sticky top-0 bg-theme-background z-10 pb-4 mb-2 px-1">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <svg class="w-6 h-6" style="color: ${accentColor};" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"/>
              </svg>
              <h1 class="text-xl font-bold text-theme-text">Diccionario</h1>
              <span id="count-badge" class="text-xs font-medium px-2 py-0.5 rounded-full hidden" 
                    style="background: ${accentColor}20; color: ${accentColor}">
                <span id="count-display">0</span>
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
          
          <p class="text-sm text-theme-text/50 mb-3">Busca definiciones de palabras bíblicas</p>
          
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
            <span id="clear-search" class="clear-btn hidden">
              ${clearIcon}
            </span>
          </div>
        </div>
        
        <div id="results-container" style="padding-bottom: 45vh;">
          ${initialStateHtml}
          ${loadingStateHtml}
          ${noResultsHtml}
          <div id="cards-container" class="cards-container ${viewMode}-view hidden"></div>
        </div>
      </div>
      
      <!-- Detail View -->
      <div id="detail-view" class="bg-theme-background overflow-y-auto">
        <!-- Detail Header -->
        <div class="sticky top-0 bg-theme-background z-10 p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <button id="back-btn" class="back-btn p-2 rounded-xl flex-shrink-0" style="background: ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'};">
                ${backIcon}
              </button>
              <div class="flex items-center gap-2 flex-1 min-w-0">
                <div class="h-2.5 w-2.5 rounded-full flex-shrink-0" id="detail-dot"></div>
                <h1 id="detail-title" class="text-lg font-bold text-theme-text truncate"></h1>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button id="detail-copy-btn" class="action-btn p-2 rounded-xl" style="background: ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}; color: ${accentColor};">
                ${copyIcon}
              </button>
              <button id="detail-share-btn" class="action-btn p-2 rounded-xl" style="background: ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}; color: ${accentColor};">
                ${shareIcon}
              </button>
            </div>
          </div>
        </div>
        
        <!-- Detail Content -->
        <div class="px-4 pb-4">
          <div id="detail-db-name" class="text-xs font-medium px-2 py-1 rounded-full inline-block mb-3" style="background: ${accentColor}20; color: ${accentColor};"></div>
          <div id="detail-content" class="definition-content text-theme-text/90 leading-relaxed"></div>
          <div style="height: 100px;"></div>
        </div>
      </div>
      `}
      
      <script>
        var currentViewMode = '${viewMode}';
        var currentWord = null;
        var allResults = [];
        var searchDebounceTimer = null;
        
        var listView = document.getElementById('list-view');
        var detailView = document.getElementById('detail-view');
        var cardsContainer = document.getElementById('cards-container');
        var initialState = document.getElementById('initial-state');
        var loadingState = document.getElementById('loading-state');
        var noResults = document.getElementById('no-results');
        var noResultsText = document.getElementById('no-results-text');
        var gridViewBtn = document.getElementById('grid-view-btn');
        var listViewBtn = document.getElementById('list-view-btn');
        var searchInput = document.getElementById('search-input');
        var clearSearchBtn = document.getElementById('clear-search');
        var countBadge = document.getElementById('count-badge');
        var countDisplay = document.getElementById('count-display');
        var backBtn = document.getElementById('back-btn');
        var detailDot = document.getElementById('detail-dot');
        var detailTitle = document.getElementById('detail-title');
        var detailDbName = document.getElementById('detail-db-name');
        var detailContent = document.getElementById('detail-content');
        var detailCopyBtn = document.getElementById('detail-copy-btn');
        var detailShareBtn = document.getElementById('detail-share-btn');
        var toast = document.getElementById('toast');
        
        function sendMessage(type, data) {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, data: data || {} }));
          }
        }
        
        function showToast(message) {
          if (toast) {
            toast.textContent = message;
            toast.classList.add('show');
            setTimeout(function() { toast.classList.remove('show'); }, 2000);
          }
        }
        
        function navigateToDownload() {
          sendMessage('navigateToDownload', {});
        }
        window.navigateToDownload = navigateToDownload;
        
        function getLetterColor(letter) {
          var colors = [
            '#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#1abc9c',
            '#3498db', '#9b59b6', '#e91e63', '#00bcd4', '#ff5722',
            '#795548', '#607d8b', '#8bc34a', '#ffc107', '#03a9f4'
          ];
          var index = (letter.toUpperCase().charCodeAt(0) - 65) % colors.length;
          return colors[Math.abs(index)] || colors[0];
        }
        
        function setViewMode(mode) {
          if (mode === currentViewMode) return;
          
          currentViewMode = mode;
          
          // Update all section-cards containers
          var sectionCards = document.querySelectorAll('.section-cards');
          for (var i = 0; i < sectionCards.length; i++) {
            sectionCards[i].classList.remove('grid-view', 'list-view');
            sectionCards[i].classList.add(mode + '-view');
          }
          
          if (mode === 'grid') {
            if (gridViewBtn) gridViewBtn.classList.add('active');
            if (listViewBtn) listViewBtn.classList.remove('active');
          } else {
            if (gridViewBtn) gridViewBtn.classList.remove('active');
            if (listViewBtn) listViewBtn.classList.add('active');
          }
          
          sendMessage('viewModeChange', { viewMode: mode });
        }
        window.setViewMode = setViewMode;
        
        function updateState(state) {
          if (initialState) initialState.classList.add('hidden');
          if (loadingState) loadingState.classList.add('hidden');
          if (noResults) noResults.classList.add('hidden');
          if (cardsContainer) cardsContainer.classList.add('hidden');
          if (countBadge) countBadge.classList.add('hidden');
          
          if (state === 'initial' && initialState) {
            initialState.classList.remove('hidden');
          } else if (state === 'loading' && loadingState) {
            loadingState.classList.remove('hidden');
          } else if (state === 'no-results' && noResults) {
            noResults.classList.remove('hidden');
          } else if (state === 'results' && cardsContainer) {
            cardsContainer.classList.remove('hidden');
            if (countBadge) countBadge.classList.remove('hidden');
          }
        }
        
        var expandedSections = {};
        
        function toggleSection(dbName) {
          var content = document.getElementById('section-content-' + dbName.replace(/\\s+/g, '-'));
          var chevron = document.getElementById('section-chevron-' + dbName.replace(/\\s+/g, '-'));
          
          if (content && chevron) {
            var isExpanded = content.classList.contains('expanded');
            if (isExpanded) {
              content.classList.remove('expanded');
              chevron.classList.remove('expanded');
              expandedSections[dbName] = false;
            } else {
              content.classList.add('expanded');
              chevron.classList.add('expanded');
              expandedSections[dbName] = true;
            }
          }
        }
        window.toggleSection = toggleSection;
        
        function expandAll() {
          var contents = document.querySelectorAll('.section-content');
          var chevrons = document.querySelectorAll('.section-chevron');
          for (var i = 0; i < contents.length; i++) {
            contents[i].classList.add('expanded');
          }
          for (var i = 0; i < chevrons.length; i++) {
            chevrons[i].classList.add('expanded');
          }
          for (var key in expandedSections) {
            expandedSections[key] = true;
          }
        }
        window.expandAll = expandAll;
        
        function collapseAll() {
          var contents = document.querySelectorAll('.section-content');
          var chevrons = document.querySelectorAll('.section-chevron');
          for (var i = 0; i < contents.length; i++) {
            contents[i].classList.remove('expanded');
          }
          for (var i = 0; i < chevrons.length; i++) {
            chevrons[i].classList.remove('expanded');
          }
          for (var key in expandedSections) {
            expandedSections[key] = false;
          }
        }
        window.collapseAll = collapseAll;
        
        function updateResults(data, isLoading) {
          allResults = data || [];
          
          if (isLoading) {
            updateState('loading');
            return;
          }
          
          var totalWords = 0;
          var dictCount = 0;
          var html = '';
          
          // Count dictionaries with results
          for (var i = 0; i < allResults.length; i++) {
            if (allResults[i].words && allResults[i].words.length > 0) {
              dictCount++;
            }
          }
          
          // Add expand/collapse controls if multiple dictionaries
          if (dictCount > 1) {
            html += '<div class="expand-controls">';
            html += '<button class="expand-btn" onclick="expandAll()">Expandir todo</button>';
            html += '<button class="expand-btn" onclick="collapseAll()">Colapsar todo</button>';
            html += '</div>';
          }
          
          for (var i = 0; i < allResults.length; i++) {
            var db = allResults[i];
            if (db.words && db.words.length > 0) {
              var dbKey = db.dbShortName.replace(/\\s+/g, '-');
              var isFirstDict = totalWords === 0;
              var shouldExpand = expandedSections[db.dbShortName] !== undefined ? expandedSections[db.dbShortName] : isFirstDict;
              
              html += '<div class="dictionary-section">';
              html += '<div class="section-header" onclick="toggleSection(\\'' + db.dbShortName.replace(/'/g, "\\\\'") + '\\')">';
              html += '<div class="section-header-left">';
              html += '<div class="section-icon">';
              html += '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">';
              html += '<path d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"/>';
              html += '</svg>';
              html += '</div>';
              html += '<span class="section-title">' + db.dbShortName + '</span>';
              html += '<span class="section-count">' + db.words.length + '</span>';
              html += '</div>';
              html += '<svg id="section-chevron-' + dbKey + '" class="section-chevron ' + (shouldExpand ? 'expanded' : '') + '" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">';
              html += '<path d="m6 9 6 6 6-6"/>';
              html += '</svg>';
              html += '</div>';
              
              html += '<div id="section-content-' + dbKey + '" class="section-content ' + (shouldExpand ? 'expanded' : '') + '">';
              html += '<div class="section-cards ' + currentViewMode + '-view">';
              
              for (var j = 0; j < db.words.length; j++) {
                var word = db.words[j];
                var letter = (word.topic || 'A').charAt(0).toUpperCase();
                var letterColor = getLetterColor(letter);
                
                html += '<div class="card" data-db="' + db.dbShortName + '" data-topic="' + (word.topic || '') + '" data-definition="' + encodeURIComponent(word.definition || '') + '">';
                html += '<div class="flex items-center gap-3">';
                html += '<div class="letter-badge" style="background: ' + letterColor + ';">' + letter + '</div>';
                html += '<div class="flex-1 min-w-0">';
                html += '<div class="card-title font-semibold text-theme-text truncate">' + (word.topic || 'Sin título') + '</div>';
                html += '</div>';
                html += '<svg class="card-arrow" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>';
                html += '</div>';
                html += '</div>';
                
                totalWords++;
              }
              
              html += '</div>';
              html += '</div>';
              html += '</div>';
              
              // Remember expansion state
              if (expandedSections[db.dbShortName] === undefined) {
                expandedSections[db.dbShortName] = shouldExpand;
              }
            }
          }
          
          if (totalWords === 0) {
            var query = searchInput ? searchInput.value : '';
            if (noResultsText) {
              noResultsText.textContent = query ? 'No se encontraron definiciones para "' + query + '"' : 'No se encontraron definiciones';
            }
            updateState('no-results');
          } else {
            if (cardsContainer) cardsContainer.innerHTML = html;
            if (countDisplay) countDisplay.textContent = totalWords;
            updateState('results');
            setupCardListeners();
          }
        }
        window.updateResults = updateResults;
        
        function showDetail(dbName, topic, definition, letterColor) {
          currentWord = { dbName: dbName, topic: topic, definition: definition };
          
          if (detailDot) {
            detailDot.style.backgroundColor = letterColor;
            detailDot.style.boxShadow = '0 0 8px ' + letterColor + '80';
          }
          if (detailTitle) detailTitle.textContent = topic;
          if (detailDbName) detailDbName.textContent = dbName;
          if (detailContent) detailContent.innerHTML = definition;
          
          if (listView) listView.classList.add('hidden');
          if (detailView) detailView.classList.add('visible');
          
          if (detailView) detailView.scrollTop = 0;
          
          sendMessage('detailViewOpened', { topic: topic });
        }
        
        function hideDetail() {
          if (detailView) detailView.classList.remove('visible');
          
          setTimeout(function() {
            if (listView) listView.classList.remove('hidden');
          }, 50);
          
          currentWord = null;
          
          sendMessage('detailViewClosed', {});
        }
        
        function copyDefinition() {
          if (currentWord) {
            sendMessage('copy', { 
              topic: currentWord.topic, 
              text: currentWord.definition.replace(/<[^>]*>/g, '') 
            });
            showToast('Copiado al portapapeles');
          }
        }
        
        function shareDefinition() {
          if (currentWord) {
            sendMessage('share', { 
              topic: currentWord.topic, 
              text: currentWord.definition.replace(/<[^>]*>/g, '') 
            });
          }
        }
        
        function handleSearch() {
          var query = searchInput ? searchInput.value.trim() : '';
          
          if (clearSearchBtn) {
            if (query.length > 0) {
              clearSearchBtn.classList.remove('hidden');
            } else {
              clearSearchBtn.classList.add('hidden');
            }
          }
          
          if (query.length < 3) {
            updateState('initial');
            return;
          }
          
          updateState('loading');
          sendMessage('search', { query: query });
        }
        
        function clearSearch() {
          if (searchInput) searchInput.value = '';
          if (clearSearchBtn) clearSearchBtn.classList.add('hidden');
          updateState('initial');
          sendMessage('search', { query: '' });
        }
        
        function setupCardListeners() {
          var cards = document.querySelectorAll('.card');
          for (var i = 0; i < cards.length; i++) {
            cards[i].onclick = function() {
              var dbName = this.getAttribute('data-db');
              var topic = this.getAttribute('data-topic');
              var definition = decodeURIComponent(this.getAttribute('data-definition') || '');
              var letter = topic.charAt(0).toUpperCase();
              var letterColor = getLetterColor(letter);
              showDetail(dbName, topic, definition, letterColor);
            };
          }
        }
        
        function setupEventListeners() {
          if (searchInput) {
            searchInput.addEventListener('input', function() {
              clearTimeout(searchDebounceTimer);
              searchDebounceTimer = setTimeout(handleSearch, 500);
            });
          }
          
          if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', clearSearch);
          }
          
          if (backBtn) {
            backBtn.addEventListener('click', hideDetail);
          }
          
          if (detailCopyBtn) {
            detailCopyBtn.addEventListener('click', copyDefinition);
          }
          
          if (detailShareBtn) {
            detailShareBtn.addEventListener('click', shareDefinition);
          }
          
          // Handle Bible verse links in detail content
          if (detailContent) {
            detailContent.addEventListener('click', function(e) {
              var link = e.target.closest('a');
              if (link) {
                e.preventDefault();
                var href = link.getAttribute('href');
                if (href) {
                  sendMessage('linkPress', { href: href });
                }
              }
            });
          }
          
          // Listen for messages from React Native (for back button handling)
          document.addEventListener('message', function(e) {
            try {
              var message = JSON.parse(e.data);
              if (message.type === 'goBackToList') {
                hideDetail();
              }
            } catch (err) {}
          });
          
          window.addEventListener('message', function(e) {
            try {
              var message = JSON.parse(e.data);
              if (message.type === 'goBackToList') {
                hideDetail();
              }
            } catch (err) {}
          });
        }
        
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', setupEventListeners);
        } else {
          setupEventListeners();
        }
      </script>
    </body>
    </html>
  `;
};

