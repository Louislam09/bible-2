import { storedData$ } from "@/context/LocalstoreContext";
import { useMyTheme } from "@/context/ThemeContext";
import { bibleState$ } from "@/state/bibleState";
import { modalState$ } from "@/state/modalState";
import { scriptDownloadHelpers } from "@/state/scriptDownloadState";
import { EBibleVersions, TTheme } from "@/types";
import { use$ } from "@legendapp/state/react";
import React, { useCallback, useMemo, useRef } from "react";
import { StyleSheet } from "react-native";
import WebView from "react-native-webview";
import BottomModal from "./BottomModal";
import WebviewInterlinearChapter from "./home/content/WebviewInterlinearChapter";
import { View } from "./Themed";

interface InterlinearBottomSheetProps {

}

// HTML Template Generator
const createInterlinearHTML = (
  theme: TTheme,
) => {
  const colors = theme.colors;
  const tailwindScript = scriptDownloadHelpers.getTailwindScript();

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
        .tab.active { background: ${colors.notification
    } !important; color: white !important; }
        .commentary-card { animation: fadeIn 0.3s ease-in; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .tabs-container::-webkit-scrollbar { display: none; }
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
    <body class="bg-theme-background text-theme-text border border-red-500 w-full h-full">
    <h1>INTERLINEAL</h1>
    </body>
    </html>
  `;
};

const InterlinearBottomSheet: React.FC<InterlinearBottomSheetProps> = ({
}) => {
  const { theme } = useMyTheme();
  const styles = getStyles(theme);


  const interlinearHTML = useMemo(
    () =>
      createInterlinearHTML(
        theme,
      ),
    [
      theme,
    ]
  );

  const handleMessage = useCallback(
    (event: any) => {
      console.log(event)
    },
    []
  );

  const currentBibleVersion = use$(() => storedData$.currentBibleVersion.get());

  const isHebrewInterlinear = [EBibleVersions.INTERLINEAR].includes(
    currentBibleVersion as EBibleVersions
  );

  const isGreekInterlinear = [EBibleVersions.GREEK].includes(
    currentBibleVersion as EBibleVersions
  );

  const isInterlinear = isHebrewInterlinear || isGreekInterlinear;
  const interlinearVerses = use$(() => bibleState$.bibleData.interlinearVerses.get()) ?? [];

  const chapterData = useMemo(() => {
    return interlinearVerses;
  }, [isInterlinear]);

  return (
    <BottomModal
      style={styles.bottomSheet}
      backgroundColor={theme.dark ? theme.colors.background : "#eee"}
      shouldScroll={false}
      ref={modalState$.interlinealRef.get()}
      justOneSnap
      showIndicator
      justOneValue={["40%", "90%"]}
      startAT={1}
      onDismiss={() => { }}
    >
      <View style={styles.webviewWrapper}>
        <WebviewInterlinearChapter isModal theme={theme} data={chapterData} />
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

export default InterlinearBottomSheet;
