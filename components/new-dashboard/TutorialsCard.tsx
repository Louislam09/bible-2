import Icon from "@/components/Icon";
import { TUTORIAL_FEATURES } from "@/constants/tutorialData";
import { useMyTheme } from "@/context/ThemeContext";
import { useTutorial } from "@/context/TutorialContext";
import { TTheme } from "@/types";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type TutorialsCardProps = {
    theme: TTheme;
};

const TutorialsCard: React.FC<TutorialsCardProps> = ({ theme }) => {
    const router = useRouter();
    const { completedTutorials } = useTutorial();
    const scale = useSharedValue(1);
    const styles = getStyles(theme);
    const totalTutorials = TUTORIAL_FEATURES.length;
    const completed = completedTutorials.length;
    const progress = totalTutorials > 0 ? (completed / totalTutorials) * 100 : 0;

    const handlePressIn = () => {
        scale.value = withSpring(0.97, {
            damping: 15,
            stiffness: 300,
        });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, {
            damping: 15,
            stiffness: 300,
        });
    };

    const handlePress = () => {
        router.push("/tutorials");
    };

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });


    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Icon name="GraduationCap" size={20} color={theme.colors.notification} />
                <Text style={styles.headerTitle}>Tutoriales Interactivos</Text>
            </View>

            <AnimatedPressable
                style={[styles.card, animatedStyle]}
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
            >
                <View style={styles.cardContent}>
                    <View style={styles.iconContainer}>
                        <Icon name="BookOpenCheck" size={40} color="#4CAF50" />
                    </View>

                    <View style={styles.textContent}>
                        <Text style={styles.title}>Aprende a usar la app</Text>
                        <Text style={styles.description}>
                            {completed === 0
                                ? "Descubre todas las funcionalidades"
                                : completed === totalTutorials
                                    ? "¡Has completado todos los tutoriales!"
                                    : `${completed} de ${totalTutorials} tutoriales completados`}
                        </Text>

                        {/* Progress Bar */}
                        <View style={styles.progressContainer}>
                            <View style={styles.progressBar}>
                                <Animated.View
                                    style={[
                                        styles.progressFill,
                                        {
                                            width: `${progress}%`,
                                        },
                                    ]}
                                />
                            </View>
                            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
                        </View>
                    </View>

                    <View style={styles.arrow}>
                        <Icon name="ChevronRight" size={24} color={theme.colors.notification} />
                    </View>
                </View>

                {/* Categories Preview */}
                <View style={styles.categoriesContainer}>
                    <CategoryBadge icon="BookOpen" label="Lectura" color="#4CAF50" />
                    <CategoryBadge icon="GraduationCap" label="Estudio" color="#2196F3" />
                    <CategoryBadge icon="Wrench" label="Herramientas" color="#FF9800" />
                    <CategoryBadge icon="Palette" label="Personalización" color="#9C27B0" />
                </View>
            </AnimatedPressable>
        </View>
    );
};

type CategoryBadgeProps = {
    icon: string;
    label: string;
    color: string;
};

const CategoryBadge: React.FC<CategoryBadgeProps> = ({ icon, label, color }) => {
    const { theme } = useMyTheme();
    const styles = getStyles(theme);
    return (
        <View style={[styles.categoryBadge, { backgroundColor: color + "15" }]}>
            <Icon name={icon as any} size={14} color={color} />
            <Text style={[styles.categoryText, { color }]}>{label}</Text>
        </View>
    );
};

const getStyles = ({ colors }: TTheme) =>
    StyleSheet.create({
        container: {
            marginBottom: 20,
        },
        header: {
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
        },
        headerTitle: {
            fontSize: 18,
            fontWeight: "700",
            color: colors.text,
        },
        card: {
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 16,
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
            borderWidth: 1,
            borderColor: colors.border || colors.text + "10",
        },
        cardContent: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
        },
        iconContainer: {
            width: 64,
            height: 64,
            borderRadius: 16,
            backgroundColor: "#4CAF50" + "15",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
        },
        textContent: {
            flex: 1,
        },
        title: {
            fontSize: 16,
            fontWeight: "700",
            color: colors.text,
            marginBottom: 4,
        },
        description: {
            fontSize: 13,
            color: colors.text + "80",
            marginBottom: 8,
        },
        progressContainer: {
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
        },
        progressBar: {
            flex: 1,
            height: 6,
            backgroundColor: colors.background,
            borderRadius: 3,
            overflow: "hidden",
        },
        progressFill: {
            height: "100%",
            backgroundColor: "#4CAF50",
            borderRadius: 3,
        },
        progressText: {
            fontSize: 12,
            fontWeight: "600",
            color: "#4CAF50",
            minWidth: 36,
            textAlign: "right",
        },
        arrow: {
            marginLeft: 8,
        },
        categoriesContainer: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
        },
        categoryBadge: {
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 12,
        },
        categoryText: {
            fontSize: 11,
            fontWeight: "600",
        },
    });

export default TutorialsCard;

