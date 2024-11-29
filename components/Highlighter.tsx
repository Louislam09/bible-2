import React from "react";
import { TextProps, TextStyle } from "react-native";
import { findAll } from "@/utils/findAll";
import { Text, View } from "./Themed";

interface HighlighterProps extends TextProps {
  autoEscape?: boolean;
  highlightStyle?: TextStyle;
  searchWords: string[];
  textToHighlight: string;
  sanitize?: (text: string) => string;
  onWordClick?: (word: string) => void;
}

const Highlighter: React.FC<HighlighterProps> = ({
  autoEscape,
  highlightStyle,
  searchWords,
  textToHighlight,
  sanitize,
  style,
  onWordClick,
  ...props
}) => {
  const chunks = findAll({
    textToHighlight,
    searchWords,
    sanitize,
    autoEscape,
  });

  const handleWordClick = (word: string) => {
    if (onWordClick) {
      onWordClick(word);
    }
  };

  return (
    <Text style={style} {...props}>
      {chunks.map((chunk, index) => {
        const text = textToHighlight.substr(
          chunk.start,
          chunk.end - chunk.start
        );

        return !chunk.highlight ? (
          text
        ) : (
          <Text
            key={index}
            style={chunk.highlight ? highlightStyle : undefined}
            onPress={() => handleWordClick(text)}
          >
            {text}
          </Text>
        );
      })}
    </Text>
  );
};

export default Highlighter;
