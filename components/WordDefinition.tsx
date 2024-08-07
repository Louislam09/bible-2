import * as Clipboard from "expo-clipboard";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import WebView from "react-native-webview";
import { Text } from "./Themed";
import { useCustomTheme } from "context/ThemeContext";
import { useTheme } from "@react-navigation/native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { wordDefinitionHtmlTemplate } from "constants/wordDefinitionHtmlTemplate";
import { Screens, TTheme } from "types";
import { useBibleContext } from "context/BibleContext";
import { useNavigation } from "@react-navigation/native";
import { ShouldStartLoadRequest } from "react-native-webview/lib/WebViewTypes";
import { DB_BOOK_NAMES } from "constants/BookNames";

const WordDefinition = ({ wordData, onClose }: any) => {
  const navigation = useNavigation();
  const { theme: themeScheme } = useCustomTheme();
  const theme = useTheme();
  const styles = getStyles(theme, themeScheme === "dark");
  const webViewRef = useRef<WebView>(null);
  const { definition, topic } = wordData;
  const { fontSize } = useBibleContext();
  const copyContentToClipboard = () => {
    if (!webViewRef?.current) return;
    webViewRef?.current.injectJavaScript(`
      function copyContentToClipboard() {
        var content = document.body.innerText; // Extract content as needed
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

      navigation.navigate(Screens.Home, {
        book: currentBook?.longName,
        chapter: chapter,
        verse: verse || 0,
      });
    }

    return false;
  };

  return (
    <View style={{ paddingHorizontal: 20, flex: 1 }}>
      <View style={styles.wordOfDayContainer}>
        <TouchableOpacity
          onPress={() => onClose(null)}
          style={styles.wordOfDayBody}
        >
          <Text style={styles.bodyTitle}>{topic}</Text>
          <View style={styles.decorationLine} />
        </TouchableOpacity>
        <TouchableOpacity
          style={{ marginHorizontal: 20, flex: 1 }}
          onPress={copyContentToClipboard}
        >
          <MaterialCommunityIcons
            name="content-copy"
            color={theme.colors.notification}
            size={28}
          />
        </TouchableOpacity>
      </View>
      <View style={{ position: "relative" }}>
        <Text style={[styles.sectionTitle]}>Historia</Text>
        <View style={styles.sectionDecorationLine} />
      </View>
      <View style={[styles.definitionContainer]}>
        <WebView
          startInLoadingState
          style={{ backgroundColor: "transparent" }}
          ref={webViewRef}
          originWhitelist={["*"]}
          source={{
            html: wordDefinitionHtmlTemplate(
              definition || "",
              theme.colors,
              fontSize
            ),
          }}
          scrollEnabled
          onMessage={async (event) => {
            const text = `${event.nativeEvent.data}`;
            await Clipboard.setStringAsync(text);
          }}
          onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
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
    },
    wordOfDayBody: {
      alignItems: "center",
      justifyContent: "flex-start",
      flexDirection: "row",
    },
    bodyTitle: {
      color: colors.text,
      fontSize: 50,
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
      height: "100%",
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
