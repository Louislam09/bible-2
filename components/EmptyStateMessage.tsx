import { TTheme } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from './Themed';

type EmptyStateMessageProps = {
    info: {
        title: string
        message: string
        subText: string
        email: string
    },
    onClose: () => void
    onResend: () => void
}

const EmptyStateMessage = ({ info, onClose, onResend }: EmptyStateMessageProps) => {
    const theme = useTheme();
    const styles = getStyles(theme);
    return (
        <View style={styles.container}>
            <View style={styles.statusContainer}>
                <Ionicons name="time-outline" size={50} color={theme.colors.notification} />
                <Text style={styles.statusTitle}>{info.title}</Text>
                <Text style={styles.statusText}>
                    {info.message}
                </Text>
                <Text style={styles.statusSubText}>
                    {info.subText}
                </Text>
                <Text style={styles.emailText}>{info.email}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'center', width: '100%', gap: 10 }}>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>Cerrar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.closeButton, { backgroundColor: 'transparent', borderColor: theme.colors.notification, borderWidth: 1 }]} onPress={onResend}>
                        <Text style={styles.closeButtonText}>Reenviar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

export default EmptyStateMessage

const getStyles = (theme: TTheme) =>
    StyleSheet.create({
        container: {
            padding: 16,
            backgroundColor: 'transparent'
        },
        title: {
            fontSize: 20,
            fontWeight: 'bold',
            marginBottom: 16,
            textAlign: 'center',
            color: theme.colors.text,
        },
        input: {
            height: 40,
            borderColor: theme.colors.text,
            borderWidth: 1,
            marginBottom: 12,
            paddingHorizontal: 8,
            borderRadius: 8,
            color: theme.colors.text,
        },
        button: {
            backgroundColor: theme.colors.notification,
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
        },
        buttonText: {
            color: 'white',
            fontWeight: '600',
        },
        statusContainer: {
            alignItems: 'center',
            padding: 20,
        },
        statusTitle: {
            fontSize: 22,
            fontWeight: 'bold',
            color: theme.colors.text,
            marginTop: 16,
            marginBottom: 8,
        },
        statusText: {
            fontSize: 16,
            color: theme.colors.text,
            textAlign: 'center',
            marginBottom: 8,
        },
        statusSubText: {
            fontSize: 14,
            color: theme.colors.text,
            opacity: 0.8,
            marginTop: 8,
        },
        emailText: {
            fontSize: 16,
            color: theme.colors.notification,
            fontWeight: '600',
            marginTop: 4,
        },
        closeButton: {
            marginTop: 24,
            backgroundColor: theme.colors.notification,
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 8,
        },
        closeButtonText: {
            color: 'white',
            fontSize: 16,
            fontWeight: '600',
        },
    });
