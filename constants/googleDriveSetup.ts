/**
 * Google Drive via react-native-cloud-storage (App Data folder).
 * @see https://react-native-cloud-storage.oss.kuatsu.de/docs/installation/configure-google-drive
 */
export const GOOGLE_DRIVE_SCOPES = {
  /** Required for CloudStorageScope.AppData (hidden app area in Drive, not “My Drive”). */
  // driveAppData: "https://www.googleapis.com/auth/drive.appdata",
  driveAppData: "https://www.googleapis.com/auth/drive.file",
} as const;

export const GOOGLE_DRIVE_DEVELOPER_CHECKLIST: readonly string[] = [
  "Add plugin react-native-cloud-storage in app.config.ts and rebuild the dev client / native app (not Expo Go).",
  "postinstall runs scripts/ensure-cloud-storage-codegen.mjs so RN codegen accepts the iCloud TurboModule spec (upstream 3.0.0 uses CodegenTypes.EventEmitter, which breaks Android builds).",
  "Google Cloud: enable Drive API; OAuth consent: scope " + GOOGLE_DRIVE_SCOPES.driveAppData,
  "OAuth: prefer native clients EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID / EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID (PKCE, no secret). If you use Web client + https redirect, add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_SECRET (Google requires it at token endpoint).",
];

/** Relative path under Google Drive app data folder (library creates parents as needed). */
export const GOOGLE_DRIVE_NOTES_DIRECTORY = "notas";

/** Short copy for users (Spanish). */
export const GOOGLE_DRIVE_USER_HINT_ES =
  "Las notas se guardan en el almacenamiento de la app en Google Drive (no aparecen en «Mi unidad»). Puedes verlas en Drive → Configuración → Administrar apps de Google Drive.";
