import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { DB_BOOK_NAMES } from "constants/BookNames";
import { htmlTemplate } from "constants/HtmlTemplate";
import { SEARCH_STRONG_WORD } from "constants/Queries";
import { iconSize } from "constants/size";
import { useDBContext } from "context/databaseContext";
import usePrintAndShare from "hooks/usePrintAndShare";
import React, {
  FC,
  RefObject,
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
  StyleSheet,
} from "react-native";
import WebView from "react-native-webview";
import { ShouldStartLoadRequest } from "react-native-webview/lib/WebViewTypes";
import { DictionaryData, IStrongWord, Screens, TTheme } from "types";
import { Text, View } from "../../Themed";

type MaterialCommunityIconName = keyof typeof MaterialCommunityIcons.glyphMap;

type HeaderAction = {
  iconName: MaterialCommunityIconName;
  viewStyle: {};
  description: string;
  onAction: () => void;
};

const DEFAULT_HEIGHT = 14000;
const EXTRA_HEIGHT_TO_ADJUST = 150;

function extractWord(text: string, isH: boolean) {
  const regex = isH ? /<p\/><b>(.*?)<\/b>/ : /<p\/>(.*?)<\/b>/;
  const match = text?.match(regex);

  if (match && match[1]) {
    return match[1];
  } else {
    return null;
  }
}

interface IStrongContent {
  theme: TTheme;
  data: IStrongWord;
  fontSize: any;
  navigation: any;
  bottomRef: RefObject<BottomSheetModalMethods>;
  onDictionary: () => void;
}

const StrongContent: FC<IStrongContent> = ({
  theme,
  data,
  fontSize,
  navigation,
  bottomRef,
}) => {
  const { code, text: word } = data;
  const { myBibleDB, executeSql } = useDBContext();
  const [values, setValues] = useState<DictionaryData[]>([
    { definition: "", topic: "" },
  ]);
  const styles = getStyles(theme);
  const [height, setHeight] = useState(DEFAULT_HEIGHT);
  const webViewRef = React.useRef<WebView>(null);
  const [text, setText] = useState(code);
  const [sharing, setSharing] = useState(false);
  const [backUrl, setBackUrl] = useState<any>([]);
  const { createAndShareTextFile, printToFile } = usePrintAndShare();

  const animatedScaleIcon = useRef(new Animated.Value(1)).current;
  const HTML_DATA = htmlTemplate(values, theme.colors, fontSize);

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
    setText(data.code);
  }, [data]);

  useEffect(() => {
    (async () => {
      if (myBibleDB && executeSql) {
        const DictionaryData = await executeSql(
          myBibleDB,
          SEARCH_STRONG_WORD,
          text.split(",")
        );
        setValues(DictionaryData as DictionaryData[]);
      }
    })();
  }, [code, text]);

  const onClose = () => {
    bottomRef.current?.dismiss();
  };

  const onShouldStartLoadWithRequest = (event: ShouldStartLoadRequest) => {
    const { url } = event;
    if (url.startsWith("b:")) {
      const [, bookNumber, chapter, verse] =
        url.match(/b:(\d+) (\d+):(\d+)/) || [];
      const currentBook = DB_BOOK_NAMES.find(
        (x) => x.bookNumber === +bookNumber
      );

      onClose();
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

  const onStrongSearchEntire = useCallback(() => {
    const [value1] = values;
    onClose();
    navigation.navigate(Screens.StrongSearchEntire, {
      paramCode: value1?.topic,
    });
  }, [values]);

  const onShare = useCallback(async () => {
    const html = htmlTemplate(values, theme.colors, fontSize, true);
    setSharing(true);
    await printToFile(html);
    setSharing(false);
  }, [values]);

  const currentCode = values[0]?.topic;
  const isH = currentCode?.includes("H");
  const title = extractWord(values[0]?.definition, isH);

  const headerActions: HeaderAction[] = useMemo(
    () => [
      {
        iconName: "bookshelf",
        viewStyle: animatedStyle,
        description: "Diccionario",
        onAction: () => {
          onClose();
          navigation.navigate(Screens.DictionarySearch, {
            word: data.text,
          });
        },
      },
      {
        iconName: "text-search",
        viewStyle: animatedStyle,
        description: "Buscar Versículos",
        onAction: onStrongSearchEntire,
      },
      {
        iconName: sharing ? "loading" : "share-variant-outline",
        viewStyle: animatedStyle,
        description: "Compartir",
        onAction: onShare,
      },
    ],
    [onStrongSearchEntire, onShare]
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
          onPress={item.onAction}
        >
          <MaterialCommunityIcons
            style={[styles.backIcon, {}]}
            name={item.iconName}
            size={iconSize}
            color="white"
          />
        </Pressable>
        <Text style={styles.actionItemText}>{item.description}</Text>
      </Animated.View>
    );
  };

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
              <MaterialCommunityIcons
                style={styles.backIcon}
                name="keyboard-backspace"
                size={26}
                color="white"
              />
              <Text style={{ fontSize: 12, color: "white" }}>Anterior</Text>
            </Pressable>
          )}
          {headerActions.map((item, index) => (
            <RenderItem key={index} item={item} />
          ))}
        </View>
        <View style={styles.subHeader}>
          <Text style={[styles.subTitle, { fontSize }]}>
            {word.replace(",", "") || "-"} - {title || "-"} {currentCode}
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
      // ...customBorder,
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
    actionContainer: {
      flexDirection: "row",
      backgroundColor: "transparent",
      alignItems: "center",
      justifyContent: "space-between",
      // ...customBorder,
    },
    actionItem: {
      alignItems: "center",
      marginHorizontal: 2,
      paddingVertical: 2,
      paddingHorizontal: 4,
    },
    actionItemText: {
      fontSize: 12,
      color: "white",
      textAlign: "center",
    },
  });

export default StrongContent;
