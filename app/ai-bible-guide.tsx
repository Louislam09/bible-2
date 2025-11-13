import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import Icon from "@/components/Icon";
import { KeyboardPaddingView } from "@/components/keyboard-padding";
import { DB_BOOK_NAMES } from "@/constants/BookNames";
import { storedData$ } from "@/context/LocalstoreContext";
import { useMyTheme } from "@/context/ThemeContext";
import useBibleAI from "@/hooks/useBibleAI";
import { bibleState$ } from "@/state/bibleState";
import { Screens, TTheme } from "@/types";
import { copyTextToClipboard } from "@/utils/copyToClipboard";
import { parseBibleReferences } from "@/utils/extractVersesInfo";
import { use$ } from "@legendapp/state/react";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import {
    Platform,
    SafeAreaView,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TextInput,
    ToastAndroid,
    TouchableOpacity,
    View
} from "react-native";
import Animated, {
    Easing,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withSpring,
    withTiming
} from "react-native-reanimated";

interface ChatMessage {
    id: string;
    type: "user" | "ai";
    content: string;
    timestamp: Date;
    scriptureReferences?: string[];
}

// Animated Example Button Component
const AnimatedExampleButton = ({
    question,
    index,
    onPress,
    theme,
}: {
    question: string;
    index: number;
    onPress: () => void;
    theme: TTheme;
}) => {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(20);
    const scale = useSharedValue(0.95);

    useEffect(() => {
        const delay = 600 + index * 100;
        opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
        translateY.value = withDelay(
            delay,
            withSpring(0, {
                damping: 8,
                stiffness: 50,
            })
        );
        scale.value = withDelay(
            delay,
            withSpring(1, {
                damping: 8,
                stiffness: 50,
            })
        );
    }, []);

    const handlePress = () => {
        scale.value = withTiming(0.95, { duration: 100 }, () => {
            scale.value = withSpring(1, {
                damping: 8,
                stiffness: 50,
            });
        });
        onPress();
    };

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [
            { translateY: translateY.value },
            { scale: scale.value },
        ],
    }));

    const styles = getStyles(theme);
    return (
        <Animated.View style={animatedStyle}>
            <TouchableOpacity
                style={styles.exampleButton}
                onPress={handlePress}
                activeOpacity={0.8}
            >
                <Text style={styles.exampleButtonText}>{question}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

// Animated Icon Container Component - Blinks when loading
const AnimatedIconContainer = ({ theme, loading }: { theme: TTheme; loading: boolean }) => {
    const scale = useSharedValue(0);
    const opacity = useSharedValue(1);

    useEffect(() => {
        scale.value = withSpring(1, {
            damping: 7,
            stiffness: 50,
        });
    }, []);

    useEffect(() => {
        if (loading) {
            // Blink animation while loading
            opacity.value = withRepeat(
                withSequence(
                    withTiming(0.3, { duration: 600 }),
                    withTiming(1, { duration: 600 })
                ),
                -1, // infinite repeat
                false
            );
        } else {
            opacity.value = withTiming(1, { duration: 200 });
        }
    }, [loading]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    const styles = getStyles(theme);
    return (
        <Animated.View style={[styles.aiIconContainer, animatedStyle]}>
            <Icon name="Sparkles" size={24} color={theme.colors.notification} />
        </Animated.View>
    );
};

// Animated Scripture Chip Component
const AnimatedScriptureChip = ({
    reference,
    index,
    onPress,
    theme,
}: {
    reference: string;
    index: number;
    onPress: () => void;
    theme: TTheme;
}) => {
    const opacity = useSharedValue(0);
    const translateX = useSharedValue(-20);

    useEffect(() => {
        const delay = index * 100;
        opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
        translateX.value = withDelay(
            delay,
            withSpring(0, {
                damping: 8,
                stiffness: 50,
            })
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateX: translateX.value }],
    }));

    const styles = getStyles(theme);
    return (
        <Animated.View style={animatedStyle}>
            <TouchableOpacity
                style={styles.scriptureChip}
                onPress={onPress}
                activeOpacity={0.7}
            >
                <Icon name="Book" size={16} color={theme.colors.text} />
                <Text style={styles.scriptureChipText}>{reference}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

// Animated Scripture Chips Component
const AnimatedScriptureChips = ({
    references,
    onVersePress,
    theme,
}: {
    references: string[];
    onVersePress: (ref: string) => void;
    theme: TTheme;
}) => {
    const styles = getStyles(theme);
    return (
        <View style={styles.scriptureChipsContainer}>
            {references.map((ref, idx) => (
                <AnimatedScriptureChip
                    key={idx}
                    reference={ref}
                    index={idx}
                    onPress={() => onVersePress(ref)}
                    theme={theme}
                />
            ))}
        </View>
    );
};

// Animated Action Buttons Component
const AnimatedActionButtons = ({
    onCopy,
    onShare,
    theme,
}: {
    onCopy: () => void;
    onShare: () => void;
    theme: TTheme;
}) => {
    const copyOpacity = useSharedValue(0);
    const shareOpacity = useSharedValue(0);
    const copyScale = useSharedValue(0.8);
    const shareScale = useSharedValue(0.8);

    useEffect(() => {
        copyOpacity.value = withDelay(200, withTiming(1, { duration: 300 }));
        copyScale.value = withDelay(
            200,
            withSpring(1, {
                damping: 8,
                stiffness: 50,
            })
        );
        shareOpacity.value = withDelay(300, withTiming(1, { duration: 300 }));
        shareScale.value = withDelay(
            300,
            withSpring(1, {
                damping: 8,
                stiffness: 50,
            })
        );
    }, []);

    const copyAnimatedStyle = useAnimatedStyle(() => ({
        opacity: copyOpacity.value,
        transform: [{ scale: copyScale.value }],
    }));

    const shareAnimatedStyle = useAnimatedStyle(() => ({
        opacity: shareOpacity.value,
        transform: [{ scale: shareScale.value }],
    }));

    const styles = getStyles(theme);
    return (
        <View style={styles.actionButtonsContainer}>
            <Animated.View style={copyAnimatedStyle}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={onCopy}
                    activeOpacity={0.7}
                >
                    <Icon name="Copy" size={20} color={theme.colors.text + "CC"} />
                </TouchableOpacity>
            </Animated.View>
            <Animated.View style={shareAnimatedStyle}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={onShare}
                    activeOpacity={0.7}
                >
                    <Icon name="Share" size={20} color={theme.colors.text + "CC"} />
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

// Animated Loading Indicator Component
const AnimatedLoadingIndicator = ({ theme }: { theme: TTheme }) => {
    const containerOpacity = useSharedValue(0);
    const containerTranslateY = useSharedValue(20);

    const dot1 = useSharedValue(0);
    const dot2 = useSharedValue(0);
    const dot3 = useSharedValue(0);

    useEffect(() => {
        containerOpacity.value = withTiming(1, { duration: 300 });
        containerTranslateY.value = withSpring(0, {
            damping: 8,
            stiffness: 50,
        });

        // Animate dots in loop using withRepeat
        dot1.value = withRepeat(
            withSequence(
                withDelay(0, withTiming(1, { duration: 400 })),
                withTiming(0, { duration: 400 })
            ),
            -1, // infinite repeat
            false
        );

        dot2.value = withRepeat(
            withSequence(
                withDelay(200, withTiming(1, { duration: 400 })),
                withTiming(0, { duration: 400 })
            ),
            -1,
            false
        );

        dot3.value = withRepeat(
            withSequence(
                withDelay(400, withTiming(1, { duration: 400 })),
                withTiming(0, { duration: 400 })
            ),
            -1,
            false
        );
    }, []);

    const containerAnimatedStyle = useAnimatedStyle(() => ({
        opacity: containerOpacity.value,
        transform: [{ translateY: containerTranslateY.value }],
    }));

    const dot1Style = useAnimatedStyle(() => ({
        opacity: interpolate(dot1.value, [0, 1], [0.3, 1]),
    }));

    const dot2Style = useAnimatedStyle(() => ({
        opacity: interpolate(dot2.value, [0, 1], [0.3, 1]),
    }));

    const dot3Style = useAnimatedStyle(() => ({
        opacity: interpolate(dot3.value, [0, 1], [0.3, 1]),
    }));

    const styles = getStyles(theme);
    return (
        <Animated.View style={[styles.aiMessageContainer, containerAnimatedStyle]}>
            <AnimatedIconContainer theme={theme} loading={true} />
            <View style={styles.aiContentContainer}>
                <View style={styles.loadingContainer}>
                    <Animated.View
                        style={[
                            styles.loadingDot,
                            dot1Style,
                            { backgroundColor: theme.colors.text + "80" },
                        ]}
                    />
                    <Animated.View
                        style={[
                            styles.loadingDot,
                            dot2Style,
                            { backgroundColor: theme.colors.text + "80" },
                        ]}
                    />
                    <Animated.View
                        style={[
                            styles.loadingDot,
                            dot3Style,
                            { backgroundColor: theme.colors.text + "80" },
                        ]}
                    />
                </View>
            </View>
        </Animated.View>
    );
};

// Empty State Animated Component
const EmptyStateAnimated = ({
    emptyIconOpacity,
    emptyIconScale,
    emptyTitleOpacity,
    emptyTitleTranslateY,
    emptySubtitleOpacity,
    emptySubtitleTranslateY,
    exampleButtonsOpacity,
    exampleButtonsTranslateY,
    exampleQuestions,
    handleExamplePress,
    theme,
    styles,
}: {
    emptyIconOpacity: ReturnType<typeof useSharedValue<number>>;
    emptyIconScale: ReturnType<typeof useSharedValue<number>>;
    emptyTitleOpacity: ReturnType<typeof useSharedValue<number>>;
    emptyTitleTranslateY: ReturnType<typeof useSharedValue<number>>;
    emptySubtitleOpacity: ReturnType<typeof useSharedValue<number>>;
    emptySubtitleTranslateY: ReturnType<typeof useSharedValue<number>>;
    exampleButtonsOpacity: ReturnType<typeof useSharedValue<number>>;
    exampleButtonsTranslateY: ReturnType<typeof useSharedValue<number>>;
    exampleQuestions: string[];
    handleExamplePress: (question: string) => void;
    theme: TTheme;
    styles: ReturnType<typeof getStyles>;
}) => {
    const iconAnimatedStyle = useAnimatedStyle(() => ({
        opacity: emptyIconOpacity.value,
        transform: [{ scale: emptyIconScale.value }],
    }));

    const titleAnimatedStyle = useAnimatedStyle(() => ({
        opacity: emptyTitleOpacity.value,
        transform: [{ translateY: emptyTitleTranslateY.value }],
    }));

    const subtitleAnimatedStyle = useAnimatedStyle(() => ({
        opacity: emptySubtitleOpacity.value,
        transform: [{ translateY: emptySubtitleTranslateY.value }],
    }));

    const buttonsAnimatedStyle = useAnimatedStyle(() => ({
        opacity: exampleButtonsOpacity.value,
        transform: [{ translateY: exampleButtonsTranslateY.value }],
    }));

    return (
        <View style={styles.emptyStateContainer}>
            <Animated.View style={[styles.emptyIconContainer, iconAnimatedStyle]}>
                <View style={styles.emptyIconCircle}>
                    <Icon name="Sparkles" size={48} color={theme.colors.notification} />
                </View>
            </Animated.View>
            <Animated.View style={titleAnimatedStyle}>
                <Text style={styles.emptyTitle}>
                    ¡Hola! ¿Cómo puedo ayudarte a explorar las Escrituras hoy?
                </Text>
            </Animated.View>
            <Animated.View style={subtitleAnimatedStyle}>
                <Text style={styles.emptySubtitle}>
                    Aquí hay algunos ejemplos para comenzar.
                </Text>
            </Animated.View>
            <Animated.View style={[styles.exampleButtonsContainer, buttonsAnimatedStyle]}>
                {exampleQuestions.map((question, index) => (
                    <AnimatedExampleButton
                        key={index}
                        question={question}
                        index={index}
                        onPress={() => handleExamplePress(question)}
                        theme={theme}
                    />
                ))}
            </Animated.View>
        </View>
    );
};

// Animated Message Component - Each message gets its own hooks
const AnimatedMessage = ({
    message,
    onVersePress,
    handleCopy,
    handleShare,
    theme,
    styles,
}: {
    message: ChatMessage;
    onVersePress: (ref: string) => void;
    handleCopy: (text: string) => void;
    handleShare: (text: string) => void;
    theme: TTheme;
    styles: ReturnType<typeof getStyles>;
}) => {
    // Hooks must be called at the top level
    const opacity = useSharedValue(0);
    const translateX = useSharedValue(message.type === "user" ? 50 : -50);
    const scale = useSharedValue(0.9);

    // Animate in when component mounts
    useEffect(() => {
        opacity.value = withTiming(1, { duration: 400 });
        translateX.value = withSpring(0, {
            damping: 8,
            stiffness: 50,
        });
        scale.value = withSpring(1, {
            damping: 8,
            stiffness: 50,
        });
    }, []);

    const messageAnimatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [
            { translateX: translateX.value },
            { scale: scale.value },
        ],
    }));

    return (
        <Animated.View style={messageAnimatedStyle}>
            {message.type === "user" ? (
                <View style={styles.userMessageContainer}>
                    <View style={styles.userBubble}>
                        <Text style={styles.userMessageText}>{message.content}</Text>
                    </View>
                </View>
            ) : (
                <View style={styles.aiMessageContainer}>
                    <AnimatedIconContainer theme={theme} loading={false} />
                    <View style={styles.aiContentContainer}>
                        <View style={styles.aiBubble}>
                            <Text style={styles.aiMessageText}>{message.content}</Text>
                        </View>
                        {message.scriptureReferences &&
                            message.scriptureReferences.length > 0 && (
                                <AnimatedScriptureChips
                                    references={message.scriptureReferences}
                                    onVersePress={onVersePress}
                                    theme={theme}
                                />
                            )}
                        <AnimatedActionButtons
                            onCopy={() => handleCopy(message.content)}
                            onShare={() => handleShare(message.content)}
                            theme={theme}
                        />
                    </View>
                </View>
            )}
        </Animated.View>
    );
};

// Input Bar Animated Component
const InputBarAnimated = ({
    inputBarOpacity,
    inputBarTranslateY,
    sendButtonScale,
    inputText,
    setInputText,
    handleSend,
    loading,
    theme,
    styles,
}: {
    inputBarOpacity: ReturnType<typeof useSharedValue<number>>;
    inputBarTranslateY: ReturnType<typeof useSharedValue<number>>;
    sendButtonScale: ReturnType<typeof useSharedValue<number>>;
    inputText: string;
    setInputText: (text: string) => void;
    handleSend: () => void;
    loading: boolean;
    theme: TTheme;
    styles: ReturnType<typeof getStyles>;
}) => {
    const gradientRotation = useSharedValue(0);
    const borderOpacity = useSharedValue(0);

    useEffect(() => {
        if (loading) {
            // Animate gradient rotation
            gradientRotation.value = withRepeat(
                withTiming(360, {
                    duration: 2000,
                    easing: Easing.linear,
                }),
                -1,
                false
            );
            borderOpacity.value = withTiming(1, { duration: 300 });
        } else {
            borderOpacity.value = withTiming(0, { duration: 300 });
            gradientRotation.value = 0;
        }
    }, [loading]);

    const inputBarAnimatedStyle = useAnimatedStyle(() => ({
        opacity: inputBarOpacity.value,
        transform: [{ translateY: inputBarTranslateY.value }],
    }));

    const sendButtonAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: sendButtonScale.value }],
    }));

    const borderAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: borderOpacity.value,
        };
    });

    const gradientAnimatedStyle = useAnimatedStyle(() => {
        const rotation = gradientRotation.value;
        return {
            transform: [{ rotate: `${rotation}deg` }],
        };
    });

    const gradientColors = [
        theme.colors.notification,
        theme.colors.notification + "CC",
        theme.colors.notification + "99",
        theme.colors.notification + "CC",
        theme.colors.notification,
    ];

    return (
        <Animated.View style={[styles.inputContainer, inputBarAnimatedStyle]}>
            <View style={styles.inputWrapper}>
                {loading && (
                    <Animated.View
                        style={[
                            styles.inputBorderGradient,
                            borderAnimatedStyle,
                        ]}
                        pointerEvents="none"
                    >
                        <Animated.View style={[gradientAnimatedStyle, StyleSheet.absoluteFill]}>
                            <LinearGradient
                                colors={gradientColors as any}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={StyleSheet.absoluteFill}
                            />
                        </Animated.View>
                        <View style={styles.inputBorderMask} />
                    </Animated.View>
                )}
                <TextInput
                    style={[
                        styles.input,
                        loading && styles.inputLoading,
                    ]}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Pregunta sobre la Biblia..."
                    placeholderTextColor={theme.colors.text + "80"}
                    multiline
                    editable={!loading}
                    onSubmitEditing={handleSend}
                />
            </View>
            <View style={styles.inputButtons}>
                <Animated.View style={sendButtonAnimatedStyle}>
                    <TouchableOpacity
                        style={[
                            styles.sendButton,
                            (!inputText.trim() || loading) && styles.sendButtonDisabled,
                        ]}
                        onPress={handleSend}
                        disabled={!inputText.trim() || loading}
                        activeOpacity={0.8}
                    >
                        <Icon
                            name="ArrowUp"
                            size={24}
                            color={
                                !inputText.trim() || loading
                                    ? theme.colors.text + "80"
                                    : "white"
                            }
                        />
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Animated.View>
    );
};

