import { getTailwindStyleTag } from "@/hooks/useLoadTailwindScript";
import { scriptDownloadHelpers } from "@/state/scriptDownloadState";
import { TNote, TTheme } from "@/types";
import convertHtmlToText from "@/utils/convertHtmlToText";

interface NotesListTemplateProps {
    theme: TTheme;
    notes: TNote[];
    fontSize?: number;
}

const notesListStyles = (theme: TTheme) => {
    const isDark = theme.dark;

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
        
        .note-row {
            transition: background 0.15s ease;
        }
        
        .note-row:active {
            background: ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'};
        }
        
        .create-row:active {
            opacity: 0.7;
        }
        
        .divider {
            height: 1px;
            background: ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
        }
        
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
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

    const notePreview = noteText ? convertHtmlToText(data?.htmlString || noteText, { maxLength: 50, preserveLineBreaks: false, preserveWhitespace: true }) : '';
    return notePreview;
};

export const notesListHtmlTemplate = ({
    theme,
    notes,
    fontSize = 16,
}: NotesListTemplateProps): string => {
    const themeSchema = theme.dark ? "dark" : "light";
    const isDark = theme.dark;
    const mutedText = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';
    const subtleText = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)';

    const notesHtml = notes.map((note, index) => `
        <button
            class="note-row w-full text-left px-4 py-4 flex items-center gap-4"
            onclick="selectNote(${note.id})"
        >
            <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-theme-chip" >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
                </svg>
            </div>
            
            <div class="flex-1 min-w-0">
                <p class="text-theme-text font-medium text-base truncate leading-tight">
                    ${note.title || 'Sin título'}
                </p>
                <p class="text-sm truncate mt-0.5 text-gray-400">
                    ${getPreviewText(note.note_text)}
                </p>
            </div>
            
            <div class="flex flex-col items-end flex-shrink-0">
                <span class="text-xs text-gray-400">
                    ${formatDate(note.updated_at || note.created_at)}
                </span>
                <svg class="w-4 h-4 mt-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/>
                </svg>
            </div>
        </button>
        ${index < notes.length - 1 ? '<div class="divider ml-18"></div>' : ''}
    `).join('');

    const emptyStateHtml = `
        <div class="flex flex-col items-center justify-center py-20 px-8 text-center">
            <div class="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 bg-theme-chip">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
                </svg>
            </div>
            <p class="text-theme-text font-medium text-base mb-1">Sin notas</p>
            <p class="text-sm text-gray-400">Toca + para crear una</p>
        </div>
    `;

    return `
<!DOCTYPE html>
<html data-theme="${themeSchema}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Notas</title>
    ${scriptDownloadHelpers.getTailwindScript()}
    ${getTailwindStyleTag({ theme, fontSize })}
    ${notesListStyles(theme)}
</head>
<body class="m-0 p-0 text-theme-text bg-theme-background select-none overflow-y-auto scrollbar-hide min-h-screen">
    
    <!-- Header -->
    <div class="sticky top-0 bg-theme-background z-10 px-4 pt-4 pb-3">
        <div class="flex items-start justify-between">
            <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                    <svg class="w-5 h-5" style="color: ${theme.colors.notification || '#3b82f6'};" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"/>
                    </svg>
                    <h1 class="text-xl font-bold text-theme-text">Tus Notas</h1>
                    <span class="text-xs font-medium px-2 py-0.5 rounded-full" 
                          style="background: ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}; color: ${mutedText};">
                        ${notes.length}
                    </span>
                </div>
                <p class="text-sm text-gray-400">Reflexiones personales y apuntes de estudio</p>
            </div>
            <button
                class="create-row w-10 h-10 rounded-xl flex items-center justify-center ml-3"
                style="background: ${theme.colors.notification || theme.colors.primary};"
                onclick="createNewNote()"
            >
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
                </svg>
            </button>
        </div>
    </div>

    <!-- List -->
    <div class="pb-8">
        ${notes.length > 0 ? notesHtml : emptyStateHtml}
    </div>

    <script>
        function selectNote(id) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'selectNote',
                data: { id }
            }));
        }
        
        function createNewNote() {
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'createNote',
                data: {}
            }));
        }
    </script>
</body>
</html>
`;
};
