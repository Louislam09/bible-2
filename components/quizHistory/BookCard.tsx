import React, { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Text } from "@/components/Themed";
import type { BookSummary } from "@/hooks/useQuizProgress";
import { formatRelativeDate } from "@/utils/quizHistory";
import {
  RADIUS,
  SP,
  type QuizSurfaces,
} from "./quizHistoryTokens";

type Props = {
  summary: BookSummary;
  surfaces: QuizSurfaces;
  onPress: (book: string) => void;
};

const BAR_HEIGHT = 3;

export const BookCard: React.FC<Props> = ({ summary, surfaces, onPress }) => {
  const pressed = useSharedValue(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(summary.percent, {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });
  }, [summary.percent, progress]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.02 }],
    opacity: 1 - pressed.value * 0.05,
  }));

  const barStyle = useAnimatedStyle(() => ({
    width: `${Math.min(100, Math.max(0, progress.value))}%`,
  }));

  const muted = !summary.hasAnyAttempt;
  const subtitleParts: string[] = [];
  subtitleParts.push(
    summary.totalChapters > 0
      ? `${summary.totalChapters} capítulos`
      : "—",
  );
  if (summary.lastCompletedAt) {
    subtitleParts.push(formatRelativeDate(summary.lastCompletedAt));
  }

  return (
    <Pressable
      onPress={() => onPress(summary.book)}
      onPressIn={() => {
        pressed.value = withTiming(1, { duration: 90 });
      }}
      onPressOut={() => {
        pressed.value = withTiming(0, { duration: 140 });
      }}
    >
      <Animated.View
        style={[
          styles.card,
          cardStyle,
          {
            backgroundColor: surfaces.card,
            borderColor: surfaces.border,
            borderRadius: RADIUS.card,
            opacity: muted ? 0.55 : 1,
          },
        ]}
      >
        <View style={styles.row}>
          <Text
            style={[styles.title, { color: surfaces.text }]}
            numberOfLines={1}
          >
            {summary.book}
          </Text>
          {summary.hasAnyAttempt ? (
            <Text style={[styles.percent, { color: surfaces.accent }]}>
              {summary.percent}%
            </Text>
          ) : (
            <Text style={[styles.percentMuted, { color: surfaces.softText }]}>
              —
            </Text>
          )}
        </View>

        <View style={styles.subtitleRow}>
          <Text
            style={[styles.subtitle, { color: surfaces.muted }]}
            numberOfLines={1}
          >
            {subtitleParts.join(" · ")}
          </Text>
        </View>

        {summary.hasAnyAttempt ? (
          <View
            style={[
              styles.barTrack,
              {
                backgroundColor: surfaces.border,
                borderRadius: BAR_HEIGHT,
              },
            ]}
          >
            <Animated.View
              style={[
                styles.barFill,
                barStyle,
                {
                  backgroundColor: surfaces.accent,
                  borderRadius: BAR_HEIGHT,
                },
              ]}
            />
          </View>
        ) : null}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    paddingVertical: SP.md + 2,
    paddingHorizontal: SP.lg,
    marginBottom: SP.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SP.md,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  percent: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  percentMuted: {
    fontSize: 14,
    fontWeight: "600",
  },
  subtitleRow: {
    marginTop: 4,
    marginBottom: SP.md - 2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "500",
  },
  barTrack: {
    height: BAR_HEIGHT,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
  },
});
