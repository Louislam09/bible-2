import { Text, View } from "components/Themed";
import { useDBContext } from "context/databaseContext";
import React, { useEffect, useState } from "react";
import * as FileSystem from "expo-file-system";
import { DBName } from "enums";
import { Asset } from "expo-asset";

const LogScreen = () => {
  const { myBibleDB, executeSql } = useDBContext();
  const [tables, setTables] = useState<any>([]);

  const fileName = `SQLite/bible.db`;
  const filePath = `${FileSystem.documentDirectory}${fileName}`;
  const filePath2 = `${Asset.fromModule(require(`../assets/db/bible.db`)).uri}`;
  const filePath3 = `${
    Asset.fromModule(require(`../assets/db/ntv-bible.db`)).uri
  }`;

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
      <Text>{`Name: ${(myBibleDB as any)?._db?._name}`}</Text>
      <Text>{`Path: ${filePath}`}</Text>
      <Text>{`${DBName.BIBLE}: ${filePath2}`}</Text>
      <Text>{`${DBName.NTV}: ${filePath3}`}</Text>
      <Text>Tables:</Text>
      {tables.map((x: any) => (
        <Text key={x?.name}>{x?.name}</Text>
      ))}
    </View>
  );
};

export default LogScreen;
