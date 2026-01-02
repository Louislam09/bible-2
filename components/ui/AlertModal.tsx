import React from 'react';
import { Modal, View, Text, TouchableOpacity, Pressable, StyleSheet } from 'react-native';
import MyIcon from '../Icon';
import type { icons } from 'lucide-react-native';
import { useMyTheme } from '@/context/ThemeContext';
import { TTheme } from '@/types';

export type AlertType = 'info' | 'error' | 'success' | 'warning';

export type AlertButton = {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
};

export type AlertOptions = {
    title: string;
    message?: string;
    type?: AlertType;
    buttons?: AlertButton[];
    cancelable?: boolean;
    onDismiss?: () => void;
};

interface AlertModalProps {
    visible: boolean;
    title: string;
    message?: string;
    type?: AlertType;
    buttons?: AlertButton[];
    cancelable?: boolean;
    onDismiss?: () => void;
}

const getTypeStyles = (type: AlertType, isDark: boolean) => {
    const baseColors = {
        error: {
            icon: 'CircleAlert' as keyof typeof icons,
            iconColor: isDark ? '#ff6b6b' : '#dc2626',
            iconBg: isDark ? '#7f1d1d40' : '#fee2e2',
            titleColor: isDark ? '#ff6b6b' : '#dc2626',
        },
        success: {
            icon: 'CircleCheck' as keyof typeof icons,
            iconColor: isDark ? '#4ade80' : '#16a34a',
            iconBg: isDark ? '#14532d40' : '#dcfce7',
            titleColor: isDark ? '#4ade80' : '#16a34a',
        },
        warning: {
            icon: 'TriangleAlert' as keyof typeof icons,
            iconColor: isDark ? '#fbbf24' : '#ca8a04',
            iconBg: isDark ? '#78350f40' : '#fef3c7',
            titleColor: isDark ? '#fbbf24' : '#ca8a04',
        },
        info: {
            icon: 'Info' as keyof typeof icons,
            iconColor: isDark ? '#60a5fa' : '#2563eb',
            iconBg: isDark ? '#1e3a8a40' : '#dbeafe',
            titleColor: isDark ? '#60a5fa' : '#2563eb',
        },
    };

    return baseColors[type];
};

export function AlertModal({
    visible,
    title,
    message,
    type = 'info',
    buttons = [{ text: 'OK' }],
    cancelable = true,
    onDismiss,
}: AlertModalProps) {
    const { theme } = useMyTheme();
    const { colors } = theme;
    const isDark = theme.dark;
    const typeStyles = getTypeStyles(type, isDark);

    const handleButtonPress = (button: AlertButton) => {
        if (button.onPress) {
            button.onPress();
        }
        if (onDismiss) {
            onDismiss();
        }
    };

    const handleBackdropPress = () => {
        if (cancelable && onDismiss) {
            onDismiss();
        }
    };

    const styles = getStyles(colors, isDark, typeStyles);

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent
            onRequestClose={cancelable ? onDismiss : undefined}
        >
            <Pressable
                onPress={handleBackdropPress}
                style={styles.backdrop}
            >
                <Pressable
                    onPress={(e) => e.stopPropagation()}
                    style={styles.modalContainer}
                >
                    {/* Icon */}
                    <View style={styles.iconContainer}>
                        <View style={[styles.iconCircle, { backgroundColor: typeStyles.iconBg }]}>
                            <MyIcon
                                name={typeStyles.icon}
                                size={32}
                                color={typeStyles.iconColor}
                            />
                        </View>
                    </View>

                    {/* Title */}
                    <Text style={[styles.title, { color: typeStyles.titleColor }]}>
                        {title}
                    </Text>

                    {/* Message */}
                    {message && (
                        <Text style={styles.message}>
                            {message}
                        </Text>
                    )}

                    {/* Buttons */}
                    <View style={styles.buttonContainer}>
                        {buttons.map((button, index) => {
                            const isCancel = button.style === 'cancel';
                            const isDestructive = button.style === 'destructive';

                            return (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => handleButtonPress(button)}
                                    style={[
                                        styles.button,
                                        isCancel && styles.cancelButton,
                                        isDestructive && styles.destructiveButton,
                                        !isCancel && !isDestructive && styles.defaultButton,
                                    ]}
                                    activeOpacity={0.8}
                                >
                                    <Text
                                        style={[
                                            styles.buttonText,
                                            isCancel && styles.cancelButtonText,
                                            (isDestructive || (!isCancel && !isDestructive)) && styles.defaultButtonText,
                                        ]}
                                    >
                                        {button.text}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const getStyles = (colors: TTheme['colors'], isDark: boolean, typeStyles: any) => StyleSheet.create({
    backdrop: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal: 16,
    },
    modalContainer: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 24,
        backgroundColor: isDark ? '#2a2e30' : '#ffffff',
        borderWidth: 1,
        borderColor: isDark ? '#2a2e30' : '#e0e0e0',
        padding: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    iconCircle: {
        height: 64,
        width: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 24,
        color: colors.text,
        opacity: 0.7,
    },
    buttonContainer: {
        gap: 12,
    },
    button: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 16,
    },
    defaultButton: {
        backgroundColor: colors.notification || colors.primary,
    },
    cancelButton: {
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    },
    destructiveButton: {
        backgroundColor: isDark ? '#dc2626' : '#ef4444',
    },
    buttonText: {
        textAlign: 'center',
        fontWeight: '600',
        fontSize: 16,
    },
    defaultButtonText: {
        color: '#ffffff',
    },
    cancelButtonText: {
        color: colors.text,
    },
});

