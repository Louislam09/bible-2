// components/GoogleAuth.tsx
import React, { useEffect, useState } from "react";
import { Button, Text, View } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import PocketBase from "pocketbase";
import { useRouter } from "expo-router";

const pb = new PocketBase("http://127.0.0.1:8090");
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;

type User = any;

interface GoogleAuthProps {
  onSuccess: (user: User) => void; // Callback function to handle user data after login
}

const GoogleAuth: React.FC<GoogleAuthProps> = ({ onSuccess }) => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    redirectUri: "sb-rv60:/oauthredirect",
  });

  useEffect(() => {
    console.log({ response });
    if (response?.type === "success") {
      const { code } = response.params;
      //   const authProvider = {
      //     name: "google",
      //     code: code,
      //     codeVerifier: "",
      //     redirectUrl: "http://127.0.0.1:8090/api/oauth2-redirect",
      //     createData: { access_type: "offline" },
      //   };
      // Authenticate with PocketBase using the Google authorization code
      //   pb.collection("users")
      //   .authWithOAuth2Code(
      //     "google",
      //     code,
      //     "http://127.0.0.1:8090/api/oauth2-redirect",
      //     "YOUR_CLIENT_SECRET"
      //   )
      //     .then((authData) => {
      //       setUser(authData.user);
      //       onSuccess(authData.user); // Pass the user data to the parent component
      //       router.push("/home"); // Navigate to home after successful login
      //     })
      //     .catch((error) => {
      //       console.error("OAuth2 error:", error);
      //     });
    }
  }, [response]);

  return (
    <View>
      {user ? (
        <Text>Welcome, {user.email}!</Text>
      ) : (
        <Button
          disabled={!request}
          title="Login with Google"
          onPress={() => promptAsync()}
        />
      )}
    </View>
  );
};

export default GoogleAuth;
