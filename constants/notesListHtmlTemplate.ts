import { getTailwindStyleTag } from "@/hooks/useLoadTailwindScript";
import { getFontCss } from "@/hooks/useLoadFonts";
import { scriptDownloadHelpers } from "@/state/scriptDownloadState";
import { TNote, TTheme } from "@/types";
import convertHtmlToText from "@/utils/convertHtmlToText";
import { storedData$ } from "@/context/LocalstoreContext";

export type ViewMode = 'grid' | 'list';
export type NotesListVariant = 'full' | 'compact';

interface NotesListTemplateProps {
    theme: TTheme;
    notes: TNote[];
    fontSize?: number;
    selectedFont?: string;
    isSelectionMode?: boolean;
    selectedNoteIds?: number[];
    viewMode?: ViewMode;
    variant?: NotesListVariant;
}

const notesListStyles = (theme: TTheme) => {
    const isDark = theme.dark;
    const accentColor = theme.colors.notification || theme.colors.primary;

    return `
    <style>
        * {
            font-family: system-ui, -apple-system, sans-serif;
        }
        
        body {
            -webkit-user-select: none;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
        }
        
        .note-card {
            transition: all 0.2s ease;
            touch-action: manipulation;
            position: relative;
        }
        
        .note-card:active {
            transform: scale(0.98);
            opacity: 0.9;
        }
        
        .note-card.selected {
            border-color: ${accentColor} !important;
            background: ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'} !important;
        }
        
        .checkbox {
            transition: all 0.2s ease;
        }
        
        .checkbox.checked {
            background: ${accentColor};
            border-color: ${accentColor};
        }
        
        .search-input {
            transition: all 0.2s ease;
        }
        
        .search-input:focus {
            border-color: ${accentColor};
            box-shadow: 0 0 0 2px ${accentColor}30;
        }
        
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        
        .hidden {
            display: none !important;
        }
        
        .note-hidden {
            display: none !important;
        }
        
        .selection-header {
            animation: slideDown 0.2s ease;
        }
        
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        /* Grid View Styles */
        .notes-container.grid-view {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            padding: 0 12px;
        }
        
        .notes-container.grid-view .note-card {
            flex-direction: column;
        }
        
        .notes-container.grid-view .note-icon {
            margin-bottom: 12px;
        }
        
        .notes-container.grid-view .note-content {
            flex: 1;
        }
        
        .notes-container.grid-view .note-date {
            margin-top: 8px;
        }
        
        /* List View Styles */
        .notes-container.list-view {
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: 0 12px;
        }
        
        .notes-container.list-view .note-card {
            display: flex;
            flex-direction: row;
            align-items: center;
            padding: 12px 16px;
        }
        
        .notes-container.list-view .note-icon {
            margin-right: 12px;
            margin-bottom: 0;
            flex-shrink: 0;
        }
        
        .notes-container.list-view .note-content {
            flex: 1;
            min-width: 0;
        }
        
        .notes-container.list-view .note-content .note-title {
            -webkit-line-clamp: 1 !important;
        }
        
        .notes-container.list-view .note-content .note-preview {
            -webkit-line-clamp: 1 !important;
        }
        
        .notes-container.list-view .note-date {
            margin-top: 0;
            margin-left: 12px;
            flex-shrink: 0;
        }
        
        .notes-container.list-view .checkbox-container {
            position: relative;
            top: auto;
            right: auto;
            margin-right: 12px;
        }
        
        /* View toggle button */
        .view-toggle-btn {
            transition: all 0.2s ease;
        }
        
        .view-toggle-btn:active {
            transform: scale(0.95);
        }
        
        .view-toggle-btn.active {
            background: ${accentColor}20;
            color: ${accentColor};
        }
        
        @media (max-width: 360px) {
            .notes-container.grid-view {
                grid-template-columns: 1fr;
            }
        }
    </style>
  `;
};

const formatDate = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Hoy';
        if (diffDays === 1) return 'Ayer';
        if (diffDays < 7) return `${diffDays}d`;

        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short'
        }).replace('.', '');
    } catch {
        return '';
    }
};

