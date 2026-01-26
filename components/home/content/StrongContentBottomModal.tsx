import Icon, { IconProps } from "@/components/Icon";
import { DB_BOOK_NAMES } from "@/constants/BookNames";
import { isPrimaryBibleDatabase } from "@/constants/databaseNames";
import { htmlTemplate } from "@/constants/HtmlTemplate";
import { SEARCH_STRONG_WORD } from "@/constants/queries";
import { iconSize } from "@/constants/size";
import { useBibleContext } from "@/context/BibleContext";
import { useDBContext } from "@/context/databaseContext";
import { useHaptics } from "@/hooks/useHaptics";
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
import { createOptimizedWebViewProps } from "@/utils/webViewOptimizations";
import BottomSheet from "@gorhom/bottom-sheet";
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
  Pressable,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import WebView from "react-native-webview";
import { ShouldStartLoadRequest } from "react-native-webview/lib/WebViewTypes";
import { Text, View } from "../../Themed";

type HeaderAction = {
  iconName: IconProps["name"];
  viewStyle: {};
  description: string;
  onAction: () => void;
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

interface IStrongContent {
  theme: TTheme;
  fontSize: any;
  navigation: any;
}

const StrongContentBottomModal: FC<IStrongContent> = ({
  theme,
  fontSize,
  navigation,
}) => {
  const data = use$<IStrongWord>(() => bibleState$.strongWord.get());
  const { code, text: word } = data;
  const { executeSql, isMyBibleDbLoaded, mainBibleService } = useDBContext();
  const [values, setValues] = useState<DictionaryData[]>([
    { definition: "", topic: "" },
  ]);
  const styles = getStyles(theme);
  const webViewRef = React.useRef<WebView>(null);
  const [strongCode, setStrongCode] = useState(code);
  const [sharing, setSharing] = useState(false);
  const [backUrl, setBackUrl] = useState<any>([]);
  const { createAndShareTextFile, printToFile } = usePrintAndShare();
  const animatedScaleIcon = useRef(new Animated.Value(1)).current;
  const HTML_DATA = htmlTemplate(values, theme.colors, fontSize);
  const { currentBibleVersion } = useBibleContext();
  const haptics = useHaptics();
  const isInterlineal = [EBibleVersions.INTERLINEAR, EBibleVersions.GREEK].includes(
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
    setStrongCode(data.code);
  }, [data]);

  // Present modal when component mounts
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     modalState$.strongSearchRef.current?.present();
  //   }, 0);
  //   return () => clearTimeout(timer);
  // }, []);

  useEffect(() => {
    const fetchDictionaryData = async () => {
      const isPrimaryBible =
        isPrimaryBibleDatabase(currentBibleVersion) || isInterlineal;
      const matchDatabase =
        mainBibleService.database?.databasePath.split("/").pop() ===
        currentBibleVersion + ".db" || isInterlineal;

      if (
        !isMyBibleDbLoaded ||
        !strongCode ||
        !mainBibleService.isLoaded ||
        !isPrimaryBible ||
        !matchDatabase
      ) {
        return;
      }

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
    const url = urls.pop() ?? code;
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
    await printToFile(html, word?.toUpperCase() || "--");
    setSharing(false);
  }, [values, word]);

  const currentCode = values[0]?.topic;
  const isH = currentCode?.includes("H");
  const title = extractWord(values[0]?.definition, isH);

  const headerActions: HeaderAction[] = useMemo(
    () => [
      {
        iconName: "BookA",
        viewStyle: animatedStyle,
        description: "Diccionario",
        onAction: () => modalState$.openDictionaryBottomSheet(data.text),
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
    [onStrongSearchEntire, onShare, data]
  );

  const RenderItem = ({ item }: { item: HeaderAction }) => {
    return (
      <Animated.View style={[item.viewStyle, styles.actionItem]}>
        <TouchableOpacity
          onPress={() => {
            haptics.impact.light();
            item.onAction();
          }}
          style={{
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon
            name={item.iconName}
            size={iconSize}
            color={theme.colors.notification}
          />
          <Text style={styles.actionItemText}>{item.description}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <BottomSheet
      ref={modalState$.strongSearchRef.get()}
      index={-1}
      snapPoints={["55%"]}
      backgroundStyle={{
        ...styles.bottomSheet,
        backgroundColor: theme.colors.background,
      }}
      enablePanDownToClose
      handleIndicatorStyle={{ backgroundColor: theme.colors.notification }}
      enableDynamicSizing={false}
      onClose={() => {
        modalState$.isStrongSearchOpen.set(false);
      }}
    >
      {/* // <BottomModal
    //   style={styles.bottomSheet}
    //   backgroundColor={theme.dark ? theme.colors.background : "#eee"}
    //   shouldScroll={false}
    //   ref={modalState$.strongSearchRef.get()}
    //   justOneSnap
    //   showIndicator
    //   justOneValue={["60%"]}
    //   startAT={0}
    //   onDismiss={() => modalState$.isStrongSearchOpen.set(false)}
    // > */}
      <View style={[styles.webviewWrapper]} onLayout={() => {
        modalState$.multipleStrongsRef.current?.close();
        modalState$.strongSearchRef.current?.snapToIndex(0);
      }}>
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
                size={iconSize}
                color={theme.colors.notification}
              />
              <Text style={styles.actionItemText}>Anterior</Text>
            </Pressable>
          )}
          {headerActions.map((item, index) => (
            <RenderItem key={index} item={item} />
          ))}
        </View>
        <WebView
          style={{ backgroundColor: "transparent" }}
          ref={webViewRef}
          originWhitelist={["*"]}
          source={{ html: HTML_DATA }}
          onMessage={(event) => {
            const text = `${event.nativeEvent.data}`;
            createAndShareTextFile(text, title || "-");
          }}
          onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
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
          {...createOptimizedWebViewProps({}, "themeSelector")}
        />
      </View>
    </BottomSheet>

  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    bottomSheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
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
      paddingBottom: 10,
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
  });

export default StrongContentBottomModal;
