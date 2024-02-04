import { Text, View } from "components/Themed";
import { useDBContext } from "context/databaseContext";
import React, { useEffect, useState } from "react";
import * as FileSystem from "expo-file-system";
import CustomBottomSheet from "components/BottomSheet";

import { TouchableOpacity } from "react-native";

interface Props {
  text: string;
}

const RenderTextWithClickableWords: React.FC<Props> = ({ text }) => {
  // Expresión regular para buscar etiquetas y sus contenidos
  const regex = /<S>(\d+)<\/S>/g;

  // Divide el texto en partes usando la expresión regular
  const parts = text.split(regex);

  // Función para renderizar palabras con números clicables
  const renderClickableWord = (word: string, index: number) => {
    // Verifica si la palabra es un número
    const isNumber = /^\d+$/.test(word);

    if (isNumber) {
      return (
        <TouchableOpacity
          key={`${word}:${index}`}
          onPress={() => console.log(word)}
        >
          <Text style={{ color: "blue", textDecorationLine: "underline" }}>
            {word}
          </Text>
        </TouchableOpacity>
      );
    } else {
      return <Text key={word}>{word}</Text>;
    }
  };

  // Renderiza el texto con palabras clicables
  return (
    <Text>
      {parts.map((part, index) => {
        if (index % 2 === 0) {
          // Si el índice es par, renderiza el texto normal
          return <Text key={index}>{part}</Text>;
        } else {
          // Si el índice es impar, renderiza la palabra cliclable
          return renderClickableWord(part, index);
        }
      })}
    </Text>
  );
};

// export default RenderTextWithClickableWords;

const LogScreen = () => {
  const { myBibleDB, executeSql } = useDBContext();
  const [tables, setTables] = useState<any>([]);
  const dbName = (myBibleDB as any)?._db?._name;

  const fileName = `SQLite/${dbName}`;
  const filePath = `${FileSystem.documentDirectory}${fileName}`;

  const text =
    "Estas<S>428</S> son las<S>8435</S> generaciones de los<S>1121</S> <S>5146</S> hijos de Noé: Sem,<S>8035</S> Cam<S>2526</S> y Jafet,<S>3315</S> a quienes nacieron<S>3205</S> hijos<S>1121</S> después<S>310</S> del diluvio.<S>3999</S> ";

  useEffect(() => {
    if (!myBibleDB || !executeSql) return;
    (async () => {
      const res = await executeSql(
        myBibleDB,
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;",
        []
      );
      setTables(res);
      // await myBibleDB?.closeAsync();
      // await myBibleDB?.deleteAsync();
    })();
  }, [myBibleDB]);

  return (
    <View>
      <RenderTextWithClickableWords text={text} />

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
