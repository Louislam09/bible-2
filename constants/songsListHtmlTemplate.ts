import { TSongItem, TTheme } from "@/types";
import { getTailwindStyleTag } from "@/hooks/useLoadTailwindScript";
import { scriptDownloadHelpers } from "@/state/scriptDownloadState";
import { getFontCss } from "@/hooks/useLoadFonts";
import { createInlineIcon, lucideIcons } from "@/utils/lucideIcons";

// Create HTML head
const createHtmlHead = (theme: TTheme, fontSize: number, selectedFont?: string) => `
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Himnario</title>
    ${getFontCss({ fontName: selectedFont || '' })}
    ${getTailwindStyleTag({ theme, fontSize })}
    ${scriptDownloadHelpers.getTailwindScript()}
    ${scriptDownloadHelpers.getFuseScript()}
    <style type="text/tailwindcss">
      @theme {
        --color-theme-text: ${theme.colors.text || '#1f2937'};
        --color-theme-background: ${theme.colors.background || '#ffffff'};
        --color-theme-card: ${theme.colors.card || '#f8fafc'};
        --color-theme-border: ${theme.colors.border || '#e5e7eb'};
        --color-theme-primary: ${theme.colors.primary || '#3b82f6'};
        --color-theme-notification: ${theme.colors.notification || '#ef4444'};
      }
      @keyframes slideInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      .animate-slide-in-up {
        animation: slideInUp 0.5s ease-out backwards;
      }
      .animate-spin-slow {
        animation: spin 0.8s linear infinite;
      }
      .song-card:hover {
        border-color: ${theme.colors.notification}40;
      }
      .song-card:hover .song-icon-container {
        transform: scale(1.1) rotate(5deg);
      }
      .song-icon-container svg {
        width: 100%;
        height: 100%;
      }

      .song-bg-decoration svg {
        width: 100%;
        height: 100%;
      }

      .song-card:hover .song-bg-decoration {
        transform: scale(1.1) rotate(10deg);
      }
      .search-box:focus-within {
        border-color: ${theme.colors.notification};
        box-shadow: 0 0 0 3px ${theme.colors.notification}20;
      }
    </style>
  </head>
`;

