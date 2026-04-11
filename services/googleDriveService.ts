/**
 * Google Drive notes via react-native-cloud-storage (App Data). OAuth separate from PocketBase.
 */
import {
  GOOGLE_DRIVE_NOTES_DIRECTORY,
  GOOGLE_DRIVE_SCOPES,
} from "@/constants/googleDriveSetup";
import { StorageKeys } from "@/constants/StorageKeys";
import {
  ANDROID_GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_ID,
  IOS_GOOGLE_CLIENT_ID,
  WEB_GOOGLE_CLIENT_ID,
} from "@/globalConfig";
import { TNote } from "@/types";
import {
  driveOAuthRequiresWebClientSecret,
  getGoogleDriveOAuthClientSecret,
  getGoogleDriveOAuthRedirectUri,
  getGoogleDriveOAuthWebBrowserReturnUrl,
} from "@/utils/googleOAuthSession";
import type { DiscoveryDocument } from "expo-auth-session/build/Discovery";
import * as AuthSession from "expo-auth-session";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import {
  CloudStorage,
  CloudStorageError,
  CloudStorageErrorCode,
  CloudStorageProvider,
  CloudStorageScope,
} from "react-native-cloud-storage";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

const driveStorage = new CloudStorage(CloudStorageProvider.GoogleDrive, {
  strictFilenames: true,
});

const GOOGLE_DISCOVERY: DiscoveryDocument = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  revocationEndpoint: "https://oauth2.googleapis.com/revoke",
};

function assertNativeForDrive(): void {
  if (Platform.OS === "web") {
    throw new Error("GOOGLE_DRIVE_NATIVE_ONLY");
  }
}

function applyAccessTokenToDriveStorage(accessToken: string | null): void {
  driveStorage.setProviderOptions({
    accessToken: accessToken?.length ? accessToken : null,
    scope: CloudStorageScope.AppData,
  });
}

