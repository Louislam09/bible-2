import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from "react-native-reanimated";
import { Stack, useRouter } from "expo-router";
import { useMyTheme } from "@/context/ThemeContext";
import { useTutorial } from "@/context/TutorialContext";
import {
  TUTORIAL_FEATURES,
  TUTORIAL_CATEGORIES,
  TutorialFeature,
} from "@/constants/tutorialData";
import { TutorialCard } from "@/components/animations/tutorial-card";
import Icon from "@/components/Icon";
import { TTheme } from "@/types";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PressableScale } from "@/components/animations/pressable-scale";

type CategoryKey = keyof typeof TUTORIAL_CATEGORIES;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function TutorialsScreen() {
  const { theme } = useMyTheme();
  const router = useRouter();
  const styles = getStyles(theme);
  const inset = useSafeAreaInsets();
  const topInset = inset.top;
  const {
    startTutorial,
    completedTutorials,
    resetTutorialProgress,
  } = useTutorial();

  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | "all">("all");

  const filteredTutorials = useMemo(() => {
    let tutorials = selectedCategory === "all"
      ? TUTORIAL_FEATURES
      : TUTORIAL_FEATURES.filter((t) => t.category === selectedCategory);

    // Sort to show home-screen-tour first
    return tutorials.sort((a, b) => {
      if (a.id === "home-screen-tour") return -1;
      if (b.id === "home-screen-tour") return 1;
      return 0;
    });
  }, [selectedCategory]);

  const progressStats = useMemo(() => {
    const total = TUTORIAL_FEATURES.length;
    const completed = completedTutorials.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    return { total, completed, percentage };
  }, [completedTutorials]);

  const handleTutorialPress = (tutorial: TutorialFeature) => {
    startTutorial(tutorial);

    // Navigate to the appropriate screen for each tutorial
    switch (tutorial.id) {
      case "home-screen-tour":
      case "basic-reading":
      case "split-screen":
      case "verse-selection":
        router.push("/home");
        break;

      case "search-feature":
        router.push("/(search)");
        break;

      case "notes-feature":
        router.push("/notes");
        break;

      case "favorites":
        router.push("/favorite");
        break;

      case "strong-numbers":
        router.push("/home");
        break;

      case "audio-reading":
        router.push("/home");
        break;

      case "hymnal":
        router.push("/song");
        break;

      case "games-quiz":
        router.push("/(game)");
        break;

      case "memory-verses":
        router.push("/memorization/memoryList");
        break;

      case "themes-fonts":
      case "bible-versions":
      case "cloud-sync":
      case "notifications":
        router.push("/settings");
        break;

      default:
        // If no specific screen, stay on current screen
        // The tutorial will show if TutorialWalkthrough is present
        break;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: topInset }]}>
      <Stack.Screen
        options={{
          title: "Tutoriales",
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.text,
          headerShadowVisible: false,
        }}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
                Aprende a usar la app
              </Text>
              <Text style={[styles.headerSubtitle, { color: theme.colors.text + "80" }]}>
                Domina todas las funciones paso a paso
              </Text>
            </View>
            <PressableScale
              onPress={resetTutorialProgress}
              style={[styles.resetButton, { borderColor: theme.colors.notification }]}
            >
              <Icon name="RotateCcw" size={16} color={theme.colors.notification} />
            </PressableScale>
          </View>

          {/* Progress Card */}
          <View style={[styles.progressCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.progressHeader}>
              <Icon name="Award" size={24} color="#4CAF50" />
              <View style={styles.progressInfo}>
                <Text style={[styles.progressTitle, { color: theme.colors.text }]}>
                  Tu Progreso
                </Text>
                <Text style={[styles.progressSubtitle, { color: theme.colors.text + "80" }]}>
                  {progressStats.completed} de {progressStats.total} completados
                </Text>
              </View>
              <Text style={[styles.progressPercentage, { color: "#4CAF50" }]}>
                {Math.round(progressStats.percentage)}%
              </Text>
            </View>
            <View style={[styles.progressBarContainer, { backgroundColor: theme.colors.background }]}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  {
                    backgroundColor: "#4CAF50",
                    width: `${progressStats.percentage}%`,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Category Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          <CategoryChip
            label="Todos"
            icon="Grid3x3"
            isSelected={selectedCategory === "all"}
            onPress={() => setSelectedCategory("all")}
            color={theme.colors.notification}
            theme={theme}
          />
          {Object.entries(TUTORIAL_CATEGORIES).map(([key, category]) => (
            <CategoryChip
              key={key}
              label={category.name}
              icon={category.icon}
              isSelected={selectedCategory === key}
              onPress={() => setSelectedCategory(key as CategoryKey)}
              color={category.color}
              theme={theme}
            />
          ))}
        </ScrollView>

        {/* Tutorials List */}
        <View style={styles.tutorialsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {selectedCategory === "all"
              ? "Todos los tutoriales"
              : TUTORIAL_CATEGORIES[selectedCategory as CategoryKey]?.name || "Tutoriales"}
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.text + "80" }]}>
            {filteredTutorials.length} tutorial{filteredTutorials.length !== 1 ? "es" : ""}
          </Text>
        </View>

        {filteredTutorials.map((tutorial, index) => {
          const isFeatured = tutorial.id === "home-screen-tour";
          return (
            <View key={tutorial.id}>
              {isFeatured && selectedCategory === "all" && (
                <View style={styles.featuredBadge}>
                  <Icon name="Star" size={14} color="#FFD700" />
                  <Text style={styles.featuredText}>Recomendado</Text>
                </View>
              )}
              <TutorialCard
                tutorial={tutorial}
                onPress={() => handleTutorialPress(tutorial)}
                index={index}
                isCompleted={completedTutorials.includes(tutorial.id)}
              />
            </View>
          );
        })}

        {/* Empty State */}
        {filteredTutorials.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="Search" size={64} color={theme.colors.text + "40"} />
            <Text style={[styles.emptyText, { color: theme.colors.text + "80" }]}>
              No hay tutoriales en esta categoría
            </Text>
          </View>
        )}

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}

