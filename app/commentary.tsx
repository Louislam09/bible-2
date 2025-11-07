import { ChooseReferenceMutableProgress } from "@/components/animations/constants";
import ExpandableChooseReference from "@/components/animations/expandable-choose-reference";
import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import ScreenWithAnimation from "@/components/ScreenWithAnimation";
import { View } from "@/components/Themed";
import { DB_BOOK_NAMES } from "@/constants/BookNames";
import { commentaryCss } from "@/constants/commentaryCss";
import { storedData$ } from "@/context/LocalstoreContext";
import { useMyTheme } from "@/context/ThemeContext";
import useCommentaryData from "@/hooks/useCommentaryData";
import usePrintAndShare from "@/hooks/usePrintAndShare";
import { bibleState$ } from "@/state/bibleState";
import { ModulesFilters, Screens, TTheme } from "@/types";
import { lucideIcons } from "@/utils/lucideIcons";
import { createOptimizedWebViewProps } from "@/utils/webViewOptimizations";
import { use$ } from "@legendapp/state/react";
import * as Clipboard from "expo-clipboard";
import { Stack, useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef } from "react";
import { StyleSheet } from "react-native";
import { Easing, runOnJS, withTiming } from "react-native-reanimated";
import WebView from "react-native-webview";
import { ShouldStartLoadRequest } from "react-native-webview/lib/WebViewTypes";

