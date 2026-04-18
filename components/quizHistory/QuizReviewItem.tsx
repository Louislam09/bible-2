import React from "react";
import { StyleSheet, View } from "react-native";
import Icon from "@/components/Icon";
import { Text } from "@/components/Themed";
import type { Question } from "@/types";
import {
  RADIUS,
  SP,
  type QuizSurfaces,
} from "./quizHistoryTokens";

type Props = {
  index: number;
  question: Question;
  selected: string | null;
  surfaces: QuizSurfaces;
};

export const QuizReviewItem: React.FC<Props> = ({
  index,
  question,
  selected,
  surfaces,
}) => {
  const correctAnswer = String(question.correct ?? "");
  const isCorrect = selected !== null && selected === correctAnswer;
  const userAnswerLabel = selected ?? "(sin respuesta)";

  return (
    <View
      style={[
        styles.block,
        {
          backgroundColor: surfaces.card,
          borderColor: surfaces.border,
          borderRadius: RADIUS.card,
        },
      ]}
    >
      <View style={styles.head}>
        <View
          style={[
            styles.numChip,
            { backgroundColor: surfaces.accentSoft },
          ]}
        >
          <Text style={[styles.numChipText, { color: surfaces.accent }]}>
            {index + 1}
          </Text>
        </View>
        <Text style={[styles.qText, { color: surfaces.text }]}>
          {question.question}
        </Text>
      </View>

      <AnswerLine
        kind={isCorrect ? "right" : "wrong"}
        label={userAnswerLabel}
        surfaces={surfaces}
      />
      {!isCorrect ? (
        <AnswerLine
          kind="right"
          label={correctAnswer}
          surfaces={surfaces}
        />
      ) : null}

      {question.reference ? (
        <Text style={[styles.meta, { color: surfaces.muted }]}>
          {question.reference}
        </Text>
      ) : null}
      {question.explanation ? (
        <Text style={[styles.explanation, { color: surfaces.muted }]}>
          {question.explanation}
        </Text>
      ) : null}
    </View>
  );
};

const AnswerLine: React.FC<{
  kind: "right" | "wrong";
  label: string;
  surfaces: QuizSurfaces;
}> = ({ kind, label, surfaces }) => {
  const color = kind === "right" ? surfaces.accent : surfaces.fail;
  const iconName = kind === "right" ? "Check" : "X";
  return (
    <View style={styles.ansLine}>
      <Icon name={iconName} size={14} color={color} strokeWidth={2.5} />
      <Text style={[styles.ansText, { color }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  block: {
    marginBottom: SP.md - 2,
    padding: SP.md + 2,
    borderWidth: StyleSheet.hairlineWidth,
  },
  head: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SP.sm + 1,
    marginBottom: SP.sm + 2,
  },
  numChip: {
    minWidth: 22,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  numChipText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  qText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  ansLine: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
    marginVertical: 4,
  },
  ansText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },
  meta: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 6,
    marginLeft: 30,
  },
  explanation: {
    fontSize: 12,
    fontWeight: "400",
    fontStyle: "italic",
    marginTop: 2,
    marginLeft: 30,
    lineHeight: 17,
  },
});
