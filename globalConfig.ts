import "./utils/eventSourcePolyfill";

export const WEB_GOOGLE_CLIENT_ID =
  process.env.EXPO_PUBLIC_WEB_GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
export const GOOGLE_REDIRECT_URI = "com.louislam09.bible";
export const POCKETBASE_URL = process.env.EXPO_PUBLIC_POCKETBASE_URL;
export const APP_DEEPLINK_URI = "https://louislam09.github.io/bible-deeplink";
export const IS_DEV = process.env.EXPO_PUBLIC_APP_VARIANT === "development";

import PocketBase, { AsyncAuthStore } from "pocketbase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { pbUser } from "./types";
import { StorageKeys } from "./constants/StorageKeys";

const authStore = new AsyncAuthStore({
  save: async (serialized) => {
    // console.log("Saving auth state to AsyncStorage:", serialized);
    await AsyncStorage.setItem(StorageKeys.POCKETBASE_AUTH, serialized);
  },
  initial: AsyncStorage.getItem(StorageKeys.POCKETBASE_AUTH),
  clear: async () => {
    // console.log("Clearing auth state from AsyncStorage");
    await AsyncStorage.removeItem(StorageKeys.POCKETBASE_AUTH);
  },
});

export const pb = new PocketBase(POCKETBASE_URL, authStore);

export const handleGoogleAuthError = (error: any) => {
  console.log("Google Auth Error:", error);
  console.log("originalError", error.originalError);
};

export const setUserPassword = async (
  userId: string,
  newPassword: string,
  currentPassword?: string
): Promise<boolean> => {
  try {
    if (pb.authStore.isValid) {
      await pb.collection("users").update(userId, {
        password: newPassword,
        passwordConfirm: newPassword,
        hasSetPassword: true,
      });
      return true;
    } else if (currentPassword) {
      const userData = await pb.collection("users").getOne(userId);
      await pb
        .collection("users")
        .authWithPassword(userData.email, currentPassword);

      await pb.collection("users").update(userId, {
        password: newPassword,
        passwordConfirm: newPassword,
        hasSetPassword: true,
      });
      return true;
    }

    return false;
  } catch (error) {
    console.log("Error setting user password:", error);
    return false;
  }
};

export const loginWithEmailPassword = async (
  email: string,
  password: string
): Promise<pbUser> => {
  try {
    const authData = await pb
      .collection("users")
      .authWithPassword(email, password);
    return authData.record as pbUser;
  } catch (error) {
    console.log("Error logging in with email/password:", error);
    throw "No se pudo autenticar";
  }
};

export const configureOAuth2Redirect = () => {
  console.log("OAuth2 redirect configured");
  pb.authStore.onChange(() => {
    console.log(
      "Auth state changed:",
      pb.authStore.isValid ? "logged in" : "logged out"
    );
  });
};
