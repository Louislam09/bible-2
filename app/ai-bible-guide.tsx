import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import Icon from "@/components/Icon";
import { KeyboardPaddingView } from "@/components/keyboard-padding";
import { DB_BOOK_NAMES } from "@/constants/BookNames";
import { storedData$ } from "@/context/LocalstoreContext";
import { useMyTheme } from "@/context/ThemeContext";
import useBibleAIChat, { ChatMessage } from "@/hooks/useBibleAIChat";
import usePrintAndShare from "@/hooks/usePrintAndShare";
import { bibleState$ } from "@/state/bibleState";
import { Screens, TTheme } from "@/types";
import { copyTextToClipboard } from "@/utils/copyToClipboard";
import { parseBibleReferences } from "@/utils/extractVersesInfo";
import { use$ } from "@legendapp/state/react";
import { Stack, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import Markdown from "react-native-markdown-display";
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
import { useAlert } from "@/context/AlertContext";
import Animated, {
    Easing,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withSpring,
    withTiming
} from "react-native-reanimated";


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
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.scriptureChipsContainer}
            contentContainerStyle={styles.scriptureChipsContent}
        >
            {references.map((ref, idx) => (
                <AnimatedScriptureChip
                    key={idx}
                    reference={ref}
                    index={idx}
                    onPress={() => onVersePress(ref)}
                    theme={theme}
                />
            ))}
        </ScrollView>
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
                    <View style={styles.aiContentContainer}>
                        <View style={styles.aiBubble}>
                            <View style={styles.markdownContainer}>
                                <Markdown
                                    style={getMarkdownStyles(theme)}
                                    mergeStyle={true}
                                >
                                    {message.content}
                                </Markdown>
                            </View>
                            <View style={styles.aiMessageIconContainerWrapper}>
                                <View style={styles.aiMessageIconContainer}>
                                    <Icon name="Sparkles" size={16} color={theme.colors.notification} />
                                </View>
                            </View>
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

const inputMinHeight = 48;
const inputPaddingHeight = 0;

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
    // const loading = true
    const gradientRotation = useSharedValue(0);
    const borderOpacity = useSharedValue(0);
    const inputHeight = useSharedValue(inputMinHeight); // Start with minHeight

    // Reset height when input is cleared
    useEffect(() => {
        if (!inputText.trim()) {
            inputHeight.value = withSpring(inputMinHeight, {
                damping: 15,
                stiffness: 150,
            });
        }
    }, [inputText]);

    useEffect(() => {
        if (loading) {
            // Animate gradient rotation - complete circle loop, smooth and continuous
            gradientRotation.value = withRepeat(
                withTiming(360, {
                    duration: 1500,
                    easing: Easing.linear,
                }),
                -1, // infinite repeat
                false // don't reverse - complete circle
            );
            borderOpacity.value = withTiming(1, { duration: 300 });
        } else {
            borderOpacity.value = withTiming(0, { duration: 300 });
            gradientRotation.value = withTiming(0, { duration: 200 });
        }
    }, [loading]);

    const inputBarAnimatedStyle = useAnimatedStyle(() => ({
        opacity: inputBarOpacity.value,
        transform: [{ translateY: inputBarTranslateY.value }],
    }));

    const sendButtonAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: sendButtonScale.value }],
    }));

    const inputHeightAnimatedStyle = useAnimatedStyle(() => ({
        height: inputHeight.value,
    }));

    const handleContentSizeChange = (event: { nativeEvent: { contentSize: { height: number } } }) => {
        const { height } = event.nativeEvent.contentSize;
        const minHeight = inputMinHeight;
        const maxHeight = 120;
        const newHeight = Math.max(minHeight, Math.min(maxHeight, height + inputPaddingHeight)); // +24 for padding

        if (Math.abs(newHeight - inputHeight.value) > 1) {
            inputHeight.value = withSpring(newHeight, {
                damping: 15,
                stiffness: 150,
            });
        }
    };

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

    // Create a smooth circular gradient with a bright highlight that spins around
    const gradientColors = [
        theme.colors.notification + "40", // Dim
        theme.colors.notification + "60", // Slightly brighter
        theme.colors.notification + "80", // Brighter
        theme.colors.notification, // Full brightness - this creates the spinning highlight
        theme.colors.notification + "80", // Brighter
        theme.colors.notification + "60", // Slightly brighter
        theme.colors.notification + "40", // Dim
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
                                start={{ x: 0.5, y: 0 }}
                                end={{ x: 0.5, y: 1 }}
                                style={StyleSheet.absoluteFill}
                            />
                        </Animated.View>
                        <View style={styles.inputBorderMask} />
                        <View style={styles.searchingTextContainer}>
                            <Text style={styles.searchingText}>Buscando respuesta...</Text>
                        </View>
                    </Animated.View>
                )}
                <Animated.View style={[inputHeightAnimatedStyle, { width: '100%' }]}>
                    <TextInput
                        style={[
                            styles.input,
                            loading && styles.inputLoading,
                        ]}
                        value={loading ? "Buscando respuesta..." : inputText}
                        onChangeText={setInputText}
                        placeholder={"Pregunta sobre la Biblia..."}
                        placeholderTextColor={loading ? theme.colors.notification + "CC" : theme.colors.text + "80"}
                        multiline
                        editable={!loading}
                        onSubmitEditing={handleSend}
                        onContentSizeChange={handleContentSizeChange}
                        textAlignVertical="top"
                    />
                </Animated.View>
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