const AIBibleGuideScreen = () => {
    const [inputText, setInputText] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [selectedTranslation, setSelectedTranslation] = useState("RV1960");
    const googleAIKey = use$(() => storedData$.googleAIKey.get());
    const { theme } = useMyTheme();
    const styles = getStyles(theme);
    const router = useRouter();
    const scrollViewRef = useRef<ScrollView>(null);

    // Animation values for empty state
    const emptyIconOpacity = useSharedValue(0);
    const emptyIconScale = useSharedValue(0.8);
    const emptyTitleOpacity = useSharedValue(0);
    const emptyTitleTranslateY = useSharedValue(20);
    const emptySubtitleOpacity = useSharedValue(0);
    const emptySubtitleTranslateY = useSharedValue(20);
    const exampleButtonsOpacity = useSharedValue(0);
    const exampleButtonsTranslateY = useSharedValue(20);

    // Animation values for input bar
    const inputBarTranslateY = useSharedValue(100);
    const inputBarOpacity = useSharedValue(0);
    const sendButtonScale = useSharedValue(1);


    const {
        loading,
        error,
        predictedAnswer,
        verses,
        articles,
        searchBible,
        clearResults,
        hasResults,
        isEmpty,
    } = useBibleAI(googleAIKey);

    // Animate empty state on mount
    useEffect(() => {
        if (messages.length === 0 && !loading && isEmpty) {
            // Icon animation
            emptyIconOpacity.value = withTiming(1, { duration: 600 });
            emptyIconScale.value = withSpring(1, {
                damping: 7,
                stiffness: 50,
            });

            // Title animation
            emptyTitleOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
            emptyTitleTranslateY.value = withDelay(200, withTiming(0, { duration: 500 }));

            // Subtitle animation
            emptySubtitleOpacity.value = withDelay(350, withTiming(1, { duration: 500 }));
            emptySubtitleTranslateY.value = withDelay(350, withTiming(0, { duration: 500 }));

            // Example buttons animation
            exampleButtonsOpacity.value = withDelay(500, withTiming(1, { duration: 500 }));
            exampleButtonsTranslateY.value = withDelay(500, withTiming(0, { duration: 500 }));
        }
    }, [messages.length, loading, isEmpty]);

    // Animate input bar on mount
    useEffect(() => {
        if (googleAIKey) {
            inputBarTranslateY.value = withSpring(0, {
                damping: 8,
                stiffness: 50,
            });
            inputBarOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));
        }
    }, [googleAIKey]);

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages, loading]);

    // Add AI response to messages when it's ready
    useEffect(() => {
        if (predictedAnswer && !loading && hasResults) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage && lastMessage.type === "user") {
                // Extract scripture references from verses
                const references = verses.map((v) => v.reference);

                const aiMessage: ChatMessage = {
                    id: Date.now().toString(),
                    type: "ai",
                    content: predictedAnswer.description,
                    timestamp: new Date(),
                    scriptureReferences: references,
                };
                setMessages((prev) => [...prev, aiMessage]);
            }
        }
    }, [predictedAnswer, loading, hasResults]);


    const handleSend = async () => {
        if (!inputText.trim() || !googleAIKey) return;

        // Animate send button press
        sendButtonScale.value = withTiming(0.9, { duration: 100 }, () => {
            sendButtonScale.value = withSpring(1, {
                damping: 8,
                stiffness: 50,
            });
        });

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            type: "user",
            content: inputText.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputText("");
        clearResults();

        await searchBible(inputText.trim(), selectedTranslation);
    };

    const handleExamplePress = (question: string) => {
        setInputText(question);
        // Auto-send example questions
        setTimeout(() => {
            const userMessage: ChatMessage = {
                id: Date.now().toString(),
                type: "user",
                content: question,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, userMessage]);
            clearResults();
            searchBible(question, selectedTranslation);
        }, 100);
    };

    const onVersePress = (reference: string) => {
        const parsedReferences = parseBibleReferences(reference)[0];
        const currentBook = DB_BOOK_NAMES.find(
            (x) =>
                x.longName?.toLocaleLowerCase() ===
                parsedReferences?.book?.toLocaleLowerCase() ||
                x.longName
                    ?.toLocaleLowerCase()
                    .includes(parsedReferences?.book?.toLocaleLowerCase())
        );

        const queryInfo = {
            book: currentBook?.longName || "Mateo",
            chapter: +parsedReferences.chapter,
            verse: +parsedReferences.verse || 0,
        };
        bibleState$.changeBibleQuery({
            ...queryInfo,
            shouldFetch: true,
            isHistory: true,
        });
        router.push({ pathname: `/${Screens.Home}`, params: queryInfo });
    };

    const handleCopy = async (text: string) => {
        try {
            await copyTextToClipboard(text);
            if (Platform.OS === "android") {
                ToastAndroid.show("Copiado al portapapeles", ToastAndroid.SHORT);
            }
        } catch (error) {
            console.error("Error copying text:", error);
        }
    };

    const handleShare = async (text: string) => {
        try {
            await Share.share({
                message: text,
                title: "Respuesta de Guía Bíblica IA",
            });
        } catch (error) {
            console.error("Error sharing:", error);
        }
    };


    const exampleQuestions = [
        "¿Quién fue el rey David?",
        "Explica la Parábola del Sembrador",
    ];

    const isEmptyState = messages.length === 0 && !loading && isEmpty;

    return (
        <View style={styles.pageContainer}>
            <Stack.Screen
                options={{
                    ...singleScreenHeader({
                        theme,
                        title: "Guía Bíblica IA",
                        titleIcon: "Sparkles",
                        titleIconColor: theme.colors.notification,
                        headerRightProps: {
                            headerRightIconColor: "",
                            onPress: () => console.log(),
                            disabled: true,
                            style: { opacity: 0 },
                        },
                    }),
                }}
            />
            <SafeAreaView style={styles.container}>
                {/* Chat Area */}
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.chatArea}
                    contentContainerStyle={styles.chatContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Empty State */}
                    {isEmptyState && <EmptyStateAnimated
                        emptyIconOpacity={emptyIconOpacity}
                        emptyIconScale={emptyIconScale}
                        emptyTitleOpacity={emptyTitleOpacity}
                        emptyTitleTranslateY={emptyTitleTranslateY}
                        emptySubtitleOpacity={emptySubtitleOpacity}
                        emptySubtitleTranslateY={emptySubtitleTranslateY}
                        exampleButtonsOpacity={exampleButtonsOpacity}
                        exampleButtonsTranslateY={exampleButtonsTranslateY}
                        exampleQuestions={exampleQuestions}
                        handleExamplePress={handleExamplePress}
                        theme={theme}
                        styles={styles}
                    />}

                    {/* Messages */}
                    {messages.map((message) => (
                        <AnimatedMessage
                            key={message.id}
                            message={message}
                            onVersePress={onVersePress}
                            handleCopy={handleCopy}
                            handleShare={handleShare}
                            theme={theme}
                            styles={styles}
                        />
                    ))}

                    {/* Loading Indicator */}
                    {loading && (
                        <AnimatedLoadingIndicator theme={theme} />
                    )}
                </ScrollView>

                {/* Input Bar */}
                {googleAIKey && <InputBarAnimated
                    inputBarOpacity={inputBarOpacity}
                    inputBarTranslateY={inputBarTranslateY}
                    sendButtonScale={sendButtonScale}
                    inputText={inputText}
                    setInputText={setInputText}
                    handleSend={handleSend}
                    loading={loading}
                    theme={theme}
                    styles={styles}
                />}

                {!googleAIKey && (
                    <View style={styles.errorContainer}>
                        <Icon
                            name="MessageCircleWarning"
                            size={48}
                            color={theme.colors.notification}
                        />
                        <Text style={styles.errorText}>
                            No se ha configurado la clave de Google AI. Por favor configúrala en ajustes.
                        </Text>
                        <TouchableOpacity
                            style={styles.configButton}
                            onPress={() => router.push(Screens.AISetup)}
                        >
                            <Text style={styles.configButtonText}>Configurar</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </SafeAreaView>
            <KeyboardPaddingView />
        </View>
    );
};

