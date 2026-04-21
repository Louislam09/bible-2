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
import Icon from "@/components/Icon";
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
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

export type { ChapterQuizChallengeState, ChapterQuizSizeOption } from "@/utils/quizChapterChallenges";
export {
  CHAPTER_QUIZ_SIZE_OPTIONS,
  getChallengeStateForQuizSize,
  hasSessionForQuizSize
};

const TILE_ENTER_MS = 200;
const TILE_STAGGER_MS = 42;
const ATTEMPT_STAGGER_MS = 38;
const PRESS_IN_MS = 110;
const PRESS_OUT_MS = 160;

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

type TilePalette = {
  bg: string;
  border: string;
  borderWidth: number;
  label: string;
  labelColor: string;
  showCheck: boolean;
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
      <Animated.View
        entering={FadeInDown.duration(TILE_ENTER_MS)
          .delay(0)
          .easing(Easing.out(Easing.quad))}
      >
        <RNView style={styles.detailHead}>
          <Text style={[styles.detailTitle, { color: surfaces.text }]}>
            {book} {chapter}
          </Text>
          <Text style={[styles.detailSub, { color: surfaces.muted }]}>
            {headSubline}
          </Text>
        </RNView>
      </Animated.View>
      <Animated.View
        entering={FadeInDown.duration(TILE_ENTER_MS)
          .delay(24)
          .easing(Easing.out(Easing.quad))}
      >
        <RNView
          style={[styles.headDivider, { backgroundColor: surfaces.border }]}
        />
      </Animated.View>

      <Animated.View
        entering={FadeInDown.duration(TILE_ENTER_MS)
          .delay(40)
          .easing(Easing.out(Easing.quad))}
      >
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
      </Animated.View>

      <Animated.View
        entering={FadeInDown.duration(TILE_ENTER_MS)
          .delay(56)
          .easing(Easing.out(Easing.quad))}
      >
        <Text style={[styles.sectionLabel, { color: surfaces.muted }]}>
          RETOS
        </Text>
      </Animated.View>
      <RNView style={styles.grid}>
        {CHAPTER_QUIZ_SIZE_OPTIONS.map((size, index) => {
          const state = getChallengeStateForQuizSize(
            attempts,
            size,
            hasSessionForQuizSize(sessions, chapterKey, size),
          );
          const loading = loadingQuizSize === size;
          const palette: TilePalette =
            state === "completed"
              ? {
                bg: surfaces.passSoft,
                border: surfaces.pass,
                borderWidth: 2,
                label: "Completado",
                labelColor: surfaces.pass,
                showCheck: true,
              }
              : state === "in_progress"
                ? {
                  bg: surfaces.failSoft,
                  border: FAIL_COLOR + "66",
                  borderWidth: 1.5,
                  label: "En progreso",
                  labelColor: surfaces.fail,
                  showCheck: false,
                }
                : {
                  bg: surfaces.card,
                  border: surfaces.borderStrong,
                  borderWidth: StyleSheet.hairlineWidth,
                  label: "Sin empezar",
                  labelColor: surfaces.muted,
                  showCheck: false,
                };

          return (
            <ChallengeTile
              key={size}
              size={size}
              index={index}
              loading={loading}
              disabled={loadingQuizSize !== null}
              tileW={tileW}
              palette={palette}
              surfaces={surfaces}
              onPress={() => onPressSize(size)}
            />
          );
        })}
      </RNView>

      <Animated.View
        entering={FadeInDown.duration(TILE_ENTER_MS)
          .delay(72 + CHAPTER_QUIZ_SIZE_OPTIONS.length * TILE_STAGGER_MS)
          .easing(Easing.out(Easing.quad))}
      >
        <Text
          style={[
            styles.sectionLabel,
            { color: surfaces.muted, marginTop: SP.xl },
          ]}
        >
          INTENTOS
        </Text>
      </Animated.View>
      {sortedAttempts.length === 0 ? (
        <Animated.View
          entering={FadeInDown.duration(TILE_ENTER_MS)
            .delay(100)
            .easing(Easing.out(Easing.quad))}
        >
          <Text style={[styles.emptyHint, { color: surfaces.muted }]}>
            Aún no hay intentos guardados para este capítulo.
          </Text>
        </Animated.View>
      ) : (
        sortedAttempts.map((row, index) => {
          const ratio = row.total > 0 ? row.score / row.total : 0;
          return (
            <Animated.View
              key={row.id}
              entering={FadeInDown.duration(TILE_ENTER_MS)
                .delay(
                  90 +
                    CHAPTER_QUIZ_SIZE_OPTIONS.length * TILE_STAGGER_MS +
                    index * ATTEMPT_STAGGER_MS,
                )
                .easing(Easing.out(Easing.quad))}
            >
              <AttemptRow
                row={row}
                ratio={ratio}
                surfaces={surfaces}
                onPress={() => onPressAttempt(row)}
              />
            </Animated.View>
          );
        })
      )}
    </ScrollView>
  );
};

