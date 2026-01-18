import GoogleAuth from "@/components/GoogleAuth";
import { Text, View } from "@/components/Themed";
import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import { storedData$ } from "@/context/LocalstoreContext";
import { useMyTheme } from "@/context/ThemeContext";
import { authState$ } from "@/state/authState";
import { TTheme } from "@/types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { use$ } from "@legendapp/state/react";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { OptimizedImage } from "@/utils/imageCache";

const { width } = Dimensions.get("window");

const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  const isLoading = use$(() => authState$.isLoading.get());
  const { theme } = useMyTheme();
  const styles = getStyles(theme);

  useEffect(() => {
    const checkExistingSession = async () => {
      const isValid = await authState$.checkSession();
      if (isValid) {
        router.replace("/(dashboard)");
      }
    };

    checkExistingSession();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Por favor, ingresa tu correo y contraseña");
      return;
    }

    if (!validateEmail(email)) {
      setError("Por favor, ingresa un correo electrónico válido");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const success = await authState$.login(email, password);

      if (success) {
        setTimeout(() => {
          router.replace("/(dashboard)");
        }, 500);
      } else {
        setError("Correo electrónico o contraseña incorrectos");
      }
    } catch (error: any) {
      setError(error.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push("/tutorials");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.container]}>
          <Stack.Screen
            options={{
              ...singleScreenHeader({
                theme,
                title: "Iniciar sesión",
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

          {!isKeyboardVisible && (
            <Animated.View
              style={[
                styles.logoContainer,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
              ]}
            >
              <OptimizedImage
                source={require("../assets/images/auth.png")}
                style={styles.logo}
                contentFit="contain"
                category="general"
              />
            </Animated.View>
          )}

          <Animated.View
            style={[
              styles.formContainer,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Text style={[styles.title]}>Bienvenido de Nuevo</Text>
            <Text style={[styles.subtitle]}>Inicia sesión para continuar</Text>

            {error ? (
              <View style={styles.errorContainer}>
                <MaterialCommunityIcons
                  name="alert-circle"
                  size={18}
                  color="red"
                />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.inputContainer}>
              <MaterialCommunityIcons
                name="email-outline"
                size={20}
                color={theme.colors.text}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input]}
                placeholder="Correo Electrónico"
                placeholderTextColor={theme.colors.text + "80"}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputContainer}>
              <MaterialCommunityIcons
                name="lock-outline"
                size={20}
                color={theme.colors.text}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input]}
                placeholder="Contraseña"
                placeholderTextColor={theme.colors.text + "80"}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <MaterialCommunityIcons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
            </View>

            {/* <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity> */}

            <TouchableOpacity
              style={[
                styles.button,
                (loading || isLoading) && styles.buttonDisabled,
              ]}
              onPress={handleLogin}
              disabled={loading || isLoading}
              activeOpacity={0.8}
            >
              {loading || isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Iniciar Sesión</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>o</Text>
              <View style={styles.divider} />
            </View>

            <GoogleAuth onSuccess={() => router.replace("/(dashboard)")} />

            <TouchableOpacity
              onPress={() => router.push("/register")}
              style={styles.registerContainer}
            >
              <Text style={styles.registerText}>
                ¿No tienes una cuenta?{" "}
                <Text style={styles.linkText}>Regístrate</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => router.replace("/(dashboard)")}
            >
              <Text style={[styles.skipText]}>
                Continuar sin iniciar sesión
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    scrollContainer: {
      flexGrow: 1,
    },
    container: {
      flex: 1,
      padding: 20,
      justifyContent: "center",
      backgroundColor: colors.background,
    },
    logoContainer: {
      alignItems: "center",
      marginBottom: 30,
    },
    logo: {
      width: width * 0.5,
      height: 100,
    },
    formContainer: {
      width: "100%",
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      marginBottom: 8,
      textAlign: "center",
      color: colors.text,
    },
    subtitle: {
      fontSize: 16,
      marginBottom: 25,
      textAlign: "center",
      color: colors.text + "90",
    },
    errorContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255,0,0,0.1)",
      borderRadius: 8,
      padding: 10,
      marginBottom: 15,
    },
    errorText: {
      color: "red",
      marginLeft: 8,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      height: 55,
      borderRadius: 12,
      borderWidth: 1,
      marginBottom: 16,
      borderColor: colors.border,
      backgroundColor: colors.card,
      paddingHorizontal: 15,
    },
    inputIcon: {
      marginRight: 10,
    },
    input: {
      flex: 1,
      color: colors.text,
      fontSize: 16,
    },
    eyeIcon: {
      padding: 8,
    },
    forgotPasswordContainer: {
      alignItems: "flex-end",
      marginBottom: 20,
    },
    forgotPasswordText: {
      color: colors.notification,
      fontSize: 14,
    },
    button: {
      height: 55,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
      backgroundColor: colors.notification,
    },
    buttonDisabled: {
      opacity: 0.7,
    },
    buttonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "bold",
    },
    dividerContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 20,
    },
    divider: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerText: {
      paddingHorizontal: 15,
      color: colors.text,
    },
    googleButton: {
      height: 55,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    googleButtonText: {
      color: colors.text,
    },
    registerContainer: {
      alignItems: "center",
      marginTop: 25,
    },
    registerText: {
      fontSize: 15,
      color: colors.text,
    },
    linkText: {
      color: colors.notification,
      fontWeight: "bold",
    },
    skipButton: {
      marginTop: 20,
      alignItems: "center",
    },
    skipText: {
      fontSize: 14,
      color: colors.text + "80",
      textDecorationLine: "underline",
    },
  });

export default LoginScreen;
