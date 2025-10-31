import { QUOTES_DATA, TQuoteDataItem } from "@/constants/quotesData";
import { useMyTheme } from "@/context/ThemeContext";
import { TTheme } from "@/types";
import { createOptimizedWebViewProps } from "@/utils/webViewOptimizations";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import BottomModal from "../BottomModal";

interface FontSelectorBottomSheetProps {
  bottomSheetRef: React.RefObject<BottomSheetModal | null>;
  selectedTheme?: TQuoteDataItem;
  onThemeSelect: (theme: TQuoteDataItem) => void;
  onClose: () => void;
}

const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

// Font data structure
interface FontItem {
  name: string;
  displayName: string;
  previewText: string;
}

const getHTMLContent = (
  quotesData: any,
  selectedThemeId: string | null,
  theme: TTheme
) => {
  // Collect all unique fonts from the quotes data with their details
  const fontsMap = new Map<string, FontItem>();
  quotesData.forEach((section: any) => {
    section.items.forEach((item: any) => {
      if (item.font && item.font.name) {
        fontsMap.set(item.font.name, {
          name: item.font.name,
          displayName: item.font.name,
          previewText: "Aa",
        });
      }
    });
  });

  const fonts = Array.from(fontsMap.values());

  // Get selected font from selected theme
  const selectedFont =
    quotesData
      .flatMap((section: any) => section.items)
      .find((item: any) => item.id === selectedThemeId)?.font?.name || null;

  // Generate font imports
  const fontImports = fonts
    .map((font) => {
      const fontUrl = `https://fonts.googleapis.com/css2?family=${font.name.replace(
        /\s+/g,
        "+"
      )}:wght@400;600;700&display=swap`;
      return `<link href="${fontUrl}" rel="stylesheet">`;
    })
    .join("\n    ");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>Font Selector</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    ${fontImports}
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html, body {
            margin: 0;
            padding: 0;
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            -webkit-touch-callout: none;
            -webkit-user-drag: none;
            -webkit-tap-highlight-color: transparent;
            -webkit-overflow-scrolling: touch;
            -webkit-font-smoothing: antialiased;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: transparent;
            color: ${theme.colors.text};
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px 8px;
            background-color: transparent;
        }

        .title {
            font-size: 18px;
            font-weight: 700;
            color: ${theme.colors.text};
            letter-spacing: -0.5px;
        }

        .close-button {
            background: rgba(255, 255, 255, 0.1);
            border: none;
            color: ${theme.colors.text};
            font-size: 24px;
            cursor: pointer;
            padding: 2px 10px;
            border-radius: 16px;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        }

        .close-button:active {
            background: rgba(255, 255, 255, 0.2);
            transform: scale(0.95);
        }

        .placeholder {
            width: 50px;
        }

        .content {
            padding: 0;
            height: auto;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        .carousel-container {
            position: relative;
            width: 100%;
            height: 150px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }

        .carousel-wrapper {
            display: flex;
            gap: 16px;
            padding: 0 50%;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            scrollbar-width: none;
            -ms-overflow-style: none;
            -webkit-overflow-scrolling: touch;
            scroll-behavior: smooth;
            width: 100%;
        }

        .carousel-wrapper::-webkit-scrollbar {
            display: none;
        }

        .font-item {
            flex-shrink: 0;
            width: 80px;
            height: 80px;
            scroll-snap-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transform-origin: center;
        }

        .font-circle {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 2px solid rgba(255, 255, 255, 0.1);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 6px;
            transition: background 0.3s ease, border 0.3s ease, box-shadow 0.3s ease;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            position: relative;
            overflow: hidden;
        }

        .font-circle::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .font-item.center .font-circle::before {
            opacity: 1;
        }

        .font-preview {
            font-size: 32px;
            font-weight: 600;
            color: ${theme.colors.text};
            line-height: 1;
            transition: font-size 0.3s ease, text-shadow 0.3s ease;
            text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .font-name {
            font-size: 9px;
            font-weight: 500;
            color: ${theme.colors.text + "70"};
            text-align: center;
            max-width: 90%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            transition: color 0.3s ease, font-weight 0.3s ease;
        }


        .font-item.center .font-circle {
            background: linear-gradient(135deg, ${theme.colors.primary + "30"
    } 0%, ${theme.colors.primary + "15"} 100%);
            border: 3px solid ${theme.colors.primary + "60"};
            box-shadow: 0 12px 48px ${theme.colors.text + "40"};
        }

        .font-item.center .font-preview {
            font-size: 36px;
            text-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
        }

        .font-item.center .font-name {
            color: ${theme.colors.text};
            font-weight: 600;
        }

        .font-item.selected .font-circle {
            border-color: ${theme.colors.notification};
        }

        .selected-indicator {
            position: absolute;
            top: 6px;
            right: 6px;
            width: 22px;
            height: 22px;
            border-radius: 50%;
            background: linear-gradient(135deg, ${theme.colors.notification
    } 0%, ${theme.colors.notification + "70"} 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-size: 12px;
            font-weight: bold;
            box-shadow: 0 2px 8px ${theme.colors.notification + "40"};
            animation: checkmarkPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes checkmarkPop {
            0% {
                transform: scale(0);
                opacity: 0;
            }
            50% {
                transform: scale(1.2);
            }
            100% {
                transform: scale(1);
                opacity: 1;
            }
        }

        .loading {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 150px;
            color: rgba(255, 255, 255, 0.5);
            font-size: 14px;
        }

        @media (prefers-color-scheme: light) {
            .title {
                color: #000000;
            }
            
            .close-button {
                background: rgba(0, 0, 0, 0.05);
                color: #000000;
            }
            
            .close-button:active {
                background: rgba(0, 0, 0, 0.1);
            }

            .font-circle {
                background: linear-gradient(135deg, rgba(0, 0, 0, 0.03) 0%, rgba(0, 0, 0, 0.01) 100%);
                border: 2px solid rgba(0, 0, 0, 0.08);
            }

            .font-preview {
                color: #000000;
                text-shadow: none;
            }

            .font-name {
                color: rgba(0, 0, 0, 0.6);
            }

            .font-item.center .font-circle {
                background: linear-gradient(135deg, rgba(0, 122, 255, 0.15) 0%, rgba(0, 122, 255, 0.08) 100%);
                border: 3px solid rgba(0, 122, 255, 0.4);
                box-shadow: 0 12px 48px rgba(0, 122, 255, 0.2);
            }

            .font-item.center .font-name {
                color: rgba(0, 0, 0, 0.9);
            }

            .loading {
                color: rgba(0, 0, 0, 0.4);
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="placeholder"></div>
        <div class="title">Fuentes</div>
        <button class="close-button" onclick="handleClose()">×</button>
    </div>

    <div class="content" id="content">
        <div class="loading">Cargando fuentes...</div>
    </div>

    <script>
        const fonts = ${JSON.stringify(fonts)};
        const selectedFontName = ${JSON.stringify(selectedFont)};
        let currentCenterFontName = selectedFontName;

        function handleClose() {
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'close'
                }));
            }
        }

        function handleFontSelect(fontName) {
            // Remove 'selected' class from all items
            const allItems = document.querySelectorAll('.font-item');
            allItems.forEach(item => {
                item.classList.remove('selected');
            });

            // Add 'selected' class to the clicked item
            const clickedItem = document.querySelector(\`[data-font-name="\${fontName}"]\`);
            if (clickedItem) {
                clickedItem.classList.add('selected');
                
                // Scroll the clicked item to center
                clickedItem.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'nearest', 
                    inline: 'center' 
                });
            }

            // Find a theme that uses this font
            const quotesData = ${JSON.stringify(quotesData)};
            const themeWithFont = quotesData
                .flatMap(section => section.items)
                .find(item => item.font && item.font.name === fontName);

            if (themeWithFont && window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'themeSelected',
                    themeId: themeWithFont.id
                }));
            }
        }

        function updateCarouselPositions() {
            const wrapper = document.querySelector('.carousel-wrapper');
            const items = document.querySelectorAll('.font-item');
            
            if (!wrapper || items.length === 0) return;

            const wrapperRect = wrapper.getBoundingClientRect();
            const centerX = wrapperRect.left + wrapperRect.width / 2;

            let closestItem = null;
            let minDistance = Infinity;

            items.forEach(item => {
                const rect = item.getBoundingClientRect();
                const itemCenterX = rect.left + rect.width / 2;
                const distance = Math.abs(centerX - itemCenterX);

                if (distance < minDistance) {
                    minDistance = distance;
                    closestItem = item;
                }

                // Remove center class from all items
                item.classList.remove('center');
            });

            // Add center class to closest item
            if (closestItem) {
                closestItem.classList.add('center');
                currentCenterFontName = closestItem.dataset.fontName;
                updateSelectedFontDisplay(currentCenterFontName);
            }
        }

        function updateSelectedFontDisplay(fontName) {
            // Update can be used for future enhancements
        }

        function renderFonts() {
            const content = document.getElementById('content');

            let html = \`
                <div class="carousel-container">
                    <div class="carousel-wrapper" id="carousel-wrapper">
            \`;
            
            fonts.forEach(font => {
                const isSelected = font.name === selectedFontName;
                html += \`
                    <div class="font-item \${isSelected ? 'selected' : ''}" 
                         data-font-name="\${font.name}" 
                         onclick="handleFontSelect('\${font.name}')">
                        <div class="font-circle">
                            <div class="font-preview" style="font-family: '\${font.name}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                                \${font.previewText}
                            </div>
                        </div>
                    </div>
                \`;
            });
            
            html += \`
                    </div>
                </div>
            \`;
            
            content.innerHTML = html;

            // Set up carousel scroll listener
            const wrapper = document.getElementById('carousel-wrapper');
            if (wrapper) {
                let scrollTimeout;
                wrapper.addEventListener('scroll', function() {
                    clearTimeout(scrollTimeout);
                    scrollTimeout = setTimeout(() => {
                        updateCarouselPositions();
                    }, 100);
                });

                // Initial position update
                setTimeout(() => {
                    // Scroll to selected font if exists
                    if (selectedFontName) {
                        const selectedItem = document.querySelector(\`[data-font-name="\${selectedFontName}"]\`);
                        if (selectedItem) {
                            selectedItem.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                        }
                    }
                    updateCarouselPositions();
                }, 100);
            }
        }

        // Initialize fonts when page loads
        document.addEventListener('DOMContentLoaded', function() {
            // Wait for fonts to load before rendering
            if (document.fonts && document.fonts.ready) {
                document.fonts.ready.then(() => {
                    renderFonts();
                });
            } else {
                // Fallback for browsers that don't support document.fonts
                setTimeout(() => {
                    renderFonts();
                }, 100);
            }
        });
    </script>
</body>
</html>
  `;
};

const FontSelectorBottomSheet: React.FC<FontSelectorBottomSheetProps> = ({
  bottomSheetRef,
  selectedTheme,
  onThemeSelect,
  onClose,
}) => {
  const { theme } = useMyTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const webViewRef = useRef<WebView>(null);
  const handleThemeSelect = useCallback(
    (themeItem: TQuoteDataItem) => {
      onThemeSelect(themeItem);
      // Don't dismiss the modal - let user keep browsing fonts
    },
    [onThemeSelect]
  );

  const handleWebViewMessage = useCallback(
    (event: any) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);

        if (data.type === "themeSelected") {
          const selectedThemeItem = QUOTES_DATA.flatMap(
            (section) => section.items
          ).find((item) => item.id === data.themeId);

          if (selectedThemeItem) {
            handleThemeSelect(selectedThemeItem);
          }
        } else if (data.type === "close") {
          onClose();
        }
      } catch (error) {
        console.error("Error parsing WebView message:", error);
      }
    },
    [handleThemeSelect, onClose]
  );

  const htmlContent = useMemo(() => {
    return getHTMLContent(QUOTES_DATA, selectedTheme?.id || null, theme);
  }, [theme]);

  return (
    <BottomModal
      style={styles.bottomSheet}
      backgroundColor={theme.dark ? theme.colors.background : "#eee"}
      shouldScroll={false}
      ref={bottomSheetRef}
      justOneSnap
      showIndicator
      justOneValue={["30%"]}
      startAT={0}
      onDismiss={() => { }}
    >
      <View style={styles.webViewContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: htmlContent }}
          style={{
            flex: 1,
            height: 100,
            minWidth: "100%",
            backgroundColor: "transparent",
          }}
          onMessage={handleWebViewMessage}
          scrollEnabled={false}
          bounces={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
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
          {...createOptimizedWebViewProps({}, "themeSelector")}
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
    indicator: {
      backgroundColor: colors.text,
      width: 40,
      height: 4,
    },
    webViewContainer: {
      flex: 1,
      width: "100%",
      backgroundColor: "transparent",
    },
    webView: {
      flex: 1,
      backgroundColor: "transparent",
    },
  });

export default FontSelectorBottomSheet;
