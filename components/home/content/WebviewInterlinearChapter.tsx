import { View } from "@/components/Themed";
import { interlinearChapterHtmlTemplate } from "@/constants/interlinearChapterHtmlTemplate";
import { storedData$ } from "@/context/LocalstoreContext";
import { bibleState$ } from "@/state/bibleState";
import { modalState$ } from "@/state/modalState";
import { IBookVerse, TTheme } from "@/types";
import { createOptimizedWebViewProps } from "@/utils/webViewOptimizations";
import { use$ } from "@legendapp/state/react";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import WebView from "react-native-webview";

interface Props {
    theme: TTheme;
    data: IBookVerse[];
    isModal?: boolean;
}

const WebviewInterlinearChapter: React.FC<Props> = ({ theme, data, isModal }) => {
    const webViewRef = useRef<WebView>(null);
    const insets = useSafeAreaInsets();
    const safeTop = isModal ? 0 : insets.top;

    const fontSize = use$(() => storedData$.fontSize.get());
    const topVerses = use$(() => bibleState$.bibleData.topVerses.get());

    const htmlChapterTemplate = useMemo(() => {
        if (!data || data.length === 0) return "";

        return interlinearChapterHtmlTemplate({
            data,
            theme,
            fontSize: fontSize || 16,
            topVerses: topVerses || []
        });
    }, [data, theme, fontSize, topVerses]);

    const handleMessage = useCallback(
        (event: any) => {
            try {
                const message = JSON.parse(event.nativeEvent.data);

                switch (message.type) {
                    case "strongWordClick":
                        if (message.data) {
                            bibleState$.handleStrongWord(message.data);
                            modalState$.openStrongSearchBottomSheet();
                        }
                        break;
                    case "scroll":
                        break;
                }
            } catch (error) {
                console.warn("Error parsing WebView message:", error);
            }
        },
        []
    );

    return (
        <WebView
            ref={webViewRef}
            key={'interlinear-chapter'}
            originWhitelist={["*"]}
            style={{
                flex: 1,
                minWidth: "100%",
                backgroundColor: "transparent",

            }}
            containerStyle={{
                marginTop: isModal ? 0 : safeTop + 10,
                backgroundColor: "transparent",
            }}
            source={{
                html: htmlChapterTemplate,
            }}
            scrollEnabled={true}
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
            {...createOptimizedWebViewProps({}, "bibleChapter")}
        />
    );
};

export default WebviewInterlinearChapter;
