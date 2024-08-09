import * as FileSystem from "expo-file-system";
import * as SQLite from "expo-sqlite";

class DB {
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
      if (this.db) {
        await this.db.closeAsync(); // Fermer la base de données
        await FileSystem.deleteAsync(
          `${FileSystem.documentDirectory}SQLite/${this.name}`
        ); // Supprimer le fichier de la base de données
        console.log("Strong database deleted");
      }
    } catch (error) {
      console.error("Error deleting database:", error);
      throw error;
    }
  };
}
