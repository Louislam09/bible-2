import { NEW_IMAGE_URLS, TQuoteDataItem } from "@/constants/quotesData";
import { useMyTheme } from "@/context/ThemeContext";
import { TTheme } from "@/types";
import { createOptimizedWebViewProps } from "@/utils/webViewOptimizations";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import BottomModal from "../BottomModal";

interface BackgroundImageSelectorBottomSheetProps {
  bottomSheetRef: React.RefObject<BottomSheetModal | null>;
  selectedTheme?: TQuoteDataItem;
  onBackgroundImageSelect: (backgroundImageUrl: string) => void;
  onClose: () => void;
}

const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

type TNewImageUrls = {
  topic: string;
  label: string;
  imagesUrl: string[];
};

const getHTMLContent = (
  newImageUrls: TNewImageUrls[],
  selectedImageUrl: string | null,
  theme: TTheme
) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Theme Selector</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
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
            background-color: ${theme.colors.background};
            color: ${theme.colors.text};
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
            border-bottom: 1px solid ${theme.colors.text + "80"};
            position: sticky;
            top: 0;
            background-color: ${theme.colors.background};
            z-index: 100;
        }

        .title {
            font-size: 18px;
            font-weight: 600;
            color: ${theme.colors.text};
        }

        .close-button {
            background: none;
            border: none;
            color: ${theme.colors.text};
            font-size: 24px;
            cursor: pointer;
            padding: 8px;
            border-radius: 4px;
            transition: background-color 0.2s;
        }

        .close-button:hover {
            background-color: ${theme.colors.text + "80"};
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
            color: ${theme.colors.text};
            margin-bottom: 16px;
            padding: 0 20px;
            text-transform: capitalize;
        }

        .images-container {
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

        .images-container::-webkit-scrollbar {
            display: none;
        }

        .image-card {
            flex-shrink: 0;
            width: 80px;
            height: 100px;
            border-radius: 12px;
            overflow: hidden;
            position: relative;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            border: 1px solid ${theme.colors.text + "1a"};
        }

        .image-card.selected {
            border: 2px solid ${theme.colors.primary};
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
        <div class="title">Imágenes</div>
        <button class="close-button" onclick="handleClose()">×</button>
    </div>

    <div class="content" id="content">
        <div class="loading">Cargando imágenes...</div>
    </div>

    <script>
        const newImageUrls = ${JSON.stringify(newImageUrls)};
        const selectedImageUrl = ${JSON.stringify(selectedImageUrl || null)};
        
        function handleClose() {
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'close'
                }));
            }
        }

        function handleImageSelect(imageUrl) {
            // Update visual selection
            document.querySelectorAll('.image-card').forEach(card => {
                card.classList.remove('selected');
            });
            document.querySelector(\`[data-image-url="\${imageUrl}"]\`).classList.add('selected');

            // Send selection to React Native
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'imageSelected',
                    imageUrl: imageUrl
                }));
            }
        }

        function renderImages() {
            const content = document.getElementById('content');

            let html = '';
            
            newImageUrls.forEach(section => {
                html += \`
                    <div class="section">
                        <div class="section-title">\${section.label}</div>
                        <div class="images-container">
                \`;
                
                section.imagesUrl.forEach(imageUrl => {
                    const isSelected = imageUrl === selectedImageUrl;
                    let optimizedImageUrl = imageUrl;
                    //add ?auto=compress&cs=tinysrgb&w=200 for pexels images
                    if (imageUrl.includes('pexels.com')) {
                        optimizedImageUrl += '?auto=compress&cs=tinysrgb&w=200';
                    }


                    html += \`
                        <div class="image-card \${isSelected ? 'selected' : ''}" 
                             data-image-url="\${imageUrl}" 
                             onclick="handleImageSelect('\${imageUrl}')">
                            <img src="\${optimizedImageUrl}" 
                                 alt="\${imageUrl}" 
                                 class="card-background"
                                 loading="lazy"
                                 onload="this.style.opacity='1'"
                                 onerror="this.style.display='none'; this.nextElementSibling.style.display='block'"
                                 style="opacity: 0; transition: opacity 0.3s ease;">
                            <div class="card-placeholder" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%); background-size: 8px 8px; background-position: 0 0, 0 4px, 4px -4px, -4px 0px;"></div>
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

        // Initialize images when page loads
        document.addEventListener('DOMContentLoaded', function() {
            renderImages();
            
            // Ensure horizontal scrolling works on touch devices
            const themeContainers = document.querySelectorAll('.images-container');
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

const BackgroundImageSelectorBottomSheet: React.FC<
  BackgroundImageSelectorBottomSheetProps
> = ({ bottomSheetRef, selectedTheme, onBackgroundImageSelect, onClose }) => {
  const { theme } = useMyTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const webViewRef = useRef<WebView>(null);

  const handleThemeSelect = useCallback(
    (imageUrl: string) => {
      onBackgroundImageSelect(imageUrl);
      bottomSheetRef.current?.dismiss();
    },
    [onBackgroundImageSelect, bottomSheetRef]
  );

  const handleWebViewMessage = useCallback(
    (event: any) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);

        if (data.type === "imageSelected") {
          handleThemeSelect(data.imageUrl);
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
    return getHTMLContent(
      NEW_IMAGE_URLS,
      selectedTheme?.backgroundImageUrl || null,
      theme
    );
  }, [selectedTheme, theme]);

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
      onDismiss={() => { }}
    >
      <View style={styles.webViewContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: htmlContent }}
          key={selectedTheme?.backgroundImageUrl}
          style={{
            flex: 1,
            minWidth: "100%",
            minHeight: screenHeight,
            backgroundColor: "transparent",
          }}
          containerStyle={{
            backgroundColor: "transparent",
          }}
          onMessage={handleWebViewMessage}
          scrollEnabled={true}
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

export default BackgroundImageSelectorBottomSheet;
