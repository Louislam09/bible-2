import Icon from "@/components/Icon";
import { SP, type QuizSurfaces } from "@/components/quizHistory/quizHistoryTokens";
import {
  QUIZ_HISTORY_FLAME_PATH,
  type QuizHistoryHomeUserAvatar,
} from "@/constants/quizHistoryWebViewHtml";
import type { ChapterQuizProgress } from "@/utils/chapterQuizProgress";
import { mixHex } from "@/utils/quizBookPalette";
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
import Svg, { Path } from "react-native-svg";

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

const BADGE_PLACEHOLDERS = [
  { key: "1", label: "Superestrella", color: "#eab308", emoji: "⭐" },
  { key: "2", label: "Campeón quiz", color: "#3b82f6", emoji: "🏆" },
  { key: "3", label: "Mente ágil", color: "#ef4444", emoji: "🧠" },
  { key: "4", label: "Explorador", color: "#a855f7", emoji: "🔭" },
] as const;

export const QuizHistoryProfilePanel: React.FC<{
  surfaces: QuizSurfaces;
  user: pbUser | null | undefined;
  homeAvatar: QuizHistoryHomeUserAvatar | null;
  progress: ChapterQuizProgress;
  streakDays: number;
  onClose: () => void;
}> = ({ surfaces, user, homeAvatar, progress, streakDays, onClose }) => {
  const insets = useSafeAreaInsets();
  const name = useMemo(() => displayName(user), [user]);
  const handle = useMemo(() => displayHandle(user), [user]);
  const [avatarUri, setAvatarUri] = useState(homeAvatar?.src ?? "");
  useEffect(() => {
    setAvatarUri(homeAvatar?.src ?? "");
  }, [homeAvatar?.src]);
  const tier = levelTierLabel(progress.level);
  const barPct = progress.isMaxLevel
    ? 100
    : Math.max(0, Math.min(100, progress.levelProgressPercent));
  const headerYellow = QUIZ_HOME_YELLOW;
  const headerYellowDeep = mixHex("#92400e", headerYellow, 0.22);
  const barFill = surfaces.accent;
  const streakFlameColor = mixHex(QUIZ_HOME_YELLOW, "#ea580c", 0.58);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={[
          styles.hero,
          {
            backgroundColor: headerYellow,
            borderBottomColor: mixHex(headerYellowDeep, headerYellow, 0.35),
            paddingTop: insets.top + SP.sm,
          },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cerrar perfil"
          onPress={() => {
            void Haptics.selectionAsync();
            onClose();
          }}
          style={[
            styles.heroCloseBtn,
            { top: insets.top + 6, right: SP.lg },
          ]}
          hitSlop={14}
        >
          <View style={styles.heroCloseCircle}>
            <Icon name="X" size={20} color="#1a1520" />
          </View>
        </Pressable>
        <View style={styles.avatarWrap}>
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
        </View>
        <Text style={[styles.name, { color: "#1a1520" }]}>{name}</Text>
        <Text style={[styles.handle, { color: "#3d3d3d" }]}>{handle}</Text>

        <View style={styles.miniBarRow}>
          <Text style={[styles.miniBarLbl, { color: "#3d3d3d" }]}>
            Progreso de nivel
          </Text>
          <View style={styles.miniXp}>
            <Icon name="Star" size={14} color={mixHex("#92400e", headerYellow, 0.55)} />
            <Text style={[styles.miniXpText, styles.miniXpTextGap, { color: "#1a1520" }]}>
              {progress.totalXp} XP
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.miniTrack,
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
        </View>
      </View>

      <View
        style={[
          styles.sheet,
          {
            backgroundColor: surfaces.card,
            marginTop: -22,
            shadowColor: "#000",
          },
        ]}
      >
        <Pressable
          style={[
            styles.streakCard,
            { backgroundColor: mixHex(headerYellow, surfaces.card, 0.55) },
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

        <View style={styles.badgesHead}>
          <Text style={[styles.sectionTitle, { color: surfaces.text, marginBottom: 0 }]}>
            Mis insignias
          </Text>
          <Pressable disabled>
            <Text style={[styles.seeAll, { color: surfaces.muted }]}>Ver todas</Text>
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.badgesRow}
        >
          {BADGE_PLACEHOLDERS.map((b) => (
            <View key={b.key} style={styles.badgeItem}>
              <View
                style={[
                  styles.badgeHex,
                  { backgroundColor: b.color },
                ]}
              >
                <Text style={styles.badgeEmoji}>{b.emoji}</Text>
              </View>
              <Text
                style={[styles.badgeLbl, { color: surfaces.muted }]}
                numberOfLines={2}
              >
                {b.label}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
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
  badgesHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SP.sm,
  },
  seeAll: { fontSize: 13, fontWeight: "600" },
  badgesRow: {
    gap: SP.md,
    paddingBottom: SP.sm,
  },
  badgeItem: {
    width: 88,
    alignItems: "center",
    gap: 8,
  },
  badgeHex: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "0deg" }],
  },
  badgeEmoji: { fontSize: 28 },
  badgeLbl: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 14,
  },
});