const ChallengeTile: React.FC<{
  size: ChapterQuizSizeOption;
  index: number;
  loading: boolean;
  disabled: boolean;
  tileW: number;
  palette: TilePalette;
  surfaces: QuizSurfaces;
  onPress: () => void;
}> = ({
  size,
  index,
  loading,
  disabled,
  tileW,
  palette,
  surfaces,
  onPress,
}) => {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const entering = FadeInDown.duration(TILE_ENTER_MS)
    .delay(64 + index * TILE_STAGGER_MS)
    .easing(Easing.out(Easing.quad));

  return (
    <Animated.View
      entering={entering}
      style={{
        width: tileW,
        minHeight: 132,
      }}
    >
      <Animated.View style={[animStyle, { width: "100%", minHeight: 132 }]}>
        <Pressable
          disabled={loading || disabled}
          onPress={onPress}
          onPressIn={() => {
            if (loading || disabled) return;
            scale.value = withTiming(0.97, {
              duration: PRESS_IN_MS,
              easing: Easing.out(Easing.quad),
            });
          }}
          onPressOut={() => {
            scale.value = withTiming(1, {
              duration: PRESS_OUT_MS,
              easing: Easing.out(Easing.quad),
            });
          }}
          style={({ pressed }) => [
            styles.tile,
            {
              width: "100%",
              minHeight: 132,
              borderColor: palette.border,
              backgroundColor: palette.bg,
              borderWidth: palette.borderWidth,
              borderRadius: RADIUS.card,
              opacity: pressed && !loading && !disabled ? 0.92 : disabled && !loading ? 0.55 : 1,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator color={surfaces.accent} />
          ) : (
            <>
              {palette.showCheck ? (
                <RNView style={styles.tileCheckCorner} pointerEvents="none">
                  <Icon
                    name="CircleCheck"
                    size={22}
                    color={surfaces.pass}
                    strokeWidth={2.2}
                  />
                </RNView>
              ) : null}
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
      </Animated.View>
    </Animated.View>
  );
};

const AttemptRow: React.FC<{
  row: ChapterQuizAttemptRow;
  ratio: number;
  surfaces: QuizSurfaces;
  onPress: () => void;
}> = ({ row, ratio, surfaces, onPress }) => {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withTiming(0.985, {
            duration: PRESS_IN_MS,
            easing: Easing.out(Easing.quad),
          });
        }}
        onPressOut={() => {
          scale.value = withTiming(1, {
            duration: PRESS_OUT_MS,
            easing: Easing.out(Easing.quad),
          });
        }}
        style={({ pressed }) => [
          styles.attemptCard,
          {
            borderColor: surfaces.border,
            backgroundColor: surfaces.card,
            borderRadius: RADIUS.card,
            opacity: pressed ? 0.94 : 1,
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
    </Animated.View>
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
  const color = pass ? surfaces.pass : surfaces.fail;
  const fade = useSharedValue(0);

  React.useEffect(() => {
    fade.value = 0;
    fade.value = withTiming(1, {
      duration: 380,
      easing: Easing.out(Easing.cubic),
    });
  }, [ratio, pass, fade]);

  const wrapStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + 0.6 * fade.value,
  }));

  return (
    <Animated.View
      style={[
        { width: size, height: size, alignItems: "center", justifyContent: "center" },
        wrapStyle,
      ]}
    >
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
    </Animated.View>
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
    position: "relative",
    paddingVertical: SP.md + 2,
    paddingHorizontal: SP.md,
    alignItems: "center",
    justifyContent: "center",
  },
  tileCheckCorner: {
    position: "absolute",
    top: SP.sm,
    right: SP.sm,
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
