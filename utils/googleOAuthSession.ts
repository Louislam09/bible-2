import { APP_DEEPLINK_URI } from "@/globalConfig";
import * as Application from "expo-application";
import * as AuthSession from "expo-auth-session";
import Constants from "expo-constants";
import { Platform } from "react-native";

function expoPrimaryScheme(): string | undefined {
  const s = Constants.expoConfig?.scheme;
  if (Array.isArray(s)) return s[0];
  return s;
}

/**
 * Return URL for PocketBase `openAuthSessionAsync` (final hop to the app).
 * See components/GoogleAuth.tsx — PocketBase’s Google URL uses its own https `redirect_uri` on the server.
 */
export function getAppGoogleOAuthRedirectUri(): string {
  return AuthSession.makeRedirectUri();
}

/** True when using Android/iOS OAuth client IDs (no web client_secret on device). */
export function driveOAuthUsesNativeClient(): boolean {
  if (Platform.OS === "android") {
    return !!process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID?.trim();
  }
  if (Platform.OS === "ios") {
    return !!process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim();
  }
  return false;
}

/** Web OAuth client on native always needs client_secret for https://oauth2.googleapis.com/token. */
export function driveOAuthRequiresWebClientSecret(): boolean {
  if (Platform.OS === "web") return false;
  return !driveOAuthUsesNativeClient();
}

/**
 * Client secret for the **Web** OAuth client only. Required when using EXPO_PUBLIC_WEB_GOOGLE_CLIENT_ID
 * (or EXPO_PUBLIC_GOOGLE_CLIENT_ID) for Drive on native with an https redirect_uri.
 * Prefer EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID / EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID to avoid shipping a secret.
 */
export function getGoogleDriveOAuthClientSecret(): string | undefined {
  const s = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_SECRET?.trim();
  return s || undefined;
}

function getHostedDriveOAuthRedirectUri(): string {
  const base = APP_DEEPLINK_URI.replace(/\/+$/, "");
  const scheme = expoPrimaryScheme();
  if (scheme === "b-rv60-dev") {
    return `${base}/dev`;
  }
  return `${base}/`;
}

/**
 * Second argument to `WebBrowser.openAuthSessionAsync`.
 * - Hosted https flow: custom app scheme prefix (bible-deeplink forwards ?code= to the app).
 * - Native OAuth client: same string as redirect_uri (Google opens com.your.app:/oauthredirect/...).
 */
export function getGoogleDriveOAuthWebBrowserReturnUrl(): string {
  if (driveOAuthUsesNativeClient()) {
    return getGoogleDriveOAuthRedirectUri();
  }
  const scheme = expoPrimaryScheme() || "sb-rv60";
  return `${scheme}://`;
}

/**
 * `redirect_uri` sent **to Google** for the Drive OAuth code flow.
 * - Native Android/iOS OAuth clients: `applicationId:/oauthredirect/google-drive` (matches Expo’s Google provider pattern).
 * - Web OAuth client: https gateway on `APP_DEEPLINK_URI` or EXPO_PUBLIC_GOOGLE_DRIVE_REDIRECT_URI / auth.expo.io fallback.
 */
export function getGoogleDriveOAuthRedirectUri(): string {
  const fromEnv = process.env.EXPO_PUBLIC_GOOGLE_DRIVE_REDIRECT_URI?.trim();
  if (fromEnv) return fromEnv;

  if (Platform.OS === "web") {
    return AuthSession.makeRedirectUri();
  }

  if (driveOAuthUsesNativeClient()) {
    const appId = Application.applicationId;
    if (appId) {
      return AuthSession.makeRedirectUri({
        native: `${appId}:/oauthredirect/google-drive`,
        scheme: expoPrimaryScheme(),
      });
    }
    return AuthSession.makeRedirectUri({
      scheme: expoPrimaryScheme(),
      path: "oauth-google-drive",
    });
  }

  const fullName =
    Constants.expoConfig?.originalFullName ??
    (Constants.expoConfig?.owner && Constants.expoConfig?.slug
      ? `@${Constants.expoConfig.owner}/${Constants.expoConfig.slug}`
      : undefined);

  if (APP_DEEPLINK_URI?.length) {
    return getHostedDriveOAuthRedirectUri();
  }

  if (!fullName) {
    if (__DEV__) {
      console.warn(
        "[Google Drive OAuth] Missing expo owner/slug for https redirect; falling back to makeRedirectUri() (may fail with Web client)."
      );
    }
    return AuthSession.makeRedirectUri();
  }

  return `https://auth.expo.io/${fullName}`;
}
