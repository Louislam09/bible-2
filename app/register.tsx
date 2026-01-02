import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import GoogleAuth from "@/components/GoogleAuth";
import { storedData$ } from "@/context/LocalstoreContext";
import { useMyTheme } from "@/context/ThemeContext";
import { pb } from "@/globalConfig";
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
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAlert } from "@/context/AlertContext";
import { OptimizedImage } from "@/utils/imageCache";

const { width } = Dimensions.get("window");

const RegisterScreen = () => {
  const { alertError } = useAlert();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  const router = useRouter();
  const { theme } = useMyTheme();
  const styles = getStyles(theme as TTheme);
  const isLoading = use$(() => authState$.isLoading.get());

  useEffect(() => {
    const userData = storedData$.user.get();
    if (userData) router.replace("/(dashboard)");

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

  const showErrorAlert = (title: string, message: string) => {
    alertError(title, message);
    setError(message);
  };

  const handleRegister = async () => {
    try {
      if (!name || !email || !password || !confirmPassword) {
        showErrorAlert(
          "Campos incompletos",
          "Por favor completa todos los campos"
        );
        return;
      }

      if (!validateEmail(email)) {
        showErrorAlert(
          "Correo inválido",
          "Por favor ingresa un correo electrónico válido"
        );
        return;
      }

      if (password.length < 6) {
        showErrorAlert(
          "Contraseña débil",
          "La contraseña debe tener al menos 6 caracteres"
        );
        return;
      }

      if (password !== confirmPassword) {
        showErrorAlert(
          "Contraseñas no coinciden",
          "Las contraseñas no coinciden"
        );
        return;
      }

      setLoading(true);
      setError("");

      const data = {
        name,
        email,
        password,
        passwordConfirm: confirmPassword,
      };
      await pb.collection("users").create(data);

      const success = await authState$.login(email, password);
      if (success) {
        setTimeout(() => {
          router.replace("/(dashboard)");
        }, 500);
      } else {
        throw new Error("Falló el registro");
      }
    } catch (error: any) {
      console.error("Falló el registro:", error);

      if (error.originalError) {
        console.log("Error original", error.originalError);
      }

      if (error.originalError?.data?.data?.email?.message) {
        showErrorAlert(
          "Error de Registro",
          error.originalError.data.data.email.message
        );
      } else if (error.originalError?.data?.message) {
        showErrorAlert("Error de Registro", error.originalError.data.message);
      } else {
        showErrorAlert(
          "Error de Registro",
          "El registro falló. Por favor intenta de nuevo."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = (user: any) => {
    router.replace("/(dashboard)");
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
        <Stack.Screen
          options={{
            ...singleScreenHeader({
              theme,
              title: "Crear Cuenta",
              titleIcon: "UserPlus",
              headerRightProps: {
                headerRightIcon: "Trash2",
                headerRightIconColor: "red",
                onPress: () => { },
                disabled: false,
                style: { opacity: 0 },
              },
              goBack: () => router.push("/(dashboard)"),
            }),
          }}
        />

        <View style={[styles.container]}>
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
            <Text style={[styles.title]}>
              ¡Bienvenido!{"\n"}
              <Text style={styles.subtitle}>Crea tu cuenta para comenzar</Text>
            </Text>

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
                name="account-outline"
                size={20}
                color={theme.colors.text}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input]}
                placeholder="Nombre Completo"
                placeholderTextColor={theme.colors.text + "80"}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

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
                returnKeyType="next"
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

            <View style={styles.inputContainer}>
              <MaterialCommunityIcons
                name="lock-check-outline"
                size={20}
                color={theme.colors.text}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input]}
                placeholder="Confirmar Contraseña"
                placeholderTextColor={theme.colors.text + "80"}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <MaterialCommunityIcons
                  name={showConfirmPassword ? "eye-off" : "eye"}
                  size={20}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                (loading || isLoading) && styles.buttonDisabled,
              ]}
              onPress={handleRegister}
              disabled={loading || isLoading}
              activeOpacity={0.8}
            >
              {loading || isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={[styles.buttonText]}>Crear Cuenta</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>o</Text>
              <View style={styles.divider} />
            </View>

            <GoogleAuth
              isRegistration={true}
              onSuccess={handleGoogleSuccess}
            // buttonStyle={styles.googleButton}
            // textStyle={styles.googleButtonText}
            />

            <TouchableOpacity
              onPress={() => router.push("/login")}
              style={styles.loginContainer}
            >
              <Text style={styles.loginText}>
                ¿Ya tienes una cuenta?{" "}
                <Text style={styles.linkText}>Inicia Sesión</Text>
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
      marginBottom: 20,
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
      marginBottom: 25,
      textAlign: "center",
      color: colors.text,
    },
    subtitle: {
      fontSize: 18,
      fontWeight: "normal",
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
    button: {
      height: 55,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 10,
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
    loginContainer: {
      alignItems: "center",
      marginTop: 25,
    },
    loginText: {
      fontSize: 15,
      color: colors.text,
    },
    linkText: {
      color: colors.notification,
      fontWeight: "bold",
    },
  });

export default RegisterScreen;
