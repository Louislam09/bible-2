import { Text } from "@/components/Themed";
import React, { useMemo } from "react";
import { TTheme } from "@/types";
import { useBibleContext } from "@/context/BibleContext";
import { TextStyle } from "react-native";

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
  const { fontSize } = useBibleContext();
  const isHebrew = highlightedWord?.includes("H") ? "H" : "G";
  const isHighlighted = (word: string): boolean => {
    const cleanedHighlight = highlightedWord?.replace(",", "");
    return cleanedHighlight === `${isHebrew}${word}`;
  };

  const styles = useMemo(() => {
    return {
      color: theme?.colors.notification ?? "black",
      backgroundColor: theme?.colors.notification + "20",
      fontWeight: "bold" as const,
      lineHeight: 16,
      fontSize: fontSize - 2 || 18,
    } as TextStyle;
  }, [fontSize, theme]);

  const renderVerse = (word: string, index: number) => {
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

  return <Text style={{ fontSize }}>{words.map(renderVerse)}</Text>;
};

export default RenderTextWithClickableWords;
