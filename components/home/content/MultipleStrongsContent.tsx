import Icon, { IconProps } from "@/components/Icon";
import { DB_BOOK_NAMES } from "@/constants/BookNames";
import { htmlTemplate } from "@/constants/HtmlTemplate";
import { SEARCH_STRONG_WORD } from "@/constants/Queries";
import { iconSize } from "@/constants/size";
import { useDBContext } from "@/context/databaseContext";
import usePrintAndShare from "@/hooks/usePrintAndShare";
import { bibleState$ } from "@/state/bibleState";
import { modalState$ } from "@/state/modalState";
import {
  DictionaryData,
  EBibleVersions,
  IStrongWord,
  Screens,
  TTheme,
} from "@/types";
import { use$ } from "@legendapp/state/react";
import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import WebView from "react-native-webview";
import { ShouldStartLoadRequest } from "react-native-webview/lib/WebViewTypes";
import { Text, View } from "../../Themed";
import { useBibleContext } from "@/context/BibleContext";
import { useHaptics } from "@/hooks/useHaptics";

type HeaderAction = {
  iconName: IconProps["name"];
  viewStyle: {};
  description: string;
  onAction: () => void;
};

const DEFAULT_HEIGHT = 14000;
const EXTRA_HEIGHT_TO_ADJUST = 150;