type CategoryChipProps = {
  label: string;
  icon: string;
  isSelected: boolean;
  onPress: () => void;
  color: string;
  theme: TTheme;
};

const CategoryChip: React.FC<CategoryChipProps> = ({
  label,
  icon,
  isSelected,
  onPress,
  color,
  theme,
}) => {
  const scale = useSharedValue(1);
  const styles = getStyles(theme);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, {
      damping: 10,
      stiffness: 300,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 10,
      stiffness: 300,
    });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.categoryChip,
        animatedStyle,
        {
          backgroundColor: isSelected ? color + "20" : theme.colors.card,
          borderColor: isSelected ? color : theme.colors.border,
        },
      ]}
    >
      <Icon name={icon as any} size={18} color={isSelected ? color : theme.colors.text + "80"} />
      <Text
        style={[
          styles.categoryLabel,
          { color: isSelected ? color : theme.colors.text + "80" },
        ]}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
};

const getStyles = (theme: TTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 32,
    },
    header: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
    },
    headerTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: "800",
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 15,
    },
    resetButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
    },
    resetText: {
      fontSize: 12,
      fontWeight: "600",
    },
    progressCard: {
      padding: 16,
      borderRadius: 16,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    progressHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    progressInfo: {
      flex: 1,
      marginLeft: 12,
    },
    progressTitle: {
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 2,
    },
    progressSubtitle: {
      fontSize: 13,
    },
    progressPercentage: {
      fontSize: 24,
      fontWeight: "800",
    },
    progressBarContainer: {
      height: 8,
      borderRadius: 4,
      overflow: "hidden",
    },
    progressBarFill: {
      height: "100%",
      borderRadius: 4,
    },
    categoriesContainer: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      gap: 8,
    },
    categoryChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      borderWidth: 1,
      marginRight: 8,
    },
    categoryLabel: {
      fontSize: 14,
      fontWeight: "600",
    },
    tutorialsSection: {
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "700",
      marginBottom: 4,
    },
    sectionSubtitle: {
      fontSize: 13,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 64,
    },
    emptyText: {
      fontSize: 16,
      marginTop: 16,
    },
    footer: {
      height: 32,
    },
    featuredBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 16,
      paddingVertical: 4,
      marginBottom: 4,
    },
    featuredText: {
      fontSize: 12,
      fontWeight: "700",
      color: "#FFD700",
    },
  });

