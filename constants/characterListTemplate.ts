import { getTailwindStyleTag } from "@/hooks/useLoadTailwindScript";
import { getFontCss } from "@/hooks/useLoadFonts";
import { scriptDownloadHelpers } from "@/state/scriptDownloadState";
import { TTheme } from "@/types";
import { storedData$ } from "@/context/LocalstoreContext";

export type CharacterViewMode = 'grid' | 'list';

interface CharacterItem {
    topic: string;
    definition: string;
}

interface CharacterListTemplateProps {
    characters: CharacterItem[];
    theme: TTheme;
    fontSize?: number;
    viewMode?: CharacterViewMode;
}

const characterListStyles = (theme: TTheme, accentColor: string) => {
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
      
      .card.expanding {
        transform: scale(1.02);
        box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        z-index: 50;
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
      }
      
      .cards-container.grid-view .card-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }
      
      .cards-container.grid-view .card-title {
        font-size: 14px;
      }
      
      .cards-container.grid-view .card-preview {
        -webkit-line-clamp: 3;
        font-size: 13px;
      }
      
      .cards-container.grid-view .card-footer {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
      }
      
      .cards-container.grid-view .card-actions {
        justify-content: flex-start;
      }
      
      .cards-container.grid-view .card-actions .action-btn span {
        display: none;
      }
      
      /* List View Styles */
      .cards-container.list-view {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 0 8px;
      }
      
      .cards-container.list-view .card {
        margin-bottom: 0;
      }
      
      .cards-container.list-view .card-preview {
        -webkit-line-clamp: 2;
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
      
      /* Definition content styles */
      .definition-content {
        line-height: 1.7;
      }
      
      .definition-content a {
        color: ${accentColor};
        text-decoration: none;
        font-weight: 500;
        background: ${accentColor}15;
        padding: 2px 8px;
        border-radius: 6px;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
      }
      
      .definition-content a:active {
        background: ${accentColor}30;
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

export const characterListHtmlTemplate = ({
    characters,
    theme,
    fontSize = 16,
    viewMode = 'list',
}: CharacterListTemplateProps): string => {
    const themeSchema = theme.dark ? 'dark' : 'light';
    const isDark = theme.dark;
    const accentColor = isDark ? '#cec8ff' : theme.colors.notification;

    // SVG icons
    const gridIcon = `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"/>
  </svg>`;

    const listIcon = `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/>
  </svg>`;

    const searchIcon = `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="opacity: 0.5;">
    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
  </svg>`;

    const backIcon = `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/>
  </svg>`;

    const copyIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>`;

    const shareIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="18" cy="5" r="3"></circle>
    <circle cx="6" cy="12" r="3"></circle>
    <circle cx="18" cy="19" r="3"></circle>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
  </svg>`;

    const expandIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>`;

    // Serialize characters data for JavaScript
    const charactersJson = JSON.stringify(characters.map(c => ({
        topic: c.topic,
        definition: c.definition,
        plainDefinition: c.definition.replace(/<[^>]*>/g, ''),
        firstLetter: c.topic.charAt(0).toUpperCase(),
        letterColor: getLetterColor(c.topic.charAt(0).toUpperCase())
    })));

    const cardsHtml = characters.map((item, index) => {
        const firstLetter = item.topic.charAt(0).toUpperCase();
        const letterColor = getLetterColor(firstLetter);
        const plainDefinition = item.definition.replace(/<[^>]*>/g, '');
        const preview = plainDefinition.substring(0, 120) + (plainDefinition.length > 120 ? '...' : '');

        return `
      <div class="card bg-white dark:bg-white/8 border border-white/5 dark:border-white/5 rounded-2xl p-5 shadow-lg cursor-pointer overflow-x-hidden" 
           data-topic="${item.topic}"
           data-index="${index}">
        <!-- Header -->
        <div class="card-header flex items-center justify-between mb-3">
          <div class="flex items-center gap-2 flex-1 min-w-0">
            <div class="h-2.5 w-2.5 rounded-full flex-shrink-0" 
                 style="background-color: ${letterColor}; box-shadow: 0 0 8px ${letterColor}80;"></div>
            <span class="card-title text-sm font-semibold text-theme-text truncate">${item.topic}</span>
          </div>
        </div>
        
        <!-- Content -->
        <div class="relative pl-3 mb-3">
          <div class="absolute left-0 top-1 bottom-1 w-0.5 rounded-full" style="background-color: ${letterColor}66;"></div>
          <p class="card-preview text-[15px] leading-relaxed text-theme-text/80 m-0" style="display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden;">
            ${preview}
          </p>
        </div>
        
        <!-- Footer -->
        <div class="card-footer mt-2 flex items-center justify-between border-t border-white/5 dark:border-white/5 pt-3">
          <span class="text-xs font-medium text-theme-text/60">Personaje Bíblico</span>
          <div class="card-actions flex items-center gap-2">
            <button class="action-btn flex items-center gap-1 rounded-lg py-1 px-2 text-xs font-medium hover:bg-white/5 dark:hover:bg-white/5 transition-colors" 
                    style="color: ${accentColor};"
                    data-action="copy" 
                    data-index="${index}" 
                    title="Copiar">
              ${copyIcon}
            </button>
            <button class="action-btn flex items-center gap-1 rounded-lg py-1 px-2 text-xs font-medium hover:bg-white/5 dark:hover:bg-white/5 transition-colors" 
                    style="color: ${accentColor};"
                    data-action="share" 
                    data-index="${index}" 
                    title="Compartir">
              ${shareIcon}
            </button>
            <button class="action-btn flex items-center gap-1 rounded-lg py-1 pl-2 pr-1 text-xs font-medium hover:bg-white/5 dark:hover:bg-white/5 transition-colors" 
                    style="color: ${accentColor};"
                    data-action="expand" 
                    data-index="${index}" 
                    title="Ver más">
              <span>Ver más</span>
              ${expandIcon}
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
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
        </svg>
      </div>
      <p class="text-theme-text font-semibold text-lg mb-2">No se encontraron personajes</p>
      <p class="text-sm text-theme-text/50 max-w-xs">Intenta con otro término de búsqueda</p>
    </div>
  `;

    return `
    <!DOCTYPE html>
    <html data-theme="${themeSchema}">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <title>Personajes Bíblicos</title>
      ${scriptDownloadHelpers.getTailwindScript()}
      ${getTailwindStyleTag({ theme, fontSize })}
      ${getFontCss({ fontName: storedData$.selectedFont.get() || '' })}
      ${characterListStyles(theme, accentColor)}
    </head>
    <body class="p-0 m-0 text-theme-text bg-theme-background select-none overflow-x-hidden">
      
      <!-- Toast -->
      <div id="toast" class="toast"></div>
      
      <!-- List View -->
      <div id="list-view" class="px-1">
        <!-- Header -->
        <div class="sticky top-0 bg-theme-background z-10 pb-4 mb-2 px-1">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <svg class="w-6 h-6" style="color: ${accentColor};" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/>
              </svg>
              <h1 class="text-xl font-bold text-theme-text">Personajes Bíblicos</h1>
              <span class="text-xs font-medium px-2 py-0.5 rounded-full" 
                    style="background: ${accentColor}20; color: ${accentColor}"
                    >
                <span id="count-display">${characters.length}</span>
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
          
          <p class="text-sm text-theme-text/50 mb-3">Conoce a los personajes más importantes de la Biblia</p>
          
          <!-- Search -->
          <div class="search-container">
            ${searchIcon}
            <input type="text" 
                   id="search-input" 
                   class="search-input text-theme-text" 
                   placeholder="Buscar un personaje..."
                   autocomplete="off"
                   autocorrect="off"
                   autocapitalize="off"
                   spellcheck="false">
          </div>
        </div>
        
        <div id="cards-container" class="cards-container ${viewMode}-view" style="padding-bottom: 45vh;">
          ${characters.length > 0 ? cardsHtml : emptyStateHtml}
        </div>
        
        <div id="empty-search" class="hidden" style="padding-bottom: 45vh;">
          ${emptyStateHtml}
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
          <div id="detail-content" class="definition-content text-theme-text/90 leading-relaxed"></div>
          <div style="height: 100px;"></div>
        </div>
      </div>
      
      <script>
        (function() {
          // Data
          const charactersData = ${charactersJson};
          let currentViewMode = '${viewMode}';
          let currentCharacter = null;
          let currentIndex = -1;
          
          // DOM Elements
          const listView = document.getElementById('list-view');
          const detailView = document.getElementById('detail-view');
          const cardsContainer = document.getElementById('cards-container');
          const emptySearch = document.getElementById('empty-search');
          const gridViewBtn = document.getElementById('grid-view-btn');
          const listViewBtn = document.getElementById('list-view-btn');
          const searchInput = document.getElementById('search-input');
          const countDisplay = document.getElementById('count-display');
          const allCards = Array.from(document.querySelectorAll('.card'));
          const backBtn = document.getElementById('back-btn');
          const detailDot = document.getElementById('detail-dot');
          const detailTitle = document.getElementById('detail-title');
          const detailContent = document.getElementById('detail-content');
          const detailCopyBtn = document.getElementById('detail-copy-btn');
          const detailShareBtn = document.getElementById('detail-share-btn');
          const toast = document.getElementById('toast');
          
          // Show toast notification
          function showToast(message) {
            toast.textContent = message;
            toast.classList.add('show');
            setTimeout(() => {
              toast.classList.remove('show');
            }, 2000);
          }
          
          // Copy text
          function copyText(text, topic) {
            const fullText = topic + '\\n\\n' + text;
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'copy',
                data: { text: fullText, topic }
              }));
            }
            showToast('Copiado al portapapeles');
          }
          
          // Share text
          function shareText(text, topic) {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'share',
                data: { text, topic }
              }));
            }
          }
          
          // Normalize text for search (remove accents)
          function normalizeText(text) {
            return text.toLowerCase()
              .normalize('NFD')
              .replace(/[\\u0300-\\u036f]/g, '');
          }
          
          // Search functionality
          searchInput.addEventListener('input', function(e) {
            const query = normalizeText(e.target.value.trim());
            let visibleCount = 0;
            
            allCards.forEach(card => {
              const topic = normalizeText(card.dataset.topic || '');
              const isMatch = query === '' || topic.includes(query);
              card.style.display = isMatch ? '' : 'none';
              if (isMatch) visibleCount++;
            });
            
            countDisplay.textContent = visibleCount;
            
            if (visibleCount === 0 && query !== '') {
              cardsContainer.classList.add('hidden');
              emptySearch.classList.remove('hidden');
            } else {
              cardsContainer.classList.remove('hidden');
              emptySearch.classList.add('hidden');
            }
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
          
          // Show detail view with animation
          function showDetail(index, cardElement) {
            const character = charactersData[index];
            if (!character) return;
            
            currentCharacter = character;
            currentIndex = index;
            
            // Add expanding animation to card
            if (cardElement) {
              cardElement.classList.add('expanding');
            }
            
            // Update detail view content
            detailDot.style.backgroundColor = character.letterColor;
            detailDot.style.boxShadow = '0 0 8px ' + character.letterColor + '80';
            detailTitle.textContent = character.topic;
            detailContent.innerHTML = character.definition;
            
            // Animate transition after a brief delay for the card animation
            setTimeout(() => {
              if (cardElement) {
                cardElement.classList.remove('expanding');
              }
              listView.classList.add('hidden');
              detailView.classList.add('visible');
              
              // Scroll to top of detail view
              detailView.scrollTop = 0;
              
              // Notify React Native that detail view is opened
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'detailViewOpened',
                  data: { topic: character.topic }
                }));
              }
            }, 150);
          }
          
          // Hide detail view
          function hideDetail() {
            detailView.classList.remove('visible');
            
            setTimeout(() => {
              listView.classList.remove('hidden');
            }, 50);
            
            currentCharacter = null;
            currentIndex = -1;
            
            // Notify React Native that detail view is closed
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'detailViewClosed',
                data: {}
              }));
            }
          }
          
          // Back button
          backBtn.addEventListener('click', hideDetail);
          
          // Listen for messages from React Native (for back button handling)
          document.addEventListener('message', function(e) {
            try {
              const message = JSON.parse(e.data);
              if (message.type === 'goBackToList') {
                hideDetail();
              }
            } catch (err) {}
          });
          
          // Also handle window message for iOS
          window.addEventListener('message', function(e) {
            try {
              const message = JSON.parse(e.data);
              if (message.type === 'goBackToList') {
                hideDetail();
              }
            } catch (err) {}
          });
          
          // Detail view copy button
          detailCopyBtn.addEventListener('click', function() {
            if (currentCharacter) {
              copyText(currentCharacter.plainDefinition, currentCharacter.topic);
            }
          });
          
          // Detail view share button
          detailShareBtn.addEventListener('click', function() {
            if (currentCharacter) {
              shareText(currentCharacter.plainDefinition, currentCharacter.topic);
            }
          });
          
          // Handle Bible verse links in detail content
          detailContent.addEventListener('click', function(e) {
            const link = e.target.closest('a');
            if (link) {
              e.preventDefault();
              const href = link.getAttribute('href');
              if (href && window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'linkPress',
                  data: { href }
                }));
              }
            }
          });
          
          // Card click handlers
          function setupEventListeners() {
            const cards = document.querySelectorAll('.card');
            
            cards.forEach(card => {
              // Action buttons
              const actionBtns = card.querySelectorAll('.action-btn');
              actionBtns.forEach(btn => {
                btn.addEventListener('click', function(e) {
                  e.stopPropagation();
                  const action = this.dataset.action;
                  const index = parseInt(this.dataset.index, 10);
                  const character = charactersData[index];
                  
                  if (!character) return;
                  
                  if (action === 'copy') {
                    copyText(character.plainDefinition, character.topic);
                  } else if (action === 'share') {
                    shareText(character.plainDefinition, character.topic);
                  } else if (action === 'expand') {
                    showDetail(index, card);
                  }
                });
              });
              
              // Card click - show inline detail
              card.addEventListener('click', function(e) {
                // Don't trigger if clicking action buttons
                if (e.target.closest('.action-btn')) return;
                
                const index = parseInt(this.dataset.index, 10);
                showDetail(index, this);
              });
            });
          }
          
          // Run when DOM is ready
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupEventListeners);
          } else {
            setupEventListeners();
          }
        })();
      </script>
    </body>
    </html>
  `;
};