const createMultipleStrongsHtmlTemplate = (
  content: DictionaryData[] | any,
  colors: any,
  fontSize: any,
  strongNumbers: string[],
  cognate: string,
  activeTab: number
) => {
  const tabs = strongNumbers
    .map(
      (strongNumber, index) => `
    <button 
      class="tab ${index === activeTab ? "active" : ""}" 
      onclick="switchTab(${index})"
    >
      ${cognate}${strongNumber}
    </button>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Múltiples Strong's</title>
        <style>
            body{
                color: ${colors.text};
                background: ${colors.background}99;
                font-size: ${fontSize + "px"};
                user-select: none;
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                font-family: serif;
            }

            .tabs-container {
                display: flex;
                overflow: auto;
                width: 100%;
                // border: 1px solid red;
                padding: 8px 16px;
                background: ${colors.background};
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                white-space: nowrap;
            }

            .tabs-container::-webkit-scrollbar {
                display: none;
            }

            .tab {
                padding: 10px 16px;
                margin-right: 8px;
                border: none;
                background: transparent;
                color: ${colors.text};
                cursor: pointer;
                border-bottom: 3px solid transparent;
                border-radius: 8px 8px 0 0;
                font-size: ${fontSize}px;
                font-weight: 600;
                white-space: nowrap;
                transition: all 0.2s ease;
                flex-shrink: 0;
                flex: 0 0 auto;
                min-width: fit-content;
            }

            .tab:hover {
                background: ${colors.background}20;
            }

            .tab.active {
                color: ${colors.notification};
                border-bottom-color: ${colors.notification};
                background: ${colors.background}20;
                font-weight: bold;
            }

            .content {
                padding: 20px;
            }

            b{
                color: ${colors.notification};
            }
            a {
                color: ${colors.notification};
            }
            a:after{
                // content: '🔎'
            }
            p:last-child{
                color: green;
            }
            h4 {
                display: ${content?.[1]?.topic ? "block" : "none"};
            }
        </style>
    </head>
    <body>
        <div class="tabs-container">
            ${tabs}
        </div>
        <div class="content">
            <h4>
                ${content?.[0]?.topic || ""} > <a href='S:${
    content?.[1]?.topic || ""
  }'>${content?.[1]?.topic || ""}</a>
            </h4>
            ${content?.[0]?.definition || ""}
        </div>
        
        <script>
            function switchTab(index) {
                // Send message to React Native to switch tab
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'switchTab',
                    data: { index: index }
                }));
            }
        </script>
    </body>
    </html>
  `;
};

function extractWord(text: string, isH: boolean) {
  const regex = isH ? /<p\/><b>(.*?)<\/b>/ : /<p\/>(.*?)<\/b>/;
  const match = text?.match(regex);

  if (match && match[1]) {
    return match[1];
  } else {
    return null;
  }
}

interface MultipleStrongsData {
  word: string;
  strongNumbers: string[];
  verseNumber?: string;
  verseData: any;
}

interface IMultipleStrongsContent {
  theme: TTheme;
  fontSize: any;
  navigation: any;
  data: MultipleStrongsData;
}

const MultipleStrongsContent: FC<IMultipleStrongsContent> = ({
  theme,
  fontSize,
  navigation,
  data,
}) => {
  const [activeTab, setActiveTab] = useState(0);

  // Get verse data to determine cognate
  const verseData = data.verseData || {};
  const bookNumber = verseData.book_number || 0;

  // Determine cognate based on book number (same logic as StrongContent)
  const NT_BOOK_NUMBER = 470;
  const cognate = bookNumber < NT_BOOK_NUMBER ? "H" : "G";

  const currentStrongNumber = data.strongNumbers[activeTab] || "";
  const cognateStrongNumber = cognate + currentStrongNumber;

  const { myBibleDB, executeSql, isMyBibleDbLoaded, mainBibleService } =
    useDBContext();
  const [values, setValues] = useState<DictionaryData[]>([
    { definition: "", topic: "" },
  ]);
  const styles = getStyles(theme);
  const [height, setHeight] = useState(DEFAULT_HEIGHT);
  const webViewRef = React.useRef<WebView>(null);
  const [strongCode, setStrongCode] = useState(cognateStrongNumber);
  const [sharing, setSharing] = useState(false);
  const [backUrl, setBackUrl] = useState<any>([]);
  const { createAndShareTextFile, printToFile } = usePrintAndShare();
  const animatedScaleIcon = useRef(new Animated.Value(1)).current;
  const HTML_DATA = createMultipleStrongsHtmlTemplate(
    values,
    theme.colors,
    fontSize,
    data.strongNumbers,
    cognate,
    activeTab
  );
  const { currentBibleVersion } = useBibleContext();
  const haptics = useHaptics();
  const isInterlineal = [EBibleVersions.INTERLINEAR].includes(
    currentBibleVersion as EBibleVersions
  );

  useEffect(() => {
    const loopAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedScaleIcon, {
          toValue: 0,
          duration: 300,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(animatedScaleIcon, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false,
        }),
      ]),
      { iterations: 2 }
    );

    loopAnimation.start();
  }, [animatedScaleIcon]);

  const _animatedScaleIcon = animatedScaleIcon.interpolate({
    inputRange: [0, 1],
    outputRange: [0.91, 1],
  });

  const animatedStyle = {
    transform: [{ scale: _animatedScaleIcon }],
  };

  useEffect(() => {
    const cognateStrongNumber = cognate + currentStrongNumber;
    setStrongCode(cognateStrongNumber);
  }, [currentStrongNumber, cognate]);

  useEffect(() => {
    const fetchDictionaryData = async () => {
      if (!isMyBibleDbLoaded || !strongCode || !mainBibleService.isLoaded)
        return;

      try {
        const dictionaryData = isInterlineal
          ? await mainBibleService.executeSql(
              SEARCH_STRONG_WORD,
              strongCode.split(",")
            )
          : await executeSql(SEARCH_STRONG_WORD, strongCode.split(","));

        if (dictionaryData?.length) {
          setValues(dictionaryData as DictionaryData[]);
        }
      } catch (error) {
        console.error("Failed to fetch dictionary data:", error);
      }
    };

    fetchDictionaryData();
  }, [isMyBibleDbLoaded, strongCode, mainBibleService]);

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

    if (url.startsWith("s:")) {
      const strongKeyToSearch = url.replace("s:", "");
      if (strongKeyToSearch === strongCode) {
        // handleGoForward();
      }
      const word = url.replace("s:", "");
      setBackUrl((prev: any) => [...prev, strongCode]);
      setStrongCode(word);
    }
    return false;
  };

  const onGoBack = () => {
    const urls = backUrl;
    const url = urls.pop() ?? cognateStrongNumber;
    setBackUrl(urls);
    setStrongCode(url);
  };

  const onStrongSearchEntire = useCallback(() => {
    haptics.impact.light();
    const [value1] = values;
    navigation.navigate(Screens.StrongSearchEntire, {
      paramCode: value1?.topic,
    });
  }, [values]);

  const onShare = useCallback(async () => {
    haptics.impact.light();
    const html = htmlTemplate(values, theme.colors, fontSize, true);
    setSharing(true);
    await printToFile(html, data.word?.toUpperCase() || "--");
    setSharing(false);
  }, [values, data.word]);

  const currentCode = values[0]?.topic;
  const isH = currentCode?.includes("H");
  const title = extractWord(values[0]?.definition, isH);

  const headerActions: HeaderAction[] = useMemo(
    () => [
      {
        iconName: "BookA",
        viewStyle: animatedStyle,
        description: "Diccionario",
        onAction: () => modalState$.openDictionaryBottomSheet(data.word),
      },
      {
        iconName: "FileSearch2",
        viewStyle: animatedStyle,
        description: "Profundizar",
        onAction: onStrongSearchEntire,
      },
      {
        iconName: sharing ? "Loader" : "Share2",
        viewStyle: animatedStyle,
        description: "Compartir",
        onAction: onShare,
      },
    ],
    [onStrongSearchEntire, onShare, data.word]
  );

  const RenderItem = ({ item }: { item: HeaderAction }) => {
    return (
      <Animated.View style={[item.viewStyle, styles.actionItem]}>
        <Pressable
          android_ripple={{
            color: theme.colors.background,
            foreground: true,
            radius: 10,
          }}
          onPress={() => {
            haptics.impact.light();
            item.onAction();
          }}
        >
          <Icon
            name={item.iconName}
            size={iconSize}
            color={theme.colors.notification}
          />
        </Pressable>
        <Text style={styles.actionItemText}>{item.description}</Text>
      </Animated.View>
    );
  };

  if (!data.word || !data.strongNumbers || data.strongNumbers.length === 0) {
    return (
      <View style={styles.versionContainer}>
        <Text style={styles.title}>No hay datos disponibles</Text>
        <Text style={styles.subtitle}>Intenta seleccionar otra palabra</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.versionContainer,
        { height: height + EXTRA_HEIGHT_TO_ADJUST },
      ]}
    >
      <View style={[styles.header]}>
        <View style={styles.actionContainer}>
          {backUrl.length !== 0 && (
            <Pressable
              android_ripple={{
                color: theme.colors.background,
                foreground: true,
                radius: 10,
              }}
              style={{ alignItems: "center" }}
              onPress={onGoBack}
            >
              <Icon
                strokeWidth={3}
                name="ArrowLeft"
                size={26}
                color={theme.colors.text}
              />
              <Text style={{ fontSize: 12, color: theme.colors.text }}>
                Anterior
              </Text>
            </Pressable>
          )}
          {headerActions.map((item, index) => (
            <RenderItem key={index} item={item} />
          ))}
        </View>
        <View style={styles.subHeader}>
          <Text style={[styles.subTitle, { fontSize }]}>
            {data.word.replace(/[.,;]/g, "") || "-"} - Múltiples definiciones
          </Text>
        </View>
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

            try {
              const message = JSON.parse(event.nativeEvent.data);
              if (message.type === "switchTab") {
                haptics.impact.light();
                setActiveTab(message.data.index);
                return;
              }
            } catch (error) {
              // Not JSON, treat as text
            }

            const text = `${event.nativeEvent.data}`;
            createAndShareTextFile(text, title || "-");
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
      flexDirection: "column",
      justifyContent: "center",
      width: "90%",
      backgroundColor: "transparent",
    },
    subHeader: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      width: "90%",
      paddingVertical: 5,
      backgroundColor: "transparent",
    },
    title: {
      justifyContent: "space-between",
      textTransform: "capitalize",
      color: "white",
      fontSize: 20,
      textAlign: "center",
      padding: 5,
    },
    subTitle: {
      justifyContent: "space-between",
      textTransform: "capitalize",
      fontSize: 20,
      textAlign: "center",
      paddingVertical: 5,
      textDecorationLine: "underline",
      color: colors.text,
      fontWeight: "bold",
    },
    backIcon: {
      fontWeight: "bold",
    },
    card: {
      width: "90%",
      backgroundColor: "white",
      borderRadius: 8,
      padding: 5,
      marginVertical: 8,
    },
    versionText: {
      color: "#000",
      fontSize: 22,
      textAlign: "center",
    },
    actionContainer: {
      flexDirection: "row",
      backgroundColor: "transparent",
      alignItems: "center",
      justifyContent: "space-between",
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
    subtitle: {
      fontSize: 16,
      color: colors.notification,
      textAlign: "center",
    },
  });

export default MultipleStrongsContent;
