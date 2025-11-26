import React, { useCallback, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { useMyTheme } from "@/context/ThemeContext";
import { useTutorial } from "@/context/TutorialContext";
import {
  TUTORIAL_FEATURES,
} from "@/constants/tutorialData";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import WebView from "react-native-webview";
import { tutorialsHtmlTemplate } from "@/constants/tutorialsTemplate";
import { createOptimizedWebViewProps } from "@/utils/webViewOptimizations";
import { use$ } from "@legendapp/state/react";
import { storedData$ } from "@/context/LocalstoreContext";

export default function TutorialsScreen() {
  const { theme } = useMyTheme();
  const router = useRouter();
  const styles = getStyles();
  const inset = useSafeAreaInsets();
  const topInset = inset.top;
  const webViewRef = useRef<WebView>(null);
  const {
    startTutorial,
    completedTutorials,
    resetTutorialProgress,
  } = useTutorial();

  const fontSize = use$(() => storedData$.fontSize.get());
  const selectedFont = use$(() => storedData$.selectedFont.get());

  // Update WebView when completed tutorials change
  useEffect(() => {
    if (webViewRef.current) {
      const message = {
        type: "updateProgress",
        data: { completedTutorials },
      };
      webViewRef.current.postMessage(JSON.stringify(message));
    }
  }, [completedTutorials]);

  const handleTutorialPress = (tutorialId: string) => {
    const tutorial = TUTORIAL_FEATURES.find(t => t.id === tutorialId);
    if (!tutorial) return;

    startTutorial(tutorial);

    // Navigate to the appropriate screen for each tutorial
    switch (tutorial.id) {
      case "home-screen-tour":
      case "basic-reading":
      case "split-screen":
      case "verse-selection":
        router.push("/home");
        break;

      case "search-feature":
        router.push("/(search)");
        break;

      case "notes-feature":
        router.push("/notes");
        break;

      case "favorites":
        router.push("/favorite");
        break;

      case "strong-numbers":
        router.push("/home");
        break;

      case "audio-reading":
        router.push("/home");
        break;

      case "hymnal":
        router.push("/song");
        break;

      case "games-quiz":
        router.push("/(game)");
        break;

      case "memory-verses":
        router.push("/memorization/memoryList");
        break;

      case "themes-fonts":
      case "bible-versions":
      case "cloud-sync":
      case "notifications":
        router.push("/settings");
        break;

      default:
        // If no specific screen, stay on current screen
        // The tutorial will show if TutorialWalkthrough is present
        break;
    }
  };

  const handleMessage = useCallback((event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      const { data, type } = message;

      switch (type) {
        case "tutorialSelected":
          handleTutorialPress(data.tutorialId);
          break;
        case "resetProgress":
          resetTutorialProgress();
          break;
        default:
          break;
      }
    } catch (error) {
      console.warn("Error parsing WebView message:", error);
    }
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: topInset }]}>
      <Stack.Screen
        options={{
          title: "Tutoriales",
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.text,
          headerShadowVisible: false,
        }}
      />

      <WebView
        ref={webViewRef}
        key="tutorials-webview"
        originWhitelist={["*"]}
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
        }}
        source={{
          html: tutorialsHtmlTemplate({
            theme,
            completedTutorials,
            fontSize,
            selectedFont,
          }),
        }}
        onMessage={handleMessage}
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
        {...createOptimizedWebViewProps({}, "static")}
      />
    </SafeAreaView>
  );
}

const getStyles = () =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
  });

