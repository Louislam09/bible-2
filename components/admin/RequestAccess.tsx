import { ERROR_MESSAGES } from "@/constants/errorMessages";
import { storedData$ } from "@/context/LocalstoreContext";
import { useMyTheme } from "@/context/ThemeContext";
import { authState$ } from "@/state/authState";
import { TTheme } from "@/types";
import removeAccent from "@/utils/removeAccent";
import { use$ } from "@legendapp/state/react";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import EmptyStateMessage from "../EmptyStateMessage";
import { Text } from "../Themed";
import { useAlert } from "@/context/AlertContext";

type IRequestAccess = {
  onRequest: (name: string) => Promise<void>;
  onClose: () => void;
  isPending: boolean;
};

const RequestAccess = ({ onClose, onRequest, isPending }: IRequestAccess) => {
  const { theme } = useMyTheme();
  const router = useRouter();
  const styles = getStyles(theme);
  const { alertError, alertSuccess } = useAlert();
  const hasRequestAccess = use$(() => storedData$.hasRequestAccess.get());
  const userData = use$(() => storedData$.userData.get());
  const isAuthenticated = use$(() => authState$.isAuthenticated.get());
  const user = use$(() => authState$.user.get());
  const [name, setName] = React.useState("");

  // Auto-fill form with user data if authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      onClose();
      router.push("/login");
      return;
    }

    if (isAuthenticated && user) {
      setName(user.name || "");
    }
  }, [isAuthenticated, user]);

  // Auto-submit access request if user is authenticated and hasn't requested access yet
  useEffect(() => {
    if (isAuthenticated && user && !hasRequestAccess) {
      handleSubmit(true);
    }
  }, [isAuthenticated, user, hasRequestAccess]);

  const handleSubmit = async (isAutoSubmit = false) => {
    if (!isAuthenticated) {
      onClose();
      router.push("/login");
      return;
    }

    const submitName = user?.name || name;

    if (!submitName) {
      if (!isAutoSubmit) {
        alertError("Error", ERROR_MESSAGES.EMPTY_FIELDS);
      }
      return;
    }

    try {
      const name = removeAccent(submitName);
      await onRequest(name);
      storedData$.hasRequestAccess.set(true);

      if (!isAutoSubmit) {
        alertSuccess("Éxito", ERROR_MESSAGES.REQUEST_CREATED);
        onClose();
      } else {
        onClose();
      }
    } catch (error: any) {
      if (!isAutoSubmit) {
        const errorMessage = error?.message
          ? error.message === "Email already has a pending request"
            ? ERROR_MESSAGES.EMAIL_EXISTS
            : ERROR_MESSAGES.CREATE_REQUEST_ERROR
          : ERROR_MESSAGES.NETWORK_ERROR;
        alertError("Error", errorMessage);
      }
    }
  };

  if (hasRequestAccess) {
    return (
      <EmptyStateMessage
        info={{
          title: "Solicitud en Proceso",
          message:
            "Hola " + userData.name + ", tu solicitud está siendo procesada.",
          subText: "Te contactaremos pronto al correo:",
          email: userData.email,
        }}
        onClose={onClose}
        onResend={() => handleSubmit(false)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Solicitud de Acceso</Text>

      {!isAuthenticated && (
        <Text style={styles.loginMessage}>
          Para solicitar acceso, primero debes iniciar sesión.
        </Text>
      )}

      {isAuthenticated && (
        <TextInput
          style={styles.input}
          placeholder="Nombre completo"
          placeholderTextColor={theme.colors.text}
          value={name}
          onChangeText={setName}
          editable={!isAuthenticated || !user?.name}
        />
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => handleSubmit(false)}
        disabled={isPending}
      >
        <Text style={styles.buttonText}>
          {!isAuthenticated
            ? "Iniciar Sesión"
            : isPending
              ? "Enviando..."
              : "Enviar Solicitud"}
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
      fontWeight: "bold",
      marginBottom: 16,
      textAlign: "center",
      color: theme.colors.text,
    },
    loginMessage: {
      fontSize: 14,
      marginBottom: 16,
      textAlign: "center",
      color: theme.colors.text,
      fontStyle: "italic",
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
      alignItems: "center",
    },
    buttonText: {
      color: "white",
      fontWeight: "600",
    },
    statusContainer: {
      alignItems: "center",
      padding: 20,
    },
    statusTitle: {
      fontSize: 22,
      fontWeight: "bold",
      color: theme.colors.text,
      marginTop: 16,
      marginBottom: 8,
    },
    statusText: {
      fontSize: 16,
      color: theme.colors.text,
      textAlign: "center",
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
      fontWeight: "600",
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
      color: "white",
      fontSize: 16,
      fontWeight: "600",
    },
  });

export default RequestAccess;
