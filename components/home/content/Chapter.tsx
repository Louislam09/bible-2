import { useRoute, useTheme } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { useEffect, useRef, useState } from "react";
import CurrentWordModal from "../../CurrentWordModal";
import Verse from "./Verse";
import { StyleSheet, View } from "react-native";
import { TChapter, HomeParams, TTheme } from "types";

const Chapter = ({ item, dimensions }: TChapter) => {
  const { verses, subtitles } = item;
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

  const scroll = () => {
    if (true) return;
    if (!chapterRef.current) return;
    chapterRef?.current?.scrollToItem({
      animated: true,
      item: verses[(verse || 0) as number],
    });
  };

  useEffect(() => {
    if (!chapterRef.current || !verses) return;
    scroll();

    return () => {};
  }, [verse, chapterRef, verses]);

  const renderItem = (props: any) => (
    <Verse
      {...props}
      setSelectedWord={setSelectedWord}
      setOpen={setOpen}
      verse={verse}
      subtitles={subtitles ?? []}
    />
  );

  return (
    <View style={styles.chapterContainer}>
      <View style={[styles.verseContent, { width: dimensions?.width ?? 400 }]}>
        <FlashList
          onLayout={() => {
            scroll();
          }}
          ref={chapterRef}
          decelerationRate={"normal"}
          estimatedItemSize={135}
          data={verses ?? []}
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
