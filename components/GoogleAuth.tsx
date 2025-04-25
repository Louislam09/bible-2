import { authState$ } from "@/state/authState";
import { pbUser, TTheme } from "@/types";
import { AntDesign } from '@expo/vector-icons';
import { useTheme } from "@react-navigation/native";
import * as AuthSession from "expo-auth-session";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { pb } from "../globalConfig";

WebBrowser.maybeCompleteAuthSession();

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
  onSuccess?: (user: pbUser) => void;
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
      console.log("Init Login...");
      setLoading(true);
      pb.authStore.clear();
      const authData = await pb.collection("users").authWithOAuth2({
        provider: "google",
        urlCallback: async (url) => {
          WebBrowser.openAuthSessionAsync(url, REDIRECT_URI);
        },
      });
      console.log("UserLogined", pb.authStore.isValid);
      authState$.loginWithGoogle(pb.authStore.record as pbUser, authData.token);
      setLoading(false);

      router.replace("/(dashboard)");
    } catch (error: any) {
      console.log(error.originalError, error);
      handleAuthenticationError(new Error("Error al autenticar con Google"));
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
        <>
          <AntDesign name="google" size={20} color="white" style={styles.googleIcon} />
          <Text style={styles.googleButtonText}>
            {isRegistration
              ? "Registrarse con Google"
              : "Iniciar sesión con Google"}
          </Text>
        </>
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
      flexDirection: "row",
      justifyContent: "center",
    },
    disabledButton: {
      opacity: 0.7,
    },
    googleIcon: {
      marginRight: 10,
    },
    googleButtonText: {
      color: "#fff",
      fontWeight: "bold",
    },
  });

export default GoogleAuth;
