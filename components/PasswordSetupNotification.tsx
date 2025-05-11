import { TTheme } from "@/types";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface PasswordSetupNotificationProps {
  onDismiss?: () => void;
}

const PasswordSetupNotification: React.FC<PasswordSetupNotificationProps> = ({
  onDismiss,
}) => {
  const [showNotification, setShowNotification] = useState(false);
  const router = useRouter();
  const theme = useTheme();
  const styles = getStyles(theme as TTheme);

  // useEffect(() => {
  //   checkUserPasswordStatus();
  // }, []);

  // const checkUserPasswordStatus = async () => {
  //   // Only show if user is logged in
  //   if (!pb.authStore.isValid) {
  //     setShowNotification(false);
  //     return;
  //   }

  //   try {
  //     // Get current user data
  //     const userData = pb.authStore.record as pbUser;

  //     // Check if user was created with Google and hasn't set a password
  //     if (userData.lastGoogleToken && userData.hasSetPassword === false) {
  //       setShowNotification(true);
  //     } else {
  //       setShowNotification(false);
  //     }
  //   } catch (error) {
  //     console.error('Error checking user password status:', error);
  //     setShowNotification(false);
  //   }
  // };

  const handleSetupPassword = () => {
    router.push("/set-password");
    if (onDismiss) {
      onDismiss();
    }
  };

  const handleDismiss = () => {
    setShowNotification(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  if (!showNotification) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.notificationContent}>
        <Text style={styles.title}>Configure su contraseña</Text>
        <Text style={styles.message}>
          Te registraste con Google.¿Le gustaría configurar una contraseña para
          también? ¿Iniciar sesión con su correo electrónico y contraseña?
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.setupButton}
            onPress={handleSetupPassword}
          >
            <Text style={styles.setupButtonText}>Configurar contraseña</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={handleDismiss}
          >
            <Text style={styles.dismissButtonText}>Tal vez más tarde</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      bottom: 20,
      left: 20,
      right: 20,
      zIndex: 1000,
    },
    notificationContent: {
      backgroundColor: colors.card,
      borderRadius: 10,
      padding: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      borderWidth: 1,
      borderColor: colors.border,
    },
    title: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 8,
      color: colors.text,
    },
    message: {
      fontSize: 14,
      marginBottom: 16,
      color: colors.text,
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    setupButton: {
      backgroundColor: colors.primary,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 5,
      flex: 1,
      marginRight: 8,
      alignItems: "center",
    },
    setupButtonText: {
      color: "#fff",
      fontWeight: "bold",
    },
    dismissButton: {
      backgroundColor: "transparent",
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 5,
      flex: 1,
      marginLeft: 8,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    dismissButtonText: {
      color: colors.text,
    },
  });

export default PasswordSetupNotification;
