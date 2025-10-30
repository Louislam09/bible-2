import { DBName } from '@/enums';
import { DATABASE_TYPE, DEFAULT_DATABASE } from '@/types';
import * as FileSystem from 'expo-file-system';
export const SQLiteDirPath = `${FileSystem.documentDirectory}SQLite`;
export const baseDownloadUrl = 'https://www.ph4.org';
export const dbFileExt = '-bible.db';
export const bibleReadyMsg = '¡Todo listo para usar!';
// export const defaultDatabases = ['bible', 'ntv-bible'];
export const defaultDatabases = ['bible', 'ntv-bible', 'interlinear-bible', 'greek-bible'];
// https://www.ph4.org/_dl.php?back=bbl&a=RV%2760_plus_&b=mybible&c

const databaseExtensions = {
  [DATABASE_TYPE.BIBLE]: '-bible.db',
  [DATABASE_TYPE.DICTIONARY]: '-dict.db',
  [DATABASE_TYPE.COMMENTARY]: '-com.db',
};

export const isPrimaryBibleDatabase = (dbID: string) => {
  return dbID === DEFAULT_DATABASE.BIBLE;
};

export const isDefaultDatabase = (dbID: string) => {
  return defaultDatabases.includes(dbID);
};

export const getDatabaseExt = (dbType: DATABASE_TYPE) => {
  return databaseExtensions[dbType];
};

export const getDatabaseType = (fileName: string) => {
  if (fileName.includes('.dictionary')) return DATABASE_TYPE.DICTIONARY;
  if (fileName.includes('.commentaries')) return DATABASE_TYPE.COMMENTARY;
  return DATABASE_TYPE.BIBLE;
};

export const getDatabaseQueryKey = (name: string) => {
  const isDefault = defaultDatabases.includes(name);
  return isDefault ? name : 'OTHERS';
};

export const getIfFileNeedsDownload = async (name: string) => {
  const path = `${FileSystem.documentDirectory}${name}`;
  const { exists } = await FileSystem.getInfoAsync(path);
  return !exists;
};
export const getIfDatabaseNeedsDownload = async (name: string) => {
  const path = `${SQLiteDirPath}/${name}`;
  await initSQLiteDir();
  const { exists } = await FileSystem.getInfoAsync(path);
  return !exists;
};

export const initDir = async (dirName: string) => {
  const path = `${FileSystem.documentDirectory}${dirName}`;
  const dir = await FileSystem.getInfoAsync(path);

  if (!dir.exists) {
    await FileSystem.makeDirectoryAsync(path);
  } else if (!dir.isDirectory) {
    throw new Error('SQLite dir is not a directory');
  }
};

export const initSQLiteDir = async () => {
  const sqliteDir = await FileSystem.getInfoAsync(SQLiteDirPath);
  if (!sqliteDir.exists) {
    await FileSystem.makeDirectoryAsync(SQLiteDirPath);
  } else if (!sqliteDir.isDirectory) {
    throw new Error('SQLite dir is not a directory');
  }
};

export const databaseNames = [
  {
    id: 'bible',
    name: 'Reina Valera 1960',
    description: 'La Santa Biblia Reina-Valera con números Strong, 1960',
    size: 44007424,
    path: `${SQLiteDirPath}/${DBName.BIBLE}`,
    shortName: 'RVR60',
  },
  {
    id: 'ntv-bible',
    name: 'Nueva Traducción Viviente',
    description: 'Nueva Traducción Viviente, 2009',
    size: 15571968,
    path: `${SQLiteDirPath}/${DBName.NTV}`,
    shortName: 'NTV',
  },
  {
    id: 'interlinear-bible',
    name: 'HSB+ (Interlineal Hebreo)',
    description:
      'La Biblia Bereana es una Biblia de estudio de tres niveles que lo conecta desde una traducción fluida y precisa hasta la raíz de los significados griegos y hebreos.',
    size: 23000000,
    path: `${SQLiteDirPath}/${DBName.INT}`,
    shortName: 'INT',
  },
  {
    id: 'greek-bible',
    name: 'Tischendorf (Interlineal Griego)',
    description: 'Tischendorf interlineal griego-español',
    size: 7000000,
    path: `${SQLiteDirPath}/${DBName.GREEK}`,
    shortName: 'iTisch+',
  },
  {
    id: 'DIC',
    name: 'Diccionario Clave - Diccionario de uso del espanol actual ',
    description:
      'Diccionario Clave - Diccionario de uso del espanol actual (con sinonimos y antonimos)',
    size: 15571968,
    path: `${SQLiteDirPath}/${DBName.DIC}`,
    shortName: 'DIC',
  },
  {
    id: 'Hitchcock',
    name: 'Diccionario de Nombres Bíblicos Hitchcock',
    description: 'Diccionario de Nombres Bíblicos Hitchcock',
    size: 15571968,
    path: `${SQLiteDirPath}/${DBName.Hitchcock}`,
    shortName: 'Hitchcock',
  },
  {
    id: 'Nelson',
    name: 'Diccionario Nelson',
    description: 'Diccionario Nelson',
    size: 15571968,
    path: `${SQLiteDirPath}/${DBName.Nelson}`,
    shortName: 'Nelson',
  },
];
