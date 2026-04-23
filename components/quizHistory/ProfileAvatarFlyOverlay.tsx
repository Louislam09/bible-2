import { Image } from "expo-image";
import React, { useEffect, useRef } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export type AvatarFlyRect = { x: number; y: number; w: number; h: number };

type Props = {
  uri: string | null;
  /** Shown when `uri` is empty (matches profile fallback). */
  fallbackGlyph: string;
  from: AvatarFlyRect;
  to: AvatarFlyRect | null;
  /** When false, children not rendered. */
  active: boolean;
  onFinished: () => void;
  /** Match profile hero `scaleY` duration so header grow and fly feel parallel. */
  durationMs?: number;
};

/**
 * Full-window overlay: avatar moves from WebView header (screen coords) to profile hero (screen coords).
 * Uses a Modal so positions from measureInWindow stay consistent with the animation layer.
 */
export function ProfileAvatarFlyOverlay({
  uri,
  fallbackGlyph,
  from,
  to,
  active,
  onFinished,
  durationMs = 520,
}: Props) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(0);
  const fx = useSharedValue(from.x);
  const fy = useSharedValue(from.y);
  const fw = useSharedValue(from.w);
  const fh = useSharedValue(from.h);
  const tx = useSharedValue(from.x);
  const ty = useSharedValue(from.y);
  const tw = useSharedValue(from.w);
  const th = useSharedValue(from.h);
  const onEndRef = useRef(onFinished);
  onEndRef.current = onFinished;
  /** First `to` starts timing; later rect updates only move the endpoint (hero still growing). */
  const flightStartedRef = useRef(false);

  useEffect(() => {
    if (!active) {
      flightStartedRef.current = false;
    }
  }, [active]);

  useEffect(() => {
    flightStartedRef.current = false;
  }, [from.x, from.y, from.w, from.h]);

  useEffect(() => {
    fx.value = from.x;
    fy.value = from.y;
    fw.value = from.w;
    fh.value = from.h;
  }, [from.x, from.y, from.w, from.h, fx, fy, fw, fh]);

  useEffect(() => {
    if (!active || !to) return;

    const finish = () => {
      onEndRef.current?.();
    };
    if (reduceMotion) {
      finish();
      return;
    }
    tx.value = to.x;
    ty.value = to.y;
    tw.value = to.w;
    th.value = to.h;
    if (!flightStartedRef.current) {
      flightStartedRef.current = true;
      progress.value = 0;
      progress.value = withTiming(
        1,
        {
          duration: durationMs,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        },
        (finished) => {
          if (finished) runOnJS(finish)();
        },
      );
    }
  }, [
    active,
    to?.x,
    to?.y,
    to?.w,
    to?.h,
    progress,
    tx,
    ty,
    tw,
    th,
    reduceMotion,
    durationMs,
  ]);

  const bubbleStyle = useAnimatedStyle(() => {
    const t = progress.value;
    const mix = (a: number, b: number) => a + (b - a) * t;
    const w = mix(fw.value, tw.value);
    const h = mix(fh.value, th.value);
    const left0 = mix(fx.value, tx.value);
    const top0 = mix(fy.value, ty.value);
    /** Square diameter + half radius keeps a true circle (handles tiny w/h mismatch from layout). */
    const d = (w + h) * 0.5;
    const cx = left0 + w * 0.5;
    const cy = top0 + h * 0.5;
    return {
      position: "absolute",
      left: cx - d * 0.5,
      top: cy - d * 0.5,
      width: d,
      height: d,
      borderRadius: d * 0.5,
      overflow: "hidden",
      backgroundColor: "#e5e7eb",
    };
  });

  if (!active) return null;

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent>
      <View style={styles.backdrop} pointerEvents="none">
        <Animated.View style={[bubbleStyle, styles.flyingBubbleShadow]}>
          {uri ? (
            <Image
              source={{ uri }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            />
          ) : (
            <View style={styles.fallbackInner}>
              <Text style={styles.fallbackText}>{fallbackGlyph}</Text>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  /** Shadow must stay static — animated `shadowOffset` breaks RN / Reanimated on native. */
  flyingBubbleShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 10,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "transparent",
  },
  fallbackInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ddd",
  },
  fallbackText: {
    fontSize: 36,
    fontWeight: "800",
    color: "#fff",
  },
});
