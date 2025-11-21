import NextButton from "@/components/animations/onboarding/NextButton";
import OnboardingItem from "@/components/animations/onboarding/OnboardingItem";
import Paginator from "@/components/animations/onboarding/Paginator";
import { ONBOARDING_DATA, OnboardingSlide } from "@/components/animations/onboarding/data";
import { storedData$ } from "@/context/LocalstoreContext";
import { useMyTheme } from "@/context/ThemeContext";
import { useRouter, Stack } from "expo-router";
import React, { useRef, useState, useCallback } from "react";
import { FlatList, StyleSheet, View, ViewToken, Animated } from "react-native";
import { useSharedValue, useAnimatedScrollHandler } from "react-native-reanimated";
import AnimatedFlatList = Animated.FlatList; // Use RN Animated for basic FlatList or Reanimated's

// We need to wrap FlatList with Reanimated to use useAnimatedScrollHandler properly
import Reanimated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function OnboardingScreen() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useSharedValue(0);
    const slidesRef = useRef<any>(null); // using any for Reanimated FlatList ref
    const router = useRouter();
    const { theme } = useMyTheme();
    const styles = getStyles(theme);
    const insets = useSafeAreaInsets();
    const safeTop = insets.top;

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollX.value = event.contentOffset.x;
        },
    });

    const viewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems && viewableItems.length > 0 && viewableItems[0].index !== null) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const scrollTo = async () => {
        if (currentIndex < ONBOARDING_DATA.length - 1) {
            slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            // Finish onboarding
            try {
                storedData$.isOnboardingCompleted.set(true);
                router.replace("/(dashboard)");
            } catch (error) {
                console.error("Error finishing onboarding:", error);
            }
        }
    };

    return (
        <View style={[styles.container, { paddingTop: safeTop }]}>
            <Stack.Screen options={{ headerShown: false }} />

            <Paginator data={ONBOARDING_DATA} x={scrollX} color={theme.colors.notification} />
            <View style={styles.contentContainer}>
                <Reanimated.FlatList
                    data={ONBOARDING_DATA}
                    renderItem={({ item, index }) => (
                        <OnboardingItem item={item as OnboardingSlide} index={index} x={scrollX} />
                    )}
                    keyExtractor={(item) => (item as OnboardingSlide).id}
                    onScroll={scrollHandler}
                    scrollEventThrottle={16}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled
                    bounces={false}
                    onViewableItemsChanged={viewableItemsChanged}
                    viewabilityConfig={viewConfig}
                    ref={slidesRef}
                />
            </View>

            <NextButton
                scrollTo={scrollTo}
                percentage={(currentIndex + 1) * (100 / ONBOARDING_DATA.length)}
                color={theme.colors.notification}
            />
        </View>
    );
}

const getStyles = ({ colors }: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
            alignItems: "center",
            justifyContent: "center",
        },
        contentContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
        },
    });

