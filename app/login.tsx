import GoogleAuth from "@/components/GoogleAuth";
import { Text, View } from "@/components/Themed";
import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import { storedData$ } from "@/context/LocalstoreContext";
import { authState$ } from "@/state/authState";
import { TTheme } from "@/types";
import { use$ } from "@legendapp/state/react";
import { useTheme } from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TextInput,
  TouchableOpacity
} from "react-native";

const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [enableSync, setEnableSync] = useState(false);
  const isLoading = use$(() => authState$.isLoading.get());
  const theme = useTheme();
  const styles = getStyles(theme);

  useEffect(() => {
    const userData = storedData$.user.get();

    if (userData) router.replace("(dashboard)");
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Por favor, ingresa tu correo y contraseña");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const success = await authState$.login(email, password);

      if (success) {
        router.replace("/(dashboard)");
      } else {
        setError("Correo electrónico o contraseña incorrectos");
      }
    } catch (error: any) {
      setError(error.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container]}>
      <Stack.Screen
        options={{
          ...singleScreenHeader({
            theme,
            title: "Iniciar session",
            titleIcon: "LogIn",
            headerRightProps: {
              headerRightIcon: "Trash2",
              headerRightIconColor: "red",
              onPress: () => { },
              disabled: true,
              style: { opacity: 0 },
            },
            goBack: () => router.push("/(dashboard)"),
          }),
        }}
      />
      <Text style={[styles.title]}>Bienvenido de Nuevo</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TextInput
        style={[styles.input]}
        placeholder="Correo Electrónico"
        placeholderTextColor={theme.colors.text}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={[styles.input]}
        placeholder="Contraseña"
        placeholderTextColor={theme.colors.text}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.button]}
        onPress={handleLogin}
        disabled={loading || isLoading}
      >
        {loading || isLoading ? (
          <ActivityIndicator color={theme.colors.text} />
        ) : (
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
        )}
      </TouchableOpacity>

      <GoogleAuth onSuccess={() => { }} />

      <TouchableOpacity onPress={() => router.push("/register")}>
        <Text style={[styles.linkText]}>¿No tienes una cuenta? Regístrate</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => router.replace("/(dashboard)")}
      >
        <Text style={[styles.skipText]}>Continuar sin iniciar sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      justifyContent: "center",
      backgroundColor: colors.background,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 20,
      textAlign: "center",
      color: colors.text,
    },
    input: {
      height: 50,
      borderRadius: 5,
      borderWidth: 1,
      paddingHorizontal: 15,
      marginBottom: 15,
      borderColor: colors.text,
      color: colors.primary,
      backgroundColor: colors.card,
    },
    button: {
      height: 50,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 10,
      marginBottom: 20,
      backgroundColor: colors.notification,
    },
    buttonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "bold",
    },
    linkText: {
      textAlign: "center",
      marginTop: 20,
      color: colors.notification,
    },
    errorText: {
      color: "red",
      marginBottom: 15,
      textAlign: "center",
    },
    syncContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 5,
    },
    syncText: {
      fontSize: 16,
    },
    syncDescription: {
      fontSize: 12,
      marginBottom: 15,
      fontStyle: "italic",
    },
    skipButton: {
      marginTop: 30,
      alignItems: "center",
    },
    skipText: {
      fontSize: 14,
      textDecorationLine: "underline",
    },
  });

export default LoginScreen;
