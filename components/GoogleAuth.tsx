// components/GoogleAuth.tsx
import React, { useEffect, useState } from "react";
import { Button, Text, View, Alert } from "react-native";
import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import PocketBase from "pocketbase";
import { Stack, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";

const pb = new PocketBase("https://513e-162-241-196-246.ngrok-free.app"); // Make sure this URL points to your PocketBase instance
// const pb = new PocketBase("http://127.0.0.1:8090"); // Make sure this URL points to your PocketBase instance
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID; // Ensure this is properly set in your environment

type User = any;

WebBrowser.maybeCompleteAuthSession();
interface GoogleAuthProps {
  onSuccess: (user: User) => void; // Callback function to handle user data after login
}

const GoogleAuth: React.FC<GoogleAuthProps> = ({ onSuccess }) => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: GOOGLE_CLIENT_ID,
    scopes: ["profile", "email", "openid"],
  });
  //     redirectUrl: "http://127.0.0.1:8090/api/oauth2-redirect",

  //   useEffect(() => {
  //     const fetchUser = async () => {
  //       console.log("fetchUser");
  //       try {
  //         const user = await pb.collection("users").getList();
  //         console.log({ user });
  //       } catch (error) {
  //         console.error("error", error);
  //         console.log(error.originalError);
  //       }
  //     };
  //     fetchUser();
  //   }, []);

  useEffect(() => {
    if (response?.type === "success") {
      const { access_token } = response.params;
      console.log("response", response.url);
      handleGoogleLogin(access_token);
    }
  }, [response]);

  const handleGoogleLogin = async (access_token: string) => {
    try {
      console.log("Initiating Google login with token...");
      const authData = await pb.collection("users").authWithOAuth2({
        provider: "google",
        urlCallback: (url) => {
          console.log(url);
          //   router.navigate("Home");
        },
        // code: access_token,
        // codeVerifier: request?.codeVerifier || "",
        // redirectUrl: request?.redirectUri || "",
        // createData: {
        //   emailVisibility: true,
        // },
      });
      //   const authData = await pb.collection("users").authWithOAuth2({
      //     provider: "google",
      //     code: access_token,
      //     codeVerifier: request?.codeVerifier || "",
      //     redirectUrl: request?.redirectUri || "",
      //     createData: {
      //       emailVisibility: true,
      //     },
      //   });
      console.log("authData", authData);
      if (authData) {
        console.log("Login successful:", authData);
        setUser(authData.record);
        onSuccess(authData.record);
      }
    } catch (error) {
      console.error("Google login error:", error);
      console.log(error.originalError);
      Alert.alert("Login Error", "Failed to authenticate with Google");
    }
  };

  const pbLoginGoogle = async () => {
    try {
      await promptAsync();
    } catch (error) {
      console.error("Failed to start Google auth:", error);
      Alert.alert("Error", "No se pudo iniciar la autenticación de Google");
    }
  };

  return (
    <View>
      <Stack.Screen options={{ headerShown: true, headerTitle: "Login" }} />
      {user ? (
        <Text>Welcome, {user.email}!</Text>
      ) : (
        <Button title="Login with Google" onPress={() => pbLoginGoogle()} />
      )}
    </View>
  );
};

export default GoogleAuth;
