import { useMyTheme } from "@/context/ThemeContext";
import { TTheme } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { icons } from "lucide-react-native";
import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "./Icon";

const { width } = Dimensions.get("window");

interface ExampleQuestion {
  icon: keyof typeof icons;
  question: string;
  color: string;
}

const BibleEmptyState = ({
  onExamplePress,
}: {
  onExamplePress: (question: string) => void;
}) => {
  const { theme } = useMyTheme();
  const styles = getStyles(theme);

  const exampleQuestions: ExampleQuestion[] = [
    {
      icon: "Heart",
      question: "¿Qué dice la Biblia sobre el amor?",
      color: "#ec407a",
    },
    {
      icon: "Shield",
      question: "¿Cómo encontrar paz en tiempos difíciles?",
      color: "#42a5f5",
    },
    {
      icon: "Star",
      question: "¿Cuál es el propósito de la vida según la Biblia?",
      color: "#ffc107",
    },
    {
      icon: "Leaf",
      question: "¿Qué enseña la Biblia sobre el perdón?",
      color: "#8bc34a",
    },
  ];

  return (
    <View style={styles.container}>
      {/* Main Icon */}
      <View style={styles.iconContainer}>
        <Icon name="BookOpenText" size={80} color={theme.colors.text} />
        <View style={styles.sparkleContainer}>
          <Icon
            name="Sparkles"
            size={24}
            color={theme.colors.notification}
            style={styles.sparkle1}
          />
          <Icon
            name="Sparkles"
            size={16}
            color={theme.colors.notification}
            style={styles.sparkle2}
          />
        </View>
      </View>

      {/* Main Title */}
      <Text style={styles.title}>Explora las Escrituras con IA</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Haz preguntas sobre cualquier tema bíblico y recibe respuestas
        detalladas con versículos relevantes
      </Text>

      {/* Example Questions */}
      <Text style={styles.examplesTitle}>Preguntas de ejemplo:</Text>

      <View style={styles.examplesContainer}>
        {exampleQuestions.map((example, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.exampleCard]}
            onPress={() => onExamplePress(example.question)}
            activeOpacity={0.7}
          >
            <View style={styles.exampleIconContainer}>
              <Icon
                name={example.icon as any}
                size={18}
                color={example.color}
              />
            </View>
            <Text style={styles.exampleQuestion}>{example.question}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 32,
    },
    iconContainer: {
      position: "relative",
      marginBottom: 24,
    },
    sparkleContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    sparkle1: {
      position: "absolute",
      top: -8,
      right: -8,
    },
    sparkle2: {
      position: "absolute",
      bottom: -4,
      left: -8,
    },
    title: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.notification,
      textAlign: "center",
      marginBottom: 12,
    },
    subtitle: {
      fontSize: 16,
      color: colors.text,
      textAlign: "center",
      lineHeight: 22,
      marginBottom: 32,
      maxWidth: width * 0.85,
    },
    featuresContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      width: "100%",
      marginBottom: 32,
      paddingHorizontal: 16,
    },
    feature: {
      alignItems: "center",
      flex: 1,
    },
    featureText: {
      fontSize: 12,
      color: colors.text,
      marginTop: 4,
      textAlign: "center",
    },
    examplesTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 16,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    examplesContainer: {
      flex: 1,
      flexWrap: "wrap",
      flexDirection: "row",
      justifyContent: "center",
      width: "100%",
      gap: 10,
    },
    exampleCard: {
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      maxWidth: width * 0.4,
      minHeight: 100,
      backgroundColor: colors.text + 30,
      borderRadius: 8,
      padding: 16,
      borderWidth: 2,
      borderColor: colors.text + 50,
      shadowColor: colors.background,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    exampleQuestion: {
      fontSize: 16,
      color: colors.text,
      flex: 1,
      lineHeight: 18,
    },
    exampleIconContainer: {
      position: "absolute",
      right: 5,
      bottom: 5,
      width: 24,
      height: 24,
      backgroundColor: "transparent",
      alignItems: "center",
      justifyContent: "center",
    },
  });

export default BibleEmptyState;
