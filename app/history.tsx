import { singleScreenHeader, SingleScreenHeaderProps } from "@/components/common/singleScreenHeader";
import Icon from "@/components/Icon";
import ScreenWithAnimation from "@/components/ScreenWithAnimation";
import { Text, View } from "@/components/Themed";
import { useBibleContext } from "@/context/BibleContext";
import { useMyTheme } from "@/context/ThemeContext";
import { bibleState$ } from "@/state/bibleState";
import { Screens, TTheme } from "@/types";
import { Stack, useRouter, useNavigation } from "expo-router";
import React, { Fragment, useCallback, useMemo, useRef, useEffect } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
} from "react-native";
import { useAlert } from "@/context/AlertContext";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { historyListHtmlTemplate } from "@/constants/historyListTemplate";
import { createOptimizedWebViewProps } from "@/utils/webViewOptimizations";
import { storedData$ } from "@/context/LocalstoreContext";
import { use$ } from "@legendapp/state/react";

const HistoryScreen = () => {
  const { confirm } = useAlert();
  const { theme } = useMyTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const { historyManager } = useBibleContext();
  const { clear, history, isHistoryInitialized, deleteOne, loadHistory } =
    historyManager;
  const router = useRouter();
  const navigation = useNavigation();
  const webViewRef = useRef<WebView>(null);
  const fontSize = use$(() => storedData$.fontSize.get()) || 16;

  useEffect(() => {
    loadHistory();
  }, []);

  const clearHistory = useCallback(async () => {
    confirm(
      "Borrar Historial",
      "¿Estás seguro de que quieres borrar todo el historial?",
      async () => {
        try {
          await clear();
        } catch (error) {
          console.error("Error clearing history:", error);
        }
      }
    );
  }, [confirm, clear]);

  const handleGoToVerse = useCallback(
    (book: string, chapter: number, verse: number) => {
      bibleState$.changeBibleQuery({
        book,
        chapter,
        verse,
        shouldFetch: true,
        isHistory: true,
      });
      router.push({
        pathname: `/${Screens.Home}`,
        params: { book, chapter, verse },
      });
    },
    [router]
  );

  const handleWebViewMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const message = JSON.parse(event.nativeEvent.data);
        const { type, data } = message;

        switch (type) {
          case "goToVerse":
            handleGoToVerse(data.book, data.chapter, data.verse);
            break;
          case "deleteItem":
            deleteOne(data.id);
            break;
        }
      } catch (error) {
        console.error("Error handling WebView message:", error);
      }
    },
    [handleGoToVerse, deleteOne]
  );

  const htmlContent = useMemo(() => {
    return historyListHtmlTemplate({
      history,
      theme,
      fontSize,
    });
  }, [history, theme, fontSize]);

  const HeaderRightComponent = useCallback(
    () => (
      <TouchableOpacity
        onPress={clearHistory}
        disabled={!history.length}
        style={{
          padding: 8,
          opacity: !history.length ? 0.2 : 1,
        }}
        accessibilityLabel="Borrar historial"
      >
        <Icon name="Trash2" size={24} color="#ef4444" />
      </TouchableOpacity>
    ),
    [clearHistory, history.length]
  );

  const screenOptions: SingleScreenHeaderProps = useMemo(() => {
    return {
      theme,
      title: "Historial",
      titleIcon: "History",
      titleIconColor: theme.dark ? "#60a5fa" : theme.colors.notification,
      goBack: () => {
        navigation.navigate(Screens.Dashboard as any);
      },
      headerRightProps: {
        headerRightIconColor: "#ef4444",
        RightComponent: HeaderRightComponent,
      },
    };
  }, [theme, navigation, HeaderRightComponent]);

  // Handle back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        navigation.navigate(Screens.Dashboard as any);
        return true;
      }
    );

    return () => backHandler.remove();
  }, [navigation]);

  if (!isHistoryInitialized) {
    return (
      <ScreenWithAnimation
        duration={800}
        speed={1}
        title="Historial"
        icon="History"
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Cargando historial...</Text>
        </View>
      </ScreenWithAnimation>
    );
  }

  return (
    <Fragment>
      <Stack.Screen options={singleScreenHeader(screenOptions)} />
      <ScreenWithAnimation
        duration={800}
        speed={1}
        title="Historial"
        icon="History"
      >
        <View style={styles.container} key={`history-container-${theme.dark}`}>
          <WebView
            ref={webViewRef}
            originWhitelist={["*"]}
            source={{ html: htmlContent }}
            style={styles.webview}
            onMessage={handleWebViewMessage}
            scrollEnabled={true}
            bounces={false}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            keyboardDisplayRequiresUserAction={false}
            renderLoading={() => (
              <View
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
              />
            )}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error("WebView error:", nativeEvent);
            }}
            {...createOptimizedWebViewProps({}, "static")}
          />
        </View>
      </ScreenWithAnimation>
    </Fragment>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: colors.text,
    },
    webview: {
      flex: 1,
      backgroundColor: colors.background,
    },
  });

export default HistoryScreen;
