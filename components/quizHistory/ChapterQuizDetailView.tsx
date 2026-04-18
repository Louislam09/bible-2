import Icon from "@/components/Icon";
import {
  FAIL_COLOR,
  RADIUS,
  SP,
  type QuizSurfaces,
} from "@/components/quizHistory/quizHistoryTokens";
import { Text } from "@/components/Themed";
import type {
  ChapterQuizAttemptRow,
  ChapterQuizSessionRow,
} from "@/services/chapterQuizLocalDbService";
import {
  CHAPTER_QUIZ_SIZE_OPTIONS,
  type ChapterQuizSizeOption,
  getChallengeStateForQuizSize,
  hasSessionForQuizSize,
} from "@/utils/quizChapterChallenges";
import { formatRelativeDate } from "@/utils/quizHistory";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View as RNView,
} from "react-native";
import Svg, { Circle } from "react-native-svg";

export type { ChapterQuizChallengeState, ChapterQuizSizeOption } from "@/utils/quizChapterChallenges";
export {
  CHAPTER_QUIZ_SIZE_OPTIONS,
  getChallengeStateForQuizSize,
  hasSessionForQuizSize,
};

type Props = {
  surfaces: QuizSurfaces;
  chapterKey: string;
  attempts: ChapterQuizAttemptRow[];
  sessions: ChapterQuizSessionRow[];
  loadingQuizSize: ChapterQuizSizeOption | null;
  onPressSize: (size: ChapterQuizSizeOption) => void;
  onPressAttempt: (row: ChapterQuizAttemptRow) => void;
  onReadChapter: () => void;
};

export const ChapterQuizDetailView: React.FC<Props> = ({
  surfaces,
  chapterKey,
  attempts,
  sessions,
  loadingQuizSize,
  onPressSize,
  onPressAttempt,
  onReadChapter,
}) => {
  const sortedAttempts = useMemo(
    () =>
      [...attempts].sort(
        (a, b) =>
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
      ),
    [attempts],
  );

  const tileW =
    (Dimensions.get("window").width - SP.lg * 2 - SP.md) / 2 - 1;

  return (
    <ScrollView
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.sectionLabel, { color: surfaces.muted }]}>
        RETOS
      </Text>
      <RNView style={styles.grid}>
        {CHAPTER_QUIZ_SIZE_OPTIONS.map((size) => {
          const state = getChallengeStateForQuizSize(
            attempts,
            size,
            hasSessionForQuizSize(sessions, chapterKey, size),
          );
          const loading = loadingQuizSize === size;
          const palette =
            state === "completed"
              ? {
                  bg: surfaces.accentSoft,
                  border: surfaces.accent,
                  label: "Completado",
                  labelColor: surfaces.accent,
                }
              : state === "in_progress"
                ? {
                    bg: surfaces.failSoft,
                    border: FAIL_COLOR + "55",
                    label: "En progreso",
                    labelColor: surfaces.fail,
                  }
                : {
                    bg: "transparent",
                    border: surfaces.borderStrong,
                    label: "Sin empezar",
                    labelColor: surfaces.muted,
                  };

          return (
            <TouchableOpacity
              key={size}
              activeOpacity={0.85}
              disabled={loading || loadingQuizSize !== null}
              onPress={() => onPressSize(size)}
              style={[
                styles.tile,
                {
                  width: tileW,
                  minHeight: 132,
                  borderColor: palette.border,
                  backgroundColor: palette.bg,
                  borderRadius: RADIUS.card,
                },
              ]}
            >
              {loading ? (
                <ActivityIndicator color={surfaces.accent} />
              ) : (
                <>
                  <Text style={[styles.tileNum, { color: surfaces.text }]}>
                    {size}
                  </Text>
                  <Text style={[styles.tileSub, { color: surfaces.muted }]}>
                    preguntas
                  </Text>
                  <Text
                    style={[
                      styles.tileState,
                      { color: palette.labelColor },
                    ]}
                  >
                    {palette.label}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </RNView>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onReadChapter}
        style={[
          styles.readRow,
          {
            borderColor: surfaces.border,
            borderRadius: RADIUS.button,
          },
        ]}
      >
        <Icon name="BookOpen" size={16} color={surfaces.muted} />
        <Text style={[styles.readLabel, { color: surfaces.text }]}>
          Leer capítulo en la Biblia
        </Text>
      </TouchableOpacity>

      <Text
        style={[
          styles.sectionLabel,
          { color: surfaces.muted, marginTop: SP.xl },
        ]}
      >
        INTENTOS
      </Text>
      {sortedAttempts.length === 0 ? (
        <Text style={[styles.emptyHint, { color: surfaces.muted }]}>
          Aún no hay intentos guardados para este capítulo.
        </Text>
      ) : (
        sortedAttempts.map((row) => {
          const ratio = row.total > 0 ? row.score / row.total : 0;
          return (
            <TouchableOpacity
              key={row.id}
              activeOpacity={0.85}
              onPress={() => onPressAttempt(row)}
              style={[
                styles.attemptCard,
                {
                  borderColor: surfaces.border,
                  backgroundColor: surfaces.card,
                  borderRadius: RADIUS.card,
                },
              ]}
            >
              <RNView style={styles.attemptRow}>
                <RNView style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    style={[styles.attemptMeta, { color: surfaces.muted }]}
                    numberOfLines={1}
                  >
                    {formatRelativeDate(row.completedAt)} · {row.questions.length}{" "}
                    preg.
                  </Text>
                  <Text
                    style={[styles.attemptTitle, { color: surfaces.text }]}
                    numberOfLines={1}
                  >
                    {row.score} de {row.total} correctas
                    {row.pass ? " · Aprobado" : ""}
                  </Text>
                </RNView>
                <MiniRing ratio={ratio} pass={row.pass} surfaces={surfaces} />
              </RNView>
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );
};

const MiniRing: React.FC<{
  ratio: number;
  pass: boolean;
  surfaces: QuizSurfaces;
}> = ({ ratio, pass, surfaces }) => {
  const size = 44;
  const stroke = 2.5;
  const r = (size - stroke) / 2 - 1;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * Math.max(0, Math.min(1, ratio));
  const color = pass ? surfaces.accent : surfaces.fail;

  return (
    <RNView style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={surfaces.border}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          rotation={-90}
          originX={cx}
          originY={cy}
        />
      </Svg>
      <Text
        style={{
          fontSize: 10,
          fontWeight: "700",
          color: surfaces.text,
          letterSpacing: -0.2,
        }}
      >
        {Math.round(ratio * 100)}%
      </Text>
    </RNView>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: SP.lg,
    paddingTop: SP.lg,
    paddingBottom: SP.xxl + SP.md,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.6,
    marginBottom: SP.sm,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SP.md,
    justifyContent: "space-between",
    marginBottom: SP.lg,
  },
  tile: {
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: SP.md + 2,
    paddingHorizontal: SP.md,
    alignItems: "center",
    justifyContent: "center",
  },
  tileNum: {
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: -1.2,
    lineHeight: 40,
  },
  tileSub: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },
  tileState: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: SP.sm,
  },
  readRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SP.sm,
    paddingVertical: SP.md - 1,
    paddingHorizontal: SP.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  readLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  emptyHint: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },
  attemptCard: {
    marginBottom: SP.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: SP.md + 2,
    paddingHorizontal: SP.lg,
  },
  attemptRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SP.md,
  },
  attemptMeta: {
    fontSize: 11,
    fontWeight: "500",
    marginBottom: 4,
  },
  attemptTitle: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
});
