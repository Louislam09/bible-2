import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { DB_BOOK_NAMES } from "constants/BookNames";
import { htmlTemplate } from "constants/HtmlTemplate";
import { SEARCH_STRONG_WORD } from "constants/Queries";
import { useDBContext } from "context/databaseContext";
import React, { FC, useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet } from "react-native";
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

const StrongContent: FC<IStrongContent> = ({ theme, data, fontSize }) => {
  const navigation = useNavigation();
  const { code } = data;
  const { myBibleDB, executeSql } = useDBContext();
  const [value, setValue] = useState<StrongData[]>([
    { definition: "", topic: "" },
  ]);
  const styles = getStyles(theme);
  const [height, setHeight] = useState(DEFAULT_HEIGHT);
  const webViewRef = React.useRef<WebView>(null);
  const [text, setText] = useState(code);
  const [backUrl, setBackUrl] = useState<any>([]);

  useEffect(() => {
    setText(data.code);
  }, [data]);

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
        setValue(strongData as StrongData[]);
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

  return (
    <>
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
          <Text style={styles.title}>{data.text}</Text>
        </View>
        <View style={[styles.webviewWrapper]}>
          <WebView
            style={{ backgroundColor: "transparent" }}
            ref={webViewRef}
            originWhitelist={["*"]}
            source={{ html: htmlTemplate(value, theme.colors, fontSize) }}
            onMessage={(event) =>
              setHeight(+event.nativeEvent.data ?? DEFAULT_HEIGHT)
            }
            scrollEnabled
            onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
          />
        </View>
      </View>
    </>
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