const exampleQuestions = [
    "¿Quién fue el rey David?",
    "Explica la Parábola del Sembrador",
    "¿Qué significa que el ser humano fue creado a imagen de Dios?",
    "¿Por qué Caín mató a Abel?",
    "¿Qué ocurrió en la Torre de Babel?",
    "¿Cuál fue la misión del profeta Jeremías?",
    "¿Qué representa el sueño de Nabucodonosor en Daniel 2?",
    "¿Por qué Dios pidió a Abraham sacrificar a Isaac?",
    "¿Qué enseña Jesús en el Sermón del Monte?",
    "¿Qué sucedió en el Día de Pentecostés?",
    "¿Quién fue Moisés y cuál fue su llamado?",
    "¿Qué simboliza el tabernáculo en el desierto?",
    "¿Qué significa la visión de los huesos secos en Ezequiel 37?",
    "Explica la parábola del Hijo Pródigo",
    "¿Por qué Jonás huyó de la misión que Dios le dio?",
    "¿Qué enseña Pablo sobre el fruto del Espíritu en Gálatas 5?",
    "¿Qué son las Bienaventuranzas y qué enseñan?",
    "¿Cuál es el propósito del libro de Apocalipsis?",
    "¿Qué significa la armadura de Dios en Efesios 6?",
    "¿Qué ocurrió durante la tentación de Jesús en el desierto?",
];

