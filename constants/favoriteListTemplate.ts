import { getTailwindStyleTag } from "@/hooks/useLoadTailwindScript";
import { getFontCss } from "@/hooks/useLoadFonts";
import { scriptDownloadHelpers } from "@/state/scriptDownloadState";
import { IVerseItem } from "@/types";
import { TTheme } from "@/types";
import { getBookDetail } from "./BookNames";
import { renameLongBookName } from "@/utils/extractVersesInfo";
import { getVerseTextRaw } from "@/utils/getVerseTextRaw";
import { storedData$ } from "@/context/LocalstoreContext";

export type FavoriteViewMode = 'grid' | 'list';

interface FavoriteListTemplateProps {
  favorites: (IVerseItem & { id: number })[];
  theme: TTheme;
  versionShortName: string;
  fontSize?: number;
  selectedFont?: string;
  viewMode?: FavoriteViewMode;
}

const favoriteListStyles = (theme: TTheme) => {
  const isDark = theme.dark;
  const accentColor = '#fedf75';

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
      
      .card:active {
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
        padding: 12px;
        margin-bottom: 0;
        min-width: 0;
      }
      
      .cards-container.grid-view .card-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }
      
      .cards-container.grid-view .verse-text {
        -webkit-line-clamp: 3;
        font-size: 13px;
      }
      
      .cards-container.grid-view .card-footer {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
      }
      
      .cards-container.grid-view .card-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        justify-content: flex-start;
      }
      
      .cards-container.grid-view .card-actions .action-btn {
        padding: 4px 6px;
      }
      
      .cards-container.grid-view .card-actions .action-btn svg {
        width: 16px;
        height: 16px;
      }
      
      .cards-container.grid-view .card-actions .action-btn span {
        display: none;
      }
      
      /* List View Styles */
      .cards-container.list-view {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 0 8px;
      }
      
      .cards-container.list-view .card {
        margin-bottom: 0;
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
      
      @media (max-width: 360px) {
        .cards-container.grid-view {
          grid-template-columns: 1fr;
        }
      }
      
      .scrollbar-hide::-webkit-scrollbar { display: none; }
      .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    </style>
  `;
};

export const favoriteListHtmlTemplate = ({
  favorites,
  theme,
  versionShortName,
  fontSize = 16,
  selectedFont,
  viewMode = 'list',
}: FavoriteListTemplateProps): string => {
  const themeSchema = theme.dark ? 'dark' : 'light';
  const isDark = theme.dark;
  const accentColor = '#fedf75';

  // SVG icons for view toggle
  const gridIcon = `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"/>
  </svg>`;

  const listIcon = `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/>
  </svg>`;

  const cardsHtml = favorites.map((item) => {
    const verseReference = `${renameLongBookName(item.bookName || getBookDetail(item.book_number).longName)} ${item.chapter}:${item.verse}`;
    const verseText = item.text ? getVerseTextRaw(item.text) : "";

    return `
      <div class="card bg-white dark:bg-white/8 border border-white/5 dark:border-white/5 rounded-2xl p-5 shadow-lg cursor-pointer transition-all hover:bg-white/80 dark:hover:bg-white/10" 
           data-id="${item.id}" 
           data-book="${item.book_number}" 
           data-chapter="${item.chapter}" 
           data-verse="${item.verse}">
        <div class="card-header flex items-center justify-between mb-3">
          <div class="flex items-center gap-2 flex-1 min-w-0">
            <div class="h-2.5 w-2.5 rounded-full flex-shrink-0" 
                 style="background-color: ${accentColor}; box-shadow: 0 0 8px ${accentColor}80;"></div>
            <span class="text-sm font-semibold text-theme-text truncate">${verseReference}</span>
          </div>
        </div>
        <div class="relative pl-3 mb-3">
          <div class="absolute left-0 top-1 bottom-1 w-0.5 rounded-full" style="background-color: ${accentColor}66;"></div>
          <p class="verse-text text-[15px] leading-relaxed text-theme-text/80 group-hover:text-theme-text transition-colors m-0" style="display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden;">
            ${verseText}
          </p>
        </div>
        <div class="card-footer mt-2 flex items-center justify-between border-t border-white/5 dark:border-white/5 pt-3">
          <span class="text-xs font-medium text-theme-text/60">${versionShortName}</span>
          <div class="card-actions flex items-center gap-2">
            <button class="action-btn flex items-center gap-1 rounded-lg py-1 px-2 text-xs font-medium text-theme-notification hover:bg-white/5 dark:hover:bg-white/5 transition-colors" 
                    data-action="copy" 
                    data-id="${item.id}" 
                    title="Copiar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
            <button class="action-btn flex items-center gap-1 rounded-lg py-1 px-2 text-xs font-medium text-theme-notification hover:bg-white/5 dark:hover:bg-white/5 transition-colors" 
                    data-action="share" 
                    data-id="${item.id}" 
                    title="Compartir">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
            </button>
            <button class="action-btn flex items-center gap-1 rounded-lg py-1 px-2 text-xs font-medium text-red-500 hover:bg-red-500/10 dark:hover:bg-red-500/10 transition-colors" 
                    data-action="delete" 
                    data-id="${item.id}" 
                    title="Eliminar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
            <button class="action-btn flex items-center gap-1 rounded-lg py-1 pl-2 pr-1 text-xs font-medium text-theme-notification hover:bg-white/5 dark:hover:bg-white/5 transition-colors" 
                    data-action="context" 
                    data-id="${item.id}" 
                    title="Ir al Contexto">
              <span>Ir al Contexto</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  const emptyStateHtml = `
    <div class="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div class="w-20 h-20 rounded-2xl flex items-center justify-center mb-5" style="background: rgba(254, 223, 117, 0.15);">
        <svg class="w-10 h-10" style="color: #fedf75;" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
      </div>
      <p class="text-theme-text font-semibold text-lg mb-2">Sin favoritos aún</p>
      <p class="text-sm text-theme-text/50 max-w-xs">Marca versículos como favoritos tocando el icono de estrella mientras lees</p>
    </div>
  `;

  return `
    <!DOCTYPE html>
    <html data-theme="${themeSchema}">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <title>Favorite Verses</title>
      ${scriptDownloadHelpers.getTailwindScript()}
      ${getTailwindStyleTag({ theme, fontSize })}
      ${getFontCss({ fontName: storedData$.selectedFont.get() || '' })}
      ${favoriteListStyles(theme)}
    </head>
    <body class="p-4 m-0 text-theme-text bg-theme-background select-none overflow-x-hidden">
      <!-- Header -->
      <div class="sticky top-0 bg-theme-background z-10 pb-4 mb-2 px-1">
        <div class="flex items-center justify-between mb-1">
          <div class="flex items-center gap-2">
            <svg class="w-6 h-6" style="color: #fedf75;" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
            <h1 class="text-xl font-bold text-theme-text">Mis Favoritos</h1>
            <span class="text-xs font-medium px-2 py-0.5 rounded-full" 
                  style="background: rgba(254, 223, 117, 0.2); color: #fedf75;">
              ${favorites.length}
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
        <p class="text-sm text-theme-text/50">Versículos guardados para lectura rápida</p>
      </div>
      
      <div id="cards-container" class="cards-container ${viewMode}-view" style="padding-bottom: 45vh;">
        ${favorites.length > 0 ? cardsHtml : emptyStateHtml}
      </div>
      
      <script>
        (function() {
          let currentViewMode = '${viewMode}';
          const cardsContainer = document.getElementById('cards-container');
          const gridViewBtn = document.getElementById('grid-view-btn');
          const listViewBtn = document.getElementById('list-view-btn');
          
          // View mode function
          window.setViewMode = function(mode) {
            if (mode === currentViewMode) return;
            
            currentViewMode = mode;
            
            // Update container class
            cardsContainer.classList.remove('grid-view', 'list-view');
            cardsContainer.classList.add(mode + '-view');
            
            // Update button states
            if (mode === 'grid') {
              gridViewBtn.classList.add('active');
              listViewBtn.classList.remove('active');
            } else {
              gridViewBtn.classList.remove('active');
              listViewBtn.classList.add('active');
            }
            
            // Notify React Native
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'viewModeChange',
                data: { viewMode: mode }
              }));
            }
          };
          
          function setupEventListeners() {
            const cards = document.querySelectorAll('.card');
            
            cards.forEach(card => {
              // Card click - go to context
              card.addEventListener('click', function(e) {
                // Don't trigger if clicking on action buttons or their children
                if (e.target.closest('.action-btn')) {
                  return;
                }
                
                const id = this.dataset.id;
                const book = this.dataset.book;
                const chapter = this.dataset.chapter;
                const verse = this.dataset.verse;
                
                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'goToContext',
                    data: { id, book, chapter, verse }
                  }));
                }
              });
              
              // Action button clicks
              const actionButtons = card.querySelectorAll('.action-btn');
              actionButtons.forEach(btn => {
                btn.addEventListener('click', function(e) {
                  e.stopPropagation();
                  e.preventDefault();
                  
                  const action = this.dataset.action;
                  const id = this.dataset.id;
                  const cardEl = this.closest('.card');
                  
                  if (!cardEl) return;
                  
                  const book = cardEl.dataset.book;
                  const chapter = cardEl.dataset.chapter;
                  const verse = cardEl.dataset.verse;
                  
                  if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: action,
                      data: { id, book, chapter, verse }
                    }));
                  }
                });
              });
            });
          }
          
          // Run when DOM is ready
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupEventListeners);
          } else {
            // DOM is already loaded
            setupEventListeners();
          }
        })();
      </script>
    </body>
    </html>
  `;
};
