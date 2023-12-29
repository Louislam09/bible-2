import { useState, useEffect } from "react";
import * as SQLite from "expo-sqlite";
import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";
import { DBName } from "../enums";
import Constants from "expo-constants";

interface Row {
  [key: string]: any;
}

interface UseDatabase {
  database: SQLite.WebSQLDatabase | null;
  executeSql: (sql: string, params?: any[]) => Promise<Row[]>;
}

const deleteDatabaseFile = async () => {
  const fileName = "SQLite/myBible.db";
  const filePath = `${FileSystem.documentDirectory}${fileName}`;
  try {
    await FileSystem.deleteAsync(filePath);
    console.log(`File ${fileName} deleted successfully.`);
  } catch (error) {
    console.error(`Error deleting file ${fileName}:`, error);
  }
};

type TUseDatabase = {
  dbName: DBName;
};

// const useDatabase = ({ dbName }: TUseDatabase): UseDatabase => {
//   const [database, setDatabase] = useState<SQLite.WebSQLDatabase | null>(null);

//   useEffect(() => {
//     async function openDatabase(): Promise<SQLite.WebSQLDatabase> {
//       try {
//         // Check if the database directory exists, and create it if it doesn't
//         if (
//           !(
//             await FileSystem.getInfoAsync(
//               FileSystem.documentDirectory + "SQLite"
//             )
//           ).exists
//         ) {
//           await FileSystem.makeDirectoryAsync(
//             FileSystem.documentDirectory + "SQLite"
//           );
//         }

//         // Download the database file to the app's file system
//         const myDbName = "myBible.db";
//         const sourcePath = Asset.fromModule(
//           require(`../assets/${myDbName}`)
//         ).uri;
//         await FileSystem.downloadAsync(
//           sourcePath,
//           // FileSystem.documentDirectory + `SQLite/myDatabaseName.db`
//           FileSystem.documentDirectory + `SQLite/${DBName.BIBLE}.db`
//         );

//         // Download the Strong-ES.dictionary.SQLite3 database file to the app's file system
//         const strongEsDbName = "Strong-ES.dictionary.SQLite3";
//         const strongEsDbSourcePath = Asset.fromModule(
//           require(`../assets/${strongEsDbName}`)
//         ).uri;
//         await FileSystem.downloadAsync(
//           strongEsDbSourcePath,
//           FileSystem.documentDirectory + `SQLite/${DBName.STRONG}.db`
//         );

//         // Download the Multi.dictionary.SQLite3 database file to the app's file system
//         const mutilDbName = "Multi.dictionary.SQLite3";
//         const mutilDbSourcePath = Asset.fromModule(
//           require(`../assets/${mutilDbName}`)
//         ).uri;
//         await FileSystem.downloadAsync(
//           mutilDbSourcePath,
//           FileSystem.documentDirectory + `SQLite/${DBName.MULTI}.db`
//         );

//         // Open the database
//         return SQLite.openDatabase(`${dbName}`);
//       } catch (error) {
//         console.error(error);
//         throw new Error("Failed to open database");
//       }
//     }
//     openDatabase()
//       .then((db) => {
//         setDatabase(db);
//       })
//       .catch((err) => console.error(err));
//   }, []);

//   const executeSql = (sql: string, params: any[] = []): Promise<Row[]> => {
//     return new Promise((resolve, reject) => {
//       if (!database) {
//         reject(new Error("Database not initialized"));
//       } else {
//         database.transaction((tx) => {
//           tx.executeSql(
//             sql,
//             params,
//             (_, { rows }) => {
//               resolve(rows._array);
//             },
//             (tx, error) => {
//               // <- fix the type of the error callback function
//               reject(error);
//               return true; // <- add a return value here if required by your version of expo-sqlite
//             }
//           );
//         });
//       }
//     });
//   };

//   return { database, executeSql };
// };

async function copyDatabase(dbName: string) {
  const dbFolder = `${FileSystem.documentDirectory}SQLite`;
  const dbPath = `${dbFolder}/${dbName}`;

  console.log("---------- db created------------");
  await FileSystem.makeDirectoryAsync(dbFolder, { intermediates: true });
  const asset = Asset.fromModule(require(`../assets/myBible.db`));
  await FileSystem.downloadAsync(asset.uri, dbPath);
}

function useDatabase({ dbName }: TUseDatabase): UseDatabase {
  const [database, setDatabase] = useState<SQLite.WebSQLDatabase | null>(null);
  const [isDbCreated, setDbCreated] = useState(false);

  const executeSql = (sql: string, params: any[] = []): Promise<Row[]> => {
    return new Promise((resolve, reject) => {
      if (!database) {
        reject(new Error("Database not initialized"));
      } else {
        database.transaction((tx) => {
          tx.executeSql(
            sql,
            params,
            (_, { rows }) => {
              resolve(rows._array);
            },
            (tx, error) => {
              // <- fix the type of the error callback function
              reject(error);
              return true; // <- add a return value here if required by your version of expo-sqlite
            }
          );
        });
      }
    });
  };

  useEffect(() => {
    const isDB = async () => {
      const dbFolder = `${FileSystem.documentDirectory}SQLite`;
      const dbPath = `${dbFolder}/${dbName}`;
      const dbFile = await FileSystem.getInfoAsync(dbPath);
      return dbFile.exists;
    };

    const openDB = async () => {
      const _isDB = await isDB();
      if (!_isDB) {
        await copyDatabase(dbName);
        setDbCreated(true);
        return "";
      }

      return SQLite.openDatabase(
        `${dbName}`,
        undefined,
        undefined,
        undefined,
        (result) => {
          if (result) {
            console.log("La base de datos se abrió correctamente.");
            // Puedes realizar operaciones adicionales aquí si la base de datos se abre correctamente.
          } else {
            console.error("Error al abrir la base de datos.");
          }
        }
      );
    };

    openDB()
      .then((db: any) => {
        if (db) setDatabase(db);
      })
      .catch(console.log);
  }, [dbName, isDbCreated]);

  return { executeSql, database };
}

export default useDatabase;
