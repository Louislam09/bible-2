import React from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { TTheme } from '@/types';
import { Text } from '../Themed';
import { storedData$ } from '@/context/LocalstoreContext';
import { useRequestAccess } from '@/services/queryService';
import { use$ } from '@legendapp/state/react';
import { Ionicons } from '@expo/vector-icons';
import { ERROR_MESSAGES } from '@/constants/errorMessages';
import EmptyStateMessage from '../EmptyStateMessage';

const RequestAccess = ({ onClose }: { onClose: () => void }) => {
    const theme = useTheme();
    const styles = getStyles(theme);
    const { mutateAsync: requestAccess, isPending } = useRequestAccess();
    const hasRequestAccess = use$(() => storedData$.hasRequestAccess.get());
    const userData = use$(() => storedData$.userData.get());

    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');

    const handleSubmit = async () => {
        if (!name || !email) {
            Alert.alert('Error', ERROR_MESSAGES.EMPTY_FIELDS);
            return;
        }

        try {
            await requestAccess({ name, email });
            storedData$.hasRequestAccess.set(true);
            storedData$.userData.set({ name, email, status: 'pending' });
            Alert.alert('Éxito', ERROR_MESSAGES.REQUEST_CREATED);
            onClose();
        } catch (error: any) {
            const errorMessage = error?.message
                ? error.message === "Email already has a pending request"
                    ? ERROR_MESSAGES.EMAIL_EXISTS
                    : ERROR_MESSAGES.CREATE_REQUEST_ERROR
                : ERROR_MESSAGES.NETWORK_ERROR;
            Alert.alert('Error', errorMessage);
        }
    };

    if (hasRequestAccess) {
        return (
            <EmptyStateMessage info={{
                title: 'Solicitud en Proceso',
                message: 'Hola ' + userData.name + ', tu solicitud está siendo procesada.',
                subText: 'Te contactaremos pronto al correo:',
                email: userData.email,
            }} onClose={onClose}
            />
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Solicitud de Acceso</Text>
            <TextInput
                style={styles.input}
                placeholder="Nombre completo"
                placeholderTextColor={theme.colors.text}
                value={name}
                onChangeText={setName}
            />
            <TextInput
                style={styles.input}
                placeholder="Correo"
                placeholderTextColor={theme.colors.text}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TouchableOpacity
                style={styles.button}
                onPress={handleSubmit}
                disabled={isPending}
            >
                <Text style={styles.buttonText}>
                    {isPending ? 'Enviando...' : 'Enviar Solicitud'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const getStyles = (theme: TTheme) =>
    StyleSheet.create({
        container: {
            padding: 16,
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

export default RequestAccess;