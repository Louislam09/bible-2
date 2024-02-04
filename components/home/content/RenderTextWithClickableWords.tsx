import React from "react";
import { Pressable, Text, TouchableOpacity } from "react-native";
import { TTheme } from "types";

interface Props {
  text: string;
  onWordClick: (word: string) => void;
  theme?: TTheme;
}

const RenderTextWithClickableWords: React.FC<Props> = ({
  text,
  onWordClick,
  theme,
}) => {
  // Expresión regular para buscar etiquetas y sus contenidos
  const regex = /<S>(\d+)<\/S>/g;

  // Divide el texto en partes usando la expresión regular
  const parts = text.split(regex);

  // Función para renderizar palabras con números clicables
  const renderClickableWord = (word: string, index: number) => {
    // Verifica si la palabra es un número
    return (
      <TouchableOpacity key={index} onPress={() => onWordClick(word)}>
        <Text
          style={{
            color: theme?.colors.notification ?? "red",
            textDecorationLine: "underline",
          }}
        >
          {word}👈
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Text style={{ zIndex: 999 }}>
      {parts.map((part, index) => {
        return index % 2 === 0 ? (
          part
        ) : (
          <Text
            key={index}
            onPress={() => onWordClick(part)}
            style={{
              color: theme?.colors.notification ?? "red",
              textDecorationLine: "underline",
            }}
          >
            &nbsp;
            {part}
            &nbsp;
          </Text>
        );
      })}
    </Text>
  );
};

export default RenderTextWithClickableWords;
