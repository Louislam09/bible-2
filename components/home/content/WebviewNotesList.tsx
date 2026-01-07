import { View } from "@/components/Themed";
import { notesListHtmlTemplate } from "@/constants/notesListHtmlTemplate";
import { GET_ALL_NOTE } from "@/constants/queries";
import { useDBContext } from "@/context/databaseContext";
import { storedData$ } from "@/context/LocalstoreContext";
import { bibleState$ } from "@/state/bibleState";
import { modalState$ } from "@/state/modalState";
import { TNote, TTheme } from "@/types";
import { createOptimizedWebViewProps } from "@/utils/webViewOptimizations";
import { use$ } from "@legendapp/state/react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator } from "react-native";
import WebView from "react-native-webview";

interface Props {
    theme: TTheme;
}

const WebviewNotesList: React.FC<Props> = ({ theme }) => {
    const webViewRef = useRef<WebView>(null);
    const fontSize = use$(() => storedData$.fontSize.get());
    const { myBibleDB, executeSql } = useDBContext();
    const isOpen = use$(() => modalState$.isNoteListOpen.get());

    const [notes, setNotes] = useState<TNote[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotes = useCallback(async () => {
        if (!myBibleDB || !executeSql) return;

        try {
            setLoading(true);
            const result = await executeSql<TNote>(GET_ALL_NOTE, []);
            setNotes(result || []);
        } catch (error) {
            console.error("Error fetching notes:", error);
        } finally {
            setLoading(false);
        }
    }, [myBibleDB, executeSql]);

    useEffect(() => {
        if (isOpen) {
            fetchNotes();
        }
    }, [isOpen]);

    const htmlTemplate = useMemo(() => {
        return notesListHtmlTemplate({
            theme,
            notes,
            fontSize: 16,
            variant: 'compact',
        });
    }, [theme, notes, fontSize]);

    const handleMessage = useCallback(
        (event: any) => {
            try {
                const message = JSON.parse(event.nativeEvent.data);

                switch (message.type) {
                    case "selectNote":
                        if (message.data?.id !== undefined) {
                            modalState$.closeNoteListBottomSheet();
                            setTimeout(() => {
                                bibleState$.currentNoteId.set(message.data.id);
                            }, 100);
                        }
                        break;
                    case "createNote":
                        modalState$.closeNoteListBottomSheet();
                        setTimeout(() => {
                            bibleState$.currentNoteId.set(-1);
                        }, 100);
                        break;
                }
            } catch (error) {
                console.warn("Error parsing WebView message:", error);
            }
        },
        []
    );

    if (loading) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "transparent",
                }}
            >
                <ActivityIndicator size="large" color={theme.colors.notification} />
            </View>
        );
    }

    return (
        <WebView
            ref={webViewRef}
            key="notes-list-webview"
            originWhitelist={["*"]}
            style={{
                flex: 1,
                minWidth: "100%",
                backgroundColor: "transparent",
            }}
            containerStyle={{
                backgroundColor: "transparent",
            }}
            source={{
                html: htmlTemplate,
            }}
            scrollEnabled={true}
            nestedScrollEnabled={true}
            onMessage={handleMessage}
            renderLoading={() => (
                <View
                    style={{
                        backgroundColor: theme.colors.background,
                        flex: 1,
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 1000,
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                />
            )}
            {...createOptimizedWebViewProps({}, "static")}
        />
    );
};

export default WebviewNotesList;

