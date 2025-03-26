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
import { pb, GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI, manageUserWithGoogleAuth, UserRecord } from "../globalConfig";
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

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: GOOGLE_CLIENT_ID,
    scopes: ["profile", "email", "openid"],
  });

  useEffect(() => {
    console.log('Checking for existing session...');
    checkExistingSession();
  }, []);

  useEffect(() => {
    if (response?.type === "success") {
      console.log('STEP 1: SUCESS FROM GOOGLE LOGIN PAGE')
      setLoading(true);
      handleGoogleAuthentication(response);
    } else if (response?.type === "error") {
      handleAuthenticationError(new Error(response.error?.description || "Error al autenticar con Google"));
    }
  }, [response]);

  const checkExistingSession = async () => {
    try {
      const token = await AsyncStorage.getItem(SESSION_TOKEN_KEY);
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      console.log('Session check - Token exists:', !!token);
      console.log('Session check - User data exists:', !!userData);
      
      if (token && userData) {
        if (pb.authStore.token !== token) {
          console.log('Restoring session from storage');
          pb.authStore.save(token, JSON.parse(userData));
        }
        
        console.log('Token validity check:', pb.authStore.isValid);
        if (pb.authStore.isValid) {
          console.log('Valid session found, user is logged in');
          if (onSuccess) {
            onSuccess(pb.authStore.record as UserRecord);
          }
          return true;
        } else {
          console.log('Token expired, clearing session');
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
      console.log('STATE: Session saved successfully');
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
      console.log('Session cleared successfully');
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

  const handleGoogleAuthentication = async (response: AuthSession.AuthSessionResult) => {
    try {
      if (response.type !== "success") {
        throw new Error("La autenticación de Google fue cancelada o falló");
      }

      const { access_token } = response.params;
      
      console.log('STEP 2: Access token received:', !!access_token);
      
      if (!access_token) {
        throw new Error("No se recibió token de acceso de Google");
      }

      const userInfoResponse = await fetch(
        'https://www.googleapis.com/userinfo/v2/me',
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      );

      if (!userInfoResponse.ok) {
        throw new Error("Falló la solicitud de información de usuario de Google");
      }

      const userInfo: GoogleUser = await userInfoResponse.json();
      
      try {
        const userData = await manageUserWithGoogleAuth(
          userInfo,
          access_token
        );
        
        console.log('STEP 3: Got User data from PocketBase');
        console.log('STEP 3: Saving session with token:');
        await saveSession(pb.authStore.token, pb.authStore.record);

        handleSuccessfulAuth(userData);
      } catch (error: any) {
        handleAuthenticationError(error)
      }
    } catch (error: any) {
      console.log('Error general:', error.originalError);
      handleAuthenticationError(error instanceof Error ? error : new Error("Error desconocido"));
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessfulAuth = (userRecord: UserRecord) => {
    console.log('state 4: Go home')
    if (onSuccess) {
      onSuccess(userRecord);
    }
    router.replace("/home");
  };

  const logout = async () => {
    console.log('Cerrando sesión del usuario');
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
        promptAsync().catch((error) => {
          setLoading(false);
          handleAuthenticationError(error);
        });
      }}
      disabled={loading || !request}
    >
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <Text style={styles.googleButtonText}>
          {isRegistration ? "Registrarse con Google" : "Iniciar sesión con Google"}
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