const getPreviewText = (noteText: string | undefined): string => {
    if (!noteText) return 'Nota vacía';
    let data;
    try {
        data = JSON.parse(noteText);
    } catch (error) {
        data = { htmlString: noteText || "" };
    }

    const notePreview = noteText ? convertHtmlToText(data?.htmlString || noteText, { maxLength: 60, preserveLineBreaks: false, preserveWhitespace: true }) : '';
    return notePreview || 'Nota vacía';
};

const escapeHtml = (text: string): string => {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

export const notesListHtmlTemplate = ({
    theme,
    notes,
    fontSize = 16,
    selectedFont,
    isSelectionMode = false,
    selectedNoteIds = [],
    viewMode = 'grid',
    variant = 'full',
}: NotesListTemplateProps): string => {
    const themeSchema = theme.dark ? "dark" : "light";
    const isDark = theme.dark;
    const accentColor = theme.colors.notification || theme.colors.primary;
    const mutedText = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';
    const cardBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)';
    const cardBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
    const isCompact = variant === 'compact';

    // Generate notes data as JSON for JavaScript use
    const notesDataJson = JSON.stringify(notes.map(note => ({
        id: note.id,
        title: note.title || 'Sin título',
        preview: getPreviewText(note.note_text),
        date: formatDate(note.updated_at || note.created_at),
        searchText: `${note.title || ''} ${getPreviewText(note.note_text)}`.toLowerCase()
    })));

    const notesHtml = notes.map((note) => {
        const isSelected = selectedNoteIds.includes(note.id);
        const title = escapeHtml(note.title || 'Sin título');
        const preview = escapeHtml(getPreviewText(note.note_text));
        const date = formatDate(note.updated_at || note.created_at);

        return `
            <div class="note-card rounded-xl p-4 cursor-pointer ${isSelected ? 'selected' : ''}"
                 style="background: ${cardBg}; border: 1px solid ${cardBorder};"
                 data-note-id="${note.id}"
                 data-title="${title}"
                 data-preview="${preview}"
                 onclick="handleNoteClick(${note.id}, event)"
                 ontouchstart="handleTouchStart(${note.id}, event)"
                 ontouchend="handleTouchEnd(event)"
                 ontouchmove="handleTouchMove(event)">
                
                <!-- Checkbox (visible in selection mode) -->
                <div class="checkbox-container ${isSelectionMode ? '' : 'hidden'}" id="checkbox-container-${note.id}"
                     style="position: absolute; top: 8px; right: 8px;">
                    <div class="checkbox w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'checked' : ''}"
                         style="border-color: ${isSelected ? accentColor : (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)')};"
                         id="checkbox-${note.id}">
                        <svg class="w-4 h-4 text-white ${isSelected ? '' : 'hidden'}" id="check-icon-${note.id}" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                        </svg>
                    </div>
                </div>
                
                <!-- Note Icon -->
                <div class="note-icon w-10 h-10 rounded-lg flex items-center justify-center"
                     style="background: ${accentColor}20;">
                    <svg class="w-5 h-5" style="color: ${accentColor};" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
                    </svg>
                </div>
                
                <!-- Note Content -->
                <div class="note-content min-w-0">
                    <p class="note-title text-theme-text font-semibold text-base leading-tight mb-1" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                        ${title}
                    </p>
                    <p class="note-preview text-sm text-gray-400" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                        ${preview}
                    </p>
                </div>
                
                <!-- Date -->
                <div class="note-date flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5" style="color: ${accentColor};" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/>
                    </svg>
                    <span class="text-xs" style="color: ${mutedText};">${date}</span>
                </div>
            </div>
        `;
    }).join('');

    const emptyStateHtml = `
        <div class="flex flex-col items-center justify-center py-20 px-8 text-center" id="empty-state">
            <div class="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
                 style="background: ${accentColor}15;">
                <svg class="w-10 h-10" style="color: ${accentColor};" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
                </svg>
            </div>
            <p class="text-theme-text font-semibold text-lg mb-2">Sin notas aún</p>
            <p class="text-sm text-gray-400 max-w-xs">Toca el botón + para crear tu primera nota y comenzar a escribir tus reflexiones</p>
        </div>
    `;

    const noSearchResultsHtml = `
        <div class="flex flex-col items-center justify-center py-16 px-8 text-center hidden" id="no-search-results">
            <div class="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                 style="background: ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'};">
                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
                </svg>
            </div>
            <p class="text-theme-text font-medium text-base mb-1">Sin resultados</p>
            <p class="text-sm text-gray-400">No se encontraron notas con ese criterio</p>
        </div>
    `;

    // SVG icons for view toggle
    const gridIcon = `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"/>
    </svg>`;

    const listIcon = `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/>
    </svg>`;

    return `
<!DOCTYPE html>
<html data-theme="${themeSchema}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Notas</title>
    ${scriptDownloadHelpers.getTailwindScript()}
    ${getTailwindStyleTag({ theme, fontSize })}
    ${getFontCss({ fontName: storedData$.selectedFont.get() || '' })}
    ${notesListStyles(theme)}
</head>
<body class="m-0 p-0 text-theme-text bg-theme-background select-none overflow-y-auto scrollbar-hide min-h-screen">
    
    <!-- Selection Mode Header -->
    <div class="selection-header sticky top-0 bg-theme-background z-20 px-4 py-3 border-b hidden"
         style="border-color: ${cardBorder};"
         id="selection-header">
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
                <button onclick="exitSelectionMode()" class="p-2 -ml-2 rounded-full" style="background: ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
                <span class="font-semibold text-lg" id="selection-count">0 seleccionadas</span>
            </div>
            <button onclick="toggleSelectAll()" class="px-3 py-1.5 rounded-lg text-sm font-medium"
                    style="background: ${accentColor}20; color: ${accentColor};"
                    id="select-all-btn">
                Seleccionar todo
            </button>
        </div>
    </div>
    
    <!-- Normal Header -->
    <div class="sticky top-0 bg-theme-background z-10 px-4 pt-4 pb-3" id="normal-header">
        ${isCompact ? `
        <!-- Compact Header for Bottom Modal -->
        <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
                <!-- Lightbulb Icon -->
                <svg class="w-5 h-5 text-theme-notification" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6A4.997 4.997 0 017 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"/>
                </svg>
                <h1 class="text-lg font-semibold text-theme-text">Tus Notas</h1>
                <span class="text-xs font-medium px-2 py-0.5 rounded-full" 
                      style="background: ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)'}; color: ${theme.colors.text};"
                      id="notes-count">
                    ${notes.length}
                </span>
            </div>
            
            <!-- Create Note Button -->
            <button onclick="createNewNote()" 
                    class="w-9 h-9 rounded-xl flex items-center justify-center"
                    style="background: ${accentColor};">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
                </svg>
            </button>
        </div>
        <p class="text-sm" style="color: ${mutedText};">Reflexiones y apuntes de estudio</p>
        ` : `
        <!-- Full Header for Notes Page -->
        <!-- Title Row -->
        <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
                <svg class="w-6 h-6" style="color: ${accentColor};" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/>
                </svg>
                <h1 class="text-xl font-bold text-theme-text">Mis Notas</h1>
                <span class="text-xs font-medium px-2 py-0.5 rounded-full" 
                      style="background: ${accentColor}20; color: ${accentColor};"
                      id="notes-count">
                    ${notes.length}
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
        
        <!-- Search Bar -->
        <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
            </svg>
            <input type="text" 
                   id="search-input"
                   placeholder="Buscar en tus notas..."
                   class="search-input w-full pl-10 pr-10 py-3 rounded-xl text-base outline-none"
                   style="background: ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'}; border: 1px solid ${cardBorder};"
                   oninput="handleSearch(this.value)"
                   autocomplete="off"
                   autocorrect="off"
                   autocapitalize="off"
                   spellcheck="false" />
            <button class="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hidden" 
                    id="clear-search-btn"
                    onclick="clearSearch()"
                    style="background: ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        </div>
        
        <!-- Selection Toggle -->
        <div class="flex items-center justify-between mt-3">
            <p class="text-sm text-gray-400">Reflexiones y apuntes de estudio</p>
            <button onclick="enterSelectionMode()" 
                    class="text-sm font-medium px-3 py-1 rounded-lg ${notes.length === 0 ? 'opacity-50 pointer-events-none' : ''}"
                    style="color: ${accentColor}; background: ${accentColor}10;">
                Seleccionar
            </button>
        </div>
        `}
    </div>

    <!-- Notes Container (Grid or List) -->
    <div class="notes-container ${viewMode}-view pb-24 pt-2" id="notes-container">
        ${notes.length > 0 ? notesHtml : ''}
    </div>
    
    ${notes.length === 0 ? emptyStateHtml : ''}
    ${noSearchResultsHtml}

    <script>
        // State
        let isSelectionMode = ${isSelectionMode};
        let selectedNoteIds = new Set(${JSON.stringify(selectedNoteIds)});
        let allNotes = ${notesDataJson};
        let currentViewMode = '${viewMode}';
        let longPressTimer = null;
        let touchStartTime = 0;
        let touchMoved = false;
        const LONG_PRESS_DURATION = 500;
        
        // DOM Elements
        const selectionHeader = document.getElementById('selection-header');
        const normalHeader = document.getElementById('normal-header');
        const selectionCount = document.getElementById('selection-count');
        const selectAllBtn = document.getElementById('select-all-btn');
        const searchInput = document.getElementById('search-input');
        const clearSearchBtn = document.getElementById('clear-search-btn');
        const notesContainer = document.getElementById('notes-container');
        const emptyState = document.getElementById('empty-state');
        const noSearchResults = document.getElementById('no-search-results');
        const gridViewBtn = document.getElementById('grid-view-btn');
        const listViewBtn = document.getElementById('list-view-btn');
        
        // View mode functions
        function setViewMode(mode) {
            if (mode === currentViewMode) return;
            
            currentViewMode = mode;
            
            // Update container class
            notesContainer.classList.remove('grid-view', 'list-view');
            notesContainer.classList.add(mode + '-view');
            
            // Update button states
            if (mode === 'grid') {
                gridViewBtn.classList.add('active');
                listViewBtn.classList.remove('active');
            } else {
                gridViewBtn.classList.remove('active');
                listViewBtn.classList.add('active');
            }
            
            // Update checkbox positions for list view
            document.querySelectorAll('.checkbox-container').forEach(container => {
                if (mode === 'list') {
                    container.style.position = 'relative';
                    container.style.top = 'auto';
                    container.style.right = 'auto';
                } else {
                    container.style.position = 'absolute';
                    container.style.top = '8px';
                    container.style.right = '8px';
                }
            });
            
            // Notify React Native
            sendViewModeChange(mode);
        }
        
        // Touch handlers for long press
        function handleTouchStart(noteId, event) {
            touchStartTime = Date.now();
            touchMoved = false;
            
            longPressTimer = setTimeout(() => {
                if (!touchMoved) {
                    // Vibrate if available
                    if (navigator.vibrate) {
                        navigator.vibrate(50);
                    }
                    
                    if (!isSelectionMode) {
                        enterSelectionMode();
                    }
                    toggleNoteSelection(noteId);
                }
            }, LONG_PRESS_DURATION);
        }
        
        function handleTouchEnd(event) {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
        }
        
        function handleTouchMove(event) {
            touchMoved = true;
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
        }
        
        // Note click handler
        function handleNoteClick(noteId, event) {
            // Ignore if was a long press
            const pressDuration = Date.now() - touchStartTime;
            if (pressDuration >= LONG_PRESS_DURATION) {
                return;
            }
            
            if (isSelectionMode) {
                toggleNoteSelection(noteId);
            } else {
                selectNote(noteId);
            }
        }
        
        // Selection mode functions
        function enterSelectionMode() {
            isSelectionMode = true;
            selectionHeader.classList.remove('hidden');
            normalHeader.classList.add('hidden');
            
            // Show all checkboxes
            document.querySelectorAll('[id^="checkbox-container-"]').forEach(el => {
                el.classList.remove('hidden');
            });
            
            updateSelectionUI();
            sendSelectionModeChange(true);
        }
        
        function exitSelectionMode() {
            isSelectionMode = false;
            selectedNoteIds.clear();
            
            selectionHeader.classList.add('hidden');
            normalHeader.classList.remove('hidden');
            
            // Hide all checkboxes and reset states
            document.querySelectorAll('[id^="checkbox-container-"]').forEach(el => {
                el.classList.add('hidden');
            });
            
            document.querySelectorAll('.note-card').forEach(card => {
                card.classList.remove('selected');
            });
            
            document.querySelectorAll('[id^="checkbox-"]').forEach(checkbox => {
                if (!checkbox.id.includes('container')) {
                    checkbox.classList.remove('checked');
                }
            });
            
            document.querySelectorAll('[id^="check-icon-"]').forEach(icon => {
                icon.classList.add('hidden');
            });
            
            sendSelectionModeChange(false);
            sendClearSelections();
        }
        
        function toggleNoteSelection(noteId) {
            if (selectedNoteIds.has(noteId)) {
                selectedNoteIds.delete(noteId);
            } else {
                selectedNoteIds.add(noteId);
            }
            
            updateNoteSelectionUI(noteId);
            updateSelectionUI();
            sendToggleSelection(noteId, selectedNoteIds.has(noteId));
            
            // Exit selection mode if no items selected
            if (selectedNoteIds.size === 0 && isSelectionMode) {
                exitSelectionMode();
            }
        }
        
        function toggleSelectAll() {
            const visibleNotes = getVisibleNoteIds();
            const allSelected = visibleNotes.every(id => selectedNoteIds.has(id));
            
            if (allSelected) {
                // Deselect all
                visibleNotes.forEach(id => selectedNoteIds.delete(id));
            } else {
                // Select all
                visibleNotes.forEach(id => selectedNoteIds.add(id));
            }
            
            // Update UI for all visible notes
            visibleNotes.forEach(id => updateNoteSelectionUI(id));
            updateSelectionUI();
            sendSelectAll(Array.from(selectedNoteIds));
        }
        
        function getVisibleNoteIds() {
            const visibleCards = document.querySelectorAll('.note-card:not(.note-hidden)');
            return Array.from(visibleCards).map(card => parseInt(card.dataset.noteId));
        }
        
        function updateNoteSelectionUI(noteId) {
            const isSelected = selectedNoteIds.has(noteId);
            const card = document.querySelector(\`[data-note-id="\${noteId}"]\`);
            const checkbox = document.getElementById(\`checkbox-\${noteId}\`);
            const checkIcon = document.getElementById(\`check-icon-\${noteId}\`);
            
            if (card) {
                if (isSelected) {
                    card.classList.add('selected');
                } else {
                    card.classList.remove('selected');
                }
            }
            
            if (checkbox) {
                if (isSelected) {
                    checkbox.classList.add('checked');
                } else {
                    checkbox.classList.remove('checked');
                }
            }
            
            if (checkIcon) {
                if (isSelected) {
                    checkIcon.classList.remove('hidden');
                } else {
                    checkIcon.classList.add('hidden');
                }
            }
        }
        
        function updateSelectionUI() {
            const count = selectedNoteIds.size;
            selectionCount.textContent = \`\${count} seleccionada\${count !== 1 ? 's' : ''}\`;
            
            const visibleNotes = getVisibleNoteIds();
            const allSelected = visibleNotes.length > 0 && visibleNotes.every(id => selectedNoteIds.has(id));
            selectAllBtn.textContent = allSelected ? 'Deseleccionar todo' : 'Seleccionar todo';
        }
        
        // Search functions
        function handleSearch(query) {
            const searchTerm = query.toLowerCase().trim();
            
            // Show/hide clear button
            if (searchTerm) {
                clearSearchBtn.classList.remove('hidden');
            } else {
                clearSearchBtn.classList.add('hidden');
            }
            
            let visibleCount = 0;
            
            document.querySelectorAll('.note-card').forEach(card => {
                const noteId = parseInt(card.dataset.noteId);
                const note = allNotes.find(n => n.id === noteId);
                
                if (!note) return;
                
                const matches = !searchTerm || note.searchText.includes(searchTerm);
                
                if (matches) {
                    card.classList.remove('note-hidden');
                    visibleCount++;
                } else {
                    card.classList.add('note-hidden');
                }
            });
            
            // Show/hide empty states
            if (emptyState) {
                if (allNotes.length === 0) {
                    emptyState.classList.remove('hidden');
                } else {
                    emptyState.classList.add('hidden');
                }
            }
            
            if (noSearchResults) {
                if (allNotes.length > 0 && visibleCount === 0 && searchTerm) {
                    noSearchResults.classList.remove('hidden');
                } else {
                    noSearchResults.classList.add('hidden');
                }
            }
            
            // Update selection UI if in selection mode
            if (isSelectionMode) {
                updateSelectionUI();
            }
            
            // Notify React Native
            sendSearchChange(query);
        }
        
        function clearSearch() {
            searchInput.value = '';
            handleSearch('');
            searchInput.focus();
        }
        
        // Navigation functions
        function selectNote(id) {
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'selectNote',
                    data: { id }
                }));
            }
        }
        
        function createNewNote() {
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'createNote',
                    data: {}
                }));
            }
        }
        
        // Communication with React Native
        function sendSelectionModeChange(isActive) {
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'selectionModeChange',
                    data: { isActive }
                }));
            }
        }
        
        function sendToggleSelection(noteId, isSelected) {
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'toggleSelection',
                    data: { noteId, isSelected, selectedIds: Array.from(selectedNoteIds) }
                }));
            }
        }
        
        function sendSelectAll(selectedIds) {
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'selectAll',
                    data: { selectedIds }
                }));
            }
        }
        
        function sendClearSelections() {
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'clearSelections',
                    data: {}
                }));
            }
        }
        
        function sendSearchChange(query) {
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'searchChange',
                    data: { query }
                }));
            }
        }
        
        function sendViewModeChange(mode) {
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'viewModeChange',
                    data: { viewMode: mode }
                }));
            }
        }
        
        // Handle messages from React Native
        function handleMessage(data) {
            switch (data.type) {
                case 'enterSelectionMode':
                    enterSelectionMode();
                    break;
                case 'exitSelectionMode':
                    exitSelectionMode();
                    break;
                case 'clearSelections':
                    selectedNoteIds.clear();
                    document.querySelectorAll('.note-card').forEach(card => {
                        const noteId = parseInt(card.dataset.noteId);
                        updateNoteSelectionUI(noteId);
                    });
                    updateSelectionUI();
                    break;
                case 'setViewMode':
                    if (data.viewMode) {
                        setViewMode(data.viewMode);
                    }
                    break;
                case 'updateNotes':
                    // Reload the page with new notes data
                    if (data.notes) {
                        allNotes = data.notes;
                        // For now, we'll request a full refresh
                        if (window.ReactNativeWebView) {
                            window.ReactNativeWebView.postMessage(JSON.stringify({
                                type: 'requestRefresh',
                                data: {}
                            }));
                        }
                    }
                    break;
            }
        }
        
        // Listen for messages from React Native
        if (window.ReactNativeWebView) {
            window.document.addEventListener('message', (event) => {
                try {
                    const data = JSON.parse(event.data);
                    handleMessage(data);
                } catch (e) {
                    console.error('Error parsing message:', e);
                }
            });
            
            window.addEventListener('message', (event) => {
                try {
                    const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
                    handleMessage(data);
                } catch (e) {
                    console.error('Error parsing message:', e);
                }
            });
        }
        
        // Expose functions globally
        window.enterSelectionMode = enterSelectionMode;
        window.exitSelectionMode = exitSelectionMode;
        window.clearSearch = clearSearch;
        window.createNewNote = createNewNote;
        window.setViewMode = setViewMode;
    </script>
</body>
</html>
`;
};
