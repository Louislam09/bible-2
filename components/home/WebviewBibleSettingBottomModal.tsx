import BottomModal from "@/components/BottomModal";
import { View } from "@/components/Themed";
import getThemes from "@/constants/themeColors";
import { useBibleContext } from "@/context/BibleContext";
import { storedData$ } from "@/context/LocalstoreContext";
import { useMyTheme } from "@/context/ThemeContext";
import { modalState$ } from "@/state/modalState";
import { EThemes, TFont, TTheme } from "@/types";
import getMinMaxFontSize from "@/utils/getMinMaxFontSize";
import { createOptimizedWebViewProps } from "@/utils/webViewOptimizations";
import { use$ } from "@legendapp/state/react";
import React, { useCallback, useMemo, useRef } from "react";
import { StyleSheet } from "react-native";
import WebView from "react-native-webview";

interface WebviewBibleSettingProps {
  onClose?: () => void;
}

// Color names mapping (from ColorSelector.tsx)
const colorNames: Record<string, string> = {
  Cyan: "Cian",
  Blue: "Azul",
  Green: "Verde",
  Red: "Rojo",
  Pink: "Rosa",
  Purple: "Púrpura",
  Orange: "Naranja",
  BlackWhite: "Negro",
  PinkLight: "Rosa Claro",
  BlueLight: "Azul Claro",
  BlueGray: "Gris Azul",
  BlueGreen: "Azul Verde",
};

// Get theme colors from themeColors.ts with actual theme colors
const getThemeColors = (themeSchema: string) => {
  const themes = getThemes();

  return Object.entries(EThemes).map(([name, hexColor]) => {
    const themeName = name as keyof typeof themes;
    const { DarkTheme, LightTheme } = themes[themeName];
    const theme = { dark: DarkTheme, light: LightTheme };
    const currentTheme = theme[themeSchema as keyof typeof theme];

    return {
      value: name,
      label: colorNames[name] || name,
      hexColor: hexColor,
      background: currentTheme?.colors.background || "#FFFFFF",
      text: currentTheme?.colors.text || "#000000",
      accent: currentTheme?.colors.notification || hexColor,
    };
  });
};

// Get all available fonts from TFont enum
const getFonts = () => {
  return Object.values(TFont).map((font) => ({
    value: font,
    label: font
      .replace(/Bold$/, "")
      .replace(/([A-Z])/g, " $1")
      .trim(),
  }));
};

