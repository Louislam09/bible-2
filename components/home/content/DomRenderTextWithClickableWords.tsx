import { useBibleContext } from "@/context/BibleContext";
import { TTheme } from "@/types";
import React, { useMemo } from "react";
import { TextStyle } from "react-native";

interface Props {
  text: string;
  onWordClick: (word: string) => void;
  theme?: TTheme;
  highlightedWord?: string;
  justOneWord?: boolean;
  verseNumber?: string;
}

const DomRenderTextWithClickableWords: React.FC<Props> = ({
  text,
  onWordClick,
  highlightedWord,
  justOneWord,
  verseNumber,
}) => {
  const regex = /<S>(\d+)<\/S>/g;
  const words = text.split(regex);
  const { fontSize } = useBibleContext();
  const isHebrew = highlightedWord?.includes("H") ? "H" : "G";
  const isHighlighted = (word: string): boolean => {
    const cleanedHighlight = highlightedWord?.replace(",", "");
    return cleanedHighlight === `${isHebrew}${word}`;
  };

  const renderVerse = (word: string, index: number) => {
    const isEven = index % 2 === 0;
    if (isEven) return word;

    const shouldRender = !justOneWord || (justOneWord && isHighlighted(word));
    if (!shouldRender) return null;

    const Componetent = (
      <p key={index} onClick={() => onWordClick(word)} className="mx-1 text-emerald-500">
        {"\u00A0"}
        {word}
      </p>
    );

    return Componetent;
  };

  return (
    <p className="flex flex-row flex-wrap" style={{ fontSize }}>
      {verseNumber || ""}
      {words.map(renderVerse)}
    </p>
  );
};

export default DomRenderTextWithClickableWords;
