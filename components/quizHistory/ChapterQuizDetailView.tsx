import {
  FAIL_COLOR,
  RADIUS,
  SP,
  type QuizSurfaces,
} from "@/components/quizHistory/quizHistoryTokens";
import {
  QuizQuickAction,
  QuizQuickActionsRow,
} from "@/components/quizHistory/QuizQuickAction";
import { Text } from "@/components/Themed";
import type {
  ChapterQuizAttemptRow,
  ChapterQuizSessionRow,
} from "@/services/chapterQuizLocalDbService";
import {
  CHAPTER_QUIZ_SIZE_OPTIONS,
  countCompletedChallengesForChapter,
  getChallengeStateForQuizSize,
  hasSessionForQuizSize,
  type ChapterQuizSizeOption,
} from "@/utils/quizChapterChallenges";
import { formatRelativeDate } from "@/utils/quizHistory";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  View as RNView,
  ScrollView,
  StyleSheet,
} from "react-native";
import Svg, { Circle } from "react-native-svg";

export type { ChapterQuizChallengeState, ChapterQuizSizeOption } from "@/utils/quizChapterChallenges";
export {
  CHAPTER_QUIZ_SIZE_OPTIONS,
  getChallengeStateForQuizSize,
  hasSessionForQuizSize
};

type Props = {
  surfaces: QuizSurfaces;
  book: string;
  chapter: number;
  chapterKey: string;
  attempts: ChapterQuizAttemptRow[];
  sessions: ChapterQuizSessionRow[];
  loadingQuizSize: ChapterQuizSizeOption | null;
  onPressSize: (size: ChapterQuizSizeOption) => void;
  onPressAttempt: (row: ChapterQuizAttemptRow) => void;
  onReadChapter: () => void;
  /** Same “best” attempt as chapter grid long-press (highest score ratio). */
  onToggleFavoriteBest: (attemptId: string) => void;
  onRetryFailedBest: (attemptId: string) => void;
  onDeleteBestAttempt: (attemptId: string) => void;
};

export const ChapterQuizDetailView: React.FC<Props> = ({
  surfaces,
  book,
  chapter,
  chapterKey,
  attempts,
  sessions,
  loadingQuizSize,
  onPressSize,
  onPressAttempt,
  onReadChapter,
  onToggleFavoriteBest,
  onRetryFailedBest,
  onDeleteBestAttempt,
}) => {
  const bestAttempt = useMemo(() => {
    let best: ChapterQuizAttemptRow | null = null;
    let bestRatio = -1;
    for (const a of attempts) {
      const r = a.total > 0 ? a.score / a.total : 0;
      if (r > bestRatio) {
        bestRatio = r;
        best = a;
      }
    }
    return best;
  }, [attempts]);

  const sortedAttempts = useMemo(
    () =>
      [...attempts].sort(
        (a, b) =>
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
      ),
    [attempts],
  );

  const headSubline = useMemo(() => {
    const n = attempts.length;
    const completed = countCompletedChallengesForChapter(attempts, book, chapter);
    const intentos =
      n === 0
        ? "Sin intentos aún"
        : n === 1
          ? "1 intento"
          : `${n} intentos`;
    return `${intentos} · ${completed}/4 retos del capítulo`;
  }, [attempts, book, chapter]);


  const tileW =
    (Dimensions.get("window").width - SP.lg * 2 - SP.md) / 2 - 1;

  return (
    <ScrollView
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    >
      <RNView style={styles.detailHead}>
        <Text style={[styles.detailTitle, { color: surfaces.text }]}>
          {book} {chapter}
        </Text>
        <Text style={[styles.detailSub, { color: surfaces.muted }]}>
          {headSubline}
        </Text>
      </RNView>
      <RNView
        style={[styles.headDivider, { backgroundColor: surfaces.border }]}
      />

      <QuizQuickActionsRow>
        <QuizQuickAction
          icon="BookOpen"
          label="Leer capítulo"
          onPress={onReadChapter}
          surfaces={surfaces}
        />

        {bestAttempt ? (
          <>
            <QuizQuickAction
              icon={bestAttempt.isFavorite ? "Star" : "StarOff"}
              label={
                bestAttempt.isFavorite
                  ? "Quitar favorito"
                  : "Guardar favorito"
              }
              onPress={() => onToggleFavoriteBest(bestAttempt.id)}
              surfaces={surfaces}
              active={bestAttempt.isFavorite}
            />
            <QuizQuickAction
              icon="RotateCcw"
              label="Reintentar falladas"
              onPress={() => onRetryFailedBest(bestAttempt.id)}
              surfaces={surfaces}
            />
            <QuizQuickAction
              icon="Trash2"
              label="Eliminar"
              onPress={() => onDeleteBestAttempt(bestAttempt.id)}
              surfaces={surfaces}
              danger
            />

          </>
        ) : null}
      </QuizQuickActionsRow>


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
            <Pressable
              key={size}
              disabled={loading || loadingQuizSize !== null}
              onPress={() => onPressSize(size)}
              style={({ pressed }) => [
                styles.tile,
                {
                  width: tileW,
                  minHeight: 132,
                  borderColor: palette.border,
                  backgroundColor: palette.bg,
                  borderRadius: RADIUS.card,
                  opacity: pressed ? 0.88 : 1,
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
            </Pressable>
          );
        })}
      </RNView>

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
            <Pressable
              key={row.id}
              onPress={() => onPressAttempt(row)}
              style={({ pressed }) => [
                styles.attemptCard,
                {
                  borderColor: surfaces.border,
                  backgroundColor: surfaces.card,
                  borderRadius: RADIUS.card,
                  opacity: pressed ? 0.92 : 1,
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
            </Pressable>
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
  detailHead: {
    marginBottom: SP.md,
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  detailSub: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },
  headDivider: {
    height: StyleSheet.hairlineWidth,
    width: "100%",
    marginBottom: SP.lg,
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
