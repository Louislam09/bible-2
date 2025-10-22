import { useViewShot } from "@/hooks/useViewShot";
import { TTheme } from "@/types";
import { getVerseTextRaw } from "@/utils/getVerseTextRaw";
import { createOptimizedWebViewProps } from "@/utils/webViewOptimizations";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet } from "react-native";
import ViewShot, { ViewShotProperties } from "react-native-view-shot";
import { WebView } from "react-native-webview";

interface QuoteCardProps {
  template: {
    id: string;
    template: string;
  };
  reference: string;
  quoteText: string;
  storyItemDimensions: {
    width: number;
    height: number;
  };
  webViewRef: React.RefObject<WebView<{}> | null>;
  viewShotRef: React.RefObject<ViewShot | null>;
}

export const QuoteCardItem: React.FC<QuoteCardProps> = ({
  template,
  reference,
  quoteText,
  storyItemDimensions,
  webViewRef,
  viewShotRef,
}) => {
  const { viewShotRef: useViewShotRef } = useViewShot({
    fileName: `quote_${template.id}`,
    quality: 1,
    format: "png",
  });

  return (
    <ViewShot
      // ref={isCurrent ? viewShotRef : null}
      ref={null}
      options={{
        format: "png",
        quality: 1,
        result: "tmpfile",
      }}
      style={[styles.viewShot]}
    >
      <WebView
        ref={null}
        // ref={isCurrent ? webViewRef : null}
        key={template.id}
        originWhitelist={["*"]}
        style={styles.webviewPreview}
        source={{
          html: template.template
            .replace(/{{ref}}/g, reference)
            .replace(/{{text}}/g, getVerseTextRaw(quoteText)),
        }}
        scrollEnabled={false}
        onError={(syntheticEvent) => {
          const { nativeEvent = {} } = syntheticEvent;
          console.warn("WebView error: ", nativeEvent);
        }}
        {...createOptimizedWebViewProps({}, "static")}
      />
    </ViewShot>
  );
};

const styles = StyleSheet.create({
  templateCardWrapper: {
    width: "90%",
    aspectRatio: 0.7,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "transparent",
    position: "absolute",
    left: "5%",
    right: "5%",
    top: 0,
    bottom: 0,
  },
  viewShot: {
    flex: 1,
    width: "100%",
    backgroundColor: "transparent",
  },
  webviewPreview: {
    flex: 1,
    width: "100%",
    backgroundColor: "transparent",
  },
});
