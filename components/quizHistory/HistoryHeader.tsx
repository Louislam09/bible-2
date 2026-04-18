import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "@/components/Themed";
import type { ChapterQuizHistoryMetrics } from "@/utils/quizHistory";
import {
  RADIUS,
  SP,
  type QuizSurfaces,
} from "./quizHistoryTokens";

type Props = {
  metrics: ChapterQuizHistoryMetrics;
  surfaces: QuizSurfaces;
};

export const HistoryHeader: React.FC<Props> = ({ metrics, surfaces }) => {
  return (
    <View
      style={[
        styles.row,
        {
          borderColor: surfaces.border,
          borderRadius: RADIUS.card,
        },
      ]}
    >
      <Cell
        value={`${metrics.avgPercent}%`}
        label="Promedio"
        surfaces={surfaces}
        showDivider
      />
      <Cell
        value={`${metrics.streakDays}`}
        label="Racha"
        surfaces={surfaces}
        showDivider
      />
      <Cell
        value={`${metrics.chaptersCompleted}`}
        label="Capítulos"
        surfaces={surfaces}
      />
    </View>
  );
};

const Cell: React.FC<{
  value: string;
  label: string;
  surfaces: QuizSurfaces;
  showDivider?: boolean;
}> = ({ value, label, surfaces, showDivider }) => (
  <View
    style={[
      styles.cell,
      showDivider
        ? { borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: surfaces.border }
        : null,
    ]}
  >
    <Text style={[styles.value, { color: surfaces.text }]}>{value}</Text>
    <Text style={[styles.label, { color: surfaces.muted }]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  cell: {
    flex: 1,
    paddingVertical: SP.md,
    paddingHorizontal: SP.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.4,
    marginBottom: 2,
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
});
