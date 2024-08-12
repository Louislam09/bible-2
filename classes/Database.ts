import { SQLiteDirPath } from "constants/databaseNames";
import * as FileSystem from "expo-file-system";
import * as SQLite from "expo-sqlite";

export class DownloadedDatabase {
  db?: SQLite.SQLiteDatabase;
  public name: string;

  constructor(name: string) {
    this.name = name;
  }

  init = async () => {
    try {
      this.db = await SQLite.openDatabaseAsync(this.name);
    } catch (error) {
      console.error("Error opening database:", error);
    }
  };

  get = () => {
    return this.db;
  };

  delete = async () => {
    try {
      // if (this.db) {
      // await this.db.closeAsync(); // Fermer la base de données
      await FileSystem.deleteAsync(`${SQLiteDirPath}/${this.name}`); // Supprimer le fichier de la base de données
      return true;
      // }
    } catch (error) {
      return false;
      throw error;
    }
  };
}
