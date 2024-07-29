import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { DB_BOOK_NAMES } from "constants/BookNames";
import { htmlTemplate } from "constants/HtmlTemplate";
import { SEARCH_STRONG_WORD } from "constants/Queries";
import { useDBContext } from "context/databaseContext";
// import usePrintAndShare from "hooks/usePrintAndShare";
import React, { FC, useEffect, useRef, useState } from "react";
import { Animated, Platform, Pressable, StyleSheet } from "react-native";
import WebView from "react-native-webview";
import { ShouldStartLoadRequest } from "react-native-webview/lib/WebViewTypes";
import { IStrongWord, Screens, StrongData, TTheme } from "types";
import { Text, View } from "../../Themed";

interface IStrongContent {
  theme: TTheme;
  data: IStrongWord;
  fontSize: any;
}

const DEFAULT_HEIGHT = 14000;
const EXTRA_HEIGHT_TO_ADJUST = 100;

function extractWord(text: string, isH: boolean) {
  const regex = isH ? /<p\/><b>(.*?)<\/b>/ : /<p\/>(.*?)<\/b>/;
  const match = text?.match(regex);

  if (match && match[1]) {
    return match[1];
  } else {
    return null;
  }
}

const StrongContent: FC<IStrongContent> = ({ theme, data, fontSize }) => {
  const navigation = useNavigation();
  const { code } = data;
  const { myBibleDB, executeSql } = useDBContext();
  const [values, setValues] = useState<StrongData[]>([
    { definition: "", topic: "" },
  ]);
  const styles = getStyles(theme);
  const [height, setHeight] = useState(DEFAULT_HEIGHT);
  const webViewRef = React.useRef<WebView>(null);
  const [text, setText] = useState(code);
  const [backUrl, setBackUrl] = useState<any>([]);
  // const { createAndShareTextFile } = usePrintAndShare();

  const animatedScaleIcon = useRef(new Animated.Value(0)).current;
  const HTML_DATA = htmlTemplate(values, theme.colors, fontSize);

  useEffect(() => {
    const loopAnimation = Animated.loop(
      Animated.sequence([
        Animated.spring(animatedScaleIcon, {
          toValue: 1,
          friction: 0.1,
          tension: 40,
          useNativeDriver: false,
        }),
        Animated.timing(animatedScaleIcon, {
          toValue: 0,
          duration: 500,
          useNativeDriver: false,
        }),
      ])
    );

    loopAnimation.start();
  }, [animatedScaleIcon]);

  const _animatedScaleIcon = animatedScaleIcon.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });

  const animatedStyle = {
    transform: [{ scale: _animatedScaleIcon }],
  };

  useEffect(() => {
    setText(data.code);
  }, [data]);

  useEffect(() => {
    (async () => {
      if (myBibleDB && executeSql) {
        const strongData = await executeSql(
          myBibleDB,
          SEARCH_STRONG_WORD,
          text.split(",")
        );
        setValues(strongData as StrongData[]);
      }
    })();
  }, [code, text]);

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

    if (url.startsWith("s:")) {
      const strongKeyToSearch = url.replace("s:", "");
      if (strongKeyToSearch === text) {
        // handleGoForward();
      }
      const word = url.replace("s:", "");
      setBackUrl((prev: any) => [...prev, text]);
      setText(word);
    }
    return false;
  };

  const onGoBack = () => {
    const urls = backUrl;
    const url = urls.pop() ?? code;
    setBackUrl(urls);
    setText(url);
  };

  const onStrongSearchEntire = () => {
    const [value1] = values;
    navigation.navigate(Screens.StrongSearchEntire, {
      paramCode: value1?.topic,
    });
  };

  const currentCode = values[0]?.topic;
  const isH = currentCode?.includes("H");
  const title = extractWord(values[0]?.definition, isH);

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

  return (
    <View
      style={[
        styles.versionContainer,
        { height: height + EXTRA_HEIGHT_TO_ADJUST },
      ]}
    >
      <View style={styles.header}>
        {backUrl.length !== 0 && (
          <Pressable
            android_ripple={{
              color: theme.colors.background,
              foreground: true,
              radius: 10,
            }}
            onPress={onGoBack}
          >
            <MaterialCommunityIcons
              style={styles.backIcon}
              name="keyboard-backspace"
              size={26}
              color="white"
            />
          </Pressable>
        )}
        <Text style={styles.title}>
          {title || "-"} - {currentCode}
        </Text>
        <Animated.View style={[animatedStyle]}>
          <Pressable
            android_ripple={{
              color: theme.colors.background,
              foreground: true,
              radius: 10,
            }}
            onPress={onStrongSearchEntire}
          >
            <MaterialCommunityIcons
              style={[styles.backIcon, {}]}
              name="text-search"
              size={26}
              color="white"
            />
          </Pressable>
        </Animated.View>
        {/* <Animated.View style={[]}>
          <Pressable
            android_ripple={{
              color: theme.colors.background,
              foreground: true,
              radius: 10,
            }}
            onPress={() => {
              const html = htmlTemplate(values, theme.colors, fontSize, true);
              printToFile(html);
            }}
          >
            <MaterialCommunityIcons
              style={[styles.backIcon, {}]}
              name="share-variant-outline"
              size={26}
              color="white"
            />
          </Pressable>
        </Animated.View> */}
        {/* <Animated.View style={[]}>
          <Pressable
            android_ripple={{
              color: theme.colors.background,
              foreground: true,
              radius: 10,
            }}
            onPress={copyContentToClipboard}
            // onPress={() => createAndShareTextFile(values?.[0]?.definition)}
          >
            <MaterialCommunityIcons
              style={[styles.backIcon, {}]}
              name="share-variant"
              size={26}
              color="white"
            />
          </Pressable>
        </Animated.View> */}
      </View>
      <View style={[styles.webviewWrapper]}>
        <WebView
          style={{ backgroundColor: "transparent" }}
          ref={webViewRef}
          originWhitelist={["*"]}
          source={{ html: HTML_DATA }}
          onMessage={(event) => {
            const isNumber = !isNaN(+event.nativeEvent.data);
            if (isNumber) {
              setHeight(+event.nativeEvent.data || DEFAULT_HEIGHT);
              return;
            }
            // const text = `${event.nativeEvent.data}`;
            // createAndShareTextFile(text, title || "-");
          }}
          scrollEnabled
          onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        />
      </View>
    </View>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    versionContainer: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
      borderRadius: 45,
      backgroundColor: "transparent",
    },
    webviewWrapper: {
      width: "95%",
      padding: 5,
      height: "100%",
      backgroundColor: "transparent",
    },
    header: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "90%",
      padding: 5,
      gap: 2,
    },
    backIcon: {
      alignSelf: "flex-start",
      fontWeight: "bold",
      paddingHorizontal: 10,
      padding: 5,
      backgroundColor: colors.notification,
    },
    title: {
      justifyContent: "space-between",
      textTransform: "capitalize",
      color: "white",
      fontSize: 20,
      flex: 1,
      textAlign: "center",
      padding: 5,
      paddingRight: 30,
      backgroundColor: colors.notification,
    },
    card: {
      width: "90%",
      backgroundColor: "white",
      borderRadius: 8,
      padding: 5,
      marginVertical: 8,
      elevation: 5,
      ...Platform.select({
        ios: {
          shadowColor: "black",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        },
      }),
    },
    versionText: {
      color: "#000",
      fontSize: 22,
      textAlign: "center",
    },
  });

export default StrongContent;
