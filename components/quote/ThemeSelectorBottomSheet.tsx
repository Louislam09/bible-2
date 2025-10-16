import React, { useCallback, useMemo, useRef, useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { WebView } from "react-native-webview";
import { useMyTheme } from "@/context/ThemeContext";
import { TTheme } from "@/types";
import { QUOTES_DATA, TQuoteDataItem } from "@/constants/quotesData";
import BottomModal from "../BottomModal";
import { Text } from "../Themed";
import { quoteTemplatesMaker } from "@/constants/quoteTemplates";

interface ThemeSelectorBottomSheetProps {
  bottomSheetRef: React.RefObject<BottomSheetModal | null>;
  selectedTheme?: TQuoteDataItem;
  onThemeSelect: (theme: TQuoteDataItem) => void;
  onClose: () => void;
}

const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

const getHTMLContent = (quotesData: any, selectedThemeId: string | null) => {
  // Collect all unique fonts from the quotes data
  const uniqueFonts = new Set<string>();
  quotesData.forEach((section: any) => {
    section.items.forEach((item: any) => {
      if (item.font && item.font.name) {
        uniqueFonts.add(item.font.name);
      }
    });
  });

  // Function to optimize image URLs for theme cards (smaller resolution)
  const optimizeImageUrl = (url: string) => {
    // Replace _1000x1000 with _200x200 for better performance in theme cards
    return url.replace("_1000x1000.jpg", "_200x200.jpg");
  };

  // Generate font imports
  const fontImports = Array.from(uniqueFonts)
    .map((fontName) => {
      const fontUrl = `https://fonts.googleapis.com/css2?family=${fontName.replace(
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
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Theme Selector</title>
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
            height: 100%;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #1a1a1a0;
            color: #ffffff;
            overflow-x: hidden;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 20px;
            border-bottom: 1px solid #333;
            position: sticky;
            top: 0;
            background-color: #1a1a1a0;
            z-index: 100;
        }

        .title {
            font-size: 18px;
            font-weight: 600;
            color: #ffffff;
        }

        .close-button {
            background: none;
            border: none;
            color: #ffffff;
            font-size: 24px;
            cursor: pointer;
            padding: 8px;
            border-radius: 4px;
            transition: background-color 0.2s;
        }

        .close-button:hover {
            background-color: #333;
        }

        .placeholder {
            width: 40px;
        }

        .content {
            padding: 20px 0;
            height: 100%;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
        }

        .section {
            margin-bottom: 32px;
        }

        .section-title {
            font-size: 16px;
            font-weight: 600;
            color: #ffffff;
            margin-bottom: 16px;
            padding: 0 20px;
            text-transform: capitalize;
        }

        .themes-container {
            display: flex;
            gap: 12px;
            padding: 0 20px;
            overflow-x: auto;
            overflow-y: hidden;
            scrollbar-width: none;
            -ms-overflow-style: none;
            -webkit-overflow-scrolling: touch;
            scroll-behavior: smooth;
        }

        .themes-container::-webkit-scrollbar {
            display: none;
        }

        .theme-card {
            flex-shrink: 0;
            width: 80px;
            height: 100px;
            border-radius: 12px;
            overflow: hidden;
            position: relative;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .theme-card.selected {
            border: 2px solid #007AFF;
        }

        .card-background {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
        }

        .card-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(0deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 50%, rgba(0, 0, 0, 0.1) 100%);
        }

        .preview-text {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 16px;
            font-weight: 600;
            text-align: center;
            color: #ffffff;
            max-width: 70px;
            line-height: 1.2;
            font-family: inherit;
            padding: 4px 6px;
            border-radius: 4px;
            backdrop-filter: blur(2px);
            -webkit-backdrop-filter: blur(2px);
            transition: all 0.2s ease;
        }

        .selected-indicator {
            position: absolute;
            top: 6px;
            right: 6px;
            width: 20px;
            height: 20px;
            border-radius: 10px;
            background-color: rgba(0, 0, 0, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-size: 12px;
        }

        .loading {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 200px;
            color: #666;
        }

        @media (prefers-color-scheme: light) {
            body {
                background-color: #ffffff;
                color: #000000;
            }
            
            .header {
                background-color: #ffffff;
                border-bottom-color: #e0e0e0;
            }
            
            .title {
                color: #000000;
            }
            
            .close-button {
                color: #000000;
            }
            
            .close-button:hover {
                background-color: #f0f0f0;
            }
            
            .section-title {
                color: #000000;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="placeholder"></div>
        <div class="title">Temas</div>
        <button class="close-button" onclick="handleClose()">×</button>
    </div>

    <div class="content" id="content">
        <div class="loading">Cargando temas...</div>
    </div>

    <script>
        const quotesData = ${JSON.stringify(quotesData)};
        const selectedThemeId = ${JSON.stringify(selectedThemeId)};
        
        // Function to optimize image URLs for theme cards (smaller resolution)
        function optimizeImageUrl(url) {
            // Replace _1000x1000 with _200x200 for better performance in theme cards
            return url.replace('_1000x1000.jpg', '_200x200.jpg');
        }

        function handleClose() {
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'close'
                }));
            }
        }

        function handleThemeSelect(themeId) {
            // Update visual selection
            document.querySelectorAll('.theme-card').forEach(card => {
                card.classList.remove('selected');
            });
            document.querySelector(\`[data-theme-id="\${themeId}"]\`).classList.add('selected');

            // Send selection to React Native
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'themeSelected',
                    themeId: themeId
                }));
            }
        }

        function renderThemes() {
            const content = document.getElementById('content');

            let html = '';
            
            quotesData.forEach(section => {
                html += \`
                    <div class="section">
                        <div class="section-title">\${section.label}</div>
                        <div class="themes-container">
                \`;
                
                section.items.forEach(theme => {
                    const isSelected = theme.id === selectedThemeId;
                    html += \`
                        <div class="theme-card \${isSelected ? 'selected' : ''}" 
                             data-theme-id="\${theme.id}" 
                             onclick="handleThemeSelect('\${theme.id}')">
                            <img src="\${optimizeImageUrl(theme.backgroundImageUrl)}" 
                                 alt="\${theme.name}" 
                                 class="card-background"
                                 loading="lazy"
                                 onload="this.style.opacity='1'"
                                 onerror="this.style.display='none'; this.nextElementSibling.style.display='block'"
                                 style="opacity: 0; transition: opacity 0.3s ease;">
                            <div class="card-placeholder" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%); background-size: 8px 8px; background-position: 0 0, 0 4px, 4px -4px, -4px 0px;"></div>
                            <div class="card-overlay"></div>
                            <div class="preview-text" style="font-family: '\${theme.font.name}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                                \${theme.previewText}
                            </div>
                            \${isSelected ? '<div class="selected-indicator">✓</div>' : ''}
                        </div>
                    \`;
                });
                
                html += \`
                        </div>
                    </div>
                \`;
            });
            
            content.innerHTML = html;
        }

        // Initialize themes when page loads
        document.addEventListener('DOMContentLoaded', function() {
            // Wait for fonts to load before rendering
            if (document.fonts && document.fonts.ready) {
                document.fonts.ready.then(() => {
                    renderThemes();
                });
            } else {
                // Fallback for browsers that don't support document.fonts
                setTimeout(() => {
                    renderThemes();
                }, 100);
            }
            
            // Ensure horizontal scrolling works on touch devices
            const themeContainers = document.querySelectorAll('.themes-container');
            themeContainers.forEach(container => {
                container.addEventListener('touchstart', function(e) {
                    this.style.scrollBehavior = 'auto';
                });
                
                container.addEventListener('touchend', function(e) {
                    this.style.scrollBehavior = 'smooth';
                });
            });
        });
    </script>
</body>
</html>
  `;
};

const ThemeSelectorBottomSheet: React.FC<ThemeSelectorBottomSheetProps> = ({
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
      bottomSheetRef.current?.dismiss();
    },
    [onThemeSelect, bottomSheetRef]
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
    return getHTMLContent(QUOTES_DATA, selectedTheme?.id || null);
  }, [selectedTheme]);

  return (
    <BottomModal
      style={styles.bottomSheet}
      backgroundColor={theme.dark ? theme.colors.background : "#eee"}
      shouldScroll={false}
      ref={bottomSheetRef}
      justOneSnap
      showIndicator
      justOneValue={["70%"]}
      startAT={0}
    >
      <View style={styles.webViewContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: htmlContent }}
          style={{
            flex: 1,
            minWidth: "100%",
            minHeight: screenHeight,
            backgroundColor: "transparent",
          }}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          mixedContentMode="compatibility"
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          scrollEnabled={true}
          bounces={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error("WebView error: ", nativeEvent);
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error("WebView HTTP error: ", nativeEvent);
          }}
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

export default ThemeSelectorBottomSheet;