// HTML Template Generator
const createCommentaryHTML = (
  theme: TTheme,
  bookName: string,
  reference: string,
  commentaryData: any[],
  loading: boolean,
  hasCommentaries: boolean,
  showReferencePicker: boolean = true
) => {
  const colors = theme.colors;
  const tailwindScript = storedData$.tailwindScript.get();

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
          <span>Cambiar Referencia</span>
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
          body { margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; background: ${colors.background}; color: ${colors.text}; }
        </style>
      </head>
      <body>
        ${generateEmptyState()}
        <script>
          function handleDownload() {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'download' }));
          }
          function handleExplore() {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'changeReference' }));
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
          margin: 0;
          padding: 0;
        }
        a {
          color: ${colors.notification};
          text-decoration: none;
          font-weight: 600;
          transition: opacity 0.2s ease;
          border-bottom: 1px solid ${colors.notification}40;
        }
        a:hover {
          opacity: 0.8;
          border-bottom-color: ${colors.notification};
        }
        a:active {
          opacity: 0.6;
        }
        .tab { transition: all 0.2s; cursor: pointer; }
        .tab.active { background: ${colors.notification} !important; color: white !important; }
        .commentary-card { animation: fadeIn 0.3s ease-in; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .tabs-container::-webkit-scrollbar { display: none; }
        .reference-picker {
          background: ${colors.notification}33;
          border: 1px solid ${colors.border};
          border-radius: 12px;
          padding: 16px;
          margin: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: all 0.2s;
        }
        .reference-picker:hover {
          opacity: 0.8;
        }
        .collapse-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          user-select: none;
          transition: all 0.2s ease;
        }
        .collapse-header:hover {
          opacity: 0.8;
        }
        .collapse-header:active {
          transform: scale(0.98);
        }
        .collapse-icon {
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          display: inline-flex;
          margin-left: 8px;
          transform-origin: center;
        }
        .collapse-icon.collapsed {
          transform: rotate(-180deg);
        }
        .collapsible-content {
          max-height: 10000px;
          overflow: hidden;
          transition: max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1), 
                      opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), 
                      margin-top 0.4s cubic-bezier(0.4, 0, 0.2, 1),
                      transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          opacity: 1;
          margin-top: 12px;
          transform: translateY(0);
        }
        .collapsible-content.collapsed {
          max-height: 0;
          opacity: 0;
          margin-top: 0;
          transform: translateY(-10px);
        }
      </style>
    </head>
    <body class="bg-theme-background text-theme-text">
      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-4">
        <div class="flex-1 cursor-pointer active:opacity-70 transition-opacity" onclick="handleChangeReference()">
          <div class="flex items-center gap-2">
            <h1 class="text-xl font-bold">${reference}</h1>
            <span class="text-theme-text opacity-70">${lucideIcons["chevron-right"]}</span>
          </div>
          <p class="text-sm opacity-70">Toca para cambiar la referencia</p>
        </div>
        <div class="flex gap-2">
          <button onclick="handleShare()" class="p-2 rounded-lg hover:opacity-70">
            <span class="text-theme-notification">${lucideIcons.share}</span>
          </button>
        </div>
      </div>

      <!-- Tabs -->
      ${commentaryData.length > 1 ? `
        <div class="tabs-container flex gap-2 px-4 py-3 overflow-x-auto">
          ${commentaryData.map((c, i) => `
            <button onclick="switchTab(${i})" class="tab px-4 py-2 rounded-full border border-theme-border whitespace-nowrap ${i === 0 ? "active" : ""}" data-tab="${i}">
              ${c.dbShortName}
            </button>
          `).join("")}
        </div>
      ` : ""}

      <!-- Content -->
      <div id="content" class="p-5 pb-10">
        ${commentaryData.map((source, sourceIdx) => `
          <div class="tab-content ${sourceIdx === 0 ? "" : "hidden"}" data-content="${sourceIdx}">
            ${source.commentaries.map((commentary: any, commentaryIdx: number) => {
    const commentaryRef = `${bookName} ${commentary.chapter_number_from}:${commentary.verse_number_from}${commentary.verse_number_to !== commentary.verse_number_from
      ? `-${commentary.verse_number_to}`
      : ""
      }`;
    const cardId = `card-${sourceIdx}-${commentaryIdx}`;

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
                <div class="commentary-card bg-theme-card rounded-lg p-5 mb-4 border border-theme-border">
                  <div class="collapse-header" onclick="toggleCollapse('${cardId}')">
                    <div class="flex-1">
                      <div class="flex items-center justify-between w-full">
                        <div class="inline-flex items-center gap-2 py-1 rounded-lg ">
                          <span class="text-theme-notification text-xs">${lucideIcons.bookMarked}</span>
                          <span class="text-base font-semibold text-theme-notification">${commentaryRef}</span>
                        </div>
                        <span class="collapse-icon collapsed text-theme-notification" id="icon-${cardId}">
                          ${lucideIcons["chevron-down"]}
                        </span>
                      </div>
                      <h3 class="text-sm font-bold">${source.dbShortName}</h3>
                    </div>
                  </div>
                  <div class="collapsible-content collapsed" id="${cardId}">
                    <p class="leading-relaxed opacity-90">${commentary.text.replace("noshade", "class='my-4")}</p>
                  </div>
                </div>
              `;
  }).join("")}
          </div>
        `).join("")}
        
        <!-- Info Card -->
        <div class="rounded-xl p-4 border-b-4 border-theme-notification">
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
          
          document.querySelectorAll('.tab').forEach((tab, i) => {
            if (i === index) {
              tab.classList.add('active');
            } else {
              tab.classList.remove('active');
            }
          });

          document.querySelectorAll('.tab-content').forEach((content, i) => {
            content.classList.toggle('hidden', i !== index);
          });
        }

        function toggleCollapse(cardId) {
          const content = document.getElementById(cardId);
          const icon = document.getElementById('icon-' + cardId);
          
          if (content && icon) {
            content.classList.toggle('collapsed');
            icon.classList.toggle('collapsed');
          }
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

        function handleChangeReference() {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'changeReference' }));
        }

        function handleDownload() {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'download' }));
        }
      </script>
    </body>
    </html>
  `;
};

type CommentaryScreenProps = {};

