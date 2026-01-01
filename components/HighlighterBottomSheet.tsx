import React from "react";
import { StyleSheet } from "react-native";
import { modalState$ } from "@/state/modalState";
import { useMyTheme } from "@/context/ThemeContext";
import { TTheme } from "@/types";
import BottomSheet from "@gorhom/bottom-sheet";
import { use$ } from "@legendapp/state/react";
import WebviewHighlighter from "./home/content/WebviewHighlighter";
import { View } from "./Themed";
import useBackHandler from "@/hooks/useBackHandler";

const HighlighterBottomSheet = () => {
    const { theme } = useMyTheme();
    const styles = getStyles(theme);
    const isOpen = use$(() => modalState$.isHighlighterOpen.get());

    useBackHandler("BottomSheet", isOpen, () => {
        modalState$.isHighlighterOpen.set(false);
    });

    return (
        <BottomSheet
            ref={modalState$.highlighterRef.get()}
            index={-1}
            snapPoints={["30%"]}
            backgroundStyle={{
                ...styles.bottomSheet,
                backgroundColor: theme.colors.background,
            }}
            enablePanDownToClose
            handleIndicatorStyle={{ backgroundColor: theme.colors.notification }}
            enableDynamicSizing={false}
            onClose={() => {
                modalState$.isHighlighterOpen.set(false);
            }}
        >
            <View
                style={styles.webviewWrapper}
                onLayout={() => {
                    modalState$.highlighterRef.current?.snapToIndex(0);
                }}
            >
                <WebviewHighlighter theme={theme} />
            </View>
        </BottomSheet>
    );
};

const getStyles = ({ colors }: TTheme) =>
    StyleSheet.create({
        bottomSheet: {
            backgroundColor: colors.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
        },
        webviewWrapper: {
            flex: 1,
            minWidth: "100%",
            backgroundColor: "transparent",
        },
    });

export default HighlighterBottomSheet;
