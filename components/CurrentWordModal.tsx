import { View, StyleSheet, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { htmlTemplate } from "../constants/HtmlTemplate";
import WebView, { WebViewNavigation } from "react-native-webview";
import { useDBContext } from "../context/databaseContext";
import { Ionicons } from "@expo/vector-icons";
import { ShouldStartLoadRequest } from "react-native-webview/lib/WebViewTypes";
import { useNavigation, useTheme } from "@react-navigation/native";
import { DB_BOOK_NAMES } from "../constants/BookNames";
import { Screens, TTheme } from "../types";
import { Text } from "./Themed";

type Props = {
  strongNumber: {
    ref?: string;
    text?: string;
  };
  setOpen: () => void;
};

export interface IStrongData {
  definition?: string;
  lexeme?: string;
  pronunciation?: string;
  short_definition?: string;
  topic?: string;
  transliteration?: string;
}

const CurrentWordModal: React.FC<Props> = ({ strongNumber, setOpen }) => {
  const { colors } = useTheme() as TTheme;
  const [text, setText] = useState(strongNumber?.ref);
  const [nav, setNav] = useState({ canGoBack: false, canGoForward: false });
  const webViewRef = React.useRef<WebView>(null);
  const { strongDB, strongExecuteSql } = useDBContext();
  const [data, setData] = useState<IStrongData>({});
  const navigator = useNavigation();

  useEffect(() => {
    setText(strongNumber?.ref);
  }, [strongNumber]);

  useEffect(() => {
    (async () => {
      if (strongDB && strongExecuteSql && text) {
        const sql = `SELECT * FROM dictionary WHERE topic = ?;`;
        strongExecuteSql(sql, [text])
          .then((rows) => {
            if (!rows.length) return;
            setData(rows?.[0] ?? {});
          })
          .catch((err) => {
            console.log(err);
          });
      }
    })();
  }, [strongDB, text]);

  const handleGoBack = () => {
    webViewRef.current?.goBack();
  };

  const handleGoForward = () => {
    webViewRef.current?.goForward();
  };

  const handleNavigation = (event: WebViewNavigation) => {
    setNav({
      canGoForward: event.canGoForward,
      canGoBack: event.canGoBack,
    });
  };

  const onShouldStartLoadWithRequest = (event: ShouldStartLoadRequest) => {
    const { url } = event;
    if (url.startsWith("b:")) {
      console.log(navigator.getState());
      const [bookNumber, bookInfo] = url.split(" ");
      const number = bookNumber.split(":")[1];
      const currentChapter = bookInfo.split(":")[0];
      const currentBook = DB_BOOK_NAMES.find((x) => x.bookNumber === +number);

      // DB_BOOK_NAMES.
      // the person want to be redict to a book
      navigator.navigate(Screens.Home, {
        book: currentBook?.longName,
        chapter: currentChapter,
      });
      setOpen(); // allow the WebView to load the URL normally
    }

    if (url.startsWith("s:")) {
      const strongKeyToSearch = url.replace("s:", "");
      if (strongKeyToSearch === text) {
        handleGoForward();
      }
      setText(url.replace("s:", ""));
    }
    return false; // allow the WebView to load the URL normally
  };

  return (
    <View
      style={{
        borderRadius: 25,
        height: "50%",
        width: "100%",
        backgroundColor: colors.backgroundContrast,
        position: "absolute",
        bottom: 0,
        borderColor: colors.text,
        borderStyle: "solid",
        borderWidth: 1,
      }}
    >
      <View style={styles.chapterHeader}>
        <View
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-evenly",
          }}
        >
          {nav.canGoBack && (
            <TouchableOpacity style={{ flex: 0.1 }} onPress={handleGoBack}>
              <Ionicons name="arrow-back" size={30} color="white" />
            </TouchableOpacity>
          )}
          {nav.canGoForward && (
            <TouchableOpacity style={{ flex: 0.1 }} onPress={handleGoForward}>
              <Ionicons name="arrow-forward" size={30} color="white" />
            </TouchableOpacity>
          )}
          <Text style={styles.chapterHeaderTitle}>
            Palabra:{" "}
            <Text
              style={{
                textDecorationColor: "orange",
                textDecorationLine: "underline",
                textDecorationStyle: "solid",
              }}
            >
              {strongNumber.text}
            </Text>
          </Text>
        </View>
        <TouchableOpacity
          style={{ flex: 0.1, paddingHorizontal: 10 }}
          onPress={() => setOpen()}
        >
          <Ionicons name="close" size={30} color="white" />
        </TouchableOpacity>
      </View>
      {data?.definition && (
        <WebView
          ref={webViewRef}
          originWhitelist={["*"]}
          source={{
            html: htmlTemplate(data ?? "There is not data for this word."),
          }}
          onNavigationStateChange={handleNavigation}
          onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  chapterHeader: {
    paddingVertical: 10,
    display: "flex",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  chapterHeaderTitle: {
    flex: 1,
    width: "100%",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "white",
  },
});

export default CurrentWordModal;
