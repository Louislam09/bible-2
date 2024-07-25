import React from "react";
import { Text } from "react-native";
import { TTheme } from "types";

interface Props {
  text: string;
  onWordClick: (word: string) => void;
  theme?: TTheme;
  highlightedWord?: string;
  justOneWord?: boolean;
}

const RenderTextWithClickableWords: React.FC<Props> = ({
  text,
  onWordClick,
  theme,
  highlightedWord,
  justOneWord,
}) => {
  const regex = /<S>(\d+)<\/S>/g;
  const words = text.split(regex);

  const isH = highlightedWord?.includes("H") ? "H" : "G";
  const isHighlighted = (word: string): boolean => {
    const cleanedHighlight = highlightedWord?.replace(",", "");
    return cleanedHighlight === `${isH}${word}`;
  };

  const renderVerse = (word: string, index: number) => {
    const styles = { color: theme?.colors.notification ?? "red" };
    const isEven = index % 2 === 0;
    if (isEven) return word;

    const shouldRender = !justOneWord || (justOneWord && isHighlighted(word));
    if (!shouldRender) return null;

    const Componetent = (
      <Text key={index} onPress={() => onWordClick(word)} style={styles}>
        {"\u00A0"}
        {word}
      </Text>
    );

    return Componetent;
  };

  return <Text>{words.map(renderVerse)}</Text>;
};

export default RenderTextWithClickableWords;
