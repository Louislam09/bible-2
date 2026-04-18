import ChapterQuizBottomSheet from "@/components/ChapterQuizBottomSheet";
import { singleScreenHeader, SingleScreenHeaderProps } from "@/components/common/singleScreenHeader";
import { View as ThemedView } from "@/components/Themed";
import {
  chapterQuizHistoryHtmlTemplate,
  type ChapterQuizHistoryFilter,
} from "@/constants/chapterQuizHistoryTemplate";
import { useAlert } from "@/context/AlertContext";
import { useMyTheme } from "@/context/ThemeContext";
import { pb } from "@/globalConfig";
import { useChapterQuizAI } from "@/hooks/useChapterQuizAI";
import { submitChapterQuizDownvote } from "@/services/chapterQuizDownvoteService";
import {
  chapterQuizLocalDbService,
  type ChapterQuizAttemptRow,
} from "@/services/chapterQuizLocalDbService";
import { chapterQuizStateHelpers } from "@/state/chapterQuizState";
import { modalState$ } from "@/state/modalState";
import { createOptimizedWebViewProps } from "@/utils/webViewOptimizations";
import { showToast } from "@/utils/showToast";
import { shuffleArray } from "@/utils/shuffleOptions";
import { use$ } from "@legendapp/state/react";
import { useFocusEffect } from "@react-navigation/native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import WebView from "react-native-webview";

