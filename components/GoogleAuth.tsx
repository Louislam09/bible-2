// components/GoogleAuth.tsx
import React, { useEffect, useState } from "react";
import {
  Text,
  Alert,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useTheme } from "@react-navigation/native";
import { GoogleUser, TTheme } from "@/types";
import { pb, manageUserWithGoogleAuth, UserRecord } from "../globalConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Complete the browser authentication session
WebBrowser.maybeCompleteAuthSession();

// Session storage keys
const SESSION_TOKEN_KEY = "@token";
const USER_DATA_KEY = "@user";

// Define the AuthProviderInfo interface
interface AuthProviderInfo {
  name: string;
  state: string;
  codeVerifier: string;
  codeChallenge: string;
  codeChallengeMethod: string;
  authURL: string;
  displayName: string;
}

interface GoogleAuthProps {
  onSuccess?: (user: UserRecord) => void;
  onError?: (error: Error) => void;
  isRegistration?: boolean;
}

const GoogleAuth: React.FC<GoogleAuthProps> = ({
  onSuccess,
  isRegistration = false,
}) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const theme = useTheme();
  const styles = getStyles(theme as TTheme);
  const REDIRECT_URI = AuthSession.makeRedirectUri();

  const InitiateGoogleAuth = async () => {
    try {
      setLoading(true);
      pb.authStore.clear();
      const authData = await pb.collection("users").authWithOAuth2({
        provider: "google",
        urlCallback: async (url) => {
          WebBrowser.openAuthSessionAsync(url, REDIRECT_URI);
        },
      });
      console.log("✅ User authenticated:", authData.record);
      console.log("User ID:", authData.record.id);
      console.log("User Email:", authData.record.email);
      console.log("Auth Token:", pb.authStore.token);
      pb.authStore.save(pb.authStore.token, authData.record);
      setLoading(false);
      router.replace("/(dashboard)");
    } catch (error: any) {
      handleAuthenticationError(new Error("Error al autenticar con Google"));
    }
  };

  useEffect(() => {
    console.log("Checking for existing session...", pb.authStore.record);
    // checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const token = await AsyncStorage.getItem(SESSION_TOKEN_KEY);
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      console.log("Session check - Token exists:", !!token);
      console.log("Session check - User data exists:", !!userData);

      if (token && userData) {
        if (pb.authStore.token !== token) {
          console.log("Restoring session from storage");
          pb.authStore.save(token, JSON.parse(userData));
        }

        console.log("Token validity check:", pb.authStore.isValid);
        if (pb.authStore.isValid) {
          console.log("Valid session found, user is logged in");
          if (onSuccess) {
            onSuccess(pb.authStore.record as UserRecord);
          }
          return true;
        } else {
          console.log("Token expired, clearing session");
          await clearSession();
        }
      }
      return false;
    } catch (error) {
      console.log("Error checking session:", error);
      await clearSession();
      return false;
    }
  };

  const saveSession = async (token: string, userData: any) => {
    try {
      await AsyncStorage.setItem(SESSION_TOKEN_KEY, token);
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
      console.log("STATE: Session saved successfully");
      return true;
    } catch (error) {
      console.log("Error saving session:", error);
      return false;
    }
  };

  const clearSession = async () => {
    try {
      await AsyncStorage.removeItem(SESSION_TOKEN_KEY);
      await AsyncStorage.removeItem(USER_DATA_KEY);
      pb.authStore.clear();
      console.log("Session cleared successfully");
      return true;
    } catch (error) {
      console.log("Error clearing session:", error);
      return false;
    }
  };

  const handleAuthenticationError = (error: Error) => {
    console.log("Error de autenticación:", error);
    setLoading(false);

    const authError = new Error(
      "Error al autenticar con Google. Por favor, inténtalo de nuevo."
    );

    Alert.alert("Error de Autenticación", authError.message);
  };

  const logout = async () => {
    console.log("Cerrando sesión del usuario");
    await clearSession();
    router.replace("/login");
  };

  // Expose logout function globally
  if (typeof global !== "undefined") {
    (global as any).logout = logout;
  }

  return (
    <TouchableOpacity
      style={[styles.googleButton, loading && styles.disabledButton]}
      onPress={() => {
        setLoading(true);
        InitiateGoogleAuth().catch((error) => {
          setLoading(false);
          handleAuthenticationError(error);
        });
      }}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <Text style={styles.googleButtonText}>
          {isRegistration
            ? "Registrarse con Google"
            : "Iniciar sesión con Google"}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    googleButton: {
      backgroundColor: "#4285F4",
      padding: 15,
      borderRadius: 5,
      alignItems: "center",
    },
    disabledButton: {
      opacity: 0.7,
    },
    googleButtonText: {
      color: "#fff",
      fontWeight: "bold",
    },
  });

export default GoogleAuth;

// Export the logout function for use in other components
export const logout = async () => {
  try {
    await AsyncStorage.removeItem(SESSION_TOKEN_KEY);
    await AsyncStorage.removeItem(USER_DATA_KEY);
    pb.authStore.clear();
    return true;
  } catch (error) {
    console.log("Error cerrando sesión:", error);
    return false;
  }
};
