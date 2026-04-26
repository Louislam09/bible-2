import Animation from "@/components/Animation";
import Icon from "@/components/Icon";
import { QuizBadgeItem } from "@/components/quizHistory/QuizBadgeItem";
import {
  SP,
  type QuizSurfaces,
} from "@/components/quizHistory/quizHistoryTokens";
import { StaggerEnter } from "@/components/quizHistory/StaggerEnter";
import {
  QUIZ_HISTORY_FLAME_PATH,
  type QuizHistoryHomeUserAvatar,
} from "@/constants/quizHistoryWebViewHtml";
import { useResolvedQuizBadgeStates } from "@/hooks/useResolvedQuizBadgeStates";
import type { ChapterQuizProgress } from "@/utils/chapterQuizProgress";
import { mixHex, textColorsOnBackground } from "@/utils/quizBookPalette";
import type { ChapterQuizAttemptRow } from "@/services/chapterQuizLocalDbService";
import type { pbUser } from "@/types";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
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

const trophyLottieSource = require("../../assets/lottie/Trophy.json");
const QUIZ_HOME_YELLOW = "#f4d03f";

const HERO_REVEAL_MS = 1000;
// const HERO_REVEAL_MS = 520;
/** Hero inner content starts this many px above layout and slides down with the growing bg. */
const HERO_HEIGHT_MAX = 250;
/**
 * White sheet rises after the hero/header animation finishes, then inner blocks stagger in.
 */
const SHEET_ENTRANCE_MS = 760;
const SHEET_SLIDE_PX = 64;
/** Base delay for `StaggerEnter` in sheet content (after sheet starts lifting). */
const SHEET_STAGGER_DELAY_OFFSET_MS = 100;

