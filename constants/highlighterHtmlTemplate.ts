import { getTailwindStyleTag } from "@/hooks/useLoadTailwindScript";
import { scriptDownloadHelpers } from "@/state/scriptDownloadState";
import { TTheme } from "@/types";
import { lucideIcons } from "@/utils/lucideIcons";

interface HighlighterTemplateProps {
    theme: TTheme;
    colors: Array<{ color: string; label: string }>;
    selectedColors: string[];
    selectedStyle: 'highlight' | 'underline';
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
        
        /* Clear button X icon */
        .clear-button::after {
            content: '✕';
            font-size: 24px;
            color: var(--color-theme-text);
        }
        
    </style>
  `;
};

export const highlighterHtmlTemplate = ({
    theme,
    colors,
    selectedColors,
    selectedStyle,
    verseText,
    loading,
    fontSize = 16,
}: HighlighterTemplateProps): string => {
    const themeSchema = theme.dark ? "dark" : "light";
    let currentStyle = selectedStyle || 'highlight';

    const selectCheckElement = (selected: boolean) => `
        <span class="${selected ? "w-full h-full rounded-full bg-black/30 flex items-center justify-center text-xl text-white " : "hidden"}">
        ${lucideIcons.check}</span>
    `;

    // Map colors to ring colors for selected state
    const getColorRing = (color: string) => {
        const colorMap: Record<string, string> = {
            '#FFEB3B': 'rgba(253, 224, 71, 0.5)', // yellow-300/50
            '#4CAF50': 'rgba(52, 211, 153, 0.5)', // emerald-300/50
            '#2196F3': 'rgba(125, 211, 252, 0.5)', // sky-300/50
            '#E91E63': 'rgba(244, 114, 182, 0.5)' // pink-300/50
        };
        return colorMap[color] || 'rgba(253, 224, 71, 0.5)';
    };

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
<body class="m-0 p-6 text-theme-text bg-theme-background select-none overflow-hidden">
    <h3 class="text-center text-lg font-semibold mb-6">
        Destacar versículo
    </h3>

    <div class="grid grid-cols-2 gap-4 mb-6">
        <button
            id="style-highlight"
            class="flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-all ${currentStyle === 'highlight' ? 'bg-theme-notification/20 border-theme-notification text-theme-notification ring-2 ring-theme-notification/50' : 'border-theme-border hover:bg-theme-background'}"
            onclick="selectStyle('highlight')"
        >
            Resaltar
        </button>

        <button
            id="style-underline"
            class="flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-all ${currentStyle === 'underline' ? 'bg-theme-notification/20 border-theme-notification text-theme-notification ring-2 ring-theme-notification/50' : 'border-theme-border hover:bg-theme-background'}"
            onclick="selectStyle('underline')"
        >
            Subrayar
        </button>
    </div>

    <div class="flex justify-center gap-5 mb-6">
        ${colors.map((item, index) => {
        const isSelected = selectedColors.includes(item.color);
        const colorRing = getColorRing(item.color);
        const checkmarkColor = item.color === '#FFEB3B' ? '#000' : '#fff';
        return `
            <button
                data-color-button
                data-color="${item.color}"
                class="h-12 w-12 rounded-full flex items-center justify-center transition-all"
                style="background-color: ${item.color}; ${isSelected ? `box-shadow: 0 0 0 4px ${colorRing};` : ''}"
                onclick="handleColorSelect('${item.color}')"
            >
                ${isSelected ? `
                    <svg class="h-6 w-6" style="color: ${checkmarkColor};" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                ` : ''}
            </button>
            `;
    }).join("")}
    </div>

    <button
        id="action-button"
        class="w-full rounded-xl py-3 text-sm font-medium transition-all mb-4"
        style="${selectedColors.length > 0 ? 'background-color: #ef4444; color: white;' : `background-color: ${theme.colors.notification || theme.colors.primary}; color: ${theme.dark ? '#000' : '#fff'};`}"
    >
        <span id="action-text">${selectedColors.length > 0 ? 'Limpiar' : 'Aplicar'}</span>
    </button>

    <script>
        let currentStyle = '${currentStyle}';
        let selectedColor = null;
        const hasExistingHighlight = ${selectedColors.length > 0};
        
        function updateActionButton() {
            const actionBtn = document.getElementById('action-button');
            const actionText = document.getElementById('action-text');
            
            const themeColor = '${theme.colors.text || theme.colors.primary}';
            const textColor = '${theme.dark ? '#000' : '#fff'}';
            
            if (hasExistingHighlight && !selectedColor) {
                // Show "Limpiar" when there's an existing highlight and no new selection
                actionText.textContent = 'Limpiar';
                actionBtn.onclick = handleClearHighlight;
                actionBtn.style.backgroundColor = '#ef4444';
                actionBtn.style.color = 'white';
            } else if (selectedColor) {
                // Show "Aplicar" when a color is selected
                actionText.textContent = 'Aplicar';
                actionBtn.onclick = applyHighlight;
                actionBtn.style.backgroundColor = themeColor;
                actionBtn.style.color = textColor;
                actionBtn.style.fontWeight = 'bold';
            } else {
                // Default: show "Limpiar" if no selection
                actionText.textContent = 'Limpiar';
                actionBtn.onclick = handleClearHighlight;
                actionBtn.style.backgroundColor = '#ef4444';
                actionBtn.style.color = 'white';
            }
        }

        function selectStyle(style) {
            currentStyle = style;
            const highlightBtn = document.getElementById('style-highlight');
            const underlineBtn = document.getElementById('style-underline');
            
            if (style === 'highlight') {
                highlightBtn.classList.add('bg-theme-notification/20', 'border-theme-notification', 'text-theme-notification', 'ring-2', 'ring-theme-notification/50');
                highlightBtn.classList.remove('border-theme-border', 'hover:bg-theme-background');
                underlineBtn.classList.remove('bg-theme-notification/20', 'border-theme-notification', 'text-theme-notification', 'ring-2', 'ring-theme-notification/50');
                underlineBtn.classList.add('border-theme-border', 'hover:bg-theme-background');
            } else {
                underlineBtn.classList.add('bg-theme-notification/20', 'border-theme-notification', 'text-theme-notification', 'ring-2', 'ring-theme-notification/50');
                underlineBtn.classList.remove('border-theme-border', 'hover:bg-theme-background');
                highlightBtn.classList.remove('bg-theme-notification/20', 'border-theme-notification', 'text-theme-notification', 'ring-2', 'ring-theme-notification/50');
                highlightBtn.classList.add('border-theme-border', 'hover:bg-theme-background');
            }
            
            // Update button if color is already selected
            if (selectedColor) {
                updateActionButton();
            }
        }

        function handleColorSelect(color) {
            // Just select the color visually, don't apply yet
            selectedColor = color;
            updateActionButton();
            
            // Update visual selection on color buttons
            document.querySelectorAll('[data-color-button]').forEach(btn => {
                const btnColor = btn.getAttribute('data-color');
                if (btnColor === color) {
                    const colorRing = getColorRing(color);
                    btn.style.boxShadow = \`0 0 0 4px \${colorRing}\`;
                    const svg = btn.querySelector('svg');
                    if (!svg) {
                        const checkmarkColor = color === '#FFEB3B' ? '#000' : '#fff';
                        const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                        svgEl.setAttribute('class', 'h-6 w-6');
                        svgEl.setAttribute('style', \`color: \${checkmarkColor};\`);
                        svgEl.setAttribute('fill', 'none');
                        svgEl.setAttribute('stroke', 'currentColor');
                        svgEl.setAttribute('stroke-width', '3');
                        svgEl.setAttribute('viewBox', '0 0 24 24');
                        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                        path.setAttribute('stroke-linecap', 'round');
                        path.setAttribute('stroke-linejoin', 'round');
                        path.setAttribute('d', 'M5 13l4 4L19 7');
                        svgEl.appendChild(path);
                        btn.appendChild(svgEl);
                    }
                } else {
                    btn.style.boxShadow = '';
                    const svg = btn.querySelector('svg');
                    if (svg) svg.remove();
                }
            });
        }
        
        function applyHighlight() {
            if (selectedColor) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'colorSelect',
                    data: { color: selectedColor, style: currentStyle }
                }));
            }
        }

        function handleClearHighlight() {
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'clearHighlight',
                data: {}
            }));
        }
        
        function getColorRing(color) {
            const colorMap = {
                '#FFEB3B': 'rgba(253, 224, 71, 0.5)',
                '#4CAF50': 'rgba(52, 211, 153, 0.5)',
                '#2196F3': 'rgba(125, 211, 252, 0.5)',
                '#E91E63': 'rgba(244, 114, 182, 0.5)'
            };
            return colorMap[color] || 'rgba(253, 224, 71, 0.5)';
        }
        
        // Initialize button state
        updateActionButton();
    </script>
</body>
</html>
`;
};

