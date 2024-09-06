import React from "react";
import { TextProps, TextStyle, TouchableOpacity } from "react-native";
import { findAll } from "utils/findAll";
import { Text, View } from "./Themed";
import { WordTagPair } from "utils/extractVersesInfo";

interface DisplayStrongWordProps extends TextProps {
  autoEscape?: boolean;
  highlightStyle?: TextStyle;
  nonHightlistedStyle?: TextStyle;
  data: WordTagPair[];
  sanitize?: (text: string) => string;
  onWordClick?: (word: WordTagPair) => void;
  onNonHightlistedWordClick?: (word: WordTagPair) => void;
}

const DisplayStrongWord: React.FC<DisplayStrongWordProps> = ({
  autoEscape,
  highlightStyle,
  nonHightlistedStyle,
  data,
  sanitize,
  style,
  onWordClick,
  onNonHightlistedWordClick,
  ...props
}) => {
  const handleWordClick = (wordItem: WordTagPair) => {
    if (onWordClick) {
      onWordClick(wordItem);
    }
  };

  const handleNonHightedWordClick = (wordItem: WordTagPair) => {
    if (onNonHightlistedWordClick) {
      onNonHightlistedWordClick(wordItem);
    }
  };

  return (
    <Text style={style} {...props}>
      {data?.map((wordItem, index) => {
        const hasValue = !!wordItem?.tagValue;
        const word = wordItem?.word;
        const space = !!index ? " " : "";

        return !hasValue ? (
          <Text
            onPress={() => handleNonHightedWordClick(wordItem)}
            key={index}
            style={nonHightlistedStyle}
          >
            {`${space}${word}`}
          </Text>
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
