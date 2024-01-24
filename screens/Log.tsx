import { Text, View } from "components/Themed";
import { useDBContext } from "context/databaseContext";
import React, { useEffect, useState } from "react";
import * as FileSystem from "expo-file-system";

const LogScreen = () => {
  const { myBibleDB, executeSql } = useDBContext();
  const [tables, setTables] = useState<any>([]);
  const dbName = (myBibleDB as any)?._db?._name;

  const fileName = `SQLite/${dbName}`;
  const filePath = `${FileSystem.documentDirectory}${fileName}`;

  useEffect(() => {
    if (!myBibleDB || !executeSql) return;
    executeSql(
      myBibleDB,
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;",
      []
    ).then((res) => setTables(res));
  }, [myBibleDB]);

  return (
    <View>
      <Text>{`Name: ${dbName}`}</Text>
      <Text>{`Path: ${filePath}`}</Text>
      <Text>Tables:</Text>
      {tables.map((x: any) => (
        <Text key={x?.name}>{x?.name}</Text>
      ))}
    </View>
  );
};

export default LogScreen;
