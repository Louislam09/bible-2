import { useRoute, useTheme } from "@react-navigation/native";
import React, { useState } from "react";
import { HomeParams, TTheme, TVerse } from "../../types";
import { Text } from "../Themed";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useBibleContext } from "../../context/BibleContext";
import { getVerseTextRaw } from "../../utils/getVerseTextRaw";

const Verse: React.FC<TVerse | any> = ({
  item,
  index,
  setSelectedWord,
  setOpen,
  subtitleData,
}) => {
  const { highlightVerse } = useBibleContext();
  const theme = useTheme() as TTheme;
  const styles = getStyles(theme);
  const route = useRoute();
  const [isVerseHighlisted, setHighlightVerse] = useState(false);
  const { strongKey } = route.params as HomeParams;
  const format = (item: any) => {
    const textWithNumber = item.text.replace(/<S>|<\/S>/g, "");
    return textWithNumber.split(" ").map((text: string) => {
      const strong = text.replace(/[a-zA-Z]/g, "");
      const verseText = text.replace(/[0-9]/g, "");
      return {
        text: verseText,
        ref: strong,
      };
    });
  };

  const handleOpenModal = () => setOpen(true);

  const onVerseClick = (word: any) => {
    // setSelectedWord(`${strongKey ?? 'H'}${word.replace(/\D/g, '')}`)
    setSelectedWord({
      ...word,
      ref: `${strongKey ?? "H"}${word.ref.replace(/\D/g, "")}`,
    });
    handleOpenModal();
  };

  const TestVerse = () => {
    return (
      <Text style={styles.verse}>
        {index + 1}.
        {format(item).map((x: any, index: any) => (
          <Text
            key={index}
            style={{ ...(x.ref && { color: "pink" }) }}
            // onPress={() => handleWordClick(x)}
          >
            {x.text}{" "}
          </Text>
        ))}
      </Text>
    );
  };

  const highlightVerseFunc = () => {
    if (isVerseHighlisted) {
      setHighlightVerse(false);
      return;
    }
    highlightVerse(item);
    setHighlightVerse(true);
  };

  const findSubTitle = (verse: any) => {
    const sub = subtitleData.find((x: any) => x.verse === verse);

    return sub ? (
      <Text
        style={[
          styles.verse,
          {
            fontSize: 22,
            textAlign: "center",
            fontWeight: "bold",
            paddingVertical: 10,
            color: theme.colors.notification,
          },
        ]}
      >
        {sub.subheading}
      </Text>
    ) : null;
  };

  return (
    <TouchableOpacity
      onLongPress={highlightVerseFunc}
      activeOpacity={0.9}
      style={styles.verseContainer}
    >
      {findSubTitle(item.verse)}

      <Text
        style={[
          styles.verse,
          index === 0 && { flexDirection: "row", alignItems: "stretch" },
          isVerseHighlisted && styles.highlightCopy,
        ]}
        aria-selected
        selectable
        selectionColor={theme.colors.primary}
      >
        <Text style={[styles.verseNumber]}>&nbsp;{item.verse} &nbsp;</Text>
        <Text style={styles.verseBody}>{getVerseTextRaw(item.text)}</Text>
      </Text>
    </TouchableOpacity>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    verseContainer: {},
    verseBody: {
      color: colors.text,
    },
    verseNumber: {
      color: colors.primary,
    },
    verse: {
      paddingHorizontal: 15,
      paddingLeft: 20,
      marginVertical: 5,
      fontSize: 24,
    },
    highlightCopy: {
      textDecorationColor: colors.primary,
      textDecorationStyle: "solid",
      textDecorationLine: "underline",
    },
  });

export default Verse;
