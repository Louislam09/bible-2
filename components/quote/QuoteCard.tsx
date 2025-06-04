import React, { useRef, useEffect } from "react";
import { StyleSheet, Dimensions, Animated } from "react-native";
import { WebView } from "react-native-webview";
import { TTheme } from "@/types";
import { getVerseTextRaw } from "@/utils/getVerseTextRaw";

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
  onWebViewMessage: (event: any) => void;
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
  onWebViewMessage,
}) => {
  const relativeIndex = index - currentTemplateIndex;

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
      <WebView
        key={template.id}
        originWhitelist={["*"]}
        style={styles.webviewPreview}
        source={{
          html: template.template
            .replace(/{{ref}}/g, reference)
            .replace(/{{text}}/g, getVerseTextRaw(quoteText)),
        }}
        scrollEnabled={false}
        onMessage={onWebViewMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        onError={(syntheticEvent) => {
          const { nativeEvent = {} } = syntheticEvent;
          console.warn("WebView error: ", nativeEvent);
        }}
      />
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
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6.84,
    elevation: 10,
    position: "absolute",
    left: "5%",
    right: "5%",
    top: 0,
    bottom: 0,
  },
  webviewPreview: {
    flex: 1,
    width: "100%",
    backgroundColor: "transparent",
  },
});
