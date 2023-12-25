import { useRoute, useTheme } from "@react-navigation/native";
import React from "react";
import { HomeParams, IBookVerse, TTheme } from "../../types";
import { Text } from "../Themed";
import { StyleSheet, View } from "react-native";

type TVerse = {
  item: IBookVerse;
  index: number;
  setSelectedWord: any;
  setOpen: any;
};

const Verse: React.FC<TVerse> = ({ item, index, setSelectedWord, setOpen }) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const route = useRoute();
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
  const handleCloseModal = () => setOpen(false);

  const onVerseClick = (word: any) => {
    // setSelectedWord(`${strongKey ?? 'H'}${word.replace(/\D/g, '')}`)
    setSelectedWord({
      ...word,
      ref: `${strongKey ?? "H"}${word.ref.replace(/\D/g, "")}`,
    });
    handleOpenModal();
  };

  const handleWordClick = React.useCallback(
    (word: string) => {
      onVerseClick(word);
    },
    [onVerseClick]
  );

  return (
    <View style={styles.verseContainer}>
      {/* <Text
        style={styles.verse}
        aria-selected
        selectable
        selectionColor="black"
        // onPress={handleOpenModal}
      >
        {`${item.verse}.${item.text
          .replace(/<S>|<\/S>/g, "")
          .replace(/[0-9]/g, "")}`}
      </Text> */}
      <Text style={styles.verse}>
        {index + 1}.
        {format(item).map((x: any, index: any) => (
          <Text
            key={index}
            style={{ ...(x.ref && { color: "pink" }) }}
            onPress={() => handleWordClick(x)}
          >
            {x.text}{" "}
          </Text>
        ))}
      </Text>
    </View>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    verseContainer: {},
    verse: {
      paddingHorizontal: 4,
      marginVertical: 5,
      fontSize: 18,
    },
  });

export default Verse;
