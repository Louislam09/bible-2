import { Text, View } from "@/components/Themed";
import { DB_BOOK_NAMES } from "@/constants/BookNames";
import { dictionaryListHtmlTemplate } from "@/constants/dictionaryListHtmlTemplate";
import { useBibleContext } from "@/context/BibleContext";
import useDictionaryData, { DatabaseData } from "@/hooks/useDictionaryData";
import usePrintAndShare from "@/hooks/usePrintAndShare";
import { bibleState$ } from "@/state/bibleState";
import { modalState$ } from "@/state/modalState";
import { DictionaryData, Screens, TTheme } from "@/types";
import { createOptimizedWebViewProps } from "@/utils/webViewOptimizations";
import Ionicons from "@expo/vector-icons/Ionicons";
import { NavigationProp, NavigationState } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { BackHandler, StyleSheet, TouchableOpacity } from "react-native";
import WebView from "react-native-webview";
import { WebViewMessageEvent } from "react-native-webview/lib/WebViewTypes";
import { IconProps } from "./Icon";
import { wordDefinitionHtmlTemplate } from "@/constants/wordDefinitionHtmlTemplate";

interface DictionaryContentProps {
  theme: TTheme;
  fontSize: any;
  navigation: Omit<
    NavigationProp<ReactNavigation.RootParamList>,
    "getState"
  > & {
    getState(): NavigationState | undefined;
  };
}

type HeaderAction = {
  iconName: IconProps["name"];
  description: string;
  onAction: () => void;
};

