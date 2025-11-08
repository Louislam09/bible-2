import { singleScreenHeader, SingleScreenHeaderProps } from "@/components/common/singleScreenHeader";
import LexicalRichTextEditor from "@/components/LexicalRichTextEditor";
import StandaloneLexicalWebView from "@/components/StandaloneLexicalWebView";
import { Text, View } from "@/components/Themed";
import { useMyTheme } from "@/context/ThemeContext";
import { TTheme } from "@/types";
import { Stack, useNavigation } from "expo-router";
import React, { useMemo } from "react";
import {
    StyleSheet
} from "react-native";


const NoteEditorScreen = () => {
    const { theme } = useMyTheme();
    const styles = getStyles(theme);
    const navigation = useNavigation();

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

    return (
        <View style={styles.container}>
            <Stack.Screen options={singleScreenHeader(screenOptions)} />
            <StandaloneLexicalWebView
                initialTitle="My Note"
                initialContent=""
                onContentChange={(content) => console.log('Content:', content)}
                onTitleChange={(title) => console.log('Title:', title)}
                placeholder="Start writing..."
            />
        </View>
    );
};

const getStyles = ({ colors }: TTheme) =>
    StyleSheet.create({
        container: {
            paddingTop: 50,
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
