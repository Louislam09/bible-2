import { View } from "@/components/Themed";
import { DB_BOOK_NAMES } from "@/constants/BookNames";
import { useBibleContext } from "@/context/BibleContext";
import { useDBContext } from "@/context/databaseContext";
import { useMyTheme } from "@/context/ThemeContext";
import useCommentaryData from "@/hooks/useCommentaryData";
import usePrintAndShare from "@/hooks/usePrintAndShare";
import { modalState$ } from "@/state/modalState";
import { ModulesFilters, Screens, TTheme } from "@/types";
import { lucideIcons } from "@/utils/lucideIcons";
import { createOptimizedWebViewProps } from "@/utils/webViewOptimizations";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import WebView from "react-native-webview";
import BottomModal from "./BottomModal";
import { commentaryCss } from "@/constants/commentaryCss";

interface CommentaryBottomSheetProps {
  bookNumber: number;
  chapter: number;
  verse: number;
}

// HTML Template Generator
const createCommentaryHTML = (
  theme: TTheme,
  bookName: string,
  reference: string,
  commentaryData: any[],
  loading: boolean,
  hasCommentaries: boolean,
  tailwindScript: string
) => {
  const colors = theme.colors;
  const isDark = theme.dark;

  // Generate empty state
  const generateEmptyState = () => {
    if (!hasCommentaries) {
      return `
        <div class="flex flex-col items-center justify-center h-full p-8 text-center">
          <div class="text-6xl mb-4 opacity-60">📚</div>
          <h2 class="text-xl font-bold mb-2">No tienes comentarios descargados</h2>
          <p class="opacity-70 mb-6 leading-relaxed">
            Descarga módulos de comentarios para obtener perspectivas profundas sobre las Escrituras.
          </p>
          <button onclick="handleDownload()" class="bg-theme-notification text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2 hover:opacity-90">
            ${lucideIcons.download}
            <span>Descargar Comentarios</span>
          </button>
        </div>
      `;
    }

    return `
      <div class="flex flex-col items-center justify-center h-full p-8 text-center">
        <div class="text-6xl mb-4 opacity-60">🔍</div>
        <h2 class="text-xl font-bold mb-2">No hay comentarios disponibles</h2>
        <p class="opacity-70 mb-6 leading-relaxed">
          No se encontraron comentarios para ${reference} en los módulos instalados.
        </p>
        <button onclick="handleExplore()" class="border-2 border-theme-notification text-theme-notification px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2 hover:opacity-70">
          ${lucideIcons["book-open"]}
          <span>Explorar Comentarios</span>
        </button>
      </div>
    `;
  };

  // Generate loading state
  if (loading) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${tailwindScript}
        <style>
          body { margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
          .loader { border: 4px solid #f3f3f3; border-top: 4px solid ${colors.notification}; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
      </head>
      <body style="background: ${colors.background}; color: ${colors.text}; display: flex; align-items: center; justify-content: center; min-height: 100vh;">
        <div style="text-align: center;">
          <div class="loader" style="margin: 0 auto 20px;"></div>
          <p>Cargando comentarios...</p>
        </div>
      </body>
      </html>
    `;
  }

  // Generate main content
  const hasData = commentaryData && commentaryData.length > 0;

  if (!hasData) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${tailwindScript}
        <style type="text/tailwindcss">
          @theme {
            --color-theme-text: ${colors.text};
            --color-theme-background: ${colors.background};
            --color-theme-notification: ${colors.notification};
          }
        </style>
        <style>
          body { margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; background: ${colors.background
      }; color: ${colors.text}; }
        </style>
      </head>
      <body>
        ${generateEmptyState()}
        <script>
          function handleDownload() {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'download' }));
          }
          function handleExplore() {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'explore' }));
          }
        </script>
      </body>
      </html>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
         <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+Hebrew:wght@100..900&display=swap">
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400&display=swap">
      ${tailwindScript}
      <style type="text/tailwindcss">
        @theme {
          --color-theme-text: ${colors.text};
          --color-theme-background: ${colors.background};
          --color-theme-card: ${colors.card};
          --color-theme-border: ${colors.border};
          --color-theme-notification: ${colors.notification};
        }
      </style>
      <style>
        body {
         font-family: 'Quicksand', 'Noto Sans Hebrew', 'Georgia', 'Times New Roman', serif;
          background: ${colors.background};
          color: ${colors.text};
          -webkit-font-smoothing: antialiased;
        }
        .tab { transition: all 0.2s; cursor: pointer; }
        .tab.active { background: ${colors.notification
    } !important; color: white !important; }
        .commentary-card { animation: fadeIn 0.3s ease-in; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .tabs-container::-webkit-scrollbar { display: none; }
      </style>
      
    </head>
    <body class="bg-theme-background text-theme-text">
      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-4 ">
        <div class="flex-1">
          <h1 class="text-xl font-bold">${reference}</h1>
          <p class="text-sm opacity-70">Comentarios</p>
        </div>
        <div class="flex gap-2">
          <button onclick="handleShare()" class="p-2  rounded-lg hover:opacity-70">
            <span class="text-theme-notification">${lucideIcons.share}</span>
          </button>
          <button onclick="handleExplore()" class="p-2 rounded-lg hover:opacity-70">
            <span class="text-theme-notification">${lucideIcons.externalLink
    }</span>
          </button>
        </div>
      </div>

      <!-- Tabs -->
      ${commentaryData.length > 1
      ? `
      <div class="tabs-container flex gap-2 px-4 py-3 overflow-x-auto">
        ${commentaryData
        .map(
          (c, i) => `
          <button onclick="switchTab(${i})" class="tab px-4 py-2 rounded-full border border-theme-border whitespace-nowrap ${i === 0 ? "active" : ""
            }" data-tab="${i}">
            ${c.dbShortName}
          </button>
        `
        )
        .join("")}
      </div>  `
      : ""
    }

      <!-- Content -->
      <div id="content" class="p-5 pb-10">
        ${commentaryData
      .map(
        (source, sourceIdx) => `
          <div class="tab-content ${sourceIdx === 0 ? "" : "hidden"
          }" data-content="${sourceIdx}">
            ${source.commentaries
            .map((commentary: any) => {
              const commentaryRef = `${bookName} ${commentary.chapter_number_from
                }:${commentary.verse_number_from}${commentary.verse_number_to !== commentary.verse_number_from
                  ? `-${commentary.verse_number_to}`
                  : ""
                }`;
              // const cleanText = commentary.text.replace(/<[^>]*>/g, "");

              return `
              ${source.dbShortName === "Comentario Bíblico Beacon" ? `
                <style>
                  ${commentaryCss
                    .replaceAll("%COLOR_GREY%", colors.notification)
                    .replaceAll("%COLOR_BLUE%", colors.notification)
                    .replaceAll("%COLOR_TEXT%", colors.text)
                    .replaceAll("%COLOR_GREEN%", colors.notification)}
                </style>
              ` : ""}
                <div class="commentary-card bg-theme-card rounded-2xl p-5 mb-4 border border-theme-border">
                   <div class="inline-flex items-center gap-2 py-1 rounded-lg mb-3">
                      <span class="text-theme-notification text-xs">${lucideIcons.bookMarked}</span>
                      <span class="text-base font-semibold text-theme-notification">${commentaryRef}</span>
                    </div>
                  <h3 class="text-lg font-bold mb-3">Comentario de ${source.dbShortName}</h3>
                  <p class="leading-relaxed opacity-90">${commentary.text.replace("noshade", "class='my-4")}</p>
                </div>
              `;
            })
            .join("")}
          </div>
        `
      )
      .join("")}
           <!-- Info Card -->
            <div class=" rounded-xl p-4 border-b-4 border-theme-notification">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-theme-notification">${lucideIcons.info}</span>
                <span class="font-semibold">Acerca de este comentario</span>
              </div>
              <p class="text-sm opacity-80 leading-relaxed">
                Estos comentarios proporcionan perspectivas teológicas e históricas sobre el texto bíblico.
              </p>
            </div>
      </div>

      <script>
        const commentaryData = ${JSON.stringify(commentaryData)};
        let currentTab = 0;

        function switchTab(index) {
          currentTab = index;
          
          // Update tabs
          document.querySelectorAll('.tab').forEach((tab, i) => {
            if (i === index) {
              tab.classList.add('active');
            } else {
              tab.classList.remove('active');
            }
          });

          // Update content
          document.querySelectorAll('.tab-content').forEach((content, i) => {
            content.classList.toggle('hidden', i !== index);
          });
        }

        function handleShare() {
          const source = commentaryData[currentTab];
          if (source && source.commentaries.length > 0) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'share',
              data: {
                source: source.dbShortName,
                commentary: source.commentaries[0]
              }
            }));
          }
        }

        function handleExplore() {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'explore' }));
        }

        function handleDownload() {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'download' }));
        }
      </script>
    </body>
    </html>
  `;
};

const CommentaryBottomSheet: React.FC<CommentaryBottomSheetProps> = ({
  bookNumber,
  chapter,
  verse,
}) => {
  const { theme } = useMyTheme();
  const { tailwindScript } = useBibleContext();
  const styles = getStyles(theme);
  const { installedCommentary: dbNames } = useDBContext();
  const { printToFile } = usePrintAndShare();
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const { data, error, loading } = useCommentaryData({
    databases: dbNames,
    enabled: true,
    autoSearch: true,
    bookNumber,
    chapter,
    verse,
  });

  const bookName = useMemo(
    () =>
      DB_BOOK_NAMES.find((b) => b.bookNumber === bookNumber)?.longName || "",
    [bookNumber]
  );

  const reference = `${bookName} ${chapter}:${verse}`;

  const availableCommentaries = useMemo(() => {
    return data?.filter((d) => d.commentaries.length > 0) || [];
  }, [data]);

  const commentaryHTML = useMemo(
    () =>
      createCommentaryHTML(
        theme,
        bookName,
        reference,
        availableCommentaries,
        loading,
        dbNames.length > 0,
        tailwindScript
      ),
    [
      theme,
      bookName,
      reference,
      availableCommentaries,
      loading,
      dbNames.length,
      tailwindScript,
    ]
  );

  const handleMessage = useCallback(
    (event: any) => {
      try {
        const message = JSON.parse(event.nativeEvent.data);

        switch (message.type) {
          case "share":
            const { source, commentary } = message.data;
            const content = `${reference}\n\n${source}\n\n${commentary.text.replace(
              /<[^>]*>/g,
              ""
            )}`;

            Clipboard.setStringAsync(content);
            printToFile(commentary.text, `${reference} - ${source}`);
            break;

          case "explore":
            modalState$.commentaryRef.current?.dismiss();
            router.push({
              pathname: Screens.Commentary,
              params: {
                book: bookName,
                chapter: chapter.toString(),
                verse: verse.toString(),
              },
            });
            break;

          case "download":
            modalState$.commentaryRef.current?.dismiss();
            router.push({
              pathname: Screens.DownloadManager,
              params: { filter: ModulesFilters.COMMENTARIES },
            });
            break;
        }
      } catch (error) {
        console.error("Error handling message:", error);
      }
    },
    [reference, bookName, chapter, verse, printToFile, router]
  );

  return (
    <BottomModal
      style={styles.bottomSheet}
      backgroundColor={theme.dark ? theme.colors.background : "#eee"}
      shouldScroll={false}
      ref={modalState$.commentaryRef.get()}
      justOneSnap
      showIndicator
      justOneValue={["90%"]}
      startAT={0}
      onDismiss={() => {
        setHasLoaded(false);
      }}
    >
      <View style={styles.webviewWrapper}>
        {!hasLoaded && (
          <View
            style={{
              backgroundColor: theme.colors.background,
              flex: 1,
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1000,
            }}
          />
        )}
        <WebView
          ref={webViewRef}
          originWhitelist={["*"]}
          key="commentary-webview"
          style={{
            flex: 1,
            width: "100%",
            backgroundColor: "transparent",
          }}
          source={{ html: commentaryHTML }}
          scrollEnabled={true}
          bounces={true}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
          onMessage={handleMessage}
          onLoadEnd={() => {
            setHasLoaded(true);
          }}
          onError={(syntheticEvent) => {
            const { nativeEvent = {} } = syntheticEvent;
            console.warn("WebView error: ", nativeEvent);
          }}
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

export default CommentaryBottomSheet;
