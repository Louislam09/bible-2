import Icon from "@/components/Icon";
import { Text } from "@/components/Themed";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { RADIUS, SP, type QuizSurfaces } from "./quizHistoryTokens";

type Props = {
  icon: React.ComponentProps<typeof Icon>["name"];
  label: string;
  onPress: () => void;
  surfaces: QuizSurfaces;
  active?: boolean;
  danger?: boolean;
};

/** Small pill action (same pattern as repaso / review screen). */
export const QuizQuickAction: React.FC<Props> = ({
  icon,
  label,
  onPress,
  surfaces,
  active,
  danger,
}) => {
  const color = danger
    ? surfaces.fail
    : active
      ? surfaces.accent
      : surfaces.muted;
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.pill,
        {
          borderColor: surfaces.border,
          borderRadius: RADIUS.pill,
        },
      ]}
    >
      <Icon
        name={icon}
        size={13}
        color={color}
        fillColor={active ? color : "none"}
      />
      <Text style={[styles.pillText, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
};

export const QuizQuickActionsRow: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <View style={styles.row}>{children}</View>;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SP.sm,
    marginBottom: SP.lg,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: SP.md,
    paddingVertical: SP.sm - 1,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
