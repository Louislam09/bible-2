import { getTailwindStyleTag } from "@/hooks/useLoadTailwindScript";
import { getFontCss } from "@/hooks/useLoadFonts";
import { scriptDownloadHelpers } from "@/state/scriptDownloadState";
import { TTheme } from "@/types";
import { storedData$ } from "@/context/LocalstoreContext";
import { renameLongBookName } from "@/utils/extractVersesInfo";
import { lucideIcons } from "@/utils/lucideIcons";

export type HistoryViewMode = 'list';

interface HistoryItem {
  id?: number;
  book: string;
  chapter: number;
  verse: number;
  created_at: string;
}

interface HistoryListTemplateProps {
  history: HistoryItem[];
  theme: TTheme;
  fontSize?: number;
}

const historyListStyles = (theme: TTheme) => {
  const isDark = theme.dark;
  const accentColor = isDark ? '#60a5fa' : '#3b82f6';

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
      }
      
      .card:active {
        transform: scale(0.98);
        opacity: 0.9;
      }
      
      /* List View Styles */
      .cards-container {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 0 8px;
      }
      
      .cards-container .card {
        margin-bottom: 0;
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
      
      .scrollbar-hide::-webkit-scrollbar { display: none; }
      .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    </style>
  `;
};

export const historyListHtmlTemplate = ({
  history,
  theme,
  fontSize = 16,
}: HistoryListTemplateProps): string => {
  const themeSchema = theme.dark ? 'dark' : 'light';
  const isDark = theme.dark;
  const accentColor = isDark ? '#60a5fa' : '#3b82f6';

  // Generate history cards HTML similar to highlighted cards
  const historyCardsHtml = history.map((item, index) => {
    const reference = `${renameLongBookName(item.book)} ${item.chapter}:${item.verse}`;
    const timeAgo = item.created_at || '-';
    
    return `
      <div class="card bg-white dark:bg-white/8 border border-white/5 dark:border-white/5 rounded-2xl p-4 shadow-lg cursor-pointer transition-all hover:bg-white/80 dark:hover:bg-white/10" 
           data-id="${item.id}"
           data-book="${item.book}"
           data-chapter="${item.chapter}"
           data-verse="${item.verse}"
           data-index="${index}">
        <div class="card-header flex items-center justify-between mb-3">
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" 
                 style="background: ${accentColor}20;">
              <svg class="w-5 h-5" style="color: ${accentColor};" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
              </svg>
            </div>
            <div class="flex flex-col min-w-0">
              <span class="text-base font-semibold text-theme-text truncate">${reference}</span>
              <span class="text-xs text-theme-text/50">${timeAgo}</span>
            </div>
          </div>
        </div>
        <div class="card-footer flex items-center justify-end border-t border-white/5 dark:border-white/5 pt-3">
          <div class="card-actions flex items-center gap-2">
            <button class="action-btn flex items-center gap-1 rounded-lg py-1 px-2 text-xs font-medium text-red-500 hover:bg-red-500/10 dark:hover:bg-red-500/10 transition-colors" 
                    data-action="delete" 
                    data-id="${item.id}" 
                    title="Eliminar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
            <button class="action-btn flex items-center gap-1 rounded-lg py-1 pl-2 pr-1 text-xs font-medium hover:bg-white/5 dark:hover:bg-white/5 transition-colors" 
                    style="color: ${accentColor};"
                    data-action="goToVerse" 
                    data-id="${item.id}" 
                    title="Ir al Versículo">
              <span>Ir al Versículo</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
      <div class="w-20 h-20 rounded-2xl flex items-center justify-center mb-5" style="background: ${accentColor}15;">
        <svg class="w-10 h-10" style="color: ${accentColor};" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </div>
      <p class="text-theme-text font-semibold text-lg mb-2">No se encontró historial</p>
      <p class="text-sm text-theme-text/50 max-w-xs">Los versículos que leas aparecerán aquí</p>
    </div>
  `;

  return `
    <!DOCTYPE html>
    <html data-theme="${themeSchema}">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <title>Historial</title>
      ${scriptDownloadHelpers.getTailwindScript()}
      ${getTailwindStyleTag({ theme, fontSize })}
      ${getFontCss({ fontName: storedData$.selectedFont.get() || '' })}
      ${historyListStyles(theme)}
    </head>
    <body class="p-4 m-0 text-theme-text bg-theme-background select-none overflow-x-hidden">
      
      <!-- Toast -->
      <div id="toast" class="toast"></div>
      
      <!-- Header -->
      <div class="sticky top-0 bg-theme-background z-10 pb-4 mb-2 px-1">
        <div class="flex items-center justify-between mb-1">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6" style="color: ${accentColor};">${lucideIcons.history}</span>
            <h1 class="text-xl font-bold text-theme-text">Historial</h1>
            <span class="text-xs font-medium px-2 py-0.5 rounded-full" 
                  style="background: ${accentColor}20; color: ${accentColor};">
              ${history.length}
            </span>
          </div>
        </div>
        <p class="text-sm text-theme-text/50">Versículos que has visitado recientemente</p>
      </div>
      
      <!-- History List -->
      <div id="cards-container" class="cards-container" style="padding-bottom: 100px;">
        ${history.length > 0 ? historyCardsHtml : emptyStateHtml}
      </div>
      
      <script>
        (function() {
          const toast = document.getElementById('toast');
          const cardsContainer = document.getElementById('cards-container');
          
          // Show toast
          function showToast(message) {
            toast.textContent = message;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 2000);
          }
          
          // Setup event listeners
          function setupListeners() {
            const cards = cardsContainer.querySelectorAll('.card');
            cards.forEach(card => {
              // Card click - navigate to verse
              card.addEventListener('click', function(e) {
                if (e.target.closest('.action-btn')) return;
                
                const book = this.dataset.book;
                const chapter = parseInt(this.dataset.chapter, 10);
                const verse = parseInt(this.dataset.verse, 10);
                
                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'goToVerse',
                    data: { book, chapter, verse }
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
                  const id = parseInt(this.dataset.id, 10);
                  const cardEl = this.closest('.card');
                  
                  if (!cardEl) return;
                  
                  const book = cardEl.dataset.book;
                  const chapter = parseInt(cardEl.dataset.chapter, 10);
                  const verse = parseInt(cardEl.dataset.verse, 10);
                  
                  if (action === 'delete') {
                    if (window.ReactNativeWebView) {
                      window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'deleteItem',
                        data: { id }
                      }));
                    }
                    
                    // Remove card with animation
                    cardEl.style.transition = 'all 0.3s ease';
                    cardEl.style.opacity = '0';
                    cardEl.style.transform = 'translateX(-100%)';
                    setTimeout(() => {
                      cardEl.remove();
                      
                      // Update count badge
                      const remainingCards = cardsContainer.querySelectorAll('.card');
                      const countBadge = document.querySelector('[style*="background: ${accentColor.replace('#', '\\\\#')}20"]');
                      if (countBadge) {
                        countBadge.textContent = remainingCards.length;
                      }
                      
                      // Check if empty
                      if (remainingCards.length === 0) {
                        cardsContainer.innerHTML = \`
                          <div class="flex flex-col items-center justify-center py-16 px-8 text-center">
                            <div class="w-20 h-20 rounded-2xl flex items-center justify-center mb-5" style="background: ${accentColor}15;">
                              <svg class="w-10 h-10" style="color: ${accentColor};" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                              </svg>
                            </div>
                            <p class="text-theme-text font-semibold text-lg mb-2">No se encontró historial</p>
                            <p class="text-sm text-theme-text/50 max-w-xs">Los versículos que leas aparecerán aquí</p>
                          </div>
                        \`;
                      }
                    }, 300);
                    
                    showToast('Eliminado del historial');
                  } else if (action === 'goToVerse') {
                    if (window.ReactNativeWebView) {
                      window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'goToVerse',
                        data: { book, chapter, verse }
                      }));
                    }
                  }
                });
              });
            });
          }
          
          // Initial setup
          setupListeners();
        })();
      </script>
    </body>
    </html>
  `;
};