const AIBibleGuideScreen = () => {
    const { confirm } = useAlert();
    const [inputText, setInputText] = useState("");
    const selectedTranslation = "RV1960";
    const [hasAttemptedSend, setHasAttemptedSend] = useState(false);
    const googleAIKey = use$(() => storedData$.googleAIKey.get());
    const { theme } = useMyTheme();
    const styles = getStyles(theme);
    const router = useRouter();
    const navigation = useNavigation();
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

    // Use the chat hook
    const {
        messages,
        loading,
        error,
        sendMessage,
        clearConversation,
        isEmpty,
    } = useBibleAIChat(googleAIKey);

    // PDF generation hook
    const { printToFile } = usePrintAndShare();
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

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
        inputBarTranslateY.value = withSpring(0, {
            damping: 8,
            stiffness: 50,
        });
        inputBarOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));
    }, []);

    // Warn user before leaving if they have messages
    useEffect(() => {
        const unsubscribe = navigation.addListener("beforeRemove", (e) => {
            // Only warn if there are messages in the chat
            if (messages.length === 0) return;

            e.preventDefault();

            confirm(
                "¿Salir de la conversación?",
                "Si sales de esta página, la conversación se reiniciará y perderás todos los mensajes.",
                () => {
                    // clearConversation();
                    navigation.dispatch(e.data.action);
                }
            );
        });

        return unsubscribe;
    }, [navigation, messages.length, clearConversation, confirm]);

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages, loading]);

    // Clear input when search completes (when loading changes from true to false)
    useEffect(() => {
        if (!loading && messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage && lastMessage.type === "ai") {
                setInputText("");
            }
        }
    }, [loading, messages]);

    const handleSend = async () => {
        if (!inputText.trim()) return;

        setHasAttemptedSend(true);

        if (!googleAIKey) {
            return;
        }

        // Animate send button press
        sendButtonScale.value = withTiming(0.9, { duration: 100 }, () => {
            sendButtonScale.value = withSpring(1, {
                damping: 8,
                stiffness: 50,
            });
        });

        const messageContent = inputText.trim();
        setInputText("");
        await sendMessage(messageContent, selectedTranslation);
    };

    const handleExamplePress = (question: string) => {
        setInputText(question);
        setHasAttemptedSend(true);
        // Auto-send example questions
        setTimeout(() => {
            sendMessage(question, selectedTranslation);
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

    const generateConversationPDF = async () => {
        if (messages.length === 0 || isGeneratingPDF) return;

        setIsGeneratingPDF(true);
        try {
            const date = new Date().toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });

            // Generate HTML content from messages
            const messagesHTML = messages
                .map((msg) => {
                    const isUser = msg.type === "user";
                    const referencesHTML =
                        msg.scriptureReferences && msg.scriptureReferences.length > 0
                            ? `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid ${isUser ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"}; font-size: 11px; color: ${isUser ? "rgba(255,255,255,0.9)" : "#666"}; line-height: 1.5;">
                                <strong style="font-weight: 600;">Referencias:</strong> ${msg.scriptureReferences.join(", ")}
                               </div>`
                            : "";

                    return `
                        <div style="margin-bottom: 20px; clear: both; ${isUser ? "text-align: right;" : "text-align: left;"}">
                            <div style="
                                display: inline-block;
                                max-width: 80%;
                                min-width: 50px;
                                padding: 12px 16px;
                                border-radius: 12px;
                                ${isUser ? "border-bottom-right-radius: 4px;" : "border-bottom-left-radius: 4px;"}
                                background-color: ${isUser ? "#1736cf" : "#f5f5f5"};
                                color: ${isUser ? "#ffffff" : "#333333"};
                                word-wrap: break-word;
                                overflow-wrap: break-word;
                                box-shadow: 0 1px 3px rgba(0,0,0,0.12);
                                vertical-align: top;
                            ">
                                <div style="font-size: 14px; line-height: 1.6; white-space: pre-wrap; word-break: break-word; color: ${isUser ? "#ffffff" : "#333333"};">
                                    ${msg.content.replace(/\n/g, "<br/>")}
                                </div>
                                ${referencesHTML}
                            </div>
                            <div style="font-size: 11px; color: #999999; margin-top: 6px; padding: 0 4px; ${isUser ? "text-align: right;" : "text-align: left;"}">
                                ${isUser ? "Tú" : "Guía Bíblica IA"} • ${msg.timestamp.toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                            </div>
                        </div>
                    `;
                })
                .join("");

            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Guía Bíblica IA - Conversación</title>
                    <style>
                        * {
                            box-sizing: border-box;
                            margin: 0;
                            padding: 0;
                        }
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                            padding: 20px 16px;
                            background-color: #ffffff;
                            color: #333333;
                            font-size: 14px;
                            line-height: 1.5;
                            -webkit-font-smoothing: antialiased;
                            -moz-osx-font-smoothing: grayscale;
                        }
                        h1 {
                            color: #1736cf;
                            font-size: 22px;
                            margin-bottom: 6px;
                            font-weight: 600;
                            letter-spacing: -0.3px;
                        }
                        .date {
                            color: #666666;
                            font-size: 13px;
                            margin-bottom: 24px;
                            font-weight: 400;
                        }
                        .message-content {
                            word-wrap: break-word;
                            overflow-wrap: break-word;
                            width: 100%;
                        }
                        @media print {
                            body {
                                padding: 16px 12px;
                            }
                            h1 {
                                font-size: 20px;
                            }
                            .date {
                                font-size: 12px;
                            }
                        }
                        @page {
                            margin: 0.5cm;
                        }
                    </style>
                </head>
                <body>
                    <h1>Guía Bíblica IA</h1>
                    <div class="date">${date}</div>
                    <div class="message-content">
                        ${messagesHTML}
                    </div>
                </body>
                </html>
            `;

            const fileName = `Guia_Biblica_IA_${Date.now()}`;
            await printToFile(htmlContent, fileName);

            if (Platform.OS === "android") {
                ToastAndroid.show("PDF generado exitosamente", ToastAndroid.SHORT);
            }
        } catch (error) {
            console.error("Error generating PDF:", error);
            if (Platform.OS === "android") {
                ToastAndroid.show("Error al generar el PDF", ToastAndroid.SHORT);
            }
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    const randomExampleQuestions = useMemo(() => exampleQuestions.sort(() => Math.random() - 0.5).slice(0, 4), []);
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
                            headerRightIcon: isGeneratingPDF ? "Loader" : "FileText",
                            headerRightIconColor: theme.colors.notification,
                            onPress: generateConversationPDF,
                            disabled: messages.length === 0 || isGeneratingPDF,
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
                    {isEmptyState && !hasAttemptedSend && <EmptyStateAnimated
                        emptyIconOpacity={emptyIconOpacity}
                        emptyIconScale={emptyIconScale}
                        emptyTitleOpacity={emptyTitleOpacity}
                        emptyTitleTranslateY={emptyTitleTranslateY}
                        emptySubtitleOpacity={emptySubtitleOpacity}
                        emptySubtitleTranslateY={emptySubtitleTranslateY}
                        exampleButtonsOpacity={exampleButtonsOpacity}
                        exampleButtonsTranslateY={exampleButtonsTranslateY}
                        exampleQuestions={randomExampleQuestions}
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

                    {/* Error Message */}
                    {error && !loading && hasAttemptedSend && (
                        <View style={styles.errorBanner}>
                            <Icon
                                name="MessageCircleWarning"
                                size={20}
                                color={theme.colors.notification}
                            />
                            <View style={styles.errorBannerContent}>
                                <Text style={styles.errorBannerTitle}>
                                    Error
                                </Text>
                                <Text style={styles.errorBannerText}>
                                    {error}
                                </Text>
                                {(error.includes("clave de API") || !googleAIKey) && (
                                    <TouchableOpacity
                                        style={styles.errorBannerButton}
                                        onPress={() => router.push(Screens.AISetup)}
                                    >
                                        <Text style={styles.errorBannerButtonText}>
                                            Ir a Configuración
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                            <TouchableOpacity
                                onPress={() => {
                                    // Clear error by clearing conversation
                                    clearConversation();
                                }}
                                style={styles.errorBannerClose}
                            >
                                <Icon
                                    name="X"
                                    size={18}
                                    color={theme.colors.text}
                                />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Show error banner if no API key and user attempted to send */}
                    {!googleAIKey && hasAttemptedSend && !error && (
                        <View style={styles.errorBanner}>
                            <Icon
                                name="MessageCircleWarning"
                                size={20}
                                color={theme.colors.notification}
                            />
                            <View style={styles.errorBannerContent}>
                                <Text style={styles.errorBannerTitle}>
                                    Error
                                </Text>
                                <Text style={styles.errorBannerText}>
                                    No se ha configurado la clave de Google AI. Por favor configúrala en ajustes.
                                </Text>
                                <TouchableOpacity
                                    style={styles.errorBannerButton}
                                    onPress={() => router.push(Screens.AISetup)}
                                >
                                    <Text style={styles.errorBannerButtonText}>
                                        Ir a Configuración
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity
                                onPress={() => {
                                    setHasAttemptedSend(false);
                                }}
                                style={styles.errorBannerClose}
                            >
                                <Icon
                                    name="X"
                                    size={18}
                                    color={theme.colors.text}
                                />
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>

                {/* Input Bar */}
                <InputBarAnimated
                    inputBarOpacity={inputBarOpacity}
                    inputBarTranslateY={inputBarTranslateY}
                    sendButtonScale={sendButtonScale}
                    inputText={inputText}
                    setInputText={setInputText}
                    handleSend={handleSend}
                    loading={loading}
                    theme={theme}
                    styles={styles}
                />
            </SafeAreaView>
            <KeyboardPaddingView />
        </View>
    );
};

// Markdown styles for AI messages
const getMarkdownStyles = (theme: TTheme) => ({
    body: {
        fontSize: 16,
        color: theme.colors.text,
        lineHeight: 22,
    },
    paragraph: {
        marginVertical: 4,
    },
    heading1: {
        fontSize: 20,
        fontWeight: "700" as const,
        color: theme.colors.text,
        marginTop: 12,
        marginBottom: 8,
    },
    heading2: {
        fontSize: 18,
        fontWeight: "700" as const,
        color: theme.colors.text,
        marginTop: 10,
        marginBottom: 6,
    },
    heading3: {
        fontSize: 16,
        fontWeight: "600" as const,
        color: theme.colors.text,
        marginTop: 8,
        marginBottom: 4,
    },
    strong: {
        fontWeight: "700" as const,
        color: theme.colors.text,
    },
    em: {
        fontStyle: "italic" as const,
        color: theme.colors.text,
    },
    code_inline: {
        backgroundColor: theme.colors.text + "20",
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 4,
        fontSize: 14,
        fontFamily: "monospace",
        color: theme.colors.text,
    },
    code_block: {
        backgroundColor: theme.colors.text + "20",
        padding: 12,
        borderRadius: 8,
        marginVertical: 8,
        fontSize: 14,
        fontFamily: "monospace",
        color: theme.colors.text,
    },
    blockquote: {
        borderLeftWidth: 3,
        borderLeftColor: theme.colors.notification,
        paddingLeft: 12,
        marginVertical: 8,
        color: theme.colors.text + "CC",
        fontStyle: "italic" as const,
    },
    list_item: {
        marginVertical: 2,
    },
    bullet_list: {
        marginVertical: 4,
    },
    ordered_list: {
        marginVertical: 4,
    },
    link: {
        color: theme.colors.notification,
        textDecorationLine: "underline" as const,
    },
});

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
            paddingRight: 20,
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
        markdownContainer: {
            flex: 1,
        },
        aiMessageIconContainerWrapper: {
            width: '100%',
            alignItems: 'flex-end',
        },
        aiMessageIconContainer: {
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: colors.notification + "1A",
            alignItems: 'center',
            justifyContent: 'center',
        },
        scriptureChipsContainer: {
            marginTop: 12,
        },
        scriptureChipsContent: {
            flexDirection: "row",
            paddingRight: 8,
        },
        scriptureChip: {
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 8,
            backgroundColor: colors.text + "30",
            marginRight: 8,
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
        searchingTextContainer: {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
            zIndex: 3,
            pointerEvents: "none",
        },
        searchingText: {
            fontSize: 16,
            color: colors.notification,
            fontWeight: "500",
        },
        input: {
            flex: 1,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 12,
            backgroundColor: colors.text + "20",
            color: colors.text,
            fontSize: 16,
            zIndex: 2,
            overflow: "hidden",
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
        errorBanner: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.notification + "15",
            borderLeftWidth: 4,
            borderLeftColor: colors.notification,
            padding: 12,
            marginHorizontal: 16,
            marginBottom: 16,
            borderRadius: 8,
            gap: 12,
        },
        errorBannerContent: {
            flex: 1,
        },
        errorBannerTitle: {
            fontSize: 14,
            fontWeight: "700",
            color: colors.notification,
            marginBottom: 4,
        },
        errorBannerText: {
            fontSize: 13,
            color: colors.text,
            lineHeight: 18,
            marginBottom: 8,
        },
        errorBannerButton: {
            marginTop: 8,
            paddingVertical: 6,
            paddingHorizontal: 12,
            backgroundColor: colors.notification,
            borderRadius: 6,
            alignSelf: "flex-start",
        },
        errorBannerButtonText: {
            fontSize: 12,
            fontWeight: "600",
            color: "white",
        },
        errorBannerClose: {
            padding: 4,
        },
    });

export default AIBibleGuideScreen;

