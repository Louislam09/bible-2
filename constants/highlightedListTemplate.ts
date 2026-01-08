import { getTailwindStyleTag } from "@/hooks/useLoadTailwindScript";
import { getFontCss } from "@/hooks/useLoadFonts";
import { scriptDownloadHelpers } from "@/state/scriptDownloadState";
import { THighlightedVerse } from "@/services/highlightService";
import { TTheme } from "@/types";
import { getBookDetail } from "./BookNames";
import { renameLongBookName } from "@/utils/extractVersesInfo";
import { getVerseTextRaw } from "@/utils/getVerseTextRaw";
import { storedData$ } from "@/context/LocalstoreContext";
import { lucideIcons } from "@/utils/lucideIcons";

export const highlightedListHtmlTemplate = (
  highlights: THighlightedVerse[],
  theme: TTheme,
  versionShortName: string,
  formatTimeAgo: (timestamp: number | string) => string,
  fontSize: number = 16,
  selectedFont?: string
): string => {
  const themeSchema = theme.dark ? 'dark' : 'light';
  const accentColor = theme.colors.notification || theme.colors.primary;

  const cardsHtml = highlights.map((item) => {
    const verseReference = `${renameLongBookName(item.bookName || getBookDetail(item.book_number).longName)} ${item.chapter}:${item.verse}`;
    const verseText = item.text ? getVerseTextRaw(item.text) : "";
    const timeAgo = formatTimeAgo(item.created_at);
    const colorDot = item.color;
    const borderAccent = item.color + "66";

    return `
      <div class="card bg-white dark:bg-white/8 border border-white/5 dark:border-white/5 rounded-2xl p-5 mb-4 shadow-lg cursor-pointer transition-all hover:bg-white/80 dark:hover:bg-white/10 active:scale-[0.99] active:opacity-95" 
           data-id="${item.id}" 
           data-book="${item.book_number}" 
           data-chapter="${item.chapter}" 
           data-verse="${item.verse}">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2 flex-1">
            <div class="h-2.5 w-2.5 rounded-full flex-shrink-0" 
                 style="background-color: ${colorDot}; box-shadow: 0 0 8px ${colorDot}80;"></div>
            <span class="text-sm font-semibold text-theme-text">${verseReference}</span>
          </div>
          <span class="text-[10px] font-medium uppercase tracking-wider text-theme-text/60">${timeAgo.toUpperCase()}</span>
        </div>
        <div class="relative pl-3 mb-3">
          <div class="absolute left-0 top-1 bottom-1 w-0.5 rounded-full" style="background-color: ${borderAccent};"></div>
          <p class="text-[15px] leading-relaxed text-theme-text/80 group-hover:text-theme-text transition-colors m-0">
            ${verseText}
          </p>
        </div>
        <div class="mt-2 flex items-center justify-between border-t border-white/5 dark:border-white/5 pt-3">
          <span class="text-xs font-medium text-theme-text/60">${versionShortName}</span>
          <div class="flex items-center gap-2">
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

  return `
    <!DOCTYPE html>
    <html data-theme="${themeSchema}">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <title>Highlighted Verses</title>
      ${scriptDownloadHelpers.getTailwindScript()}
      ${getTailwindStyleTag({ theme, fontSize })}
      ${getFontCss({ fontName: storedData$.selectedFont.get() || '' })}
      <style>
        body {
          -webkit-font-smoothing: antialiased;
          user-select: none;
          -webkit-user-select: none;
        }
      </style>
    </head>
    <body class="p-4 m-0 text-theme-text bg-theme-background select-none">
      <!-- Header -->
      <div class="sticky top-0 bg-theme-background z-10 pb-4 mb-2">
        <div class="flex items-center gap-2 mb-1">
          <span class="w-6 h-6" style="color:  #4dcd8d;">${lucideIcons.highlighter}</span>
          <h1 class="text-xl font-bold text-theme-text">Mis Destacados</h1>
          <span class="text-xs font-medium px-2 py-0.5 rounded-full" 
                style="background: rgba(77, 205, 141, 0.2); color: #4dcd8d;">
            ${highlights.length}
          </span>
        </div>
        <p class="text-sm text-theme-text/50">Versículos resaltados durante tu estudio</p>
      </div>
      
      <div id="cards-container" style="padding-bottom: 45vh;">
        ${cardsHtml || `
          <div class="flex flex-col items-center justify-center py-16 px-8 text-center">
            <div class="w-20 h-20 rounded-2xl flex items-center justify-center mb-5" style="background: rgba(77, 205, 141, 0.15);">
              <svg class="w-10 h-10" style="color: #4dcd8d;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
              </svg>
            </div>
            <p class="text-theme-text font-semibold text-lg mb-2">Sin destacados aún</p>
            <p class="text-sm text-theme-text/50 max-w-xs">Selecciona texto y usa el resaltador para marcar versículos importantes</p>
          </div>
        `}
      </div>
      
      <script>
        (function() {
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

