import { Text, View } from "@/components/Themed";
import { DB_BOOK_NAMES } from "@/constants/BookNames";
import { commentaryListHtmlTemplate } from "@/constants/commentaryListHtmlTemplate";
import { useBibleContext } from "@/context/BibleContext";
import { useDBContext } from "@/context/databaseContext";
import { useMyTheme } from "@/context/ThemeContext";
import useCommentaryData, {
  DatabaseCommentaryData,
} from "@/hooks/useCommentaryData";
import usePrintAndShare from "@/hooks/usePrintAndShare";
import { bibleState$ } from "@/state/bibleState";
import { Screens, TTheme } from "@/types";
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

interface CommentaryContentProps {
  theme: TTheme;
  fontSize: any;
  navigation: Omit<
    NavigationProp<ReactNavigation.RootParamList>,
    "getState"
  > & {
    getState(): NavigationState | undefined;
  };
  bookNumber: number;
  chapter: number;
  verse?: number;
}

const CommentaryBottomModalContent: React.FC<CommentaryContentProps> = ({
  navigation,
  theme,
  fontSize,
  bookNumber,
  chapter,
  verse,
}) => {
  const [selectedCommentary, setSelectedCommentary] = useState<any>(null);
  const [filterData, setFilterData] = useState<DatabaseCommentaryData[]>([]);
  const { schema } = useMyTheme();
  const { fontSize: bibleFontSize, tailwindScript } = useBibleContext();
  const { printToFile } = usePrintAndShare();
  const styles = getStyles(theme);
  const webViewRef = useRef<WebView>(null);

  const { installedCommentary: dbNames } = useDBContext();

  const { data, error, loading, onSearch } = useCommentaryData({
    databases: dbNames,
    enabled: true,
    autoSearch: true,
    bookNumber,
    chapter,
    verse,
  });

  const commentaryNotFound = useMemo(
    () => data?.every((version) => version.commentaries.length === 0),
    [data]
  );

  useEffect(() => {
    if (!loading && !error) {
      setFilterData(
        data?.sort((a, b) => a.commentaries.length - b.commentaries.length)
      );
    } else if (error) {
      console.log("Error fetching commentary data:", error);
    }
  }, [data, loading, error]);

  const onItemClick = (commentary: any) => {
    setSelectedCommentary(commentary);
  };

  const onWebViewMessage = async (event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);

      if (message.type === "commentarySelected") {
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
    try {
      await Clipboard.setStringAsync(content);
      // Also print to file if needed
      if (selectedCommentary) {
        const bookName =
          DB_BOOK_NAMES.find(
            (b) => b.bookNumber === selectedCommentary.book_number
          )?.longName || "";
        const reference = `${bookName} ${selectedCommentary.chapter_number_from}:${selectedCommentary.verse_number_from}`;
        printToFile(selectedCommentary.text, reference);
      }
    } catch (error) {
      console.error("Error sharing content:", error);
    }
  };

  useEffect(() => {
    const backAction = () => {
      if (selectedCommentary) {
        setSelectedCommentary(null);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [selectedCommentary]);

  const handleCustomBack = useCallback(() => {
    if (selectedCommentary) {
      setSelectedCommentary(null);
    }
  }, [selectedCommentary]);

  const onNavToManagerDownload = useCallback(() => {
    // @ts-ignore
    navigation.navigate(Screens.DownloadManager);
  }, [navigation]);

  const currentReference = useMemo(() => {
    const bookName =
      DB_BOOK_NAMES.find((b) => b.bookNumber === bookNumber)?.longName || "";
    return {
      book: bookName,
      chapter,
      verse,
    };
  }, [bookNumber, chapter, verse]);

  if (dbNames.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="cloud-download-outline"
          size={50}
          color={theme.dark ? theme.colors.text : "#fff"}
        />
        <Text style={styles.emptyText}>
          No tienes ningún comentario descargado. {"\n"}
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
            html: commentaryListHtmlTemplate({
              data: commentaryNotFound ? [] : filterData,
              theme,
              fontSize,
              commentaryNotFound,
              loading,
              selectedCommentary,
              showDetail: !!selectedCommentary,
              tailwindScript,
              currentReference,
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
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error("WebView error: ", nativeEvent);
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error("WebView HTTP error: ", nativeEvent);
          }}
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
  });

export default CommentaryBottomModalContent;
