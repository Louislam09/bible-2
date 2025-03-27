import { pb } from "@/globalConfig";
import * as AuthSession from "expo-auth-session";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import { ActivityIndicator, Button } from "react-native";

WebBrowser.maybeCompleteAuthSession();
const REDIRECT_URI = AuthSession.makeRedirectUri();

export default function OAuthGoogleLogin() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const GoogleWorkingLogin = async () => {
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
      setLoading(false);
      router.replace("/(dashboard)");
    } catch (error: any) {
      console.log("Error:", error.originalError);
    }
  };

  return (
    <>
      {loading ? (
        <ActivityIndicator size="large" color="blue" />
      ) : (
        <Button
          title="Login with Google"
          onPress={async () => {
            GoogleWorkingLogin();
          }}
        />
      )}
    </>
  );
}
