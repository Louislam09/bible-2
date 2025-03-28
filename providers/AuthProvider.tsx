import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { use$ } from "@legendapp/state/react";
import { authState$ } from "@/state/authState";
import { notesState$ } from "@/state/notesState";
import { useStorage } from "@/context/LocalstoreContext";

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const router = useRouter();
  const isLoading = use$(() => authState$.isLoading.get());
  const { loadFromCloud } = useStorage();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isLoggedIn = await authState$.checkSession();
        console.log({ isLoggedIn });

        if (isLoggedIn) {
          // Load user settings from cloud
          await loadFromCloud();
          await notesState$.fetchNotes();
        } else {
          // Redirect to login if not authenticated
          console.log(" Redirect to login if not authenticated");
          // router.replace("/login");
        }
      } catch (error: any) {
        console.error("Error checking authentication:", error);
        console.error("Original Erorr:", error.originalError);
        // router.replace("/login");
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return <>{children}</>;
};

export default AuthProvider;
