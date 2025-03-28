import "./utils/eventSourcePolyfill";

export const WEB_GOOGLE_CLIENT_ID =
  process.env.EXPO_PUBLIC_WEB_GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
export const GOOGLE_REDIRECT_URI = "com.louislam09.bible";
export const POCKETBASE_URL = process.env.EXPO_PUBLIC_POCKETBASE_URL;
export const TEMP_PASSWORD = process.env.EXPO_PUBLIC_TEMP_PASSWORD;
export const APP_DEEPLINK_URI = "https://louislam09.github.io/bible-deeplink";

import PocketBase from "pocketbase";
import { pbUser } from "./types";

export const pb = new PocketBase(POCKETBASE_URL);

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
    throw error;
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
