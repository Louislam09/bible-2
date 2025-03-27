import "./utils/eventSourcePolyfill";

export const WEB_GOOGLE_CLIENT_ID =
  process.env.EXPO_PUBLIC_WEB_GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
export const GOOGLE_REDIRECT_URI = "com.louislam09.bible";
export const POCKETBASE_URL = process.env.EXPO_PUBLIC_POCKETBASE_URL;
export const TEMP_PASSWORD = process.env.EXPO_PUBLIC_TEMP_PASSWORD;
export const APP_DEEPLINK_URI = "https://louislam09.github.io/bible-deeplink";

import PocketBase, { RecordModel } from "pocketbase";
import { GoogleUser } from "./types";

export interface UserRecord extends RecordModel {
  email: string;
  name?: string;
  avatar?: string;
  lastGoogleToken?: string;
  lastLogin?: string;
  verified?: boolean;
  hasSetPassword?: boolean;
  [key: string]: any;
}

export const pb = new PocketBase(POCKETBASE_URL);

export const handleGoogleAuthError = (error: any) => {
  console.log("Google Auth Error:", error);
  console.log("originalError", error.originalError);
};

export const manageUserWithGoogleAuth = async (
  googleUserInfo: GoogleUser,
  accessToken: string
): Promise<UserRecord> => {
  try {
    const existingUsers = await pb.collection("users").getList(1, 1, {
      filter: `email = "${googleUserInfo.email}"`,
    });
    console.log("existingUsers", googleUserInfo.email, existingUsers);
    let userData: UserRecord;
    if (existingUsers.items.length > 0) {
      userData = existingUsers.items[0] as UserRecord;

      await pb.collection("users").update(userData.id, {
        lastGoogleToken: accessToken,
        // lastLogin: new Date().toISOString(),
        name: googleUserInfo.name || userData.name,
      });

      pb.authStore.save(accessToken, userData);
    } else {
      // const avatar = await urlToBlob(googleUserInfo.picture)
      // console.log('avatar', avatar)

      const newUser = await pb.collection("users").create({
        email: googleUserInfo.email,
        emailVisibility: true,
        password: TEMP_PASSWORD,
        passwordConfirm: TEMP_PASSWORD,
        name: googleUserInfo.name || "",
        // avatar: avatar,
        lastGoogleToken: accessToken,
        hasSetPassword: false,
      });

      userData = newUser as UserRecord;

      pb.authStore.save(accessToken, userData);
    }

    return userData;
  } catch (error: any) {
    console.log("Error managing:", error.originalError);
    console.log("Error managing user with Google auth:", error);
    throw error;
  }
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
): Promise<UserRecord> => {
  try {
    const authData = await pb
      .collection("users")
      .authWithPassword(email, password);
    return authData.record as UserRecord;
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