function levelTierLabel(level: number): string {
  if (level >= 80) return "Diamante";
  if (level >= 60) return "Platino";
  if (level >= 40) return "Oro";
  if (level >= 20) return "Plata";
  return "Bronce";
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
}> = ({
  surfaces,
  user,
  homeAvatar,
  progress,
  attempts,
  streakDays,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const name = useMemo(() => displayName(user), [user]);
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
  /** Stagger indices after "Mis insignias" (6): unlocked row(s) or empty line, then locked block. */
  const badgeStagger = useMemo(() => {
    const unlockedRowStart = 7;
    const unlockedSlots = badgesUnlocked.length > 0 ? badgesUnlocked.length : 1;
    const lockedHeaderIndex = unlockedRowStart + unlockedSlots;
    const lockedRowStart = lockedHeaderIndex + 1;
    return { unlockedRowStart, lockedHeaderIndex, lockedRowStart };
  }, [badgesUnlocked.length]);
  const barPct = progress.isMaxLevel
    ? 100
    : Math.max(0, Math.min(100, progress.levelProgressPercent));
  const headerColor = surfaces.accent;
  const headerYellowDeep = mixHex(surfaces.text, surfaces.accent, 0.35);
  const heroFg = useMemo(
    () => textColorsOnBackground(headerColor, surfaces.text),
    [headerColor, surfaces.text],
  );
  const levelSubText = progress.isMaxLevel
    ? "Máximo alcanzado"
    : `Nivel ${progress.level + 1}`;
  const barFill = surfaces.accent;
  const streakFlameColor = mixHex(QUIZ_HOME_YELLOW, "#ea580c", 0.58);
  // const streakFlameColor = mixHex("#000", "#ea580c", 0.58);

  /** Trophy.json: recolor fills / strokes to quiz surfaces (theme). */
  const trophyLottieColorFilters = useMemo(
    () => [
      { keypath: "**.Fill 1", color: surfaces.card },
      { keypath: "**.Stroke 1", color: surfaces.accent },
    ],
    [surfaces.card, surfaces.accent],
  );

  const heroReveal = useSharedValue(0);
  const sheetReveal = useSharedValue(0);

  useEffect(() => {
    heroReveal.value = withTiming(1, {
      duration: HERO_REVEAL_MS,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hero reveal once per mount
  }, []);

  useEffect(() => {
    // sheetReveal.value = withDelay(
    //   0,
    //   withTiming(1, {
    //     duration: SHEET_ENTRANCE_MS,
    //     easing: Easing.bezier(0.33, 1, 0.68, 1),
    //   }),
    // );
    sheetReveal.value = withTiming(1, {
      duration: SHEET_ENTRANCE_MS,
      easing: Easing.bezier(0.33, 1, 0.68, 1),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  const heroHeightStyle = useAnimatedStyle(() => {
    const h = heroReveal.value;
    return {
      height: interpolate(
        h,
        [0, 1],
        [120, HERO_HEIGHT_MAX],
        // Extrapolation.CLAMP,
        Extrapolation.EXTEND,
      ),
    };
  });

  const heroCloseBtnRevealStyle = useAnimatedStyle(() => {
    const h = heroReveal.value;
    return {
      opacity: interpolate(h, [0.7, 1], [0, 1], Extrapolation.CLAMP),
      transform: [
        {
          translateY: interpolate(h, [0.7, 1], [50, 0], Extrapolation.CLAMP),
        },
      ],
    };
  });

  const heroAvatarRevealStyle = useAnimatedStyle(() => {
    const h = heroReveal.value;
    return {
      width: interpolate(h, [0.3, 1], [50, 88], Extrapolation.CLAMP),
      height: interpolate(h, [0.3, 1], [50, 88], Extrapolation.CLAMP),
    };
  });

  const heroImageRevealStyle = useAnimatedStyle(() => {
    const h = heroReveal.value;
    return {
      width: interpolate(h, [0.3, 1], [50, 88], Extrapolation.CLAMP),
      height: interpolate(h, [0.3, 1], [50, 88], Extrapolation.CLAMP),
      transform: [
        {
          translateX: interpolate(h, [0.3, 1], [-150, 0], Extrapolation.CLAMP),
        },
        {
          translateY: interpolate(h, [0.3, 1], [-20, 0], Extrapolation.CLAMP),
        },
      ],
    };
  });

  const heroQuizLeftRevealStyle = useAnimatedStyle(() => {
    const h = heroReveal.value;
    return {
      width: interpolate(h, [0, 1], [55, 0], Extrapolation.CLAMP),
    };
  });

  const heroQuizTopRowRevealStyle = useAnimatedStyle(() => {
    const h = heroReveal.value;
    return {
      // opacity: interpolate(h, [0, 1], [0, 1], Extrapolation.CLAMP),
      transform: [
        {
          translateY: interpolate(h, [0, 1], [-120, 0], Extrapolation.CLAMP),
        },
      ],
    };
  });

  const heroNameRevealStyle = useAnimatedStyle(() => {
    const h = heroReveal.value;
    return {
      opacity: interpolate(h, [0.9, 1], [0, 1], Extrapolation.CLAMP),
      transform: [
        {
          translateY: interpolate(h, [0, 1], [30, 0], Extrapolation.CLAMP),
        },
      ],
    };
  });

  const sheetLiftStyle = useAnimatedStyle(() => {
    const u = sheetReveal.value;
    return {
      // opacity: interpolate(u, [0, 0.2], [0, 1], Extrapolation.CLAMP),
      transform: [
        {
          translateY: interpolate(
            u,
            [0, 1],
            [SHEET_SLIDE_PX, 0],
            Extrapolation.CLAMP,
          ),
        },
        {
          scale: interpolate(u, [0, 1], [0.97, 1], Extrapolation.CLAMP),
        },
      ],
    };
  });

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.scrollContent,
        { backgroundColor: surfaces.card },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View
        style={[
          styles.hero,
          {
            borderBottomColor: mixHex(headerYellowDeep, headerColor, 0.35),
            backgroundColor: headerColor,
          },
          // { height: 120 },
          heroHeightStyle,
        ]}
      >
        <Animated.View
          style={[
            styles.heroCloseBtn,
            { top: insets.top + 6, right: SP.lg },
            heroCloseBtnRevealStyle,
          ]}
        >
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
              <Icon name="X" size={20} color={"#000"} />
            </View>
          </Pressable>
        </Animated.View>

        <Animated.View
          style={[
            styles.heroContent,
            {
              paddingTop: insets.top + SP.sm,
              paddingHorizontal: SP.lg,
            },
          ]}
        >
          <Animated.View style={[styles.heroAvatarWrap, heroImageRevealStyle]}>
            {avatarUri ? (
              <Animated.Image
                source={{ uri: avatarUri }}
                onError={() => {
                  if (homeAvatar?.onErrorSrc)
                    setAvatarUri(homeAvatar.onErrorSrc);
                }}
                style={[styles.heroAvatarImg, heroAvatarRevealStyle]}
                // contentFit="cover"
                accessibilityLabel="Avatar"
              />
            ) : (
              <LinearGradient
                colors={[
                  surfaces.accent,
                  mixHex(surfaces.accent, QUIZ_HOME_YELLOW, 0.35),
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroAvatarFallback}
              >
                <Text style={styles.avatarFallbackText}>{name.charAt(0)}</Text>
              </LinearGradient>
            )}
          </Animated.View>

          <Animated.Text
            style={[
              styles.name,
              { color: heroFg.primary },
              heroNameRevealStyle,
            ]}
          >
            {name}
          </Animated.Text>

          <Animated.View
            style={[
              styles.quizTopRow,
              { marginTop: SP.sm },
              heroQuizTopRowRevealStyle,
            ]}
          >
            <Animated.View style={[{ width: 50 }, heroQuizLeftRevealStyle]} />
            <View style={styles.quizTopMid}>
              <View style={styles.quizLvlLblRow}>
                <Text style={[styles.quizLvlBold, { color: heroFg.primary }]}>
                  Mi Nivel {progress.level}
                </Text>
                <Text style={[styles.quizLvlSubl, { color: heroFg.muted }]}>
                  {levelSubText}
                </Text>
              </View>
              <View
                style={[
                  styles.quizLvlBar,
                  {
                    borderColor: mixHex(heroFg.primary, surfaces.accent, 0.45),
                    borderWidth: 1,
                    backgroundColor: mixHex(
                      heroFg.primary,
                      surfaces.accent,
                      0.9,
                    ),
                  },
                ]}
              >
                <LinearGradient
                  colors={[
                    mixHex(heroFg.primary, surfaces.accent, 0.45),
                    mixHex(heroFg.primary, surfaces.accent, 0.15),
                    QUIZ_HOME_YELLOW,
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.quizLvlFill, { width: `${barPct}%` }]}
                />
              </View>
            </View>
            <View
              style={[
                styles.quizXpPill,
                {
                  backgroundColor: mixHex(
                    heroFg.primary,
                    surfaces.accent,
                    0.28,
                  ),
                  borderColor: mixHex(
                    heroFg.primary,
                    surfaces.borderStrong,
                    0.45,
                  ),
                  borderWidth: 1,
                },
              ]}
            >
              <Text style={[styles.quizXpNum, { color: heroFg.primary }]}>
                {progress.totalXp}
              </Text>
              <Text style={[styles.quizXpLbl, { color: streakFlameColor }]}>
                XP
              </Text>
            </View>
          </Animated.View>
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
        <Pressable
          style={[
            styles.streakCard,
            // { backgroundColor: mixHex(headerYellow, surfaces.card, 0.85) },
            {
              backgroundColor: mixHex(heroFg.primary, surfaces.accent, 0.28),
              borderColor: mixHex(heroFg.primary, surfaces.borderStrong, 0.45),
              borderWidth: 1,
            },
          ]}
          disabled
        >
          <StaggerEnter
            index={0}
            delayOffsetMs={SHEET_STAGGER_DELAY_OFFSET_MS}
            style={styles.streakLeft}
          >
            <Text style={[styles.streakSmall, { color: "#3d3d3d" }]}>
              Tu racha
            </Text>
            <Text style={[styles.streakBig, { color: "#1a1520" }]}>
              {streakDays} día{streakDays === 1 ? "" : "s"}
            </Text>
          </StaggerEnter>
          <StaggerEnter
            index={1}
            delayOffsetMs={SHEET_STAGGER_DELAY_OFFSET_MS}
            style={styles.streakRight}
          >
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
            {/* <Icon name="ChevronRight" size={20} color="#1a152099" /> */}
          </StaggerEnter>
        </Pressable>

        <View style={styles.statRow}>
          <StaggerEnter
            index={2}
            delayOffsetMs={SHEET_STAGGER_DELAY_OFFSET_MS}
            style={styles.statCardWrap}
          >
            <View
              style={[
                styles.statCard,
                {
                  borderColor: surfaces.borderStrong,
                  backgroundColor: surfaces.base,
                },
              ]}
            >
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: surfaces.accentSoft },
                ]}
              >
                <Animation
                  backgroundColor="transparent"
                  source={trophyLottieSource}
                  loop
                  size={{ width: 30, height: 30 }}
                  colorFilters={trophyLottieColorFilters}
                />
              </View>
              <Text style={[styles.statLbl, { color: surfaces.muted }]}>
                Nivel
              </Text>
              <Text style={[styles.statVal, { color: surfaces.text }]}>
                {tier}
              </Text>
            </View>
          </StaggerEnter>
          <StaggerEnter
            index={3}
            delayOffsetMs={SHEET_STAGGER_DELAY_OFFSET_MS}
            style={styles.statCardWrap}
          >
            <View
              style={[
                styles.statCard,
                {
                  borderColor: surfaces.borderStrong,
                  backgroundColor: surfaces.base,
                },
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
              <Text style={[styles.statLbl, { color: surfaces.muted }]}>
                Puntos
              </Text>
              <Text style={[styles.statVal, { color: surfaces.text }]}>
                {progress.totalXp}
              </Text>
            </View>
          </StaggerEnter>
        </View>

        <StaggerEnter index={4} delayOffsetMs={SHEET_STAGGER_DELAY_OFFSET_MS}>
          <Text style={[styles.sectionTitle, { color: surfaces.text }]}>
            Progreso de nivel
          </Text>
        </StaggerEnter>
        <StaggerEnter index={5} delayOffsetMs={SHEET_STAGGER_DELAY_OFFSET_MS}>
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
        </StaggerEnter>

        <View style={styles.badgesBlock}>
          <StaggerEnter index={6} delayOffsetMs={SHEET_STAGGER_DELAY_OFFSET_MS}>
            <View style={styles.badgesHead}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: surfaces.text, marginBottom: 0 },
                ]}
              >
                Mis insignias
              </Text>
              <Pressable disabled>
                <Text style={[styles.seeAll, { color: surfaces.muted }]}>
                  Ver todas
                </Text>
              </Pressable>
            </View>
          </StaggerEnter>
          {badgesUnlocked.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.badgesRow}
            >
              {badgesUnlocked.map((b, i) => (
                <StaggerEnter
                  key={b.id}
                  index={badgeStagger.unlockedRowStart + i}
                  delayOffsetMs={SHEET_STAGGER_DELAY_OFFSET_MS}
                >
                  <QuizBadgeItem surfaces={surfaces} state={b} />
                </StaggerEnter>
              ))}
            </ScrollView>
          ) : (
            <StaggerEnter
              index={badgeStagger.unlockedRowStart}
              delayOffsetMs={SHEET_STAGGER_DELAY_OFFSET_MS}
            >
              <Text style={[styles.badgesEmpty, { color: surfaces.muted }]}>
                Aún no tienes insignias desbloqueadas.
              </Text>
            </StaggerEnter>
          )}
        </View>

        {badgesLocked.length > 0 ? (
          <View style={styles.badgesBlock}>
            <StaggerEnter
              index={badgeStagger.lockedHeaderIndex}
              delayOffsetMs={SHEET_STAGGER_DELAY_OFFSET_MS}
            >
              <View style={styles.badgesHead}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: surfaces.text, marginBottom: 0 },
                  ]}
                >
                  Insignias bloqueadas
                </Text>
              </View>
            </StaggerEnter>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.badgesRow}
            >
              {badgesLocked.map((b, i) => (
                <StaggerEnter
                  key={b.id}
                  index={badgeStagger.lockedRowStart + i}
                  delayOffsetMs={SHEET_STAGGER_DELAY_OFFSET_MS}
                >
                  <QuizBadgeItem surfaces={surfaces} state={b} />
                </StaggerEnter>
              ))}
            </ScrollView>
          </View>
        ) : null}
      </Animated.View>
      {/* <View style={{ height: SP.xl }} /> */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1, alignSelf: "stretch" },
  scrollContent: { paddingBottom: SP.lg },
  hero: {
    position: "relative",
    borderBottomWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  heroBg: {
    ...StyleSheet.absoluteFillObject,
    transformOrigin: "top",
  },
  heroContent: {
    position: "relative",
    zIndex: 1,
    alignItems: "center",
    alignSelf: "stretch",
    paddingBottom: SP.xl + 6,
  },
  heroAvatarWrap: {
    marginBottom: SP.sm,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "#ddd",
  },
  heroAvatarImg: {
    width: 88,
    height: 88,
    borderRadius: 999,
  },
  heroAvatarFallback: {
    width: 88,
    height: 88,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  quizTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    alignSelf: "stretch",
  },
  quizTopMid: {
    flex: 1,
    minWidth: 0,
  },
  quizLvlLblRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
    gap: 4,
  },
  quizLvlBold: {
    fontSize: 11,
    fontWeight: "800",
    lineHeight: 14,
  },
  quizLvlSubl: {
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 14,
  },
  quizLvlBar: {
    height: 9,
    borderRadius: 99,
    overflow: "hidden",
  },
  quizLvlFill: {
    height: "100%",
    borderRadius: 99,
  },
  quizXpPill: {
    flexShrink: 0,
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 11,
    borderRadius: 16,
    borderWidth: 1,
  },
  quizXpNum: {
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  quizXpLbl: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6,
    marginTop: 1,
  },
  heroCloseBtn: {
    position: "absolute",
    zIndex: 3,
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
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: SP.lg,
    paddingTop: SP.lg,
    paddingBottom: SP.md,
    // elevation: 4,
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
  streakBig: {
    fontSize: 20,
    fontWeight: "900",
    marginTop: 2,
    letterSpacing: -0.4,
  },
  streakRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  statRow: {
    flexDirection: "row",
    gap: SP.sm,
    marginBottom: SP.lg,
  },
  statCardWrap: {
    flex: 1,
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
