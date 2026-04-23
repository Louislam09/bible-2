import Icon from "@/components/Icon";
import { SP, type QuizSurfaces } from "@/components/quizHistory/quizHistoryTokens";
import {
  formatQuizBadgeUnlockedAtLabel,
  type QuizBadgeState,
} from "@/utils/quizBadges";
import { mixHex } from "@/utils/quizBookPalette";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const BADGE_ITEM_WIDTH = 124;

type Props = {
  surfaces: QuizSurfaces;
  state: QuizBadgeState;
};

export function QuizBadgeItem({ surfaces, state }: Props) {
  const {
    unlocked,
    label,
    emoji,
    color,
    progress,
    progressLabel,
    requirementSummary,
    unlockedAtIso,
  } = state;
  const unlockedDateLabel =
    unlocked && unlockedAtIso ? formatQuizBadgeUnlockedAtLabel(unlockedAtIso) : "";

  return (
    <View
      style={styles.badgeItem}
      accessibilityRole="text"
      accessibilityLabel={
        unlocked
          ? `${label}, insignia desbloqueada${unlockedDateLabel ? `. ${unlockedDateLabel}` : ""}`
          : `${label}, bloqueada. ${requirementSummary}`
      }
    >
      <View style={styles.emojiWrap}>
        <Text style={[styles.badgeEmoji, !unlocked && styles.badgeEmojiLocked]}>
          {emoji}
        </Text>
        {!unlocked ? (
          <View style={styles.lockOverlay} pointerEvents="none">
            <View style={styles.lockCircle}>
              <Icon name="Lock" size={22} color="#f8fafc" strokeWidth={2.2} />
            </View>
          </View>
        ) : null}
      </View>

      {!unlocked ? (
        <View style={[styles.progressTrack, { backgroundColor: surfaces.borderStrong }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.round(progress * 100)}%`,
                backgroundColor: mixHex(surfaces.accent, color, 0.35),
              },
            ]}
          />
        </View>
      ) : null}

      <Text style={[styles.badgeLbl, { color: surfaces.text }]} numberOfLines={2}>
        {label}
      </Text>
      {unlocked && unlockedDateLabel ? (
        <Text style={[styles.unlockedMeta, { color: surfaces.muted }]} numberOfLines={2}>
          {unlockedDateLabel}
        </Text>
      ) : null}
      {!unlocked ? (
        <>
          <Text style={[styles.hint, { color: surfaces.muted }]} numberOfLines={2}>
            {requirementSummary}
          </Text>
          <Text style={[styles.progressLbl, { color: surfaces.softText }]}>
            {progressLabel}
          </Text>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  badgeItem: {
    width: BADGE_ITEM_WIDTH,
    alignItems: "center",
    gap: 4,
  },
  emojiWrap: {
    width: "100%",
    minHeight: 72,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeEmoji: { fontSize: 52, lineHeight: 60 },
  badgeEmojiLocked: { opacity: 0.28 },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15, 23, 42, 0.22)",
    borderRadius: 16,
  },
  lockCircle: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  progressTrack: {
    width: "100%",
    height: 4,
    borderRadius: 99,
    overflow: "hidden",
    marginTop: 2,
  },
  progressFill: {
    height: "100%",
    borderRadius: 99,
    minWidth: 4,
  },
  badgeLbl: {
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 16,
    marginTop: SP.xs,
  },
  hint: {
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 14,
    marginTop: 2,
  },
  progressLbl: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 2,
  },
  unlockedMeta: {
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 13,
    marginTop: 2,
  },
});
