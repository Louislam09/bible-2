import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Icon from "./Icon";
import { useTutorial } from "@/context/TutorialContext";
import { TUTORIAL_FEATURES } from "@/constants/tutorialData";
import { useMyTheme } from "@/context/ThemeContext";

/**
 * StartHomeTutorialButton
 * 
 * A floating help button that can be added to the home screen
 * to let users start the tutorial anytime.
 */

type StartHomeTutorialButtonProps = {
    position?: "top-right" | "bottom-right" | "top-left" | "bottom-left";
    onPress?: () => void;
};

const StartHomeTutorialButton: React.FC<StartHomeTutorialButtonProps> = ({
    position = "bottom-left",
    onPress,
}) => {
    const { theme } = useMyTheme();
    const { startTutorial } = useTutorial();
    const router = useRouter();

    const handlePress = () => {
        const homeTutorial = TUTORIAL_FEATURES.find((t) => t.id === "home-screen-tour");
        if (homeTutorial) {
            startTutorial(homeTutorial);
            if (onPress) onPress();
        }
    };

    const positionStyles = {
        "top-right": { top: 80, right: 16 },
        "bottom-right": { bottom: 100, right: 16 },
        "top-left": { top: 80, left: 16 },
        "bottom-left": { bottom: 100, left: 16 },
    };

    return (
        <Pressable
            style={[
                styles.button,
                positionStyles[position],
                { backgroundColor: theme.colors.notification + "20", borderColor: theme.colors.notification },
            ]}
            onPress={handlePress}
        >
            <Icon name="HandHelping" size={24} color={theme.colors.notification} />
        </Pressable>
    );
};

const styles = StyleSheet.create({
    button: {
        position: "absolute",
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 100,
    },
});

export default StartHomeTutorialButton;