const getStyles = ({ colors }: TTheme) =>
    StyleSheet.create({
        pageContainer: {
            flex: 1,
            backgroundColor: colors.background,
        },
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        keyboardView: {
            flex: 1,
        },
        chatArea: {
            flex: 1,
        },
        chatContent: {
            padding: 16,
            paddingBottom: 20,
        },
        emptyStateContainer: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 40,
            minHeight: 400,
        },
        emptyIconContainer: {
            marginBottom: 24,
        },
        emptyIconCircle: {
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: colors.notification + "1A",
            alignItems: "center",
            justifyContent: "center",
        },
        emptyTitle: {
            fontSize: 20,
            fontWeight: "700",
            color: colors.text,
            textAlign: "center",
            marginBottom: 8,
            paddingHorizontal: 20,
        },
        emptySubtitle: {
            fontSize: 14,
            color: colors.text + "CC",
            textAlign: "center",
            marginBottom: 24,
            paddingHorizontal: 20,
        },
        exampleButtonsContainer: {
            width: "100%",
            maxWidth: 400,
            gap: 12,
            paddingHorizontal: 20,
        },
        exampleButton: {
            width: "100%",
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 12,
            backgroundColor: colors.text + "30",
            borderWidth: 1,
            borderColor: colors.text + "20",
        },
        exampleButtonText: {
            fontSize: 14,
            fontWeight: "500",
            color: colors.text,
            textAlign: "center",
        },
        userMessageContainer: {
            flexDirection: "row",
            justifyContent: "flex-end",
            marginBottom: 16,
            paddingLeft: 40,
        },
        userBubble: {
            maxWidth: "80%",
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 12,
            borderTopRightRadius: 4,
            backgroundColor: colors.notification,
        },
        userMessageText: {
            fontSize: 16,
            color: "white",
            lineHeight: 22,
        },
        aiMessageContainer: {
            flexDirection: "row",
            alignItems: "flex-start",
            marginBottom: 16,
            paddingRight: 40,
        },
        aiIconContainer: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.notification + "1A",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
        },
        aiContentContainer: {
            flex: 1,
        },
        aiBubble: {
            maxWidth: "100%",
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 12,
            borderTopLeftRadius: 4,
            backgroundColor: colors.text + "30",
        },
        aiMessageText: {
            fontSize: 16,
            color: colors.text,
            lineHeight: 22,
        },
        scriptureChipsContainer: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
            marginTop: 12,
        },
        scriptureChip: {
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 8,
            backgroundColor: colors.text + "30",
        },
        scriptureChipText: {
            fontSize: 14,
            fontWeight: "500",
            color: colors.text,
        },
        actionButtonsContainer: {
            flexDirection: "row",
            gap: 8,
            marginTop: 8,
        },
        actionButton: {
            width: 32,
            height: 32,
            borderRadius: 8,
            alignItems: "center",
            justifyContent: "center",
        },
        loadingContainer: {
            flexDirection: "row",
            gap: 8,
            alignItems: "center",
            paddingVertical: 12,
            paddingHorizontal: 16,
        },
        loadingDot: {
            width: 8,
            height: 8,
            borderRadius: 4,
        },
        inputContainer: {
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderTopWidth: 1,
            borderTopColor: colors.text + "20",
            backgroundColor: colors.background,
            gap: 8,
        },
        inputWrapper: {
            flex: 1,
            position: "relative",
        },
        inputBorderGradient: {
            position: "absolute",
            top: -2,
            left: -2,
            right: -2,
            bottom: -2,
            borderRadius: 14,
            overflow: "hidden",
            zIndex: 1,
        },
        inputBorderMask: {
            position: "absolute",
            top: 2,
            left: 2,
            right: 2,
            bottom: 2,
            borderRadius: 12,
            backgroundColor: colors.background,
        },
        input: {
            flex: 1,
            minHeight: 48,
            maxHeight: 120,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 12,
            backgroundColor: colors.text + "20",
            color: colors.text,
            fontSize: 16,
            zIndex: 2,
        },
        inputLoading: {
            backgroundColor: colors.background,
        },
        inputButtons: {
            flexDirection: "row",
            gap: 8,
            alignItems: "center",
        },
        sendButton: {
            width: 36,
            height: 36,
            borderRadius: 8,
            backgroundColor: colors.notification,
            alignItems: "center",
            justifyContent: "center",
        },
        sendButtonDisabled: {
            backgroundColor: colors.text + "30",
        },
        errorContainer: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 40,
        },
        errorText: {
            fontSize: 16,
            color: colors.text,
            textAlign: "center",
            marginTop: 16,
            marginBottom: 24,
        },
        configButton: {
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 8,
            backgroundColor: colors.notification,
        },
        configButtonText: {
            color: "white",
            fontSize: 16,
            fontWeight: "600",
        },
    });

export default AIBibleGuideScreen;

