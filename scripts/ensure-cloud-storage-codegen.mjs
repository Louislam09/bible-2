/**
 * Patches react-native-cloud-storage TurboModule specs so RN codegen succeeds on EAS/Android.
 *
 * 1) NativeCloudStorageCloudKitIOS: use bare `EventEmitter<...>` (not `CodegenTypes.EventEmitter<...>`).
 * 2) NativeCloudStorageLocalFileSystem: replace `CodegenTypes.UnsafeObject` — TS codegen does not
 *    resolve it and throws UnsupportedGenericParserError / "Unrecognized generic type 'undefined'".
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const specsDir = path.join(root, "node_modules/react-native-cloud-storage/src/specs");

const cloudKitFixed = `import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';
import type { EventEmitter } from 'react-native/Libraries/Types/CodegenTypes';

export type CloudStorageFileStat = {
  size: number;
  birthtimeMs: number;
  mtimeMs: number;
  isDirectory: boolean;
  isFile: boolean;
};

export interface Spec extends TurboModule {
  fileExists(path: string, scope: string): Promise<boolean>;
  appendToFile(path: string, data: string, scope: string): Promise<void>;
  createFile(path: string, data: string, scope: string, overwrite: boolean): Promise<void>;
  createDirectory(path: string, scope: string): Promise<void>;
  listFiles(path: string, scope: string): Promise<Array<string>>;
  readFile(path: string, scope: string): Promise<string>;
  triggerSync(path: string, scope: string): Promise<void>;
  deleteFile(path: string, scope: string): Promise<void>;
  deleteDirectory(path: string, recursive: boolean, scope: string): Promise<void>;
  statFile(path: string, scope: string): Promise<CloudStorageFileStat>;
  downloadFile(remotePath: string, localPath: string, scope: string): Promise<void>;
  uploadFile(remotePath: string, localPath: string, mimeType: string, scope: string, overwrite: boolean): Promise<void>;
  isCloudAvailable(): Promise<boolean>;
  readonly onCloudAvailabilityChanged: EventEmitter<{ available: boolean }>;
}

export default TurboModuleRegistry.get<Spec>('CloudStorageCloudKit');
`;

const localFsFixed = `import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export type LocalFileSystemConstants = {
  temporaryDirectory: string;
};

/** String-key maps; native reads string values (see CloudStorageLocalFileSystemModule.kt). */
export type LocalFileSystemStringMap = {
  [key: string]: string;
};

export type LocalFileSystemDownloadOptions = {
  headers?: LocalFileSystemStringMap;
};

export type LocalFileSystemUploadOptions = {
  headers?: LocalFileSystemStringMap;
  method?: string;
  uploadType?: string;
  fieldName?: string;
  parameters?: LocalFileSystemStringMap;
};

export interface Spec extends TurboModule {
  getConstants(): LocalFileSystemConstants;
  createFile(path: string, data: string): Promise<string>;
  readFile(path: string): Promise<string>;
  downloadFile(remoteUri: string, localPath: string, options?: LocalFileSystemDownloadOptions): Promise<void>;
  uploadFile(localPath: string, remoteUri: string, options: LocalFileSystemUploadOptions): Promise<void>;
}

export default TurboModuleRegistry.get<Spec>('CloudStorageLocalFileSystem');
`;

const patches = [
  {
    rel: "NativeCloudStorageCloudKitIOS.ts",
    content: cloudKitFixed,
  },
  {
    rel: "NativeCloudStorageLocalFileSystem.ts",
    content: localFsFixed,
  },
];

for (const { rel, content } of patches) {
  const target = path.join(specsDir, rel);
  if (fs.existsSync(target)) {
    fs.writeFileSync(target, content, "utf8");
  }
}
