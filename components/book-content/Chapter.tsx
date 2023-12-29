import { useRoute, useTheme } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { useEffect, useRef, useState } from "react";
import { HomeParams, IBookVerse, TTheme } from "../../types";
import CurrentWordModal from "../CurrentWordModal";
import { Text } from "../Themed";
import Verse from "./Verse";
import { StyleSheet, View } from "react-native";

type TChapter = {
  dimensions: any;
  item: IBookVerse[];
};

// TODO: Add subtitle feature
// TODO: Add audio mode feature
const Chapter = ({ item, dimensions }: TChapter) => {
  const theme = useTheme();
  const route = useRoute();
  const { verse } = route.params as HomeParams;
  const styles = getStyles(theme);
  const chapterRef = useRef<FlashList<any>>(null);
  const [selectedWord, setSelectedWord] = useState<{
    ref?: string;
    text?: string;
  }>({});
  const [open, setOpen] = useState(false);

  // TODO: Scroll to verse

  const handleScrollToIndex = () => {
    console.log("scrolll", verse);
    if (!chapterRef.current) return;
    // bookRef.current.scrollToItem({
    //   item: data[((chapter as number) - 1)],
    // })
    chapterRef.current?.scrollToIndex({
      index: (verse as number) - 1,
      animated: true,
      viewPosition: 1, // 0 for left, 0.5 for center, 1 for right
      viewOffset: 0, // optional offset for the specified viewPosition
    });
  };

  // function getRandomColor() {
  //   const randomColor = Math.floor(Math.random() * 16777215);
  //   const hexColor = "#" + randomColor.toString(16).padStart(6, "0");
  //   return hexColor;
  // }

  const ChapterHeader = () => {
    return (
      <View style={styles.chapterHeader}>
        <Text style={styles.chapterHeaderTitle}>
          Capitulo {item[0]?.chapter}
        </Text>
      </View>
    );
  };

  const renderItem = (props: any) => (
    <Verse {...props} setSelectedWord={setSelectedWord} setOpen={setOpen} />
  );

  return (
    <View style={styles.chapterContainer}>
      <View style={[styles.verseContent, { width: dimensions?.width ?? 400 }]}>
        <FlashList
          onLoad={() => {
            // setTimeout(() => {
            //   // handleScrollToIndex();
            // }, 500);
          }}
          decelerationRate={"normal"}
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
      paddingVertical: 15,
      display: "flex",
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
    },
    chapterHeaderTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.primary,
    },
    verseContent: {
      width: 400,
      height: "100%",
      paddingRight: 10,
      paddingBottom: 10,
    },
  });

export default Chapter;
