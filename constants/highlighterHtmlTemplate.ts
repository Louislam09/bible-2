import { getTailwindStyleTag } from "@/hooks/useLoadTailwindScript";
import { scriptDownloadHelpers } from "@/state/scriptDownloadState";
import { TTheme } from "@/types";

interface HighlighterTemplateProps {
    theme: TTheme;
    colors: Array<{ color: string; label: string }>;
    selectedColors: string[];
    verseText: string;
    loading: boolean;
    fontSize?: number;
}

const highlighterStyles = (theme: TTheme) => {
    return `
    <style>
        /* Custom styles that can't be replaced with Tailwind */
        :root {
            --color-notification-opacity-20: ${theme.colors.notification}10;
        }
        
        /* Prevent text selection */
        body {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
        }
        
        /* Color button checkmark */
        .color-button.selected::after {
            content: '✓';
            position: absolute;
            top: 4px;
            right: 4px;
            font-size: 16px;
            font-weight: bold;
            color: #000;
            background: rgba(255, 255, 255, 0.9);
            width: 20px;
            height: 20px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        /* Clear button X icon */
        .clear-button::after {
            content: '✕';
            font-size: 24px;
            color: var(--color-theme-text);
        }
        
        
        /* Selected state border */
        .color-button.selected {
            border-width: 3px !important;
        }
    </style>
  `;
};

export const highlighterHtmlTemplate = ({
    theme,
    colors,
    selectedColors,
    verseText,
    loading,
    fontSize = 16,
}: HighlighterTemplateProps): string => {
    const themeSchema = theme.dark ? "dark" : "light";

    return `
<!DOCTYPE html>
<html data-theme="${themeSchema}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Destacar versículo</title>
    ${scriptDownloadHelpers.getTailwindScript()}
    ${getTailwindStyleTag({ theme, fontSize })}
    ${highlighterStyles(theme)}
</head>
<body class="p-5 m-0 text-theme-text bg-theme-background select-none overflow-x-hidden flex flex-col items-center min-h-screen">
    <div class="text-center mb-8 w-full">
        <div class="text-xl font-semibold text-theme-text mb-2">Destacar versículo</div>
    </div>

    <div class="flex flex-row items-center  gap-4 overflow-x-auto  py-1 px-10">
        ${colors.map((item, index) => `  <div 
                class="w-14 h-14 rounded-full border-2 flex items-center justify-center cursor-pointer flex-shrink-0 relative shadow-md bg-[${item.color}] color-button 
                ${selectedColors.includes(item.color) ? "selected border-theme-notification scale-110" : "border-theme-border"}"
                onclick="handleColorSelect('${item.color}')"
            ></div>
        `).join("")}
        
        <div class="w-px h-10 bg-theme-border mx-2"></div>
        
        <div 
            class="w-14 h-14 rounded-full border-2 border-theme-border flex items-center justify-center cursor-pointer flex-shrink-0 shadow-md bg-theme-card clear-button color-button"
            onclick="handleClearHighlight()"
        ></div>
    </div>

    ${loading ? '<div class="mt-4 text-center w-full"><div class="text-sm text-theme-text opacity-70">Aplicando...</div></div>' : ""}

    <script>
        function handleColorSelect(color) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'colorSelect',
                data: { color }
            }));
        }

        function handleClearHighlight() {
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'clearHighlight',
                data: {}
            }));
        }
    </script>
</body>
</html>
`;
};

