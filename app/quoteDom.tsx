import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import Icon from "@/components/Icon";
import DomQuoteCard from "@/components/dom-components/DomQuoteCard";
import { QuoteNavigationDots } from "@/components/quote/QuoteNavigationDots";
import ScreenWithAnimation from "@/components/ScreenWithAnimation";
import { quoteTemplates } from "@/constants/quoteTemplates";
import { useMyTheme } from "@/context/ThemeContext";
import { bibleState$ } from "@/state/bibleState";
import { TTheme } from "@/types";
import { getVerseTextRaw } from "@/utils/getVerseTextRaw";
import { use$ } from "@legendapp/state/react";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Animated, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useQuoteCardStack } from "@/hooks/useQuoteCardStack";
import { Text } from "@/components/Themed";
import ViewShot from "react-native-view-shot";
import { useViewShot } from "@/hooks/useViewShot";

const COLORS = [
    "#2EC4F1",
    "#0288D1",
    "#1976D2",
    "#81C784",
    "#689F38",
    "#AFB42B",
    "#FBC02D",
    "#FFB300",
    "#FF7043",
    "#D84315",
    "#8E24AA",
    "#6A1B9A",
    "#3949AB",
    "#1E88E5",
    "#00897B",
    "#43A047",
    "#388E3C",
    "#C62828",
    "#AD1457",
    "#C2185B",
    "#455A64",
];

type FontType = {
    readonly label: "Aa";
    readonly fontFamily:
    | "System"
    | "serif"
    | "sans-serif"
    | "monospace"
    | "cursive"
    | "fantasy"
    | "emoji";
    readonly fontWeight: "400" | "700";
};

const FONTS: readonly FontType[] = [
    { label: "Aa", fontFamily: "System", fontWeight: "400" },
    { label: "Aa", fontFamily: "serif", fontWeight: "400" },
    { label: "Aa", fontFamily: "sans-serif", fontWeight: "700" },
    { label: "Aa", fontFamily: "monospace", fontWeight: "400" },
    { label: "Aa", fontFamily: "System", fontWeight: "700" },
    { label: "Aa", fontFamily: "cursive", fontWeight: "400" },
    { label: "Aa", fontFamily: "fantasy", fontWeight: "400" },
    { label: "Aa", fontFamily: "emoji", fontWeight: "400" },
] as const;

