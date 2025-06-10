import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
        paddingVertical: 8,
        paddingHorizontal: 16,
        fontSize: 16,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        overflow: 'hidden',
        marginVertical: 10
    },
    defaultButton: {
        backgroundColor: '#f1f3f5',
        borderWidth: 2,
        borderBottomWidth: 4,
        borderColor: '#e2e8f0',
        color: '#374151',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    primaryButton: {
        backgroundColor: '#3b82f6',
        borderBottomWidth: 4,
        borderColor: '#2563eb',
        color: '#f1f5f9',
        shadowColor: '#2563eb',
    },
    secondaryButton: {
        backgroundColor: '#6b7280',
        borderBottomWidth: 4,
        borderColor: '#4b5563',
        color: '#f1f5f9',
        shadowColor: '#4b5563',
    },
    dangerButton: {
        backgroundColor: '#dc2626',
        borderBottomWidth: 4,
        borderColor: '#b91c1c',
        color: '#f1f5f9',
        shadowColor: '#b91c1c',
    },
    superButton: {
        backgroundColor: '#7e22ce',
        borderBottomWidth: 4,
        borderColor: '#6b21a8',
        color: '#f1f5f9',
        shadowColor: '#6b21a8',
    },
    highlightButton: {
        backgroundColor: 'rgba(252, 211, 77, 0.75)',
        borderBottomWidth: 4,
        borderColor: '#fb923c',
        color: '#7e22ce',
        shadowColor: '#fb923c',
    },
    goldenButton: {
        backgroundColor: '#fcd34d',
        borderBottomWidth: 4,
        borderColor: '#f59e0b',
        color: '#78716c',
        shadowColor: '#f59e0b',
    },
    lockedButton: {
        backgroundColor: '#e5e7eb',
        borderBottomWidth: 4,
        borderColor: '#d1d5db',
        color: '#6b7280',
        shadowColor: '#d1d5db',
    },
    ghostButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: 'transparent',
        color: '#111827',
        shadowColor: '#000',
        shadowOpacity: 0.05,
    },
    immersiveButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderBottomWidth: 4,
        borderColor: 'rgba(0, 0, 0, 0.2)',
        color: '#111827',
        shadowColor: 'rgba(0, 0, 0, 0.2)',
    },
    activeButton: {
        backgroundColor: 'rgba(100, 116, 139, 0.15)',
        borderWidth: 2,
        borderBottomWidth: 4,
        borderColor: 'rgba(100, 116, 139, 0.8)',
        color: '#475569',
        shadowColor: 'rgba(100, 116, 139, 0.8)',
    },
    correctButton: {
        backgroundColor: 'rgba(34, 197, 94, 0.15)',
        borderWidth: 2,
        borderBottomWidth: 4,
        borderColor: 'rgba(34, 197, 94, 0.8)',
        color: '#22c55e',
        shadowColor: 'rgba(34, 197, 94, 0.8)',
    },
    incorrectButton: {
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        borderWidth: 2,
        borderBottomWidth: 4,
        borderColor: 'rgba(239, 68, 68, 0.8)',
        color: '#ef4444',
        shadowColor: 'rgba(239, 68, 68, 0.8)',
    },
    buttonText: {
        color: 'inherit',
        // fontWeight: 'au',
        textAlign: 'center',
    },
    // defaultButton: {},
    smButton: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        fontSize: 14,
    },
    lgButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        fontSize: 18,
    },
    iconButton: {
        paddingVertical: 0,
        paddingHorizontal: 0,
    },
    roundedButton: {
        borderRadius: 50,
    },
    noneButton: {},
});

type ButtonProps = React.ComponentProps<typeof TouchableOpacity> & {
    variant?: 'default' | 'primary' | 'secondary' | 'danger' | 'super' | 'highlight' | 'golden' | 'locked' | 'ghost' | 'immersive' | 'active' | 'correct' | 'incorrect';
    size?: 'default' | 'sm' | 'lg' | 'icon' | 'none' | 'rounded';
};

const Button = React.forwardRef<React.ComponentRef<typeof TouchableOpacity>, ButtonProps>(
    ({ variant = 'default', size = 'default', style, ...props }, ref) => {
        const buttonStyle = [
            styles.button,
            variant && styles[`${variant}Button`],
            size && styles[`${size}Button`],
            style && style,
        ];

        return (
            <TouchableOpacity ref={ref} style={buttonStyle} {...props}>
                <Text style={styles.buttonText}>{props.children}</Text>
            </TouchableOpacity>
        );
    }
);

Button.displayName = 'Button';

export { Button };