// Settings HTML Template Generator
const createSettingsHTML = (
  theme: any,
  fontSize: number,
  currentTheme: string,
  selectedFont: string,
  tailwindScript: string,
  isDark: boolean,
  showReadingTime: boolean
) => {
  const themeSchema = isDark ? "dark" : "light";
  const fontSizes = getMinMaxFontSize();
  const themeColors = getThemeColors(themeSchema);
  const fonts = getFonts();

  // Define missing icons inline
  const icons = {
    x: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
    moon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
    palette: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>`,
    listOrdered: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="10" x2="21" y1="6" y2="6"/><line x1="10" x2="21" y1="12" y2="12"/><line x1="10" x2="21" y1="18" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>`,
    penLine: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`,
    calendar: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>`,
    timer: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16.5 12"/></svg>`,
  };

  return `
    <!DOCTYPE html>
    <html data-theme="${themeSchema}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>Configuración</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap">
        ${tailwindScript}
        
        <style>
            :root {
                --data-theme: ${isDark ? "dark" : "light"};
                --color-primary: ${theme.colors.primary || "#3b82f6"};
                --color-background: ${theme.colors.background || "#ffffff"};
                --color-card: ${theme.colors.card || "#f8fafc"};
                --color-text: ${theme.colors.text || "#1f2937"};
                --color-border: ${theme.colors.border || "#e5e7eb"};
                --color-notification: ${theme.colors.notification || "#ef4444"};
            }
            
            * {
                -webkit-tap-highlight-color: transparent;
            }
            
            body {
                font-family: 'Quicksand', sans-serif;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
                overflow-x: hidden;
                width: 100%;
                height: 100%;
            }
            
            /* Enable smooth scrolling */
            html {
                scroll-behavior: smooth;
            }
            
            /* Toggle Switch Styles */
            .toggle-switch {
                position: relative;
                width: 48px;
                height: 24px;
                background: #666;
                border-radius: 12px;
                cursor: pointer;
                transition: background-color 0.3s;
            }
            
            .toggle-switch.active {
                background: var(--color-notification);
            }
            
            .toggle-knob {
                position: absolute;
                top: 2px;
                left: 2px;
                width: 20px;
                height: 20px;
                background: white;
                border-radius: 50%;
                transition: transform 0.3s;
            }
            
            .toggle-switch.active .toggle-knob {
                transform: translateX(24px);
            }
            
            /* Range Slider Styles */
            input[type="range"] {
                -webkit-appearance: none;
                width: 100%;
                height: 6px;
                border-radius: 3px;
                background: linear-gradient(to right, var(--color-notification) 0%, var(--color-notification) ${((fontSize - fontSizes.minPx) /
      (fontSizes.maxPx - fontSizes.minPx)) *
    100
    }%, #333 ${((fontSize - fontSizes.minPx) / (fontSizes.maxPx - fontSizes.minPx)) * 100
    }%, #333 100%);
                outline: none;
            }
            
            input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: var(--color-notification);
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            
            input[type="range"]::-moz-range-thumb {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: var(--color-notification);
                cursor: pointer;
                border: none;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            
            /* Theme Card Styles */
            .theme-card {
                border-radius: 12px;
                padding: 12px;
                cursor: pointer;
                transition: all 0.2s;
                border: 3px solid transparent;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            .theme-card.selected {
                border-color: var(--color-notification);
                box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2), 0 4px 8px rgba(0, 0, 0, 0.15);
                transform: scale(1.05);
            }
            
            .theme-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
            }
            
            /* Select Dropdown Styles */
            select {
                appearance: none;
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
                background-repeat: no-repeat;
                background-position: right 8px center;
                background-size: 20px;
                padding-right: 36px;
            }
        </style>
        
        <style type="text/tailwindcss">
            @custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));
            @theme {
                --color-theme-text: ${theme.colors.text || "#1f2937"};
                --color-theme-background: ${theme.colors.background || "#ffffff"
    };
                --color-theme-card: ${theme.colors.card || "#f8fafc"};
                --color-theme-border: ${theme.colors.border || "#e5e7eb"};
                --color-theme-primary: ${theme.colors.primary || "#3b82f6"};
                --color-theme-notification: ${theme.colors.notification || "#ef4444"
    };
            }
        </style>
    </head>
    
    <body class="bg-theme-background text-theme-text m-0 p-0 ">
        <div class="">
            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-theme-border sticky top-0 bg-theme-background z-10">
                <h1 class="text-xl font-bold">Configuración</h1>
                <button onclick="handleClose()" class="p-2 hover:opacity-70 transition-opacity">
                    <span class="text-theme-notification">${icons.x}</span>
                </button>
            </div>
            
            <!-- Scrollable Content -->
            <div class="px-6 py-4 pb-8 space-y-6">
                <!-- Appearance Section -->
                <div>
                    <h2 class="text-lg font-semibold mb-4">Apariencia</h2>
                    
                    <!-- Theme Toggle -->
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center gap-3">
                            <span class="text-theme-text opacity-70">${icons.moon
    }</span>
                            <span>Tema</span>
                        </div>
                        <div class="flex items-center gap-2 bg-theme-notification rounded-full p-1">
                            <button id="lightBtn" onclick="handleThemeToggle('light')" 
                                    class="px-4 py-1 rounded-full transition-colors ${!isDark
      ? "bg-white text-black"
      : "text-white"
    }">
                                Claro
                            </button>
                            <button id="darkBtn" onclick="handleThemeToggle('dark')" 
                                    class="px-4 py-1 rounded-full transition-colors ${isDark
      ? "bg-gray-800 text-white"
      : "text-white"
    }">
                                Oscuro
                            </button>
                        </div>
                    </div>
                    
                    <!-- Theme Color Selector -->
                    <div class="mb-4">
                        <div class="flex items-center justify-between mb-3">
                            <div class="flex items-center gap-3">
                                <span class="text-theme-text opacity-70">${icons.palette
    }</span>
                                <span>Color del Tema</span>
                            </div>
                            <span class="px-2 py-1 bg-theme-notification text-white text-xs font-bold rounded-full">
                                ${colorNames[currentTheme] || currentTheme}
                            </span>
                        </div>
                        <div class="flex gap-3 overflow-x-auto py-2" style="scrollbar-width: thin;">
                            ${themeColors
      .map(
        (themeColor) => `
                            <div class="theme-card ${currentTheme === themeColor.value
            ? "selected"
            : ""
          } min-w-[120px]" 
                                  style="background-color: ${themeColor.background
          };"
                                  onclick="handleThemeColorChange('${themeColor.value
          }')">
                                <p style="color: ${themeColor.text
          };" class="text-xs font-bold mb-1">Genesis 1</p>
                                <p style="color: ${themeColor.text
          }; opacity: 0.7;" class="text-[10px] leading-tight"><span class="!text-theme-notification">1</span> En el principio creó Dios los cielos y la tierra...</p>
                                <p style="color: ${themeColor.accent
          };" class="text-[10px] mt-1 font-semibold">${themeColor.label
          }</p>
                            </div>
                             `
      )
      .join("")}
                        </div>
                    </div>
                    
                    <!-- Font Size Slider -->
                    <div class="mb-4">
                        <div class="flex items-center justify-between mb-2">
                            <span>Tamaño de Fuente</span>
                            <span id="fontSizeValue" class="text-theme-notification font-semibold">${Math.round(
        fontSize
      )}px</span>
                        </div>
                        <input type="range" id="fontSizeSlider" min="${Math.round(
        fontSizes.minPx
      )}" max="${Math.round(
        fontSizes.maxPx
      )}" value="${Math.round(fontSize)}" 
                               oninput="handleFontSizeChange(this.value)" 
                               class="w-full">
                    </div>
                    
                    <!-- Font Family Selector -->
                    <div class="mb-4">
                        <div class="flex items-center justify-between mb-2">
                            <div class="flex items-center gap-3">
                                <span class="text-2xl">T</span>
                                <span>Familia de Fuente</span>
                            </div>
                            <span class="px-2 py-1 bg-theme-notification text-white text-xs font-bold rounded-full">
                                ${selectedFont.split("-")[0]}
                            </span>
                        </div>
                        <select id="fontFamily" onchange="handleFontFamilyChange(this.value)" 
                                class="w-full bg-theme-card border border-theme-border rounded-lg px-4 py-2 text-theme-text">
                            ${fonts
      .filter((font) => !font.value.includes("Bold"))
      .map(
        (font) =>
          `<option value="${font.value}" ${selectedFont.includes(font.value)
            ? "selected"
            : ""
          }>${font.label}</option>`
      )
      .join("")}
                        </select>
                    </div>
                </div>
                
                <!-- Reading Experience Section -->
                <div class="">
                    <h2 class="text-lg font-semibold mb-4">Experiencia de Lectura</h2>
                    
                    <!-- Show Reading Time Toggle -->
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center gap-3">
                            <span class="text-theme-text opacity-70">${icons.timer
    }</span>
                            <span>Mostrar Tiempo de Lectura</span>
                        </div>
                        <div id="readingTimeToggle" class="toggle-switch ${showReadingTime ? "active" : ""
    }" onclick="handleToggle('readingTime')">
                            <div class="toggle-knob"></div>
                        </div>
                    </div>
                     <!-- flex hidden -->
                    <div class=" items-center justify-between mb-4 hidden">
                        <div class="flex items-center gap-3">
                            <span class="text-theme-text opacity-70">${icons.listOrdered
    }</span>
                            <span>Mostrar Números de Versículos</span>
                        </div>
                        <div id="verseNumbersToggle" class="toggle-switch active" onclick="handleToggle('verseNumbers')">
                            <div class="toggle-knob"></div>
                        </div>
                    </div>
                    
                    <!-- Red Letter Text Toggle - flex -->
                    <div class=" items-center justify-between mb-4 hidden">
                        <div class="flex items-center gap-3">
                            <span class="text-theme-text opacity-70">${icons.penLine
    }</span>
                            <span>Texto en Rojo</span>
                        </div>
                        <div id="redLetterToggle" class="toggle-switch" onclick="handleToggle('redLetter')">
                            <div class="toggle-knob"></div>
                        </div>
                    </div>
                </div>
                
                <!-- Reading Plan Section -->
                <div class="mb-6 hidden">
                    <h2 class="text-lg font-semibold mb-4">Plan de Lectura</h2>
                    
                    <!-- Current Plan Selector -->
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <span class="text-theme-text opacity-70">${icons.calendar
    }</span>
                            <span>Plan Actual</span>
                        </div>
                        <select id="readingPlan" onchange="handleReadingPlanChange(this.value)" 
                                class="bg-theme-card border border-theme-border rounded-lg px-4 py-2 text-theme-text">
                            <option value="chronological" selected>Cronológico</option>
                            <option value="sequential">Secuencial</option>
                            <option value="thematic">Temático</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <!-- Save Button -->
            <div class="px-6 py-4 pb-8 border-t border-theme-border bg-theme-background sticky bottom-0">
                <button onclick="handleSave()" 
                        class="w-full bg-theme-notification text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity">
                    Guardar
                </button>
            </div>
        </div>
        
        <script>
            let settings = {
                theme: '${isDark ? "dark" : "light"}',
                themeColor: '${currentTheme}',
                fontSize: ${Math.round(fontSize)},
                fontFamily: '${selectedFont}',
                showVerseNumbers: true,
                showReadingTime: ${showReadingTime},
                redLetterText: false,
                readingPlan: 'chronological'
            };
            
            // Debounce utility function
            function debounce(func, wait) {
                let timeout;
                return function executedFunction(...args) {
                    const later = () => {
                        clearTimeout(timeout);
                        func(...args);
                    };
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                };
            }
            
            function handleClose() {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'close'
                }));
            }
            
            function handleThemeToggle(theme) {
                settings.theme = theme;
                document.getElementById('lightBtn').className = theme === 'light' 
                    ? 'px-4 py-1 rounded-full transition-colors bg-white text-black' 
                    : 'px-4 py-1 rounded-full transition-colors text-white';
                document.getElementById('darkBtn').className = theme === 'dark' 
                    ? 'px-4 py-1 rounded-full transition-colors bg-gray-800 text-white' 
                    : 'px-4 py-1 rounded-full transition-colors text-white';
                
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'themeToggle',
                    value: theme
                }));
            }
            
            function handleThemeColorChange(color) {
                settings.themeColor = color;
                
                // Find the clicked card
                const allCards = document.querySelectorAll('.theme-card');
                let clickedCard = null;
                
                // Remove 'selected' class from all and find the clicked one
                allCards.forEach(card => {
                    card.classList.remove('selected');
                    // Find the card by checking the onclick attribute
                    if (card.getAttribute('onclick')?.includes(color)) {
                        clickedCard = card;
                    }
                });
                
                // Add 'selected' class to clicked card and scroll
                if (clickedCard) {
                    clickedCard.classList.add('selected');
                    clickedCard.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'nearest', 
                        inline: 'center' 
                    });
                }
                
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'themeColorChange',
                    value: color
                }));
            }
            
            // Scroll to selected theme on page load
            function scrollToSelectedTheme() {
                const selectedCard = document.querySelector('.theme-card.selected');
                if (selectedCard) {
                    selectedCard.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'nearest', 
                        inline: 'center' 
                    });
                }
            }
            
            // Debounced function to send font size to React Native (300ms delay)
            const sendFontSizeToRN = debounce((value) => {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'fontSizeChange',
                    value: parseInt(value)
                }));
            }, 300);
            
            function handleFontSizeChange(value) {
                settings.fontSize = parseInt(value);
                
                // Update UI immediately for smooth visual feedback
                document.getElementById('fontSizeValue').textContent = value + 'px';
                
                // Update slider background
                const slider = document.getElementById('fontSizeSlider');
                const minSize = ${Math.round(fontSizes.minPx)};
                const maxSize = ${Math.round(fontSizes.maxPx)};
                const percent = ((value - minSize) / (maxSize - minSize)) * 100;
                slider.style.background = \`linear-gradient(to right, var(--color-notification) 0%, var(--color-notification) \${percent}%, #333 \${percent}%, #333 100%)\`;
                
                // Send to React Native with debounce to prevent freezing
                sendFontSizeToRN(value);
            }
            
            function handleFontFamilyChange(value) {
                settings.fontFamily = value;
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'fontFamilyChange',
                    value: value
                }));
            }
            
            function handleToggle(toggleId) {
                const toggle = document.getElementById(toggleId + 'Toggle');
                const isActive = toggle.classList.contains('active');
                
                if (isActive) {
                    toggle.classList.remove('active');
                } else {
                    toggle.classList.add('active');
                }
                
                if (toggleId === 'verseNumbers') {
                    settings.showVerseNumbers = !isActive;
                } else if (toggleId === 'redLetter') {
                    settings.redLetterText = !isActive;
                } else if (toggleId === 'readingTime') {
                    settings.showReadingTime = !isActive;
                }
                
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'toggle',
                    toggleId: toggleId,
                    value: !isActive
                }));
            }
            
            function handleReadingPlanChange(value) {
                settings.readingPlan = value;
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'readingPlanChange',
                    value: value
                }));
            }
            
            function handleSave() {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'save',
                    settings: settings
                }));
            }
            
            // Initialize: scroll to selected theme after page loads
            window.addEventListener('load', function() {
                setTimeout(scrollToSelectedTheme, 100);
            });
        </script>
    </body>
    </html>
  `;
};