const CommentaryScreen: React.FC<CommentaryScreenProps> = ({ }) => {
  // All hooks must be called in the same order every render
  const { theme } = useMyTheme();
  const router = useRouter();
  const { printToFile } = usePrintAndShare();
  const webViewRef = useRef<WebView>(null);

  const commentaryQuery = use$(() => bibleState$.commentaryQuery.get());
  const { book, chapter, verse } = commentaryQuery;

  const searchingSource = require("../assets/lottie/searching.json");

  // Get reference from params or current bible state
  const currentBook = useMemo(() => {
    return DB_BOOK_NAMES.find((b) => b.longName === book);
  }, [book]);

  const bookNumber = currentBook?.bookNumber || 10;

  const { data, loading, onSearch, hasCommentaries } = useCommentaryData({
    autoSearch: true,
    bookNumber,
    chapter,
    verse,
  });

  const reference = `${currentBook?.longName} ${chapter}${verse ? `:${verse}` : ""}`;

  const availableCommentaries = useMemo(() => {
    return data?.filter((d) => d.commentaries.length > 0) || [];
  }, [data]);

  const commentaryHTML = useMemo(
    () =>
      createCommentaryHTML(
        theme,
        currentBook?.longName || "",
        reference,
        availableCommentaries,
        loading,
        hasCommentaries,
        true // showReferencePicker
      ),
    [
      theme,
      currentBook,
      reference,
      availableCommentaries,
      loading,
      hasCommentaries,
    ]
  );

  const openModal = () => {
    bibleState$.isChooseReferenceOpened.set(true);
  };

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

          case "changeReference":
            ChooseReferenceMutableProgress.value = withTiming(
              1,
              {
                duration: 450,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1),
              },
              (finished) => {
                if (finished) {
                  runOnJS(openModal)();
                }
              }
            );
            break;

          case "download":
            router.push({
              pathname: `/${Screens.DownloadManager}`,
              params: { filter: ModulesFilters.COMMENTARIES },
            });
            break;

          case "refresh":
            onSearch({ bookNumber, chapter, verse });
            break;
        }
      } catch (error) {
        console.error("Error handling message:", error);
      }
    },
    [reference, bookNumber, chapter, verse, printToFile, router, onSearch]
  );

  const onShouldStartLoadWithRequest = useCallback((event: ShouldStartLoadRequest) => {
    const { url } = event;

    // Handle Bible reference links (e.g., b:20 4:1-17)
    if (url.startsWith("b:")) {
      try {
        const match = url.match(/b:(\d+)\s+(\d+):(\d+)(?:-(\d+))?/);
        if (match) {
          const [, bookNumber, chapterNum, verseStart] = match;
          const currentBook = DB_BOOK_NAMES.find(
            (x) => x.bookNumber === +bookNumber
          );

          if (currentBook) {
            const verseNumber = +verseStart;
            let verseValue;
            if (verseNumber) {
              verseValue = verseNumber;
            } else {
              verseValue = 0;
            }

            const queryInfo = {
              book: currentBook.longName,
              chapter: +chapterNum,
              verse: verseValue,
            };

            bibleState$.changeBibleQuery({
              ...queryInfo,
              shouldFetch: true,
              isHistory: false,
            });

            router.push({
              pathname: `/${Screens.Home}`,
              params: queryInfo,
            });
          }
        }
      } catch (error) {
        console.error("Error handling Bible reference:", error);
      }
      return false;
    }

    // Allow normal navigation for other URLs
    return true;
  }, [router]);

  const screenOptions = useMemo(() => {
    const opacity = loading ? 0.5 : 1;
    return {
      theme,
      title: "Comentarios",
      titleIcon: "MessageSquare",
      headerRightProps: {
        headerRightIcon: "RefreshCw",
        headerRightIconColor: theme.colors.notification,
        onPress: () => {
          onSearch({ bookNumber, chapter, verse });
        },
        disabled: loading,
        style: { opacity },
      },
    } as any;
  }, [loading, bookNumber, chapter, verse, onSearch]);

  return (
    <>
      <Stack.Screen
        options={{
          ...singleScreenHeader(screenOptions),
        }}
      />

      <ScreenWithAnimation
        animationSource={searchingSource}
        speed={2}
        title="Comentarios"
      >
        <View
          style={{
            flex: 1,
            backgroundColor: theme.dark ? theme.colors.background : "#eee",
          }}
        >
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
            onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
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
            onError={(syntheticEvent) => {
              const { nativeEvent = {} } = syntheticEvent;
              console.warn("WebView error: ", nativeEvent);
            }}
            {...createOptimizedWebViewProps({}, "static")}
          />
        </View>

      </ScreenWithAnimation>
      <ExpandableChooseReference isCommentary />
    </>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    webviewWrapper: {
      flex: 1,
      minWidth: "100%",
      backgroundColor: "transparent",
    },
  });

export default CommentaryScreen;