// Escape HTML to prevent XSS
const escapeHtml = (text: string): string => {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Create song card HTML
const createSongCard = (song: TSongItem, index: number, theme: TTheme) => {
  const songNumber = song.id || '-';
  const songTitle = song.title?.split('-')[1]?.trim() || song.title || '-';
  const stanzasCount = song.stanzas?.length || 0;
  const stanzasText = stanzasCount === 1 ? 'Estrofa' : 'Estrofas';
  const animationDelay = Math.min(index * 0.05, 0.25)
  const gradientDir = index % 2 === 0 ? 'r' : 'l';

  return `
  <div class="relative  bg-gradient-to-${gradientDir} from-[${theme.colors.notification}70] to-[${theme.colors.text}80] rounded-[20px] p-[1px]">
    <div 
       class="
    song-card
  bg-theme-card
    rounded-[20px]
    p-3
    flex items-center gap-4
    cursor-pointer
    transition-all duration-300
    ease-[cubic-bezier(0.4,0,0.2,1)]
    relative overflow-hidden
    animate-slide-in-up
    hover:-translate-y-0.5
    hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)]
    active:scale-[0.98]
  "
      style="animation-delay: ${animationDelay}s;"
      data-song-id="${escapeHtml(String(song.id))}" 
      data-index="${index}"
    >
      <div 
        class="song-icon-container w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 ease-in-out text-theme-notification " 
      >
         <div class="text-font-5xl font-bold bg-gradient-to-${gradientDir} from-theme-text to-theme-notification bg-clip-text text-transparent">${escapeHtml(String(songNumber))}</div>
      </div>
      <div class="flex-1 min-w-0">
        <div class="text-font-base font-semibold text-theme-text leading-[1.4] overflow-hidden text-ellipsis line-clamp-2">${escapeHtml(songTitle)}</div>
        <div class="text-font-base font-bold text-theme-notification" >${escapeHtml(stanzasText)}: ${stanzasCount}</div>
      </div>
      <div class="song-bg-decoration !bg-gradient-to-${gradientDir} from-[${theme.colors.text}40] to-[${theme.colors.notification}10]  dark:[&>svg]:stroke-[${theme.colors.text}90] rotate-12 absolute -top-3 right-1 z-0 w-16 h-28  pointer-events-none transition-transform duration-300 ease-in-out">
        ${lucideIcons.music4}
      </div>
    </div>
  </div>
  `;
};

// Helper function to remove accents (similar to removeAccent utility)
const removeAccentJs = `
function removeAccent(text) {
  return text
    .normalize('NFD')
    .replace(/[\\u0300-\\u036f]/g, '')
    .toLowerCase();
}
`;

// Helper function to create empty state HTML
const createEmptyStateHtml = (theme: TTheme, isSearchResult: boolean = false) => {
  const secondaryTextColor = + '80';

  return `
    <div class="flex flex-col items-center justify-center py-[80px] px-6 text-center animate-slide-in-up">
      <div 
        class=" w-24 h-24 bg-[${theme.colors.notification}20] mb-6 rounded-full flex items-center justify-center transition-all duration-300"
      >
        <div class="w-16 h-16 [&>svg]:w-full [&>svg]:h-full">
          ${lucideIcons.music4}
        </div>
      </div>
      <h3 
        class="text-font-5xl font-bold mb-3 text-theme-text"
      >
        ${isSearchResult ? 'No se encontraron resultados' : 'No hay himnos disponibles'}
      </h3>
      <p 
        class="text-font-base max-w-md mx-auto leading-relaxed text-[${theme.colors.text}80]"
      >
        ${isSearchResult
      ? 'Intenta buscar con diferentes palabras clave o verifica la ortografía de tu búsqueda.'
      : 'No hay himnos disponibles en este momento.'}
      </p>
      ${isSearchResult ? `
        <div 
          class="mt-6 px-4 py-2 rounded-lg inline-flex items-center gap-2"
          style="background-color: ${theme.colors.card}; border: 1px solid ${theme.colors.border};"
        >
          <svg class="w-4 h-4" style="color: ${theme.colors.notification};" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <span class="text-font-sm" style="color: ${secondaryTextColor};">
            Busca por título o número de himno
          </span>
        </div>
      ` : ''}
    </div>
  `;
};

// Create HTML body
const createHtmlBody = (songs: TSongItem[], theme: TTheme, fontSize: number, selectedFont?: string, searchQuery: string = '') => {
  // Store all songs data as JSON for client-side filtering
  const songsDataJson = JSON.stringify(songs);

  // Initial songs HTML (all songs)
  const initialSongsHtml = songs.length > 0
    ? songs.map((song, index) => createSongCard(song, index, theme)).join('')
    : createEmptyStateHtml(theme, false);

  return `
    <body class="bg-theme-background text-theme-text overflow-x-hidden px-1 pb-8" >
      <div class="sticky top-0 z-10 bg-theme-background pb-3 mb-2">
     <div
      class="
        rounded-2xl p-[1px]
        bg-gradient-to-r
        from-[${theme.colors.notification}80]
        via-[${theme.colors.text}80]
        to-[${theme.colors.notification}70]
        bg-[length:200%_200%]
        bg-left
        transition-[background-position] duration-500 ease-out
        focus-within:bg-right
      "
    >
        <div class="bg-theme-card flex items-center rounded-2xl px-4 py-4 gap-3 transition-all duration-200">
          <svg class="w-5 h-5 flex-shrink-0 opacity-90" style="color: ${theme.colors.text}90;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input 
            type="text" 
            class="flex-1 border-0 outline-none bg-transparent text-theme-text text-font-base font-inherit placeholder:opacity-60" 
            id="searchInput"
            placeholder="Buscar un himno por título o número..."
            value="${searchQuery}"
            autocomplete="off"
            style="font-size: ${fontSize}px; color: ${theme.colors.text};"
          />
          <button class="bg-transparent border-0 cursor-pointer p-1 items-center justify-center text-theme-notification opacity-70 transition-opacity duration-200 hover:opacity-100 hidden" id="clearButton" style="color: ${theme.colors.notification}; display: none;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="m15 9-6 6m0-6 6 6"></path>
            </svg>
          </button>
        </div>
      </div>
      </div>
      
      <div class="flex flex-col gap-2" id="songsList">
        ${initialSongsHtml}
      </div>

      <script>
        ${removeAccentJs}
        
        // Store all songs data
        const allSongs = ${songsDataJson};
        const theme = ${JSON.stringify(theme)};
        const fontSize = ${fontSize};
        
        // Initialize Fuse.js
        const fuse = new Fuse(allSongs, {
          keys: [
            { name: 'id', weight: 0.4 },
            { name: 'title', weight: 0.5 },
            { name: 'chorus', weight: 0.3 },
            { name: 'stanzas', weight: 0.3 },
          ],
          includeMatches: true,
          threshold: 0.4,
        });
        
        let searchTimeout;
        const searchInput = document.getElementById('searchInput');
        const clearButton = document.getElementById('clearButton');
        const songsList = document.getElementById('songsList');
        
        // Function to create song card HTML
        function createSongCardHTML(song, index) {
          const songNumber = song.id || '-';
          const songTitle = song.title?.split('-')[1]?.trim() || song.title || '-';
          const stanzasCount = song.stanzas?.length || 0;
          const stanzasText = stanzasCount === 1 ? 'Estrofa' : 'Estrofas';
          const animationDelay = Math.min(index * 0.05, 0.25);
          
          // Escape HTML to prevent XSS
          function escapeHtml(text) {
            return String(text)
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
          }
          
          return \`
            <div 
              class="song-card bg-theme-card border border-theme-border rounded-[20px] p-3 my-1 flex items-center gap-4 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] relative overflow-hidden animate-slide-in-up hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] active:scale-[0.98]" 
              style="animation-delay: \${animationDelay}s;"
              data-song-id="\${escapeHtml(String(song.id))}" 
              data-index="\${index}"
            >
              <div 
                class="song-icon-container w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 ease-in-out text-theme-notification"
                style="background-color: \${theme.colors.notification}40;"
              >
                <div class="text-font-5xl font-bold text-theme-notification">\${escapeHtml(String(songNumber))}</div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-font-base font-semibold text-theme-text leading-[1.4] overflow-hidden text-ellipsis line-clamp-2">\${escapeHtml(songTitle)}</div>
                <div class="text-font-base font-bold text-theme-notification">\${escapeHtml(stanzasText)}: \${stanzasCount}</div>
              </div>
              <div class="song-bg-decoration rotate-12 absolute bottom-1 right-1 z-0 w-14 h-14 pointer-events-none transition-transform duration-300 ease-in-out" style="color: \${theme.dark ? '#ffffff60' : theme.colors.text + '50'};">
                ${lucideIcons.music4}
              </div>
            </div>
          \`;
        }
        
        // Function to create empty state HTML
        function createEmptyStateHTML(isSearchResult) {
          const iconColor = theme.colors.notification + '40';
          const textColor = theme.colors.text;
          const secondaryTextColor = theme.colors.text + '80';
          
          return \`
            <div class="flex flex-col items-center justify-center py-[80px] px-6 text-center animate-slide-in-up">
              <div 
                class=" w-24 h-24 bg-[${theme.colors.notification}20] mb-6 rounded-full flex items-center justify-center transition-all duration-300"
            >
                <div class="w-16 h-16 [&>svg]:w-full [&>svg]:h-full">
                ${lucideIcons.music4}
                </div>
            </div>
              <h3 
                class="text-font-5xl font-bold mb-3"
                style="color: \${textColor};"
              >
                \${isSearchResult ? 'No se encontraron resultados' : 'No hay himnos disponibles'}
              </h3>
              <p 
                class="text-font-base max-w-md mx-auto leading-relaxed"
                style="color: \${secondaryTextColor};"
              >
                \${isSearchResult 
                  ? 'Intenta buscar con diferentes palabras clave o verifica la ortografía de tu búsqueda.' 
                  : 'No hay himnos disponibles en este momento.'}
              </p>
              \${isSearchResult ? \`
                <div 
                  class="mt-6 px-4 py-2 rounded-lg inline-flex items-center gap-2"
                  style="background-color: \${theme.colors.card}; border: 1px solid \${theme.colors.border};"
                >
                  <svg class="w-4 h-4" style="color: \${theme.colors.notification};" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                  <span class="text-font-sm" style="color: \${secondaryTextColor};">
                    Busca por título o número de himno
                  </span>
                </div>
              \` : ''}
            </div>
          \`;
        }
        
        // Function to render songs
        function renderSongs(filteredSongs) {
          if (filteredSongs.length === 0) {
            songsList.innerHTML = createEmptyStateHTML(true);
            return;
          }
          
          songsList.innerHTML = filteredSongs.map((song, index) => createSongCardHTML(song, index)).join('');
          
          // Re-attach click handlers to new cards
          attachClickHandlers();
          
          // Animate cards
          const cards = songsList.querySelectorAll('.song-card');
          cards.forEach((card, index) => {
            setTimeout(() => {
              card.style.opacity = '1';
            }, index * 50);
          });
        }
        
        // Function to attach click handlers to song cards
        function attachClickHandlers() {
          document.querySelectorAll('.song-card').forEach(card => {
            card.addEventListener('click', (e) => {
              const songId = card.dataset.songId;
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'songClick',
                  songId: songId
                }));
              }
            });
          });
        }
        
        // Function to filter songs
        function filterSongs(query) {
          if (!query || query.trim().length === 0) {
            renderSongs(allSongs);
            return;
          }
          
          const normalizedText = removeAccent(query.trim());
          const results = fuse.search(normalizedText);
          const filteredSongs = results.map(r => r.item);
          renderSongs(filteredSongs);
        }
        
        // Handle search input
        searchInput.addEventListener('input', (e) => {
          clearTimeout(searchTimeout);
          const query = e.target.value;
          
          // Show/hide clear button
          if (query.length > 0) {
            clearButton.style.display = 'flex';
            clearButton.classList.remove('hidden');
          } else {
            clearButton.style.display = 'none';
            clearButton.classList.add('hidden');
          }
          
          searchTimeout = setTimeout(() => {
            filterSongs(query);
          }, 300);
        });
        
        // Handle clear button
        clearButton.addEventListener('click', () => {
          searchInput.value = '';
          clearButton.style.display = 'none';
          clearButton.classList.add('hidden');
          searchInput.focus();
          filterSongs('');
        });
        
        // Initialize clear button visibility
        if (searchInput.value.length > 0) {
          clearButton.style.display = 'flex';
          clearButton.classList.remove('hidden');
        }
        
        // Initial click handlers
        attachClickHandlers();
        
        // Add smooth scroll behavior
        document.addEventListener('DOMContentLoaded', () => {
          // Animate cards on load
          const cards = document.querySelectorAll('.song-card');
          cards.forEach((card, index) => {
            setTimeout(() => {
              card.style.opacity = '1';
            }, index * 50);
          });
        });
      </script>
    </body>
  `;
};

type TSongsListHtmlTemplateProps = {
  songs: TSongItem[];
  theme: TTheme;
  fontSize: number;
  selectedFont?: string;
  searchQuery?: string;
};

export const songsListHtmlTemplate = ({
  songs,
  theme,
  fontSize,
  selectedFont,
  searchQuery = '',
}: TSongsListHtmlTemplateProps) => {
  const themeSchema = theme.dark ? 'dark' : 'light';

  return `
    <!DOCTYPE html>
    <html data-theme="${themeSchema}">
      ${createHtmlHead(theme, 16, selectedFont)}
      ${createHtmlBody(songs, theme, 16, selectedFont, searchQuery)}
    </html>
  `;
};

