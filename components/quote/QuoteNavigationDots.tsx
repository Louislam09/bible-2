import { TTheme } from "@/types";
import { useTheme } from "@/context/ThemeContext";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface QuoteNavigationDotsProps {
  currentIndex: number;
  totalTemplates: number;
  customMode: boolean;
  onDotPress: (index: number) => void;
  scrollViewRef: React.RefObject<ScrollView>;
}

export const QuoteNavigationDots: React.FC<QuoteNavigationDotsProps> = ({
  currentIndex,
  totalTemplates,
  customMode,
  onDotPress,
  scrollViewRef,
}) => {
  const { theme } = useTheme();
  const dotAnimations = useRef<Animated.Value[]>([]);

  // Initialize animations for each dot
  useEffect(() => {
    dotAnimations.current = getVisibleDots().map(() => new Animated.Value(1));
  }, [totalTemplates]);

  // Wave animation when currentIndex changes
  useEffect(() => {
    const waveAnimation = () => {
      const animations = dotAnimations.current.map((anim, index) => {
        return Animated.sequence([
          Animated.delay(index * 100), // Delay each dot by 100ms
          Animated.spring(anim, {
            toValue: 1.3,
            useNativeDriver: true,
            damping: 8,
            mass: 0.5,
            stiffness: 200,
          }),
          Animated.spring(anim, {
            toValue: 1,
            useNativeDriver: true,
            damping: 8,
            mass: 0.5,
            stiffness: 200,
          }),
        ]);
      });

      Animated.parallel(animations).start();
    };

    waveAnimation();
  }, [currentIndex]);

  const getVisibleDots = () => {
    const totalDots = totalTemplates + 1;
    const visibleDots = [];
    const maxDots = 3;
    let start = Math.max(0, currentIndex - Math.floor(maxDots / 2));
    let end = Math.min(totalDots - 1, start + maxDots - 1);

    if (end - start + 1 < maxDots) {
      start = Math.max(0, end - maxDots + 1);
    }

    if (start === 0 && end < maxDots - 1) {
      end = maxDots - 1;
    }

    if (end === totalDots - 1 && start > totalDots - maxDots) {
      start = totalDots - maxDots;
    }

    for (let i = start; i <= end; i++) {
      visibleDots.push(i);
    }
    return visibleDots;
  };

  const visibleDotIndices = getVisibleDots();

  return (
    <View style={[styles.container, { bottom: 50 }]}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dotsContainer}
      >
        {visibleDotIndices.map((index, dotIndex) => {
          const isDotActive =
            currentIndex === index || (customMode && index === totalTemplates);

          const scale =
            dotAnimations.current[dotIndex] || new Animated.Value(1);

          return (
            <Animated.View
              key={index}
              style={[
                styles.dotWrapper,
                {
                  transform: [{ scale }],
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.dot,
                  isDotActive ? styles.activeDot : styles.inactiveDot,
                  {
                    backgroundColor: isDotActive
                      ? theme.colors.notification
                      : theme.colors.border,
                  },
                ]}
                onPress={() => onDotPress(index)}
                activeOpacity={0.7}
              />
            </Animated.View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 3333,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dotWrapper: {
    marginHorizontal: 6,
  },
  dot: {
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "transparent",
  },
  activeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  inactiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.7,
  },
});
