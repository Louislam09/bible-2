import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { pb } from "@/globalConfig";
import GoogleAuth from "@/components/GoogleAuth";
import { useTheme } from "@react-navigation/native";
import { TTheme } from "@/types";
import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import { authState$ } from "@/state/authState";
import { use$ } from "@legendapp/state/react";
import { storedData$ } from "@/context/LocalstoreContext";

const RegisterScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();
  const theme = useTheme();
  const styles = getStyles(theme as TTheme);
  const [loading, setLoading] = useState(false);
  const isLoading = use$(() => authState$.isLoading.get());

  useEffect(() => {
    const userData = storedData$.user.get();

    if (userData) router.replace("(dashboard)");
  }, []);

  const handleRegister = async () => {
    try {
      if (!name || !email || !password || !confirmPassword) {
        Alert.alert("Error", "Por favor completa todos los campos");
        return;
      }

      if (password !== confirmPassword) {
        Alert.alert("Error", "Las contraseñas no coinciden");
        return;
      }
      setLoading(true);

      const data = {
        name,
        email,
        password,
        passwordConfirm: confirmPassword,
      };
      await pb.collection("users").create(data);

      const success = await authState$.login(email, password);
      if (success) {
        storedData$.enableCloudSync.set(true);
        router.replace("/(dashboard)");
      } else {
        throw new Error("Falló el registro");
      }
    } catch (error: any) {
      console.error("Falló el registro:", error);

      if (error.originalError) {
        console.log("Error original", error.originalError);
      }

      if (error.originalError?.data?.data?.email?.message) {
        Alert.alert(
          "Error de Registro",
          error.originalError.data.data.email.message
        );
      } else if (error.originalError?.data?.message) {
        Alert.alert("Error de Registro", error.originalError.data.message);
      } else {
        Alert.alert(
          "Error de Registro",
          "El registro falló. Por favor intenta de nuevo."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = (user: any) => {
    router.replace("/home");
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <Stack.Screen
        options={{
          ...singleScreenHeader({
            theme,
            title: "Crear Cuenta",
            titleIcon: "LogIn",
            headerRightProps: {
              headerRightIcon: "Trash2",
              headerRightIconColor: "red",
              onPress: () => {},
              disabled: false,
              style: { opacity: 0 },
            },
            goBack: () => router.push("/(dashboard)"),
          }),
        }}
      />
      <View style={[styles.container]}>
        <Text style={[styles.title]}>
          ¡Bienvenido! {"\n"}Regístrate para comenzar
        </Text>

        <TextInput
          style={[styles.input]}
          placeholder="Nombre Completo"
          placeholderTextColor={theme.colors.text}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

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

        <TextInput
          style={[styles.input]}
          placeholder="Confirmar Contraseña"
          placeholderTextColor={theme.colors.text}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TouchableOpacity style={[styles.button]} onPress={handleRegister}>
          {loading || isLoading ? (
            <ActivityIndicator color={theme.colors.text} />
          ) : (
            <Text style={[styles.buttonText]}>Registrarse</Text>
          )}
        </TouchableOpacity>

        <Text style={[styles.orText]}>O</Text>

        <GoogleAuth isRegistration={true} onSuccess={handleGoogleSuccess} />

        <TouchableOpacity onPress={() => router.push("/login")}>
          <Text style={[styles.linkText]}>
            ¿Ya tienes una cuenta? Inicia Sesión
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      padding: 20,
      backgroundColor: colors.background,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 20,
      textAlign: "center",
      color: colors.primary,
    },
    input: {
      height: 50,
      borderWidth: 1,
      borderRadius: 5,
      paddingHorizontal: 15,
      marginBottom: 15,
      borderColor: colors.text,
      color: colors.primary,
      backgroundColor: colors.card,
    },
    button: {
      padding: 15,
      borderRadius: 5,
      alignItems: "center",
      backgroundColor: colors.text,
    },
    buttonText: {
      fontWeight: "bold",
      color: colors.background,
    },
    orText: {
      textAlign: "center",
      marginVertical: 15,
      color: colors.primary,
    },
    linkText: {
      textAlign: "center",
      marginTop: 15,
      color: colors.primary,
    },
  });

export default RegisterScreen;
