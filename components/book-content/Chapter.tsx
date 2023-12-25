import { useTheme } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { useEffect, useRef, useState } from "react";
import { IBookVerse, TTheme } from "../../types";
import CurrentWordModal from "../CurrentWordModal";
import { Text } from "../Themed";
import Verse from "./Verse";
import { StyleSheet, View } from "react-native";

type TChapter = {
  dimensions: any;
  item: IBookVerse[];
  setScrollEnabled: any;
};

const Chapter = ({ item, setScrollEnabled, dimensions }: TChapter) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const chapterRef = useRef(null);
  const [selectedWord, setSelectedWord] = useState<{
    ref?: string;
    text?: string;
  }>({});
  const [open, setOpen] = useState(false);

  function getRandomColor() {
    const randomColor = Math.floor(Math.random() * 16777215);
    const hexColor = "#" + randomColor.toString(16).padStart(6, "0");
    return hexColor;
  }

  const ChapterHeader = () => {
    return (
      <View style={styles.chapterHeader}>
        <Text style={styles.chapterHeaderTitle}>
          Capitulo {item[0].chapter}
        </Text>
      </View>
    );
  };

  useEffect(() => {
    setScrollEnabled(!open);
  }, [open]);

  const renderItem = (props: any) => (
    <Verse {...props} setSelectedWord={setSelectedWord} setOpen={setOpen} />
  );

  return (
    <View style={styles.chapterContainer}>
      <View style={[styles.verseContent, { width: dimensions?.width ?? 400 }]}>
        <FlashList
          estimatedItemSize={85}
          data={item}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{ height: 1 }} />}
          ListFooterComponent={() => <View style={{ paddingBottom: 50 }} />}
          ListHeaderComponent={ChapterHeader}
          ref={chapterRef}
        />
        {open && (
          <CurrentWordModal
            strongNumber={selectedWord}
            setOpen={() => setOpen(!open)}
          />
        )}
      </View>
    </View>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    chapterContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    chapterHeader: {
      // paddingTop: 30,
      paddingVertical: 15,
      display: "flex",
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
    },
    chapterHeaderTitle: {
      fontSize: 20,
      fontWeight: "bold",
    },
    verseContent: {
      width: 400, // my default width
      height: "100%",
      paddingRight: 10,
      paddingBottom: 10,
    },
  });

export default Chapter;
