import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { Text } from "@/components/Themed";
import {
  RADIUS,
  type QuizSurfaces,
} from "./quizHistoryTokens";

export type ChapterCellState =
  | { kind: "not_started" }
  | {
      kind: "passed";
      score: number;
      total: number;
      attemptId: string;
    }
  | {
      kind: "failed";
      score: number;
      total: number;
      attemptId: string;
    };

type Props = {
  chapter: number;
  state: ChapterCellState;
  surfaces: QuizSurfaces;
  size?: number;
  onPress: () => void;
  onLongPress?: () => void;
};

export const ChapterCell: React.FC<Props> = ({
  chapter,
  state,
  surfaces,
  size = 58,
  onPress,
  onLongPress,
}) => {
  const pressed = useSharedValue(0);

  const cellStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.06 }],
  }));

  const isPassed = state.kind === "passed";
  const isFailed = state.kind === "failed";
  const ratio =
    state.kind === "not_started" || state.total === 0
      ? 0
      : state.score / state.total;

  const bg = isPassed
    ? surfaces.accentSoft
    : isFailed
    ? surfaces.failSoft
    : "transparent";

  const borderColor = isPassed
    ? "transparent"
    : isFailed
    ? "transparent"
    : surfaces.borderStrong;

  const numberColor = isPassed
    ? surfaces.text
    : isFailed
    ? surfaces.text
    : surfaces.softText;

  const ringColor = isPassed ? surfaces.accent : surfaces.fail;
  const showRing = state.kind !== "not_started";

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={400}
      onPressIn={() => {
        pressed.value = withTiming(1, { duration: 80 });
      }}
      onPressOut={() => {
        pressed.value = withTiming(0, { duration: 140 });
      }}
    >
      <Animated.View
        style={[
          styles.outer,
          cellStyle,
          {
            width: size,
            height: size,
            borderRadius: RADIUS.cell,
          },
        ]}
      >
        <View
          style={[
            styles.inner,
            {
              backgroundColor: bg,
              borderColor,
              borderRadius: RADIUS.cell,
              borderWidth: state.kind === "not_started" ? 1 : 0,
            },
          ]}
        >
          {showRing ? (
            <ProgressRing
              size={size}
              ratio={ratio}
              color={ringColor}
              trackColor={surfaces.border}
            />
          ) : null}
          <Text
            style={[
              styles.number,
              {
                color: numberColor,
                fontWeight: state.kind === "not_started" ? "500" : "700",
              },
            ]}
          >
            {chapter}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
};

const ProgressRing: React.FC<{
  size: number;
  ratio: number;
  color: string;
  trackColor: string;
}> = ({ size, ratio, color, trackColor }) => {
  const stroke = 2;
  const r = (size - stroke) / 2 - 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * Math.max(0, Math.min(1, ratio));

  return (
    <Svg
      width={size}
      height={size}
      style={StyleSheet.absoluteFill}
    >
      <Circle
        cx={cx}
        cy={cy}
        r={r}
        stroke={trackColor}
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
  );
};

const styles = StyleSheet.create({
  outer: {
    overflow: "visible",
  },
  inner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  number: {
    fontSize: 15,
    letterSpacing: -0.2,
  },
});
