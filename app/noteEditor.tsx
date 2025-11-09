import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import StandaloneLexicalWebView from "@/components/StandaloneLexicalWebView";
import { View } from "@/components/Themed";
import { useMyTheme } from "@/context/ThemeContext";
import { TTheme } from "@/types";
import { Stack } from "expo-router";
import React, { useMemo } from "react";
import {
    StyleSheet
} from "react-native";


const NoteEditorScreen = () => {
    const { theme } = useMyTheme();
    const styles = getStyles(theme);

    const screenOptions: any = useMemo(() => {
        return {
            theme,
            title: "Editor de Notas",
            titleIcon: "NotebookTabs",
            headerRightProps: {
                headerRightIconColor: theme.colors.text,
            },
        };
    }, [theme.colors]);

    const initialContent = {
        // htmlString: "<h1>Hola soy Luis</h1>",
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={singleScreenHeader(screenOptions)} />
            <StandaloneLexicalWebView
                initialTitle=""
                initialContent={JSON.stringify(initialContent)}
                onContentChange={(content) => { }}
                onTitleChange={(title) => console.log('Title:', title)}
                placeholder="Escribe tu nota..."
            />
        </View>
    );
};

const getStyles = ({ colors }: TTheme) =>
    StyleSheet.create({
        container: {
            flex: 1,
        },
        imageContainer: {
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 15,
            padding: 5,
            backgroundColor: "transparent",
            marginBottom: 20,
        },
        title: {
            fontSize: 24,
            fontWeight: "bold",
            color: colors.notification,
            marginTop: 10,
        },
        optionContainer: {
            flex: 1,
            width: "100%",
            backgroundColor: "transparent",
            minHeight: 390,
        },
        card: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            padding: 10,
            borderRadius: 15,
            elevation: 5,
            flex: 1,
            height: 150,
            margin: 5,
            backgroundColor: "white",
        },
        separator: {
            margin: 10,
        },
        cardLabel: {
            textAlign: "center",
            color: colors.border,
            fontWeight: "bold",
            fontSize: 18,
        },
        cardIcon: {
            color: colors.notification,
            fontSize: 40,
        },
        text: {
            color: "white",
        },
        subtitle: {
            fontSize: 20,
            color: colors.notification,
            marginTop: 10,
            textAlign: "center",
        },
    });

export default NoteEditorScreen;
