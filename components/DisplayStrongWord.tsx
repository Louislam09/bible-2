import React from "react";
import { TextProps, TextStyle, TouchableOpacity } from "react-native";
import { findAll } from "utils/findAll";
import { Text, View } from "./Themed";
import { WordTagPair } from "utils/extractVersesInfo";

interface DisplayStrongWordProps extends TextProps {
  autoEscape?: boolean;
  highlightStyle?: TextStyle;
  data: WordTagPair[];
  sanitize?: (text: string) => string;
  onWordClick?: (word: WordTagPair) => void;
}

const DisplayStrongWord: React.FC<DisplayStrongWordProps> = ({
  autoEscape,
  highlightStyle,
  data,
  sanitize,
  style,
  onWordClick,
  ...props
}) => {
  const handleWordClick = (wordItem: WordTagPair) => {
    if (onWordClick) {
      onWordClick(wordItem);
    }
  };

  return (
    <Text style={style} {...props}>
      {data?.map((wordItem, index) => {
        const hasValue = !!wordItem?.tagValue;
        const word = wordItem?.word;
        const space = !!index ? " " : "";

        return !hasValue ? (
          `${space}${word}`
        ) : (
          <Text
            key={index}
            style={highlightStyle}
            onPress={() => handleWordClick(wordItem)}
          >
            {` ${word}`}
          </Text>
        );
      })}
    </Text>
  );
};

export default DisplayStrongWord;