const ChapterQuizHistoryScreen = () => {
  const { theme } = useMyTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ attemptId?: string | string[] }>();
  const { alertWarning } = useAlert();
  const { regenerateChapterQuestionsLocalOnly } = useChapterQuizAI();

  const [attempts, setAttempts] = useState<Awaited<
    ReturnType<typeof chapterQuizLocalDbService.getAllAttempts>
  >>([]);
  const [filter, setFilter] = useState<ChapterQuizHistoryFilter>("all");
  const [view, setView] = useState<"list" | "review">("list");
  const [reviewAttempt, setReviewAttempt] = useState<ChapterQuizAttemptRow | null>(null);

  const isChapterQuizOpen = use$(() => modalState$.isChapterQuizOpen.get());
  const wasQuizOpenRef = useRef(false);

  const reloadAttempts = useCallback(async () => {
    const rows = await chapterQuizLocalDbService.getAllAttempts();
    setAttempts(rows);
  }, []);

  useEffect(() => {
    if (wasQuizOpenRef.current && !isChapterQuizOpen) {
      void reloadAttempts();
    }
    wasQuizOpenRef.current = isChapterQuizOpen;
  }, [isChapterQuizOpen, reloadAttempts]);

  useFocusEffect(
    useCallback(() => {
      void reloadAttempts();
    }, [reloadAttempts]),
  );

  useEffect(() => {
    const raw = params.attemptId;
    const id = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined;
    if (!id) return;
    let cancelled = false;
    void chapterQuizLocalDbService.getAttemptById(id).then((row) => {
      if (cancelled || !row) return;
      setReviewAttempt(row);
      setView("review");
    });
    return () => {
      cancelled = true;
    };
  }, [params.attemptId]);

  const htmlContent = useMemo(
    () =>
      chapterQuizHistoryHtmlTemplate({
        theme,
        view,
        filter,
        attempts,
        reviewAttempt: view === "review" ? reviewAttempt : null,
      }),
    [theme, view, filter, attempts, reviewAttempt],
  );

  const handleWebViewMessage = useCallback(
    async (event: { nativeEvent: { data: string } }) => {
      try {
        const message = JSON.parse(event.nativeEvent.data) as {
          type: string;
          data?: Record<string, unknown>;
        };
        const { type, data } = message;

        switch (type) {
          case "filterChange": {
            const f = data?.filter as ChapterQuizHistoryFilter | undefined;
            if (f === "all" || f === "passed" || f === "failed" || f === "favorites") {
              setFilter(f);
            }
            break;
          }
          case "openReview": {
            const id = data?.attemptId as string | undefined;
            if (id) {
              const row = await chapterQuizLocalDbService.getAttemptById(id);
              if (row) {
                setReviewAttempt(row);
                setView("review");
              }
            }
            break;
          }
          case "goBackToList": {
            setView("list");
            setReviewAttempt(null);
            break;
          }
          case "toggleFavorite": {
            const id = data?.attemptId as string | undefined;
            if (!id) break;
            const row = await chapterQuizLocalDbService.getAttemptById(id);
            if (row) {
              await chapterQuizLocalDbService.setAttemptFavorite(id, !row.isFavorite);
              await reloadAttempts();
              showToast(row.isFavorite ? "Quitado de favoritos" : "Guardado en favoritos");
            }
            break;
          }
          case "regenerateLocal": {
            const book = data?.book as string | undefined;
            const chapter = data?.chapter as number | undefined;
            if (!book || chapter == null) break;
            try {
              await regenerateChapterQuestionsLocalOnly({
                book,
                chapter,
                requestedCount: 10,
                versesText: "",
              });
              showToast("Nuevo quiz guardado solo en este dispositivo");
            } catch {
              alertWarning("Error", "No se pudo regenerar el quiz.");
            }
            break;
          }
          case "downvote": {
            if (!pb.authStore.isValid) {
              alertWarning(
                "Inicia sesión",
                "Necesitas una cuenta para votar cuando un quiz no es bueno.",
              );
              break;
            }
            const chapterKey = data?.chapterKey as string | undefined;
            if (!chapterKey) break;
            const result = await submitChapterQuizDownvote(chapterKey);
            if (!result.ok) {
              showToast(result.message);
              break;
            }
            if (result.reachedThreshold) {
              showToast("Este quiz se sustituirá por uno nuevo cuando alguien lo genere de nuevo.");
            } else {
              showToast("Gracias por tu opinión");
            }
            break;
          }
          case "retryFailed": {
            const id = data?.attemptId as string | undefined;
            if (!id) break;
            const attempt = await chapterQuizLocalDbService.getAttemptById(id);
            if (!attempt) break;
            const byIndex = new Map(attempt.answers.map((x) => [x.questionIndex, x.selected]));
            const failed = attempt.questions.filter((q, idx) => {
              const sel = byIndex.get(idx) ?? null;
              return sel !== q.correct;
            });
            if (failed.length === 0) {
              showToast("No hubo preguntas falladas en este intento");
              break;
            }
            chapterQuizStateHelpers.setActiveQuiz({
              chapterKey: attempt.chapterKey,
              book: attempt.book,
              chapter: attempt.chapter,
              requestedCount: failed.length,
              questions: shuffleArray(failed),
            });
            modalState$.openChapterQuizBottomSheet();
            break;
          }
          default:
            break;
        }
      } catch (e) {
        console.error("[chapterQuizHistory] message", e);
      }
    },
    [alertWarning, regenerateChapterQuestionsLocalOnly, reloadAttempts],
  );

  const screenOptions: SingleScreenHeaderProps = useMemo(
    () => ({
      theme,
      title: "Mis Quiz",
      titleIcon: "ListChecks",
      titleIconColor: theme.colors.notification,
      goBack: () => {
        router.push("/(dashboard)");
      },
      headerRightProps: {
        headerRightIconColor: theme.colors.notification,
      },
    }),
    [router, theme],
  );

  return (
    <Fragment>
      <Stack.Screen options={singleScreenHeader(screenOptions)} />
      <ThemedView style={styles.container}>
        <WebView
          key={`${view}-${reviewAttempt?.id ?? ""}-${filter}-${attempts.length}`}
          originWhitelist={["*"]}
          source={{ html: htmlContent }}
          style={styles.webView}
          onMessage={handleWebViewMessage}
          scrollEnabled
          bounces={false}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
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
            console.error("WebView error:", syntheticEvent.nativeEvent);
          }}
          {...createOptimizedWebViewProps({}, "static")}
        />
      </ThemedView>
      {isChapterQuizOpen ? <ChapterQuizBottomSheet /> : null}
    </Fragment>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webView: {
    flex: 1,
    backgroundColor: "transparent",
  },
});

export default ChapterQuizHistoryScreen;
