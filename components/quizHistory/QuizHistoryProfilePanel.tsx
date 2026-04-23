import Icon from "@/components/Icon";
import { QuizBadgeItem } from "@/components/quizHistory/QuizBadgeItem";
import { SP, type QuizSurfaces } from "@/components/quizHistory/quizHistoryTokens";
import {
  QUIZ_HISTORY_FLAME_PATH,
  type QuizHistoryHomeUserAvatar,
} from "@/constants/quizHistoryWebViewHtml";
import { useResolvedQuizBadgeStates } from "@/hooks/useResolvedQuizBadgeStates";
import type { ChapterQuizProgress } from "@/utils/chapterQuizProgress";
import { mixHex } from "@/utils/quizBookPalette";
import type { ChapterQuizAttemptRow } from "@/services/chapterQuizLocalDbService";
import type { pbUser } from "@/types";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import React, { useEffect, useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

const HERO_REVEAL_MS = 520;
/** Start inner content when hero is ~90% done */
const INNER_START_DELAY_MS = HERO_REVEAL_MS * 0.9;
const INNER_ENTRANCE_MS = 640;
const INNER_SLIDE_PX = 14;
/**
 * White sheet rises after yellow header lands (reference: profile-animation frames ~04→05).
 */
const SHEET_START_MS = HERO_REVEAL_MS + 140;
const SHEET_ENTRANCE_MS = 780;
const SHEET_SLIDE_PX = 56;
const SHEET_INNER_SLIDE_PX = 12;

function staggerProgress(v: number, index: number): number {
  "worklet";
  const start = index * 0.14;
  const end = Math.min(start + 0.48, 1);
  return interpolate(v, [start, end], [0, 1], Extrapolation.CLAMP);
}

/** Stagger for sheet blocks (streak → stats → fat bar → badges), like frames 05→08. */
function sheetStaggerProgress(v: number, index: number): number {
  "worklet";
  const start = index * 0.13;
  const end = Math.min(start + 0.48, 1);
  return interpolate(v, [start, end], [0, 1], Extrapolation.CLAMP);
}

const QUIZ_HOME_YELLOW = "#f4d03f";

function levelTierLabel(level: number): string {
  if (level >= 80) return "Diamante";
  if (level >= 60) return "Platino";
  if (level >= 40) return "Oro";
  if (level >= 20) return "Plata";
  return "Bronce";
}

function displayHandle(user: pbUser | null | undefined): string {
  if (!user) return "@invitado";
  const local = user.email?.split("@")[0]?.trim();
  if (local) return `@${local}`;
  return `@${user.id.slice(0, 8)}`;
}

function displayName(user: pbUser | null | undefined): string {
  if (!user?.name?.trim()) return "Invitado";
  return user.name.trim();
}

export const QuizHistoryProfilePanel: React.FC<{
  surfaces: QuizSurfaces;
  user: pbUser | null | undefined;
  homeAvatar: QuizHistoryHomeUserAvatar | null;
  progress: ChapterQuizProgress;
  attempts: ChapterQuizAttemptRow[];
  streakDays: number;
  onClose: () => void;
}> = ({ surfaces, user, homeAvatar, progress, attempts, streakDays, onClose }) => {
  const insets = useSafeAreaInsets();
  const name = useMemo(() => displayName(user), [user]);
  const handle = useMemo(() => displayHandle(user), [user]);
  const [avatarUri, setAvatarUri] = useState(homeAvatar?.src ?? "");
  useEffect(() => {
    setAvatarUri(homeAvatar?.src ?? "");
  }, [homeAvatar?.src]);
  const tier = levelTierLabel(progress.level);
  const badgeStates = useResolvedQuizBadgeStates(attempts, progress);
  const badgesUnlocked = useMemo(
    () => badgeStates.filter((b) => b.unlocked),
    [badgeStates],
  );
  const badgesLocked = useMemo(
    () => badgeStates.filter((b) => !b.unlocked),
    [badgeStates],
  );
  const barPct = progress.isMaxLevel
    ? 100
    : Math.max(0, Math.min(100, progress.levelProgressPercent));
  const headerYellow = QUIZ_HOME_YELLOW;
  const headerYellowDeep = mixHex("#92400e", headerYellow, 0.22);
  const barFill = surfaces.accent;
  const streakFlameColor = mixHex('#000', "#ea580c", 0.58);

  const heroReveal = useSharedValue(0);
  const innerReveal = useSharedValue(0);
  const sheetReveal = useSharedValue(0);
  useEffect(() => {
    heroReveal.value = withTiming(1, {
      duration: HERO_REVEAL_MS,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    innerReveal.value = withDelay(
      INNER_START_DELAY_MS,
      withTiming(1, {
        duration: INNER_ENTRANCE_MS,
        easing: Easing.out(Easing.cubic),
      }),
    );
    sheetReveal.value = withDelay(
      SHEET_START_MS,
      withTiming(1, {
        duration: SHEET_ENTRANCE_MS,
        easing: Easing.bezier(0.33, 1, 0.68, 1),
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  const heroEnterStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: heroReveal.value }],
  }));

  const innerCloseStyle = useAnimatedStyle(() => {
    const t = staggerProgress(innerReveal.value, 0);
    return {
      opacity: t,
      transform: [{ translateY: (1 - t) * INNER_SLIDE_PX }],
    };
  });
  const innerAvatarStyle = useAnimatedStyle(() => {
    const t = staggerProgress(innerReveal.value, 1);
    return {
      opacity: t,
      transform: [{ translateY: (1 - t) * INNER_SLIDE_PX }],
    };
  });
  const innerNameStyle = useAnimatedStyle(() => {
    const t = staggerProgress(innerReveal.value, 2);
    return {
      opacity: t,
      transform: [{ translateY: (1 - t) * INNER_SLIDE_PX }],
    };
  });
  const innerHandleStyle = useAnimatedStyle(() => {
    const t = staggerProgress(innerReveal.value, 3);
    return {
      opacity: t,
      transform: [{ translateY: (1 - t) * INNER_SLIDE_PX }],
    };
  });
  const innerMiniRowStyle = useAnimatedStyle(() => {
    const t = staggerProgress(innerReveal.value, 4);
    return {
      opacity: t,
      transform: [{ translateY: (1 - t) * INNER_SLIDE_PX }],
    };
  });
  const innerMiniTrackStyle = useAnimatedStyle(() => {
    const t = staggerProgress(innerReveal.value, 5);
    return {
      opacity: t,
      transform: [{ translateY: (1 - t) * INNER_SLIDE_PX }],
    };
  });

  const sheetLiftStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      sheetReveal.value,
      [0, 0.1],
      [0, 1],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        translateY: interpolate(
          sheetReveal.value,
          [0, 1],
          [SHEET_SLIDE_PX, 0],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const sheetStreakStyle = useAnimatedStyle(() => {
    const t = sheetStaggerProgress(sheetReveal.value, 0);
    return {
      opacity: t,
      transform: [{ translateY: (1 - t) * SHEET_INNER_SLIDE_PX }],
    };
  });
  const sheetStatsStyle = useAnimatedStyle(() => {
    const t = sheetStaggerProgress(sheetReveal.value, 1);
    return {
      opacity: t,
      transform: [{ translateY: (1 - t) * SHEET_INNER_SLIDE_PX }],
    };
  });
  const sheetProgressBlockStyle = useAnimatedStyle(() => {
    const t = sheetStaggerProgress(sheetReveal.value, 2);
    return {
      opacity: t,
      transform: [{ translateY: (1 - t) * SHEET_INNER_SLIDE_PX }],
    };
  });
  const sheetBadgesStyle = useAnimatedStyle(() => {
    const t = sheetStaggerProgress(sheetReveal.value, 3);
    return {
      opacity: t,
      transform: [{ translateY: (1 - t) * SHEET_INNER_SLIDE_PX }],
    };
  });

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View
        style={[
          styles.hero,
          {
            backgroundColor: headerYellow,
            borderBottomColor: mixHex(headerYellowDeep, headerYellow, 0.35),
            paddingTop: insets.top + SP.sm,
            transformOrigin: "top",
          },
          heroEnterStyle,
        ]}
      >
        <Animated.View style={[styles.heroCloseBtn, innerCloseStyle, { top: insets.top + 6, right: SP.lg }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cerrar perfil"
            onPress={() => {
              void Haptics.selectionAsync();
              onClose();
            }}
            hitSlop={14}
          >
            <View style={styles.heroCloseCircle}>
              <Icon name="X" size={20} color="#1a1520" />
            </View>
          </Pressable>
        </Animated.View>
        <Animated.View style={[styles.avatarWrap, innerAvatarStyle]}>
          {avatarUri ? (
            <Image
              source={{ uri: avatarUri }}
              onError={() => {
                if (homeAvatar?.onErrorSrc) setAvatarUri(homeAvatar.onErrorSrc);
              }}
              style={styles.avatarImg}
              contentFit="cover"
              accessibilityLabel="Avatar"
            />
          ) : (
            <View
              style={[
                styles.avatarFallback,
                { backgroundColor: mixHex(surfaces.accent, "#c4b5fd", 0.35) },
              ]}
            >
              <Text style={styles.avatarFallbackText}>✝</Text>
            </View>
          )}
        </Animated.View>
        <Animated.View style={innerNameStyle}>
          <Text style={[styles.name, { color: "#1a1520" }]}>{name}</Text>
        </Animated.View>
        <Animated.View style={innerHandleStyle}>
          <Text style={[styles.handle, { color: "#3d3d3d" }]}>{handle}</Text>
        </Animated.View>

        <Animated.View style={[styles.miniBarRow, innerMiniRowStyle]}>
          <Text style={[styles.miniBarLbl, { color: "#3d3d3d" }]}>
            Progreso de nivel
          </Text>
          <View style={styles.miniXp}>
            <Icon name="Star" size={14} color={mixHex("#92400e", headerYellow, 0.55)} />
            <Text style={[styles.miniXpText, styles.miniXpTextGap, { color: "#1a1520" }]}>
              {progress.totalXp} XP
            </Text>
          </View>
        </Animated.View>
        <Animated.View
          style={[
            styles.miniTrack,
            innerMiniTrackStyle,
            { backgroundColor: mixHex(headerYellowDeep, headerYellow, 0.25) },
          ]}
        >
          <View
            style={[
              styles.miniFill,
              {
                width: `${barPct}%`,
                backgroundColor: barFill,
              },
            ]}
          />
        </Animated.View>
      </Animated.View>

      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor: surfaces.card,
            marginTop: -22,
            shadowColor: "#000",
          },
          sheetLiftStyle,
        ]}
      >
        <Animated.View style={sheetStreakStyle}>
          <Pressable
            style={[
              styles.streakCard,
              { backgroundColor: mixHex(headerYellow, "#f4d03f", 0.55) },
            ]}
            disabled
          >
            <View style={styles.streakLeft}>
              <Text style={[styles.streakSmall, { color: "#3d3d3d" }]}>
                Tu racha
              </Text>
              <Text style={[styles.streakBig, { color: "#1a1520" }]}>
                {streakDays} día{streakDays === 1 ? "" : "s"}
              </Text>
            </View>
            <View style={styles.streakRight}>
              <Svg
                width={34}
                height={34}
                viewBox="0 0 24 24"
                accessibilityRole="image"
                accessibilityLabel="Racha"
              >
                <Path
                  d={QUIZ_HISTORY_FLAME_PATH}
                  fill="none"
                  stroke={streakFlameColor}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Icon name="ChevronRight" size={20} color="#1a152099" />
            </View>
          </Pressable>
        </Animated.View>

        <Animated.View style={sheetStatsStyle}>
          <View style={styles.statRow}>
            <View
              style={[
                styles.statCard,
                { borderColor: surfaces.borderStrong, backgroundColor: surfaces.base },
              ]}
            >
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: surfaces.accentSoft },
                ]}
              >
                <Icon name="Trophy" size={18} color={surfaces.accent} />
              </View>
              <Text style={[styles.statLbl, { color: surfaces.muted }]}>Nivel</Text>
              <Text style={[styles.statVal, { color: surfaces.text }]}>{tier}</Text>
            </View>
            <View
              style={[
                styles.statCard,
                { borderColor: surfaces.borderStrong, backgroundColor: surfaces.base },
              ]}
            >
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: surfaces.accentSoft },
                ]}
              >
                <Icon name="Star" size={18} color={surfaces.accent} />
              </View>
              <Text style={[styles.statLbl, { color: surfaces.muted }]}>Puntos</Text>
              <Text style={[styles.statVal, { color: surfaces.text }]}>
                {progress.totalXp}
              </Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={sheetProgressBlockStyle}>
          <Text style={[styles.sectionTitle, { color: surfaces.text }]}>
            Progreso de nivel
          </Text>
          <View
            style={[
              styles.fatTrack,
              { backgroundColor: surfaces.borderStrong },
            ]}
          >
            <View
              style={[
                styles.fatFill,
                { width: `${barPct}%`, backgroundColor: barFill },
              ]}
            >
              <Text style={styles.fatFillText}>{Math.round(barPct)}%</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={sheetBadgesStyle}>
          <View style={styles.badgesBlock}>
            <View style={styles.badgesHead}>
              <Text style={[styles.sectionTitle, { color: surfaces.text, marginBottom: 0 }]}>
                Mis insignias
              </Text>
              <Pressable disabled>
                <Text style={[styles.seeAll, { color: surfaces.muted }]}>Ver todas</Text>
              </Pressable>
            </View>
            {badgesUnlocked.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.badgesRow}
              >
                {badgesUnlocked.map((b) => (
                  <QuizBadgeItem key={b.id} surfaces={surfaces} state={b} />
                ))}
              </ScrollView>
            ) : (
              <Text style={[styles.badgesEmpty, { color: surfaces.muted }]}>
                Aún no tienes insignias desbloqueadas.
              </Text>
            )}
          </View>

          {badgesLocked.length > 0 ? (
            <View style={styles.badgesBlock}>
              <View style={styles.badgesHead}>
                <Text style={[styles.sectionTitle, { color: surfaces.text, marginBottom: 0 }]}>
                  Insignias bloqueadas
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.badgesRow}
              >
                {badgesLocked.map((b) => (
                  <QuizBadgeItem key={b.id} surfaces={surfaces} state={b} />
                ))}
              </ScrollView>
            </View>
          ) : null}
        </Animated.View>
      </Animated.View>
      <View style={{ height: SP.xl }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1, alignSelf: "stretch" },
  scrollContent: { paddingBottom: SP.lg },
  hero: {
    position: "relative",
    paddingBottom: SP.xl + 6,
    paddingHorizontal: SP.lg,
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  heroCloseBtn: {
    position: "absolute",
    zIndex: 2,
  },
  heroCloseCircle: {
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  avatarWrap: {
    marginBottom: SP.sm,
  },
  avatarImg: {
    width: 88,
    height: 88,
    borderRadius: 999,
    backgroundColor: "#ddd",
  },
  avatarFallback: {
    width: 88,
    height: 88,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarFallbackText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "800",
  },
  name: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  handle: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2,
    marginBottom: SP.md,
  },
  miniBarRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    alignSelf: "stretch",
    marginBottom: 6,
  },
  miniBarLbl: { fontSize: 12, fontWeight: "700" },
  miniXp: { flexDirection: "row", alignItems: "center" },
  miniXpText: { fontSize: 13, fontWeight: "800" },
  miniXpTextGap: { marginLeft: 4 },
  miniTrack: {
    alignSelf: "stretch",
    height: 6,
    borderRadius: 99,
    overflow: "hidden",
  },
  miniFill: {
    height: "100%",
    borderRadius: 99,
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: SP.lg,
    paddingTop: SP.lg,
    paddingBottom: SP.md,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  streakCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: SP.md,
    marginBottom: SP.md,
  },
  streakLeft: { flex: 1 },
  streakSmall: { fontSize: 12, fontWeight: "600" },
  streakBig: { fontSize: 20, fontWeight: "900", marginTop: 2, letterSpacing: -0.4 },
  streakRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  statRow: {
    flexDirection: "row",
    gap: SP.sm,
    marginBottom: SP.lg,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: SP.md,
    paddingHorizontal: SP.sm,
    alignItems: "center",
    gap: 6,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  statLbl: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.04,
  },
  statVal: { fontSize: 17, fontWeight: "900", letterSpacing: -0.3 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.35,
    marginBottom: SP.sm,
  },
  fatTrack: {
    height: 36,
    borderRadius: 99,
    overflow: "hidden",
    marginBottom: SP.lg,
  },
  fatFill: {
    height: "100%",
    borderRadius: 99,
    minWidth: 72,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SP.md,
  },
  fatFillText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
  },
  badgesBlock: {
    marginBottom: SP.lg,
  },
  badgesHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SP.sm,
  },
  seeAll: { fontSize: 13, fontWeight: "600" },
  badgesRow: {
    gap: SP.lg,
    paddingBottom: SP.sm,
  },
  badgesEmpty: {
    fontSize: 13,
    fontWeight: "600",
    paddingVertical: SP.sm,
  },
});