const FAMOUS_VERSES = [
    { text: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree no se pierda, mas tenga vida eterna.", reference: "Juan 3:16" },
    { text: "Porque para Dios nada hay imposible.", reference: "Lucas 1:37" },
    { text: "Todo lo puedo en Cristo que me fortalece.", reference: "Filipenses 4:13" },
];

const QuoteDom: React.FC = () => {
    const { theme } = useMyTheme();
    const styles = useMemo(() => getStyles(theme), [theme]);
    const [quoteText, setQuoteText] = useState("");
    const [selectedTemplate, setSelectedTemplate] = useState(quoteTemplates[0]);
    const [isLoading, setIsLoading] = useState(false);
    const [reference, setReference] = useState("");
    const [showTutor, setShowTutor] = useState(true);
    const [currentTemplateIndex, setCurrentTemplateIndex] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);
    const titleOpacity = useRef(new Animated.Value(1)).current;
    const subTitleOpacity = useRef(new Animated.Value(1)).current;
    const titleTranslateY = useRef(new Animated.Value(0)).current;
    const subTitleTranslateY = useRef(new Animated.Value(0)).current;

    const viewShotRef = useRef<ViewShot>(null);
    const { captureAndShare } = useViewShot({
        fileName: "quote",
        quality: 1,
        format: "png",
        viewShotRef
    });

    const {
        pan,
        rotate,
        currentCardScale,
        currentCardOpacity,
        panResponder,
        renderCardRange,
        screenWidth,
    } = useQuoteCardStack({
        currentIndex: currentTemplateIndex,
        totalTemplates: quoteTemplates.length,
        onIndexChange: setCurrentTemplateIndex,
    });

    const selectedVerse = use$(() => bibleState$.selectedVerseForNote.get());
    const params = useLocalSearchParams();

    const randomVerse = useMemo(() => {
        const randomIndex = Math.floor(Math.random() * FAMOUS_VERSES.length);
        return FAMOUS_VERSES[randomIndex];
    }, []);
    useEffect(() => {
        setSelectedTemplate(quoteTemplates[currentTemplateIndex]);
        if (scrollViewRef.current) {
            const dotWidth = 8 + 8;
            const centerOffset = screenWidth / 2 - dotWidth / 2;
            const scrollToX = currentTemplateIndex * dotWidth - centerOffset;
            const maxScrollX = (quoteTemplates.length + 1) * dotWidth - screenWidth;
            const limitedScrollToX = Math.max(0, Math.min(maxScrollX, scrollToX));
            scrollViewRef.current.scrollTo({ x: limitedScrollToX, animated: true });
        }
    }, [currentTemplateIndex, screenWidth]);

    // hide tutor after a short delay and after first successful swipe
    useEffect(() => {
        const t = setTimeout(() => setShowTutor(false), 4500);
        return () => clearTimeout(t);
    }, []);
    useEffect(() => {
        // if index changed due to swipe or dot press, hide tutor
        if (currentTemplateIndex !== 0) setShowTutor(false);
    }, [currentTemplateIndex]);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(titleOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
            Animated.timing(subTitleOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
            Animated.timing(titleTranslateY, { toValue: -20, duration: 150, useNativeDriver: true }),
            Animated.timing(subTitleTranslateY, { toValue: -20, duration: 150, useNativeDriver: true }),
        ]).start(() => {
            Animated.parallel([
                Animated.timing(titleOpacity, { toValue: 1, duration: 150, delay: 50, useNativeDriver: true }),
                Animated.timing(subTitleOpacity, { toValue: 1, duration: 150, delay: 50, useNativeDriver: true }),
                Animated.timing(titleTranslateY, { toValue: 0, duration: 150, delay: 50, useNativeDriver: true }),
                Animated.timing(subTitleTranslateY, { toValue: 0, duration: 150, delay: 50, useNativeDriver: true }),
            ]).start();
        });
    }, [currentTemplateIndex, screenWidth]);

    useEffect(() => {
        setQuoteText(
            typeof params?.text === "string" ? params.text : selectedVerse || randomVerse.text
        );
        setReference(
            typeof params?.reference === "string" ? params.reference : randomVerse.reference
        );
    }, [params, selectedVerse, randomVerse]);

    const handleShare = async () => {
        setShowTutor(false);
        if (!quoteText.trim()) {
            Alert.alert("Error", "Por favor, ingrese una cita antes de compartir");
            return;
        }
        setIsLoading(true);
        try {
            await captureAndShare();
        } catch (error: any) {
            console.error("Error in handleShare:", error);
            Alert.alert(
                "Error",
                "No se pudo compartir la cita: " +
                (error?.message || "Error desconocido")
            );
        } finally {
            setIsLoading(false);
        }
    };

    const screenOptions: any = useMemo(() => {
        return {
            theme,
            title: "Crear cita (DOM)",
            titleIcon: "Quote",
            headerRightProps: {
                headerRightIconColor: theme.colors.text,
                RightComponent: () => (
                    <View style={styles.headerButtons}>
                        <TouchableOpacity
                            onPress={handleShare}
                            disabled={isLoading}
                            style={styles.headerButton}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={theme.colors.text} />
                            ) : (
                                <Icon name="Share2" size={24} color={theme.colors.text} />
                            )}
                        </TouchableOpacity>
                    </View>
                ),
            },
        };
    }, [theme.colors, handleShare, isLoading]);

    const handleDotPress = (index: number) => {
        setCurrentTemplateIndex(index);
    };


    return (
        <>
            <Stack.Screen options={singleScreenHeader(screenOptions)} />
            <ScreenWithAnimation iconColor="#CDAA7D" duration={800} icon="Quote" title="Crear cita (DOM)">
                <View style={styles.container}>
                    <View style={styles.templateContent}>
                        {renderCardRange.map((index) => {
                            const template = quoteTemplates[index];
                            const isCurrent = index === currentTemplateIndex;
                            const distance = Math.abs(index - currentTemplateIndex);
                            const relativeIndex = index - currentTemplateIndex;
                            const cardTranslateX = isCurrent ? pan.x : relativeIndex * (screenWidth * 0.3);
                            const cardTranslateY = distance * 10;
                            const cardZIndex = 3 - distance;
                            return (
                                <Animated.View
                                    key={`dom-${template.id}`}
                                    style={[
                                        styles.templateCardWrapper,
                                        {
                                            transform: [
                                                { translateX: cardTranslateX },
                                                { translateY: isCurrent ? pan.y : cardTranslateY },
                                                { rotate: isCurrent ? rotate : "0deg" },
                                                { scale: isCurrent ? currentCardScale : 1 - distance * 0.2 },
                                            ],
                                            opacity: isCurrent ? currentCardOpacity : 1 - distance * 0.3,
                                            zIndex: cardZIndex,
                                            pointerEvents: isCurrent ? "auto" : ("none" as any),
                                        },
                                    ]}
                                    {...(isCurrent ? panResponder.panHandlers : {})}
                                >
                                    <ViewShot
                                        ref={isCurrent ? viewShotRef : null}
                                        options={{
                                            format: "png",
                                            quality: 1,
                                            result: "tmpfile",
                                        }}
                                        style={{
                                            flex: 1,
                                            width: "100%",
                                            backgroundColor: "transparent",
                                        }}
                                    >
                                        <DomQuoteCard
                                            theme={theme}
                                            templateHtml={template.template}
                                            reference={reference}
                                            quoteText={quoteText}
                                            widthPercent={90}
                                            showTutor={(showTutor) && isCurrent}
                                        />
                                    </ViewShot>
                                </Animated.View>
                            );
                        })}
                    </View>

                    <QuoteNavigationDots
                        currentIndex={currentTemplateIndex}
                        totalTemplates={quoteTemplates.length}
                        customMode={false}
                        onDotPress={handleDotPress}
                        scrollViewRef={scrollViewRef}
                    />
                </View>
            </ScreenWithAnimation>
        </>
    );
};

const getStyles = ({ colors }: TTheme) => {
    return StyleSheet.create({
        container: {
            width: "100%",
            height: "100%",
            flex: 1,
            backgroundColor: colors.background,
            alignItems: "center",
            paddingTop: 20,
        },
        templateContent: {
            flex: 1,
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
        },
        mainTitle: {
            fontSize: 22,
            fontWeight: "bold",
            color: colors.text,
            marginBottom: 12,
        },
        templateCardWrapper: {
            width: "100%",
            aspectRatio: 0.7,
            borderRadius: 20,
            overflow: "hidden",
            backgroundColor: "transparent",
            position: "absolute",
            // left: "5%",
            // right: "5%",
            top: 0,
            bottom: 0,
        },
        headerButtons: {
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            marginRight: 8,
        },
        headerButton: {
            padding: 8,
            borderRadius: 8,
        },

        subTitle: {
            fontSize: 16,
            color: colors.text + "99",
            textAlign: "center",
            marginHorizontal: 20,
            marginTop: 5,
        },
    });
};

export default QuoteDom;
