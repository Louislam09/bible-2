import { DBName } from "enums";
import * as FileSystem from "expo-file-system";
export const SQLiteDirPath = `${FileSystem.documentDirectory}SQLite`;
export const baseDownloadUrl = "https://www.ph4.org";
// https://www.ph4.org/_dl.php?back=bbl&a=RV%2760_plus_&b=mybible&c

export const getIfDatabaseNeedsDownload = async (name: string) => {
  const path = `${SQLiteDirPath}/${name}`;
  await initSQLiteDir();
  const { exists } = await FileSystem.getInfoAsync(path);
  return !exists;
};

export const initSQLiteDir = async () => {
  const sqliteDir = await FileSystem.getInfoAsync(SQLiteDirPath);

  if (!sqliteDir.exists) {
    await FileSystem.makeDirectoryAsync(SQLiteDirPath);
  } else if (!sqliteDir.isDirectory) {
    throw new Error("SQLite dir is not a directory");
  }
};

export const databaseNames = [
  {
    id: "BIBLE",
    name: "Reina Valera 1960",
    description: "La Santa Biblia Reina-Valera con números Strong, 1960",
    fileSize: 44007424,
    path: `${SQLiteDirPath}/${DBName.BIBLE}`,
  },
  {
    id: "NTV",
    name: "Nueva Traducción Viviente",
    description: "Nueva Traducción Viviente, 2009",
    fileSize: 15571968,
    path: `${SQLiteDirPath}/${DBName.NTV}`,
  },
  {
    id: "INT",
    name: "Berean Interlinear Bible",
    description:
      "La Biblia Bereana es una Biblia de estudio de tres niveles que lo conecta desde una traducción fluida y precisa hasta la raíz de los significados griegos y hebreos.",
    fileSize: 15571968,
    path: `${SQLiteDirPath}/${DBName.INT}`,
  },
  {
    id: "DIC",
    name: "Diccionario Clave - Diccionario de uso del espanol actual ",
    description:
      "Diccionario Clave - Diccionario de uso del espanol actual (con sinonimos y antonimos)",
    fileSize: 15571968,
    path: `${SQLiteDirPath}/${DBName.DIC}`,
  },
  {
    id: "Hitchcock",
    name: "Diccionario de Nombres Bíblicos Hitchcock",
    description: "Diccionario de Nombres Bíblicos Hitchcock",
    fileSize: 15571968,
    path: `${SQLiteDirPath}/${DBName.Hitchcock}`,
  },
  {
    id: "Nelson",
    name: "Diccionario Nelson",
    description: "Diccionario Nelson",
    fileSize: 15571968,
    path: `${SQLiteDirPath}/${DBName.Nelson}`,
  },
];
