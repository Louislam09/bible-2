import { chooseReferenceHtmlTemplate } from "@/chooseReferenceTemplate";
import { ChooseReferenceMutableProgress } from "@/components/animations/constants";
import { View } from "@/components/Themed";
import { storedData$ } from "@/context/LocalstoreContext";
import { useMyTheme } from "@/context/ThemeContext";
import useBackHandler from "@/hooks/useBackHandler";
import useParams from "@/hooks/useParams";
import { bibleState$ } from "@/state/bibleState";
import { ChooseReferenceStep, modalState$ } from "@/state/modalState";
import { ChooseChapterNumberParams } from "@/types";
import { createOptimizedWebViewProps } from "@/utils/webViewOptimizations";
import { use$ } from "@legendapp/state/react";
import { useNavigation } from "expo-router";
import React, { useCallback, useRef } from "react";
import { Easing, runOnJS, withTiming } from "react-native-reanimated";
import WebView from "react-native-webview";

interface WebviewReferenceChooseProps {
  onClose: () => void;
}

const WebviewReferenceChoose = React.memo(
  ({ onClose }: WebviewReferenceChooseProps) => {
    const webViewRef = useRef<WebView>(null);
    const fontSize = use$(() => storedData$.fontSize.get());
    const bibleQuery = bibleState$.bibleQuery.get();

    const navigation = useNavigation();
    const routeParam = useParams<ChooseChapterNumberParams>();
    const { theme } = useMyTheme();

    const isChooseReferenceOpened = use$(() =>
      bibleState$.isChooseReferenceOpened.get()
    );

    const sendMessage = (step: number) => {
      const message = { type: "step", step };
      webViewRef.current?.postMessage(JSON.stringify(message));
    };

    useBackHandler(isChooseReferenceOpened, () => {
      switch (modalState$.chooseReferenceStep.get()) {
        case ChooseReferenceStep.InBookSelection ||
          ChooseReferenceStep.Finished:
          onClose();
          return;
        case ChooseReferenceStep.InChapterSelection:
          sendMessage(0);
          modalState$.setChooseReferenceStep(
            ChooseReferenceStep.InBookSelection
          );

          return;
        case ChooseReferenceStep.InVerseSelection:
          sendMessage(1);
          modalState$.setChooseReferenceStep(
            ChooseReferenceStep.InChapterSelection
          );
          return;
      }
    });

    const closeModal = () => {
      // navigation.navigate(Screens.Home, params);
    };

    const onConfirm = useCallback(
      (ref: {
        book: string;
        chapter: number;
        verse: number;
        goHome: boolean;
        type: string;
      }) => {
        if (ref.type === "bookSelected") return;

        const isBottomSideSearching = bibleState$.isBottomBibleSearching.get();
        const params = {
          ...routeParam,
          [isBottomSideSearching ? "bottomSideBook" : "book"]: ref.book,
          [isBottomSideSearching ? "bottomSideChapter" : "chapter"]:
            ref.chapter,
          [isBottomSideSearching ? "bottomSideVerse" : "verse"]: ref.verse,
          isHistory: false,
        } as any;

        bibleState$.changeBibleQuery({
          ...params,
          isBibleBottom: isBottomSideSearching,
          shouldFetch: ref.goHome ? false : true,
          isHistory: false,
        });

        if (ref.goHome) {
          ChooseReferenceMutableProgress.value = withTiming(
            0,
            {
              duration: 50,
              easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            },
            (finished) => {
              if (finished) {
                runOnJS(closeModal)();
              }
            }
          );
          // navigation.navigate(Screens.Home, params);
        }
      },
      [routeParam, navigation]
    );

    const handleMessage = useCallback((event: any) => {
      try {
        const message = JSON.parse(event.nativeEvent.data);
        const { data, type } = message;

        switch (type) {
          case "stepChanged":
            modalState$.setChooseReferenceStep(
              data.step as ChooseReferenceStep
            );
            return;
          default:
            break;
        }

        modalState$.setChooseReferenceStep(data.step as ChooseReferenceStep);
        onConfirm({ ...data, type: type });
      } catch (error) {
        console.warn("Error parsing WebView message:", error);
      }
    }, []);

    return (
      <WebView
        ref={webViewRef}
        key={bibleQuery.book + bibleQuery.chapter + bibleQuery.verse}
        originWhitelist={["*"]}
        style={{
          flex: 1,
          minWidth: "100%",
          backgroundColor: "transparent",
        }}
        source={{
          html: chooseReferenceHtmlTemplate({
            theme,
            initialBook: bibleQuery.book,
            initialChapter: bibleQuery.chapter,
            initialVerse: bibleQuery.verse,
          }),
        }}
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
    );
  }
);

export default React.memo(WebviewReferenceChoose);
