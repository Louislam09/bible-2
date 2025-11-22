import React, { useEffect } from "react";
import { StyleSheet, Pressable, View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { icons } from "lucide-react-native";
import Icon from "../Icon";
import { TutorialFeature, getDifficultyLabel, getDifficultyColor } from "@/constants/tutorialData";
import { useMyTheme } from "@/context/ThemeContext";

type TutorialCardProps = {
  tutorial: TutorialFeature;
  onPress: () => void;
  index: number;
  isCompleted?: boolean;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const TutorialCard: React.FC<TutorialCardProps> = ({
  tutorial,
  onPress,
  index,
  isCompleted = false,
}) => {
  const { theme } = useMyTheme();
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    // Stagger animation based on index
    const delay = index * 100;

    setTimeout(() => {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
      });
      opacity.value = withTiming(1, {
        duration: 400,
      });
      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 150,
      });
    }, delay);
  }, [index]);

  const handlePressIn = () => {
    pressScale.value = withTiming(0.95, {
      duration: 100,
    });
  };

  const handlePressOut = () => {
    pressScale.value = withSpring(1, {
      damping: 10,
      stiffness: 300,
    });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value * pressScale.value },
        { translateY: translateY.value },
      ],
      opacity: opacity.value,
    };
  });

  const iconAnimatedStyle = useAnimatedStyle(() => {
    const alpha = interpolate(pressScale.value, [0.95, 1], [0.6, 1], Extrapolation.CLAMP);
    return {
      opacity: alpha,
    };
  });

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        animatedStyle,
        {
          backgroundColor: theme.colors.card,
          borderColor: tutorial.color + "40",
        },
      ]}
    >
      {/* Completion Badge */}
      {isCompleted && (
        <View style={[styles.completeBadge, { backgroundColor: "#4CAF50" }]}>
          <Icon name="Check" size={12} color="#fff" />
        </View>
      )}

      {/* Icon Container */}
      <Animated.View
        style={[
          styles.iconContainer,
          iconAnimatedStyle,
          { backgroundColor: tutorial.color + "20" },
        ]}
      >
        <Icon name={tutorial.icon} size={32} color={tutorial.color} />
      </Animated.View>

      {/* Content */}
      <View style={styles.content}>
        <Text
          style={[styles.title, { color: theme.colors.text }]}
          numberOfLines={2}
        >
          {tutorial.title}
        </Text>
        <Text
          style={[styles.description, { color: theme.colors.text + "80" }]}
          numberOfLines={2}
        >
          {tutorial.description}
        </Text>

        {/* Meta Info */}
        <View style={styles.metaContainer}>
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(tutorial.difficulty) + "20" },
            ]}
          >
            <Text
              style={[
                styles.difficultyText,
                { color: getDifficultyColor(tutorial.difficulty) },
              ]}
            >
              {getDifficultyLabel(tutorial.difficulty)}
            </Text>
          </View>

          <View style={styles.durationContainer}>
            <Icon name="Clock" size={14} color={theme.colors.text + "60"} />
            <Text style={[styles.durationText, { color: theme.colors.text + "80" }]}>
              {tutorial.duration}
            </Text>
          </View>
        </View>
      </View>

      {/* Arrow Icon */}
      <View style={styles.arrowContainer}>
        <Icon name="ChevronRight" size={20} color={tutorial.color} />
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
  },
  completeBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    marginBottom: 8,
    lineHeight: 18,
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: "600",
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  durationText: {
    fontSize: 12,
  },
  arrowContainer: {
    marginLeft: 8,
  },
});

