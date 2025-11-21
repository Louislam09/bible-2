import React, { useState, useRef, useCallback } from "react";
import { View, StyleSheet, FlatList, ViewToken } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from "react-native-reanimated";
import OnboardingItem from "@/components/animations/onboarding/OnboardingItem";
import Paginator from "@/components/animations/onboarding/Paginator";
import NextButton from "@/components/animations/onboarding/NextButton";
import { ONBOARDING_DATA, OnboardingSlide } from "@/components/animations/onboarding/data";
import { useMyTheme } from "@/context/ThemeContext";
import { useRouter } from "expo-router";
import { storedData$ } from "@/context/LocalstoreContext";

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export default function IntroScreen() {
  const { theme } = useMyTheme();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const x = useSharedValue(0);
  const slidesRef = useRef<FlatList>(null);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      x.value = event.contentOffset.x;
    },
  });

  const viewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0] && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = async () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      // Finish onboarding
      await storedData$.isOnboardingCompleted.set(true);
      router.replace("/(dashboard)");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={{ flex: 3 }}>
        <AnimatedFlatList
          data={ONBOARDING_DATA}
          renderItem={({ item, index }: any) => (
            <OnboardingItem item={item as OnboardingSlide} index={index} x={x} />
          )}
          keyExtractor={(item: any) => item.id}
          scrollEventThrottle={32}
          onScroll={scrollHandler}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
        />
      </View>

      <Paginator data={ONBOARDING_DATA} x={x} color={ONBOARDING_DATA[currentIndex]?.color} />

      <View style={styles.footer}>
        <NextButton
          scrollTo={scrollTo}
          percentage={(currentIndex + 1) * (100 / ONBOARDING_DATA.length)}
          color={ONBOARDING_DATA[currentIndex]?.color}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

