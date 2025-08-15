import { useDBContext } from "@/context/databaseContext";
import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";

const DatabaseDebug: React.FC = () => {
  const { myBibleDB: database, executeSql } = useDBContext();
  const [debugInfo, setDebugInfo] = useState<string>("");

  const testDatabase = async () => {
    try {
      setDebugInfo(`Testing database... ${database?.databaseName}`);

      if (!database) {
        setDebugInfo("Database is null");
        return;
      }

      // Test basic connection
      const result1 = await executeSql(
        "SELECT 1 as test",
        [],
        "connection_test"
      );
      setDebugInfo((prev) => prev + "\n✓ Basic connection test passed");

      // Check if dictionary table exists
      const result2 = await executeSql(
        `SELECT name FROM sqlite_master WHERE type='table';`,
        [],
        "table_check"
      );
      // console.log("result2", result2);
      // write the tables name ex: "verses", "dictionary", "notes", "favorite_verses"
      const tables = result2.map((item: any) => item.name);
      setDebugInfo((prev) => prev + `\n✓ Tables: ${tables.join(", ")}`);

      if (result2.length === 0) {
        setDebugInfo((prev) => prev + "\n✗ Verses table not found");
        return;
      }

      setDebugInfo((prev) => prev + "\n✓ Verses table exists");

      // Test count query
      const result3 = await executeSql(
        "SELECT COUNT(*) as count FROM verses where book_number = 10 AND chapter = 1 AND verse = 1",
        [],
        "count_test"
      );
      const count = (result3[0] as any)?.count || 0;
      setDebugInfo((prev) => prev + `\n✓ Verses has record ${count}`);

      // Test the actual search query
      const result4 = await executeSql(
        "SELECT * FROM verses WHERE book_number = 10 AND chapter = 1 AND verse = 1",
        [],
        "search_test"
      );
      setDebugInfo(
        (prev) => prev + `\n✓ Search test returned ${result4.length} results`
      );
    } catch (error: any) {
      setDebugInfo((prev) => prev + `\n✗ Error: ${error.message}`);
      console.error("Database debug error:", error);
    }
  };

  useEffect(() => {
    if (database) {
      testDatabase();
    }
  }, [database]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Database Debug Info</Text>
      <Text style={styles.info}>{debugInfo || "Waiting for database..."}</Text>
      <Button title="Test Again" onPress={testDatabase} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f0f0f0",
    margin: 10,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  info: {
    fontSize: 12,
    fontFamily: "monospace",
    marginBottom: 10,
    minHeight: 100,
  },
});

export default DatabaseDebug;
