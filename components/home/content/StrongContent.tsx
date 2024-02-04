import React, { FC, useEffect, useState } from "react";
import { Platform, StyleSheet } from "react-native";
import { IStrongWord, Screens, StrongData, TTheme } from "types";
import { Text, View } from "../../Themed";
import { useDBContext } from "context/databaseContext";
import WebView, { WebViewNavigation } from "react-native-webview";
import { htmlTemplate } from "constants/HtmlTemplate";
import { SEARCH_STRONG_WORD } from "constants/Queries";
import { DB_BOOK_NAMES } from "constants/BookNames";
import { useNavigation } from "@react-navigation/native";
import { ShouldStartLoadRequest } from "react-native-webview/lib/WebViewTypes";

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
  const [text, setText] = useState(data?.code);

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
      const [, bookNumber, chapter] = url.match(/b:(\d+) (\d+):(\d+)/) || [];
      const currentBook = DB_BOOK_NAMES.find(
        (x) => x.bookNumber === +bookNumber
      );

      navigation.navigate(Screens.Home, {
        book: currentBook?.longName,
        chapter: chapter,
      });
    }

    if (url.startsWith("s:")) {
      const strongKeyToSearch = url.replace("s:", "");
      if (strongKeyToSearch === text) {
        // handleGoForward();
      }
      setText(url.replace("s:", ""));
    }
    return false;
  };

  return (
    <View
      style={[
        styles.versionContainer,
        { height: height + EXTRA_HEIGHT_TO_ADJUST },
      ]}
    >
      <Text style={styles.title}>{data.text}</Text>
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
          // onNavigationStateChange={(data) => console.log(data)}
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
      // height: 10000,
      // height: 5000,
    },
    webviewWrapper: {
      width: "95%",
      padding: 5,
      height: "100%",
      backgroundColor: "transparent",
    },
    title: {
      textTransform: "capitalize",
      // borderRadius: 45,
      color: "white",
      fontSize: 20,
      padding: 5,
      width: "90%",
      textAlign: "center",
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