export function getGoogleDriveOAuthClientId(): string | undefined {
  if (Platform.OS === "android" && ANDROID_GOOGLE_CLIENT_ID) {
    return ANDROID_GOOGLE_CLIENT_ID;
  }
  if (Platform.OS === "ios" && IOS_GOOGLE_CLIENT_ID) {
    return IOS_GOOGLE_CLIENT_ID;
  }
  return WEB_GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeDriveFileName(title: string): string {
  const base = (title || "nota").replace(/[\\/:*?"<>|]/g, "-").trim() || "nota";
  return base.slice(0, 180);
}

export function buildNoteHtmlDocument(title: string, noteHtml: string): string {
  const t = escapeHtml(title || "Nota");
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${t}</title>
</head>
<body>
  <h1>${t}</h1>
  <div class="note-body">${noteHtml || ""}</div>
</body>
</html>`;
}

async function persistTokenResponse(tr: AuthSession.TokenResponse): Promise<void> {
  await SecureStore.setItemAsync(
    StorageKeys.GOOGLE_DRIVE_AUTH,
    JSON.stringify(tr.getRequestConfig()),
    { keychainAccessible: SecureStore.WHEN_UNLOCKED }
  );
}

async function loadTokenResponse(): Promise<AuthSession.TokenResponse | null> {
  const raw = await SecureStore.getItemAsync(StorageKeys.GOOGLE_DRIVE_AUTH);
  if (!raw) return null;
  try {
    const cfg = JSON.parse(raw) as ConstructorParameters<
      typeof AuthSession.TokenResponse
    >[0];
    return new AuthSession.TokenResponse(cfg);
  } catch {
    return null;
  }
}

export async function clearGoogleDriveAuth(): Promise<void> {
  applyAccessTokenToDriveStorage(null);
  await SecureStore.deleteItemAsync(StorageKeys.GOOGLE_DRIVE_AUTH);
}

export async function hasGoogleDriveLinked(): Promise<boolean> {
  const tr = await loadTokenResponse();
  return !!(tr?.refreshToken || tr?.accessToken);
}

async function getValidAccessToken(): Promise<string> {
  assertNativeForDrive();
  const clientId = getGoogleDriveOAuthClientId();
  if (!clientId) {
    throw new Error("MISSING_GOOGLE_OAUTH_CLIENT_ID");
  }
  const tr = await loadTokenResponse();
  if (!tr?.refreshToken && !tr?.accessToken) {
    throw new Error("GOOGLE_DRIVE_NOT_LINKED");
  }
  if (!AuthSession.TokenResponse.isTokenFresh(tr) && tr.refreshToken) {
    try {
      const refreshOpts: { clientId: string; clientSecret?: string } = {
        clientId,
      };
      const secret = getGoogleDriveOAuthClientSecret();
      if (driveOAuthRequiresWebClientSecret() && secret) {
        refreshOpts.clientSecret = secret;
      }
      await tr.refreshAsync(refreshOpts, GOOGLE_DISCOVERY);
      await persistTokenResponse(tr);
    } catch {
      await clearGoogleDriveAuth();
      throw new Error("GOOGLE_DRIVE_SESSION_EXPIRED");
    }
  }
  if (!tr.accessToken) {
    throw new Error("GOOGLE_DRIVE_NO_ACCESS_TOKEN");
  }
  applyAccessTokenToDriveStorage(tr.accessToken);
  return tr.accessToken;
}

export async function linkGoogleDriveAccount(): Promise<void> {
  assertNativeForDrive();
  const clientId = getGoogleDriveOAuthClientId();
  if (!clientId) {
    throw new Error("MISSING_GOOGLE_OAUTH_CLIENT_ID");
  }
  const redirectUri = getGoogleDriveOAuthRedirectUri();
  const webClientSecret = driveOAuthRequiresWebClientSecret()
    ? getGoogleDriveOAuthClientSecret()
    : undefined;
  if (driveOAuthRequiresWebClientSecret() && !webClientSecret) {
    throw new Error("GOOGLE_DRIVE_OAUTH_WEB_CLIENT_MISSING_SECRET");
  }
  const request = new AuthSession.AuthRequest({
    clientId,
    scopes: [GOOGLE_DRIVE_SCOPES.driveAppData],
    redirectUri,
    responseType: AuthSession.ResponseType.Code,
    usePKCE: true,
    extraParams: {
      access_type: "offline",
      prompt: "consent",
    },
  });

  const authUrl = await request.makeAuthUrlAsync(GOOGLE_DISCOVERY);
  const browserResult = await WebBrowser.openAuthSessionAsync(
    authUrl,
    getGoogleDriveOAuthWebBrowserReturnUrl()
  );
  if (browserResult.type === "opened") {
    throw new Error("GOOGLE_DRIVE_AUTH_UNEXPECTED");
  }
  if (browserResult.type !== "success" || !browserResult.url) {
    throw new Error("GOOGLE_DRIVE_AUTH_CANCELLED");
  }

  const result = request.parseReturnUrl(browserResult.url);
  if (result.type !== "success" || !result.params?.code) {
    throw new Error("GOOGLE_DRIVE_AUTH_CANCELLED");
  }

  const extraParams: Record<string, string> = {};
  if (request.codeVerifier) {
    extraParams.code_verifier = request.codeVerifier;
  }

  const tokenRes = await new AuthSession.AccessTokenRequest({
    clientId,
    code: result.params.code,
    redirectUri,
    clientSecret: webClientSecret,
    extraParams,
  }).performAsync(GOOGLE_DISCOVERY);
  await persistTokenResponse(tokenRes);
  applyAccessTokenToDriveStorage(tokenRes.accessToken);
}

async function ensureNotesDirectory(): Promise<void> {
  try {
    await driveStorage.mkdir(GOOGLE_DRIVE_NOTES_DIRECTORY, CloudStorageScope.AppData);
  } catch (e) {
    if (
      e instanceof CloudStorageError &&
      e.code === CloudStorageErrorCode.FILE_ALREADY_EXISTS
    ) {
      return;
    }
    throw e;
  }
}

export type UploadNotesToDriveOptions = {
  onProgress?: (current: number, total: number) => void;
};

export async function uploadNotesToGoogleDrive(
  notes: TNote[],
  options?: UploadNotesToDriveOptions
): Promise<{ uploaded: number }> {
  assertNativeForDrive();
  if (!notes.length) {
    return { uploaded: 0 };
  }

  const total = notes.length;
  const doUpload = async () => {
    await getValidAccessToken();
    await ensureNotesDirectory();
    for (let i = 0; i < notes.length; i++) {
      options?.onProgress?.(i + 1, total);
      const note = notes[i];
      const title = note.title || "Nota";
      const html = buildNoteHtmlDocument(title, note.note_text || "");
      const name = `${safeDriveFileName(title)}-${note.id}.html`;
      await driveStorage.writeFile(
        `${GOOGLE_DRIVE_NOTES_DIRECTORY}/${name}`,
        html,
        CloudStorageScope.AppData
      );
    }
  };

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      await doUpload();
      return { uploaded: notes.length };
    } catch (e) {
      if (attempt === 1) throw e;
      const msg = e instanceof Error ? e.message : String(e);
      const oauthGap =
        msg === "GOOGLE_DRIVE_NOT_LINKED" ||
        msg === "GOOGLE_DRIVE_SESSION_EXPIRED" ||
        msg === "GOOGLE_DRIVE_NO_ACCESS_TOKEN";
      const tokenRejected =
        e instanceof CloudStorageError &&
        (e.code === CloudStorageErrorCode.AUTHENTICATION_FAILED ||
          e.code === CloudStorageErrorCode.ACCESS_TOKEN_MISSING);
      if (oauthGap) {
        await linkGoogleDriveAccount();
      } else if (tokenRejected) {
        await clearGoogleDriveAuth();
        await linkGoogleDriveAccount();
      } else {
        throw e;
      }
    }
  }
  throw new Error("GOOGLE_DRIVE_UPLOAD_INVARIANT");
}