const DictionaryBottomModalContent: React.FC<DictionaryContentProps> = ({
  navigation,
  theme,
  fontSize,
}) => {
  const [selectedWord, setSelectedWord] = useState<any>(null);
  const [filterData, setFilterData] = useState<DatabaseData[]>([]);
  const { fontSize: bibleFontSize } = useBibleContext();
  const { printToFile } = usePrintAndShare();
  const styles = getStyles(theme);
  const word = "";
  const webViewRef = useRef<WebView>(null);

  const { data, error, loading, hasDictionary } = useDictionaryData({
    autoSearch: true,
  });

  const wordNotFoundInDictionary = useMemo(
    () => data?.every((version) => version.words.length === 0),
    [data]
  );

  useEffect(() => {
    if (!loading && !error) {
      setFilterData(data?.sort((a, b) => a.words.length - b.words.length));
    } else if (error) {
      console.log("Error fetching dictionary data:", error);
    }
  }, [data, loading, error]);

  const onItemClick = (word: DictionaryData) => {
    setSelectedWord(word);
  };

  const onWebViewMessage = async (event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);

      if (message.type === "wordSelected") {
        onItemClick(message.data);
      } else if (message.type === "bibleLink") {
        handleBibleLink(message.url);
      } else if (message.type === "shareContent") {
        await handleShareContent(message.content);
      } else if (message.type === "goBack") {
        handleCustomBack();
      }
    } catch (error) {
      console.error("Error parsing WebView message:", error);
    }
  };

  const handleBibleLink = (url: string) => {
    const [, bookNumber, chapter, verse] =
      url.match(/b:(\d+) (\d+):(\d+)/) || [];
    const currentBook = DB_BOOK_NAMES.find((x) => x.bookNumber === +bookNumber);
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
  };

  const handleShareContent = async (content: string) => {
    await Clipboard.setStringAsync(content);
    // Also print to file if needed
    if (selectedWord.topic) {
      const html = wordDefinitionHtmlTemplate(
        selectedWord.definition || "",
        theme.colors,
        bibleFontSize,
        true
      );
      printToFile(html, selectedWord.topic?.toUpperCase() || "--");
    }
  };

  useEffect(() => {
    const backAction = () => {
      setSelectedWord(null);
      !selectedWord?.topic && modalState$.closeDictionaryBottomSheet();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [selectedWord]);

  const handleCustomBack = useCallback(() => {
    if (selectedWord?.topic) {
      setSelectedWord(null);
    } else {
      modalState$.closeDictionaryBottomSheet();
    }
  }, [selectedWord]);

  const onNavToManagerDownload = useCallback(() => {
    // @ts-ignore
    navigation.navigate(Screens.DownloadManager);
  }, [navigation]);


  if (!hasDictionary) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="cloud-download-outline"
          size={50}
          color={theme.dark ? theme.colors.text : "#fff"}
        />
        <Text style={styles.emptyText}>
          No tienes ningún diccionario descargado. {"\n"}
          <TouchableOpacity onPress={onNavToManagerDownload}>
            <Text style={styles.linkText}>
              Haz clic aquí para descargar uno.
            </Text>
          </TouchableOpacity>
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        position: "relative",
        flex: 1,
      }}
    >
      <View
        style={{
          flex: 1,
          paddingHorizontal: 15,
        }}
      >
        <WebView
          ref={webViewRef}
          style={{
            flex: 1,
            backgroundColor: "transparent",
          }}
          source={{
            html: dictionaryListHtmlTemplate({
              data: wordNotFoundInDictionary ? [] : filterData,
              theme,
              fontSize,
              wordNotFound: wordNotFoundInDictionary,
              loading,
              selectedWord,
              showDefinition: !!selectedWord,
            }),
          }}
          onMessage={onWebViewMessage}
          onShouldStartLoadWithRequest={(event) => {
            if (event.url.startsWith("b:")) {
              handleBibleLink(event.url);
            }
            return false;
          }}
          originWhitelist={["*"]}
          scrollEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
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
          {...createOptimizedWebViewProps({}, "dynamic")}
        />
      </View>
    </View>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    bottomSheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    verseBody: {
      color: colors.text,
      backgroundColor: "transparent",
    },
    date: {
      color: colors.notification,
      textAlign: "right",
      marginTop: 10,
    },
    textInput: {
      padding: 10,
      fontSize: 22,
      color: colors.text,
      marginVertical: 5,
      textDecorationStyle: "solid",
      textDecorationColor: "red",
      textDecorationLine: "underline",
    },
    scrollToTopButton: {
      position: "absolute",
      bottom: 25,
      right: 20,
      backgroundColor: colors.notification,
      padding: 10,
      borderRadius: 10,
      borderColor: "#ddd",
      borderWidth: 0.3,
      elevation: 3,
    },
    noteHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 4,
      paddingVertical: 10,
      backgroundColor: "transparent",
    },
    noteListTitle: {
      fontSize: 30,
      marginVertical: 10,
      fontWeight: "bold",
      textAlign: "center",
      color: colors.notification,
    },
    noteHeaderSubtitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      alignSelf: "flex-start",
    },
    searchContainer: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      borderRadius: 10,
      marginVertical: 20,
      borderWidth: 1,
      borderColor: colors.notification,
      borderStyle: "solid",
      width: "100%",
      fontWeight: "100",
      backgroundColor: colors.notification + "99",
    },
    searchIcon: {
      color: colors.text,
      paddingHorizontal: 15,
      borderRadius: 10,
      fontWeight: "bold",
    },
    noteHeaderSearchInput: {
      borderRadius: 10,
      padding: 10,
      paddingLeft: 15,
      fontSize: 18,
      flex: 1,
      fontWeight: "100",
      backgroundColor: "#ddd",
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
    },
    verseAction: {
      flexDirection: "row",
      backgroundColor: "transparent",
    },
    icon: {
      fontWeight: "700",
      marginHorizontal: 10,
      color: colors.primary,
      fontSize: 24,
    },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      backgroundColor: colors.background,
      justifyContent: "center",
      padding: 20,
    },
    emptyText: {
      textAlign: "center",
      marginVertical: 20,
      color: dark ? colors.text : "#fff",
      fontWeight: dark ? "normal" : "bold",
      fontSize: 18,
    },
    linkText: {
      color: dark ? colors.primary : "#fff",
      textDecorationLine: "underline",
      fontSize: 18,
    },

    actionContainer: {
      flexDirection: "row",
      backgroundColor: "transparent",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: 10,
      paddingHorizontal: 10,
    },
    actionItem: {
      alignItems: "center",
      marginHorizontal: 2,
      paddingVertical: 2,
      paddingHorizontal: 4,
    },
    actionItemText: {
      fontSize: 16,
      color: colors.text,
      textAlign: "center",
      fontWeight: "bold",
    },
    currentWord: {
      color: colors.text,
      fontWeight: "bold",
      textAlign: "center",
    },
  });

export default DictionaryBottomModalContent;
