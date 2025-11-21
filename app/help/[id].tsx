import React, { useState } from "react";
import {
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Text, View } from "@/components/Themed";
import Icon from "@/components/Icon";
import { useMyTheme } from "@/context/ThemeContext";
import { HELP_GUIDES, IHelpGuide } from "@/constants/helpGuides";
import { singleScreenHeader } from "@/components/common/singleScreenHeader";

const { width } = Dimensions.get("window");

export default function GuideViewerScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useMyTheme();
  const styles = getStyles(theme);
  
  const guide = HELP_GUIDES.find((g) => g.id === id) as IHelpGuide;
  const [currentStep, setCurrentStep] = useState(0);

  if (!guide) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Guía no encontrada</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.button}>
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const totalSteps = guide.steps.length;
  const step = guide.steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  const handleNext = () => {
    if (isLastStep) {
      if (guide.link) {
        // @ts-ignore
        router.push(guide.link);
      } else {
        router.back();
      }
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen
        options={singleScreenHeader({
          theme,
          title: guide.title,
          titleIcon: guide.icon,
        })}
      />

      <View style={styles.contentContainer}>
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          {guide.steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                {
                  backgroundColor:
                    index === currentStep
                      ? guide.color
                      : theme.colors.text + "30",
                  width: index === currentStep ? 20 : 8,
                },
              ]}
            />
          ))}
        </View>

        {/* Main Content */}
        <View style={styles.cardContainer}>
            <View style={[styles.iconCircle, { backgroundColor: guide.color + "20" }]}>
                <Icon name={step.icon} size={80} color={guide.color} />
            </View>
            
            <Text style={[styles.stepTitle, { color: guide.color }]}>
                Paso {currentStep + 1}
            </Text>
            
            <Text style={styles.stepText}>{step.text}</Text>
            
            {step.description && (
                <Text style={styles.stepDescription}>{step.description}</Text>
            )}
        </View>

        {/* Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[styles.navButton, isFirstStep && styles.disabledButton]}
            onPress={handlePrev}
            disabled={isFirstStep}
          >
            <Icon name="ArrowLeft" size={24} color={isFirstStep ? theme.colors.text + "50" : theme.colors.text} />
            <Text style={[styles.navText, isFirstStep && { color: theme.colors.text + "50" }]}>Anterior</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: guide.color }]}
            onPress={handleNext}
          >
            <Text style={styles.actionButtonText}>
              {isLastStep ? (guide.link ? "¡Probar ahora!" : "¡Listo!") : "Siguiente"}
            </Text>
            {!isLastStep && <Icon name="ArrowRight" size={20} color="#FFF" />}
            {isLastStep && <Icon name={guide.link ? "ExternalLink" : "Check"} size={20} color="#FFF" />}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const getStyles = ({ colors }: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    contentContainer: {
      flex: 1,
      padding: 20,
      justifyContent: "space-between",
    },
    progressContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
      marginTop: 10,
    },
    progressDot: {
      height: 8,
      borderRadius: 4,
      marginHorizontal: 4,
    },
    cardContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      backgroundColor: colors.card || colors.background,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border || colors.text + "10",
      maxHeight: "65%",
    },
    iconCircle: {
      width: 140,
      height: 140,
      borderRadius: 70,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
    },
    stepTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 10,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    stepText: {
      fontSize: 28,
      fontWeight: "bold",
      color: colors.text,
      textAlign: "center",
      marginBottom: 15,
    },
    stepDescription: {
      fontSize: 18,
      color: colors.text,
      textAlign: "center",
      opacity: 0.8,
      lineHeight: 24,
    },
    controlsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 20,
      paddingHorizontal: 10,
    },
    navButton: {
      flexDirection: "row",
      alignItems: "center",
      padding: 15,
    },
    disabledButton: {
      opacity: 0.5,
    },
    navText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginLeft: 5,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 25,
      borderRadius: 30,
      elevation: 3,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
    },
    actionButtonText: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#FFF",
      marginRight: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        textAlign: 'center',
        marginTop: 50,
    },
    button: {
        marginTop: 20,
        padding: 15,
        backgroundColor: colors.notification,
        borderRadius: 10,
        alignSelf: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    }
  });