const WebviewBibleSettingBottomModal = ({
  onClose,
}: WebviewBibleSettingProps = {}) => {
  const webViewRef = useRef<WebView>(null);
  const { theme, toggleTheme } = useMyTheme();
  const { tailwindScript, selectTheme, handleFontSize, selectFont } =
    useBibleContext();
  const fontSize = use$(() => storedData$.fontSize.get());
  const currentTheme = use$(() => storedData$.currentTheme.get());
  const selectedFont = use$(() => storedData$.selectedFont.get());
  const styles = getStyles(theme);
  const showReadingTime = use$(() => storedData$.showReadingTime.get());

  const settingsHTML = useMemo(
    () =>
      createSettingsHTML(
        theme,
        fontSize,
        currentTheme,
        selectedFont,
        tailwindScript,
        theme.dark,
        showReadingTime
      ),
    [
      theme,
      fontSize,
      currentTheme,
      selectedFont,
      tailwindScript,
      showReadingTime,
    ]
  );

  const handleMessage = useCallback(
    (event: any) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);

        switch (data.type) {
          case "close":
            modalState$.bibleSettingRef.current?.dismiss();
            break;
          case "themeToggle":
            toggleTheme();
            break;
          case "themeColorChange":
            selectTheme(data.value);
            break;
          case "fontSizeChange":
            handleFontSize(data.value);
            break;
          case "fontFamilyChange":
            selectFont(data.value);
            break;
          case "toggle":
            if (data.toggleId === "readingTime") {
              storedData$.showReadingTime.set(data.value);
            }
            // Handle toggle settings
            console.log("Toggle:", data.toggleId, data.value);
            break;
          case "readingPlanChange":
            // Handle reading plan change
            console.log("Reading plan:", data.value);
            break;
          case "save":
            // console.log("Settings saved:", data.settings);
            modalState$.bibleSettingRef.current?.dismiss();
            break;
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    },
    [toggleTheme, selectTheme, handleFontSize, selectFont]
  );

  return (
    <BottomModal
      style={styles.bottomSheet}
      backgroundColor={theme.dark ? theme.colors.background : "#eee"}
      shouldScroll={false}
      ref={modalState$.bibleSettingRef.get()}
      justOneSnap
      showIndicator
      justOneValue={["90%"]}
      startAT={0}
      onDismiss={() => { }}
    >
      <View style={[styles.webviewWrapper]}>
        <WebView
          ref={webViewRef}
          originWhitelist={["*"]}
          key={"bible-setting"}
          style={{
            flex: 1,
            width: "100%",
            backgroundColor: "transparent",
          }}
          source={{ html: settingsHTML }}
          scrollEnabled={true}
          bounces={true}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
          onMessage={handleMessage}
          renderLoading={() => <View
            style={{
              backgroundColor: theme.colors.background,
              flex: 1,
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1000,
              justifyContent: "center",
              alignItems: "center",
            }}
          />}
          {...createOptimizedWebViewProps({}, "static")}
        />
      </View>
    </BottomModal>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    bottomSheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    webviewWrapper: {
      flex: 1,
      minWidth: "100%",
      backgroundColor: "transparent",
    },
  });
export default WebviewBibleSettingBottomModal;
