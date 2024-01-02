import { useRoute, useTheme } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { useEffect, useRef, useState } from "react";
import { HomeParams, IBookVerse, TTheme } from "../../types";
import CurrentWordModal from "../CurrentWordModal";
import { Text } from "../Themed";
import Verse from "./Verse";
import { StyleSheet, View } from "react-native";

interface ISubtitle {
  book_number: any;
  chapter: any;
  verse: any;
  subheading: string;
}

type TChapter = {
  dimensions: any;
  item: IBookVerse[];
  subtitleData: ISubtitle[];
};

// TODO: Add audio mode feature
const Chapter = ({ item, dimensions, subtitleData }: TChapter) => {
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

  // const ChapterHeader = () => {
  //   return (
  //     <View style={styles.chapterHeader}>
  //       <Text style={styles.chapterHeaderTitle}>
  //         Capitulo {item[0]?.chapter}
  //       </Text>
  //     </View>
  //   );
  // };

  // useEffect(() => {
  // }, [verse]);

  const renderItem = (props: any) => (
    <Verse
      subtitleData={subtitleData}
      {...props}
      setSelectedWord={setSelectedWord}
      setOpen={setOpen}
      verse={verse}
    />
  );

  return (
    <View style={styles.chapterContainer}>
      <View style={[styles.verseContent, { width: dimensions?.width ?? 400 }]}>
        <FlashList
          ref={chapterRef}
          decelerationRate={"normal"}
          estimatedItemSize={item.length}
          data={item}
          renderItem={renderItem}
          keyExtractor={(item: any, index: any) => `verse-${index}`}
          // ItemSeparatorComponent={() => <View style={{ height: 1 }} />}
          // ListFooterComponent={() => <View style={{ paddingBottom: 50 }} />}
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
