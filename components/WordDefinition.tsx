import { DB_BOOK_NAMES } from "@/constants/BookNames";
import { wordDefinitionHtmlTemplate } from "@/constants/wordDefinitionHtmlTemplate";
import { useBibleContext } from "@/context/BibleContext";
import { useMyTheme } from "@/context/ThemeContext";
import usePrintAndShare from "@/hooks/usePrintAndShare";
import { bibleState$ } from "@/state/bibleState";
import { DictionaryData, Screens, TTheme } from "@/types";
import { createOptimizedWebViewProps } from "@/utils/webViewOptimizations";
import { useNavigation } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import React, { useRef, useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import WebView from "react-native-webview";
import {
  ShouldStartLoadRequest,
  WebViewMessageEvent,
} from "react-native-webview/lib/WebViewTypes";
import { Text, View } from "./Themed";
import Icon from "./Icon";

type WordDefinitionProps = {
  wordData: DictionaryData;
  subTitle: string;
  navigation?: any;
  theme?: TTheme;
};

const WordDefinition = ({
  wordData,
  subTitle,
  navigation: _navigation,
  theme: _theme,
}: WordDefinitionProps) => {
  const defaultNavigation = useNavigation();
  const navigation = _navigation || defaultNavigation;
  const { schema: themeScheme, theme } = useMyTheme();
  const styles = getStyles(theme, themeScheme === "dark");
  const webViewRef = useRef<WebView>(null);
  const { definition, topic } = wordData;
  const { fontSize } = useBibleContext();
  const { printToFile } = usePrintAndShare();
  const html = wordDefinitionHtmlTemplate(
    definition || "",
    theme.colors,
    fontSize
  );
  const [height, setHeight] = useState<number | string>("100%");

  const copyContentToClipboard = () => {
    if (!webViewRef?.current) return;
    webViewRef?.current.injectJavaScript(`
      function copyContentToClipboard() {
        let content = document.body.innerText; // Extract content as needed
        window.ReactNativeWebView.postMessage(content);
      }

      copyContentToClipboard();
    `);
  };

  const onShouldStartLoadWithRequest = (event: ShouldStartLoadRequest) => {
    const { url } = event;
    if (url.startsWith("b:")) {
      const [, bookNumber, chapter, verse] =
        url.match(/b:(\d+) (\d+):(\d+)/) || [];
      const currentBook = DB_BOOK_NAMES.find(
        (x) => x.bookNumber === +bookNumber
      );
      const queryInfo = {
        book: currentBook?.longName || "Mateo",
        chapter: +chapter,
        verse: +verse || 0,
      };
      bibleState$.changeBibleQuery({
        ...queryInfo,
        shouldFetch: true,
        isHistory: false,
      });
      navigation.navigate(Screens.Home, queryInfo);
    }

    return false;
  };

  const onMessage = async (event: WebViewMessageEvent) => {
    const eventData = event.nativeEvent.data;
    const isNumber = !isNaN(+eventData);
    if (isNumber) {
      setHeight(+eventData);
      return;
    }
    const text = `${eventData}`;
    await Clipboard.setStringAsync(text);
    const _html = wordDefinitionHtmlTemplate(
      definition || "",
      theme.colors,
      fontSize,
      true
    );
    printToFile(_html, topic?.toUpperCase() || "--");
  };

  return (
    <View
      style={{
        paddingHorizontal: 20,
        flex: 1,
        backgroundColor: theme.colors.background,
      }}
    >
      <View
        style={{
          position: "relative",
          backgroundColor: theme.colors.background,
        }}
      >
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
          onPress={copyContentToClipboard}
        >
          <Text style={[styles.sectionTitle]}>{subTitle}</Text>
          <Icon name="Share2" color={theme.colors.notification} size={28} />
          <View style={styles.sectionDecorationLine} />
        </TouchableOpacity>
      </View>

      <View style={[styles.definitionContainer]}>
        <WebView
          startInLoadingState
          style={{
            backgroundColor: "transparent",
          }}
          ref={webViewRef}
          originWhitelist={["*"]}
          source={{ html }}
          onMessage={onMessage}
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
          scrollEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
          {...createOptimizedWebViewProps({}, "static")}
        />
      </View>
    </View>
  );
};

export default WordDefinition;

const getStyles = ({ colors }: TTheme, isDark?: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    wordOfDayContainer: {
      width: "100%",
      alignItems: "center",
      justifyContent: "flex-start",
      marginVertical: 15,
      flexDirection: "row",
      backgroundColor: colors.background,
    },
    wordOfDayBody: {
      alignItems: "center",
      justifyContent: "flex-start",
      flexDirection: "row",
    },
    bodyTitle: {
      color: colors.text,
      fontSize: 40,
      fontWeight: "600",
      textTransform: "capitalize",
    },
    bodyText: {
      marginTop: -15,
      color: colors.text,
      fontSize: 20,
    },
    wordOfDayAction: {
      width: "100%",
      backgroundColor: colors.notification,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      paddingVertical: 15,
      borderRadius: 10,
    },
    actionIcon: {
      color: isDark ? colors.text : colors.background,
    },
    sectionTitle: {
      color: colors.text,
      alignSelf: "flex-start",
      marginVertical: 15,
      marginTop: 20,
      fontSize: 20,
      fontWeight: "bold",
    },
    definitionContainer: {
      flex: 1,
      backgroundColor: "transparent",
    },
    decorationLine: {
      ...StyleSheet.absoluteFillObject,
      width: "15%",
      height: 4,
      backgroundColor: colors.notification,
      top: "90%",
      left: "3%",
    },
    sectionDecorationLine: {
      ...StyleSheet.absoluteFillObject,
      width: "10%",
      height: 4,
      backgroundColor: colors.notification,
      top: "80%",
    },
  });
