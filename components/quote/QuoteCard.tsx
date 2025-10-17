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
  index: number;
  isCurrent: boolean;
  distance: number;
  currentTemplateIndex: number;
  pan: Animated.ValueXY;
  rotate: Animated.AnimatedInterpolation<string>;
  currentCardScale: Animated.AnimatedInterpolation<number>;
  currentCardOpacity: Animated.AnimatedInterpolation<number>;
  screenWidth: number;
  panResponder: any;
  reference: string;
  quoteText: string;
  webViewRef: React.RefObject<WebView<{}> | null>;
  viewShotRef: React.RefObject<ViewShot | null>;
}

export const QuoteCard: React.FC<QuoteCardProps> = ({
  template,
  index,
  isCurrent,
  distance,
  currentTemplateIndex,
  pan,
  rotate,
  currentCardScale,
  currentCardOpacity,
  screenWidth,
  panResponder,
  reference,
  quoteText,
  webViewRef,
  viewShotRef,
}) => {
  const relativeIndex = index - currentTemplateIndex;
  const { viewShotRef: useViewShotRef } = useViewShot({
    fileName: `quote_${template.id}`,
    quality: 1,
    format: "png",
  });

  // Animated values for explicit scale and opacity animation
  const scaleAnim = useRef(
    new Animated.Value(isCurrent ? 1 : 1 - distance * 0.2)
  ).current;
  const opacityAnim = useRef(
    new Animated.Value(isCurrent ? 1 : 1 - distance * 0.3)
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isCurrent ? 1 : 1 - distance * 0.2,
        useNativeDriver: true,
      }),
      Animated.spring(opacityAnim, {
        toValue: isCurrent ? 1 : 1 - distance * 0.3,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isCurrent, distance]);

  const cardTranslateX = isCurrent
    ? pan.x
    : relativeIndex * (screenWidth * 0.3);

  const cardTranslateY = distance * 10;
  const cardZIndex = 3 - distance;

  return (
    <Animated.View
      key={template.id}
      style={[
        styles.templateCardWrapper,
        {
          transform: [
            { translateX: cardTranslateX },
            { translateY: isCurrent ? pan.y : cardTranslateY },
            { rotate: isCurrent ? rotate : "0deg" },
            { scale: isCurrent ? currentCardScale : scaleAnim },
          ],
          opacity: isCurrent ? currentCardOpacity : opacityAnim,
          zIndex: cardZIndex,
          pointerEvents: isCurrent ? "auto" : "none",
        },
      ]}
      {...(isCurrent ? panResponder.panHandlers : {})}
    >
      <ViewShot
        ref={isCurrent ? viewShotRef : null}
        options={{
          format: "png",
          quality: 1,
          result: "tmpfile",
        }}
        style={styles.viewShot}
      >
        <WebView
          ref={isCurrent ? webViewRef : null}
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
    </Animated.View>
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
