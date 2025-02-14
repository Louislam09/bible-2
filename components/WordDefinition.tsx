import { useNavigation, useTheme } from "@react-navigation/native";
import { DB_BOOK_NAMES } from "@/constants/BookNames";
import { iconSize } from "@/constants/size";
import Voices from "@/constants/Voices";
import { wordDefinitionHtmlTemplate } from "@/constants/wordDefinitionHtmlTemplate";
import { useBibleContext } from "@/context/BibleContext";
import { useCustomTheme } from "@/context/ThemeContext";
import * as Clipboard from "expo-clipboard";
import usePrintAndShare from "@/hooks/usePrintAndShare";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import React, { useRef, useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import WebView from "react-native-webview";
import {
  ShouldStartLoadRequest,
  WebViewMessageEvent,
} from "react-native-webview/lib/WebViewTypes";
import { DictionaryData, Screens, TTheme } from "@/types";
import Icon from "./Icon";
import { Text, View } from "./Themed";
import { useBibleChapter } from "@/context/BibleChapterContext";

type WordDefinitionProps = {
  wordData: DictionaryData;
  subTitle: string;
  navigation?: any;
  theme?: TTheme;
};
const randomVoice = Math.floor(Math.random() * Voices.length);

const WordDefinition = ({
  wordData,
  subTitle,
  navigation: _navigation,
  theme: _theme,
}: WordDefinitionProps) => {
  const navigation = _navigation ? _navigation : useNavigation();
  const voice = Voices[randomVoice];
  const { speak, stop, isSpeaking } = useTextToSpeech({ voice });
  const { schema: themeScheme } = useCustomTheme();
  const theme = _theme ? _theme : useTheme();
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
  const { updateBibleQuery } = useBibleChapter();

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
      updateBibleQuery({ ...queryInfo, shouldFetch: true });
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

  const onRead = () => {
    if (isSpeaking) {
      stop();
      return;
    }
    // speak(definition);
  };

  return (
    <View
      style={{
        paddingHorizontal: 20,
        flex: 1,
        backgroundColor: theme.colors.background,
      }}
    >
      <View style={styles.wordOfDayContainer}>
        <TouchableOpacity
          onPress={copyContentToClipboard}
          style={styles.wordOfDayBody}
        >
          <Text style={styles.bodyTitle}>{topic}</Text>
          <View style={styles.decorationLine} />
        </TouchableOpacity>
        <TouchableOpacity
          style={{ marginHorizontal: 20 }}
          onPress={copyContentToClipboard}
        >
          <Icon name="Share2" color={theme.colors.notification} size={28} />
        </TouchableOpacity>
        <TouchableOpacity
          style={{ marginHorizontal: 20, display: "none" }}
          onPress={onRead}
        >
          <Icon
            name={isSpeaking ? "Pause" : "Play"}
            color={theme.colors.notification}
            size={iconSize}
          />
        </TouchableOpacity>
      </View>

      <View
        style={{
          position: "relative",
          backgroundColor: theme.colors.background,
        }}
      >
        <Text style={[styles.sectionTitle]}>{subTitle}</Text>
        <View style={styles.sectionDecorationLine} />
      </View>

      <View style={[styles.definitionContainer, { height: height as any }]}>
        <WebView
          startInLoadingState
          style={{
            backgroundColor: "transparent",
            height: height as any,
          }}
          ref={webViewRef}
          originWhitelist={["*"]}
          source={{ html }}
          scrollEnabled={true}
          onMessage={onMessage}
          onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
          onLoadEnd={() => {
            webViewRef.current?.injectJavaScript(`
              setTimeout(() => {
                const contentHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
                window.ReactNativeWebView.postMessage(contentHeight.toString());
              }, 500);
            `);
          }}
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
