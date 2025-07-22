import { TTheme } from "@/types";
import React from "react";
import {
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";
import { Text } from "../Themed";


const AiErrorAlert: React.FC<{
    theme: TTheme;
    fontSize: number;
    error: string;
    onConfigAi: () => void;
}> = ({ theme, fontSize, error, onConfigAi }) => {
    return (
        <View style={getErrorStyles(theme).container}>
            <Text style={getErrorStyles(theme).icon}>⚠️</Text>
            <Text style={[getErrorStyles(theme).title, { fontSize: fontSize * 1.1 }]}>
                Error al obtener explicación
            </Text>
            <Text
                style={[getErrorStyles(theme).message, { fontSize: fontSize * 0.9 }]}
            >
                {error}
            </Text>
            <TouchableOpacity
                style={getErrorStyles(theme).retryButton}
                onPress={onConfigAi}
            >
                <Text
                    style={[
                        getErrorStyles(theme).retryText,
                        { fontSize: fontSize * 0.9 },
                    ]}
                >
                    Configurar IA
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const getErrorStyles = (theme: TTheme) =>
    StyleSheet.create({
        container: {
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 32,
        },
        icon: {
            fontSize: 48,
            marginBottom: 16,
        },
        title: {
            fontWeight: "600",
            color: "#FF6B6B",
            marginBottom: 12,
            textAlign: "center",
        },
        message: {
            color: theme.colors.text,
            opacity: 0.7,
            textAlign: "center",
            marginBottom: 24,
            paddingHorizontal: 20,
        },
        retryButton: {
            backgroundColor: theme.colors.notification,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 8,
        },
        retryText: {
            color: "white",
            fontWeight: "bold",
        },
    });

export default AiErrorAlert